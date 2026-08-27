import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/App";

const mediaDevicesMock = {
  enumerateDevices: vi.fn(),
  getUserMedia: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

beforeEach(() => {
  window.localStorage.clear();
  mediaDevicesMock.enumerateDevices.mockResolvedValue([]);
  mediaDevicesMock.getUserMedia.mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }]
  });

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: mediaDevicesMock
  });
});

describe("VOXSHIFT UI shell", () => {
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

  it("enumerates and selects real browser audio input devices", async () => {
    mediaDevicesMock.enumerateDevices.mockResolvedValue([
      {
        deviceId: "usb-mic-1",
        groupId: "usb-group",
        kind: "audioinput",
        label: "USB Microphone",
        toJSON: () => ({})
      },
      {
        deviceId: "camera-1",
        groupId: "camera-group",
        kind: "videoinput",
        label: "Webcam",
        toJSON: () => ({})
      }
    ]);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Microphone" }));

    expect(await screen.findByText("USB Microphone")).toBeInTheDocument();
    expect(screen.queryByText("Webcam")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    await waitFor(() => expect(window.localStorage.getItem("voxshift:selected-microphone-id")).toBe("usb-mic-1"));
  });
});
