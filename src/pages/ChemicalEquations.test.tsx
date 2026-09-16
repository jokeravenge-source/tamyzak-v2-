import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ChemicalEquations from "@/pages/ChemicalEquations";
import { chemicalEquations, chemicalEquationTopics } from "@/data/chemicalEquations";

afterEach(cleanup);
describe("Chemical Equation tool", () => {
  it("shows all 19 equations, their hints, and eight ordered topics", () => {
    render(<ChemicalEquations language="en" onBack={vi.fn()} />);
    expect(screen.getAllByRole("article")).toHaveLength(19);
    expect(screen.getAllByText("Memory hint")).toHaveLength(19);
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual(chemicalEquationTopics.map((topic) => topic.title.en));
    for (const equation of chemicalEquations) expect(screen.getByText(equation.formula)).toBeInTheDocument();
  });
  it("uses RTL Arabic and keeps formulae and values LTR", () => {
    render(<ChemicalEquations language="ar" onBack={vi.fn()} />);
    expect(screen.getByRole("main")).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("main")).toHaveAttribute("lang", "ar");
    expect(screen.getByRole("heading", { name: "المعادلات الكيميائية" })).toBeInTheDocument();
    expect(screen.getAllByText("تلميح للحفظ")).toHaveLength(19);
    const regions = screen.getAllByRole("region", { name: / · معادلة$/ });
    expect(regions).toHaveLength(19);
    for (const region of regions) expect(region).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("ΔH = −286 kJ/mol")).toHaveAttribute("dir", "ltr");
  });
  it("filters topics and searches within the selected topic", () => {
    render(<ChemicalEquations language="en" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Oxidation and reduction" }));
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getByRole("button", { name: "Oxidation and reduction" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zinc" } });
    expect(screen.getAllByRole("article")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getAllByRole("article")).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: "All topics" }));
    expect(screen.getAllByRole("article")).toHaveLength(19);
  });
  it("provides a reset action when there are no matching results", () => {
    render(<ChemicalEquations language="en" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Thermochemistry" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Zn" } });
    expect(screen.getByRole("heading", { name: "No matching equations" })).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(screen.getAllByRole("article")).toHaveLength(19);
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
  it("hides and reveals formulae and values independently in recall mode", () => {
    render(<ChemicalEquations language="en" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Practice recall" }));
    expect(screen.queryByText(chemicalEquations[0].formula)).not.toBeInTheDocument();
    expect(screen.queryByText("ΔH = −286 kJ/mol")).not.toBeInTheDocument();
    expect(screen.getAllByText("Memory hint")).toHaveLength(19);
    const first = screen.getAllByRole("article")[0];
    const second = screen.getAllByRole("article")[1];
    fireEvent.click(within(first).getByRole("button", { name: "Show equation" }));
    expect(within(first).getByText(chemicalEquations[0].formula)).toBeInTheDocument();
    expect(within(first).getByText("ΔH = −286 kJ/mol")).toBeInTheDocument();
    expect(within(second).queryByText(chemicalEquations[1].formula)).not.toBeInTheDocument();
    fireEvent.click(within(first).getByRole("button", { name: "Hide equation" }));
    expect(within(first).queryByText(chemicalEquations[0].formula)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show all equations" }));
    expect(screen.getAllByRole("region", { name: / · equations$/ })).toHaveLength(19);
  });
  it("keeps the important phase clarification expanded by default", () => {
    render(<ChemicalEquations language="en" onBack={vi.fn()} />);
    const solidExample = screen.getByRole("article", { name: "Equilibrium involving solids" });
    expect(within(solidExample).getByText(/Matching \(s\) labels alone/).closest("details")).toHaveAttribute("open");
  });
  it("calls the existing back-navigation handler", () => {
    const onBack = vi.fn();
    render(<ChemicalEquations language="en" onBack={onBack} />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
