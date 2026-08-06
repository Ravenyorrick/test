import { describe, expect, it } from "vitest";
import { HashService } from "@/services/hashService";

describe("HashService", () => {
  it("uses stable identity fields for duplicate detection", () => {
    const service = new HashService();
    const first = service.leadHash({ Name: "Ada", "Apollo ID": "abc", Company: "A" });
    const second = service.leadHash({ Name: "Ada Updated", "Apollo ID": "abc", Company: "B" });
    expect(first).toBe(second);
  });
});
