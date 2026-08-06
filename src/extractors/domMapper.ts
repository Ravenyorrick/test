import type { JsonValue } from "@/types";

export interface DomMappedRow {
  fields: Record<string, JsonValue>;
  visibleText: string;
}

export interface DomMappingResult {
  headers: string[];
  rows: DomMappedRow[];
}

const TABLE_SELECTORS = [
  "table",
  "[role='table']",
  "[role='grid']",
  "[data-testid*='table' i]",
  "[class*='table' i]",
  "[class*='grid' i]"
];

const ROW_SELECTORS = ["tr", "[role='row']", "[data-testid*='row' i]", "[class*='row' i]"];
const CELL_SELECTORS = ["th", "td", "[role='columnheader']", "[role='gridcell']", "[role='cell']"];

export class DomMapper {
  map(root: ParentNode = document): DomMappingResult {
    const table = this.findBestTable(root);
    if (!table) {
      return { headers: [], rows: this.extractCardRows(root) };
    }

    const rows = this.findRows(table);
    const headers = this.detectHeaders(rows, table);
    const dataRows = rows.filter((row) => this.isDataRow(row, headers));

    return {
      headers,
      rows: dataRows.map((row) => this.mapRow(row, headers)).filter((row) => Object.keys(row.fields).length > 0)
    };
  }

  private findBestTable(root: ParentNode): Element | null {
    const candidates = TABLE_SELECTORS.flatMap((selector) => Array.from(root.querySelectorAll(selector)));
    return candidates
      .map((element) => ({ element, score: this.findRows(element).length + element.textContent!.trim().length / 1000 }))
      .sort((a, b) => b.score - a.score)[0]?.element ?? null;
  }

  private findRows(root: ParentNode): Element[] {
    const rows = ROW_SELECTORS.flatMap((selector) => Array.from(root.querySelectorAll(selector)));
    return Array.from(new Set(rows)).filter((row) => row.textContent?.trim());
  }

  private detectHeaders(rows: Element[], table: Element): string[] {
    const semanticHeaders = Array.from(table.querySelectorAll("th,[role='columnheader']"))
      .map((cell) => this.clean(cell.textContent ?? ""))
      .filter(Boolean);
    if (semanticHeaders.length > 1) {
      return this.uniqueHeaders(semanticHeaders);
    }

    const headerRow = rows.find((row) => {
      const cells = this.cells(row);
      return cells.length > 1 && cells.every((cell) => ["TH", "DIV", "SPAN"].includes(cell.tagName));
    });

    const inferred = headerRow ? this.cells(headerRow).map((cell) => this.clean(cell.textContent ?? "")) : [];
    return this.uniqueHeaders(inferred.filter(Boolean));
  }

  private isDataRow(row: Element, headers: string[]): boolean {
    const text = this.clean(row.textContent ?? "");
    if (!text) return false;
    const cells = this.cells(row);
    if (cells.length < 2) return false;
    const cellTexts = cells.map((cell) => this.clean(cell.textContent ?? "")).filter(Boolean);
    return headers.length === 0 || cellTexts.join("|") !== headers.join("|");
  }

  private mapRow(row: Element, headers: string[]): DomMappedRow {
    const cells = this.cells(row).filter((cell) => this.clean(cell.textContent ?? ""));
    const fields: Record<string, JsonValue> = {};

    cells.forEach((cell, index) => {
      const header = this.clean(cell.getAttribute("data-column") ?? cell.getAttribute("aria-label") ?? headers[index] ?? `Column ${index + 1}`);
      const value = this.extractCellValue(cell);
      if (value !== "") {
        fields[header] = value;
      }
    });

    this.extractLinks(row).forEach(([key, value]) => {
      fields[key] = value;
    });

    return {
      fields,
      visibleText: this.clean(row.textContent ?? "")
    };
  }

  private extractCardRows(root: ParentNode): DomMappedRow[] {
    const candidates = Array.from(root.querySelectorAll("article,[data-testid*='card' i],[class*='card' i]"));
    return candidates
      .filter((element) => this.clean(element.textContent ?? "").length > 20)
      .map((element, index) => {
        const fields: Record<string, JsonValue> = { [`Card ${index + 1}`]: this.clean(element.textContent ?? "") };
        this.extractLinks(element).forEach(([key, value]) => {
          fields[key] = value;
        });
        return { fields, visibleText: this.clean(element.textContent ?? "") };
      });
  }

  private cells(row: Element): Element[] {
    return Array.from(new Set(CELL_SELECTORS.flatMap((selector) => Array.from(row.querySelectorAll(selector)))));
  }

  private extractCellValue(cell: Element): string {
    const text = this.clean(cell.textContent ?? "");
    const title = this.clean(cell.getAttribute("title") ?? "");
    return title.length > text.length ? title : text;
  }

  private extractLinks(row: Element): Array<[string, string]> {
    return Array.from(row.querySelectorAll("a[href]"))
      .map((link, index): [string, string] => {
        const href = (link as HTMLAnchorElement).href;
        const label = this.clean(link.textContent ?? "") || `Link ${index + 1}`;
        return [`${label} URL`, href];
      })
      .filter(([, href]) => Boolean(href));
  }

  private uniqueHeaders(headers: string[]): string[] {
    const seen = new Map<string, number>();
    return headers.map((header, index) => {
      const base = header || `Column ${index + 1}`;
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return count === 0 ? base : `${base} ${count + 1}`;
    });
  }

  private clean(value: string): string {
    return value.replace(/\s+/g, " ").trim();
  }
}
