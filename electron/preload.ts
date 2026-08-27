import { contextBridge, ipcRenderer } from "electron";
import type { AudioCommandResult, AudioMetrics, AudioStatus, ProcessingMode } from "./audio/AudioController.js";
import { ipcChannels } from "./ipc/channels.js";

export type VoxshiftAppInfo = {
  version: string;
  platform: NodeJS.Platform;
};

export type VoxshiftDiagnosticsSnapshot = {
  audioEngine: AudioStatus["state"];
  virtualMicrophone: "not-installed";
  safetyGate: "muted" | "ready";
};

export type VoxshiftApi = {
  getAppInfo: () => Promise<VoxshiftAppInfo>;
  getDiagnosticsSnapshot: () => Promise<VoxshiftDiagnosticsSnapshot>;
  audio: {
    start: () => Promise<AudioCommandResult>;
    stop: () => Promise<AudioCommandResult>;
    mute: () => Promise<AudioCommandResult>;
    unmute: () => Promise<AudioCommandResult>;
    getStatus: () => Promise<AudioStatus>;
    getMetrics: () => Promise<AudioMetrics>;
    setInputDevice: (deviceId: string) => Promise<AudioCommandResult>;
    setVoice: (voiceId: string, installed: boolean) => Promise<AudioCommandResult>;
    setQuality: (mode: ProcessingMode) => Promise<AudioCommandResult>;
    setNoiseSuppression: (enabled: boolean) => Promise<AudioCommandResult>;
    test: () => Promise<AudioCommandResult>;
    onStatus: (callback: (status: AudioStatus) => void) => () => void;
  };
};

const api: VoxshiftApi = {
  getAppInfo: () => ipcRenderer.invoke(ipcChannels.appInfo),
  getDiagnosticsSnapshot: () => ipcRenderer.invoke(ipcChannels.diagnosticsSnapshot),
  audio: {
    start: () => ipcRenderer.invoke(ipcChannels.audioStart),
    stop: () => ipcRenderer.invoke(ipcChannels.audioStop),
    mute: () => ipcRenderer.invoke(ipcChannels.audioMute),
    unmute: () => ipcRenderer.invoke(ipcChannels.audioUnmute),
    getStatus: () => ipcRenderer.invoke(ipcChannels.audioGetStatus),
    getMetrics: () => ipcRenderer.invoke(ipcChannels.audioGetMetrics),
    setInputDevice: (deviceId) => ipcRenderer.invoke(ipcChannels.audioSetInputDevice, deviceId),
    setVoice: (voiceId, installed) => ipcRenderer.invoke(ipcChannels.audioSetVoice, voiceId, installed),
    setQuality: (mode) => ipcRenderer.invoke(ipcChannels.audioSetQuality, mode),
    setNoiseSuppression: (enabled) => ipcRenderer.invoke(ipcChannels.audioSetNoiseSuppression, enabled),
    test: () => ipcRenderer.invoke(ipcChannels.audioTest),
    onStatus: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, status: AudioStatus) => callback(status);
      ipcRenderer.on(ipcChannels.audioStatus, listener);

      return () => ipcRenderer.off(ipcChannels.audioStatus, listener);
    }
  }
};

contextBridge.exposeInMainWorld("voxshift", api);
