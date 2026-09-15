import { describe, expect, it } from "vitest";
import { explicitTopics, groupFlashcardsByTopic } from "@/lib/flashcardTopics";
import { buildPresetGroups } from "@/lib/flashcardTopicPresets";
import { uniqueFlashcards } from "@/lib/uniqueFlashcards";

describe("uniqueFlashcards", () => {
  it("keeps the original when built-in and submitted copies are merged", () => {
    const original = { q: "What is current?", a: "Charge flow", source: "built-in" };
    const remote = { ...original, source: "submitted" };
    const different = { q: "What is voltage?", a: "Potential difference", source: "submitted" };
    expect(uniqueFlashcards([original, remote, different, remote])).toEqual([original, different]);
    expect(uniqueFlashcards([original, remote])[0]).toBe(original);
  });

  it("ignores pasted whitespace in English and Arabic", () => {
    const original = { q: "ما هي القوة؟", a: "تؤثر في الحركة" };
    expect(uniqueFlashcards([
      original,
      { q: "  ما\nهي\u00a0القوة؟  ", a: "تؤثر   في\nالحركة" },
      { q: "What is current?", a: "Charge flow" },
      { q: "What\tis current?\n", a: " Charge\u00a0flow " },
    ])).toHaveLength(2);
  });

  it("recognizes canonically equivalent Unicode without rewriting the original", () => {
    const original = { q: "Café?", a: "أين؟" };
    const copied = { q: "Cafe\u0301?", a: "ا\u0654ين؟" };
    expect(uniqueFlashcards([original, copied])).toEqual([original]);
  });

  it("preserves different answers, case, diacritics, images and equations", () => {
    const cards = [
      { q: "What is x?", a: "One answer" },
      { q: "What is x?", a: "A different answer" },
      { q: "What is X?", a: "One answer" },
      { q: "عَلَم", a: "Flag" },
      { q: "عِلْم", a: "Science" },
      { q: "Symbol?", a: "$V = IR$" },
      { q: "Symbol?", a: "$v = IR$" },
      { q: "Diagram?", a: "![figure](/first.png)" },
      { q: "Diagram?", a: "![figure](/second.png)" },
    ];
    expect(uniqueFlashcards(cards)).toEqual(cards);
  });

  it("does not create collisions from separator characters", () => {
    const cards = [{ q: "a::b", a: "c" }, { q: "a", a: "b::c" }];
    expect(uniqueFlashcards(cards)).toHaveLength(2);
  });

  it("does not mutate frozen source arrays or cards, including saved metadata", () => {
    const first = Object.freeze({ q: "Question", a: "Answer", chapter: "1", id: "first" });
    const second = Object.freeze({ ...first, id: "second" });
    const cards = Object.freeze([first, second]);
    expect(uniqueFlashcards(cards)).toEqual([first]);
    expect(cards).toHaveLength(2);
    expect(second.id).toBe("second");
    expect(uniqueFlashcards([])).toEqual([]);
  });
});

describe("topic integration", () => {
  const first = { q: "First question?", a: "First answer" };
  const second = { q: "Second question?", a: "Second answer" };

  it("deduplicates small decks before deciding whether to create topics", () => {
    const result = groupFlashcardsByTopic(Array(7).fill(first), "ar");
    expect(result.topics).toEqual([{ key: result.allKey, label: "الكل", cards: [first] }]);
  });

  it("keeps one card in All when it belongs to multiple explicit topics", () => {
    const result = explicitTopics([
      { key: "a", label: "A", cards: [first, first] },
      { key: "b", label: "B", cards: [first, second, second] },
    ], "en")!;
    expect(result.topics[0].cards).toEqual([first, second]);
    expect(result.topics[1].cards).toEqual([first]);
    expect(result.topics[2].cards).toEqual([first, second]);
  });

  it("returns null for an empty or single explicit bucket", () => {
    expect(explicitTopics([], "en")).toBeNull();
    expect(explicitTopics([{ key: "a", label: "A", cards: [first, first] }], "en")).toBeNull();
  });

  it("deduplicates before curriculum presets and retains every unique card", () => {
    const cards = uniqueFlashcards([
      { q: "Define a capacitor", a: "Stores charge" },
      { q: "Define a capacitor", a: "Stores charge" },
      { q: "Define energy", a: "Ability to do work" },
      { q: "Unrelated question", a: "Another answer" },
    ]);
    const groups = buildPresetGroups("physics", "1", "en", cards);
    const result = groups ? explicitTopics(groups, "en") : null;
    const grouped = result ?? groupFlashcardsByTopic(cards, "en");
    expect(grouped.topics[0].cards).toHaveLength(3);
    expect(grouped.topics[0].cards).toEqual(expect.arrayContaining(cards));
  });
});
