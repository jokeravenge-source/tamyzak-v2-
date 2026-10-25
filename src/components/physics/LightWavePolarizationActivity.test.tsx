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
});
