import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { BrowserService } from "@/browser/browserService";
import { AppDatabase } from "@/database/database";
import { LeadRepository, LogRepository, SessionRepository } from "@/database/repositories";
import { ExportService } from "@/exports/exportService";
import { ExtractionRunner } from "@/automation/extractionRunner";
import { ApiExtractionRunner } from "@/automation/apiExtractionRunner";
import { InputValidator } from "@/services/validation";
import { safeErrorMessage } from "@/services/safeError";
import type { ExportRequest, ExtractionEvent } from "@/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const isSmokeTest = process.env.ELECTRON_SMOKE_TEST === "1";

let mainWindow: BrowserWindow;
let runner: ExtractionRunner;
let sessions: SessionRepository;
let leads: LeadRepository;
let exporter: ExportService;
let browser: BrowserService;
let apiRunner: ApiExtractionRunner;
const validator = new InputValidator();

process.on("uncaughtException", (error) => {
  sendFatal("Uncaught exception", error);
});

process.on("unhandledRejection", (reason) => {
  sendFatal("Unhandled rejection", reason);
});

async function createWindow(): Promise<void> {
  const databasePath = path.join(app.getPath("userData"), "apollo-lead-extractor.sqlite");
  const database = new AppDatabase(databasePath);
  sessions = new SessionRepository(database.db);
  leads = new LeadRepository(database.db);
  const logs = new LogRepository(database.db);
  browser = new BrowserService();
  exporter = new ExportService(leads, databasePath);
  runner = new ExtractionRunner(browser, sessions, leads, logs);
  apiRunner = new ApiExtractionRunner(sessions, leads, logs);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    show: !isSmokeTest,
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

  if (isSmokeTest) {
    setTimeout(() => app.quit(), 250);
  }
}

app.whenReady().then(createWindow).catch((error) => {
  sendFatal("Failed to create window", error);
  app.exit(1);
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", async () => {
  await browser?.close();
});

ipcMain.handle("app:config", () => ({
  environmentApiKeyAvailable: Boolean(process.env.APOLLO_API_KEY?.trim())
}));
ipcMain.handle("sessions:list", () => sessions.list());
ipcMain.handle("leads:list", (_event, sessionId: string) => {
  if (!sessionId) throw new Error("A session id is required.");
  return leads.list(sessionId);
});
ipcMain.handle("extract:start", async (_event, url: string, apiKey?: string, options?: { perPage?: number }) => {
  const urlValidation = validator.validateApolloPeopleUrl(url);
  if (!urlValidation.valid) throw new Error(urlValidation.message);

  const emit = (update: ExtractionEvent) => {
    if (!mainWindow.isDestroyed()) mainWindow.webContents.send("extract:update", update);
  };
  const resolvedApiKey = apiKey?.trim() || process.env.APOLLO_API_KEY?.trim();
  if (resolvedApiKey) {
    return apiRunner.run(url, resolvedApiKey, emit, options?.perPage);
  }
  return runner.run(url, emit);
});
ipcMain.handle("extract:cancel", () => {
  runner.cancel();
  apiRunner.cancel();
});
ipcMain.handle("export:save", async (_event, request: Omit<ExportRequest, "outputPath">) => {
  if (!request.sessionId) throw new Error("Choose a completed extraction before exporting.");
  if (!["csv", "xlsx", "json", "sqlite"].includes(request.format)) throw new Error("Unsupported export format.");
  const result = await dialog.showSaveDialog(mainWindow, {
    title: `Export ${request.format.toUpperCase()}`,
    defaultPath: `apollo-leads.${request.format === "xlsx" ? "xlsx" : request.format}`
  });
  if (result.canceled || !result.filePath) return undefined;
  return exporter.export({ ...request, outputPath: result.filePath });
});

function sendFatal(message: string, error: unknown): void {
  const detail = safeErrorMessage(error);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("app:fatal", { message, detail });
  }
}
