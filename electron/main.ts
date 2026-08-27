import { app, BrowserWindow, globalShortcut, ipcMain, nativeTheme } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AudioController } from "./audio/AudioController.js";
import { NativeAudioBridge } from "./audio/NativeAudioBridge.js";
import { ipcChannels } from "./ipc/channels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nativeAudioBridge = new NativeAudioBridge();
let mainWindow: BrowserWindow | null = null;
const audioController = new AudioController(nativeAudioBridge);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1040,
    minHeight: 720,
    title: "VOXSHIFT",
    backgroundColor: "#090b10",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  nativeTheme.themeSource = "system";
  createWindow();

  const accelerator = process.platform === "darwin" ? "Command+Shift+M" : "Control+Shift+M";
  globalShortcut.register(accelerator, () => {
    audioController.mute("Emergency mute shortcut engaged. Virtual microphone output is silence.");
    mainWindow?.webContents.send("voxshift:mute-state", { muted: true });
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle(ipcChannels.appInfo, () => ({
  version: app.getVersion(),
  platform: process.platform
}));

ipcMain.handle(ipcChannels.diagnosticsSnapshot, () => ({
  audioEngine: audioController.getStatus().state,
  virtualMicrophone: "not-installed",
  safetyGate: audioController.getStatus().muted ? "muted" : "ready"
}));

audioController.onStatus((status) => {
  mainWindow?.webContents.send(ipcChannels.audioStatus, status);
});

ipcMain.handle(ipcChannels.audioStart, () => audioController.start());
ipcMain.handle(ipcChannels.audioStop, () => audioController.stop());
ipcMain.handle(ipcChannels.audioMute, () => audioController.mute());
ipcMain.handle(ipcChannels.audioUnmute, () => audioController.unmute());
ipcMain.handle(ipcChannels.audioGetStatus, () => audioController.getStatus());
ipcMain.handle(ipcChannels.audioGetMetrics, () => audioController.getMetrics());
ipcMain.handle(ipcChannels.audioGetDevices, () => nativeAudioBridge.enumerateDevices());
ipcMain.handle(ipcChannels.audioSetInputDevice, (_event, deviceId: unknown) => audioController.setInputDevice(deviceId));
ipcMain.handle(ipcChannels.audioSetVoice, (_event, voiceId: unknown, installed: unknown) =>
  audioController.setVoice(voiceId, installed)
);
ipcMain.handle(ipcChannels.audioSetQuality, (_event, mode: unknown) => audioController.setProcessingMode(mode));
ipcMain.handle(ipcChannels.audioSetNoiseSuppression, (_event, enabled: unknown) =>
  audioController.setNoiseSuppression(enabled)
);
ipcMain.handle(ipcChannels.audioTest, () => audioController.test());
