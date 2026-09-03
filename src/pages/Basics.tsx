import { useEffect, useMemo, useState } from "react";
import { trackStreakUpdated } from "@/lib/analytics";
import { readOnboarding, weakTopicsFor, topicLabel } from "@/lib/onboarding";
import {
  ArrowRight, ArrowLeft, Layers, AlertTriangle, BookMarked, FileText, GraduationCap, Microscope,
  LogOut, X, ListChecks, Newspaper, Timer, ScrollText, Network, Search,
  Globe, Trophy, Target, HelpCircle, Headphones, Lightbulb, Sparkles,
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
import { useTodos } from "@/lib/todoTopicProgress";
import StreakTree from "@/components/StreakTree";
import RankStone from "@/components/RankStone";
import { rankFor, RANKS } from "@/lib/points";
import { totalDueCount, dueBreakdown, type DueGroup } from "@/lib/srs";
import GiftMcqButton from "@/components/GiftMcqButton";
import { getRecentTools, recordToolUse } from "@/lib/recentTools";

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

const TEMP_LOCKED_TOOLS = new Set<MainMenuChoice>(["adminNotes"]);

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
      { key: "mindmap", labelEn: "Mind Map", labelAr: "الخريطة الذهنية", Icon: Network },
      { key: "videoNotes", labelEn: "Video Notes", labelAr: "ملاحظات الفيديو", Icon: Headphones },
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
  { key: "subjectsHub", Icon: BookOpen,   tintBg: "bg-primary",    tintText: "text-primary-foreground" },
  { key: "mcqBank",     Icon: Layers,     tintBg: "bg-sky-50",     tintText: "text-sky-600" },
  { key: "missions",    Icon: Target,     tintBg: "bg-amber-50",   tintText: "text-amber-600" },
  { key: "summaries",   Icon: FileText,   tintBg: "bg-violet-50",  tintText: "text-violet-600" },
  { key: "adminNotes",  Icon: BookOpen,   tintBg: "bg-rose-50",    tintText: "text-rose-600" },
  { key: "notes",       Icon: NotebookPen, tintBg: "bg-teal-50",   tintText: "text-teal-600" },
];

// Study tools grid (bottom section)
const STUDY_TOOLS: { key: MainMenuChoice; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "mcqBank",    Icon: Layers },
  { key: "mistakes",   Icon: AlertTriangle },
  { key: "videoNotes", Icon: Headphones },
  { key: "youtube",    Icon: Youtube },
  { key: "canvas",     Icon: Palette },
  { key: "notes",      Icon: NotebookPen },
  { key: "adminNotes", Icon: BookOpen },
  { key: "companion",  Icon: Sparkles },
  { key: "mcq",        Icon: HelpCircle },
];

// Icons for any tool that can show up in "recently used"
const TOOL_ICONS: Partial<Record<MainMenuChoice, React.ComponentType<{ className?: string }>>> = {
  videoNotes: Headphones,
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
  subjectsHub: { card: "border-primary/25 bg-primary/10 hover:bg-primary/15", icon: "bg-primary/15 text-primary" },
  mcqBank: { card: "border-sky-500/25 bg-sky-500/10 hover:bg-sky-500/15", icon: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  missions: { card: "border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/15", icon: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  summaries: { card: "border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/15", icon: "bg-violet-500/15 text-violet-600 dark:text-violet-300" },
  adminNotes: { card: "border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/15", icon: "bg-rose-500/15 text-rose-600 dark:text-rose-300" },
  notes: { card: "border-teal-500/25 bg-teal-500/10 hover:bg-teal-500/15", icon: "bg-teal-500/15 text-teal-600 dark:text-teal-300" },
  sessions: { card: "border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15", icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  mistakes: { card: "border-orange-500/25 bg-orange-500/10 hover:bg-orange-500/15", icon: "bg-orange-500/15 text-orange-600 dark:text-orange-300" },
  videoNotes: { card: "border-fuchsia-500/25 bg-fuchsia-500/10 hover:bg-fuchsia-500/15", icon: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300" },
  youtube: { card: "border-red-500/25 bg-red-500/10 hover:bg-red-500/15", icon: "bg-red-500/15 text-red-600 dark:text-red-300" },
  canvas: { card: "border-indigo-500/25 bg-indigo-500/10 hover:bg-indigo-500/15", icon: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300" },
  companion: { card: "border-cyan-500/25 bg-cyan-500/10 hover:bg-cyan-500/15", icon: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300" },
  mcq: { card: "border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/15", icon: "bg-purple-500/15 text-purple-600 dark:text-purple-300" },
};

const DEFAULT_HOME_TINT = {
  card: "border-primary/20 bg-primary/5 hover:bg-primary/10",
  icon: "bg-primary/10 text-primary",
};

const FEATURED_COPY = {
  en: {
    report: { title: "Daily Report", subtitle: "AI insights + parent follow-up link." },
    summaries: { title: "Notes & Summaries", subtitle: "Upload and browse approved notes." },
    todo: { title: "To-Do List", subtitle: "Plan tasks and celebrate when you finish." },
    missions: { title: "Al-Fahrast", subtitle: "Chapter topics tracked per subject." },
    mcq: { title: "MCQ Generator", subtitle: "Get multiple-choice questions from any file." },
    mcqBank: { title: "MCQ Bank", subtitle: "Solve real MCQs by subject. Points only on your first-ever try." },
    mistakes: { title: "My Mistakes", subtitle: "Everything you got wrong, back for review every 3 days." },
    youtube: { title: "YouTube Player", subtitle: "Watch any YouTube video inside the app." },
    videoNotes: { title: "Video to Notes", subtitle: "Turn a YouTube lecture into AI study notes." },
    canvas: { title: "Canvas", subtitle: "Sketch and diagram your ideas freely." },
    notes: { title: "Notes", subtitle: "Write and organize your own study notes." },
    adminNotes: { title: "Study Notes", subtitle: "Beautiful study notes crafted by your instructors." },
    companion: { title: "Success Companion", subtitle: "Your AI study partner and planner." },
    liveBattle: { title: "Live Battle", subtitle: "Challenge a friend in a 10-question MCQ duel." },
    subjectsHub: { title: "Subjects", subtitle: "All your subjects, chapter by chapter." },
    sessions: { title: "Study Sessions", subtitle: "Time your study and join study rooms." },
  },
  ar: {
    report: { title: "تقريري اليومي", subtitle: "ملاحظات ذكية ورابط متابعة لولي الأمر." },
    summaries: { title: "ملخصات", subtitle: "ارفع وتصفّح ملاحظات معتمدة." },
    todo: { title: "قائمة المهام", subtitle: "نظّم مهامك واحتفل بإنجازها." },
    missions: { title: "الفهرست", subtitle: "مواضيع الفصول لكل مادة." },
    mcq: { title: "مولّد الأسئلة", subtitle: "احصل على اختيارات من متعدد من أي ملف." },
    mcqBank: { title: "بنك الأسئلة", subtitle: "حل أسئلة حسب المادة. النقاط لأول محاولة فقط." },
    mistakes: { title: "أخطائي", subtitle: "كل ما أخطأت فيه يعود للمراجعة كل 3 أيام." },
    youtube: { title: "مشغّل يوتيوب", subtitle: "شاهد أي فيديو يوتيوب داخل التطبيق." },
    videoNotes: { title: "من الفيديو إلى ملاحظات", subtitle: "حوّل محاضرة يوتيوب إلى ملاحظات بالذكاء." },
    canvas: { title: "اللوحة", subtitle: "ارسم ونظّم أفكارك بحرية." },
    notes: { title: "ملاحظاتي", subtitle: "اكتب ونظّم ملاحظاتك الدراسية." },
    adminNotes: { title: "ملاحظات دراسية", subtitle: "ملاحظات جميلة أعدّها المدرّسون خصيصاً لك." },
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
}: {
  language: AppLanguage;
  onChangeLanguage: () => void;
  onSelect: (c: BasicsChoice) => void;
  onNav: (c: MainMenuChoice) => void;
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
  const [showAllTools, setShowAllTools] = useState<boolean>(false);
  const [recentKeys, setRecentKeys] = useState<string[]>(() => getRecentTools());

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

  const signOut = async () => { await supabase.auth.signOut(); };

  // Today's pending tasks (todos in localStorage) → quick badge
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
  const essentialKeys = new Set<MainMenuChoice>(FEATURED.map((item) => item.key));
  const availableSecondaryTools = STUDY_TOOLS.filter(
    (item) => !essentialKeys.has(item.key) && !TEMP_LOCKED_TOOLS.has(item.key),
  );
  const recentTools = recentKeys
    .filter((key) => {
      const toolKey = key as MainMenuChoice;
      return (
        toolKey !== "liveBattle" &&
        !essentialKeys.has(toolKey) &&
        !TEMP_LOCKED_TOOLS.has(toolKey) &&
        TOOL_ICONS[toolKey] &&
        (fc as any)[toolKey]
      );
    })
    .slice(0, 4)
    .map((key) => ({ key: key as MainMenuChoice, Icon: TOOL_ICONS[key as MainMenuChoice]! }));
  const displayedTools = recentTools.length > 0 ? recentTools : availableSecondaryTools.slice(0, 4);

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
        {NAV_GROUPS.map((g) => (
          <div key={g.titleEn}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              {language === "ar" ? g.titleAr : g.titleEn}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = it.Icon;
                const active = activeKey === it.key;
                return (
                  <li key={it.key}>
                    <button
                      onClick={() => navigate(it.key)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isRTL ? "ml-3" : "mr-3"} shrink-0`} />
                      <span className="truncate text-left">{language === "ar" ? it.labelAr : it.labelEn}</span>
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
          className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
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


  return (
    <div className="min-h-screen w-full bg-background text-foreground" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top utility bar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 md:px-10 h-14 flex items-center gap-2 sm:gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <p className="hidden sm:block text-base font-bold text-primary leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>tamayzak</p>
            <button
              type="button"
              onClick={() => navigate("todo")}
              aria-label={language === "ar" ? `${pendingTodos} مهام متبقية` : `${pendingTodos} tasks remaining`}
              title={language === "ar" ? "افتح قائمة المهام" : "Open to-do list"}
              className="relative inline-flex items-center gap-1.5 h-9 px-2.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/15 transition-colors"
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>{pendingTodos}</span>
              <span className="hidden md:inline opacity-80">{language === "ar" ? "مهام" : "tasks"}</span>
              {pendingTodos > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("app:open-search"))}
            aria-label={language === "ar" ? "بحث" : "Search"}
            className="mx-auto inline-flex min-w-0 flex-1 sm:max-w-sm items-center gap-2 h-9 px-3 rounded-xl border border-border bg-card text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span className="flex-1 text-start truncate">
              {language === "ar" ? "ابحث عن أداة..." : "Search tools..."}
            </span>
            <kbd className="hidden sm:inline-block text-[10px] text-muted-foreground/70 border border-border rounded px-1">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={() => onNav("account")}
            aria-label={language === "ar" ? "الإعدادات" : "Settings"}
            title={language === "ar" ? "الإعدادات" : "Settings"}
            className="inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="px-3 sm:px-5 md:px-10 py-4 sm:py-7 md:py-8 pb-48">
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
                onClick={() => setShowAllTools(false)}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card text-sm font-medium hover:bg-secondary transition-colors"
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                {language === "ar" ? "رجوع" : "Back"}
              </button>
              {(() => {
                const seen = new Set<string>();
                const count = NAV_GROUPS.flatMap((g) => g.items).filter((it) => {
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
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {(() => {
                const seen = new Set<string>();
                return NAV_GROUPS.flatMap((g) => g.items).filter((it) => {
                  if (seen.has(it.key)) return false;
                  seen.add(it.key);
                  return true;
                });
              })().map((it) => {
                const Icon = it.Icon;
                const meta = (fc as any)[it.key];
                const isLocked = TEMP_LOCKED_TOOLS.has(it.key);
                return (
                  <motion.button
                    key={it.key}
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    whileHover={isLocked ? undefined : { y: -2 }}
                    whileTap={isLocked ? undefined : { scale: 0.98 }}
                    disabled={isLocked}
                    onClick={() => { setShowAllTools(false); navigate(it.key); }}
                    className={`group bg-card p-5 border border-border rounded-2xl text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isLocked ? "cursor-not-allowed opacity-60" : "hover:border-primary/40 hover:shadow-[var(--shadow-card)]"}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                      <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-bold text-base mb-1">
                      {meta?.title ?? (language === "ar" ? it.labelAr : it.labelEn)}
                    </h3>
                    {meta?.subtitle && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{meta.subtitle}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      {isLocked ? (language === "ar" ? "مغلق مؤقتاً" : "Temporarily locked") : (language === "ar" ? "افتح" : "Open")}
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`} />}
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
          <div className="relative">
          {/* ====== Noir & Gold bento dashboard ====== */}
          {/* Header */}
          {/* === The Facet Stone hero === */}
          <header className="mb-6 rounded-[28px] border border-border/80 bg-gradient-to-br from-card via-card to-primary/10 p-4 shadow-[var(--shadow-card)] sm:p-6">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="shrink-0 sm:hidden">
                <RankStone
                  rank={currentRank}
                  size={78}
                  fillProgress={stoneFill}
                  glow={currentRank === "royal" || currentRank === "diamond"}
                />
              </div>
              <div className="hidden shrink-0 sm:block">
                <RankStone
                  rank={currentRank}
                  size={104}
                  fillProgress={stoneFill}
                  glow={currentRank === "royal" || currentRank === "diamond"}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.22em] text-ash mb-1">
                  {language === "ar" ? "رتبتك" : "Your rank"}
                </p>
                <h2 className="truncate text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  {rankLabel}
                  {username && (
                    <span className="text-ash font-normal text-sm sm:text-lg ms-2">· {username}</span>
                  )}
                </h2>
                <p className="mt-1 line-clamp-2 text-[11px] sm:text-xs text-muted-foreground">
                  {nextRank
                    ? (language === "ar"
                      ? `${pointsToNextRank} نقطة حتى رتبة ${nextRank.label.ar}`
                      : `${pointsToNextRank} points to ${nextRank.label.en}`)
                    : (language === "ar" ? "وصلت إلى أعلى رتبة" : "Highest rank achieved")}
                </p>
              </div>
              <GiftMcqButton language={language} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-border bg-card px-3 py-3">
                <p className="font-mono text-ember text-lg sm:text-xl font-semibold tabular-nums leading-none">{streakDays || 0}</p>
                <p className="mt-1 truncate text-[10px] sm:text-[11px] text-ash">
                  {language === "ar" ? "سلسلة الأيام" : "day streak"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNav("unlocks")}
                className="text-start rounded-2xl border border-border bg-card px-3 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <p className="font-mono text-foreground text-lg sm:text-xl font-semibold tabular-nums leading-none">{totalPoints}</p>
                <p className="mt-1 truncate text-[10px] sm:text-[11px] text-ash">
                  {language === "ar" ? "النقاط" : "points"}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onNav("leaderboard")}
                className="text-start rounded-2xl border border-primary/40 bg-primary/5 px-3 py-3 transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <p className="font-mono text-primary text-lg sm:text-xl font-semibold tabular-nums leading-none">
                  {boardRank ? `#${boardRank}` : "—"}
                </p>
                <p className="mt-1 truncate text-[10px] sm:text-[11px] text-ash">
                  {language === "ar" ? `المتصدرون · ${boardTotal}` : `leaderboard · ${boardTotal}`}
                </p>
              </button>
            </div>
          </header>

          {dueMistakes > 0 && (
            <button
              type="button"
              onClick={() => onNav("mistakes")}
              className="w-full mb-4 flex items-center gap-3 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-3.5 text-start hover:border-amber-400 hover:bg-amber-500/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="min-w-0 flex-1">
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

          {/* ====== Today's plan — one card, three clear next steps ====== */}
          <section className="mb-6">
            <div className="bg-card rounded-[28px] border border-border p-4 sm:p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                    {language === "ar" ? "خطة اليوم" : "Today's plan"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
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
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-foreground">
                      {heroProgressPct}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Step 1 — tasks */}
                <button
                  onClick={() => navigate("todo")}
                  className={`w-full ${isRTL ? "text-right" : "text-left"} rounded-2xl border border-border bg-secondary/30 p-3.5 flex items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors`}
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ListChecks className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground truncate">
                      {todoTotal > 0
                        ? (todoDone === todoTotal
                          ? (language === "ar" ? "أنجزت مهام اليوم" : "Today's tasks are complete")
                          : (language === "ar" ? `${Math.max(0, todoTotal - todoDone)} مهمة متبقية اليوم` : `${Math.max(0, todoTotal - todoDone)} task${todoTotal - todoDone === 1 ? "" : "s"} left today`))
                        : (language === "ar" ? "أضف مهام اليوم" : "Add today's tasks")}
                    </span>
                    <span className="block text-[11px] text-muted-foreground truncate">
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
                  className={`w-full ${isRTL ? "text-right" : "text-left"} rounded-2xl border p-3.5 flex items-center gap-3 transition-colors ${
                    dueCards > 0
                      ? "border-primary/40 bg-primary/5 hover:border-primary"
                      : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground truncate">
                      {dueCards > 0
                        ? (language === "ar" ? `راجع ${dueCards} بطاقة مستحقة` : `Review ${dueCards} card${dueCards === 1 ? "" : "s"} due`)
                        : (language === "ar" ? "ادرس بالبطاقات التعليمية" : "Study with flashcards")}
                    </span>
                    <span className="block text-[11px] text-muted-foreground truncate">
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
                  className={`w-full ${isRTL ? "text-right" : "text-left"} rounded-2xl border border-border bg-secondary/30 p-3.5 flex items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors`}
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground truncate">
                      {language === "ar" ? "شاهد تقدمك اليوم" : "See today's progress"}
                    </span>
                    <span className="block text-[11px] text-muted-foreground truncate">
                      {language === "ar" ? `${heroProgressDone} منجزة · ${pendingTodos} متبقية` : `${heroProgressDone} done · ${pendingTodos} left`}
                    </span>
                  </span>
                  <span className="shrink-0 text-primary">
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </span>
                </button>
              </div>

            </div>
          </section>

          {/* Core tools */}
          <section className="mb-7">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {language === "ar" ? "الأساسيات" : "Essentials"}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {language === "ar" ? "أهم الأدوات حتى تبدأ بسرعة." : "The tools you need to get started quickly."}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                {FEATURED.length} {language === "ar" ? "أدوات" : "tools"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {FEATURED.map((it) => {
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
                    className={`group relative min-h-[132px] overflow-hidden ${isRTL ? "text-right" : "text-left"} border p-3.5 sm:min-h-[150px] sm:p-4 rounded-2xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isLocked ? "cursor-not-allowed opacity-60" : "hover:shadow-[var(--shadow-card)]"} ${tint.card}`}
                  >
                    <span aria-hidden className={`absolute -top-8 -end-8 h-24 w-24 rounded-full opacity-35 blur-2xl transition-transform duration-300 group-hover:scale-125 ${tint.icon}`} />
                    <span aria-hidden className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                    <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-sm ring-1 ring-white/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform ${tint.icon}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="relative pe-7 text-foreground text-sm sm:text-lg font-bold mb-1 line-clamp-2">{meta.title}</h3>
                    <p className="relative pe-5 text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">{meta.subtitle}</p>
                    <span className={`absolute bottom-3 end-3 inline-flex h-7 w-7 items-center justify-center rounded-full opacity-70 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 ${tint.icon}`}>
                      {isLocked ? <Lock className="h-3.5 w-3.5" /> : <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Countdown — quiet inline strip */}
          {showTimer && (
            <div className="mb-6 rounded-2xl border border-border bg-card px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 shrink-0">
                <Timer className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{language === "ar" ? "موعد مهم" : "Save the date"}</p>
                <p className="font-semibold text-sm truncate">{timerLabel}</p>
              </div>
              <div className="sm:hidden shrink-0 rounded-xl bg-primary/10 px-3 py-2 text-center">
                <span className="block text-base font-black tabular-nums text-primary">{cd.d}</span>
                <span className="block text-[9px] text-muted-foreground">{units.d}</span>
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
          <section className="mb-7">
            <div className="flex items-end justify-between mb-4 gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {displayedToolsHeader}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {language === "ar" ? "اختصارات سريعة بدون تكرار أدوات الأساسيات." : "Quick shortcuts without repeating your essentials."}
                </p>
              </div>
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
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
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
                    className={`group relative min-h-[122px] overflow-hidden ${isRTL ? "text-right" : "text-left"} p-3 sm:min-h-[146px] sm:p-5 rounded-xl sm:rounded-2xl border shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isLocked ? "cursor-not-allowed opacity-60" : "hover:shadow-md"} ${tint.card}`}
                  >
                    <span aria-hidden className={`absolute -top-7 -end-7 h-20 w-20 rounded-full opacity-30 blur-2xl transition-transform duration-300 group-hover:scale-125 ${tint.icon}`} />
                    <span aria-hidden className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
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
                    <span className={`absolute bottom-2.5 end-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full opacity-65 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 ${tint.icon}`}>
                      {isLocked ? <Lock className="h-3 w-3" /> : <ArrowRight className={`h-3 w-3 ${isRTL ? "rotate-180" : ""}`} />}
                    </span>
                  </motion.button>
                );
              })}

            </motion.div>
          </section>

          {/* Streak tree — bottom */}
          <section>
            <StreakTree language={language} />
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
