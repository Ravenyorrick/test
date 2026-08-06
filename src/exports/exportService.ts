import ExcelJS from "exceljs";
import Papa from "papaparse";
import { copyFileSync, createWriteStream, writeFileSync } from "node:fs";
import type { LeadRepository } from "@/database/repositories";
import type { ExportRequest, JsonValue, LeadRecord } from "@/types";

export class ExportService {
  constructor(private readonly leads: LeadRepository, private readonly databasePath: string) {}

  async export(request: ExportRequest): Promise<string> {
    const records = this.leads.list(request.sessionId);
    switch (request.format) {
      case "csv":
        await this.csv(records, request.outputPath);
        break;
      case "xlsx":
        await this.xlsx(records, request.outputPath);
        break;
      case "json":
        this.json(records, request.outputPath);
        break;
      case "sqlite":
        copyFileSync(this.databasePath, request.outputPath);
        break;
    }
    return request.outputPath;
  }

  private async csv(records: LeadRecord[], outputPath: string): Promise<void> {
    const stream = createWriteStream(outputPath);
    const rows = records.map((record) => this.flatten(record));
    stream.write(Papa.unparse(rows, { header: true }));
    await new Promise<void>((resolve, reject) => {
      stream.end(resolve);
      stream.on("error", reject);
    });
  }

  private async xlsx(records: LeadRecord[], outputPath: string): Promise<void> {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: outputPath });
    const sheet = workbook.addWorksheet("Leads");
    const rows = records.map((record) => this.flatten(record));
    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    sheet.columns = headers.map((header) => ({ header, key: header, width: Math.min(Math.max(header.length, 12), 40) }));
    rows.forEach((row) => sheet.addRow(row).commit());
    sheet.commit();
    await workbook.commit();
  }

  private json(records: LeadRecord[], outputPath: string): void {
    writeFileSync(outputPath, JSON.stringify(records, null, 2));
  }

  private flatten(record: LeadRecord): Record<string, string | number | boolean | null> {
    const row: Record<string, string | number | boolean | null> = {
      id: record.id,
      hash: record.hash,
      page: record.page,
      sourceUrl: record.sourceUrl,
      extractedAt: record.extractedAt
    };
    for (const [key, value] of Object.entries(record.fields)) {
      row[key] = this.scalar(value);
    }
    return row;
  }

  private scalar(value: JsonValue): string | number | boolean | null {
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
      return value as string | number | boolean | null;
    }
    return JSON.stringify(value);
  }
}
