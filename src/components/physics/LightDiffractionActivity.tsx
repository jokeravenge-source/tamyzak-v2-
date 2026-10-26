import { useMemo, useState } from "react";
import {
  Aperture,
  ArrowRight,
  CheckCircle2,
  Eye,
  Lightbulb,
  Palette,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

type ExperimentStep = 1 | 2 | 3;
type LightColor = "red" | "green" | "blue";

const lightSources: Record<LightColor, { wavelength: number; color: string; glow: string }> = {
  red: { wavelength: 650, color: "#ff453a", glow: "rgba(255,69,58,.72)" },
  green: { wavelength: 532, color: "#34d399", glow: "rgba(52,211,153,.68)" },
  blue: { wavelength: 450, color: "#60a5fa", glow: "rgba(96,165,250,.72)" },
};

const copy = {
  ar: {
    chapter: "الفصل الخامس · نشاط بصري",
    title: "حيود الضوء خلال شق ضيق",
    subtitle: "شغّل المصدر الأحادي اللون وغيّر لون الضوء وعرض الشق، ثم راقب كيف يتغيّر نمط الحيود على الشاشة.",
    reset: "إعادة النشاط",
    experiment: "التجربة التفاعلية",
    sourceOn: "المصدر يعمل",
    sourceOff: "المصدر متوقف",
    turnOn: "تشغيل المصدر",
    turnOff: "إيقاف المصدر",
    source: "مصدر أحادي اللون",
    plate: "لوح زجاجي مطلي بالأسود",
    slit: "الشق الضيق",
    screen: "نمط الحيود الناتج",
    centralFringe: "الهدب المركزي المضيء",
    controls: "التحكم بالتجربة",
    color: "لون الضوء الأحادي",
    red: "أحمر",
    green: "أخضر",
    blue: "أزرق",
    wavelength: "الطول الموجي",
    slitWidth: "عرض الشق",
    narrow: "شق أضيق",
    wide: "شق أوسع",
    tools: "أدوات النشاط",
    glassTool: "لوح زجاجي مطلي بدهان أسود",
    pinTool: "دبوس لعمل شق ضيق",
    lightTool: "مصدر ضوئي أحادي اللون",
    steps: "خطوات النشاط",
    step1Title: "طلي اللوح",
    step1Text: "اطلِ اللوح الزجاجي بالدهان الأسود.",
    step2Title: "عمل الشق",
    step2Text: "اعمل شقاً ضيقاً في لوح الزجاج باستعمال رأس الدبوس.",
    step3Title: "مشاهدة الحيود",
    step3Text: "انظر من خلال الشق إلى المصدر الضوئي الأحادي اللون وشاهد نمط الحيود.",
    nextStep: "الخطوة التالية",
    repeat: "إعادة الخطوات",
    observation: "الملاحظة",
    pausedObservation: "شغّل المصدر الضوئي حتى يظهر نمط الحيود على الشاشة.",
    narrowObservation: "يظهر هدب مركزي مضيء عريض وشديد الإضاءة، وتحفّه أهداب مضيئة ومعتمة متعاقبة تقل شدتها تدريجياً بالابتعاد عنه.",
    mediumObservation: "يظهر الهدب المركزي بوضوح، وتتناوب على جانبيه مناطق مضيئة وأخرى معتمة يقل عرضها وشدتها تدريجياً.",
    wideObservation: "عندما يتسع الشق يضيق الهدب المركزي وتتقارب الأهداب، فيصبح الحيود أقل وضوحاً.",
    currentResult: "النتيجة الحالية",
    centralWidth: "العرض النسبي للهدب المركزي",
    strongerDiffraction: "حيود أوضح",
    weakerDiffraction: "حيود أقل",
    conclusion: "الاستنتاج",
    conclusionText: "تحيد موجات الضوء عند مرورها من شق ضيق، وظهور مناطق مضيئة وأخرى مظلمة على جانبي الهدب المركزي يدل على أن الضوء يحيد عن مساره.",
    relationText: "يزداد الحيود كلما صغر عرض الشق أو ازداد الطول الموجي للضوء.",
    equations: "شروط الأهداب",
    darkFringe: "الهدب المعتم",
    brightFringe: "الهدب المضيء تقريباً",
    equationNote: "حيث a عرض الشق، و λ الطول الموجي، و m = ±1، ±2، ±3، …",
  },
  en: {
    chapter: "Chapter 5 · Optics activity",
    title: "Diffraction of Light Through a Narrow Slit",
    subtitle: "Turn on the monochromatic source, change its color and the slit width, then observe how the diffraction pattern changes on the screen.",
    reset: "Reset activity",
    experiment: "Interactive experiment",
    sourceOn: "Source on",
    sourceOff: "Source off",
    turnOn: "Turn source on",
    turnOff: "Turn source off",
    source: "Monochromatic source",
    plate: "Black-coated glass plate",
    slit: "Narrow slit",
    screen: "Resulting diffraction pattern",
    centralFringe: "Central bright fringe",
    controls: "Experiment controls",
    color: "Monochromatic light color",
    red: "Red",
    green: "Green",
    blue: "Blue",
    wavelength: "Wavelength",
    slitWidth: "Slit width",
    narrow: "Narrower slit",
    wide: "Wider slit",
    tools: "Activity tools",
    glassTool: "A glass plate coated with black paint",
    pinTool: "A pin for making a narrow slit",
    lightTool: "A monochromatic light source",
    steps: "Activity steps",
    step1Title: "Coat the plate",
    step1Text: "Coat the glass plate with black paint.",
    step2Title: "Make the slit",
    step2Text: "Use the head of the pin to make a narrow slit in the coated glass plate.",
    step3Title: "Observe diffraction",
    step3Text: "Look through the slit toward the monochromatic light source and observe the diffraction pattern.",
    nextStep: "Next step",
    repeat: "Repeat steps",
    observation: "Observation",
    pausedObservation: "Turn on the light source to reveal the diffraction pattern on the screen.",
    narrowObservation: "A wide, intense central bright fringe appears, bordered by alternating bright and dark fringes whose intensity gradually decreases away from the center.",
    mediumObservation: "The central bright fringe is clear, with alternating bright and dark regions on both sides that gradually become narrower and dimmer.",
    wideObservation: "As the slit becomes wider, the central fringe narrows and the fringes move closer together, making diffraction less apparent.",
    currentResult: "Current result",
    centralWidth: "Relative central-fringe width",
    strongerDiffraction: "Clearer diffraction",
    weakerDiffraction: "Less diffraction",
    conclusion: "Conclusion",
    conclusionText: "Light waves diffract when they pass through a narrow slit. Bright and dark regions on both sides of the central fringe show that light bends from its straight path.",
    relationText: "Diffraction increases when the slit becomes narrower or the wavelength of light becomes longer.",
    equations: "Fringe conditions",
    darkFringe: "Dark fringe",
    brightFringe: "Approximate bright fringe",
    equationNote: "where a is the slit width, λ is the wavelength, and m = ±1, ±2, ±3, …",
  },
} as const;

const colorOptions: LightColor[] = ["red", "green", "blue"];

const LightDiffractionActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const [isOn, setIsOn] = useState(true);
  const [lightColor, setLightColor] = useState<LightColor>("red");
  const [slitWidth, setSlitWidth] = useState(0.18);
  const [step, setStep] = useState<ExperimentStep>(3);

  const source = lightSources[lightColor];
  const centralWidth = useMemo(
    () => Math.max(9, Math.min(38, (source.wavelength / 550) * (0.24 / slitWidth) * 18)),
    [slitWidth, source.wavelength],
  );
  const diffractionStrength = Math.round(((centralWidth - 9) / 29) * 100);
  const bands = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => {
        const order = index - 4;
        const distance = Math.abs(order);
        return {
          order,
          left: 50 + order * centralWidth * 0.9,
          width: order === 0 ? centralWidth : Math.max(2.2, centralWidth * 0.42),
          opacity: order === 0 ? 1 : Math.max(0.12, 0.62 / (distance + 0.25)),
        };
      }).filter((band) => band.left > -8 && band.left < 108),
    [centralWidth],
  );

  const observation = !isOn
    ? t.pausedObservation
    : slitWidth <= 0.2
      ? t.narrowObservation
      : slitWidth >= 0.48
        ? t.wideObservation
        : t.mediumObservation;

  const applyStep = (nextStep: ExperimentStep) => {
    setStep(nextStep);
    if (nextStep === 1) {
      setIsOn(false);
      setSlitWidth(0.55);
    } else if (nextStep === 2) {
      setIsOn(false);
      setSlitWidth(0.18);
    } else {
      setIsOn(true);
      setSlitWidth(0.18);
    }
  };

  const reset = () => {
    setIsOn(true);
    setLightColor("red");
    setSlitWidth(0.18);
    setStep(3);
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
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                <Eye className="size-5 text-cyan-300" aria-hidden="true" />
                {t.experiment}
              </h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isOn ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-slate-500/40 bg-slate-500/10 text-slate-400"}`}>
                {isOn ? t.sourceOn : t.sourceOff}
              </span>
            </div>

            <div className="relative min-h-[330px] overflow-hidden rounded-2xl border border-white/10 bg-[#030712] px-3 py-5 sm:min-h-[390px] sm:px-6">
              <div className="grid min-h-[285px] grid-cols-[74px_54px_minmax(0,1fr)] items-center gap-3 sm:min-h-[340px] sm:grid-cols-[110px_72px_minmax(0,1fr)] sm:gap-6">
                <div className="flex min-w-0 flex-col items-center gap-3 text-center">
                  <div
                    className="grid size-14 place-items-center rounded-2xl border transition duration-500 sm:size-20"
                    style={{
                      borderColor: isOn ? source.color : "#475569",
                      backgroundColor: isOn ? `${source.color}18` : "#0f172a",
                      boxShadow: isOn ? `0 0 38px ${source.glow}` : "none",
                    }}
                  >
                    <Lightbulb className="size-7 sm:size-10" color={isOn ? source.color : "#64748b"} aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-bold leading-4 text-slate-300 sm:text-xs">{t.source}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSlitWidth((current) => (current < 0.3 ? 0.55 : 0.18))}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp" || event.key === "ArrowRight") setSlitWidth((current) => Math.min(0.6, Number((current + 0.02).toFixed(2))));
                    if (event.key === "ArrowDown" || event.key === "ArrowLeft") setSlitWidth((current) => Math.max(0.1, Number((current - 0.02).toFixed(2))));
                  }}
                  aria-label={t.slitWidth}
                  className="group relative mx-auto h-56 w-12 rounded-lg border border-slate-500 bg-slate-900 shadow-[0_0_35px_rgba(15,23,42,.9)] transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:h-64 sm:w-16"
                >
                  <span
                    className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
                    style={{
                      width: Math.max(2, slitWidth * 15),
                      height: "68%",
                      backgroundColor: isOn ? source.color : "#64748b",
                      boxShadow: isOn ? `0 0 14px ${source.glow}` : "none",
                    }}
                  />
                  <span className="pointer-events-none absolute -bottom-8 left-1/2 w-28 -translate-x-1/2 text-[10px] font-bold text-slate-300 sm:text-xs">{t.slit}</span>
                </button>

                <div className="relative min-w-0">
                  <div
                    className="pointer-events-none absolute inset-y-[22%] left-[-18px] right-[calc(100%-8px)] origin-left transition-all duration-500"
                    style={{
                      opacity: isOn ? 0.72 : 0,
                      background: `linear-gradient(90deg, ${source.color}, transparent)`,
                      clipPath: `polygon(0 48%, 100% ${Math.max(0, 50 - centralWidth)}%, 100% ${Math.min(100, 50 + centralWidth)}%, 0 52%)`,
                    }}
                  />
                  <div
                    data-testid="diffraction-screen"
                    data-wavelength={source.wavelength}
                    data-central-width={centralWidth.toFixed(1)}
                    data-powered={isOn ? "on" : "off"}
                    className="relative h-56 overflow-hidden rounded-2xl border border-slate-500/60 bg-black shadow-[inset_0_0_34px_rgba(0,0,0,.9)] sm:h-64"
                    aria-label={t.screen}
                    aria-live="polite"
                  >
                    {isOn && bands.map((band) => (
                      <span
                        key={band.order}
                        className="absolute inset-y-[7%] -translate-x-1/2 rounded-[50%] transition-all duration-500"
                        style={{
                          left: `${band.left}%`,
                          width: `${band.width}%`,
                          opacity: band.opacity,
                          background: `radial-gradient(ellipse at center, ${source.color} 0%, ${source.color} 26%, transparent 72%)`,
                          boxShadow: `0 0 ${band.order === 0 ? 30 : 16}px ${source.glow}`,
                        }}
                      />
                    ))}
                    <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(0,0,0,.38)_92%)]" />
                    {!isOn && <span className="absolute inset-0 grid place-items-center text-xs font-black uppercase tracking-[0.14em] text-slate-600">{t.sourceOff}</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-center text-[10px] font-bold text-slate-300 sm:text-xs">
                    <span>{t.screen}</span>
                    {isOn && <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{t.centralFringe}</span>}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOn((current) => !current)}
              className={`mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${isOn ? "border-amber-300/30 bg-amber-300/10 text-amber-200 hover:bg-amber-300/15" : "border-cyan-300/30 bg-cyan-300/10 text-cyan-200 hover:bg-cyan-300/15"}`}
            >
              {isOn ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
              {isOn ? t.turnOff : t.turnOn}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs font-bold text-muted-foreground">{t.wavelength}</p>
              <p className="mt-2 font-mono text-xl font-black text-physics">{source.wavelength} nm</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs font-bold text-muted-foreground">{t.slitWidth}</p>
              <p className="mt-2 font-mono text-xl font-black text-physics">{slitWidth.toFixed(2)} mm</p>
            </div>
            <div className="rounded-2xl border border-physics/25 bg-physics/5 p-4">
              <p className="text-xs font-bold text-muted-foreground">{t.centralWidth}</p>
              <p className="mt-2 font-mono text-xl font-black text-physics">{centralWidth.toFixed(1)}%</p>
            </div>
          </div>

          <div className="rounded-2xl border border-physics/20 bg-physics/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.observation}</p>
              <span className="rounded-full border border-physics/20 bg-background px-3 py-1 text-xs font-black text-physics">
                {diffractionStrength >= 55 ? t.strongerDiffraction : t.weakerDiffraction}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-7 text-foreground">{observation}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">{t.conclusion}</p>
                  <p className="mt-2 text-sm font-semibold leading-7 text-foreground">{t.conclusionText}</p>
                  <p className="mt-3 border-t border-border pt-3 text-sm leading-7 text-muted-foreground">{t.relationText}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
                <ScanLine className="size-5 text-physics" aria-hidden="true" />
                {t.equations}
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-muted-foreground">{t.darkFringe}</dt><dd dir="ltr" className="font-mono font-black text-foreground">a sin θ = mλ</dd></div>
                <div className="flex flex-wrap items-center justify-between gap-2"><dt className="text-muted-foreground">{t.brightFringe}</dt><dd dir="ltr" className="font-mono font-black text-foreground">a sin θ ≈ (m + ½)λ</dd></div>
              </dl>
              <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">{t.equationNote}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="flex items-center gap-2 text-base font-black text-foreground">
              <Wrench className="size-5 text-physics" aria-hidden="true" />
              {t.tools}
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"><Aperture className="size-5 shrink-0 text-slate-500" aria-hidden="true" /><span className="text-sm font-bold text-foreground">{t.glassTool}</span></li>
              <li className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"><ScanLine className="size-5 shrink-0 text-amber-500" aria-hidden="true" /><span className="text-sm font-bold text-foreground">{t.pinTool}</span></li>
              <li className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"><Lightbulb className="size-5 shrink-0 text-rose-500" aria-hidden="true" /><span className="text-sm font-bold text-foreground">{t.lightTool}</span></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="text-base font-black text-foreground">{t.steps}</h3>
            <ol className="mt-4 space-y-3">
              {([1, 2, 3] as ExperimentStep[]).map((item) => (
                <li key={item} className={`flex gap-3 rounded-xl border p-3 transition ${step === item ? "border-physics/40 bg-physics/5" : "border-border bg-card"}`}>
                  <button
                    type="button"
                    onClick={() => applyStep(item)}
                    aria-label={`${t.steps} ${item}`}
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${step === item ? "bg-physics text-white" : "bg-secondary text-muted-foreground"}`}
                  >
                    {item}
                  </button>
                  <div><p className="text-sm font-black text-foreground">{t[`step${item}Title`]}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{t[`step${item}Text`]}</p></div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => applyStep(step === 3 ? 1 : (step + 1) as ExperimentStep)}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-extrabold text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics"
            >
              {step === 3 ? t.repeat : t.nextStep}
              <ArrowRight className={`size-4 ${isRTL ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="flex items-center gap-2 text-base font-black text-foreground">
              <Palette className="size-5 text-physics" aria-hidden="true" />
              {t.controls}
            </h3>
            <fieldset className="mt-4">
              <legend className="text-sm font-bold text-foreground">{t.color}</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLightColor(option)}
                    aria-pressed={lightColor === option}
                    className={`min-h-11 rounded-xl border px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${lightColor === option ? "border-physics bg-physics text-white" : "border-border bg-card text-muted-foreground hover:border-physics/40"}`}
                  >
                    <span className="mx-auto mb-1 block size-2 rounded-full" style={{ backgroundColor: lightSources[option].color }} />
                    {t[option]}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="mt-5 block">
              <span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.slitWidth}</span><strong className="font-mono text-physics">{slitWidth.toFixed(2)} mm</strong></span>
              <input aria-label={t.slitWidth} type="range" min="0.1" max="0.6" step="0.01" value={slitWidth} onChange={(event) => setSlitWidth(Number(event.target.value))} className="mt-3 w-full accent-[hsl(var(--physics))]" />
              <span className="mt-1 flex justify-between text-[11px] font-bold text-muted-foreground"><span>{t.narrow}</span><span>{t.wide}</span></span>
            </label>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default LightDiffractionActivity;
