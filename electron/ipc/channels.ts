export const ipcChannels = {
  appInfo: "voxshift:app-info",
  diagnosticsSnapshot: "voxshift:diagnostics-snapshot",
  emergencyMute: "voxshift:emergency-mute"
} as const;

export type IpcChannel = (typeof ipcChannels)[keyof typeof ipcChannels];
