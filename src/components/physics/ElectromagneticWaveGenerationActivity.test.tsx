import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ElectromagneticWaveGenerationActivity from "./ElectromagneticWaveGenerationActivity";

describe("ElectromagneticWaveGenerationActivity", () => {
  afterEach(() => vi.useRealTimers());

  it("shows the four generation stages and conclusion", () => {
    vi.useFakeTimers();
    render(<ElectromagneticWaveGenerationActivity language="ar" />);
    expect(screen.getByRole("heading", { name: "كيف تتولد الموجات الكهرومغناطيسية؟" })).toBeInTheDocument();
    expect(screen.getByText("مراحل توليد الموجة")).toBeInTheDocument();
    expect(screen.getAllByRole("button").filter((button) => /^[١٢٣٤1234]/.test(button.textContent ?? ""))).toHaveLength(4);
    expect(screen.getByText("الاستنتاج")).toBeInTheDocument();
  });

  it("lets the student pause and reverse charge motion", () => {
    render(<ElectromagneticWaveGenerationActivity language="ar" />);
    fireEvent.click(screen.getByRole("button", { name: "إيقاف الاهتزاز" }));
    expect(screen.getByRole("button", { name: "تشغيل الاهتزاز" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "عكس اتجاه الحركة" }));
  });
});
