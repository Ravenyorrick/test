import type { ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Button } from "@/ui/components/ui";

export function StatusBanner(): ReactElement | null {
  const { error, message, clearError } = useAppStore();

  if (!error && !message) return null;

  return (
    <AnimatePresence>
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl border p-4 shadow-2xl ${error ? "border-red-500/50 bg-red-950/40 text-red-100" : "border-emerald-500/40 bg-emerald-950/30 text-emerald-100"}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="flex items-center gap-2 text-sm">{error ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}{error ?? message}</p>
        <Button variant="ghost" onClick={clearError} aria-label="Close notification"><X size={16} /></Button>
      </div>
    </motion.div>
    </AnimatePresence>
  );
}
