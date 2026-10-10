import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Languages,
  Loader2,
  LogOut,
  Printer,
  Search,
  ShieldAlert,
} from "lucide-react";
import AdminLogin from "./AdminLogin";
import { supabase } from "@/integrations/supabase/client";
import { ahmedNadawiChemCh1Cards, ahmedNadawiChemCh1Topics } from "@/data/flashcardsChemCh1AhmedNadawi";
import { ahmedNadawiChemCh1CardsAr, ahmedNadawiChemCh1TopicsAr } from "@/data/flashcardsChemCh1AhmedNadawiAr";
import { ahmedNadawiChemCh2Cards, ahmedNadawiChemCh2Topics } from "@/data/flashcardsChemCh2AhmedNadawi";
import { ahmedNadawiChemCh2CardsAr } from "@/data/flashcardsChemCh2AhmedNadawiAr";
import { ahmedNadawiChemCh3Cards, ahmedNadawiChemCh3Topics } from "@/data/flashcardsChemCh3AhmedNadawi";
import { ahmedNadawiChemCh4Cards, ahmedNadawiChemCh4Topics } from "@/data/flashcardsChemCh4AhmedNadawi";
import { ahmedNadawiChemCh4CardsAr } from "@/data/flashcardsChemCh4AhmedNadawiAr";
import { ahmedNadawiChemCh5Cards, ahmedNadawiChemCh5Topics } from "@/data/flashcardsChemCh5AhmedNadawi";
import { ahmedNadawiChemCh5CardsAr } from "@/data/flashcardsChemCh5AhmedNadawiAr";
import { ahmedNadawiChemCh6Cards, ahmedNadawiChemCh6Topics } from "@/data/flashcardsChemCh6AhmedNadawi";
import { ahmedNadawiChemCh6CardsAr } from "@/data/flashcardsChemCh6AhmedNadawiAr";
import { ahmedNadawiChemCh7Cards, ahmedNadawiChemCh7Topics } from "@/data/flashcardsChemCh7AhmedNadawi";
import { ahmedNadawiChemCh7CardsAr } from "@/data/flashcardsChemCh7AhmedNadawiAr";
import { ahmedNadawiChemCh8Cards, ahmedNadawiChemCh8Topics } from "@/data/flashcardsChemCh8AhmedNadawi";
import { ahmedNadawiChemCh8CardsAr } from "@/data/flashcardsChemCh8AhmedNadawiAr";

type Language = "ar" | "en";
type AccessState = "checking" | "signed-out" | "denied" | "allowed";
type RawCard = {
  id?: string;
  q: string;
  a: string;
  topic?: string;
  kind?: string;
  ministerialLabel?: string;
  ministerialYear?: number;
  years?: string[];
  pages?: string;
  sourceNotes?: string;
};
type Topic = { key: string; title: string; titleAr?: string };
type DeckDefinition = {
  chapter: number;
  title: string;
  titleAr: string;
  en: readonly RawCard[] | null;
  ar: readonly RawCard[];
  topics: readonly Topic[];
  topicAr?: Record<string, string>;
};
type ReviewCard = RawCard & {
  reviewId: string;
  chapter: number;
  chapterTitle: string;
  chapterTitleAr: string;
  sourceIndex: number;
  topicLabel: string;
  ministerial: boolean;
  displayYears: string[];
  fallbackArabic: boolean;
};

const decks: DeckDefinition[] = [
  {
    chapter: 1,
    title: "Thermodynamics",
    titleAr: "الديناميكا الحرارية",
    en: ahmedNadawiChemCh1Cards as RawCard[],
    ar: ahmedNadawiChemCh1CardsAr as RawCard[],
    topics: ahmedNadawiChemCh1Topics as readonly Topic[],
    topicAr: ahmedNadawiChemCh1TopicsAr,
  },
  {
    chapter: 2,
    title: "Chemical Equilibrium",
    titleAr: "الاتزان الكيميائي",
    en: ahmedNadawiChemCh2Cards as RawCard[],
    ar: ahmedNadawiChemCh2CardsAr as RawCard[],
    topics: ahmedNadawiChemCh2Topics as readonly Topic[],
  },
  {
    chapter: 3,
    title: "Ionic Equilibrium",
    titleAr: "الاتزان الأيوني",
    en: null,
    ar: ahmedNadawiChemCh3Cards as RawCard[],
    topics: ahmedNadawiChemCh3Topics as readonly Topic[],
  },
  {
    chapter: 4,
    title: "Electrochemistry",
    titleAr: "الكيمياء الكهربائية",
    en: ahmedNadawiChemCh4Cards as RawCard[],
    ar: ahmedNadawiChemCh4CardsAr as RawCard[],
    topics: ahmedNadawiChemCh4Topics as readonly Topic[],
  },
  {
    chapter: 5,
    title: "Coordination Chemistry",
    titleAr: "الكيمياء التناسقية",
    en: ahmedNadawiChemCh5Cards as RawCard[],
    ar: ahmedNadawiChemCh5CardsAr as RawCard[],
    topics: ahmedNadawiChemCh5Topics as readonly Topic[],
  },
  {
    chapter: 6,
    title: "Chemical Analysis",
    titleAr: "التحليل الكيميائي",
    en: ahmedNadawiChemCh6Cards as RawCard[],
    ar: ahmedNadawiChemCh6CardsAr as RawCard[],
    topics: ahmedNadawiChemCh6Topics as readonly Topic[],
  },
  {
    chapter: 7,
    title: "Organic Chemistry",
    titleAr: "الكيمياء العضوية",
    en: ahmedNadawiChemCh7Cards as RawCard[],
    ar: ahmedNadawiChemCh7CardsAr as RawCard[],
    topics: ahmedNadawiChemCh7Topics as readonly Topic[],
  },
  {
    chapter: 8,
    title: "Biochemistry",
    titleAr: "الكيمياء الحياتية",
    en: ahmedNadawiChemCh8Cards as RawCard[],
    ar: ahmedNadawiChemCh8CardsAr as RawCard[],
    topics: ahmedNadawiChemCh8Topics as readonly Topic[],
  },
];

const REVIEWER_EMAILS = new Set(["majs11@gmail.com", "dania28hanna@gmail.com"]);
const PAGE_SIZE = 50;

function topicLabel(deck: DeckDefinition, key: string, language: Language) {
  const topic = deck.topics.find((item) => item.key === key);
  if (!topic) return key ? `Topic ${key}` : "General";
  if (language === "ar") return deck.topicAr?.[key] ?? topic.titleAr ?? topic.title;
  return topic.title;
}

function cardYears(card: RawCard): string[] {
  const values = [
    ...(card.years ?? []),
    ...(card.ministerialYear ? [String(card.ministerialYear)] : []),
    ...(`${card.ministerialLabel ?? ""} ${card.q}`.match(/\b(?:19|20)\d{2}\b/g) ?? []),
  ];
  return [...new Set(values)];
}

function isMinisterial(card: RawCard) {
  return Boolean(
    card.ministerialLabel ||
    card.ministerialYear ||
    cardYears(card).length ||
    /ministerial|وزاري/i.test(`${card.kind ?? ""} ${card.q}`),
  );
}

export default function AdminAhmedFlashcardsReview() {
  const [access, setAccess] = useState<AccessState>("checking");
  const [reviewerEmail, setReviewerEmail] = useState("");

  const checkAccess = async () => {
    setAccess("checking");
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setReviewerEmail("");
      setAccess("signed-out");
      return;
    }
    const email = (user.email ?? "").trim().toLowerCase();
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    setReviewerEmail(email);
    setAccess(role || REVIEWER_EMAILS.has(email) ? "allowed" : "denied");
  };

  useEffect(() => { checkAccess(); }, []);
  useEffect(() => {
    const root = document.documentElement;
    const hadTheme = root.classList.contains("theme-notion-dark");
    root.classList.add("theme-notion-dark");
    return () => { if (!hadTheme) root.classList.remove("theme-notion-dark"); };
  }, []);

  if (access === "checking") {
    return <main className="min-h-screen grid place-items-center bg-background text-foreground"><Loader2 className="h-7 w-7 animate-spin text-primary" /></main>;
  }
  if (access === "signed-out") {
    return <AdminLogin onAuthed={checkAccess} onBack={() => { window.location.href = "/"; }} />;
  }
  if (access === "denied") {
    return (
      <main className="min-h-screen grid place-items-center bg-background text-foreground p-6">
        <section className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-card">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h1 className="text-xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">{reviewerEmail}</p>
          <button onClick={async () => { await supabase.auth.signOut(); await checkAccess(); }} className="mt-6 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">
            Sign out
          </button>
        </section>
      </main>
    );
  }
  return <ReviewDashboard reviewerEmail={reviewerEmail} onSignOut={async () => { await supabase.auth.signOut(); await checkAccess(); }} />;
}

function ReviewDashboard({ reviewerEmail, onSignOut }: { reviewerEmail: string; onSignOut: () => Promise<void> }) {
  const [language, setLanguage] = useState<Language>("ar");
  const [chapter, setChapter] = useState("all");
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [ministerialOnly, setMinisterialOnly] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);
  const [page, setPage] = useState(1);

  const allCards = useMemo<ReviewCard[]>(() => decks.flatMap((deck) => {
    const fallbackArabic = language === "en" && deck.en === null;
    const selected = language === "ar" || !deck.en ? deck.ar : deck.en;
    return selected.map((card, index) => ({
      ...card,
      reviewId: card.id ?? `CH${deck.chapter}-${String(index + 1).padStart(3, "0")}`,
      chapter: deck.chapter,
      chapterTitle: deck.title,
      chapterTitleAr: deck.titleAr,
      sourceIndex: index + 1,
      topicLabel: topicLabel(deck, card.topic ?? "", fallbackArabic ? "ar" : language),
      ministerial: isMinisterial(card),
      displayYears: cardYears(card),
      fallbackArabic,
    }));
  }), [language]);

  const selectedDeck = chapter === "all" ? null : decks.find((deck) => String(deck.chapter) === chapter) ?? null;
  const topicOptions = selectedDeck?.topics ?? [];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = useMemo(() => allCards.filter((card) => {
    if (chapter !== "all" && card.chapter !== Number(chapter)) return false;
    if (topic !== "all" && card.topic !== topic) return false;
    if (ministerialOnly && !card.ministerial) return false;
    if (!normalizedQuery) return true;
    return [card.reviewId, card.q, card.a, card.topicLabel, card.chapterTitle, card.chapterTitleAr, card.sourceNotes ?? ""]
      .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
  }), [allCards, chapter, ministerialOnly, normalizedQuery, topic]);

  useEffect(() => { setPage(1); }, [chapter, language, ministerialOnly, normalizedQuery, topic]);
  useEffect(() => { setTopic("all"); }, [chapter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const totalCards = decks.reduce((sum, deck) => sum + deck.ar.length, 0);
  const ministerialCount = allCards.filter((card) => card.ministerial).length;
  const studentUrl = chapter === "all"
    ? `/flashcards/ahmed-al-nadawi?lang=${language}`
    : `/flashcards/${chapter}?subject=chemistry&list=ahmed-al-nadawi&lang=${language}`;

  return (
    <main className="min-h-screen bg-background text-foreground print:bg-white print:text-black" dir="ltr">
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-10">
        <header className="mb-6 flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between print:hidden">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"><CheckCircle2 className="h-4 w-4" /> Admin review workspace</div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">Ahmed Al Nadawi Flashcards</h1>
            <p className="mt-2 text-sm text-muted-foreground">Review every question and answer directly—no card flipping.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href={studentUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary">
              <ExternalLink className="h-4 w-4" /> Student view
            </a>
            <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={onSignOut} title={reviewerEmail} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 print:hidden">
          {[
            ["All cards", totalCards.toLocaleString()],
            ["Visible results", filtered.length.toLocaleString()],
            ["Ministerial labels", ministerialCount.toLocaleString()],
            ["Chapters", "8"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-black">{value}</p>
            </div>
          ))}
        </section>

        <section className="mb-5 overflow-x-auto pb-2 print:hidden">
          <div className="flex min-w-max gap-2">
            <button onClick={() => setChapter("all")} className={`rounded-lg border px-4 py-3 text-left transition ${chapter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}>
              <span className="block text-xs opacity-70">ALL</span><span className="font-bold">All chapters · {totalCards}</span>
            </button>
            {decks.map((deck) => (
              <button key={deck.chapter} onClick={() => setChapter(String(deck.chapter))} className={`rounded-lg border px-4 py-3 text-left transition ${chapter === String(deck.chapter) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}>
                <span className="block text-xs opacity-70">CH {deck.chapter} · {deck.ar.length}</span>
                <span className="font-bold">{language === "ar" ? deck.titleAr : deck.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="sticky top-0 z-20 mb-6 grid gap-3 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur md:grid-cols-[minmax(260px,1fr)_220px_auto_auto] print:hidden">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search question, answer, formula, ID…" className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <select value={topic} onChange={(event) => setTopic(event.target.value)} disabled={!selectedDeck} className="h-11 rounded-lg border border-input bg-card px-3 text-sm disabled:opacity-50">
            <option value="all">All topics</option>
            {topicOptions.map((item) => <option key={item.key} value={item.key}>{item.key} · {topicLabel(selectedDeck!, item.key, language)}</option>)}
          </select>
          <button onClick={() => setLanguage(language === "ar" ? "en" : "ar")} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 text-sm font-bold hover:bg-secondary">
            <Languages className="h-4 w-4" /> {language === "ar" ? "العربية" : "English"}
          </button>
          <div className="flex h-11 items-center gap-4 rounded-lg border border-input bg-card px-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap"><input type="checkbox" checked={ministerialOnly} onChange={(event) => setMinisterialOnly(event.target.checked)} /> Ministerial only</label>
            <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap"><input type="checkbox" checked={showAnswers} onChange={(event) => setShowAnswers(event.target.checked)} /> Answers</label>
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          {language === "en" && (chapter === "all" || chapter === "3") && <p className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-600">CH3 is shown in its Arabic source language.</p>}
        </div>

        <section className="space-y-3">
          {visible.map((card) => (
            <article key={`${card.chapter}-${card.reviewId}`} className="break-inside-avoid rounded-xl border border-border bg-card p-4 shadow-sm md:p-5 print:border-gray-300 print:shadow-none" dir="auto">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-primary/10 px-2 py-1 font-bold text-primary">CH{card.chapter} · #{card.sourceIndex}</span>
                <span className="rounded bg-secondary px-2 py-1 text-muted-foreground">{card.topicLabel}</span>
                {card.ministerial && <span className="rounded bg-amber-500/15 px-2 py-1 font-bold text-amber-600">وزاري · Ministerial</span>}
                {card.displayYears.map((year) => <span key={year} className="rounded border border-border px-2 py-1">{year}</span>)}
                <span className="ml-auto font-mono text-muted-foreground">{card.reviewId}</span>
              </div>
              <h2 className="whitespace-pre-wrap text-base font-black leading-7 md:text-lg">{card.q}</h2>
              {showAnswers && <div className="mt-3 whitespace-pre-wrap border-t border-border pt-3 text-sm leading-7 text-foreground/85 md:text-base">{card.a}</div>}
              {(card.pages || card.sourceNotes) && (
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {card.pages && <span>Pages: {card.pages}</span>}
                  {card.sourceNotes && <span>{card.sourceNotes}</span>}
                </div>
              )}
            </article>
          ))}
          {visible.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground"><BookOpen className="mx-auto mb-3 h-8 w-8" />No cards match these filters.</div>
          )}
        </section>

        {pageCount > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3 print:hidden">
            <button disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
            <span className="text-sm font-semibold">Page {safePage} of {pageCount}</span>
            <button disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
          </nav>
        )}
      </div>
    </main>
  );
}
