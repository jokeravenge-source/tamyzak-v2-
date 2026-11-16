import { describe, expect, it } from "vitest";
import { extractScienceEvidence, normalizeScienceQuestion, readScienceSources, SCIENCE_ACADEMIC_YEAR } from "../../supabase/functions/_shared/scienceEvidence";

const raw = (patch = {}) => ({
  id: "source-1", verified: true, academic_year: SCIENCE_ACADEMIC_YEAR, curriculum: "ar", subject: "physics",
  question: "ما سعة المتسعة؟", excerpt: "السعة هي نسبة الشحنة إلى فرق الجهد.",
  book_title: "Test fixture textbook", book_edition: "2026-2027", chapter: "الفصل الأول", printed_page: 42, pdf_page: 46,
  book_url: "https://example.test/book.pdf", classification: "curriculum", classification_url: "https://example.test/syllabus.pdf",
  exams: [{ year: 2023, round: "الدور الأول", url: "https://example.test/exam.pdf" }], ...patch,
});
describe("scientific provenance", () => {
  it("rejects unverified sources, other editions, and the other curriculum", () => {
    expect(readScienceSources([raw({ verified: false }), raw({ academic_year: "2025-2026" }), raw({ curriculum: "en" })], "ar")).toEqual([]);
  });
  it("does not accept page, classification, or exam claims without evidence URLs", () => {
    const [source] = readScienceSources([raw({ book_url: "javascript:alert(1)", classification_url: null, exams: [{ year: 2023, round: "first" }, { year: 2030, round: "first", url: "https://example.test/future" }] })], "ar");
    expect(source.printed_page).toBeNull(); expect(source.classification).toBeNull(); expect(source.exams).toEqual([]);
  });
  it("uses only retrieved IDs and ignores model-authored page, year, and classification", () => {
    const result = extractScienceEvidence('الجواب\n```science\n{"sourceIds":["invented","source-1"],"printed_page":99,"year":2020,"classification":"enrichment"}\n```', readScienceSources([raw()], "ar"), "ما سعة المتسعة؟");
    expect(result.reply).toBe("الجواب");
    expect(result.scienceEvidence?.sources).toHaveLength(1);
    expect(result.scienceEvidence?.sources[0]).toMatchObject({ match: "exact", printed_page: 42, classification: "curriculum", exams: [{ year: 2023 }] });
  });
  it("keeps numbers, signs, case, and chemistry notation in exact matching", () => {
    for (const [a, b] of [["C = 2", "C = 3"], ["q = +2", "q = -2"], ["CO", "Co"], ["H₂O", "H2O"]]) expect(normalizeScienceQuestion(a)).not.toBe(normalizeScienceQuestion(b));
    const result = extractScienceEvidence('شرح\n```science\n{"sourceIds":["source-1"]}\n```', readScienceSources([raw()], "ar"), "اشرح ما سعة المتسعة؟");
    expect(result.scienceEvidence?.sources[0].match).toBe("related");
  });
  it("renders no invented citations for empty, malformed, or truncated source blocks", () => {
    for (const block of ['```science\n{"sourceIds":[]}\n```', '```science\nbad json\n```', '```science\n{"sourceIds":']) {
      const result = extractScienceEvidence("شرح\n" + block, [], "سؤال");
      expect(result.reply).toBe("شرح"); expect(result.scienceEvidence?.sources).toEqual([]);
    }
    expect(extractScienceEvidence("هلا بيك", [], "هلا")).toEqual({ reply: "هلا بيك" });
  });
});
