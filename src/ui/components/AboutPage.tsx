import type { ReactElement } from "react";
import { CheckCircle2, Shield, Sparkles } from "lucide-react";
import { Card, PageHeader } from "@/ui/components/ui";

export function AboutPage(): ReactElement {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="About" title="Apollo Lead Extractor" description="A desktop extraction workspace built with Electron, React, TypeScript, Playwright, and SQLite." />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5"><Sparkles className="text-[var(--accent)]" /><h3 className="mt-4 text-lg font-semibold">Premium UX</h3><p className="mt-2 text-sm text-slate-400">Designed for a commercial desktop workflow with live progress, history, exports, and clear error states.</p></Card>
        <Card className="p-5"><Shield className="text-[var(--accent)]" /><h3 className="mt-4 text-lg font-semibold">Secure by default</h3><p className="mt-2 text-sm text-slate-400">API keys are not committed or saved to localStorage. Use runtime input or a local `.env` file.</p></Card>
        <Card className="p-5"><CheckCircle2 className="text-[var(--accent)]" /><h3 className="mt-4 text-lg font-semibold">Validated</h3><p className="mt-2 text-sm text-slate-400">The build includes TypeScript, renderer, parser, export, database, and Electron smoke coverage.</p></Card>
      </div>
    </div>
  );
}
