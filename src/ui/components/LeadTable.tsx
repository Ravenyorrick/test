import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { ArrowUpDown, CheckSquare, Copy, ExternalLink, Search, Square, X } from "lucide-react";
import { useAppStore } from "@/ui/store";
import type { LeadRecord } from "@/types";
import { Button, Card, Modal } from "@/ui/components/ui";

export function LeadTable(): ReactElement {
  const leads = useAppStore((state) => state.leads);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("page");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<LeadRecord | undefined>();
  const pageSize = 25;
  const columns = useMemo(() => Array.from(new Set(leads.flatMap((lead) => Object.keys(lead.fields)))).slice(0, 10), [leads]);
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const rows = normalized ? leads.filter((lead) => JSON.stringify(lead.fields).toLowerCase().includes(normalized)) : leads;
    return [...rows].sort((a, b) => {
      const left = sortKey === "page" ? a.page : String(a.fields[sortKey] ?? "");
      const right = sortKey === "page" ? b.page : String(b.fields[sortKey] ?? "");
      const result = left > right ? 1 : left < right ? -1 : 0;
      return sortDirection === "asc" ? result : -result;
    });
  }, [leads, query, sortDirection, sortKey]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="min-h-[520px] overflow-hidden">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Lead data grid</h2>
            <p className="text-sm text-slate-400">{filtered.length} rows shown from {leads.length} saved leads.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input className="field w-72 pl-9" aria-label="Search leads" placeholder="Search leads..." value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
            </div>
            <Button variant="ghost" onClick={() => { setQuery(""); setPage(1); }} disabled={!query}><X size={16} /> Clear</Button>
            <Button variant="secondary" onClick={() => setSelected(new Set(filtered.map((lead) => lead.id)))} disabled={filtered.length === 0}><CheckSquare size={16} /> Select all</Button>
            <Button variant="secondary" onClick={() => setSelected(new Set())} disabled={selected.size === 0}><Square size={16} /> Deselect</Button>
          </div>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0 bg-[#0D1320] text-slate-400">
            <tr>
              <th className="px-4 py-3">Select</th>
              <SortableHeader label="Page" active={sortKey === "page"} onClick={() => toggleSort("page", sortKey, sortDirection, setSortKey, setSortDirection)} />
              {columns.map((column) => (
                <SortableHeader key={column} label={column} active={sortKey === column} onClick={() => toggleSort(column, sortKey, sortDirection, setSortKey, setSortDirection)} />
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((lead) => (
              <tr key={lead.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <input aria-label={`Select lead ${lead.id}`} type="checkbox" checked={selected.has(lead.id)} onChange={(event) => setSelected((current) => {
                    const next = new Set(current);
                    if (event.target.checked) next.add(lead.id); else next.delete(lead.id);
                    return next;
                  })} />
                </td>
                <td className="px-4 py-3 text-slate-500">{lead.page}</td>
                {columns.map((column) => (
                  <td key={column} className="max-w-[240px] truncate px-4 py-3" title={String(lead.fields[column] ?? "")}>
                    {String(lead.fields[column] ?? "")}
                  </td>
                ))}
                <td className="px-4 py-3"><Button variant="ghost" onClick={() => setDetails(lead)}>View details</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 ? <EmptyState /> : null}
      </div>
      <div className="flex flex-col gap-3 border-t border-white/10 p-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <span>{selected.size} selected</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="secondary" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      </div>
      {details ? <LeadDetails lead={details} onClose={() => setDetails(undefined)} /> : null}
    </Card>
  );
}

function SortableHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }): ReactElement {
  return <th className="px-4 py-3"><button className={`inline-flex items-center gap-2 ${active ? "text-white" : ""}`} onClick={onClick}>{label}<ArrowUpDown size={14} /></button></th>;
}

function toggleSort(key: string, sortKey: string, direction: "asc" | "desc", setSortKey: (key: string) => void, setSortDirection: (direction: "asc" | "desc") => void): void {
  if (key === sortKey) setSortDirection(direction === "asc" ? "desc" : "asc");
  else {
    setSortKey(key);
    setSortDirection("asc");
  }
}

function LeadDetails({ lead, onClose }: { lead: LeadRecord; onClose: () => void }): ReactElement {
  const entries = Object.entries(lead.fields);
  return (
    <Modal title="Lead details" onClose={onClose}>
      <div className="grid gap-3">
        {entries.map(([key, value]) => {
          const text = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
          const isUrl = /^https?:\/\//i.test(text);
          return (
            <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">{key}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="break-all text-sm text-slate-200">{text}</p>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => void navigator.clipboard?.writeText(text)} aria-label={`Copy ${key}`}><Copy size={16} /></Button>
                  {isUrl ? <Button variant="ghost" onClick={() => window.open(text, "_blank", "noopener,noreferrer")} aria-label={`Open ${key}`}><ExternalLink size={16} /></Button> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function EmptyState(): ReactElement {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-[var(--accent)]"><Search size={28} /></div>
      <h3 className="mt-4 text-lg font-semibold">No leads loaded</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">Start an extraction or open a history item. Saved leads will appear here with search, sorting, selection, and detail actions.</p>
    </div>
  );
}
