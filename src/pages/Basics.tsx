import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { trackStreakUpdated } from "@/lib/analytics";
import { ensureDailyLogin, fetchProgress } from "@/lib/unlocks";
import { readOnboarding, weakTopicsFor, topicLabel } from "@/lib/onboarding";
import {
  ArrowRight, ArrowLeft, Layers, AlertTriangle, BookMarked, FileText, GraduationCap, Microscope,
  X, ListChecks, Newspaper, Timer, ScrollText, Network, Search,
  Globe, Trophy, Target, HelpCircle, Headphones, Podcast, Lightbulb, Sparkles,
  Crown, UserCog, BookOpen, Heart, Users, Settings, Moon, PenLine, MousePointerClick, NotebookPen, Youtube, FlaskConical, Swords, Video, Palette, Lock,
  CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, Grid2X2, RefreshCw,
} from "lucide-react";
import { dueMistakesCount } from "@/lib/mistakes";
import { unseenAdminNotesCount } from "@/lib/unseenAdminNotes";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";
import type { MainMenuChoice } from "@/pages/MainMenu";
import { useSubscription } from "@/hooks/useSubscription";
import { isPremiumTool } from "@/lib/premium";
import { missionsData, missionsOrder } from "@/data/missions";
import VisitCounter from "@/components/VisitCounter";
import { useTodos } from "@/lib/todoTopicProgress";
import { getStudyWeek, getTodoDay } from "@/lib/todoSchedule";
import StreakTree from "@/components/StreakTree";
import ChapterProgressCircles from "@/components/ChapterProgressCircles";
import { RETURN_TO_PROGRESS_KEY, type TopicPracticeTarget } from "@/lib/topicPracticeQuiz";
import RankStone from "@/components/RankStone";
import { rankFor, RANKS } from "@/lib/points";
import { totalDueCount, dueBreakdown, type DueGroup } from "@/lib/srs";
import GiftMcqButton from "@/components/GiftMcqButton";
import MutamayizMascot from "@/components/MutamayizMascot";
import { openMutamayizStudyGuide } from "@/lib/mutamayizLaunch";
import { resetStudySubjectFocus } from "@/lib/studySubjectFocus";
import studyBookArt from "@/assets/home-study-book.webp";
import HomeHighlights from "@/components/home/HomeHighlights";
import HomeDailyReport from "@/components/home/HomeDailyReport";
import PointsGuideCards from "@/components/home/PointsGuideCards";
import QuickStudy from "@/components/home/QuickStudy";
import { getRecentTools, recordToolUse } from "@/lib/recentTools";
import { useHiddenStudyTools } from "@/lib/studyToolVisibility";
import { normalizeStudySearch } from "@/lib/studySearch";
import {
  DAILY_FLASHCARD_TARGET_KEY,
  DAILY_MCQ_TARGET_KEY,
  dailyLearningProfile,
  readWeeklyLearningProfile,
  todayKey,
  type WeeklyLearningProfile,
} from "@/lib/weeklyLearning";

const SUBJECT_LABELS: Record<string, { ar: string; en: string }> = {
  physics: { ar: "الفيزياء", en: "Physics" },
  chemistry: { ar: "الكيمياء", en: "Chemistry" },
  biology: { ar: "الأحياء", en: "Biology" },
  english: { ar: "الإنجليزية", en: "English" },
  french: { ar: "الفرنسية", en: "French" },
  arabic: { ar: "العربية", en: "Arabic" },
  islamic: { ar: "التربية الإسلامية", en: "Islamic" },
  math: { ar: "الرياضيات", en: "Math" },
};

function subjectLabel(subject: string, language: AppLanguage): string {
  const m = SUBJECT_LABELS[subject?.toLowerCase?.() ?? ""];
  return m ? (language === "ar" ? m.ar : m.en) : subject;
}

function useStreakDays(): number | null {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      await ensureDailyLogin();
      const progress = await fetchProgress();
      if (active) setDays(progress.current_streak);
    };
    const onRefresh = () => { void refresh().catch(() => {}); };
    onRefresh();
    window.addEventListener("app:progress-updated", onRefresh);
    window.addEventListener("focus", onRefresh);
    return () => {
      active = false;
      window.removeEventListener("app:progress-updated", onRefresh);
      window.removeEventListener("focus", onRefresh);
    };
  }, []);
  useEffect(() => {
    if (days === null || days <= 0) return;
    try {
      const key = "tmz_streak_tracked_v1";
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem(key) === `${today}:${days}`) return;
      localStorage.setItem(key, `${today}:${days}`);
      trackStreakUpdated(days);
    } catch { /* ignore */ }
  }, [days]);
  return days;
}

export type BasicsChoice =
  | "flashcards"
  | "malazam"
  | "summaries"
  | "sessions"
  | "biologyDrawings"
  | "biologySketchpad"
  | "todo"
  | "news"
  | "ministerialBank"
  | "subjectsHub"
  | "mindmap";

const TEMP_LOCKED_TOOLS = new Set<MainMenuChoice>(["subjectTutor"]);

const MOTIVATIONAL_PHRASES = {
  en: [
    "Believe in yourself!",
    "You are unstoppable!",
    "Dream big, work hard!",
    "One step closer to greatness!",
    "Your future starts now!",
    "Knowledge is power!",
    "Stay curious, stay winning!",
    "Make today count!",
    "Success is a journey!",
    "You are capable of amazing things!",
    "Push your limits!",
    "Excellence is a habit!",
    "Study now, shine later!",
    "Every effort matters!",
    "You got this!",
    "Progress, not perfection!",
    "Keep moving forward!",
    "Your time is now!",
    "Hard work pays off!",
    "Be the best version of you!",
  ],
  ar: [
    "آمن بنفسك!",
    "أنت لا يُقهر!",
    "احلم كبيراً، اجتهد كثيراً!",
    "خطوة أقرب إلى العظمة!",
    "مستقبلك يبدأ الآن!",
    "العلم قوة!",
    "كن فضولياً، كن منتصراً!",
    "اجعل هذا اليوم يُحتسب!",
    "النجاح رحلة!",
    "أنت قادر على أمور مذهلة!",
    "ادفع حدودك!",
    "التميز عادة!",
    "ادرس الآن، تلألأ لاحقاً!",
    "كل جهد يهم!",
    "أنت تستطيع!",
    "التقدم، لا الكمال!",
    "استمر بالتقدم!",
    "وقتك هو الآن!",
    "العمل الشاق يُثمر!",
    "كن النسخة الأفضل من نفسك!",
  ],
} as const;

const copy = {
  en: {
    badge: "Home",
    description: "Your essential study tools, all in one place.",
    hi: "Hi",
    items: {
      flashcards: { title: "Flashcards", subtitle: "Smart Q&A cards across every subject." },
      malazam: { title: "Malazam", subtitle: "Curated booklets and notes per subject." },
      summaries: { title: "Notes & Summaries", subtitle: "Upload and browse approved notes." },
      sessions: { title: "Sessions", subtitle: "Track study time and climb the board." },
      biologyDrawings: { title: "Biology Drawings", subtitle: "Practice diagram labels with drag and drop." },
      biologySketchpad: { title: "Biology Sketchpad", subtitle: "Sketch on blank paper or a biology outline, erase and submit." },
      todo: { title: "To-Do List", subtitle: "Plan tasks and celebrate when you finish." },
      news: { title: "News", subtitle: "Latest announcements and updates." },
      ministerialBank: { title: "Ministerial Questions Bank", subtitle: "Past ministerial questions by chapter." },
      mindmap: { title: "Mind Map", subtitle: "Upload a PDF to map all of its scientific content." },
    },
  },
  ar: {
    badge: "الرئيسية",
    description: "أدواتك الدراسية الأساسية في مكان واحد.",
    hi: "أهلاً",
    items: {
      flashcards: { title: "البطاقات التعليمية", subtitle: "بطاقات سؤال وجواب لكل المواد." },
      malazam: { title: "الملازم", subtitle: "ملازم ومذكرات لكل مادة." },
      summaries: { title: "ملاحظات وملخصات", subtitle: "ارفع وتصفّح الملاحظات المعتمدة." },
      sessions: { title: "الجلسات", subtitle: "احسب وقت دراستك وتصدّر اللوحة." },
      biologyDrawings: { title: "رسومات الأحياء", subtitle: "تدرّب على تسميات الرسومات بالسحب والإفلات." },
      biologySketchpad: { title: "الرسم الحر بالأحياء", subtitle: "ورقة سكتش ومخططات ترسم عليها بإصبعك، تمسح وتسلّم." },
      todo: { title: "قائمة المهام", subtitle: "نظّم مهامك واحتفل بإنجازها." },
      news: { title: "الأخبار", subtitle: "آخر الإعلانات والتحديثات." },
      ministerialBank: { title: "بنك الوزاريات", subtitle: "أسئلة وزارية سابقة مرتبة حسب الفصل." },
      mindmap: { title: "الخريطة الذهنية", subtitle: "ارفع ملف PDF لرسم كل محتواه العلمي." },
    },
  },
} as const;

type NavItem = {
  key: MainMenuChoice;
  labelEn: string;
  labelAr: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const NAV_GROUPS: { titleEn: string; titleAr: string; items: NavItem[] }[] = [
  {
    titleEn: "Subjects",
    titleAr: "المواد",
    items: [
      { key: "subjectsHub", labelEn: "All Subjects", labelAr: "كل المواد", Icon: BookOpen },
      { key: "ourCourses", labelEn: "Our Courses", labelAr: "دوراتنا", Icon: GraduationCap },
    ],
  },
  {
    titleEn: "Study",
    titleAr: "الأدوات",
    items: [
      { key: "pdfBuilder", labelEn: "Build Your PDF", labelAr: "صمّم ملزمتك", Icon: FileText },
      { key: "malazam", labelEn: "Al Malazam", labelAr: "بنك الملازم", Icon: BookMarked },
      { key: "notes", labelEn: "Notes", labelAr: "ملاحظاتي", Icon: NotebookPen },
      { key: "adminNotes", labelEn: "Enrichments", labelAr: "الإثرائيات", Icon: BookOpen },
      { key: "summaries", labelEn: "Summaries", labelAr: "الملخصات", Icon: FileText },
      { key: "mcq", labelEn: "MCQ Generator", labelAr: "مولّد الأسئلة", Icon: HelpCircle },
      { key: "mcqBank", labelEn: "MCQ Bank", labelAr: "بنك الأسئلة", Icon: Layers },
      { key: "mistakes", labelEn: "My Mistakes", labelAr: "أخطائي", Icon: AlertTriangle },
      { key: "chemicalEquations", labelEn: "Chemical Equation", labelAr: "المعادلات الكيميائية", Icon: FlaskConical },
      { key: "mindmap", labelEn: "Mind Map", labelAr: "الخريطة الذهنية", Icon: Network },
      { key: "videoNotes", labelEn: "Video Notes", labelAr: "ملاحظات الفيديو", Icon: Headphones },
      { key: "biologyDrawings", labelEn: "Biology Drawings", labelAr: "رسومات الأحياء", Icon: Microscope },
      { key: "biologySketchpad", labelEn: "Biology Sketchpad", labelAr: "الرسم الحر بالأحياء", Icon: PenLine },
      { key: "podcastTutor", labelEn: "Podcast Tutor", labelAr: "المعلّم الصوتي", Icon: Podcast },
      { key: "textToVideo", labelEn: "Text → Video", labelAr: "نص إلى فيديو", Icon: Video },
      { key: "youtube", labelEn: "YouTube Player", labelAr: "مشغّل يوتيوب", Icon: Youtube },
      { key: "liveBattle", labelEn: "Live Battle", labelAr: "المعركة المباشرة", Icon: Swords },
    ],
  },
  {
    titleEn: "Progress",
    titleAr: "التقدم",
    items: [
      { key: "report", labelEn: "Daily Report", labelAr: "تقريري", Icon: Sparkles },
      { key: "sessions", labelEn: "Sessions", labelAr: "الجلسات", Icon: GraduationCap },
      { key: "missions", labelEn: "Missions", labelAr: "المهمات", Icon: Target },
      { key: "todo", labelEn: "To-Do List", labelAr: "قائمة المهام", Icon: ListChecks },
      { key: "leaderboard", labelEn: "Leaderboard", labelAr: "المتصدرون", Icon: Trophy },
    ],
  },
  {
    titleEn: "Community",
    titleAr: "المجتمع",
    items: [
      { key: "whoIsBest", labelEn: "Who Is Best?", labelAr: "من الأفضل؟", Icon: Trophy },
      { key: "news", labelEn: "News", labelAr: "الأخبار", Icon: Newspaper },
      { key: "advices", labelEn: "Advices", labelAr: "النصائح", Icon: Lightbulb },
    ],
  },
  {
    titleEn: "Play",
    titleAr: "العب",
    items: [
      { key: "dailyGame", labelEn: "Daily Game", labelAr: "لعبة اليوم", Icon: Sparkles },
      { key: "studyRace", labelEn: "Tamayzak Race", labelAr: "سباق تميّزك", Icon: Trophy },
      { key: "liveBattle", labelEn: "Live Battle", labelAr: "المعركة المباشرة", Icon: Swords },
    ],
  },
  {
    titleEn: "Our Teachers",
    titleAr: "مدرسونا",
    items: [
      { key: "ourTeachers", labelEn: "Our Teachers", labelAr: "مدرسونا", Icon: GraduationCap },
    ],
  },
  {
    titleEn: "Account",
    titleAr: "الحساب",
    items: [
      { key: "account", labelEn: "Account Center", labelAr: "مركز الحساب", Icon: UserCog },
    ],
  },
];

// Featured top cards (report/summaries + todo/fahrast)
const FEATURED: { key: MainMenuChoice; Icon: React.ComponentType<{ className?: string }>; tintBg: string; tintText: string }[] = [
  { key: "subjectsHub", Icon: BookOpen, tintBg: "bg-primary", tintText: "text-primary-foreground" },
  { key: "mcqBank", Icon: Layers, tintBg: "bg-sky-50", tintText: "text-sky-600" },
  { key: "notes", Icon: NotebookPen, tintBg: "bg-teal-50", tintText: "text-teal-600" },
  { key: "sessions", Icon: Timer, tintBg: "bg-emerald-50", tintText: "text-emerald-600" },
];

// Study tools grid (bottom section)
const STUDY_TOOLS: { key: MainMenuChoice; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "pdfBuilder", Icon: FileText },
  { key: "malazam",    Icon: BookMarked },
  { key: "mcqBank",    Icon: Layers },
  { key: "mistakes",   Icon: AlertTriangle },
  { key: "videoNotes", Icon: Headphones },
  { key: "podcastTutor", Icon: Podcast },
  { key: "youtube",    Icon: Youtube },
  { key: "canvas",     Icon: Palette },
  { key: "biologySketchpad", Icon: PenLine },
  { key: "notes",      Icon: NotebookPen },
  { key: "adminNotes", Icon: BookOpen },
  { key: "mutamayiz",  Icon: Sparkles },
  { key: "mcq",        Icon: HelpCircle },
];

// Icons for any tool that can show up in "recently used"
const TOOL_ICONS: Partial<Record<MainMenuChoice, React.ComponentType<{ className?: string }>>> = {
  pdfBuilder: FileText,
  malazam: BookMarked,
  chemicalEquations: FlaskConical,
  videoNotes: Headphones,
  podcastTutor: Podcast,
  youtube: Youtube,
  canvas: Palette,
  biologySketchpad: PenLine,
  notes: NotebookPen,
  adminNotes: BookOpen,
  mutamayiz: Sparkles,
  mcq: HelpCircle,
  mcqBank: Layers,
  mistakes: AlertTriangle,
  report: Sparkles,
  summaries: FileText,
  todo: ListChecks,
  missions: Target,
};

const HOME_TOOL_TINTS: Partial<Record<MainMenuChoice, { card: string; icon: string }>> = {
  chemicalEquations: { card: "border-chemistry/40 bg-gradient-to-br from-chemistry/25 via-chemistry/10 to-orange-400/15", icon: "bg-chemistry text-white" },
  subjectsHub: { card: "border-blue-400/40 bg-gradient-to-br from-blue-500/25 via-sky-500/10 to-cyan-400/20", icon: "bg-blue-600 text-white shadow-lg shadow-blue-500/25" },
  flashcards: { card: "border-violet-400/40 bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-violet-400/20", icon: "bg-violet-600 text-white shadow-lg shadow-violet-500/25" },
  pdfBuilder: { card: "border-blue-400/40 bg-gradient-to-br from-blue-500/20 to-amber-100/10", icon: "bg-blue-700 text-white" },
  malazam: { card: "border-orange-400/40 bg-gradient-to-br from-amber-500/25 via-orange-500/10 to-orange-400/20", icon: "bg-orange-600 text-white shadow-lg shadow-orange-500/25" },
  ministerialBank: { card: "border-amber-400/40 bg-gradient-to-br from-orange-500/25 via-amber-500/10 to-yellow-400/20", icon: "bg-amber-600 text-white shadow-lg shadow-amber-500/25" },
  biologySketchpad: { card: "border-teal-400/40 bg-gradient-to-br from-teal-500/25 via-cyan-500/10 to-sky-400/20", icon: "bg-teal-600 text-white" },
  biologyDrawings: { card: "border-lime-400/40 bg-gradient-to-br from-green-500/25 via-lime-500/10 to-lime-400/20", icon: "bg-lime-600 text-white shadow-lg shadow-lime-500/25" },
  mcqBank: { card: "border-sky-400/40 bg-gradient-to-br from-sky-500/25 via-blue-500/10 to-blue-400/20", icon: "bg-sky-600 text-white shadow-lg shadow-sky-500/25" },
  missions: { card: "border-yellow-400/40 bg-gradient-to-br from-amber-500/25 via-yellow-500/10 to-yellow-300/20", icon: "bg-amber-500 text-white shadow-lg shadow-amber-500/25" },
  summaries: { card: "border-violet-400/40 bg-gradient-to-br from-violet-500/25 via-purple-500/10 to-fuchsia-400/20", icon: "bg-violet-600 text-white shadow-lg shadow-violet-500/25" },
  adminNotes: { card: "border-rose-400/40 bg-gradient-to-br from-rose-500/25 via-pink-500/10 to-pink-400/20", icon: "bg-rose-600 text-white shadow-lg shadow-rose-500/25" },
  notes: { card: "border-teal-400/40 bg-gradient-to-br from-teal-500/25 via-emerald-500/10 to-emerald-400/20", icon: "bg-teal-600 text-white shadow-lg shadow-teal-500/25" },
  sessions: { card: "border-emerald-400/40 bg-gradient-to-br from-emerald-500/25 via-green-500/10 to-teal-400/20", icon: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25" },
  mistakes: { card: "border-orange-400/40 bg-gradient-to-br from-orange-500/25 via-red-500/10 to-red-400/20", icon: "bg-orange-600 text-white shadow-lg shadow-orange-500/25" },
  mindmap: { card: "border-indigo-400/40 bg-gradient-to-br from-indigo-500/25 via-violet-500/10 to-purple-400/20", icon: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" },
  videoNotes: { card: "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/25 via-pink-500/10 to-rose-400/20", icon: "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/25" },
  podcastTutor: { card: "border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 via-sky-500/10 to-teal-400/20", icon: "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25" },
  textToVideo: { card: "border-pink-400/40 bg-gradient-to-br from-pink-500/25 via-rose-500/10 to-orange-400/20", icon: "bg-pink-600 text-white shadow-lg shadow-pink-500/25" },
  youtube: { card: "border-red-400/40 bg-gradient-to-br from-red-500/25 via-rose-500/10 to-pink-400/20", icon: "bg-red-600 text-white shadow-lg shadow-red-500/25" },
  canvas: { card: "border-blue-400/40 bg-gradient-to-br from-indigo-500/25 via-blue-500/10 to-cyan-400/20", icon: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" },
  mutamayiz: { card: "border-emerald-400/40 bg-gradient-to-br from-teal-500/25 via-cyan-500/10 to-emerald-400/20", icon: "bg-teal-600 text-white shadow-lg shadow-teal-500/25" },
  mcq: { card: "border-purple-400/40 bg-gradient-to-br from-purple-500/25 via-fuchsia-500/10 to-pink-400/20", icon: "bg-purple-600 text-white shadow-lg shadow-purple-500/25" },
  liveBattle: { card: "border-rose-400/40 bg-gradient-to-br from-rose-500/25 via-red-500/10 to-amber-400/20", icon: "bg-rose-600 text-white shadow-lg shadow-rose-500/25" },
  report: { card: "border-lime-400/40 bg-gradient-to-br from-lime-500/25 via-emerald-500/10 to-green-400/20", icon: "bg-lime-600 text-white shadow-lg shadow-lime-500/25" },
  todo: { card: "border-blue-400/40 bg-gradient-to-br from-blue-500/25 via-indigo-500/10 to-violet-400/20", icon: "bg-blue-600 text-white shadow-lg shadow-blue-500/25" },
  leaderboard: { card: "border-yellow-400/40 bg-gradient-to-br from-yellow-500/25 via-amber-500/10 to-orange-400/20", icon: "bg-yellow-500 text-white shadow-lg shadow-yellow-500/25" },
  whoIsBest: { card: "border-yellow-400/40 bg-gradient-to-br from-yellow-500/25 via-orange-500/10 to-amber-300/20", icon: "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-amber-500/25" },
  news: { card: "border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 via-blue-500/10 to-sky-400/20", icon: "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25" },
  advices: { card: "border-amber-400/40 bg-gradient-to-br from-yellow-500/25 via-amber-500/10 to-orange-300/20", icon: "bg-amber-500 text-white shadow-lg shadow-amber-500/25" },
  dailyGame: { card: "border-purple-400/40 bg-gradient-to-br from-purple-500/25 via-indigo-500/10 to-blue-400/20", icon: "bg-purple-600 text-white shadow-lg shadow-purple-500/25" },
  account: { card: "border-slate-400/40 bg-gradient-to-br from-slate-500/25 via-zinc-500/10 to-slate-300/20", icon: "bg-slate-700 text-white shadow-lg shadow-slate-500/25" },
  ourTeachers: { card: "border-indigo-400/40 bg-gradient-to-br from-indigo-500/25 via-sky-500/10 to-cyan-400/20", icon: "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" },
};

const DEFAULT_HOME_TINT = {
  card: "border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-background",
  icon: "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
};

const HOME_RANK_NAME_COLOR = {
  coal: "#4b5563",
  copper: "#9a3412",
  silver: "#475569",
  gold: "#b45309",
  diamond: "#0e7490",
  royal: "#7e22ce",
} as const;

const HOME_ICON_TILE = "home-card-tile grid size-9 shrink-0 place-items-center rounded-xl";

const TOOL_CATEGORY_TINTS: Record<string, { active: string; idle: string }> = {
  All: { active: "border-primary bg-primary text-primary-foreground", idle: "border-border bg-background text-foreground hover:bg-secondary" },
  Review: { active: "border-primary bg-primary text-primary-foreground", idle: "border-border bg-background text-foreground hover:bg-secondary" },
  Test: { active: "border-primary bg-primary text-primary-foreground", idle: "border-border bg-background text-foreground hover:bg-secondary" },
  Organize: { active: "border-primary bg-primary text-primary-foreground", idle: "border-border bg-background text-foreground hover:bg-secondary" },
};
const DEFAULT_TOOL_CATEGORY_TINT = TOOL_CATEGORY_TINTS.All;
const TOOL_CATEGORY_LABELS = {
  ar: { All: "الكل", Review: "مراجعة", Test: "اختبر نفسك", Organize: "تنظيم" },
  en: { All: "All tools", Review: "Review", Test: "Test yourself", Organize: "Organize" },
} as const;
const TOOL_CATEGORY_KEYS: Record<"Review" | "Test" | "Organize", Set<string>> = {
  Review: new Set(["flashcards", "malazam", "summaries", "adminNotes", "ministerialBank", "mistakes", "notes", "mindmap", "videoNotes", "podcastTutor", "youtube", "frenchConjugator"]),
  Test: new Set(["mcq", "mcqBank", "essay", "liveBattle", "dailyGame", "challenge", "biologyDrawings", "biologySketchpad", "biologySchemes", "physicsSchemes", "physicsQuickMcq", "physicsProblemSolver", "problemGenerator", "chemicalEquations", "organicEquations", "examGenerator"]),
  Organize: new Set(["subjectsHub", "ourCourses", "teachers", "ourTeachers", "report", "sessions", "missions", "todo", "leaderboard", "news", "advices", "whoIsBest", "account", "premium", "more", "joinTamayzak", "unlocks", "textToVideo", "canvas", "islamicSurahs", "hadithChecker", "poemsChecker", "englishEssays", "englishIsqat", "englishVerbForms", "englishReadingPractice", "frenchSynonyms", "frenchAntonyms", "psych", "mutamayiz", "subjectTutor", "physicsLaws", "physicsActivities", "chemistryExperiments"]),
};
function toolCategoryFor(key: string): "Review" | "Test" | "Organize" {
  if (TOOL_CATEGORY_KEYS.Review.has(key)) return "Review";
  if (TOOL_CATEGORY_KEYS.Test.has(key)) return "Test";
  return "Organize";
}

const FEATURED_COPY = {
  en: {
    pdfBuilder: { title: "Build Your PDF", subtitle: "Choose chapter questions, answers and a booklet template." },
    malazam: { title: "Al Malazam", subtitle: "Read PDFs, download booklets and save your copies." },
    chemicalEquations: { title: "Chemical Equation", subtitle: "19 chemistry equations organized by topic, with a memory hint for each." },
    report: { title: "Daily Report", subtitle: "AI insights + parent follow-up link." },
    summaries: { title: "Notes & Summaries", subtitle: "Upload and browse approved notes." },
    todo: { title: "To-Do List", subtitle: "Plan tasks and celebrate when you finish." },
    missions: { title: "Al-Fahrast", subtitle: "Chapter topics tracked per subject." },
    mcq: { title: "MCQ Generator", subtitle: "Get multiple-choice questions from any file." },
    mcqBank: { title: "MCQ Bank", subtitle: "Solve real MCQs by subject. Points only on your first-ever try." },
    mistakes: { title: "My Mistakes", subtitle: "Everything you got wrong, back for review every 3 days." },
    youtube: { title: "YouTube Player", subtitle: "Watch any YouTube video inside the app." },
    videoNotes: { title: "Video to Notes", subtitle: "Turn a YouTube lecture into AI study notes." },
    podcastTutor: { title: "Podcast Tutor", subtitle: "Explain, recap aloud, and get instant spoken feedback." },
    canvas: { title: "My Notebook", subtitle: "Write, draw and decorate your own paper notebook." },
    biologySketchpad: { title: "Biology Sketchpad", subtitle: "Draw on sketch paper or biology outlines, erase and submit." },
    notes: { title: "Notes", subtitle: "Write and organize your own study notes." },
    adminNotes: { title: "Enrichments", subtitle: "Colorful enrichment cards crafted by your instructors." },
    mutamayiz: { title: "متميز", subtitle: "One assistant for questions, planning, support and website tools." },
    liveBattle: { title: "Live Battle", subtitle: "Challenge a friend in a 10-question MCQ duel." },
    subjectsHub: { title: "Subjects", subtitle: "All your subjects, chapter by chapter." },
    sessions: { title: "Study Sessions", subtitle: "Time your study and join study rooms." },
    whoIsBest: { title: "Who Is Best?", subtitle: "Vote for your favourite teacher and see the live ranking." },
    ourTeachers: { title: "Our Teachers", subtitle: "Choose a teacher and open their selected learning tools." },
  },
  ar: {
    chemicalEquations: { title: "المعادلات الكيميائية", subtitle: "19 معادلة كيميائية مرتبة حسب الموضوع، مع تلميح لحفظ كل معادلة." },
    report: { title: "تقريري اليومي", subtitle: "ملاحظات ذكية ورابط متابعة لولي الأمر." },
    summaries: { title: "ملخصات", subtitle: "ارفع وتصفّح ملاحظات معتمدة." },
    pdfBuilder: { title: "صمّم ملزمتك", subtitle: "وزاريات ومراجعة وMCQ بتصميم تختاره وتنزيل PDF." },
    malazam: { title: "بنك الملازم", subtitle: "اقرأ ملفات PDF وحمّل الملازم واحفظ نسختك." },
    todo: { title: "قائمة المهام", subtitle: "نظّم مهامك واحتفل بإنجازها." },
    missions: { title: "الفهرست", subtitle: "مواضيع الفصول لكل مادة." },
    mcq: { title: "مولّد الأسئلة", subtitle: "احصل على اختيارات من متعدد من أي ملف." },
    mcqBank: { title: "بنك الأسئلة", subtitle: "حل أسئلة حسب المادة. النقاط لأول محاولة فقط." },
    mistakes: { title: "أخطائي", subtitle: "كل ما أخطأت فيه يعود للمراجعة كل 3 أيام." },
    youtube: { title: "مشغّل يوتيوب", subtitle: "شاهد أي فيديو يوتيوب داخل التطبيق." },
    videoNotes: { title: "من الفيديو إلى ملاحظات", subtitle: "حوّل محاضرة يوتيوب إلى ملاحظات بالذكاء." },
    podcastTutor: { title: "المعلّم الصوتي", subtitle: "استمع، لخّص بصوتك، واحصل على تصحيح فوري." },
    canvas: { title: "دفتري", subtitle: "اكتب وارسم وزيّن صفحات دفترك." },
    biologySketchpad: { title: "الرسم الحر بالأحياء", subtitle: "ارسم على ورقة سكتش أو مخطط، امسح وسلّم رسمك." },
    notes: { title: "ملاحظاتي", subtitle: "اكتب ونظّم ملاحظاتك الدراسية." },
    adminNotes: { title: "إثرائيات", subtitle: "بطاقات إثرائية ملوّنة أعدّها المدرّسون خصيصاً لك." },
    mutamayiz: { title: "متميز", subtitle: "مساعد واحد لأسئلتك ومشاكلك وجدولك ودليلك بالموقع." },
    liveBattle: { title: "المعركة المباشرة", subtitle: "تحد صديقك" },
    subjectsHub: { title: "المواد", subtitle: "كل موادك، فصلاً بفصل." },
    sessions: { title: "جلسات الدراسة", subtitle: "احسب وقت دراستك وادخل غرف الدراسة." },
    whoIsBest: { title: "من الأفضل؟", subtitle: "صوّت لمدرسك المفضل وشوف الترتيب المباشر." },
    ourTeachers: { title: "مدرسونا", subtitle: "اختَر المدرّس وافتح الأدوات والمحتوى الخاص بيه." },
  },
} as const;

const Basics = ({
  language,
  onChangeLanguage,
  onSelect,
  onNav,
  onPracticeTopic,
  initialShowAllTools = false,
}: {
  language: AppLanguage;
  onChangeLanguage: () => void;
  onSelect: (c: BasicsChoice) => void;
  onNav: (c: MainMenuChoice) => void;
  onPracticeTopic?: (target: TopicPracticeTarget) => void;
  initialShowAllTools?: boolean;
}) => {
  const phrases = MOTIVATIONAL_PHRASES[language];
  const [motivationalPhrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);
  const { isPremium, loading: subscriptionLoading, userId } = useSubscription();
  const fc = FEATURED_COPY[language];
  const [activeKey, setActiveKey] = useState<MainMenuChoice>("flashcards");
  const [activeGroup, setActiveGroup] = useState<string>(NAV_GROUPS[0].titleEn);
  const todos = useTodos();
  const [missionsDone, setMissionsDone] = useState<number>(0);
  const streakDays = useStreakDays();
  const [toolCategory, setToolCategory] = useState("All");
  const [toolQuery, setToolQuery] = useState("");
  const [showAllTools, setShowAllTools] = useState<boolean>(initialShowAllTools);
  const [showRecommendedStudy, setShowRecommendedStudy] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("study") !== "today") return false;
    params.delete("study");
    const query = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    return true;
  });
  const [recommendedProfile, setRecommendedProfile] = useState<WeeklyLearningProfile | null>(() => readWeeklyLearningProfile());
  type HomeDetailScreen = "plan" | "progress" | "streak" | "points" | "quickStudy";
  const [detailScreen, setDetailScreen] = useState<HomeDetailScreen | null>(() => {
    if (sessionStorage.getItem(RETURN_TO_PROGRESS_KEY) !== "1") return null;
    sessionStorage.removeItem(RETURN_TO_PROGRESS_KEY);
    return "progress";
  });
  const detailOrigin = useRef<{ scroll: number; trigger: string } | null>(null);
  const openDetail = (screen: HomeDetailScreen) => {
    detailOrigin.current = { scroll: window.scrollY, trigger: screen + "-details-trigger" };
    setDetailScreen(screen);
  };
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (detailScreen) {
        window.scrollTo({ top: 0, behavior: "auto" });
        document.getElementById("study-detail-title")?.focus({ preventScroll: true });
      } else if (detailOrigin.current) {
        const origin = detailOrigin.current;
        const trigger = document.getElementById(origin.trigger);
        window.scrollTo({ top: origin.scroll, behavior: "auto" });
        if (origin.trigger === "points-details-trigger" || origin.trigger === "quickStudy-details-trigger") {
          trigger?.scrollIntoView?.({ block: "nearest", inline: "start" });
        }
        trigger?.focus({ preventScroll: true });
        detailOrigin.current = null;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [detailScreen]);

  const [recentKeys, setRecentKeys] = useState<string[]>(() => getRecentTools());
  const hiddenStudyTools = useHiddenStudyTools();
  const availableStudyTools = useMemo(() => {
    const seen = new Set<string>();
    return NAV_GROUPS.flatMap((group) => group.items).filter((item) => {
      if (seen.has(item.key) || hiddenStudyTools.has(item.key)) return false;
      seen.add(item.key);
      return true;
    });
  }, [hiddenStudyTools]);
  const filteredStudyTools = useMemo(() => {
    const query = normalizeStudySearch(toolQuery);
    return availableStudyTools.filter((item) =>
      (toolCategory === "All" || toolCategoryFor(item.key) === toolCategory)
      && (!query || normalizeStudySearch([item.labelAr, item.labelEn, fc[item.key as keyof typeof fc]?.subtitle ?? ""].join(" ")).includes(query)),
    );
  }, [availableStudyTools, toolCategory, toolQuery, fc]);

  useEffect(() => {
    const sync = () => setRecentKeys(getRecentTools());
    window.addEventListener("app:recent-tools-updated", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("app:recent-tools-updated", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);
  useEffect(() => {
    const sync = () => setRecommendedProfile(readWeeklyLearningProfile());
    window.addEventListener("app:weekly-learning-updated", sync);
    return () => window.removeEventListener("app:weekly-learning-updated", sync);
  }, []);
  const [dueCards, setDueCards] = useState<number>(0);
  const [dueGroups, setDueGroups] = useState<DueGroup[]>([]);

  useEffect(() => {
    let active = true;
    totalDueCount().then((n) => { if (active) setDueCards(n); });
    dueBreakdown().then((g) => { if (active) setDueGroups(g); });
    return () => { active = false; };
  }, []);

  // Total missions across all subjects/chapters
  const missionsTotal = (() => {
    let total = 0;
    missionsOrder.forEach((s) => {
      const data = missionsData[s];
      data?.chapters.forEach((c) => { total += c.topics.length; });
    });
    return total;
  })();

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("mission_progress")
        .select("completed")
        .eq("user_id", u.user.id)
        .eq("completed", true);
      setMissionsDone((data ?? []).length);
    })();
  }, []);

  const missionsPct = missionsTotal ? Math.min(100, Math.round((missionsDone / missionsTotal) * 100)) : 0;
  const todoDone = todos.filter((todo) => todo.done).length;
  const todoTotal = todos.length;
  const baghdadToday = getStudyWeek().find((day) => day.isToday)?.key;
  const planTasks = todos.filter((todo) => getTodoDay(todo.day) === baghdadToday);
  const planDone = planTasks.filter((todo) => todo.done).length;
  const nextPlanTask = planTasks.find((todo) => !todo.done);
  const planRatio = planTasks.length ? planDone / planTasks.length : 0;
  const planSegments = Math.max(1, Math.min(5, planTasks.length));
  const heroProgressDone = todoTotal > 0 ? todoDone : missionsDone;
  const heroProgressTotal = todoTotal > 0 ? todoTotal : missionsTotal;
  const heroProgressPct = heroProgressTotal ? Math.min(100, Math.round((heroProgressDone / heroProgressTotal) * 100)) : 0;

  // Today's pending tasks → quick badge
  const [pendingTodos, setPendingTodos] = useState<number>(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("app_todos_v1") || "[]");
      return Array.isArray(arr) ? arr.filter((t: any) => !t.done).length : 0;
    } catch { return 0; }
  });
  useEffect(() => {
    const sync = () => {
      try {
        const arr = JSON.parse(localStorage.getItem("app_todos_v1") || "[]");
        setPendingTodos(Array.isArray(arr) ? arr.filter((t: any) => !t.done).length : 0);
      } catch { setPendingTodos(0); }
    };
    window.addEventListener("app:todos-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("app:todos-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const [username, setUsername] = useState<string>(() => localStorage.getItem("app_display_name_v1") || "");
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [boardRank, setBoardRank] = useState<number | null>(null);
  const [boardTotal, setBoardTotal] = useState<number>(0);
  useEffect(() => {
    let active = true;
    let lastFetch = 0;
    // The rank is computed server-side; never scan the whole points table here.
    const load = async () => {
      if (document.hidden || Date.now() - lastFetch < 30000) return;
      if (typeof supabase.rpc !== "function") return;
      lastFetch = Date.now();
      const { data, error } = await supabase.rpc("get_home_dashboard_stats");
      if (!active || error || !data) return;
      const stats = data as { total_points?: number; board_rank?: number | null; board_total?: number };
      setTotalPoints(stats.total_points ?? 0);
      setBoardRank(stats.board_rank ?? null);
      setBoardTotal(stats.board_total ?? 0);
    };
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    // Cost: points changes are always triggered locally, so we listen to the
    // in-app event instead of keeping a realtime channel open.
    window.addEventListener("app:progress-updated", onFocus);
    window.addEventListener("app:feature-unlocked", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("app:progress-updated", onFocus);
      window.removeEventListener("app:feature-unlocked", onFocus);
    };
  }, []);
  const leaderboardRank = rankFor(totalPoints);
  const currentRank = leaderboardRank.key;
  const rankLabel = leaderboardRank.label[language];
  const rankIndex = RANKS.findIndex((rank) => rank.key === currentRank);
  const nextRank = rankIndex >= 0 ? RANKS[rankIndex + 1] : undefined;
  const pointsToNextRank = nextRank ? Math.max(0, nextRank.min - totalPoints) : 0;
  const stoneFill = nextRank
    ? Math.max(0, Math.min(1, (totalPoints - leaderboardRank.min) / (nextRank.min - leaderboardRank.min)))
    : 1;
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from("profiles").select("display_name").eq("user_id", u.user.id).maybeSingle();
      if (p?.display_name) {
        setUsername(p.display_name);
        localStorage.setItem("app_display_name_v1", p.display_name);
      }
    })();
    const onChange = () => setUsername(localStorage.getItem("app_display_name_v1") || "");
    window.addEventListener("app:username-changed", onChange);
    return () => window.removeEventListener("app:username-changed", onChange);
  }, []);

  const isRTL = language === "ar";
  const quickStudyTitle = isRTL ? "عندي ١٥ دقيقة" : "I have 15 minutes";
  const pointsGuideTitle = isRTL ? "شتسوي بالنقاط ؟" : "What can you do with points?";
  const homeNumber = (value: number) => value.toLocaleString(isRTL ? "ar-IQ" : "en");
  const boardPosition = boardRank == null ? "—" : `#${homeNumber(boardRank)}`;
  const HomeChevron = isRTL ? ChevronLeft : ChevronRight;
  // Onboarding-driven personalization (weak subject / weakest topic)
  const [onboarding, setOnboarding] = useState(() => readOnboarding());
  useEffect(() => {
    const sync = () => setOnboarding(readOnboarding());
    window.addEventListener("app:onboarding-updated", sync);
    return () => window.removeEventListener("app:onboarding-updated", sync);
  }, []);
  const weakTopicLabel = useMemo(() => {
    if (!onboarding?.completed) return "";
    const meta = weakTopicsFor(onboarding.subject).find((c) => c.n === onboarding.weakestTopic);
    return meta ? topicLabel(meta, language === "ar" ? "ar" : "en") : "";
  }, [onboarding, language]);
  const dailyRecommendedProfile = useMemo(() => dailyLearningProfile(recommendedProfile), [recommendedProfile]);
  const recommendationSubject = dailyRecommendedProfile?.subject ?? (onboarding?.completed ? onboarding.subject : "");
  const recommendationTopic = dailyRecommendedProfile
    ? (isRTL ? dailyRecommendedProfile.topicAr : dailyRecommendedProfile.topicEn)
    : weakTopicLabel;
  const navigate = (k: MainMenuChoice) => {
    if (TEMP_LOCKED_TOOLS.has(k)) return;
    if (k === "premium" || (isPremiumTool(k) && !isPremium && !subscriptionLoading)) {
      recordToolUse(k);
      onNav(k);
      return;
    }
    if (isPremiumTool(k) && subscriptionLoading) return;
    setActiveKey(k);
    recordToolUse(k);
    // sync active group
    const grp = NAV_GROUPS.find((g) => g.items.some((it) => it.key === k));
    if (grp) setActiveGroup(grp.titleEn);
    // Featured BasicsChoice keys still flow through onSelect to use the basic back-target
    const basicsKeys = new Set<MainMenuChoice>([
      "flashcards", "malazam", "summaries", "sessions", "biologyDrawings", "biologySketchpad",
      "todo", "news", "ministerialBank", "mindmap",
    ]);
    if (basicsKeys.has(k)) onSelect(k as BasicsChoice);
    else onNav(k);
  };
  const openSubjectPicker = () => {
    resetStudySubjectFocus();
    navigate("subjectsHub");
  };
  const openRecommendedStudy = () => {
    setShowAllTools(false);
    setRecommendedProfile(readWeeklyLearningProfile());
    void totalDueCount().then(setDueCards).catch(() => {});
    void dueMistakesCount().then(setDueMistakes).catch(() => {});
    setShowRecommendedStudy(true);
  };
  const openRecommendedFlashcards = () => {
    try {
      if (dailyRecommendedProfile) {
        sessionStorage.setItem(DAILY_FLASHCARD_TARGET_KEY, JSON.stringify({ ...dailyRecommendedProfile, date: todayKey() }));
        window.dispatchEvent(new CustomEvent("app:open-personalized-practice", {
          detail: { kind: "flashcards", subject: dailyRecommendedProfile.subject, chapterNumber: dailyRecommendedProfile.chapterNumber },
        }));
        return;
      }
      if (dueCards > 0) sessionStorage.removeItem(DAILY_FLASHCARD_TARGET_KEY);
    } catch { /* ignore */ }
    navigate("flashcards");
  };
  const openRecommendedMcqs = () => {
    try {
      if (dailyRecommendedProfile) {
        sessionStorage.setItem(DAILY_MCQ_TARGET_KEY, JSON.stringify({ ...dailyRecommendedProfile, date: todayKey() }));
        window.dispatchEvent(new CustomEvent("app:open-personalized-practice", {
          detail: { kind: "mcq", subject: dailyRecommendedProfile.subject, chapterNumber: dailyRecommendedProfile.chapterNumber },
        }));
        return;
      }
    } catch { /* ignore */ }
    navigate("mcqBank");
  };
  const startTodaysStudy = () => {
    if (dueMistakes > 0) navigate("mistakes");
    else if (dueCards > 0 || dailyRecommendedProfile) openRecommendedFlashcards();
    else openRecommendedMcqs();
  };

  const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Study: Layers,
    Progress: Target,
    Community: Users,
    Play: Swords,
    Ministerial: ScrollText,
    Account: Settings,
  };
  const currentGroup = NAV_GROUPS.find((g) => g.titleEn === activeGroup) ?? NAV_GROUPS[0];

  const sidebarTitle = { en: "Sections", ar: "الأقسام" }[language];
  const recCopy = {
    en: { tag: "Recommended next step", title: motivationalPhrase, body: "Open your flashcards deck and review what you scheduled today.", resume: "Resume studying", view: "View summary", progress: "Progress" },
    ar: { tag: "خطوتك التالية المقترحة", title: motivationalPhrase, body: "افتح بطاقاتك وراجع ما خططت له اليوم.", resume: "استئناف الدراسة", view: "عرض الملخص", progress: "التقدم" },
  }[language];
  const todoCopy = {
    en: {
      tag: "Your To-Do List",
      title: todoTotal > 0
        ? (todoDone === todoTotal ? "All tasks complete — great job!" : `${todoTotal - todoDone} task${todoTotal - todoDone === 1 ? "" : "s"} left to finish`)
        : "Plan your day with a quick To-Do list",
      body: todoTotal > 0
        ? `You've completed ${todoDone} of ${todoTotal} tasks. Keep the momentum going.`
        : "Add tasks, track them, and watch your progress grow.",
      resume: "Generate To-Do",
    },
    ar: {
      tag: "قائمة مهامك",
      title: todoTotal > 0
        ? (todoDone === todoTotal ? "أنجزت كل المهام — أحسنت!" : `تبقّى ${todoTotal - todoDone} من المهام`)
        : "خطّط ليومك بقائمة مهام سريعة",
      body: todoTotal > 0
        ? `أنجزت ${todoDone} من ${todoTotal} مهمة. واصل التقدم.`
        : "أضف المهام وتابع إنجازك خطوة بخطوة.",
      resume: "أنشئ قائمة المهام",
    },
  }[language];
  const activeCopy = todoCopy;
  const toolsHeader = { en: "Study tools", ar: "أدوات الدراسة" }[language];
  const recentTools = recentKeys
    .filter((k) => k !== "liveBattle" && !hiddenStudyTools.has(k) && TOOL_ICONS[k as MainMenuChoice] && (fc as any)[k])
    .slice(0, 4)
    .map((k) => ({ key: k as MainMenuChoice, Icon: TOOL_ICONS[k as MainMenuChoice]! }));
  const displayedTools = recentTools
    .filter((tool) => !FEATURED.some((featured) => featured.key === tool.key))
    .slice(0, 3);


  const displayedToolsHeader = recentTools.length > 0
    ? { en: "Recently used", ar: "المستخدمة مؤخراً" }[language]
    : toolsHeader;
  const viewAll = { en: "View all tools", ar: "عرض كل الأدوات" }[language];

  const SidebarBody = () => (
    <>
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-base font-bold text-primary leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>tamayzak</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{sidebarTitle}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {NAV_GROUPS
          .filter((g) => g.titleEn !== "Subjects")
          .map((g) => ({
            ...g,
            items: g.titleEn === "Study" ? g.items.filter((it) => !hiddenStudyTools.has(it.key)) : g.items,
          }))
          .map((g) => (
          <div key={g.titleEn}>
            <p className={`mb-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${(TOOL_CATEGORY_TINTS[g.titleEn] ?? DEFAULT_TOOL_CATEGORY_TINT).idle}`}>
              {language === "ar" ? g.titleAr : g.titleEn}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = it.Icon;
                const active = activeKey === it.key;
                const tint = HOME_TOOL_TINTS[it.key] ?? DEFAULT_HOME_TINT;
                return (
                  <li key={it.key}>
                    <button
                      onClick={() => navigate(it.key)}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex w-full items-center gap-3 overflow-hidden border px-3 py-2.5 text-sm font-bold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "ring-2 ring-primary/30" : "opacity-90 hover:opacity-100"} ${tint.card}`}
                      style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
                    >
                      <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-110 ${tint.icon}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-start">{language === "ar" ? it.labelAr : it.labelEn}</span>
                      <ArrowRight className={`h-3.5 w-3.5 shrink-0 opacity-50 transition-transform group-hover:opacity-100 ${isRTL ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <button
          onClick={() => onNav("account")}
          className="group inline-flex min-h-11 w-full items-center justify-center gap-2 border border-slate-400/40 bg-gradient-to-r from-slate-500/15 to-zinc-500/10 px-3 text-xs font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:text-slate-200"
          style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
        >
          <UserCog className="h-4 w-4" />
          {language === "ar" ? "إعدادات الحساب" : "Account settings"}
        </button>
      </div>
    </>
  );

  const [dueMistakes, setDueMistakes] = useState(0);
  const [unseenNotes, setUnseenNotes] = useState(0);
  useEffect(() => {
    let alive = true;
    dueMistakesCount().then((n) => { if (alive) setDueMistakes(n); }).catch(() => {});
    unseenAdminNotesCount().then((n) => { if (alive) setUnseenNotes(n); }).catch(() => {});
    return () => { alive = false; };
  }, []);



  if (detailScreen) {
    const detailTitles = {
      plan: isRTL ? "خطة اليوم" : "Today's plan",
      progress: isRTL ? "تقدمي ورتبتي" : "My progress and rank",
      streak: isRTL ? "استمراريتي بالدراسة" : "My study streak",
      points: pointsGuideTitle,
      quickStudy: quickStudyTitle,
    };
    return (
      <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 py-6 pb-32 text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className={detailScreen === "quickStudy" ? "mx-auto max-w-2xl" : "mx-auto max-w-4xl"}>
          <button type="button" onClick={() => setDetailScreen(null)}
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            {isRTL ? "العودة للرئيسية" : "Back to home"}
          </button>
          <header className="mb-6">
            {detailScreen !== "points" && detailScreen !== "quickStudy" && <p className="mb-2 text-sm text-primary">{isRTL ? "رحلتك مع تميزك" : "Your Tamayzak journey"}</p>}
            <h1 id="study-detail-title" tabIndex={-1} className="text-2xl font-bold leading-relaxed outline-none sm:text-3xl">
              {detailTitles[detailScreen]}
            </h1>
          </header>
          {detailScreen === "quickStudy" ? (
            <QuickStudy language={language} userId={userId} profile={dailyRecommendedProfile}
              plannedTexts={planTasks.filter(task => !task.done).map(task => task.text)} onBack={() => setDetailScreen(null)} />
          ) : detailScreen === "progress" ? (
            <>
            <section aria-label={isRTL ? "تفاصيل الرتبة" : "Rank details"} className="rounded-3xl border border-primary/25 bg-primary/5 p-4 sm:p-6">
                          <div className="pt-4">
            <div className="flex flex-wrap items-center gap-5 sm:gap-7">
              <RankStone
                rank={currentRank}
                size={104}
                fillProgress={stoneFill}
                glow={currentRank === "royal" || currentRank === "diamond"}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.22em] text-ash mb-1">
                  {language === "ar" ? "رتبتك" : "Your rank"}
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  {rankLabel}
                  {username && (
                    <span className="text-ash font-normal text-base sm:text-lg ms-2">· {username}</span>
                  )}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nextRank
                    ? (language === "ar"
                      ? `${pointsToNextRank} نقطة حتى رتبة ${nextRank.label.ar}`
                      : `${pointsToNextRank} points to ${nextRank.label.en}`)
                    : (language === "ar" ? "وصلت إلى أعلى رتبة" : "Highest rank achieved")}
                </p>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-2xl border border-border bg-background px-3 py-2.5">
                    <p className="font-mono text-ember text-xl font-semibold tabular-nums leading-none">{streakDays ?? "—"}</p>
                    <p className="mt-1 text-[11px] text-ash">
                      {language === "ar" ? (streakDays === 1 ? "يوم متواصل" : "أيام متواصلة") : `day${streakDays === 1 ? "" : "s"} in a row`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNav("unlocks")}
                    className="text-start rounded-2xl border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <p className="font-mono text-foreground text-xl font-semibold tabular-nums leading-none">{totalPoints}</p>
                    <p className="mt-1 text-[11px] text-ash">
                      {language === "ar" ? "نقطة · افتح الأدوات" : "points · unlock tools"}
                    </p>
                  </button>
                  <div className="col-span-2 sm:col-span-1 rounded-2xl border border-primary/40 bg-primary/5 px-3 py-2.5">
                    <p className="font-mono text-primary text-xl font-semibold tabular-nums leading-none">
                      {boardRank ? `#${boardRank}` : "—"}
                    </p>
                    <p className="mt-1 text-[11px] text-ash">
                      {language === "ar"
                        ? `ترتيبك بين ${boardTotal} طالب عراقي`
                        : `your place among ${boardTotal} Iraqi students`}
                    </p>
                  </div>
                </div>
              </div>
              <GiftMcqButton language={language} />
            </div>
            <div className="mt-5" aria-label={isRTL ? "سماء المثابرة" : "Streak sky"}>
              <StreakTree language={language} compact />
            </div>
            </div>

            </section>
            <ChapterProgressCircles language={language} onPracticeTopic={onPracticeTopic} />
            </>
          ) : detailScreen === "streak" ? (
            <section aria-label={isRTL ? "شجرة الاستمرارية" : "Study streak tree"} className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-4 text-slate-950 shadow-[0_24px_70px_-36px_rgba(5,150,105,0.65)] sm:p-7">
              <p className="mb-4 text-lg font-bold">{streakDays ?? "—"} {isRTL ? "أيام متواصلة" : "days in a row"}</p>
              <StreakTree language={language} />
            </section>
          ) : detailScreen === "plan" ? (
            <section className="mb-0">
            <div className="rounded-[2rem] border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-indigo-50 p-4 text-slate-950 shadow-[0_24px_70px_-36px_rgba(37,99,235,0.65)] sm:p-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-950 leading-tight">
                    {language === "ar" ? "خطة اليوم" : "Today's plan"}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {language === "ar" ? "ابدأ من هنا — خطوة واحدة في كل مرة." : "Start here — one step at a time."}
                  </p>
                </div>
                <div className="ms-auto flex items-center gap-3 shrink-0">
                  <div className="relative w-14 h-14">
                    <svg viewBox="0 0 100 100" className="w-14 h-14 -rotate-90">
                      <circle cx="50" cy="50" r="45" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                      <motion.circle
                        cx="50" cy="50" r="45"
                        stroke="hsl(var(--primary))"
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 45}
                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - heroProgressPct / 100) }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-slate-950">
                      {heroProgressPct}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Step 1 — tasks */}
                <button
                  onClick={() => navigate("todo")}
                  className={`w-full ${isRTL ? "text-right" : "text-start"} group rounded-3xl border border-sky-200 bg-white/85 p-4 flex items-center gap-3 shadow-sm hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md transition-all`}
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ListChecks className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-950 truncate">
                      {todoTotal > 0
                        ? (language === "ar" ? `${Math.max(0, todoTotal - todoDone)} مهمة متبقية اليوم` : `${Math.max(0, todoTotal - todoDone)} task${todoTotal - todoDone === 1 ? "" : "s"} left today`)
                        : (language === "ar" ? "أضف مهام اليوم" : "Add today's tasks")}
                    </span>
                    <span className="block text-[11px] text-slate-600 truncate">
                      {language === "ar" ? "قائمة المهام" : "To-do list"}
                    </span>
                  </span>
                  <span className="shrink-0 text-primary">
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </span>
                </button>

                {/* Step 2 — flashcards due */}
                <button
                  onClick={() => {
                    try {
                      if (onboarding?.completed) localStorage.setItem("app_subject_v1", onboarding.subject);
                    } catch { /* ignore */ }
                    if (onboarding?.completed) {
                      window.dispatchEvent(new CustomEvent("app:set-subject", { detail: { subject: onboarding.subject } }));
                    }
                    navigate("flashcards");
                  }}
                  className={`w-full ${isRTL ? "text-right" : "text-start"} group rounded-3xl border border-indigo-200 bg-white/85 p-4 flex items-center gap-3 shadow-sm hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md transition-all`}
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-950 truncate">
                      {dueCards > 0
                        ? (language === "ar" ? `راجع ${dueCards} بطاقة مستحقة` : `Review ${dueCards} card${dueCards === 1 ? "" : "s"} due`)
                        : (language === "ar" ? "ادرس بالبطاقات التعليمية" : "Study with flashcards")}
                    </span>
                    <span className="block text-[11px] text-slate-600 truncate">
                      {onboarding?.completed
                        ? `${subjectLabel(onboarding.subject, language)}${weakTopicLabel ? ` · ${weakTopicLabel}` : ""}`
                        : (language === "ar" ? "مراجعة متباعدة" : "Spaced repetition")}
                    </span>
                  </span>
                  <span className="shrink-0 text-primary">
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </span>
                </button>

                {/* Step 3 — progress report */}
                <button
                  onClick={() => onNav("report")}
                  className={`w-full ${isRTL ? "text-right" : "text-start"} group rounded-3xl border border-violet-200 bg-white/85 p-4 flex items-center gap-3 shadow-sm hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-md transition-all`}
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-950 truncate">
                      {language === "ar" ? "شاهد تقدمك اليوم" : "See today's progress"}
                    </span>
                    <span className="block text-[11px] text-slate-600 truncate">
                      {language === "ar" ? `${heroProgressDone} منجزة · ${pendingTodos} متبقية` : `${heroProgressDone} done · ${pendingTodos} left`}
                    </span>
                  </span>
                  <span className="shrink-0 text-primary">
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </span>
                </button>
              </div>

              <div className="mt-3 text-center">
                <VisitCounter inline />
              </div>
            </div>
          </section>
          ) : (
            <PointsGuideCards language={language} rank={boardRank}
              onOpenPremium={() => navigate("premium")} onOpenLeaderboard={() => navigate("leaderboard")} />
          )}
        </div>
      </main>
    );
  }

  if (showRecommendedStudy) {
    return (
      <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 py-6 pb-32 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', 'Cairo', sans-serif" }}>
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => setShowRecommendedStudy(false)}
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-bold shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            {isRTL ? "العودة للرئيسية" : "Back to home"}
          </button>

          <header className="relative mb-5 overflow-hidden rounded-[2rem] border border-blue-400/25 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-6 text-white shadow-[0_24px_60px_-32px_rgba(37,99,235,0.9)] sm:p-8">
            <span aria-hidden="true" className="absolute -end-16 -top-20 h-52 w-52 rounded-full border-[30px] border-white/10" />
            <div className="relative max-w-2xl">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                {isRTL ? "خطة اليوم" : "Today's plan"}
              </span>
              <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
                {isRTL ? "ادرس اليوم" : "Study today"}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                {recommendationTopic
                  ? (isRTL ? `ابدأ بالمراجعة المستحقة، وبعدين تدرب على ${recommendationTopic}.` : `Start with due reviews, then practise ${recommendationTopic}.`)
                  : (isRTL ? "راجع أخطاءك وبطاقاتك المستحقة، وبعدين حل أسئلة جديدة." : "Review due mistakes and flashcards, then try new questions.")}
              </p>
              {recommendationSubject && (
                <span className="mt-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">
                  {subjectLabel(recommendationSubject, language)}
                  {dailyRecommendedProfile ? ` · ${isRTL ? "الفصل" : "Chapter"} ${dailyRecommendedProfile.chapterNumber}` : ""}
                </span>
              )}
            </div>
          </header>

          <button
            type="button"
            onClick={startTodaysStudy}
            className="mb-5 flex w-full min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-black text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowRight className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
            {isRTL ? "ابدأ دراسة اليوم" : "Start today's study"}
          </button>

          <section aria-label={isRTL ? "خطة دراسة اليوم" : "Today's study plan"} className="grid gap-4 sm:grid-cols-3">
            <motion.button
              type="button"
              aria-label={isRTL ? "راجع أخطاءك" : "Review mistakes"}
              onClick={() => navigate("mistakes")}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative min-h-52 overflow-hidden rounded-[1.75rem] border border-amber-400/35 bg-gradient-to-br from-amber-500/20 via-card to-orange-500/10 p-6 text-start shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500 text-slate-950"><AlertTriangle className="h-7 w-7" /></span>
              <span className="mt-6 block text-xl font-black">{isRTL ? "١ · راجع أخطاءك" : "1 · Review mistakes"}</span>
              <span className="mt-2 block pe-12 text-sm leading-6 text-muted-foreground">
                {dueMistakes > 0
                  ? (isRTL ? `${dueMistakes} أسئلة مستحقة للمراجعة` : `${dueMistakes} questions due for review`)
                  : (isRTL ? "ما عندك أخطاء مستحقة اليوم" : "No mistakes due today")}
              </span>
              <span className="absolute bottom-6 end-6 grid h-10 w-10 place-items-center rounded-full bg-amber-500 text-slate-950 transition-transform group-hover:scale-110"><ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} /></span>
            </motion.button>
            <motion.button
              type="button"
              aria-label={isRTL ? "البطاقات المقترحة" : "Recommended flashcards"}
              onClick={openRecommendedFlashcards}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative min-h-52 overflow-hidden rounded-[1.75rem] border border-sky-400/35 bg-gradient-to-br from-sky-500/20 via-card to-blue-500/10 p-6 text-start shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                <BookOpen className="h-7 w-7" />
              </span>
              <span className="mt-6 block text-xl font-black">{isRTL ? "٢ · راجع بطاقاتك" : "2 · Review flashcards"}</span>
              <span className="mt-2 block pe-12 text-sm leading-6 text-muted-foreground">
                {dueCards > 0
                  ? (isRTL ? `${dueCards} بطاقة مستحقة للمراجعة` : `${dueCards} flashcards due for review`)
                  : recommendedProfile
                    ? (isRTL ? "10 بطاقات مختارة من موضوع ضعفك" : "10 cards selected from your weak topic")
                    : (isRTL ? "ارجع لآخر بطاقات درستها" : "Return to your latest flashcards")}
              </span>
              <span className="absolute bottom-6 end-6 grid h-10 w-10 place-items-center rounded-full bg-sky-500 text-white transition-transform group-hover:scale-110">
                <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              </span>
            </motion.button>

            <motion.button
              type="button"
              aria-label={isRTL ? "أسئلة MCQ المقترحة" : "Recommended MCQs"}
              onClick={openRecommendedMcqs}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative min-h-52 overflow-hidden rounded-[1.75rem] border border-violet-400/35 bg-gradient-to-br from-violet-500/20 via-card to-fuchsia-500/10 p-6 text-start shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
                <ListChecks className="h-7 w-7" />
              </span>
              <span className="mt-6 block text-xl font-black">{isRTL ? "٣ · حل أسئلة" : "3 · Practise questions"}</span>
              <span className="mt-2 block pe-12 text-sm leading-6 text-muted-foreground">
                {recommendedProfile
                  ? (isRTL ? "10 أسئلة مختارة من نفس الفصل والموضوع" : "10 questions selected from the same chapter and topic")
                  : (isRTL ? "أسئلة من بنك الـ MCQ تناسب مراجعتك" : "Questions from the MCQ bank matched to your review")}
              </span>
              <span className="absolute bottom-6 end-6 grid h-10 w-10 place-items-center rounded-full bg-violet-600 text-white transition-transform group-hover:scale-110">
                <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              </span>
            </motion.button>
          </section>

          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5 text-primary" />
            {recommendedProfile
              ? (isRTL ? "الأسئلة الجديدة من خطة الضعف الأسبوعية" : "New questions follow your weekly weakness plan")
              : (isRTL ? "حدّث خطة الدراسة حتى تحصل على أسئلة أدق" : "Update your study plan for more precise questions")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="tmz-home min-h-screen w-full text-[var(--tmz-ink)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top utility bar */}
      <div className={`sticky top-0 z-40 border-b border-[var(--tmz-line)] ${showAllTools ? "bg-[var(--tmz-canvas)]" : "bg-card/90 backdrop-blur"}`}>
        <div className={`mx-auto flex max-w-6xl items-center sm:px-6 lg:px-8 ${showAllTools ? "h-14 justify-between px-4" : "h-16 gap-1 px-2 sm:gap-3"}`}>
          {showAllTools ? <div className="flex items-center gap-2">
            <img src="/app-icon-192.png" alt="" className="h-8 w-8 rounded-xl" />
            <p className="text-sm font-semibold leading-tight text-[var(--tmz-ink)]">{language === "ar" ? "تميّزك" : "Tamayzak"}</p>
            <button
              onClick={() => onNav("report")}
              aria-label={language === "ar" ? "خطتي اليوم" : "Today's plan"}
              title={language === "ar" ? "خطتك اليوم — اضغط لعرض الخطة" : "Today's plan — tap to open"}
              className="relative ms-2 inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--tmz-line)] bg-[var(--tmz-surface)] px-2.5 text-xs font-medium text-[var(--tmz-ink)] transition-colors hover:bg-[var(--tmz-panel)]"
            >
              <Target className="h-3.5 w-3.5" />
              <span>{language === "ar" ? "خطة اليوم" : "Today's plan"}</span>
              {pendingTodos > 0 && <span className="tabular-nums text-[var(--tmz-muted)]">{pendingTodos}</span>}
            </button>
          </div> : <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
            <img src="/app-icon-192.png" alt="" className="size-8 shrink-0 rounded-full border border-border/70 bg-card sm:size-10" />
            <div className="flex min-w-0 items-center gap-0.5 sm:gap-1.5">
              <h1 className="home-rank-name min-w-0 truncate text-base font-black leading-tight sm:text-xl" dir="auto"
                title={username || undefined} style={{ "--home-rank-tone": HOME_RANK_NAME_COLOR[currentRank] } as CSSProperties}>
                {username || (isRTL ? "طالب تميّزك" : "Tamayzak student")}
              </h1>
              <button
                type="button"
                onClick={() => navigate("leaderboard")}
                className="grid size-6 shrink-0 place-items-center rounded-full hover:bg-accent"
                title={rankLabel}
                aria-label={isRTL ? `افتح ترتيب الطلاب، رتبتك ${rankLabel}` : `Open leaderboard, ${rankLabel} rank`}
              >
                <RankStone rank={currentRank} size={19} fillProgress={stoneFill} glow={currentRank === "diamond" || currentRank === "royal"} />
              </button>
            </div>
            <button
              type="button"
              id="progress-details-trigger"
              onClick={() => openDetail("progress")}
              className="inline-flex h-8 !min-h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-cyan-300/55 bg-cyan-100/85 px-1.5 text-xs font-extrabold tabular-nums text-sky-950 hover:bg-cyan-100 dark:border-cyan-600/40 dark:bg-cyan-950 dark:text-cyan-100 dark:hover:bg-cyan-900 sm:px-3"
              aria-label={isRTL ? `عرض تقدّمك، ${homeNumber(totalPoints)} نقطة` : `View study progress, ${homeNumber(totalPoints)} points`}
            >
              <bdi>{homeNumber(totalPoints)}</bdi>{isRTL ? "نقطة" : "pts"}
            </button>
            <button
              type="button"
              onClick={() => navigate("leaderboard")}
              aria-label={isRTL ? `مركزك بالترتيب ${boardPosition}` : `Leaderboard position ${boardPosition}`}
              className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-muted/75 px-1.5 text-xs font-extrabold tabular-nums text-foreground transition-colors hover:bg-accent sm:px-3"
            >
              <bdi dir="ltr">{boardPosition}</bdi>
              <span className="hidden min-[380px]:inline">{isRTL ? "ترتيبي" : "Rank"}</span>
            </button>
          </div>}
          <button
            onClick={() => window.dispatchEvent(new Event("app:open-search"))}
            aria-label={language === "ar" ? "بحث" : "Search"}
            className={`inline-flex h-9 items-center gap-2 border border-[var(--tmz-line)] text-xs text-[var(--tmz-muted)] transition-colors hover:text-[var(--tmz-ink)] sm:min-w-[16rem] sm:px-3 ${showAllTools ? "min-w-[9rem] rounded-xl bg-[var(--tmz-surface)] px-3" : "w-8 shrink-0 justify-center rounded-full bg-muted/50 sm:w-auto"}`}
          >
            <Search className="h-3.5 w-3.5 text-[var(--tmz-muted)]" />
            <span className={`flex-1 text-start truncate ${showAllTools ? "" : "hidden sm:inline"}`}>
              {language === "ar" ? "ابحث عن أداة..." : "Search tools..."}
            </span>
            <kbd className="hidden sm:inline-block text-[10px] text-muted-foreground/70 border border-border rounded px-1">⌘K</kbd>
          </button>
          <button
            onClick={() => onNav("account")}
            aria-label={language === "ar" ? "الإعدادات" : "Settings"}
            title={language === "ar" ? "الإعدادات" : "Settings"}
            className={`inline-flex h-9 items-center justify-center border border-[var(--tmz-line)] text-[var(--tmz-muted)] transition-colors hover:text-[var(--tmz-ink)] ${showAllTools ? "ms-2 w-9 rounded-xl bg-[var(--tmz-surface)]" : "w-8 shrink-0 rounded-full bg-muted/50 sm:w-9"}`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className={`pb-48 sm:px-6 sm:py-8 lg:px-8 lg:py-10 ${showAllTools ? "px-4 py-6" : "px-3 pt-4"}`}>
        <AnimatePresence mode="wait">
        {showAllTools ? (
          <div
            key="all-tools-screen"
            className="mx-auto max-w-6xl"
          >
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => { setShowAllTools(false); onNav("basics"); }}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--tmz-line)] bg-[var(--tmz-surface)] px-4 py-2 text-sm font-medium text-[var(--tmz-ink)] transition-colors hover:bg-[var(--tmz-panel)]"
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                {language === "ar" ? "رجوع" : "Back"}
              </button>
              <p className="text-xs font-medium text-[var(--tmz-muted)]">{availableStudyTools.length} {language === "ar" ? "أداة" : "tools"}</p>
            </div>
            <header className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {language === "ar" ? "كل أدوات الدراسة" : "All study tools"}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                {language === "ar" ? "كل ما تحتاجه للدراسة في مكان واحد." : "Everything you need to study, in one place."}
              </p>
              <button type="button" onClick={openRecommendedStudy}
                className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">
                <Sparkles aria-hidden="true" className="size-4" />
                {isRTL ? "افتح توصيات الدراسة" : "Open study recommendations"}
              </button>
            </header>
            <div className="mb-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">{isRTL ? "شنو تريد تدرس؟" : "Find a study tool"}</span>
                <input value={toolQuery} onChange={(event) => setToolQuery(event.target.value)}
                  type="search" placeholder={isRTL ? "ابحث بالاسم أو الاستخدام…" : "Search by name or purpose…"}
                  className="w-full rounded-2xl border border-[var(--tmz-line)] bg-[var(--tmz-surface)] px-4 py-3 text-[var(--tmz-ink)] placeholder:text-[var(--tmz-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tmz-blue)]" />
              </label>
              <div className="flex flex-wrap gap-2" aria-label={isRTL ? "تصنيفات الأدوات" : "Tool categories"}>
                {(["All", "Review", "Test", "Organize"] as const).map((category) => {
                  const active = toolCategory === category;
                  const tint = TOOL_CATEGORY_TINTS[category] ?? DEFAULT_TOOL_CATEGORY_TINT;
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setToolCategory(category)}
                      className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active ? tint.active : tint.idle}`}
                    >
                      {TOOL_CATEGORY_LABELS[language][category]}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="mb-4 text-sm text-[var(--tmz-muted)]" role="status" aria-live="polite">
              {isRTL ? `${filteredStudyTools.length} أداة تطابق اختيارك` : `${filteredStudyTools.length} tools match your selection`}
            </p>
            {filteredStudyTools.length === 0 && (
              <div className="rounded-2xl border border-[var(--tmz-line)] bg-[var(--tmz-surface)] p-8 text-center">
                <p className="text-sm">{isRTL ? "ما لقينا أداة بهذا البحث. جرّب كلمة ثانية أو اعرض الكل." : "No tools match. Try another word or show all tools."}</p>
                <button type="button" onClick={() => { setToolQuery(""); setToolCategory("All"); }} className="mt-4 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                  {isRTL ? "عرض كل الأدوات" : "Show all tools"}
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudyTools.map((it) => {
                const Icon = it.Icon;
                const meta = (fc as any)[it.key];
                const tint = HOME_TOOL_TINTS[it.key] ?? DEFAULT_HOME_TINT;
                const isLocked = TEMP_LOCKED_TOOLS.has(it.key);
                const premiumLocked = isPremiumTool(it.key) && !isPremium;
                const displayLocked = isLocked || premiumLocked;
                return (
                  <button
                    key={it.key}
                    disabled={isLocked || (isPremiumTool(it.key) && subscriptionLoading)}
                    onClick={() => { setShowAllTools(false); navigate(it.key); }}
                    className={`group relative flex min-h-[112px] items-start gap-3 overflow-hidden rounded-2xl border p-4 text-start text-[var(--tmz-ink)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tmz-blue)] ${tint.card} ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-sm transition-transform group-hover:scale-105 ${tint.icon}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="min-w-0 flex-1 pe-5">
                      <span className="block text-sm font-semibold leading-6">{meta?.title ?? (language === "ar" ? it.labelAr : it.labelEn)}</span>
                      {meta?.subtitle && <span className="mt-1 block line-clamp-2 text-sm leading-5 text-[var(--tmz-muted)]">{meta.subtitle}</span>}
                      <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--tmz-muted)]">
                        {isPremiumTool(it.key) && <span className="inline-flex items-center gap-1 rounded-full border border-[var(--tmz-line)] px-2 py-1"><Crown className="h-3 w-3" aria-hidden="true" />{isRTL ? "مميّز" : "Premium"}</span>}
                        {isLocked ? (language === "ar" ? "مغلق مؤقتاً" : "Temporarily locked") : premiumLocked ? (language === "ar" ? "افتح البريميوم" : "Unlock Premium") : (language === "ar" ? "افتح الأداة" : "Open tool")}
                      </span>
                    </span>
                    <span className="absolute end-4 top-4 rounded-full bg-background/70 p-1.5 text-[var(--tmz-muted)] shadow-sm backdrop-blur-sm" aria-hidden="true">
                      {displayLocked ? <Lock className="h-4 w-4" /> : <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
        <motion.div
          key="dashboard"
          className="relative text-foreground"
          style={{ fontFamily: "'Cairo', 'Plus Jakarta Sans', sans-serif" }}
        >
        <div className="mx-auto max-w-6xl">
          <section data-home-tone="schedule" aria-labelledby="home-plan-title" className="home-surface-card mb-4 min-w-0 rounded-[1.4rem] border p-3.5 shadow-sm sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className={HOME_ICON_TILE}><CalendarCheck aria-hidden="true" className="size-5" /></span>
              <div className="min-w-0">
                <h2 id="home-plan-title" className="text-lg font-black leading-snug sm:text-2xl">{isRTL ? "خطة اليوم" : "Today's plan"}</h2>
                <p className="home-card-muted text-xs font-semibold sm:text-sm">
                  {isRTL ? `${homeNumber(planDone)} من ${homeNumber(planTasks.length)} مهام منجزة` : `${planDone} of ${planTasks.length} tasks completed`}
                </p>
              </div>
            </div>
            <div role="progressbar" aria-labelledby="home-plan-title" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(planRatio * 100)}
              className="my-3.5 flex gap-1.5 sm:my-4">
              {Array.from({ length: planSegments }, (_, index) => (
                <span key={index} className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/40">
                  <span className="h-full rounded-full bg-[color:var(--home-card-meter)]" style={{ width: `${Math.max(0, Math.min(1, planRatio * planSegments - index)) * 100}%` }} />
                </span>
              ))}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 border-t border-[color:var(--home-card-edge)] pt-3 sm:gap-4">
              {nextPlanTask ? <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <span className={`${HOME_ICON_TILE} hidden min-[380px]:grid`}><ListChecks aria-hidden="true" className="size-4" /></span>
                <div className="min-w-0">
                  <p className="home-card-muted text-[11px] font-semibold sm:text-xs">{isRTL ? "المهمة التالية" : "Next task"}</p>
                  <p dir="auto" title={nextPlanTask.text} className="line-clamp-2 break-words text-start text-sm font-extrabold leading-snug">{nextPlanTask.text}</p>
                </div>
              </div> : <p className="home-card-muted text-xs font-semibold sm:text-sm">{planTasks.length
                ? (isRTL ? "أنجزت كل مهام اليوم." : "All of today's tasks are complete.")
                : (isRTL ? "ماكو مهام مجدولة لليوم." : "No tasks scheduled for today.")}</p>}
              <button type="button" onClick={() => navigate("todo")}
                className="home-card-action inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-start text-xs font-black hover:brightness-105 sm:px-4 sm:text-sm">
                <CalendarDays aria-hidden="true" className="size-4 shrink-0" />{isRTL ? "افتح جدولي" : "Open my schedule"}
              </button>
            </div>
          </section>

          <div className="mb-4"><HomeDailyReport language={language} userId={userId} authLoading={subscriptionLoading} onOpen={() => navigate("report")} /></div>

          <HomeHighlights
            language={language}
            pointsGuideTitle={pointsGuideTitle}
            onOpenPointsGuide={() => openDetail("points")}
            quickStudyTitle={quickStudyTitle}
            onOpenQuickStudy={() => openDetail("quickStudy")}
            onOpenChallenge={() => {
              try { sessionStorage.setItem("tmz:sessions-entry", "challenge"); } catch { /* ignore */ }
              navigate("sessions");
            }}
          />

          <section aria-label={isRTL ? "الخطوات الرئيسية" : "Main study actions"} className="grid gap-2.5 sm:gap-3">
            <div data-home-tone="continue" className="home-illustrated-card relative overflow-hidden rounded-[1.4rem] border transition-colors">
              <div className="relative">
                <button
                  type="button"
                  aria-label={isRTL ? "كمّل دراستك" : "Continue studying"}
                  onClick={openSubjectPicker}
                  className="group grid min-h-[6.75rem] w-full grid-cols-[minmax(0,1fr)_35%] items-center gap-2 rounded-[1.4rem] py-2 pe-14 ps-3 text-start focus-visible:!outline-offset-[-3px] sm:min-h-32 sm:grid-cols-[minmax(0,1fr)_28%] sm:gap-4 sm:pe-20 sm:ps-5"
                >
                  <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <span className="home-card-tile hidden size-8 shrink-0 place-items-center rounded-full border min-[380px]:grid"><HomeChevron aria-hidden="true" className="size-5" /></span>
                    <span className="min-w-0">
                      <span className="block text-[clamp(1rem,5.1vw,1.625rem)] font-black leading-snug tracking-tight">{isRTL ? "كمّل دراستك" : "Continue studying"}</span>
                      <span className="home-card-muted mt-1 block text-xs leading-relaxed sm:text-sm">{isRTL ? "اختار مادة وابدأ بالأدوات اللي تحتاجها" : "Choose a subject and open its study tools"}</span>
                    </span>
                  </span>
                  <img src={studyBookArt} alt="" width={384} height={192} className="mx-auto max-h-24 w-full max-w-44 object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.42)] motion-safe:transition-transform motion-safe:group-hover:scale-105" />
                </button>
                <div className="absolute end-2 top-1/2 -translate-y-1/2 sm:end-5 [&>button]:rounded-full [&>button]:border-[color:var(--home-card-edge)] [&>button]:bg-[color:var(--home-card-tile-bg)] [&>button]:bg-none [&>button]:text-inherit [&>button]:shadow-none [&>button>span]:hidden"><GiftMcqButton language={language} compact /></div>
              </div>
              <div className="mx-2.5 mb-2.5 sm:mx-4 sm:mb-4">
                <button
                  type="button"
                  onClick={openMutamayizStudyGuide}
                  aria-labelledby="home-mutamayiz-action"
                  aria-describedby="home-mutamayiz-title"
                  className="flex min-h-12 w-full min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 text-start text-card-foreground transition-colors hover:bg-accent sm:min-h-14 sm:gap-3 sm:px-3"
                >
                  <MutamayizMascot className="size-8 sm:size-10" />
                  <span id="home-mutamayiz-title" className="min-w-0 flex-1 text-xs font-bold leading-snug sm:text-sm">
                    {isRTL ? "محتار منين تبدي؟" : "Not sure where to start?"}
                  </span>
                  <span id="home-mutamayiz-action" className="shrink-0 text-xs font-extrabold text-primary sm:text-sm">
                    {isRTL ? "اسأل متميّز" : "Ask متميّز"}
                  </span>
                  <HomeChevron aria-hidden="true" className="size-4 shrink-0 text-primary" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
              {[
                { key: "malazam", Icon: Layers, title: isRTL ? "بنك الملازم" : "Al Malazam", copy: isRTL ? "اقرأ واحفظ ملفات PDF" : "Read and save PDF booklets", action: () => navigate("malazam") },
                { key: "subjectsHub", Icon: FlaskConical, title: isRTL ? "اختَر مادة" : "Choose a subject", copy: isRTL ? "الفصول وأدوات المادة" : "Chapters and subject tools", action: openSubjectPicker },
                { key: "mistakes", Icon: RefreshCw, title: isRTL ? "راجع أخطاءك" : "Review mistakes", copy: dueMistakes > 0 ? (isRTL ? `${homeNumber(dueMistakes)} عناصر مستحقة` : `${dueMistakes} items due`) : (isRTL ? "الأخطاء والبطاقات المستحقة" : "Mistakes and due flashcards"), action: () => onNav("mistakes") },
                { key: "more", Icon: Grid2X2, title: isRTL ? "كل الأدوات" : "All tools", copy: isRTL ? "ابحث حسب هدفك" : "Find tools by your goal", action: () => setShowAllTools(true) },
              ].map(({ key, Icon, title, copy, action }) => (
                <button key={key} data-home-tone={key} type="button" aria-label={title} onClick={action} className="home-surface-card flex min-h-[3.6rem] min-w-0 items-center gap-2 rounded-2xl border px-2.5 py-2 text-start shadow-sm transition-colors sm:min-h-16 sm:gap-3 sm:px-3">
                  <span className={HOME_ICON_TILE}><Icon aria-hidden="true" className="size-[1.1rem]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black leading-snug sm:text-base">{title}</span>
                    <span className={`home-card-muted mt-0.5 text-[11px] sm:text-xs ${key === "mistakes" && dueMistakes > 0 ? "block" : "hidden lg:block"}`}>{copy}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <ChapterProgressCircles language={language} onPracticeTopic={onPracticeTopic} />
          <section className="mt-6 grid grid-cols-3 divide-x divide-x-reverse divide-[var(--tmz-line)] rounded-2xl border border-[var(--tmz-line)] bg-[var(--tmz-surface)] p-3 sm:p-4" aria-label={isRTL ? "ملخص التقدم" : "Progress summary"}>
            <div className="px-2 text-center">
              <p className="text-xl font-normal tabular-nums text-[var(--tmz-ink)] sm:text-2xl">{streakDays ?? "—"}</p>
              <p className="mt-1 text-xs text-[var(--tmz-muted)]">{isRTL ? "أيام متواصلة" : "day streak"}</p>
            </div>
            <div className="px-2 text-center">
              <p className="text-xl font-normal tabular-nums text-[var(--tmz-ink)] sm:text-2xl">{totalPoints}</p>
              <p className="mt-1 text-xs text-[var(--tmz-muted)]">{isRTL ? "نقطة" : "points"}</p>
            </div>
            <div className="px-2 text-center">
              <p className="text-xl font-normal tabular-nums text-[var(--tmz-ink)] sm:text-2xl">{pendingTodos}</p>
              <p className="mt-1 text-xs text-[var(--tmz-muted)]">{isRTL ? "مهام اليوم" : "tasks today"}</p>
            </div>
          </section>

          <div aria-label={isRTL ? "سماء المثابرة" : "Streak sky"}>
            <StreakTree language={language} daysOverride={streakDays ?? 0} />
          </div>
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </main>

    </div>
  );
};

export default Basics;
