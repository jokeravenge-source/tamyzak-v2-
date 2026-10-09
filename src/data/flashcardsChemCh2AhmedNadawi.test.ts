import { describe, expect, it } from "vitest";
import { ahmedNadawiChemCh2Cards, ahmedNadawiChemCh2Topics } from "./flashcardsChemCh2AhmedNadawi";
import { ahmedNadawiChemCh2CardsAr } from "./flashcardsChemCh2AhmedNadawiAr";

describe("Ahmed Al-Nadawi — Chemistry Chapter 2 flashcards", () => {
  it("keeps all 429 original flashcards in each language", () => {
    expect(ahmedNadawiChemCh2Cards).toHaveLength(429);
    expect(ahmedNadawiChemCh2CardsAr).toHaveLength(429);
  });

  it("retains original card identity, topic, source page and verified ministerial year", () => {
    ahmedNadawiChemCh2Cards.forEach((source, index) => {
      const translated = ahmedNadawiChemCh2CardsAr[index];
      expect(source.id).toBe(`CH2-${String(index + 1).padStart(4, "0")}`);
      expect(translated.id).toBe(source.id);
      expect(translated.topic).toBe(source.topic);
      expect(translated.pages).toBe(source.pages);
      expect(translated.ministerialYear).toBe(source.ministerialYear);
      expect(translated.sourceNotes).toBe(source.sourceNotes);
      expect(source.q.trim()).not.toBe("");
      expect(source.a.trim()).not.toBe("");
      expect(translated.q.trim()).not.toBe("");
      expect(translated.a.trim()).not.toBe("");
      expect(/[\u0600-\u06ff]/u.test(translated.q + translated.a)).toBe(true);
    });
  });

  it("retains 27 coherent topics and avoids duplicate flashcard question–answer pairs", () => {
    expect(ahmedNadawiChemCh2Topics).toHaveLength(27);
    const topics = new Set(ahmedNadawiChemCh2Topics.map(({ key }) => key));
    expect(topics.size).toBe(27);
    expect(ahmedNadawiChemCh2Cards.every(({ topic }) => topics.has(topic as typeof ahmedNadawiChemCh2Topics[number]["key"]))).toBe(true);
    for (const cards of [ahmedNadawiChemCh2Cards, ahmedNadawiChemCh2CardsAr]) {
      const pairs = cards.map(({ q, a }) => JSON.stringify([q.normalize("NFC").trim(), a.normalize("NFC").trim()]));
      expect(new Set(pairs).size).toBe(429);
    }
  });

  it("preserves ministerial year tags only where provided in the source", () => {
    expect(ahmedNadawiChemCh2Cards.filter((card) => card.ministerialYear).map(({ id, ministerialYear }) => [id, ministerialYear])).toEqual([
      ["CH2-0069", 2013],
      ["CH2-0229", 2013],
      ["CH2-0399", 2015],
    ]);
  });
});
