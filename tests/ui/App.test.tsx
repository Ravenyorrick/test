import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../../src/App";

describe("VOXSHIFT Phase 1 UI shell", () => {
  it("shows primary safety and audio status on the home screen", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "VOXSHIFT" })).toBeInTheDocument();
    expect(screen.getByText("No microphone selected")).toBeInTheDocument();
    expect(screen.getByText("SAFETY MUTED")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "MUTE" })).toBeInTheDocument();
    expect(screen.getByText("Not measured")).toBeInTheDocument();
  });

  it("opens the voice library with American female and male categories", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Voices" }));

    expect(screen.getByRole("heading", { name: "Choose a licensed voice profile" })).toBeInTheDocument();
    expect(screen.getByText("American Female")).toBeInTheDocument();
    expect(screen.getByText("American Male")).toBeInTheDocument();
    expect(screen.getByText("Female Natural")).toBeInTheDocument();
    expect(screen.getByText("Male Professional")).toBeInTheDocument();
  });

  it("requires authorization language for custom voice creation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(screen.getByText("Create a voice profile")).toBeInTheDocument();
    expect(
      screen.getByLabelText("I confirm that I own this voice recording or have permission to use it.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Voice Profile" })).toBeDisabled();
  });
});
