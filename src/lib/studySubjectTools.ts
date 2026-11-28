import type { BankSubject } from "@/data/subjectChapters";

// Only bank subjects with checked-in inventory. English's prepared questions
// use a dedicated English Literature bank, not the general English key.
const MCQ_SUBJECTS = {
  physics: "physics",
  chemistry: "chemistry",
  biology: "biology",
  english: "english_literature",
} as const;

export function scopedMcqSubject(subject: BankSubject): string | null {
  return Object.prototype.hasOwnProperty.call(MCQ_SUBJECTS, subject) ? MCQ_SUBJECTS[subject as keyof typeof MCQ_SUBJECTS] : null;
}

export const studySubjectVariants = (subject: BankSubject) =>
  subject === "english" ? ["english", "english_literature"] : [subject];
