import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { useHiddenStudyTools } from "@/lib/studyToolVisibility";
import { normalizeStudySearch } from "@/lib/studySearch";
import type { MainMenuChoice } from "@/pages/MainMenu";

export type SearchNavChoice = MainMenuChoice;

type Entry = {
  key: SearchNavChoice;
  en: { title: string; desc: string; tags?: string };
  ar: { title: string; desc: string; tags?: string };
  keywords?: string[];
};

const ENTRIES: Entry[] = [
  { key: "subjectsHub", en: { title: "Subjects", desc: "Choose a subject and its study tools" }, ar: { title: "المواد", desc: "اختَر مادة وافتح أدواتها الدراسية" } },
  { key: "ourTeachers", en: { title: "Our Teachers", desc: "Find your teacher's lectures, flashcards and MCQs" }, ar: { title: "مدرسونا", desc: "محاضرات وبطاقات وأسئلة المدرسين", tags: "نادية النعيمي احمد النداوي محمد النداوي" } },
  { key: "ourCourses", en: { title: "Our Courses", desc: "Browse your courses and lessons" }, ar: { title: "دوراتنا", desc: "الدورات والدروس المتاحة" } },
  { key: "mcqBank", en: { title: "MCQ Bank", desc: "Practise questions by subject and chapter" }, ar: { title: "بنك أسئلة MCQ", desc: "حل أسئلة الاختيار من متعدد حسب المادة والفصل" }, keywords: ["quiz", "questions", "mcqs", "اختبارات", "اسئلة"] },
  { key: "mistakes", en: { title: "My Mistakes", desc: "Review your incorrect answers and due questions" }, ar: { title: "أخطائي", desc: "راجع إجاباتك الخاطئة والأسئلة المستحقة" } },
  { key: "examGenerator", en: { title: "Exam Generator", desc: "Build a practice exam for your subject" }, ar: { title: "توليد امتحان", desc: "كوّن امتحاناً تدريبياً للمادة" } },
  { key: "physicsLaws", en: { title: "Physics Laws & Units", desc: "Find formulas and units" }, ar: { title: "قوانين ووحدات الفيزياء", desc: "راجع القوانين والرموز والوحدات" } },
  { key: "physicsActivities", en: { title: "Physics Activities", desc: "Experiments and practical explanations" }, ar: { title: "أنشطة الفيزياء", desc: "تجارب وشروحات عملية" } },
  { key: "physicsProblemSolver", en: { title: "Physics Problem Solver", desc: "Work through a physics problem" }, ar: { title: "حل مسائل الفيزياء", desc: "تدرّب على خطوات حل المسائل" } },
  { key: "problemGenerator", en: { title: "Problem Generator", desc: "Generate practice problems" }, ar: { title: "مولّد المسائل", desc: "ولّد مسائل للتدريب" } },
  { key: "organicEquations", en: { title: "Organic Equations", desc: "Review organic chemistry reactions" }, ar: { title: "تفاعلات العضوية", desc: "راجع تفاعلات الكيمياء العضوية" } },
  { key: "chemistryExperiments", en: { title: "Chemistry Experiments", desc: "Explore chemistry experiments" }, ar: { title: "تجارب الكيمياء", desc: "تعلّم التجارب الكيميائية" } },
  { key: "englishVerbForms", en: { title: "English Verb Forms", desc: "Study verb conjugations" }, ar: { title: "تصريف الأفعال", desc: "راجع تصاريف الأفعال الإنكليزية" } },
  { key: "englishReadingPractice", en: { title: "English Reading Practice", desc: "Practise reading comprehension" }, ar: { title: "تدريب القطعة الإنكليزية", desc: "تدرّب على قراءة القطع وفهمها" } },
  { key: "frenchSynonyms", en: { title: "French Synonyms", desc: "Study matching vocabulary" }, ar: { title: "مرادفات الفرنسية", desc: "راجع الكلمات المتشابهة بالمعنى" } },
  { key: "frenchAntonyms", en: { title: "French Antonyms", desc: "Study opposite vocabulary" }, ar: { title: "معاكسات الفرنسية", desc: "راجع الكلمات المتعاكسة" } },
  { key: "frenchConjugator", en: { title: "French Conjugator", desc: "All forms, moods, and tenses" }, ar: { title: "مصرّف الأفعال الفرنسية", desc: "جميع الصيغ والأزمنة" },
    keywords: ["french", "conjugator", "conjugation", "verbs", "moods", "tenses", "فرنسي", "فرنسية", "تصريف", "أفعال", "محمد علي الكناني"] },
  { key: "notes", en: { title: "My Notes", desc: "Your notebooks and study notes" }, ar: { title: "ملاحظاتي", desc: "دفاترك وملاحظاتك الدراسية" } },
  { key: "canvas", en: { title: "Canvas", desc: "Draw, sketch and organise ideas" }, ar: { title: "اللوحة", desc: "ارسم ورتب أفكارك" } },
  { key: "youtube", en: { title: "YouTube Lectures", desc: "Watch lectures in your study space" }, ar: { title: "محاضرات يوتيوب", desc: "شاهد المحاضرات داخل مساحة الدراسة" } },
  { key: "podcastTutor", en: { title: "Podcast Tutor", desc: "Study with spoken explanations" }, ar: { title: "المعلم الصوتي", desc: "راجع الدروس بالشروحات الصوتية" } },
  { key: "liveBattle", en: { title: "Live Battle", desc: "Challenge a friend to an MCQ round" }, ar: { title: "التحدي المباشر", desc: "تحدَّ صديقك بجولة أسئلة" } },
  { key: "chemicalEquations", en: { title: "Chemical Equation", desc: "19 equations by topic with memory hints" }, ar: { title: "المعادلات الكيميائية", desc: "معادلات حسب الموضوع مع تلميحات للحفظ" },
    keywords: ["chemistry", "chemical", "equations", "reactions", "enthalpy", "redox", "zinc", "memorize", "كيمياء", "معادلات", "تفاعلات", "حرارية", "اتزان", "اكسدة", "اختزال", "حفظ"] },
  { key: "basics", en: { title: "The Basics", desc: "Hub for essential study tools" }, ar: { title: "الأساسيات", desc: "كل أدواتك الدراسية" },
    keywords: ["home", "main", "menu", "dashboard", "hub", "start", "tools", "رئيسية", "أساسيات", "قائمة"] },
  { key: "report", en: { title: "Daily Report", desc: "AI insights on today's study", tags: "parent follow" }, ar: { title: "تقريري اليومي", desc: "تحليل ذكي ليومك", tags: "ولي الأمر" },
    keywords: ["parent", "mom", "dad", "father", "mother", "family", "progress", "share", "follow", "tracking", "track", "review", "stats", "analytics", "insight", "today", "summary", "success companion", "excellence", "ولي الأمر", "أهل", "أب", "أم", "تقرير", "متابعة", "تقدم", "مشاركة", "إحصائيات", "تحليل"] },
  { key: "flashcards", en: { title: "Flashcards", desc: "Study Q&A cards" }, ar: { title: "البطاقات", desc: "بطاقات السؤال والجواب" },
    keywords: ["cards", "qa", "question", "answer", "study", "memorize", "memorization", "revise", "review", "بطاقات", "أسئلة", "حفظ", "مذاكرة", "مراجعة"] },
  { key: "malazam", en: { title: "Malazam", desc: "Booklets & notes" }, ar: { title: "الملازم", desc: "ملازم ومذكرات" },
    keywords: ["booklet", "book", "notes", "pdf", "documents", "files", "library", "ملزمة", "ملازم", "كتب", "مذكرات", "ملفات", "مكتبة"] },
  { key: "summaries", en: { title: "Notes & Summaries", desc: "Community summaries" }, ar: { title: "الملخصات", desc: "ملاحظات وملخصات" },
    keywords: ["summary", "notes", "share", "upload", "community", "ملخص", "ملاحظات", "رفع"] },
  { key: "adminNotes", en: { title: "Enrichments", desc: "Instructor-made enrichment cards" }, ar: { title: "الإثرائيات", desc: "بطاقات إثرائية من المدرّسين" },
    keywords: ["enrichment", "enrichments", "instructor", "teacher", "cards", "إثراء", "إثرائيات", "مدرس", "بطاقات"] },
  { key: "whoIsBest", en: { title: "Who Is Best?", desc: "Vote for teachers and view the ranking" }, ar: { title: "من الأفضل؟", desc: "صوّت للمدرسين وشوف الترتيب" },
    keywords: ["teacher", "vote", "poll", "best", "ranking", "competition", "مدرس", "تصويت", "الأفضل", "ترتيب", "منافسة"] },
  { key: "missions", en: { title: "My Missions", desc: "Chapter checklists" }, ar: { title: "مهماتي", desc: "مواضيع كل فصل" },
    keywords: ["tasks", "goals", "checklist", "chapters", "topics", "progress", "checkoff", "مهام", "أهداف", "فصول", "مواضيع", "تقدم"] },
  { key: "mcq", en: { title: "MCQ Generator", desc: "Generate MCQs from a file" }, ar: { title: "مولّد الأسئلة", desc: "أسئلة من ملف" },
    keywords: ["multiple choice", "quiz", "questions", "test", "exam", "ai", "generate", "اختبار", "أسئلة", "امتحان", "اختيار من متعدد", "كويز"] },
  { key: "sessions", en: { title: "Sessions", desc: "Study timer & leaderboard" }, ar: { title: "الجلسات", desc: "وقت دراستك" },
    keywords: ["timer", "pomodoro", "study time", "track time", "stopwatch", "focus", "concentration", "مؤقت", "وقت", "تركيز", "دراسة"] },
  { key: "videoNotes", en: { title: "Video to Notes", desc: "YouTube → notes" }, ar: { title: "فيديو إلى ملاحظات", desc: "يوتيوب إلى ملاحظات" },
    keywords: ["youtube", "video", "transcript", "lecture", "summarize", "notes", "فيديو", "يوتيوب", "محاضرة", "ملاحظات"] },
  { key: "account", en: { title: "Account Center", desc: "Settings, countdown event, profile" }, ar: { title: "مركز الحساب", desc: "الإعدادات والملف الشخصي" },
    keywords: ["profile", "settings", "username", "name", "avatar", "countdown", "timer", "event", "exam date", "theme", "language", "preferences", "signout", "logout", "telegram", "linked", "حساب", "إعدادات", "اسم", "ملف شخصي", "موعد", "عد تنازلي", "امتحان", "تليغرام", "خروج"] },
  { key: "biologyDrawings", en: { title: "Biology Drawings", desc: "Labeled diagrams" }, ar: { title: "رسومات الأحياء", desc: "رسومات معنونة" },
    keywords: ["biology", "diagrams", "drawings", "labels", "anatomy", "cell", "أحياء", "رسومات", "تشريح", "خلية"] },
  { key: "biologySchemes", en: { title: "Biology Schemes", desc: "Visual step-by-step Biology texts" }, ar: { title: "مخططات", desc: "شرح نصوص الأحياء بالصور خطوة بخطوة" },
    keywords: ["biology", "schemes", "visual", "parts", "text", "أحياء", "مخططات", "صور", "نص", "شرح"] },
  { key: "physicsSchemes", en: { title: "Physics Schemes", desc: "Illustrated Physics lessons in short steps" }, ar: { title: "مخططات الفيزياء", desc: "شرح الفيزياء بالصور وخطوات قصيرة" },
    keywords: ["physics", "schemes", "eddy currents", "faraday", "lenz", "magnetic flux", "فيزياء", "مخططات", "تيارات دوامة", "لنز", "فيض"] },
  { key: "todo", en: { title: "To-Do List", desc: "Daily tasks" }, ar: { title: "قائمة المهام", desc: "مهام اليوم" },
    keywords: ["tasks", "todos", "checklist", "today", "homework", "plan", "schedule", "reminder", "مهام", "اليوم", "واجبات", "تذكير", "جدول"] },
  { key: "news", en: { title: "News", desc: "Announcements" }, ar: { title: "الأخبار", desc: "الإعلانات" },
    keywords: ["announcements", "updates", "posts", "notifications", "feed", "أخبار", "إعلانات", "تنبيهات", "تحديثات"] },
  { key: "ministerialBank", en: { title: "Ministerial Bank", desc: "Past exam questions" }, ar: { title: "البنك الوزاري", desc: "أسئلة وزارية" },
    keywords: ["past papers", "exam", "ministry", "وزاري", "بنك", "امتحانات", "أسئلة سابقة"] },
  { key: "mindmap", en: { title: "Mind Map", desc: "AI mind maps" }, ar: { title: "الخرائط الذهنية", desc: "خرائط ذهنية" },
    keywords: ["mind map", "diagram", "visual", "concept", "خريطة", "ذهنية", "مفاهيم"] },
  { key: "islamicSurahs", en: { title: "Islamic Surahs", desc: "Quran audio + text" }, ar: { title: "السور الإسلامية", desc: "تلاوة ونص" },
    keywords: ["quran", "surah", "islamic", "religion", "tilawa", "audio", "recitation", "قرآن", "سور", "تلاوة", "إسلامي", "دين"] },
  { key: "hadithChecker", en: { title: "Hadith Checker", desc: "Verify hadith" }, ar: { title: "تدقيق الحديث", desc: "تحقق من الحديث" },
    keywords: ["hadith", "islamic", "verify", "authentic", "حديث", "تحقق", "صحيح", "إسلامي"] },
  { key: "poemsChecker", en: { title: "Poems Checker", desc: "Verify Arabic poems" }, ar: { title: "تدقيق القصائد", desc: "تحقق من القصائد" },
    keywords: ["poems", "arabic", "poetry", "literature", "verify", "قصائد", "شعر", "أدب", "تحقق"] },
  { key: "englishEssays", en: { title: "English Essays", desc: "English essay topics" }, ar: { title: "مقالات إنجليزية", desc: "مواضيع مقالات" },
    keywords: ["english", "essay", "writing", "topics", "إنجليزي", "مقال", "كتابة"] },
  { key: "englishIsqat", en: { title: "English Isqat", desc: "English exercises" }, ar: { title: "إسقاط إنجليزي", desc: "تمارين" },
    keywords: ["english", "exercises", "grammar", "isqat", "إنجليزي", "تمارين", "قواعد", "إسقاط"] },
  { key: "leaderboard", en: { title: "Leaderboard", desc: "Top students, ranking, points" }, ar: { title: "المتصدرون", desc: "أعلى الطلاب والنقاط" },
    keywords: ["ranking", "rank", "top", "points", "score", "competition", "متصدرون", "ترتيب", "نقاط", "منافسة"] },
  { key: "more", en: { title: "More Tools", desc: "All other features" }, ar: { title: "المزيد", desc: "كل الميزات" },
    keywords: ["all", "extra", "other", "tools", "features", "مزيد", "كل", "ميزات"] },
  { key: "advices", en: { title: "Advices", desc: "Tips from top students" }, ar: { title: "النصائح", desc: "نصائح من المتفوقين" },
    keywords: ["advice", "tips", "guidance", "top students", "share", "experience", "نصائح", "إرشاد", "متفوقين", "خبرة", "تجربة"] },
];

export default function SearchFAB({
  language,
  onSelect,
}: {
  language: AppLanguage;
  onSelect: (choice: SearchNavChoice) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const hiddenTools = useHiddenStudyTools();
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!open) opener.current = document.activeElement as HTMLElement | null;
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const onOpen = () => { opener.current = document.activeElement as HTMLElement | null; setOpen(true); };
    window.addEventListener("app:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("app:open-search", onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const results = useMemo(() => {
    const raw = normalizeStudySearch(q);
    const entries = ENTRIES.filter((entry) => !hiddenTools.has(entry.key));
    if (!raw) return entries;
    const stop = new Set(["the", "a", "an", "of", "to", "for", "and", "or", "is", "my", "i", "want", "need", "how", "do", "in", "on", "with", "show", "open", "find", "get", "me", "في", "من", "على", "إلى", "هو", "هي", "كيف", "أريد", "افتح"]);
    const tokens = raw.split(/[\s,;.!?]+/).filter((t) => t.length > 1 && !stop.has(t));
    if (tokens.length === 0) tokens.push(raw);

    const scored = entries.map((e) => {
      const t = e[language];
      const other = language === "en" ? e.ar : e.en;
      const titleHay = normalizeStudySearch(`${t.title} ${other.title}`);
      const fullHay = normalizeStudySearch([
        t.title, t.desc, t.tags ?? "",
        other.title, other.desc, other.tags ?? "",
        e.key, (e.keywords ?? []).join(" "),
      ].join(" "));

      let score = 0;
      let matched = 0;
      for (const tok of tokens) {
        let hit = false;
        if (titleHay.startsWith(tok)) { score += 8; hit = true; }
        else if (titleHay.includes(tok)) { score += 5; hit = true; }
        if (fullHay.includes(tok)) { score += 3; hit = true; }
        else {
          // partial / substring fuzz: token appears as substring of any word
          const words = fullHay.split(/\s+/);
          if (words.some((w) => w.length >= 3 && tok.length >= 3 && (w.includes(tok) || tok.includes(w)))) {
            score += 1; hit = true;
          }
        }
        if (hit) matched += 1;
      }
      // bonus for matching more of the query tokens
      score += matched * 2;
      return { e, score };
    })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((r) => r.e);
  }, [q, language, hiddenTools]);

  const pick = (k: SearchNavChoice) => {
    setOpen(false);
    onSelect(k);
  };

  const isAr = language === "ar";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir={isAr ? "rtl" : "ltr"} onCloseAutoFocus={(event) => { event.preventDefault(); opener.current?.focus(); }} className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div className="px-4 pb-3 pt-4 pe-14">
          <DialogTitle className="text-base">{isAr ? "ابحث في تميّزك" : "Search Tamayzak"}</DialogTitle>
          <DialogDescription className="mt-1 text-sm">
            {isAr ? "اكتب اسم أداة أو شنو تريد تدرس." : "Find a tool or what you want to study."}
          </DialogDescription>
        </div>
        <Command shouldFilter={false} className="min-h-0 flex-1 bg-background text-foreground">
          <CommandInput
            value={q}
            onValueChange={setQ}
            aria-label={isAr ? "البحث عن أداة دراسية" : "Search study tools"}
            placeholder={isAr ? "مثلاً: وزاريات، مدرسين، بطاقات…" : "Try questions, teachers or flashcards…"}
            className="text-base md:text-sm"
          />
          <CommandList className="min-h-0 max-h-[55dvh] flex-1 p-2" aria-label={isAr ? "نتائج البحث" : "Search results"}>
            <CommandEmpty>
              <p className="mb-3 text-muted-foreground">{isAr ? "ما لقينا نتيجة. جرّب كلمة ثانية." : "No matches. Try another word."}</p>
              <button type="button" onClick={() => setQ("")} className="rounded-lg bg-secondary px-4 py-2 text-sm text-foreground">
                {isAr ? "عرض كل الأدوات" : "Show all tools"}
              </button>
            </CommandEmpty>
            {results.map((entry) => (
              <CommandItem key={entry.key} value={entry.key} onSelect={() => pick(entry.key)} className="min-h-14 gap-3 rounded-lg px-3 py-3 data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{entry[language].title}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{entry[language].desc}</span>
                </span>
                <ArrowRight className={`h-4 w-4 shrink-0 ${isAr ? "rotate-180" : ""}`} aria-hidden="true" />
              </CommandItem>
            ))}
          </CommandList>
          <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            {isAr ? "استخدم الأسهم للتنقل وEnter للفتح، أو اضغط على الأداة." : "Use arrow keys and Enter, or select a tool."}
          </p>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
