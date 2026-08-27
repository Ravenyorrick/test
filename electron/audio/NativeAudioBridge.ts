import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type NativeAudioDeviceInfo = {
  id: string;
  name: string;
  input_channels: number;
  preferred_sample_rate_hz: number;
};

type NativeOkResponse<T> = {
  status: "ok";
  data: T;
};

type NativeErrorResponse = {
  status: "err";
  error: string;
};

type NativeResponse<T> = NativeOkResponse<T> | NativeErrorResponse;

export class NativeAudioBridge {
  async enumerateDevices(): Promise<NativeAudioDeviceInfo[]> {
    const response = await this.runNativeCommand<NativeAudioDeviceInfo[]>(["enumerate-devices"]);
    return response;
  }

  private async runNativeCommand<T>(args: string[]): Promise<T> {
    const executablePath = this.resolveExecutablePath();
    const { stdout } = await execFileAsync(executablePath, args, {
      timeout: 10_000,
      windowsHide: true
    });
    const parsed = JSON.parse(stdout) as NativeResponse<T>;

    if (parsed.status === "err") {
      throw new Error(parsed.error);
    }

    return parsed.data;
  }

  private resolveExecutablePath() {
    const executableName = process.platform === "win32" ? "voxshift-audio-engine.exe" : "voxshift-audio-engine";
    const developmentPath = path.join(process.cwd(), "target", "debug", executableName);
    const productionPath = path.join(process.resourcesPath ?? process.cwd(), "native", executableName);

    if (fs.existsSync(developmentPath)) {
      return developmentPath;
    }

    if (fs.existsSync(productionPath)) {
      return productionPath;
    }

    throw new Error("Native audio engine binary is not built or packaged.");
  }
}
