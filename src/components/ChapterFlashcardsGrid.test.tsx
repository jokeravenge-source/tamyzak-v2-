import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChapterFlashcardsGrid from "./ChapterFlashcardsGrid";
import { getFlashcardChapters } from "@/data/flashcardChapters";
import { chapterCardCount, chapterReviewProgress } from "@/lib/chapterCardCounts";
import { summarizeCard } from "@/lib/flashcardSummaryIdentity";
import type { SrsState } from "@/lib/srs";
import { flashcardsCh1 } from "@/data/flashcardsCh1";
import { flashcardsEngGrammar1 } from "@/data/flashcardsEngGrammar1";

const backend = vi.hoisted(() => ({
  extras: [] as { chapter: string; question: string; answer: string }[],
  deleted: [] as { chapter: number; card_id: string; deleted: boolean; question: null; answer: null }[],
  loadDeckStates: vi.fn(),
}));
vi.mock("@/lib/srs", () => ({ loadDeckStates: backend.loadDeckStates, isDue: () => true }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: (table: string) => {
  const query = {
    select: () => query, eq: () => query, order: () => query,
    range: async () => ({ data: table === "custom_flashcards" ? backend.extras : backend.deleted, error: null }),
  };
  return query;
} } }));
beforeEach(() => {
  backend.extras = []; backend.deleted = [];
  backend.loadDeckStates.mockReset();
  backend.loadDeckStates.mockImplementation(async (subject: string, chapter: string) => new Map(chapter === "1" ? [
    [`${subject}:1:${flashcardsCh1[0].q.replace(/\s+/g, " ").trim().slice(0, 180)}`, { lastRating: "good" }],
    [`${subject}:1:unrelated question`, { lastRating: "good" }],
    ["new", { lastRating: null }],
  ] : []));
});
afterEach(cleanup);

describe("Subject chapter cards", () => {
  it("uses language and teacher specific source counts", () => {
    expect(chapterCardCount("physics", "default", "ar", 1)).toBe(79);
    expect(chapterCardCount("physics", "default", "en", 1)).toBe(80);
    expect(chapterCardCount("biology", "nadia-al-nuaimi", "ar", 1)).toBe(184);
    expect(chapterCardCount("biology", "mohammed-al-anzi", "ar", 1)).toBe(150);
    expect(chapterCardCount("english", "literature", "en", 6)).toBe(18);
  });
  it("opens the selected chapter and shows actual progress and additions", async () => {
    backend.extras = [{ chapter: "1", question: "New approved question", answer: "New approved answer" }];
    const open = vi.fn();
    render(<ChapterFlashcardsGrid chapters={getFlashcardChapters("physics")} subject="physics" variant="default" language="en" onOpenChapter={open} />);
    const card = screen.getByRole("heading", { name: "Capacitors" }).closest("button")!;
    await waitFor(() => expect(within(card).getByText("81 cards")).toBeInTheDocument());
    expect(within(card).getByText("1 reviewed")).toBeInTheDocument();
    expect(within(card).getByText("1 due")).toBeInTheDocument();
    fireEvent.click(card);
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ n: 1 }));
  });
  it("preserves disabled chapters and mirrors the Arabic layout", async () => {
    const open = vi.fn();
    render(<ChapterFlashcardsGrid chapters={getFlashcardChapters("math")} subject="math" variant="default" language="ar" onOpenChapter={open} />);
    expect(screen.getByRole("region")).toHaveAttribute("dir", "rtl");
    const locked = screen.getAllByText("مقفل")[0].closest("button")!;
    expect(locked).toBeDisabled(); fireEvent.click(locked); expect(open).not.toHaveBeenCalled();
    await waitFor(() => expect(backend.loadDeckStates).toHaveBeenCalledTimes(2));
  });
  it("subtracts Ahmed source deletions and excludes extras the study deck does not show", async () => {
    backend.extras = [{ chapter: "1", question: "New question", answer: "New answer" }];
    backend.deleted = [{ chapter: 1, card_id: "CH1-001", deleted: true, question: null, answer: null }];
    render(<ChapterFlashcardsGrid chapters={getFlashcardChapters("chemistry")} subject="chemistry" variant="ahmed-al-nadawi" language="en" onOpenChapter={vi.fn()} />);
    const card = screen.getByRole("heading", { name: "Chapter 1" }).closest("button")!;
    await waitFor(() => expect(within(card).getByText("429 cards")).toBeInTheDocument());
  });
  it("does not carry English grammar reviews into literature", async () => {
    backend.loadDeckStates.mockResolvedValue(new Map([
      [`english:1:${flashcardsEngGrammar1[0].q.replace(/\s+/g, " ").trim().slice(0, 180)}`, { lastRating: "good" }],
    ]));
    render(<ChapterFlashcardsGrid chapters={getFlashcardChapters("english", "literature")} subject="english" variant="literature" language="en" onOpenChapter={vi.fn()} />);
    await waitFor(() => expect(backend.loadDeckStates).toHaveBeenCalledTimes(6));
    const card = screen.getByRole("heading", { name: "Section 1" }).closest("button")!;
    expect(within(card).getByText("0 reviewed")).toBeInTheDocument();
    expect(within(card).getByText("0%")).toBeInTheDocument();
  });
  it("matches long stored review keys whose 180-character cutoff ends on a space", () => {
    const question = `${"a".repeat(179)} long question`;
    const key = `physics:1:${question.slice(0, 180)}`;
    const progress = chapterReviewProgress("physics", 1, [summarizeCard(question, "answer")], new Map([[key, { lastRating: "good" } as SrsState]]));
    expect(progress).toEqual({ reviewed: 1, due: 1 });
  });
  it("deduplicates approved additions against the source deck", async () => {
    backend.extras = [{ chapter: "1", question: flashcardsCh1[0].q, answer: flashcardsCh1[0].a }];
    render(<ChapterFlashcardsGrid chapters={getFlashcardChapters("physics")} subject="physics" variant="default" language="en" onOpenChapter={vi.fn()} />);
    const card = screen.getByRole("heading", { name: "Capacitors" }).closest("button")!;
    await waitFor(() => expect(within(card).getByText("1 reviewed")).toBeInTheDocument());
    expect(within(card).getByText("80 cards")).toBeInTheDocument();
  });
});
