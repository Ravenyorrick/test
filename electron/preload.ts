import { contextBridge, ipcRenderer } from "electron";
import { ipcChannels } from "./ipc/channels.js";

export type VoxshiftAppInfo = {
  version: string;
  platform: NodeJS.Platform;
};

export type VoxshiftDiagnosticsSnapshot = {
  audioEngine: "not-initialized";
  virtualMicrophone: "not-installed";
  safetyGate: "muted";
};

export type VoxshiftApi = {
  getAppInfo: () => Promise<VoxshiftAppInfo>;
  getDiagnosticsSnapshot: () => Promise<VoxshiftDiagnosticsSnapshot>;
  emergencyMute: () => Promise<{ muted: true }>;
};

const api: VoxshiftApi = {
  getAppInfo: () => ipcRenderer.invoke(ipcChannels.appInfo),
  getDiagnosticsSnapshot: () => ipcRenderer.invoke(ipcChannels.diagnosticsSnapshot),
  emergencyMute: () => ipcRenderer.invoke(ipcChannels.emergencyMute)
};

contextBridge.exposeInMainWorld("voxshift", api);
