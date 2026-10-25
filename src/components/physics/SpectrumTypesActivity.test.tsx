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
});
