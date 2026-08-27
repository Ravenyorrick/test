import type { PcmAudioFrame } from "../voice/IVoiceConversionEngine.js";

export type VirtualMicrophoneState =
  | "NOT_INSTALLED"
  | "INSTALLED"
  | "RUNNING"
  | "STOPPED"
  | "ERROR"
  | "OS_VALIDATION_REQUIRED";

export type VirtualMicrophoneStatus = {
  deviceName: "VOXSHIFT Virtual Microphone";
  state: VirtualMicrophoneState;
  osDetected: boolean;
  message: string;
};

export interface IVirtualMicrophone {
  initialize(): Promise<void>;
  install(): Promise<VirtualMicrophoneStatus>;
  uninstall(): Promise<VirtualMicrophoneStatus>;
  start(): Promise<VirtualMicrophoneStatus>;
  stop(): Promise<VirtualMicrophoneStatus>;
  writeAudioFrame(frame: PcmAudioFrame): Promise<void>;
  getStatus(): Promise<VirtualMicrophoneStatus>;
  isAvailable(): Promise<boolean>;
  repair(): Promise<VirtualMicrophoneStatus>;
}

export const virtualMicrophoneDeviceName = "VOXSHIFT Virtual Microphone" as const;
