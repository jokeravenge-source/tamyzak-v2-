import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LightWavePolarizationActivity from "./LightWavePolarizationActivity";

describe("LightWavePolarizationActivity", () => {
  it("switches between the one-sheet and two-sheet stages", () => {
    render(<LightWavePolarizationActivity language="en" />);

    fireEvent.click(screen.getByRole("button", { name: "One sheet" }));
    expect(screen.getByText("Vibrations in one direction")).toBeInTheDocument();
    expect(screen.getByText("50.0%")).toBeInTheDocument();
  });

  it("supports the Arabic chapter-five copy", () => {
    render(<LightWavePolarizationActivity language="ar" />);

    expect(screen.getByText("الفصل الخامس · نشاط الاستقطاب")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "استقطاب الموجات الضوئية" })).toBeInTheDocument();
  });

  it("selects a sheet and rotates it with the easy controls", () => {
    render(<LightWavePolarizationActivity language="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Rotate the selected sheet: Polarizing sheet" }));
    expect(screen.getByText(/Polarizing sheet ·/)).toHaveTextContent("0°");

    fireEvent.click(screen.getByRole("button", { name: "Increase angle by 15 degrees" }));
    expect(screen.getByText(/Polarizing sheet ·/)).toHaveTextContent("15°");
  });

  it("dims the eye when crossed sheets block the polarized light", () => {
    render(<LightWavePolarizationActivity language="en" />);

    const analyzer = screen.getByRole("button", { name: "Rotate the selected sheet: Analyzer sheet" });
    fireEvent.click(analyzer);
    fireEvent.change(screen.getByRole("slider", { name: "Rotate the selected sheet" }), { target: { value: "90" } });

    expect(screen.getByTestId("polarized-eye")).toHaveAttribute("data-glowing", "false");
    expect(screen.getByText("No light reaches the eye")).toBeInTheDocument();
  });
});
