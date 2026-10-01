import { describe, expect, it } from "vitest";
import { flashcardsBioCh4NadiaEn, nadiaBioCh4TopicRanges } from "./flashcardsBioCh4NadiaEn";

describe("Nadia Al-Nuaimi Biology Chapter 4 deck", () => {
  it("contains all 120 supplied cards", () => {
    expect(flashcardsBioCh4NadiaEn).toHaveLength(120);
    expect(flashcardsBioCh4NadiaEn.every((card) => card.q.trim() && card.a.trim())).toBe(true);
  });

  it("keeps all source sections continuous and complete", () => {
    expect(nadiaBioCh4TopicRanges).toHaveLength(11);
    expect(nadiaBioCh4TopicRanges[0].start).toBe(1);
    expect(nadiaBioCh4TopicRanges.at(-1)?.end).toBe(120);

    nadiaBioCh4TopicRanges.forEach((topic, index) => {
      const previous = nadiaBioCh4TopicRanges[index - 1];
      expect(topic.start).toBe(previous ? previous.end + 1 : 1);
      expect(topic.end).toBeGreaterThanOrEqual(topic.start);
    });
  });
});
