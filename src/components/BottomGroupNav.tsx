import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Layers, Target, Users, Swords, ScrollText, Settings, BookOpen,
  NotebookPen, FileText, HelpCircle, Network, Headphones, Video, Youtube,
  Sparkles, GraduationCap, ListChecks, Trophy, Newspaper, Lightbulb,
  UserCog, Crown,
  Home, Palette, GraduationCap as CoursesIcon, Users2, Lock,
  Menu as MenuIcon, MessageCircle, LineChart, Compass, Moon,
  ArrowLeft, X,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import type { MainMenuChoice } from "@/pages/MainMenu";
import org6thDhsLogo from "@/assets/org-6th-dhs.png.asset.json";
import aiRoboAnimation from "@/assets/ai-robo-animated.webp.asset.json";
import { useNavVisibility } from "@/hooks/useNavVisibility";
import { useHiddenStudyTools } from "@/lib/studyToolVisibility";

type NavItem = {
  key: MainMenuChoice;
  labelEn: string;
  labelAr: string;
  Icon: React.ComponentType<{ className?: string }>;
  subject?: string; // when set, opens SubjectsHub focused on this subject
  url?: string; // external link (opens in new tab)
  imageUrl?: string; // when set, shows an image thumbnail instead of the icon
};

type NavGroup = {
  titleEn: string;
  titleAr: string;
  items: NavItem[];
  directKey?: MainMenuChoice;
  locked?: boolean;
  url?: string; // external link (opens in new tab)
  showInBar?: boolean;
};

const NAV_GROUPS: NavGroup[] = [
  {
    titleEn: "Home", titleAr: "الرئيسية",
    items: [],
  },
  {
    titleEn: "Subjects", titleAr: "المواد",
    items: [
      { key: "ourCourses", labelEn: "Our Courses", labelAr: "دوراتنا", Icon: CoursesIcon },
      { key: "subjectsHub", labelEn: "All Subjects", labelAr: "كل المواد", Icon: BookOpen },
    ],
  },
  {
    titleEn: "Study", titleAr: "الأدوات",
    items: [
      { key: "notes", labelEn: "Notes", labelAr: "ملاحظاتي", Icon: NotebookPen },
      { key: "canvas", labelEn: "Canvas", labelAr: "اللوحة", Icon: Palette },
      { key: "summaries", labelEn: "Summaries", labelAr: "الملخصات", Icon: FileText },
      { key: "mcq", labelEn: "MCQ Generator", labelAr: "مولّد الأسئلة", Icon: HelpCircle },
      { key: "mindmap", labelEn: "Mind Map", labelAr: "الخريطة الذهنية", Icon: Network },
      { key: "videoNotes", labelEn: "Video Notes", labelAr: "ملاحظات الفيديو", Icon: Headphones },
      { key: "textToVideo", labelEn: "Text → Video", labelAr: "نص إلى فيديو", Icon: Video },
      { key: "youtube", labelEn: "YouTube Player", labelAr: "مشغّل يوتيوب", Icon: Youtube },
      { key: "companion", labelEn: "Success Companion", labelAr: "رفيق النجاح", Icon: Sparkles },
    ],
  },
  {
    titleEn: "Community", titleAr: "المجتمع",
    items: [
      { key: "teachers", labelEn: "Our Teachers", labelAr: "مدرسينا", Icon: Users2 },
      { key: "news", labelEn: "News", labelAr: "الأخبار", Icon: Newspaper },
      { key: "advices", labelEn: "Advices", labelAr: "النصائح", Icon: Lightbulb },
      { key: "liveBattle", labelEn: "Live Battle", labelAr: "المعركة المباشرة", Icon: Swords },
      { key: "challenge", labelEn: "Challenge", labelAr: "التحدي", Icon: Target },
      { key: "sessions", labelEn: "Sessions", labelAr: "الجلسات", Icon: GraduationCap },
      { key: "leaderboard", labelEn: "Leaderboard", labelAr: "المتصدرون", Icon: Trophy },
    ],
  },
  {
    titleEn: "Organizations", titleAr: "منظماتنا",
    showInBar: false,
    items: [
      { key: "orgTamayzak", labelEn: "Tamayzak", labelAr: "تميزك", Icon: Sparkles, url: "https://tamyazak.site" },
      { key: "org6thDhs", labelEn: "6th DHS", labelAr: "6th DHS", Icon: GraduationCap, url: "https://t.me/a6th_dhs", imageUrl: org6thDhsLogo.url },
      { key: "orgMafatih", labelEn: "Keys to Success", labelAr: "مفاتيح النجاح", Icon: BookOpen, url: "https://t.me/sad6ths" },
      { key: "orgMasarak", labelEn: "Masarak", labelAr: "مسارك", Icon: Compass, url: "https://rfx.pythonanywhere.com/" },
      { key: "orgSamar", labelEn: "Samar", labelAr: "سمر", Icon: Moon, url: "https://samar.lol" },
    ],
  },
  {
    titleEn: "Menu", titleAr: "القائمة",
    items: [
      { key: "organizations" as MainMenuChoice, labelEn: "Organizations", labelAr: "منظماتنا", Icon: Network },
      { key: "account", labelEn: "Settings", labelAr: "الإعدادات", Icon: Settings },
      { key: "support" as MainMenuChoice, labelEn: "Support", labelAr: "الدعم", Icon: MessageCircle },
      { key: "report", labelEn: "Progress", labelAr: "تقدمي", Icon: LineChart },
    ],
  },
];

const BAR_GROUPS = NAV_GROUPS.filter((group) => group.showInBar !== false);

const MENU_ITEM_TINTS: Partial<Record<MainMenuChoice, { card: string; icon: string }>> = {
  ourCourses: { card: "border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/15", icon: "bg-violet-500/15 text-violet-600 dark:text-violet-300" },
  subjectsHub: { card: "border-sky-500/25 bg-sky-500/10 hover:bg-sky-500/15", icon: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  notes: { card: "border-teal-500/25 bg-teal-500/10 hover:bg-teal-500/15", icon: "bg-teal-500/15 text-teal-600 dark:text-teal-300" },
  canvas: { card: "border-indigo-500/25 bg-indigo-500/10 hover:bg-indigo-500/15", icon: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300" },
  summaries: { card: "border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/15", icon: "bg-purple-500/15 text-purple-600 dark:text-purple-300" },
  mcq: { card: "border-fuchsia-500/25 bg-fuchsia-500/10 hover:bg-fuchsia-500/15", icon: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300" },
  mindmap: { card: "border-cyan-500/25 bg-cyan-500/10 hover:bg-cyan-500/15", icon: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300" },
  videoNotes: { card: "border-pink-500/25 bg-pink-500/10 hover:bg-pink-500/15", icon: "bg-pink-500/15 text-pink-600 dark:text-pink-300" },
  textToVideo: { card: "border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/15", icon: "bg-rose-500/15 text-rose-600 dark:text-rose-300" },
  youtube: { card: "border-red-500/25 bg-red-500/10 hover:bg-red-500/15", icon: "bg-red-500/15 text-red-600 dark:text-red-300" },
  companion: { card: "border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/15", icon: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  teachers: { card: "border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/15", icon: "bg-blue-500/15 text-blue-600 dark:text-blue-300" },
  news: { card: "border-orange-500/25 bg-orange-500/10 hover:bg-orange-500/15", icon: "bg-orange-500/15 text-orange-600 dark:text-orange-300" },
  advices: { card: "border-yellow-500/25 bg-yellow-500/10 hover:bg-yellow-500/15", icon: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  liveBattle: { card: "border-red-500/25 bg-red-500/10 hover:bg-red-500/15", icon: "bg-red-500/15 text-red-600 dark:text-red-300" },
  challenge: { card: "border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/15", icon: "bg-purple-500/15 text-purple-600 dark:text-purple-300" },
  sessions: { card: "border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15", icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  leaderboard: { card: "border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/15", icon: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
};

const DEFAULT_MENU_TINT = {
  card: "border-primary/25 bg-primary/10 hover:bg-primary/15",
  icon: "bg-primary/15 text-primary",
};

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Subjects: BookOpen,
  Study: Layers,
  Home: Home,
  Community: Users,
  Organizations: Network,
  Menu: MenuIcon,
};

const BottomGroupNav = ({
  language, active, onSelect, onGuide,
}: {
  language: AppLanguage;
  active: MainMenuChoice | null;
  onSelect: (k: MainMenuChoice) => void;
  onGuide?: () => void;
}) => {
  const isRTL = language === "ar";
  const hiddenStudyTools = useHiddenStudyTools();
  const visibleNavGroups = NAV_GROUPS.map((group) =>
    group.titleEn === "Study"
      ? { ...group, items: group.items.filter((item) => !hiddenStudyTools.has(item.key)) }
      : group,
  );
  const initialGroup =
    visibleNavGroups.find((g) => g.items.some((it) => it.key === active))?.titleEn ??
    visibleNavGroups[0].titleEn;
  const [activeGroup, setActiveGroup] = useState<string>(initialGroup);
  useEffect(() => {
    const g = visibleNavGroups.find((gr) => gr.items.some((it) => it.key === active));
    if (g) setActiveGroup(g.titleEn);
  }, [active, hiddenStudyTools]);

  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => { setPortalRoot(document.body); }, []);
  const navVisible = useNavVisibility();
  const [sheetGroup, setSheetGroup] = useState<string | null>(null);

  const currentGroup = visibleNavGroups.find((g) => g.titleEn === activeGroup) ?? visibleNavGroups[0];
  const openGroup = visibleNavGroups.find((g) => g.titleEn === sheetGroup) ?? null;

  const handleItem = (it: NavItem) => {
    if ((it.key as string) === "organizations") {
      setSheetGroup("Organizations");
      return;
    }
    if (it.url) {
      setSheetGroup(null);
      window.open(it.url, "_blank", "noopener,noreferrer");
      return;
    }
    if ((it.key as string) === "support") {
      setSheetGroup(null);
      window.open("https://t.me/ias404", "_blank", "noopener,noreferrer");
      return;
    }
    if (it.subject) {
      try { localStorage.setItem("app_subject_focus_v1", it.subject); } catch { /* ignore */ }
      window.dispatchEvent(new CustomEvent("app:open-subject", { detail: { code: it.subject } }));
    } else if (it.key === "subjectsHub") {
      try { localStorage.removeItem("app_subject_focus_v1"); } catch { /* ignore */ }
      window.dispatchEvent(new CustomEvent("app:open-subject", { detail: { code: null } }));
    }
    setSheetGroup(null);
    onSelect(it.key);
  };

  const bar = (
    <div
      className="fixed left-0 right-0 z-[100] flex justify-center pointer-events-none px-3 transition-transform duration-300 ease-out"
      style={{
        bottom: 0,
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 0.75rem)`,
        transform: navVisible ? "translate3d(0,0,0)" : "translate3d(0, 140%, 0)",
        WebkitTransform: navVisible ? "translate3d(0,0,0)" : "translate3d(0, 140%, 0)",
        willChange: "transform",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-border bg-card/85 backdrop-blur-xl shadow-[0_18px_50px_-12px_hsl(var(--primary)/0.25)] p-1.5"
        aria-label="Primary"
      >
        {currentGroup.items.length > 0 && !currentGroup.locked && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1.5 mb-1.5 border-b border-border/60"
          >
            <LayoutGroup id={`bgn-subitems-${activeGroup}`}>
              {currentGroup.items.map((it) => {
                const Icon = it.Icon;
                const isActive = active === it.key;
                return (
                  <motion.button
                    key={it.key}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleItem(it)}
                    className={`relative shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isActive ? "text-primary" : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="bgn-sub-pill"
                        className="absolute inset-0 bg-primary/10 rounded-lg"
                        transition={{ type: "spring", stiffness: 520, damping: 36 }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {language === "ar" ? it.labelAr : it.labelEn}
                    </span>
                  </motion.button>
                );
              })}
            </LayoutGroup>
          </motion.div>
        </AnimatePresence>
        )}

        <LayoutGroup id="bgn-group-tabs">
          <div className="relative isolate flex items-stretch gap-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -top-5 z-0 h-16 w-16 -translate-x-1/2 rounded-full border border-border bg-background"
            />
            {(() => {
              const half = Math.ceil(BAR_GROUPS.length / 2);
              const left = BAR_GROUPS.slice(0, half);
              const right = BAR_GROUPS.slice(half);
              const renderGroup = (g: NavGroup) => {
                const Icon = GROUP_ICONS[g.titleEn] ?? Layers;
                const isActive = activeGroup === g.titleEn;
                return (
                  <motion.button
                    key={g.titleEn}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      if (g.locked) return;
                      if (g.url) {
                        window.open(g.url, "_blank", "noopener,noreferrer");
                        return;
                      }
                      setActiveGroup(g.titleEn);
                      if (g.directKey) { setSheetGroup(null); onSelect(g.directKey); }
                      else if (g.items.length === 0) { setSheetGroup(null); onSelect("basics"); }
                      else setSheetGroup(g.titleEn);
                    }}
                    aria-disabled={g.locked || undefined}
                    className={`relative flex-1 h-12 inline-flex flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition-colors ${
                      g.locked
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && !g.locked && (
                      <motion.span
                        layoutId="bgn-group-pill"
                        className="absolute inset-0 rounded-xl bg-primary shadow-[0_6px_20px_hsl(var(--primary)/0.4)]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <motion.span
                      animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="relative z-10"
                    >
                      <Icon className="w-4 h-4" />
                    </motion.span>
                    <span className="relative z-10 tracking-wide inline-flex items-center gap-1">
                      {language === "ar" ? g.titleAr : g.titleEn}
                      {g.locked && <Lock className="w-3 h-3" />}
                    </span>
                  </motion.button>
                );
              };
              return (
                <>
                  <div className="relative z-10 flex min-w-0 flex-1 items-stretch gap-1">
                    {left.map(renderGroup)}
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.06 }}
                    onClick={() => onGuide?.()}
                    aria-label={language === "ar" ? "أرشدني" : "Guide me"}
                    className="relative z-20 shrink-0 mx-1 h-16 w-16 -mt-5 inline-flex items-center justify-center overflow-hidden rounded-full border-[5px] border-background bg-transparent"
                  >
                    <span className="absolute inset-x-0 top-0 h-12 overflow-hidden rounded-t-full bg-transparent">
                      <img
                        src={aiRoboAnimation.url}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        className="pointer-events-none h-full w-full scale-[1.2] select-none object-contain"
                      />
                    </span>
                    <span className="pointer-events-none absolute inset-x-0 bottom-1 whitespace-nowrap text-center text-[9px] font-bold leading-none text-foreground">
                      المرشد
                    </span>
                  </motion.button>
                  <div className="relative z-10 flex min-w-0 flex-1 items-stretch gap-1">
                    {right.map(renderGroup)}
                  </div>
                </>
              );
            })()}
          </div>
        </LayoutGroup>
      </motion.nav>
    </div>
  );

  const sheet = (
    <AnimatePresence>
      {openGroup && openGroup.items.length > 0 && (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <button
            type="button"
            aria-label={language === "ar" ? "إغلاق" : "Close"}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => setSheetGroup(null)}
          />

          {openGroup.titleEn === "Menu" || openGroup.titleEn === "Organizations" ? (
            <motion.aside
              initial={{ x: isRTL ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className={`absolute inset-y-0 z-10 w-[86%] max-w-sm border-border bg-card shadow-2xl ${isRTL ? "left-0 border-r" : "right-0 border-l"}`}
            >
              <div className="flex h-full flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
                <div className="mb-6 flex items-center gap-3">
                  {openGroup.titleEn === "Organizations" && (
                    <button
                      type="button"
                      onClick={() => setSheetGroup("Menu")}
                      aria-label={language === "ar" ? "رجوع" : "Back"}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                    </button>
                  )}
                  <h2 className="flex-1 text-2xl font-bold text-foreground">
                    {language === "ar" ? openGroup.titleAr : openGroup.titleEn}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSheetGroup(null)}
                    aria-label={language === "ar" ? "إغلاق" : "Close"}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto">
                  {openGroup.items.map((it) => {
                    const Icon = it.Icon;
                    const isActive = active === it.key;
                    return (
                      <motion.button
                        key={it.key}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleItem(it)}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors ${isActive ? "border-primary bg-primary/10" : "border-border bg-background/35 hover:border-primary/50"}`}
                      >
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/15">
                          {it.imageUrl ? <img src={it.imageUrl} alt="" className="h-full w-full object-cover" /> : <Icon className="h-5 w-5 text-primary" />}
                        </span>
                        <span className="font-semibold text-foreground">{language === "ar" ? it.labelAr : it.labelEn}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          ) : (
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 h-full overflow-y-auto px-4 pb-40 pt-8"
            >
              <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">{language === "ar" ? openGroup.titleAr : openGroup.titleEn}</h2>
                  <button onClick={() => setSheetGroup(null)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
                    {language === "ar" ? "إغلاق" : "Close"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {openGroup.items.map((it) => {
                    const Icon = it.Icon;
                    const isActive = active === it.key;
                    const tint = MENU_ITEM_TINTS[it.key] ?? DEFAULT_MENU_TINT;
                    return (
                      <motion.button
                        key={it.key}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleItem(it)}
                        aria-current={isActive ? "page" : undefined}
                        className={`relative flex min-h-[104px] flex-col justify-between overflow-hidden rounded-2xl border p-4 text-start shadow-sm transition-all hover:shadow-md ${tint.card} ${isActive ? "ring-2 ring-primary/45" : ""}`}
                      >
                        <span className={`inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl ${tint.icon}`}>
                          {it.imageUrl ? <img src={it.imageUrl} alt="" className="h-full w-full object-cover" /> : <Icon className="h-5 w-5" />}
                        </span>
                        <span className="relative mt-3 text-sm font-semibold text-foreground">{language === "ar" ? it.labelAr : it.labelEn}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return portalRoot ? createPortal(<>{sheet}{bar}</>, portalRoot) : null;
};

export default BottomGroupNav;
