import { useAppStore } from "@/ui/store";

export function ExportPanel(): JSX.Element {
  const activeSession = useAppStore((state) => state.activeSession);
  const exportSession = useAppStore((state) => state.export);
  const formats = ["csv", "xlsx", "json", "sqlite"] as const;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-lg font-semibold">Exports</h2>
      <p className="mt-1 text-sm text-slate-400">Save the active extraction in multiple formats.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {formats.map((format) => (
          <button key={format} className="rounded-lg border border-slate-700 px-3 py-2 font-semibold uppercase hover:bg-slate-800 disabled:opacity-50" disabled={!activeSession} onClick={() => void exportSession(format)}>
            {format}
          </button>
        ))}
      </div>
    </section>
  );
}
