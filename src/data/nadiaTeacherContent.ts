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
  /** Optional source deck topic used when this topic has no saved MCQ set yet. */
  sourceTopicKey?: string;
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
  2: [
    { lecture: 1, ar: "مقدمة الأنسجة", en: "Introduction to Tissues" },
    { lecture: 2, ar: "النسيج المرستيمي", en: "Meristematic Tissue" },
    { lecture: 3, ar: "النسيج الأساس والبرنكيمي والكولنكيمي", en: "Ground, Parenchyma, and Collenchyma Tissues" },
    { lecture: 4, ar: "النسيج السكلرنكيمي", en: "Sclerenchyma Tissue" },
    { lecture: 5, ar: "نسيج البشرة", en: "Epidermal Tissue" },
    { lecture: 6, ar: "النسيج الوعائي ونسيج الخشب", en: "Vascular Tissue and Xylem" },
    { lecture: 7, ar: "نسيج اللحاء", en: "Phloem Tissue" },
    { lecture: 8, ar: "الأنسجة الحيوانية والنسيج الظهاري", en: "Animal and Epithelial Tissues" },
    { lecture: 9, ar: "النسيج الظهاري الحرشفي البسيط", en: "Simple Squamous Epithelium" },
    { lecture: 10, ar: "النسيج الظهاري المكعبي البسيط", en: "Simple Cuboidal Epithelium" },
    { lecture: 11, ar: "النسيج الظهاري العمودي البسيط", en: "Simple Columnar Epithelium" },
    { lecture: 12, ar: "النسيج الظهاري العمودي المطبق الكاذب", en: "Pseudostratified Columnar Epithelium" },
    { lecture: 13, ar: "النسيج الظهاري المطبق", en: "Stratified Epithelium" },
    { lecture: 14, ar: "النسيج الظهاري المطبق المكعبي", en: "Stratified Cuboidal Epithelium" },
    { lecture: 15, ar: "النسيج الظهاري المطبق العمودي", en: "Stratified Columnar Epithelium" },
    { lecture: 16, ar: "النسيج الظهاري المتحول", en: "Transitional Epithelium" },
    { lecture: 17, ar: "النسيج الضام وخلاياه", en: "Connective Tissue and Its Cells" },
    { lecture: 18, ar: "خلايا النسيج الضام الأخرى", en: "Other Connective Tissue Cells" },
    { lecture: 19, ar: "ألياف النسيج الضام", en: "Connective Tissue Fibers" },
    { lecture: 20, ar: "المادة بين الخلوية وتصنيف الأنسجة الضامة", en: "Intercellular Matrix and Connective Tissue Classification" },
    { lecture: 21, ar: "النسيج الضام الشبكي والمخاطاني", en: "Reticular and Mucous Connective Tissues" },
    { lecture: 22, ar: "النسيج الضام الأصيل الكثيف", en: "Dense Connective Tissue Proper" },
    { lecture: 23, ar: "النسيج الغضروفي وأنواعه", en: "Cartilage and Its Types" },
    { lecture: 24, ar: "النسيج العظمي", en: "Bone Tissue" },
  ],
  3: [
    { lecture: 1, ar: "مقدمة في التكاثر", en: "Introduction to Reproduction" },
    { lecture: 2, ar: "تكوين النطف", en: "Spermatogenesis" },
    { lecture: 3, ar: "تكوين البيوض", en: "Oogenesis" },
    { lecture: 4, ar: "التكاثر في الفيروسات", en: "Viral Reproduction" },
    { lecture: 5, ar: "التكاثر اللاجنسي في البكتيريا", en: "Asexual Reproduction in Bacteria" },
    { lecture: 6, ar: "التكاثر الجنسي في البكتيريا", en: "Sexual Reproduction in Bacteria" },
    { lecture: 7, ar: "التكاثر في الكلاميدوموناس", en: "Reproduction in Chlamydomonas" },
    { lecture: 8, ar: "التكاثر اللاجنسي في الباراميسيوم", en: "Asexual Reproduction in Paramecium" },
    { lecture: 9, ar: "التكاثر الجنسي في الباراميسيوم", en: "Sexual Reproduction in Paramecium" },
    { lecture: 10, ar: "التكاثر في اليوغلينا والفطريات", en: "Reproduction in Euglena and Fungi" },
    { lecture: 12, ar: "التكاثر في الحزازيات", en: "Reproduction in Mosses" },
    { lecture: 13, ar: "التكاثر في السرخسيات", en: "Reproduction in Ferns" },
    { lecture: 14, ar: "تركيب الزهرة", en: "Flower Structure" },
    { lecture: 15, ar: "تصنيف الأزهار وأحاديات وثنائيات الفلقة", en: "Flower Classification, Monocots, and Dicots" },
    { lecture: 16, ar: "المتك وتكوين حبوب اللقاح", en: "Anther and Pollen Grain Formation" },
    { lecture: 17, ar: "المبيض وتكوين البويضات", en: "Ovule and Embryo Sac Formation" },
    { lecture: 18, ar: "التلقيح", en: "Pollination" },
    { lecture: 19, ar: "تكوين أنبوب اللقاح", en: "Pollen Tube Formation" },
    { lecture: 20, ar: "الإخصاب وتكوين الجنين", en: "Fertilization and Embryo Formation" },
    { lecture: 21, ar: "تكوين البذرة", en: "Seed Formation" },
    { lecture: 22, ar: "تكوين الثمرة والإثمار العذري", en: "Fruit Formation and Parthenocarpy" },
    { lecture: 23, ar: "تركيب الثمرة وأنواعها وانتشار البذور", en: "Fruit Types and Seed Dispersal" },
    { lecture: 24, ar: "الجهاز التناسلي في الحشرات", en: "Reproductive Systems in Insects" },
    { lecture: 25, ar: "الإخصاب والتحول في الحشرات", en: "Fertilization and Metamorphosis in Insects" },
    { lecture: 26, ar: "الجهاز التناسلي في الضفدع", en: "Reproductive System of the Frog" },
    { lecture: 27, ar: "التزاوج والإخصاب والتحول في الضفدع", en: "Mating, Fertilization, and Metamorphosis in Frogs" },
    { lecture: 28, ar: "الجهاز التناسلي الذكري في الإنسان", en: "Human Male Reproductive System" },
    { lecture: 29, ar: "تركيب النطفة وانتقالها في الإنسان", en: "Human Sperm Structure and Transport" },
    { lecture: 30, ar: "الإخصاب والانغراس والحمل في الإنسان", en: "Human Fertilization, Implantation, and Pregnancy" },
    { lecture: 31, ar: "الإخصاب والحمل في الإنسان", en: "Fertilization and Pregnancy in Humans" },
    { lecture: 32, ar: "الدورة الحيضية والتغيرات المبيضية", en: "Menstrual and Ovarian Cycle" },
    { lecture: 33, ar: "الدورة الرحمية", en: "Uterine Cycle" },
    { lecture: 34, ar: "التكاثر العذري والخنثي", en: "Parthenogenesis and Hermaphroditism" },
  ],
  4: [
    { lecture: 1, ar: "التكوين الجنيني وعلم الأجنة", en: "Embryonic Development and Embryology" },
    { lecture: 2, ar: "مراحل التكوين الجنيني المبكرة", en: "Early Embryonic Development" },
    { lecture: 3, ar: "تاريخ علم الأجنة ونظرياته", en: "History and Theories of Embryology" },
    { lecture: 4, ar: "التمايز الخلوي والتشكل والحث الجنيني", en: "Cell Differentiation, Morphogenesis, and Embryonic Induction" },
    { lecture: 7, ar: "أنواع التوائم", en: "Types of Twins" },
    { lecture: 8, ar: "التشوهات الخلقية والخلايا الجذعية", en: "Congenital Abnormalities and Stem Cells" },
    { lecture: 9, ar: "الاستنساخ الحيواني وتقنيات الإخصاب المساعد", en: "Animal Cloning and Assisted Fertilization" },
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

const NADIA_ENGLISH_TOPIC_NAVIGATION: Partial<Record<NadiaChapterNumber, NadiaNavigationItem[]>> = {
  1: [
    { lecture: 1, ar: "مقدمة في الخلية والنظرية الخلوية", en: "Introduction to Cells and Cell Theory" },
    { lecture: 2, ar: "حجم الخلية والخلايا بدائية النواة", en: "Cell Size and Prokaryotic Cells" },
    { lecture: 3, ar: "الخلايا بدائية النواة", en: "Prokaryotic Cells" },
    { lecture: 4, ar: "تركيب الخلية البكتيرية", en: "Bacterial Cell Structure" },
    { lecture: 5, ar: "الخلايا حقيقية النواة", en: "Eukaryotic Cells" },
    { lecture: 6, ar: "السايتوبلازم والشبكة البلازمية الداخلية", en: "Cytoplasm and Endoplasmic Reticulum" },
    { lecture: 7, ar: "جهاز كولجي", en: "Golgi Apparatus" },
    { lecture: 8, ar: "المايتوكوندريا", en: "Mitochondria" },
    { lecture: 9, ar: "البلاستيدات", en: "Plastids" },
    { lecture: 10, ar: "الجسيمات الحالة", en: "Lysosomes" },
    { lecture: 11, ar: "هيكل الخلية", en: "Cytoskeleton" },
    { lecture: 12, ar: "الجسيم المركزي والجسيم الحركي", en: "Centrosome and Kinetosome" },
    { lecture: 13, ar: "الفجوات", en: "Vacuoles" },
    { lecture: 14, ar: "النواة وأهميتها وتركيبها", en: "Nucleus: Importance and Structure" },
    { lecture: 15, ar: "الشبكة الكروماتينية وأعداد الكروموسومات", en: "Chromatin and Chromosome Numbers" },
    { lecture: 16, ar: "الأنشطة الخلوية والانتشار", en: "Cellular Activities and Diffusion" },
    { lecture: 17, ar: "النفوذية وأنواع الأغشية", en: "Permeability and Membrane Types" },
    { lecture: 18, ar: "التناضح وتأثير تراكيز المحاليل", en: "Osmosis and Osmotic Solutions" },
    { lecture: 19, ar: "النقل الفعال", en: "Active Transport" },
    { lecture: 20, ar: "البلعمة", en: "Phagocytosis" },
    { lecture: 21, ar: "الشرب الخلوي والإخراج الخلوي", en: "Pinocytosis and Exocytosis" },
    { lecture: 22, ar: "الأيض الخلوي والتحلل السكري", en: "Cell Metabolism and Glycolysis" },
    { lecture: 23, ar: "التنفس الهوائي ودورة كريبس", en: "Aerobic Respiration and the Krebs Cycle" },
    { lecture: 24, ar: "تثبيت ثنائي أكسيد الكربون والبناء الضوئي", en: "Carbon Dioxide Fixation and Photosynthesis" },
    { lecture: 25, ar: "انقسام الخلايا والطور البيني", en: "Cell Division and Interphase" },
    { lecture: 26, ar: "الانقسام الخيطي والانقسام السايتوبلازمي", en: "Mitosis and Cytokinesis" },
    { lecture: 27, ar: "الانقسام الاختزالي", en: "Meiosis" },
  ],
  2: [
    { lecture: 1, ar: "النسيج الإنشائي", en: "Meristematic Tissue", sourceTopicKey: "meristematic" },
    { lecture: 2, ar: "النسيج الأساس", en: "Ground Tissue", sourceTopicKey: "ground" },
    { lecture: 3, ar: "نسيج البشرة", en: "Epidermal Tissue", sourceTopicKey: "epidermal" },
    { lecture: 4, ar: "النسيج الوعائي", en: "Vascular Tissue", sourceTopicKey: "vascular" },
    { lecture: 5, ar: "النسيج الطلائي", en: "Epithelial Tissue", sourceTopicKey: "epithelial" },
    { lecture: 6, ar: "خلايا النسيج الضام", en: "Connective Tissue Cells", sourceTopicKey: "connective-cells" },
    { lecture: 7, ar: "النسيج الضام الأصيل", en: "Connective Tissue Proper", sourceTopicKey: "connective-proper" },
    { lecture: 8, ar: "الغضروف", en: "Cartilage", sourceTopicKey: "cartilage" },
    { lecture: 9, ar: "العظم", en: "Bone", sourceTopicKey: "bone" },
    { lecture: 10, ar: "الدم", en: "Blood", sourceTopicKey: "blood" },
    { lecture: 11, ar: "النسيج العضلي", en: "Muscular Tissue", sourceTopicKey: "muscular" },
  ],
  3: [
    { lecture: 1, ar: "مقدمة في التكاثر", en: "Introduction to Reproduction" },
    { lecture: 2, ar: "تكوين النطف", en: "Spermatogenesis" },
    { lecture: 3, ar: "تكوين البيوض", en: "Oogenesis" },
    { lecture: 4, ar: "التكاثر في الفيروسات", en: "Viral Reproduction" },
    { lecture: 5, ar: "التكاثر اللاجنسي في البكتيريا", en: "Asexual Reproduction in Bacteria" },
    { lecture: 7, ar: "الاقتران البكتيري", en: "Bacterial Conjugation" },
    { lecture: 8, ar: "التكاثر في الكلاميدوموناس", en: "Reproduction in Chlamydomonas" },
    { lecture: 6, ar: "التكاثر اللاجنسي في الباراميسيوم", en: "Asexual Reproduction in Paramecium", sourceTopicKey: "paramecium-asexual" },
    { lecture: 9, ar: "التكاثر الجنسي في الباراميسيوم", en: "Sexual Reproduction in Paramecium" },
    { lecture: 10, ar: "التكاثر في اليوغلينا والفطريات", en: "Reproduction in Euglena and Fungi" },
    { lecture: 11, ar: "أصل النباتات وتعاقب الأجيال", en: "Origin of Land Plants and Alternation of Generations" },
    { lecture: 12, ar: "التكاثر في الحزازيات", en: "Reproduction in Polytrichum (Mosses)" },
    { lecture: 13, ar: "التكاثر في السرخسيات", en: "Reproduction in Polypodium (Ferns)" },
    { lecture: 14, ar: "تركيب الزهرة", en: "Flower Structure" },
    { lecture: 15, ar: "تصنيف الأزهار وأحاديات وثنائيات الفلقة", en: "Flower Classification, Monocots, and Dicots" },
    { lecture: 16, ar: "المتك وتكوين حبوب اللقاح", en: "Anther and Pollen Grain Formation" },
    { lecture: 17, ar: "البويضة وتكوين كيس الجنين", en: "Ovule and Embryo Sac Formation" },
    { lecture: 18, ar: "التلقيح", en: "Pollination" },
    { lecture: 19, ar: "تكوين أنبوب اللقاح", en: "Pollen Tube Formation" },
    { lecture: 20, ar: "الإخصاب المزدوج وتكوين الجنين", en: "Double Fertilization and Embryo Formation" },
    { lecture: 21, ar: "تكوين البذرة", en: "Seed Formation" },
    { lecture: 22, ar: "تكوين الثمرة والإثمار العذري", en: "Fruit Formation and Parthenocarpy" },
    { lecture: 23, ar: "تصنيف الثمار وانتشار البذور", en: "Fruit Classification and Seed Dispersal" },
    { lecture: 24, ar: "الأجهزة التناسلية في الحشرات", en: "Reproductive Systems in Insects" },
    { lecture: 25, ar: "الإخصاب والتحول في الحشرات", en: "Fertilization and Metamorphosis in Insects" },
    { lecture: 26, ar: "الجهاز التناسلي في الضفدع", en: "Reproductive System of the Frog" },
    { lecture: 27, ar: "التزاوج والإخصاب والتحول في الضفدع", en: "Mating, Fertilization, and Metamorphosis in Frogs" },
    { lecture: 28, ar: "الجهاز التناسلي الذكري في الإنسان", en: "Human Male Reproductive System" },
    { lecture: 29, ar: "تركيب النطفة وانتقالها في الإنسان", en: "Human Sperm Structure and Transport" },
    { lecture: 30, ar: "الإخصاب والانغراس والحمل في الإنسان", en: "Human Fertilization, Implantation, and Pregnancy" },
    { lecture: 31, ar: "الدورة الحيضية والمبيضية", en: "Menstrual and Ovarian Cycle" },
    { lecture: 32, ar: "الدورة الرحمية", en: "Uterine Cycle" },
    { lecture: 33, ar: "التكاثر العذري والخنثي", en: "Parthenogenesis and Hermaphroditism" },
  ],
  4: [
    { lecture: 1, ar: "التكوين الجنيني وعلم الأجنة", en: "Embryonic Development and Embryology" },
    { lecture: 2, ar: "التفلج ومراحل التكوين الجنيني المبكرة", en: "Cleavage and Early Embryonic Development" },
    { lecture: 3, ar: "تاريخ علم الأجنة ونظرياته", en: "History and Theories of Embryology" },
    { lecture: 10, ar: "علم الأجنة التجريبي والجزيئي", en: "Experimental and Molecular Embryology", sourceTopicKey: "experimental-molecular" },
    { lecture: 4, ar: "التمايز الخلوي والتشكل والحث الجنيني", en: "Cell Differentiation, Morphogenesis, and Embryonic Induction" },
    { lecture: 5, ar: "التشوهات الخلقية", en: "Congenital Anomalies" },
    { lecture: 6, ar: "التوائم والولادات المتعددة", en: "Twins and Multiple Births" },
    { lecture: 8, ar: "المباعدة بين الولادات", en: "Birth Spacing", sourceTopicKey: "birth-spacing" },
    { lecture: 7, ar: "الخلايا الجذعية", en: "Stem Cells" },
    { lecture: 11, ar: "تقنية النانو والاستنساخ الحيواني", en: "Nanotechnology and Animal Cloning", sourceTopicKey: "nanotechnology-cloning" },
    { lecture: 9, ar: "العقم وتقنيات الإخصاب المساعد", en: "Infertility and Assisted Reproductive Technologies" },
    { lecture: 12, ar: "تقنيات التجميد", en: "Freezing Techniques", sourceTopicKey: "freezing" },
  ],
  5: [
    { lecture: 1, ar: "علم الوراثة وغريغور مندل", en: "Genetics and Gregor Mendel", sourceTopicKey: "foundations-history" },
    { lecture: 2, ar: "نبات البازلاء وأسباب نجاح تجارب مندل", en: "Pea Plants and Mendel's Success", sourceTopicKey: "mendelian-genetics" },
    { lecture: 3, ar: "التهجين الأحادي والسيادة التامة", en: "Monohybrid Cross and Complete Dominance", sourceTopicKey: "mendelian-genetics" },
    { lecture: 4, ar: "التضريب الاختباري والتضريب الرجعي", en: "Testcross and Backcross", sourceTopicKey: "mendelian-genetics" },
    { lecture: 5, ar: "التهجين الثنائي وقانون التوزيع المستقل", en: "Dihybrid Cross and Independent Assortment", sourceTopicKey: "mendelian-genetics" },
    { lecture: 6, ar: "الاحتمالية في علم الوراثة", en: "Probability in Genetics", sourceTopicKey: "problems" },
    { lecture: 7, ar: "السيادة غير التامة", en: "Incomplete Dominance", sourceTopicKey: "dominance" },
    { lecture: 8, ar: "السيادة المشاركة أو المواكبة", en: "Codominance", sourceTopicKey: "dominance" },
    { lecture: 9, ar: "الأليلات المميتة", en: "Lethal Alleles", sourceTopicKey: "lethal-alleles" },
    { lecture: 10, ar: "النفاذ الجيني والتعبيرية", en: "Penetrance and Expressivity", sourceTopicKey: "ministerial-review" },
    { lecture: 11, ar: "تداخل الفعل الجيني والتفوق", en: "Gene Interaction and Epistasis", sourceTopicKey: "ministerial-review" },
    { lecture: 12, ar: "الأليلات المتعددة ونظام فصائل الدم ABO", en: "Multiple Alleles and the ABO System", sourceTopicKey: "abo" },
    { lecture: 13, ar: "العامل الريسي وعدم توافق Rh", en: "Rh Factor and Incompatibility", sourceTopicKey: "rh" },
    { lecture: 14, ar: "الأليلات المتعددة ولون الفراء في الأرانب", en: "Multiple Alleles and Rabbit Coat Color", sourceTopicKey: "linkage-rabbits" },
    { lecture: 15, ar: "الطفرات وأنواعها", en: "Mutations and Their Types", sourceTopicKey: "ministerial-review" },
    { lecture: 16, ar: "الوراثة البشرية والصفات المرتبطة بالجنس", en: "Human Genetics and Sex-Linked Traits", sourceTopicKey: "ministerial-review" },
    { lecture: 17, ar: "تركيب جزيء DNA والحلزون المزدوج", en: "DNA Structure and the Double Helix", sourceTopicKey: "dna-structure" },
    { lecture: 18, ar: "تركيب RNA وأنواعه ووظائفه", en: "RNA Structure, Types, and Functions", sourceTopicKey: "rna" },
    { lecture: 19, ar: "الشفرة الوراثية وعملية النسخ", en: "Genetic Code and Transcription", sourceTopicKey: "rna" },
    { lecture: 20, ar: "الترجمة وبناء البروتين", en: "Translation and Protein Synthesis", sourceTopicKey: "rna" },
    { lecture: 21, ar: "الهندسة الوراثية وتطبيقاتها", en: "Genetic Engineering and Its Applications", sourceTopicKey: "ministerial-review" },
  ],
};

export const getNadiaLectureCount = (curriculum: NadiaCurriculum, chapter: NadiaChapterNumber) => {
  if (curriculum === "ar" && chapter === 3) return 34;
  return NADIA_CHAPTERS.find((item) => item.number === chapter)?.lectureCount ?? NADIA_ARABIC_LECTURE_COUNT;
};

export const usesNadiaTopicNavigation = (curriculum: NadiaCurriculum, chapter: NadiaChapterNumber) =>
  Boolean((curriculum === "ar" ? NADIA_ARABIC_TOPIC_NAVIGATION : NADIA_ENGLISH_TOPIC_NAVIGATION)[chapter]);

export const getNadiaNavigationItems = (
  curriculum: NadiaCurriculum,
  chapter: NadiaChapterNumber,
): NadiaNavigationItem[] => {
  const topicNavigation = curriculum === "ar"
    ? NADIA_ARABIC_TOPIC_NAVIGATION[chapter]
    : NADIA_ENGLISH_TOPIC_NAVIGATION[chapter];

  if (topicNavigation) {
    return topicNavigation;
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

