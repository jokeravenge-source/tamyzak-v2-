/**
 * Shared navigation for Nadia Al-Nuaimy's separate curriculum workspaces.
 * Keeping the chapter metadata separate lets every Nadia entry point use the
 * same navigation order while lecture links are added later.
 */
export const NADIA_ARABIC_LECTURE_COUNT = 39;

export const NADIA_CHAPTERS = [
  { number: 1, ar: "الخلية والانقسام", en: "Cell & Cell Division", lectureCount: NADIA_ARABIC_LECTURE_COUNT },
  { number: 2, ar: "الأنسجة", en: "Tissues", lectureCount: NADIA_ARABIC_LECTURE_COUNT },
  { number: 3, ar: "التكاثر", en: "Reproduction", lectureCount: NADIA_ARABIC_LECTURE_COUNT },
  { number: 4, ar: "التطور الجنيني", en: "Embryonic Development", lectureCount: NADIA_ARABIC_LECTURE_COUNT },
  { number: 5, ar: "الوراثة", en: "Genetics", lectureCount: 25 },
] as const;

export type NadiaChapterNumber = (typeof NADIA_CHAPTERS)[number]["number"];

export const NADIA_CURRICULA = [
  { id: "ar", ar: "المنهج العربي", en: "Arabic Curriculum" },
  { id: "en", ar: "المنهج الإنجليزي", en: "English Curriculum" },
] as const;

export type NadiaCurriculum = (typeof NADIA_CURRICULA)[number]["id"];

export const getNadiaLectureCount = (curriculum: NadiaCurriculum, chapter: NadiaChapterNumber) => {
  if (curriculum === "ar" && chapter === 3) return 34;
  return NADIA_CHAPTERS.find((item) => item.number === chapter)?.lectureCount ?? NADIA_ARABIC_LECTURE_COUNT;
};

export const getNadiaCurriculumLabel = (curriculum: NadiaCurriculum, language: "ar" | "en") =>
  NADIA_CURRICULA.find((item) => item.id === curriculum)![language];

/** Keep the existing Arabic keys intact; English content has its own namespace. */
export const getNadiaLectureTopicKey = (
  curriculum: NadiaCurriculum,
  chapter: NadiaChapterNumber,
  lecture: number,
  mode: "study" | "exam",
) => `nadia-${curriculum}-ch${chapter}-lec${lecture}-${mode}`;

