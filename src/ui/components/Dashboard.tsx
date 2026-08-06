import { useMemo } from "react";
import type { ReactElement } from "react";
import { useAppStore } from "@/ui/store";

export function Dashboard(): ReactElement {
  const stats = useAppStore((state) => state.stats);
  const elapsed = useMemo(() => formatMs(stats.elapsedMs), [stats.elapsedMs]);
  const eta = stats.estimatedRemainingMs ? formatMs(stats.estimatedRemainingMs) : "Unknown";
  const progress = stats.lastPage ? Math.min(100, (stats.currentPage / stats.lastPage) * 100) : 0;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live dashboard</h2>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm capitalize text-cyan-200">{stats.status}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Current page" value={`${stats.currentPage}${stats.lastPage ? ` / ${stats.lastPage}` : ""}`} />
        <Metric label="Leads extracted" value={stats.leadsExtracted.toLocaleString()} />
        <Metric label="Rows/sec" value={stats.rowsPerSecond.toFixed(2)} />
        <Metric label="Elapsed" value={elapsed} />
        <Metric label="ETA" value={eta} />
        <Metric label="Retries" value={stats.retries} />
        <Metric label="Errors" value={stats.errors} />
        <Metric label="Duplicates" value={stats.duplicates} />
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm text-slate-400">
          <span>{stats.currentCompany ? `Current company: ${stats.currentCompany}` : "Waiting for rows"}</span>
          <span>{progress ? `${progress.toFixed(0)}%` : "Pagination auto-detected"}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${progress || (stats.status === "running" ? 20 : 0)}%` }} />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }): ReactElement {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}
