import { describe, it } from "vitest";
import assert from "node:assert/strict";
import {
  ahmedNadawiChemCh4Cards,
  ahmedNadawiChemCh4Source,
  ahmedNadawiChemCh4Topics,
} from "./flashcardsChemCh4AhmedNadawi";
import { ahmedNadawiChemCh4CardsAr } from "./flashcardsChemCh4AhmedNadawiAr";
import { ahmedNadawiChemCh4Cards as legacyCards } from "./flashcardsChemCh4AhmedNadawiLegacy";
import { explicitTopics } from "../lib/flashcardTopics";
import { uniqueFlashcards } from "../lib/uniqueFlashcards";

describe("Ahmed Al-Nadawi distinguished Chemistry Chapter 4", () => {
  it("publishes the 65 source-verbatim verbal cards without authored practice", () => {
    assert.equal(ahmedNadawiChemCh4Cards.length, 65);
    assert.equal(uniqueFlashcards(ahmedNadawiChemCh4Cards).length, 65);
    assert.equal(new Set(ahmedNadawiChemCh4Cards.map((card) => card.id)).size, 65);
    assert.ok(ahmedNadawiChemCh4Cards.every((card) => card.kind === "source"));
    assert.ok(ahmedNadawiChemCh4Cards.every((card) => card.q.trim() && card.a.trim() && card.pages.startsWith("PDF ")));
    assert.ok(!ahmedNadawiChemCh4Cards.some((card) => card.id.startsWith("CH4-P")));
  });

  it("groups the English verbal deck by the handout topics", () => {
    const expectedCounts = [16, 12, 15, 8, 5, 4, 5, 0, 0];
    assert.equal(ahmedNadawiChemCh4Topics.length, expectedCounts.length);
    assert.deepEqual(
      ahmedNadawiChemCh4Topics.map((topic) => ahmedNadawiChemCh4Cards.filter((card) => card.topic === topic.key).length),
      expectedCounts,
    );
    const grouped = explicitTopics(
      ahmedNadawiChemCh4Topics.map((topic) => ({
        key: topic.key,
        label: topic.title,
        cards: ahmedNadawiChemCh4Cards.filter((card) => card.topic === topic.key),
      })),
      "en",
    );
    assert.ok(grouped);
    assert.equal(grouped.topics[0].cards.length, 65);
  });

  it("pins the uploaded distinguished handout provenance", () => {
    assert.equal(ahmedNadawiChemCh4Source.sourcePdf, "Chapter four.pdf");
    assert.equal(ahmedNadawiChemCh4Source.pdfPages, 138);
    assert.equal(ahmedNadawiChemCh4Source.sha256, "c4fb03a88a69c6d6de0360c88009f53fa1ce5e7eb80d8b5654726e73604fe763");
    assert.equal(ahmedNadawiChemCh4Source.curriculum, "distinguished");
    assert.equal(ahmedNadawiChemCh4Source.verbatimVerbalOnly, true);
    assert.equal(ahmedNadawiChemCh4Source.verifiedMinisterialYears, false);
  });

  it("keeps exact full-text answers from representative source pages", () => {
    const byId = new Map(ahmedNadawiChemCh4Cards.map((card) => [card.id, card]));
    assert.equal(
      byId.get("CH4-001")?.a,
      "it is the number of electrons (electrical charge) gained or lost by an atom in a compound molecule. It is shown with an electrocharge written above the element symbol.",
    );
    assert.equal(
      byId.get("CH4-057")?.a,
      "is an electrode with Known standard potential used to measure other electrode potentials. There are different types of electrodes used as reference The most important is standard hydrogen electrode",
    );
    assert.equal(
      byId.get("CH4-106")?.a,
      "The mass of substance is precipitates on the cathode or melts at the anode or is released as gases at these electrodes are directly proportional to the amount of electric current passing through the electrolysis circuit.",
    );
    assert.equal(
      byId.get("CH4-188")?.a,
      "This type of battery is made up of a zinc box works as anode filled with MnO2, carbon (graphite) and ammonium chloride (NH4Cl) wet paste.\n\nProperties :\n1. Their potential is 1.48 V\n2. Not rechargeable\n\nUse :\nThey are used in many appliances like radios, calculators, toys, etc.",
    );
  });

  it("preserves the existing Arabic chapter independently from the new English handout deck", () => {
    assert.equal(ahmedNadawiChemCh4CardsAr.length, 192);
    for (const ar of ahmedNadawiChemCh4CardsAr) {
      const legacy = legacyCards.find((card) => card.id === ar.id);
      assert.ok(legacy, ar.id);
      assert.equal(ar.topic, legacy.topic);
      assert.equal(ar.kind, "source");
      assert.match(ar.q, /[\u0600-\u06ff]/u);
      assert.ok(ar.a.trim(), ar.id);
    }
  });

  it("contains no source-audit commentary in student-facing cards", () => {
    const text = [...ahmedNadawiChemCh4Cards, ...ahmedNadawiChemCh4CardsAr]
      .map((card) => `${card.q}\n${card.a}`)
      .join("\n");
    assert.doesNotMatch(text, /do not invent|not a certified|الملف المرفوع|لا يجوز اختلاق|تنبيه:|عدم اتساق/iu);
  });
});
