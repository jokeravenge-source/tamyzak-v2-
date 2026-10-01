import { describe, expect, it } from "vitest";
import { flashcardsBioCh5NadiaEn, nadiaBioCh5TopicRanges } from "./flashcardsBioCh5NadiaEn";

describe("Nadia Al-Nuaimi Biology Chapter 5 deck", () => {
  it("contains all 330 supplied cards", () => {
    expect(flashcardsBioCh5NadiaEn).toHaveLength(330);
    expect(flashcardsBioCh5NadiaEn.every((card) => card.q.trim() && card.a.trim())).toBe(true);
  });

  it("groups the complete deck into continuous readable topics", () => {
    expect(nadiaBioCh5TopicRanges).toHaveLength(14);
    expect(nadiaBioCh5TopicRanges[0].start).toBe(1);
    expect(nadiaBioCh5TopicRanges.at(-1)?.end).toBe(330);

    nadiaBioCh5TopicRanges.forEach((topic, index) => {
      const previous = nadiaBioCh5TopicRanges[index - 1];
      expect(topic.start).toBe(previous ? previous.end + 1 : 1);
      expect(topic.end).toBeGreaterThanOrEqual(topic.start);
    });
  });
});
