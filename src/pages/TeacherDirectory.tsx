import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Beaker,
  BookOpen,
  Calculator,
  FlaskConical,
  GraduationCap,
  Languages,
  Layers,
  ListChecks,
  Loader2,
  Lock,
  Network,
  PlayCircle,
  Plus,
  ScrollText,
  Settings,
  Sparkles,
  Video,
} from "lucide-react";
import AdminTeachersTab from "@/components/AdminTeachersTab";
import type { AppLanguage } from "@/components/LanguageGate";
import biologyTheme from "@/assets/themes/biology.png";
import type { MainMenuChoice } from "@/pages/MainMenu";
import { supabase } from "@/integrations/supabase/client";
import {
  isTeacherToolKey,
  TEACHER_TOOL_CATALOG,
  type TeacherToolKey,
} from "@/lib/teacherTools";
import {
  DEFAULT_PHYSICS_FLASHCARD_LIST_ID,
  FLASHCARD_LISTS,
  isFlashcardListId,
  type FlashcardListDefinition,
} from "@/lib/flashcardLists";
import {
  BIOLOGY_FLASHCARD_TEACHER_STORAGE_KEY,
  CHEMISTRY_FLASHCARD_TEACHER_STORAGE_KEY,
  PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY,
  SUBJECT_STORAGE_KEY,
} from "@/pages/Subjects";

type TeacherProfile = {
  id: string;
  name: string;
  background_image_url: string;
  tools: string[] | null;
  flashcard_list_ids: string[] | null;
  sort_order: number;
};

const NADIA_TEACHER_ID = "nadia-al-nuaimy";
const NADIA_ARABIC_LECTURE_COUNT = 39;

const BUILT_IN_NADIA_PROFILE: TeacherProfile = {
  id: NADIA_TEACHER_ID,
  name: "نادية النعيمي",
  background_image_url: biologyTheme,
  tools: [],
  flashcard_list_ids: [],
  sort_order: 10_000,
};

const isNadiaProfile = (teacher: TeacherProfile) => {
  if (teacher.id === NADIA_TEACHER_ID) return true;
  const name = teacher.name.trim().toLocaleLowerCase();
  const latinName = name.replace(/[^a-z]/g, "");
  return (name.includes("نادية") && name.includes("النعيمي"))
    || (latinName.includes("nadia") && (latinName.includes("nuaimy") || latinName.includes("nuamey")));
};

const toolIcons: Partial<Record<TeacherToolKey, React.ComponentType<{ className?: string }>>> = {
  subjectsHub: BookOpen,
  flashcards: Layers,
  mcqBank: Layers,
  ministerialBank: ScrollText,
  examGenerator: GraduationCap,
  problemGenerator: Calculator,
  physicsProblemSolver: Calculator,
  physicsLaws: Atom,
  physicsSchemes: Network,
  physicsActivities: Atom,
  chemistryExperiments: Beaker,
  chemicalEquations: FlaskConical,
  biologySchemes: Network,
  biologyDrawings: BookOpen,
  englishVerbForms: Languages,
  englishReadingPractice: Languages,
  englishEssays: Languages,
  poemsChecker: ScrollText,
  frenchSynonyms: Languages,
  frenchAntonyms: Languages,
  adminNotes: Sparkles,
  ourCourses: GraduationCap,
  summaries: BookOpen,
  mindmap: Network,
  youtube: PlayCircle,
};

const copy = {
  ar: {
    title: "مدرسونا",
    description: "اختَر المدرّس حتى تشوف الأدوات والمحتوى الخاص بيه.",
    back: "العودة للرئيسية",
    backToTeachers: "العودة للمدرسين",
    backToTeacherContent: "العودة لمحتوى الأستاذة",
    teacherTools: "أدوات المدرّس",
    open: "فتح الأداة",
    empty: "ماكو مدرسين مضافين حالياً.",
    noTools: "لم تُضف أدوات لهذا المدرّس بعد.",
    loadError: "تعذر تحميل المدرسين. جرّب مرة ثانية.",
    manage: "إضافة وإدارة المدرسين",
    manageTitle: "إدارة المدرسين",
    closeManage: "العودة إلى قائمة المدرسين",
    flashcardLists: "قوائم البطاقات التعليمية",
    chooseList: "اختَر قائمة البطاقات",
  },
  en: {
    title: "Our Teachers",
    description: "Choose a teacher to see their selected tools and learning content.",
    back: "Back to home",
    backToTeachers: "Back to teachers",
    backToTeacherContent: "Back to teacher content",
    teacherTools: "Teacher tools",
    open: "Open tool",
    empty: "No teachers have been added yet.",
    noTools: "No tools have been assigned to this teacher yet.",
    loadError: "Teachers could not be loaded. Please try again.",
    manage: "Add and manage teachers",
    manageTitle: "Manage teachers",
    closeManage: "Back to teacher list",
    flashcardLists: "Flashcard lists",
    chooseList: "Choose a flashcard list",
  },
} as const;

const nadiaCopy = {
  ar: {
    subject: "الأحياء",
    teacherTools: "أدوات الأستاذة",
    content: "المحاضرات وبنك الأسئلة",
    description: "افتح قائمة محاضرات المنهج العربي من المحاضرة 1 إلى المحاضرة 39.",
    lectures: "محاضرات المنهج العربي",
    lecture: "المحاضرة",
    curriculum: "المنهج العربي",
    listDescription: "39 محاضرة مرتبة للمنهج العربي.",
    open: "عرض المحاضرات",
    comingSoon: "قريباً",
  },
  en: {
    subject: "Biology",
    teacherTools: "Teacher tools",
    content: "Lectures & MCQ Bank",
    description: "Open the Arabic-curriculum lecture list from Lecture 1 through Lecture 39.",
    lectures: "Arabic Curriculum Lectures",
    lecture: "Lecture",
    curriculum: "Arabic Curriculum",
    listDescription: "39 Arabic-curriculum lectures in order.",
    open: "View lectures",
    comingSoon: "Coming soon",
  },
} as const;

function NadiaDirectoryContent({
  teacher,
  language,
  view,
  onOpenLectures,
}: {
  teacher: TeacherProfile;
  language: AppLanguage;
  view: "overview" | "lectures";
  onOpenLectures: () => void;
}) {
  const text = nadiaCopy[language];

  if (view === "lectures") {
    return (
      <>
        <header className="mb-7 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
            <Video className="h-4 w-4" /> {text.curriculum}
          </span>
          <h1 className="text-3xl font-black sm:text-4xl">{text.lectures}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{text.listDescription}</p>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label={text.lectures}>
          {Array.from({ length: NADIA_ARABIC_LECTURE_COUNT }, (_, index) => index + 1).map((lectureNumber) => (
            <button
              type="button"
              key={lectureNumber}
              disabled
              aria-label={`${text.lecture} ${lectureNumber} — ${text.comingSoon}`}
              className="flex min-h-24 cursor-not-allowed items-center gap-4 rounded-2xl border border-border bg-muted/35 p-4 text-start opacity-75"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                <Lock className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-black text-foreground">{text.lecture} {lectureNumber}</span>
                <span className="mt-1 block text-xs font-bold text-muted-foreground">{text.curriculum}</span>
                <span className="mt-1 block text-xs font-bold text-amber-600 dark:text-amber-300">{text.comingSoon}</span>
              </span>
            </button>
          ))}
        </section>
      </>
    );
  }

  return (
    <>
      <section
        className="relative isolate mb-8 min-h-[260px] overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900 bg-cover bg-center shadow-xl"
        style={{ backgroundImage: `url(${JSON.stringify(teacher.background_image_url).slice(1, -1)})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-slate-900/55 to-emerald-900/10" />
        <div className="relative flex min-h-[260px] flex-col justify-end p-6 text-white sm:p-9">
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-bold backdrop-blur">
            <GraduationCap className="h-4 w-4" /> {text.subject}
          </span>
          <h1 className="text-3xl font-black sm:text-5xl">{teacher.name}</h1>
        </div>
      </section>

      <section className="max-w-2xl" aria-label={text.teacherTools}>
        <button
          type="button"
          onClick={onOpenLectures}
          className="group w-full rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-card to-sky-500/10 p-6 text-start shadow-sm transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <span className="mb-5 flex h-12 w-[5.5rem] items-center justify-center gap-2 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
            <Video className="h-5 w-5" />
            <span className="h-5 w-px bg-white/35" />
            <ListChecks className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-black">{text.content}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{text.description}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-violet-600 dark:text-violet-300">
            {text.open} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </span>
        </button>
      </section>
    </>
  );
}

const TeacherDirectory = ({
  language,
  onBack,
  onSelect,
}: {
  language: AppLanguage;
  onBack: () => void;
  onSelect: (choice: MainMenuChoice) => void;
}) => {
  const isRTL = language === "ar";
  const text = copy[language];
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [managing, setManaging] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [choosingFlashcardList, setChoosingFlashcardList] = useState(false);
  const [nadiaView, setNadiaView] = useState<"overview" | "lectures">("overview");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      const { data } = await supabase.rpc("has_role", {
        _user_id: authData.user.id,
        _role: "admin",
      });
      if (active) setCanManage(Boolean(data));
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(false);
      const { data, error: loadError } = await supabase
        .from("platform_teachers")
        .select("id,name,background_image_url,tools,flashcard_list_ids,sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (!active) return;
      if (loadError) {
        console.error("Failed to load teacher directory", loadError);
        setError(true);
        setTeachers([]);
      } else {
        setTeachers((data ?? []) as TeacherProfile[]);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [refreshVersion]);

  const directoryTeachers = useMemo(() => {
    if (teachers.some(isNadiaProfile)) return teachers;
    return [...teachers, BUILT_IN_NADIA_PROFILE];
  }, [teachers]);

  const selected = directoryTeachers.find((teacher) => teacher.id === selectedId) ?? null;
  const selectedIsNadia = selected ? isNadiaProfile(selected) : false;
  const selectedTools = useMemo(() => {
    if (!selected) return [];
    const assigned = new Set((selected.tools ?? []).filter(isTeacherToolKey));
    return TEACHER_TOOL_CATALOG.filter((tool) => assigned.has(tool.key));
  }, [selected]);

  const selectedFlashcardLists = useMemo(() => {
    if (!selected) return [];
    const configured = (selected.flashcard_list_ids ?? []).filter(isFlashcardListId);
    const listIds = configured.length > 0 ? configured : [DEFAULT_PHYSICS_FLASHCARD_LIST_ID];
    return FLASHCARD_LISTS.filter((list) => listIds.includes(list.id));
  }, [selected]);

  const openFlashcardList = (list: FlashcardListDefinition) => {
    localStorage.setItem(SUBJECT_STORAGE_KEY, list.subject);
    if (list.subject === "physics") {
      sessionStorage.setItem(PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY, list.selectorValue);
    }
    if (list.subject === "biology") {
      sessionStorage.setItem(BIOLOGY_FLASHCARD_TEACHER_STORAGE_KEY, list.selectorValue);
    }
    if (list.subject === "chemistry") {
      sessionStorage.setItem(CHEMISTRY_FLASHCARD_TEACHER_STORAGE_KEY, list.selectorValue);
    }
    window.dispatchEvent(new CustomEvent("app:set-subject", { detail: { subject: list.subject } }));
    onSelect("flashcards");
  };

  const openTeacherTool = (key: TeacherToolKey) => {
    if (key !== "flashcards") {
      onSelect(key);
      return;
    }
    if (selectedFlashcardLists.length === 1) {
      openFlashcardList(selectedFlashcardLists[0]);
      return;
    }
    setChoosingFlashcardList(true);
  };

  const closeManager = () => {
    setManaging(false);
    setRefreshVersion((version) => version + 1);
  };
  const backAction = managing
    ? closeManager
    : choosingFlashcardList
      ? () => setChoosingFlashcardList(false)
      : selectedIsNadia && nadiaView === "lectures"
        ? () => setNadiaView("overview")
      : selected
        ? () => {
            setSelectedId(null);
            setNadiaView("overview");
          }
        : onBack;

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 pb-32 pt-6 text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={backAction}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            {managing
              ? text.closeManage
              : choosingFlashcardList
                ? text.backToTeachers
                : selectedIsNadia && nadiaView === "lectures"
                  ? text.backToTeacherContent
                  : selected
                    ? text.backToTeachers
                    : text.back}
          </button>
          {canManage && !managing && !selected && (
            <button
              type="button"
              onClick={() => setManaging(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" /> {text.manage}
            </button>
          )}
        </div>

        {managing && canManage ? (
          <>
            <header className="mb-6 rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-black text-primary">
                <Settings className="h-4 w-4" /> {text.manageTitle}
              </span>
              <p className="text-sm leading-6 text-muted-foreground">
                {isRTL
                  ? "أضف اسم المدرّس وصورة الخلفية، وحدد الأدوات التي تظهر للطلاب عند الضغط عليه."
                  : "Add the teacher name and background, then select the tools students see when opening the teacher."}
              </p>
            </header>
            <AdminTeachersTab />
          </>
        ) : selected && choosingFlashcardList ? (
          <>
            <header className="mb-7 text-center">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-black text-blue-600 dark:text-blue-300">
                <Layers className="h-4 w-4" /> {text.flashcardLists}
              </span>
              <h1 className="text-3xl font-black sm:text-4xl">{text.chooseList}</h1>
              <p className="mt-2 text-muted-foreground">{selected.name}</p>
            </header>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedFlashcardLists.map((list) => (
                <button
                  type="button"
                  key={list.id}
                  onClick={() => openFlashcardList(list)}
                  className="group rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-500/15 via-card to-indigo-500/10 p-5 text-start shadow-sm transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg"
                >
                  <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white"><Layers className="h-6 w-6" /></span>
                  <h2 className="text-lg font-black">{isRTL ? list.nameAr : list.nameEn}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{isRTL ? list.subjectAr : list.subjectEn}</p>
                </button>
              ))}
            </section>
          </>
        ) : selectedIsNadia && selected ? (
          <NadiaDirectoryContent
            teacher={selected}
            language={language}
            view={nadiaView}
            onOpenLectures={() => setNadiaView("lectures")}
          />
        ) : selected ? (
          <>
            <section
              className="relative isolate mb-8 min-h-[260px] overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900 bg-cover bg-center shadow-xl"
              style={{ backgroundImage: `url(${JSON.stringify(selected.background_image_url).slice(1, -1)})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/55 to-slate-900/10" />
              <div className="relative flex min-h-[260px] flex-col justify-end p-6 text-white sm:p-9">
                <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  <GraduationCap className="h-4 w-4" /> {text.teacherTools}
                </span>
                <h1 className="text-3xl font-black sm:text-5xl">{selected.name}</h1>
              </div>
            </section>

            {selectedTools.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">{text.noTools}</div>
            ) : (
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={text.teacherTools}>
                {selectedTools.map((tool) => {
                  const Icon = toolIcons[tool.key] ?? Sparkles;
                  return (
                    <button
                      type="button"
                      key={tool.key}
                      onClick={() => openTeacherTool(tool.key)}
                      className="group min-h-40 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-sky-500/10 p-5 text-start shadow-sm transition-all hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h2 className="text-lg font-black">{isRTL ? tool.labelAr : tool.labelEn}</h2>
                      {tool.key === "flashcards" && selectedFlashcardLists.length > 0 && (
                        <p className="mt-1 text-xs font-semibold text-muted-foreground">
                          {selectedFlashcardLists.map((list) => isRTL ? list.nameAr : list.nameEn).join(" · ")}
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary">
                        {text.open}
                        <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                      </span>
                    </button>
                  );
                })}
              </section>
            )}
          </>
        ) : (
          <>
            <header className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-black text-primary">
                <GraduationCap className="h-4 w-4" /> {text.title}
              </span>
              <h1 className="text-3xl font-black sm:text-5xl">{text.title}</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{text.description}</p>
            </header>

            {loading ? (
              <div className="flex min-h-52 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <>
                {error && (
                  <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center text-sm text-red-600 dark:text-red-300">{text.loadError}</div>
                )}
                {directoryTeachers.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">{text.empty}</div>
                ) : (
                  <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {directoryTeachers.map((teacher) => (
                      <button
                        type="button"
                        key={teacher.id}
                        onClick={() => {
                          setNadiaView("overview");
                          setSelectedId(teacher.id);
                        }}
                        className="group relative isolate min-h-[280px] overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900 bg-cover bg-center text-start shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        style={{ backgroundImage: `url(${JSON.stringify(teacher.background_image_url).slice(1, -1)})` }}
                      >
                        <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent transition-colors group-hover:via-slate-900/25" />
                        <span className="absolute inset-x-5 bottom-5 text-white">
                          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
                            <GraduationCap className="h-3.5 w-3.5" /> {text.teacherTools}
                          </span>
                          <span className="flex items-end justify-between gap-4">
                            <span className="text-2xl font-black leading-tight">{teacher.name}</span>
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-900 transition-transform group-hover:scale-110">
                              <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                            </span>
                          </span>
                        </span>
                      </button>
                    ))}
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default TeacherDirectory;
