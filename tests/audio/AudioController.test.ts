import { describe, expect, it, vi } from "vitest";
import { AudioController } from "../../electron/audio/AudioController";

describe("AudioController backend state machine", () => {
  it("refuses to start without a selected physical microphone", async () => {
    const controller = new AudioController();

    const result = await controller.start();

    expect(result.ok).toBe(false);
    expect(result.status.state).toBe("DEVICE_ERROR");
    expect(result.status.live).toBe(false);
    expect(result.status.muted).toBe(true);
    expect(result.status.rawBypassBlocked).toBe(true);
  });

  it("refuses to load a voice without an installed licensed model", async () => {
    const controller = new AudioController();

    const result = await controller.setVoice("builtin-af-natural-01", false);

    expect(result.ok).toBe(false);
    expect(result.status.state).toBe("VOICE_ERROR");
    expect(result.status.voiceId).toBeNull();
    expect(result.status.muted).toBe(true);
  });

  it("mutes the native output gate through backend state", () => {
    const controller = new AudioController();

    const result = controller.mute();

    expect(result.ok).toBe(true);
    expect(result.status.state).toBe("MUTED");
    expect(result.status.live).toBe(false);
    expect(result.status.muted).toBe(true);
  });

  it("validates microphone identifiers before accepting backend selection", () => {
    const controller = new AudioController();

    const result = controller.setInputDevice("");

    expect(result.ok).toBe(false);
    expect(result.status.state).toBe("DEVICE_ERROR");
    expect(result.status.inputDeviceId).toBeNull();
  });

  it("starts native capture before failing safely on missing voice model", async () => {
    const captureWorker = { killed: false, kill: vi.fn() };
    const nativeBridge = {
      startCaptureWorker: vi.fn().mockResolvedValue(captureWorker),
      stopCaptureWorker: vi.fn(),
      runCaptureTest: vi.fn()
    };
    const controller = new AudioController(nativeBridge as never);

    controller.setInputDevice("native-device-1");
    const result = await controller.start();

    expect(nativeBridge.startCaptureWorker).toHaveBeenCalledWith(
      "native-device-1",
      expect.any(Function),
      expect.any(Function)
    );
    expect(nativeBridge.stopCaptureWorker).toHaveBeenCalledWith(captureWorker);
    expect(result.ok).toBe(false);
    expect(result.status.state).toBe("VOICE_ERROR");
    expect(result.status.live).toBe(false);
    expect(result.status.muted).toBe(true);
  });
});
