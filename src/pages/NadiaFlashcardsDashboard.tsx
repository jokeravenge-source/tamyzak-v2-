import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Languages,
  LockKeyhole,
  LogOut,
  Search,
} from "lucide-react";
import { flashcardsBioCh1NadiaAr } from "@/data/flashcardsBioCh1NadiaAr";
import { flashcardsBioCh1NadiaEn } from "@/data/flashcardsBioCh1NadiaEn";
import { flashcardsBioCh2NadiaAr } from "@/data/flashcardsBioCh2NadiaAr";
import { flashcardsBioCh2NadiaEn } from "@/data/flashcardsBioCh2NadiaEn";
import { flashcardsBioCh3NadiaAr } from "@/data/flashcardsBioCh3NadiaAr";
import { flashcardsBioCh3NadiaEn } from "@/data/flashcardsBioCh3NadiaEn";
import { flashcardsBioCh4NadiaAr } from "@/data/flashcardsBioCh4NadiaAr";
import { flashcardsBioCh4NadiaEn } from "@/data/flashcardsBioCh4NadiaEn";
import { flashcardsBioCh5NadiaAr } from "@/data/flashcardsBioCh5NadiaAr";
import { flashcardsBioCh5NadiaEn } from "@/data/flashcardsBioCh5NadiaEn";

type Flashcard = { q: string; a: string };
type DashboardLanguage = "both" | "ar" | "en";

type ChapterDeck = {
  number: number;
  titleAr: string;
  titleEn: string;
  arabic: readonly Flashcard[];
  english: readonly Flashcard[];
};

type DashboardCard = {
  key: string;
  chapter: ChapterDeck;
  number: number;
  arabic: Flashcard;
  english: Flashcard;
};

const ACCESS_SESSION_KEY = "nadia_flashcards_dashboard_access_v1";
const REVIEWED_STORAGE_KEY = "nadia_flashcards_reviewed_v1";
const PASSWORD_SHA256 = "fb93d02a829ef98b4ecb55224000c64b5093ae1a0f660ba01323f4c2dd18c6cc";
const PAGE_SIZE = 24;

const chapterDecks: ChapterDeck[] = [
  { number: 1, titleAr: "الخلية والانقسام", titleEn: "Cell & Cell Division", arabic: flashcardsBioCh1NadiaAr, english: flashcardsBioCh1NadiaEn },
  { number: 2, titleAr: "الأنسجة", titleEn: "Tissues", arabic: flashcardsBioCh2NadiaAr, english: flashcardsBioCh2NadiaEn },
  { number: 3, titleAr: "التكاثر", titleEn: "Reproduction", arabic: flashcardsBioCh3NadiaAr, english: flashcardsBioCh3NadiaEn },
  { number: 4, titleAr: "التطور الجنيني", titleEn: "Embryonic Development", arabic: flashcardsBioCh4NadiaAr, english: flashcardsBioCh4NadiaEn },
  { number: 5, titleAr: "الوراثة", titleEn: "Genetics", arabic: flashcardsBioCh5NadiaAr, english: flashcardsBioCh5NadiaEn },
];

const allCards: DashboardCard[] = chapterDecks.flatMap((chapter) =>
  chapter.english.map((english, index) => ({
    key: `${chapter.number}-${index + 1}`,
    chapter,
    number: index + 1,
    english,
    arabic: chapter.arabic[index],
  })),
);

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readReviewedCards(): Set<string> {
  try {
    const stored = JSON.parse(localStorage.getItem(REVIEWED_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

export default function NadiaFlashcardsDashboard() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(ACCESS_SESSION_KEY) === "1");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);

  const [chapter, setChapter] = useState<number | "all">("all");
  const [language, setLanguage] = useState<DashboardLanguage>("both");
  const [query, setQuery] = useState("");
  const [showAnswers, setShowAnswers] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(readReviewedCards);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  useEffect(() => {
    document.title = "بطاقات نادية النعيمي | تميّزك";
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previous = robots?.content;
    if (robots) robots.content = "noindex,nofollow";
    return () => {
      document.title = "تميّزك";
      if (robots && previous) robots.content = previous;
    };
  }, []);

  const filteredCards = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return allCards.filter((card) => {
      if (chapter !== "all" && card.chapter.number !== chapter) return false;
      if (!normalized) return true;
      const arabicText = `${card.arabic.q} ${card.arabic.a}`.toLocaleLowerCase();
      const englishText = `${card.english.q} ${card.english.a}`.toLocaleLowerCase();
      if (language === "ar") return arabicText.includes(normalized);
      if (language === "en") return englishText.includes(normalized);
      return arabicText.includes(normalized) || englishText.includes(normalized);
    });
  }, [chapter, language, query]);

  const pageCount = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
  const visibleCards = filteredCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      const valid = (await sha256(password)) === PASSWORD_SHA256;
      if (!valid) {
        setPasswordError(true);
        return;
      }
      sessionStorage.setItem(ACCESS_SESSION_KEY, "1");
      setUnlocked(true);
      setPassword("");
    } finally {
      setCheckingPassword(false);
    }
  };

  const lockDashboard = () => {
    sessionStorage.removeItem(ACCESS_SESSION_KEY);
    setUnlocked(false);
    setPassword("");
  };

  const toggleReviewed = (key: string) => {
    setReviewedCards((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem(REVIEWED_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const copyCard = async (card: DashboardCard) => {
    const text = language === "ar"
      ? `س: ${card.arabic.q}\nج: ${card.arabic.a}`
      : language === "en"
        ? `Q: ${card.english.q}\nA: ${card.english.a}`
        : `س: ${card.arabic.q}\nج: ${card.arabic.a}\n\nQ: ${card.english.q}\nA: ${card.english.a}`;
    await navigator.clipboard.writeText(text);
    setCopiedCard(card.key);
    window.setTimeout(() => setCopiedCard(null), 1500);
  };

  if (!unlocked) {
    return (
      <main
        dir="rtl"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F4EC] px-4 py-10 text-[#183A72]"
        style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', sans-serif" }}
      >
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[#89B7E8]/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-[#F4C95D]/20 blur-3xl" />
        <section className="relative w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_28px_90px_rgba(24,58,114,0.16)] backdrop-blur sm:p-9">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#183A72] text-white shadow-lg shadow-[#183A72]/20">
            <LockKeyhole className="size-8" />
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-[#51749B]">تميّزك · الأحياء</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">بطاقات نادية النعيمي</h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">أدخل كلمة المرور للوصول إلى لوحة مراجعة جميع الفصول.</p>
          </div>

          <form onSubmit={submitPassword} className="mt-7 space-y-3">
            <label htmlFor="nadia-dashboard-password" className="block text-sm font-bold text-slate-700">كلمة المرور</label>
            <div className={`flex items-center rounded-2xl border bg-white px-4 transition ${passwordError ? "border-red-400 ring-4 ring-red-100" : "border-slate-200 focus-within:border-[#89B7E8] focus-within:ring-4 focus-within:ring-[#89B7E8]/20"}`}>
              <LockKeyhole className="size-5 shrink-0 text-slate-400" />
              <input
                id="nadia-dashboard-password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setPasswordError(false);
                }}
                autoComplete="current-password"
                autoFocus
                className="h-14 min-w-0 flex-1 bg-transparent px-3 text-left font-body outline-none placeholder:text-slate-300"
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
              {checkingPassword ? "جارٍ التحقق..." : "دخول لوحة البطاقات"}
              {!checkingPassword && <ChevronLeft className="size-5" />}
            </button>
          </form>
        </section>
      </main>
    );
  }

  const resultsStart = filteredCards.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const resultsEnd = Math.min(page * PAGE_SIZE, filteredCards.length);

  return (
    <main dir="rtl" className="min-h-screen bg-[#F7F4EC] text-slate-800" style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', sans-serif" }}>
      <header className="border-b border-[#183A72]/10 bg-[#183A72] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <BookOpenCheck className="size-7 text-[#F4C95D]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#89B7E8]">لوحة مراجعة البطاقات</p>
              <h1 className="text-2xl font-black sm:text-3xl">نادية النعيمي · الأحياء</h1>
              <p className="mt-1 text-sm text-white/65">جميع الفصول بالعربية والإنكليزية في مكان واحد</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl bg-white/10 px-4 py-2 text-sm ring-1 ring-white/15">
              <span className="font-black text-[#F4C95D]">{allCards.length.toLocaleString("en-US")}</span> بطاقة
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2 text-sm ring-1 ring-white/15">
              <span className="font-black text-[#F4C95D]">{reviewedCards.size.toLocaleString("en-US")}</span> تمت مراجعتها
            </div>
            <button onClick={lockDashboard} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold ring-1 ring-white/15 transition hover:bg-white/20">
              <LogOut className="size-4" /> قفل اللوحة
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <section aria-label="الفصول" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {chapterDecks.map((item) => {
            const active = chapter === item.number;
            return (
              <button
                key={item.number}
                onClick={() => setChapter(active ? "all" : item.number)}
                className={`group rounded-2xl border p-4 text-right transition ${active ? "border-[#183A72] bg-[#183A72] text-white shadow-lg shadow-[#183A72]/15" : "border-[#183A72]/10 bg-white hover:-translate-y-0.5 hover:border-[#89B7E8] hover:shadow-md"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex size-9 items-center justify-center rounded-xl text-sm font-black ${active ? "bg-white/15 text-[#F4C95D]" : "bg-[#89B7E8]/15 text-[#183A72]"}`}>{item.number}</span>
                  <span className={`text-xs font-bold ${active ? "text-white/70" : "text-slate-400"}`}>{item.english.length} بطاقة</span>
                </div>
                <p className="mt-4 font-extrabold">{item.titleAr}</p>
                <p className={`mt-1 text-xs ${active ? "text-white/60" : "text-slate-400"}`} dir="ltr">{item.titleEn}</p>
              </button>
            );
          })}
        </section>

        <section className="sticky top-0 z-20 -mx-4 mt-6 border-y border-[#183A72]/10 bg-[#F7F4EC]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:bg-white lg:shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث في السؤال أو الجواب بالعربية أو الإنكليزية..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-12 pl-4 text-sm outline-none transition focus:border-[#89B7E8] focus:ring-4 focus:ring-[#89B7E8]/15"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1" aria-label="لغة العرض">
              <Languages className="mx-2 size-4 text-slate-400" />
              {([[
                "both", "اللغتان"
              ], ["ar", "العربية"], ["en", "English"]] as [DashboardLanguage, string][]).map(([value, label]) => (
                <button key={value} onClick={() => setLanguage(value)} className={`h-9 rounded-lg px-3 text-xs font-bold transition sm:text-sm ${language === value ? "bg-[#183A72] text-white" : "text-slate-500 hover:bg-slate-100"}`}>{label}</button>
              ))}
            </div>
            <button onClick={() => setShowAnswers((value) => !value)} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#183A72] transition hover:bg-slate-50">
              {showAnswers ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showAnswers ? "إخفاء الأجوبة" : "إظهار الأجوبة"}
            </button>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            عرض <span className="font-black text-[#183A72]">{resultsStart}–{resultsEnd}</span> من <span className="font-black text-[#183A72]">{filteredCards.length}</span> بطاقة
          </p>
          {chapter !== "all" && (
            <a
              href={`/flashcards/${chapter}?subject=biology&list=nadia-al-nuaimi&lang=${language === "en" ? "en" : "ar"}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#183A72] hover:underline"
            >
              فتح الفصل في وضع الدراسة <ExternalLink className="size-4" />
            </a>
          )}
        </div>

        {visibleCards.length ? (
          <section className="mt-4 grid gap-4 xl:grid-cols-2" aria-label="البطاقات">
            {visibleCards.map((card) => {
              const answerVisible = showAnswers || expandedCards.has(card.key);
              const reviewed = reviewedCards.has(card.key);
              return (
                <article key={card.key} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${reviewed ? "border-emerald-300" : "border-[#183A72]/10"}`}>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span className="rounded-lg bg-[#89B7E8]/15 px-2.5 py-1 text-[#183A72]">الفصل {card.chapter.number}</span>
                      <span>بطاقة {card.number}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyCard(card)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#183A72]" aria-label="نسخ البطاقة">
                        {copiedCard === card.key ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                      </button>
                      <button onClick={() => toggleReviewed(card.key)} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold transition ${reviewed ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
                        <span className={`flex size-4 items-center justify-center rounded border ${reviewed ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"}`}>{reviewed && <Check className="size-3" />}</span>
                        {reviewed ? "تمت المراجعة" : "تحديد كمراجعة"}
                      </button>
                    </div>
                  </div>

                  <div className={`grid ${language === "both" ? "md:grid-cols-2" : "grid-cols-1"}`}>
                    {(language === "both" || language === "ar") && (
                      <div dir="rtl" className={`p-5 ${language === "both" ? "border-b border-slate-100 md:border-b-0 md:border-l" : ""}`}>
                        <p className="text-[11px] font-black uppercase tracking-wider text-[#51749B]">السؤال</p>
                        <h2 className="mt-2 text-base font-extrabold leading-8 text-slate-900">{card.arabic.q}</h2>
                        {answerVisible ? (
                          <div className="mt-4 rounded-xl bg-[#F7F4EC] p-4">
                            <p className="text-[11px] font-black text-[#997716]">الجواب</p>
                            <p className="mt-1 text-sm font-semibold leading-7 text-slate-700">{card.arabic.a}</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                    {(language === "both" || language === "en") && (
                      <div dir="ltr" className="p-5 text-left" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#51749B]">Question</p>
                        <h2 className="mt-2 text-base font-bold leading-7 text-slate-900">{card.english.q}</h2>
                        {answerVisible ? (
                          <div className="mt-4 rounded-xl bg-[#F7F4EC] p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#997716]">Answer</p>
                            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">{card.english.a}</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  {!showAnswers && (
                    <button
                      onClick={() => setExpandedCards((current) => {
                        const next = new Set(current);
                        if (next.has(card.key)) next.delete(card.key);
                        else next.add(card.key);
                        return next;
                      })}
                      className="flex h-11 w-full items-center justify-center gap-2 border-t border-slate-100 text-xs font-bold text-[#183A72] hover:bg-slate-50"
                    >
                      {answerVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      {answerVisible ? "إخفاء جواب هذه البطاقة" : "إظهار جواب هذه البطاقة"}
                    </button>
                  )}
                </article>
              );
            })}
          </section>
        ) : (
          <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Search className="mx-auto size-9 text-slate-300" />
            <h2 className="mt-3 font-extrabold text-slate-700">لا توجد نتائج مطابقة</h2>
            <button onClick={() => { setQuery(""); setChapter("all"); }} className="mt-3 text-sm font-bold text-[#183A72] hover:underline">مسح البحث والفلاتر</button>
          </section>
        )}

        {pageCount > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3" aria-label="صفحات البطاقات">
            <button disabled={page === 1} onClick={() => { setPage((value) => Math.max(1, value - 1)); window.scrollTo({ top: 380, behavior: "smooth" }); }} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#183A72] transition hover:border-[#89B7E8] disabled:cursor-not-allowed disabled:opacity-40" aria-label="الصفحة السابقة">
              <ChevronRight className="size-5" />
            </button>
            <div className="min-w-32 rounded-xl bg-white px-4 py-2 text-center text-sm shadow-sm">
              صفحة <span className="font-black text-[#183A72]">{page}</span> من <span className="font-black text-[#183A72]">{pageCount}</span>
            </div>
            <button disabled={page === pageCount} onClick={() => { setPage((value) => Math.min(pageCount, value + 1)); window.scrollTo({ top: 380, behavior: "smooth" }); }} className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#183A72] transition hover:border-[#89B7E8] disabled:cursor-not-allowed disabled:opacity-40" aria-label="الصفحة التالية">
              <ChevronLeft className="size-5" />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
