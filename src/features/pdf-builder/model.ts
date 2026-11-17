import type { BankSubject } from "@/data/subjectChapters";
import type { StudyTextBlock } from "@/components/TextStudyContent";

export type PdfLanguage = "ar" | "en";
export type QuestionKind = "ministerial" | "review" | "mcq";
export const kindLabel = (kind: QuestionKind, ar: boolean) => kind === "ministerial" ? ar ? "الأسئلة الوزارية" : "Ministerial questions" : kind === "review" ? ar ? "أسئلة المراجعة غير الوزارية" : "Non-ministerial review" : ar ? "اختيار من متعدد" : "Multiple choice";
export type QuestionOrigin = "ministerial" | "review";
export type PdfTemplate = "revision" | "exam" | "compact" | "tamayzak";
export type AnswerPlacement = "after" | "end" | "none";
export type PdfQuestion = {
  id: string; kind: QuestionKind; origin: QuestionOrigin; question: string; answer: string;
  choices?: string[]; answerIndex?: number; answerBlocks?: StudyTextBlock[]; source: string;
};
export type Chapter = { key: string; n: number | null; title: string; arTitle: string };
export type BankSelection = { subject: BankSubject; chapter: string; language: PdfLanguage; list: string; section: "grammar" | "literature" | "paragraphs" };
export type PdfSettings = {
  title: string; student: string; subtitle: string; language: PdfLanguage; template: PdfTemplate;
  fontSize: number; answers: AnswerPlacement;
};
export type QuestionFilters = {
  includeMinisterial: boolean; includeReview: boolean; includeMcq: boolean; includeWritten: boolean;
  counts: Record<QuestionKind, number | "all">; order: "bank" | "random";
};
export const TEMPLATES: { id: PdfTemplate; ar: string; en: string; descriptionAr: string; descriptionEn: string }[] = [
  { id: "revision", ar: "ملزمة مراجعة", en: "Revision booklet", descriptionAr: "أقسام واضحة وأجوبة مرتّبة", descriptionEn: "Clear sections and answer blocks" },
  { id: "exam", ar: "ورقة امتحان", en: "Exam paper", descriptionAr: "أبيض وأسود ومساحة للحل", descriptionEn: "Black and white with writing space" },
  { id: "compact", ar: "مراجعة مكثفة", en: "Compact revision", descriptionAr: "مسافات مختصرة لصفحات أقل", descriptionEn: "Tighter spacing for fewer pages" },
  { id: "tamayzak", ar: "هويّة تميّزك", en: "Tamayzak signature", descriptionAr: "غلاف وهوية كحلية وزرقاء وكريمية", descriptionEn: "A navy, blue and cream cover" },
];
export const normalizeQuestion = (value: string) => value.normalize("NFC").trim()
  .replace(/^(?:س|Q|Question)\s*[0-9٠-٩]+\s*(?:[:.)،-]\s*|(?=\())/u, "")
  .replace(/^\([^()]*?(?:19|20)[0-9]{2}[^()]*\)\s*[:،.-]?\s*/u, "")
  .replace(/\s+/gu, " ");
export const hasMinisterialLabel = (value: string) => /وزار[يةي]|ministerial|past[ _-]?papers?|(?:19|20)\d{2}\s*(?:\/\s*[123]|تمهيدي|دور)/iu.test(value);

/** Keep the ministerial copy when the same prompt appears in both written banks. */
export function normalizeBank(questions: readonly PdfQuestion[]): PdfQuestion[] {
  const seen = new Set<string>();
  return [...questions].sort((a, b) => Number(b.origin === "ministerial") - Number(a.origin === "ministerial"))
    .filter(question => {
      if (!question.question.trim() || !question.answer.trim()) return false;
      const key = `${question.kind === "mcq" ? "mcq" : "written"}:${normalizeQuestion(question.question)}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
}
export function eligibleQuestions(bank: readonly PdfQuestion[], filters: QuestionFilters): PdfQuestion[] {
  return bank.filter(q => q.kind === "mcq"
    ? filters.includeMcq && (q.origin === "ministerial" ? filters.includeMinisterial : filters.includeReview)
    : filters.includeWritten && (q.kind === "ministerial" ? filters.includeMinisterial : filters.includeReview));
}
export function selectQuestions(bank: readonly PdfQuestion[], filters: QuestionFilters): PdfQuestion[] {
  const eligible = eligibleQuestions(bank, filters);
  if (!filters.includeMinisterial && !filters.includeReview) throw new Error("choose_source");
  const result: PdfQuestion[] = [];
  for (const kind of ["ministerial", "review", "mcq"] as const) {
    if (kind === "mcq" ? !filters.includeMcq : !filters.includeWritten || (kind === "ministerial" ? !filters.includeMinisterial : !filters.includeReview)) continue;
    const pool = eligible.filter(q => q.kind === kind);
    const count = filters.counts[kind];
    if (count !== "all" && (!Number.isInteger(count) || count < 0 || count > pool.length)) throw new Error("invalid_count");
    if (filters.order === "random") {
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    }
    result.push(...pool.slice(0, count === "all" ? pool.length : count));
  }
  if (!result.length) throw new Error("no_questions");
  return result;
}
