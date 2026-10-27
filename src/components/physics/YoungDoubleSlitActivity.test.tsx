import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import YoungDoubleSlitActivity from "./YoungDoubleSlitActivity";

describe("YoungDoubleSlitActivity", () => {
  it("includes the experiment steps, tools, conclusion, and no MCQ", () => {
    render(<YoungDoubleSlitActivity language="en" />);

    expect(screen.getByRole("heading", { name: "Young's Double-Slit Experiment" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity tools" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity steps" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Conclusion" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /check answer/i })).not.toBeInTheDocument();
  });

  it("widens the interference fringes when wavelength increases", () => {
    render(<YoungDoubleSlitActivity language="en" />);

    const interferenceScreen = screen.getByTestId("young-interference-screen");
    const initialSpacing = Number(interferenceScreen.getAttribute("data-fringe-spacing"));

    fireEvent.change(screen.getByRole("slider", { name: "Wavelength λ" }), { target: { value: "650" } });

    expect(interferenceScreen).toHaveAttribute("data-wavelength", "650");
    expect(Number(interferenceScreen.getAttribute("data-fringe-spacing"))).toBeGreaterThan(initialSpacing);
  });

  it("turns the source off and supports Arabic", () => {
    const { rerender } = render(<YoungDoubleSlitActivity language="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Turn source off" }));
    expect(screen.getByTestId("young-interference-screen")).toHaveAttribute("data-powered", "off");

    rerender(<YoungDoubleSlitActivity language="ar" />);
    expect(screen.getByRole("heading", { name: "تجربة يونك للشقين" })).toBeInTheDocument();
  });
});
