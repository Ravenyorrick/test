import React, { useEffect } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/ui/App";
import { ErrorBoundary } from "@/ui/components/ErrorBoundary";
import { useAppStore } from "@/ui/store";
import "@/ui/styles.css";

function Root(): ReactElement {
  const applyUpdate = useAppStore((state) => state.applyUpdate);
  const applyFatal = useAppStore((state) => state.applyFatal);
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    if (!window.apollo) {
      applyFatal({
        message: "Desktop bridge unavailable",
        detail: "The Electron preload bridge did not load. Start the app with npm run dev or npx electron ., not by opening the Vite URL directly in a browser."
      });
      return undefined;
    }
    void initialize();
    const unsubscribeUpdate = window.apollo.onExtractionUpdate(applyUpdate);
    const unsubscribeFatal = window.apollo.onFatalError(applyFatal);
    return () => {
      unsubscribeUpdate();
      unsubscribeFatal();
    };
  }, [applyFatal, applyUpdate, initialize]);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);
