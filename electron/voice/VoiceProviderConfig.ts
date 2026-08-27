import type { ResembleLiveVoiceEngineOptions } from "./ResembleLiveVoiceEngine.js";

export function loadResembleVoiceProviderConfig(): ResembleLiveVoiceEngineOptions | null {
  const host = process.env.VOICE_PROVIDER_HOST;
  const apiKey = process.env.VOICE_PROVIDER_API_KEY;
  const americanFemaleNatural = process.env.VOICE_PROVIDER_AMERICAN_FEMALE_NATURAL_ID;

  if (!host || !apiKey || !americanFemaleNatural) {
    return null;
  }

  return {
    host,
    apiKey,
    basicUser: process.env.VOICE_PROVIDER_BASIC_USER,
    basicPass: process.env.VOICE_PROVIDER_BASIC_PASS,
    voiceMap: {
      "builtin-af-natural-01": americanFemaleNatural
    }
  };
}
