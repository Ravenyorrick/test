import { describe, expect, it } from "vitest";
import { InputValidator } from "@/services/validation";
import { redactSecrets } from "@/services/safeError";

describe("InputValidator", () => {
  const validator = new InputValidator();

  it("accepts Apollo People Search URLs", () => {
    expect(validator.validateApolloPeopleUrl("https://app.apollo.io/#/people?page=1&futureFilter=x").valid).toBe(true);
  });

  it("rejects invalid or non-people URLs", () => {
    expect(validator.validateApolloPeopleUrl("not-a-url").valid).toBe(false);
    expect(validator.validateApolloPeopleUrl("https://example.com/#/people").valid).toBe(false);
    expect(validator.validateApolloPeopleUrl("https://app.apollo.io/#/companies").valid).toBe(false);
  });

  it("validates API mode configuration", () => {
    expect(validator.validateApiKey("", false).valid).toBe(false);
    expect(validator.validateApiKey("", true).valid).toBe(true);
    expect(validator.validateApiKey("key", false).valid).toBe(true);
  });
});

describe("redactSecrets", () => {
  it("removes API keys from error strings", () => {
    expect(redactSecrets("bad x-api-key: secret123")).not.toContain("secret123");
  });
});
