import type { ReactElement } from "react";
import { useAppStore } from "@/ui/store";

export function SearchForm(): ReactElement {
  const { url, apiKey, settings, config, setUrl, setApiKey, updateSettings, start, resume, cancel, stats } = useAppStore();
  const running = stats.status === "running";
  const paused = stats.status === "paused";

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
      <div className="mb-5 flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Start extraction</h2>
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
        Apollo People Search URL
      </label>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          id="apollo-url"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
          placeholder="https://app.apollo.io/#/people?page=1&personTitles[]=owner"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={running}
        />
        <button className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50" onClick={() => void start()} disabled={!url || running}>
          Start extraction
        </button>
        <button className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50" onClick={() => void cancel()} disabled={!running}>
          Pause
        </button>
        <button className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50" onClick={() => void resume()} disabled={!paused}>
          Resume
        </button>
      </div>
      {settings.mode === "api" ? <div className="mt-3">
        <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="apollo-api-key">
          Optional Apollo API key
        </label>
        <input
          id="apollo-api-key"
          type="password"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
          placeholder={config.environmentApiKeyAvailable ? "Using APOLLO_API_KEY from environment unless you paste another key" : "Paste Apollo API key"}
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          disabled={running}
        />
        <p className="mt-2 text-xs text-slate-500">
          API mode converts URL filters dynamically, searches Apollo, then enriches returned IDs for available profile, LinkedIn, email status, company, industry, revenue, technology, and metadata fields.
        </p>
      </div> : null}
    </section>
  );
}
