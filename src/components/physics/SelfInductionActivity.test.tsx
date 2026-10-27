import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SelfInductionActivity from "./SelfInductionActivity";

describe("SelfInductionActivity", () => {
  it("shows no glow on closing and a flash on opening", () => {
    render(<SelfInductionActivity language="en" />);

    fireEvent.click(screen.getAllByRole("button", { name: "Switch closed" }).at(-1)!);
    expect(screen.getByText("Current is building")).toBeInTheDocument();
    expect(screen.getByTestId("self-induction-lamp")).toHaveAttribute("data-glowing", "false");

    fireEvent.click(screen.getAllByRole("button", { name: "Switch opened" }).at(-1)!);
    expect(screen.getByTestId("self-induction-lamp")).toHaveAttribute("data-glowing", "true");
    expect(screen.getAllByText("Induced EMF spike").length).toBeGreaterThan(0);
  });

  it("includes the source tools, steps, conclusion, and no MCQs", () => {
    render(<SelfInductionActivity language="ar" />);

    expect(screen.getByRole("heading", { name: "توليد قوة دافعة كهربائية حثية ذاتيًا عند طرفي الملف" })).toBeInTheDocument();
    expect(screen.getAllByText("بطارية 9 فولت").length).toBeGreaterThan(0);
    expect(screen.getByText("خطوات النشاط")).toBeInTheDocument();
    expect(screen.getByText("الاستنتاج")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /تحقق|check answer/i })).not.toBeInTheDocument();
  });
});
