import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Droplets, Power, RotateCcw, Sparkles, Waves, Wrench } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

const copy = {
  ar: {
    chapter: "الفصل الخامس · البصريات الفيزيائية",
    title: "تداخل الموجات في حوض الماء",
    subtitle: "شغّل مصدر الاهتزاز لتبدأ الموجات بالانتشار ويتكوّن نمط التداخل على سطح الماء.",
    reset: "إعادة النشاط",
    experiment: "حوض الموجات التفاعلي",
    run: "تشغيل مصدر الموجات",
    pause: "إيقاف مصدر الموجات",
    source: "مصدر الاهتزاز",
    sourceOn: "المصدر يعمل · الموجات تنتشر",
    sourceOff: "المصدر متوقف · سطح الماء ساكن",
    turnOnHint: "شغّل المصدر لمشاهدة نمط التداخل",
    phase: "فرق الطور بين المصدرين",
    wavelength: "الطول الموجي",
    constructive: "تداخل بنّاء",
    destructive: "تداخل هدّام",
    partial: "تداخل جزئي",
    amplitude: "سعة الموجة الناتجة",
    tools: "أدوات النشاط",
    toolsList: ["جهاز حوض الموجات", "هزاز بتردد 3 Hz", "قضيبان متصلان بنقطتين S₁ و S₂ تولّدان موجات كروية بالطول الموجي نفسه"],
    steps: "خطوات النشاط",
    stepsList: ["ضع مصدرَي الموجات S₁ و S₂ في الحوض.", "شغّل الهزاز لتنتشر الموجتان بالطول الموجي نفسه.", "انقل مجس القياس إلى مناطق مختلفة وقارن سعة الموجة الناتجة."],
    conclusion: "الاستنتاج",
    conclusionText: "من مشاهدة التداخل الحاصل للموجات عند سطح الماء يتضح أن هناك نوعين من التداخل.",
    constructiveText: "يحدث عندما تكون الموجتان في الطور نفسه؛ فتتحدان عند نقطة معينة لتقوّي كل منهما الأخرى، وتكون سعة الموجة الناتجة مساوية لضعف سعة أي من الموجتين الأصليتين.",
    destructiveText: "يحدث عندما تكون الموجتان بطورين متعاكسين وسعتين متساويتين؛ فتكون قمة موجة مع قعر الموجة الأخرى ويلغي تأثير إحداهما تأثير الأخرى، فتساوي سعة الموجة الناتجة صفرًا.",
  },
  en: {
    chapter: "Chapter 5 · Physical Optics",
    title: "Water-Wave Interference",
    subtitle: "Turn on the vibrator to generate waves and reveal the interference pattern across the water surface.",
    reset: "Reset activity",
    experiment: "Interactive ripple tank",
    run: "Turn wave source on",
    pause: "Turn wave source off",
    source: "Vibration source",
    sourceOn: "Source on · waves spreading",
    sourceOff: "Source off · water is still",
    turnOnHint: "Turn on the source to reveal the interference pattern",
    phase: "Phase difference between sources",
    wavelength: "Wavelength",
    constructive: "Constructive interference",
    destructive: "Destructive interference",
    partial: "Partial interference",
    amplitude: "Resultant amplitude",
    tools: "Activity tools",
    toolsList: ["Ripple tank", "3 Hz vibrator", "Two rods connected to point sources S₁ and S₂ producing circular waves of the same wavelength"],
    steps: "Activity steps",
    stepsList: ["Place wave sources S₁ and S₂ in the tank.", "Start the vibrator so both waves spread with the same wavelength.", "Move the probe to different regions and compare the resultant amplitude."],
    conclusion: "Conclusion",
    conclusionText: "Observing wave superposition on the water surface reveals two principal types of interference.",
    constructiveText: "When both waves arrive in phase, each reinforces the other and the resultant amplitude equals twice the amplitude of either original wave.",
    destructiveText: "When equal-amplitude waves arrive in opposite phase, a crest meets a trough and their effects cancel, making the resultant amplitude zero.",
  },
} as const;

const WaveInterferenceActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const prefersReducedMotion = useReducedMotion();
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [wavelength, setWavelength] = useState(44);

  const sources = useMemo(() => [{ x: 190, y: 118, label: "S₁" }, { x: 190, y: 222, label: "S₂" }], []);
  const phaseDifference = phase * Math.PI / 180;
  const normalizedAmplitude = running ? Math.abs(Math.cos(phaseDifference / 2)) : 0;
  const interference = normalizedAmplitude > .86 ? "constructive" : normalizedAmplitude < .18 ? "destructive" : "partial";

  const reset = () => { setRunning(false); setPhase(0); setWavelength(44); };

  const statusText = running ? t.sourceOn : t.sourceOff;
  const statusClass = running ? "text-cyan-200 border-cyan-300/30 bg-cyan-300/10" : "text-slate-300 border-slate-400/30 bg-slate-400/10";
  const interferenceText = interference === "constructive" ? t.constructive : interference === "destructive" ? t.destructive : t.partial;
  const interferenceClass = interference === "constructive" ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" : interference === "destructive" ? "text-rose-300 border-rose-400/30 bg-rose-400/10" : "text-amber-300 border-amber-400/30 bg-amber-400/10";

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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-base font-bold sm:text-lg"><Droplets className="size-5 text-cyan-300" />{t.experiment}</h3><div className="flex flex-wrap items-center gap-2"><span aria-live="polite" className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}>{statusText}</span>{running ? <span className={`rounded-full border px-3 py-1 text-xs font-bold ${interferenceClass}`}>{interferenceText}</span> : null}</div></div>
            <svg viewBox="0 0 720 340" className="h-auto w-full" role="img" aria-label={t.experiment}>
              <defs><radialGradient id="water" cx="50%" cy="45%"><stop offset="0" stopColor="#164e63" /><stop offset="1" stopColor="#082f49" /></radialGradient></defs>
              <rect x="20" y="20" width="680" height="300" rx="24" fill="url(#water)" stroke="#38bdf8" strokeOpacity=".4" strokeWidth="3" />
              <g aria-label={t.source}>
                <path d="M112 170H150M150 170V118H177M150 170V222H177" fill="none" stroke={running ? "#fef08a" : "#64748b"} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="92" cy="170" r="30" fill={running ? "#facc15" : "#1e293b"} stroke={running ? "#fef08a" : "#64748b"} strokeWidth="4" />
                <Power x="78" y="156" width="28" height="28" color={running ? "#422006" : "#94a3b8"} />
                {running && !prefersReducedMotion ? <motion.circle cx="92" cy="170" r="31" fill="none" stroke="#fef08a" strokeWidth="3" initial={{ opacity: .65, r: 31 }} animate={{ opacity: [0.65, 0], r: [31, 45] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }} /> : null}
              </g>
              {sources.map((source, sourceIndex) => (
                <g key={source.label}>
                  {running && (prefersReducedMotion
                    ? Array.from({ length: 8 }, (_, index) => <circle data-testid="wave-pattern" key={index} cx={source.x} cy={source.y} r={22 + index * wavelength * .6} fill="none" stroke={sourceIndex === 0 ? "#67e8f9" : "#a5b4fc"} strokeWidth="2" strokeOpacity={Math.max(.12, .72 - index * .08)} />)
                    : Array.from({ length: 8 }, (_, index) => (
                        <motion.circle
                          data-testid="wave-pattern"
                          key={index}
                          cx={source.x}
                          cy={source.y}
                          fill="none"
                          stroke={sourceIndex === 0 ? "#67e8f9" : "#a5b4fc"}
                          strokeWidth="2"
                          initial={{ r: 14, opacity: 0 }}
                          animate={{ r: [14, 14 + wavelength * 5.4], opacity: [0, .78, .38, 0] }}
                          transition={{ duration: 3.2, delay: index * .4 + (sourceIndex === 1 ? phase / 360 : 0), repeat: Infinity, ease: "linear" }}
                        />
                      )))}
                  <circle cx={source.x} cy={source.y} r="13" fill={running ? (sourceIndex === 0 ? "#22d3ee" : "#818cf8") : "#475569"} stroke={running ? "#e0f2fe" : "#64748b"} strokeWidth="2" />
                  <text x={source.x} y={source.y + 5} textAnchor="middle" fill={running ? "#020617" : "#cbd5e1"} fontWeight="900" fontSize="14">{source.label}</text>
                </g>
              ))}
              {!running ? <g pointerEvents="none"><rect x="270" y="128" width="360" height="84" rx="20" fill="#020617" fillOpacity=".78" stroke="#64748b" strokeOpacity=".55" /><text x="450" y="178" textAnchor="middle" fill="#e2e8f0" fontSize="17" fontWeight="700">{t.turnOnHint}</text></g> : null}
            </svg>
          </div>

          <button type="button" aria-pressed={running} onClick={() => setRunning((value) => !value)} className={`group flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border px-5 text-start transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics focus-visible:ring-offset-2 ${running ? "border-amber-300/45 bg-amber-300/10 text-foreground shadow-[0_14px_35px_-24px_rgba(250,204,21,.8)]" : "border-border bg-background text-foreground hover:border-physics/50 hover:bg-physics/5"}`}><span className="flex items-center gap-3"><span className={`grid size-11 place-items-center rounded-full transition ${running ? "bg-amber-300 text-amber-950" : "bg-muted text-muted-foreground group-hover:bg-physics group-hover:text-physics-foreground"}`}><Power className="size-5" /></span><span><span className="block text-xs font-bold text-muted-foreground">{t.source}</span><span className="mt-0.5 block font-black">{running ? t.pause : t.run}</span></span></span><span className={`rounded-full px-3 py-1 text-xs font-black ${running ? "bg-amber-300 text-amber-950" : "bg-muted text-muted-foreground"}`}>{running ? "ON" : "OFF"}</span></button>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-border bg-background/70 p-4"><span className="mb-3 flex justify-between gap-3 text-sm font-bold"><span>{t.phase}</span><output>{phase}°</output></span><input aria-label={t.phase} type="range" min="0" max="180" step="15" value={phase} onChange={(event) => setPhase(Number(event.target.value))} className="w-full accent-[hsl(var(--physics))]" /></label>
            <label className="rounded-2xl border border-border bg-background/70 p-4"><span className="mb-3 flex justify-between gap-3 text-sm font-bold"><span>{t.wavelength}</span><output>{wavelength} px</output></span><input aria-label={t.wavelength} type="range" min="30" max="70" step="2" value={wavelength} onChange={(event) => setWavelength(Number(event.target.value))} className="w-full accent-[hsl(var(--physics))]" /></label>
          </div>
          <div className="rounded-2xl border border-border bg-background/70 p-4"><div className="mb-2 flex items-center justify-between text-sm font-bold"><span>{t.amplitude}</span><span>{Math.round(normalizedAmplitude * 200)}%</span></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-300" style={{ width: `${normalizedAmplitude * 100}%` }} /></div></div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-background/65 p-5"><h3 className="mb-3 flex items-center gap-2 text-lg font-black"><Wrench className="size-5 text-physics" />{t.tools}</h3><ul className="space-y-2 text-sm leading-6 text-muted-foreground">{t.toolsList.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-physics" />{item}</li>)}</ul></div>
          <div className="rounded-2xl border border-border bg-background/65 p-5"><h3 className="mb-3 flex items-center gap-2 text-lg font-black"><Waves className="size-5 text-physics" />{t.steps}</h3><ol className="space-y-3 text-sm leading-6 text-muted-foreground">{t.stepsList.map((item, index) => <li key={item} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-physics/10 text-xs font-black text-physics">{index + 1}</span>{item}</li>)}</ol></div>
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5"><h3 className="mb-2 flex items-center gap-2 font-black"><CheckCircle2 className="size-5 text-emerald-500" />{t.conclusion}</h3><p className="mb-3 text-sm leading-7 text-muted-foreground">{t.conclusionText}</p><p className="text-sm leading-7 text-muted-foreground"><strong className="text-foreground">{t.constructive}: </strong>{t.constructiveText}</p><p className="mt-2 text-sm leading-7 text-muted-foreground"><strong className="text-foreground">{t.destructive}: </strong>{t.destructiveText}</p></div>
        </aside>
      </div>
    </section>
  );
};

export default WaveInterferenceActivity;
