import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SubjectsHub from "./SubjectsHub";

vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => ({ isPremium: false, loading: false }),
}));
vi.mock("@/lib/analytics", () => ({
  trackFeature: vi.fn(),
  trackFeatureUnlocked: vi.fn(),
}));
vi.mock("@/lib/premium", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/premium")>(),
  openPremiumTelegram: vi.fn(),
}));

describe("French Conjugator navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("app_subject_focus_v1", "french");
  });

  it("opens as a free tool from the French subject", () => {
    const onSelect = vi.fn();
    render(<SubjectsHub language="en" onBack={vi.fn()} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "Show extra tools" }));
    const tool = screen.getByRole("button", { name: /French Conjugator/ });
    expect(tool).toHaveTextContent("FREE");
    fireEvent.click(tool);

    expect(onSelect).toHaveBeenCalledWith("frenchConjugator");
  });
});
