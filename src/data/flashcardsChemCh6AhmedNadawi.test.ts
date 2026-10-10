import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { ahmedNadawiChemCh4Cards } from "./flashcardsChemCh4AhmedNadawi";
import { ahmedNadawiChemCh6Cards, ahmedNadawiChemCh6Source, ahmedNadawiChemCh6Topics } from "./flashcardsChemCh6AhmedNadawi";
import { ahmedNadawiChemCh6CardsAr } from "./flashcardsChemCh6AhmedNadawiAr";
import { explicitTopics } from "../lib/flashcardTopics";
import { uniqueFlashcards } from "../lib/uniqueFlashcards";

const original = readFileSync(new URL("../../docs/flashcards/ahmed-al-nadawi/Chapter_6_Electrochemistry_Complete_Study_Deck.txt", import.meta.url), "utf8");
const numbers = (text: string) => [...new Set(text.match(/\d+(?:\.\d+)?/g) ?? [])].sort();

describe("Ahmed Al-Nadawi supplied electrochemistry deck in Chapter 6", () => {
  it("keeps all 203 source questions and 27 worked problems exactly as uploaded", () => {
    const source = [...original.matchAll(/^(\d+) \[(.*?)\] Q: (.+)\nA: (.+)$/gm)].map((m) => ({
      offset: m.index!, id: `CH6-${m[1].padStart(3, "0")}`, q: m[3], a: m[4],
    }));
    const practice = [...original.matchAll(/^(P\d+) \[WORKED PRACTICE[^\n]*\]\nQ: (.+)\nAnswer: (.+)$/gm)].map((m) => ({
      offset: m.index!, id: `CH6-${m[1]}`, q: `Worked practice: ${m[2]}`, a: m[3],
    }));
    assert.equal(source.length, 203);
    assert.equal(practice.length, 27);
    const expected = [...source, ...practice].sort((a, b) => a.offset - b.offset).map(({ id, q, a }) => ({ id, q, a }));
    assert.deepEqual(ahmedNadawiChemCh6Cards.map(({ id, q, a }) => ({ id, q, a })), expected);
    assert.equal(createHash("sha256").update(original).digest("hex"), ahmedNadawiChemCh6Source.sha256);
    assert.equal(ahmedNadawiChemCh6Source.sourceChapter, 4);
    assert.equal(ahmedNadawiChemCh6Source.displayChapter, 6);
    assert.equal(ahmedNadawiChemCh6Source.verifiedMinisterialYears, false);
    assert.equal(ahmedNadawiChemCh6Cards.find((c) => c.id === "CH6-088")?.sourceQuestion, "'17-4'");
  });

  it("provides Arabic questions and answers with all numerical data and separate chapter IDs", () => {
    assert.equal(ahmedNadawiChemCh6CardsAr.length, 230);
    const chapterFourIds = new Set(ahmedNadawiChemCh4Cards.map((c) => c.id));
    assert.equal(new Set(ahmedNadawiChemCh6Cards.map((c) => c.id)).size, 230);
    for (const [index, ar] of ahmedNadawiChemCh6CardsAr.entries()) {
      const en = ahmedNadawiChemCh6Cards[index];
      assert.equal(ar.id, en.id);
      assert.ok(!chapterFourIds.has(ar.id), ar.id);
      assert.match(ar.id, /^CH6-/);
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

  it("shows every card across all nine topics in both languages", () => {
    assert.equal(ahmedNadawiChemCh6Topics.length, 9);
    for (const [language, cards] of [["en", ahmedNadawiChemCh6Cards], ["ar", ahmedNadawiChemCh6CardsAr]] as const) {
      assert.equal(uniqueFlashcards(cards).length, 230);
      const buckets = ahmedNadawiChemCh6Topics.map((topic) => ({
        key: topic.key, label: language === "ar" ? topic.titleAr : topic.title,
        cards: cards.filter((card) => card.topic === topic.key),
      }));
      assert.deepEqual(buckets.map(({ cards }) => cards.length), [39, 18, 44, 44, 13, 24, 11, 10, 27]);
      const grouped = explicitTopics(buckets, language);
      assert.ok(grouped);
      assert.equal(grouped.topics.length, 10);
      assert.equal(grouped.topics[0].cards.length, 230);
    }
  });
});
