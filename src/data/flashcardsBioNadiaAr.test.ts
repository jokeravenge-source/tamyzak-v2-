import { describe, expect, it } from "vitest";
import { flashcardsBioCh1NadiaAr } from "./flashcardsBioCh1NadiaAr";
import { flashcardsBioCh2NadiaAr } from "./flashcardsBioCh2NadiaAr";
import { flashcardsBioCh3NadiaAr } from "./flashcardsBioCh3NadiaAr";

const arabicText = /[\u0600-\u06ff]/;

describe("Arabic Nadia Al-Nuaimi Biology decks", () => {
  it("contains all 186 translated Chapter 1 cards", () => {
    expect(flashcardsBioCh1NadiaAr).toHaveLength(186);
    expect(flashcardsBioCh1NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh1NadiaAr.every((card) => card.a.trim())).toBe(true);
  });

  it("contains all 138 translated Chapter 2 cards", () => {
    expect(flashcardsBioCh2NadiaAr).toHaveLength(138);
    expect(flashcardsBioCh2NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh2NadiaAr.every((card) => card.a.trim())).toBe(true);
  });

  it("contains all 264 translated Chapter 3 cards", () => {
    expect(flashcardsBioCh3NadiaAr).toHaveLength(264);
    expect(flashcardsBioCh3NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh3NadiaAr.every((card) => card.a.trim())).toBe(true);
  });
});
