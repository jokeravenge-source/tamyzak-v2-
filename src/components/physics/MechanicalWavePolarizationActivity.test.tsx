import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MechanicalWavePolarizationActivity from "./MechanicalWavePolarizationActivity";

describe("MechanicalWavePolarizationActivity", () => {
  it("shows the tools, steps, and conclusion", () => {
    render(<MechanicalWavePolarizationActivity language="en" />);

    expect(screen.getByText("A rope fixed at one end")).toBeInTheDocument();
    expect(screen.getByText("Prepare the apparatus")).toBeInTheDocument();
    expect(screen.getByText("Conclusion")).toBeInTheDocument();
  });

  it("blocks the transmitted wave when the slot is perpendicular", () => {
    render(<MechanicalWavePolarizationActivity language="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Perpendicular slot 90°" }));

    expect(screen.getByTestId("transmitted-wave")).toHaveAttribute("data-transmission", "0");
    expect(screen.getAllByText("Slot perpendicular to vibration").length).toBeGreaterThan(0);
  });

  it("supports the Arabic activity copy", () => {
    render(<MechanicalWavePolarizationActivity language="ar" />);

    expect(screen.getByRole("heading", { name: "استقطاب الموجات الميكانيكية" })).toBeInTheDocument();
    expect(screen.getByText("أدوات النشاط")).toBeInTheDocument();
    expect(screen.getByText("خطوات النشاط")).toBeInTheDocument();
  });
});
