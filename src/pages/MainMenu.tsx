import { Layers, GraduationCap, BookMarked, FileText, HelpCircle, Headphones, ArrowRight, Lock, Compass, LineChart, Search, Youtube, StickyNote, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { type AppLanguage } from "@/components/LanguageGate";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StreakTree from "@/components/StreakTree";


const copy = {
  en: {
    badge: "Welcome",
    title: "Study tools",
    description: "Pick what you want to do today. More tools are on the way.",
    soon: "Coming soon",
    hi: "Hi",
    items: {
      basics: { title: "The Basics", subtitle: "All your essential study tools in one tidy hub." },
      flashcards: { title: "Flashcards", subtitle: "Study with smart Q&A cards across every subject." },
      sessions: { title: "Sessions", subtitle: "Track study time per subject and climb the leaderboard." },
      ourCourses: { title: "Our Courses", subtitle: "Browse available courses and start learning." },
      malazam: { title: "Malazam", subtitle: "Curated booklets and study notes for every subject." },
      summaries: { title: "Notes & Summaries", subtitle: "Upload your notes or summaries — they appear once an admin approves." },
      missions: { title: "My Missions", subtitle: "Check off chapter topics and watch your progress per subject." },
      mcq: { title: "MCQ Generator", subtitle: "Upload any file and instantly get multiple-choice questions with hints." },
      advices: { title: "Advices", subtitle: "Read advice from top students or share your own." },
      videoNotes: { title: "Video to Notes", subtitle: "Paste a YouTube link and get AI-generated study notes." },
      account: { title: "Account Center", subtitle: "Set your username and manage your profile." },
      essay: { title: "Al-Musahhih", subtitle: "Upload your answer sheet & the key — AI grades it." },
      report: { title: "Daily Report", subtitle: "AI insights on today's study + share progress with a parent." },
      youtube: { title: "YouTube Player", subtitle: "Watch any YouTube video inside the app without distractions." },
      adminNotes: { title: "Enrichments", subtitle: "Colorful enrichment cards crafted by your instructors." },
      whoIsBest: { title: "Who Is Best?", subtitle: "Vote for your favourite teacher and view the live ranking." },
    },
  },
  ar: {
    badge: "أهلاً بك",
    title: "الأدوات الدراسية",
    description: "اختر ما تريد البدء به اليوم. المزيد من الأدوات قريباً.",
    soon: "قريباً",
    hi: "أهلاً",
    items: {
      basics: { title: "الأساسيات", subtitle: "كل أدواتك الدراسية الأساسية في مكان واحد." },
      flashcards: { title: "البطاقات التعليمية", subtitle: "ادرس عبر بطاقات السؤال والجواب لجميع المواد." },
      sessions: { title: "الجلسات", subtitle: "احسب وقت دراستك لكل مادة وتحدّى أصدقاءك على لوحة المتصدرين." },
      ourCourses: { title: "دوراتنا", subtitle: "تصفّح الدورات المتاحة وابدأ الدراسة." },
      malazam: { title: "الملازم", subtitle: "ملازم ومذكرات دراسية مختارة لكل مادة." },
      summaries: { title: "ملاحظات وملخصات", subtitle: "ارفع ملاحظاتك أو ملخصاتك — تظهر بعد موافقة المسؤول." },
      missions: { title: "مهماتي", subtitle: "اشطب مواضيع كل فصل وتابع تقدمك في كل مادة." },
      mcq: { title: "مولّد الأسئلة", subtitle: "ارفع أي ملف واحصل فوراً على أسئلة اختيار من متعدد مع تلميحات." },
      advices: { title: "النصائح", subtitle: "اقرأ نصائح من المتفوقين أو شارك نصيحتك." },
      videoNotes: { title: "من الفيديو إلى ملاحظات", subtitle: "ألصق رابط يوتيوب واحصل على ملاحظات دراسية بالذكاء الاصطناعي." },
      account: { title: "مركز الحساب", subtitle: "حدّد اسم المستخدم وأدر ملفك الشخصي." },
      essay: { title: "مدرّب المقالات", subtitle: "ارفع ملفاً واحصل على أسئلة مقالية مُقيَّمة من 1 إلى 10." },
      report: { title: "تقريري اليومي", subtitle: "تحليل ذكي ليومك الدراسي ومشاركة تقدمك مع ولي الأمر." },
      youtube: { title: "مشغّل يوتيوب", subtitle: "شاهد أي فيديو يوتيوب داخل التطبيق بدون تشتيت." },
      adminNotes: { title: "الإثرائيات", subtitle: "بطاقات إثرائية ملوّنة أعدّها المدرّسون خصيصاً لك." },
      whoIsBest: { title: "من الأفضل؟", subtitle: "صوّت لمدرسك المفضل وشوف الترتيب المباشر." },
    },
  },
} as const;

export type MainMenuChoice = "flashcards" | "missions" | "mcq" | "malazam" | "summaries" | "advices" | "sessions" | "account" | "essay" | "videoNotes" | "podcastTutor" | "basics" | "biologyDrawings" | "biologySchemes" | "physicsSchemes" | "leaderboard" | "news" | "premium" | "more" | "todo" | "ministerialBank" | "mindmap" | "islamicSurahs" | "hadithChecker" | "poemsChecker" | "englishEssays" | "englishIsqat" | "englishVerbForms" | "englishReadingPractice" | "report" | "notes" | "canvas" | "youtube" | "organicEquations" | "chemicalEquations" | "liveBattle" | "subjectsHub" | "textToVideo" | "psych" | "companion" | "subjectTutor" | "physicsLaws" | "physicsQuickMcq" | "physicsProblemSolver" | "problemGenerator" | "frenchSynonyms" | "frenchAntonyms" | "frenchConjugator" | "toolPlaceholder" | "physicsActivities" | "chemistryExperiments" | "ourCourses" | "examGenerator" | "teachers" | "ourTeachers" | "adminNotes" | "dailyGame" | "whoIsBest" | "challenge" | "joinTamayzak" | "unlocks" | "mcqBank" | "mistakes" | "orgTamayzak" | "org6thDhs" | "orgMafatih" | "orgMasarak" | "orgSamar";

const MainMenu = ({
  language,
  onChangeLanguage,
  onSelect,
}: {
  language: AppLanguage;
  onChangeLanguage: () => void;
  onSelect: (choice: MainMenuChoice) => void;
}) => {
  const text = copy[language];

  const [username, setUsername] = useState<string>(() => localStorage.getItem("app_display_name_v1") || "");
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

  const items = [
    { key: "basics" as const, Icon: Compass, locked: false, ...text.items.basics },
    { key: "report" as const, Icon: LineChart, locked: false, ...text.items.report },
    { key: "flashcards" as const, Icon: Layers, locked: false, ...text.items.flashcards },
    { key: "malazam", Icon: BookMarked, locked: false, ...text.items.malazam },
    { key: "summaries", Icon: FileText, locked: false, ...text.items.summaries },
    { key: "mcq", Icon: HelpCircle, locked: false, ...text.items.mcq },
    { key: "sessions", Icon: GraduationCap, locked: false, ...text.items.sessions },
    { key: "ourCourses" as const, Icon: GraduationCap, locked: false, ...text.items.ourCourses },
    { key: "videoNotes", Icon: Headphones, locked: false, ...text.items.videoNotes },
    { key: "youtube" as const, Icon: Youtube, locked: false, ...text.items.youtube },
    { key: "adminNotes" as const, Icon: StickyNote, locked: false, ...text.items.adminNotes },
    { key: "whoIsBest" as const, Icon: Trophy, locked: false, ...text.items.whoIsBest },
  ];

  const openSearch = () => window.dispatchEvent(new Event("app:open-search"));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 md:py-12" dir={language === "ar" ? "rtl" : "ltr"}>

      <div className="absolute top-6 inset-x-6 z-20 flex justify-center">
        <button
          onClick={openSearch}
          aria-label={language === "ar" ? "بحث" : "Search"}
          className="w-full max-w-md inline-flex items-center gap-2 h-11 px-4 rounded-full border border-border bg-card text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Search className="w-4 h-4 text-primary" />
          <span className="flex-1 text-start">
            {language === "ar" ? "ابحث عن أداة أو ميزة..." : "Search for a tool or feature..."}
          </span>
          <kbd className="hidden sm:inline-block text-[10px] text-muted-foreground border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
        </button>
      </div>

      <header className="relative z-10 mx-auto mt-16 max-w-6xl animate-fade-up text-start">
        <p className="mb-2 text-sm font-semibold text-muted-foreground">{text.badge} · Tamayzak</p>
        <h1 className="text-3xl font-bold leading-tight text-foreground">{text.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{text.description}</p>
        {username && (
          <p className="mt-3 text-sm font-medium text-muted-foreground">{text.hi}, {username}</p>
        )}
      </header>

      <motion.section
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="relative z-10 mx-auto mt-7 grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((it) => {
          const Icon = it.Icon;
          const available = !it.locked;
          return (
            <motion.button
              key={it.key}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
              whileTap={available ? { scale: 0.99 } : undefined}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => available && onSelect(it.key as MainMenuChoice)}
              disabled={it.locked}
              className={`group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-2xl border p-5 text-start transition-colors
                ${available
                  ? "border-border bg-card hover:bg-muted/50 cursor-pointer"
                  : "border-border/60 bg-muted/30 opacity-60 cursor-not-allowed"}`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <Icon aria-hidden="true" className={`h-5 w-5 ${available ? "text-muted-foreground" : "text-muted-foreground/60"}`} />
                {it.locked ? (
                  <Lock className="w-4 h-4 text-muted-foreground/60" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                )}
              </div>

              <div className="relative z-10 mt-5">
                <h3 className={`mb-1 text-lg font-semibold ${available ? "text-foreground" : "text-muted-foreground"}`}>
                  {it.title}
                </h3>
                <p className="text-sm text-muted-foreground">{it.locked ? text.soon : it.subtitle}</p>
              </div>

            </motion.button>
          );
        })}
      </motion.section>
      <StreakTree language={language} />
    </main>
  );
};

export default MainMenu;
