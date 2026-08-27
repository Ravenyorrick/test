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
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone permissions are not available in this environment.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  });

  stream.getTracks().forEach((track) => track.stop());
}

export async function enumerateMicrophones(selectedDeviceId: string | null): Promise<MicrophoneDevice[]> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    throw new Error("Media device enumeration is not available in this environment.");
  }

  const devices = await navigator.mediaDevices.enumerateDevices();

  return devices
    .filter((device) => device.kind === "audioinput")
    .map((device, index) => ({
      id: device.deviceId,
      groupId: device.groupId,
      label: device.label || `Microphone ${index + 1}`,
      inputChannels: "Reported by native audio engine in Phase 3",
      sampleRate: "Reported by native audio engine in Phase 3",
      connectionType: inferConnectionType(device.label),
      status: device.deviceId === selectedDeviceId ? "selected" : "available"
    }));
}
