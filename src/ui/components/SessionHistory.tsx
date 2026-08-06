import type { ReactElement } from "react";
import { History, RefreshCw } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Button, Card } from "@/ui/components/ui";

export function SessionHistory(): ReactElement {
  const { sessions, loadLeads, loadSessions } = useAppStore();

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold"><History size={19} /> Search history</h2>
          <p className="text-sm text-slate-500">{sessions.length} saved sessions</p>
        </div>
        <Button variant="secondary" onClick={() => void loadSessions()}><RefreshCw size={16} /> Refresh</Button>
      </div>
      <div className="mt-4 max-h-[34rem] space-y-2 overflow-auto">
        {sessions.map((session) => (
          <button key={session.id} className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-blue-400/50 hover:bg-blue-400/5" onClick={() => void loadLeads(session.id)}>
            <div className="flex justify-between gap-2">
              <span className="truncate text-sm font-medium">{session.url}</span>
              <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-cyan-300">{session.status}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{session.leadCount} leads - {new Date(session.createdAt).toLocaleString()}</p>
          </button>
        ))}
        {sessions.length === 0 ? <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">No saved searches yet. Completed and paused extractions appear here automatically.</p> : null}
      </div>
    </Card>
  );
}
