import { useId, useMemo, useState } from "react";
import {
  Aperture,
  CheckCircle2,
  Eye,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

type Stage = "single" | "double";

const copy = {
  ar: {
    chapter: "الفصل الخامس · نشاط الاستقطاب",
    title: "استقطاب الموجات الضوئية",
    subtitle: "مرّر الضوء خلال شريحة ذات محور نفاذ، ثم أضف شريحة ثانية ودوّرها لتشاهد كيف يُحدَّد اتجاه الاهتزاز وتتناقص شدة الضوء.",
    reset: "إعادة النشاط",
    experiment: "التجربة التفاعلية",
    source: "ضوء غير مستقطب",
    first: "الشريحة المستقطِبة",
    second: "الشريحة المُحلِّلة",
    eye: "العين",
    axis: "محور النفاذ",
    stage: "مرحلة التجربة",
    single: "شريحة واحدة",
    double: "شريحتان",
    firstAngle: "زاوية الشريحة الأولى",
    secondAngle: "زاوية الشريحة الثانية",
    difference: "الزاوية بين المحورين",
    output: "شدة الضوء الخارج",
    unpolarized: "اهتزازات في اتجاهات متعددة",
    polarized: "اهتزازات في اتجاه واحد",
    parallel: "المحوران متوازيان",
    crossed: "المحوران متعامدان",
    partial: "نفاذ جزئي للضوء",
    observation: "المشاهدة",
    singleText: "بعد الشريحة الأولى يصبح الضوء مستقطبًا في اتجاه محور نفاذها. تدويرها يغيّر اتجاه الاستقطاب، لكنه لا يغيّر الشدة الناتجة من الضوء غير المستقطب.",
    parallelText: "محورا النفاذ متوازيان؛ تمر أكبر شدة ممكنة عبر الشريحة الثانية.",
    crossedText: "محورا النفاذ متعامدان؛ لا تمر اهتزازات الضوء خلال الشريحة الثانية فتبدو العين معتمة.",
    partialText: "يمر فقط مركّب الاهتزاز الموازي لمحور الشريحة الثانية، لذلك تكون شدة الضوء أقل.",
    controls: "تحكم بمحاور النفاذ",
    conclusion: "الاستنتاج",
    conclusionText: "الضوء موجة مستعرضة؛ يهتز مجالها الكهربائي في اتجاهات عمودية على اتجاه انتشارها، ويجعل المستقطِب الاهتزاز في اتجاه واحد.",
    challenge: "تحدّي نصف الشدة",
    challengeText: "اجعل شدة الضوء بعد الشريحة الثانية تساوي نصف أعلى شدة ممكنة.",
    check: "تحقق من الإعداد",
    correct: "صحيح — الفرق بين المحورين 45°، لذلك cos²45° = 0.5.",
    wrong: "قرّب الفرق بين زاويتي الشريحتين إلى 45° أو 135°.",
  },
  en: {
    chapter: "Chapter 5 · Polarization activity",
    title: "Polarization of Light Waves",
    subtitle: "Pass light through one transmission axis, then add and rotate a second sheet to see how vibration direction and intensity change.",
    reset: "Reset activity",
    experiment: "Interactive experiment",
    source: "Unpolarized light",
    first: "Polarizing sheet",
    second: "Analyzer sheet",
    eye: "Eye",
    axis: "Transmission axis",
    stage: "Experiment stage",
    single: "One sheet",
    double: "Two sheets",
    firstAngle: "First-sheet angle",
    secondAngle: "Second-sheet angle",
    difference: "Angle between axes",
    output: "Output light intensity",
    unpolarized: "Vibrations in many directions",
    polarized: "Vibrations in one direction",
    parallel: "Axes are parallel",
    crossed: "Axes are perpendicular",
    partial: "Partial light transmission",
    observation: "Observation",
    singleText: "After the first sheet, light is polarized along its transmission axis. Rotating the sheet changes the polarization direction but not the intensity produced from unpolarized light.",
    parallelText: "The transmission axes are parallel, so the greatest possible intensity passes through the second sheet.",
    crossedText: "The transmission axes are perpendicular, so the light vibration cannot pass through the second sheet and the eye receives no light.",
    partialText: "Only the vibration component parallel to the second axis passes, so the output intensity is lower.",
    controls: "Control the transmission axes",
    conclusion: "Conclusion",
    conclusionText: "Light is a transverse wave. Its electric field vibrates perpendicular to its direction of travel, and a polarizer restricts vibration to one direction.",
    challenge: "Half-intensity challenge",
    challengeText: "Make the light after the second sheet equal to half the greatest possible intensity.",
    check: "Check setup",
    correct: "Correct — the axes differ by 45°, so cos²45° = 0.5.",
    wrong: "Move the difference between the sheet angles closer to 45° or 135°.",
  },
} as const;

const PolarizingSheet = ({
  x,
  angle,
  label,
  axisLabel,
  gradientId,
}: {
  x: number;
  angle: number;
  label: string;
  axisLabel: string;
  gradientId: string;
}) => (
  <g>
    <ellipse cx={x} cy="142" rx="32" ry="82" fill={`url(#${gradientId})`} stroke="#7dd3fc" strokeWidth="5" />
    <ellipse cx={x} cy="142" rx="24" ry="70" fill="#020617" opacity=".55" />
    <g transform={`rotate(${angle} ${x} 142)`}>
      <line x1={x} y1="84" x2={x} y2="200" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d={`M${x - 7} 95L${x} 83L${x + 7} 95M${x - 7} 189L${x} 201L${x + 7} 189`} fill="none" stroke="#fff" strokeWidth="3" />
    </g>
    <text x={x} y="246" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700">{label}</text>
    <text x={x} y="266" textAnchor="middle" fill="#94a3b8" fontSize="11">{axisLabel}: {angle}°</text>
  </g>
);

const LightWavePolarizationActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const id = useId().replace(/:/g, "");
  const [stage, setStage] = useState<Stage>("double");
  const [firstAngle, setFirstAngle] = useState(0);
  const [secondAngle, setSecondAngle] = useState(55);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");

  const rawDifference = Math.abs(firstAngle - secondAngle) % 180;
  const axisDifference = rawDifference > 90 ? 180 - rawDifference : rawDifference;
  const transmission = stage === "single" ? 1 : Math.cos((axisDifference * Math.PI) / 180) ** 2;
  const outputIntensity = 50 * transmission;
  const isParallel = axisDifference <= 2;
  const isCrossed = Math.abs(axisDifference - 90) <= 2;
  const observation = stage === "single"
    ? t.singleText
    : isParallel
      ? t.parallelText
      : isCrossed
        ? t.crossedText
        : t.partialText;
  const stateLabel = stage === "single" ? t.polarized : isParallel ? t.parallel : isCrossed ? t.crossed : t.partial;

  const wavePath = useMemo(() => {
    const points: string[] = [];
    for (let x = 0; x <= 150; x += 3) {
      const y = 142 + Math.sin(x / 11) * 28 * Math.sqrt(transmission);
      points.push(`${500 + x},${y}`);
    }
    return points.join(" ");
  }, [transmission]);

  const reset = () => {
    setStage("double");
    setFirstAngle(0);
    setSecondAngle(55);
    setFeedback("idle");
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_82%_0%,hsl(var(--physics)/.2),transparent_58%)]" />

      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-physics">
            <Aperture className="size-4" aria-hidden="true" />
            {t.chapter}
          </p>
          <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-4xl">{t.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{t.subtitle}</p>
        </div>
        <button type="button" onClick={reset} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold transition hover:border-physics/50 hover:bg-physics/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics">
          <RotateCcw className="size-4" aria-hidden="true" />
          {t.reset}
        </button>
      </header>

      <div className="relative grid gap-6 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,.65fr)]">
        <div className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-2xl sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg"><Eye className="size-5 text-cyan-300" aria-hidden="true" />{t.experiment}</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isCrossed && stage === "double" ? "border-slate-400/30 bg-slate-400/10 text-slate-300" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"}`}>{stateLabel}</span>
            </div>

            <svg viewBox="0 0 760 310" className="h-auto w-full" role="img" aria-label={t.experiment}>
              <defs>
                <linearGradient id={`sheet-${id}`} x1="0" x2="1"><stop stopColor="#0e7490" stopOpacity=".74" /><stop offset=".5" stopColor="#bae6fd" stopOpacity=".25" /><stop offset="1" stopColor="#0369a1" stopOpacity=".74" /></linearGradient>
                <filter id={`glow-${id}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>

              <circle cx="47" cy="142" r="21" fill="#fef08a" filter={`url(#glow-${id})`} />
              {Array.from({ length: 7 }, (_, index) => (
                <line key={index} x1="77" y1="142" x2="175" y2="142" stroke="#fde68a" strokeWidth="3" transform={`rotate(${index * 25.7} 120 142)`} opacity=".75" />
              ))}
              <text x="15" y="232" fill="#cbd5e1" fontSize="13">{t.source}</text>
              <text x="18" y="252" fill="#94a3b8" fontSize="11">{t.unpolarized}</text>

              <PolarizingSheet x={225} angle={firstAngle} label={t.first} axisLabel={t.axis} gradientId={`sheet-${id}`} />
              <polyline points="260,142 275,116 290,168 305,116 320,168 335,116 350,168 365,142" fill="none" stroke="#7dd3fc" strokeWidth="4" strokeLinejoin="round" opacity=".9" />

              {stage === "double" ? (
                <PolarizingSheet x={455} angle={secondAngle} label={t.second} axisLabel={t.axis} gradientId={`sheet-${id}`} />
              ) : (
                <g opacity=".28"><ellipse cx="455" cy="142" rx="32" ry="82" fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="7 8" /><text x="455" y="246" textAnchor="middle" fill="#94a3b8" fontSize="13">{t.second}</text></g>
              )}

              <polyline points={wavePath} fill="none" stroke="#f8fafc" strokeWidth={2 + transmission * 3} opacity={Math.max(.04, transmission)} filter={`url(#glow-${id})`} />
              <path d="M684 111c25 0 43 15 55 31-12 16-30 31-55 31-25 0-43-15-55-31 12-16 30-31 55-31Z" fill="#e2e8f0" opacity=".9" />
              <circle cx="684" cy="142" r="16" fill="#0f172a" />
              <circle cx="684" cy="142" r={3 + transmission * 8} fill="#7dd3fc" opacity={Math.max(.12, transmission)} filter={`url(#glow-${id})`} />
              <text x="671" y="205" fill="#cbd5e1" fontSize="13">{t.eye}</text>
            </svg>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">{t.difference}</p><p className="mt-2 font-mono text-xl font-black text-physics">{stage === "single" ? "—" : `${axisDifference}°`}</p></div>
            <div className="rounded-2xl border border-physics/25 bg-physics/5 p-4"><p className="text-xs font-bold text-muted-foreground">{t.output}</p><p className="mt-2 font-mono text-xl font-black text-physics">{outputIntensity.toFixed(1)}%</p></div>
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">I / I₁</p><p className="mt-2 font-mono text-xl font-black text-physics">{transmission.toFixed(2)}</p></div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.05fr_.95fr]">
            <div className="rounded-2xl border border-physics/20 bg-physics/5 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.observation}</p>
              <p className="mt-3 text-sm font-medium leading-7 text-foreground">{observation}</p>
              <div className="mt-4 rounded-xl border border-physics/20 bg-background/80 p-3 text-center"><p dir="ltr" className="font-mono text-lg font-black text-physics">I₂ = I₁ cos²θ</p></div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{t.conclusion}</p>
              <p className="mt-3 text-sm font-medium leading-7 text-foreground">{t.conclusionText}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="mb-5 flex items-center gap-2 text-base font-black text-foreground"><SlidersHorizontal className="size-5 text-physics" aria-hidden="true" />{t.controls}</h3>
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-foreground">{t.stage}</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["single", "double"] as Stage[]).map((item) => (
                  <button key={item} type="button" onClick={() => { setStage(item); setFeedback("idle"); }} aria-pressed={stage === item} className={`min-h-11 rounded-xl border px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${stage === item ? "border-physics bg-physics text-white" : "border-border bg-card text-muted-foreground hover:border-physics/40"}`}>{t[item]}</button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 space-y-5">
              <label className="block"><span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.firstAngle}</span><strong className="font-mono text-physics">{firstAngle}°</strong></span><input type="range" min="0" max="180" value={firstAngle} onChange={(event) => { setFirstAngle(Number(event.target.value)); setFeedback("idle"); }} className="mt-3 w-full accent-[hsl(var(--physics))]" /></label>
              <label className={`block ${stage === "single" ? "opacity-40" : ""}`}><span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.secondAngle}</span><strong className="font-mono text-physics">{secondAngle}°</strong></span><input type="range" min="0" max="180" value={secondAngle} disabled={stage === "single"} onChange={(event) => { setSecondAngle(Number(event.target.value)); setFeedback("idle"); }} className="mt-3 w-full accent-[hsl(var(--physics))]" /></label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/25 p-5">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-physics/10 text-physics"><Layers3 className="size-5" aria-hidden="true" /></div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.challenge}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-foreground">{t.challengeText}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-border"><div className="h-full bg-physics transition-all duration-300" style={{ width: `${transmission * 100}%` }} /></div>
            <button type="button" onClick={() => setFeedback(stage === "double" && Math.abs(transmission - .5) <= .03 ? "correct" : "wrong")} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-extrabold text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics">{t.check}</button>
            {feedback !== "idle" && (
              <div role="status" className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs font-semibold leading-5 ${feedback === "correct" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}>
                {feedback === "correct" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
                <span>{feedback === "correct" ? t.correct : t.wrong}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default LightWavePolarizationActivity;
