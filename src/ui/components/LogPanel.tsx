import type { ReactElement } from "react";
import { Clipboard, FileText, Search, Trash2, X } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Button, Card } from "@/ui/components/ui";

export function LogPanel(): ReactElement {
  const { logs, logSearch, setLogSearch, clearLogs } = useAppStore();
  const filtered = logs.filter((log) => `${log.level} ${log.message}`.toLowerCase().includes(logSearch.toLowerCase()));
  const copyLogs = (): void => {
    const text = filtered.map((log) => `[${log.level}] ${log.timestamp} ${log.message}`).join("\n");
    void navigator.clipboard?.writeText(text);
  };

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold"><FileText size={19} /> Live logs</h2>
          <p className="text-sm text-slate-500">{filtered.length} visible events</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input className="field w-64 pl-9" aria-label="Search logs" value={logSearch} placeholder="Search logs..." onChange={(event) => setLogSearch(event.target.value)} />
          </div>
          <Button variant="ghost" onClick={() => setLogSearch("")} disabled={!logSearch}><X size={16} /> Clear search</Button>
          <Button variant="secondary" onClick={copyLogs} disabled={filtered.length === 0}><Clipboard size={16} /> Copy log</Button>
          <Button variant="danger" onClick={clearLogs} disabled={logs.length === 0}><Trash2 size={16} /> Clear logs</Button>
        </div>
      </div>
      <div className="mt-4 max-h-96 space-y-2 overflow-auto rounded-2xl border border-white/10 bg-[#080D18] p-3 font-mono text-xs">
        {filtered.map((log, index) => (
          <div key={`${log.timestamp}-${index}`} className="rounded-xl bg-white/[0.03] p-3">
            <span className={log.level === "error" ? "text-red-300" : log.level === "warn" ? "text-amber-300" : "text-cyan-300"}>[{log.level}]</span>{" "}
            <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>{" "}
            <span>{log.message}</span>
          </div>
        ))}
        {filtered.length === 0 ? <p className="p-6 text-center text-slate-500">No log events match the current filter.</p> : null}
      </div>
    </Card>
  );
}
