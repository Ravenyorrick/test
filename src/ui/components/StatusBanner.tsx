import type { ReactElement } from "react";
import { useAppStore } from "@/ui/store";

export function StatusBanner(): ReactElement | null {
  const { error, message, clearError } = useAppStore();

  if (!error && !message) return null;

  return (
    <div className={`rounded-2xl border p-4 ${error ? "border-red-500/50 bg-red-950/40 text-red-100" : "border-cyan-500/40 bg-cyan-950/30 text-cyan-100"}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm">{error ?? message}</p>
        {error ? (
          <button className="rounded-lg border border-red-400/40 px-3 py-1 text-xs" onClick={clearError}>
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
