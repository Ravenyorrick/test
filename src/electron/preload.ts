import { contextBridge, ipcRenderer } from "electron";
import type { ExtractionEvent, ExtractionSession, ExportRequest, LeadRecord, RuntimeConfig } from "@/types";

const api = {
  getConfig: (): Promise<RuntimeConfig> => ipcRenderer.invoke("app:config"),
  startExtraction: (url: string, apiKey?: string, options?: { perPage?: number }): Promise<ExtractionSession> => ipcRenderer.invoke("extract:start", url, apiKey, options),
  cancelExtraction: (): Promise<void> => ipcRenderer.invoke("extract:cancel"),
  listSessions: (): Promise<ExtractionSession[]> => ipcRenderer.invoke("sessions:list"),
  listLeads: (sessionId: string): Promise<LeadRecord[]> => ipcRenderer.invoke("leads:list", sessionId),
  exportSession: (request: Omit<ExportRequest, "outputPath">): Promise<string | undefined> => ipcRenderer.invoke("export:save", request),
  onExtractionUpdate: (listener: (event: ExtractionEvent) => void): (() => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, payload: ExtractionEvent) => listener(payload);
    ipcRenderer.on("extract:update", wrapped);
    return () => ipcRenderer.off("extract:update", wrapped);
  },
  onFatalError: (listener: (event: { message: string; detail: string }) => void): (() => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, payload: { message: string; detail: string }) => listener(payload);
    ipcRenderer.on("app:fatal", wrapped);
    return () => ipcRenderer.off("app:fatal", wrapped);
  }
};

contextBridge.exposeInMainWorld("apollo", api);

declare global {
  interface Window {
    apollo: typeof api;
  }
}
