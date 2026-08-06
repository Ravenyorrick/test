import type { Database } from "better-sqlite3";
import type { ExtractionSession, LeadRecord, LogEntry, SearchFilter } from "@/types";

export class SessionRepository {
  constructor(private readonly db: Database) {}

  create(session: ExtractionSession): void {
    this.db.prepare(`
      INSERT INTO sessions (id, url, filters_json, status, created_at, updated_at, checkpoint_page, lead_count)
      VALUES (@id, @url, @filtersJson, @status, @createdAt, @updatedAt, @checkpointPage, @leadCount)
    `).run({
      ...session,
      filtersJson: JSON.stringify(session.filters)
    });
  }

  update(session: Pick<ExtractionSession, "id" | "status" | "checkpointPage" | "leadCount" | "updatedAt">): void {
    this.db.prepare(`
      UPDATE sessions SET status = @status, checkpoint_page = @checkpointPage, lead_count = @leadCount, updated_at = @updatedAt
      WHERE id = @id
    `).run(session);
  }

  list(): ExtractionSession[] {
    return this.db.prepare("SELECT * FROM sessions ORDER BY created_at DESC").all().map(this.fromRow);
  }

  get(id: string): ExtractionSession | undefined {
    const row = this.db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
    return row ? this.fromRow(row) : undefined;
  }

  private fromRow(row: any): ExtractionSession {
    return {
      id: row.id,
      url: row.url,
      filters: JSON.parse(row.filters_json) as SearchFilter[],
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      checkpointPage: row.checkpoint_page,
      leadCount: row.lead_count
    };
  }
}

export class LeadRepository {
  constructor(private readonly db: Database) {}

  insertMany(sessionId: string, leads: LeadRecord[]): { inserted: number; duplicates: number } {
    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO leads (id, session_id, hash, source_url, page, extracted_at, fields_json, visible_text)
      VALUES (@id, @sessionId, @hash, @sourceUrl, @page, @extractedAt, @fieldsJson, @visibleText)
    `);
    let inserted = 0;
    const write = this.db.transaction((records: LeadRecord[]) => {
      for (const lead of records) {
        const result = insert.run({
          ...lead,
          sessionId,
          fieldsJson: JSON.stringify(lead.fields)
        });
        inserted += result.changes;
      }
    });
    write(leads);
    return { inserted, duplicates: leads.length - inserted };
  }

  list(sessionId: string): LeadRecord[] {
    return this.db.prepare("SELECT * FROM leads WHERE session_id = ? ORDER BY page, id").all(sessionId).map((row: any) => ({
      id: row.id,
      hash: row.hash,
      sourceUrl: row.source_url,
      page: row.page,
      extractedAt: row.extracted_at,
      fields: JSON.parse(row.fields_json),
      visibleText: row.visible_text
    }));
  }
}

export class LogRepository {
  constructor(private readonly db: Database) {}

  add(sessionId: string, entry: LogEntry): void {
    this.db.prepare(`
      INSERT INTO logs (session_id, level, message, timestamp, context_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, entry.level, entry.message, entry.timestamp, entry.context ? JSON.stringify(entry.context) : null);
  }

  list(sessionId: string): LogEntry[] {
    return this.db.prepare("SELECT * FROM logs WHERE session_id = ? ORDER BY id").all(sessionId).map((row: any) => ({
      level: row.level,
      message: row.message,
      timestamp: row.timestamp,
      context: row.context_json ? JSON.parse(row.context_json) : undefined
    }));
  }
}
