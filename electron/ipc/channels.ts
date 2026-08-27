export const ipcChannels = {
  appInfo: "voxshift:app-info",
  diagnosticsSnapshot: "voxshift:diagnostics-snapshot",
  audioStart: "voxshift:audio:start",
  audioStop: "voxshift:audio:stop",
  audioMute: "voxshift:audio:mute",
  audioUnmute: "voxshift:audio:unmute",
  audioGetStatus: "voxshift:audio:get-status",
  audioGetMetrics: "voxshift:audio:get-metrics",
  audioSetInputDevice: "voxshift:audio:set-input-device",
  audioSetVoice: "voxshift:audio:set-voice",
  audioSetQuality: "voxshift:audio:set-quality",
  audioSetNoiseSuppression: "voxshift:audio:set-noise-suppression",
  audioTest: "voxshift:audio:test",
  audioGetDevices: "voxshift:audio:get-devices",
  audioStatus: "voxshift:audio:status",
  audioMetrics: "voxshift:audio:metrics",
  audioError: "voxshift:audio:error"
} as const;

export type IpcChannel = (typeof ipcChannels)[keyof typeof ipcChannels];
