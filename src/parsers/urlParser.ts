import type { SearchFilter } from "@/types";

export interface ParsedApolloUrl {
  originalUrl: string;
  normalizedUrl: string;
  filters: SearchFilter[];
  page: number;
}

export class ApolloUrlParser {
  parse(input: string): ParsedApolloUrl {
    const url = new URL(input);
    const query = this.extractSearchParams(url);
    const grouped = new Map<string, { values: string[]; rawKeys: string[]; isArray: boolean }>();

    query.forEach((value, rawKey) => {
      const key = decodeURIComponent(rawKey);
      const normalizedKey = this.normalizeKey(key);
      const existing = grouped.get(normalizedKey) ?? { values: [], rawKeys: [], isArray: false };
      const values = existing.values;
      values.push(decodeURIComponent(value));
      existing.rawKeys.push(key);
      existing.isArray = existing.isArray || key.endsWith("[]") || values.length > 1;
      grouped.set(normalizedKey, existing);
    });

    const page = Number(grouped.get("page")?.values[0] ?? "1") || 1;
    const filters = Array.from(grouped.entries()).map(([key, parameter]) => ({
      key,
      values: parameter.values,
      isArray: parameter.isArray,
      rawKeys: parameter.rawKeys
    }));

    return {
      originalUrl: input,
      normalizedUrl: url.toString(),
      filters,
      page
    };
  }

  setPage(input: string, page: number): string {
    const url = new URL(input);
    const fragment = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
    const [path, query = ""] = fragment.split("?");
    const params = new URLSearchParams(query);
    params.set("page", String(page));
    url.hash = `${path}?${params.toString()}`;
    return url.toString();
  }

  private extractSearchParams(url: URL): URLSearchParams {
    if (url.hash.includes("?")) {
      const query = url.hash.slice(url.hash.indexOf("?") + 1);
      return new URLSearchParams(query);
    }

    return url.searchParams;
  }

  private normalizeKey(key: string): string {
    return key.endsWith("[]") ? key.slice(0, -2) : key;
  }
}
