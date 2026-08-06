import type { ReactElement } from "react";
import { useAppStore } from "@/ui/store";

export function SettingsPage(): ReactElement {
  const { settings, updateSettings, config } = useAppStore();

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <p className="mt-2 text-slate-400">Non-secret preferences are saved locally. API keys are kept in memory or loaded from `APOLLO_API_KEY`.</p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <span className="text-sm font-medium text-slate-300">Extraction mode</span>
          <select
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
            value={settings.mode}
            onChange={(event) => updateSettings({ mode: event.target.value as "api" | "browser" })}
          >
            <option value="api">API search + enrichment</option>
            <option value="browser">Authenticated browser DOM</option>
          </select>
        </label>

        <label className="block rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <span className="text-sm font-medium text-slate-300">API page size</span>
          <input
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
            type="number"
            min={1}
            max={100}
            value={settings.perPage}
            onChange={(event) => updateSettings({ perPage: Math.min(100, Math.max(1, Number(event.target.value) || 100)) })}
          />
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-sm text-slate-300">Environment API key</p>
        <p className="mt-1 text-sm text-slate-500">{config.environmentApiKeyAvailable ? "APOLLO_API_KEY is configured." : "APOLLO_API_KEY is not configured. Paste a key on the Extraction page for API mode."}</p>
      </div>
    </section>
  );
}
