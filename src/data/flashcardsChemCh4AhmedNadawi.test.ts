import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ahmedNadawiChemCh4Cards, ahmedNadawiChemCh4Source, ahmedNadawiChemCh4Topics } from "./flashcardsChemCh4AhmedNadawi";
import { ahmedNadawiChemCh4CardsAr } from "./flashcardsChemCh4AhmedNadawiAr";
import { explicitTopics } from "../lib/flashcardTopics";
import { uniqueFlashcards } from "../lib/uniqueFlashcards";

const original = readFileSync(new URL("../../docs/flashcards/ahmed-al-nadawi/Chapter_4_Electrochemistry_Complete_Study_Deck.txt", import.meta.url), "utf8");
const numbers = (text: string) => [...new Set(text.match(/\d+(?:\.\d+)?/g) ?? [])].sort();

describe("Ahmed Al-Nadawi Chemistry Chapter 4 supplied deck", () => {
  it("retains every original question and answer in source order, including cards 202/203", () => {
    const source = [...original.matchAll(/^(\d+) \[(.*?)\] Q: (.+)\nA: (.+)$/gm)].map((m) => ({
      offset: m.index!, id: `CH4-${m[1].padStart(3, "0")}`, q: m[3], a: m[4],
    }));
    const practice = [...original.matchAll(/^(P\d+) \[WORKED PRACTICE[^\n]*\]\nQ: (.+)\nAnswer: (.+)$/gm)].map((m) => ({
      offset: m.index!, id: `CH4-${m[1]}`, q: `Worked practice: ${m[2]}`, a: m[3],
    }));
    assert.equal(source.length, 203);
    assert.equal(practice.length, 27);
    const expected = [...source, ...practice].sort((a, b) => a.offset - b.offset).map(({ id, q, a }) => ({ id, q, a }));
    assert.deepEqual(ahmedNadawiChemCh4Cards.map(({ id, q, a }) => ({ id, q, a })), expected);
  });

  it("provides a complete Arabic deck with identical IDs, source metadata and numerical data", () => {
    assert.equal(ahmedNadawiChemCh4CardsAr.length, 230);
    for (const [index, ar] of ahmedNadawiChemCh4CardsAr.entries()) {
      const en = ahmedNadawiChemCh4Cards[index];
      assert.equal(ar.id, en.id);
      assert.equal(ar.topic, en.topic);
      assert.equal(ar.kind, en.kind);
      assert.equal(ar.pages, en.pages);
      assert.equal(ar.sourceQuestion, en.sourceQuestion);
      assert.match(ar.q, /[\u0600-\u06ff]/u);
      assert.ok(ar.a.trim(), ar.id);
      assert.deepEqual(numbers(`${ar.q} ${ar.a}`), numbers(`${en.q} ${en.a}`), ar.id);
      if (ar.kind === "practice") assert.ok(ar.q.startsWith("تطبيق تدريبي: "), ar.id);
    }
  });

  it("keeps all 230 cards visible in both languages and all nine topic groups", () => {
    assert.equal(ahmedNadawiChemCh4Topics.length, 9);
    for (const [language, cards] of [["en", ahmedNadawiChemCh4Cards], ["ar", ahmedNadawiChemCh4CardsAr]] as const) {
      assert.equal(uniqueFlashcards(cards).length, 230);
      const buckets = ahmedNadawiChemCh4Topics.map((topic) => ({
        key: topic.key, label: language === "ar" ? topic.titleAr : topic.title,
        cards: cards.filter((card) => card.topic === topic.key),
      }));
      assert.deepEqual(buckets.map(({ cards }) => cards.length), [39, 18, 44, 44, 13, 24, 11, 10, 27]);
      const grouped = explicitTopics(buckets, language);
      assert.ok(grouped);
      assert.equal(grouped.topics.length, 10); // All plus nine source topics.
      assert.equal(grouped.topics[0].cards.length, 230);
    }
  });

  it("preserves provenance, rounding caveats and separate practice labels without inventing exam years", () => {
    assert.equal(ahmedNadawiChemCh4Source.verifiedMinisterialYears, false);
    assert.equal(ahmedNadawiChemCh4Cards.filter((c) => c.kind === "practice").length, 27);
    assert.equal(ahmedNadawiChemCh4Cards.find((c) => c.id === "CH4-088")?.sourceQuestion, "'17-4'");
    assert.match(ahmedNadawiChemCh4Source.accuracyNotes, /anode is negative and cathode positive/);
    for (const cards of [ahmedNadawiChemCh4Cards, ahmedNadawiChemCh4CardsAr]) {
      const magnesium = cards.find((c) => c.id === "CH4-116")!;
      assert.ok(magnesium.a.includes("11.19") && magnesium.a.includes("10.8"));
      const rounding = cards.find((c) => c.id === "CH4-195")!;
      assert.ok(rounding.a.includes("0.0599") && rounding.a.includes("0.056"));
    }
  });
});
