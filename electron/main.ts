import { app, BrowserWindow, globalShortcut, ipcMain, nativeTheme } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ipcChannels } from "./ipc/channels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let emergencyMuted = true;

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
    emergencyMuted = true;
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
  audioEngine: "not-initialized",
  virtualMicrophone: "not-installed",
  safetyGate: emergencyMuted ? "muted" : "muted"
}));

ipcMain.handle(ipcChannels.emergencyMute, () => {
  emergencyMuted = true;
  return { muted: true };
});
