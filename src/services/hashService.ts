import { createHash } from "node:crypto";
import type { JsonValue } from "@/types";

export class HashService {
  leadHash(fields: Record<string, JsonValue>): string {
    const preferredKeys = Object.keys(fields).filter((key) => /apollo|person\s*id|organization\s*id|linkedin|email/i.test(key));
    const payload = preferredKeys.length
      ? preferredKeys.sort().map((key) => [key, fields[key]])
      : Object.keys(fields).sort().map((key) => [key, fields[key]]);
    return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  }

  id(prefix = "id"): string {
    return `${prefix}_${createHash("sha1").update(`${Date.now()}_${Math.random()}`).digest("hex").slice(0, 16)}`;
  }
}
