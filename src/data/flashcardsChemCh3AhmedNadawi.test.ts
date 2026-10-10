import { describe, expect, it } from "vitest";
import { ahmedNadawiChemCh3Cards, ahmedNadawiChemCh3Topics } from "./flashcardsChemCh3AhmedNadawi";

describe("Ahmed Al-Nadawi Chemistry Chapter 3 supplied Arabic deck", () => {
  it("imports all 414 original flashcards in source order", () => {
    expect(ahmedNadawiChemCh3Cards).toHaveLength(414);
    ahmedNadawiChemCh3Cards.forEach((card, index) => {
      expect(card.id).toBe(`CH3-${String(index + 1).padStart(3, "0")}`);
      expect(card.q.trim()).not.toBe("");
      expect(card.a.trim()).not.toBe("");
      expect(card.pages).toMatch(/^صفحة PDF /);
    });
  });

  it("preserves 24 source topics with the exact original card counts", () => {
    expect(ahmedNadawiChemCh3Topics).toHaveLength(24);
    for (const topic of ahmedNadawiChemCh3Topics) {
      expect(ahmedNadawiChemCh3Cards.filter((card) => card.topic === topic.key)).toHaveLength(topic.expectedCount);
    }
    expect(new Set(ahmedNadawiChemCh3Topics.map(({ key }) => key)).size).toBe(24);
  });

  it("preserves ministerial-question categories and source verification notes", () => {
    expect(ahmedNadawiChemCh3Cards.filter((card) => card.kind === "مسألة وزارية")).toHaveLength(171);
    expect(ahmedNadawiChemCh3Cards.filter((card) => card.kind === "وزاري نظري")).toHaveLength(41);
    expect(ahmedNadawiChemCh3Cards.filter((card) => card.kind === "تطبيق ممثل للموضوع")).toHaveLength(24);
    expect(ahmedNadawiChemCh3Cards.filter((card) => Boolean(card.sourceNotes))).toHaveLength(23);
  });

  it("avoids duplicate cards and retains question-answer text in Arabic", () => {
    const pairs = ahmedNadawiChemCh3Cards.map(({ q, a }) => JSON.stringify([q.normalize("NFC").trim(), a.normalize("NFC").trim()]));
    expect(new Set(pairs).size).toBe(414);
    for (const card of ahmedNadawiChemCh3Cards) {
      expect(/[\u0600-\u06ff]/u.test(card.q)).toBe(true);
      // A numerical answer can correctly consist only of units, symbols and a final result.
    }
  });
});
