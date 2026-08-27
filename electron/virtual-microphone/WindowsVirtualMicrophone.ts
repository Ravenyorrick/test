import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { PcmAudioFrame } from "../voice/IVoiceConversionEngine.js";
import {
  type IVirtualMicrophone,
  type VirtualMicrophoneStatus,
  virtualMicrophoneDeviceName
} from "./IVirtualMicrophone.js";

const execFileAsync = promisify(execFile);

export class WindowsVirtualMicrophone implements IVirtualMicrophone {
  async initialize() {
    await this.getStatus();
  }

  async install() {
    return this.runDriverScript("install");
  }

  async uninstall() {
    return this.runDriverScript("uninstall");
  }

  async start() {
    return this.getStatus();
  }

  async stop() {
    return this.getStatus();
  }

  async writeAudioFrame(_frame: PcmAudioFrame) {
    throw new Error("Windows virtual microphone PCM writer requires the signed driver service endpoint.");
  }

  async getStatus(): Promise<VirtualMicrophoneStatus> {
    if (process.platform !== "win32") {
      return {
        deviceName: virtualMicrophoneDeviceName,
        state: "OS_VALIDATION_REQUIRED",
        osDetected: false,
        message: "Windows virtual microphone status requires Windows."
      };
    }

    const command = [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      `Get-PnpDevice -Class AudioEndpoint | Where-Object { $_.FriendlyName -eq '${virtualMicrophoneDeviceName}' } | Select-Object -First 1 -ExpandProperty Status`
    ];

    try {
      const { stdout } = await execFileAsync("powershell.exe", command, { timeout: 10_000, windowsHide: true });
      const status = stdout.trim();

      return {
        deviceName: virtualMicrophoneDeviceName,
        state: status ? "INSTALLED" : "NOT_INSTALLED",
        osDetected: Boolean(status),
        message: status ? `Windows reports endpoint status: ${status}` : "Windows did not report the virtual microphone."
      };
    } catch (error) {
      return {
        deviceName: virtualMicrophoneDeviceName,
        state: "ERROR",
        osDetected: false,
        message: error instanceof Error ? error.message : "Windows virtual microphone status check failed."
      };
    }
  }

  async isAvailable() {
    return (await this.getStatus()).osDetected;
  }

  async repair() {
    return this.runDriverScript("repair");
  }

  private async runDriverScript(action: "install" | "uninstall" | "repair") {
    if (process.platform !== "win32") {
      return {
        deviceName: virtualMicrophoneDeviceName,
        state: "OS_VALIDATION_REQUIRED",
        osDetected: false,
        message: `${action} requires Windows driver tooling on Windows.`
      } satisfies VirtualMicrophoneStatus;
    }

    throw new Error(`Windows driver ${action} requires the signed VOXSHIFT driver package.`);
  }
}
