import { create } from "zustand";
import type { AppSettings, ExtractionEvent, ExtractionSession, ExtractionStats, LeadRecord, LogEntry, RuntimeConfig } from "@/types";
import { InputValidator } from "@/services/validation";

export type AppPage = "extract" | "progress" | "history" | "exports" | "logs" | "settings";

interface AppState {
  url: string;
  apiKey: string;
  page: AppPage;
  settings: AppSettings;
  config: RuntimeConfig;
  message?: string;
  error?: string;
  sessions: ExtractionSession[];
  activeSession?: ExtractionSession;
  leads: LeadRecord[];
  logs: LogEntry[];
  stats: ExtractionStats;
  setUrl: (url: string) => void;
  setApiKey: (apiKey: string) => void;
  setPage: (page: AppPage) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  loadSessions: () => Promise<void>;
  loadLeads: (sessionId: string) => Promise<void>;
  start: () => Promise<void>;
  resume: () => Promise<void>;
  cancel: () => Promise<void>;
  export: (format: "csv" | "xlsx" | "json" | "sqlite") => Promise<void>;
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

const defaultSettings: AppSettings = { mode: "api", perPage: 100 };
const validator = new InputValidator();

export const useAppStore = create<AppState>((set, get) => ({
  url: "",
  apiKey: "",
  page: "extract",
  settings: loadSettings(),
  config: { environmentApiKeyAvailable: false },
  sessions: [],
  leads: [],
  logs: [],
  stats: idleStats,
  setUrl: (url) => set({ url }),
  setApiKey: (apiKey) => set({ apiKey }),
  setPage: (page) => set({ page }),
  updateSettings: (settings) => {
    const next = { ...get().settings, ...settings };
    saveSettings(next);
    set({ settings: next, message: "Settings saved." });
  },
  clearError: () => set({ error: undefined }),
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
      set({ leads, activeSession: session, page: "progress" });
    }, set);
  },
  start: async () => {
    await startExtraction(set, get);
  },
  resume: async () => startExtraction(set, get),
  cancel: async () => window.apollo.cancelExtraction(),
  export: async (format) => {
    await safeAction(async () => {
      const sessionId = get().activeSession?.id;
      if (!sessionId) throw new Error("Select a completed extraction before exporting.");
      const output = await window.apollo.exportSession({ sessionId, format });
      if (output) set({ message: `Export saved to ${output}` });
    }, set);
  },
  applyUpdate: (event) => {
    set((state) => ({
      stats: event.stats,
      logs: event.log ? [...state.logs, event.log] : state.logs,
      leads: event.leads ? [...state.leads, ...event.leads] : (event.lead ? [...state.leads, event.lead] : state.leads)
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
    set({ stats: { ...idleStats, status: "running" }, logs: [], leads: [], error: undefined, message: "Extraction started.", page: "progress" });
    const session = await window.apollo.startExtraction(state.url, state.settings.mode === "api" ? state.apiKey || undefined : undefined, { perPage: state.settings.perPage });
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
