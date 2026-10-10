import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { ahmedNadawiChemCh7Cards, ahmedNadawiChemCh7Source, ahmedNadawiChemCh7Topics } from "./flashcardsChemCh7AhmedNadawi";
import { ahmedNadawiChemCh7CardsAr } from "./flashcardsChemCh7AhmedNadawiAr";
import { explicitTopics } from "../lib/flashcardTopics";
import { uniqueFlashcards } from "../lib/uniqueFlashcards";

const original = readFileSync(new URL("../../docs/flashcards/ahmed-al-nadawi/Ahmed_Al_Nadawi_CH7_Organic_Chemistry_Flashcards.txt", import.meta.url), "utf8");
const source = [...original.matchAll(/^CARD (\d+)(?: \| MINISTERIAL: (.+))?\nQ: (.+)\nA: (.+)$/gm)];
const numbers = (text: string) => [...new Set(text.match(/\d+(?:\.\d+)?/g) ?? [])].sort();
const formulae = (text: string) => (text.replace(/[()[\]]/g, "").match(/(?<![A-Za-z])[A-Z][A-Za-z0-9^.+-]*\d[A-Za-z0-9^.+-]*/g) ?? []).map((s) => s.replace(/[.,]+$/, ""));

describe("Ahmed Al-Nadawi Chemistry Chapter 7 Organic Chemistry supplied deck", () => {
  it("retains every supplied question, answer and ministerial label in source order", () => {
    assert.equal(source.length, 117);
    assert.equal(ahmedNadawiChemCh7Cards.length, 117);
    assert.equal(new Set(ahmedNadawiChemCh7Cards.map((c) => c.id)).size, 117);
    for (const [index, match] of source.entries()) {
      const card = ahmedNadawiChemCh7Cards[index];
      assert.equal(card.id, `CH7-${match[1]}`);
      assert.equal(card.q, (match[2] ? `Ministerial (${match[2]}): ` : "") + match[3]);
      assert.equal(card.a, match[4]);
      assert.equal(card.ministerialLabel, match[2] ?? "");
      assert.deepEqual(card.years, match[2]?.match(/\b(?:19|20)\d{2}\b/g) ?? []);
    }
    assert.equal(ahmedNadawiChemCh7Cards.filter((c) => c.ministerialLabel).length, 15);
    assert.equal(ahmedNadawiChemCh7Cards[18].ministerialLabel, "2013 / first sitting");
  });

  it("provides all Arabic cards with unchanged formulas, reaction arrows, numerical data and years", () => {
    assert.equal(ahmedNadawiChemCh7CardsAr.length, 117);
    for (const [index, ar] of ahmedNadawiChemCh7CardsAr.entries()) {
      const en = ahmedNadawiChemCh7Cards[index];
      assert.equal(ar.id, en.id);
      assert.equal(ar.topic, en.topic);
      assert.equal(ar.pages, en.pages);
      assert.equal(ar.ministerialLabel, en.ministerialLabel);
      assert.deepEqual(ar.years, en.years);
      assert.match(ar.q, /[\u0600-\u06ff]/u);
      assert.ok(ar.a.trim(), ar.id);
      assert.deepEqual(numbers(`${ar.q} ${ar.a}`), numbers(`${en.q} ${en.a}`), ar.id);
      assert.deepEqual(formulae(`${ar.q} ${ar.a}`), formulae(`${en.q} ${en.a}`), ar.id);
      assert.deepEqual(ar.a.match(/[→⇌]/g) ?? [], en.a.match(/[→⇌]/g) ?? [], ar.id);
      for (const year of ar.years) assert.ok(ar.q.includes(year), ar.id);
      if (en.a.includes("dry ether")) assert.ok(ar.a.includes("إيثر جاف"), ar.id);
      if (en.a.includes("heat")) assert.ok(ar.a.includes("تسخين"), ar.id);
      if (en.a.includes("conc.")) assert.ok(ar.a.includes("مركز"), ar.id);
      if (en.a.includes("room temperature")) assert.ok(ar.a.includes("حرارة الغرفة"), ar.id);
    }
    assert.ok(ahmedNadawiChemCh7CardsAr[18].q.includes("الدور الأول"));
    assert.match(ahmedNadawiChemCh7CardsAr[82].a, /Cu2O.*أحمر آجري/);
  });

  it("keeps all 117 cards visible in both languages across all eight topic groups", () => {
    assert.equal(ahmedNadawiChemCh7Topics.length, 8);
    for (const [language, cards] of [["en", ahmedNadawiChemCh7Cards], ["ar", ahmedNadawiChemCh7CardsAr]] as const) {
      assert.equal(uniqueFlashcards(cards).length, 117);
      const buckets = ahmedNadawiChemCh7Topics.map((topic) => ({
        key: topic.key, label: language === "ar" ? topic.titleAr : topic.title,
        cards: cards.filter((card) => card.topic === topic.key),
      }));
      assert.deepEqual(buckets.map(({ cards }) => cards.length), [12, 23, 24, 6, 21, 14, 8, 9]);
      const grouped = explicitTopics(buckets, language);
      assert.ok(grouped);
      assert.equal(grouped.topics.length, 9);
      assert.equal(grouped.topics[0].cards.length, 117);
    }
  });

  it("preserves the original source and its unverified question index without turning it into answered cards", () => {
    assert.equal(createHash("sha256").update(original).digest("hex"), ahmedNadawiChemCh7Source.sha256);
    assert.equal(ahmedNadawiChemCh7Source.chapter, 7);
    assert.equal(ahmedNadawiChemCh7Source.pdfPages, 144);
    const appendix = original.split("ADDITIONAL QUESTION INDEX — TEXT RECOVERABLE FROM THE FILE")[1];
    assert.equal((appendix.match(/^• /gm) ?? []).length, 214);
    assert.equal((appendix.match(/^PDF PAGE \d+:/gm) ?? []).length, 90);
    assert.match(appendix, /NOT a second set of verified answers/);
    assert.match(ahmedNadawiChemCh7Source.sourceFidelityNote, /do not treat OCR-like text as verified equations/);
    assert.equal(ahmedNadawiChemCh7Cards[116].q, "How can you distinguish ethylamine and ethane?");
  });
});
