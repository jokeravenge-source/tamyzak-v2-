import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Basics from "@/pages/Basics";
import SubjectsHub from "@/pages/SubjectsHub";

const state = vi.hoisted(() => ({ isPremium: false, loading: false, openTelegram: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } } }));
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => state }));
vi.mock("@/lib/premium", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/premium")>(), openPremiumTelegram: state.openTelegram }));
vi.mock("@/lib/analytics", () => ({ trackFeature: vi.fn(), trackFeatureUnlocked: vi.fn(), trackStreakUpdated: vi.fn() }));
vi.mock("@/lib/todoTopicProgress", () => ({ useTodos: () => [] }));
vi.mock("@/lib/srs", () => ({ totalDueCount: async () => 0, dueBreakdown: async () => [] }));
vi.mock("@/components/VisitCounter", () => ({ default: () => null }));
vi.mock("@/components/GiftMcqButton", () => ({ default: () => null }));
vi.mock("@/components/StreakTree", () => ({ default: () => null }));
vi.mock("@/components/RankStone", () => ({ default: () => null }));
beforeEach(() => { localStorage.clear(); state.isPremium = false; state.loading = false; state.openTelegram.mockClear(); });
afterEach(cleanup);
describe("locked tool navigation", () => {
  it.each([false, true])("handles a catalog card with Premium = %s", async (premium) => {
    state.isPremium = premium;
    const onNav = vi.fn();
    await act(async () => { render(<Basics language="en" onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={onNav} initialShowAllTools />); });
    const card = screen.getByRole("button", { name: /MCQ Generator/ });
    expect(card).toHaveTextContent("Premium");
    expect(card).not.toBeDisabled();
    fireEvent.click(card);
    if (premium) {
      expect(onNav).toHaveBeenCalledWith("mcq");
      expect(state.openTelegram).not.toHaveBeenCalled();
    } else {
      expect(onNav).not.toHaveBeenCalled();
      expect(state.openTelegram).toHaveBeenCalledOnce();
    }
  });
  it("waits for entitlement instead of redirecting or opening a paid tool early", async () => {
    state.loading = true;
    await act(async () => { render(<Basics language="en" onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={vi.fn()} initialShowAllTools />); });
    const card = screen.getByRole("button", { name: /MCQ Generator/ });
    expect(card).toBeDisabled();
    fireEvent.click(card);
    expect(state.openTelegram).not.toHaveBeenCalled();
  });
  it.each(["en", "ar"] as const)("routes the %s subject AI lock to Telegram", async (language) => {
    localStorage.setItem("app_subject_focus_v1", "physics");
    const onSelect = vi.fn();
    await act(async () => { render(<SubjectsHub language={language} onBack={vi.fn()} onSelect={onSelect} />); });
    fireEvent.click(screen.getByRole("button", { name: language === "ar" ? "عرض الأدوات الإضافية" : "Show extra tools" }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(language === "ar" ? "المعلم الذكي" : "AI Tutor") }));
    expect(state.openTelegram).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });
  it("does not turn the existing hard lock into a paid unlock", async () => {
    localStorage.setItem("app_subject_focus_v1", "physics");
    await act(async () => { render(<SubjectsHub language="en" onBack={vi.fn()} onSelect={vi.fn()} />); });
    fireEvent.click(screen.getByRole("button", { name: "Show extra tools" }));
    fireEvent.click(screen.getByRole("button", { name: /Quick MCQ/ }));
    expect(state.openTelegram).not.toHaveBeenCalled();
  });
});

describe("simplified home navigation", () => {
  it("shows four primary actions and routes each one", async () => {
    const onSelect = vi.fn();
    const onNav = vi.fn();
    await act(async () => { render(<Basics language="en" onChangeLanguage={vi.fn()} onSelect={onSelect} onNav={onNav} />); });

    const continueButton = screen.getByRole("button", { name: /Continue studying/ });
    const subjectsButton = screen.getByRole("button", { name: /Choose a subject/ });
    const mistakesButton = screen.getByRole("button", { name: /Review mistakes/ });
    const allToolsButton = screen.getByRole("button", { name: /All tools/ });

    fireEvent.click(continueButton);
    expect(onSelect).toHaveBeenCalledWith("flashcards");
    fireEvent.click(subjectsButton);
    expect(onNav).toHaveBeenCalledWith("subjectsHub");
    fireEvent.click(mistakesButton);
    expect(onNav).toHaveBeenCalledWith("mistakes");
    fireEvent.click(allToolsButton);
    expect(screen.getByRole("heading", { name: "All study tools" })).toBeInTheDocument();
  });

  it("supports the same simplified actions in Arabic RTL", async () => {
    await act(async () => { render(<Basics language="ar" onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={vi.fn()} />); });
    expect(screen.getByRole("button", { name: /كمّل دراستك/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /اختَر مادة/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /راجع أخطاءك/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /كل الأدوات/ })).toBeInTheDocument();
  });
});
