import { describe, expect, it } from "vitest";
import { flashcardsChemCh3WijdanEn, wijdanChemCh3TopicRanges } from "./flashcardsChemCh3WijdanEn";
import { flashcardsChemCh3WijdanAr } from "./flashcardsChemCh3WijdanAr";

describe("Miss Wijdan Chemistry Chapter 3 deck", () => {
  it("contains all 138 supplied non-numerical question-answer cards", () => {
    expect(flashcardsChemCh3WijdanEn).toHaveLength(138);
    expect(flashcardsChemCh3WijdanEn.every((card) => card.q.trim() && card.a.trim())).toBe(true);
    expect(new Set(flashcardsChemCh3WijdanEn.map((card) => card.q)).size).toBe(138);
  });

  it("provides a complete Arabic translation with matching ministerial markers", () => {
    expect(flashcardsChemCh3WijdanAr).toHaveLength(138);
    expect(flashcardsChemCh3WijdanAr.every((card) => card.q.trim() && card.a.trim())).toBe(true);
    expect(new Set(flashcardsChemCh3WijdanAr.map((card) => card.q)).size).toBe(138);

    const englishMinisterial = flashcardsChemCh3WijdanEn.filter((card) => card.q.startsWith("★")).length;
    const arabicMinisterial = flashcardsChemCh3WijdanAr.filter((card) => card.q.startsWith("★")).length;
    expect(arabicMinisterial).toBe(englishMinisterial);
  });

  it("keeps every card in seven continuous topic groups", () => {
    expect(wijdanChemCh3TopicRanges).toHaveLength(7);
    expect(wijdanChemCh3TopicRanges[0].start).toBe(1);
    expect(wijdanChemCh3TopicRanges.at(-1)?.end).toBe(138);

    wijdanChemCh3TopicRanges.forEach((topic, index) => {
      const previous = wijdanChemCh3TopicRanges[index - 1];
      if (previous) expect(topic.start).toBe(previous.end + 1);
      expect(topic.end).toBeGreaterThanOrEqual(topic.start);
    });
  });

  it("preserves the ministerial star markers", () => {
    expect(flashcardsChemCh3WijdanEn.filter((card) => card.q.startsWith("★")).length).toBeGreaterThan(0);
  });
});
