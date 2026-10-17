import { describe, expect, it } from "vitest";
import { getNadiaEnglishBuiltInMcqSet } from "./nadiaEnglishTopicMcqs";
import { getNadiaNavigationItems } from "./nadiaTeacherContent";

describe("Nadia built-in English topic MCQs", () => {
  it.each([2, 5] as const)("covers every English topic in Chapter %s", (chapter) => {
    for (const topic of getNadiaNavigationItems("en", chapter)) {
      const set = getNadiaEnglishBuiltInMcqSet(chapter, topic.lecture);
      expect(set?.title).toBe(topic.en);
      expect(set?.questions.length).toBeGreaterThanOrEqual(3);
      expect(set?.questions.length).toBeLessThanOrEqual(12);
      expect(set?.questions.every((question) => (
        question.choices.length === 4
        && question.answer_index >= 0
        && question.answer_index < 4
        && question.choices[question.answer_index] === question.explanation
      ))).toBe(true);
    }
  });

  it("adds the missing asexual reproduction in Paramecium bank", () => {
    const set = getNadiaEnglishBuiltInMcqSet(3, 6);
    expect(set?.title).toBe("Asexual Reproduction in Paramecium");
    expect(set?.questions).toHaveLength(7);
  });

  it("fills the missing Chapter 4 topic banks", () => {
    for (const lecture of [8, 10, 11, 12]) {
      expect(getNadiaEnglishBuiltInMcqSet(4, lecture)?.questions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("does not replace topics that already have authored database sets", () => {
    expect(getNadiaEnglishBuiltInMcqSet(1, 7)).toBeNull();
    expect(getNadiaEnglishBuiltInMcqSet(4, 5)).toBeNull();
  });
});
