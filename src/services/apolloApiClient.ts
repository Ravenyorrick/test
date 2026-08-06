import type { JsonValue, SearchFilter } from "@/types";

export interface ApolloSearchResult {
  people: Array<Record<string, JsonValue>>;
  raw: Record<string, JsonValue>;
}

export class ApolloApiClient {
  private readonly baseUrl = "https://api.apollo.io/api/v1";

  constructor(private readonly apiKey: string) {}

  async search(filters: SearchFilter[], page: number, perPage: number): Promise<ApolloSearchResult> {
    const body = this.filtersToApiBody(filters);
    body.page = page;
    body.per_page = perPage;

    const response = await fetch(`${this.baseUrl}/mixed_people/api_search`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    return this.parseResponse(response);
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

  filtersToApiBody(filters: SearchFilter[]): Record<string, JsonValue> {
    const body: Record<string, JsonValue> = {};
    for (const filter of filters) {
      if (filter.key === "page" || filter.key === "per_page" || filter.key === "perPage") continue;
      const apiKey = this.toSnakeCase(filter.key);
      body[apiKey] = filter.values.length === 1 ? filter.values[0] : filter.values;
    }
    return body;
  }

  private async parseResponse(response: Response): Promise<ApolloSearchResult> {
    const json = await this.parseJson(response);
    if (!response.ok) {
      throw new Error(`Apollo search failed with ${response.status}: ${this.errorMessage(json)}`);
    }
    const people = Array.isArray(json.people)
      ? json.people as Array<Record<string, JsonValue>>
      : Array.isArray(json.contacts)
        ? json.contacts as Array<Record<string, JsonValue>>
        : [];
    return { people, raw: json };
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

  private toSnakeCase(key: string): string {
    return key
      .replace(/\[\]$/, "")
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase();
  }

  private errorMessage(json: Record<string, JsonValue>): string {
    return String(json.error ?? json.message ?? json.raw ?? "Unknown Apollo API error");
  }
}
