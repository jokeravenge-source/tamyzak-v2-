import type { MainMenuChoice } from "@/pages/MainMenu";

/**
 * Tools that an administrator can place on a teacher profile.
 * Keeping this catalog separate lets both the admin editor and the student
 * directory render the same labels and prevents invalid navigation keys.
 */
export const TEACHER_TOOL_CATALOG = [
  { key: "subjectsHub", labelAr: "المواد", labelEn: "Subjects" },
  { key: "flashcards", labelAr: "البطاقات التعليمية", labelEn: "Flashcards" },
  { key: "mcqBank", labelAr: "بنك الأسئلة", labelEn: "MCQ Bank" },
  { key: "ministerialBank", labelAr: "بنك الوزاريات", labelEn: "Ministerial Bank" },
  { key: "examGenerator", labelAr: "مولّد الامتحانات", labelEn: "Exam Generator" },
  { key: "problemGenerator", labelAr: "مولّد المسائل", labelEn: "Problem Generator" },
  { key: "physicsProblemSolver", labelAr: "حل مسائل الفيزياء", labelEn: "Physics Problem Solver" },
  { key: "physicsLaws", labelAr: "قوانين الفيزياء", labelEn: "Physics Laws" },
  { key: "physicsSchemes", labelAr: "مخططات الفيزياء", labelEn: "Physics Schemes" },
  { key: "physicsActivities", labelAr: "تجارب الفيزياء", labelEn: "Physics Activities" },
  { key: "chemistryExperiments", labelAr: "تجارب الكيمياء", labelEn: "Chemistry Experiments" },
  { key: "chemicalEquations", labelAr: "المعادلات الكيميائية", labelEn: "Chemical Equations" },
  { key: "biologySchemes", labelAr: "مخططات الأحياء", labelEn: "Biology Schemes" },
  { key: "biologyDrawings", labelAr: "رسومات الأحياء", labelEn: "Biology Drawings" },
  { key: "englishVerbForms", labelAr: "تصاريف الأفعال", labelEn: "Verb Forms" },
  { key: "englishReadingPractice", labelAr: "تدريب القطع", labelEn: "Reading Practice" },
  { key: "englishEssays", labelAr: "إنشاءات الإنكليزي", labelEn: "English Essays" },
  { key: "poemsChecker", labelAr: "مدقق القصائد", labelEn: "Poems Checker" },
  { key: "frenchSynonyms", labelAr: "مرادفات الفرنسية", labelEn: "French Synonyms" },
  { key: "frenchAntonyms", labelAr: "أضداد الفرنسية", labelEn: "French Antonyms" },
  { key: "adminNotes", labelAr: "الإثرائيات", labelEn: "Enrichments" },
  { key: "ourCourses", labelAr: "دوراتنا", labelEn: "Our Courses" },
  { key: "summaries", labelAr: "الملخصات", labelEn: "Summaries" },
  { key: "mindmap", labelAr: "الخريطة الذهنية", labelEn: "Mind Map" },
  { key: "youtube", labelAr: "مشغّل يوتيوب", labelEn: "YouTube Player" },
] as const satisfies ReadonlyArray<{
  key: MainMenuChoice;
  labelAr: string;
  labelEn: string;
}>;

export type TeacherToolKey = (typeof TEACHER_TOOL_CATALOG)[number]["key"];

const toolKeys = new Set<string>(TEACHER_TOOL_CATALOG.map((tool) => tool.key));

export function isTeacherToolKey(value: string): value is TeacherToolKey {
  return toolKeys.has(value);
}

