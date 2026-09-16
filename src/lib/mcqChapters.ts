import { getFlashcardChapters, type FlashcardSection } from "@/data/flashcardChapters";
import type { ChapterMeta } from "@/data/subjectChapters";

export type ChapteredMcq = { id: string; subject: string; chapter: number; chapter_title: string | null };
export type McqChapterGroup = { key: string; chapter: number | null; title: string; count: number; questionIds: string[] };

const normalize = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[\u064B-\u065F\u0670ـ]/g, "").replace(/[أإآ]/g, "ا").replace(/[^\p{L}\p{N}]/gu, "");

/** Preserve question IDs and answers; reconcile only known chapter metadata. */
export function resolveMcqChapter(row: ChapteredMcq): ChapterMeta | null {
  const chapters = getFlashcardChapters(row.subject);
  const title = normalize(row.chapter_title ?? "");
  if (title) {
    const match = chapters.find(c => [c.title, c.arTitle].some(t => normalize(t) === title));
    if (match) return match;
    const numbered = chapters.find(c => c.n === row.chapter);
    // These flashcard lists use generic numbered titles; retain the bank's known number.
    if (numbered && (row.subject === "chemistry" || row.subject === "english")) return numbered;
    // Older Arabic bank numbering differed from flashcards.
    const aliases: Record<string, number> = { istifham: 6, اسلوبالاستفهام: 6, tawkeed: 3, taajjub: 2, اسلوبالتعجب: 2, exclamation: 2, nida: 5, taqdimwatakheer: 4, التقديموالتاخير: 4 };
    if (row.subject === "arabic" && aliases[title]) return chapters.find(c => c.n === aliases[title]) ?? null;
    // A specific, conflicting title must not be silently replaced with a guess.
    if (!/^(chapter|unit|الفصل|الوحدة)\d+$/.test(title)) return null;
  }
  // Islamic units and old Arabic chapter numbers cannot be mapped by number alone.
  if (row.subject === "arabic" || row.subject === "islamic") return null;
  return chapters.find(c => c.n === row.chapter) ?? null;
}

export function getMcqChapterGroups(subject: string, rows: ChapteredMcq[], language: "ar" | "en"): McqChapterGroup[] {
  const groups = getFlashcardChapters(subject).map(c => ({ key: `chapter:${c.n}`, chapter: c.n, title: language === "ar" ? c.arTitle : c.title, count: 0, questionIds: [] as string[] }));
  for (const row of rows.filter(r => r.subject === subject)) {
    const meta = resolveMcqChapter(row);
    const key = meta ? `chapter:${meta.n}` : subject === "english_literature" ? `section:${row.chapter}` : "unclassified";
    let group = groups.find(g => g.key === key);
    if (!group) {
      group = { key, chapter: null, title: subject === "english_literature" ? (row.chapter_title ?? `${language === "ar" ? "القسم" : "Section"} ${row.chapter}`) : language === "ar" ? "غير مصنفة / خارج تقسيم البطاقات" : "Unclassified / outside flashcard chapters", count: 0, questionIds: [] };
      groups.push(group);
    }
    group.count += 1;
    group.questionIds.push(row.id);
  }
  return groups;
}

export function validatedGeneratedChapter(value: unknown, subject: string, section: FlashcardSection, selectedChapter: number | null): number | null {
  const allowed = getFlashcardChapters(subject, section).filter(c => c.title !== "Coming Soon");
  // Explicitly selected context remains usable before the updated edge function is deployed.
  const candidate = value === undefined ? selectedChapter : value;
  return typeof candidate === "number" && allowed.some(c => c.n === candidate) && (selectedChapter === null || candidate === selectedChapter) ? candidate : null;
}
