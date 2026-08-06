import type { ReactElement } from "react";
import { KeyRound, Link2, Pause, Play, RotateCcw, ShieldCheck, Square } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Button, Card } from "@/ui/components/ui";

export function SearchForm(): ReactElement {
  const { url, apiKey, settings, config, setUrl, setApiKey, updateSettings, start, resume, cancel, validateConfiguration, stats } = useAppStore();
  const running = stats.status === "running";
  const paused = stats.status === "paused";

  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Extract Apollo leads</h2>
        <p className="text-slate-400">Choose API mode for fast authorized API data, or browser mode for visible Apollo UI columns.</p>
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <button className={`rounded-2xl border p-4 text-left ${settings.mode === "api" ? "border-cyan-400 bg-cyan-400/10" : "border-slate-800 bg-slate-950"}`} onClick={() => updateSettings({ mode: "api" })} disabled={running}>
          <span className="block font-semibold">API mode</span>
          <span className="text-sm text-slate-500">Search and enrich with Apollo API.</span>
        </button>
        <button className={`rounded-2xl border p-4 text-left ${settings.mode === "browser" ? "border-cyan-400 bg-cyan-400/10" : "border-slate-800 bg-slate-950"}`} onClick={() => updateSettings({ mode: "browser" })} disabled={running}>
          <span className="block font-semibold">Browser mode</span>
          <span className="text-sm text-slate-500">Use authenticated Apollo UI session.</span>
        </button>
      </div>
      <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="apollo-url">
        <Link2 className="mr-2 inline" size={16} /> Apollo People Search URL
      </label>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          id="apollo-url"
          className="field flex-1"
          placeholder="https://app.apollo.io/#/people?page=1&personTitles[]=owner"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={running}
        />
        <Button variant="primary" onClick={() => void start()} disabled={!url || running}><Play size={17} />
          Start
        </Button>
        <Button onClick={() => void cancel()} disabled={!running}><Pause size={17} />
          Pause
        </Button>
        <Button onClick={() => void resume()} disabled={!paused}><RotateCcw size={17} />
          Resume
        </Button>
      </div>
      {settings.mode === "api" ? <div className="mt-3">
        <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="apollo-api-key">
          <KeyRound className="mr-2 inline" size={16} /> Optional Apollo API key
        </label>
        <input
          id="apollo-api-key"
          type="password"
          className="field"
          placeholder={config.environmentApiKeyAvailable ? "Using APOLLO_API_KEY from environment unless you paste another key" : "Paste Apollo API key"}
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          disabled={running}
        />
        <p className="mt-2 text-xs text-slate-500">
          API mode converts URL filters dynamically, searches Apollo, then enriches returned IDs for available profile, LinkedIn, email status, company, industry, revenue, technology, and metadata fields.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={validateConfiguration}><ShieldCheck size={16} /> Validate configuration</Button>
          <Button variant="ghost" onClick={() => setApiKey("")} disabled={!apiKey}><Square size={16} /> Remove API key</Button>
        </div>
      </div> : null}
    </Card>
  );
}
