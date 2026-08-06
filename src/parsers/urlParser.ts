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
    const grouped = new Map<string, string[]>();

    query.forEach((value, rawKey) => {
      const key = decodeURIComponent(rawKey);
      const normalizedKey = key.endsWith("[]") ? key.slice(0, -2) : key;
      const values = grouped.get(normalizedKey) ?? [];
      values.push(decodeURIComponent(value));
      grouped.set(normalizedKey, values);
    });

    const page = Number(grouped.get("page")?.[0] ?? "1") || 1;
    const filters = Array.from(grouped.entries()).map(([key, values]) => ({ key, values }));

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
}
