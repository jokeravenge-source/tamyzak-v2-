import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { CheckCircle2, Gauge, Layers3, MoveHorizontal, RotateCcw, Sparkles, Zap } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

const copy = {
  ar: {
    chapter: "الفصل الأول · المتسعات",
    title: "إدخال عازل في متسعة مشحونة معزولة",
    subtitle: "اسحب لوح العازل الأزرق بيدك إلى داخل المتسعة أو خارجها، وراقب تغيّر السعة وقراءة الفولتمتر مباشرة.",
    reset: "إعادة النشاط",
    experiment: "المتسعة التفاعلية ثنائية الأبعاد",
    dragHint: "اسحب لوح العازل أفقيًا",
    positivePlate: "اللوح الموجب",
    negativePlate: "اللوح السالب",
    dielectric: "العازل",
    outside: "خارج المتسعة",
    inside: "داخل المتسعة",
    insertion: "نسبة إدخال العازل",
    dielectricConstant: "ثابت العزل κ",
    initialVoltage: "الجهد قبل إدخال العازل",
    voltage: "قراءة الفولتمتر",
    capacitance: "السعة النسبية",
    charge: "الشحنة",
    chargeFixed: "ثابتة لأن المتسعة معزولة",
    observation: "المشاهدة",
    observationOutside: "العازل خارج المتسعة، لذلك تكون السعة أصغر وقراءة الفولتمتر عند قيمتها الابتدائية.",
    observationPartial: "بدخول جزء من العازل تزداد سعة المتسعة تدريجيًا، بينما تنخفض قراءة الفولتمتر.",
    observationInside: "عند دخول العازل بالكامل تصبح السعة أكبر ما يمكن، وتصل قراءة الفولتمتر إلى أقل قيمة.",
    conclusion: "الاستنتاج",
    conclusionText: "عند إدخال مادة عازلة بين لوحي متسعة مشحونة ومعزولة تزداد سعتها، وبما أن شحنتها تبقى ثابتة فإن فرق الجهد بين لوحيها ينخفض.",
    relation: "للمتسعة المعزولة: Q ثابت، لذلك V يتناسب عكسيًا مع C.",
  },
  en: {
    chapter: "Chapter 1 · Capacitors",
    title: "Inserting a Dielectric into an Isolated Charged Capacitor",
    subtitle: "Drag the blue dielectric slab into or out of the capacitor and watch capacitance and voltmeter reading update immediately.",
    reset: "Reset activity",
    experiment: "Interactive 2D capacitor",
    dragHint: "Drag the dielectric horizontally",
    positivePlate: "Positive plate",
    negativePlate: "Negative plate",
    dielectric: "Dielectric",
    outside: "Outside capacitor",
    inside: "Inside capacitor",
    insertion: "Dielectric insertion",
    dielectricConstant: "Dielectric constant κ",
    initialVoltage: "Voltage before insertion",
    voltage: "Voltmeter reading",
    capacitance: "Relative capacitance",
    charge: "Charge",
    chargeFixed: "Fixed because the capacitor is isolated",
    observation: "Observation",
    observationOutside: "The dielectric is outside, so capacitance is smallest and the voltmeter remains at its initial reading.",
    observationPartial: "As the dielectric enters, capacitance gradually increases while the voltmeter reading decreases.",
    observationInside: "With the dielectric fully inserted, capacitance is greatest and the voltmeter reaches its lowest reading.",
    conclusion: "Conclusion",
    conclusionText: "Inserting a dielectric between the plates of an isolated charged capacitor increases its capacitance. Since its charge remains fixed, the potential difference between the plates decreases.",
    relation: "For an isolated capacitor: Q is fixed, so V is inversely proportional to C.",
  },
} as const;

const IN_X = 320;
const OUT_X = 550;
const SLAB_WIDTH = 120;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const DielectricCapacitorActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const svgRef = useRef<SVGSVGElement>(null);
  const [insertion, setInsertion] = useState(0);
  const [kappa, setKappa] = useState(3);
  const [initialVoltage, setInitialVoltage] = useState(10);
  const [dragging, setDragging] = useState(false);

  const slabX = OUT_X + (IN_X - OUT_X) * insertion;
  const relativeCapacitance = 1 + (kappa - 1) * insertion;
  const voltage = initialVoltage / relativeCapacitance;
  const observation = insertion < 0.05 ? t.observationOutside : insertion > 0.95 ? t.observationInside : t.observationPartial;

  const setFromPointer = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const x = ((clientX - bounds.left) / bounds.width) * 760;
    setInsertion(clamp((OUT_X - x + SLAB_WIDTH / 2) / (OUT_X - IN_X)));
  };

  const startDrag = (event: PointerEvent<SVGGElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setFromPointer(event.clientX);
  };

  const moveDrag = (event: PointerEvent<SVGGElement>) => {
    if (!dragging) return;
    setFromPointer(event.clientX);
  };

  const stopDrag = (event: PointerEvent<SVGGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };

  const moveWithKeyboard = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const physicalDirection = event.key === "ArrowLeft" ? 1 : -1;
    setInsertion((value) => clamp(value + physicalDirection * 0.05));
  };

  const reset = () => {
    setInsertion(0);
    setKappa(3);
    setInitialVoltage(10);
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_18%_0%,hsl(var(--physics)/.2),transparent_58%)]" />
      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-physics"><Sparkles className="size-4" aria-hidden="true" />{t.chapter}</p>
          <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-4xl">{t.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{t.subtitle}</p>
        </div>
        <button type="button" onClick={reset} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold transition hover:border-physics/50 hover:bg-physics/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics"><RotateCcw className="size-4" aria-hidden="true" />{t.reset}</button>
      </header>

      <div className="relative grid gap-6 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.42fr)_minmax(300px,.58fr)]">
        <div className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-3 text-white shadow-2xl sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg"><Layers3 className="size-5 text-cyan-300" aria-hidden="true" />{t.experiment}</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${insertion > .95 ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"}`}>{insertion > .95 ? t.inside : t.outside}</span>
            </div>

            <svg ref={svgRef} viewBox="0 0 760 400" className="h-auto w-full select-none" role="img" aria-label={t.experiment} data-insertion={insertion.toFixed(2)} data-voltage={voltage.toFixed(2)}>
              <defs>
                <linearGradient id="dielectric-slab" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#22d3ee" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
                <filter id="slab-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <marker id="field-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#facc15" /></marker>
              </defs>

              <rect x="24" y="22" width="712" height="332" rx="26" fill="#07111f" stroke="#1e3a5f" strokeWidth="2" />
              <rect x="285" y="72" width="18" height="218" rx="8" fill="#fb7185" />
              <rect x="457" y="72" width="18" height="218" rx="8" fill="#60a5fa" />
              {Array.from({ length: 8 }, (_, index) => <text key={`plus-${index}`} x="294" y={96 + index * 26} textAnchor="middle" fill="#fff" fontSize="16" fontWeight="900">+</text>)}
              {Array.from({ length: 8 }, (_, index) => <text key={`minus-${index}`} x="466" y={96 + index * 26} textAnchor="middle" fill="#fff" fontSize="18" fontWeight="900">−</text>)}
              {Array.from({ length: 6 }, (_, index) => <line key={`field-${index}`} x1="315" y1={102 + index * 34} x2="445" y2={102 + index * 34} stroke="#facc15" strokeWidth="2" strokeDasharray="8 7" markerEnd="url(#field-arrow)" opacity={.9 - insertion * .42} />)}

              <g
                role="slider"
                tabIndex={0}
                aria-label={t.dragHint}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(insertion * 100)}
                transform={`translate(${slabX} 0)`}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                onKeyDown={moveWithKeyboard}
                className="cursor-grab outline-none focus-visible:drop-shadow-[0_0_10px_#22d3ee] active:cursor-grabbing"
                style={{ touchAction: "none" }}
              >
                <rect x="0" y="84" width={SLAB_WIDTH} height="194" rx="12" fill="url(#dielectric-slab)" opacity=".9" filter={dragging ? "url(#slab-glow)" : undefined} stroke="#a5f3fc" strokeWidth="3" />
                <path d="M30 105H90M24 181H96M30 257H90" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" opacity=".8" />
                <text x="60" y="190" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="900">κ = {kappa.toFixed(1)}</text>
              </g>

              <path d="M294 304V332H380" fill="none" stroke="#f8fafc" strokeWidth="3" />
              <path d="M466 304V332H430" fill="none" stroke="#f8fafc" strokeWidth="3" />
              <circle cx="405" cy="332" r="38" fill="#0f172a" stroke="#e2e8f0" strokeWidth="3" />
              <path d={`M405 332L${405 + Math.cos((-140 + (voltage / initialVoltage) * 100) * Math.PI / 180) * 27} ${332 + Math.sin((-140 + (voltage / initialVoltage) * 100) * Math.PI / 180) * 27}`} stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
              <circle cx="405" cy="332" r="5" fill="#e2e8f0" />
              <text x="405" y="349" textAnchor="middle" fill="#94a3b8" fontSize="11">V</text>

              <text x="294" y="55" textAnchor="middle" fill="#fda4af" fontSize="14" fontWeight="800">{t.positivePlate}</text>
              <text x="466" y="55" textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="800">{t.negativePlate}</text>
              <g transform="translate(535 315)"><MoveHorizontal width="26" height="26" color="#67e8f9" /><text x="34" y="18" fill="#bae6fd" fontSize="13" fontWeight="700">{t.dragHint}</text></g>
            </svg>
          </div>

          <label className="block rounded-2xl border border-border bg-background/70 p-4">
            <span className="mb-3 flex items-center justify-between gap-3 text-sm font-black"><span className="flex items-center gap-2"><MoveHorizontal className="size-4 text-physics" />{t.insertion}</span><output>{Math.round(insertion * 100)}%</output></span>
            <input aria-label={t.insertion} type="range" min="0" max="1" step="0.01" value={insertion} onChange={(event) => setInsertion(Number(event.target.value))} className="w-full accent-[hsl(var(--physics))]" />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">{t.voltage}</p><p className="mt-2 font-mono text-2xl font-black text-physics">{voltage.toFixed(2)} V</p></div>
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">{t.capacitance}</p><p className="mt-2 font-mono text-2xl font-black text-physics">{relativeCapacitance.toFixed(2)} C₀</p></div>
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">{t.charge}</p><p className="mt-2 text-sm font-black text-emerald-600">{t.chargeFixed}</p></div>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-border bg-background/65 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black"><Gauge className="size-5 text-physics" />{t.experiment}</h3>
            <label className="block"><span className="mb-2 flex justify-between text-sm font-bold"><span>{t.dielectricConstant}</span><output>κ = {kappa.toFixed(1)}</output></span><input aria-label={t.dielectricConstant} type="range" min="1.5" max="8" step="0.5" value={kappa} onChange={(event) => setKappa(Number(event.target.value))} className="w-full accent-[hsl(var(--physics))]" /></label>
            <label className="mt-5 block border-t border-border pt-5"><span className="mb-2 flex justify-between text-sm font-bold"><span>{t.initialVoltage}</span><output>{initialVoltage.toFixed(0)} V</output></span><input aria-label={t.initialVoltage} type="range" min="2" max="20" step="1" value={initialVoltage} onChange={(event) => setInitialVoltage(Number(event.target.value))} className="w-full accent-[hsl(var(--physics))]" /></label>
          </section>

          <section className="rounded-2xl border border-physics/20 bg-physics/5 p-5"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-physics">{t.observation}</p><p className="mt-3 text-sm font-semibold leading-7 text-foreground">{observation}</p></section>

          <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5"><h3 className="mb-2 flex items-center gap-2 font-black"><CheckCircle2 className="size-5 text-emerald-500" />{t.conclusion}</h3><p className="text-sm leading-7 text-muted-foreground">{t.conclusionText}</p><p className="mt-3 rounded-xl bg-background/60 p-3 text-center font-mono text-sm font-black text-foreground">Q = C V → V = Q / C</p><p className="mt-2 text-xs font-semibold leading-5 text-muted-foreground">{t.relation}</p></section>
        </aside>
      </div>
    </section>
  );
};

export default DielectricCapacitorActivity;
