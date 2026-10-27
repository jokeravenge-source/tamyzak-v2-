import { useEffect, useId, useRef, useState } from "react";
import {
  CircleGauge,
  Lightbulb,
  ListChecks,
  Power,
  RotateCcw,
  Wrench,
  Zap,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

type NeedleDirection = "left" | "center" | "right";

const copy = {
  ar: {
    chapter: "الفصل الثاني · الحث الكهرومغناطيسي",
    title: "تجربة فاراداي في الحث الكهرومغناطيسي",
    subtitle:
      "تحكّم بمفتاح الدائرة الابتدائية، وراقب مؤشر الغلفانومتر في الدائرة الثانوية لحظة غلق المفتاح وفتحه.",
    reset: "إعادة التجربة",
    simulator: "دائرة فاراداي التفاعلية",
    primary: "دائرة الملف الابتدائي",
    secondary: "دائرة الملف الثانوي",
    battery: "بطارية",
    switch: "المفتاح",
    softIron: "حلقة مقفلة من الحديد المطاوع",
    galvanometer: "غلفانومتر حساس",
    open: "المفتاح مفتوح",
    closed: "المفتاح مغلق",
    openAction: "افتح المفتاح",
    closeAction: "أغلق المفتاح",
    idle: "لا يوجد انحراف",
    closingPulse: "انحراف لحظة الغلق",
    openingPulse: "انحراف معاكس لحظة الفتح",
    currentFlow: "تيار في الدائرة الابتدائية",
    noCurrent: "لا ينساب تيار في الدائرة الابتدائية",
    inducedCurrent: "تيار محث لحظي في الدائرة الثانوية",
    stableFlux: "ثبوت الفيض المغناطيسي — يعود المؤشر إلى الصفر",
    prompt: "اضغط على المفتاح وشاهد ما يحدث لحظة تغيّر التيار.",
    toolsTitle: "أدوات النشاط",
    tools: [
      "حلقة مقفلة من الحديد المطاوع",
      "ملف ابتدائي متصل ببطارية ومفتاح",
      "ملف ثانوي متصل بغلفانومتر حساس",
      "أسلاك توصيل",
    ],
    stepsTitle: "خطوات النشاط",
    steps: [
      "لف ملفين من سلكين معزولين حول حلقة مغلقة من الحديد المطاوع، ثم اربط الملف الابتدائي على التوالي مع البطارية والمفتاح واربط الملف الثانوي بالغلفانومتر الحساس.",
      "أغلق المفتاح؛ ينحرف مؤشر الغلفانومتر إلى أحد جانبي الصفر ثم يعود إلى تدريجة الصفر بعد لحظة.",
      "افتح المفتاح؛ ينحرف المؤشر إلى الجانب الآخر ثم يعود إلى الصفر.",
    ],
    observationsTitle: "التفسير",
    closeHeading: "عند غلق المفتاح",
    closeText:
      "انحراف مؤشر المقياس لحظة غلق المفتاح دليل قاطع على انسياب تيار كهربائي في دائرة الملف الثانوي يسمى التيار المحث، على الرغم من عدم وجود بطارية أو مصدر للفولطية في هذه الدائرة.",
    steadyHeading: "بعد استقرار التيار",
    steadyText:
      "يعود مؤشر المقياس إلى الصفر بسبب ثبوت التيار المنساب في دائرة الملف الابتدائي؛ وعندها لا يحصل تغير في الفيض المغناطيسي الذي يخترق الملف الثانوي بوحدة الزمن.",
    openHeading: "عند فتح المفتاح",
    openText:
      "ينحرف مؤشر الغلفانومتر لحظة فتح المفتاح إلى الجانب الآخر من الصفر، ثم يعود إلى تدريجة الصفر.",
    transientHeading: "متى ينساب التيار المحث؟",
    transientText:
      "أثبت فاراداي أن انسياب التيار في دائرة الملف الثانوي يحصل فقط خلال مرحلتي نمو التيار وتلاشيه في دائرة الملف الابتدائي.",
    conclusionTitle: "استنتاج فاراداي",
    conclusion:
      "يتولد تيار محث في دائرة كهربائية مغلقة، مثل ملف سلكي أو حلقة موصلة، عندما يحصل تغير في الفيض المغناطيسي الذي يخترق تلك الدائرة بوحدة الزمن.",
    formulaLabel: "معدل تغير الفيض المغناطيسي",
  },
  en: {
    chapter: "Chapter 2 · Electromagnetic Induction",
    title: "Faraday's Electromagnetic Induction Experiment",
    subtitle:
      "Control the primary-circuit switch and observe the galvanometer in the secondary circuit at the instant the switch is closed and opened.",
    reset: "Reset experiment",
    simulator: "Interactive Faraday circuit",
    primary: "Primary-coil circuit",
    secondary: "Secondary-coil circuit",
    battery: "Battery",
    switch: "Switch",
    softIron: "Closed wrought-iron ring",
    galvanometer: "Sensitive galvanometer",
    open: "Switch open",
    closed: "Switch closed",
    openAction: "Open the switch",
    closeAction: "Close the switch",
    idle: "No deflection",
    closingPulse: "Deflection at closing",
    openingPulse: "Opposite deflection at opening",
    currentFlow: "Current flows in the primary circuit",
    noCurrent: "No current flows in the primary circuit",
    inducedCurrent: "Momentary induced current in the secondary circuit",
    stableFlux: "Magnetic flux is constant — the pointer returns to zero",
    prompt: "Operate the switch and watch what happens when the current changes.",
    toolsTitle: "Activity tools",
    tools: [
      "Closed wrought-iron ring",
      "Primary coil connected to a battery and switch",
      "Secondary coil connected to a sensitive galvanometer",
      "Connecting wires",
    ],
    stepsTitle: "Activity steps",
    steps: [
      "Connect the primary coil in series with the battery and switch, and connect the secondary coil to the sensitive galvanometer.",
      "Close the switch; the galvanometer pointer deflects to one side of zero, then returns to zero after a moment.",
      "Open the switch; the pointer deflects to the opposite side, then returns to zero.",
    ],
    observationsTitle: "Explanation",
    closeHeading: "When the switch is closed",
    closeText:
      "The pointer's deflection at the instant the switch is closed proves that an electric current flows in the secondary-coil circuit. It is called the induced current, although this circuit contains no battery or voltage source.",
    steadyHeading: "After the current becomes steady",
    steadyText:
      "The pointer returns to zero because the current in the primary-coil circuit becomes constant. The magnetic flux through the secondary coil therefore no longer changes with time.",
    openHeading: "When the switch is opened",
    openText:
      "At the instant the switch is opened, the galvanometer pointer deflects in the opposite direction and then returns to zero.",
    transientHeading: "When does induced current flow?",
    transientText:
      "Faraday established that current flows in the secondary-coil circuit only during the growth and decay stages of the current in the primary-coil circuit.",
    conclusionTitle: "Faraday's conclusion",
    conclusion:
      "An induced current is generated in a closed electric circuit, such as a wire coil or conducting loop, when the magnetic flux through that circuit changes with time.",
    formulaLabel: "Rate of change of magnetic flux",
  },
} as const;

const FaradayInductionActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const filterId = `faraday-glow-${useId().replace(/:/g, "")}`;
  const [isClosed, setIsClosed] = useState(false);
  const [needle, setNeedle] = useState<NeedleDirection>("center");
  const [lastEvent, setLastEvent] = useState<"idle" | "closing" | "opening">("idle");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const settleNeedle = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNeedle("center"), 1100);
  };

  const closeSwitch = () => {
    if (isClosed) return;
    setIsClosed(true);
    setNeedle("right");
    setLastEvent("closing");
    settleNeedle();
  };

  const openSwitch = () => {
    if (!isClosed) return;
    setIsClosed(false);
    setNeedle("left");
    setLastEvent("opening");
    settleNeedle();
  };

  const reset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setIsClosed(false);
    setNeedle("center");
    setLastEvent("idle");
  };

  const needleAngle = needle === "left" ? -42 : needle === "right" ? 42 : 0;
  const pulseActive = needle !== "center";
  const statusText = pulseActive
    ? needle === "right"
      ? t.closingPulse
      : t.openingPulse
    : isClosed
      ? t.stableFlux
      : t.idle;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}
    >
      <style>{`
        @keyframes faraday-current-flow { to { stroke-dashoffset: -44; } }
        @keyframes faraday-flux-pulse { 0% { opacity: .15; } 45% { opacity: 1; } 100% { opacity: .18; } }
        .faraday-current-flow { animation: faraday-current-flow .7s linear infinite; }
        .faraday-flux-pulse { animation: faraday-flux-pulse 1.05s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .faraday-current-flow, .faraday-flux-pulse { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_18%_0%,hsl(var(--physics)/.2),transparent_58%)]" />

      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-physics">
            <Zap className="size-4" aria-hidden="true" />
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

      <div className="relative grid gap-6 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(290px,.72fr)]">
        <div className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-2xl sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                  <CircleGauge className="size-5 text-cyan-400" aria-hidden="true" />
                  {t.simulator}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">{t.prompt}</p>
              </div>
              <span
                className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black ${isClosed ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300" : "border-amber-400/35 bg-amber-400/10 text-amber-300"}`}
              >
                {isClosed ? t.closed : t.open}
              </span>
            </div>

            <svg viewBox="0 0 860 470" className="h-auto w-full" role="img" aria-label={t.simulator}>
              <defs>
                <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id={`${filterId}-iron`} x1="0" x2="1">
                  <stop offset="0" stopColor="#64748b" />
                  <stop offset=".45" stopColor="#dbeafe" />
                  <stop offset="1" stopColor="#475569" />
                </linearGradient>
                <marker id={`${filterId}-arrow`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0 0l8 4-8 4z" fill="#a78bfa" />
                </marker>
              </defs>

              <g fill="none" stroke="#94a3b8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
                <path d="M82 205V82H318" />
                <path d="M372 82H465V145" />
                <path d="M465 325V404H82V265" />
                <path d="M590 145V80H760V160" />
                <path d="M760 290V405H590V325" />
              </g>

              <g aria-label={t.battery}>
                <line x1="54" y1="205" x2="110" y2="205" stroke="#f8fafc" strokeWidth="8" />
                <line x1="65" y1="235" x2="99" y2="235" stroke="#f8fafc" strokeWidth="5" />
                <path d="M82 205V174M82 235V265" stroke="#94a3b8" strokeWidth="5" />
                <text x="124" y="227" fill="#38bdf8" fontSize="18" fontWeight="800">{t.battery}</text>
              </g>

              <g aria-label={t.switch}>
                <circle cx="328" cy="82" r="10" fill="#0f172a" stroke="#e2e8f0" strokeWidth="5" />
                <circle cx="362" cy="82" r="10" fill="#0f172a" stroke="#e2e8f0" strokeWidth="5" />
                <line
                  x1="328"
                  y1="82"
                  x2={isClosed ? 362 : 356}
                  y2={isClosed ? 82 : 45}
                  stroke={isClosed ? "#34d399" : "#fbbf24"}
                  strokeWidth="9"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </g>

              <circle cx="528" cy="235" r="118" fill="none" stroke={`url(#${filterId}-iron)`} strokeWidth="58" />
              <circle cx="528" cy="235" r="77" fill="#020617" stroke="#334155" strokeWidth="2" />

              <g aria-label={t.primary}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <path
                    key={`primary-${index}`}
                    d={`M${453 + index * 7} 138c-34 18-34 176 0 194`}
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                ))}
              </g>

              <g aria-label={t.secondary}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <path
                    key={`secondary-${index}`}
                    d={`M${603 - index * 7} 138c34 18 34 176 0 194`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                ))}
              </g>

              {(isClosed || pulseActive) && (
                <g className={pulseActive ? "faraday-flux-pulse" : ""} opacity={pulseActive ? 1 : .4}>
                  <path d="M490 188c31-27 70-23 91 4" fill="none" stroke="#a78bfa" strokeWidth="7" strokeLinecap="round" markerEnd={`url(#${filterId}-arrow)`} />
                  <path d="M578 278c-30 25-69 21-90-5" fill="none" stroke="#a78bfa" strokeWidth="7" strokeLinecap="round" />
                  <circle cx="528" cy="235" r="52" fill="none" stroke="#8b5cf6" strokeWidth="3" opacity=".45" filter={`url(#${filterId})`} />
                </g>
              )}

              {isClosed && (
                <path
                  d="M82 188V82H318M372 82H465V145M465 325V404H82V278"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="8"
                  strokeDasharray="16 12"
                  strokeLinecap="round"
                  className="faraday-current-flow"
                />
              )}

              {pulseActive && (
                <path
                  d="M590 145V80H760V160M760 290V405H590V325"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="8"
                  strokeDasharray="16 12"
                  strokeLinecap="round"
                  className="faraday-current-flow"
                />
              )}

              <g aria-label={t.galvanometer}>
                <circle cx="760" cy="225" r="65" fill="#0f172a" stroke="#64748b" strokeWidth="6" />
                <path d="M718 242a45 45 0 0 1 84 0" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                <g
                  data-testid="faraday-needle"
                  data-direction={needle}
                  style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: "760px 245px", transition: "transform 260ms cubic-bezier(.2,.8,.2,1)" }}
                >
                  <line x1="760" y1="245" x2="760" y2="190" stroke={pulseActive ? "#f87171" : "#e2e8f0"} strokeWidth="6" strokeLinecap="round" />
                </g>
                <circle cx="760" cy="245" r="8" fill="#f8fafc" />
                <text x="760" y="270" fill="#94a3b8" textAnchor="middle" fontSize="17" fontWeight="800">G</text>
                <text x="716" y="232" fill="#64748b" fontSize="13">−</text>
                <text x="798" y="232" fill="#64748b" fontSize="13">+</text>
              </g>

              <text x="404" y="111" fill="#fb923c" textAnchor="middle" fontSize="16" fontWeight="800">{t.primary}</text>
              <text x="655" y="111" fill="#38bdf8" textAnchor="middle" fontSize="16" fontWeight="800">{t.secondary}</text>
              <text x="528" y="454" fill="#94a3b8" textAnchor="middle" fontSize="16">{t.softIron}</text>
            </svg>

            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[.04] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`size-3 shrink-0 rounded-full ${pulseActive ? "bg-cyan-300 shadow-[0_0_16px_#67e8f9]" : isClosed ? "bg-emerald-400" : "bg-slate-600"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white" aria-live="polite">{statusText}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{pulseActive ? t.inducedCurrent : isClosed ? t.currentFlow : t.noCurrent}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={closeSwitch}
                  disabled={isClosed}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-4 text-xs font-black text-emerald-200 transition hover:bg-emerald-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Power className="size-4" aria-hidden="true" />
                  {t.closeAction}
                </button>
                <button
                  type="button"
                  onClick={openSwitch}
                  disabled={!isClosed}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-amber-400/10 px-4 text-xs font-black text-amber-200 transition hover:bg-amber-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Zap className="size-4" aria-hidden="true" />
                  {t.openAction}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [t.closeHeading, t.closeText, lastEvent === "closing"],
              [t.steadyHeading, t.steadyText, isClosed && needle === "center"],
              [t.openHeading, t.openText, lastEvent === "opening"],
              [t.transientHeading, t.transientText, lastEvent !== "idle"],
            ].map(([heading, text, active]) => (
              <article key={String(heading)} className={`rounded-2xl border p-4 transition ${active ? "border-physics/55 bg-physics/10" : "border-border bg-background/55"}`}>
                <h4 className="text-sm font-black text-foreground">{String(heading)}</h4>
                <p className="mt-2 text-xs leading-6 text-muted-foreground sm:text-sm">{String(text)}</p>
              </article>
            ))}
          </div>
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
              {t.steps.map((step, index) => (
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
            <p className="mt-1 font-mono text-xl font-black text-physics" dir="ltr">ΔΦ<sub>B</sub> / Δt</p>
          </div>
        </div>
      </section>
    </section>
  );
};

export default FaradayInductionActivity;
