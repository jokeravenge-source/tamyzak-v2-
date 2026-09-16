import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Eye, EyeOff, FlaskConical, Info, Lightbulb, Search, X } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { chemicalEquations, chemicalEquationTopics, type ChemicalEquation, type ChemicalEquationTopic } from "@/data/chemicalEquations";
import { filterChemicalEquations } from "@/lib/chemicalEquationSearch";

const COPY = {
  en: {
    badge: "Chemistry · Your equation library", title: "Chemical Equation",
    description: "Learn the pattern, not just the symbols. Your equations are organized by topic, with a memory hint for every one.",
    back: "Back", equations: "equations", topics: "topics", local: "No AI credits needed",
    search: "Search equations", placeholder: "Search a topic, reaction, or formula, e.g. H2O or zinc",
    clearSearch: "Clear search", filter: "Filter by topic", all: "All topics",
    practice: "Practice recall", reading: "Show all equations", hint: "Memory hint",
    note: "Study note", show: "Show equation", hide: "Hide equation",
    recall: "Try writing this equation from memory, then reveal it to check.",
    results: "equations shown", noResults: "No matching equations",
    noResultsHint: "Try another formula or topic, or reset the filters.", reset: "Reset filters",
    source: "Based on the 19 entries you supplied. The two repeated occurrences are not listed again; the doubled zinc equation is kept as its own learning example.",
    legend: "Symbols: (s) solid · (l) liquid · (g) gas · (aq) aqueous solution · → reaction · ⇌ reversible reaction",
    absorbed: "Heat absorbed", released: "Heat released", potential: "Standard oxidation potential",
  },
  ar: {
    badge: "الكيمياء · مكتبة المعادلات", title: "المعادلات الكيميائية",
    description: "افهم الفكرة، مو بس الرموز. معادلاتك مرتبة حسب الموضوع، ومع كل معادلة تلميح يساعدك على حفظها.",
    back: "رجوع", equations: "معادلة", topics: "مواضيع", local: "بدون استهلاك رصيد الذكاء الاصطناعي",
    search: "البحث عن معادلة", placeholder: "ابحث بالموضوع أو التفاعل أو الصيغة، مثل H2O أو الخارصين",
    clearSearch: "مسح البحث", filter: "تصفية حسب الموضوع", all: "كل المواضيع",
    practice: "اختبر حفظك", reading: "إظهار كل المعادلات", hint: "تلميح للحفظ",
    note: "ملاحظة دراسية", show: "إظهار المعادلة", hide: "إخفاء المعادلة",
    recall: "جرّب تكتب المعادلة من ذاكرتك، وبعدين أظهرها حتى تتأكد.",
    results: "معادلة معروضة", noResults: "ما لكينا معادلة مطابقة",
    noResultsHint: "جرّب صيغة أو موضوعاً آخر، أو أعد ضبط البحث والتصفية.", reset: "إعادة ضبط التصفية",
    source: "المحتوى مبني على المعادلات الـ19 التي أرسلتها. لم نكرر موضعي الانصهار وأكسدة الخارصين؛ وأبقينا المعادلة المضاعفة مثالاً مستقلاً للتعلّم.",
    legend: "الرموز: (s) صلب · (l) سائل · (g) غاز · (aq) محلول مائي · → تفاعل · ⇌ تفاعل عكوس",
    absorbed: "حرارة ممتصة", released: "حرارة منطلقة", potential: "جهد الأكسدة القياسي",
  },
} as const;

function EquationCard({ equation, language, visible, onToggle }: {
  equation: ChemicalEquation; language: AppLanguage; visible: boolean; onToggle: () => void;
}) {
  const text = COPY[language];
  const titleId = `chemical-equation-${equation.id}`;
  const formulaId = `${titleId}-formula`;
  return (
    <article aria-labelledby={titleId} className="clip-facet-lg min-w-0 border border-chemistry/25 bg-card/80 p-5 backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="clip-facet-badge flex size-10 shrink-0 items-center justify-center bg-chemistry/15 font-mono text-sm font-bold text-foreground" aria-hidden="true">
          {String(equation.id).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{equation.subtopic[language]}</p>
          <h3 id={titleId} className="text-lg font-bold leading-relaxed text-foreground">{equation.title[language]}</h3>
        </div>
      </div>
      <div id={formulaId} className="my-5 min-w-0 rounded-xl border border-chemistry/15 bg-chemistry/5 p-4">
        {visible ? (
          <>
            <div dir="ltr" role="region" aria-label={`${equation.title[language]} · ${text.equations}`} tabIndex={0}
              className="overflow-x-auto rounded-md text-start outline-none focus-visible:ring-2 focus-visible:ring-chemistry">
              <p className="w-max min-w-full whitespace-nowrap font-mono text-base font-semibold leading-loose text-foreground sm:text-lg">{equation.formula}</p>
            </div>
            {equation.value && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-chemistry/15 pt-3">
                <bdi dir="ltr" className="font-mono text-sm font-semibold text-foreground">{equation.value.text}</bdi>
                <span className="text-xs text-muted-foreground">{text[equation.value.kind]}</span>
              </div>
            )}
          </>
        ) : (
          <p className="flex min-h-10 items-center gap-2 text-sm leading-relaxed text-muted-foreground">
            <EyeOff aria-hidden="true" className="size-4 shrink-0" />{text.recall}
          </p>
        )}
      </div>
      <div className="flex items-start gap-2.5 rounded-xl bg-secondary/70 p-3.5">
        <Lightbulb aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground" />
        <div>
          <p className="mb-1 text-sm font-bold text-foreground">{text.hint}</p>
          <p className="text-sm leading-7 text-foreground/85">{equation.hint[language]}</p>
        </div>
      </div>
      {equation.note && (
        <details open={equation.id === 7 ? true : undefined} className="mt-3 rounded-xl border border-border/70 px-3.5 py-2.5 text-sm">
          <summary className="cursor-pointer font-medium text-foreground focus-visible:outline-chemistry">{text.note}</summary>
          <p className="mt-2 leading-7 text-muted-foreground">{equation.note[language]}</p>
          {equation.reference && (
            <a href={equation.reference.url} target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-foreground underline decoration-chemistry underline-offset-4">{equation.reference.title}</a>
          )}
        </details>
      )}
      <button type="button" onClick={onToggle} aria-expanded={visible} aria-controls={formulaId}
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-chemistry/25 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-chemistry/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chemistry">
        {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
        {visible ? text.hide : text.show}
      </button>
    </article>
  );
}

export default function ChemicalEquations({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<ChemicalEquationTopic | "all">("all");
  const [practice, setPractice] = useState(false);
  const [toggled, setToggled] = useState<Set<number>>(() => new Set());
  const text = COPY[language];
  const isArabic = language === "ar";
  const BackArrow = isArabic ? ArrowRight : ArrowLeft;
  const results = useMemo(() => filterChemicalEquations(query, topic), [query, topic]);
  const groups = chemicalEquationTopics.map((item) => ({
    ...item, equations: results.filter((equation) => equation.topic === item.id),
  })).filter((item) => item.equations.length > 0);

  function toggleEquation(id: number) {
    setToggled((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <main dir={isArabic ? "rtl" : "ltr"} lang={language} className={`min-h-screen px-4 py-6 text-start sm:px-6 sm:py-10 ${isArabic ? "font-body-ar" : ""}`}>
      <div className="mx-auto max-w-5xl space-y-6">
        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-chemistry">
          <BackArrow aria-hidden="true" className="size-4" />{text.back}
        </button>
        <header className="clip-facet-lg relative overflow-hidden border border-chemistry/30 bg-card/80 p-6 backdrop-blur-xl sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-chemistry/15 via-transparent to-chemistry/5" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <span className="clip-facet-badge flex size-12 items-center justify-center bg-chemistry/15 text-foreground"><FlaskConical aria-hidden="true" className="size-6" /></span>
              <p className="text-sm font-semibold text-muted-foreground">{text.badge}</p>
            </div>
            <h1 className={`text-3xl font-bold leading-tight text-foreground sm:text-4xl ${isArabic ? "font-display-ar" : ""}`}>{text.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{text.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground">
              <span className="rounded-full border border-chemistry/25 bg-chemistry/10 px-3 py-1.5">{chemicalEquations.length} {text.equations}</span>
              <span className="rounded-full border border-chemistry/25 bg-chemistry/10 px-3 py-1.5">{chemicalEquationTopics.length} {text.topics}</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1.5"><BookOpen aria-hidden="true" className="size-3.5" />{text.local}</span>
            </div>
          </div>
        </header>
        <section aria-label={text.filter} className="space-y-4">
          <label htmlFor="chemical-equation-search" className="block text-sm font-semibold text-foreground">{text.search}</label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input id="chemical-equation-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder={text.placeholder} className="h-12 w-full rounded-2xl border border-border bg-card pe-12 ps-12 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-chemistry focus:ring-2 focus:ring-chemistry/20" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label={text.clearSearch}
              className="absolute end-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary focus-visible:outline-chemistry"><X aria-hidden="true" className="size-4" /></button>}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={text.filter}>
            {[{ id: "all" as const, title: { ar: COPY.ar.all, en: COPY.en.all } }, ...chemicalEquationTopics].map((item) => (
              <button key={item.id} type="button" aria-pressed={topic === item.id} onClick={() => setTopic(item.id)}
                className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chemistry ${topic === item.id ? "border-chemistry/50 bg-chemistry/15 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary"}`}>{item.title[language]}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <p aria-live="polite" aria-atomic="true" className="text-sm text-muted-foreground">{results.length} / {chemicalEquations.length} {text.results}</p>
            <button type="button" aria-pressed={practice} onClick={() => { setPractice(!practice); setToggled(new Set()); }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-chemistry/30 bg-chemistry/10 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-chemistry/20 focus-visible:outline-chemistry">
              {practice ? <Eye aria-hidden="true" className="size-4" /> : <EyeOff aria-hidden="true" className="size-4" />}
              {practice ? text.reading : text.practice}
            </button>
          </div>
        </section>
        {groups.length ? groups.map((group) => (
          <section key={group.id} aria-labelledby={`equation-topic-${group.id}`} className="space-y-4">
            <div className="flex items-center gap-3 py-2">
              <span aria-hidden="true" className="h-6 w-1 rounded-full bg-chemistry" />
              <h2 id={`equation-topic-${group.id}`} className="text-xl font-bold text-foreground">{group.title[language]}</h2>
              <span className="rounded-lg bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">{group.equations.length}</span>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
              {group.equations.map((equation) => <EquationCard key={equation.id} equation={equation} language={language}
                visible={practice ? toggled.has(equation.id) : !toggled.has(equation.id)} onToggle={() => toggleEquation(equation.id)} />)}
            </div>
          </section>
        )) : (
          <section className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
            <Search aria-hidden="true" className="mx-auto mb-3 size-7 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">{text.noResults}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text.noResultsHint}</p>
            <button type="button" onClick={() => { setQuery(""); setTopic("all"); }}
              className="mt-4 min-h-11 rounded-xl border border-chemistry/30 bg-chemistry/10 px-4 text-sm font-semibold text-foreground focus-visible:outline-chemistry">{text.reset}</button>
          </section>
        )}
        <footer className="space-y-3 rounded-2xl border border-border bg-card/70 p-4 text-xs leading-6 text-muted-foreground">
          <p className="flex items-start gap-2"><Info aria-hidden="true" className="mt-1 size-3.5 shrink-0" />{text.source}</p>
          <p>{text.legend}</p>
        </footer>
      </div>
    </main>
  );
}
