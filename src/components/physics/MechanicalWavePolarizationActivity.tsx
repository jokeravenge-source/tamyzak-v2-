import { useId, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleOff,
  MoveVertical,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Waves,
  Wrench,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

type ExperimentStep = 1 | 2 | 3;

const copy = {
  ar: {
    chapter: "الفصل الخامس · نشاط الموجات",
    title: "استقطاب الموجات الميكانيكية",
    subtitle: "حرّك الحبل ودوّر الحاجز المشقوق لتشاهد متى تمر الموجة المستعرضة ومتى تُحجب.",
    reset: "إعادة النشاط",
    experiment: "التجربة التفاعلية",
    running: "المهتز يعمل",
    paused: "المهتز متوقف",
    source: "مصدر الاهتزاز",
    fixedEnd: "الطرف المثبّت",
    barrier: "الحاجز المشقوق",
    rotateBarrier: "اضغط لتدوير شق الحاجز 90°",
    aligned: "الشق موازٍ للاهتزاز",
    partial: "نفاذ جزئي للموجة",
    blocked: "الشق عمودي على الاهتزاز",
    inputWave: "الموجة الساقطة",
    outputWave: "الموجة النافذة",
    transmission: "نسبة سعة الموجة النافذة",
    tools: "أدوات النشاط",
    ropeTool: "حبل مثبت من أحد طرفيه",
    barrierTool: "حاجز يحتوي شقاً قابلاً للدوران",
    steps: "خطوات النشاط",
    step1Title: "تهيئة الجهاز",
    step1Text: "مرّر الحبل خلال شق الحاجز وثبّت طرفه الآخر.",
    step2Title: "توليد موجة مستعرضة",
    step2Text: "شغّل المهتز واجعل الشق موازياً لاتجاه اهتزاز الحبل؛ تمر الموجة خلاله.",
    step3Title: "تدوير الحاجز",
    step3Text: "دوّر الشق حتى يصبح عمودياً على اتجاه الاهتزاز؛ تتوقف الموجة عن المرور.",
    nextStep: "الخطوة التالية",
    repeat: "إعادة الخطوات",
    controls: "التحكم بالتجربة",
    start: "تشغيل الموجة",
    stop: "إيقاف الموجة",
    slotAngle: "زاوية شق الحاجز",
    amplitude: "سعة الموجة الساقطة",
    parallelPreset: "شق موازٍ 0°",
    perpendicularPreset: "شق عمودي 90°",
    observation: "المشاهدة الحالية",
    pausedText: "شغّل مصدر الاهتزاز لتتكوّن موجة مستعرضة في الحبل.",
    alignedText: "تمر الموجة عبر الشق لأن اتجاه اهتزاز الحبل موازٍ لاتجاه الشق.",
    partialText: "لا يمر إلا مركّب الاهتزاز الموازي للشق، لذلك تقل سعة الموجة بعد الحاجز.",
    blockedText: "لا تمر الموجة لأن اتجاه اهتزاز الحبل عمودي على اتجاه الشق.",
    conclusion: "الاستنتاج",
    conclusionText: "الموجات المستعرضة قابلة للاستقطاب؛ يسمح الحاجز المشقوق بمرور مركّب الاهتزاز الموازي للشق ويمنع المركّب العمودي عليه، وبذلك يُحصر الاهتزاز في مستوى واحد.",
    lightLink: "ينطبق المبدأ نفسه على الضوء باستعمال شريحة البولارويد، إذ تسمح بمرور مركّب المجال الكهربائي الموازي لمحور نفاذها.",
  },
  en: {
    chapter: "Chapter 5 · Waves activity",
    title: "Polarization of Mechanical Waves",
    subtitle: "Move the rope and rotate the slotted barrier to see when a transverse wave passes and when it is blocked.",
    reset: "Reset activity",
    experiment: "Interactive experiment",
    running: "Oscillator running",
    paused: "Oscillator stopped",
    source: "Vibration source",
    fixedEnd: "Fixed end",
    barrier: "Slotted barrier",
    rotateBarrier: "Click to rotate the barrier slot by 90°",
    aligned: "Slot parallel to vibration",
    partial: "Partial wave transmission",
    blocked: "Slot perpendicular to vibration",
    inputWave: "Incident wave",
    outputWave: "Transmitted wave",
    transmission: "Transmitted wave amplitude",
    tools: "Activity tools",
    ropeTool: "A rope fixed at one end",
    barrierTool: "A barrier with a rotatable slot",
    steps: "Activity steps",
    step1Title: "Prepare the apparatus",
    step1Text: "Pass the rope through the barrier slot and secure its opposite end.",
    step2Title: "Generate a transverse wave",
    step2Text: "Start the oscillator and align the slot with the rope vibration; the wave passes through.",
    step3Title: "Rotate the barrier",
    step3Text: "Turn the slot until it is perpendicular to the vibration; the wave can no longer pass.",
    nextStep: "Next step",
    repeat: "Repeat steps",
    controls: "Experiment controls",
    start: "Start wave",
    stop: "Stop wave",
    slotAngle: "Barrier-slot angle",
    amplitude: "Incident-wave amplitude",
    parallelPreset: "Parallel slot 0°",
    perpendicularPreset: "Perpendicular slot 90°",
    observation: "Current observation",
    pausedText: "Start the vibration source to produce a transverse wave in the rope.",
    alignedText: "The wave passes through because the rope vibration is parallel to the slot.",
    partialText: "Only the vibration component parallel to the slot passes, so the wave amplitude is reduced after the barrier.",
    blockedText: "The wave cannot pass because the rope vibration is perpendicular to the slot.",
    conclusion: "Conclusion",
    conclusionText: "Transverse waves can be polarized. A slotted barrier passes the vibration component parallel to its slot and blocks the perpendicular component, restricting vibration to one plane.",
    lightLink: "The same principle applies to light through a Polaroid sheet, which passes the electric-field component parallel to its transmission axis.",
  },
} as const;

const buildWavePath = (start: number, end: number, centerY: number, amplitude: number) => {
  const points: string[] = [];
  for (let x = start; x <= end; x += 4) {
    const y = centerY + Math.sin((x - start) / 14) * amplitude;
    points.push(`${x},${y}`);
  }
  return points.join(" ");
};

const MechanicalWavePolarizationActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const id = useId().replace(/:/g, "");
  const [isRunning, setIsRunning] = useState(true);
  const [slotAngle, setSlotAngle] = useState(0);
  const [amplitude, setAmplitude] = useState(36);
  const [step, setStep] = useState<ExperimentStep>(2);

  const transmission = Math.abs(Math.cos((slotAngle * Math.PI) / 180));
  const outputAmplitude = isRunning ? amplitude * transmission : 0;
  const status = slotAngle <= 3 ? "aligned" : slotAngle >= 87 ? "blocked" : "partial";
  const statusLabel = t[status];
  const observation = !isRunning ? t.pausedText : status === "aligned" ? t.alignedText : status === "blocked" ? t.blockedText : t.partialText;

  const inputPath = useMemo(
    () => buildWavePath(70, 340, 145, isRunning ? amplitude : 0),
    [amplitude, isRunning],
  );
  const outputPath = useMemo(
    () => buildWavePath(420, 690, 145, outputAmplitude),
    [outputAmplitude],
  );

  const applyStep = (nextStep: ExperimentStep) => {
    setStep(nextStep);
    if (nextStep === 1) {
      setIsRunning(false);
      setSlotAngle(0);
    } else if (nextStep === 2) {
      setIsRunning(true);
      setSlotAngle(0);
    } else {
      setIsRunning(true);
      setSlotAngle(90);
    }
  };

  const reset = () => {
    setIsRunning(true);
    setSlotAngle(0);
    setAmplitude(36);
    setStep(2);
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
        <button type="button" onClick={reset} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold transition hover:border-physics/50 hover:bg-physics/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics">
          <RotateCcw className="size-4" aria-hidden="true" />
          {t.reset}
        </button>
      </header>

      <div className="relative grid gap-6 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,.65fr)]">
        <div className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-2xl sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg"><Waves className="size-5 text-cyan-300" aria-hidden="true" />{t.experiment}</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${status === "blocked" ? "border-rose-400/30 bg-rose-400/10 text-rose-300" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"}`}>{isRunning ? statusLabel : t.paused}</span>
            </div>

            <svg viewBox="0 0 760 300" className="h-auto min-h-[250px] w-full" role="img" aria-label={t.experiment}>
              <defs>
                <linearGradient id={`barrier-${id}`} x1="0" x2="1"><stop stopColor="#334155" /><stop offset=".5" stopColor="#94a3b8" /><stop offset="1" stopColor="#1e293b" /></linearGradient>
                <filter id={`wave-glow-${id}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>

              <g>
                <circle cx="42" cy="145" r="27" fill={isRunning ? "#fef08a" : "#475569"} opacity=".95" filter={isRunning ? `url(#wave-glow-${id})` : undefined} />
                <MoveVertical x="27" y="130" width="30" height="30" color="#0f172a" />
                <text x="10" y="206" fill="#cbd5e1" fontSize="13">{t.source}</text>
              </g>

              <polyline points={inputPath} fill="none" stroke="#67e8f9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter={isRunning ? `url(#wave-glow-${id})` : undefined} className={isRunning ? "motion-safe:animate-pulse" : undefined} />
              <text x="170" y="238" textAnchor="middle" fill="#94a3b8" fontSize="12">{t.inputWave}</text>

              <g
                role="button"
                tabIndex={0}
                aria-label={t.rotateBarrier}
                onClick={() => setSlotAngle((current) => current >= 45 ? 0 : 90)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSlotAngle((current) => current >= 45 ? 0 : 90);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <rect x="350" y="37" width="60" height="216" rx="12" fill={`url(#barrier-${id})`} stroke="#cbd5e1" strokeWidth="3" />
                <rect x="372" y="91" width="16" height="108" rx="8" fill="#020617" transform={`rotate(${slotAngle} 380 145)`} />
                <circle cx="380" cy="145" r="77" fill="none" stroke="#67e8f9" strokeWidth="2" strokeDasharray="7 8" opacity=".35" />
                <path d="M424 80a74 74 0 0 1 20 65" fill="none" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
                <path d="m437 133 8 13 7-14" fill="none" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <text x="380" y="278" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="700">{t.barrier}</text>
              </g>

              <polyline
                data-testid="transmitted-wave"
                data-transmission={Math.round(transmission * 100)}
                points={outputPath}
                fill="none"
                stroke={status === "blocked" ? "#64748b" : "#f8fafc"}
                strokeWidth={3 + transmission * 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={status === "blocked" ? .4 : .35 + transmission * .65}
                filter={isRunning && status !== "blocked" ? `url(#wave-glow-${id})` : undefined}
                className={isRunning && status !== "blocked" ? "motion-safe:animate-pulse" : undefined}
              />
              <line x1="700" y1="90" x2="700" y2="200" stroke="#f8fafc" strokeWidth="7" strokeLinecap="round" />
              <text x="700" y="228" textAnchor="middle" fill="#94a3b8" fontSize="12">{t.fixedEnd}</text>
              <text x="555" y="238" textAnchor="middle" fill="#94a3b8" fontSize="12">{t.outputWave}</text>
            </svg>

            <button type="button" onClick={() => setIsRunning((current) => !current)} className={`mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${isRunning ? "border-amber-300/30 bg-amber-300/10 text-amber-200 hover:bg-amber-300/15" : "border-cyan-300/30 bg-cyan-300/10 text-cyan-200 hover:bg-cyan-300/15"}`}>
              {isRunning ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
              {isRunning ? t.stop : t.start}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">{t.slotAngle}</p><p className="mt-2 font-mono text-xl font-black text-physics">{slotAngle}°</p></div>
            <div className="rounded-2xl border border-border bg-background/70 p-4"><p className="text-xs font-bold text-muted-foreground">{t.amplitude}</p><p className="mt-2 font-mono text-xl font-black text-physics">{amplitude}</p></div>
            <div className="rounded-2xl border border-physics/25 bg-physics/5 p-4"><p className="text-xs font-bold text-muted-foreground">{t.transmission}</p><p className="mt-2 font-mono text-xl font-black text-physics">{Math.round(transmission * 100)}%</p></div>
          </div>

          <div className="rounded-2xl border border-physics/20 bg-physics/5 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.observation}</p>
            <h3 className="mt-2 text-lg font-black text-foreground">{isRunning ? statusLabel : t.paused}</h3>
            <p className="mt-2 text-sm font-medium leading-7 text-muted-foreground">{observation}</p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-5">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><CheckCircle2 className="size-5" aria-hidden="true" /></div>
              <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">{t.conclusion}</p><p className="mt-2 text-sm font-semibold leading-7 text-foreground">{t.conclusionText}</p><p className="mt-3 border-t border-border pt-3 text-sm leading-7 text-muted-foreground">{t.lightLink}</p></div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="flex items-center gap-2 text-base font-black text-foreground"><Wrench className="size-5 text-physics" aria-hidden="true" />{t.tools}</h3>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"><Waves className="size-5 shrink-0 text-cyan-500" aria-hidden="true" /><span className="text-sm font-bold text-foreground">{t.ropeTool}</span></div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"><CircleOff className="size-5 shrink-0 text-amber-500" aria-hidden="true" /><span className="text-sm font-bold text-foreground">{t.barrierTool}</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="text-base font-black text-foreground">{t.steps}</h3>
            <ol className="mt-4 space-y-3">
              {([1, 2, 3] as ExperimentStep[]).map((item) => (
                <li key={item} className={`flex gap-3 rounded-xl border p-3 transition ${step === item ? "border-physics/40 bg-physics/5" : "border-border bg-card"}`}>
                  <button type="button" onClick={() => applyStep(item)} aria-label={`${t.steps} ${item}`} className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${step === item ? "bg-physics text-white" : "bg-secondary text-muted-foreground"}`}>{item}</button>
                  <div><p className="text-sm font-black text-foreground">{t[`step${item}Title`]}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{t[`step${item}Text`]}</p></div>
                </li>
              ))}
            </ol>
            <button type="button" onClick={() => applyStep(step === 3 ? 1 : (step + 1) as ExperimentStep)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-extrabold text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics">
              {step === 3 ? t.repeat : t.nextStep}
              <ArrowRight className={`size-4 ${isRTL ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="text-base font-black text-foreground">{t.controls}</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSlotAngle(0)} aria-pressed={slotAngle === 0} className={`min-h-11 rounded-xl border px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${slotAngle === 0 ? "border-physics bg-physics text-white" : "border-border bg-card text-muted-foreground hover:border-physics/40"}`}>{t.parallelPreset}</button>
              <button type="button" onClick={() => setSlotAngle(90)} aria-pressed={slotAngle === 90} className={`min-h-11 rounded-xl border px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${slotAngle === 90 ? "border-physics bg-physics text-white" : "border-border bg-card text-muted-foreground hover:border-physics/40"}`}>{t.perpendicularPreset}</button>
            </div>
            <label className="mt-5 block"><span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.slotAngle}</span><strong className="font-mono text-physics">{slotAngle}°</strong></span><input type="range" min="0" max="90" value={slotAngle} onChange={(event) => setSlotAngle(Number(event.target.value))} className="mt-3 w-full accent-[hsl(var(--physics))]" /></label>
            <label className="mt-5 block"><span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground"><span>{t.amplitude}</span><strong className="font-mono text-physics">{amplitude}</strong></span><input type="range" min="12" max="52" value={amplitude} onChange={(event) => setAmplitude(Number(event.target.value))} className="mt-3 w-full accent-[hsl(var(--physics))]" /></label>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default MechanicalWavePolarizationActivity;
