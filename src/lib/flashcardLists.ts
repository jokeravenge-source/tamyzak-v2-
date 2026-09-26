import type { AppSubject } from "@/pages/Subjects";

/**
 * Flashcard collections that can be assigned to a teacher profile.
 * The current Physics collection already exists in the app; this catalog
 * gives it a stable display name and leaves room for more teacher lists.
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

