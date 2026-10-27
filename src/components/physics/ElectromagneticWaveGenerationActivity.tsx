import { useEffect, useId, useState } from "react";
import { ArrowLeftRight, CheckCircle2, Pause, Play, Radio, RotateCcw, Sparkles, Zap } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

const copy = {
  ar: {
    chapter: "الفصل الرابع · الموجات الكهرومغناطيسية",
    title: "كيف تتولد الموجات الكهرومغناطيسية؟",
    subtitle: "حرّك الشحنة الكهربائية وبدّل اتجاه حركتها، ثم تتبّع كيف يولّد المجال الكهربائي المتغير مجالًا مغناطيسيًا متغيرًا ينتشر في الفضاء.",
    reset: "إعادة النشاط",
    experiment: "مولّد الموجة التفاعلي",
    start: "تشغيل الاهتزاز",
    stop: "إيقاف الاهتزاز",
    reverse: "عكس اتجاه الحركة",
    frequency: "تردد اهتزاز الشحنة",
    slow: "بطيء",
    fast: "سريع",
    charge: "شحنة كهربائية",
    electric: "المجال الكهربائي E",
    magnetic: "المجال المغناطيسي B",
    direction: "اتجاه الانتشار",
    stagesTitle: "مراحل توليد الموجة",
    stages: [
      "عند ربط قطبي المذبذب بطرفي السلك تتذبذب الشحنات الكهربائية فيه، ويتولد حول السلك مجال كهربائي متغير.",
      "عندما تقل سرعة الشحنة المتحركة يتقلص المجال الكهربائي وتتحرر بعض خطوطه بعيدًا عن السلك.",
      "عند انعكاس اتجاه حركة الشحنات يتولد مجال كهربائي جديد معاكس، بينما تنتشر الخطوط المتحررة في الفضاء.",
      "المجال الكهربائي المتغير يولّد مجالًا مغناطيسيًا متغيرًا متعامدًا معه؛ ويستمر المجالان في توليد أحدهما الآخر والانتشار كموجة كهرومغناطيسية.",
    ],
    currentStage: "المرحلة الحالية",
    conclusionTitle: "الاستنتاج",
    conclusion: "التغيرات التي تطرأ على المجالين الكهربائي والمغناطيسي تكون حلقات مغلقة لخطوط القوة الكهربائية والمغناطيسية في مستويات متعامدة، تنتشر بعيدًا عن ثنائي القطب على شكل موجات كهرومغناطيسية.",
  },
  en: {
    chapter: "Chapter 4 · Electromagnetic Waves",
    title: "How are electromagnetic waves generated?",
    subtitle: "Oscillate the electric charge, reverse its motion, and trace how a changing electric field creates a changing magnetic field that travels through space.",
    reset: "Reset activity",
    experiment: "Interactive wave generator",
    start: "Start oscillation",
    stop: "Stop oscillation",
    reverse: "Reverse motion",
    frequency: "Charge oscillation frequency",
    slow: "Slow",
    fast: "Fast",
    charge: "Electric charge",
    electric: "Electric field E",
    magnetic: "Magnetic field B",
    direction: "Propagation direction",
    stagesTitle: "Wave-generation stages",
    stages: [
      "Connecting the oscillator to the wire makes electric charges oscillate, producing a changing electric field around the wire.",
      "As the moving charge slows down, the electric field contracts and some field lines detach from the wire.",
      "When charge motion reverses, an oppositely directed electric field forms while the detached lines move outward through space.",
      "The changing electric field creates a perpendicular changing magnetic field; both fields sustain one another and propagate as an electromagnetic wave.",
    ],
    currentStage: "Current stage",
    conclusionTitle: "Conclusion",
    conclusion: "Changes in the electric and magnetic fields form closed field-line loops in perpendicular planes and propagate away from the dipole as electromagnetic waves.",
  },
} as const;

const ElectromagneticWaveGenerationActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const glowId = useId().replace(/:/g, "");
  const [running, setRunning] = useState(true);
  const [frequency, setFrequency] = useState(2);
  const [stage, setStage] = useState(0);
  const [reversed, setReversed] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setStage((value) => (value + 1) % 4), 1100 / frequency);
    return () => window.clearInterval(timer);
  }, [frequency, running]);

  const reset = () => {
    setRunning(true);
    setFrequency(2);
    setStage(0);
    setReversed(false);
  };

  const phase = (stage / 4) * Math.PI * 2 + (reversed ? Math.PI : 0);
  const chargeY = 170 + Math.sin(phase) * 82;
  const wavePath = (offset: number, amplitude: number) => {
    const points = Array.from({ length: 33 }, (_, index) => {
      const x = 320 + index * 12;
      const y = 170 + Math.sin(index * 0.7 - phase + offset) * amplitude;
      return `${x},${y}`;
    });
    return `M${points.join(" L")}`;
  };

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_18%_0%,hsl(var(--physics)/.2),transparent_58%)]" />
      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-physics"><Sparkles className="size-4" />{t.chapter}</p>
          <h2 className="text-balance text-2xl font-black leading-tight text-foreground sm:text-4xl">{t.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{t.subtitle}</p>
        </div>
        <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold transition hover:border-physics/50 hover:bg-physics/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics"><RotateCcw className="size-4" />{t.reset}</button>
      </header>

      <div className="relative grid gap-6 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)]">
        <div className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-2xl sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg"><Radio className="size-5 text-cyan-300" />{t.experiment}</h3>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">{t.currentStage} {stage + 1}/4</span>
            </div>
            <svg viewBox="0 0 720 340" className="h-auto w-full" role="img" aria-label={t.experiment}>
              <defs><filter id={`em-glow-${glowId}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
              <line x1="210" y1="55" x2="210" y2="285" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              <circle cx="210" cy={chargeY} r="15" fill="#fbbf24" filter={`url(#em-glow-${glowId})`} />
              <text x="210" y={chargeY + 5} textAnchor="middle" fontWeight="900" fontSize="18" fill="#0f172a">−</text>
              {[36, 62, 88].map((radius, index) => <ellipse key={radius} cx="210" cy={chargeY} rx={radius} ry={radius * .42} fill="none" stroke="#38bdf8" strokeWidth={index === 0 ? 4 : 2.5} opacity={running ? .85 - index * .16 : .25} />)}
              <path d={wavePath(0, 54)} fill="none" stroke="#38bdf8" strokeWidth="5" opacity={running ? 1 : .25} />
              <path d={wavePath(Math.PI / 2, 35)} fill="none" stroke="#f472b6" strokeWidth="5" strokeDasharray="9 7" opacity={running ? .95 : .25} />
              <path d="M325 300H676" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
              <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#94a3b8" /></marker></defs>
              <text x="500" y="325" textAnchor="middle" fill="#cbd5e1" fontSize="15">{t.direction}</text>
              <text x="470" y="92" fill="#7dd3fc" fontWeight="800" fontSize="15">{t.electric}</text>
              <text x="515" y="225" fill="#f9a8d4" fontWeight="800" fontSize="15">{t.magnetic}</text>
            </svg>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setRunning((value) => !value)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-physics px-4 font-black text-physics-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics">{running ? <Pause className="size-5" /> : <Play className="size-5" />}{running ? t.stop : t.start}</button>
            <button type="button" onClick={() => { setReversed((value) => !value); setStage((value) => (value + 2) % 4); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 font-black transition hover:border-physics/50 hover:bg-physics/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics"><ArrowLeftRight className="size-5 text-physics" />{t.reverse}</button>
          </div>
          <label className="block rounded-2xl border border-border bg-background/70 p-4">
            <span className="mb-3 flex items-center justify-between gap-3 text-sm font-bold"><span className="flex items-center gap-2"><Zap className="size-4 text-physics" />{t.frequency}</span><output>{frequency.toFixed(1)} Hz</output></span>
            <input aria-label={t.frequency} type="range" min="0.5" max="4" step="0.5" value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} className="w-full accent-[hsl(var(--physics))]" />
            <span className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{t.slow}</span><span>{t.fast}</span></span>
          </label>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-background/65 p-5">
            <h3 className="mb-4 text-lg font-black text-foreground">{t.stagesTitle}</h3>
            <div className="space-y-3">{t.stages.map((text, index) => <button key={text} type="button" onClick={() => { setRunning(false); setStage(index); }} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-start text-sm leading-6 transition ${stage === index ? "border-physics/50 bg-physics/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-physics/30"}`}><span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${stage === index ? "bg-physics text-physics-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span><span>{text}</span></button>)}</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-black text-foreground"><CheckCircle2 className="size-5 text-emerald-500" />{t.conclusionTitle}</h3>
            <p className="text-sm leading-7 text-muted-foreground">{t.conclusion}</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ElectromagneticWaveGenerationActivity;
