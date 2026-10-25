import { useId, useMemo, useState } from "react";
import {
  Aperture,
  CheckCircle2,
  Eye,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

const copy = {
  ar: {
    chapter: "الفصل الخامس · البصريات الفيزيائية",
    title: "تأثير المادة المستقطبة في شدة الضوء المستقطب",
    subtitle: "دوّر محور نفاذ المُحلِّل ولاحظ كيف تتغير شدة الضوء وفق الزاوية بين محوري المستقطِب والمُحلِّل.",
    reset: "إعادة التجربة",
    experiment: "مسار الضوء المستقطب",
    source: "مصدر ضوئي",
    polarizer: "المستقطِب",
    analyzer: "المُحلِّل",
    screen: "الشاشة",
    transmissionAxis: "محور النفاذ",
    controls: "إعدادات التجربة",
    incident: "شدة الضوء الساقط",
    angle: "زاوية المُحلِّل θ",
    presets: "أوضاع سريعة",
    parallel: "متوازيان 0°",
    diagonal: "مائلان 45°",
    crossed: "متعامدان 90°",
    transmitted: "الشدة النافذة",
    maximum: "أعلى شدة",
    half: "نصف الشدة",
    extinction: "انطفاء تام",
    currentObservation: "المشاهدة الحالية",
    maxText: "محورا النفاذ متوازيان، لذلك تمر أكبر شدة ممكنة من الضوء.",
    halfText: "عند 45° تصبح الشدة النافذة نصف الشدة التي وصلت إلى المُحلِّل.",
    dimText: "تتناقص الشدة كلما اقترب محور المُحلِّل من الوضع المتعامد.",
    darkText: "محورا النفاذ متعامدان، لذلك لا ينفذ الضوء وتظهر الشاشة معتمة.",
    graph: "منحنى الشدة مع زاوية المُحلِّل",
    intensityAxis: "الشدة I",
    angleAxis: "الزاوية θ",
    law: "قانون مالوس",
    note: "عند مرور الضوء غير المستقطب في المستقطِب الأول تصبح شدته نصف شدته الأصلية، ثم يحدد المُحلِّل الشدة النافذة.",
    challenge: "تحدّي الانطفاء",
    challengeText: "حرّك زاوية المُحلِّل حتى تنطفئ البقعة الضوئية، ثم تحقق من إعدادك.",
    check: "تحقق من الإعداد",
    correct: "ممتاز — جعلت محوري النفاذ متعامدين، لذلك أصبحت الشدة صفراً.",
    wrong: "لم يحدث الانطفاء الكامل بعد. قرّب الزاوية من 90°.",
  },
  en: {
    chapter: "Chapter 5 · Physical Optics",
    title: "Effect of a Polarizing Material on Polarized Light Intensity",
    subtitle: "Rotate the analyzer's transmission axis and observe how intensity changes with the angle between the polarizer and analyzer.",
    reset: "Reset experiment",
    experiment: "Polarized-light path",
    source: "Light source",
    polarizer: "Polarizer",
    analyzer: "Analyzer",
    screen: "Screen",
    transmissionAxis: "Transmission axis",
    controls: "Experiment controls",
    incident: "Incident light intensity",
    angle: "Analyzer angle θ",
    presets: "Quick positions",
    parallel: "Parallel 0°",
    diagonal: "Diagonal 45°",
    crossed: "Crossed 90°",
    transmitted: "Transmitted intensity",
    maximum: "Maximum intensity",
    half: "Half intensity",
    extinction: "Complete extinction",
    currentObservation: "Current observation",
    maxText: "The transmission axes are parallel, so the greatest possible intensity passes through.",
    halfText: "At 45°, the transmitted intensity is half the intensity reaching the analyzer.",
    dimText: "Intensity decreases as the analyzer axis approaches the crossed position.",
    darkText: "The transmission axes are perpendicular, so no light passes and the screen appears dark.",
    graph: "Intensity versus analyzer angle",
    intensityAxis: "Intensity I",
    angleAxis: "Angle θ",
    law: "Malus's law",
    note: "After unpolarized light passes through the first polarizer, its intensity is half the original intensity. The analyzer then determines the transmitted intensity.",
    challenge: "Extinction challenge",
    challengeText: "Move the analyzer angle until the light spot disappears, then check your setup.",
    check: "Check setup",
    correct: "Excellent — the transmission axes are perpendicular, so the intensity is zero.",
    wrong: "The light is not fully extinguished yet. Move the angle closer to 90°.",
  },
} as const;

const PolarizerDisc = ({
  x,
  angle,
  label,
  axisLabel,
  id,
}: {
  x: number;
  angle: number;
  label: string;
  axisLabel: string;
  id: string;
}) => (
  <g>
    <ellipse cx={x} cy="135" rx="31" ry="82" fill={`url(#${id})`} stroke="#7dd3fc" strokeWidth="5" />
    <ellipse cx={x} cy="135" rx="23" ry="70" fill="#08111f" opacity=".56" />
    <g transform={`rotate(${angle} ${x} 135)`}>
      <line x1={x} y1="76" x2={x} y2="194" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
      <path d={`M${x - 7} 88L${x} 76L${x + 7} 88M${x - 7} 182L${x} 194L${x + 7} 182`} fill="none" stroke="#f8fafc" strokeWidth="3" />
    </g>
    <text x={x} y="242" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="700">{label}</text>
    <text x={x} y="263" textAnchor="middle" fill="#94a3b8" fontSize="11">{axisLabel}</text>
  </g>
);

const PolarizationActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const gradientId = useId().replace(/:/g, "");
  const [angle, setAngle] = useState(35);
  const [incidentIntensity, setIncidentIntensity] = useState(100);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");

  const normalizedAngle = angle <= 90 ? angle : 180 - angle;
  const afterPolarizer = incidentIntensity / 2;
  const transmission = Math.cos((angle * Math.PI) / 180) ** 2;
  const transmittedIntensity = afterPolarizer * transmission;
  const relativePercent = transmission * 100;
  const spotOpacity = Math.max(0.03, transmission);

  const observation = normalizedAngle <= 3
    ? t.maxText
    : Math.abs(normalizedAngle - 45) <= 2
      ? t.halfText
      : Math.abs(normalizedAngle - 90) <= 2
        ? t.darkText
        : t.dimText;
  const stateLabel = normalizedAngle <= 3
    ? t.maximum
    : Math.abs(normalizedAngle - 45) <= 2
      ? t.half
      : Math.abs(normalizedAngle - 90) <= 2
        ? t.extinction
        : `${relativePercent.toFixed(0)}%`;

  const graphPoints = useMemo(() => {
    return Array.from({ length: 61 }, (_, index) => {
      const theta = index * 3;
      const value = Math.cos((theta * Math.PI) / 180) ** 2;
      return `${28 + theta * 1.45},${142 - value * 116}`;
    }).join(" ");
  }, []);

  const setPreset = (value: number) => {
    setAngle(value);
    setFeedback("idle");
  };

  const reset = () => {
    setAngle(35);
    setIncidentIntensity(100);
    setFeedback("idle");
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_16%_0%,hsl(var(--physics)/.2),transparent_58%)]" />

      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-physics">
            <Aperture className="size-4" aria-hidden="true" />
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
                <Eye className="size-5 text-cyan-300" aria-hidden="true" />
                {t.experiment}
              </h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${relativePercent < 1 ? "border-slate-400/30 bg-slate-400/10 text-slate-300" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"}`}>
                {stateLabel}
              </span>
            </div>

            <svg viewBox="0 0 760 310" className="h-auto w-full" role="img" aria-label={t.experiment}>
              <defs>
                <linearGradient id={`disc-${gradientId}`} x1="0" x2="1">
                  <stop stopColor="#0e7490" stopOpacity=".7" />
                  <stop offset=".5" stopColor="#bae6fd" stopOpacity=".28" />
                  <stop offset="1" stopColor="#0369a1" stopOpacity=".72" />
                </linearGradient>
                <filter id={`spot-${gradientId}`} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="13" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              <g>
                <path d="M55 117L160 92V178L55 153Z" fill="#fef3c7" opacity={incidentIntensity / 120} />
                <circle cx="45" cy="135" r="28" fill="#f59e0b" opacity=".25" filter={`url(#spot-${gradientId})`} />
                <circle cx="45" cy="135" r="16" fill="#fff7cc" />
                <path d="M23 135H7M34 112L24 98M34 158L24 172" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" />
                <text x="16" y="211" fill="#cbd5e1" fontSize="13">{t.source}</text>
              </g>

              <PolarizerDisc x={205} angle={0} label={t.polarizer} axisLabel={t.transmissionAxis} id={`disc-${gradientId}`} />
              <path d="M236 105L420 114V156L236 165Z" fill="#7dd3fc" opacity={Math.max(.12, incidentIntensity / 180)} />
              <g opacity=".75">
                <line x1="255" y1="112" x2="402" y2="112" stroke="#e0f2fe" strokeWidth="3" />
                <line x1="255" y1="129" x2="402" y2="129" stroke="#e0f2fe" strokeWidth="3" />
                <line x1="255" y1="146" x2="402" y2="146" stroke="#e0f2fe" strokeWidth="3" />
                <line x1="255" y1="163" x2="402" y2="163" stroke="#e0f2fe" strokeWidth="3" />
              </g>

              <PolarizerDisc x={455} angle={angle} label={t.analyzer} axisLabel={`${angle}°`} id={`disc-${gradientId}`} />
              <path d="M486 119L650 127V145L486 153Z" fill="#f8fafc" opacity={spotOpacity} />

              <rect x="652" y="47" width="56" height="176" rx="15" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="4" />
              <ellipse cx="650" cy="135" rx={10 + transmission * 18} ry={18 + transmission * 44} fill="#fff" opacity={spotOpacity} filter={`url(#spot-${gradientId})`} />
              <text x="634" y="247" fill="#cbd5e1" fontSize="14">{t.screen}</text>
            </svg>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs font-bold text-muted-foreground">{t.incident}</p>
              <p className="mt-2 font-mono text-xl font-black text-physics">{incidentIntensity}%</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs font-bold text-muted-foreground">{t.angle}</p>
              <p className="mt-2 font-mono text-xl font-black text-physics">{angle}°</p>
            </div>
            <div className="rounded-2xl border border-physics/25 bg-physics/5 p-4">
              <p className="text-xs font-bold text-muted-foreground">{t.transmitted}</p>
              <p className="mt-2 font-mono text-xl font-black text-physics">{transmittedIntensity.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <h3 className="mb-3 text-sm font-black text-foreground">{t.graph}</h3>
              <svg viewBox="0 0 310 175" className="w-full" role="img" aria-label={t.graph}>
                <path d="M28 16V142H294" fill="none" stroke="currentColor" className="text-border" strokeWidth="2" />
                <path d="M158 16V147" stroke="currentColor" className="text-border" strokeDasharray="4 5" />
                <polyline points={graphPoints} fill="none" stroke="hsl(var(--physics))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={28 + angle * 1.45} cy={142 - transmission * 116} r="6" fill="hsl(var(--physics))" stroke="white" strokeWidth="2" />
                <text x="3" y="18" fill="currentColor" className="text-muted-foreground" fontSize="11">{t.intensityAxis}</text>
                <text x="249" y="166" fill="currentColor" className="text-muted-foreground" fontSize="11">{t.angleAxis}</text>
              </svg>
            </div>

            <div className="rounded-2xl border border-physics/20 bg-physics/5 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.currentObservation}</p>
              <p className="mt-3 text-sm font-medium leading-7 text-foreground">{observation}</p>
              <div className="mt-4 rounded-xl border border-physics/20 bg-background/80 p-3 text-center">
                <p className="text-[11px] font-bold text-muted-foreground">{t.law}</p>
                <p dir="ltr" className="mt-1 font-mono text-lg font-black text-physics">I = I₀ cos²θ</p>
              </div>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">{t.note}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="mb-5 flex items-center gap-2 text-base font-black text-foreground">
              <SlidersHorizontal className="size-5 text-physics" aria-hidden="true" />
              {t.controls}
            </h3>
            <div className="space-y-5">
              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.incident}</span><strong className="font-mono text-physics">{incidentIntensity}%</strong></span>
                <input type="range" min="10" max="100" step="5" value={incidentIntensity} onChange={(event) => setIncidentIntensity(Number(event.target.value))} className="mt-3 w-full accent-[hsl(var(--physics))]" />
              </label>
              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.angle}</span><strong className="font-mono text-physics">{angle}°</strong></span>
                <input type="range" min="0" max="180" step="1" value={angle} onChange={(event) => { setAngle(Number(event.target.value)); setFeedback("idle"); }} className="mt-3 w-full accent-[hsl(var(--physics))]" />
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-bold text-foreground">{t.presets}</legend>
              <div className="grid gap-2">
                {[
                  [0, t.parallel],
                  [45, t.diagonal],
                  [90, t.crossed],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPreset(Number(value))}
                    className={`min-h-11 rounded-xl border px-3 text-start text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${angle === value ? "border-physics bg-physics text-white" : "border-border bg-card text-muted-foreground hover:border-physics/40"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/25 p-5">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-physics/10 text-physics">
              <Lightbulb className="size-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.challenge}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-foreground">{t.challengeText}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-physics transition-all duration-300" style={{ width: `${100 - relativePercent}%` }} />
            </div>
            <p className="mt-2 text-center font-mono text-xs font-bold text-muted-foreground">I / I₀ = {(transmission).toFixed(3)}</p>
            <button
              type="button"
              onClick={() => setFeedback(Math.abs(normalizedAngle - 90) <= 2 ? "correct" : "wrong")}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-extrabold text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics"
            >
              {t.check}
            </button>
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

export default PolarizationActivity;
