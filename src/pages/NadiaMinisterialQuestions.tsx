import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Languages,
  LockKeyhole,
  LogOut,
  Printer,
  Search,
  ScrollText,
} from "lucide-react";
import {
  NADIA_MINISTERIAL_ACCESS_SESSION_KEY,
  NADIA_MINISTERIAL_QUESTION_COUNT,
  nadiaMinisterialChapters,
  nadiaMinisterialQuestions,
  type NadiaMinisterialQuestion,
} from "@/lib/nadiaMinisterialQuestions";

type DisplayLanguage = "ar" | "en" | "both";

const PASSWORD_SHA256 = "fb93d02a829ef98b4ecb55224000c64b5093ae1a0f660ba01323f4c2dd18c6cc";
const PAGE_SIZE = 20;

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function initialChapter(): number | "all" {
  if (typeof window === "undefined") return "all";
  const value = Number(new URLSearchParams(window.location.search).get("chapter"));
  return value >= 1 && value <= 5 ? value : "all";
}

export default function NadiaMinisterialQuestions() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(NADIA_MINISTERIAL_ACCESS_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);

  const [chapter, setChapter] = useState<number | "all">(initialChapter);
  const [language, setLanguage] = useState<DisplayLanguage>("ar");
  const [query, setQuery] = useState("");
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = "أسئلة نادية النعيمي الوزارية | تميّزك";
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.content;
    if (robots) robots.content = "noindex,nofollow";
    return () => {
      document.title = "تميّزك";
      if (robots && previousRobots) robots.content = previousRobots;
    };
  }, []);

  const filteredQuestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return nadiaMinisterialQuestions.filter((item) => {
      if (chapter !== "all" && item.chapter.number !== chapter) return false;
      if (!normalized) return true;
      const arabic = `${item.arabic.q} ${item.arabic.a}`.toLocaleLowerCase();
      const english = `${item.english.q} ${item.english.a}`.toLocaleLowerCase();
      if (language === "ar") return arabic.includes(normalized);
      if (language === "en") return english.includes(normalized);
      return arabic.includes(normalized) || english.includes(normalized);
    });
  }, [chapter, language, query]);

  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const visibleQuestions = filteredQuestions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [chapter, language, query]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    setCheckingPassword(true);
    setPasswordError(false);
    try {
      if ((await sha256(password)) !== PASSWORD_SHA256) {
        setPasswordError(true);
        return;
      }
      sessionStorage.setItem(NADIA_MINISTERIAL_ACCESS_SESSION_KEY, "1");
      setUnlocked(true);
      setPassword("");
    } finally {
      setCheckingPassword(false);
    }
  };

  const lockPage = () => {
    sessionStorage.removeItem(NADIA_MINISTERIAL_ACCESS_SESSION_KEY);
    setUnlocked(false);
    setPassword("");
  };

  const toggleAnswer = (key: string) => {
    setExpandedAnswers((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyQuestion = async (item: NadiaMinisterialQuestion) => {
    const content = language === "en"
      ? `Q: ${item.english.q}\nA: ${item.english.a}`
      : language === "both"
        ? `س: ${item.arabic.q}\nج: ${item.arabic.a}\n\nQ: ${item.english.q}\nA: ${item.english.a}`
        : `س: ${item.arabic.q}\nج: ${item.arabic.a}`;
    await navigator.clipboard.writeText(content);
    setCopiedQuestion(item.key);
    window.setTimeout(() => setCopiedQuestion(null), 1500);
  };

  if (!unlocked) {
    return (
      <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F4EC] px-4 py-10 text-[#183A72]" style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', sans-serif" }}>
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[#89B7E8]/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-[#F4C95D]/20 blur-3xl" />
        <section className="relative w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_28px_90px_rgba(24,58,114,0.16)] backdrop-blur sm:p-9">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#183A72] text-[#F4C95D] shadow-lg shadow-[#183A72]/20">
            <LockKeyhole className="size-8" />
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-[#51749B]">تميّزك · الأحياء</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">أسئلة نادية النعيمي الوزارية</h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">أدخل كلمة المرور للوصول إلى بنك الأسئلة والأجوبة النموذجية.</p>
          </div>
          <form onSubmit={submitPassword} className="mt-7 space-y-3">
            <label htmlFor="nadia-ministerial-password" className="block text-sm font-bold text-slate-700">كلمة المرور</label>
            <div className={`flex items-center rounded-2xl border bg-white px-4 transition ${passwordError ? "border-red-400 ring-4 ring-red-100" : "border-slate-200 focus-within:border-[#89B7E8] focus-within:ring-4 focus-within:ring-[#89B7E8]/20"}`}>
              <LockKeyhole className="size-5 shrink-0 text-slate-400" />
              <input
                id="nadia-ministerial-password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(event) => { setPassword(event.target.value); setPasswordError(false); }}
                autoComplete="current-password"
                autoFocus
                className="h-14 min-w-0 flex-1 bg-transparent px-3 text-left outline-none placeholder:text-slate-300"
                dir="ltr"
                placeholder="Enter password"
                aria-invalid={passwordError}
              />
              <button type="button" onClick={() => setPasswordVisible((value) => !value)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label={passwordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>
                {passwordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {passwordError && <p role="alert" className="text-sm font-bold text-red-600">كلمة المرور غير صحيحة. حاول مرة أخرى.</p>}
            <button disabled={!password || checkingPassword} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#183A72] px-5 font-extrabold text-white transition hover:bg-[#102d59] disabled:cursor-not-allowed disabled:opacity-50">
              {checkingPassword ? "جارٍ التحقق..." : "دخول بنك الأسئلة"}
              {!checkingPassword && <ChevronLeft className="size-5" />}
            </button>
          </form>
        </section>
      </main>
    );
  }

  const resultsStart = filteredQuestions.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const resultsEnd = Math.min(page * PAGE_SIZE, filteredQuestions.length);

  return (
    <main dir="rtl" className="min-h-screen bg-[#F7F4EC] text-slate-800" style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', sans-serif" }}>
      <header className="border-b border-[#183A72]/10 bg-[#183A72] text-white print:bg-white print:text-black">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 print:hidden">
              <ScrollText className="size-7 text-[#F4C95D]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#89B7E8] print:text-slate-500">بنك الأسئلة الوزارية</p>
              <h1 className="text-2xl font-black sm:text-3xl">نادية النعيمي · الأحياء</h1>
              <p className="mt-1 text-sm text-white/65 print:text-slate-500">الأسئلة الوزارية والمهمة مع الأجوبة النموذجية</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <div className="rounded-xl bg-white/10 px-4 py-2 text-sm ring-1 ring-white/15">
              <span className="font-black text-[#F4C95D]">{NADIA_MINISTERIAL_QUESTION_COUNT.toLocaleString("en-US")}</span> سؤال
            </div>
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold ring-1 ring-white/15 transition hover:bg-white/20">
              <Printer className="size-4" /> طباعة
            </button>
            <button onClick={lockPage} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold ring-1 ring-white/15 transition hover:bg-white/20">
              <LogOut className="size-4" /> قفل الصفحة
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <section aria-label="الفصول" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 print:hidden">
          {nadiaMinisterialChapters.map((item) => {
            const active = chapter === item.number;
            return (
              <button key={item.number} onClick={() => setChapter(active ? "all" : item.number)} className={`rounded-2xl border p-4 text-right transition ${active ? "border-[#183A72] bg-[#183A72] text-white shadow-lg" : "border-[#183A72]/10 bg-white hover:-translate-y-0.5 hover:border-[#89B7E8] hover:shadow-md"}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex size-9 items-center justify-center rounded-xl text-sm font-black ${active ? "bg-white/15 text-[#F4C95D]" : "bg-[#89B7E8]/15 text-[#183A72]"}`}>{item.number}</span>
                  <span className={`text-xs font-bold ${active ? "text-white/70" : "text-slate-400"}`}>{item.arabic.length} سؤال</span>
                </div>
                <p className="mt-4 font-extrabold">{item.titleAr}</p>
                <p className={`mt-1 text-xs ${active ? "text-white/60" : "text-slate-400"}`} dir="ltr">{item.titleEn}</p>
              </button>
            );
          })}
        </section>

        <section className="sticky top-0 z-20 -mx-4 mt-6 border-y border-[#183A72]/10 bg-[#F7F4EC]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:bg-white lg:shadow-sm print:hidden">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في الأسئلة أو الأجوبة..." className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-12 pl-4 text-sm outline-none transition focus:border-[#89B7E8] focus:ring-4 focus:ring-[#89B7E8]/15" />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1" aria-label="لغة العرض">
              <Languages className="mx-2 size-4 text-slate-400" />
              {([['ar', 'العربية'], ['en', 'English'], ['both', 'اللغتان']] as [DisplayLanguage, string][]).map(([value, label]) => (
                <button key={value} onClick={() => setLanguage(value)} className={`h-9 rounded-lg px-3 text-xs font-bold transition ${language === value ? "bg-[#183A72] text-white" : "text-slate-500 hover:bg-slate-100"}`}>{label}</button>
              ))}
            </div>
            <button onClick={() => setShowAllAnswers((value) => !value)} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#183A72] transition hover:bg-slate-50">
              {showAllAnswers ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showAllAnswers ? "إخفاء الأجوبة" : "إظهار كل الأجوبة"}
            </button>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-500">
          <p>عرض <span className="font-black text-[#183A72]">{resultsStart}–{resultsEnd}</span> من <span className="font-black text-[#183A72]">{filteredQuestions.length}</span> سؤال</p>
          {chapter !== "all" && <button onClick={() => setChapter("all")} className="font-bold text-[#183A72] hover:underline print:hidden">عرض جميع الفصول</button>}
        </div>

        {visibleQuestions.length ? (
          <section className="mt-4 space-y-4" aria-label="الأسئلة الوزارية">
            {visibleQuestions.map((item) => {
              const answerVisible = showAllAnswers || expandedAnswers.has(item.key);
              return (
                <article key={item.key} className="overflow-hidden rounded-2xl border border-[#183A72]/10 bg-white shadow-sm break-inside-avoid">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="rounded-lg bg-[#89B7E8]/15 px-2.5 py-1 text-[#183A72]">الفصل {item.chapter.number}</span>
                      <span>سؤال {item.number}</span>
                    </div>
                    <button onClick={() => void copyQuestion(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#183A72] print:hidden" aria-label="نسخ السؤال والجواب">
                      {copiedQuestion === item.key ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    </button>
                  </div>

                  <div className={`grid ${language === "both" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
                    {(language === "ar" || language === "both") && (
                      <div dir="rtl" className={`p-5 ${language === "both" ? "border-b border-slate-100 lg:border-b-0 lg:border-l" : ""}`}>
                        <p className="text-[11px] font-black text-[#51749B]">السؤال</p>
                        <h2 className="mt-2 text-base font-extrabold leading-8 text-slate-900 whitespace-pre-line">{item.arabic.q}</h2>
                        {answerVisible && (
                          <div className="mt-4 rounded-xl border-r-4 border-[#F4C95D] bg-[#F7F4EC] p-4">
                            <p className="text-[11px] font-black text-[#997716]">الجواب النموذجي</p>
                            <p className="mt-1 text-sm font-semibold leading-7 text-slate-700 whitespace-pre-line">{item.arabic.a}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {(language === "en" || language === "both") && (
                      <div dir="ltr" className="p-5 text-left" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#51749B]">Question</p>
                        <h2 className="mt-2 text-base font-bold leading-7 text-slate-900 whitespace-pre-line">{item.english.q}</h2>
                        {answerVisible && (
                          <div className="mt-4 rounded-xl border-l-4 border-[#F4C95D] bg-[#F7F4EC] p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#997716]">Model answer</p>
                            <p className="mt-1 text-sm font-medium leading-6 text-slate-700 whitespace-pre-line">{item.english.a}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!showAllAnswers && (
                    <button onClick={() => toggleAnswer(item.key)} className="flex min-h-11 w-full items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-4 text-sm font-bold text-[#183A72] transition hover:bg-[#89B7E8]/10 print:hidden">
                      {answerVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      {answerVisible ? "إخفاء الجواب" : "إظهار الجواب النموذجي"}
                    </button>
                  )}
                </article>
              );
            })}
          </section>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">لا توجد أسئلة مطابقة للبحث.</div>
        )}

        {pageCount > 1 && (
          <nav aria-label="صفحات الأسئلة" className="mt-7 flex items-center justify-center gap-3 print:hidden">
            <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#183A72] disabled:opacity-40" aria-label="الصفحة السابقة"><ChevronRight className="size-5" /></button>
            <span className="min-w-32 text-center text-sm font-bold text-slate-600">صفحة {page} من {pageCount}</span>
            <button disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#183A72] disabled:opacity-40" aria-label="الصفحة التالية"><ChevronLeft className="size-5" /></button>
          </nav>
        )}
      </div>
    </main>
  );
}
