import type { ReactElement } from "react";
import { Database, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Button, Card } from "@/ui/components/ui";

export function ExportPanel(): ReactElement {
  const { activeSession, exportHistory } = useAppStore();
  const exportSession = useAppStore((state) => state.export);
  const formats = [
    { id: "csv", label: "CSV", icon: <FileText size={22} />, detail: "Spreadsheet-friendly comma separated values" },
    { id: "xlsx", label: "Excel", icon: <FileSpreadsheet size={22} />, detail: "Formatted .xlsx workbook" },
    { id: "json", label: "JSON", icon: <FileJson size={22} />, detail: "Raw structured lead records" },
    { id: "sqlite", label: "SQLite", icon: <Database size={22} />, detail: "Portable database copy" }
  ] as const;

  return (
    <Card className="p-5">
      <h2 className="text-xl font-semibold">Exports</h2>
      <p className="mt-1 text-sm text-slate-400">Save the active extraction in production-ready formats.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {formats.map((format) => (
          <div key={format.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3 text-[var(--accent)]">{format.icon}<h3 className="text-lg font-semibold text-white">{format.label}</h3></div>
            <p className="mt-2 min-h-10 text-sm text-slate-500">{format.detail}</p>
            <Button className="mt-4 w-full" variant="primary" disabled={!activeSession} onClick={() => void exportSession(format.id)}>
              Export {format.label}
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Export history</h3>
        <div className="mt-3 space-y-2">
          {exportHistory.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium uppercase">{item.format}</span>
                <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 truncate text-slate-500">{item.outputPath}</p>
            </div>
          ))}
          {exportHistory.length === 0 ? <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">Exports you save during this session appear here.</p> : null}
        </div>
      </div>
    </Card>
  );
}
