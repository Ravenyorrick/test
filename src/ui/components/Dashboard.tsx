import { useMemo } from "react";
import type { ReactElement } from "react";
import { Activity, AlertTriangle, Clock, CopyCheck, Gauge, Layers, RotateCcw, Users } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Card, MetricCard, ProgressRing } from "@/ui/components/ui";

export function Dashboard(): ReactElement {
  const stats = useAppStore((state) => state.stats);
  const elapsed = useMemo(() => formatMs(stats.elapsedMs), [stats.elapsedMs]);
  const eta = stats.estimatedRemainingMs ? formatMs(stats.estimatedRemainingMs) : "Unknown";
  const progress = stats.lastPage ? Math.min(100, (stats.currentPage / stats.lastPage) * 100) : 0;

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Current page" value={`${stats.currentPage}${stats.lastPage ? ` / ${stats.lastPage}` : ""}`} detail="Auto-detected pagination" icon={<Layers size={18} />} />
        <MetricCard label="Leads extracted" value={stats.leadsExtracted.toLocaleString()} detail={`${stats.duplicates} duplicates skipped`} icon={<Users size={18} />} />
        <MetricCard label="Rows/sec" value={stats.rowsPerSecond.toFixed(2)} detail="Live throughput" icon={<Gauge size={18} />} />
        <MetricCard label="Elapsed" value={elapsed} detail={`ETA ${eta}`} icon={<Clock size={18} />} />
      </div>

      <Card className="p-5">
        <div className="grid gap-6 md:grid-cols-[140px_1fr] md:items-center">
          <ProgressRing value={progress || (stats.status === "running" ? 12 : 0)} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm capitalize text-white">{stats.status}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm text-amber-200"><RotateCcw size={14} /> {stats.retries} retries</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-sm text-red-200"><AlertTriangle size={14} /> {stats.errors} errors</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200"><CopyCheck size={14} /> {stats.duplicates} duplicates</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold">{stats.currentCompany ? stats.currentCompany : "Waiting for the next lead"}</h2>
            <p className="mt-2 text-sm text-slate-400">Live extraction progress updates as rows are saved to SQLite. Exports use the saved records, so completed pages are recoverable after a crash.</p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#20293A]">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500" style={{ width: `${progress || (stats.status === "running" ? 16 : 0)}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500"><Activity className="mr-1 inline" size={13} /> {progress ? `${progress.toFixed(0)}% complete` : "Progress appears when Apollo exposes the last page."}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}
