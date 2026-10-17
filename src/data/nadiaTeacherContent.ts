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

export type NadiaNavigationItem = {
  lecture: number;
  ar: string;
  en: string;
};

const NADIA_ARABIC_TOPIC_NAVIGATION: Partial<Record<NadiaChapterNumber, NadiaNavigationItem[]>> = {
  1: [
    { lecture: 1, ar: "الخلية والنظرية الخلوية", en: "Cells and Cell Theory" },
    { lecture: 2, ar: "الخلايا بدائية النواة", en: "Prokaryotic Cells" },
    { lecture: 3, ar: "تركيب الخلية البكتيرية", en: "Bacterial Cell Structure" },
    { lecture: 4, ar: "الخلايا حقيقية النواة", en: "Eukaryotic Cells" },
    { lecture: 6, ar: "السايتوبلازم والشبكة البلازمية الداخلية", en: "Cytoplasm and Endoplasmic Reticulum" },
    { lecture: 7, ar: "جهاز كولجي", en: "Golgi Apparatus" },
    { lecture: 8, ar: "المايتوكوندريا", en: "Mitochondria" },
    { lecture: 9, ar: "البلاستيدات", en: "Plastids" },
    { lecture: 10, ar: "الجسيمات الحالة", en: "Lysosomes" },
    { lecture: 11, ar: "هيكل الخلية", en: "Cytoskeleton" },
    { lecture: 12, ar: "الجسيم المركزي والجسيم الحركي", en: "Centrosome and Kinetosome" },
    { lecture: 13, ar: "الفجوات", en: "Vacuoles" },
    { lecture: 14, ar: "النواة ومكوناتها", en: "The Nucleus and Its Components" },
    { lecture: 15, ar: "الشبكة الكروماتينية والكروموسومات", en: "Chromatin and Chromosomes" },
    { lecture: 16, ar: "الأنشطة الخلوية والانتشار", en: "Cellular Activities and Diffusion" },
    { lecture: 17, ar: "النفوذية وأنواع الأغشية", en: "Permeability and Membrane Types" },
    { lecture: 18, ar: "التناضح وتأثير تراكيز المحاليل", en: "Osmosis and Solution Concentrations" },
    { lecture: 20, ar: "النقل الفعال", en: "Active Transport" },
    { lecture: 21, ar: "البلعمة (الأكل الخلوي)", en: "Phagocytosis" },
    { lecture: 22, ar: "الشرب الخلوي والإخراج الخلوي", en: "Pinocytosis and Exocytosis" },
    { lecture: 23, ar: "الأيض الخلوي والتحلل السكري", en: "Cell Metabolism and Glycolysis" },
    { lecture: 24, ar: "التنفس الهوائي ودورة كريبس", en: "Aerobic Respiration and the Krebs Cycle" },
    { lecture: 25, ar: "تثبيت ثنائي أكسيد الكربون والبناء الضوئي", en: "Carbon Dioxide Fixation and Photosynthesis" },
    { lecture: 27, ar: "انقسام الخلايا والطور البيني", en: "Cell Division and Interphase" },
    { lecture: 28, ar: "الانقسام الخيطي والانقسام السايتوبلازمي", en: "Mitosis and Cytokinesis" },
    { lecture: 29, ar: "الانقسام الاختزالي والطور التمهيدي الأول", en: "Meiosis and Prophase I" },
  ],
  5: [
    { lecture: 1, ar: "علم الوراثة وغريغور مندل", en: "Genetics and Gregor Mendel" },
    { lecture: 2, ar: "نبات البازلاء وأسباب نجاح تجارب مندل", en: "Pea Plants and Mendel's Success" },
    { lecture: 3, ar: "التهجين الأحادي والسيادة التامة", en: "Monohybrid Cross and Complete Dominance" },
    { lecture: 4, ar: "التضريب الاختباري والتضريب الرجعي", en: "Testcross and Backcross" },
    { lecture: 5, ar: "التهجين الثنائي وقانون التوزيع المستقل", en: "Dihybrid Cross and Independent Assortment" },
    { lecture: 6, ar: "الاحتمالية في علم الوراثة", en: "Probability in Genetics" },
    { lecture: 7, ar: "السيادة غير التامة", en: "Incomplete Dominance" },
    { lecture: 8, ar: "السيادة المشاركة أو المواكبة", en: "Codominance" },
    { lecture: 9, ar: "الأليلات المميتة", en: "Lethal Alleles" },
    { lecture: 10, ar: "النفاذ الجيني والتعبيرية", en: "Penetrance and Expressivity" },
    { lecture: 11, ar: "تداخل الفعل الجيني والتفوق", en: "Gene Interaction and Epistasis" },
    { lecture: 12, ar: "الأليلات المتعددة ونظام فصائل الدم ABO", en: "Multiple Alleles and the ABO System" },
    { lecture: 13, ar: "العامل الريسي وعدم توافق Rh", en: "Rh Factor and Incompatibility" },
    { lecture: 14, ar: "الأليلات المتعددة ولون الفراء في الأرانب", en: "Multiple Alleles and Rabbit Coat Color" },
    { lecture: 15, ar: "الطفرات وأنواعها", en: "Mutations and Their Types" },
    { lecture: 16, ar: "الوراثة البشرية والصفات المرتبطة بالجنس", en: "Human Genetics and Sex-Linked Traits" },
    { lecture: 17, ar: "تركيب جزيء DNA والحلزون المزدوج", en: "DNA Structure and the Double Helix" },
    { lecture: 18, ar: "تركيب RNA وأنواعه ووظائفه", en: "RNA Structure, Types, and Functions" },
    { lecture: 19, ar: "الشفرة الوراثية وعملية النسخ", en: "Genetic Code and Transcription" },
    { lecture: 20, ar: "الترجمة وبناء البروتين", en: "Translation and Protein Synthesis" },
    { lecture: 21, ar: "الهندسة الوراثية وتطبيقاتها", en: "Genetic Engineering and Its Applications" },
  ],
};

export const getNadiaLectureCount = (curriculum: NadiaCurriculum, chapter: NadiaChapterNumber) => {
  if (curriculum === "ar" && chapter === 3) return 34;
  return NADIA_CHAPTERS.find((item) => item.number === chapter)?.lectureCount ?? NADIA_ARABIC_LECTURE_COUNT;
};

export const usesNadiaTopicNavigation = (curriculum: NadiaCurriculum, chapter: NadiaChapterNumber) =>
  curriculum === "ar" && (chapter === 1 || chapter === 5);

export const getNadiaNavigationItems = (
  curriculum: NadiaCurriculum,
  chapter: NadiaChapterNumber,
): NadiaNavigationItem[] => {
  if (curriculum === "ar" && NADIA_ARABIC_TOPIC_NAVIGATION[chapter]) {
    return NADIA_ARABIC_TOPIC_NAVIGATION[chapter]!;
  }

  return Array.from({ length: getNadiaLectureCount(curriculum, chapter) }, (_, index) => ({
    lecture: index + 1,
    ar: `المحاضرة ${index + 1}`,
    en: `Lecture ${index + 1}`,
  }));
};

export const getNadiaTopicTitle = (
  curriculum: NadiaCurriculum,
  chapter: NadiaChapterNumber,
  lecture: number,
  language: "ar" | "en",
) => getNadiaNavigationItems(curriculum, chapter).find((item) => item.lecture === lecture)?.[language];

export const getNadiaCurriculumLabel = (curriculum: NadiaCurriculum, language: "ar" | "en") =>
  NADIA_CURRICULA.find((item) => item.id === curriculum)![language];

/** Keep the existing Arabic keys intact; English content has its own namespace. */
export const getNadiaLectureTopicKey = (
  curriculum: NadiaCurriculum,
  chapter: NadiaChapterNumber,
  lecture: number,
  mode: "study" | "exam",
) => `nadia-${curriculum}-ch${chapter}-lec${lecture}-${mode}`;

