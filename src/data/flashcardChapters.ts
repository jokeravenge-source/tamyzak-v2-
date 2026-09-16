import type { ChapterMeta } from "@/data/subjectChapters";

export type FlashcardSection = "grammar" | "literature" | "paragraphs";

export const physicsChapters = [
  { n: 1, title: "Capacitors", arTitle: "المتسعات", subtitle: "", locked: false },
  { n: 2, title: "Electromagnetic Induction", arTitle: "الحث الكهرومغناطيسي", subtitle: "", locked: false },
  { n: 3, title: "Alternating Current", arTitle: "التيار المتناوب", subtitle: "", locked: false },
  { n: 4, title: "Electromagnetic Waves", arTitle: "الموجات الكهرومغناطيسية", subtitle: "", locked: false },
  { n: 5, title: "Physical Optics", arTitle: "البصريات الفيزيائية", subtitle: "", locked: false },
  { n: 6, title: "Modern Physics", arTitle: "الفيزياء الحديثة", subtitle: "", locked: false },
  { n: 7, title: "Solid State Electronics", arTitle: "إلكترونيات الحالة الصلبة", subtitle: "", locked: false },
  { n: 8, title: "Atomic Spectra and Laser", arTitle: "الأطياف الذرية والليزر", subtitle: "", locked: false },
];

export const biologyChapters = [
  { n: 1, title: "The Cell", arTitle: "الخلية", subtitle: "", locked: false },
  { n: 2, title: "Tissues", arTitle: "الأنسجة", subtitle: "", locked: false },
  { n: 3, title: "Reproduction", arTitle: "التكاثر", subtitle: "", locked: false },
  { n: 4, title: "Chapter 4", arTitle: "الفصل الرابع", subtitle: "", locked: true },
  { n: 5, title: "Genetics", arTitle: "الوراثة", subtitle: "", locked: false },
];

export const chemistryChapters = [
  { n: 1, title: "Chapter 1", arTitle: "الفصل الأول", subtitle: "", locked: false },
  { n: 2, title: "Chapter 2", arTitle: "الفصل الثاني", subtitle: "", locked: false },
  { n: 3, title: "Chapter 3", arTitle: "الفصل الثالث", subtitle: "", locked: false },
  { n: 4, title: "Chapter 4", arTitle: "الفصل الرابع", subtitle: "", locked: false },
  { n: 5, title: "Chapter 5", arTitle: "الفصل الخامس", subtitle: "", locked: false },
  { n: 6, title: "Chapter 6", arTitle: "الفصل السادس", subtitle: "", locked: false },
];

export const arabicChapters = [
  { n: 1, title: "Literature 1", arTitle: "الأدب الجزء الأول", subtitle: "", locked: false },
  { n: 2, title: "Exclamation", arTitle: "التعجب", subtitle: "", locked: false },
  { n: 3, title: "Tawkeed", arTitle: "التوكيد", subtitle: "", locked: false },
  { n: 4, title: "Taqdim wa Ta'kheer", arTitle: "التقديم والتاخير", subtitle: "", locked: false },
  { n: 5, title: "Nida", arTitle: "النداء", subtitle: "", locked: false },
  { n: 6, title: "Istifham", arTitle: "الاستفهام", subtitle: "", locked: false },
  { n: 7, title: "Literature 1 Extras", arTitle: "الأدب · ملحقات", subtitle: "سنوات · معاني · تراث أدبي", locked: false },
];

export const islamicChapters = [
  { n: 1, title: "Meanings", arTitle: "المعاني", subtitle: "معاني كلمات التربية الإسلامية", locked: false },
];

export const frenchChapters = [
  { n: 1, title: "Negation", arTitle: "النفي", subtitle: "ne ... pas / jamais / plus", locked: false },
  { n: 2, title: "Interrogation", arTitle: "الاستفهام", subtitle: "Est-ce que / Inversion", locked: false },
  { n: 3, title: "Relative Pronouns", arTitle: "ضمائر الوصل", subtitle: "Qui / Que / Où / Dont", locked: false },
  { n: 4, title: "Feminization", arTitle: "التأنيث", subtitle: "Règles & exceptions", locked: false },
  { n: 5, title: "Plural", arTitle: "الجمع", subtitle: "Pluriel des noms & adjectifs", locked: false },
  { n: 6, title: "Adverbs", arTitle: "اشتقاق الظروف", subtitle: "-ment / -emment / -amment", locked: false },
];

export const englishGrammarChapters = Array.from({ length: 8 }, (_, i) => ({
  n: i + 1,
  title: `Unit ${i + 1}`,
  arTitle: `الوحدة ${i + 1}`,
  subtitle: "",
  locked: i > 2,
}));
export const englishLiteratureChapters = [
  { n: 1, title: "Coming Soon", arTitle: "قريباً", subtitle: "", locked: true },
];
export const englishParagraphsChapters = [
  { n: 1, title: "Paragraphs", arTitle: "الفقرات", subtitle: "Reading comprehension flashcards", locked: false },
];

/** Shared with the flashcard picker: never use ministerial-bank chapter numbers here. */
export function getFlashcardChapters(subject: string, section: FlashcardSection = "grammar"): ChapterMeta[] {
  switch (subject) {
    case "physics": return physicsChapters;
    case "chemistry": return chemistryChapters;
    case "biology": return biologyChapters;
    case "arabic": return arabicChapters;
    case "islamic": return islamicChapters;
    case "french": return frenchChapters;
    case "english": return section === "literature" ? englishLiteratureChapters : section === "paragraphs" ? englishParagraphsChapters : englishGrammarChapters;
    default: return [];
  }
}
