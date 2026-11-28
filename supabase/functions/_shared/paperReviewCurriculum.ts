import { physicsChapters } from "./physicsChapters.ts";

export type PaperChapter = { key: string; ar: string; en: string };
const chapter = (key: string, ar: string, en: string): PaperChapter => ({ key, ar, en });

export const PAPER_REVIEW_SUBJECTS = [
  {
    id: "physics", ar: "الفيزياء", en: "Physics",
    chapters: physicsChapters.map(({ n, arTitle, title }) => chapter(String(n), arTitle, title)),
  },
  {
    id: "chemistry", ar: "الكيمياء", en: "Chemistry",
    chapters: [
      chapter("1", "الديناميكا الحرارية", "Thermodynamics"),
      chapter("2", "الاتزان الكيميائي", "Chemical equilibrium"),
      chapter("3", "الاتزان الأيوني", "Ionic equilibrium"),
      chapter("4", "الكيمياء الكهربائية", "Electrochemistry"),
      chapter("5", "الكيمياء التناسقية", "Coordination chemistry"),
      chapter("6", "التحليل الكيميائي", "Chemical analysis"),
      chapter("7", "الكيمياء العضوية", "Organic chemistry"),
      chapter("8", "الكيمياء الحياتية", "Biochemistry"),
    ],
  },
  {
    id: "biology", ar: "الأحياء", en: "Biology",
    chapters: [
      chapter("1", "الخلية", "The cell"),
      chapter("2", "الأنسجة", "Tissues"),
      chapter("3", "التكاثر", "Reproduction"),
      chapter("4", "النمو والتطور الجنيني", "Growth and embryonic development"),
      chapter("5", "الوراثة", "Genetics"),
      chapter("drawings", "رسومات الأحياء", "Biology drawings"),
    ],
  },
  {
    id: "english", ar: "الإنكليزية", en: "English",
    chapters: [
      ...Array.from({ length: 8 }, (_, i) => chapter(String(i + 1), `الوحدة ${i + 1}`, `Unit ${i + 1}`)),
      chapter("literature", "الأدب", "Literature"),
      chapter("reading", "القطع والاستيعاب", "Reading comprehension"),
    ],
  },
  {
    id: "french", ar: "الفرنسية", en: "French",
    chapters: [
      chapter("negation", "النفي", "Negation"),
      chapter("interrogation", "الاستفهام", "Interrogation"),
      chapter("relative-pronouns", "ضمائر الوصل", "Relative pronouns"),
      chapter("feminization", "التأنيث", "Feminization"),
      chapter("plural", "الجمع", "Plural"),
      chapter("adverbs", "اشتقاق الظروف", "Adverb formation"),
      chapter("reading", "القطع الاستيعابية", "Reading comprehension"),
      chapter("tenses", "الأزمنة", "Tenses"),
      chapter("dialogues", "الحوارات والمفردات", "Dialogues and vocabulary"),
    ],
  },
  {
    id: "arabic", ar: "العربية", en: "Arabic",
    chapters: [
      chapter("ar-istifham", "الاستفهام", "Interrogation"),
      chapter("ar-nafy", "النفي", "Negation"),
      chapter("ar-taqdim", "التقديم والتأخير", "Fronting and postposing"),
      chapter("ar-tawkid", "التوكيد", "Emphasis"),
      chapter("ar-nida", "النداء", "Vocative"),
      chapter("ar-taajub", "التعجب", "Exclamation"),
      chapter("ar-madh", "المدح والذم", "Praise and blame"),
      chapter("ar-tamanni", "التمني والترجي", "Wish and hope"),
      chapter("ar-ardh", "العرض والتحضيض", "Offer and urging"),
      chapter("ar-tahdir", "التحذير والإغراء", "Warning and enticement"),
      chapter("ar-adab", "الأدب الحديث", "Modern literature"),
      chapter("ar-nusos", "النصوص الواجب حفظها", "Texts to memorize"),
    ],
  },
  {
    id: "islamic", ar: "التربية الإسلامية", en: "Islamic education",
    chapters: [
      chapter("1", "الوحدة الأولى", "Unit 1"),
      chapter("2", "الوحدة الثانية", "Unit 2"),
      chapter("3", "الوحدة الثالثة", "Unit 3"),
      chapter("4", "الوحدة الرابعة", "Unit 4"),
      chapter("5", "الوحدة الخامسة", "Unit 5"),
      chapter("recitation", "أحكام التلاوة", "Rules of recitation"),
    ],
  },
  {
    id: "math", ar: "الرياضيات", en: "Mathematics",
    chapters: [
      chapter("1", "الأعداد المركبة", "Complex numbers"),
      chapter("2", "القطوع المخروطية", "Conic sections"),
      chapter("3", "تطبيقات التفاضل", "Applications of differentiation"),
      chapter("4", "التكامل", "Integration"),
      chapter("5", "المعادلات التفاضلية الاعتيادية", "Ordinary differential equations"),
      chapter("6", "الهندسة الفضائية", "Space geometry"),
    ],
  },
] as const;

export type PaperSubject = typeof PAPER_REVIEW_SUBJECTS[number];
export type PaperSubjectId = PaperSubject["id"];
export const paperSubject = (value: unknown) => PAPER_REVIEW_SUBJECTS.find(subject => subject.id === value);

export function paperChapter(subject: PaperSubject | undefined, value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return undefined;
  return subject?.chapters.find(chapter => chapter.key === String(value));
}

export type PaperCurriculumTrack = "shared" | "arabic" | "distinguished";
export const paperCurriculumTrack = (value: unknown): value is PaperCurriculumTrack =>
  value === "shared" || value === "arabic" || value === "distinguished";
