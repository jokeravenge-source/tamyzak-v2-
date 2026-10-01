import { describe, expect, it } from "vitest";
import { flashcardsBioCh1NadiaAr } from "./flashcardsBioCh1NadiaAr";
import { flashcardsBioCh2NadiaAr } from "./flashcardsBioCh2NadiaAr";
import { flashcardsBioCh3NadiaAr } from "./flashcardsBioCh3NadiaAr";
import { flashcardsBioCh4NadiaAr } from "./flashcardsBioCh4NadiaAr";
import { flashcardsBioCh5NadiaAr } from "./flashcardsBioCh5NadiaAr";
import { flashcardsBioCh5NadiaEn } from "./flashcardsBioCh5NadiaEn";

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

  it("contains all 120 translated Chapter 4 cards", () => {
    expect(flashcardsBioCh4NadiaAr).toHaveLength(120);
    expect(flashcardsBioCh4NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh4NadiaAr.every((card) => card.a.trim())).toBe(true);
  });

  it("contains all 330 translated Chapter 5 cards", () => {
    expect(flashcardsBioCh5NadiaAr).toHaveLength(330);
    expect(flashcardsBioCh5NadiaAr.every((card) => arabicText.test(card.q))).toBe(true);
    expect(flashcardsBioCh5NadiaAr.every((card) => card.a.trim())).toBe(true);
  });

  it("preserves the critical Chapter 5 numbers and genetic notation", () => {
    expect(flashcardsBioCh5NadiaAr[44].a).toBe("14.");
    expect(flashcardsBioCh5NadiaAr[51].a).toBe("8.");
    expect(flashcardsBioCh5NadiaAr[55].a).toBe("46.");
    expect(flashcardsBioCh5NadiaAr[72].a).toBe("1 TT : 2 Tt : 1 tt.");
    expect(flashcardsBioCh5NadiaAr[81].a).toBe("9:3:3:1.");
    expect(flashcardsBioCh5NadiaAr[128].a).toBe("بينهما سيادة مشتركة.");
    expect(flashcardsBioCh5NadiaAr[173].a).toContain("³²P");
    expect(flashcardsBioCh5NadiaAr[175].a).toContain("³⁵S");
    expect(flashcardsBioCh5NadiaAr[214].a).toBe("AGA CAC CTG.");
  });

  it("keeps every numeric value aligned with the Chapter 5 English source", () => {
    const numericTokens = (value: string) => value.match(/\d+(?:\.\d+)?/g) ?? [];

    flashcardsBioCh5NadiaEn.forEach((card, index) => {
      expect(numericTokens(`${flashcardsBioCh5NadiaAr[index].q} ${flashcardsBioCh5NadiaAr[index].a}`))
        .toEqual(numericTokens(`${card.q} ${card.a}`));
    });
  });
});
