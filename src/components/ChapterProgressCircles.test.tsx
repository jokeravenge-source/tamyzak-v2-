import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ChapterProgressCircles from "@/components/ChapterProgressCircles";
import { loadTopicPractice, type PracticeAttempt } from "@/lib/topicMastery";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/lib/topicMastery", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/topicMastery")>(),
  loadTopicPractice: vi.fn(),
}));

function attempt(subject: string, chapter: string, source: PracticeAttempt["source"], key: string, correct: boolean): PracticeAttempt {
  return { subject, chapter, category_key: `${subject}:${chapter}:general`, source, question_key: key, correct, created_at: "2026-11-24T12:00:00Z" };
}

afterEach(() => {
  cleanup();
  vi.mocked(loadTopicPractice).mockReset();
});

describe("chapter progress rings", () => {
  it("renders self-rated practice and early MCQ scores in the rings", async () => {
    vi.mocked(loadTopicPractice).mockResolvedValue([
      ...Array.from({ length: 8 }, (_, i) => attempt("chemistry", "7", "flashcards", String(i), true)),
      ...Array.from({ length: 4 }, (_, i) => attempt("biology", "1", "ministerial_bank", String(i), i === 0)),
      attempt("physics", "1", "mcq_bank", "first", false),
    ]);
    render(<ChapterProgressCircles language="en" />);

    const chemistry = await screen.findByRole("button", { name: /Chemistry.*Self-rated review 100%/i });
    const biology = screen.getByRole("button", { name: /Biology.*Self-rated review 25%/i });
    const physics = screen.getByRole("button", { name: /Physics.*Early MCQ accuracy 0%/i });
    expect(within(chemistry).getByText("100%", { exact: true })).toBeVisible();
    expect(within(biology).getByText("25%", { exact: true })).toBeVisible();
    expect(within(physics).getByText("0%", { exact: true })).toBeVisible();
  });

  it("updates the ring to graded accuracy as soon as three distinct graded answers are available", async () => {
    const attempts = [
      attempt("physics", "1", "flashcards", "card", false),
      attempt("physics", "1", "mcq_bank", "first", true),
    ];
    const load = vi.mocked(loadTopicPractice);
    load.mockResolvedValue(attempts);
    render(<ChapterProgressCircles language="en" />);

    const card = await screen.findByRole("button", { name: /Physics.*Self-rated review 0%/i });
    expect(within(card).getByText("1 graded MCQ · 100% correct")).toBeVisible();

    load.mockResolvedValue([
      ...attempts,
      attempt("physics", "1", "mcq_bank", "second", true),
      attempt("physics", "1", "mcq_bank", "third", false),
    ]);
    fireEvent(window, new Event("app:progress-updated"));

    const graded = await screen.findByRole("button", { name: /Physics.*MCQ accuracy 67%/i });
    expect(within(graded).getByText("67%", { exact: true })).toBeVisible();
    expect(within(graded).getByText("Self ratings 0% of 1")).toBeVisible();
  });
});
