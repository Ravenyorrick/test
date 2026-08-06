import React, { useEffect } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/ui/App";
import { useAppStore } from "@/ui/store";
import "@/ui/styles.css";

function Root(): ReactElement {
  const applyUpdate = useAppStore((state) => state.applyUpdate);
  const loadSessions = useAppStore((state) => state.loadSessions);

  useEffect(() => {
    void loadSessions();
    return window.apollo.onExtractionUpdate(applyUpdate);
  }, [applyUpdate, loadSessions]);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
