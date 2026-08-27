import { useCallback, useEffect, useMemo, useState } from "react";
import {
  enumerateMicrophones,
  getStoredMicrophoneId,
  requestMicrophoneDeviceLabels,
  storeMicrophoneId
} from "../services/deviceManager";
import type { MicrophoneDevice } from "../types/voxshift";

export function useMicrophoneDevices() {
  const [devices, setDevices] = useState<MicrophoneDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(() => getStoredMicrophoneId());
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextDevices = await enumerateMicrophones(selectedDeviceId);
      setDevices(nextDevices);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to enumerate microphones.");
    } finally {
      setLoading(false);
    }
  }, [selectedDeviceId]);

  const requestAccess = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await requestMicrophoneDeviceLabels();
      setPermissionGranted(true);
      const nextDevices = await enumerateMicrophones(selectedDeviceId);
      setDevices(nextDevices);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Microphone permission was not granted.");
    } finally {
      setLoading(false);
    }
  }, [selectedDeviceId]);

  const selectDevice = useCallback((deviceId: string) => {
    storeMicrophoneId(deviceId);
    setSelectedDeviceId(deviceId);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) {
      return undefined;
    }

    const handleDeviceChange = () => {
      void refresh();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [refresh]);

  const selectedDevice = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) ?? null,
    [devices, selectedDeviceId]
  );

  const selectedDeviceDisconnected = Boolean(selectedDeviceId && devices.length > 0 && !selectedDevice);

  return {
    devices,
    selectedDevice,
    selectedDeviceDisconnected,
    permissionGranted,
    error,
    loading,
    refresh,
    requestAccess,
    selectDevice
  };
}
