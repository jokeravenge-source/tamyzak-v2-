import type { MainMenuChoice } from "@/pages/MainMenu";

// Student-facing destinations that the AI guide is allowed to open.
// Keep admin-only screens and temporarily unavailable tools out of this list.
export const GUIDE_TOOL_KEYS = [
  "basics",
  "subjectsHub",
  "ourTeachers",
  "ourCourses",
  "flashcards",
  "malazam",
  "summaries",
  "adminNotes",
  "notes",
  "mcq",
  "mcqBank",
  "ministerialBank",
  "mistakes",
  "examGenerator",
  "essay",
  "biologyDrawings",
  "biologySchemes",
  "physicsSchemes",
  "physicsLaws",
  "physicsQuickMcq",
  "physicsActivities",
  "physicsProblemSolver",
  "problemGenerator",
  "chemistryExperiments",
  "chemicalEquations",
  "organicEquations",
  "atomAtlas",
  "englishEssays",
  "englishIsqat",
  "englishVerbForms",
  "englishReadingPractice",
  "frenchSynonyms",
  "frenchAntonyms",
  "frenchConjugator",
  "islamicSurahs",
  "hadithChecker",
  "poemsChecker",
  "mindmap",
  "videoNotes",
  "podcastTutor",
  "youtube",
  "canvas",
  "textToVideo",
  "sessions",
  "liveBattle",
  "challenge",
  "missions",
  "todo",
  "report",
  "leaderboard",
  "dailyGame",
  "whoIsBest",
  "news",
  "advices",
  "companion",
  "account",
  "premium",
  "more",
  "joinTamayzak",
] as const satisfies readonly MainMenuChoice[];

const guideToolKeys = new Set<string>(GUIDE_TOOL_KEYS);

export type GuideToolKey = (typeof GUIDE_TOOL_KEYS)[number];

export function isGuideToolKey(key: string): key is GuideToolKey {
  return guideToolKeys.has(key);
}
