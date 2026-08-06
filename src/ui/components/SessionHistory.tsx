import { useAppStore } from "@/ui/store";

export function SessionHistory(): JSX.Element {
  const { sessions, loadLeads } = useAppStore();

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-lg font-semibold">Search history</h2>
      <div className="mt-3 max-h-64 space-y-2 overflow-auto">
        {sessions.map((session) => (
          <button key={session.id} className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-left transition hover:border-cyan-500" onClick={() => void loadLeads(session.id)}>
            <div className="flex justify-between gap-2">
              <span className="truncate text-sm font-medium">{session.url}</span>
              <span className="text-xs text-cyan-300">{session.status}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{session.leadCount} leads - {new Date(session.createdAt).toLocaleString()}</p>
          </button>
        ))}
        {sessions.length === 0 ? <p className="text-sm text-slate-500">No completed searches yet.</p> : null}
      </div>
    </section>
  );
}
