export type VoiceEngineStatus =
  | "UNINITIALIZED"
  | "INITIALIZED"
  | "AUTHENTICATED"
  | "VOICE_LOADED"
  | "WARMING"
  | "READY"
  | "STREAMING"
  | "ERROR"
  | "SHUTDOWN";

export type VoiceInfo = {
  id: string;
  displayName: string;
  providerVoiceId: string;
  language: string;
  accent: string;
};

export type PcmAudioFrame = {
  timestampMs: number;
  sampleRateHz: number;
  channels: 1;
  pcm16: Buffer;
};

export type ConvertedAudioFrame = PcmAudioFrame & {
  latencyMs: number | null;
  providerLatencyMs: number | null;
};

export interface IVoiceConversionEngine {
  initialize(): Promise<void>;
  authenticate(): Promise<void>;
  listVoices(): Promise<VoiceInfo[]>;
  loadVoice(voiceId: string): Promise<void>;
  warmup(): Promise<void>;
  processAudioFrame(frame: PcmAudioFrame): Promise<ConvertedAudioFrame | null>;
  flush(): Promise<void>;
  getLatency(): number | null;
  getStatus(): VoiceEngineStatus;
  shutdown(): Promise<void>;
}
