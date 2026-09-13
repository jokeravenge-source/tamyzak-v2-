import { useEffect, useId, useRef, useState } from "react";
import { BatteryCharging, ChevronDown, Lightbulb, Power, Wrench } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

export type LocalizedActivityText = { en: string; ar: string };

export interface SelfInductionActivityContent {
  activityLabel: LocalizedActivityText;
  title: LocalizedActivityText;
  toolsHeading: LocalizedActivityText;
  tools: LocalizedActivityText[];
  diagramHeading: LocalizedActivityText;
  figureLabel: LocalizedActivityText;
  closedLabel: LocalizedActivityText;
  openedLabel: LocalizedActivityText;
  toggleHint: LocalizedActivityText;
  currentLabel: LocalizedActivityText;
  lampDarkLabel: LocalizedActivityText;
  spikeLabel: LocalizedActivityText;
  conclusionHeading: LocalizedActivityText;
  firstHeading: LocalizedActivityText;
  firstExplanation: LocalizedActivityText;
  secondHeading: LocalizedActivityText;
  secondExplanation: LocalizedActivityText;
  takeaway: LocalizedActivityText;
}

const defaultSelfInductionContent: SelfInductionActivityContent = {
  activityLabel: { en: "Activity (3)", ar: "النشاط (3)" },
  title: {
    en: "Generating Self-Induced EMF at Both Ends of the Coil",
    ar: "توليد قوة دافعة كهربائية حثية ذاتيًا عند طرفي الملف",
  },
  toolsHeading: { en: "Tools of Activity", ar: "أدوات النشاط" },
  tools: [
    { en: "9V battery", ar: "بطارية 9 فولت" },
    { en: "Switch", ar: "مفتاح كهربائي" },
    { en: "Wire coil with a wrought-iron core", ar: "ملف سلكي ذو قلب من الحديد المطاوع" },
    { en: "80V neon lamp", ar: "مصباح نيون 80 فولت" },
  ],
  diagramHeading: { en: "Interactive circuit", ar: "الدائرة التفاعلية" },
  figureLabel: { en: "Figure (48)", ar: "الشكل (48)" },
  closedLabel: { en: "Switch closed", ar: "المفتاح مغلق" },
  openedLabel: { en: "Switch opened", ar: "المفتاح مفتوح" },
  toggleHint: {
    en: "Press the switch to open or close the circuit.",
    ar: "اضغط على المفتاح لفتح الدائرة أو غلقها.",
  },
  currentLabel: { en: "Current is building", ar: "التيار يتزايد" },
  lampDarkLabel: { en: "Lamp stays dark", ar: "المصباح لا يتوهج" },
  spikeLabel: { en: "Induced EMF spike", ar: "نبضة قوة دافعة حثية" },
  conclusionHeading: { en: "Conclusion", ar: "الاستنتاج" },
  firstHeading: { en: "First — when the switch is closed", ar: "أولًا — عند غلق المفتاح" },
  firstExplanation: {
    en: "The neon lamp does not glow. As the current in the coil grows from zero, the changing magnetic flux creates a self-induced EMF that opposes the increase in current according to Lenz’s law. The voltage across the lamp is therefore not enough to make it glow.",
    ar: "لا يتوهج مصباح النيون. عندما يزداد التيار في الملف من الصفر، يولّد تغيّر الفيض المغناطيسي قوة دافعة كهربائية حثية ذاتية تعارض ازدياد التيار وفق قانون لنز؛ لذلك لا يكون فرق الجهد بين طرفي المصباح كافيًا لتوهجه.",
  },
  secondHeading: { en: "Second — when the switch is opened", ar: "ثانيًا — عند فتح المفتاح" },
  secondExplanation: {
    en: "The current collapses rapidly, producing a large self-induced EMF across the coil. For a brief moment, the coil releases its stored magnetic energy and drives enough voltage across the neon lamp to make it flash.",
    ar: "يتلاشى التيار بسرعة، فيتولد بين طرفي الملف فرق جهد حثي ذاتي كبير. وللحظة قصيرة يحرر الملف الطاقة المغناطيسية المخزونة ويدفع فرق جهد كافيًا عبر مصباح النيون فيتوهج بوميض سريع.",
  },
  takeaway: {
    en: "The coil acts as a source of energy which provides the lamp enough voltage to glow.",
    ar: "يعمل الملف كمصدر للطاقة يزوّد المصباح بفرق جهد كافٍ ليتوهج.",
  },
};

export interface SelfInductionActivityProps {
  language: AppLanguage;
  content?: Partial<SelfInductionActivityContent>;
  className?: string;
}

const SelfInductionActivity = ({ language, content, className = "" }: SelfInductionActivityProps) => {
  const text = { ...defaultSelfInductionContent, ...content };
  const isRTL = language === "ar";
  const pick = (value: LocalizedActivityText) => value[language];
  const filterId = `neon-glow-${useId().replace(/:/g, "")}`;
  const [isClosed, setIsClosed] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const flashTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
  }, []);

  const toggleSwitch = () => {
    if (isClosed) {
      setIsClosed(false);
      setIsFlashing(true);
      setFlashKey((value) => value + 1);
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setIsFlashing(false), 950);
      return;
    }
    setIsFlashing(false);
    setIsClosed(true);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`clip-facet-lg relative overflow-hidden border border-physics/30 bg-card/70 shadow-[0_24px_80px_-32px_hsl(var(--physics)/0.45)] backdrop-blur-xl ${isRTL ? "font-body-ar" : "font-body"} ${className}`}
    >
      <style>{`
        @keyframes self-induction-current-flow { to { stroke-dashoffset: -48; } }
        @keyframes self-induction-neon-flash {
          0% { opacity: 0; transform: scale(.82); }
          14% { opacity: 1; transform: scale(1.16); }
          42% { opacity: .88; transform: scale(1.03); }
          100% { opacity: 0; transform: scale(.94); }
        }
        @keyframes self-induction-spike-rise {
          0% { opacity: 0; transform: translateY(8px) scale(.92); }
          18% { opacity: 1; transform: translateY(0) scale(1); }
          78% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-5px) scale(.98); }
        }
        .self-induction-current { animation: self-induction-current-flow .75s linear infinite; }
        .self-induction-flash { animation: self-induction-neon-flash .9s ease-out both; transform-box: fill-box; transform-origin: center; }
        .self-induction-spike { animation: self-induction-spike-rise .9s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .self-induction-current, .self-induction-flash, .self-induction-spike { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--physics)/0.2),transparent_38%)]" />

      <header className="relative border-b border-physics/20 px-5 pb-7 pt-5 sm:px-8 sm:pb-8 sm:pt-7">
        <div
          className="inline-flex min-h-11 items-center bg-red-600 px-6 py-2 text-sm font-extrabold tracking-wide text-white shadow-lg shadow-red-950/20 sm:text-base"
          style={{ clipPath: isRTL ? "polygon(12% 0,100% 0,100% 100%,0 100%)" : "polygon(0 0,88% 0,100% 100%,0 100%)" }}
        >
          {pick(text.activityLabel)}
        </div>
        <div className="mt-4 max-w-4xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-physics">
            {isRTL ? "الحث الكهرومغناطيسي" : "Electromagnetic induction"}
          </p>
          <h2 className="text-balance text-2xl font-extrabold leading-tight text-foreground sm:text-3xl lg:text-4xl">
            {pick(text.title)}
          </h2>
        </div>
      </header>

      <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(250px,.7fr)]">
        <div className="min-w-0 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-physics sm:text-xl">
                <BatteryCharging className="size-5" aria-hidden="true" />
                {pick(text.diagramHeading)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{pick(text.toggleHint)}</p>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${isClosed ? "border-sky-400/40 bg-sky-400/10 text-sky-300" : "border-amber-400/40 bg-amber-400/10 text-amber-300"}`}>
              {pick(isClosed ? text.closedLabel : text.openedLabel)}
            </span>
          </div>

          <div className="clip-facet relative overflow-hidden border border-physics/25 bg-slate-950/90 p-2 sm:p-4">
            <svg viewBox="0 0 760 360" className="h-auto w-full" role="img" aria-label={pick(text.diagramHeading)}>
              <defs>
                <filter id={filterId} x="-180%" y="-180%" width="460%" height="460%">
                  <feGaussianBlur stdDeviation="13" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id={`${filterId}-core`} x1="0" x2="1">
                  <stop offset="0" stopColor="#64748b" />
                  <stop offset=".5" stopColor="#e2e8f0" />
                  <stop offset="1" stopColor="#475569" />
                </linearGradient>
              </defs>

              <g fill="none" stroke="#94a3b8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
                <path d="M116 86H235 M316 86H520V280H116V218 M116 160V86" />
                <path d="M520 86H648V134 M648 226V280H520" />
              </g>

              <g aria-label={pick(text.tools[0])}>
                <line x1="84" y1="160" x2="148" y2="160" stroke="#f8fafc" strokeWidth="8" />
                <line x1="96" y1="188" x2="136" y2="188" stroke="#f8fafc" strokeWidth="5" />
                <path d="M116 160V128 M116 188V218" stroke="#94a3b8" strokeWidth="5" />
                <text x="70" y="178" fill="#38bdf8" fontSize="20" fontWeight="700">9V</text>
              </g>

              <g
                role="button"
                tabIndex={0}
                aria-label={pick(isClosed ? text.openedLabel : text.closedLabel)}
                onClick={toggleSwitch}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleSwitch();
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <circle cx="245" cy="86" r="10" fill="#0f172a" stroke="#e2e8f0" strokeWidth="5" />
                <circle cx="306" cy="86" r="10" fill="#0f172a" stroke="#e2e8f0" strokeWidth="5" />
                <line
                  x1="250"
                  y1="82"
                  x2={isClosed ? "301" : "296"}
                  y2={isClosed ? "82" : "48"}
                  stroke={isClosed ? "#38bdf8" : "#fbbf24"}
                  strokeWidth="9"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <rect x="218" y="28" width="116" height="85" rx="18" fill="transparent" />
              </g>

              <g aria-label={pick(text.tools[2])}>
                <rect x="493" y="115" width="54" height="142" rx="10" fill={`url(#${filterId}-core)`} opacity=".85" />
                <path
                  d="M520 105c-28 0-28 25 0 25s28 25 0 25-28 25 0 25 28 25 0 25-28 25 0 25 28 25 0 25-28 25 0 25"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </g>

              <g aria-label={pick(text.tools[3])}>
                {isFlashing && (
                  <circle key={`glow-${flashKey}`} cx="648" cy="180" r="58" fill="#fde047" opacity=".9" filter={`url(#${filterId})`} className="self-induction-flash" />
                )}
                <circle cx="648" cy="180" r="43" fill={isFlashing ? "#fef9c3" : "#111827"} stroke={isFlashing ? "#fde047" : "#64748b"} strokeWidth="6" />
                <path d="M632 190c8-20 24-20 32 0M638 171l20 18M658 171l-20 18" fill="none" stroke={isFlashing ? "#f97316" : "#475569"} strokeWidth="5" strokeLinecap="round" />
                <text x="648" y="250" fill="#cbd5e1" textAnchor="middle" fontSize="17" fontWeight="700">80V NEON</text>
              </g>

              {isClosed && (
                <path
                  d="M116 145V86H235 M316 86H520V280H116V205"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="8"
                  strokeDasharray="18 14"
                  strokeLinecap="round"
                  className="self-induction-current"
                />
              )}

              {isFlashing && (
                <g key={`spike-${flashKey}`} className="self-induction-spike">
                  <path d="M430 56l-12 26h17l-10 28 35-39h-19l12-15z" fill="#fde047" stroke="#f59e0b" strokeWidth="2" />
                  <rect x="346" y="16" width="238" height="35" rx="17" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
                  <text x="465" y="39" fill="#fef3c7" textAnchor="middle" fontSize="17" fontWeight="800">⚡ {pick(text.spikeLabel)}</text>
                </g>
              )}

              <text x="116" y="322" fill="#94a3b8" textAnchor="middle" fontSize="17">{pick(text.tools[0])}</text>
              <text x="276" y="136" fill="#94a3b8" textAnchor="middle" fontSize="17">{pick(isClosed ? text.closedLabel : text.openedLabel)}</text>
              <text x="520" y="322" fill="#94a3b8" textAnchor="middle" fontSize="17">{pick(text.tools[2])}</text>
            </svg>

            <div className="absolute bottom-3 start-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
              <span className={`size-2 rounded-full ${isClosed ? "bg-sky-400 shadow-[0_0_12px_#38bdf8]" : isFlashing ? "bg-yellow-300 shadow-[0_0_14px_#fde047]" : "bg-slate-600"}`} />
              {isClosed ? pick(text.currentLabel) : isFlashing ? pick(text.spikeLabel) : pick(text.lampDarkLabel)}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{pick(text.figureLabel)}</p>
            <button
              type="button"
              onClick={toggleSwitch}
              aria-pressed={isClosed}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-sm font-extrabold transition-all active:scale-[.98] ${isClosed ? "border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20" : "border-physics/50 bg-physics/15 text-sky-200 hover:bg-physics/25"}`}
            >
              <Power className="size-5" aria-hidden="true" />
              {pick(isClosed ? text.openedLabel : text.closedLabel)}
            </button>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="clip-facet border border-physics/25 bg-physics/5 p-5">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-physics">
              <Wrench className="size-5" aria-hidden="true" />
              {pick(text.toolsHeading)}
            </h3>
            <ul className="mt-4 space-y-3">
              {text.tools.map((tool, index) => (
                <li key={`${tool.en}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-foreground/90">
                  <span className="mt-2 size-2 shrink-0 rotate-45 bg-physics shadow-[0_0_10px_hsl(var(--physics)/0.65)]" />
                  <span>{pick(tool)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-physics">
              <Lightbulb className="size-5" aria-hidden="true" />
              {pick(text.conclusionHeading)}
            </h3>

            <details className="group clip-facet border border-border/80 bg-background/45" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-bold text-foreground marker:content-none">
                <span>{pick(text.firstHeading)}</span>
                <ChevronDown className="size-4 shrink-0 text-physics transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border/60 px-4 pb-4 pt-3 text-sm leading-7 text-muted-foreground">
                {pick(text.firstExplanation)}
              </div>
            </details>

            <details className="group clip-facet border border-border/80 bg-background/45">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-bold text-foreground marker:content-none">
                <span>{pick(text.secondHeading)}</span>
                <ChevronDown className="size-4 shrink-0 text-physics transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border/60 px-4 pb-4 pt-3 text-sm leading-7 text-muted-foreground">
                <p>{pick(text.secondExplanation)}</p>
                <p className="mt-3 border-s-4 border-physics bg-physics/10 px-3 py-2 font-extrabold text-foreground">
                  {pick(text.takeaway)}
                </p>
              </div>
            </details>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default SelfInductionActivity;
