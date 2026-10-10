import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { ahmedNadawiChemCh8Cards, ahmedNadawiChemCh8Source, ahmedNadawiChemCh8Topics } from "./flashcardsChemCh8AhmedNadawi";
import { ahmedNadawiChemCh8CardsAr } from "./flashcardsChemCh8AhmedNadawiAr";
import { explicitTopics } from "../lib/flashcardTopics";
import { uniqueFlashcards } from "../lib/uniqueFlashcards";

const original = readFileSync(new URL("../../docs/flashcards/ahmed-al-nadawi/Ahmed_Al_Nadawi_CH8_Biochemistry_Flashcards.txt", import.meta.url), "utf8");
const sourceHeadings = [...original.matchAll(/^Flashcard (\d+) — (.+)$/gm)];
const sourceInlineAnswers = [...original.matchAll(/^Flashcard (\d+) — [^\n]+\n(?:\nMinisterial: [^\n]+\n)?\nAnswer: ([^\n]+)$/gm)];
const numbers = (text: string) => [...new Set(text.match(/\d+(?:\.\d+)?/g) ?? [])].sort();
const formulae = (text: string) => (text.match(/[A-Za-z0-9₀-₉₂³⁺⁻()]+/g) ?? [])
  .filter((token) => /[A-Z]/.test(token) && /[0-9₀-₉₂³]/.test(token) && !/^\d*[A-Z][a-z]{2,}$/.test(token));

describe("Ahmed Al-Nadawi Chemistry Chapter 8 Biochemistry supplied deck", () => {
  it("retains all 106 supplied cards and readable ministerial labels in source order", () => {
    assert.equal(sourceHeadings.length, 106);
    assert.equal(ahmedNadawiChemCh8Cards.length, 106);
    assert.equal(new Set(ahmedNadawiChemCh8Cards.map((card) => card.id)).size, 106);
    for (const [index, heading] of sourceHeadings.entries()) {
      const card = ahmedNadawiChemCh8Cards[index];
      assert.equal(card.id, `CH8-${heading[1].padStart(3, "0")}`);
      assert.ok(card.q.includes(heading[2]), card.id);
      assert.ok(card.a.trim(), card.id);
    }
    for (const match of sourceInlineAnswers) {
      assert.equal(ahmedNadawiChemCh8Cards[Number(match[1]) - 1].a, match[2]);
    }
    assert.equal(ahmedNadawiChemCh8Cards.filter((card) => card.ministerialLabel).length, 7);
    assert.equal(ahmedNadawiChemCh8Cards[49].ministerialLabel, "2013 Preliminary, 2014 First Round, 2016, 2017, 2019 (as indicated in the chapter)");
    assert.equal(ahmedNadawiChemCh8Cards[81].ministerialLabel, "2017 First Round, Outside Iraq");
  });

  it("provides every Arabic card with unchanged formulas, equations, numbers and years", () => {
    assert.equal(ahmedNadawiChemCh8CardsAr.length, 106);
    for (const [index, ar] of ahmedNadawiChemCh8CardsAr.entries()) {
      const en = ahmedNadawiChemCh8Cards[index];
      assert.equal(ar.id, en.id);
      assert.equal(ar.topic, en.topic);
      assert.equal(ar.ministerialLabel, en.ministerialLabel);
      assert.deepEqual(ar.years, en.years);
      assert.match(ar.q, /[\u0600-\u06ff]/u);
      assert.ok(ar.a.trim(), ar.id);
      assert.deepEqual(numbers(`${ar.q} ${ar.a}`), numbers(`${en.q} ${en.a}`), ar.id);
      assert.deepEqual(formulae(`${ar.q} ${ar.a}`), formulae(`${en.q} ${en.a}`), ar.id);
      assert.deepEqual(ar.a.match(/[→⇌]/g) ?? [], en.a.match(/[→⇌]/g) ?? [], ar.id);
      for (const year of ar.years) assert.ok(ar.q.includes(year), ar.id);
    }
    assert.match(ahmedNadawiChemCh8CardsAr[17].a, /CHO[\s\S]*H–C–OH[\s\S]*CH₂OH/);
    assert.match(ahmedNadawiChemCh8CardsAr[33].a, /C₆H₁₂O₆ \+ C₆H₁₂O₆ → C₁₂H₂₂O₁₁ \+ H₂O/);
    assert.match(ahmedNadawiChemCh8CardsAr[75].a, /C₃H₅\(OCOC₁₅H₃₁\)₃ \+ 3NaOH → C₃H₅\(OH\)₃ \+ 3C₁₅H₃₁COONa/);
    assert.ok(ahmedNadawiChemCh8CardsAr[49].q.includes("التمهيدي"));
    assert.ok(ahmedNadawiChemCh8CardsAr[81].q.includes("خارج العراق"));
  });

  it("keeps both languages visible across all ten source topic groups", () => {
    assert.equal(ahmedNadawiChemCh8Topics.length, 10);
    const expectedCounts = [8, 11, 8, 8, 14, 12, 10, 12, 12, 11];
    for (const [language, cards] of [["en", ahmedNadawiChemCh8Cards], ["ar", ahmedNadawiChemCh8CardsAr]] as const) {
      assert.equal(uniqueFlashcards(cards).length, 106);
      const buckets = ahmedNadawiChemCh8Topics.map((topic) => ({
        key: topic.key,
        label: language === "ar" ? topic.titleAr : topic.title,
        cards: cards.filter((card) => card.topic === topic.key),
      }));
      assert.deepEqual(buckets.map(({ cards }) => cards.length), expectedCounts);
      const grouped = explicitTopics(buckets, language);
      assert.ok(grouped);
      assert.equal(grouped.topics.length, 11);
      assert.equal(grouped.topics[0].cards.length, 106);
    }
  });

  it("preserves the uploaded source document and its stated coverage limits", () => {
    assert.equal(createHash("sha256").update(original).digest("hex"), ahmedNadawiChemCh8Source.sha256);
    assert.equal(ahmedNadawiChemCh8Source.chapter, 8);
    assert.equal(ahmedNadawiChemCh8Source.sourcePages, 26);
    assert.match(original, /Total: 106 flashcards across 10 sections/);
    assert.match(original, /some year labels in the PDF are incomplete or distorted/);
    assert.match(ahmedNadawiChemCh8Source.sourceFidelityNote, /year labels are preserved only where readable/);
    assert.equal(ahmedNadawiChemCh8Cards[105].q, "Justify: Fructose is considered a reducing sugar.");
  });
});
