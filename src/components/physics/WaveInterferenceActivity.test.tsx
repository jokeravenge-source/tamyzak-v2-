import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WaveInterferenceActivity from "./WaveInterferenceActivity";

describe("WaveInterferenceActivity", () => {
  it("includes the source tools, steps, and both interference conclusions", () => {
    render(<WaveInterferenceActivity language="ar" />);
    expect(screen.getByRole("heading", { name: "تداخل الموجات في حوض الماء" })).toBeInTheDocument();
    expect(screen.getByText("أدوات النشاط")).toBeInTheDocument();
    expect(screen.getByText("خطوات النشاط")).toBeInTheDocument();
    expect(screen.getByText(/عندما تكون الموجتان في الطور نفسه/)).toBeInTheDocument();
    expect(screen.getByText(/عندما تكون الموجتان بطورين متعاكسين/)).toBeInTheDocument();
  });

  it("keeps the tank still until the student turns on the source, then generates wave patterns", () => {
    render(<WaveInterferenceActivity language="ar" />);
    expect(screen.getByText("المصدر متوقف · سطح الماء ساكن")).toBeInTheDocument();
    expect(screen.queryAllByTestId("wave-pattern")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /تشغيل مصدر الموجات/ }));
    expect(screen.getByText("المصدر يعمل · الموجات تنتشر")).toBeInTheDocument();
    expect(screen.getAllByTestId("wave-pattern")).toHaveLength(16);
    expect(screen.getByRole("button", { name: /إيقاف مصدر الموجات/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByRole("slider", { name: "فرق الطور بين المصدرين" }), { target: { value: "180" } });
    expect(screen.getByText("180°")).toBeInTheDocument();
  });
});
