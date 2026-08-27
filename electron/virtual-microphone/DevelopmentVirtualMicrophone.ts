import type { PcmAudioFrame } from "../voice/IVoiceConversionEngine.js";
import {
  type IVirtualMicrophone,
  type VirtualMicrophoneStatus,
  virtualMicrophoneDeviceName
} from "./IVirtualMicrophone.js";

export class DevelopmentVirtualMicrophone implements IVirtualMicrophone {
  private running = false;
  private framesWritten = 0;

  async initialize() {
    this.running = false;
  }

  async install() {
    return this.status("Development sink ready. This is not an OS microphone.");
  }

  async uninstall() {
    this.running = false;
    this.framesWritten = 0;
    return this.status("Development sink reset.");
  }

  async start() {
    this.running = true;
    return this.status("Development virtual microphone sink started.");
  }

  async stop() {
    this.running = false;
    return this.status("Development virtual microphone sink stopped.");
  }

  async writeAudioFrame(frame: PcmAudioFrame) {
    if (!this.running) {
      throw new Error("Development virtual microphone sink is not running.");
    }

    if (frame.pcm16.length === 0) {
      throw new Error("Refusing to write an empty PCM frame.");
    }

    this.framesWritten += 1;
  }

  async getStatus() {
    return this.status(`Development sink frames written: ${this.framesWritten}.`);
  }

  async isAvailable() {
    return this.running;
  }

  async repair() {
    return this.status("Development sink does not require repair.");
  }

  private status(message: string): VirtualMicrophoneStatus {
    return {
      deviceName: virtualMicrophoneDeviceName,
      state: this.running ? "RUNNING" : "STOPPED",
      osDetected: false,
      message
    };
  }
}
