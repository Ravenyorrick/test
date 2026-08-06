import { ApolloApiMapper } from "@/parsers/apolloApiMapper";
import type { ApiRequestDebug, ApiPayloadValue, JsonValue, SearchFilter } from "@/types";

export interface ApolloSearchResult {
  people: Array<Record<string, JsonValue>>;
  raw: Record<string, JsonValue>;
  debug: ApiRequestDebug;
}

export class ApolloApiClient {
  private readonly baseUrl = "https://api.apollo.io/api/v1";

  constructor(private readonly apiKey: string, private readonly mapper = new ApolloApiMapper()) {}

  async search(originalUrl: string, filters: SearchFilter[], page: number, perPage: number): Promise<ApolloSearchResult> {
    const mapped = this.mapper.map(filters, { page, per_page: perPage });
    if (mapped.errors.length) {
      throw new Error(`Apollo API payload validation failed: ${mapped.errors.join(" ")}`);
    }

    const started = Date.now();
    const response = await fetch(`${this.baseUrl}/mixed_people/api_search`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(mapped.payload)
    });
    return this.parseResponse(response, {
      originalUrl,
      parsedParameters: filters,
      normalizedParameters: mapped.normalizedParameters,
      finalPayload: mapped.payload,
      sanitizedHeaders: this.sanitizedHeaders(),
      validationWarnings: mapped.warnings,
      validationErrors: mapped.errors
    }, started);
  }

  async enrich(id: string): Promise<Record<string, JsonValue> | undefined> {
    const url = new URL(`${this.baseUrl}/people/match`);
    url.searchParams.set("id", id);
    url.searchParams.set("reveal_personal_emails", "false");
    url.searchParams.set("reveal_phone_number", "false");
    const response = await fetch(url, { method: "POST", headers: this.headers() });
    const json = await this.parseJson(response);
    if (!response.ok) {
      throw new Error(`Apollo enrichment failed with ${response.status}: ${this.errorMessage(json)}`);
    }
    return json.person as Record<string, JsonValue> | undefined;
  }

  filtersToApiBody(filters: SearchFilter[]): Record<string, ApiPayloadValue> {
    const mapped = this.mapper.map(filters);
    if (mapped.errors.length) {
      throw new Error(`Apollo API payload validation failed: ${mapped.errors.join(" ")}`);
    }
    return mapped.payload;
  }

  private async parseResponse(response: Response, debug: Omit<ApiRequestDebug, "response">, started: number): Promise<ApolloSearchResult> {
    const json = await this.parseJson(response);
    if (!response.ok) {
      throw new Error(`Apollo search failed with ${response.status}: ${this.errorMessage(json)}`);
    }
    const people = Array.isArray(json.people)
      ? json.people as Array<Record<string, JsonValue>>
      : Array.isArray(json.contacts)
        ? json.contacts as Array<Record<string, JsonValue>>
        : [];
    return { people, raw: json, debug: { ...debug, response: { status: response.status, ok: response.ok, returned: people.length, elapsedMs: Date.now() - started } } };
  }

  private async parseJson(response: Response): Promise<Record<string, JsonValue>> {
    const text = await response.text();
    try {
      return JSON.parse(text) as Record<string, JsonValue>;
    } catch {
      return { raw: text };
    }
  }

  private headers(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "x-api-key": this.apiKey
    };
  }

  private sanitizedHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "x-api-key": "[redacted]"
    };
  }

  private errorMessage(json: Record<string, JsonValue>): string {
    return String(json.error ?? json.message ?? json.raw ?? "Unknown Apollo API error");
  }
}
