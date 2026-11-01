import { describe, expect, it } from "vitest";
import { getFlashcardChapters } from "./flashcardChapters";
import {
  ENGLISH_LITERATURE_DECKS,
  ENGLISH_LITERATURE_FLASHCARD_TOTAL,
  getEnglishLiteratureDeck,
} from "./englishLiteratureFlashcards";

describe("English literature flashcards", () => {
  it("keeps all six sections separate with the checked card counts", () => {
    expect(ENGLISH_LITERATURE_DECKS).toHaveLength(6);
    expect(ENGLISH_LITERATURE_DECKS.map((deck) => deck.cards.length)).toEqual([29, 31, 15, 26, 28, 18]);
    expect(ENGLISH_LITERATURE_FLASHCARD_TOTAL).toBe(147);
  });

  it("contains one complete answer for every unique question in each section", () => {
    for (const deck of ENGLISH_LITERATURE_DECKS) {
      expect(new Set(deck.cards.map((card) => card.q)).size).toBe(deck.cards.length);
      expect(deck.cards.every((card) => card.q.trim().length > 0 && card.a.trim().length > 0)).toBe(true);
    }
  });

  it("places the supplied vocabulary in the correct sections", () => {
    expect(getEnglishLiteratureDeck(5)?.cards).toContainEqual({
      q: "What does 'Tone' mean?",
      a: "The way someone speaks.",
    });
    expect(getEnglishLiteratureDeck(6)?.cards).toContainEqual({
      q: "What does 'Generous' mean?",
      a: "Nice, kind.",
    });
  });

  it("unlocks the six literature sections in the chapter picker", () => {
    const chapters = getFlashcardChapters("english", "literature");
    expect(chapters.map((chapter) => chapter.n)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(chapters.every((chapter) => !chapter.locked)).toBe(true);
  });
});
