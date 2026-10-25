import { useId, useMemo, useState } from "react";
import {
  Atom,
  CheckCircle2,
  CircleGauge,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
  Zap,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

type Metal = "cesium" | "sodium" | "zinc";
type Answer = "intensity" | "voltage" | "none";

const metals: Record<Metal, { workFunction: number; color: string }> = {
  cesium: { workFunction: 2.14, color: "#fbbf24" },
  sodium: { workFunction: 2.28, color: "#fb923c" },
  zinc: { workFunction: 4.31, color: "#94a3b8" },
};

const copy = {
  ar: {
    chapter: "الفصل السادس · الفيزياء الحديثة",
    title: "دراسة الظاهرة الكهروضوئية",
    subtitle: "سلّط ضوءًا أحادي اللون على سطح فلزي، ثم غيّر الطول الموجي وشدة الضوء والجهد لتكتشف شروط انبعاث الإلكترونات.",
    reset: "إعادة التجربة",
    simulator: "أنبوبة الظاهرة الكهروضوئية",
    cathode: "المهبط الحساس",
    anode: "المصعد الجامع",
    ammeter: "الأميتر",
    light: "الضوء الساقط",
    controls: "إعدادات التجربة",
    metal: "معدن المهبط",
    cesium: "السيزيوم",
    sodium: "الصوديوم",
    zinc: "الخارصين",
    wavelength: "الطول الموجي λ",
    intensity: "شدة الضوء",
    voltage: "فرق الجهد V",
    emitted: "حدث انبعاث كهروضوئي",
    blocked: "لا يحدث انبعاث",
    stopped: "توقفت الإلكترونات قبل المصعد",
    photonEnergy: "طاقة الفوتون",
    workFunction: "دالة الشغل",
    maxEnergy: "أقصى طاقة حركية",
    stopping: "جهد الإيقاف",
    current: "التيار الضوئي",
    graph: "منحنى التيار الضوئي–الجهد",
    currentAxis: "التيار I",
    voltageAxis: "الجهد V",
    observation: "المشاهدة الحالية",
    noEmissionText: "طاقة الفوتون أقل من دالة شغل المعدن؛ لذلك لا تتحرر إلكترونات مهما ازدادت شدة الضوء.",
    stoppedText: "طاقة الفوتون كافية، لكن الجهد السالب بلغ جهد الإيقاف أو تجاوزه، فأصبح التيار صفراً.",
    emissionText: "تحررت إلكترونات من المهبط ووصل قسم منها إلى المصعد، لذلك يمر تيار كهروضوئي في الدائرة.",
    law: "معادلة أينشتاين",
    challenge: "اختبر فهمك",
    question: "عند ثبوت تردد الضوء وزيادة شدته، ماذا يزداد؟",
    intensityAnswer: "التيار الإشباعي فقط",
    voltageAnswer: "جهد الإيقاف فقط",
    noneAnswer: "دالة الشغل",
    check: "تحقق",
    choose: "اختر إجابة أولًا.",
    correct: "صحيح — زيادة الشدة تعني فوتونات أكثر، فتزداد الإلكترونات المنبعثة والتيار الإشباعي.",
    wrong: "راجع النتيجة: الشدة تغيّر عدد الفوتونات، أما طاقة الفوتون فتعتمد على تردده.",
  },
  en: {
    chapter: "Chapter 6 · Modern Physics",
    title: "Investigating the Photoelectric Effect",
    subtitle: "Shine monochromatic light on a metal surface, then change wavelength, intensity, and voltage to discover when electrons are emitted.",
    reset: "Reset experiment",
    simulator: "Photoelectric tube",
    cathode: "Photosensitive cathode",
    anode: "Collector anode",
    ammeter: "Ammeter",
    light: "Incident light",
    controls: "Experiment controls",
    metal: "Cathode metal",
    cesium: "Cesium",
    sodium: "Sodium",
    zinc: "Zinc",
    wavelength: "Wavelength λ",
    intensity: "Light intensity",
    voltage: "Potential difference V",
    emitted: "Photoemission occurs",
    blocked: "No photoemission",
    stopped: "Electrons are stopped",
    photonEnergy: "Photon energy",
    workFunction: "Work function",
    maxEnergy: "Maximum kinetic energy",
    stopping: "Stopping potential",
    current: "Photocurrent",
    graph: "Photocurrent–voltage curve",
    currentAxis: "Current I",
    voltageAxis: "Voltage V",
    observation: "Current observation",
    noEmissionText: "The photon energy is below the metal's work function, so no electrons are released regardless of light intensity.",
    stoppedText: "The photon energy is sufficient, but the reverse voltage has reached the stopping potential, so the current is zero.",
    emissionText: "Electrons leave the cathode and some reach the anode, producing a photoelectric current in the circuit.",
    law: "Einstein's equation",
    challenge: "Check your understanding",
    question: "At a fixed light frequency, what increases when intensity increases?",
    intensityAnswer: "Saturation current only",
    voltageAnswer: "Stopping potential only",
    noneAnswer: "Work function",
    check: "Check answer",
    choose: "Choose an answer first.",
    correct: "Correct — greater intensity means more photons, so more electrons are emitted and saturation current increases.",
    wrong: "Review the result: intensity changes photon number, while photon energy depends on frequency.",
  },
} as const;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const PhotoelectricEffectActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const glowId = useId().replace(/:/g, "");
  const [metal, setMetal] = useState<Metal>("cesium");
  const [wavelength, setWavelength] = useState(420);
  const [intensity, setIntensity] = useState(70);
  const [voltage, setVoltage] = useState(1.5);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "empty" | "correct" | "wrong">("idle");

  const photonEnergy = 1240 / wavelength;
  const workFunction = metals[metal].workFunction;
  const kineticEnergy = Math.max(0, photonEnergy - workFunction);
  const stoppingPotential = kineticEnergy;
  const hasEmission = photonEnergy >= workFunction;
  const isStopped = hasEmission && voltage <= -stoppingPotential;
  const saturationCurrent = intensity / 10;
  const voltageFactor = !hasEmission
    ? 0
    : voltage < 0
      ? clamp((voltage + stoppingPotential) / Math.max(stoppingPotential, 0.01))
      : 0.72 + 0.28 * (1 - Math.exp(-voltage / 1.4));
  const current = hasEmission ? saturationCurrent * voltageFactor : 0;

  const lightColor = useMemo(() => {
    if (wavelength < 380) return "#8b5cf6";
    if (wavelength < 450) return "#6366f1";
    if (wavelength < 495) return "#0ea5e9";
    if (wavelength < 570) return "#22c55e";
    if (wavelength < 590) return "#eab308";
    if (wavelength < 620) return "#f97316";
    return "#ef4444";
  }, [wavelength]);

  const electronCount = Math.max(2, Math.round(intensity / 14));
  const observation = !hasEmission ? t.noEmissionText : isStopped ? t.stoppedText : t.emissionText;
  const status = !hasEmission ? t.blocked : isStopped ? t.stopped : t.emitted;

  const graphPoints = useMemo(() => {
    return Array.from({ length: 41 }, (_, index) => {
      const xVoltage = -5 + index * 0.25;
      const factor = !hasEmission
        ? 0
        : xVoltage < 0
          ? clamp((xVoltage + stoppingPotential) / Math.max(stoppingPotential, 0.01))
          : 0.72 + 0.28 * (1 - Math.exp(-xVoltage / 1.4));
      const graphCurrent = saturationCurrent * factor;
      return `${30 + index * 6},${144 - graphCurrent * 10}`;
    }).join(" ");
  }, [hasEmission, saturationCurrent, stoppingPotential]);

  const reset = () => {
    setMetal("cesium");
    setWavelength(420);
    setIntensity(70);
    setVoltage(1.5);
    setAnswer(null);
    setFeedback("idle");
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_80%_0%,hsl(var(--physics)/.2),transparent_55%)]" />

      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-physics">
            <Atom className="size-4" aria-hidden="true" />
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
                <Zap className="size-5 text-cyan-300" aria-hidden="true" />
                {t.simulator}
              </h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${!hasEmission ? "border-rose-400/30 bg-rose-400/10 text-rose-300" : isStopped ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"}`}>
                {status}
              </span>
            </div>

            <svg viewBox="0 0 760 350" className="h-auto w-full" role="img" aria-label={t.simulator}>
              <defs>
                <filter id={`photo-glow-${glowId}`} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id={`tube-${glowId}`} x1="0" x2="1">
                  <stop stopColor="#0f172a" />
                  <stop offset=".5" stopColor="#26344d" />
                  <stop offset="1" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              <g opacity=".9">
                {Array.from({ length: 5 }, (_, index) => (
                  <path
                    key={index}
                    d={`M35 ${78 + index * 19} C100 ${62 + index * 19}, 145 ${98 + index * 16}, 220 ${90 + index * 15}`}
                    fill="none"
                    stroke={lightColor}
                    strokeWidth={2 + intensity / 32}
                    strokeDasharray="12 10"
                    filter={`url(#photo-glow-${glowId})`}
                    className="motion-safe:animate-pulse"
                  />
                ))}
              </g>
              <text x="42" y="42" fill="#cbd5e1" fontSize="16">{t.light}</text>

              <rect x="215" y="42" width="360" height="190" rx="80" fill={`url(#tube-${glowId})`} stroke="#94a3b8" strokeWidth="5" />
              <rect x="218" y="46" width="354" height="182" rx="76" fill="#dbeafe" opacity=".1" />
              <path d="M275 82 Q235 136 275 192" fill="none" stroke={metals[metal].color} strokeWidth="20" strokeLinecap="round" />
              <path d="M510 80V194" stroke="#e2e8f0" strokeWidth="15" strokeLinecap="round" />
              <text x="240" y="254" fill="#f8fafc" fontSize="15">{t.cathode}</text>
              <text x="472" y="254" fill="#f8fafc" fontSize="15">{t.anode}</text>

              {hasEmission && !isStopped && Array.from({ length: electronCount }, (_, index) => {
                const x = 305 + ((index * 47 + Math.round(voltage * 13)) % 165);
                const y = 100 + ((index * 31) % 80);
                return (
                  <g key={index} className="motion-safe:animate-pulse" style={{ animationDelay: `${index * 110}ms` }}>
                    <circle cx={x} cy={y} r="8" fill="#38bdf8" filter={`url(#photo-glow-${glowId})`} />
                    <text x={x - 4} y={y + 4} fill="#082f49" fontSize="13" fontWeight="900">−</text>
                  </g>
                );
              })}

              <path d="M275 232V306H510V232" fill="none" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
              <circle cx="392" cy="306" r="30" fill="#0f172a" stroke="#f8fafc" strokeWidth="4" />
              <text x="381" y="314" fill="#38bdf8" fontSize="24" fontWeight="800">A</text>
              <text x="432" y="315" fill="#cbd5e1" fontSize="14">{current.toFixed(2)} µA</text>
              <g transform="translate(620 100)">
                <circle cx="48" cy="48" r="45" fill="#111827" stroke="#64748b" strokeWidth="4" />
                <path d="M20 58A30 30 0 0 1 76 58" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                <line x1="48" y1="58" x2={48 + Math.cos((-150 + clamp(current / Math.max(saturationCurrent, .1)) * 120) * Math.PI / 180) * 25} y2={58 + Math.sin((-150 + clamp(current / Math.max(saturationCurrent, .1)) * 120) * Math.PI / 180) * 25} stroke="#fb7185" strokeWidth="4" strokeLinecap="round" />
                <text x="37" y="88" fill="#cbd5e1" fontSize="13">µA</text>
              </g>
            </svg>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [t.photonEnergy, `${photonEnergy.toFixed(2)} eV`],
              [t.workFunction, `${workFunction.toFixed(2)} eV`],
              [t.maxEnergy, `${kineticEnergy.toFixed(2)} eV`],
              [t.stopping, `${stoppingPotential.toFixed(2)} V`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-xs font-bold text-muted-foreground">{label}</p>
                <p className="mt-2 font-mono text-xl font-black text-physics">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
                  <CircleGauge className="size-4 text-physics" aria-hidden="true" />
                  {t.graph}
                </h3>
                <span className="font-mono text-xs font-bold text-physics">I = {current.toFixed(2)} µA</span>
              </div>
              <svg viewBox="0 0 310 175" className="w-full" role="img" aria-label={t.graph}>
                <path d="M30 14V144H292" fill="none" stroke="currentColor" className="text-border" strokeWidth="2" />
                <path d="M150 14V151" stroke="currentColor" className="text-border" strokeDasharray="4 5" />
                <polyline points={graphPoints} fill="none" stroke="hsl(var(--physics))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={30 + ((voltage + 5) / 10) * 240} cy={144 - current * 10} r="6" fill="hsl(var(--physics))" stroke="white" strokeWidth="2" />
                <text x="4" y="18" fill="currentColor" className="text-muted-foreground" fontSize="11">{t.currentAxis}</text>
                <text x="258" y="166" fill="currentColor" className="text-muted-foreground" fontSize="11">{t.voltageAxis}</text>
              </svg>
            </div>

            <div className="rounded-2xl border border-physics/20 bg-physics/5 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.observation}</p>
              <p className="mt-3 text-sm font-medium leading-7 text-foreground">{observation}</p>
              <div className="mt-4 rounded-xl border border-physics/20 bg-background/80 p-3 text-center">
                <p className="text-[11px] font-bold text-muted-foreground">{t.law}</p>
                <p dir="ltr" className="mt-1 font-mono text-base font-black text-physics">hf = Φ + K<sub>max</sub> = Φ + eV<sub>s</sub></p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="mb-5 flex items-center gap-2 text-base font-black text-foreground">
              <SlidersHorizontal className="size-5 text-physics" aria-hidden="true" />
              {t.controls}
            </h3>

            <fieldset>
              <legend className="mb-2 text-sm font-bold text-foreground">{t.metal}</legend>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(metals) as Metal[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMetal(item)}
                    aria-pressed={metal === item}
                    className={`min-h-11 rounded-xl border px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${metal === item ? "border-physics bg-physics text-white" : "border-border bg-card text-muted-foreground hover:border-physics/40"}`}
                  >
                    {t[item]}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.wavelength}</span><strong className="font-mono text-physics">{wavelength} nm</strong></span>
                <input type="range" min="250" max="750" step="5" value={wavelength} onChange={(event) => setWavelength(Number(event.target.value))} className="mt-3 w-full accent-[hsl(var(--physics))]" />
                <span className="mt-2 block h-2 rounded-full bg-[linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4,#22c55e,#eab308,#f97316,#ef4444)]" />
              </label>
              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.intensity}</span><strong className="font-mono text-physics">{intensity}%</strong></span>
                <input type="range" min="10" max="100" step="5" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} className="mt-3 w-full accent-[hsl(var(--physics))]" />
              </label>
              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.voltage}</span><strong className="font-mono text-physics">{voltage.toFixed(1)} V</strong></span>
                <input type="range" min="-5" max="5" step="0.1" value={voltage} onChange={(event) => setVoltage(Number(event.target.value))} className="mt-3 w-full accent-[hsl(var(--physics))]" />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/25 p-5">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-physics/10 text-physics">
              <Lightbulb className="size-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.challenge}</p>
            <p className="mt-2 text-sm font-bold leading-6 text-foreground">{t.question}</p>
            <div className="mt-3 grid gap-2">
              {(["intensity", "voltage", "none"] as Answer[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setAnswer(item); setFeedback("idle"); }}
                  className={`min-h-11 rounded-xl border px-3 text-start text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${answer === item ? "border-physics bg-physics/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-physics/40"}`}
                >
                  {t[`${item}Answer`]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFeedback(answer === null ? "empty" : answer === "intensity" ? "correct" : "wrong")}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-extrabold text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics"
            >
              {t.check}
            </button>
            {feedback !== "idle" && (
              <div role="status" className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs font-semibold leading-5 ${feedback === "correct" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : feedback === "wrong" ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300" : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
                {feedback === "correct" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
                <span>{feedback === "correct" ? t.correct : feedback === "wrong" ? t.wrong : t.choose}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default PhotoelectricEffectActivity;
