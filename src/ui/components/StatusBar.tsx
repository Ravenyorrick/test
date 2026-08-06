import type { ReactElement } from "react";
import { Activity, Database, Gauge, MailCheck, Wifi } from "lucide-react";
import { useAppStore } from "@/ui/store";

export function StatusBar(): ReactElement {
  const { stats, leads, sessions, settings } = useAppStore();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#080D18]/90 px-4 py-2 text-xs text-slate-400 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1"><Activity size={13} /> {stats.status}</span>
          <span className="inline-flex items-center gap-1"><Database size={13} /> {leads.length} rows loaded</span>
          <span className="inline-flex items-center gap-1"><MailCheck size={13} /> {stats.emailsRevealed ?? 0} emails revealed</span>
          <span className="inline-flex items-center gap-1"><Gauge size={13} /> {stats.rowsPerSecond.toFixed(2)} rows/sec</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span>{sessions.length} saved searches</span>
          <span>{settings.revealPersonalEmails ? `Reveal limit ${settings.maxEmailRevealsPerRun || "unlimited"}` : "Email reveal off"}</span>
          <span className="inline-flex items-center gap-1 text-emerald-300"><Wifi size={13} /> Ready</span>
        </div>
      </div>
    </footer>
  );
}
