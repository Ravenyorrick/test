import type { ReactElement } from "react";
import { RotateCcw, Save, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Button, Card, PageHeader } from "@/ui/components/ui";

export function SettingsPage(): ReactElement {
  const { settings, updateSettings, config, saveSettings, resetSettings, validateConfiguration } = useAppStore();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Preferences" title="Settings" description="Configure extraction, performance, storage, and appearance. API keys are never saved to localStorage." action={<><Button onClick={saveSettings}><Save size={16} /> Save settings</Button><Button variant="ghost" onClick={resetSettings}><RotateCcw size={16} /> Reset settings</Button></>} />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Extraction</h3>
          <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-300">Extraction mode</span>
          <select
            className="field mt-2"
            value={settings.mode}
            onChange={(event) => updateSettings({ mode: event.target.value as "api" | "browser" })}
          >
            <option value="api">API search + enrichment</option>
            <option value="browser">Authenticated browser DOM</option>
          </select>
        </label>
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <span>
            <span className="block text-sm font-medium text-slate-300">Auto-enrich API results</span>
            <span className="text-xs text-slate-500">Uses `people/match` for richer metadata when API mode is selected.</span>
          </span>
          <input type="checkbox" checked={settings.autoEnrich} onChange={(event) => updateSettings({ autoEnrich: event.target.checked })} />
        </label>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold">Performance</h3>
          <div className="mt-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-300">API page size</span>
          <input
            className="field mt-2"
            type="number"
            min={1}
            max={100}
            value={settings.perPage}
            onChange={(event) => updateSettings({ perPage: Math.min(100, Math.max(1, Number(event.target.value) || 100)) })}
          />
        </label>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Theme</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label><span className="text-sm text-slate-300">Theme</span><select className="field mt-2" value={settings.theme} onChange={(event) => updateSettings({ theme: event.target.value as "midnight" | "obsidian" })}><option value="midnight">Midnight</option><option value="obsidian">Obsidian</option></select></label>
            <label><span className="text-sm text-slate-300">Accent</span><select className="field mt-2" value={settings.accent} onChange={(event) => updateSettings({ accent: event.target.value as "blue" | "purple" })}><option value="blue">Blue</option><option value="purple">Purple</option></select></label>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold">Storage and security</h3>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm text-slate-300">Environment API key</p>
        <p className="mt-1 text-sm text-slate-500">{config.environmentApiKeyAvailable ? "APOLLO_API_KEY is configured." : "APOLLO_API_KEY is not configured. Paste a key on the Extraction page for API mode."}</p>
          </div>
          <Button className="mt-4" variant="secondary" onClick={validateConfiguration}><ShieldCheck size={16} /> Validate configuration</Button>
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="text-lg font-semibold">Advanced</h3>
        <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <span>
            <span className="block text-sm font-medium text-slate-300">Developer Mode request debugger</span>
            <span className="text-xs text-slate-500">Shows parsed URL parameters, normalized API payload, sanitized headers, response metadata, and validation warnings.</span>
          </span>
          <input type="checkbox" checked={settings.developerMode} onChange={(event) => updateSettings({ developerMode: event.target.checked })} />
        </label>
      </Card>
    </div>
  );
}
