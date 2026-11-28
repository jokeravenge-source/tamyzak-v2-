import type { AppLanguage } from "@/components/LanguageGate";
import { getFlashcardChapters } from "@/data/flashcardChapters";
import { loadSource, type SourceCard } from "@/features/pdf-builder/bankSources";
import { supabase } from "@/integrations/supabase/client";
import { applyAhmedFlashcardOverrides } from "@/lib/ahmedFlashcardOverrides";
import { applyFrenchFlashcardOverrides } from "@/lib/frenchFlashcardOverrides";
import { resolveMcqChapter } from "@/lib/mcqChapters";
import { normalizeStudySearch } from "@/lib/studySearch";
import { PAPER_REVIEW_SUBJECTS, type PaperChapter, type PaperSubjectId } from "../../supabase/functions/_shared/paperReviewCurriculum";

export { PAPER_REVIEW_SUBJECTS as QUICK_STUDY_SUBJECTS };

export type QuickStudySelection = { subject: PaperSubjectId; chapter: string };
export type QuickStudyCards = { flashcards: readonly SourceCard[]; ministerial: readonly SourceCard[]; exercises: readonly SourceCard[] };

const englishLiterature = getFlashcardChapters("english", "literature").map(item => ({
  key: `literature-${item.n}`,
  ar: `الأدب · ${item.arTitle}`,
  en: `Literature · ${item.title}`,
}));
const arabicNumbers: Readonly<Record<string, { flashcard?: number; ministerial?: string; bank?: number }>> = {
  "ar-adab": { bank: 1 },
  "ar-istifham": { flashcard: 6, ministerial: "6", bank: 2 },
  "ar-madh": { ministerial: "madh-dham", bank: 3 },
  "ar-taajub": { flashcard: 2, ministerial: "2", bank: 4 },
  "ar-nida": { flashcard: 5, ministerial: "5", bank: 5 },
  "ar-tawkid": { flashcard: 3 },
  "ar-taqdim": { flashcard: 4 },
};
const frenchNumbers: Readonly<Record<string, number>> = {
  negation: 1, interrogation: 2, "relative-pronouns": 3, feminization: 4, plural: 5, adverbs: 6, reading: 7,
};

export function getQuickStudyChapters(subject: string): PaperChapter[] {
  const chapters = PAPER_REVIEW_SUBJECTS.find(item => item.id === subject)?.chapters ?? [];
  return subject === "english" ? chapters.flatMap(item => item.key === "literature" ? englishLiterature : [item]) : [...chapters];
}

export function getQuickStudyBankScope({ subject, chapter }: QuickStudySelection) {
  const englishSection = chapter.match(/^literature-(\d+)$/)?.[1];
  if (subject === "english" && englishSection) return { subject: "english_literature", chapters: [Number(englishSection)] };
  if (subject === "arabic") {
    const { flashcard, bank } = arabicNumbers[chapter] ?? {};
    return { subject, chapters: [...new Set([flashcard, bank].filter((item): item is number => item !== undefined))] };
  }
  const number = subject === "french" ? frenchNumbers[chapter] : Number(chapter);
  return { subject, chapters: Number.isInteger(number) && number > 0 ? [number] : [] };
}

const normalizeChapterTitle = (title: string) => normalizeStudySearch(title).replace(/[^\p{L}\p{N}]/gu, "");

export function matchesQuickStudyChapter(selection: QuickStudySelection, row: Parameters<typeof resolveMcqChapter>[0]) {
  const scope = getQuickStudyBankScope(selection);
  if (row.subject !== scope.subject || !scope.chapters.includes(row.chapter)) return false;
  if (row.subject === "english_literature") return true;

  const title = normalizeChapterTitle(row.chapter_title ?? "");
  const namedChapter = getQuickStudyChapters(selection.subject).find(item =>
    [item.ar, item.en].some(name => normalizeChapterTitle(name) === title));
  if (namedChapter) return namedChapter.key === selection.chapter;

  if (selection.subject === "arabic") {
    const { flashcard } = arabicNumbers[selection.chapter] ?? {};
    return Boolean(flashcard && resolveMcqChapter(row)?.n === flashcard);
  }
  if (selection.subject === "islamic") return false;
  if (selection.subject === "math") return !title || title === `chapter${row.chapter}` || title === `الفصل${row.chapter}`;
  return resolveMcqChapter(row)?.n === row.chapter;
}

export function getQuickStudyProgressScope(selection: QuickStudySelection) {
  const { subject, chapter } = selection;
  if (subject === "english" && chapter.startsWith("literature-")) {
    return { subject: "english_literature", chapter: chapter.slice("literature-".length) };
  }
  if (subject === "arabic" && arabicNumbers[chapter]?.flashcard) {
    return { subject, chapter: String(arabicNumbers[chapter].flashcard) };
  }
  if (subject === "french" && frenchNumbers[chapter]) {
    return { subject, chapter: String(frenchNumbers[chapter]) };
  }
  return selection;
}

async function loadFlashcards({ subject, chapter }: QuickStudySelection, language: AppLanguage, signal: AbortSignal) {
  switch (subject) {
    case "physics": return loadSource(`physics:haydar-diwan:${language}:${chapter}`);
    case "chemistry": {
      const [cards, overrides] = await Promise.all([
        loadSource(`chemistry:ahmed-al-nadawi:${language}:${chapter}`),
        supabase.from("ahmed_flashcard_overrides").select("chapter,language,card_id,question,answer,deleted")
          .eq("chapter", Number(chapter)).eq("language", language).abortSignal(signal),
      ]);
      return applyAhmedFlashcardOverrides(cards, Number(chapter), language, overrides.data ?? []);
    }
    case "biology": return loadSource(`biology:nadia-al-nuaimi:${language}:${chapter}`);
    case "english":
      if (chapter === "reading") return loadSource("english:paragraphs:en:1");
      if (chapter.startsWith("literature-")) {
        const { getEnglishLiteratureDeck } = await import("@/data/englishLiteratureFlashcards");
        return getEnglishLiteratureDeck(chapter.slice("literature-".length))?.cards ?? [];
      }
      return loadSource(`english:mohammed-al-nadawi:en:${chapter}`);
    case "french": {
      const number = frenchNumbers[chapter];
      if (!number) return [];
      const [decks, overrides] = await Promise.all([
        import("@/data/frenchFlashcardDecks"),
        supabase.from("french_flashcard_overrides").select("*").eq("chapter", number).abortSignal(signal),
      ]);
      return applyFrenchFlashcardOverrides(decks.getFrenchFlashcardDeck(number)?.cards ?? [], number, overrides.data ?? []);
    }
    case "arabic": return loadSource(`arabic:default:ar:${arabicNumbers[chapter]?.flashcard ?? ""}`);
    case "math": return loadSource(`math:ahmed-fathi:ar:${chapter}`);
    case "islamic": return [];
  }
}

function loadMinisterial({ subject, chapter }: QuickStudySelection, language: AppLanguage) {
  if (subject === "physics" || subject === "chemistry" || (subject === "biology" && /^\d+$/.test(chapter))) {
    // The PDF source maps Arabic Biology 2–5 to flashcards; use the separate exam-question sets.
    const bankLanguage = subject === "biology" && chapter !== "1" ? "en" : language;
    return loadSource(`ministerial:${subject}:${bankLanguage}:${chapter}`);
  }
  if (subject === "arabic") return loadSource(`ministerial:arabic:ar:${arabicNumbers[chapter]?.ministerial ?? ""}`);
  if (subject === "islamic") return loadSource(`ministerial:islamic:ar:unit${chapter}`);
  return Promise.resolve([]);
}

export async function loadQuickStudyCards(selection: QuickStudySelection, language: AppLanguage, signal: AbortSignal) {
  const [flashcards, ministerial, supplemental] = await Promise.allSettled([
    loadFlashcards(selection, language, signal),
    loadMinisterial(selection, language),
    import("@/data/quickStudySupplement").then(({ getQuickStudySupplement }) =>
      getQuickStudySupplement(selection.subject, selection.chapter, language)),
  ]);
  const cards: QuickStudyCards = {
    flashcards: flashcards.status === "fulfilled" ? flashcards.value : [],
    ministerial: ministerial.status === "fulfilled" ? ministerial.value : [],
    exercises: supplemental.status === "fulfilled" ? supplemental.value : [],
  };
  return { ...cards, unavailable: [flashcards, ministerial, supplemental].some(result => result.status === "rejected") };
}

const builtInMcqs: Record<string, (language: AppLanguage) => Promise<Awaited<ReturnType<typeof import("@/lib/physicsChapter2Mcqs").getBuiltInPhysicsCh2>>>> = {
  "physics/2": language => import("@/lib/physicsChapter2Mcqs").then(m => m.getBuiltInPhysicsCh2(language)),
  "physics/3": language => import("@/lib/physicsChapter3Mcqs").then(m => m.getBuiltInPhysicsCh3(language)),
  "physics/4": language => import("@/lib/physicsChapter4Mcqs").then(m => m.getBuiltInPhysicsCh4(language)),
  "physics/5": language => import("@/lib/physicsChapter5Mcqs").then(m => m.getBuiltInPhysicsCh5(language)),
  "physics/6": language => import("@/lib/physicsChapter6Mcqs").then(m => m.getBuiltInPhysicsCh6(language)),
  "physics/7": language => import("@/lib/physicsChapter7Mcqs").then(m => m.getBuiltInPhysicsCh7(language)),
  "biology/2": language => import("@/lib/biologyChapter2Mcqs").then(m => m.getBuiltInBiologyChapter2(language)),
  "english/literature-1": language => import("@/lib/englishLiteratureSection1Mcqs").then(m => m.getBuiltInEnglishLiteratureSection1(language)),
  "english/literature-2": language => import("@/lib/englishLiteratureSection2Mcqs").then(m => m.getBuiltInEnglishLiteratureSection2(language)),
  "english/literature-3": language => import("@/lib/englishLiteratureSection3Mcqs").then(m => m.getBuiltInEnglishLiteratureSection3(language)),
};

export function loadQuickStudyBuiltInMcqs({ subject, chapter }: QuickStudySelection, language: AppLanguage) {
  return builtInMcqs[`${subject}/${chapter}`]?.(language) ?? Promise.resolve([]);
}
