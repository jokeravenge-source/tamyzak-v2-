import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import QuickStudy from "./QuickStudy";
import { loadQuickStudy, QUICK_STUDY_COUNTS, recommendQuickStudy } from "@/lib/quickStudy";
import { getQuickStudyChapters, QUICK_STUDY_SUBJECTS } from "@/lib/quickStudySources";
import { recordMistake, resolveMistake } from "@/lib/mistakes";
import { recordTopicPractice } from "@/lib/topicMastery";

const { rows, filters } = vi.hoisted(() => ({
  rows: {} as Record<string, Record<string, unknown>[]>,
  filters: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  from: (table: string) => {
    const conditions: ((row: Record<string, unknown>) => boolean)[] = [];
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => {
        filters(table, key, value);
        conditions.push(row => row[key] === value);
        return query;
      },
      in: (key: string, values: unknown[]) => {
        filters(table, key, values);
        conditions.push(row => values.includes(row[key]));
        return query;
      },
      order: () => query,
      limit: () => query,
      abortSignal: async () => ({ data: (rows[table] ?? []).filter(row => conditions.every(filter => filter(row))), error: null }),
    };
    return query;
  },
} }));
vi.mock("@/lib/mistakes", () => ({ recordMistake: vi.fn(), resolveMistake: vi.fn() }));
vi.mock("@/lib/topicMastery", async original => ({ ...await original<typeof import("@/lib/topicMastery")>(), recordTopicPractice: vi.fn() }));

const parallel = { id: "parallel", subject: "physics", chapter: 1, chapter_title: "Capacitors", language: "en",
  question: "Which quantity is constant in parallel?", choices: ["Voltage", "Charge"], answer_index: 0,
  explanation: "Each capacitor is connected across the same battery terminals.", section: "Capacitor combinations", sort_order: 122 };
const series = { ...parallel, id: "series", question: "Which quantity is constant in series?", answer_index: 1, explanation: null, sort_order: 125 };

function openReview(plannedTexts: string[] = []) {
  const onBack = vi.fn();
  render(<QueryClientProvider client={new QueryClient()}>
    <QuickStudy language="en" userId="student" plannedTexts={plannedTexts} profile={null} onBack={onBack} />
  </QueryClientProvider>);
  return onBack;
}

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  Object.keys(rows).forEach(table => delete rows[table]);
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

it("waits for a chapter, retains the planned capacitor topic, and grades scoped bank questions in a twenty-item round", async () => {
  rows.mcq_banks = [parallel, series, { ...parallel, id: "unrelated", chapter: 2, question: "Another chapter's question" }];
  rows.my_mistakes = [{ id: "miss-1", user_id: "student", subject: "physics", chapter: "1", resolved: false,
    question: parallel.question, ref_id: parallel.id, correct_answer: "Voltage" }];
  const onBack = openReview(["Capacitors – series and parallel"]);
  const start = screen.getByRole("button", { name: "Start review" });

  expect(start).toBeDisabled();
  expect(screen.getByLabelText("Chapter or unit")).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "physics" } });
  expect(filters).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Chapter or unit"), { target: { value: "1" } });
  await screen.findByText("From your plan");
  fireEvent.click(start);
  expect(screen.getByText("Card 1 of 20")).toBeVisible();
  expect(screen.getByRole("heading", { name: "What remains constant in a parallel connection?" })).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Start questions" }));
  expect(screen.getByText("Question 1 of 20")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Voltage" }));
  fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
  expect(screen.getByRole("status")).toHaveTextContent("Correct!");
  expect(resolveMistake).toHaveBeenCalledWith("miss-1", true);
  fireEvent.click(screen.getByRole("button", { name: "Next question" }));
  fireEvent.click(screen.getByRole("button", { name: "Voltage" }));
  fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
  expect(screen.getByRole("status")).toHaveTextContent("Correct answer Charge");
  expect(recordMistake).toHaveBeenCalledWith(expect.objectContaining({ refId: "series", correctAnswer: "Charge", userAnswer: "Voltage", subject: "physics", chapter: "1" }));
  for (let index = 2; index < 20; index++) {
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));
    fireEvent.click(screen.getAllByRole("button", { pressed: false })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
  }
  fireEvent.click(screen.getByRole("button", { name: "See result" }));
  expect(screen.getByRole("status")).toHaveTextContent("of 20 correct");
  expect(within(screen.getByRole("list")).getByText(series.question)).toBeVisible();
  expect(recordTopicPractice).toHaveBeenCalledTimes(20);
  expect(filters).toHaveBeenCalledWith("my_mistakes", "user_id", "student");
  fireEvent.click(screen.getByRole("button", { name: "Back to home" }));
  expect(onBack).toHaveBeenCalledOnce();
});

it("provides eight cards with reveal and navigation, then eight automatically graded questions in a sparse chapter", async () => {
  openReview(["Capacitors – series and parallel"]);
  const subject = screen.getByLabelText("Subject");
  const chapter = screen.getByLabelText("Chapter or unit");
  fireEvent.change(subject, { target: { value: "physics" } });
  fireEvent.change(chapter, { target: { value: "1" } });
  fireEvent.change(subject, { target: { value: "math" } });
  expect(chapter).toHaveValue("");
  fireEvent.change(chapter, { target: { value: "4" } });
  fireEvent.click(screen.getByRole("button", { name: /^5 minutes/ }));
  expect(screen.getByText("8 flashcards · 8 MCQs")).toBeVisible();
  const start = screen.getByRole("button", { name: "Start review" });
  await waitFor(() => expect(start).toBeEnabled());
  fireEvent.click(start);
  expect(screen.getByText("Card 1 of 8")).toBeVisible();
  expect(screen.getByRole("heading", { name: "Evaluate ∫ (3x² − 4) dx." })).toBeVisible();
  expect(screen.queryByText("x³ − 4x + C.")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Reveal answer" }));
  expect(screen.getByText("x³ − 4x + C.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Next card" }));
  expect(screen.getByRole("button", { name: "Reveal answer" })).toBeVisible();
  expect(screen.getByText("Card 2 of 8")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Previous card" }));
  expect(screen.getByText("Card 1 of 8")).toBeVisible();
  for (let index = 1; index < 8; index++) fireEvent.click(screen.getByRole("button", { name: "Next card" }));
  expect(screen.getByText("Card 8 of 8")).toBeVisible();
  expect(screen.getByRole("button", { name: "Next card" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Start questions" }));
  expect(screen.getByText("Question 1 of 8")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Reveal answer" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "4" }));
  fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
  expect(screen.getByRole("status")).toHaveTextContent("Correct!");
  expect(recordTopicPractice).toHaveBeenCalledWith(expect.objectContaining({ subject: "math", chapter: "4", correct: true, source: "mcq_bank" }));
  for (let index = 1; index < 8; index++) {
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));
    fireEvent.click(screen.getAllByRole("button", { pressed: false })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
  }
  fireEvent.click(screen.getByRole("button", { name: "See result" }));
  expect(screen.getByRole("status")).toHaveTextContent("of 8 correct");
  fireEvent.click(screen.getByRole("button", { name: "Choose a chapter" }));
  expect(screen.getByLabelText("Chapter or unit")).toHaveValue("4");
});

it("distinguishes the two sets of Arabic chapter numbers using the actual topic name", async () => {
  rows.mcq_banks = [
    { ...parallel, id: "interrogation", subject: "arabic", chapter: 2, chapter_title: "الاستفهام", language: "ar" },
    { ...series, id: "exclamation", subject: "arabic", chapter: 2, chapter_title: "التعجب", language: "ar" },
  ];
  const signal = new AbortController().signal;
  const data = await loadQuickStudy({ subject: "arabic", chapter: "ar-taajub" }, "ar", null, signal);
  expect(data.questions.map(question => question.id)).toEqual(["exclamation"]);
});

it("provides distinct flashcards and automatically graded MCQs in both lengths for every chapter", async () => {
  const signal = new AbortController().signal;
  const gaps: string[] = [];
  for (const language of ["ar", "en"] as const) {
    await Promise.all(QUICK_STUDY_SUBJECTS.flatMap(({ id: subject }) => getQuickStudyChapters(subject).map(async ({ key: chapter }) => {
      const selection = { subject, chapter };
      const data = await loadQuickStudy(selection, language, null, signal);
      for (const count of Object.values(QUICK_STUDY_COUNTS)) {
        const round = recommendQuickStudy({ selection, data, language, count, plannedTexts: [], profile: null });
        const label = `${subject}/${chapter}/${language}/${count}`;
        if (round?.cards.length !== count || round?.questions.length !== count) {
          gaps.push(`${label}: ${round?.cards.length ?? 0} cards & ${round?.questions.length ?? 0} MCQs`);
          continue;
        }
        expect(new Set(round.cards.map(card => card.q)).size, label).toBe(count);
        expect(new Set(round.questions.map(question => question.question)).size, label).toBe(count);
        expect(round.questions.every(question => question.choices.length >= 2 &&
          question.choices.length === new Set(question.choices).size &&
          Boolean(question.choices[question.answer_index])), label).toBe(true);
      }
    })));
  }
  expect(gaps.sort()).toEqual([]);
}, 20_000);
