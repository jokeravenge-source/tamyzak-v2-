import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WaveInterferenceActivity from "./WaveInterferenceActivity";

describe("WaveInterferenceActivity", () => {
  it("includes the source tools, steps, and both interference conclusions", () => {
    render(<WaveInterferenceActivity language="ar" />);
    expect(screen.getByRole("heading", { name: "تداخل الموجات في حوض الماء" })).toBeInTheDocument();
    expect(screen.getByText("أدوات النشاط")).toBeInTheDocument();
    expect(screen.getByText("خطوات النشاط")).toBeInTheDocument();
    expect(screen.getAllByText("تداخل بنّاء").length).toBeGreaterThan(0);
    expect(screen.getByText(/تداخل هدّام/)).toBeInTheDocument();
  });

  it("lets the student stop the sources and change phase", () => {
    render(<WaveInterferenceActivity language="ar" />);
    fireEvent.click(screen.getByRole("button", { name: "إيقاف المصدرين" }));
    expect(screen.getByRole("button", { name: "تشغيل المصدرين" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider", { name: "فرق الطور بين المصدرين" }), { target: { value: "180" } });
    expect(screen.getByText("180°")).toBeInTheDocument();
  });
});
