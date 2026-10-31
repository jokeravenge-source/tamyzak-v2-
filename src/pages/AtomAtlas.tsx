import { useMemo, useState } from "react";
import { ArrowLeft, Atom, BookOpen, FlaskConical, RotateCcw, Search, Table2 } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { CATEGORIES, ELEMENTS, kToC, matchElement, type Category, type ElementRecord } from "@/data/atomAtlas/elements";
import { ELEMENT_NOTES } from "@/data/atomAtlas/element-notes";
import { KIND_LABEL, MOLECULES, type Molecule } from "@/data/atomAtlas/molecules";
import { TERMS } from "@/data/atomAtlas/dictionary";
import { LESSONS, type Lesson } from "@/data/atomAtlas/lessons";

type Tab = "table" | "atom" | "molecules" | "dictionary" | "lessons";

const CATEGORY_LABEL: Record<Category, { en: string; ar: string }> = {
  alkali: { en: "Alkali metals", ar: "الفلزات القلوية" },
  "alkaline-earth": { en: "Alkaline earth", ar: "الفلزات القلوية الترابية" },
  transition: { en: "Transition metals", ar: "الفلزات الانتقالية" },
  "post-transition": { en: "Post-transition", ar: "فلزات بعد انتقالية" },
  metalloid: { en: "Metalloids", ar: "أشباه الفلزات" },
  nonmetal: { en: "Nonmetals", ar: "اللافلزات" },
  halogen: { en: "Halogens", ar: "الهالوجينات" },
  "noble-gas": { en: "Noble gases", ar: "الغازات النبيلة" },
  lanthanide: { en: "Lanthanides", ar: "اللانثانيدات" },
  actinide: { en: "Actinides", ar: "الأكتينيدات" },
  unknown: { en: "Unknown", ar: "خصائص غير معروفة" },
};

const CATEGORY_STYLE: Record<Category, string> = {
  alkali: "border-rose-400/40 bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "alkaline-earth": "border-orange-400/40 bg-orange-500/15 text-orange-700 dark:text-orange-300",
  transition: "border-amber-400/40 bg-amber-500/15 text-amber-800 dark:text-amber-300",
  "post-transition": "border-lime-400/40 bg-lime-500/15 text-lime-800 dark:text-lime-300",
  metalloid: "border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  nonmetal: "border-teal-400/40 bg-teal-500/15 text-teal-800 dark:text-teal-300",
  halogen: "border-cyan-400/40 bg-cyan-500/15 text-cyan-800 dark:text-cyan-300",
  "noble-gas": "border-blue-400/40 bg-blue-500/15 text-blue-800 dark:text-blue-300",
  lanthanide: "border-violet-400/40 bg-violet-500/15 text-violet-800 dark:text-violet-300",
  actinide: "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-800 dark:text-fuchsia-300",
  unknown: "border-slate-400/40 bg-slate-500/15 text-slate-700 dark:text-slate-300",
};

const ATOM_COLORS: Record<string, string> = {
  H: "#e2e8f0", C: "#334155", N: "#3b82f6", O: "#ef4444", F: "#22c55e", Cl: "#22c55e",
  Na: "#8b5cf6", Mg: "#a855f7", S: "#eab308",
};

const copy = {
  en: {
    eyebrow: "INTERACTIVE CHEMISTRY LAB",
    title: "Atom Atlas",
    intro: "Explore all 118 elements, atomic structure, molecules, scientific terms and guided chemistry lessons.",
    tabs: { table: "Periodic table", atom: "Atom explorer", molecules: "Molecules", dictionary: "Dictionary", lessons: "Lessons" },
    searchElements: "Search by name, symbol or atomic number…", all: "All categories", reset: "Reset", results: "elements",
    atomicNumber: "Atomic number", atomicWeight: "Atomic weight", group: "Group", period: "Period", configuration: "Electron configuration",
    state: "State", melting: "Melting point", boiling: "Boiling point", electronegativity: "Electronegativity", uses: "Common uses", fact: "Verified fact",
    unavailable: "Unavailable", measuredAt: "Physical values are reported in kelvin and converted to °C.", chooseAtom: "Choose an element",
    shells: "Electron shells", shellModel: "Simplified shell model", shellWarning: "This diagram is an educational shell model, not an exact quantum-mechanical picture.",
    protons: "Protons", electrons: "Electrons", neutrons: "Neutrons require an isotope choice", moleculeSearch: "Search molecules or formulas…",
    geometry: "Geometry", bonds: "Bond type", composition: "Composition", rotate: "Rotate model", termSearch: "Search English or Arabic terms…",
    objectives: "Learning objectives", example: "Worked example", practice: "Practice", correct: "Correct", tryAgain: "Try again", sources: "Scientific basis",
    sourceText: "Element records use PubChem periodic-table data with IUPAC conventions. Educational notes are limited to reviewed textbook-level facts.",
  },
  ar: {
    eyebrow: "مختبر كيمياء تفاعلي",
    title: "أطلس الذرة",
    intro: "استكشف العناصر الـ118 وبنية الذرة والجزيئات والمصطلحات العلمية ودروس الكيمياء الموجّهة.",
    tabs: { table: "الجدول الدوري", atom: "مستكشف الذرة", molecules: "الجزيئات", dictionary: "القاموس", lessons: "الدروس" },
    searchElements: "ابحث بالاسم أو الرمز أو العدد الذري…", all: "كل الفئات", reset: "إعادة", results: "عنصرًا",
    atomicNumber: "العدد الذري", atomicWeight: "الوزن الذري", group: "المجموعة", period: "الدورة", configuration: "التوزيع الإلكتروني",
    state: "الحالة", melting: "درجة الانصهار", boiling: "درجة الغليان", electronegativity: "السالبية الكهربائية", uses: "استخدامات شائعة", fact: "معلومة موثّقة",
    unavailable: "غير متاح", measuredAt: "القيم الفيزيائية معروضة بالكلفن ومحولة إلى °م.", chooseAtom: "اختر عنصرًا",
    shells: "مستويات الإلكترونات", shellModel: "نموذج مستويات مبسّط", shellWarning: "هذا مخطط تعليمي مبسّط وليس صورة دقيقة لميكانيكا الكم.",
    protons: "البروتونات", electrons: "الإلكترونات", neutrons: "يتطلب عدد النيوترونات اختيار نظير", moleculeSearch: "ابحث عن جزيء أو صيغة…",
    geometry: "الشكل الهندسي", bonds: "نوع الرابطة", composition: "التركيب", rotate: "تدوير النموذج", termSearch: "ابحث بالمصطلح العربي أو الإنجليزي…",
    objectives: "أهداف التعلّم", example: "مثال محلول", practice: "تدريب", correct: "إجابة صحيحة", tryAgain: "حاول مجددًا", sources: "الأساس العلمي",
    sourceText: "تعتمد سجلات العناصر على بيانات الجدول الدوري من PubChem مع اصطلاحات IUPAC، وتقتصر الملاحظات التعليمية على معلومات مدرسية مراجعة.",
  },
} as const;

function ElementCard({ element, language, selected, onClick }: { element: ElementRecord; language: AppLanguage; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={`${language === "ar" ? element.ar : element.en}, ${element.z}`} className={`min-h-14 rounded-lg border p-1 text-start transition hover:-translate-y-0.5 hover:shadow-md ${CATEGORY_STYLE[element.cat]} ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`} style={{ gridColumn: element.col, gridRow: element.row }}>
      <span className="block text-[9px] leading-none opacity-75">{element.z}</span>
      <strong className="block font-mono text-lg leading-tight">{element.s}</strong>
      <span className="block truncate text-[8px] leading-tight">{language === "ar" ? element.ar : element.en}</span>
    </button>
  );
}

function ElementDetails({ element, language }: { element: ElementRecord; language: AppLanguage }) {
  const t = copy[language];
  const note = ELEMENT_NOTES[element.z];
  const pick = (value: { en: string; ar: string }) => value[language];
  const value = (n: number | null, suffix = "") => n == null ? t.unavailable : `${n}${suffix}`;
  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className={`border-b border-border p-5 ${CATEGORY_STYLE[element.cat]}`}>
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid size-24 place-items-center rounded-2xl border border-current/20 bg-background/60">
            <span className="text-xs opacity-70">{element.z}</span><strong className="font-mono text-4xl">{element.s}</strong>
          </div>
          <div><p className="text-xs font-bold uppercase tracking-widest opacity-70">{pick(CATEGORY_LABEL[element.cat])}</p><h2 className="mt-1 text-3xl font-black">{language === "ar" ? element.ar : element.en}</h2><p className="mt-1 text-sm opacity-80">{element.en} · {element.ar}</p></div>
        </div>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t.atomicNumber, element.z], [t.atomicWeight, element.w ?? (element.mn ? `[${element.mn}]` : t.unavailable)],
          [t.group, element.group ?? t.unavailable], [t.period, element.period], [t.configuration, element.config],
          [t.state, element.state ?? t.unavailable], [t.melting, element.mp == null ? t.unavailable : `${element.mp} K · ${kToC(element.mp)}°C`],
          [t.boiling, element.bp == null ? t.unavailable : `${element.bp} K · ${kToC(element.bp)}°C`], [t.electronegativity, value(element.chi, " (Pauling)")],
        ].map(([label, val]) => <div key={String(label)} className="rounded-2xl border border-border bg-background/55 p-3"><span className="text-xs text-muted-foreground">{label}</span><strong className="mt-1 block break-words text-sm">{val}</strong></div>)}
      </div>
      {note && <div className="grid gap-4 border-t border-border p-5 md:grid-cols-2"><div><p className="leading-7 text-muted-foreground">{pick(note.about)}</p>{note.fact && <div className="mt-4 rounded-2xl bg-primary/10 p-4"><strong className="text-sm">{t.fact}</strong><p className="mt-1 text-sm leading-6">{pick(note.fact)}</p></div>}</div><div><h3 className="font-bold">{t.uses}</h3><ul className="mt-2 space-y-2 text-sm text-muted-foreground">{note.uses.map((item) => <li key={item.en}>• {pick(item)}</li>)}</ul></div></div>}
      <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">{t.measuredAt}</p>
    </section>
  );
}

function AtomModel({ element, language }: { element: ElementRecord; language: AppLanguage }) {
  const t = copy[language];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="relative grid min-h-[390px] place-items-center overflow-hidden rounded-3xl border border-chemistry/25 bg-[radial-gradient(circle_at_center,hsl(var(--chemistry)/0.22),transparent_60%)]">
        <div className="absolute grid size-24 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-violet-600 text-center text-white shadow-[0_0_45px_rgba(244,63,94,.35)]"><strong className="font-mono text-3xl">{element.s}</strong><span className="text-[10px]">{element.z} p⁺</span></div>
        {element.shells.map((count, shell) => {
          const size = 125 + shell * 38;
          return <div key={shell} className="absolute rounded-full border border-chemistry/35" style={{ width: size, height: size }} aria-hidden="true">
            {Array.from({ length: count }, (_, index) => {
              const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
              const radius = size / 2;
              return <span key={index} className="absolute size-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" style={{ left: `calc(50% + ${Math.cos(angle) * radius}px - 5px)`, top: `calc(50% + ${Math.sin(angle) * radius}px - 5px)` }} />;
            })}
          </div>;
        })}
      </div>
      <div className="space-y-4">
        <div><p className="text-xs font-black uppercase tracking-widest text-chemistry">{t.shellModel}</p><h2 className="mt-1 text-3xl font-black">{language === "ar" ? element.ar : element.en}</h2><p className="font-mono text-muted-foreground">{element.config}</p></div>
        <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-border bg-card p-4"><span className="text-xs text-muted-foreground">{t.protons}</span><strong className="block text-2xl">{element.z}</strong></div><div className="rounded-2xl border border-border bg-card p-4"><span className="text-xs text-muted-foreground">{t.electrons}</span><strong className="block text-2xl">{element.z}</strong></div></div>
        <div className="rounded-2xl border border-border bg-card p-4"><span className="text-xs text-muted-foreground">{t.shells}</span><div className="mt-2 flex flex-wrap gap-2">{element.shells.map((n, i) => <span key={i} className="rounded-full bg-chemistry/15 px-3 py-1 text-sm font-bold">n={i + 1}: {n}e⁻</span>)}</div></div>
        <p className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-muted-foreground">{t.shellWarning}<br />{t.neutrons}.</p>
      </div>
    </div>
  );
}

function MoleculeModel({ molecule, angle }: { molecule: Molecule; angle: number }) {
  const projected = molecule.atoms.map((atom) => {
    const rad = angle * Math.PI / 180;
    const x = atom.x * Math.cos(rad) - atom.z * Math.sin(rad);
    const depth = atom.x * Math.sin(rad) + atom.z * Math.cos(rad);
    return { ...atom, px: 150 + x * 62, py: 135 + atom.y * 62 + depth * 12 };
  });
  return <svg viewBox="0 0 300 270" role="img" aria-label={molecule.formula} className="h-72 w-full rounded-3xl border border-chemistry/20 bg-[radial-gradient(circle_at_center,hsl(var(--chemistry)/0.18),transparent_68%)]">
    {molecule.bonds.map(([a, b, order], index) => <g key={index}>{Array.from({ length: order }, (_, line) => <line key={line} x1={projected[a].px} y1={projected[a].py + (line - (order - 1) / 2) * 5} x2={projected[b].px} y2={projected[b].py + (line - (order - 1) / 2) * 5} stroke="currentColor" strokeWidth="3" className="text-muted-foreground/60" />)}</g>)}
    {projected.map((atom, index) => <g key={index}><circle cx={atom.px} cy={atom.py} r={atom.el === "H" ? 15 : 21} fill={ATOM_COLORS[atom.el] ?? "#14b8a6"} stroke="white" strokeWidth="2" /><text x={atom.px} y={atom.py + 5} textAnchor="middle" fontSize="12" fontWeight="800" fill={atom.el === "H" ? "#0f172a" : "white"}>{atom.el}{atom.charge ?? ""}</text></g>)}
  </svg>;
}

function LessonView({ lesson, language }: { lesson: Lesson; language: AppLanguage }) {
  const t = copy[language];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const pick = (value: { en: string; ar: string }) => value[language];
  return <div className="space-y-5"><div><h2 className="text-2xl font-black">{pick(lesson.title)}</h2><p className="mt-1 leading-7 text-muted-foreground">{pick(lesson.summary)}</p></div><section className="rounded-2xl border border-border bg-card p-5"><h3 className="font-bold">{t.objectives}</h3><ul className="mt-2 space-y-2 text-sm text-muted-foreground">{lesson.objectives.map((o) => <li key={o.en}>✓ {pick(o)}</li>)}</ul></section>{lesson.sections.map((section) => <section key={section.h.en} className="rounded-2xl border border-border bg-card p-5"><h3 className="font-bold">{pick(section.h)}</h3><p className="mt-2 leading-7 text-muted-foreground">{pick(section.p)}</p></section>)}<section className="rounded-2xl border border-chemistry/25 bg-chemistry/10 p-5"><h3 className="font-bold">{t.example}</h3><p className="mt-2 font-semibold">{pick(lesson.example.q)}</p><p className="mt-2 leading-7 text-muted-foreground">{pick(lesson.example.a)}</p></section><section><h3 className="mb-3 text-lg font-black">{t.practice}</h3><div className="space-y-4">{lesson.practice.map((q, qi) => { const picked = answers[qi]; return <div key={q.q.en} className="rounded-2xl border border-border bg-card p-5"><p className="font-bold">{pick(q.q)}</p><div className="mt-3 flex flex-wrap gap-2">{q.options.map((option, oi) => <button key={option.en} type="button" onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))} className={`min-h-10 rounded-xl border px-4 text-sm font-semibold ${picked === oi ? "border-primary bg-primary/15" : "border-border hover:bg-secondary"}`}>{pick(option)}</button>)}</div>{picked !== undefined && <p className={`mt-3 text-sm ${picked === q.answer ? "text-emerald-600" : "text-rose-600"}`}>{picked === q.answer ? t.correct : t.tryAgain}: <span className="text-muted-foreground">{pick(q.why)}</span></p>}</div>; })}</div></section></div>;
}

export default function AtomAtlas({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const t = copy[language];
  const isAr = language === "ar";
  const [tab, setTab] = useState<Tab>("table");
  const [elementQuery, setElementQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [selected, setSelected] = useState(ELEMENTS[0]);
  const [moleculeQuery, setMoleculeQuery] = useState("");
  const [selectedMolecule, setSelectedMolecule] = useState(MOLECULES[0]);
  const [rotation, setRotation] = useState(20);
  const [termQuery, setTermQuery] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(LESSONS[0]);
  const pick = (value: { en: string; ar: string }) => value[language];
  const filteredElements = useMemo(() => ELEMENTS.filter((e) => matchElement(e, elementQuery) && (category === "all" || e.cat === category)), [elementQuery, category]);
  const filteredMolecules = useMemo(() => { const q = moleculeQuery.toLowerCase().trim(); return MOLECULES.filter((m) => !q || `${m.formula} ${m.name.en} ${m.name.ar}`.toLowerCase().includes(q)); }, [moleculeQuery]);
  const filteredTerms = useMemo(() => { const q = termQuery.toLowerCase().trim(); return TERMS.filter((term) => !q || `${term.term.en} ${term.term.ar} ${term.def.en} ${term.def.ar}`.toLowerCase().includes(q)); }, [termQuery]);
  const tabs: { key: Tab; Icon: typeof Table2 }[] = [{ key: "table", Icon: Table2 }, { key: "atom", Icon: Atom }, { key: "molecules", Icon: FlaskConical }, { key: "dictionary", Icon: Search }, { key: "lessons", Icon: BookOpen }];

  return <main dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-background pb-24">
    <header className="relative overflow-hidden border-b border-chemistry/25 bg-[radial-gradient(circle_at_85%_15%,hsl(var(--chemistry)/0.28),transparent_40%)]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10"><button type="button" onClick={onBack} className="mb-7 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-bold backdrop-blur hover:bg-secondary"><ArrowLeft className={`size-4 ${isAr ? "rotate-180" : ""}`} />{isAr ? "رجوع" : "Back"}</button><p className="text-xs font-black uppercase tracking-[0.22em] text-chemistry">{t.eyebrow}</p><div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-black tracking-tight sm:text-6xl">{t.title}</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{t.intro}</p></div><div className="rounded-2xl border border-chemistry/25 bg-card/70 px-5 py-3 text-center backdrop-blur"><strong className="block text-3xl text-chemistry">118</strong><span className="text-xs text-muted-foreground">{t.results}</span></div></div></div>
    </header>
    <div className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur"><nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6" aria-label={isAr ? "أقسام أطلس الذرة" : "Atom Atlas sections"}>{tabs.map(({ key, Icon }) => <button key={key} type="button" onClick={() => setTab(key)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${tab === key ? "bg-chemistry text-white shadow-md" : "border border-border bg-card hover:bg-secondary"}`}><Icon className="size-4" />{t.tabs[key]}</button>)}</nav></div>
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
      {tab === "table" && <><div className="grid gap-3 lg:grid-cols-[1fr_auto]"><label className="flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-card px-4"><Search className="size-4 text-muted-foreground" /><input value={elementQuery} onChange={(e) => setElementQuery(e.target.value)} placeholder={t.searchElements} className="w-full bg-transparent text-sm outline-none" /></label><select value={category} onChange={(e) => setCategory(e.target.value as Category | "all")} className="min-h-12 rounded-2xl border border-border bg-card px-4 text-sm"><option value="all">{t.all}</option>{CATEGORIES.map((cat) => <option key={cat} value={cat}>{pick(CATEGORY_LABEL[cat])}</option>)}</select></div><div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{filteredElements.length} {t.results}</span><button type="button" onClick={() => { setElementQuery(""); setCategory("all"); }} className="inline-flex items-center gap-1 font-bold text-primary"><RotateCcw className="size-3" />{t.reset}</button></div><div className="mt-5 overflow-x-auto rounded-3xl border border-border bg-card p-3"><div className="grid min-w-[930px] gap-1.5" style={{ gridTemplateColumns: "repeat(18,minmax(44px,1fr))", gridTemplateRows: "repeat(10,60px)" }}>{filteredElements.map((e) => <ElementCard key={e.z} element={e} language={language} selected={selected.z === e.z} onClick={() => setSelected(e)} />)}</div></div><ElementDetails element={selected} language={language} /><section className="mt-6 rounded-2xl border border-border bg-card p-5"><h3 className="font-bold">{t.sources}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{t.sourceText}</p></section></>}
      {tab === "atom" && <><label className="mb-5 block text-sm font-bold">{t.chooseAtom}<select value={selected.z} onChange={(e) => setSelected(ELEMENTS[Number(e.target.value) - 1])} className="ms-3 min-h-11 rounded-xl border border-border bg-card px-3"><option value={selected.z}>{selected.z} · {selected.s} · {language === "ar" ? selected.ar : selected.en}</option>{ELEMENTS.filter((e) => e.z !== selected.z).map((e) => <option key={e.z} value={e.z}>{e.z} · {e.s} · {language === "ar" ? e.ar : e.en}</option>)}</select></label><AtomModel element={selected} language={language} /></>}
      {tab === "molecules" && <><label className="flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-card px-4"><Search className="size-4 text-muted-foreground" /><input value={moleculeQuery} onChange={(e) => setMoleculeQuery(e.target.value)} placeholder={t.moleculeSearch} className="w-full bg-transparent text-sm outline-none" /></label><div className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr]"><div className="space-y-2">{filteredMolecules.map((m) => <button key={m.id} type="button" onClick={() => setSelectedMolecule(m)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-start ${selectedMolecule.id === m.id ? "border-chemistry bg-chemistry/10" : "border-border bg-card hover:bg-secondary"}`}><span><strong className="block">{pick(m.name)}</strong><small className="text-muted-foreground">{pick(KIND_LABEL[m.kind])}</small></span><span className="font-mono text-lg font-black">{m.display}</span></button>)}</div><section className="rounded-3xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-3xl font-black text-chemistry">{selectedMolecule.display}</p><h2 className="mt-1 text-2xl font-black">{pick(selectedMolecule.name)}</h2><p className="text-sm text-muted-foreground">{pick(KIND_LABEL[selectedMolecule.kind])}</p></div><span className="rounded-full bg-chemistry/10 px-3 py-1 text-xs font-bold">{pick(selectedMolecule.geometry)}</span></div><div className="mt-5 grid gap-5 md:grid-cols-2"><MoleculeModel molecule={selectedMolecule} angle={rotation} /><div className="space-y-4"><p className="leading-7 text-muted-foreground">{pick(selectedMolecule.about)}</p><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-secondary p-3"><span className="text-xs text-muted-foreground">{t.geometry}</span><strong className="mt-1 block text-sm">{pick(selectedMolecule.geometry)} {selectedMolecule.angle ?? ""}</strong></div><div className="rounded-xl bg-secondary p-3"><span className="text-xs text-muted-foreground">{t.bonds}</span><strong className="mt-1 block text-sm">{pick(selectedMolecule.bondType)}</strong></div></div><div><span className="text-xs font-bold">{t.composition}</span><div className="mt-2 flex flex-wrap gap-2">{Object.entries(selectedMolecule.composition).map(([symbol, count]) => <span key={symbol} className="rounded-full border border-border px-3 py-1 text-sm font-bold">{symbol} × {count}</span>)}</div></div><label className="block text-xs font-bold">{t.rotate}<input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="mt-2 w-full accent-[hsl(var(--chemistry))]" /></label></div></div></section></div></>}
      {tab === "dictionary" && <><label className="flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-card px-4"><Search className="size-4 text-muted-foreground" /><input value={termQuery} onChange={(e) => setTermQuery(e.target.value)} placeholder={t.termSearch} className="w-full bg-transparent text-sm outline-none" /></label><div className="mt-5 grid gap-3 md:grid-cols-2">{filteredTerms.map((term) => <article key={term.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-baseline justify-between gap-3"><h2 className="text-lg font-black">{pick(term.term)}</h2><span className="text-sm font-semibold text-chemistry">{language === "ar" ? term.term.en : term.term.ar}</span></div><p className="mt-3 text-sm leading-7 text-muted-foreground">{pick(term.def)}</p></article>)}</div></>}
      {tab === "lessons" && <div className="grid gap-6 lg:grid-cols-[280px_1fr]"><nav className="space-y-2">{LESSONS.map((lesson) => <button key={lesson.id} type="button" onClick={() => setSelectedLesson(lesson)} className={`w-full rounded-2xl border p-4 text-start ${selectedLesson.id === lesson.id ? "border-chemistry bg-chemistry/10" : "border-border bg-card hover:bg-secondary"}`}><strong className="block text-sm">{pick(lesson.title)}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{pick(lesson.summary)}</span></button>)}</nav><LessonView key={`${selectedLesson.id}-${language}`} lesson={selectedLesson} language={language} /></div>}
    </div>
  </main>;
}
