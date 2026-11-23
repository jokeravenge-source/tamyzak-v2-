import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadPdfBank } from "./loadBank";
import { loadSource } from "./bankSources";
import { normalizeQuestion, type BankSelection } from "./model";

const backend = vi.hoisted(() => ({ rows: {} as Record<string, Record<string, unknown>[]>, errors: new Set<string>(), ranges: [] as { table: string; from: number; to: number }[] }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: (table: string) => {
  const criteria: [string, unknown][] = [];
  const query = {
    select: () => query, order: () => query,
    eq: (key: string, value: unknown) => { criteria.push([key, value]); return query; },
    in: (key: string, values: unknown[]) => { criteria.push([key, values]); return query; },
    range: async (from: number, to: number) => {
      backend.ranges.push({ table, from, to });
      return { data: (backend.rows[table] ?? []).filter(row => criteria.every(([key, value]) => Array.isArray(value) ? value.includes(row[key]) : row[key] === value)).slice(from, to + 1), error: backend.errors.has(table) ? new Error("offline") : null };
    },
  };
  return query;
} } }));
const selection: BankSelection = { subject: "physics", chapter: "1", language: "ar", list: "haydar-diwan", section: "grammar" };
const mcq = (id: string, extra: Record<string, unknown> = {}) => ({ id, subject: "physics", language: "ar", chapter: 1, chapter_title: "Capacitors", question: `Choose the capacitance for circuit ${id}`, choices: ["Two farads", "Three farads"], answer_index: 1, explanation: "Use C = Q/V", source: "review bank", tags: [], ...extra });
beforeEach(() => { backend.rows = {}; backend.errors.clear(); backend.ranges = []; });

describe("PDF bank adapters", () => {
  it("uses real local questions and does not truncate the online bank at 1,000 rows", async () => {
    backend.rows.mcq_banks = Array.from({ length: 1001 }, (_, i) => mcq(String(i)));
    const result = await loadPdfBank(selection);
    expect(result.warnings).toEqual([]);
    expect(result.questions.filter(q => q.kind === "ministerial").length).toBeGreaterThan(0);
    expect(result.questions.filter(q => q.kind === "mcq")).toHaveLength(1001);
    expect(result.questions.find(q => q.id === "mcq:1000")?.answer).toBe("Three farads\nUse C = Q/V");
    expect(backend.ranges.filter(r => r.table === "mcq_banks").map(r => r.from)).toEqual([0, 1000]);
  });
  it("rejects invalid MCQs, mismatched chapters and extraction metadata", async () => {
    backend.rows.mcq_banks = [mcq("valid", { source: "وزاري 2024" }), mcq("wrong-chapter", { chapter: 2, chapter_title: "Electromagnetic Induction" }), mcq("bad-index", { answer_index: 3 }), mcq("empty", { choices: ["", "A"] }), mcq("duplicate", { choices: ["A", " A "] }), mcq("metadata", { question: "What page number is this on?" }), mcq("wrong-language", { language: "en" })];
    const result = await loadPdfBank(selection);
    expect(result.questions.filter(q => q.kind === "mcq").map(q => [q.id, q.origin])).toEqual([["mcq:valid", "ministerial"]]);
  });
  it("includes all supplied Biology Chapter 2 MCQs in custom PDFs", async () => {
    const result = await loadPdfBank({ ...selection, subject: "biology", chapter: "2", language: "en", list: "nadia-al-nuaimi" });
    const supplied = result.questions.filter((question) => question.id.startsWith("mcq:builtin-biology-2-en-"));
    expect(supplied).toHaveLength(50);
    expect(supplied[0]).toMatchObject({
      kind: "mcq",
      question: "The science concerned with the study of tissues is called:",
      answer: "Histology",
    });
    expect(supplied.at(-1)).toMatchObject({
      question: "Neuroglia cells function mainly to:",
      answer: "Support the neurons and phagocytose bacteria",
    });
  });
  it("includes the complete Arabic Biology Chapter 2 bank in custom PDFs", async () => {
    const result = await loadPdfBank({ ...selection, subject: "biology", chapter: "2", language: "ar", list: "nadia-al-nuaimi" });
    const supplied = result.questions.filter((question) => question.id.startsWith("mcq:builtin-biology-2-ar-"));
    expect(supplied).toHaveLength(84);
    expect(supplied[0]).toMatchObject({
      kind: "mcq",
      question: "النسيج المرستيمي يتميز بأن خلاياه:",
      answer: "غير متمايزة وقادرة على الانقسام",
    });
    expect(supplied.at(-1)).toMatchObject({
      question: "الخلية العصبية ثنائية القطب يكون جسمها:",
      answer: "مغزلي الشكل ذا نتوءين",
    });
  });
  it("includes all supplied English Physics Chapter 4 MCQs in custom PDFs", async () => {
    const result = await loadPdfBank({ ...selection, subject: "physics", chapter: "4", language: "en", list: "haydar-diwan" });
    const supplied = result.questions.filter((question) => question.kind === "mcq");
    expect(supplied).toHaveLength(77);
    expect(supplied[0]).toMatchObject({
      question: "A static point charge generates:",
      answer: "an electric field only",
    });
    expect(supplied.at(-1)).toMatchObject({
      question: "The frequency of an electromagnetic wave with wavelength 12 m is:",
      answer: "25 MHz",
    });
  });
  it("includes all supplied Arabic Physics Chapter 5 MCQs in custom PDFs", async () => {
    const result = await loadPdfBank({ ...selection, subject: "physics", chapter: "5", language: "ar", list: "haydar-diwan" });
    const supplied = result.questions.filter((question) => question.kind === "mcq");
    expect(supplied).toHaveLength(70);
    expect(supplied[0]).toMatchObject({
      question: "في التداخل البناء تكون سعة الموجة الناتجة:",
      answer: "مساوية لضعف سعة أي من الموجتين الأصليتين",
    });
    expect(supplied.at(-1)).toMatchObject({
      question: expect.stringContaining("الزاوية الحرجة للأشعة الضوئية لمادة العقيق الأزرق"),
      answer: "60.5°",
    });
  });
  it("includes all supplied English Physics Chapter 5 MCQs in custom PDFs", async () => {
    const result = await loadPdfBank({ ...selection, subject: "physics", chapter: "5", language: "en", list: "haydar-diwan" });
    const supplied = result.questions.filter((question) => question.kind === "mcq");
    expect(supplied).toHaveLength(61);
    expect(supplied[0]).toMatchObject({
      question: "When two waves of equal amplitude meet in phase, the resulting amplitude is:",
      answer: "Twice the amplitude of one wave",
    });
    expect(supplied.at(-1)).toMatchObject({
      question: "Scattering of visible light happens on particles whose diameter is:",
      answer: "Comparable to or smaller than λ",
    });
  });
  it("honors Ahmed's edited and deleted cards and fails if corrections cannot load", async () => {
    const s = { ...selection, subject: "chemistry", chapter: "7", list: "ahmed-al-nadawi" } as BankSelection;
    const original = await loadSource("chemistry:ahmed-al-nadawi:ar:7");
    expect(original.length).toBeGreaterThan(1);
    const firstId = original[0].id ?? "CH7-001", secondId = original[1].id ?? "CH7-002";
    backend.rows.ahmed_flashcard_overrides = [
      { chapter: 7, language: "ar", card_id: firstId, question: "سؤال مصحح عن الاتزان الكيميائي", answer: "جواب مصحح", deleted: false },
      { chapter: 7, language: "ar", card_id: secondId, question: null, answer: null, deleted: true },
    ];
    const result = await loadPdfBank(s);
    expect(result.questions.find(q => q.id === `flashcard:${firstId}`)).toMatchObject({ question: "سؤال مصحح عن الاتزان الكيميائي", answer: "جواب مصحح", answerBlocks: undefined });
    expect(result.questions.some(q => q.id === `flashcard:${secondId}`)).toBe(false);
    backend.errors.add("ahmed_flashcard_overrides");
    await expect(loadPdfBank(s)).rejects.toThrow("offline");
  });
  it("honors French hidden cards and corrected answers", async () => {
    const { getFrenchFlashcardDeck } = await import("@/data/frenchFlashcardDecks");
    const hiddenPrompt = getFrenchFlashcardDeck(1)!.cards[1].q;
    backend.rows.french_flashcard_overrides = [
      { chapter: 1, card_index: 0, question: "Question corrigée", answer: "Réponse corrigée", hidden: false },
      { chapter: 1, card_index: 1, question: "Hidden", answer: "Hidden", hidden: true },
    ];
    const result = await loadPdfBank({ ...selection, subject: "french", list: "mohammed-ali-al-kinani" });
    expect(result.questions[0]).toMatchObject({ question: "Question corrigée", answer: "Réponse corrigée" });
    expect(result.questions.some(q => q.question === hiddenPrompt)).toBe(false);
    backend.errors.add("french_flashcard_overrides");
    await expect(loadPdfBank({ ...selection, subject: "french" })).rejects.toThrow("offline");
  });
  it("maps Arabic topics by title rather than conflicting legacy chapter numbers", async () => {
    backend.rows.mcq_banks = [mcq("taajjub", { subject: "arabic", chapter: 4, chapter_title: "أسلوب التعجب" }), mcq("istifham", { subject: "arabic", chapter: 2, chapter_title: "الاستفهام" })];
    const result = await loadPdfBank({ ...selection, subject: "arabic", chapter: "2", list: "default" });
    expect(result.questions.filter(q => q.kind === "mcq").map(q => q.id)).toEqual(["mcq:taajjub"]);
    expect(new Set(result.questions.filter(q => q.kind === "ministerial").map(q => normalizeQuestion(q.question)))).toEqual(new Set((await loadSource("ministerial:arabic:ar:2")).map(q => normalizeQuestion(q.q))));
  });
  it("keeps Islamic meanings separate from numbered units", async () => {
    backend.rows.mcq_banks = [mcq("unit", { subject: "islamic", chapter: 1, chapter_title: "الوحدة الأولى" }), mcq("meaning", { subject: "islamic", chapter: 1, chapter_title: "المعاني" })];
    const unit = await loadPdfBank({ ...selection, subject: "islamic", chapter: "unit1", list: "default" });
    const meanings = await loadPdfBank({ ...selection, subject: "islamic", chapter: "meanings", list: "default" });
    expect(unit.questions.filter(q => q.kind === "mcq").map(q => q.id)).toEqual(["mcq:unit"]);
    expect(meanings.questions.filter(q => q.kind === "mcq").map(q => q.id)).toEqual(["mcq:meaning"]);
  });
  it("keeps English grammar, literature and passages in their own sections", async () => {
    backend.rows.mcq_banks = [
      mcq("grammar", { subject: "english", language: "en", chapter_title: "Unit 1" }),
      mcq("passage", { subject: "english_paragraphs", language: "en", chapter_title: "Unit 1" }),
      mcq("old-passage", { subject: "english", language: "en", chapter_title: "Textbook Passages" }),
      mcq("literature", { subject: "english_literature", language: "en", chapter_title: "Section 1" }),
    ];
    const s = { ...selection, subject: "english", language: "en", list: "mohammed-al-nadawi" } as BankSelection;
    const grammar = await loadPdfBank(s), passages = await loadPdfBank({ ...s, section: "paragraphs" }), literature = await loadPdfBank({ ...s, section: "literature" });
    expect(grammar.questions.filter(q => q.kind === "mcq").map(q => q.id)).toEqual(["mcq:grammar"]);
    expect(passages.questions.filter(q => q.kind === "mcq").map(q => q.id)).toEqual(["mcq:passage", "mcq:old-passage"]);
    expect(literature.questions.some(q => q.id === "mcq:literature")).toBe(true);
    expect(literature.questions.some(q => ["mcq:grammar", "mcq:passage", "mcq:old-passage"].includes(q.id))).toBe(false);
  });
  it("reports unavailable optional banks and excludes unapproved custom cards", async () => {
    backend.rows.custom_flashcards = [
      { id: "approved", subject: "physics", chapter: "1", language: "ar", approved: true, question: "Approved new prompt", answer: "Approved answer" },
      { id: "pending", subject: "physics", chapter: "1", language: "ar", approved: false, question: "Unapproved prompt", answer: "Pending answer" },
    ];
    backend.errors.add("mcq_banks");
    const result = await loadPdfBank(selection);
    expect(result.warnings).toEqual(["mcq"]);
    expect(result.questions.some(q => q.id === "flashcard:approved")).toBe(true);
    expect(result.questions.some(q => q.id === "flashcard:pending")).toBe(false);
  });
  it("does not restore legacy Arabic literature cards removed from the student deck", async () => {
    backend.rows.custom_flashcards = [{ id: "old-literature", subject: "arabic", chapter: "1", language: "ar", approved: true, question: "Legacy literature prompt", answer: "Old answer" }];
    const result = await loadPdfBank({ ...selection, subject: "arabic", list: "default" });
    expect(result.questions.some(q => q.id === "flashcard:old-literature")).toBe(false);
    expect(backend.ranges.some(read => read.table === "custom_flashcards")).toBe(false);
  });
});
