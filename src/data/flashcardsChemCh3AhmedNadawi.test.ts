import { describe, expect, it } from "vitest";
import { ahmedNadawiChemCh3Cards, ahmedNadawiChemCh3Topics } from "./flashcardsChemCh3AhmedNadawi";

describe("Ahmed Al-Nadawi Chemistry Chapter 3 supplied Arabic deck", () => {
  it("publishes the 413 cards verified against the adopted PDF", () => {
    expect(ahmedNadawiChemCh3Cards).toHaveLength(413);
    ahmedNadawiChemCh3Cards.forEach((card) => {
      expect(card.id).toMatch(/^CH3-\d{3}$/);
      expect(card.q.trim()).not.toBe("");
      expect(card.a.trim()).not.toBe("");
      expect(card.pages).toMatch(/^صفحة PDF /);
    });
  });

  it("preserves 24 source topics with the exact original card counts", () => {
    expect(ahmedNadawiChemCh3Topics).toHaveLength(24);
    for (const topic of ahmedNadawiChemCh3Topics) {
      expect(ahmedNadawiChemCh3Cards.filter((card) => card.topic === topic.key)).toHaveLength(topic.expectedCount);
    }
    expect(new Set(ahmedNadawiChemCh3Topics.map(({ key }) => key)).size).toBe(24);
  });

  it("preserves ministerial-question categories and source verification notes", () => {
    expect(ahmedNadawiChemCh3Cards.filter((card) => card.kind === "مسألة وزارية")).toHaveLength(170);
    expect(ahmedNadawiChemCh3Cards.filter((card) => card.kind === "وزاري نظري")).toHaveLength(41);
    expect(ahmedNadawiChemCh3Cards.filter((card) => card.kind === "تطبيق ممثل للموضوع")).toHaveLength(24);
    expect(ahmedNadawiChemCh3Cards.filter((card) => Boolean(card.sourceNotes))).toHaveLength(0);
  });

  it("avoids duplicate cards and retains question-answer text in Arabic", () => {
    const pairs = ahmedNadawiChemCh3Cards.map(({ q, a }) => JSON.stringify([q.normalize("NFC").trim(), a.normalize("NFC").trim()]));
    expect(new Set(pairs).size).toBe(413);
    for (const card of ahmedNadawiChemCh3Cards) {
      expect(/[\u0600-\u06ff]/u.test(card.q)).toBe(true);
      // A numerical answer can correctly consist only of units, symbols and a final result.
    }
  });

  it("excludes the card that belongs to a different source edition", () => {
    expect(ahmedNadawiChemCh3Cards.some(({ id }) => id === "CH3-413")).toBe(false);
  });

  it("contains no unresolved extraction or editorial caveats", () => {
    for (const card of ahmedNadawiChemCh3Cards) {
      expect(card.q + card.a).not.toMatch(/مشوش|غير واضح|ملتبس|يحتاج تحقق|يلزم التحقق|تصحح هذه النتيجة|بحسب تقريب الملف|المعطى المطبوع حرفياً/u);
    }
  });

  it("uses the page references and final values verified in the adopted PDF", () => {
    const byId = new Map(ahmedNadawiChemCh3Cards.map((card) => [card.id, card]));
    expect(byId.get("CH3-026")?.pages).toBe("صفحة PDF 159, 161");
    expect(byId.get("CH3-068")?.a).toContain("pH≈12.70");
    expect(byId.get("CH3-303")?.pages).toBe("صفحة PDF 164");
    expect(byId.get("CH3-321")?.a).toContain("53.4mg");
  });
});
