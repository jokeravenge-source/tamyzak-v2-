import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FaradayInductionActivity from "./FaradayInductionActivity";

afterEach(() => {
  vi.useRealTimers();
});

describe("FaradayInductionActivity", () => {
  it("deflects in opposite directions when the switch closes and opens", () => {
    vi.useFakeTimers();
    render(<FaradayInductionActivity language="en" />);

    const needle = screen.getByTestId("faraday-needle");
    expect(needle).toHaveAttribute("data-direction", "center");

    fireEvent.click(screen.getByRole("button", { name: "Close the switch" }));
    expect(needle).toHaveAttribute("data-direction", "right");
    expect(screen.getByText("Deflection at closing")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1100));
    expect(needle).toHaveAttribute("data-direction", "center");

    fireEvent.click(screen.getByRole("button", { name: "Open the switch" }));
    expect(needle).toHaveAttribute("data-direction", "left");
    expect(screen.getByText("Opposite deflection at opening")).toBeInTheDocument();
  });

  it("shows the Arabic source-based activity and no MCQ controls", () => {
    render(<FaradayInductionActivity language="ar" />);

    expect(screen.getByRole("heading", { name: "تجربة فاراداي في الحث الكهرومغناطيسي" })).toBeInTheDocument();
    expect(screen.getByText("استنتاج فاراداي")).toBeInTheDocument();
    expect(screen.getByText("متى ينساب التيار المحث؟")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /تحقق|check answer/i })).not.toBeInTheDocument();
  });
});
