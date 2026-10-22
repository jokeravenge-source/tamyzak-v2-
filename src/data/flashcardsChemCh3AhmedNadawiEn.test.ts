import { describe, expect, it } from "vitest";
import rawCards from "./flashcardsChemCh3AhmedNadawiEn.text.json";
import {
  ahmedNadawiChemCh3CardsEn as cards,
  ahmedNadawiChemCh3SourceAudit as sourceAudit,
  ahmedNadawiChemCh3TopicsEn as topics,
  type AhmedChemCh3EnglishCard,
} from "./flashcardsChemCh3AhmedNadawiEn";
import { ahmedNadawiChemCh3VerbatimOverrides as verbatim } from "./flashcardsChemCh3AhmedNadawiEnVerbatim";

describe("Ahmed English CH3 text deck", () => {
  it("has a complete answer for every card and keeps every topic reachable", () => {
    expect(new Set(cards.map(card => card.id)).size).toBe(cards.length);
    for (const topic of topics) expect(cards.some(card => card.topic === topic.key)).toBe(true);

    for (const card of cards) {
      expect(card.q.trim()).not.toBe("");
      expect(card.a.trim()).not.toBe("");
      expect(card.answerBlocks.length).toBeGreaterThan(0);
      expect(JSON.stringify(card.answerBlocks)).not.toMatch(/sourceMedia|\.webp|data:image|\ufffd/);

      for (const block of card.answerBlocks) {
        if (block.type === "math") {
          expect(block.width).toBeGreaterThan(0);
          expect(block.height).toBeGreaterThan(0);
          expect(block.runs.every(run => run.t && Number.isFinite(run.x) && Number.isFinite(run.y))).toBe(true);
        } else {
          expect(block.text.trim()).not.toBe("");
        }
      }
    }
  });

  it("uses the audited handout wording exactly for every repaired card", () => {
    for (const [id, source] of Object.entries(verbatim)) {
      const card = cards.find(item => item.id === id);
      expect(card, id).toBeDefined();
      expect(card?.q, `${id} question`).toBe(source.q);
      expect(card?.a, `${id} answer`).toBe(source.a);
      expect(card?.answerBlocks, `${id} blocks`).toEqual([{ type: "text", text: source.a }]);
    }

    expect(sourceAudit).toEqual({
      file: "Chapter three(1).pdf",
      pages: 171,
      sha256: "f817d279ab990525ad681a3929f0665c1e1bf0a2cd509c1779443f8484360b11",
      verbatimCards: Object.keys(verbatim).length,
      calculationCardsPreserved: true,
    });
  });

  it("keeps every unaffected source card and its worked solution unchanged", () => {
    const baseCards = rawCards as AhmedChemCh3EnglishCard[];
    expect(cards).toHaveLength(baseCards.length);

    for (const base of baseCards) {
      if (verbatim[base.id]) continue;
      expect(cards.find(card => card.id === base.id), base.id).toEqual(base);
    }

    const calcium = cards.find(card => card.id === "AN-CH3-EN-015")!;
    const calciumWorking = calcium.answerBlocks
      .flatMap(block => block.type === "text" ? block.text : block.runs.map(run => run.t))
      .join(" ");
    expect(calciumWorking).toContain("0.4");
    expect(calciumWorking).toContain("mole");
    expect(cards.some(card => card.id === "AN-CH3-EN-156")).toBe(false);
  });

  it("contains no editorial text added outside the handout", () => {
    const serialized = JSON.stringify(cards);
    expect(serialized).not.toContain("Source wording discrepancy");
    expect(cards.find(card => card.id === "AN-CH3-EN-440")?.a).toContain("MgSO₄ ملح حامضي");
    expect(cards.find(card => card.id === "AN-CH3-EN-443")?.a).toContain("PH = 12.3");
    expect(cards.find(card => card.id === "AN-CH3-EN-327")?.a).toContain("0.0099 mole");
  });
});
