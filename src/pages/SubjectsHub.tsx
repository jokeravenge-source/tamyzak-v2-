import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import FeatureIcon3D from "@/components/ui/FeatureIcon3D";
import MutamayizMascot from "@/components/MutamayizMascot";
import { trackFeature, trackFeatureUnlocked } from "@/lib/analytics";
import { ArrowLeft, ArrowRight, Atom, FlaskConical, Leaf, BookOpen, Languages as LangIcon, Moon, ScrollText, Microscope, PenLine, MousePointerClick, Layers, BookMarked, Lock, Bot, Calculator, Ruler, Zap, Boxes, GraduationCap, Wand2, SpellCheck2, FileQuestion, Images, ScanLine, RotateCcw, Headphones, Network, Youtube, Podcast, Video, FileText, NotebookPen, Palette, Sparkles } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import type { MainMenuChoice } from "@/pages/MainMenu";
import type { BankSubject } from "@/data/subjectChapters";
import { useSubscription } from "@/hooks/useSubscription";
import { useHiddenStudyTools } from "@/lib/studyToolVisibility";
import { isPremiumTool } from "@/lib/premium";
import { hasDueSubjectMistakes } from "@/lib/mistakes";
import { readStudySubjectFocus, rememberStudySubjectFocus, subscribeStudySubjectFocus } from "@/lib/studySubjectFocus";
import { scopedMcqSubject } from "@/lib/studySubjectTools";
import StudyStartIntake from "@/components/StudyStartIntake";

type Tool = {
  key: MainMenuChoice | "theoremVisualizer";
  en: string;
  ar: string;
  Icon: LucideIcon;
  free?: boolean;
  disabled?: boolean;
  descEn?: string;
  descAr?: string;
};

type ToolGroup = "subject" | "general";
export type StudyToolScope = { subject: BankSubject; startReview?: boolean };

const GROUP_COPY = {
  subject: { ar: "أدوات المادة", en: "Subject tools", arHint: "بس الأدوات والمصادر اللي تخص هالمادة.", enHint: "Study tools and resources for this subject." },
  general: { ar: "الأدوات العامة والذكاء الاصطناعي", en: "General and AI tools", arHint: "نفس الأدوات متاحة بكل المواد. نحدد مادتك تلقائيًا إذا الأداة تدعمها.", enHint: "Available from every subject, with your subject preselected where supported." },
} as const;

const FLASHCARDS: Tool = { key: "flashcards", en: "Flashcards", ar: "البطاقات", Icon: Layers };
const MALAZAM: Tool = { key: "malazam", en: "Malazam", ar: "الملازم", Icon: BookMarked };
const MISTAKES: Tool = { key: "mistakes", en: "My mistakes", ar: "أخطائي", Icon: RotateCcw };
const MCQ: Tool = { key: "mcqBank", en: "MCQ Bank", ar: "بنك أسئلة MCQ", Icon: FileQuestion,
  descEn: "Practise questions from this subject.", descAr: "حل أسئلة الاختيار من متعدد لهذه المادة." };
const LITERATURE_MCQ: Tool = { ...MCQ, en: "English Literature MCQ Bank", ar: "بنك أسئلة الأدب الإنكليزي" };
const MUTAMAYIZ: Tool = { key: "mutamayiz", en: "Ask Mutamayiz", ar: "اسأل متميّز", Icon: Bot };
const PAPER_REVIEW: Tool = { key: "paperReview", en: "Paper Review", ar: "ورقتك تحچي", Icon: ScanLine };
const EXAM: Tool = { key: "examGenerator", en: "Full Exam Generator", ar: "توليد امتحان كامل", Icon: GraduationCap };
const SCOPED_TOOLS = new Set<MainMenuChoice>([
  "flashcards", "ministerialBank", "mcqBank", "mistakes", "mutamayiz", "paperReview", "examGenerator", "mcq", "videoNotes", "podcastTutor",
]);
const GENERAL_TOOLS: Tool[] = [
  MUTAMAYIZ, PAPER_REVIEW,
  { key: "mcq", en: "MCQ Generator", ar: "مولّد الأسئلة", Icon: FileQuestion },
  EXAM,
  { key: "essay", en: "Answer Checker", ar: "مصحّح الإجابات", Icon: PenLine },
  { key: "podcastTutor", en: "Audio Tutor", ar: "المعلّم الصوتي", Icon: Podcast },
  { key: "videoNotes", en: "Video to Notes", ar: "الفيديو إلى ملاحظات", Icon: Headphones },
  { key: "mindmap", en: "Mind Map", ar: "الخريطة الذهنية", Icon: Network },
  { key: "textToVideo", en: "Text to Video", ar: "النص إلى فيديو", Icon: Video },
  { key: "physicsProblemSolver", en: "Physics Problem Solver", ar: "حل مسائل الفيزياء", Icon: Calculator },
  { key: "problemGenerator", en: "Physics Problem Generator", ar: "مولّد مسائل الفيزياء", Icon: Wand2 },
  { key: "notes", en: "My Notes", ar: "ملاحظاتي", Icon: NotebookPen },
  { key: "canvas", en: "My Notebook", ar: "دفتري", Icon: Palette },
  { key: "pdfBuilder", en: "Build Your PDF", ar: "صمّم ملزمتك", Icon: FileText },
  { key: "summaries", en: "Summaries", ar: "الملخصات", Icon: FileText },
  { key: "adminNotes", en: "Enrichments", ar: "الإثرائيات", Icon: BookOpen },
  { key: "youtube", en: "Video Player", ar: "مشغّل الفيديو", Icon: Youtube },
  { key: "report", en: "Daily Report", ar: "تقريري", Icon: Sparkles },
];

const SUBJECTS: { code: BankSubject; en: string; ar: string; Icon: LucideIcon; tools: Tool[] }[] = [
  {
    code: "physics", en: "Physics", ar: "الفيزياء", Icon: Atom,
    tools: [
      { key: "physicsActivities", en: "Activities", ar: "الأنشطة", Icon: Boxes },
      { key: "physicsQuickMcq", en: "Quick MCQ", ar: "اختبار سريع", Icon: Zap, disabled: true },
      { key: "physicsLaws", en: "Laws & Units", ar: "قوانين ووحدات", Icon: Ruler },
      { key: "physicsSchemes", en: "Schemes", ar: "مخططات", Icon: Images, free: true,
        descEn: "Illustrated, step-by-step Physics explanations for easier memorization.", descAr: "شرح مصوّر ومتسلسل لموضوعات الفيزياء لتسهيل الحفظ." },
      { key: "ministerialBank", en: "Ministerial Bank", ar: "بنك الوزاريات", Icon: ScrollText },
    ],
  },
  {
    code: "chemistry", en: "Chemistry", ar: "الكيمياء", Icon: FlaskConical,
    tools: [
      { key: "atomAtlas", en: "Atom Atlas", ar: "أطلس الذرة", Icon: Atom, free: true,
        descEn: "Explore all 118 elements, atoms, molecules, terms and lessons.", descAr: "استكشف العناصر الـ118 والذرات والجزيئات والمصطلحات والدروس." },
      { key: "chemistryExperiments", en: "Chemistry Experiment", ar: "تجربة الكيمياء", Icon: FlaskConical },
      { key: "ministerialBank", en: "Ministerial Bank", ar: "بنك الوزاريات", Icon: ScrollText },
      { key: "organicEquations", en: "Organic Equations", ar: "تفاعلات العضوية", Icon: FlaskConical },
      { key: "chemicalEquations", en: "Chemical Equation", ar: "المعادلات الكيميائية", Icon: FlaskConical,
        descEn: "19 equations by topic, with a memory hint for each.", descAr: "19 معادلة حسب الموضوع، مع تلميح لحفظ كل معادلة." },
    ],
  },
  {
    code: "biology", en: "Biology", ar: "الأحياء", Icon: Leaf,
    tools: [
      { key: "ministerialBank", en: "Ministerial Questions", ar: "الأسئلة الوزارية", Icon: ScrollText },
      { key: "biologySchemes", en: "Schemes", ar: "مخططات", Icon: Images, free: true,
        descEn: "Visual, step-by-step explanations of complete Biology texts.", descAr: "شرح بصري متسلسل للنصوص الكاملة خطوة بخطوة." },
      { key: "biologyDrawings", en: "Biology Drawings", ar: "رسومات الأحياء", Icon: Microscope },
      { key: "biologySketchpad", en: "Biology Sketchpad", ar: "الرسم الحر بالأحياء", Icon: PenLine,
        descEn: "Draw on blank paper or a biology outline, erase and submit.", descAr: "ورقة سكتش ومخططات ترسم عليها بإصبعك، تمسح وتسلّم." },
    ],
  },
  {
    code: "math", en: "Mathematics", ar: "الرياضيات", Icon: Calculator,
    tools: [
      { key: "theoremVisualizer", en: "3D Geometry Theorems", ar: "مبرهنات الهندسة المجسمة", Icon: Ruler, free: true,
        descEn: "Explore perpendicular-plane results in 3D.", descAr: "اكتشف نتائج تعامد المستويين بمجسمات تفاعلية." },
    ],
  },
  {
    code: "english", en: "English", ar: "الإنجليزية", Icon: BookOpen,
    tools: [
      { key: "englishEssays", en: "English Compositions", ar: "إنشاءات الإنكليزي", Icon: PenLine },
      { key: "englishIsqat", en: "Word Drops (Isqatat)", ar: "الإسقاطات", Icon: MousePointerClick },
      { key: "englishVerbForms", en: "Verb Forms", ar: "تصريف الأفعال", Icon: SpellCheck2 },
      { key: "englishReadingPractice", en: "Reading Practice", ar: "تدريب القطعة", Icon: FileQuestion },
    ],
  },
  {
    code: "french", en: "French", ar: "الفرنسية", Icon: LangIcon,
    tools: [
      { key: "frenchSynonyms", en: "Synonyms", ar: "المرادفات", Icon: MousePointerClick },
      { key: "frenchAntonyms", en: "Antonyms", ar: "المعاكسات", Icon: MousePointerClick },
      { key: "frenchConjugator", en: "French Conjugator", ar: "مصرّف الأفعال الفرنسية", Icon: SpellCheck2, free: true,
        descEn: "Type any French verb and explore all available moods and tenses.", descAr: "اكتب أي فعل فرنسي وشاهد تصريفاته في جميع الصيغ والأزمنة." },
    ],
  },
  {
    code: "arabic", en: "Arabic", ar: "العربية", Icon: BookOpen,
    tools: [
      { key: "ministerialBank", en: "Ministerial Bank", ar: "بنك الوزاريات", Icon: ScrollText },
      { key: "poemsChecker", en: "Poems Checker", ar: "قصائد الأدب", Icon: ScrollText },
    ],
  },
  {
    code: "islamic", en: "Islamic", ar: "التربية الإسلامية", Icon: Moon,
    tools: [
      { key: "islamicSurahs", en: "Islamic Surahs", ar: "سور إسلامية", Icon: Moon },
      { key: "hadithChecker", en: "Hadith Checker", ar: "فاحص الأحاديث", Icon: Moon },
    ],
  },
];

type SubjectPalette = { light: string; mid: string; deep: string };
const SUBJECT_PALETTES: Record<string, SubjectPalette> = {
  physics: { light: "#a5d8ff", mid: "#4298f5", deep: "#2653bd" },
  chemistry: { light: "#e4c6ff", mid: "#ad72ef", deep: "#7042bc" },
  biology: { light: "#a8edc7", mid: "#44ba86", deep: "#15724c" },
  math: { light: "#ffdc9b", mid: "#f6a33c", deep: "#b65b19" },
  english: { light: "#ffbcd1", mid: "#ed779c", deep: "#ac3869" },
  french: { light: "#b5caff", mid: "#758eed", deep: "#4147ac" },
  arabic: { light: "#b2efe8", mid: "#42b9ae", deep: "#177a80" },
  islamic: { light: "#e8e6a5", mid: "#b5b65b", deep: "#77752e" },
};
const subjectPalette = (code: BankSubject) => SUBJECT_PALETTES[code] ?? SUBJECT_PALETTES.physics;
const subjectSurface = (code: BankSubject): CSSProperties => {
  const { mid } = subjectPalette(code);
  return {
    backgroundImage: `radial-gradient(ellipse at 85% 0%, ${mid}36, transparent 67%), linear-gradient(150deg, ${mid}10, transparent 80%)`,
    boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.11), 0 7px 19px -13px ${mid}`,
  };
};

function SubjectArtwork({ subject, small = false }: { subject: (typeof SUBJECTS)[number]; small?: boolean }) {
  const { light, mid, deep } = subjectPalette(subject.code);
  const Icon = subject.Icon;
  return (
    <span aria-hidden="true" className={`pointer-events-none relative isolate grid shrink-0 place-items-center ${small ? "size-16" : "size-[4.75rem] sm:size-24"}`}>
      <span className="absolute inset-x-[12%] bottom-[5%] h-[16%] rounded-[50%] blur-[5px]" style={{ background: deep, opacity: .30 }} />
      <span className="relative grid size-[80%] place-items-center overflow-hidden rounded-[28%] motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-1"
        style={{
          transform: "perspective(240px) rotateX(13deg) rotateY(-12deg) rotateZ(-7deg)",
          background: `linear-gradient(140deg, ${light} 0%, ${mid} 45%, ${deep} 100%)`,
          boxShadow: `2px 5px 0 ${deep}, 4px 9px 12px ${deep}55, inset 1px 2px 2px #ffffff9e, inset -2px -3px 5px #00000022`,
        }}>
        <span className="absolute inset-x-1 top-0 h-1/2 rounded-[50%] bg-gradient-to-b from-white/40 to-transparent" />
        <span className="relative grid size-[66%] place-items-center text-white" style={{ filter: `drop-shadow(1px 2px 0 ${deep}) drop-shadow(2px 3px 2px ${deep}88)` }}>
          <Icon className="size-full" />
        </span>
      </span>
      <span className="absolute end-0 top-[5%] size-[15%] rounded-full" style={{ background: `radial-gradient(circle at 30% 25%, white, ${light} 45%, ${mid})`, boxShadow: `1px 2px 5px ${deep}55` }} />
    </span>
  );
}

// Stable tool colors, independent of the subject header or selected global theme.
const TOOL_TONES = {
  blue:   { light: "#A8D5FF", mid: "#315CA1", deep: "#243D72", start: "#31568D" },
  teal:   { light: "#A2EEE5", mid: "#27675D", deep: "#194B47", start: "#28665C" },
  violet: { light: "#DCC0FF", mid: "#654993", deep: "#44306D", start: "#684996" },
  amber:  { light: "#FFE9A6", mid: "#795823", deep: "#573D20", start: "#805B29" },
  rose:   { light: "#FFC0CA", mid: "#914666", deep: "#65334F", start: "#934963" },
  indigo: { light: "#C4D8FF", mid: "#4D5199", deep: "#34396F", start: "#50569A" },
  orange: { light: "#FFD18B", mid: "#8B4F30", deep: "#603C29", start: "#8B5036" },
  green:  { light: "#A8EDC7", mid: "#336C4D", deep: "#234F3A", start: "#386A4B" },
  cyan:   { light: "#A9E5F8", mid: "#2C6279", deep: "#214758", start: "#30677A" },
  olive:  { light: "#E8E6A5", mid: "#66622F", deep: "#484722", start: "#6A642E" },
} as const;
type ToolTone = keyof typeof TOOL_TONES;

const TOOL_COLOR: Partial<Record<Tool["key"], ToolTone>> = {
  flashcards: "violet", mcqBank: "teal", malazam: "orange", mistakes: "rose",
  mutamayiz: "blue", paperReview: "teal", mcq: "violet", examGenerator: "amber",
  essay: "rose", podcastTutor: "indigo", videoNotes: "orange", mindmap: "cyan",
  textToVideo: "violet", physicsProblemSolver: "blue", problemGenerator: "green",
  notes: "indigo", canvas: "rose", pdfBuilder: "orange", summaries: "teal",
  adminNotes: "violet", youtube: "rose", report: "cyan", physicsActivities: "blue",
  physicsQuickMcq: "amber", physicsLaws: "teal", physicsSchemes: "violet",
  ministerialBank: "amber", atomAtlas: "indigo", chemistryExperiments: "green",
  organicEquations: "rose", chemicalEquations: "cyan", biologySchemes: "violet",
  biologyDrawings: "green", biologySketchpad: "orange", theoremVisualizer: "indigo",
  englishEssays: "rose", englishIsqat: "teal", englishVerbForms: "violet",
  englishReadingPractice: "blue", frenchSynonyms: "cyan", frenchAntonyms: "orange",
  frenchConjugator: "violet", poemsChecker: "rose", islamicSurahs: "olive", hadithChecker: "teal",
};
const SUBJECT_TONES: Partial<Record<BankSubject, ToolTone>> = {
  physics: "blue", chemistry: "violet", biology: "green", math: "amber",
  english: "rose", french: "indigo", arabic: "teal", islamic: "olive",
};
function toneStyle(tone: ToolTone): CSSProperties {
  const { light, mid, deep, start } = TOOL_TONES[tone];
  return {
    "--home-card-light": light,
    "--home-card-swatch": mid,
    "--home-card-base": deep,
    "--home-card-shadow": deep + "66",
    "--home-gradient-start": start,
    "--home-gradient-end": deep,
  } as CSSProperties;
}

type CatalogSection = { id: string; en: string; ar: string; tools: Tool[] };
const ESSENTIAL_KEYS = new Set<Tool["key"]>(["flashcards", "mcqBank", "malazam", "mistakes"]);
const GENERAL_SECTIONS: { id: string; en: string; ar: string; keys: Tool["key"][] }[] = [
  { id: "assistant", en: "AI study assistant", ar: "مساعدك الدراسي الذكي", keys: ["mutamayiz"] },
  { id: "practice", en: "Practice & exams", ar: "التدريب والامتحانات", keys: ["paperReview", "mcq", "examGenerator", "essay", "physicsProblemSolver", "problemGenerator"] },
  { id: "learn", en: "Learn & understand", ar: "تعلّم وافهم", keys: ["podcastTutor", "videoNotes", "mindmap", "textToVideo"] },
  { id: "workspace", en: "Personal workspace", ar: "مساحتك الدراسية", keys: ["notes", "canvas", "pdfBuilder", "report"] },
  { id: "resources", en: "Study resources", ar: "المصادر الدراسية", keys: ["summaries", "adminNotes", "youtube"] },
];
function catalogSections(tools: Tool[], group: ToolGroup, subject: (typeof SUBJECTS)[number]): CatalogSection[] {
  if (group === "subject") return [
    { id: "essential", en: "Essential study tools", ar: "أدوات الدراسة الأساسية", tools: tools.filter(tool => ESSENTIAL_KEYS.has(tool.key)) },
    { id: "explore", en: `Explore ${subject.en}`, ar: `أدوات ${subject.ar}`, tools: tools.filter(tool => !ESSENTIAL_KEYS.has(tool.key)) },
  ].filter(section => section.tools.length > 0);
  const sections = GENERAL_SECTIONS.map(({ keys, ...section }) => ({
    ...section, tools: tools.filter(tool => keys.includes(tool.key)),
  }));
  const assigned = new Set(GENERAL_SECTIONS.flatMap(section => section.keys));
  // Newly added tools remain visible even before a category is assigned.
  const other = tools.filter(tool => !assigned.has(tool.key));
  if (other.length) sections.push({ id: "other", en: "More tools", ar: "أدوات أخرى", tools: other });
  return sections.filter(section => section.tools.length > 0);
}

const TOOL_HINTS: Partial<Record<Tool["key"], { en: string; ar: string }>> = {
  mutamayiz: { en: "Your personal AI study assistant", ar: "مساعدك الدراسي الشخصي بالذكاء الاصطناعي" },
  paperReview: { en: "Scan your answers", ar: "صوّر إجاباتك" },
  mcq: { en: "Generate questions", ar: "ولّد أسئلة للتدريب" },
  examGenerator: { en: "Test your knowledge", ar: "اختبر معلوماتك" },
  essay: { en: "Improve your answers", ar: "حسّن إجاباتك" },
  podcastTutor: { en: "Learn by listening", ar: "تعلّم بالاستماع" },
  videoNotes: { en: "Turn lectures into notes", ar: "حوّل المحاضرات إلى ملاحظات" },
  mindmap: { en: "Visualize concepts", ar: "رتّب المفاهيم بصرياً" },
  textToVideo: { en: "Watch explanations", ar: "شاهد الشرح" },
  flashcards: { en: "Remember key concepts", ar: "احفظ الأفكار الأساسية" },
  malazam: { en: "Read your study booklets", ar: "اقرأ ملازمك الدراسية" },
  mistakes: { en: "Learn from your errors", ar: "تعلّم من أخطائك" },
};
function StudyToolCard({ tool, isRTL, isPremium, subscriptionLoading, onClick }: {
  tool: Tool; isRTL: boolean; isPremium: boolean; subscriptionLoading: boolean; onClick: () => void;
}) {
  const premium = !tool.free && isPremiumTool(tool.key);
  const locked = tool.disabled || (premium && !isPremium);
  const name = isRTL ? tool.ar : tool.en;
  const hint = TOOL_HINTS[tool.key];
  const description = isRTL ? (tool.descAr ?? hint?.ar) : (tool.descEn ?? hint?.en);
  const status = tool.disabled ? (isRTL ? "مقفل" : "LOCKED") : locked ? (isRTL ? "بريميوم" : "PREMIUM") : tool.free ? (isRTL ? "مجاني" : "FREE") : null;
  const featured = tool.key === "mutamayiz";
  const tone = TOOL_COLOR[tool.key] ?? "blue";
  const statusId = `study-tool-status-${tool.key}`;
  const descId = `study-tool-desc-${tool.key}`;
  return (
    <li className={`min-w-0 ${featured ? "col-span-full" : ""}`}>
      <button type="button" aria-label={name}
        aria-describedby={[description ? descId : "", status ? statusId : ""].filter(Boolean).join(" ") || undefined}
        data-study-tool={tool.key} data-study-tone={tone} data-featured={featured || undefined}
        onClick={onClick} disabled={tool.disabled || (premium && subscriptionLoading)}
        style={toneStyle(tone)}
        className={`home-illustrated-card group relative flex h-full w-full min-w-0 gap-3 overflow-hidden rounded-[1.4rem] border p-3.5 text-start motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70 sm:p-4 ${featured ? "min-h-32 flex-row items-center justify-between" : "min-h-[9.5rem] flex-col justify-between"}`}>
        {!featured && <span className="flex w-full items-start justify-between gap-2">
          <span className="block w-12 shrink-0 p-0.5 sm:w-14"><FeatureIcon3D icon={tool.Icon} /></span>
          {status ? <span id={statusId} className={`inline-flex min-w-0 items-center gap-1 rounded-full bg-black/25 px-1.5 py-1 text-[10px] font-bold leading-tight ${locked ? "text-amber-100" : "text-emerald-100"}`}>
            {locked && <Lock className="size-3.5 shrink-0" aria-hidden="true" />}
            <span className={locked ? "sr-only sm:not-sr-only" : ""}>{status}</span>
          </span> : <ArrowRight aria-hidden="true" className={`mt-1 size-4 shrink-0 text-white/90 ${isRTL ? "rotate-180" : ""}`} />}
        </span>}
        <span className="min-w-0 flex-1">
          <span className={`block break-words font-black leading-snug ${featured ? "text-xl sm:text-2xl" : "text-sm sm:text-base"}`}>{name}</span>
          {description && <span id={descId} className="home-card-muted mt-1 block break-words text-xs leading-relaxed">{description}</span>}
          {featured && <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold">
            {isRTL ? "ابدأ التعلّم" : "Start learning"}<ArrowRight aria-hidden="true" className={`size-4 ${isRTL ? "rotate-180" : ""}`} />
          </span>}
          {featured && status && <span id={statusId} className="sr-only">{status}</span>}
        </span>
        {featured && <MutamayizMascot className="size-20 sm:size-24" />}
      </button>
    </li>
  );
}

const SubjectsHub = ({ language, onBack, onSelect }: {
  language: AppLanguage;
  onBack: () => void;
  onSelect: (choice: MainMenuChoice, scope?: StudyToolScope) => void;
}) => {
  const isRTL = language === "ar";
  const [group, setGroup] = useState<ToolGroup>("subject");
  const [open, setOpen] = useState(readStudySubjectFocus);
  const [due, setDue] = useState<{ owner: string; subject: BankSubject; available: boolean } | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);
  const { isPremium, loading: subscriptionLoading, userId } = useSubscription();
  const hiddenTools = useHiddenStudyTools();

  const selectSubject = useCallback((next: BankSubject | null) => {
    shouldFocus.current = true;
    setGroup("subject");
    setDue(null);
    rememberStudySubjectFocus(next);
    setOpen(next);
  }, []);
  useEffect(() => subscribeStudySubjectFocus(selectSubject), [selectSubject]);
  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [open]);

  const current = SUBJECTS.find(subject => subject.code === open);
  const mcqSubject = open ? scopedMcqSubject(open) : null;
  const mistakesVisible = !hiddenTools.has("mistakes");
  useEffect(() => {
    if (!open || !userId || !mistakesVisible) return;
    let currentRequest = true;
    void hasDueSubjectMistakes(open).then(available => {
      if (currentRequest) setDue({ owner: userId, subject: open, available });
    }).catch(() => {
      if (currentRequest) setDue(null);
    });
    return () => { currentRequest = false; };
  }, [open, userId, mistakesVisible]);
  const canReviewDue = mistakesVisible && !!due && due.owner === userId && due.subject === open && due.available;

  const available = (tool: Tool) => !hiddenTools.has(tool.key);
  const handleToolClick = (tool: Tool, startReview = false) => {
    if (!current || !available(tool) || tool.disabled) return;
    const premium = !tool.free && isPremiumTool(tool.key);
    if (premium && subscriptionLoading) return;
    trackFeature(`tool_${tool.key}`);
    if (premium && isPremium) {
      try {
        const key = "tmz_unlocked_tools_v1";
        const seen: string[] = JSON.parse(localStorage.getItem(key) || "[]");
        if (!seen.includes(tool.key)) {
          localStorage.setItem(key, JSON.stringify([...seen, tool.key]));
          trackFeatureUnlocked(tool.key);
        }
      } catch { /* optional tracking */ }
    }
    if (tool.key === "theoremVisualizer") {
      window.location.assign("/math/theorem-visualizer");
      return;
    }
    if (tool.key === "malazam") {
      window.location.assign(`/malazam/${current.code}/`);
      return;
    }
    if (SCOPED_TOOLS.has(tool.key)) onSelect(tool.key, { subject: current.code, ...(startReview ? { startReview: true } : {}) });
    else onSelect(tool.key);
  };

  const groups: Record<ToolGroup, Tool[]> = {
    subject: [
      FLASHCARDS,
      ...(mcqSubject ? [open === "english" ? LITERATURE_MCQ : MCQ] : []),
      MALAZAM, MISTAKES, ...(current?.tools ?? []),
    ].filter(available),
    general: GENERAL_TOOLS.filter(available),
  };
  const groupCopy = GROUP_COPY[group];
  const tools = groups[group];
  const sections = current ? catalogSections(tools, group, current) : [];

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background pb-28 text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <button type="button"
          onClick={() => current ? selectSubject(null) : onBack()}
          className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <ArrowLeft aria-hidden="true" className={`size-4 ${isRTL ? "rotate-180" : ""}`} />
          {isRTL ? (current ? "كل المواد" : "رجوع") : (current ? "All Subjects" : "Back")}
        </button>

        {!current ? (
          <>
            <header className="mb-6">
              <h1 ref={titleRef} tabIndex={-1} className="text-2xl font-black tracking-tight outline-none sm:text-3xl">
                {isRTL ? "اختَر مادة" : "Choose a subject"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isRTL ? "اختَر المادة حتى تشوف بس الأدوات اللي تخصّها." : "Choose a subject to see just the tools you need for it."}
              </p>
            </header>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4">
              {SUBJECTS.map(subject => (
                <li key={subject.code} className="min-w-0">
                  <button type="button" onClick={() => selectSubject(subject.code)}
                    style={subjectSurface(subject.code)}
                    className="group relative isolate flex min-h-[9rem] w-full flex-col items-start justify-between gap-3 overflow-hidden rounded-[1.6rem] border border-border bg-card p-3.5 text-start motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-h-[10.75rem] sm:p-4">
                    <span className="pointer-events-none absolute -end-6 -top-7 size-28 rounded-full opacity-20 blur-2xl" style={{ background: subjectPalette(subject.code).mid }} aria-hidden="true" />
                    <SubjectArtwork subject={subject} />
                    <span className="relative flex w-full items-center justify-between gap-1">
                      <span className="min-w-0 text-sm font-black leading-snug sm:text-lg">{isRTL ? subject.ar : subject.en}</span>
                      <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full border border-border bg-background/65 text-foreground">
                        <ArrowRight className={`size-3.5 ${isRTL ? "rotate-180" : ""}`} />
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <header style={toneStyle(SUBJECT_TONES[current.code] ?? "blue")} className="home-illustrated-card group mb-5 flex min-h-32 items-center justify-between gap-3 rounded-[1.75rem] border p-4 sm:gap-5 sm:p-5">
              <div className="min-w-0 flex-1">
                <p className="home-card-muted text-xs font-bold uppercase tracking-wide">{isRTL ? "مادتك الدراسية" : "Your subject"}</p>
                <h1 ref={titleRef} tabIndex={-1} className="mt-1 break-words text-2xl font-black tracking-tight outline-none sm:text-3xl">{isRTL ? current.ar : current.en}</h1>
                <p className="home-card-muted mt-1 text-sm">{isRTL ? "استكشف، افهم، وتميّز" : "Explore. Understand. Master."}</p>
              </div>
              <span className="block w-20 shrink-0 p-1 sm:w-24"><FeatureIcon3D icon={current.Icon} /></span>
            </header>

            {canReviewDue && <button type="button" onClick={() => handleToolClick(MISTAKES, true)}
              className="mb-4 flex min-h-12 w-full items-center gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-3.5 py-2 text-start font-bold text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <RotateCcw aria-hidden="true" className="size-4 shrink-0" />
              <span className="flex-1">{isRTL ? "راجع أخطاءك المستحقة بهالمادة" : "Review your due mistakes in this subject"}</span>
              <ArrowRight aria-hidden="true" className={`size-4 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
            </button>}
            {mcqSubject && !hiddenTools.has("mcqBank") && <StudyStartIntake key={current.code} subject={mcqSubject} language={language} onStart={() => onSelect("mcqBank")} />}

            <div role="group" aria-label={isRTL ? "أقسام الأدوات" : "Tool categories"}
              className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/45 p-1">
              {(["subject", "general"] as const).map(key => (
                <button type="button" key={key} aria-pressed={group === key} aria-controls="subject-tool-list" onClick={() => setGroup(key)}
                  className={`min-h-11 rounded-xl px-2 py-2 text-xs font-bold leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm ${group === key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-background/65 hover:text-foreground"}`}>
                  {isRTL ? GROUP_COPY[key].ar : GROUP_COPY[key].en}
                </button>
              ))}
            </div>
            <section className="mt-4" id="subject-tool-list" aria-label={isRTL ? groupCopy.ar : groupCopy.en}>
              <p className="mb-2 text-xs text-muted-foreground">{isRTL ? groupCopy.arHint : groupCopy.enHint}</p>
              {tools.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">{isRTL ? "ماكو أدوات ظاهرة بهالقسم هسه." : "No visible tools in this category."}</p>
              ) : (
                    <div className="space-y-6">
                  {sections.map(section => (
                    <div key={section.id} className="min-w-0">
                      <h2 className="mb-2.5 text-base font-black tracking-tight sm:text-lg">{isRTL ? section.ar : section.en}</h2>
                      <ul data-study-section={section.id} className="grid grid-cols-2 gap-3 sm:gap-4">
                        {section.tools.map(tool => <StudyToolCard key={tool.key} tool={tool} isRTL={isRTL} isPremium={isPremium}
                          subscriptionLoading={subscriptionLoading} onClick={() => handleToolClick(tool)} />)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default SubjectsHub;
