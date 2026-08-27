export type NavigationItem =
  | "home"
  | "voices"
  | "microphone"
  | "call-mode"
  | "settings"
  | "diagnostics";

export type VoiceCategory = "American Female" | "American Male" | "Custom" | "Favorites";

export type VoiceLocation = "Local" | "Cloud" | "Downloadable";

export type VoiceProfile = {
  id: string;
  name: string;
  accent: "American English";
  language: "English - United States";
  style: string;
  category: Exclude<VoiceCategory, "Favorites">;
  quality: number;
  estimatedLatencyMs: number;
  location: VoiceLocation;
  license: string;
  engine: string;
  version: string;
  favorite: boolean;
  installed: boolean;
};

export type ThemeMode = "dark" | "light";

export type DeviceStatus = "selected" | "available" | "disconnected";
