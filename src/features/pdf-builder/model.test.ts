import { describe, expect, it, vi } from "vitest";
import { eligibleQuestions, normalizeBank, normalizeQuestion, selectQuestions, type PdfQuestion, type QuestionFilters } from "./model";

const filters: QuestionFilters = { includeMinisterial: true, includeReview: true, includeWritten: true, includeMcq: true, counts: { ministerial: "all", review: "all", mcq: "all" }, order: "bank" };
const bank: PdfQuestion[] = [
  { id: "m", kind: "ministerial", origin: "ministerial", question: "Define capacitance", answer: "Charge per potential", source: "ministerial" },
  { id: "r", kind: "review", origin: "review", question: "Explain induction", answer: "Changing flux", source: "flashcards" },
  { id: "mm", kind: "mcq", origin: "ministerial", question: "Choose the unit of charge", answer: "Coulomb", source: "ministerial", choices: ["Coulomb", "Volt"], answerIndex: 0 },
  { id: "mr", kind: "mcq", origin: "review", question: "Choose the unit of current", answer: "Ampere", source: "mcq", choices: ["Ampere", "Volt"], answerIndex: 0 },
];

describe("study booklet selection", () => {
  it("applies ministerial exclusions to written questions and MCQs", () => {
    expect(eligibleQuestions(bank, { ...filters, includeMinisterial: false }).map(q => q.id)).toEqual(["r", "mr"]);
    expect(eligibleQuestions(bank, { ...filters, includeReview: false, includeWritten: false }).map(q => q.id)).toEqual(["mm"]);
  });
  it("requires a source and at least one matching question", () => {
    expect(() => selectQuestions(bank, { ...filters, includeMinisterial: false, includeReview: false })).toThrow("choose_source");
    expect(() => selectQuestions(bank, { ...filters, includeMcq: false, includeWritten: false })).toThrow("no_questions");
  });
  it("validates requested counts without inventing or silently filling questions", () => {
    for (const count of [-1, .5, 2, NaN]) expect(() => selectQuestions(bank, { ...filters, counts: { ...filters.counts, review: count } })).toThrow("invalid_count");
    expect(selectQuestions(bank, { ...filters, counts: { ministerial: 0, review: 1, mcq: 1 } }).map(q => q.id)).toEqual(["r", "mm"]);
    expect(selectQuestions(bank, { ...filters, includeReview: false, counts: { ...filters.counts, review: 100 } })).toHaveLength(2);
  });
  it("keeps the ministerial copy of duplicates, including MCQ origins", () => {
    const result = normalizeBank([{ ...bank[0], id: "duplicate", kind: "review", origin: "review", question: "Q1: (2024 / 1) Define capacitance" }, { ...bank[2], id: "mcq-copy", origin: "review" }, ...bank]);
    expect(result.map(q => q.id)).toEqual(["m", "mm", "r", "mr"]);
    expect(normalizeQuestion("x - y")).not.toBe(normalizeQuestion("x + y"));
    expect(normalizeQuestion("pH")).not.toBe(normalizeQuestion("PH"));
  });
  it("samples without modifying the bank and preserves all content", () => {
    const snapshot = JSON.stringify(bank);
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const selected = selectQuestions(bank, { ...filters, order: "random" });
    expect(selected.filter(q => q.kind === "mcq").map(q => q.id)).toEqual(["mr", "mm"]);
    expect(new Set(selected.map(q => q.id)).size).toBe(4);
    expect(JSON.stringify(bank)).toBe(snapshot);
    random.mockRestore();
  });
});
