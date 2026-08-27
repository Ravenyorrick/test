import { describe, expect, it } from "vitest";
import { AudioController } from "../../electron/audio/AudioController";

describe("AudioController backend state machine", () => {
  it("refuses to start without a selected physical microphone", () => {
    const controller = new AudioController();

    const result = controller.start();

    expect(result.ok).toBe(false);
    expect(result.status.state).toBe("DEVICE_ERROR");
    expect(result.status.live).toBe(false);
    expect(result.status.muted).toBe(true);
    expect(result.status.rawBypassBlocked).toBe(true);
  });

  it("refuses to load a voice without an installed licensed model", () => {
    const controller = new AudioController();

    const result = controller.setVoice("builtin-af-natural-01", false);

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
});
