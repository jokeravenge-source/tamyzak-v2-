import type { AppSubject } from "@/pages/Subjects";

/**
 * Flashcard collections that can be assigned to a teacher profile.
 * The current subject collections already exist in the app; this catalog
 * gives each one a stable teacher-facing name and supports future lists.
 */
export const FLASHCARD_LISTS = [
  {
    id: "physics-hydar-diwan",
    subject: "physics",
    selectorValue: "haydar-diwan",
    nameAr: "حيدر ديوان",
    nameEn: "Hydar Diwan",
    subjectAr: "الفيزياء",
    subjectEn: "Physics",
  },
  {
    id: "biology-mohammed-al-anzi",
    subject: "biology",
    selectorValue: "mohammed-al-anzi",
    nameAr: "محمد العنزي",
    nameEn: "Mohammed Al-Anzi",
    subjectAr: "الأحياء",
    subjectEn: "Biology",
  },
  {
    id: "chemistry-ahmed-al-nadawi",
    subject: "chemistry",
    selectorValue: "ahmed-al-nadawi",
    nameAr: "احمد النداوي",
    nameEn: "Ahmed Al-Nadawi",
    subjectAr: "الكيمياء",
    subjectEn: "Chemistry",
  },
  {
    id: "french-mohammed-ali-al-kinani",
    subject: "french",
    selectorValue: "mohammed-ali-al-kinani",
    nameAr: "محمد علي الكناني",
    nameEn: "Mohammed Ali Al-Kinani",
    subjectAr: "الفرنسية",
    subjectEn: "French",
  },
  {
    id: "english-mohammed-al-nadawi",
    subject: "english",
    selectorValue: "mohammed-al-nadawi",
    nameAr: "محمد النداوي",
    nameEn: "Mohammed Al-Nadawi",
    subjectAr: "الإنجليزية",
    subjectEn: "English",
  },
  {
    id: "math-ahmed-fathi",
    subject: "math",
    selectorValue: "ahmed-fathi",
    nameAr: "احمد فتحي",
    nameEn: "Ahmed Fathi",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  subject: AppSubject;
  selectorValue: string;
  nameAr: string;
  nameEn: string;
  subjectAr: string;
  subjectEn: string;
}>;

export type FlashcardListId = (typeof FLASHCARD_LISTS)[number]["id"];
export type FlashcardListDefinition = (typeof FLASHCARD_LISTS)[number];

export const DEFAULT_PHYSICS_FLASHCARD_LIST_ID: FlashcardListId = "physics-hydar-diwan";

export function isFlashcardListId(value: string): value is FlashcardListId {
  return FLASHCARD_LISTS.some((list) => list.id === value);
}
