import WebSocket from "ws";
import type {
  ConvertedAudioFrame,
  IVoiceConversionEngine,
  PcmAudioFrame,
  VoiceEngineStatus,
  VoiceInfo
} from "./IVoiceConversionEngine.js";

const apiVersion = "2.0.0";
const defaultChunkSamples = 5760;
const defaultSampleRate = 48_000;

type ResembleSessionMessage = {
  type: "session";
  data: {
    capabilities: {
      voices: string[];
      output_sample_rate: number;
    };
  };
};

type ResembleJsonMessage =
  | ResembleSessionMessage
  | { type: "voices"; data: { voices: string[] } }
  | { type: "warmup_complete"; data: Record<string, never> }
  | { type: "settings_updated"; data: Record<string, unknown> }
  | { type: "error"; data: { code: string; message: string } };

export type ResembleLiveVoiceEngineOptions = {
  host: string;
  apiKey: string;
  basicUser?: string;
  basicPass?: string;
  voiceMap: Record<string, string>;
};

export class ResembleLiveVoiceEngine implements IVoiceConversionEngine {
  private status: VoiceEngineStatus = "UNINITIALIZED";
  private ticket: string | null = null;
  private socket: WebSocket | null = null;
  private voices: VoiceInfo[] = [];
  private selectedProviderVoiceId: string | null = null;
  private outputSampleRateHz = defaultSampleRate;
  private latestLatencyMs: number | null = null;
  private pendingFrames: ConvertedAudioFrame[] = [];

  constructor(private readonly options: ResembleLiveVoiceEngineOptions) {}

  async initialize() {
    if (!this.options.host || !this.options.apiKey) {
      this.status = "ERROR";
      throw new Error("Resemble voice engine requires VOICE_PROVIDER_HOST and VOICE_PROVIDER_API_KEY.");
    }

    this.status = "INITIALIZED";
  }

  async authenticate() {
    this.ensureStatus("INITIALIZED");
    const headers: HeadersInit = {
      "X-Api-Key": this.options.apiKey,
      ...this.basicAuthHeader()
    };
    const response = await fetch(`https://${this.options.host}/api/auth/ticket`, {
      method: "POST",
      headers
    });

    if (!response.ok) {
      this.status = "ERROR";
      throw new Error(`Resemble authentication failed with HTTP ${response.status}.`);
    }

    const body = (await response.json()) as { ticket?: string };

    if (!body.ticket) {
      this.status = "ERROR";
      throw new Error("Resemble authentication response did not include a ticket.");
    }

    this.ticket = body.ticket;
    this.status = "AUTHENTICATED";
  }

  async listVoices() {
    if (this.voices.length > 0) {
      return [...this.voices];
    }

    await this.connect();
    this.socket?.send(JSON.stringify({ type: "get_voices" }));
    return [...this.voices];
  }

  async loadVoice(voiceId: string) {
    const providerVoiceId = this.options.voiceMap[voiceId];

    if (!providerVoiceId) {
      this.status = "ERROR";
      throw new Error(`No provider voice mapping configured for ${voiceId}.`);
    }

    await this.connect();
    this.selectedProviderVoiceId = providerVoiceId;
    this.socket?.send(
      JSON.stringify({
        type: "update_settings",
        data: {
          voice: providerVoiceId,
          client_input_sr: defaultSampleRate,
          output_sample_rate: defaultSampleRate,
          chunk_samples: defaultChunkSamples,
          vad: 2,
          vc_enabled: true
        }
      })
    );
    this.status = "VOICE_LOADED";
  }

  async warmup() {
    await this.connect();
    this.status = "WARMING";
    this.socket?.send(
      JSON.stringify({
        type: "stream_start",
        data: {
          chunk_samples: defaultChunkSamples,
          extra_convert_size: 32784
        }
      })
    );
  }

  async processAudioFrame(frame: PcmAudioFrame): Promise<ConvertedAudioFrame | null> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.status = "ERROR";
      throw new Error("Resemble voice engine socket is not open.");
    }

    if (!this.selectedProviderVoiceId) {
      this.status = "ERROR";
      throw new Error("No Resemble provider voice is loaded.");
    }

    const packet = Buffer.allocUnsafe(8 + frame.pcm16.length);
    packet.writeDoubleLE(frame.timestampMs, 0);
    frame.pcm16.copy(packet, 8);
    this.socket.send(packet);
    this.status = "STREAMING";

    return this.pendingFrames.shift() ?? null;
  }

  async flush() {
    this.socket?.send(JSON.stringify({ type: "stream_stop" }));
    this.pendingFrames = [];
  }

  getLatency() {
    return this.latestLatencyMs;
  }

  getStatus() {
    return this.status;
  }

  async shutdown() {
    await this.flush();
    this.socket?.close();
    this.socket = null;
    this.status = "SHUTDOWN";
  }

  private async connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    if (!this.ticket) {
      await this.authenticate();
    }

    const authPrefix =
      this.options.basicUser && this.options.basicPass
        ? `${encodeURIComponent(this.options.basicUser)}:${encodeURIComponent(this.options.basicPass)}@`
        : "";
    const socketUrl = `wss://${authPrefix}${this.options.host}/ws?ticket=${encodeURIComponent(
      this.ticket ?? ""
    )}&api_version=${apiVersion}`;

    this.socket = await new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(socketUrl);

      socket.once("open", () => resolve(socket));
      socket.once("error", reject);
      socket.on("message", (data) => this.handleMessage(data));
      socket.on("close", () => {
        if (this.status !== "SHUTDOWN") {
          this.status = "ERROR";
        }
      });
    });
  }

  private handleMessage(data: WebSocket.RawData) {
    if (Buffer.isBuffer(data)) {
      this.handleAudioResponse(data);
      return;
    }

    const message = JSON.parse(data.toString()) as ResembleJsonMessage;

    if (message.type === "session") {
      this.outputSampleRateHz = message.data.capabilities.output_sample_rate;
      this.voices = message.data.capabilities.voices.map((providerVoiceId) => ({
        id: providerVoiceId,
        displayName: providerVoiceId,
        providerVoiceId,
        language: "English - United States",
        accent: "Provider configured"
      }));
      return;
    }

    if (message.type === "voices") {
      this.voices = message.data.voices.map((providerVoiceId) => ({
        id: providerVoiceId,
        displayName: providerVoiceId,
        providerVoiceId,
        language: "English - United States",
        accent: "Provider configured"
      }));
      return;
    }

    if (message.type === "warmup_complete") {
      this.status = "READY";
      return;
    }

    if (message.type === "error") {
      this.status = "ERROR";
      throw new Error(`${message.data.code}: ${message.data.message}`);
    }
  }

  private handleAudioResponse(data: Buffer) {
    if (data.length < 4) {
      return;
    }

    const headerLength = data.readUInt32LE(0);
    const headerStart = 4;
    const audioStart = headerStart + headerLength;

    if (data.length < audioStart) {
      return;
    }

    const header = JSON.parse(data.subarray(headerStart, audioStart).toString()) as {
      data?: { timestamp?: number; latency?: { total?: number; inference?: number } };
    };
    const providerLatencyMs = header.data?.latency?.total ?? null;
    const timestampMs = header.data?.timestamp ?? Date.now();
    const latencyMs = Date.now() - timestampMs;

    this.latestLatencyMs = latencyMs;
    this.pendingFrames.push({
      timestampMs,
      sampleRateHz: this.outputSampleRateHz,
      channels: 1,
      pcm16: data.subarray(audioStart),
      latencyMs,
      providerLatencyMs
    });
  }

  private basicAuthHeader(): Record<string, string> {
    if (!this.options.basicUser || !this.options.basicPass) {
      return {};
    }

    const token = Buffer.from(`${this.options.basicUser}:${this.options.basicPass}`).toString("base64");
    return { Authorization: `Basic ${token}` };
  }

  private ensureStatus(expected: VoiceEngineStatus) {
    if (this.status !== expected) {
      throw new Error(`Expected voice engine status ${expected}; received ${this.status}.`);
    }
  }
}
