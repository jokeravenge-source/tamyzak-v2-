import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PhysicsActivities from "./PhysicsActivities";

vi.mock("@/components/physics/PhotoelectricEffectActivity", () => ({
  default: () => <div>Photoelectric activity content</div>,
}));

vi.mock("@/components/physics/SpectrumTypesActivity", () => ({
  default: () => <div>Spectrum activity content</div>,
}));

describe("PhysicsActivities chapter grouping", () => {
  it("places Photoelectric Effect in Chapter 6 and Types of Spectra in Chapter 8", () => {
    render(<PhysicsActivities language="en" onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Chapter 6/ }));
    expect(screen.getByRole("tab", { name: "Photoelectric Effect" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Types of Spectra" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Chapter 8/ }));
    expect(screen.getByRole("tab", { name: "Types of Spectra" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Photoelectric Effect" })).not.toBeInTheDocument();
  });
});
