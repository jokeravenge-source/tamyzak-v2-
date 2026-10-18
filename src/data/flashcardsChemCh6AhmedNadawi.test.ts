import { describe, it } from "vitest";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ahmedNadawiChemCh4Cards } from "./flashcardsChemCh4AhmedNadawi";
import { ahmedNadawiChemCh6Cards, ahmedNadawiChemCh6Source, ahmedNadawiChemCh6Topics } from "./flashcardsChemCh6AhmedNadawi";
import { ahmedNadawiChemCh6CardsAr } from "./flashcardsChemCh6AhmedNadawiAr";
import { explicitTopics } from "../lib/flashcardTopics";
import { uniqueFlashcards } from "../lib/uniqueFlashcards";

const original = readFileSync(join(process.cwd(), "docs/flashcards/ahmed-al-nadawi/Chapter_Six_Chemical_Analysis_Complete_Flashcards.txt"), "utf8");
const source = [...original.matchAll(/^CARD (\d+) \[([MNP])(?: - (.+))?\]\nQ: (.+)\nA: (.+)$/gm)];
const numbers = (text: string) => [...new Set(text.match(/\d+(?:\.\d+)?/g) ?? [])].sort();
// Ignore grouping punctuation so parentheses around prose are not treated as formula parts.
const formulae = (text: string) => [...new Set((text.replace(/[()[\]]/g, "").match(/(?<![A-Za-z])[A-Z][A-Za-z0-9^.+-]*\d[A-Za-z0-9^.+-]*/g) ?? []).map((s) => s.replace(/[.,]+$/, "")))].sort();

describe("Ahmed Al-Nadawi Chemistry Chapter 6 Chemical Analysis replacement", () => {
  it("retains all 147 uploaded questions and answers in order, including every numerical variant", () => {
    assert.equal(source.length, 147);
    assert.equal(ahmedNadawiChemCh6Cards.length, 147);
    const kinds = { M: "ministerial", N: "note", P: "practice" } as const;
    for (const [index, match] of source.entries()) {
      const card = ahmedNadawiChemCh6Cards[index];
      const code = match[2] as keyof typeof kinds;
      assert.equal(card.id, `CH6-ANALYSIS-${match[1].padStart(3, "0")}`);
      assert.equal(card.kind, kinds[code]);
      const prefix = code === "P" ? "Practice: " : code === "M" ? `Ministerial${match[3] ? ` (${match[3]})` : ""}: ` : "";
      assert.equal(card.q, prefix + match[4]);
      assert.equal(card.a, match[5]);
      assert.deepEqual(card.examLabels, match[3]?.split(", ") ?? []);
    }
    assert.equal(ahmedNadawiChemCh6Cards.filter((c) => c.kind === "ministerial").length, 117);
    assert.equal(ahmedNadawiChemCh6Cards.filter((c) => c.kind === "note").length, 16);
    assert.equal(ahmedNadawiChemCh6Cards.filter((c) => c.kind === "practice").length, 14);
  });

  it("provides only source-backed Arabic cards with their chemical data and exam labels", () => {
    assert.equal(ahmedNadawiChemCh6CardsAr.length, 133);
    for (const ar of ahmedNadawiChemCh6CardsAr) {
      const en = ahmedNadawiChemCh6Cards.find((card) => card.id === ar.id)!;
      assert.ok(en, ar.id);
      assert.equal(ar.id, en.id);
      assert.equal(ar.topic, en.topic);
      assert.equal(ar.kind, en.kind);
      assert.deepEqual(ar.examLabels, en.examLabels);
      assert.match(ar.q, /[\u0600-\u06ff]/u);
      assert.ok(ar.a.trim(), ar.id);
      if (ar.id !== "CH6-ANALYSIS-139") {
        assert.deepEqual(numbers(`${ar.q} ${ar.a}`), numbers(`${en.q} ${en.a}`), ar.id);
      }
      assert.deepEqual(formulae(`${ar.q} ${ar.a}`), formulae(`${en.q} ${en.a}`), ar.id);
      for (const label of ar.examLabels) assert.ok(ar.q.includes(label), ar.id);
      if (ar.kind === "ministerial") assert.ok(ar.q.startsWith("وزاري"), ar.id);
    }
    assert.ok(ahmedNadawiChemCh6CardsAr.every((card) => card.kind !== "practice"));
    assert.match(ahmedNadawiChemCh6CardsAr.find((card) => card.id === "CH6-ANALYSIS-139")!.a, /67\.8%/);
  });

  it("keeps all cards visible in both languages across the seven supplied topic groups", () => {
    assert.equal(ahmedNadawiChemCh6Topics.length, 7);
    for (const [language, cards, expectedCounts, expectedTotal] of [
      ["en", ahmedNadawiChemCh6Cards, [9, 30, 28, 10, 24, 39, 7], 147],
      ["ar", ahmedNadawiChemCh6CardsAr, [7, 27, 24, 9, 22, 38, 6], 133],
    ] as const) {
      assert.equal(uniqueFlashcards(cards).length, expectedTotal);
      const buckets = ahmedNadawiChemCh6Topics.map((topic) => ({
        key: topic.key, label: language === "ar" ? topic.titleAr : topic.title,
        cards: cards.filter((card) => card.topic === topic.key),
      }));
      assert.deepEqual(buckets.map(({ cards }) => cards.length), expectedCounts);
      const grouped = explicitTopics(buckets, language);
      assert.ok(grouped);
      assert.equal(grouped.topics.length, 8);
      assert.equal(grouped.topics[0].cards.length, expectedTotal);
    }
  });

  it("uses the Chemical Analysis source and removes the duplicate CH6 electrochemistry dependency", () => {
    assert.equal(ahmedNadawiChemCh6Source.chapter, 6);
    assert.equal(ahmedNadawiChemCh6Source.sourcePdfPages, 100);
    assert.equal(ahmedNadawiChemCh6Source.sourcePdfSha256, "58dc303035cd973e905cfdd3e80340521bf7ca3b12f9d59776d7d59401b6d918");
    assert.equal(createHash("sha256").update(original).digest("hex"), ahmedNadawiChemCh6Source.sha256);
    assert.equal(new Set(ahmedNadawiChemCh6Cards.map((c) => c.id)).size, 147);
    const previousChapterIds = new Set(ahmedNadawiChemCh4Cards.map((c) => c.id));
    assert.ok(ahmedNadawiChemCh6Cards.every((c) => !previousChapterIds.has(c.id)));
    assert.ok(ahmedNadawiChemCh6Cards.every((c) => c.id.startsWith("CH6-ANALYSIS-")));
    for (const filename of ["flashcardsChemCh6AhmedNadawi.ts", "flashcardsChemCh6AhmedNadawiAr.ts"]) {
      assert.ok(!readFileSync(join(process.cwd(), "src/data", filename), "utf8").includes("flashcardsChemCh4"));
    }
    assert.ok(!existsSync(join(process.cwd(), "docs/flashcards/ahmed-al-nadawi/Chapter_6_Electrochemistry_Complete_Study_Deck.txt")));
    assert.equal(ahmedNadawiChemCh6Cards[0].q, "What is chemical analysis?");
    assert.match(ahmedNadawiChemCh6Cards[127].q, /1\/2021/);
  });
});
