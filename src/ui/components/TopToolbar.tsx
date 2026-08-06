import type { ReactElement } from "react";
import { Download, PlayCircle, RefreshCw, Settings, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Button } from "@/ui/components/ui";

const titles = {
  dashboard: "Dashboard",
  extract: "Extract Leads",
  history: "History",
  exports: "Exports",
  logs: "Logs",
  settings: "Settings",
  about: "About"
};

export function TopToolbar(): ReactElement {
  const { page, settings, config, stats, setPage, loadSessions } = useAppStore();
  const apiReady = settings.mode === "browser" || config.environmentApiKeyAvailable;

  return (
    <header className="premium-card flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{titles[page]}</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${stats.status === "failed" ? "bg-red-500/15 text-red-200" : stats.status === "running" ? "bg-blue-500/15 text-blue-200" : "bg-white/10 text-slate-300"}`}>{stats.status}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-300">{settings.mode.toUpperCase()} mode</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${apiReady ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-200"}`}><ShieldCheck size={13} /> {apiReady ? "Config ready" : "Needs API key"}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Rows stream live. Revealed emails update the database and exports immediately.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => void loadSessions()}><RefreshCw size={16} /> Refresh</Button>
        <Button variant="secondary" onClick={() => setPage("exports")}><Download size={16} /> Export</Button>
        <Button variant="secondary" onClick={() => setPage("settings")}><Settings size={16} /> Settings</Button>
        <Button variant="primary" onClick={() => setPage("extract")}><PlayCircle size={16} /> Extract</Button>
      </div>
    </header>
  );
}
