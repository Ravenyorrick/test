type VoxshiftAppInfo = {
  version: string;
  platform: NodeJS.Platform;
};

type VoxshiftDiagnosticsSnapshot = {
  audioEngine: AudioPipelineState;
  virtualMicrophone: "not-installed";
  safetyGate: "muted" | "ready";
};

type AudioPipelineState =
  | "STOPPED"
  | "INITIALIZING"
  | "READY"
  | "RUNNING"
  | "MUTED"
  | "DEVICE_ERROR"
  | "VOICE_ERROR"
  | "DRIVER_ERROR"
  | "BUFFER_ERROR"
  | "PROCESSING_TOO_SLOW";

type ProcessingMode = "LOW_LATENCY" | "BALANCED" | "HIGH_QUALITY";

type AudioStatus = {
  state: AudioPipelineState;
  live: boolean;
  muted: boolean;
  inputDeviceId: string | null;
  voiceId: string | null;
  virtualMicrophoneReady: boolean;
  rawBypassBlocked: true;
  message: string;
};

type AudioMetrics = {
  inputLevel: number | null;
  outputLevel: number | null;
  captureLatencyMs: number | null;
  queueLatencyMs: number | null;
  modelLatencyMs: number | null;
  postProcessingLatencyMs: number | null;
  outputLatencyMs: number | null;
  totalLatencyMs: number | null;
  cpuPercent: number | null;
  memoryMb: number | null;
  droppedFrames: number;
  underruns: number;
  overruns: number;
};

type AudioCommandResult = {
  ok: boolean;
  status: AudioStatus;
  metrics: AudioMetrics;
  error?: string;
};

type VoxshiftApi = {
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

declare global {
  interface Window {
    voxshift?: VoxshiftApi;
  }
}

export type {
  AudioCommandResult,
  AudioMetrics,
  AudioPipelineState,
  AudioStatus,
  ProcessingMode,
  VoxshiftApi,
  VoxshiftAppInfo,
  VoxshiftDiagnosticsSnapshot
};
