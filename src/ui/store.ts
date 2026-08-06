import { create } from "zustand";
import type { ExtractionEvent, ExtractionSession, ExtractionStats, LeadRecord, LogEntry } from "@/types";

interface AppState {
  url: string;
  sessions: ExtractionSession[];
  activeSession?: ExtractionSession;
  leads: LeadRecord[];
  logs: LogEntry[];
  stats: ExtractionStats;
  setUrl: (url: string) => void;
  loadSessions: () => Promise<void>;
  loadLeads: (sessionId: string) => Promise<void>;
  start: () => Promise<void>;
  cancel: () => Promise<void>;
  export: (format: "csv" | "xlsx" | "json" | "sqlite") => Promise<void>;
  applyUpdate: (event: ExtractionEvent) => void;
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

export const useAppStore = create<AppState>((set, get) => ({
  url: "",
  sessions: [],
  leads: [],
  logs: [],
  stats: idleStats,
  setUrl: (url) => set({ url }),
  loadSessions: async () => set({ sessions: await window.apollo.listSessions() }),
  loadLeads: async (sessionId) => {
    const leads = await window.apollo.listLeads(sessionId);
    const session = get().sessions.find((item) => item.id === sessionId);
    set({ leads, activeSession: session });
  },
  start: async () => {
    set({ stats: { ...idleStats, status: "running" }, logs: [], leads: [] });
    const session = await window.apollo.startExtraction(get().url);
    set({ activeSession: session });
    await get().loadSessions();
    await get().loadLeads(session.id);
  },
  cancel: async () => window.apollo.cancelExtraction(),
  export: async (format) => {
    const sessionId = get().activeSession?.id;
    if (sessionId) await window.apollo.exportSession({ sessionId, format });
  },
  applyUpdate: (event) => {
    set((state) => ({
      stats: event.stats,
      logs: event.log ? [...state.logs, event.log] : state.logs,
      leads: event.leads ? [...state.leads, ...event.leads] : (event.lead ? [...state.leads, event.lead] : state.leads)
    }));
  }
}));
