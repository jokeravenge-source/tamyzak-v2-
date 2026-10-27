import { useEffect, useRef, useState } from "react";
import {
  Gauge,
  Lightbulb,
  ListChecks,
  Magnet,
  Play,
  RotateCcw,
  Wrench,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

const copy = {
  ar: {
    chapter: "الفصل الثاني · الحث الكهرومغناطيسي",
    title: "تقليل تأثير التيارات الدوامة المتولدة في الموصلات",
    subtitle:
      "حرّر البندولين معًا، وقارن حركة الصفيحة الكاملة بحركة الصفيحة المقطعة إلى شرائح معزولة بين قطبي المغناطيس.",
    reset: "إعادة النشاط",
    release: "حرّر البندولين",
    replay: "أعد الحركة",
    simulator: "المقارنة التفاعلية",
    prompt: "ابدأ من الزاوية نفسها ثم راقب أي بندول يستقر أولًا.",
    ready: "البندولان جاهزان من الموضع نفسه",
    moving: "البندولان يتأرجحان داخل المجال المغناطيسي",
    finished: "الصفيحة الكاملة استقرت أولًا، والمقطعة استمرت بالحركة مدة أطول",
    solid: "صفيحة كاملة (غير مقطعة)",
    slotted: "صفيحة مقطعة إلى شرائح",
    strongDamping: "تخميد كبير",
    weakDamping: "تخميد أقل",
    field: "منطقة المجال المغناطيسي",
    north: "N",
    south: "S",
    toolsTitle: "أدوات النشاط",
    tools: [
      "بندولان متماثلان يحمل كل منهما صفيحة موصلة ضعيفة التمغنط، مثل الألمنيوم",
      "صفيحة كاملة غير مقطعة",
      "صفيحة مقطعة إلى شرائح معزولة عن بعضها",
      "مغناطيس دائم قوي وحامل",
    ],
    stepsTitle: "خطوات النشاط",
    steps: [
      "أزح الصفيحتين بمقدار متساوٍ إلى أحد جانبي موضع استقرارهما.",
      "اترك الصفيحتين في آن واحد للتأرجح متجهتين نحو قطبي المغناطيس.",
      "قارن زمن استقرار الصفيحة الكاملة بزمن استقرار الصفيحة المقطعة إلى شرائح.",
    ],
    observationTitle: "المشاهدة",
    observation:
      "تتباطأ حركة البندول ذي الصفيحة الكاملة ويستقر قبل البندول ذي الصفيحة المقطعة إلى شرائح معزولة.",
    conclusionTitle: "نستنتج من النشاط",
    conclusion:
      "تتولد تيارات دوامة كبيرة المقدار في الصفيحة غير المقطعة أثناء دخولها المجال المغناطيسي بين القطبين نتيجة تغير الفيض المغناطيسي الذي يخترق الموصل وفق قانون فاراداي. يكون اتجاهها وفق قانون لنز فتعيق حركة الصفيحة. أما تقطيع الصفيحة إلى شرائح معزولة فيقلل مقدار التيارات الدوامة وتأثيرها.",
  },
  en: {
    chapter: "Chapter 2 · Electromagnetic Induction",
    title: "Reducing the Effect of Eddy Currents in Conductors",
    subtitle:
      "Release both pendulums together and compare a solid plate with a plate divided into insulated strips as they pass between the magnet poles.",
    reset: "Reset activity",
    release: "Release both pendulums",
    replay: "Replay motion",
    simulator: "Interactive comparison",
    prompt: "Start both at the same angle, then observe which pendulum settles first.",
    ready: "Both pendulums are ready at the same position",
    moving: "Both pendulums are swinging through the magnetic field",
    finished: "The solid plate settled first while the slotted plate kept moving longer",
    solid: "Solid plate (not divided)",
    slotted: "Plate divided into strips",
    strongDamping: "Greater damping",
    weakDamping: "Less damping",
    field: "Magnetic-field region",
    north: "N",
    south: "S",
    toolsTitle: "Activity tools",
    tools: [
      "Two identical pendulums, each carrying a weakly magnetic conducting plate such as aluminium",
      "One solid, undivided plate",
      "One plate divided into insulated strips",
      "A strong permanent magnet and a stand",
    ],
    stepsTitle: "Activity steps",
    steps: [
      "Displace both plates equally to one side of their equilibrium positions.",
      "Release both plates at the same time so that they swing toward the magnet poles.",
      "Compare the settling time of the solid plate with that of the plate divided into strips.",
    ],
    observationTitle: "Observation",
    observation:
      "The pendulum carrying the solid plate slows and settles before the pendulum carrying the plate divided into insulated strips.",
    conclusionTitle: "Conclusion",
    conclusion:
      "Large eddy currents are generated in the solid plate as it enters the magnetic field between the poles because the magnetic flux through the conductor changes, according to Faraday's law. Their direction follows Lenz's law, so they oppose the plate's motion. Dividing the plate into insulated strips reduces the eddy currents and their effect.",
  },
} as const;

type MotionState = "ready" | "moving" | "finished";

const EddyCurrentPendulumActivity = ({ language }: { language: AppLanguage }) => {
  const t = copy[language];
  const isRTL = language === "ar";
  const [motion, setMotion] = useState<MotionState>("ready");
  const [runKey, setRunKey] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const release = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setRunKey((value) => value + 1);
    setMotion("moving");
    timer.current = window.setTimeout(() => setMotion("finished"), 6200);
  };

  const reset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setMotion("ready");
    setRunKey((value) => value + 1);
  };

  const status = motion === "ready" ? t.ready : motion === "moving" ? t.moving : t.finished;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}
    >
      <style>{`
        @keyframes eddy-solid-swing {
          0% { transform: rotate(-31deg); }
          18% { transform: rotate(18deg); }
          38% { transform: rotate(-9deg); }
          58% { transform: rotate(4deg); }
          78%, 100% { transform: rotate(0deg); }
        }
        @keyframes eddy-slotted-swing {
          0% { transform: rotate(-31deg); }
          14% { transform: rotate(25deg); }
          29% { transform: rotate(-20deg); }
          44% { transform: rotate(15deg); }
          59% { transform: rotate(-10deg); }
          73% { transform: rotate(7deg); }
          86% { transform: rotate(-3deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes eddy-current-pulse {
          0%, 100% { opacity: .12; transform: scale(.88); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        .eddy-solid-moving { animation: eddy-solid-swing 4.4s cubic-bezier(.22,.75,.18,1) forwards; }
        .eddy-slotted-moving { animation: eddy-slotted-swing 6.1s cubic-bezier(.22,.68,.22,1) forwards; }
        .eddy-current-pulse { animation: eddy-current-pulse .75s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .eddy-solid-moving, .eddy-slotted-moving, .eddy-current-pulse { animation-duration: .01ms; animation-iteration-count: 1; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_82%_0%,hsl(var(--physics)/.2),transparent_58%)]" />

      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-physics">
            <Magnet className="size-4" aria-hidden="true" />
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
                  <Gauge className="size-5 text-cyan-400" aria-hidden="true" />
                  {t.simulator}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">{t.prompt}</p>
              </div>
              <button
                type="button"
                onClick={release}
                className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-4 text-xs font-black text-cyan-200 transition hover:bg-cyan-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <Play className="size-4" aria-hidden="true" />
                {motion === "ready" ? t.release : t.replay}
              </button>
            </div>

            <svg viewBox="0 0 900 500" className="h-auto w-full" role="img" aria-label={t.simulator}>
              <path d="M96 70H804" stroke="#64748b" strokeWidth="18" strokeLinecap="round" />
              <path d="M146 72V445M754 72V445" stroke="#334155" strokeWidth="13" strokeLinecap="round" />
              <path d="M105 445H187M713 445H795" stroke="#475569" strokeWidth="18" strokeLinecap="round" />

              <g>
                <rect x="232" y="348" width="70" height="104" rx="10" fill="#2563eb" />
                <rect x="322" y="348" width="70" height="104" rx="10" fill="#dc2626" />
                <text x="267" y="410" fill="#fff" textAnchor="middle" fontSize="28" fontWeight="900">{t.north}</text>
                <text x="357" y="410" fill="#fff" textAnchor="middle" fontSize="28" fontWeight="900">{t.south}</text>
                <path d="M304 370h17M304 395h17M304 420h17" stroke="#a78bfa" strokeWidth="5" strokeDasharray="4 5" />
                <text x="312" y="477" fill="#94a3b8" textAnchor="middle" fontSize="15">{t.field}</text>
              </g>

              <g>
                <rect x="508" y="348" width="70" height="104" rx="10" fill="#2563eb" />
                <rect x="598" y="348" width="70" height="104" rx="10" fill="#dc2626" />
                <text x="543" y="410" fill="#fff" textAnchor="middle" fontSize="28" fontWeight="900">{t.north}</text>
                <text x="633" y="410" fill="#fff" textAnchor="middle" fontSize="28" fontWeight="900">{t.south}</text>
                <path d="M580 370h17M580 395h17M580 420h17" stroke="#a78bfa" strokeWidth="5" strokeDasharray="4 5" />
                <text x="588" y="477" fill="#94a3b8" textAnchor="middle" fontSize="15">{t.field}</text>
              </g>

              <g
                key={`solid-${runKey}`}
                data-testid="solid-pendulum"
                data-damping="greater"
                className={motion === "moving" ? "eddy-solid-moving" : ""}
                style={{ transform: motion === "ready" ? "rotate(-31deg)" : motion === "finished" ? "rotate(0deg)" : undefined, transformOrigin: "312px 88px" }}
              >
                <circle cx="312" cy="88" r="12" fill="#e2e8f0" />
                <line x1="312" y1="88" x2="312" y2="305" stroke="#cbd5e1" strokeWidth="7" />
                <rect x="252" y="288" width="120" height="105" rx="10" fill="#f59e0b" stroke="#fde68a" strokeWidth="5" />
                {motion === "moving" && (
                  <g className="eddy-current-pulse">
                    <path d="M275 335c10-27 63-27 74 0-11 27-64 27-74 0z" fill="none" stroke="#fde047" strokeWidth="7" />
                    <path d="M335 316l17 17-20 10" fill="none" stroke="#fde047" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                )}
              </g>

              <g
                key={`slotted-${runKey}`}
                data-testid="slotted-pendulum"
                data-damping="less"
                className={motion === "moving" ? "eddy-slotted-moving" : ""}
                style={{ transform: motion === "ready" ? "rotate(-31deg)" : motion === "finished" ? "rotate(0deg)" : undefined, transformOrigin: "588px 88px" }}
              >
                <circle cx="588" cy="88" r="12" fill="#e2e8f0" />
                <line x1="588" y1="88" x2="588" y2="305" stroke="#cbd5e1" strokeWidth="7" />
                {[0, 1, 2, 3, 4].map((index) => (
                  <rect key={index} x={530 + index * 25} y="288" width="17" height="105" rx="4" fill="#38bdf8" stroke="#bae6fd" strokeWidth="3" />
                ))}
              </g>

              <g>
                <rect x="205" y="115" width="214" height="38" rx="19" fill="#172554" stroke="#60a5fa" strokeWidth="2" />
                <text x="312" y="140" fill="#dbeafe" textAnchor="middle" fontSize="16" fontWeight="800">{t.solid}</text>
                <rect x="481" y="115" width="214" height="38" rx="19" fill="#082f49" stroke="#22d3ee" strokeWidth="2" />
                <text x="588" y="140" fill="#cffafe" textAnchor="middle" fontSize="16" fontWeight="800">{t.slotted}</text>
              </g>
            </svg>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[.04] p-3">
              <div className="flex items-start gap-3">
                <span className={`mt-1 size-3 shrink-0 rounded-full ${motion === "moving" ? "bg-cyan-300 shadow-[0_0_16px_#67e8f9]" : motion === "finished" ? "bg-emerald-400" : "bg-slate-600"}`} />
                <p className="text-sm font-extrabold leading-6 text-white" aria-live="polite">{status}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold">
                <span className="rounded-lg bg-amber-400/10 px-2 py-2 text-amber-200">{t.solid}: {t.strongDamping}</span>
                <span className="rounded-lg bg-cyan-400/10 px-2 py-2 text-cyan-200">{t.slotted}: {t.weakDamping}</span>
              </div>
            </div>
          </div>

          <section className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5">
            <h3 className="text-lg font-black text-foreground">{t.observationTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{t.observation}</p>
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

      <section className="relative mx-5 mb-5 rounded-2xl border border-physics/30 bg-physics/10 p-5 sm:mx-8 sm:mb-8 sm:p-6">
        <h3 className="flex items-center gap-2 text-lg font-black text-foreground sm:text-xl">
          <Lightbulb className="size-5 text-physics" aria-hidden="true" />
          {t.conclusionTitle}
        </h3>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-muted-foreground sm:text-base">{t.conclusion}</p>
      </section>
    </section>
  );
};

export default EddyCurrentPendulumActivity;
