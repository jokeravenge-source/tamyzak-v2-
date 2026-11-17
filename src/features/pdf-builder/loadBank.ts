import { supabase } from "@/integrations/supabase/client";
import { applyAhmedFlashcardOverrides, type AhmedFlashcardOverride } from "@/lib/ahmedFlashcardOverrides";
import { applyFrenchFlashcardOverrides, type FrenchFlashcardOverride } from "@/lib/frenchFlashcardOverrides";
import { resolveMcqChapter } from "@/lib/mcqChapters";
import { isExamRelevantQuestion } from "@/lib/examRelevantMcq";
import { contentLanguage } from "./catalog";
import { loadSource, type SourceCard } from "./bankSources";
import { hasMinisterialLabel, normalizeBank, normalizeQuestion, type BankSelection, type PdfQuestion } from "./model";

type McqRow = { id: string; subject: string; chapter: number; chapter_title: string | null; question: string; choices: unknown; answer_index: number; explanation: string | null; source?: string | null; tags?: string[] };
export type BankLoadResult = { questions: PdfQuestion[]; warnings: string[] };
const PAGE = 1000;

/** Query in pages, rather than silently truncating the student's chapter at 2,000 rows. */
async function pages<T>(read: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await read(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

export async function loadPdfBank(s: BankSelection): Promise<BankLoadResult> {
  const lang = contentLanguage(s);
  const warnings: string[] = [];
  const n = Number(s.chapter);
  let cards: readonly SourceCard[] = [];
  if (s.subject === "french") {
    const { getFrenchFlashcardDeck } = await import("@/data/frenchFlashcardDecks");
    cards = getFrenchFlashcardDeck(n)?.cards ?? [];
    // Do not export stale or administratively hidden source cards on a failed overlay read.
    const edits = await pages<FrenchFlashcardOverride>((from, to) => supabase.from("french_flashcard_overrides").select("*").eq("chapter", n).order("card_index").range(from, to));
    cards = applyFrenchFlashcardOverrides(cards, n, edits);
  } else if (s.subject === "english" && s.section === "literature") {
    const { getEnglishLiteratureDeck } = await import("@/data/englishLiteratureFlashcards");
    cards = getEnglishLiteratureDeck(s.chapter)?.cards ?? [];
  } else {
    const key = s.subject === "english" && s.section === "paragraphs" ? `english:paragraphs:en:${s.chapter}` : `${s.subject}:${s.list}:${lang}:${s.chapter}`;
    cards = await loadSource(key);
    if (s.subject === "english" && s.section === "grammar") cards = [...cards, ...await loadSource(`english-extra:en:${s.chapter}`)];
    if (s.subject === "chemistry" && s.list === "ahmed-al-nadawi") {
      const edits = await pages<AhmedFlashcardOverride>((from, to) => supabase.from("ahmed_flashcard_overrides").select("chapter,language,card_id,question,answer,deleted").eq("chapter", n).eq("language", lang).order("card_id").range(from, to));
      cards = applyAhmedFlashcardOverrides(cards, n, lang, edits);
    }
  }
  const sourceOnly = s.subject === "chemistry" || (s.subject === "biology" && s.list === "nadia-al-nuaimi") || (s.subject === "arabic" && ["1", "7"].includes(s.chapter));
  if (!sourceOnly && !(s.subject === "english" && s.section !== "grammar") && !(s.subject === "islamic" && s.chapter !== "meanings")) {
    try {
      const extra = await pages<{ id: string; question: string; answer: string }>((from, to) => supabase.from("custom_flashcards")
        .select("id,question,answer").eq("subject", s.subject).eq("chapter", s.chapter === "meanings" ? "1" : s.chapter)
        .eq("language", lang).eq("approved", true).order("id").range(from, to));
      cards = [...cards, ...extra.map(row => ({ id: row.id, q: row.question, a: row.answer }))];
    } catch { warnings.push("flashcards"); }
  }
  // Match the existing ministerial bank, with explicit topic keys where bank chapter numbers differ.
  const written = await loadSource(`ministerial:${s.subject}:${lang}:${s.chapter}`);
  const ministerialTexts = new Set(written.map(card => normalizeQuestion(card.q)));
  const questions: PdfQuestion[] = written.map((card, index) => ({ id: `ministerial:${s.chapter}:${index}`, kind: "ministerial", origin: "ministerial", question: card.q, answer: card.a, answerBlocks: card.answerBlocks, source: "ministerial" }));
  for (const [index, card] of cards.entries()) {
    const ministry = ministerialTexts.has(normalizeQuestion(card.q)) || hasMinisterialLabel(card.q);
    questions.push({ id: `flashcard:${card.id ?? index}`, kind: ministry ? "ministerial" : "review", origin: ministry ? "ministerial" : "review", question: card.q, answer: card.a, answerBlocks: card.answerBlocks, source: s.list });
  }
  let mcqs: McqRow[] = [];
  const mcqSubjects = s.subject === "english" && s.section === "literature" ? ["english_literature"] : s.subject === "english" && s.section === "paragraphs" ? ["english", "english_paragraphs"] : [s.subject];
  try {
    mcqs = await pages<McqRow>((from, to) => supabase.from("mcq_banks").select("id,subject,chapter,chapter_title,question,choices,answer_index,explanation,source,tags")
      .in("subject", mcqSubjects).eq("language", s.language).order("id").range(from, to));
  } catch { warnings.push("mcq"); }
  if (s.subject === "physics" && s.chapter === "2") {
    const { getBuiltInPhysicsCh2 } = await import("@/lib/physicsChapter2Mcqs"); mcqs.push(...getBuiltInPhysicsCh2(s.language));
  }
  if (s.subject === "english" && s.section === "literature") {
    const [{ getBuiltInEnglishLiteratureSection1 }, { getBuiltInEnglishLiteratureSection2 }, { getBuiltInEnglishLiteratureSection3 }] = await Promise.all([
      import("@/lib/englishLiteratureSection1Mcqs"), import("@/lib/englishLiteratureSection2Mcqs"), import("@/lib/englishLiteratureSection3Mcqs"),
    ]);
    mcqs.push(...[getBuiltInEnglishLiteratureSection1, getBuiltInEnglishLiteratureSection2, getBuiltInEnglishLiteratureSection3].flatMap(load => load(s.language)));
  }
  for (const row of mcqs) {
    let matches = false;
    if (s.subject === "english" && s.section === "literature") matches = row.subject === "english_literature" && row.chapter === n;
    else if (s.subject === "english" && s.section === "paragraphs") matches = row.subject === "english_paragraphs" || /paragraph|passage|قطع|استيعاب/i.test(row.chapter_title ?? "");
    else if (s.subject === "english" && /paragraph|passage|قطع|استيعاب/i.test(row.chapter_title ?? "")) matches = false;
    else if (s.subject === "islamic" && s.chapter.startsWith("unit")) {
      const unit = Number(s.chapter.slice(4));
      matches = row.chapter === unit && /unit|وحدة|الوحده/i.test(row.chapter_title ?? "");
    } else if (s.chapter === "madh-dham") matches = /madh|blame|مدح|ذم/i.test(row.chapter_title ?? "");
    else matches = resolveMcqChapter(row)?.n === (s.chapter === "meanings" ? 1 : n);
    if (!matches || !isExamRelevantQuestion(row.question) || !Array.isArray(row.choices) || row.choices.length < 2 || row.choices.some(c => typeof c !== "string" || !c.trim()) || new Set(row.choices.map(c => typeof c === "string" ? c.trim() : c)).size !== row.choices.length || !Number.isInteger(row.answer_index) || row.answer_index < 0 || row.answer_index >= row.choices.length) continue;
    const choices = row.choices as string[];
    const ministry = hasMinisterialLabel([row.source, ...(row.tags ?? []), row.question].join(" ")) || ministerialTexts.has(normalizeQuestion(row.question));
    questions.push({ id: `mcq:${row.id}`, kind: "mcq", origin: ministry ? "ministerial" : "review", question: row.question,
      answer: choices[row.answer_index] + (row.explanation ? `\n${row.explanation}` : ""), choices, answerIndex: row.answer_index, source: row.source || "mcq" });
  }
  return { questions: normalizeBank(questions), warnings };
}
