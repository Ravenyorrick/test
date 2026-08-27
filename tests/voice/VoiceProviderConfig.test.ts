import { afterEach, describe, expect, it } from "vitest";
import { loadResembleVoiceProviderConfig } from "../../electron/voice/VoiceProviderConfig";

const envKeys = [
  "VOICE_PROVIDER_HOST",
  "VOICE_PROVIDER_API_KEY",
  "VOICE_PROVIDER_AMERICAN_FEMALE_NATURAL_ID",
  "VOICE_PROVIDER_BASIC_USER",
  "VOICE_PROVIDER_BASIC_PASS"
];

afterEach(() => {
  for (const key of envKeys) {
    delete process.env[key];
  }
});

describe("loadResembleVoiceProviderConfig", () => {
  it("returns null until required backend-only credentials are present", () => {
    delete process.env.VOICE_PROVIDER_API_KEY;

    expect(loadResembleVoiceProviderConfig()).toBeNull();
  });

  it("maps American Female Natural to configured provider voice id", () => {
    process.env.VOICE_PROVIDER_HOST = "live-vc.example.com";
    process.env.VOICE_PROVIDER_API_KEY = "test-key";
    process.env.VOICE_PROVIDER_AMERICAN_FEMALE_NATURAL_ID = "provider-female-natural";

    expect(loadResembleVoiceProviderConfig()).toMatchObject({
      host: "live-vc.example.com",
      apiKey: "test-key",
      voiceMap: {
        "builtin-af-natural-01": "provider-female-natural"
      }
    });
  });
});
