import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ahmedNadawiChemCh5Cards, ahmedNadawiChemCh5Source, ahmedNadawiChemCh5SourceChecklist, ahmedNadawiChemCh5Topics } from "./flashcardsChemCh5AhmedNadawi";
import { ahmedNadawiChemCh5CardsAr } from "./flashcardsChemCh5AhmedNadawiAr";
import { explicitTopics } from "../lib/flashcardTopics";
import { uniqueFlashcards } from "../lib/uniqueFlashcards";

const original = readFileSync(new URL("../../docs/flashcards/ahmed-al-nadawi/Chapter_Five_Coordination_Chemistry_Flashcards.txt", import.meta.url), "utf8");
const numbers = (text: string) => [...new Set(text.match(/\d+(?:\.\d+)?/g) ?? [])].sort();
const formulae = (text: string) => [...new Set((text.match(/(?<![A-Za-z0-9])(?:[A-Z][a-z]?\d*)+(?:\^(?:\d+)?[+−-]|[+−-](?![A-Za-z]))?/g) ?? []).filter((s) => /\d|[+−-]/.test(s)))].sort();

describe("Ahmed Al-Nadawi Chemistry Chapter 5 supplied deck", () => {
  it("preserves every supplied question and answer in original order", () => {
    const expected = [...original.matchAll(/^CARD (\d+)\nQ: (.+)\nA: (.+)$/gm)].map((m) => ({ id: `CH5-${m[1]}`, q: m[2], a: m[3] }));
    assert.equal(expected.length, 154);
    assert.deepEqual(ahmedNadawiChemCh5Cards.map(({ id, q, a }) => ({ id, q, a })), expected);
    assert.deepEqual(ahmedNadawiChemCh5Cards.map((c) => c.id), Array.from({ length: 154 }, (_, i) => `CH5-${String(i + 1).padStart(3, "0")}`));
  });

  it("provides every card in Arabic with identical numerical data, formulae and topics", () => {
    assert.equal(ahmedNadawiChemCh5CardsAr.length, 154);
    for (const [index, ar] of ahmedNadawiChemCh5CardsAr.entries()) {
      const en = ahmedNadawiChemCh5Cards[index];
      assert.equal(ar.id, en.id);
      assert.equal(ar.topic, en.topic);
      assert.match(ar.q, /[\u0600-\u06ff]/u);
      assert.ok(ar.a.trim(), ar.id);
      assert.deepEqual(numbers(`${ar.q} ${ar.a}`), numbers(`${en.q} ${en.a}`), ar.id);
      assert.deepEqual(formulae(`${ar.q} ${ar.a}`), formulae(`${en.q} ${en.a}`), ar.id);
    }
  });

  it("keeps all cards visible without duplicates in all six source topics and both languages", () => {
    assert.equal(ahmedNadawiChemCh5Topics.length, 6);
    for (const [language, cards] of [["en", ahmedNadawiChemCh5Cards], ["ar", ahmedNadawiChemCh5CardsAr]] as const) {
      assert.equal(uniqueFlashcards(cards).length, 154);
      const buckets = ahmedNadawiChemCh5Topics.map((topic) => ({
        key: topic.key, label: language === "ar" ? topic.titleAr : topic.title,
        cards: cards.filter((card) => card.topic === topic.key),
      }));
      assert.deepEqual(buckets.map(({ cards }) => cards.length), [19, 24, 31, 24, 21, 35]);
      const grouped = explicitTopics(buckets, language);
      assert.ok(grouped);
      assert.equal(grouped.topics.length, 7);
      assert.equal(grouped.topics[0].cards.length, 154);
    }
  });

  it("preserves the original checklist and its year labels without inventing ministerial provenance", () => {
    const expected = [...original.matchAll(/^(SOURCE-Q\d+) — PDF p\.(\d+): (.*)$/gm)].map((m) => ({
      id: m[1], page: Number(m[2]), text: m[3],
      ...(m[3].match(/\b20\d{2}\b/g) ? { printedYears: m[3].match(/\b20\d{2}\b/g) } : {}),
    }));
    assert.equal(expected.length, 74);
    assert.deepEqual(ahmedNadawiChemCh5SourceChecklist, expected);
    assert.equal(ahmedNadawiChemCh5Source.verifiedCompleteMinisterialTranscript, false);
    assert.ok(ahmedNadawiChemCh5Cards.find((c) => c.id === "CH5-144")?.a.includes("refer to chapter"));
    assert.ok(ahmedNadawiChemCh5CardsAr.find((c) => c.id === "CH5-144")?.a.includes("يُرجع إلى مخطط"));
    assert.ok(ahmedNadawiChemCh5Cards.find((c) => c.id === "CH5-149")?.a.includes("Check the distinct orbital"));
    assert.ok(ahmedNadawiChemCh5CardsAr.find((c) => c.id === "CH5-149")?.a.includes("تُراجع الترتيبات"));
  });
});
