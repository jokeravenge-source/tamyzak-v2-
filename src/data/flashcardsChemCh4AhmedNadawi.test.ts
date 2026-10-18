import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ahmedNadawiChemCh4Cards, ahmedNadawiChemCh4Source, ahmedNadawiChemCh4Topics } from "./flashcardsChemCh4AhmedNadawi";
import { ahmedNadawiChemCh4CardsAr } from "./flashcardsChemCh4AhmedNadawiAr";
import { explicitTopics } from "../lib/flashcardTopics";
import { uniqueFlashcards } from "../lib/uniqueFlashcards";

const original = readFileSync(join(process.cwd(), "docs/flashcards/ahmed-al-nadawi/Chapter_4_Electrochemistry_Complete_Study_Deck.txt"), "utf8");
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

  it("publishes only Arabic cards supported by the uploaded 120-page source", () => {
    assert.equal(ahmedNadawiChemCh4CardsAr.length, 192);
    for (const ar of ahmedNadawiChemCh4CardsAr) {
      const en = ahmedNadawiChemCh4Cards.find((card) => card.id === ar.id)!;
      assert.ok(en, ar.id);
      assert.equal(ar.topic, en.topic);
      assert.equal(ar.kind, "source");
      assert.equal(ar.sourceQuestion, en.sourceQuestion);
      assert.match(ar.q, /[\u0600-\u06ff]/u);
      assert.ok(ar.a.trim(), ar.id);
    }
    assert.ok(!ahmedNadawiChemCh4CardsAr.some((card) => card.topic === "07" || card.topic === "08"));
    assert.ok(!ahmedNadawiChemCh4CardsAr.some((card) => card.id === "CH4-191" || card.id.startsWith("CH4-P")));
  });

  it("keeps the original English source deck intact and groups the verified Arabic subset", () => {
    assert.equal(ahmedNadawiChemCh4Topics.length, 9);
    for (const [language, cards, expectedCounts, expectedTotal] of [
      ["en", ahmedNadawiChemCh4Cards, [39, 18, 44, 44, 13, 24, 11, 10, 27], 230],
      ["ar", ahmedNadawiChemCh4CardsAr, [39, 18, 44, 44, 13, 24, 0, 10, 0], 192],
    ] as const) {
      assert.equal(uniqueFlashcards(cards).length, expectedTotal);
      const buckets = ahmedNadawiChemCh4Topics.map((topic) => ({
        key: topic.key, label: language === "ar" ? topic.titleAr : topic.title,
        cards: cards.filter((card) => card.topic === topic.key),
      }));
      assert.deepEqual(buckets.map(({ cards }) => cards.length), expectedCounts);
      const grouped = explicitTopics(buckets.filter((bucket) => bucket.cards.length > 0), language);
      assert.ok(grouped);
      assert.equal(grouped.topics[0].cards.length, expectedTotal);
    }
  });

  it("preserves provenance without inventing exam years", () => {
    assert.equal(ahmedNadawiChemCh4Source.verifiedMinisterialYears, false);
    assert.equal(ahmedNadawiChemCh4Cards.filter((c) => c.kind === "practice").length, 27);
    assert.equal(ahmedNadawiChemCh4Cards.find((c) => c.id === "CH4-088")?.sourceQuestion, "'17-4'");
    assert.match(ahmedNadawiChemCh4Source.accuracyNotes, /anode is negative and cathode positive/);
    assert.match(ahmedNadawiChemCh4CardsAr.find((c) => c.id === "CH4-116")!.a, /10\.8/);
    assert.match(ahmedNadawiChemCh4CardsAr.find((c) => c.id === "CH4-195")!.a, /0\.056/);
  });

  it("contains no source-audit commentary in the student-facing Arabic answers", () => {
    const text = ahmedNadawiChemCh4CardsAr.map((card) => `${card.q}\n${card.a}`).join("\n");
    assert.doesNotMatch(text, /الملف المرفوع|لا يجوز اختلاق|تنبيه:|يذكر الملف|المصدر يقرّب|عدم اتساق|غير مطبوع بوضوح/);
  });
});
