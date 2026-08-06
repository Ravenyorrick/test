import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserService } from "@/browser/browserService";
import { AppDatabase } from "@/database/database";
import { LeadRepository, LogRepository, SessionRepository } from "@/database/repositories";
import { ExportService } from "@/exports/exportService";
import { ExtractionRunner } from "@/automation/extractionRunner";
import type { ExportRequest } from "@/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

let mainWindow: BrowserWindow;
let runner: ExtractionRunner;
let sessions: SessionRepository;
let leads: LeadRepository;
let exporter: ExportService;
let browser: BrowserService;

async function createWindow(): Promise<void> {
  const databasePath = path.join(app.getPath("userData"), "apollo-lead-extractor.sqlite");
  const database = new AppDatabase(databasePath);
  sessions = new SessionRepository(database.db);
  leads = new LeadRepository(database.db);
  const logs = new LogRepository(database.db);
  browser = new BrowserService();
  exporter = new ExportService(leads, databasePath);
  runner = new ExtractionRunner(browser, sessions, leads, logs);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    await mainWindow.loadFile(path.join(__dirname, "../ui/index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", async () => {
  await browser?.close();
});

ipcMain.handle("sessions:list", () => sessions.list());
ipcMain.handle("leads:list", (_event, sessionId: string) => leads.list(sessionId));
ipcMain.handle("extract:start", async (_event, url: string) => {
  return runner.run(url, (update) => mainWindow.webContents.send("extract:update", update));
});
ipcMain.handle("extract:cancel", () => runner.cancel());
ipcMain.handle("export:save", async (_event, request: Omit<ExportRequest, "outputPath">) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: `Export ${request.format.toUpperCase()}`,
    defaultPath: `apollo-leads.${request.format === "xlsx" ? "xlsx" : request.format}`
  });
  if (result.canceled || !result.filePath) return undefined;
  return exporter.export({ ...request, outputPath: result.filePath });
});
