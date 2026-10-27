import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DielectricCapacitorActivity from "./DielectricCapacitorActivity";

describe("DielectricCapacitorActivity", () => {
  it("renders a 2D draggable capacitor with the source conclusion", () => {
    render(<DielectricCapacitorActivity language="ar" />);
    expect(screen.getByRole("heading", { name: "إدخال عازل في متسعة مشحونة معزولة" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "نسبة إدخال العازل" })).toBeInTheDocument();
    expect(screen.getByText("الاستنتاج")).toBeInTheDocument();
    expect(screen.queryByText(/3D/i)).not.toBeInTheDocument();
  });

  it("reduces voltage when the dielectric is inserted", () => {
    render(<DielectricCapacitorActivity language="en" />);
    const diagram = screen.getByRole("img", { name: "Interactive 2D capacitor" });
    expect(diagram).toHaveAttribute("data-voltage", "10.00");
    fireEvent.change(screen.getByRole("slider", { name: "Dielectric insertion" }), { target: { value: "1" } });
    expect(diagram).toHaveAttribute("data-insertion", "1.00");
    expect(diagram).toHaveAttribute("data-voltage", "3.33");
  });
});
