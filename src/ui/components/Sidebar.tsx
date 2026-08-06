import type { ReactElement } from "react";
import type { AppPage } from "@/ui/store";
import { useAppStore } from "@/ui/store";

const items: Array<{ id: AppPage; label: string; description: string }> = [
  { id: "extract", label: "Extraction", description: "URL and mode" },
  { id: "progress", label: "Progress", description: "Live results" },
  { id: "history", label: "History", description: "Saved searches" },
  { id: "exports", label: "Exports", description: "Download data" },
  { id: "logs", label: "Logs", description: "Runtime events" },
  { id: "settings", label: "Settings", description: "Defaults" }
];

export function Sidebar(): ReactElement {
  const page = useAppStore((state) => state.page);
  const setPage = useAppStore((state) => state.setPage);

  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Apollo</p>
        <h1 className="mt-2 text-2xl font-bold">Lead Extractor</h1>
        <p className="mt-2 text-sm text-slate-400">Commercial-grade extraction workspace</p>
      </div>
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            className={`w-full rounded-2xl border p-3 text-left transition ${page === item.id ? "border-cyan-400 bg-cyan-400/10" : "border-slate-800 bg-slate-950 hover:border-slate-600"}`}
            onClick={() => setPage(item.id)}
          >
            <span className="block font-semibold">{item.label}</span>
            <span className="text-xs text-slate-500">{item.description}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
