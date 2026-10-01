import { describe, expect, it } from "vitest";
import { flashcardsBioCh2NadiaEn, nadiaBioCh2TopicRanges } from "./flashcardsBioCh2NadiaEn";

describe("Nadia Al-Nuaimi Biology Chapter 2 deck", () => {
  it("contains all 138 supplied question-answer cards", () => {
    expect(flashcardsBioCh2NadiaEn).toHaveLength(138);
    expect(flashcardsBioCh2NadiaEn.every((card) => card.q.trim() && card.a.trim())).toBe(true);
  });

  it("keeps all cards in 11 continuous topic groups", () => {
    expect(nadiaBioCh2TopicRanges).toHaveLength(11);
    expect(nadiaBioCh2TopicRanges[0].start).toBe(1);
    expect(nadiaBioCh2TopicRanges.at(-1)?.end).toBe(138);

    nadiaBioCh2TopicRanges.forEach((topic, index) => {
      const previous = nadiaBioCh2TopicRanges[index - 1];
      if (previous) expect(topic.start).toBe(previous.end + 1);
      expect(topic.end).toBeGreaterThanOrEqual(topic.start);
    });
  });
});
