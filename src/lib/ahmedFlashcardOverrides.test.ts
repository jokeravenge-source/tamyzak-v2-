import { describe, expect, it } from "vitest";
import { ahmedCardId, applyAhmedFlashcardOverrides, type AhmedFlashcardOverride } from "./ahmedFlashcardOverrides";

const cards = [{ id: "CH1-0001", q: "original question", a: "original answer", answerBlocks: ["old block"] }];
const correction: AhmedFlashcardOverride = { chapter: 1, language: "ar", card_id: "CH1-0001", question: "corrected question", answer: "corrected answer", deleted: false };

describe("Ahmed admin flashcard changes", () => {
  it("publishes edited questions and answers instead of stale structured answers", () => {
    expect(applyAhmedFlashcardOverrides(cards, 1, "ar", [correction])[0]).toMatchObject({ q: "corrected question", a: "corrected answer", answerBlocks: undefined });
  });
  it("removes deleted flashcards from the student deck", () => {
    expect(applyAhmedFlashcardOverrides(cards, 1, "ar", [{ ...correction, deleted: true }])).toHaveLength(0);
  });
  it("keeps other chapters and languages unchanged", () => {
    expect(applyAhmedFlashcardOverrides(cards, 2, "ar", [correction])).toEqual(cards);
    expect(applyAhmedFlashcardOverrides(cards, 1, "en", [correction])).toEqual(cards);
  });
  it("retains source IDs and gives unnumbered cards stable review identities", () => {
    expect(ahmedCardId(cards[0], 1, 5)).toBe("CH1-0001");
    expect(ahmedCardId({}, 8, 2)).toBe("CH8-003");
  });
});