import { useMemo } from "react";
import type { ReactElement } from "react";
import { useAppStore } from "@/ui/store";

export function LeadTable(): ReactElement {
  const leads = useAppStore((state) => state.leads);
  const columns = useMemo(() => Array.from(new Set(leads.flatMap((lead) => Object.keys(lead.fields)))).slice(0, 12), [leads]);

  return (
    <section className="min-h-[520px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800 p-4">
        <h2 className="text-xl font-semibold">Lead preview</h2>
        <p className="text-sm text-slate-400">Showing dynamically detected columns from saved records.</p>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0 bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">Page</th>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.slice(-200).map((lead) => (
              <tr key={lead.id} className="border-t border-slate-800 hover:bg-slate-800/40">
                <td className="px-4 py-3 text-slate-500">{lead.page}</td>
                {columns.map((column) => (
                  <td key={column} className="max-w-[240px] truncate px-4 py-3" title={String(lead.fields[column] ?? "")}>
                    {String(lead.fields[column] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 ? <p className="p-6 text-slate-500">No leads loaded yet.</p> : null}
      </div>
    </section>
  );
}
