import { describe, expect, it } from "vitest";
import { ahmedNadawiChemCh3CardsEn as cards, ahmedNadawiChemCh3TopicsEn as topics } from "./flashcardsChemCh3AhmedNadawiEn";

describe("Ahmed English CH3 text deck", () => {
  it("has text answers for every card and keeps each topic reachable", () => {
    expect(new Set(cards.map(c => c.id)).size).toBe(cards.length);
    for (const topic of topics) expect(cards.some(c => c.topic === topic.key)).toBe(true);
    for (const card of cards) {
      expect(card.q.trim()).not.toBe("");
      expect(card.answerBlocks.length).toBeGreaterThan(0);
      expect(JSON.stringify(card.answerBlocks)).not.toMatch(/sourceMedia|\.webp|data:image|\ufffd/);
      for (const block of card.answerBlocks) {
        if (block.type === "math") {
          expect(block.width).toBeGreaterThan(0);
          expect(block.height).toBeGreaterThan(0);
          expect(block.runs.every(r => r.t && Number.isFinite(r.x) && Number.isFinite(r.y))).toBe(true);
        } else expect(block.text.trim()).not.toBe("");
      }
    }
  });

  it("retains complete source working and discloses the source formula discrepancy", () => {
    const calcium = cards.find(c => c.id === "AN-CH3-EN-015")!;
    const text = calcium.answerBlocks.flatMap(b => b.type === "text" ? b.text : b.runs.map(r => r.t)).join(" ");
    expect(text).toContain("0.4");
    expect(text).toContain("mole");
    expect(cards.find(c => c.id === "AN-CH3-EN-441")?.a).toContain("Source wording discrepancy");
    expect(cards.some(c => c.id === "AN-CH3-EN-156")).toBe(false);
  });
});
