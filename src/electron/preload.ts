import { contextBridge, ipcRenderer } from "electron";
import type { ExtractionEvent, ExtractionSession, ExportRequest, LeadRecord } from "@/types";

const api = {
  startExtraction: (url: string): Promise<ExtractionSession> => ipcRenderer.invoke("extract:start", url),
  cancelExtraction: (): Promise<void> => ipcRenderer.invoke("extract:cancel"),
  listSessions: (): Promise<ExtractionSession[]> => ipcRenderer.invoke("sessions:list"),
  listLeads: (sessionId: string): Promise<LeadRecord[]> => ipcRenderer.invoke("leads:list", sessionId),
  exportSession: (request: Omit<ExportRequest, "outputPath">): Promise<string | undefined> => ipcRenderer.invoke("export:save", request),
  onExtractionUpdate: (listener: (event: ExtractionEvent) => void): (() => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, payload: ExtractionEvent) => listener(payload);
    ipcRenderer.on("extract:update", wrapped);
    return () => ipcRenderer.off("extract:update", wrapped);
  }
};

contextBridge.exposeInMainWorld("apollo", api);

declare global {
  interface Window {
    apollo: typeof api;
  }
}
