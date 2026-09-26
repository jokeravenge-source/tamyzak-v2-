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
  Loader2,
  Network,
  PlayCircle,
  Plus,
  ScrollText,
  Settings,
  Sparkles,
} from "lucide-react";
import AdminTeachersTab from "@/components/AdminTeachersTab";
import type { AppLanguage } from "@/components/LanguageGate";
import type { MainMenuChoice } from "@/pages/MainMenu";
import { supabase } from "@/integrations/supabase/client";
import {
  isTeacherToolKey,
  TEACHER_TOOL_CATALOG,
  type TeacherToolKey,
} from "@/lib/teacherTools";

type TeacherProfile = {
  id: string;
  name: string;
  background_image_url: string;
  tools: string[] | null;
  sort_order: number;
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
    teacherTools: "أدوات المدرّس",
    open: "فتح الأداة",
    empty: "ماكو مدرسين مضافين حالياً.",
    noTools: "لم تُضف أدوات لهذا المدرّس بعد.",
    loadError: "تعذر تحميل المدرسين. جرّب مرة ثانية.",
    manage: "إضافة وإدارة المدرسين",
    manageTitle: "إدارة المدرسين",
    closeManage: "العودة إلى قائمة المدرسين",
  },
  en: {
    title: "Our Teachers",
    description: "Choose a teacher to see their selected tools and learning content.",
    back: "Back to home",
    backToTeachers: "Back to teachers",
    teacherTools: "Teacher tools",
    open: "Open tool",
    empty: "No teachers have been added yet.",
    noTools: "No tools have been assigned to this teacher yet.",
    loadError: "Teachers could not be loaded. Please try again.",
    manage: "Add and manage teachers",
    manageTitle: "Manage teachers",
    closeManage: "Back to teacher list",
  },
} as const;

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
        .select("id,name,background_image_url,tools,sort_order")
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

  const selected = teachers.find((teacher) => teacher.id === selectedId) ?? null;
  const selectedTools = useMemo(() => {
    if (!selected) return [];
    const assigned = new Set((selected.tools ?? []).filter(isTeacherToolKey));
    return TEACHER_TOOL_CATALOG.filter((tool) => assigned.has(tool.key));
  }, [selected]);

  const closeManager = () => {
    setManaging(false);
    setRefreshVersion((version) => version + 1);
  };
  const backAction = managing ? closeManager : selected ? () => setSelectedId(null) : onBack;

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
            {managing ? text.closeManage : selected ? text.backToTeachers : text.back}
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
                      onClick={() => onSelect(tool.key)}
                      className="group min-h-40 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-sky-500/10 p-5 text-start shadow-sm transition-all hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h2 className="text-lg font-black">{isRTL ? tool.labelAr : tool.labelEn}</h2>
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
            ) : error ? (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center text-red-600 dark:text-red-300">{text.loadError}</div>
            ) : teachers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">{text.empty}</div>
            ) : (
              <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {teachers.map((teacher) => (
                  <button
                    type="button"
                    key={teacher.id}
                    onClick={() => setSelectedId(teacher.id)}
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
      </div>
    </main>
  );
};

export default TeacherDirectory;
