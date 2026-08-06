import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { BarChart3, ChevronLeft, Database, Download, FileText, History, Info, PlayCircle, Settings } from "lucide-react";
import type { AppPage } from "@/ui/store";
import { useAppStore } from "@/ui/store";
import { Button } from "@/ui/components/ui";

const items: Array<{ id: AppPage; label: string; description: string; icon: ReactElement }> = [
  { id: "dashboard", label: "Dashboard", description: "Overview", icon: <BarChart3 size={18} /> },
  { id: "extract", label: "Extract Leads", description: "Run searches", icon: <PlayCircle size={18} /> },
  { id: "history", label: "History", description: "Saved sessions", icon: <History size={18} /> },
  { id: "exports", label: "Exports", description: "Download data", icon: <Download size={18} /> },
  { id: "logs", label: "Logs", description: "Runtime events", icon: <FileText size={18} /> },
  { id: "settings", label: "Settings", description: "Preferences", icon: <Settings size={18} /> },
  { id: "about", label: "About", description: "App details", icon: <Info size={18} /> }
];

export function Sidebar(): ReactElement {
  const page = useAppStore((state) => state.page);
  const setPage = useAppStore((state) => state.setPage);
  const collapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <motion.aside animate={{ width: collapsed ? 96 : 292 }} className="premium-card overflow-hidden p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 p-3 text-white shadow-lg shadow-blue-500/20"><Database size={22} /></div>
          {!collapsed ? (
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent)]">Apollo</p>
              <h1 className="text-xl font-semibold">Lead Extractor</h1>
            </div>
          ) : null}
        </div>
        <Button variant="ghost" onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="shrink-0">
          <ChevronLeft className={`transition ${collapsed ? "rotate-180" : ""}`} size={18} />
        </Button>
      </div>
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${page === item.id ? "border-blue-400/60 bg-blue-400/10 text-white" : "border-transparent bg-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white"}`}
            onClick={() => setPage(item.id)}
            aria-label={item.label}
          >
            <span className="text-[var(--accent)]">{item.icon}</span>
            {!collapsed ? (
              <span>
                <span className="block font-semibold">{item.label}</span>
                <span className="text-xs text-slate-500">{item.description}</span>
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </motion.aside>
  );
}
