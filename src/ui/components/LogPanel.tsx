import { useAppStore } from "@/ui/store";

export function LogPanel(): JSX.Element {
  const logs = useAppStore((state) => state.logs);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-lg font-semibold">Logs</h2>
      <div className="mt-3 max-h-72 space-y-2 overflow-auto font-mono text-xs">
        {logs.map((log, index) => (
          <div key={`${log.timestamp}-${index}`} className="rounded-lg bg-slate-950 p-2">
            <span className={log.level === "error" ? "text-red-300" : log.level === "warn" ? "text-amber-300" : "text-cyan-300"}>[{log.level}]</span>{" "}
            <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>{" "}
            <span>{log.message}</span>
          </div>
        ))}
        {logs.length === 0 ? <p className="text-slate-500">Runtime events appear here.</p> : null}
      </div>
    </section>
  );
}
