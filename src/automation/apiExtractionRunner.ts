import type { LeadRepository, LogRepository, SessionRepository } from "@/database/repositories";
import { ApolloUrlParser } from "@/parsers/urlParser";
import { ApolloApiClient } from "@/services/apolloApiClient";
import { HashService } from "@/services/hashService";
import { safeErrorMessage } from "@/services/safeError";
import type { ExtractionEvent, ExtractionSession, ExtractionStats, JsonValue, LeadRecord, LogEntry } from "@/types";

type Emit = (event: ExtractionEvent) => void;

export class ApiExtractionRunner {
  private cancelled = false;

  constructor(
    private readonly sessions: SessionRepository,
    private readonly leads: LeadRepository,
    private readonly logs: LogRepository,
    private readonly parser = new ApolloUrlParser(),
    private readonly hash = new HashService()
  ) {}

  cancel(): void {
    this.cancelled = true;
  }

  async run(url: string, apiKey: string, emit: Emit, perPage = 100, autoEnrich = true, revealPersonalEmails = false, enrichmentConcurrency = 4): Promise<ExtractionSession> {
    this.cancelled = false;
    const parsed = this.parser.parse(url);
    const client = new ApolloApiClient(apiKey);
    const started = Date.now();
    const now = new Date().toISOString();
    const session: ExtractionSession = {
      id: this.hash.id("session"),
      url,
      filters: parsed.filters,
      status: "running",
      createdAt: now,
      updatedAt: now,
      checkpointPage: parsed.page,
      leadCount: 0
    };
    this.sessions.create(session);

    const stats: ExtractionStats = {
      currentPage: parsed.page,
      leadsExtracted: 0,
      duplicates: 0,
      errors: 0,
      retries: 0,
      rowsPerSecond: 0,
      elapsedMs: 0,
      status: "running"
    };
    const seen = new Set<string>();
    const pageSize = Math.min(100, Math.max(1, perPage));
    const enrichmentJobs: Array<Promise<void>> = [];
    const maxConcurrentEnrichment = Math.min(8, Math.max(1, enrichmentConcurrency));

    try {
      for (let pageNumber = parsed.page; !this.cancelled; pageNumber += 1) {
        stats.currentPage = pageNumber;
        const search = await this.withRetries(() => client.search(url, parsed.filters, pageNumber, pageSize), session.id, stats, emit);
        emit({ sessionId: session.id, stats, debug: search.debug });
        const records = search.people.map((person) => this.toLead(url, pageNumber, this.withPipelineStatus(person, autoEnrich ? "Queued for Enrichment" : "Completed")));
        const uniqueRecords = records.filter((record) => {
          if (seen.has(record.hash)) return false;
          seen.add(record.hash);
          return true;
        });
        const result = this.leads.insertMany(session.id, uniqueRecords);
        stats.leadsExtracted += result.inserted;
        stats.duplicates += result.duplicates;
        stats.elapsedMs = Date.now() - started;
        stats.rowsPerSecond = stats.elapsedMs > 0 ? stats.leadsExtracted / (stats.elapsedMs / 1000) : 0;
        stats.currentCompany = this.detectCurrentCompany(uniqueRecords);
        session.checkpointPage = pageNumber;
        session.leadCount = stats.leadsExtracted;
        session.updatedAt = new Date().toISOString();
        this.sessions.update(session);
        emit({ sessionId: session.id, stats, leads: uniqueRecords });

        if (autoEnrich && uniqueRecords.length > 0) {
          for (const batch of this.chunks(uniqueRecords.filter((record) => typeof record.fields.id === "string"), 10)) {
            const job = this.enrichBatch(client, url, session.id, batch, revealPersonalEmails, stats, emit);
            const tracked = job.finally(() => {
              const index = enrichmentJobs.indexOf(tracked);
              if (index >= 0) enrichmentJobs.splice(index, 1);
            });
            enrichmentJobs.push(tracked);
            if (enrichmentJobs.length >= maxConcurrentEnrichment) {
              await Promise.race(enrichmentJobs).catch(() => undefined);
            }
          }
        }

        if (search.people.length < pageSize) break;
      }

      await Promise.allSettled(enrichmentJobs);

      session.status = this.cancelled ? "paused" : "completed";
      stats.status = session.status;
      session.updatedAt = new Date().toISOString();
      this.sessions.update(session);
      emit({ sessionId: session.id, stats, log: this.log(session.id, "info", `API extraction ${session.status}`) });
      return session;
    } catch (error) {
      stats.status = "failed";
      stats.errors += 1;
      session.status = "failed";
      session.updatedAt = new Date().toISOString();
      this.sessions.update(session);
      emit({ sessionId: session.id, stats, log: this.log(session.id, "error", "API extraction failed", { error: safeErrorMessage(error) }) });
      throw error;
    }
  }

  private async enrichBatch(client: ApolloApiClient, url: string, sessionId: string, records: LeadRecord[], revealPersonalEmails: boolean, stats: ExtractionStats, emit: Emit): Promise<void> {
    const ids = records.map((record) => String(record.fields.id)).filter(Boolean);
    const mark = (status: string): void => {
      for (const record of records) {
        const fields = { ...record.fields, "Pipeline Status": status };
        const updated = { ...record, fields, visibleText: JSON.stringify(fields) };
        this.leads.updateFields(sessionId, record.id, fields, updated.visibleText);
        emit({ sessionId, stats, leads: [updated] });
      }
    };
    mark("Revealing Email");
    try {
      const result = await client.bulkEnrich(url, ids, revealPersonalEmails);
      emit({ sessionId, stats, debug: result.debug });
      const matchesById = new Map(result.matches.map((match) => [String(match.id), match]));
      for (const record of records) {
        const match = matchesById.get(String(record.fields.id));
        const fields = match ? this.mergePerson(record.fields, match) : { ...record.fields };
        const email = typeof fields.email === "string" ? fields.email : undefined;
        fields.Email = email ?? fields.Email ?? "";
        fields["Email Status"] = fields.email_status ?? fields["Email Status"] ?? (email ? "available" : "unavailable");
        fields["Pipeline Status"] = email && !email.includes("***") ? "Email Revealed" : "No email available";
        if (email && !email.includes("***")) stats.emailsRevealed = (stats.emailsRevealed ?? 0) + 1;
        else stats.emailsNotFound = (stats.emailsNotFound ?? 0) + 1;
        stats.peopleEnriched = (stats.peopleEnriched ?? 0) + 1;
        const updated = { ...record, fields, visibleText: JSON.stringify(fields) };
        this.leads.updateFields(sessionId, record.id, fields, updated.visibleText);
        emit({ sessionId, stats, leads: [updated] });
      }
    } catch (error) {
      stats.enrichmentsFailed = (stats.enrichmentsFailed ?? 0) + records.length;
      stats.errors += 1;
      for (const record of records) {
        const fields = { ...record.fields, "Pipeline Status": "Failed" };
        const updated = { ...record, fields, visibleText: JSON.stringify(fields) };
        this.leads.updateFields(sessionId, record.id, fields, updated.visibleText);
        emit({ sessionId, stats, leads: [updated], log: this.log(sessionId, "warn", "Email enrichment failed for a batch", { error: safeErrorMessage(error) }) });
      }
    }
  }

  private async withRetries<T>(fn: () => Promise<T>, sessionId: string, stats: ExtractionStats, emit: Emit): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        stats.retries += 1;
        emit({ sessionId, stats, log: this.log(sessionId, "warn", "Retrying Apollo API request", { attempt: attempt + 1, error: safeErrorMessage(error) }) });
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
    throw lastError;
  }

  private mergePerson(person: Record<string, JsonValue>, enriched?: Record<string, JsonValue>): Record<string, JsonValue> {
    return { ...person, ...(enriched ?? {}), search_result: person };
  }

  private withPipelineStatus(person: Record<string, JsonValue>, status: string): Record<string, JsonValue> {
    return { ...person, "Pipeline Status": status, Email: typeof person.email === "string" ? person.email : "" };
  }

  private chunks<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
    return result;
  }

  private toLead(sourceUrl: string, page: number, fields: Record<string, JsonValue>): LeadRecord {
    const hash = this.hash.leadHash(fields);
    return {
      id: this.hash.id("lead"),
      hash,
      sourceUrl,
      page,
      extractedAt: new Date().toISOString(),
      fields,
      visibleText: JSON.stringify(fields)
    };
  }

  private detectCurrentCompany(records: LeadRecord[]): string | undefined {
    const record = records[records.length - 1];
    const organization = record?.fields.organization;
    if (organization && typeof organization === "object" && !Array.isArray(organization) && "name" in organization) {
      return String(organization.name);
    }
    return undefined;
  }

  private log(sessionId: string, level: LogEntry["level"], message: string, context?: LogEntry["context"]): LogEntry {
    const entry = { level, message, timestamp: new Date().toISOString(), context };
    this.logs.add(sessionId, entry);
    return entry;
  }
}
