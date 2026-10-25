import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PhotoelectricEffectActivity from "./PhotoelectricEffectActivity";

describe("PhotoelectricEffectActivity", () => {
  it("shows the chapter-six simulation and validates the concept check", () => {
    render(<PhotoelectricEffectActivity language="en" />);

    expect(screen.getByRole("heading", { name: "Investigating the Photoelectric Effect" })).toBeInTheDocument();
    expect(screen.getByText("Photoemission occurs")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Saturation current only" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
  });

  it("renders the Arabic chapter label and controls", () => {
    render(<PhotoelectricEffectActivity language="ar" />);

    expect(screen.getByText("الفصل السادس · الفيزياء الحديثة")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "السيزيوم" })).toHaveAttribute("aria-pressed", "true");
  });
});
