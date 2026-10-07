/**
 * Shared structure for Nadia Al-Nuaimy's Arabic-curriculum content.
 * Keeping the chapter metadata separate lets every Nadia entry point use the
 * same navigation order while lecture links are added later.
 */
export const NADIA_ARABIC_LECTURE_COUNT = 39;

export const NADIA_CHAPTERS = [
  { number: 1, ar: "الخلية والانقسام", en: "Cell & Cell Division" },
  { number: 2, ar: "الأنسجة", en: "Tissues" },
  { number: 3, ar: "التكاثر", en: "Reproduction" },
  { number: 4, ar: "التطور الجنيني", en: "Embryonic Development" },
  { number: 5, ar: "الوراثة", en: "Genetics" },
] as const;

export type NadiaChapterNumber = (typeof NADIA_CHAPTERS)[number]["number"];
