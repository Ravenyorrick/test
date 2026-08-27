import { describe, expect, it } from "vitest";
import { DevelopmentVirtualMicrophone } from "../../electron/virtual-microphone/DevelopmentVirtualMicrophone";

describe("DevelopmentVirtualMicrophone", () => {
  it("is explicit that it is not an OS microphone", async () => {
    const sink = new DevelopmentVirtualMicrophone();

    const status = await sink.getStatus();

    expect(status.osDetected).toBe(false);
    expect(status.message).toContain("Development");
  });

  it("accepts PCM frames only while running", async () => {
    const sink = new DevelopmentVirtualMicrophone();

    await expect(
      sink.writeAudioFrame({
        timestampMs: Date.now(),
        sampleRateHz: 48_000,
        channels: 1,
        pcm16: Buffer.from([1, 0, 2, 0])
      })
    ).rejects.toThrow("not running");

    await sink.start();
    await expect(
      sink.writeAudioFrame({
        timestampMs: Date.now(),
        sampleRateHz: 48_000,
        channels: 1,
        pcm16: Buffer.from([1, 0, 2, 0])
      })
    ).resolves.toBeUndefined();
  });
});
