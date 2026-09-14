import { useState } from "react";
import { ArrowRight, Search, BookOpen } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import type { MainMenuChoice } from "@/pages/MainMenu";
import { useHiddenStudyTools } from "@/lib/studyToolVisibility";

type Tool = [MainMenuChoice, string, string, string, string];
type Group = [string, string, Tool[]];
const GROUPS: Group[] = [
  [
    "Learn",
    "تعلّم",
    [
      [
        "subjectsHub",
        "Subjects",
        "المواد",
        "Choose a subject and its study tools.",
        "اختَر مادة وأدواتها."
      ],
      [
        "ourCourses",
        "Courses",
        "الدورات",
        "Browse available courses.",
        "تصفّح الدورات المتاحة."
      ],
      [
        "teachers",
        "Teachers",
        "المدرسون",
        "Find teachers and lectures.",
        "اختَر مدرساً ومحاضراته."
      ],
      [
        "flashcards",
        "Flashcards",
        "البطاقات",
        "Review questions from memory.",
        "راجع المعلومات من ذاكرتك."
      ],
      [
        "malazam",
        "Booklets",
        "الملازم",
        "Find study materials by subject.",
        "تصفّح الملازم حسب المادة."
      ],
      [
        "summaries",
        "Summaries",
        "الملخصات",
        "Browse shared study notes.",
        "تصفّح ملخصات الدراسة."
      ],
      [
        "adminNotes",
        "Enrichments",
        "الإثرائيات",
        "Read instructor study cards.",
        "اقرأ بطاقات المدرسين."
      ]
    ]
  ],
  [
    "Practise",
    "تدرّب",
    [
      [
        "mcqBank",
        "Question bank",
        "بنك الأسئلة",
        "Practise ready-made questions.",
        "حل أسئلة جاهزة."
      ],
      [
        "ministerialBank",
        "Past exams",
        "الوزاريات",
        "Review ministerial questions.",
        "راجع الأسئلة الوزارية."
      ],
      [
        "mistakes",
        "My mistakes",
        "أخطائي",
        "Revisit questions you missed.",
        "راجع الأسئلة التي أخطأت بها."
      ],
      [
        "mcq",
        "Generate questions",
        "مولّد الأسئلة",
        "Create questions from your file.",
        "حوّل ملفك إلى أسئلة."
      ],
      [
        "essay",
        "Answer checker",
        "المصحّح",
        "Check your written answers.",
        "راجع إجاباتك المكتوبة."
      ]
    ]
  ],
  [
    "Create",
    "اكتب ونظّم",
    [
      [
        "notes",
        "My notes",
        "ملاحظاتي",
        "Write and organise your notes.",
        "اكتب ملاحظاتك ورتّبها."
      ],
      [
        "canvas",
        "Canvas",
        "اللوحة",
        "Draw and explain your ideas.",
        "ارسم أفكارك واشرحها."
      ],
      [
        "mindmap",
        "Mind maps",
        "الخرائط الذهنية",
        "Connect the main ideas.",
        "اربط الأفكار الرئيسية."
      ],
      [
        "videoNotes",
        "Video to notes",
        "الفيديو إلى ملاحظات",
        "Turn a lecture into notes.",
        "حوّل المحاضرة إلى ملاحظات."
      ],
      [
        "podcastTutor",
        "Audio tutor",
        "المعلّم الصوتي",
        "Listen and check your understanding.",
        "استمع واختبر فهمك."
      ],
      [
        "youtube",
        "Video player",
        "مشغّل الفيديو",
        "Watch a lecture.",
        "شاهد محاضرتك."
      ],
      [
        "textToVideo",
        "Text to video",
        "النص إلى فيديو",
        "Create a video from text.",
        "أنشئ فيديو من النص."
      ]
    ]
  ],
  [
    "Plan",
    "خطّط",
    [
      [
        "todo",
        "To-do list",
        "قائمة المهام",
        "Choose what to finish today.",
        "حدّد مهامك لليوم."
      ],
      [
        "missions",
        "Chapter checklist",
        "الفهرست",
        "Track completed topics.",
        "تابع المواضيع المنجزة."
      ],
      [
        "sessions",
        "Study sessions",
        "جلسات الدراسة",
        "Focus with a timer and study rooms.",
        "ركّز بالمؤقّت وغرف الدراسة."
      ],
      [
        "report",
        "My progress",
        "تقدمي",
        "Review your study progress.",
        "راجع تقدّمك الدراسي."
      ],
      [
        "companion",
        "Study companion",
        "رفيق النجاح",
        "Get help planning your study.",
        "مساعدة في التخطيط لدراستك."
      ]
    ]
  ],
  [
    "Community",
    "المجتمع",
    [
      [
        "liveBattle",
        "Live battle",
        "المعركة المباشرة",
        "Practise with a friend.",
        "تدرّب مع صديق."
      ],
      [
        "dailyGame",
        "Daily game",
        "لعبة اليوم",
        "Try today's challenge.",
        "جرّب تحدي اليوم."
      ],
      [
        "leaderboard",
        "Leaderboard",
        "المتصدرون",
        "See student rankings.",
        "شاهد ترتيب الطلاب."
      ],
      [
        "news",
        "News",
        "الأخبار",
        "Read announcements.",
        "اقرأ الإعلانات."
      ],
      [
        "advices",
        "Study tips",
        "نصائح الدراسة",
        "Read other students' advice.",
        "اقرأ نصائح الطلاب."
      ]
    ]
  ]
];

const More = ({ language, onSelect, onNav }: {
  language: AppLanguage;
  onSelect: (key: MainMenuChoice) => void;
  onNav: (key: MainMenuChoice) => void;
}) => {
  const isRTL = language === "ar";
  const hidden = useHiddenStudyTools();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const normalized = query.trim().toLocaleLowerCase();
  const groups = GROUPS.filter(([name]) => category === "All" || category === name)
    .map(([en, ar, items]) => ({ en, ar, items: items.filter(([key, ...text]) =>
      !hidden.has(key) && (!normalized || text.join(" ").toLocaleLowerCase().includes(normalized))) }))
    .filter((group) => group.items.length > 0);

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 py-6 pb-32 text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => onNav("basics")} className="mb-6 min-h-11 rounded-xl border border-border px-4 py-2 text-sm font-semibold">
          {isRTL ? "العودة للرئيسية" : "Back to home"}
        </button>
        <header className="mb-6">
          <p className="mb-2 text-sm text-primary">{isRTL ? "أداة مناسبة لكل خطوة" : "The right tool for each step"}</p>
          <h1 className="text-3xl font-bold">{isRTL ? "شنو تحتاج اليوم؟" : "What do you need today?"}</h1>
          <p className="mt-3 leading-7 text-muted-foreground">{isRTL ? "اختَر هدفك أو ابحث عن أداة. مو لازم تستخدم كل الأدوات — ابدأ باللي يفيدك." : "Choose your goal or search for a tool. Start with what helps you; you don't need every feature."}</p>
        </header>
        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-semibold">{isRTL ? "البحث عن أداة" : "Find a tool"}</span>
          <span className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary">
            <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder={isRTL ? "مثلاً: أسئلة، ملاحظات، محاضرة…" : "Questions, notes, lectures…"}
              className="min-h-12 w-full bg-transparent py-3 text-foreground outline-none" />
          </span>
        </label>
        <div className="mb-8 flex flex-wrap gap-2" aria-label={isRTL ? "تصنيف الأدوات" : "Tool categories"}>
          {[["All", "الكل"], ...GROUPS.map(([en, ar]) => [en, ar])].map(([en, ar]) => (
            <button key={en} type="button" onClick={() => setCategory(en)} aria-pressed={category === en}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${category === en ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}>
              {isRTL ? ar : en}
            </button>
          ))}
        </div>
        <p className="mb-5 text-sm text-muted-foreground">{isRTL ? "بعض الأدوات تتطلب اشتراكاً أو نقاطاً؛ شروط الوصول الحالية تبقى مطبّقة." : "Some tools require a subscription or points; existing access rules still apply."}</p>
        {groups.length === 0 && <div role="status" className="rounded-2xl border border-border p-6 text-center">
          <p>{isRTL ? "ما لكينا أداة بهذا الاسم." : "No matching tool found."}</p>
          <button type="button" onClick={() => { setQuery(""); setCategory("All"); }} className="mt-3 min-h-11 px-4 text-primary underline">{isRTL ? "عرض كل الأدوات" : "Show all tools"}</button>
        </div>}
        {groups.map((group) => (
          <section key={group.en} className="mb-8">
            <h2 className="mb-3 text-xl font-bold">{isRTL ? group.ar : group.en}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map(([key, en, ar, descEn, descAr]) => (
                <button key={key} type="button" onClick={() => onSelect(key)}
                  className="group flex min-h-28 items-start gap-3 rounded-2xl border border-border bg-background p-4 text-start text-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <BookOpen className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1"><span className="block font-bold leading-7">{isRTL ? ar : en}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{isRTL ? descAr : descEn}</span></span>
                  <ArrowRight className={`mt-1 h-4 w-4 shrink-0 text-primary ${isRTL ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};
export default More;
