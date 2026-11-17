import { getFlashcardChapters } from "@/data/flashcardChapters";
import { FLASHCARD_LISTS } from "@/lib/flashcardLists";
import type { BankSelection, Chapter } from "./model";

export function chapterOptions(subject: BankSelection["subject"], section: BankSelection["section"]): Chapter[] {
  if (subject === "islamic") return [
    { key: "meanings", n: null, title: "Meanings", arTitle: "المعاني" },
    ...[1, 2, 3, 4].map(n => ({ key: `unit${n}`, n, title: `Unit ${n}`, arTitle: `الوحدة ${n}` })),
  ];
  const chapters = getFlashcardChapters(subject, section).map(c => ({ key: String(c.n), n: c.n, title: subject === "math" && c.n > 2 ? `Chapter ${c.n}` : c.title, arTitle: subject === "math" && c.n > 2 ? `الفصل ${c.n}` : c.arTitle }));
  if (subject === "arabic") chapters.push({ key: "madh-dham", n: null, title: "Praise and blame", arTitle: "المدح والذم" });
  return chapters;
}
export function listOptions(subject: BankSelection["subject"]) {
  const lists = FLASHCARD_LISTS.filter(list => list.subject === subject).map(list => ({ value: list.selectorValue as string, ar: list.nameAr as string, en: list.nameEn as string }));
  return lists.length ? lists : [{ value: "default", ar: "بطاقات تميّزك", en: "Tamayzak flashcards" }];
}
export const contentLanguage = (s: BankSelection): "ar" | "en" => ["arabic", "islamic", "math", "french"].includes(s.subject) ? "ar" : s.subject === "english" ? "en" : s.language;
