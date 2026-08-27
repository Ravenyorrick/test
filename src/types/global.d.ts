type VoxshiftAppInfo = {
  version: string;
  platform: NodeJS.Platform;
};

type VoxshiftDiagnosticsSnapshot = {
  audioEngine: "not-initialized";
  virtualMicrophone: "not-installed";
  safetyGate: "muted";
};

type VoxshiftApi = {
  getAppInfo: () => Promise<VoxshiftAppInfo>;
  getDiagnosticsSnapshot: () => Promise<VoxshiftDiagnosticsSnapshot>;
  emergencyMute: () => Promise<{ muted: true }>;
};

declare global {
  interface Window {
    voxshift?: VoxshiftApi;
  }
}

export type { VoxshiftApi, VoxshiftAppInfo, VoxshiftDiagnosticsSnapshot };
