import type { BrowserService } from "@/browser/browserService";
import type { LeadRepository, LogRepository, SessionRepository } from "@/database/repositories";
import { PAGE_HELPERS_SCRIPT } from "@/automation/pageScripts";
import { ApolloUrlParser } from "@/parsers/urlParser";
import { HashService } from "@/services/hashService";
import type { ExtractionEvent, ExtractionSession, ExtractionStats, LeadRecord, LogEntry } from "@/types";
import type { Page } from "playwright";

type Emit = (event: ExtractionEvent) => void;

export class ExtractionRunner {
  private cancelled = false;

  constructor(
    private readonly browser: BrowserService,
    private readonly sessions: SessionRepository,
    private readonly leads: LeadRepository,
    private readonly logs: LogRepository,
    private readonly parser = new ApolloUrlParser(),
    private readonly hash = new HashService()
  ) {}

  cancel(): void {
    this.cancelled = true;
  }

  async run(url: string, emit: Emit): Promise<ExtractionSession> {
    this.cancelled = false;
    const parsed = this.parser.parse(url);
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
    const started = Date.now();
    const seen = new Set<string>();

    try {
      const page = await this.browser.getPage();
      await this.gotoWithRecovery(page, url, session.id, stats, emit);
      await this.waitUntilLoggedIn(page, session.id, stats, emit);

      while (!this.cancelled) {
        await page.waitForLoadState("domcontentloaded", { timeout: 15000 }).catch(() => undefined);
        await page.waitForTimeout(250);
        const extraction = await page.evaluate(() => {
          return { mapping: (window as any).__apolloExtractDom(), pagination: (window as any).__apolloDetectPagination() };
        });

        stats.currentPage = extraction.pagination.currentPage;
        stats.lastPage = extraction.pagination.lastPage;
        const records = extraction.mapping.rows.map((row: any): LeadRecord => {
          const hash = this.hash.leadHash(row.fields);
          return {
            id: this.hash.id("lead"),
            hash,
            sourceUrl: page.url(),
            page: stats.currentPage,
            extractedAt: new Date().toISOString(),
            fields: row.fields,
            visibleText: row.visibleText
          };
        }).filter((lead: LeadRecord) => {
          if (seen.has(lead.hash)) return false;
          seen.add(lead.hash);
          return true;
        });

        const result = this.leads.insertMany(session.id, records);
        stats.leadsExtracted += result.inserted;
        stats.duplicates += result.duplicates;
        stats.elapsedMs = Date.now() - started;
        stats.rowsPerSecond = stats.elapsedMs > 0 ? stats.leadsExtracted / (stats.elapsedMs / 1000) : 0;
        stats.estimatedRemainingMs = stats.lastPage && stats.rowsPerSecond > 0
          ? (((stats.lastPage - stats.currentPage) * Math.max(records.length, 1)) / stats.rowsPerSecond) * 1000
          : undefined;
        stats.currentCompany = this.detectCurrentCompany(records);
        session.checkpointPage = stats.currentPage;
        session.leadCount = stats.leadsExtracted;
        session.updatedAt = new Date().toISOString();
        this.sessions.update(session);
        emit({ sessionId: session.id, stats, leads: records });

        if (!extraction.pagination.canGoNext) break;
        await this.goNext(page, extraction.pagination.nextSelector, stats);
      }

      session.status = this.cancelled ? "paused" : "completed";
      stats.status = session.status;
      session.updatedAt = new Date().toISOString();
      this.sessions.update(session);
      emit({ sessionId: session.id, stats, log: this.log(session.id, "info", `Extraction ${session.status}`) });
      return session;
    } catch (error) {
      stats.status = "failed";
      stats.errors += 1;
      session.status = "failed";
      session.updatedAt = new Date().toISOString();
      this.sessions.update(session);
      emit({ sessionId: session.id, stats, log: this.log(session.id, "error", "Extraction failed", { error: String(error) }) });
      throw error;
    }
  }

  private async gotoWithRecovery(page: Page, url: string, sessionId: string, stats: ExtractionStats, emit: Emit): Promise<void> {
    await this.installPageHelpers(page);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        return;
      } catch (error) {
        stats.retries += 1;
        emit({ sessionId, stats, log: this.log(sessionId, "warn", "Navigation retry", { attempt: attempt + 1, error: String(error) }) });
        await page.waitForTimeout(500 * (attempt + 1));
      }
    }
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
  }

  private async installPageHelpers(page: Page): Promise<void> {
    await page.addInitScript({ content: PAGE_HELPERS_SCRIPT });
  }

  private async waitUntilLoggedIn(page: Page, sessionId: string, stats: ExtractionStats, emit: Emit): Promise<void> {
    for (;;) {
      const loggedOut = await page.locator("input[type='password'], text=/log in|sign in/i").first().isVisible({ timeout: 1500 }).catch(() => false);
      if (!loggedOut) return;
      stats.status = "paused";
      emit({ sessionId, stats, log: this.log(sessionId, "warn", "Apollo login required. Complete login in the browser window; extraction will resume automatically.") });
      await page.waitForTimeout(2000);
      stats.status = "running";
    }
  }

  private async goNext(page: Page, selector: string | undefined, stats: ExtractionStats): Promise<void> {
    const oldUrl = page.url();
    if (selector) {
      await page.locator(selector).first().click({ timeout: 10000 });
    } else {
      await page.goto(this.parser.setPage(oldUrl, stats.currentPage + 1), { waitUntil: "domcontentloaded" });
    }
    await page.waitForFunction((url) => location.href !== url, oldUrl, { timeout: 15000 }).catch(() => undefined);
  }

  private detectCurrentCompany(records: LeadRecord[]): string | undefined {
    const record = records[records.length - 1];
    if (!record) return undefined;
    const companyKey = Object.keys(record.fields).find((key) => /company|organization/i.test(key));
    return companyKey ? String(record.fields[companyKey]) : undefined;
  }

  private log(sessionId: string, level: LogEntry["level"], message: string, context?: LogEntry["context"]): LogEntry {
    const entry = { level, message, timestamp: new Date().toISOString(), context };
    this.logs.add(sessionId, entry);
    return entry;
  }
}
