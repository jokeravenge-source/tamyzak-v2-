import { useMemo, useState, type DragEvent } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, FlaskConical, GripVertical, Info, Lightbulb, Move, RotateCcw, Search, X } from "lucide-react";
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
    practice: "Build equations", reading: "Study list", hint: "Memory hint",
    note: "Study note", reactants: "Reactants", products: "Products",
    speciesBank: "Equation pieces", buildHelp: "Drag each piece to the correct side. On touch screens, tap a piece and then tap its destination.",
    selected: "Selected", tapDestination: "Now choose Reactants or Products.", returnPiece: "Return piece to the bank",
    check: "Check equation", resetBuild: "Reset", correct: "Perfect — the equation is correct.",
    incorrect: "Not quite. Move the highlighted pieces and check again.", incomplete: "Place every piece before checking.",
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
    practice: "ركّب المعادلات", reading: "عرض قائمة الدراسة", hint: "تلميح للحفظ",
    note: "ملاحظة دراسية", reactants: "المتفاعلات", products: "النواتج",
    speciesBank: "أجزاء المعادلة", buildHelp: "اسحب كل مادة إلى الجهة الصحيحة. بالموبايل، اضغط على المادة ثم اضغط على مكانها.",
    selected: "تم الاختيار", tapDestination: "هسه اختار المتفاعلات أو النواتج.", returnPiece: "إرجاع المادة إلى القائمة",
    check: "تحقق من المعادلة", resetBuild: "إعادة المحاولة", correct: "ممتاز — المعادلة صحيحة.",
    incorrect: "مو كلها صحيحة. انقل المواد المحددة وحاول مرة ثانية.", incomplete: "وزّع كل المواد قبل التحقق.",
    results: "معادلة معروضة", noResults: "ما لكينا معادلة مطابقة",
    noResultsHint: "جرّب صيغة أو موضوعاً آخر، أو أعد ضبط البحث والتصفية.", reset: "إعادة ضبط التصفية",
    source: "المحتوى مبني على المعادلات الـ19 التي أرسلتها. لم نكرر موضعي الانصهار وأكسدة الخارصين؛ وأبقينا المعادلة المضاعفة مثالاً مستقلاً للتعلّم.",
    legend: "الرموز: (s) صلب · (l) سائل · (g) غاز · (aq) محلول مائي · → تفاعل · ⇌ تفاعل عكوس",
    absorbed: "حرارة ممتصة", released: "حرارة منطلقة", potential: "جهد الأكسدة القياسي",
  },
} as const;

type EquationSide = "reactants" | "products";
type EquationPiece = { id: string; label: string; answer: EquationSide };

function parseEquation(formula: string): { pieces: EquationPiece[]; arrow: "→" | "⇌" } {
  const arrow = formula.includes("⇌") ? "⇌" : "→";
  const [reactants = "", products = ""] = formula.split(arrow);
  const makePieces = (side: string, answer: EquationSide) => side.trim().split(/\s+\+\s+/).filter(Boolean)
    .map((label, index) => ({ id: `${answer}-${index}`, label, answer }));
  const left = makePieces(reactants, "reactants");
  const right = makePieces(products, "products");
  return { pieces: [...right, ...left].sort((a, b) => a.label.localeCompare(b.label)), arrow };
}

function EquationBuilder({ equation, language }: { equation: ChemicalEquation; language: AppLanguage }) {
  const text = COPY[language];
  const { pieces, arrow } = useMemo(() => parseEquation(equation.formula), [equation.formula]);
  const [placements, setPlacements] = useState<Record<string, EquationSide | null>>(() =>
    Object.fromEntries(pieces.map((piece) => [piece.id, null])),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const allPlaced = pieces.every((piece) => placements[piece.id]);
  const isCorrect = allPlaced && pieces.every((piece) => placements[piece.id] === piece.answer);

  function placePiece(id: string, side: EquationSide | null) {
    setPlacements((previous) => ({ ...previous, [id]: side }));
    setSelectedId(null);
    setChecked(false);
  }

  function placeSelected(side: EquationSide) {
    if (selectedId) placePiece(selectedId, side);
  }

  function handleDrop(event: DragEvent<HTMLElement>, side: EquationSide) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || draggedId;
    if (id && pieces.some((piece) => piece.id === id)) placePiece(id, side);
    setDraggedId(null);
  }

  function reset() {
    setPlacements(Object.fromEntries(pieces.map((piece) => [piece.id, null])));
    setSelectedId(null);
    setDraggedId(null);
    setChecked(false);
  }

  const renderPiece = (piece: EquationPiece, inBank: boolean) => {
    const wrong = checked && placements[piece.id] !== piece.answer;
    const selected = selectedId === piece.id;
    return (
      <button key={piece.id} type="button" draggable
        onDragStart={(event) => { event.dataTransfer.setData("text/plain", piece.id); setDraggedId(piece.id); }}
        onDragEnd={() => setDraggedId(null)}
        onClick={(event) => { event.stopPropagation(); inBank ? setSelectedId(selected ? null : piece.id) : placePiece(piece.id, null); }}
        aria-pressed={inBank ? selected : undefined}
        aria-label={inBank ? piece.label : `${piece.label} · ${text.returnPiece}`}
        className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 font-mono text-sm font-semibold text-foreground shadow-sm transition-[transform,background-color,border-color,box-shadow] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chemistry ${wrong ? "border-destructive bg-destructive/10" : selected ? "border-chemistry bg-chemistry/20 shadow-md" : "border-chemistry/30 bg-card hover:border-chemistry/60 hover:bg-chemistry/10"}`}>
        <GripVertical aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <bdi dir="ltr">{piece.label}</bdi>
      </button>
    );
  };

  const renderZone = (side: EquationSide) => {
    const zonePieces = pieces.filter((piece) => placements[piece.id] === side);
    const labelId = `equation-${equation.id}-${side}`;
    return (
      <section aria-labelledby={labelId} onClick={() => placeSelected(side)}
        onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, side)}
        className={`min-h-28 rounded-2xl border border-dashed p-3 transition-[background-color,border-color,box-shadow] ${selectedId || draggedId ? "border-chemistry bg-chemistry/10 shadow-inner" : "border-chemistry/35 bg-background/55"}`}>
        <button id={labelId} type="button" onClick={(event) => { event.stopPropagation(); placeSelected(side); }}
          className="mb-3 min-h-8 rounded-lg px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-chemistry/10 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chemistry">
          {text[side]}
        </button>
        <div className="flex min-h-12 flex-wrap content-start gap-2">
          {zonePieces.map((piece) => renderPiece(piece, false))}
        </div>
      </section>
    );
  };

  return (
    <div className="my-5 min-w-0 rounded-2xl border border-chemistry/20 bg-chemistry/5 p-4">
      <div className="mb-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
        <Move aria-hidden="true" className="mt-1 size-4 shrink-0 text-chemistry" />
        <p>{text.buildHelp}</p>
      </div>
      <div className="rounded-xl border border-border/70 bg-card/75 p-3">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{text.speciesBank}</p>
        <div className="flex min-h-12 flex-wrap gap-2">
          {pieces.filter((piece) => !placements[piece.id]).map((piece) => renderPiece(piece, true))}
        </div>
        {selectedId && <p className="mt-3 text-xs font-medium text-foreground" aria-live="polite">{text.selected}: <bdi dir="ltr" className="font-mono">{pieces.find((piece) => piece.id === selectedId)?.label}</bdi>. {text.tapDestination}</p>}
      </div>
      <div className="mt-4 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {renderZone("reactants")}
        <div aria-hidden="true" className="flex items-center justify-center font-mono text-2xl font-bold text-chemistry">{arrow}</div>
        {renderZone("products")}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" disabled={!allPlaced} onClick={() => setChecked(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-chemistry px-4 py-2 text-sm font-bold text-white shadow-sm transition-[transform,box-shadow,opacity] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chemistry disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0">
          <Check aria-hidden="true" className="size-4" />{text.check}
        </button>
        <button type="button" onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chemistry">
          <RotateCcw aria-hidden="true" className="size-4" />{text.resetBuild}
        </button>
      </div>
      <p aria-live="polite" className={`mt-3 min-h-6 text-sm font-semibold ${checked ? (isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-destructive") : "text-muted-foreground"}`}>
        {checked ? (isCorrect ? text.correct : text.incorrect) : (!allPlaced && selectedId ? text.tapDestination : "")}
      </p>
      {checked && isCorrect && equation.value && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-chemistry/15 pt-3">
          <bdi dir="ltr" className="font-mono text-sm font-semibold text-foreground">{equation.value.text}</bdi>
          <span className="text-xs text-muted-foreground">{text[equation.value.kind]}</span>
        </div>
      )}
    </div>
  );
}

function EquationCard({ equation, language, practice }: {
  equation: ChemicalEquation; language: AppLanguage; practice: boolean;
}) {
  const text = COPY[language];
  const titleId = `chemical-equation-${equation.id}`;
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
      {practice ? <EquationBuilder equation={equation} language={language} /> : (
        <div className="my-5 min-w-0 rounded-xl border border-chemistry/15 bg-chemistry/5 p-4">
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
        </div>
      )}
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
    </article>
  );
}

export default function ChemicalEquations({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<ChemicalEquationTopic | "all">("all");
  const [practice, setPractice] = useState(false);
  const text = COPY[language];
  const isArabic = language === "ar";
  const BackArrow = isArabic ? ArrowRight : ArrowLeft;
  const results = useMemo(() => filterChemicalEquations(query, topic), [query, topic]);
  const groups = chemicalEquationTopics.map((item) => ({
    ...item, equations: results.filter((equation) => equation.topic === item.id),
  })).filter((item) => item.equations.length > 0);

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
            <button type="button" aria-pressed={practice} onClick={() => setPractice(!practice)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-chemistry/30 bg-chemistry/10 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-chemistry/20 focus-visible:outline-chemistry">
              {practice ? <BookOpen aria-hidden="true" className="size-4" /> : <Move aria-hidden="true" className="size-4" />}
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
              {group.equations.map((equation) => <EquationCard key={equation.id} equation={equation} language={language} practice={practice} />)}
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
