import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EddyCurrentPendulumActivity from "./EddyCurrentPendulumActivity";

describe("EddyCurrentPendulumActivity", () => {
  it("releases both pendulums with different damping", () => {
    render(<EddyCurrentPendulumActivity language="en" />);

    expect(screen.getByTestId("solid-pendulum")).toHaveAttribute("data-damping", "greater");
    expect(screen.getByTestId("slotted-pendulum")).toHaveAttribute("data-damping", "less");

    fireEvent.click(screen.getByRole("button", { name: "Release both pendulums" }));

    expect(screen.getByText("Both pendulums are swinging through the magnetic field")).toBeInTheDocument();
    expect(screen.getByTestId("solid-pendulum")).toHaveClass("eddy-solid-moving");
    expect(screen.getByTestId("slotted-pendulum")).toHaveClass("eddy-slotted-moving");
  });

  it("renders the Arabic conclusion and has no MCQ controls", () => {
    render(<EddyCurrentPendulumActivity language="ar" />);

    expect(screen.getByRole("heading", { name: "تقليل تأثير التيارات الدوامة المتولدة في الموصلات" })).toBeInTheDocument();
    expect(screen.getByText("نستنتج من النشاط")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /تحقق|check answer/i })).not.toBeInTheDocument();
  });
});
