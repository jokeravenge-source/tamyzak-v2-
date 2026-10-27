import { useId, useMemo, useState } from "react";
import {
  Aperture,
  CheckCircle2,
  Eye,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  Sparkles,
  Waves,
  Wrench,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

const wavelengthToColor = (wavelength: number) => {
  if (wavelength < 440) return "#7c3aed";
  if (wavelength < 490) return "#2563eb";
  if (wavelength < 510) return "#06b6d4";
  if (wavelength < 570) return "#22c55e";
  if (wavelength < 590) return "#eab308";
  if (wavelength < 620) return "#f97316";
  return "#ef4444";
};

const copy = {
  ar: {
    chapter: "الفصل الخامس · البصريات الفيزيائية",
    title: "تجربة يونك للشقين",
    subtitle: "غيّر الطول الموجي للضوء الأحادي اللون وشاهد مباشرة كيف تتغير المسافة بين أهداب التداخل على الشاشة.",
    reset: "إعادة التجربة",
    experiment: "نمط التداخل التفاعلي",
    sourceOn: "المصدر يعمل",
    sourceOff: "المصدر متوقف",
    turnOn: "تشغيل المصدر",
    turnOff: "إطفاء المصدر",
    source: "مصدر أحادي اللون",
    doubleSlit: "شقّان ضيقان",
    screen: "شاشة الرصد",
    brightFringe: "هدب مضيء",
    darkFringe: "هدب معتم",
    centralFringe: "الهدب المركزي",
    controls: "التحكم بالطول الموجي",
    wavelength: "الطول الموجي λ",
    violet: "بنفسجي",
    green: "أخضر",
    red: "أحمر",
    shorter: "أقصر",
    longer: "أطول",
    fringeSpacing: "عرض الهدب β",
    slitSeparation: "المسافة بين الشقين d",
    screenDistance: "بعد الشاشة L",
    observation: "المشاهدة الحالية",
    pausedObservation: "شغّل المصدر حتى تصل موجتا الشقين إلى الشاشة ويظهر نمط التداخل.",
    shortObservation: "عند الطول الموجي القصير تتقارب الأهداب المضيئة والمعتمة على الشاشة.",
    mediumObservation: "تظهر أهداب مضيئة ومعتمة متعاقبة ومتماثلة حول الهدب المركزي المضيء.",
    longObservation: "بزيادة الطول الموجي يزداد عرض الهدب وتتباعد الأهداب على الشاشة.",
    tools: "أدوات النشاط",
    toolsList: ["مصدر ضوء أحادي اللون", "حاجز ذو شقين ضيقين متساويين", "شاشة رصد", "مسطرة لقياس عرض الهدب"],
    steps: "خطوات النشاط",
    stepsList: [
      "وجّه الضوء الأحادي اللون نحو الشقين الضيقين المتساويين.",
      "راقب تراكب الموجتين الخارجتين من الشقين على الشاشة.",
      "غيّر الطول الموجي وقارن المسافة بين الأهداب المضيئة المتتالية.",
    ],
    conclusion: "الاستنتاج",
    conclusionText: "ظهور مناطق مضيئة وأخرى معتمة متعاقبة يثبت تداخل موجات الضوء، ويدل على الطبيعة الموجية للضوء.",
    reason: "سبب ظهور الأهداب",
    reasonText: "تظهر الأهداب المضيئة عند التداخل البنّاء، وتظهر الأهداب المعتمة عند التداخل الهدّام.",
    benefit: "الفائدة العملية",
    benefitList: ["حساب الطول الموجي للضوء المستعمل.", "إثبات الطبيعة الموجية للضوء."],
    law: "قانون عرض الهدب",
    relation: "يزداد عرض الهدب بزيادة الطول الموجي أو بعد الشاشة، ويقل بزيادة المسافة بين الشقين.",
  },
  en: {
    chapter: "Chapter 5 · Physical Optics",
    title: "Young's Double-Slit Experiment",
    subtitle: "Change the wavelength of monochromatic light and immediately observe how the interference-fringe spacing changes on the screen.",
    reset: "Reset experiment",
    experiment: "Interactive interference pattern",
    sourceOn: "Source on",
    sourceOff: "Source off",
    turnOn: "Turn source on",
    turnOff: "Turn source off",
    source: "Monochromatic source",
    doubleSlit: "Two narrow slits",
    screen: "Observation screen",
    brightFringe: "Bright fringe",
    darkFringe: "Dark fringe",
    centralFringe: "Central fringe",
    controls: "Wavelength control",
    wavelength: "Wavelength λ",
    violet: "Violet",
    green: "Green",
    red: "Red",
    shorter: "Shorter",
    longer: "Longer",
    fringeSpacing: "Fringe width β",
    slitSeparation: "Slit separation d",
    screenDistance: "Screen distance L",
    observation: "Current observation",
    pausedObservation: "Turn on the source so waves from both slits reach the screen and form an interference pattern.",
    shortObservation: "At a shorter wavelength, the bright and dark fringes move closer together on the screen.",
    mediumObservation: "Alternating bright and dark fringes appear symmetrically around the central bright fringe.",
    longObservation: "Increasing wavelength increases fringe width, so the fringes move farther apart.",
    tools: "Activity tools",
    toolsList: ["Monochromatic light source", "Barrier with two equal narrow slits", "Observation screen", "Ruler for measuring fringe width"],
    steps: "Activity steps",
    stepsList: [
      "Direct monochromatic light toward the two equal narrow slits.",
      "Observe the superposition of the two emerging waves on the screen.",
      "Change the wavelength and compare the distance between successive bright fringes.",
    ],
    conclusion: "Conclusion",
    conclusionText: "Alternating bright and dark regions demonstrate interference of light waves and confirm the wave nature of light.",
    reason: "Why fringes appear",
    reasonText: "Bright fringes form by constructive interference, while dark fringes form by destructive interference.",
    benefit: "Practical benefit",
    benefitList: ["Calculate the wavelength of the light used.", "Demonstrate the wave nature of light."],
    law: "Fringe-width law",
    relation: "Fringe width increases with wavelength or screen distance and decreases as slit separation increases.",
  },
} as const;

const presets = [
  { key: "violet", wavelength: 420 },
  { key: "green", wavelength: 540 },
  { key: "red", wavelength: 650 },
] as const;

const YoungDoubleSlitActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const glowId = useId().replace(/:/g, "");
  const [wavelength, setWavelength] = useState(540);
  const [isOn, setIsOn] = useState(true);

  const slitSeparation = 0.3;
  const screenDistance = 1.5;
  const fringeSpacing = (wavelength * screenDistance) / slitSeparation / 1000;
  const visualSpacing = Math.max(18, Math.min(34, fringeSpacing * 8.5));
  const lightColor = wavelengthToColor(wavelength);

  const fringes = useMemo(
    () => Array.from({ length: 11 }, (_, index) => ({ order: index - 5, y: 170 + (index - 5) * visualSpacing })),
    [visualSpacing],
  );

  const observation = !isOn
    ? t.pausedObservation
    : wavelength < 480
      ? t.shortObservation
      : wavelength > 610
        ? t.longObservation
        : t.mediumObservation;

  const reset = () => {
    setWavelength(540);
    setIsOn(true);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_18%_0%,hsl(var(--physics)/.2),transparent_58%)]" />

      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-physics">
            <Sparkles className="size-4" aria-hidden="true" />
            {t.chapter}
          </p>
          <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-4xl">{t.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold transition hover:border-physics/50 hover:bg-physics/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {t.reset}
        </button>
      </header>

      <div className="relative grid gap-6 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,.65fr)]">
        <div className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-2xl sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                <Waves className="size-5 text-cyan-300" aria-hidden="true" />
                {t.experiment}
              </h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isOn ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-slate-500/40 bg-slate-500/10 text-slate-400"}`}>
                {isOn ? t.sourceOn : t.sourceOff}
              </span>
            </div>

            <svg viewBox="0 0 760 340" className="h-auto w-full" role="img" aria-label={t.experiment}>
              <defs>
                <filter id={`young-glow-${glowId}`} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              <g opacity={isOn ? 1 : 0.18}>
                <circle cx="62" cy="170" r="28" fill={lightColor} opacity=".3" filter={`url(#young-glow-${glowId})`} />
                <Lightbulb x="39" y="147" width="46" height="46" color={isOn ? lightColor : "#64748b"} />
                {[0, 1, 2].map((index) => (
                  <path key={index} d={`M94 ${156 + index * 14} Q150 ${142 + index * 14} 225 ${156 + index * 7}`} fill="none" stroke={lightColor} strokeWidth="3" strokeDasharray="10 8" />
                ))}
              </g>

              <g stroke="#cbd5e1" strokeWidth="9" strokeLinecap="round">
                <path d="M245 45V123" />
                <path d="M245 139V201" />
                <path d="M245 217V295" />
              </g>
              <circle cx="245" cy="131" r="6" fill={isOn ? lightColor : "#64748b"} />
              <circle cx="245" cy="209" r="6" fill={isOn ? lightColor : "#64748b"} />

              <g opacity={isOn ? 0.48 : 0.05} stroke={lightColor} strokeWidth="1.4">
                {fringes.map((fringe) => (
                  <g key={fringe.order}>
                    <path d={`M251 131 Q430 118 648 ${fringe.y}`} fill="none" />
                    <path d={`M251 209 Q430 222 648 ${fringe.y}`} fill="none" />
                  </g>
                ))}
              </g>

              <rect x="648" y="36" width="74" height="268" rx="14" fill="#020617" stroke="#94a3b8" strokeWidth="3" />
              <g data-testid="young-interference-screen" data-wavelength={wavelength} data-fringe-spacing={fringeSpacing.toFixed(2)} data-powered={isOn ? "on" : "off"} opacity={isOn ? 1 : 0.08}>
                {fringes.map((fringe) => {
                  const distance = Math.abs(fringe.order);
                  return (
                    <rect
                      key={fringe.order}
                      x="655"
                      y={fringe.y - (fringe.order === 0 ? 5 : 3)}
                      width="60"
                      height={fringe.order === 0 ? 10 : 6}
                      rx="4"
                      fill={lightColor}
                      opacity={fringe.order === 0 ? 1 : Math.max(0.2, 0.82 - distance * 0.11)}
                      filter={`url(#young-glow-${glowId})`}
                    />
                  );
                })}
              </g>

              <text x="62" y="326" textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="700">{t.source}</text>
              <text x="245" y="326" textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="700">{t.doubleSlit}</text>
              <text x="684" y="326" textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="700">{t.screen}</text>
            </svg>

            <button
              type="button"
              onClick={() => setIsOn((current) => !current)}
              className={`mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${isOn ? "border-amber-300/30 bg-amber-300/10 text-amber-200 hover:bg-amber-300/15" : "border-cyan-300/30 bg-cyan-300/10 text-cyan-200 hover:bg-cyan-300/15"}`}
            >
              {isOn ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
              {isOn ? t.turnOff : t.turnOn}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">{t.fringeSpacing}</p><p className="mt-2 font-mono text-xl font-black text-physics">{fringeSpacing.toFixed(2)} mm</p></div>
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">{t.slitSeparation}</p><p className="mt-2 font-mono text-xl font-black text-physics">{slitSeparation.toFixed(1)} mm</p></div>
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">{t.screenDistance}</p><p className="mt-2 font-mono text-xl font-black text-physics">{screenDistance.toFixed(1)} m</p></div>
          </div>

          <div className="rounded-2xl border border-physics/20 bg-physics/5 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.observation}</p>
            <p className="mt-3 text-sm font-semibold leading-7 text-foreground">{observation}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <section>
              <h3 className="flex items-center gap-2 text-lg font-black text-foreground"><CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />{t.conclusion}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-foreground">{t.conclusionText}</p>
              <h4 className="mt-5 text-sm font-black text-foreground">{t.reason}</h4>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">{t.reasonText}</p>
            </section>
            <section className="rounded-2xl border border-border bg-background/70 p-5">
              <h3 className="flex items-center gap-2 text-sm font-black text-foreground"><Ruler className="size-5 text-physics" aria-hidden="true" />{t.law}</h3>
              <p dir="ltr" className="mt-4 text-center font-mono text-2xl font-black text-physics">β = λL / d</p>
              <p className="mt-4 border-t border-border pt-3 text-xs font-semibold leading-5 text-muted-foreground">{t.relation}</p>
            </section>
          </div>
        </div>

        <aside className="space-y-6">
          <section>
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground"><Wrench className="size-5 text-physics" aria-hidden="true" />{t.controls}</h3>
            <label className="mt-4 block rounded-2xl border border-border bg-background p-4">
              <span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.wavelength}</span><strong className="font-mono" style={{ color: lightColor }}>{wavelength} nm</strong></span>
              <input aria-label={t.wavelength} type="range" min="380" max="700" step="5" value={wavelength} onChange={(event) => setWavelength(Number(event.target.value))} className="mt-4 w-full accent-[hsl(var(--physics))]" />
              <span className="mt-2 block h-2 rounded-full bg-[linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4,#22c55e,#eab308,#f97316,#ef4444)]" aria-hidden="true" />
              <span className="mt-2 flex justify-between text-[11px] font-bold text-muted-foreground"><span>{t.shorter}</span><span>{t.longer}</span></span>
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setWavelength(preset.wavelength)}
                  aria-pressed={wavelength === preset.wavelength}
                  className={`min-h-11 rounded-xl border px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${wavelength === preset.wavelength ? "border-physics bg-physics text-white" : "border-border bg-card text-muted-foreground hover:border-physics/40"}`}
                >
                  <span className="mx-auto mb-1 block size-2 rounded-full" style={{ backgroundColor: wavelengthToColor(preset.wavelength) }} />
                  {t[preset.key]}
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground"><Aperture className="size-5 text-physics" aria-hidden="true" />{t.tools}</h3>
            <ul className="mt-3 space-y-2">
              {t.toolsList.map((tool, index) => <li key={tool} className="flex items-start gap-3 text-sm font-semibold leading-6 text-foreground"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-physics/10 text-xs font-black text-physics">{index + 1}</span><span>{tool}</span></li>)}
            </ul>
          </section>

          <section className="border-t border-border pt-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground"><Eye className="size-5 text-physics" aria-hidden="true" />{t.steps}</h3>
            <ol className="mt-3 space-y-3">
              {t.stepsList.map((step, index) => <li key={step} className="flex items-start gap-3 text-sm font-semibold leading-6 text-foreground"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-black text-muted-foreground">{index + 1}</span><span>{step}</span></li>)}
            </ol>
          </section>

          <section className="border-t border-border pt-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground"><Lightbulb className="size-5 text-physics" aria-hidden="true" />{t.benefit}</h3>
            <ul className="mt-3 space-y-2">{t.benefitList.map((item) => <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-6 text-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" aria-hidden="true" /><span>{item}</span></li>)}</ul>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default YoungDoubleSlitActivity;
