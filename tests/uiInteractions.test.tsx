import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/ui/App";
import { useAppStore } from "@/ui/store";

const session = { id: "s1", url: "https://app.apollo.io/#/people?page=1", filters: [], status: "completed" as const, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", checkpointPage: 1, leadCount: 1 };
const lead = { id: "l1", hash: "h1", sourceUrl: session.url, page: 1, extractedAt: "2026-01-01T00:00:00.000Z", visibleText: "Ada Apollo", fields: { Name: "Ada Lovelace", Company: "Apollo", LinkedIn: "https://linkedin.com/in/ada" } };

function installApolloMock(): void {
  window.apollo = {
    getConfig: vi.fn().mockResolvedValue({ environmentApiKeyAvailable: true }),
    startExtraction: vi.fn().mockResolvedValue(session),
    cancelExtraction: vi.fn().mockResolvedValue(undefined),
    listSessions: vi.fn().mockResolvedValue([session]),
    listLeads: vi.fn().mockResolvedValue([lead]),
    exportSession: vi.fn().mockResolvedValue("/tmp/apollo.csv"),
    onExtractionUpdate: vi.fn().mockReturnValue(() => undefined),
    onFatalError: vi.fn().mockReturnValue(() => undefined)
  };
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
}

beforeEach(() => {
  installApolloMock();
  useAppStore.setState({
    url: session.url,
    apiKey: "",
    page: "extract",
    sidebarCollapsed: false,
    settings: { mode: "api", perPage: 100, autoEnrich: true, theme: "midnight", accent: "blue", developerMode: false },
    config: { environmentApiKeyAvailable: true },
    message: undefined,
    error: undefined,
    logSearch: "",
    exportHistory: [],
    sessions: [session],
    activeSession: session,
    leads: [lead],
    logs: [{ level: "info", message: "Ready", timestamp: "2026-01-01T00:00:00.000Z" }],
    stats: { currentPage: 1, leadsExtracted: 1, duplicates: 0, errors: 0, retries: 0, rowsPerSecond: 1, elapsedMs: 1000, status: "completed" }
  });
});

describe("visible UI interactions", () => {
  it("collapses sidebar and runs extraction controls", async () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText("Collapse sidebar"));
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    await waitFor(() => expect(window.apollo.startExtraction).toHaveBeenCalled());
    useAppStore.setState({ stats: { ...useAppStore.getState().stats, status: "running" } });
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    await waitFor(() => expect(window.apollo.cancelExtraction).toHaveBeenCalled());
  });

  it("searches/selects/details in the data grid", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Search leads"), { target: { value: "Ada" } });
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Select all" }));
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View details" }));
    expect(await screen.findByText("Lead details")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Copy Name"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Ada Lovelace");
    fireEvent.click(screen.getByLabelText("Close dialog"));
  });

  it("filters, copies, and clears logs", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("Logs"));
    await screen.findByText("Live logs");
    fireEvent.change(screen.getByLabelText("Search logs"), { target: { value: "Ready" } });
    fireEvent.click(screen.getByRole("button", { name: "Copy log" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Clear logs" }));
    expect(await screen.findByText("No log events match the current filter.")).toBeInTheDocument();
  });

  it("exports each format and records export history", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("Exports"));
    await screen.findByText("Export history");
    for (const label of ["Export CSV", "Export Excel", "Export JSON", "Export SQLite"]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
    }
    await waitFor(() => expect(window.apollo.exportSession).toHaveBeenCalledTimes(4));
    expect(screen.getAllByText("/tmp/apollo.csv").length).toBeGreaterThan(0);
  });

  it("saves, validates, and resets settings", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("Settings"));
    await screen.findByRole("heading", { name: "Settings" });
    fireEvent.change(screen.getByLabelText("Accent"), { target: { value: "purple" } });
    fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
    expect(JSON.parse(localStorage.getItem("apollo-lead-extractor-settings") ?? "{}").accent).toBe("purple");
    fireEvent.click(screen.getByRole("button", { name: "Validate configuration" }));
    expect(await screen.findByText("Configuration is valid.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset settings" }));
    expect(JSON.parse(localStorage.getItem("apollo-lead-extractor-settings") ?? "{}").accent).toBe("blue");
  });
});
