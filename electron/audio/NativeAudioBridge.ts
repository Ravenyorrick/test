import { ChildProcessWithoutNullStreams, execFile, spawn } from "node:child_process";
import readline from "node:readline";
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

export type NativeCaptureTestReport = {
  device_id: string;
  duration_ms: number;
  rms: number;
  peak: number;
  frames_captured: number;
  dropped_frames: number;
  speech_detected: boolean;
};

export type NativeCaptureWorkerMetrics = {
  rms: number;
  peak: number;
  frames_captured: number;
  dropped_frames: number;
  device_errors: number;
};

type NativeWorkerEvent =
  | { type: "started"; device_id: string }
  | ({ type: "metrics" } & NativeCaptureWorkerMetrics)
  | { type: "error"; error: string };

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

  async runCaptureTest(deviceId: string, durationMs = 1_000): Promise<NativeCaptureTestReport> {
    return this.runNativeCommand<NativeCaptureTestReport>([
      "capture-test",
      "--device",
      deviceId,
      "--duration-ms",
      `${durationMs}`
    ]);
  }

  async startCaptureWorker(
    deviceId: string,
    onMetrics: (metrics: NativeCaptureWorkerMetrics) => void,
    onError: (error: Error) => void
  ): Promise<ChildProcessWithoutNullStreams> {
    const child = spawn(this.resolveExecutablePath(), ["capture-worker", "--device", deviceId], {
      windowsHide: true
    });
    const lines = readline.createInterface({ input: child.stdout });

    return new Promise((resolve, reject) => {
      let started = false;

      const fail = (error: Error) => {
        if (!started) {
          reject(error);
          return;
        }

        onError(error);
      };

      lines.on("line", (line) => {
        try {
          const event = JSON.parse(line) as NativeWorkerEvent;

          if (event.type === "started") {
            started = true;
            resolve(child);
            return;
          }

          if (event.type === "metrics") {
            onMetrics(event);
            return;
          }

          fail(new Error(event.error));
        } catch (error) {
          fail(error instanceof Error ? error : new Error("Invalid native capture worker output."));
        }
      });

      child.stderr.on("data", (chunk) => {
        fail(new Error(String(chunk)));
      });

      child.on("error", fail);
      child.on("exit", (code) => {
        if (!started) {
          reject(new Error(`Native capture worker exited before start with code ${code ?? "unknown"}.`));
          return;
        }

        if (code !== 0 && code !== null) {
          onError(new Error(`Native capture worker exited with code ${code}.`));
        }
      });
    });
  }

  stopCaptureWorker(child: ChildProcessWithoutNullStreams | null) {
    if (!child || child.killed) {
      return;
    }

    child.kill();
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
