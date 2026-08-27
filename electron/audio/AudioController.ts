export type AudioPipelineState =
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

export type ProcessingMode = "LOW_LATENCY" | "BALANCED" | "HIGH_QUALITY";

export type AudioStatus = {
  state: AudioPipelineState;
  live: boolean;
  muted: boolean;
  inputDeviceId: string | null;
  voiceId: string | null;
  virtualMicrophoneReady: boolean;
  rawBypassBlocked: true;
  message: string;
};

export type AudioMetrics = {
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

export type AudioCommandResult = {
  ok: boolean;
  status: AudioStatus;
  metrics: AudioMetrics;
  error?: string;
};

type StatusListener = (status: AudioStatus) => void;

const initialMetrics: AudioMetrics = {
  inputLevel: null,
  outputLevel: null,
  captureLatencyMs: null,
  queueLatencyMs: null,
  modelLatencyMs: null,
  postProcessingLatencyMs: null,
  outputLatencyMs: null,
  totalLatencyMs: null,
  cpuPercent: null,
  memoryMb: null,
  droppedFrames: 0,
  underruns: 0,
  overruns: 0
};

export class AudioController {
  private status: AudioStatus = {
    state: "STOPPED",
    live: false,
    muted: true,
    inputDeviceId: null,
    voiceId: null,
    virtualMicrophoneReady: false,
    rawBypassBlocked: true,
    message: "Native audio pipeline is stopped."
  };

  private metrics: AudioMetrics = { ...initialMetrics };
  private processingMode: ProcessingMode = "BALANCED";
  private noiseSuppressionEnabled = true;
  private readonly statusListeners = new Set<StatusListener>();

  onStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.getStatus());

    return () => {
      this.statusListeners.delete(listener);
    };
  }

  initialize(): AudioCommandResult {
    this.updateStatus({
      state: "STOPPED",
      live: false,
      muted: true,
      message: "Native engine bridge is not installed yet; output remains muted."
    });

    return this.result(false, "Native engine bridge is not installed yet.");
  }

  start(): AudioCommandResult {
    this.updateStatus({
      state: "INITIALIZING",
      live: false,
      muted: true,
      message: "Validating microphone, voice engine, and virtual microphone."
    });

    const missingPrerequisite = this.findMissingStartPrerequisite();

    if (missingPrerequisite) {
      this.updateStatus({
        state: missingPrerequisite.state,
        live: false,
        muted: true,
        message: missingPrerequisite.message
      });

      return this.result(false, missingPrerequisite.message);
    }

    this.updateStatus({
      state: "RUNNING",
      live: true,
      muted: false,
      message: "Native audio pipeline is running."
    });

    return this.result(true);
  }

  stop(): AudioCommandResult {
    this.metrics = { ...initialMetrics };
    this.updateStatus({
      state: "STOPPED",
      live: false,
      muted: true,
      message: "Audio pipeline stopped. Virtual microphone output is silence."
    });

    return this.result(true);
  }

  pause(): AudioCommandResult {
    return this.mute("Audio pipeline paused. Virtual microphone output is silence.");
  }

  resume(): AudioCommandResult {
    if (this.status.state !== "RUNNING" && this.status.state !== "MUTED") {
      return this.result(false, "Cannot resume because the pipeline is not running.");
    }

    return this.unmute();
  }

  setInputDevice(deviceId: unknown): AudioCommandResult {
    if (typeof deviceId !== "string" || deviceId.trim().length === 0) {
      this.updateStatus({
        state: "DEVICE_ERROR",
        live: false,
        muted: true,
        message: "Invalid microphone device identifier."
      });

      return this.result(false, "Invalid microphone device identifier.");
    }

    this.updateStatus({
      inputDeviceId: deviceId,
      live: false,
      muted: true,
      state: this.status.state === "RUNNING" ? "MUTED" : this.status.state,
      message: "Selected microphone recorded in backend controller. Native capture opens during start."
    });

    return this.result(true);
  }

  setVoice(voiceId: unknown, installed: unknown): AudioCommandResult {
    if (typeof voiceId !== "string" || voiceId.trim().length === 0) {
      this.updateStatus({
        state: "VOICE_ERROR",
        live: false,
        muted: true,
        message: "Invalid voice identifier."
      });

      return this.result(false, "Invalid voice identifier.");
    }

    if (installed !== true) {
      this.updateStatus({
        state: "VOICE_ERROR",
        live: false,
        muted: true,
        message: "Selected voice does not have an installed licensed real-time model."
      });

      return this.result(false, "Selected voice does not have an installed licensed real-time model.");
    }

    this.updateStatus({
      voiceId,
      live: false,
      muted: true,
      state: this.status.state === "RUNNING" ? "MUTED" : this.status.state,
      message: "Voice model selected. Native model warmup is required before running."
    });

    return this.result(true);
  }

  setProcessingMode(mode: unknown): AudioCommandResult {
    if (mode !== "LOW_LATENCY" && mode !== "BALANCED" && mode !== "HIGH_QUALITY") {
      return this.result(false, "Invalid processing mode.");
    }

    this.processingMode = mode;
    return this.result(true);
  }

  setNoiseSuppression(enabled: unknown): AudioCommandResult {
    if (typeof enabled !== "boolean") {
      return this.result(false, "Invalid noise suppression setting.");
    }

    this.noiseSuppressionEnabled = enabled;
    return this.result(true);
  }

  mute(message = "Native output gate muted. Virtual microphone output is silence."): AudioCommandResult {
    this.updateStatus({
      state: "MUTED",
      live: false,
      muted: true,
      message
    });

    return this.result(true);
  }

  unmute(): AudioCommandResult {
    if (this.status.state !== "RUNNING" && this.status.state !== "MUTED") {
      return this.result(false, "Cannot unmute because the verified native pipeline is not running.");
    }

    const missingPrerequisite = this.findMissingStartPrerequisite();

    if (missingPrerequisite) {
      this.updateStatus({
        state: missingPrerequisite.state,
        live: false,
        muted: true,
        message: missingPrerequisite.message
      });

      return this.result(false, missingPrerequisite.message);
    }

    this.updateStatus({
      state: "RUNNING",
      live: true,
      muted: false,
      message: "Native audio pipeline unmuted."
    });

    return this.result(true);
  }

  getStatus(): AudioStatus {
    return { ...this.status };
  }

  getMetrics(): AudioMetrics {
    return { ...this.metrics };
  }

  shutdown(): AudioCommandResult {
    return this.stop();
  }

  test(): AudioCommandResult {
    return this.result(false, "Audio test requires native capture, voice conversion, and virtual microphone support.");
  }

  getRuntimeConfiguration() {
    return {
      processingMode: this.processingMode,
      noiseSuppressionEnabled: this.noiseSuppressionEnabled
    };
  }

  private findMissingStartPrerequisite(): { state: AudioPipelineState; message: string } | null {
    if (!this.status.inputDeviceId) {
      return {
        state: "DEVICE_ERROR",
        message: "No physical microphone has been selected by the backend controller."
      };
    }

    if (!this.status.voiceId) {
      return {
        state: "VOICE_ERROR",
        message: "No installed real-time voice model has been loaded."
      };
    }

    if (!this.status.virtualMicrophoneReady) {
      return {
        state: "DRIVER_ERROR",
        message: "VOXSHIFT Virtual Microphone is not installed or running."
      };
    }

    return null;
  }

  private result(ok: boolean, error?: string): AudioCommandResult {
    return {
      ok,
      status: this.getStatus(),
      metrics: this.getMetrics(),
      error
    };
  }

  private updateStatus(nextStatus: Partial<AudioStatus>) {
    this.status = {
      ...this.status,
      ...nextStatus,
      rawBypassBlocked: true
    };

    for (const listener of this.statusListeners) {
      listener(this.getStatus());
    }
  }
}
