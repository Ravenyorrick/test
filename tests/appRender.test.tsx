import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/ui/App";
import { useAppStore } from "@/ui/store";

function installApolloMock(): void {
  window.apollo = {
    getConfig: vi.fn().mockResolvedValue({ environmentApiKeyAvailable: false }),
    startExtraction: vi.fn().mockResolvedValue({
      id: "s1",
      url: "https://app.apollo.io/#/people?page=1",
      filters: [],
      status: "completed",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      checkpointPage: 1,
      leadCount: 0
    }),
    cancelExtraction: vi.fn().mockResolvedValue(undefined),
    listSessions: vi.fn().mockResolvedValue([]),
    listLeads: vi.fn().mockResolvedValue([]),
    exportSession: vi.fn().mockResolvedValue(undefined),
    onExtractionUpdate: vi.fn().mockReturnValue(() => undefined),
    onFatalError: vi.fn().mockReturnValue(() => undefined)
  };
}

describe("App shell", () => {
  beforeEach(() => {
    useAppStore.setState({
      url: "",
      apiKey: "",
      page: "extract",
      settings: { mode: "api", perPage: 100 },
      config: { environmentApiKeyAvailable: false },
      message: undefined,
      error: undefined,
      sessions: [],
      activeSession: undefined,
      leads: [],
      logs: [],
      stats: {
        currentPage: 1,
        leadsExtracted: 0,
        duplicates: 0,
        errors: 0,
        retries: 0,
        rowsPerSecond: 0,
        elapsedMs: 0,
        status: "idle"
      }
    });
  });

  it("renders dashboard shell and settings page", () => {
    installApolloMock();
    render(<App />);
    expect(screen.getByText("Lead Extractor")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Start extraction" })).toBeInTheDocument();
    fireEvent.click(screen.getByText("Settings"));
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
  });

  it("shows validation errors instead of starting with bad input", async () => {
    installApolloMock();
    render(<App />);
    fireEvent.change(screen.getByLabelText("Apollo People Search URL"), { target: { value: "https://example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Start extraction" }));
    expect(await screen.findByText("Enter a URL from app.apollo.io.")).toBeInTheDocument();
    expect(window.apollo.startExtraction).not.toHaveBeenCalled();
  });

  it("persists non-secret settings", () => {
    installApolloMock();
    render(<App />);
    fireEvent.click(screen.getByText("Settings"));
    fireEvent.change(screen.getByLabelText("Extraction mode"), { target: { value: "browser" } });
    expect(JSON.parse(localStorage.getItem("apollo-lead-extractor-settings") ?? "{}").mode).toBe("browser");
  });
});
