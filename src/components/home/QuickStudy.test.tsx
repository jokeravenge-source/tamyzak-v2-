import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import QuickStudy from "./QuickStudy";
import { recommendQuickStudy, type QuickStudyQuestion } from "@/lib/quickStudy";
import { recordMistake, resolveMistake } from "@/lib/mistakes";
import { recordTopicPractice } from "@/lib/topicMastery";

const { bank, mistakes, filters } = vi.hoisted(() => ({ bank: [] as unknown[], mistakes: [] as unknown[], filters: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  from: (table: string) => {
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => { filters(table, key, value); return query; },
      order: () => query,
      limit: async () => ({ data: table === "my_mistakes" ? mistakes : bank, error: null }),
    };
    return query;
  },
} }));
vi.mock("@/lib/mistakes", () => ({ recordMistake: vi.fn(), resolveMistake: vi.fn() }));
vi.mock("@/lib/topicMastery", async original => ({ ...await original<typeof import("@/lib/topicMastery")>(), recordTopicPractice: vi.fn() }));

const parallel: QuickStudyQuestion = { id: "parallel", question: "Which quantity is constant in parallel?", choices: ["Voltage", "Charge"], answer_index: 0,
  explanation: "Each capacitor is connected across the same battery terminals.", section: "Capacitor combinations", sort_order: 122 };
const series: QuickStudyQuestion = { ...parallel, id: "series", question: "Which quantity is constant in series?", answer_index: 1, explanation: null, sort_order: 125 };
const dielectric: QuickStudyQuestion = { ...parallel, id: "dielectric", question: "What stays fixed with a connected battery and a dielectric?",
  section: "Dielectrics & experimental activities", sort_order: 120 };
const disconnected: QuickStudyQuestion = { ...dielectric, id: "disconnected", question: "What stays fixed after disconnecting the battery?",
  answer_index: 1, sort_order: 118 };

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  bank.length = 0;
  mistakes.length = 0;
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

it("reviews the planned topic and grades two bank questions without revising the rest of the plan", async () => {
  bank.push(parallel, series, dielectric, disconnected);
  mistakes.push({ id: "miss-1", question: parallel.question, ref_id: parallel.id, correct_answer: "Voltage" });
  const onBack = vi.fn();
  render(<QueryClientProvider client={new QueryClient()}>
    <QuickStudy language="en" userId="student" plannedTexts={["Capacitors – series and parallel"]} profile={null} onBack={onBack} />
  </QueryClientProvider>);

  fireEvent.click(await screen.findByRole("button", { name: "Start review" }));
  expect(screen.getByText("From the Chapter 1 flashcards")).toBeVisible();
  expect(screen.getByRole("heading", { name: "What remains constant in a parallel connection?" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Start questions" }));
  expect(screen.getByText("Question 1 of 2")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Voltage" }));
  fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
  expect(screen.getByRole("status")).toHaveTextContent("Correct!");
  expect(resolveMistake).toHaveBeenCalledWith("miss-1", true);
  fireEvent.click(screen.getByRole("button", { name: "Next question" }));
  fireEvent.click(screen.getByRole("button", { name: "Voltage" }));
  fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
  expect(screen.getByRole("status")).toHaveTextContent("Correct answer Charge");
  expect(recordMistake).toHaveBeenCalledWith(expect.objectContaining({ refId: "series", correctAnswer: "Charge", userAnswer: "Voltage" }));
  fireEvent.click(screen.getByRole("button", { name: "See result" }));
  expect(screen.getByRole("status")).toHaveTextContent("1 of 2 correct");
  expect(within(screen.getByRole("list")).getByText(series.question)).toBeVisible();
  expect(recordTopicPractice).toHaveBeenCalledTimes(2);
  expect(filters).toHaveBeenCalledWith("my_mistakes", "user_id", "student");
  fireEvent.click(screen.getByRole("button", { name: "Back to home" }));
  expect(onBack).toHaveBeenCalledOnce();
});

it("uses a real recent mistake when today's tasks are outside the pilot", () => {
  const rec = recommendQuickStudy({ questions: [parallel, series, dielectric, disconnected], plannedTexts: ["English series practice"],
    mistakes: [{ id: "miss-2", question: dielectric.question, ref_id: "dielectric", correct_answer: "Voltage" }],
    profile: null, language: "en", count: 1 });
  expect(rec?.reason).toBe("mistake");
  expect(rec?.cards[0].q).toContain("connected to a battery");
  expect(rec?.questions.map(question => question.id)).toEqual(["dielectric"]);
  expect(recommendQuickStudy({ questions: [parallel, { ...parallel, id: "duplicate" }], plannedTexts: [], mistakes: [], profile: null,
    language: "en", count: 2 })).toBeNull();
});
