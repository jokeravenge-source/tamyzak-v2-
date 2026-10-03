import { flashcardsBioCh1NadiaAr } from "@/data/flashcardsBioCh1NadiaAr";
import { flashcardsBioCh1NadiaEn } from "@/data/flashcardsBioCh1NadiaEn";
import { flashcardsBioCh2NadiaAr } from "@/data/flashcardsBioCh2NadiaAr";
import { flashcardsBioCh2NadiaEn } from "@/data/flashcardsBioCh2NadiaEn";
import { flashcardsBioCh3NadiaAr } from "@/data/flashcardsBioCh3NadiaAr";
import { flashcardsBioCh3NadiaEn } from "@/data/flashcardsBioCh3NadiaEn";
import { flashcardsBioCh4NadiaAr } from "@/data/flashcardsBioCh4NadiaAr";
import { flashcardsBioCh4NadiaEn } from "@/data/flashcardsBioCh4NadiaEn";
import { flashcardsBioCh5NadiaAr } from "@/data/flashcardsBioCh5NadiaAr";
import { flashcardsBioCh5NadiaEn } from "@/data/flashcardsBioCh5NadiaEn";

export type QuestionAnswer = { q: string; a: string };

export type NadiaMinisterialChapter = {
  number: number;
  titleAr: string;
  titleEn: string;
  arabic: readonly QuestionAnswer[];
  english: readonly QuestionAnswer[];
};

export type NadiaMinisterialQuestion = {
  key: string;
  chapter: NadiaMinisterialChapter;
  number: number;
  arabic: QuestionAnswer;
  english: QuestionAnswer;
};

export const NADIA_MINISTERIAL_ACCESS_SESSION_KEY = "nadia_ministerial_questions_access_v1";

export const nadiaMinisterialChapters: NadiaMinisterialChapter[] = [
  { number: 1, titleAr: "الخلية والانقسام", titleEn: "Cell & Cell Division", arabic: flashcardsBioCh1NadiaAr, english: flashcardsBioCh1NadiaEn },
  { number: 2, titleAr: "الأنسجة", titleEn: "Tissues", arabic: flashcardsBioCh2NadiaAr, english: flashcardsBioCh2NadiaEn },
  { number: 3, titleAr: "التكاثر", titleEn: "Reproduction", arabic: flashcardsBioCh3NadiaAr, english: flashcardsBioCh3NadiaEn },
  { number: 4, titleAr: "التطور الجنيني", titleEn: "Embryonic Development", arabic: flashcardsBioCh4NadiaAr, english: flashcardsBioCh4NadiaEn },
  { number: 5, titleAr: "الوراثة", titleEn: "Genetics", arabic: flashcardsBioCh5NadiaAr, english: flashcardsBioCh5NadiaEn },
];

export const nadiaMinisterialQuestions: NadiaMinisterialQuestion[] = nadiaMinisterialChapters.flatMap((chapter) =>
  chapter.arabic.slice(0, Math.min(chapter.arabic.length, chapter.english.length)).map((arabic, index) => ({
    key: `${chapter.number}-${index + 1}`,
    chapter,
    number: index + 1,
    arabic,
    english: chapter.english[index],
  })),
);

export const NADIA_MINISTERIAL_QUESTION_COUNT = nadiaMinisterialQuestions.length;
