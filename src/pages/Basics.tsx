import { useEffect, useMemo, useRef, useState } from "react";
import { trackStreakUpdated } from "@/lib/analytics";
import { readOnboarding, weakTopicsFor, topicLabel } from "@/lib/onboarding";
import {
  ArrowRight, ArrowLeft, Layers, AlertTriangle, BookMarked, FileText, GraduationCap, Microscope,
  X, ListChecks, Newspaper, Timer, ScrollText, Network, Search,
  Globe, Trophy, Target, HelpCircle, Headphones, Podcast, Lightbulb, Sparkles,
  Crown, UserCog, BookOpen, Heart, Users, Settings, Moon, PenLine, MousePointerClick, NotebookPen, Youtube, FlaskConical, Swords, Video, Palette, Lock,
} from "lucide-react";
import { dueMistakesCount } from "@/lib/mistakes";
import { unseenAdminNotesCount } from "@/lib/unseenAdminNotes";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";
import type { MainMenuChoice } from "@/pages/MainMenu";
import { useSubscription } from "@/hooks/useSubscription";
import { missionsData, missionsOrder } from "@/data/missions";
import VisitCounter from "@/components/VisitCounter";
import { useTodos } from "@/lib/todoTopicProgress";
import StreakTree from "@/components/StreakTree";
import RankStone from "@/components/RankStone";
import { rankFor, RANKS } from "@/lib/points";
import { totalDueCount, dueBreakdown, type DueGroup } from "@/lib/srs";
import GiftMcqButton from "@/components/GiftMcqButton";
import { getRecentTools, recordToolUse } from "@/lib/recentTools";
import { useHiddenStudyTools } from "@/lib/studyToolVisibility";

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

function useStreakDays(): number {
  const [days, setDays] = useState<number>(() => {
    try {
      const raw = localStorage.getItem("streak_state_v1");
      if (raw) return JSON.parse(raw).days ?? 0;
    } catch {}
    return 0;
  });
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("streak_state_v1");
        if (raw) setDays(JSON.parse(raw).days ?? 0);
      } catch {}
    };
    read();
    const id = window.setInterval(read, 1500);
    window.addEventListener("storage", read);
    return () => { window.clearInterval(id); window.removeEventListener("storage", read); };
  }, []);
  useEffect(() => {
    if (!days) return;
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
  | "todo"
  | "news"
  | "ministerialBank"
  | "subjectsHub"
  | "mindmap";

const TEMP_LOCKED_TOOLS = new Set<MainMenuChoice>();

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
      biologyDrawings: { title: "Biology Drawings", subtitle: "Label diagrams chapter by chapter." },
      todo: { title: "To-Do List", subtitle: "Plan tasks and celebrate when you finish." },
      news: { title: "News", subtitle: "Latest announcements and updates." },
      ministerialBank: { title: "Ministerial Questions Bank", subtitle: "Past ministerial questions by chapter." },
      mindmap: { title: "Mind Map", subtitle: "AI builds a clean mind map from any topic or file." },
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
      biologyDrawings: { title: "رسومات الأحياء", subtitle: "ميّز أجزاء الرسومات فصلاً بفصل." },
      todo: { title: "قائمة المهام", subtitle: "نظّم مهامك واحتفل بإنجازها." },
      news: { title: "الأخبار", subtitle: "آخر الإعلانات والتحديثات." },
      ministerialBank: { title: "بنك الوزاريات", subtitle: "أسئلة وزارية سابقة مرتبة حسب الفصل." },
      mindmap: { title: "الخريطة الذهنية", subtitle: "ينشئ الذكاء خريطة ذهنية من أي موضوع أو ملف." },
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
    ],
  },
  {
    titleEn: "Study",
    titleAr: "الأدوات",
    items: [
      { key: "notes", labelEn: "Notes", labelAr: "ملاحظاتي", Icon: NotebookPen },
      { key: "summaries", labelEn: "Summaries", labelAr: "الملخصات", Icon: FileText },
      { key: "mcq", labelEn: "MCQ Generator", labelAr: "مولّد الأسئلة", Icon: HelpCircle },
      { key: "mcqBank", labelEn: "MCQ Bank", labelAr: "بنك الأسئلة", Icon: Layers },
      { key: "mistakes", labelEn: "My Mistakes", labelAr: "أخطائي", Icon: AlertTriangle },
      { key: "chemicalEquations", labelEn: "Chemical Equation", labelAr: "المعادلات الكيميائية", Icon: FlaskConical },
      { key: "mindmap", labelEn: "Mind Map", labelAr: "الخريطة الذهنية", Icon: Network },
      { key: "videoNotes", labelEn: "Video Notes", labelAr: "ملاحظات الفيديو", Icon: Headphones },
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
      { key: "news", labelEn: "News", labelAr: "الأخبار", Icon: Newspaper },
      { key: "advices", labelEn: "Advices", labelAr: "النصائح", Icon: Lightbulb },
    ],
  },
  {
    titleEn: "Play",
    titleAr: "العب",
    items: [
      { key: "dailyGame", labelEn: "Daily Game", labelAr: "لعبة اليوم", Icon: Sparkles },
      { key: "liveBattle", labelEn: "Live Battle", labelAr: "المعركة المباشرة", Icon: Swords },
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
  { key: "mcqBank",    Icon: Layers },
  { key: "mistakes",   Icon: AlertTriangle },
  { key: "videoNotes", Icon: Headphones },
  { key: "podcastTutor", Icon: Podcast },
  { key: "youtube",    Icon: Youtube },
  { key: "canvas",     Icon: Palette },
  { key: "notes",      Icon: NotebookPen },
  { key: "adminNotes", Icon: BookOpen },
  { key: "companion",  Icon: Sparkles },
  { key: "mcq",        Icon: HelpCircle },
];

// Icons for any tool that can show up in "recently used"
const TOOL_ICONS: Partial<Record<MainMenuChoice, React.ComponentType<{ className?: string }>>> = {
  chemicalEquations: FlaskConical,
  videoNotes: Headphones,
  podcastTutor: Podcast,
  youtube: Youtube,
  canvas: Palette,
  notes: NotebookPen,
  adminNotes: BookOpen,
  companion: Sparkles,
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
  malazam: { card: "border-orange-400/40 bg-gradient-to-br from-amber-500/25 via-orange-500/10 to-orange-400/20", icon: "bg-orange-600 text-white shadow-lg shadow-orange-500/25" },
  ministerialBank: { card: "border-amber-400/40 bg-gradient-to-br from-orange-500/25 via-amber-500/10 to-yellow-400/20", icon: "bg-amber-600 text-white shadow-lg shadow-amber-500/25" },
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
  companion: { card: "border-emerald-400/40 bg-gradient-to-br from-teal-500/25 via-cyan-500/10 to-emerald-400/20", icon: "bg-teal-600 text-white shadow-lg shadow-teal-500/25" },
  mcq: { card: "border-purple-400/40 bg-gradient-to-br from-purple-500/25 via-fuchsia-500/10 to-pink-400/20", icon: "bg-purple-600 text-white shadow-lg shadow-purple-500/25" },
  liveBattle: { card: "border-rose-400/40 bg-gradient-to-br from-rose-500/25 via-red-500/10 to-amber-400/20", icon: "bg-rose-600 text-white shadow-lg shadow-rose-500/25" },
  report: { card: "border-lime-400/40 bg-gradient-to-br from-lime-500/25 via-emerald-500/10 to-green-400/20", icon: "bg-lime-600 text-white shadow-lg shadow-lime-500/25" },
  todo: { card: "border-blue-400/40 bg-gradient-to-br from-blue-500/25 via-indigo-500/10 to-violet-400/20", icon: "bg-blue-600 text-white shadow-lg shadow-blue-500/25" },
  leaderboard: { card: "border-yellow-400/40 bg-gradient-to-br from-yellow-500/25 via-amber-500/10 to-orange-400/20", icon: "bg-yellow-500 text-white shadow-lg shadow-yellow-500/25" },
  news: { card: "border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 via-blue-500/10 to-sky-400/20", icon: "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25" },
  advices: { card: "border-amber-400/40 bg-gradient-to-br from-yellow-500/25 via-amber-500/10 to-orange-300/20", icon: "bg-amber-500 text-white shadow-lg shadow-amber-500/25" },
  dailyGame: { card: "border-purple-400/40 bg-gradient-to-br from-purple-500/25 via-indigo-500/10 to-blue-400/20", icon: "bg-purple-600 text-white shadow-lg shadow-purple-500/25" },
  account: { card: "border-slate-400/40 bg-gradient-to-br from-slate-500/25 via-zinc-500/10 to-slate-300/20", icon: "bg-slate-700 text-white shadow-lg shadow-slate-500/25" },
};

const DEFAULT_HOME_TINT = {
  card: "border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-background",
  icon: "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
};

const RANK_CARD_THEMES = {
  coal: {
    background: "linear-gradient(145deg, #f9fafb 0%, #d1d5db 48%, #9ca3af 100%)",
    ink: "#111827",
    accent: "#4b5563",
    highlight: "#9ca3af",
    glow: "rgba(75, 85, 99, 0.28)",
    shadow: "rgba(31, 41, 55, 0.72)",
  },
  copper: {
    background: "linear-gradient(145deg, #fff7ed 0%, #fdba74 48%, #b87333 100%)",
    ink: "#7c2d12",
    accent: "#9a3412",
    highlight: "#fb923c",
    glow: "rgba(184, 115, 51, 0.30)",
    shadow: "rgba(154, 52, 18, 0.72)",
  },
  silver: {
    background: "linear-gradient(145deg, #ffffff 0%, #e2e8f0 46%, #94a3b8 100%)",
    ink: "#1e293b",
    accent: "#475569",
    highlight: "#cbd5e1",
    glow: "rgba(148, 163, 184, 0.38)",
    shadow: "rgba(71, 85, 105, 0.68)",
  },
  gold: {
    background: "linear-gradient(145deg, #fffbeb 0%, #fde68a 46%, #f59e0b 100%)",
    ink: "#78350f",
    accent: "#b45309",
    highlight: "#facc15",
    glow: "rgba(245, 158, 11, 0.30)",
    shadow: "rgba(180, 83, 9, 0.72)",
  },
  diamond: {
    background: "linear-gradient(145deg, #ecfeff 0%, #a5f3fc 44%, #22d3ee 100%)",
    ink: "#164e63",
    accent: "#0e7490",
    highlight: "#67e8f9",
    glow: "rgba(34, 211, 238, 0.34)",
    shadow: "rgba(8, 145, 178, 0.72)",
  },
  royal: {
    background: "linear-gradient(145deg, #faf5ff 0%, #d8b4fe 44%, #a78bfa 100%)",
    ink: "#581c87",
    accent: "#7e22ce",
    highlight: "#c084fc",
    glow: "rgba(167, 139, 250, 0.34)",
    shadow: "rgba(107, 33, 168, 0.72)",
  },
} as const;

const TOOL_CATEGORY_TINTS: Record<string, { active: string; idle: string }> = {
  All: {
    active: "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20",
    idle: "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
  },
  Subjects: {
    active: "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20",
    idle: "border-blue-400/40 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300",
  },
  Study: {
    active: "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-500/20",
    idle: "border-violet-400/40 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 dark:text-violet-300",
  },
  Progress: {
    active: "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20",
    idle: "border-amber-400/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300",
  },
  Community: {
    active: "border-cyan-600 bg-cyan-600 text-white shadow-lg shadow-cyan-500/20",
    idle: "border-cyan-400/40 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/20 dark:text-cyan-300",
  },
  Play: {
    active: "border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-500/20",
    idle: "border-rose-400/40 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:text-rose-300",
  },
  Account: {
    active: "border-slate-700 bg-slate-700 text-white shadow-lg shadow-slate-500/20",
    idle: "border-slate-400/40 bg-slate-500/10 text-slate-700 hover:bg-slate-500/20 dark:text-slate-300",
  },
};

const DEFAULT_TOOL_CATEGORY_TINT = {
  active: "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20",
  idle: "border-border bg-secondary/70 text-foreground hover:bg-secondary",
};

const FEATURED_COPY = {
  en: {
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
    canvas: { title: "Canvas", subtitle: "Sketch and diagram your ideas freely." },
    notes: { title: "Notes", subtitle: "Write and organize your own study notes." },
    adminNotes: { title: "Enrichments", subtitle: "Colorful enrichment cards crafted by your instructors." },
    companion: { title: "Success Companion", subtitle: "Your AI study partner and planner." },
    liveBattle: { title: "Live Battle", subtitle: "Challenge a friend in a 10-question MCQ duel." },
    subjectsHub: { title: "Subjects", subtitle: "All your subjects, chapter by chapter." },
    sessions: { title: "Study Sessions", subtitle: "Time your study and join study rooms." },
  },
  ar: {
    chemicalEquations: { title: "المعادلات الكيميائية", subtitle: "19 معادلة كيميائية مرتبة حسب الموضوع، مع تلميح لحفظ كل معادلة." },
    report: { title: "تقريري اليومي", subtitle: "ملاحظات ذكية ورابط متابعة لولي الأمر." },
    summaries: { title: "ملخصات", subtitle: "ارفع وتصفّح ملاحظات معتمدة." },
    todo: { title: "قائمة المهام", subtitle: "نظّم مهامك واحتفل بإنجازها." },
    missions: { title: "الفهرست", subtitle: "مواضيع الفصول لكل مادة." },
    mcq: { title: "مولّد الأسئلة", subtitle: "احصل على اختيارات من متعدد من أي ملف." },
    mcqBank: { title: "بنك الأسئلة", subtitle: "حل أسئلة حسب المادة. النقاط لأول محاولة فقط." },
    mistakes: { title: "أخطائي", subtitle: "كل ما أخطأت فيه يعود للمراجعة كل 3 أيام." },
    youtube: { title: "مشغّل يوتيوب", subtitle: "شاهد أي فيديو يوتيوب داخل التطبيق." },
    videoNotes: { title: "من الفيديو إلى ملاحظات", subtitle: "حوّل محاضرة يوتيوب إلى ملاحظات بالذكاء." },
    podcastTutor: { title: "المعلّم الصوتي", subtitle: "استمع، لخّص بصوتك، واحصل على تصحيح فوري." },
    canvas: { title: "اللوحة", subtitle: "ارسم ونظّم أفكارك بحرية." },
    notes: { title: "ملاحظاتي", subtitle: "اكتب ونظّم ملاحظاتك الدراسية." },
    adminNotes: { title: "إثرائيات", subtitle: "بطاقات إثرائية ملوّنة أعدّها المدرّسون خصيصاً لك." },
    companion: { title: "رفيق النجاح", subtitle: "شريكك الذكي في الدراسة والتخطيط." },
    liveBattle: { title: "المعركة المباشرة", subtitle: "تحد صديقك" },
    subjectsHub: { title: "المواد", subtitle: "كل موادك، فصلاً بفصل." },
    sessions: { title: "جلسات الدراسة", subtitle: "احسب وقت دراستك وادخل غرف الدراسة." },
  },
} as const;

const Basics = ({
  language,
  onChangeLanguage,
  onSelect,
  onNav,
  initialShowAllTools = false,
}: {
  language: AppLanguage;
  onChangeLanguage: () => void;
  onSelect: (c: BasicsChoice) => void;
  onNav: (c: MainMenuChoice) => void;
  initialShowAllTools?: boolean;
}) => {
  const phrases = MOTIVATIONAL_PHRASES[language];
  const [motivationalPhrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);
  const { isPremium } = useSubscription();
  const fc = FEATURED_COPY[language];
  const [activeKey, setActiveKey] = useState<MainMenuChoice>("flashcards");
  const [activeGroup, setActiveGroup] = useState<string>(NAV_GROUPS[0].titleEn);
  const todos = useTodos();
  const [missionsDone, setMissionsDone] = useState<number>(0);
  const streakDays = useStreakDays();
  const [toolCategory, setToolCategory] = useState("All");
  const [toolQuery, setToolQuery] = useState("");
  const [showAllTools, setShowAllTools] = useState<boolean>(initialShowAllTools);
  const [detailScreen, setDetailScreen] = useState<"plan" | "progress" | "streak" | null>(null);
  const detailOrigin = useRef<{ scroll: number; trigger: string } | null>(null);
  const openDetail = (screen: "plan" | "progress" | "streak") => {
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
        window.scrollTo({ top: origin.scroll, behavior: "auto" });
        document.getElementById(origin.trigger)?.focus({ preventScroll: true });
        detailOrigin.current = null;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [detailScreen]);

  const [recentKeys, setRecentKeys] = useState<string[]>(() => getRecentTools());
  const hiddenStudyTools = useHiddenStudyTools();

  useEffect(() => {
    const sync = () => setRecentKeys(getRecentTools());
    window.addEventListener("app:recent-tools-updated", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("app:recent-tools-updated", sync);
      window.removeEventListener("focus", sync);
    };
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

  const DEFAULT_TARGET_ISO = "2026-06-13T07:00";
  const [eventName, setEventName] = useState<string>(() => localStorage.getItem("custom_countdown_name_v1") || "");
  const [eventDateISO, setEventDateISO] = useState<string>(() => localStorage.getItem("custom_countdown_date_v1") || DEFAULT_TARGET_ISO);
  useEffect(() => {
    const sync = () => {
      setEventName(localStorage.getItem("custom_countdown_name_v1") || "");
      setEventDateISO(localStorage.getItem("custom_countdown_date_v1") || DEFAULT_TARGET_ISO);
    };
    window.addEventListener("storage", sync);
    window.addEventListener("app:countdown-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("app:countdown-changed", sync);
    };
  }, []);
  const TARGET = new Date(eventDateISO).getTime();
  const [now, setNow] = useState<number>(() => Date.now());
  const [showTimer, setShowTimer] = useState<boolean>(() => localStorage.getItem("countdown_hidden_v1") !== "1");
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, TARGET - now);
  const cd = {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
  const targetDate = new Date(eventDateISO);
  const formattedTarget = isNaN(targetDate.getTime())
    ? ""
    : targetDate.toLocaleString(language === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const defaultEvtName = language === "ar" ? "موعد مهم" : "Important date";
  const evtName = eventName.trim() || defaultEvtName;
  const timerLabel = language === "ar" ? `${evtName} — ${formattedTarget}` : `${evtName} — ${formattedTarget}`;
  const units = language === "ar"
    ? { d: "يوم", h: "ساعة", m: "دقيقة", s: "ثانية" }
    : { d: "Days", h: "Hours", m: "Min", s: "Sec" };
  const dismissTimer = () => {
    localStorage.setItem("countdown_hidden_v1", "1");
    setShowTimer(false);
  };

  const [username, setUsername] = useState<string>(() => localStorage.getItem("app_display_name_v1") || "");
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [boardRank, setBoardRank] = useState<number | null>(null);
  const [boardTotal, setBoardTotal] = useState<number>(0);
  useEffect(() => {
    let uid: string | null = null;
    const load = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      uid = u.user.id;
      const { data } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", u.user.id);
      const total = (data ?? []).reduce((sum, r: { points: number | null }) => sum + (r.points ?? 0), 0);
      setTotalPoints(total);

      // Standing among all students (all-time totals, same source as the leaderboard).
      const pageSize = 1000;
      const totals = new Map<string, number>();
      let from = 0;
      for (;;) {
        const { data: page, error } = await supabase
          .from("user_points")
          .select("user_id, points")
          .range(from, from + pageSize - 1);
        if (error) break;
        (page ?? []).forEach((r: { user_id: string; points: number | null }) => {
          totals.set(r.user_id, (totals.get(r.user_id) ?? 0) + (r.points ?? 0));
        });
        if (!page || page.length < pageSize) break;
        from += pageSize;
      }
      const mine = totals.get(u.user.id) ?? total;
      let ahead = 0;
      totals.forEach((v, k) => { if (k !== u.user!.id && v > mine) ahead += 1; });
      setBoardTotal(totals.size);
      setBoardRank(totals.size ? ahead + 1 : null);
    };
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    // Cost: points changes are always triggered locally, so we listen to the
    // in-app event instead of keeping a realtime channel open.
    window.addEventListener("app:progress-updated", onFocus);
    window.addEventListener("app:feature-unlocked", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("app:progress-updated", onFocus);
      window.removeEventListener("app:feature-unlocked", onFocus);
    };
  }, []);
  const leaderboardRank = rankFor(totalPoints);
  const currentRank = leaderboardRank.key;
  const rankCardTheme = RANK_CARD_THEMES[currentRank];
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
  const navigate = (k: MainMenuChoice) => {
    if (TEMP_LOCKED_TOOLS.has(k)) return;
    setActiveKey(k);
    recordToolUse(k);
    // sync active group
    const grp = NAV_GROUPS.find((g) => g.items.some((it) => it.key === k));
    if (grp) setActiveGroup(grp.titleEn);
    // Featured BasicsChoice keys still flow through onSelect to use the basic back-target
    const basicsKeys = new Set<MainMenuChoice>([
      "flashcards", "malazam", "summaries", "sessions", "biologyDrawings",
      "todo", "news", "ministerialBank", "mindmap",
    ]);
    if (basicsKeys.has(k)) onSelect(k as BasicsChoice);
    else onNav(k);
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
  const welcome = {
    en: { hi: "Welcome back", sub: "Pick up exactly where you left off." },
    ar: { hi: "أهلاً بعودتك", sub: "تابع من حيث توقفت." },
  }[language];
  const cta = {
    en: { primary: "Start studying", secondary: "View missions" },
    ar: { primary: "ابدأ الدراسة", secondary: "اطلع على المهمات" },
  }[language];
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
    return (
      <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 py-6 pb-32 text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mx-auto max-w-4xl">
          <button type="button" onClick={() => setDetailScreen(null)}
            className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            {isRTL ? "العودة للرئيسية" : "Back to home"}
          </button>
          <header className="mb-6">
            <p className="mb-2 text-sm text-primary">{isRTL ? "رحلتك مع تميزك" : "Your Tamayzak journey"}</p>
            <h1 id="study-detail-title" tabIndex={-1} className="text-2xl font-bold leading-relaxed outline-none sm:text-3xl">
              {detailScreen === "plan"
                ? (isRTL ? "خطة اليوم" : "Today's plan")
                : detailScreen === "progress"
                  ? (isRTL ? "تقدمي ورتبتي" : "My progress and rank")
                  : (isRTL ? "استمراريتي بالدراسة" : "My study streak")}
            </h1>
          </header>
          {detailScreen === "progress" ? (
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
                    <p className="font-mono text-ember text-xl font-semibold tabular-nums leading-none">{streakDays || 0}</p>
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
            </div>

            </section>
          ) : detailScreen === "streak" ? (
            <section aria-label={isRTL ? "شجرة الاستمرارية" : "Study streak tree"} className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-4 text-slate-950 shadow-[0_24px_70px_-36px_rgba(5,150,105,0.65)] sm:p-7">
              <p className="mb-4 text-lg font-bold">{streakDays || 0} {isRTL ? "أيام متواصلة" : "days in a row"}</p>
              <StreakTree language={language} />
            </section>
          ) : (
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
                      if (dueCards > 0) sessionStorage.setItem("flashcards:review", "1");
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
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top utility bar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-5xl mx-auto px-5 md:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <p className="text-base font-bold text-primary leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>tamayzak</p>
            <button
              onClick={() => onNav("report")}
              aria-label={language === "ar" ? "خطتي اليوم" : "Today's plan"}
              title={language === "ar" ? "خطتك اليوم — اضغط لعرض الخطة" : "Today's plan — tap to open"}
              className="relative inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/15 transition-colors"
            >
              <Target className="w-3.5 h-3.5" />
              <span>{pendingTodos}</span>
              <span className="hidden sm:inline opacity-80">{language === "ar" ? "لليوم" : "today"}</span>
              {pendingTodos > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          </div>
          <button
            onClick={() => window.dispatchEvent(new Event("app:open-search"))}
            aria-label={language === "ar" ? "بحث" : "Search"}
            className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-background text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors min-w-[10rem] sm:min-w-[16rem]"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span className="flex-1 text-start truncate">
              {language === "ar" ? "ابحث عن أداة..." : "Search tools..."}
            </span>
            <kbd className="hidden sm:inline-block text-[10px] text-muted-foreground/70 border border-border rounded px-1">⌘K</kbd>
          </button>
          <button
            onClick={() => onNav("account")}
            aria-label={language === "ar" ? "الإعدادات" : "Settings"}
            title={language === "ar" ? "الإعدادات" : "Settings"}
            className="ms-2 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="px-3 sm:px-5 md:px-10 py-4 sm:py-8 md:py-12 pb-48">
        <h1 className="sr-only">{language === "ar" ? "أدوات الدراسة" : "Study tools"}</h1>
        <AnimatePresence mode="wait">
        {showAllTools ? (
          <motion.div
            key="all-tools-screen"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => { setShowAllTools(false); onNav("basics"); }}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background text-sm font-medium hover:bg-secondary transition-colors"
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                {language === "ar" ? "رجوع" : "Back"}
              </button>
              {(() => {
                const seen = new Set<string>();
                const count = NAV_GROUPS.flatMap((g) => g.items).filter((it) => {
                  if (hiddenStudyTools.has(it.key)) return false;
                  if (seen.has(it.key)) return false;
                  seen.add(it.key);
                  return true;
                }).length;
                return (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {count} {language === "ar" ? "أداة" : "tools"}
                  </p>
                );
              })()}
            </div>
            <header className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {language === "ar" ? "كل أدوات الدراسة" : "All study tools"}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                {language === "ar" ? "كل ما تحتاجه للدراسة في مكان واحد." : "Everything you need to study, in one place."}
              </p>
            </header>
            <div className="mb-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">{isRTL ? "شنو تريد تدرس؟" : "Find a study tool"}</span>
                <input value={toolQuery} onChange={(event) => setToolQuery(event.target.value)}
                  type="search" placeholder={isRTL ? "ابحث بالاسم أو الاستخدام…" : "Search by name or purpose…"}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              </label>
              <div className="flex flex-wrap gap-2" aria-label={isRTL ? "تصنيفات الأدوات" : "Tool categories"}>
                {[{ titleEn: "All", titleAr: "الكل" }, ...NAV_GROUPS].map((group) => {
                  const active = toolCategory === group.titleEn;
                  const tint = TOOL_CATEGORY_TINTS[group.titleEn] ?? DEFAULT_TOOL_CATEGORY_TINT;
                  return (
                    <button
                      key={group.titleEn}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setToolCategory(group.titleEn)}
                      className={`min-h-11 rounded-full border px-4 py-2 text-sm font-black transition-all hover:-translate-y-0.5 ${active ? tint.active : tint.idle}`}
                    >
                      {isRTL ? group.titleAr : group.titleEn}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground">{isRTL ? "ما لكيت الأداة؟ جرّب كلمة ثانية أو اختَر «الكل»." : "No matching tool? Try another word or choose All."}</p>
            </div>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {(() => {
                const seen = new Set<string>();
                return NAV_GROUPS.filter((g) => toolCategory === "All" || g.titleEn === toolCategory).flatMap((g) => g.items).filter((it) => {
                  const query = toolQuery.trim().toLocaleLowerCase();
                  if (query && ![it.labelAr, it.labelEn, (fc as any)[it.key]?.subtitle ?? ""].join(" ").toLocaleLowerCase().includes(query)) return false;
                  if (hiddenStudyTools.has(it.key)) return false;
                  if (seen.has(it.key)) return false;
                  seen.add(it.key);
                  return true;
                });
              })().map((it) => {
                const Icon = it.Icon;
                const meta = (fc as any)[it.key];
                const tint = HOME_TOOL_TINTS[it.key] ?? DEFAULT_HOME_TINT;
                const isLocked = TEMP_LOCKED_TOOLS.has(it.key);
                return (
                  <motion.button
                    key={it.key}
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    whileHover={isLocked ? undefined : { y: -5 }}
                    whileTap={isLocked ? undefined : { scale: 0.98 }}
                    disabled={isLocked}
                    onClick={() => { setShowAllTools(false); navigate(it.key); }}
                    className={`group relative isolate min-h-[190px] overflow-hidden border-2 p-5 text-start shadow-[0_18px_42px_-30px_currentColor] backdrop-blur-xl transition-all ${isLocked ? "cursor-not-allowed opacity-60" : "hover:shadow-[0_24px_50px_-26px_currentColor]"} ${tint.card}`}
                    style={{ clipPath: "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))" }}
                  >
                    <span aria-hidden className={`absolute -end-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl transition-transform duration-500 group-hover:scale-125 ${tint.icon}`} />
                    <span aria-hidden className="pointer-events-none absolute inset-[4px] border border-white/20" style={{ clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))" }} />
                    <span aria-hidden className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                    {it.key === "podcastTutor" && (
                      <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-1 text-[9px] font-black text-amber-700 backdrop-blur-md dark:text-amber-300">
                        <Crown className="h-2.5 w-2.5" /> {language === "ar" ? "مميّز" : "Premium"}
                      </span>
                    )}
                    <div className={`relative mb-4 grid h-12 w-12 place-items-center rounded-[1rem] ring-1 ring-white/25 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${tint.icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="relative pe-7 text-base font-black text-foreground">
                      {meta?.title ?? (language === "ar" ? it.labelAr : it.labelEn)}
                    </h3>
                    {meta?.subtitle && (
                      <p className="relative mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{meta.subtitle}</p>
                    )}
                    <span className="relative mt-5 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-foreground/70">
                        {isLocked ? (language === "ar" ? "مغلق مؤقتاً" : "Temporarily locked") : (language === "ar" ? "افتح الأداة" : "Open tool")}
                      </span>
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-110 ${tint.icon}`}>
                        {isLocked ? <Lock className="h-3.5 w-3.5" /> : <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />}
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Cairo', sans-serif" }}
        >
        <div className="max-w-6xl mx-auto">
          {/* subtle brass aura */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 15% -10%, hsl(var(--primary) / 0.10), transparent 55%), radial-gradient(circle at 90% 110%, hsl(var(--primary) / 0.08), transparent 55%)",
            }}
          />
          <div className="relative">
          {/* ====== Noir & Gold bento dashboard ====== */}
          {/* Header */}
          {/* === The Facet Stone hero === */}
          <header className="mb-6 rounded-3xl border border-primary/25 bg-primary/5 p-5 sm:p-7">
            <p className="mb-2 text-sm text-muted-foreground">{isRTL ? "تميزك · مساحة دراستك" : "Tamayzak · your study space"}</p>
            <h2 className="text-2xl font-bold sm:text-3xl">{isRTL ? "شنو ندرس اليوم؟" : "What will you study today?"}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{isRTL ? "ابدأ بمادة، راجع بطاقاتك، أو حل أسئلة. بقية الأدوات موجودة وقت تحتاجها." : "Choose a subject, review flashcards, or practise questions. More tools are there when you need them."}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                onClick={() => navigate("subjectsHub")}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-black text-primary-foreground shadow-[0_14px_30px_-18px_hsl(var(--primary))] transition-shadow hover:shadow-[0_18px_36px_-16px_hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-6"
              >
                <BookOpen className="h-5 w-5" />
                <span>{isRTL ? "اختر مادة" : "Choose a subject"}</span>
                <ArrowRight className={`h-4 w-4 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate("ourCourses")}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex min-h-12 items-center gap-2 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-orange-400/20 px-5 py-3 font-black text-foreground shadow-[0_14px_30px_-20px_rgba(245,158,11,0.75)] backdrop-blur-md transition-all hover:border-amber-400 hover:shadow-[0_18px_36px_-18px_rgba(245,158,11,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 sm:px-6"
              >
                <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                <span>{isRTL ? "الدورات" : "Courses"}</span>
                <ArrowRight className={`h-4 w-4 text-amber-700 transition-transform dark:text-amber-300 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
              </motion.button>
            </div>
          </header>
<section
            aria-label={isRTL ? "ملخص الدراسة" : "Study overview"}
            className="mb-7 grid grid-cols-2 gap-3 sm:gap-4"
          >
            <motion.button
              type="button"
              id="plan-details-trigger"
              onClick={() => openDetail("plan")}
              whileHover={{ y: -6, rotate: -0.35 }}
              whileTap={{ scale: 0.97 }}
              aria-label={isRTL ? `خطة اليوم، مكتمل ${heroProgressPct} بالمئة` : `Today's plan, ${heroProgressPct}% complete`}
              className="group relative isolate flex min-h-[158px] min-w-0 flex-col items-center justify-center overflow-hidden border-2 border-sky-400/80 px-2.5 py-4 text-center text-slate-950 shadow-[0_20px_42px_-24px_rgba(14,165,233,0.9)] transition-shadow hover:shadow-[0_26px_50px_-22px_rgba(14,165,233,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:min-h-[205px] sm:px-5 sm:py-6"
              style={{ background: "linear-gradient(145deg, #f0f9ff 0%, #bae6fd 46%, #c7d2fe 100%)", clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}
            >
              <span aria-hidden="true" className="absolute -start-10 -top-14 h-32 w-32 rounded-full bg-white/70 blur-2xl transition-transform duration-500 group-hover:scale-125" />
              <span aria-hidden="true" className="absolute -bottom-12 -end-12 h-32 w-32 rounded-full bg-blue-500/25 blur-2xl" />
              <span aria-hidden="true" className="absolute -end-8 top-20 h-px w-28 -rotate-12 bg-gradient-to-r from-transparent via-sky-700/20 to-transparent" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-[4px] border border-white/60" style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }} />
              <span aria-hidden="true" className="absolute start-3 top-3 hidden text-[9px] font-black uppercase tracking-[0.16em] text-sky-800/60 sm:block sm:text-[10px]">{isRTL ? "خطوتك التالية" : "Next step"}</span>
              <span aria-hidden="true" className="absolute end-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full border border-white/80 bg-white/70 text-sky-800 shadow-sm backdrop-blur-md transition-transform group-hover:scale-110 sm:end-4 sm:top-4 sm:h-9 sm:w-9">
                <ArrowRight className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRTL ? "rotate-180" : ""}`} />
              </span>
              <span aria-hidden="true" className="relative grid h-12 w-12 place-items-center rounded-[1.1rem] border border-white/90 bg-white/75 text-sky-600 shadow-[0_12px_26px_-14px_rgba(2,132,199,0.95)] backdrop-blur-md transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 sm:h-16 sm:w-16 sm:rounded-[1.35rem]">
                <Target className="h-6 w-6 sm:h-8 sm:w-8" />
              </span>
              <span className="relative mt-3 block text-[11px] font-black leading-5 sm:text-lg sm:leading-7">{isRTL ? "خطة اليوم" : "Today's plan"}</span>
              <span className="relative mt-2 inline-flex min-w-[58px] items-baseline justify-center gap-1 rounded-full border border-white/75 bg-white/60 px-2.5 py-1 text-lg font-black text-sky-900 shadow-sm backdrop-blur-md sm:min-w-[88px] sm:px-4 sm:text-2xl">
                {heroProgressPct}<span className="text-[10px] sm:text-sm">%</span>
              </span>
              <span className="relative mt-2 hidden text-xs font-bold text-slate-600 sm:block">{heroProgressDone} / {heroProgressTotal || 0} {isRTL ? "منجزة" : "completed"}</span>
              <span aria-hidden="true" className="absolute inset-x-5 bottom-3 h-1.5 overflow-hidden rounded-full bg-white/50 shadow-inner sm:inset-x-7">
                <span className="block h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-[width] duration-500" style={{ width: `${heroProgressPct}%` }} />
              </span>
            </motion.button>

            <motion.button
              type="button"
              id="progress-details-trigger"
              onClick={() => openDetail("progress")}
              whileHover={{ y: -6, rotate: 0.35 }}
              whileTap={{ scale: 0.97 }}
              aria-label={isRTL ? `تقدمي ورتبتي، ${rankLabel}، ${totalPoints} نقطة` : `My progress and rank, ${rankLabel}, ${totalPoints} points`}
              className="group relative isolate flex min-h-[158px] min-w-0 flex-col items-center justify-center overflow-hidden border-2 px-2.5 py-4 text-center transition-all hover:saturate-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-[205px] sm:px-5 sm:py-6"
              style={{
                background: rankCardTheme.background,
                borderColor: leaderboardRank.color,
                color: rankCardTheme.ink,
                boxShadow: `0 20px 42px -24px ${rankCardTheme.shadow}`,
                clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
              }}
            >
              <span aria-hidden="true" className="absolute -start-10 -top-14 h-32 w-32 rounded-full bg-white/75 blur-2xl transition-transform duration-500 group-hover:scale-125" />
              <span aria-hidden="true" className="absolute -bottom-12 -end-12 h-32 w-32 rounded-full blur-2xl" style={{ backgroundColor: rankCardTheme.glow }} />
              <span
                aria-hidden="true"
                className="absolute -end-8 top-20 h-px w-28 -rotate-12"
                style={{ background: `linear-gradient(90deg, transparent, ${rankCardTheme.accent}55, transparent)` }}
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-[4px] border border-white/60" style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }} />
              <span
                aria-hidden="true"
                className="absolute start-3 top-3 hidden text-[9px] font-black uppercase tracking-[0.16em] sm:block sm:text-[10px]"
                style={{ color: rankCardTheme.ink, opacity: 0.62 }}
              >
                {isRTL ? "إنجازك" : "Achievement"}
              </span>
              <span
                aria-hidden="true"
                className="absolute end-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full border border-white/80 bg-white/70 shadow-sm backdrop-blur-md transition-transform group-hover:scale-110 sm:end-4 sm:top-4 sm:h-9 sm:w-9"
                style={{ color: rankCardTheme.accent }}
              >
                <ArrowRight className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRTL ? "rotate-180" : ""}`} />
              </span>
              <span
                aria-hidden="true"
                className="relative grid h-12 w-12 place-items-center rounded-[1.1rem] border border-white/90 bg-white/75 backdrop-blur-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 sm:h-16 sm:w-16 sm:rounded-[1.35rem]"
                style={{ color: rankCardTheme.accent, boxShadow: `0 12px 26px -14px ${rankCardTheme.shadow}` }}
              >
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
              </span>
              <span className="relative mt-3 block text-[11px] font-black leading-5 sm:text-lg sm:leading-7">{isRTL ? "تقدمي ورتبتي" : "Progress & rank"}</span>
              <span
                className="relative mt-2 inline-flex min-w-[58px] items-baseline justify-center gap-1 rounded-full border border-white/75 bg-white/60 px-2.5 py-1 text-lg font-black shadow-sm backdrop-blur-md sm:min-w-[88px] sm:px-4 sm:text-2xl"
                style={{ color: rankCardTheme.ink }}
              >
                {totalPoints}<span className="text-[9px] sm:text-xs">{isRTL ? "نقطة" : "pts"}</span>
              </span>
              <span className="relative mt-2 hidden text-xs font-black sm:block" style={{ color: rankCardTheme.accent }}>{rankLabel}</span>
              <span aria-hidden="true" className="absolute inset-x-5 bottom-3 flex h-1.5 gap-1 sm:inset-x-7">
                <span className="h-full flex-1 rounded-full" style={{ backgroundColor: leaderboardRank.color }} />
                <span className="h-full flex-1 rounded-full" style={{ backgroundColor: rankCardTheme.accent, opacity: 0.82 }} />
                <span className="h-full flex-1 rounded-full" style={{ backgroundColor: rankCardTheme.highlight, opacity: 0.92 }} />
              </span>
            </motion.button>

            
          </section>

          {dueMistakes > 0 && (
            <button
              type="button"
              onClick={() => onNav("mistakes")}
              className="w-full mb-6 flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-start hover:border-amber-400 transition-colors"
            >
              <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-foreground">
                  {language === "ar" ? "حان وقت مراجعة أخطائك" : "Time to review your mistakes"}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {language === "ar"
                    ? `لديك ${dueMistakes} سؤال أخطأت فيه — أعد حله الآن.`
                    : `${dueMistakes} question(s) you got wrong — redo them now.`}
                </span>
              </span>
              <span className="ms-auto shrink-0 rounded-full bg-amber-400/20 px-3 py-1 text-sm font-bold text-amber-500">{dueMistakes}</span>
            </button>
          )}



          {/* Core tools */}
          <section className="mb-6">
            <h2 className="text-base sm:text-lg font-bold text-foreground mb-4">
              {language === "ar" ? "الأساسيات" : "Essentials"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {FEATURED.filter((it) => !hiddenStudyTools.has(it.key)).map((it) => {
                const Icon = it.Icon;
                const meta = (fc as any)[it.key];
                const tint = HOME_TOOL_TINTS[it.key] ?? DEFAULT_HOME_TINT;
                const isLocked = TEMP_LOCKED_TOOLS.has(it.key);
                if (!meta) return null;
                return (
                  <motion.button
                    key={it.key}
                    whileHover={isLocked ? undefined : { y: -3 }}
                    whileTap={isLocked ? undefined : { scale: 0.98 }}
                    disabled={isLocked}
                    onClick={() => navigate(it.key)}
                    className={`group relative isolate min-h-[158px] overflow-hidden ${isRTL ? "text-right" : "text-start"} border-2 p-4 sm:min-h-[186px] sm:p-6 shadow-[0_18px_42px_-30px_currentColor] backdrop-blur-xl transition-all ${isLocked ? "cursor-not-allowed opacity-60" : "hover:-translate-y-1 hover:shadow-[0_24px_50px_-26px_currentColor]"} ${tint.card}`}
                    style={{ clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}
                  >
                    <span aria-hidden className={`absolute -top-8 -end-8 h-24 w-24 rounded-full opacity-30 blur-2xl transition-transform duration-300 group-hover:scale-125 ${tint.icon}`} />
                    <span aria-hidden className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                    {it.key === "podcastTutor" && (
                      <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[10px] font-black text-amber-600 dark:text-amber-300">
                        <Crown className="h-3 w-3" /> {language === "ar" ? "مميّز" : "Premium"}
                      </span>
                    )}
                    <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-sm ring-1 ring-white/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform ${tint.icon}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="relative pe-7 text-foreground text-base sm:text-xl font-bold mb-1 line-clamp-1">{meta.title}</h3>
                    <p className="relative pe-5 text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">{meta.subtitle}</p>
                    <span className={`absolute bottom-3 end-3 inline-flex h-7 w-7 items-center justify-center rounded-full opacity-70 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 ${tint.icon}`}>
                      {isLocked ? <Lock className="h-3.5 w-3.5" /> : <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowAllTools(true)}
              className="group flex min-h-14 w-full items-center justify-between gap-3 overflow-hidden border-2 border-violet-400/40 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-cyan-500/15 px-5 py-4 text-start font-black text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
            >
              <span>{isRTL ? "استكشف كل أدوات الدراسة" : "Explore all study tools"}</span>
              <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-110">
                <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              </span>
            </button>
          </div>
          {/* Countdown — quiet inline strip */}
          {showTimer && (
            <div className="mb-6 rounded-2xl border border-border bg-background px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 shrink-0">
                <Timer className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{language === "ar" ? "موعد مهم" : "Save the date"}</p>
                <p className="font-semibold text-sm truncate">{timerLabel}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-sm font-bold tabular-nums">
                <span>{String(cd.d).padStart(2, "0")}</span><span className="text-muted-foreground text-xs">{units.d}</span>
                <span className="text-muted-foreground mx-1">·</span>
                <span>{String(cd.h).padStart(2, "0")}</span><span className="text-muted-foreground text-xs">{units.h}</span>
                <span className="text-muted-foreground mx-1">·</span>
                <span>{String(cd.m).padStart(2, "0")}</span><span className="text-muted-foreground text-xs">{units.m}</span>
              </div>
              <button onClick={dismissTimer} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground p-1 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Recently used tools (falls back to the tools menu) */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                {displayedToolsHeader}
              </h2>
              <button
                onClick={() => setShowAllTools(true)}
                className="text-xs sm:text-sm font-semibold text-primary hover:opacity-80 inline-flex items-center gap-1 transition-opacity shrink-0"
              >
                {language === "ar" ? "عرض كل الأدوات" : "See all study tools"}
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isRTL ? "rotate-180" : ""}`} />
              </button>
            </div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {displayedTools.map((it) => {
                const Icon = it.Icon;
                const meta = (fc as any)[it.key];
                const tint = HOME_TOOL_TINTS[it.key] ?? DEFAULT_HOME_TINT;
                const isLocked = TEMP_LOCKED_TOOLS.has(it.key);
                if (!meta) return null;
                const showNotesDot = it.key === "adminNotes" && unseenNotes > 0;
                return (
                  <motion.button
                    key={it.key}
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    whileHover={isLocked ? undefined : { y: -3 }}
                    disabled={isLocked}
                    onClick={() => navigate(it.key)}
                    className={`group relative isolate min-h-[142px] overflow-hidden ${isRTL ? "text-right" : "text-start"} border-2 p-3 shadow-[0_16px_36px_-28px_currentColor] backdrop-blur-xl transition-all sm:min-h-[164px] sm:p-5 ${isLocked ? "cursor-not-allowed opacity-60" : "hover:-translate-y-1 hover:shadow-[0_22px_44px_-24px_currentColor]"} ${tint.card}`}
                    style={{ clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))" }}
                  >
                    <span aria-hidden className={`absolute -top-7 -end-7 h-20 w-20 rounded-full opacity-30 blur-2xl transition-transform duration-300 group-hover:scale-125 ${tint.icon}`} />
                    <span aria-hidden className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
                    {it.key === "podcastTutor" && (
                      <span className="absolute top-2 end-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-[9px] font-black text-amber-600 dark:text-amber-300">
                        <Crown className="h-2.5 w-2.5" /> {language === "ar" ? "مميّز" : "Premium"}
                      </span>
                    )}
                    {showNotesDot && (
                      <span
                        aria-label={language === "ar" ? "ملاحظات جديدة" : "New notes"}
                        className="absolute top-2 end-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold"
                      >
                        {unseenNotes > 9 ? "9+" : unseenNotes}
                      </span>
                    )}
                    <div className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 shadow-sm ring-1 ring-white/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform ${tint.icon}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="relative pe-6 font-bold text-xs sm:text-sm text-foreground mb-1 line-clamp-1">{meta.title}</h3>
                    <p className="relative pe-4 text-[10px] sm:text-xs leading-relaxed text-muted-foreground line-clamp-2">{meta.subtitle}</p>
                    <span className={`absolute bottom-2.5 end-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 ${tint.icon}`}>
                      {isLocked ? <Lock className="h-3 w-3" /> : <ArrowRight className={`h-3 w-3 ${isRTL ? "rotate-180" : ""}`} />}
                    </span>
                  </motion.button>
                );
              })}

            </motion.div>
          </section>

          <section
            aria-labelledby="home-streak-title"
            className="mb-6 overflow-hidden rounded-[2rem] border border-border bg-card p-4 text-foreground shadow-sm sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-indigo-400/25 bg-indigo-500/10 text-indigo-600 shadow-sm dark:text-indigo-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600/75 dark:text-indigo-300">
                  {isRTL ? "سماء المثابرة" : "Streak sky"}
                </p>
                <h2 id="home-streak-title" className="mt-0.5 text-lg font-black sm:text-2xl">
                  {isRTL ? "شجرة استمراريتي" : "My streak tree"}
                </h2>
              </div>
              <span className="shrink-0 rounded-full border border-border bg-background px-3 py-2 text-sm font-black text-foreground shadow-sm sm:px-4 sm:text-base">
                {streakDays || 0} {isRTL ? "أيام متواصلة" : "days in a row"}
              </span>
            </div>
            <div className="[&>section]:mb-0 [&>section]:mt-5">
              <StreakTree language={language} />
            </div>
          </section>




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
