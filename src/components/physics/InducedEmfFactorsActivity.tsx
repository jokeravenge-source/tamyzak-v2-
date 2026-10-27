import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  BatteryCharging,
  CircleGauge,
  Gauge,
  Lightbulb,
  ListChecks,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

type Experiment = "speed" | "turns" | "current";
type MotionDirection = "in" | "out";

const copy = {
  ar: {
    chapter: "الفصل الثاني · الحث الكهرومغناطيسي",
    title: "العوامل المؤثرة في القوة الدافعة الكهربائية الحثية",
    subtitle:
      "نفّذ الأنشطة الثلاثة وغيّر سرعة الحركة وعدد اللفات ومعدل تغيّر التيار، ثم قارن انحراف مؤشر الكلفانومتر.",
    reset: "إعادة النشاط",
    simulator: "مختبر الحث التفاعلي",
    choose: "اختر النشاط",
    speedTab: "سرعة المغناطيس",
    turnsTab: "عدد لفات الملف",
    currentTab: "تغيّر التيار",
    speedControl: "سرعة حركة المغناطيس",
    turnsControl: "عدد لفات الملف",
    currentControl: "معدل تغيّر التيار الابتدائي",
    slow: "بطيئة",
    fast: "سريعة",
    few: "قليلة",
    many: "كثيرة",
    gradual: "تدريجي",
    rapid: "سريع",
    moveIn: "أدخل المغناطيس",
    moveOut: "اسحب المغناطيس",
    changeCurrent: "غيّر التيار",
    replay: "أعد التجربة",
    magnet: "ساق مغناطيسية",
    coil: "الملف الثانوي",
    primary: "الملف الابتدائي",
    galvanometer: "الكلفانومتر",
    battery: "بطارية",
    noDeflection: "المؤشر عند الصفر",
    measuring: "تتولد قوة دافعة حثية الآن",
    measured: "اكتملت المشاهدة",
    deflection: "مقدار انحراف المؤشر",
    directionIn: "اتجاه الانحراف عند الإدخال",
    directionOut: "اتجاه معاكس عند السحب",
    stronger: "انحراف أكبر يعني قوة دافعة حثية أكبر",
    speedObservation:
      "كلما ازدادت سرعة حركة المغناطيس ازداد معدل تغير الفيض المغناطيسي، فيزداد انحراف المؤشر.",
    turnsObservation:
      "عند ثبوت سرعة المغناطيس، يكون انحراف المؤشر أكبر في الملف ذي عدد اللفات الأكبر.",
    currentObservation:
      "كلما كان تغير التيار في الملف الابتدائي أسرع، كان تغير الفيض أكبر وازداد انحراف مؤشر الملف الثانوي.",
    toolsTitle: "أدوات النشاط",
    tools: [
      "ملفان سلكيان متماثلان في الأبعاد ومختلفان في عدد اللفات",
      "ساق مغناطيسية قوية",
      "كلفانومتر حساس",
      "بطارية ومفتاح وأسلاك توصيل",
    ],
    stepsTitle: "خطوات الأنشطة",
    speedSteps: [
      "اربط طرفي الملف بالكلفانومتر الحساس.",
      "حرّك الساق المغناطيسية ببطء نحو الملف وراقب انحراف المؤشر.",
      "كرر الحركة بسرعة أكبر وقارن مقدار الانحراف.",
    ],
    turnsSteps: [
      "اربط الملف الأول بالكلفانومتر ثم حرّك المغناطيس نحوه بسرعة ثابتة.",
      "استبدله بملف ذي عدد لفات أكبر وكرر الحركة بالسرعة نفسها.",
      "قارن مقدار انحراف مؤشر الكلفانومتر في الحالتين.",
    ],
    currentSteps: [
      "ضع ملفين متجاورين واربط الأول ببطارية ومفتاح والثاني بالكلفانومتر.",
      "غيّر التيار في الملف الابتدائي وراقب انحراف مؤشر الملف الثانوي.",
      "زد معدل تغير التيار وقارن مقدار الانحراف.",
    ],
    conclusionTitle: "الاستنتاج",
    conclusion:
      "تتناسب القوة الدافعة الكهربائية الحثية طرديًا مع عدد لفات الملف ومع المعدل الزمني لتغير الفيض المغناطيسي الذي يخترق سطح الملف.",
    formulaLabel: "قانون فاراداي",
  },
  en: {
    chapter: "Chapter 2 · Electromagnetic Induction",
    title: "Factors Affecting the Induced Electromotive Force",
    subtitle:
      "Run the three activities, change motion speed, coil turns, and the rate of current change, then compare the galvanometer deflection.",
    reset: "Reset activity",
    simulator: "Interactive induction lab",
    choose: "Choose an activity",
    speedTab: "Magnet speed",
    turnsTab: "Coil turns",
    currentTab: "Current change",
    speedControl: "Magnet motion speed",
    turnsControl: "Number of coil turns",
    currentControl: "Rate of primary-current change",
    slow: "Slow",
    fast: "Fast",
    few: "Fewer",
    many: "More",
    gradual: "Gradual",
    rapid: "Rapid",
    moveIn: "Move magnet in",
    moveOut: "Pull magnet out",
    changeCurrent: "Change the current",
    replay: "Run again",
    magnet: "Bar magnet",
    coil: "Secondary coil",
    primary: "Primary coil",
    galvanometer: "Galvanometer",
    battery: "Battery",
    noDeflection: "Pointer at zero",
    measuring: "An induced EMF is being generated",
    measured: "Observation complete",
    deflection: "Pointer deflection",
    directionIn: "Deflection direction during insertion",
    directionOut: "Opposite direction during withdrawal",
    stronger: "A larger deflection indicates a larger induced EMF",
    speedObservation:
      "Increasing the magnet's speed increases the rate of change of magnetic flux, so the pointer deflection increases.",
    turnsObservation:
      "At the same magnet speed, the pointer deflection is larger for the coil with more turns.",
    currentObservation:
      "A faster change of current in the primary coil produces a greater flux change and a larger pointer deflection in the secondary circuit.",
    toolsTitle: "Activity tools",
    tools: [
      "Two wire coils with equal dimensions but different numbers of turns",
      "A strong bar magnet",
      "A sensitive galvanometer",
      "A battery, switch, and connecting wires",
    ],
    stepsTitle: "Activity steps",
    speedSteps: [
      "Connect the coil terminals to the sensitive galvanometer.",
      "Move the bar magnet slowly toward the coil and observe the pointer.",
      "Repeat at a higher speed and compare the deflection.",
    ],
    turnsSteps: [
      "Connect the first coil to the galvanometer and move the magnet toward it at a constant speed.",
      "Replace it with a coil having more turns and repeat at the same speed.",
      "Compare the galvanometer deflection in both cases.",
    ],
    currentSteps: [
      "Place two coils side by side; connect the first to a battery and switch and the second to the galvanometer.",
      "Change the current in the primary coil and observe the secondary-circuit pointer.",
      "Increase the rate of current change and compare the deflection.",
    ],
    conclusionTitle: "Conclusion",
    conclusion:
      "The induced electromotive force is directly proportional to the number of coil turns and to the time rate of change of the magnetic flux through the coil.",
    formulaLabel: "Faraday's law",
  },
} as const;

const InducedEmfFactorsActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const visualId = `emf-factors-${useId().replace(/:/g, "")}`;
  const [experiment, setExperiment] = useState<Experiment>("speed");
  const [speed, setSpeed] = useState(45);
  const [turns, setTurns] = useState(120);
  const [currentRate, setCurrentRate] = useState(45);
  const [direction, setDirection] = useState<MotionDirection>("in");
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const normalizedStrength = useMemo(() => {
    if (experiment === "speed") return speed / 100;
    if (experiment === "turns") return ((turns - 40) / 200) * 0.82 + 0.18;
    return currentRate / 100;
  }, [currentRate, experiment, speed, turns]);

  const deflection = running || hasRun ? Math.round(normalizedStrength * 100) : 0;
  const needleAngle = (direction === "in" ? 1 : -1) * normalizedStrength * 48;
  const visibleTurns = Math.round(5 + ((turns - 40) / 200) * 8);

  const observation =
    experiment === "speed" ? t.speedObservation : experiment === "turns" ? t.turnsObservation : t.currentObservation;
  const steps = experiment === "speed" ? t.speedSteps : experiment === "turns" ? t.turnsSteps : t.currentSteps;

  const run = (nextDirection: MotionDirection = "in") => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setDirection(nextDirection);
    setRunning(true);
    setHasRun(false);
    setRunKey((value) => value + 1);
    const duration = experiment === "speed" ? Math.max(500, 1750 - speed * 11) : 950;
    timer.current = window.setTimeout(() => {
      setRunning(false);
      setHasRun(true);
    }, duration);
  };

  const chooseExperiment = (next: Experiment) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setExperiment(next);
    setRunning(false);
    setHasRun(false);
    setDirection("in");
  };

  const reset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setExperiment("speed");
    setSpeed(45);
    setTurns(120);
    setCurrentRate(45);
    setDirection("in");
    setRunning(false);
    setHasRun(false);
    setRunKey((value) => value + 1);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}
    >
      <style>{`
        @keyframes emf-magnet-in { from { transform: translateX(-92px); } to { transform: translateX(12px); } }
        @keyframes emf-magnet-out { from { transform: translateX(12px); } to { transform: translateX(-92px); } }
        @keyframes emf-flux { 0%, 100% { opacity: .15; stroke-dashoffset: 28; } 50% { opacity: 1; stroke-dashoffset: 0; } }
        @keyframes emf-current { to { stroke-dashoffset: -36; } }
        .emf-magnet-in { animation: emf-magnet-in var(--emf-duration, 1s) cubic-bezier(.2,.8,.2,1) both; }
        .emf-magnet-out { animation: emf-magnet-out var(--emf-duration, 1s) cubic-bezier(.2,.8,.2,1) both; }
        .emf-flux { animation: emf-flux .85s ease-in-out infinite; }
        .emf-current { animation: emf-current .65s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .emf-magnet-in, .emf-magnet-out, .emf-flux, .emf-current { animation-duration: .01ms; animation-iteration-count: 1; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_18%_0%,hsl(var(--physics)/.2),transparent_58%)]" />

      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-physics">
            <Activity className="size-4" aria-hidden="true" />
            {t.chapter}
          </p>
          <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-4xl">{t.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:border-physics/50 hover:bg-physics/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {t.reset}
        </button>
      </header>

      <div className="relative grid gap-6 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.72fr)]">
        <div className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-2xl sm:p-6">
            <div className="mb-5">
              <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                <CircleGauge className="size-5 text-cyan-400" aria-hidden="true" />
                {t.simulator}
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-400">{t.choose}</p>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2" role="group" aria-label={t.choose}>
              {([
                ["speed", t.speedTab, Gauge],
                ["turns", t.turnsTab, ArrowLeftRight],
                ["current", t.currentTab, BatteryCharging],
              ] as const).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseExperiment(value)}
                  aria-pressed={experiment === value}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-black transition sm:flex-row sm:text-xs ${experiment === value ? "border-cyan-300/55 bg-cyan-300/15 text-cyan-200" : "border-white/10 bg-white/[.04] text-slate-400 hover:border-cyan-300/30 hover:text-slate-200"}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#020617] p-2 sm:p-4">
              <svg viewBox="0 0 860 390" className="h-auto w-full" role="img" aria-label={t.simulator}>
                <defs>
                  <filter id={visualId} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {experiment !== "current" ? (
                  <>
                    <g
                      key={`magnet-${runKey}`}
                      className={running ? (direction === "in" ? "emf-magnet-in" : "emf-magnet-out") : ""}
                      style={{ "--emf-duration": `${Math.max(500, 1750 - speed * 11)}ms` } as React.CSSProperties}
                    >
                      <rect x="92" y="160" width="190" height="72" rx="14" fill="#2563eb" />
                      <path d="M187 160h95v72h-95z" fill="#dc2626" />
                      <text x="140" y="205" fill="#fff" textAnchor="middle" fontSize="28" fontWeight="900">S</text>
                      <text x="235" y="205" fill="#fff" textAnchor="middle" fontSize="28" fontWeight="900">N</text>
                      <text x="187" y="258" fill="#94a3b8" textAnchor="middle" fontSize="15">{t.magnet}</text>
                    </g>

                    <g aria-label={t.coil}>
                      {Array.from({ length: visibleTurns }, (_, index) => (
                        <ellipse key={index} cx={440 + index * 8} cy="196" rx="35" ry="106" fill="none" stroke="#f59e0b" strokeWidth="7" opacity={.58 + index / visibleTurns / 2} />
                      ))}
                      <path d="M472 90V52H690V116M690 276V338H472V302" fill="none" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                    </g>

                    {running && (
                      <g className="emf-flux" fill="none" stroke="#a78bfa" strokeWidth="6" strokeDasharray="14 10" strokeLinecap="round">
                        <path d="M294 150c60-58 119-65 174-30" />
                        <path d="M294 242c60 58 119 65 174 30" />
                      </g>
                    )}
                  </>
                ) : (
                  <>
                    <g aria-label={t.primary}>
                      {Array.from({ length: 8 }, (_, index) => (
                        <ellipse key={index} cx={294 + index * 8} cy="194" rx="31" ry="102" fill="none" stroke="#fb923c" strokeWidth="7" />
                      ))}
                      <path d="M294 91V48H92V156M92 232V338H294V297" fill="none" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                      <line x1="62" y1="156" x2="122" y2="156" stroke="#f8fafc" strokeWidth="8" />
                      <line x1="73" y1="186" x2="111" y2="186" stroke="#f8fafc" strokeWidth="5" />
                      <text x="142" y="180" fill="#38bdf8" fontSize="17" fontWeight="800">{t.battery}</text>
                    </g>
                    <g aria-label={t.coil}>
                      {Array.from({ length: 8 }, (_, index) => (
                        <ellipse key={index} cx={480 + index * 8} cy="194" rx="31" ry="102" fill="none" stroke="#38bdf8" strokeWidth="7" />
                      ))}
                      <path d="M512 91V48H690V116M690 276V338H512V297" fill="none" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                    </g>
                    {running && (
                      <>
                        <path d="M92 140V48H294" fill="none" stroke="#fb923c" strokeWidth="8" strokeDasharray="14 10" className="emf-current" />
                        <path d="M375 142c38-31 74-31 112 0M375 246c38 31 74 31 112 0" fill="none" stroke="#a78bfa" strokeWidth="7" strokeDasharray="14 10" className="emf-flux" />
                      </>
                    )}
                    <text x="326" y="330" fill="#fb923c" textAnchor="middle" fontSize="15" fontWeight="800">{t.primary}</text>
                  </>
                )}

                <g aria-label={t.galvanometer}>
                  <circle cx="690" cy="196" r="78" fill="#0f172a" stroke="#64748b" strokeWidth="6" />
                  <path d="M638 218a56 56 0 0 1 104 0" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                  <g
                    data-testid="emf-needle"
                    data-strength={deflection}
                    style={{ transform: `rotate(${running ? needleAngle : 0}deg)`, transformOrigin: "690px 225px", transition: "transform 240ms cubic-bezier(.2,.8,.2,1)" }}
                  >
                    <line x1="690" y1="225" x2="690" y2="157" stroke={running ? "#f87171" : "#e2e8f0"} strokeWidth="6" strokeLinecap="round" />
                  </g>
                  <circle cx="690" cy="225" r="9" fill="#f8fafc" />
                  <text x="690" y="252" fill="#94a3b8" textAnchor="middle" fontSize="18" fontWeight="800">G</text>
                  <text x="636" y="208" fill="#64748b" fontSize="15">−</text>
                  <text x="736" y="208" fill="#64748b" fontSize="15">+</text>
                  {running && <circle cx="690" cy="196" r="84" fill="none" stroke="#38bdf8" strokeWidth="3" opacity=".55" filter={`url(#${visualId})`} />}
                </g>
              </svg>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[.04] p-4">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor={`${visualId}-control`} className="text-sm font-extrabold text-white">
                  {experiment === "speed" ? t.speedControl : experiment === "turns" ? t.turnsControl : t.currentControl}
                </label>
                <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-xs font-black tabular-nums text-cyan-200">
                  {experiment === "turns" ? turns : experiment === "speed" ? `${speed}%` : `${currentRate}%`}
                </span>
              </div>
              <input
                id={`${visualId}-control`}
                type="range"
                min={experiment === "turns" ? 40 : 20}
                max={experiment === "turns" ? 240 : 100}
                step={experiment === "turns" ? 20 : 5}
                value={experiment === "speed" ? speed : experiment === "turns" ? turns : currentRate}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setHasRun(false);
                  if (experiment === "speed") setSpeed(value);
                  else if (experiment === "turns") setTurns(value);
                  else setCurrentRate(value);
                }}
                className="mt-4 w-full accent-cyan-400"
              />
              <div className="mt-1 flex justify-between text-[11px] font-bold text-slate-500">
                <span>{experiment === "speed" ? t.slow : experiment === "turns" ? t.few : t.gradual}</span>
                <span>{experiment === "speed" ? t.fast : experiment === "turns" ? t.many : t.rapid}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => run("in")}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-3 text-xs font-black text-cyan-200 transition hover:bg-cyan-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <Play className="size-4" aria-hidden="true" />
                  {experiment === "current" ? t.changeCurrent : t.moveIn}
                </button>
                <button
                  type="button"
                  onClick={() => run("out")}
                  disabled={experiment === "current"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-400/35 bg-violet-400/10 px-3 text-xs font-black text-violet-200 transition hover:bg-violet-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowLeftRight className="size-4" aria-hidden="true" />
                  {t.moveOut}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex items-start gap-3">
                <span className={`mt-1 size-3 shrink-0 rounded-full ${running ? "bg-cyan-300 shadow-[0_0_16px_#67e8f9]" : hasRun ? "bg-emerald-400" : "bg-slate-600"}`} />
                <div>
                  <p className="text-sm font-extrabold text-white" aria-live="polite">
                    {running ? t.measuring : hasRun ? t.measured : t.noDeflection}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {hasRun || running ? (direction === "in" ? t.directionIn : t.directionOut) : t.stronger}
                  </p>
                </div>
              </div>
              <div className="min-w-32 rounded-xl bg-white/[.05] px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{t.deflection}</p>
                <p className="mt-1 text-2xl font-black tabular-nums text-cyan-300">{deflection}%</p>
              </div>
            </div>
          </div>

          <section className="rounded-2xl border border-violet-400/25 bg-violet-400/10 p-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground">
              <SlidersHorizontal className="size-5 text-violet-400" aria-hidden="true" />
              {experiment === "speed" ? t.speedTab : experiment === "turns" ? t.turnsTab : t.currentTab}
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{observation}</p>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-border bg-background/65 p-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground">
              <Wrench className="size-5 text-physics" aria-hidden="true" />
              {t.toolsTitle}
            </h3>
            <ul className="mt-4 space-y-3">
              {t.tools.map((tool) => (
                <li key={tool} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-physics" />
                  <span>{tool}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-background/65 p-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground">
              <ListChecks className="size-5 text-physics" aria-hidden="true" />
              {t.stepsTitle}
            </h3>
            <ol className="mt-4 space-y-4">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-physics/12 text-xs font-black text-physics">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <section className="relative mx-5 mb-5 overflow-hidden rounded-2xl border border-physics/30 bg-physics/10 p-5 sm:mx-8 sm:mb-8 sm:p-6">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground sm:text-xl">
              <Lightbulb className="size-5 text-physics" aria-hidden="true" />
              {t.conclusionTitle}
            </h3>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">{t.conclusion}</p>
          </div>
          <div className="rounded-xl border border-physics/25 bg-background/70 px-5 py-4 text-center">
            <p className="text-xs font-bold text-muted-foreground">{t.formulaLabel}</p>
            <p className="mt-1 font-mono text-xl font-black text-physics" dir="ltr">ε = −N ΔΦ<sub>B</sub> / Δt</p>
          </div>
        </div>
      </section>
    </section>
  );
};

export default InducedEmfFactorsActivity;
