import type { LeadRepository, LogRepository, SessionRepository } from "@/database/repositories";
import { ApolloUrlParser } from "@/parsers/urlParser";
import { ApolloApiClient } from "@/services/apolloApiClient";
import { HashService } from "@/services/hashService";
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

  async run(url: string, apiKey: string, emit: Emit): Promise<ExtractionSession> {
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
    const perPage = 100;

    try {
      for (let pageNumber = parsed.page; !this.cancelled; pageNumber += 1) {
        stats.currentPage = pageNumber;
        const search = await this.withRetries(() => client.search(parsed.filters, pageNumber, perPage), session.id, stats, emit);
        const records = await Promise.all(search.people.map(async (person) => {
          const enriched = await this.enrichIfPossible(client, person, session.id, stats, emit);
          return this.toLead(url, pageNumber, this.mergePerson(person, enriched));
        }));
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

        if (search.people.length < perPage) break;
      }

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
      emit({ sessionId: session.id, stats, log: this.log(session.id, "error", "API extraction failed", { error: String(error) }) });
      throw error;
    }
  }

  private async enrichIfPossible(client: ApolloApiClient, person: Record<string, JsonValue>, sessionId: string, stats: ExtractionStats, emit: Emit): Promise<Record<string, JsonValue> | undefined> {
    const id = person.id;
    if (typeof id !== "string" || !id) return undefined;
    try {
      return await client.enrich(id);
    } catch (error) {
      stats.errors += 1;
      emit({ sessionId, stats, log: this.log(sessionId, "warn", "Skipping enrichment for one lead", { error: String(error) }) });
      return undefined;
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
        emit({ sessionId, stats, log: this.log(sessionId, "warn", "Retrying Apollo API request", { attempt: attempt + 1, error: String(error) }) });
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
    throw lastError;
  }

  private mergePerson(person: Record<string, JsonValue>, enriched?: Record<string, JsonValue>): Record<string, JsonValue> {
    return { ...person, ...(enriched ?? {}), search_result: person };
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
