import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppDatabase } from "@/database/database";
import { LeadRepository, SessionRepository } from "@/database/repositories";

let dir: string;
let appDb: AppDatabase;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "apollo-db-"));
  appDb = new AppDatabase(path.join(dir, "test.sqlite"));
});

afterEach(() => {
  appDb.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("repositories", () => {
  it("stores sessions and ignores duplicate lead hashes", () => {
    const sessions = new SessionRepository(appDb.db);
    const leads = new LeadRepository(appDb.db);
    sessions.create({
      id: "s1",
      url: "https://app.apollo.io/#/people?page=1",
      filters: [],
      status: "running",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      checkpointPage: 1,
      leadCount: 0
    });
    const result = leads.insertMany("s1", [
      { id: "l1", hash: "h1", sourceUrl: "u", page: 1, extractedAt: "t", fields: { Name: "Ada" }, visibleText: "Ada" },
      { id: "l2", hash: "h1", sourceUrl: "u", page: 1, extractedAt: "t", fields: { Name: "Ada" }, visibleText: "Ada" }
    ]);
    expect(result).toEqual({ inserted: 1, duplicates: 1 });
    expect(leads.list("s1")).toHaveLength(1);
  });
});
