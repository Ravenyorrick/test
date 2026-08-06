import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppDatabase } from "@/database/database";
import { LeadRepository, SessionRepository } from "@/database/repositories";
import { ExportService } from "@/exports/exportService";

let dir: string;
let appDb: AppDatabase;
let leads: LeadRepository;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "apollo-export-"));
  appDb = new AppDatabase(path.join(dir, "test.sqlite"));
  const sessions = new SessionRepository(appDb.db);
  leads = new LeadRepository(appDb.db);
  sessions.create({ id: "s1", url: "u", filters: [], status: "completed", createdAt: "t", updatedAt: "t", checkpointPage: 1, leadCount: 1 });
  leads.insertMany("s1", [{ id: "l1", hash: "h1", sourceUrl: "u", page: 1, extractedAt: "t", fields: { Name: "Ada", Future: "Yes" }, visibleText: "Ada" }]);
});

afterEach(() => {
  appDb.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("ExportService", () => {
  it("exports csv and json", async () => {
    const service = new ExportService(leads, path.join(dir, "test.sqlite"));
    const csv = path.join(dir, "out.csv");
    const json = path.join(dir, "out.json");
    await service.export({ sessionId: "s1", format: "csv", outputPath: csv });
    await service.export({ sessionId: "s1", format: "json", outputPath: json });
    expect(readFileSync(csv, "utf8")).toContain("Future");
    expect(JSON.parse(readFileSync(json, "utf8"))[0].fields.Name).toBe("Ada");
  });

  it("exports xlsx and sqlite artifacts", async () => {
    const service = new ExportService(leads, path.join(dir, "test.sqlite"));
    const xlsx = path.join(dir, "out.xlsx");
    const sqlite = path.join(dir, "out.sqlite");
    await service.export({ sessionId: "s1", format: "xlsx", outputPath: xlsx });
    await service.export({ sessionId: "s1", format: "sqlite", outputPath: sqlite });
    expect(existsSync(xlsx)).toBe(true);
    expect(existsSync(sqlite)).toBe(true);
  });
});
