import React from "react";
import type { ReactNode } from "react";

interface ErrorBoundaryState {
  message?: string;
}

export class ErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { message: error instanceof Error ? error.message : String(error) };
  }

  override render(): ReactNode {
    if (this.state.message) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
          <section className="max-w-xl rounded-3xl border border-red-500/50 bg-red-950/30 p-6 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-red-300">Renderer error</p>
            <h1 className="mt-3 text-2xl font-bold">The dashboard could not render.</h1>
            <p className="mt-3 text-sm text-red-100">{this.state.message}</p>
            <p className="mt-4 text-sm text-slate-400">Restart the app. If this repeats, export the logs from the application data folder.</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
