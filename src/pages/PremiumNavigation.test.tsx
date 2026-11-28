import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Basics from "@/pages/Basics";
import SubjectsHub from "@/pages/SubjectsHub";
import { getStudyWeek } from "@/lib/todoSchedule";

const state = vi.hoisted(() => ({
  isPremium: false, loading: false, openInstagram: vi.fn(),
  todos: [] as { id: string; text: string; day?: string; done: boolean }[],
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
    rpc: vi.fn(async () => ({ data: { total_points: 1840, board_rank: 12, board_total: 100 }, error: null })),
  },
}));
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => state }));
vi.mock("@/lib/premium", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/premium")>(), openPremiumInstagram: state.openInstagram }));
vi.mock("@/lib/analytics", () => ({ trackFeature: vi.fn(), trackFeatureUnlocked: vi.fn(), trackStreakUpdated: vi.fn() }));
vi.mock("@/lib/todoTopicProgress", () => ({ useTodos: () => state.todos }));
vi.mock("@/lib/srs", () => ({ totalDueCount: async () => 0, dueBreakdown: async () => [] }));
vi.mock("@/components/VisitCounter", () => ({ default: () => null }));
vi.mock("@/components/GiftMcqButton", () => ({ default: () => null }));
vi.mock("@/components/StreakTree", () => ({ default: () => null }));
vi.mock("@/components/RankStone", () => ({ default: () => null }));
vi.mock("@/components/NewFeatureAnnouncement", () => ({ default: () => null }));
vi.mock("@/components/ChapterProgressCircles", () => ({ default: () => null }));
vi.mock("@/components/TelegramLinkCard", () => ({ TelegramLinkCard: () => <section aria-label="Connect Telegram" /> }));
beforeEach(() => { localStorage.clear(); state.isPremium = false; state.loading = false; state.todos = []; state.openInstagram.mockClear(); });
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("locked tool navigation", () => {
  it.each([false, true])("handles a catalog card with Premium = %s", async (premium) => {
    state.isPremium = premium;
    const onNav = vi.fn();
    await act(async () => { render(<Basics language="en" onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={onNav} initialShowAllTools />); });
    const card = screen.getByRole("button", { name: /MCQ Generator/ });
    expect(card).toHaveTextContent("Premium");
    expect(card).not.toBeDisabled();
    fireEvent.click(card);
    expect(onNav).toHaveBeenCalledWith("mcq");
    expect(state.openInstagram).not.toHaveBeenCalled();
  });
  it("waits for entitlement instead of redirecting or opening a paid tool early", async () => {
    state.loading = true;
    await act(async () => { render(<Basics language="en" onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={vi.fn()} initialShowAllTools />); });
    const card = screen.getByRole("button", { name: /MCQ Generator/ });
    expect(card).toBeDisabled();
    fireEvent.click(card);
    expect(state.openInstagram).not.toHaveBeenCalled();
  });
  it.each(["en", "ar"] as const)("routes a %s subject Premium tool through the app gate", async (language) => {
    localStorage.setItem("app_subject_focus_v1", "physics");
    const onSelect = vi.fn();
    await act(async () => { render(<SubjectsHub language={language} onBack={vi.fn()} onSelect={onSelect} />); });
    fireEvent.click(screen.getByRole("button", { name: language === "ar" ? "عرض الأدوات الإضافية" : "Show extra tools" }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(language === "ar" ? "توليد امتحان كامل" : "Full Exam Generator") }));
    expect(state.openInstagram).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith("examGenerator");
  });
  it("does not turn the existing hard lock into a paid unlock", async () => {
    localStorage.setItem("app_subject_focus_v1", "physics");
    await act(async () => { render(<SubjectsHub language="en" onBack={vi.fn()} onSelect={vi.fn()} />); });
    fireEvent.click(screen.getByRole("button", { name: "Show extra tools" }));
    fireEvent.click(screen.getByRole("button", { name: /Quick MCQ/ }));
    expect(state.openInstagram).not.toHaveBeenCalled();
  });
});

describe("simplified home navigation", () => {
  it("shows four primary actions and routes each one", async () => {
    const onSelect = vi.fn();
    const onNav = vi.fn();
    await act(async () => { render(<Basics language="en" onChangeLanguage={vi.fn()} onSelect={onSelect} onNav={onNav} />); });

    const continueButton = screen.getByRole("button", { name: /Continue studying/ });

    fireEvent.click(continueButton);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Recommended flashcards/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Recommended MCQs/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Recommended flashcards/ }));
    expect(onSelect).toHaveBeenCalledWith("flashcards");

    fireEvent.click(screen.getByRole("button", { name: /Back to home/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continue studying/ }));
    fireEvent.click(screen.getByRole("button", { name: /Recommended MCQs/ }));
    expect(onNav).toHaveBeenCalledWith("mcqBank");

    fireEvent.click(screen.getByRole("button", { name: /Back to home/ }));
    fireEvent.click(screen.getByRole("button", { name: /Choose a subject/ }));
    expect(onNav).toHaveBeenCalledWith("subjectsHub");
    fireEvent.click(screen.getByRole("button", { name: /Review mistakes/ }));
    expect(onNav).toHaveBeenCalledWith("mistakes");
    fireEvent.click(screen.getByRole("button", { name: /All tools/ }));
    expect(screen.getByRole("heading", { name: "All study tools" })).toBeInTheDocument();
  });

  it("supports the same simplified actions in Arabic RTL", async () => {
    await act(async () => { render(<Basics language="ar" onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={vi.fn()} />); });
    expect(screen.getByRole("button", { name: /كمّل دراستك/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /اختَر مادة/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /راجع أخطاءك/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /كل الأدوات/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /مسابقة الأستاذ محمد النداوي/ })).not.toBeInTheDocument();
  });

  it.each([
    ["en", "Open leaderboard, Gold rank", "Leaderboard position #12", /^View study progress/, "My progress and rank"],
    ["ar", "افتح ترتيب الطلاب، رتبتك ذهبي", "مركزك بالترتيب #١٢", /^عرض تقدّمك/, "تقدمي ورتبتي"],
  ] as const)("opens the leaderboard from either rank control in %s", async (language, stone, position, points, progressHeading) => {
    const onNav = vi.fn();
    await act(async () => { render(<Basics language={language} onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={onNav} />); });

    fireEvent.click(screen.getByRole("button", { name: stone }));
    expect(onNav).toHaveBeenNthCalledWith(1, "leaderboard");
    fireEvent.click(screen.getByRole("button", { name: position }));
    expect(onNav).toHaveBeenNthCalledWith(2, "leaderboard");

    fireEvent.click(screen.getByRole("button", { name: points }));
    expect(screen.getByRole("heading", { name: progressHeading })).toBeInTheDocument();
  });

  it("places today's actual planner tasks and the highlight cards above study actions", async () => {
    const week = getStudyWeek();
    const today = week.find((day) => day.isToday)!;
    const other = week.find((day) => !day.isToday)!;
    state.todos = [
      { id: "other", text: "Other-day task", day: other.key, done: false },
      { id: "one", text: "Read chemistry", day: today.ar, done: true },
      { id: "two", text: "Solve physics question", day: today.key, done: false },
      { id: "backlog", text: "Unscheduled task", done: false },
    ];
    localStorage.setItem("app_display_name_v1", "An extra long signed-in student name");
    const onSelect = vi.fn();
    await act(async () => { render(<Basics language="en" onChangeLanguage={vi.fn()} onSelect={onSelect} onNav={vi.fn()} />); });

    expect(screen.getByRole("heading", { name: "An extra long signed-in student name" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View study progress, 1,840 points" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Leaderboard position #12" })).toBeInTheDocument();
    const plan = screen.getByRole("region", { name: "Today's plan" });
    expect(within(plan).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    expect(within(plan).getByText("Solve physics question")).toBeInTheDocument();
    expect(within(plan).queryByText("Other-day task")).not.toBeInTheDocument();
    expect(within(plan).queryByText("Unscheduled task")).not.toBeInTheDocument();
    fireEvent.click(within(plan).getByRole("button", { name: "Open my schedule" }));
    expect(onSelect).toHaveBeenCalledWith("todo");

    const highlights = screen.getByRole("group", { name: "Tamayzak highlights" });
    fireEvent.click(within(highlights).getByRole("button", { name: "Join the challenge" }));
    expect(onSelect).toHaveBeenCalledWith("sessions");
    expect(within(highlights).getByRole("link", { name: "Buy from Houdini" })).toHaveAttribute("href", "https://www.instagram.com/houdini_st0re/");
    expect(within(highlights).getByRole("region", { name: "Connect Telegram" })).toBeInTheDocument();
    const points = within(highlights).getByRole("button", { name: "What can you do with points?" });
    expect(highlights.firstElementChild).toBe(points);
    expect(points.querySelector("img")).toHaveAttribute("src", expect.stringContaining("points-guide-lightning.webp"));
    expect(screen.getByRole("button", { name: "Show card 1 of 5" })).toHaveAttribute("aria-current", "true");
    expect(plan.compareDocumentPosition(highlights) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(highlights.compareDocumentPosition(screen.getByRole("button", { name: "Continue studying" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "What will you finish today?" })).not.toBeInTheDocument();
  });

  it.each([
    ["ar", "عروض تميّزك", "عندي ١٥ دقيقة", "المادة", "العودة للرئيسية"],
    ["en", "Tamayzak highlights", "I have 15 minutes", "Subject", "Back to home"],
  ] as const)("opens quick study from the highlight and restores focus in %s", async (language, group, title, subject, back) => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const queryClient = new QueryClient();
    await act(async () => { render(
      <QueryClientProvider client={queryClient}>
        <Basics language={language} onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={vi.fn()} />
      </QueryClientProvider>,
    ); });
    const highlight = () => within(screen.getByRole("group", { name: group })).getByRole("button", { name: title });
    expect(screen.getAllByRole("button", { name: title })).toEqual([highlight()]);
    expect(highlight().previousElementSibling).toHaveAttribute("id", "points-details-trigger");

    fireEvent.click(highlight());
    const detail = within(screen.getByRole("main"));
    expect(detail.getByRole("heading", { name: title })).toBeVisible();
    expect(detail.getByLabelText(subject)).toBeVisible();
    fireEvent.click(detail.getByRole("button", { name: back }));
    await waitFor(() => expect(highlight()).toHaveFocus());
  });

  it.each(["ar", "en"] as const)("shows all four points cards in %s and returns to the Home card", async (language) => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const isAr = language === "ar";
    const title = isAr ? "شتسوي بالنقاط ؟" : "What can you do with points?";
    const onNav = vi.fn();
    await act(async () => { render(<Basics language={language} onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={onNav} />); });
    fireEvent.click(screen.getByRole("button", { name: title }));
    const guide = within(screen.getByRole("main"));
    expect(guide.getByRole("heading", { name: title })).toBeVisible();
    const cards = within(guide.getByRole("list", { name: isAr ? "خيارات النقاط" : "Ways to use points" })).getAllByRole("listitem");
    expect(cards).toHaveLength(4);

    const tesla = within(cards[0]).getByRole("link", { name: isAr ? "متجر تيسلا" : "Tesla Store" });
    expect(tesla).toHaveAttribute("href", "https://www.instagram.com/tesl_astore/?utm_source=ig_web_button_share_sheet");
    expect(tesla).toHaveTextContent(isAr ? "خصم على التوصيل لكل ١٬٠٠٠ نقطة." : "Get a delivery discount for every 1,000 points.");
    expect(tesla.querySelector("img")).toHaveAttribute("src", expect.stringContaining("points-guide-lightning.webp"));

    const premium = within(cards[1]).getByRole("button", { name: isAr ? "بريميوم بالنقاط" : "Premium with points" });
    expect(premium).toHaveTextContent(isAr ? "كل ١٬٠٠٠ نقطة تفتح لك ٣ أيام بريميوم." : "Every 1,000 points gives you 3 days of Premium.");
    fireEvent.click(premium);
    expect(onNav).toHaveBeenNthCalledWith(1, "premium");

    expect(within(cards[2]).getByRole("link", { name: isAr ? "هوديني" : "Houdini" })).toHaveAttribute("href", "https://www.instagram.com/houdini_st0re/");

    const leaderboard = within(cards[3]).getByRole("button", { name: isAr ? "لوحة المتصدرين" : "Leaderboard" });
    expect(leaderboard).toHaveTextContent(isAr ? "مركزك الحالي · #١٢" : "Your current position · #12");
    fireEvent.click(leaderboard);
    expect(onNav).toHaveBeenNthCalledWith(2, "leaderboard");

    fireEvent.click(guide.getByRole("button", { name: isAr ? "العودة للرئيسية" : "Back to home" }));
    await waitFor(() => expect(screen.getByRole("button", { name: title })).toHaveFocus());
  });

  it("keeps the schedule shortcut visible with no tasks today", async () => {
    await act(async () => { render(<Basics language="en" onChangeLanguage={vi.fn()} onSelect={vi.fn()} onNav={vi.fn()} />); });
    const plan = within(screen.getByRole("region", { name: "Today's plan" }));
    expect(plan.getByText("No tasks scheduled for today.")).toBeInTheDocument();
    expect(plan.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(plan.getByRole("button", { name: "Open my schedule" })).toBeVisible();
  });
});
