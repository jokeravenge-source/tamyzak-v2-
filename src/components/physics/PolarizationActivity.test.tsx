import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PolarizationActivity from "./PolarizationActivity";

describe("PolarizationActivity", () => {
  it("lets the learner reach complete extinction", () => {
    render(<PolarizationActivity language="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Crossed 90°" }));
    expect(screen.getByText("Complete extinction")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Check setup" }));
    expect(screen.getByRole("status")).toHaveTextContent("Excellent");
  });

  it("renders the Arabic chapter-five activity", () => {
    render(<PolarizationActivity language="ar" />);

    expect(screen.getByText("الفصل الخامس · البصريات الفيزيائية")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "تأثير المادة المستقطبة في شدة الضوء المستقطب" })).toBeInTheDocument();
  });
});
