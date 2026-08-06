export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface SearchFilter {
  key: string;
  values: string[];
  isArray: boolean;
  rawKeys: string[];
}

export type ApiPayloadValue = string | number | boolean | string[] | number[] | boolean[] | Record<string, string | number | boolean>;

export interface ApiRequestDebug {
  originalUrl: string;
  parsedParameters: SearchFilter[];
  normalizedParameters: Record<string, ApiPayloadValue>;
  finalPayload: Record<string, ApiPayloadValue>;
  sanitizedHeaders: Record<string, string>;
  validationWarnings: string[];
  validationErrors: string[];
  response?: {
    status: number;
    ok: boolean;
    returned: number;
    elapsedMs: number;
  };
}

export interface LeadRecord {
  id: string;
  hash: string;
  sourceUrl: string;
  page: number;
  extractedAt: string;
  fields: Record<string, JsonValue>;
  visibleText: string;
}

export interface ExtractionStats {
  currentPage: number;
  lastPage?: number;
  leadsExtracted: number;
  duplicates: number;
  errors: number;
  retries: number;
  rowsPerSecond: number;
  elapsedMs: number;
  estimatedRemainingMs?: number;
  currentCompany?: string;
  status: "idle" | "running" | "paused" | "completed" | "failed" | "cancelled";
}

export interface ExtractionSession {
  id: string;
  url: string;
  filters: SearchFilter[];
  status: ExtractionStats["status"];
  createdAt: string;
  updatedAt: string;
  checkpointPage: number;
  leadCount: number;
}

export interface ExtractionEvent {
  sessionId: string;
  stats: ExtractionStats;
  lead?: LeadRecord;
  leads?: LeadRecord[];
  log?: LogEntry;
  debug?: ApiRequestDebug;
}

export interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
  context?: Record<string, JsonValue>;
}

export interface ExportRequest {
  sessionId: string;
  format: "csv" | "xlsx" | "json" | "sqlite";
  outputPath: string;
}

export type ExtractionMode = "browser" | "api";

export interface AppSettings {
  mode: ExtractionMode;
  perPage: number;
  autoEnrich: boolean;
  theme: "midnight" | "obsidian";
  accent: "blue" | "purple";
  exportDirectory?: string;
  developerMode: boolean;
}

export interface RuntimeConfig {
  environmentApiKeyAvailable: boolean;
}
