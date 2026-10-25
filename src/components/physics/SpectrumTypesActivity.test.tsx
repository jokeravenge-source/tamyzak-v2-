import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SpectrumTypesActivity from "./SpectrumTypesActivity";

describe("SpectrumTypesActivity", () => {
  it("changes the spectrum and validates the learner's answer", () => {
    render(<SpectrumTypesActivity language="en" />);

    expect(screen.getByText("Line emission spectrum", { selector: "h3" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ordinary lamp" }));
    expect(screen.getByText("Continuous spectrum", { selector: "h3" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continuous spectrum" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
  });

  it("supports the Arabic activity copy", () => {
    render(<SpectrumTypesActivity language="ar" />);

    expect(screen.getByRole("heading", { name: "بيّن بوضوح أنواع الأطياف" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "أنبوب غاز متوهّج" })).toHaveAttribute("aria-pressed", "true");
  });

  it("turns the source off and hides the spectrum", () => {
    render(<SpectrumTypesActivity language="en" />);

    const screenPanel = screen.getByTestId("spectrum-screen");
    expect(screenPanel).toHaveAttribute("data-powered", "on");
    expect(screen.getAllByTestId("spectrum-line")).toHaveLength(4);

    fireEvent.click(screen.getByRole("button", { name: "Turn source off" }));

    expect(screenPanel).toHaveAttribute("data-powered", "off");
    expect(screen.getByText("No light")).toBeInTheDocument();
    expect(screen.queryAllByTestId("spectrum-line")).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "Experiment paused" })).toBeInTheDocument();
  });

  it("shows a different spectral fingerprint for each material", () => {
    render(<SpectrumTypesActivity language="en" />);

    expect(screen.getAllByTestId("spectrum-line")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Sodium" }));

    expect(screen.getByTestId("spectrum-screen")).toHaveAttribute("data-material", "sodium");
    expect(screen.getAllByTestId("spectrum-line")).toHaveLength(2);
  });
});
