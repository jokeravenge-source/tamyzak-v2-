import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InducedEmfFactorsActivity from "./InducedEmfFactorsActivity";

describe("InducedEmfFactorsActivity", () => {
  it("lets the student compare all three induction factors", () => {
    render(<InducedEmfFactorsActivity language="en" />);

    expect(screen.getByRole("button", { name: /Magnet speed/i })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /Coil turns/i }));
    expect(screen.getByRole("button", { name: /Coil turns/i })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Move magnet in" }));
    expect(screen.getByText("An induced EMF is being generated")).toBeInTheDocument();
    expect(Number(screen.getByTestId("emf-needle").getAttribute("data-strength"))).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Current change/i }));
    expect(screen.getByRole("button", { name: "Change the current" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Pull magnet out" })).toBeDisabled();
  });

  it("renders Arabic tools, steps, and conclusion without MCQs", () => {
    render(<InducedEmfFactorsActivity language="ar" />);

    expect(screen.getByRole("heading", { name: "العوامل المؤثرة في القوة الدافعة الكهربائية الحثية" })).toBeInTheDocument();
    expect(screen.getByText("أدوات النشاط")).toBeInTheDocument();
    expect(screen.getByText("الاستنتاج")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /تحقق|check answer/i })).not.toBeInTheDocument();
  });
});
