import { create } from "zustand";
import type { ApiRequestDebug, AppSettings, ExtractionEvent, ExtractionSession, ExtractionStats, LeadRecord, LogEntry, RuntimeConfig } from "@/types";
import { InputValidator } from "@/services/validation";

export type AppPage = "dashboard" | "extract" | "history" | "exports" | "logs" | "settings" | "about";
export type ExportFormat = "csv" | "xlsx" | "json" | "sqlite";

export interface ExportHistoryItem {
  id: string;
  format: ExportFormat;
  outputPath: string;
  createdAt: string;
}

interface AppState {
  url: string;
  apiKey: string;
  page: AppPage;
  sidebarCollapsed: boolean;
  settings: AppSettings;
  config: RuntimeConfig;
  message?: string;
  error?: string;
  logSearch: string;
  exportHistory: ExportHistoryItem[];
  requestDebug?: ApiRequestDebug;
  sessions: ExtractionSession[];
  activeSession?: ExtractionSession;
  leads: LeadRecord[];
  logs: LogEntry[];
  stats: ExtractionStats;
  setUrl: (url: string) => void;
  setApiKey: (apiKey: string) => void;
  setPage: (page: AppPage) => void;
  toggleSidebar: () => void;
  setLogSearch: (value: string) => void;
  clearLogs: () => void;
  saveSettings: () => void;
  resetSettings: () => void;
  validateConfiguration: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  loadSessions: () => Promise<void>;
  loadLeads: (sessionId: string) => Promise<void>;
  start: () => Promise<void>;
  resume: () => Promise<void>;
  cancel: () => Promise<void>;
  export: (format: ExportFormat) => Promise<void>;
  applyUpdate: (event: ExtractionEvent) => void;
  applyFatal: (event: { message: string; detail: string }) => void;
}

const idleStats: ExtractionStats = {
  currentPage: 1,
  leadsExtracted: 0,
  duplicates: 0,
  errors: 0,
  retries: 0,
  rowsPerSecond: 0,
  elapsedMs: 0,
  status: "idle"
};

export const defaultSettings: AppSettings = { mode: "api", perPage: 100, autoEnrich: true, revealPersonalEmails: false, revealDuringExtraction: true, batchEnrichment: true, enrichmentConcurrency: 4, maxEmailRevealsPerRun: 0, theme: "midnight", accent: "blue", developerMode: false };
const validator = new InputValidator();

export const useAppStore = create<AppState>((set, get) => ({
  url: "",
  apiKey: "",
  page: "dashboard",
  sidebarCollapsed: false,
  settings: loadSettings(),
  config: { environmentApiKeyAvailable: false },
  logSearch: "",
  exportHistory: loadExportHistory(),
  sessions: [],
  leads: [],
  logs: [],
  stats: idleStats,
  setUrl: (url) => set({ url }),
  setApiKey: (apiKey) => set({ apiKey }),
  setPage: (page) => set({ page }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setLogSearch: (logSearch) => set({ logSearch }),
  clearLogs: () => set({ logs: [], message: "Logs cleared." }),
  saveSettings: () => {
    saveSettings(get().settings);
    set({ message: "Settings saved." });
  },
  resetSettings: () => {
    saveSettings(defaultSettings);
    set({ settings: defaultSettings, message: "Settings reset." });
  },
  validateConfiguration: () => {
    const state = get();
    const result = state.settings.mode === "api"
      ? validator.validateApiKey(state.apiKey, state.config.environmentApiKeyAvailable)
      : { valid: true };
    set(result.valid ? { message: "Configuration is valid.", error: undefined } : { error: result.message });
  },
  updateSettings: (settings) => {
    const next = { ...get().settings, ...settings };
    saveSettings(next);
    set({ settings: next, message: "Settings saved." });
  },
  clearError: () => set({ error: undefined, message: undefined }),
  initialize: async () => {
    await safeAction(async () => {
      const config = await window.apollo.getConfig();
      const sessions = await window.apollo.listSessions();
      set({ config, sessions });
    }, set);
  },
  loadSessions: async () => safeAction(async () => set({ sessions: await window.apollo.listSessions() }), set),
  loadLeads: async (sessionId) => {
    await safeAction(async () => {
      const leads = await window.apollo.listLeads(sessionId);
      const session = get().sessions.find((item) => item.id === sessionId);
      set({ leads, activeSession: session, page: "extract" });
    }, set);
  },
  start: async () => {
    await startExtraction(set, get);
  },
  resume: async () => startExtraction(set, get),
  cancel: async () => {
    await safeAction(async () => {
      await window.apollo.cancelExtraction();
      set((state) => ({ stats: { ...state.stats, status: "paused" }, message: "Extraction paused." }));
    }, set);
  },
  export: async (format) => {
    await safeAction(async () => {
      const sessionId = get().activeSession?.id;
      if (!sessionId) throw new Error("Select a completed extraction before exporting.");
      const output = await window.apollo.exportSession({ sessionId, format });
      if (output) {
        const history = [{ id: `${Date.now()}-${format}`, format, outputPath: output, createdAt: new Date().toISOString() }, ...get().exportHistory].slice(0, 20);
        saveExportHistory(history);
        set({ message: `Export saved to ${output}`, exportHistory: history });
      }
    }, set);
  },
  applyUpdate: (event) => {
    set((state) => ({
      stats: event.stats,
      logs: event.log ? [...state.logs, event.log] : state.logs,
      leads: mergeLeads(state.leads, event.leads ?? (event.lead ? [event.lead] : [])),
      requestDebug: event.debug ?? state.requestDebug
    }));
  },
  applyFatal: (event) => {
    set({ error: `${event.message}: ${event.detail}`, stats: { ...get().stats, status: "failed" } });
  }
}));

async function startExtraction(set: (partial: Partial<AppState>) => void, get: () => AppState): Promise<void> {
  await safeAction(async () => {
    const state = get();
    const urlValidation = validator.validateApolloPeopleUrl(state.url);
    if (!urlValidation.valid) throw new Error(urlValidation.message);
    if (state.settings.mode === "api") {
      const keyValidation = validator.validateApiKey(state.apiKey, state.config.environmentApiKeyAvailable);
      if (!keyValidation.valid) throw new Error(keyValidation.message);
    }
    set({ stats: { ...idleStats, status: "running" }, logs: [], leads: [], error: undefined, message: "Extraction started.", page: "extract" });
    const session = await window.apollo.startExtraction(state.url, state.settings.mode === "api" ? state.apiKey || undefined : undefined, {
      perPage: state.settings.perPage,
      autoEnrich: state.settings.autoEnrich && state.settings.revealDuringExtraction,
      revealPersonalEmails: state.settings.revealPersonalEmails,
      enrichmentConcurrency: state.settings.enrichmentConcurrency,
      maxEmailRevealsPerRun: state.settings.maxEmailRevealsPerRun
    });
    set({ activeSession: session, message: `Extraction ${session.status}.` });
    await get().loadSessions();
    await get().loadLeads(session.id);
  }, set);
}

async function safeAction(action: () => Promise<void>, set: (partial: Partial<AppState>) => void): Promise<void> {
  try {
    await action();
  } catch (error) {
    set({ error: error instanceof Error ? error.message : String(error), stats: { ...idleStats, status: "failed" } });
  }
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem("apollo-lead-extractor-settings");
    return raw ? { ...defaultSettings, ...JSON.parse(raw) as Partial<AppSettings> } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings: AppSettings): void {
  localStorage.setItem("apollo-lead-extractor-settings", JSON.stringify(settings));
}

function loadExportHistory(): ExportHistoryItem[] {
  try {
    const raw = localStorage.getItem("apollo-lead-extractor-export-history");
    return raw ? JSON.parse(raw) as ExportHistoryItem[] : [];
  } catch {
    return [];
  }
}

function saveExportHistory(history: ExportHistoryItem[]): void {
  localStorage.setItem("apollo-lead-extractor-export-history", JSON.stringify(history));
}

function mergeLeads(current: LeadRecord[], updates: LeadRecord[]): LeadRecord[] {
  if (updates.length === 0) return current;
  const map = new Map(current.map((lead) => [lead.id, lead]));
  for (const lead of updates) {
    map.set(lead.id, lead);
  }
  return Array.from(map.values());
}
