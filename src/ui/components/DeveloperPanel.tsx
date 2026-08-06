import type { ReactElement } from "react";
import { Bug, Copy } from "lucide-react";
import { useAppStore } from "@/ui/store";
import { Button, Card } from "@/ui/components/ui";

export function DeveloperPanel(): ReactElement | null {
  const { settings, requestDebug, url } = useAppStore();
  if (!settings.developerMode) return null;

  const payload = requestDebug ?? {
    originalUrl: url,
    parsedParameters: [],
    normalizedParameters: {},
    finalPayload: {},
    sanitizedHeaders: { "Content-Type": "application/json", "Cache-Control": "no-cache", "x-api-key": "[redacted]" },
    validationWarnings: ["Start an API extraction to capture a live request."],
    validationErrors: []
  };
  const text = JSON.stringify(payload, null, 2);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Bug size={18} /> Developer Mode</h2>
          <p className="text-sm text-slate-500">Sanitized parser, payload, headers, response, and validation diagnostics.</p>
        </div>
        <Button variant="secondary" onClick={() => void navigator.clipboard?.writeText(text)}><Copy size={16} /> Copy debug</Button>
      </div>
      <pre className="max-h-96 overflow-auto rounded-2xl border border-white/10 bg-[#080D18] p-4 text-xs leading-5 text-slate-300">{text}</pre>
    </Card>
  );
}
