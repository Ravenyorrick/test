import type { ReactElement } from "react";
import { Dashboard } from "@/ui/components/Dashboard";
import { ExportPanel } from "@/ui/components/ExportPanel";
import { LeadTable } from "@/ui/components/LeadTable";
import { LogPanel } from "@/ui/components/LogPanel";
import { SearchForm } from "@/ui/components/SearchForm";
import { SessionHistory } from "@/ui/components/SessionHistory";

export function App(): ReactElement {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Apollo Lead Extractor</p>
          <h1 className="text-4xl font-bold">High-speed People Search extraction</h1>
          <p className="max-w-3xl text-slate-400">
            Paste any Apollo People Search URL. The app reuses your logged-in browser profile, detects filters and visible columns dynamically, paginates, de-duplicates, auto-saves, and exports the resulting leads.
          </p>
        </header>
        <SearchForm />
        <Dashboard />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <LeadTable />
          <div className="flex flex-col gap-6">
            <ExportPanel />
            <SessionHistory />
            <LogPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
