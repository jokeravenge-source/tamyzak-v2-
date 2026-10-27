import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PhotoelectricEffectActivity from "./PhotoelectricEffectActivity";

describe("PhotoelectricEffectActivity", () => {
  it("shows the chapter-six simulation and validates the concept check", () => {
    render(<PhotoelectricEffectActivity language="en" />);

    expect(screen.getByRole("heading", { name: "Investigating the Photoelectric Effect" })).toBeInTheDocument();
    expect(screen.getByText("Photoemission occurs")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity tools" })).toBeInTheDocument();
    expect(screen.getByText("Variable DC voltage source")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity steps" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Conclusion" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Saturation current only" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("status")).toHaveTextContent("Correct");
  });

  it("renders the Arabic chapter label and controls", () => {
    render(<PhotoelectricEffectActivity language="ar" />);

    expect(screen.getByText("الفصل السادس · الفيزياء الحديثة")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "السيزيوم" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("مصدر فولتية مستمر يمكن تغيير جهده")).toBeInTheDocument();
    expect(screen.getByText(/يسمى هذا الجهد جهد الإيقاف Vs/)).toBeInTheDocument();
  });

  it("turns the light source off and applies guided steps", () => {
    render(<PhotoelectricEffectActivity language="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Turn source off" }));
    expect(screen.getByText("Light source off")).toBeInTheDocument();
    expect(screen.getAllByText(/ammeter reads zero/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Illuminate the emitting plate/ }));
    expect(screen.getByText("Photoemission occurs")).toBeInTheDocument();
  });
});
