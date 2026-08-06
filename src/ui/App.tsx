import type { ReactElement } from "react";
import { Dashboard } from "@/ui/components/Dashboard";
import { ExportPanel } from "@/ui/components/ExportPanel";
import { LeadTable } from "@/ui/components/LeadTable";
import { LogPanel } from "@/ui/components/LogPanel";
import { SearchForm } from "@/ui/components/SearchForm";
import { SessionHistory } from "@/ui/components/SessionHistory";
import { SettingsPage } from "@/ui/components/SettingsPage";
import { Sidebar } from "@/ui/components/Sidebar";
import { StatusBanner } from "@/ui/components/StatusBanner";
import { useAppStore } from "@/ui/store";

export function App(): ReactElement {
  const page = useAppStore((state) => state.page);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[280px_1fr] lg:p-6">
        <Sidebar />
        <section className="flex flex-col gap-6">
          <StatusBanner />
          {page === "extract" ? <SearchForm /> : null}
          {page === "progress" ? (
            <>
              <Dashboard />
              <LeadTable />
            </>
          ) : null}
          {page === "history" ? <SessionHistory /> : null}
          {page === "exports" ? (
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <ExportPanel />
              <LeadTable />
            </div>
          ) : null}
          {page === "logs" ? <LogPanel /> : null}
          {page === "settings" ? <SettingsPage /> : null}
          {page === "extract" ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <Dashboard />
              <div className="flex flex-col gap-6">
                <ExportPanel />
                <SessionHistory />
              </div>
            </div>
          ) : null}
          {page !== "logs" && page !== "history" ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              {page !== "progress" && page !== "exports" ? <LeadTable /> : null}
              <LogPanel />
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
