import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PhotoelectricEffectActivity from "./PhotoelectricEffectActivity";

describe("PhotoelectricEffectActivity", () => {
  it("shows the chapter-six simulation without an MCQ block", () => {
    render(<PhotoelectricEffectActivity language="en" />);

    expect(screen.getByRole("heading", { name: "Investigating the Photoelectric Effect" })).toBeInTheDocument();
    expect(screen.getByText("Photoemission occurs")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity tools" })).toBeInTheDocument();
    expect(screen.getByText("Variable DC voltage source")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity steps" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Conclusion" })).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Check answer" })).not.toBeInTheDocument();
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

  it("offers large guided navigation and precise adjustment buttons", () => {
    render(<PhotoelectricEffectActivity language="en" />);

    expect(screen.getByText("Step 3 / 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Step 2 / 4")).toBeInTheDocument();
    expect(screen.getByText("Light source off")).toBeInTheDocument();

    expect(screen.getByLabelText("Wavelength λ")).toHaveValue("420");
    fireEvent.click(screen.getByRole("button", { name: "Increase Wavelength λ" }));
    expect(screen.getByLabelText("Wavelength λ")).toHaveValue("445");
  });

  it("lets the student switch the collector plate polarity and increase its negativity", () => {
    render(<PhotoelectricEffectActivity language="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Negative plate (−)" }));
    expect(screen.getByRole("button", { name: "Negative plate (−)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("-1.5 V")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Increase Plate-voltage magnitude" }));
    expect(screen.getByLabelText("Plate-voltage magnitude")).toHaveValue("2");
    expect(screen.getByText("-2.0 V")).toBeInTheDocument();
  });
});
