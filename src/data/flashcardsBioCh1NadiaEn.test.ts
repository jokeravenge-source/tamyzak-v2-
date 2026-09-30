import { describe, expect, it } from "vitest";
import { flashcardsBioCh1NadiaEn, nadiaBioCh1TopicRanges } from "./flashcardsBioCh1NadiaEn";

describe("Nadia Al-Nuaimi Biology Chapter 1 deck", () => {
  it("contains all 186 supplied question-answer cards", () => {
    expect(flashcardsBioCh1NadiaEn).toHaveLength(186);
    expect(flashcardsBioCh1NadiaEn.every((card) => card.q.trim() && card.a.trim())).toBe(true);
  });

  it("keeps all cards in 14 continuous topic groups", () => {
    expect(nadiaBioCh1TopicRanges).toHaveLength(14);
    expect(nadiaBioCh1TopicRanges[0].start).toBe(1);
    expect(nadiaBioCh1TopicRanges.at(-1)?.end).toBe(186);

    nadiaBioCh1TopicRanges.forEach((topic, index) => {
      const previous = nadiaBioCh1TopicRanges[index - 1];
      if (previous) expect(topic.start).toBe(previous.end + 1);
      expect(topic.end).toBeGreaterThanOrEqual(topic.start);
    });
  });
});
