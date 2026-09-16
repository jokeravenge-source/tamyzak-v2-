import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Basics from "@/pages/Basics";
import SubjectsHub from "@/pages/SubjectsHub";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } } }));
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => ({ isPremium: false }) }));
vi.mock("@/lib/analytics", () => ({ trackFeature: vi.fn(), trackFeatureUnlocked: vi.fn(), trackStreakUpdated: vi.fn() }));
vi.mock("@/lib/todoTopicProgress", () => ({ useTodos: () => [] }));
vi.mock("@/lib/srs", () => ({ totalDueCount: async () => 0, dueBreakdown: async () => [] }));
vi.mock("@/components/VisitCounter", () => ({ default: () => null }));
vi.mock("@/components/GiftMcqButton", () => ({ default: () => null }));
vi.mock("@/components/StreakTree", () => ({ default: () => null }));
vi.mock("@/components/RankStone", () => ({ default: () => null }));

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe("Chemical Equation navigation", () => {
  it.each([["en", "Chemical Equation"], ["ar", "المعادلات الكيميائية"]] as const)("adds one chemistry-colored card in the %s tools catalog", async (language, title) => {
    const onNav = vi.fn();
    const onSelect = vi.fn();
    await act(async () => {
      render(<Basics language={language} onChangeLanguage={vi.fn()} onSelect={onSelect} onNav={onNav} initialShowAllTools />);
    });
    const card = screen.getByRole("button", { name: new RegExp(`^${title} `) });
    expect(card).toHaveClass("border-chemistry/40");
    fireEvent.click(card);
    expect(onNav).toHaveBeenCalledExactlyOnceWith("chemicalEquations");
    expect(onSelect).not.toHaveBeenCalled();
  });
  it("can be found by its purpose in catalog search", async () => {
    await act(async () => {
      render(<Basics language="en" onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={vi.fn()} initialShowAllTools />);
    });
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "memory hint" } });
    expect(screen.getByRole("button", { name: /^Chemical Equation / })).toBeInTheDocument();
  });
  it.each([["en", "Chemical Equation"], ["ar", "المعادلات الكيميائية"]] as const)("opens from Chemistry's extra tools without premium in %s", async (language, title) => {
    localStorage.setItem("app_subject_focus_v1", "chemistry");
    const onSelect = vi.fn();
    await act(async () => {
      render(<SubjectsHub language={language} onBack={vi.fn()} onSelect={onSelect} />);
    });
    fireEvent.click(screen.getByRole("button", { name: language === "ar" ? "عرض الأدوات الإضافية" : "Show extra tools" }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(title) }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("chemicalEquations");
  });
});
