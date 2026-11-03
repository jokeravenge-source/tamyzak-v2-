import { describe, expect, it } from "vitest";
import { applyFrenchFlashcardOverrides, type FrenchFlashcardOverride } from "./frenchFlashcardOverrides";

const override = (values: Partial<FrenchFlashcardOverride>): FrenchFlashcardOverride => ({
  id: "override-1",
  chapter: 1,
  card_index: 0,
  question: "Updated question",
  answer: "Updated answer",
  hidden: false,
  updated_by: null,
  created_at: "2026-11-03T00:00:00.000Z",
  updated_at: "2026-11-03T00:00:00.000Z",
  ...values,
});

describe("applyFrenchFlashcardOverrides", () => {
  const cards = [
    { q: "Question one", a: "Answer one" },
    { q: "Question two", a: "Answer two" },
  ];

  it("applies edits only to the selected chapter", () => {
    expect(applyFrenchFlashcardOverrides(cards, 1, [override({})])).toEqual([
      { q: "Updated question", a: "Updated answer" },
      { q: "Question two", a: "Answer two" },
    ]);
    expect(applyFrenchFlashcardOverrides(cards, 2, [override({})])).toEqual(cards);
  });

  it("removes cards hidden by an administrator", () => {
    expect(applyFrenchFlashcardOverrides(cards, 1, [override({ hidden: true })])).toEqual([
      { q: "Question two", a: "Answer two" },
    ]);
  });
});
