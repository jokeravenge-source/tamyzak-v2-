import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FrenchFlashcardsDashboard from "./FrenchFlashcardsDashboard";
import {
  FRENCH_FLASHCARD_DECKS,
  FRENCH_FLASHCARD_TOTAL,
  getFrenchFlashcardDeck,
} from "@/data/frenchFlashcardDecks";

const srs = vi.hoisted(() => ({ loadDeckStates: vi.fn() }));
vi.mock("@/lib/srs", () => ({
  loadDeckStates: srs.loadDeckStates,
  isDue: (state: { dueAt: number }) => state.dueAt <= Date.now(),
}));

const state = (lastRating: "good" | "hard" | null, dueAt: number) => ({
  cardKey: "card", ease: 2.5, intervalDays: 1, reps: lastRating ? 1 : 0,
  lapses: 0, lastRating, dueAt,
});

beforeEach(() => {
  srs.loadDeckStates.mockReset();
  srs.loadDeckStates.mockImplementation(async (_subject: string, chapter: string) => {
    if (chapter === "1") return new Map([
      ["a", state("good", 0)],
      ["b", state("hard", Date.now() + 86_400_000)],
    ]);
    return new Map();
  });
});

describe("French flashcards dashboard", () => {
  it("uses the seven real French decks and their exact card total", () => {
    expect(FRENCH_FLASHCARD_DECKS).toHaveLength(7);
    expect(FRENCH_FLASHCARD_TOTAL).toBe(180);
    expect(FRENCH_FLASHCARD_DECKS.map((deck) => deck.cards.length)).toEqual([16, 30, 16, 28, 23, 30, 37]);
    expect(getFrenchFlashcardDeck(3)?.titleEn).toBe("Relative Pronouns");
  });

  it("includes every checked comprehension question with its answer", () => {
    const readingDeck = getFrenchFlashcardDeck(7)!;
    const expectedCounts = new Map([
      ["Jean Dugommier", 8],
      ["Rêves de gloire", 9],
      ["Rêves d’enfance", 8],
      ["Rêves de révolte", 5],
      ["Rêves de sagesse", 7],
    ]);

    expect(readingDeck.cards).toHaveLength(37);
    expect(new Set(readingDeck.cards.map((card) => card.q)).size).toBe(37);
    expect(readingDeck.cards.every((card) => card.q.trim() && card.a.trim())).toBe(true);
    for (const [title, count] of expectedCounts) {
      expect(readingDeck.cards.filter((card) => card.q.startsWith(`${title}\n`))).toHaveLength(count);
    }
  });

  it("shows every deck, progress, due cards and opens the selected deck", async () => {
    const openDeck = vi.fn();
    render(<FrenchFlashcardsDashboard language="en" onOpenDeck={openDeck} />);

    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    for (const deck of FRENCH_FLASHCARD_DECKS) {
      expect(screen.getByRole("heading", { name: deck.titleEn })).toBeInTheDocument();
    }
    await waitFor(() => expect(screen.getByText("2 / 180 · 1%")).toBeInTheDocument());
    expect(screen.getByText("1 due")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("heading", { name: "Plural" }).closest("button")!);
    expect(openDeck).toHaveBeenCalledWith(5);
  });

  it("continues with a deck that has cards due", async () => {
    const openDeck = vi.fn();
    render(<FrenchFlashcardsDashboard language="en" onOpenDeck={openDeck} />);
    const continueButton = await screen.findByRole("button", { name: /Continue reviewing/ });
    fireEvent.click(continueButton);
    expect(openDeck).toHaveBeenCalledWith(1);
  });

  it("renders the dashboard in Arabic", async () => {
    render(<FrenchFlashcardsDashboard language="ar" onOpenDeck={vi.fn()} />);
    expect(screen.getByRole("region", { name: "لوحة بطاقات الفرنسية" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "الاستفهام" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ابدأ المراجعة/ })).toBeInTheDocument();
    await waitFor(() => expect(srs.loadDeckStates).toHaveBeenCalledTimes(7));
  });
});
