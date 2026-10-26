import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LightDiffractionActivity from "./LightDiffractionActivity";

describe("LightDiffractionActivity", () => {
  it("includes the tools, steps, observation, and conclusion", () => {
    render(<LightDiffractionActivity language="en" />);

    expect(screen.getByText("A glass plate coated with black paint")).toBeInTheDocument();
    expect(screen.getByText("Make the slit")).toBeInTheDocument();
    expect(screen.getByText("Observation")).toBeInTheDocument();
    expect(screen.getByText("Conclusion")).toBeInTheDocument();
  });

  it("changes the diffraction pattern with the selected light color", () => {
    render(<LightDiffractionActivity language="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Blue" }));
    expect(screen.getByTestId("diffraction-screen")).toHaveAttribute("data-wavelength", "450");
  });

  it("widens the central fringe when the slit becomes narrower", () => {
    render(<LightDiffractionActivity language="en" />);

    const screenElement = screen.getByTestId("diffraction-screen");
    const initialWidth = Number(screenElement.getAttribute("data-central-width"));
    fireEvent.change(screen.getByRole("slider", { name: "Slit width" }), { target: { value: "0.1" } });
    const narrowWidth = Number(screenElement.getAttribute("data-central-width"));

    expect(narrowWidth).toBeGreaterThan(initialWidth);
  });

  it("supports the Arabic chapter-five copy", () => {
    render(<LightDiffractionActivity language="ar" />);

    expect(screen.getByRole("heading", { name: "حيود الضوء خلال شق ضيق" })).toBeInTheDocument();
    expect(screen.getByText("أدوات النشاط")).toBeInTheDocument();
    expect(screen.getByText("خطوات النشاط")).toBeInTheDocument();
  });
});
