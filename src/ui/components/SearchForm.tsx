import { useAppStore } from "@/ui/store";

export function SearchForm(): JSX.Element {
  const { url, setUrl, start, cancel, stats } = useAppStore();
  const running = stats.status === "running" || stats.status === "paused";

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl">
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
      </div>
    </section>
  );
}
