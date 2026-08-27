import { useCallback, useEffect, useState } from "react";
import type { AudioCommandResult, AudioMetrics, AudioStatus } from "../types/global";

const stoppedStatus: AudioStatus = {
  state: "STOPPED",
  live: false,
  muted: true,
  inputDeviceId: null,
  voiceId: null,
  virtualMicrophoneReady: false,
  rawBypassBlocked: true,
  message: "Audio backend is not connected."
};

const emptyMetrics: AudioMetrics = {
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

export function useAudioController() {
  const [status, setStatus] = useState<AudioStatus>(stoppedStatus);
  const [metrics, setMetrics] = useState<AudioMetrics>(emptyMetrics);
  const [lastError, setLastError] = useState<string | null>(null);

  const applyResult = useCallback((result: AudioCommandResult) => {
    setStatus(result.status);
    setMetrics(result.metrics);
    setLastError(result.ok ? null : result.error ?? result.status.message);
    return result;
  }, []);

  useEffect(() => {
    let mounted = true;

    void window.voxshift?.audio.getStatus().then((nextStatus) => {
      if (mounted) {
        setStatus(nextStatus);
      }
    });

    void window.voxshift?.audio.getMetrics().then((nextMetrics) => {
      if (mounted) {
        setMetrics(nextMetrics);
      }
    });

    const unsubscribe = window.voxshift?.audio.onStatus((nextStatus) => {
      setStatus(nextStatus);
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  return {
    status,
    metrics,
    lastError,
    start: () => window.voxshift?.audio.start().then(applyResult),
    stop: () => window.voxshift?.audio.stop().then(applyResult),
    mute: () => window.voxshift?.audio.mute().then(applyResult),
    unmute: () => window.voxshift?.audio.unmute().then(applyResult),
    setInputDevice: (deviceId: string) => window.voxshift?.audio.setInputDevice(deviceId).then(applyResult),
    setVoice: (voiceId: string, installed: boolean) => window.voxshift?.audio.setVoice(voiceId, installed).then(applyResult),
    test: () => window.voxshift?.audio.test().then(applyResult)
  };
}
