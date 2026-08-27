import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/App";

const stoppedStatus = {
  state: "STOPPED",
  live: false,
  muted: true,
  inputDeviceId: null,
  voiceId: null,
  virtualMicrophoneReady: false,
  rawBypassBlocked: true,
  message: "Native audio pipeline is stopped."
};

const emptyMetrics = {
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

const audioApiMock = {
  start: vi.fn(),
  stop: vi.fn(),
  mute: vi.fn(),
  unmute: vi.fn(),
  getStatus: vi.fn(),
  getMetrics: vi.fn(),
  getDevices: vi.fn(),
  setInputDevice: vi.fn(),
  setVoice: vi.fn(),
  setQuality: vi.fn(),
  setNoiseSuppression: vi.fn(),
  test: vi.fn(),
  onStatus: vi.fn()
};

beforeEach(() => {
  window.localStorage.clear();
  audioApiMock.start.mockResolvedValue({ ok: false, status: stoppedStatus, metrics: emptyMetrics });
  audioApiMock.stop.mockResolvedValue({ ok: true, status: stoppedStatus, metrics: emptyMetrics });
  audioApiMock.mute.mockResolvedValue({ ok: true, status: { ...stoppedStatus, state: "MUTED" }, metrics: emptyMetrics });
  audioApiMock.unmute.mockResolvedValue({ ok: false, status: stoppedStatus, metrics: emptyMetrics });
  audioApiMock.getStatus.mockResolvedValue(stoppedStatus);
  audioApiMock.getMetrics.mockResolvedValue(emptyMetrics);
  audioApiMock.getDevices.mockResolvedValue([]);
  audioApiMock.setInputDevice.mockResolvedValue({ ok: true, status: stoppedStatus, metrics: emptyMetrics });
  audioApiMock.setVoice.mockResolvedValue({ ok: false, status: { ...stoppedStatus, state: "VOICE_ERROR" }, metrics: emptyMetrics });
  audioApiMock.setQuality.mockResolvedValue({ ok: true, status: stoppedStatus, metrics: emptyMetrics });
  audioApiMock.setNoiseSuppression.mockResolvedValue({ ok: true, status: stoppedStatus, metrics: emptyMetrics });
  audioApiMock.test.mockResolvedValue({ ok: false, status: stoppedStatus, metrics: emptyMetrics });
  audioApiMock.onStatus.mockReturnValue(() => undefined);

  Object.defineProperty(window, "voxshift", {
    configurable: true,
    value: {
      getAppInfo: vi.fn().mockResolvedValue({ version: "0.1.0", platform: "linux" }),
      getDiagnosticsSnapshot: vi.fn().mockResolvedValue({
        audioEngine: "STOPPED",
        virtualMicrophone: "not-installed",
        safetyGate: "muted"
      }),
      audio: audioApiMock
    }
  });
});

describe("VOXSHIFT UI shell", () => {
  it("shows primary safety and audio status on the home screen", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "VOXSHIFT" })).toBeInTheDocument();
    expect(screen.getByText("No microphone selected")).toBeInTheDocument();
    expect(screen.getByText("STOPPED")).toBeInTheDocument();
    expect(screen.getByText("NOT READY")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "MUTE" })).toBeInTheDocument();
    expect(screen.getByText("Not measured")).toBeInTheDocument();
  });

  it("opens the voice library with American female and male categories", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Voices" }));

    expect(screen.getByRole("heading", { name: "Choose a licensed voice profile" })).toBeInTheDocument();
    expect(screen.getByText("American Female")).toBeInTheDocument();
    expect(screen.getByText("American Male")).toBeInTheDocument();
    expect(screen.getByText("Female Natural")).toBeInTheDocument();
    expect(screen.getByText("Male Professional")).toBeInTheDocument();
  });

  it("requires authorization language for custom voice creation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(screen.getByText("Create a voice profile")).toBeInTheDocument();
    expect(
      screen.getByLabelText("I confirm that I own this voice recording or have permission to use it.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Voice Profile" })).toBeDisabled();
  });

  it("enumerates and selects native audio input devices", async () => {
    audioApiMock.getDevices.mockResolvedValue([
      {
        id: "usb-mic-1",
        name: "USB Microphone",
        input_channels: 1,
        preferred_sample_rate_hz: 48000
      },
      {
        id: "interface-1",
        name: "External Audio Interface",
        input_channels: 2,
        preferred_sample_rate_hz: 48000
      }
    ]);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Microphone" }));

    expect(await screen.findByText("USB Microphone")).toBeInTheDocument();
    expect(screen.getByText("External Audio Interface")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Select" })[0]);

    await waitFor(() => expect(window.localStorage.getItem("voxshift:selected-microphone-id")).toBe("usb-mic-1"));
    expect(audioApiMock.setInputDevice).toHaveBeenCalledWith("usb-mic-1");
  });
});
