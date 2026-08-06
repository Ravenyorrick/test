import type { ReactElement } from "react";
import { CalendarDays, CheckCircle2, Gauge, History, Users } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Card, MetricCard, PageHeader } from "@/ui/components/ui";

export function DashboardPage(): ReactElement {
  const { sessions, leads, stats, logs } = useAppStore();
  const today = new Date().toDateString();
  const todaysLeads = leads.filter((lead) => new Date(lead.extractedAt).toDateString() === today).length;
  const successRate = stats.errors + stats.leadsExtracted === 0 ? 100 : (stats.leadsExtracted / (stats.leadsExtracted + stats.errors)) * 100;

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Command center" title="Dashboard" description="A polished overview of extraction activity, live performance, and saved sessions." />
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Total Leads" value={leads.length.toLocaleString()} detail="Loaded in current workspace" icon={<Users size={18} />} />
        <MetricCard label="Today's Leads" value={todaysLeads.toLocaleString()} detail="Extracted today" icon={<CalendarDays size={18} />} />
        <MetricCard label="Extraction Speed" value={stats.rowsPerSecond.toFixed(2)} detail="Rows per second" icon={<Gauge size={18} />} />
        <MetricCard label="Success Rate" value={`${successRate.toFixed(0)}%`} detail={`${stats.errors} errors`} icon={<CheckCircle2 size={18} />} />
        <MetricCard label="History Count" value={sessions.length} detail="Saved searches" icon={<History size={18} />} />
      </div>
      <Card className="p-5">
        <h2 className="text-xl font-semibold">Recent activity</h2>
        <div className="mt-4 space-y-3">
          {logs.slice(-6).reverse().map((log, index) => (
            <div key={`${log.timestamp}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <span className={log.level === "error" ? "text-red-300" : log.level === "warn" ? "text-amber-300" : "text-emerald-300"}>{log.level.toUpperCase()}</span>
              <span className="ml-3 text-sm text-slate-400">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 ? <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">Activity appears here when extractions start, pause, retry, complete, or export.</p> : null}
        </div>
      </Card>
    </div>
  );
}
