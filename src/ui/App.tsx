import type { CSSProperties, ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AboutPage } from "@/ui/components/AboutPage";
import { Dashboard } from "@/ui/components/Dashboard";
import { DashboardPage } from "@/ui/components/DashboardPage";
import { DeveloperPanel } from "@/ui/components/DeveloperPanel";
import { ExportPanel } from "@/ui/components/ExportPanel";
import { LeadTable } from "@/ui/components/LeadTable";
import { LogPanel } from "@/ui/components/LogPanel";
import { SearchForm } from "@/ui/components/SearchForm";
import { SessionHistory } from "@/ui/components/SessionHistory";
import { SettingsPage } from "@/ui/components/SettingsPage";
import { Sidebar } from "@/ui/components/Sidebar";
import { StatusBar } from "@/ui/components/StatusBar";
import { StatusBanner } from "@/ui/components/StatusBanner";
import { TopToolbar } from "@/ui/components/TopToolbar";
import { useAppStore } from "@/ui/store";

export function App(): ReactElement {
  const page = useAppStore((state) => state.page);
  const settings = useAppStore((state) => state.settings);
  const accent = settings.accent === "purple" ? "#8B5CF6" : "#3B82F6";
  const accent2 = settings.accent === "purple" ? "#3B82F6" : "#8B5CF6";

  return (
    <main className={`min-h-screen pb-10 text-slate-100 ${settings.theme === "obsidian" ? "bg-black/20" : ""}`} style={{ "--accent": accent, "--accent-2": accent2 } as CSSProperties}>
      <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[280px_1fr] lg:p-6">
        <Sidebar />
        <section className="flex min-w-0 flex-col gap-4">
          <TopToolbar />
          <StatusBanner />
          <AnimatePresence mode="wait">
            <motion.div key={page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-6">
              {page === "dashboard" ? <DashboardPage /> : null}
              {page === "extract" ? <><SearchForm /><DeveloperPanel /><Dashboard /><LeadTable /></> : null}
              {page === "history" ? <SessionHistory /> : null}
              {page === "exports" ? <><ExportPanel /><LeadTable /></> : null}
              {page === "logs" ? <LogPanel /> : null}
              {page === "settings" ? <SettingsPage /> : null}
              {page === "about" ? <AboutPage /> : null}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
      <StatusBar />
    </main>
  );
}
