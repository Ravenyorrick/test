import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { PcmAudioFrame } from "../voice/IVoiceConversionEngine.js";
import {
  type IVirtualMicrophone,
  type VirtualMicrophoneStatus,
  virtualMicrophoneDeviceName
} from "./IVirtualMicrophone.js";

const execFileAsync = promisify(execFile);

export class MacVirtualMicrophone implements IVirtualMicrophone {
  async initialize() {
    await this.getStatus();
  }

  async install() {
    return this.runComponentScript("install");
  }

  async uninstall() {
    return this.runComponentScript("uninstall");
  }

  async start() {
    return this.getStatus();
  }

  async stop() {
    return this.getStatus();
  }

  async writeAudioFrame(_frame: PcmAudioFrame) {
    throw new Error("macOS virtual microphone PCM writer requires the signed AudioServerPlugIn/DriverKit endpoint.");
  }

  async getStatus(): Promise<VirtualMicrophoneStatus> {
    if (process.platform !== "darwin") {
      return {
        deviceName: virtualMicrophoneDeviceName,
        state: "OS_VALIDATION_REQUIRED",
        osDetected: false,
        message: "macOS virtual microphone status requires macOS."
      };
    }

    try {
      const { stdout } = await execFileAsync("system_profiler", ["SPAudioDataType", "-json"], {
        timeout: 15_000
      });
      const detected = stdout.includes(virtualMicrophoneDeviceName);

      return {
        deviceName: virtualMicrophoneDeviceName,
        state: detected ? "INSTALLED" : "NOT_INSTALLED",
        osDetected: detected,
        message: detected
          ? "macOS system_profiler reports VOXSHIFT Virtual Microphone."
          : "macOS did not report VOXSHIFT Virtual Microphone."
      };
    } catch (error) {
      return {
        deviceName: virtualMicrophoneDeviceName,
        state: "ERROR",
        osDetected: false,
        message: error instanceof Error ? error.message : "macOS virtual microphone status check failed."
      };
    }
  }

  async isAvailable() {
    return (await this.getStatus()).osDetected;
  }

  async repair() {
    return this.runComponentScript("repair");
  }

  private async runComponentScript(action: "install" | "uninstall" | "repair") {
    if (process.platform !== "darwin") {
      return {
        deviceName: virtualMicrophoneDeviceName,
        state: "OS_VALIDATION_REQUIRED",
        osDetected: false,
        message: `${action} requires macOS audio component tooling on macOS.`
      } satisfies VirtualMicrophoneStatus;
    }

    throw new Error(`macOS audio component ${action} requires the signed VOXSHIFT virtual audio component.`);
  }
}
