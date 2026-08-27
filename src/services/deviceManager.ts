import type { MicrophoneDevice } from "../types/voxshift";

const selectedMicrophoneKey = "voxshift:selected-microphone-id";

function inferConnectionType(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("airpods") || normalized.includes("bluetooth")) {
    return "Bluetooth";
  }

  if (normalized.includes("usb") || normalized.includes("interface")) {
    return "USB";
  }

  if (normalized.includes("webcam") || normalized.includes("camera")) {
    return "Camera";
  }

  if (normalized.includes("macbook") || normalized.includes("built-in") || normalized.includes("internal")) {
    return "Built-in";
  }

  return "System";
}

export function getStoredMicrophoneId() {
  return window.localStorage.getItem(selectedMicrophoneKey);
}

export function storeMicrophoneId(deviceId: string) {
  window.localStorage.setItem(selectedMicrophoneKey, deviceId);
}

export async function requestMicrophoneDeviceLabels() {
  await enumerateMicrophones(getStoredMicrophoneId());
}

export async function enumerateMicrophones(selectedDeviceId: string | null): Promise<MicrophoneDevice[]> {
  if (!window.voxshift?.audio.getDevices) {
    throw new Error("Native audio device enumeration is not available.");
  }

  const devices = await window.voxshift.audio.getDevices();

  return devices.map((device) => ({
    id: device.id,
    groupId: device.id,
    label: device.name,
    inputChannels: `${device.input_channels}`,
    sampleRate: `${device.preferred_sample_rate_hz} Hz`,
    connectionType: inferConnectionType(device.name),
    status: device.id === selectedDeviceId ? "selected" : "available"
  }));
}
