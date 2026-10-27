import { useMemo, useState } from "react";
import {
  Eye,
  FlaskConical,
  Lightbulb,
  Power,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

type SpectrumMode = "continuous" | "emission" | "absorption";
type Gas = "hydrogen" | "sodium" | "mercury";

const spectrumLines: Record<Gas, { position: number; color: string; width?: number }[]> = {
  hydrogen: [
    { position: 17, color: "#6d46ff" },
    { position: 24, color: "#7457ff" },
    { position: 43, color: "#22d3ee" },
    { position: 82, color: "#ff3b30", width: 4 },
  ],
  sodium: [
    { position: 66.5, color: "#ffd60a", width: 4 },
    { position: 68.5, color: "#ffb703", width: 3 },
  ],
  mercury: [
    { position: 15, color: "#7c3cff" },
    { position: 31, color: "#2684ff", width: 3 },
    { position: 57, color: "#2ee66b", width: 4 },
    { position: 72, color: "#ffe14a", width: 3 },
    { position: 76, color: "#ffb000" },
  ],
};

const copy = {
  ar: {
    eyebrow: "نشاط بصري تفاعلي",
    title: "بيّن بوضوح أنواع الأطياف",
    subtitle: "شغّل المصدر، وغيّر مادته وزاوية الموشور، ثم راقب كيف تتبدّل بصمة الطيف على الشاشة.",
    source: "1. اختر مصدر الضوء",
    continuous: "مصباح اعتيادي",
    emission: "أنبوب غاز متوهّج",
    absorption: "مصباح يمر عبر غاز بارد",
    material: "2. اختر مادة المصدر",
    hydrogen: "الهيدروجين",
    sodium: "الصوديوم",
    mercury: "الزئبق",
    angle: "3. غيّر زاوية الموشور",
    angleHint: "حرّك المؤشر لتغيير مقدار انتشار الضوء على الشاشة.",
    reset: "إعادة التجربة",
    apparatus: "مسار التجربة",
    powerOn: "المصدر يعمل",
    powerOff: "المصدر متوقف",
    turnOn: "تشغيل المصدر",
    turnOff: "إطفاء المصدر",
    sourceLabel: "المصدر",
    slit: "الشق",
    prism: "الموشور",
    screen: "الشاشة",
    result: "المشاهدة",
    offName: "التجربة متوقفة",
    offResult: "شغّل المصدر لمشاهدة الضوء بعد مروره في الموشور وظهور طيف المادة على الشاشة.",
    screenOff: "لا يوجد ضوء",
    continuousResult: "شريط متصل من الألوان، من البنفسجي إلى الأحمر، من دون فجوات.",
    emissionResult: "خطوط مضيئة منفصلة على خلفية معتمة؛ مواقعها تميّز الغاز المستخدم.",
    absorptionResult: "طيف متصل تتخلله خطوط معتمة عند الأطوال الموجية التي امتصها الغاز.",
    continuousName: "الطيف المستمر",
    emissionName: "طيف الانبعاث الخطي",
    absorptionName: "طيف الامتصاص الخطي",
    conclusion: "الاستنتاج",
    conclusionText: "يختلف الطيف باختلاف مصدر الضوء ونوع الغاز؛ لذلك يُستعمل نمط الخطوط كعلامة مميزة للعناصر.",
  },
  en: {
    eyebrow: "Interactive optics activity",
    title: "Explore the Types of Spectra",
    subtitle: "Turn on the source, change its material and the prism angle, then watch the spectral fingerprint change on the screen.",
    source: "1. Choose the light source",
    continuous: "Ordinary lamp",
    emission: "Glowing gas tube",
    absorption: "Lamp through cool gas",
    material: "2. Choose the source material",
    hydrogen: "Hydrogen",
    sodium: "Sodium",
    mercury: "Mercury",
    angle: "3. Change the prism angle",
    angleHint: "Move the slider to change how widely the light spreads on the screen.",
    reset: "Reset experiment",
    apparatus: "Experiment path",
    powerOn: "Source on",
    powerOff: "Source off",
    turnOn: "Turn source on",
    turnOff: "Turn source off",
    sourceLabel: "Source",
    slit: "Slit",
    prism: "Prism",
    screen: "Screen",
    result: "Observation",
    offName: "Experiment paused",
    offResult: "Turn on the source to send light through the prism and reveal the material's spectrum on the screen.",
    screenOff: "No light",
    continuousResult: "An unbroken band of color from violet to red, with no gaps.",
    emissionResult: "Separate bright lines on a dark background; their positions identify the gas.",
    absorptionResult: "A continuous spectrum crossed by dark lines at wavelengths absorbed by the gas.",
    continuousName: "Continuous spectrum",
    emissionName: "Line emission spectrum",
    absorptionName: "Line absorption spectrum",
    conclusion: "Conclusion",
    conclusionText: "A spectrum changes with the light source and gas. Its line pattern can therefore identify an element.",
  },
} as const;

const modes: SpectrumMode[] = ["continuous", "emission", "absorption"];
const gases: Gas[] = ["hydrogen", "sodium", "mercury"];

const SpectrumDisplay = ({
  mode,
  gas,
  isOn,
  offLabel,
  screenLabel,
}: {
  mode: SpectrumMode;
  gas: Gas;
  isOn: boolean;
  offLabel: string;
  screenLabel: string;
}) => {
  const lines = spectrumLines[gas];
  const isContinuous = mode !== "emission";

  return (
    <div
      className={`relative h-28 overflow-hidden rounded-xl border transition-all duration-500 sm:h-36 ${
        isOn
          ? "border-white/15 shadow-[inset_0_0_24px_rgba(255,255,255,.08),0_0_24px_rgba(56,189,248,.08)]"
          : "border-slate-700/60 shadow-[inset_0_0_24px_rgba(0,0,0,.55)]"
      } ${
        isOn && isContinuous
          ? "bg-[linear-gradient(90deg,#5316a8_0%,#3348d9_15%,#00a8f3_31%,#10b866_48%,#f0de28_64%,#f79a1d_78%,#e92727_100%)]"
          : "bg-[#02050c]"
      }`}
      aria-live="polite"
      aria-label={isOn ? screenLabel : offLabel}
      data-testid="spectrum-screen"
      data-material={gas}
      data-powered={isOn ? "on" : "off"}
    >
      {isOn && mode !== "continuous" &&
        lines.map((line, index) => (
          <span
            key={`${gas}-${index}`}
            data-testid="spectrum-line"
            className={`absolute inset-y-0 ${mode === "emission" ? "opacity-100 shadow-[0_0_12px_currentColor]" : "bg-slate-950/90"}`}
            style={{
              left: `${line.position}%`,
              width: line.width ?? 2,
              backgroundColor: mode === "emission" ? line.color : undefined,
              color: line.color,
            }}
          />
        ))}
      {isOn ? (
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_15%,rgba(255,255,255,.18)_40%,transparent_58%)]" />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
          {offLabel}
        </span>
      )}
    </div>
  );
};

const SpectrumTypesActivity = ({ language }: { language: AppLanguage }) => {
  const isRTL = language === "ar";
  const t = copy[language];
  const [mode, setMode] = useState<SpectrumMode>("emission");
  const [gas, setGas] = useState<Gas>("hydrogen");
  const [isOn, setIsOn] = useState(true);
  const [angle, setAngle] = useState(38);

  const modeName = isOn ? t[`${mode}Name`] : t.offName;
  const observation = isOn ? t[`${mode}Result`] : t.offResult;
  const spread = useMemo(() => 46 + (angle - 20) * 0.9, [angle]);

  const chooseMode = (nextMode: SpectrumMode) => {
    setMode(nextMode);
  };

  const reset = () => {
    setMode("emission");
    setGas("hydrogen");
    setIsOn(true);
    setAngle(38);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative overflow-hidden rounded-[28px] border border-physics/25 bg-card shadow-[0_28px_90px_-42px_hsl(var(--physics)/0.55)] ${isRTL ? "font-body-ar" : "font-body"}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_0%,hsl(var(--physics)/.18),transparent_55%)]" />

      <header className="relative flex flex-col gap-5 border-b border-physics/15 px-5 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-physics">
            <Sparkles className="size-4" aria-hidden="true" />
            {t.eyebrow}
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

      <div className="relative grid gap-6 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,.65fr)]">
        <div className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                <Eye className="size-5 text-sky-400" aria-hidden="true" />
                {t.apparatus}
              </h3>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-300">{angle}°</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOn((current) => !current);
                  }}
                  aria-pressed={isOn}
                  aria-label={isOn ? t.turnOff : t.turnOn}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    isOn
                      ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,.12)]"
                      : "border-slate-600 bg-slate-800 text-slate-300 hover:border-sky-400/50"
                  }`}
                >
                  <Power className="size-4" aria-hidden="true" />
                  <span>{isOn ? t.powerOn : t.powerOff}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[64px_1fr_70px] items-center gap-2 sm:grid-cols-[92px_1fr_110px] sm:gap-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className={`flex size-14 items-center justify-center rounded-2xl border transition-all duration-300 sm:size-16 ${isOn ? "border-amber-300/30 bg-amber-300/10 shadow-[0_0_22px_rgba(253,224,71,.08)]" : "border-slate-700 bg-slate-900"}`}>
                  {mode === "continuous" || mode === "absorption" ? (
                    <Lightbulb className={`size-7 transition-colors ${isOn ? "text-amber-300" : "text-slate-600"}`} aria-hidden="true" />
                  ) : (
                    <FlaskConical className={`size-7 transition-colors ${isOn ? "text-cyan-300" : "text-slate-600"}`} aria-hidden="true" />
                  )}
                </div>
                <span className={`text-[11px] font-bold ${isOn ? "text-slate-300" : "text-slate-600"}`}>{t.sourceLabel}</span>
              </div>

              <div className="relative h-44 min-w-0 overflow-hidden sm:h-52">
                <div className="absolute inset-y-0 start-0 w-3 rounded bg-slate-200/90" aria-label={t.slit} />
                <div className={`absolute start-3 top-1/2 h-1 w-[38%] -translate-y-1/2 bg-amber-200 shadow-[0_0_12px_#fde68a] transition-opacity duration-300 ${isOn ? "opacity-100 motion-safe:animate-pulse" : "opacity-0"}`} />
                <div
                  className="absolute start-[39%] top-1/2 size-20 -translate-y-1/2 border border-cyan-100/70 bg-cyan-200/15 shadow-[inset_0_0_18px_rgba(125,211,252,.25)] transition-transform sm:size-24"
                  style={{ clipPath: "polygon(50% 0,100% 100%,0 100%)", transform: `translateY(-50%) rotate(${angle - 38}deg)` }}
                  aria-label={t.prism}
                />
                <div
                  className={`absolute end-0 top-1/2 h-24 w-[43%] -translate-y-1/2 origin-left transition-all duration-300 ${isOn ? "opacity-80" : "opacity-0"}`}
                  style={{
                    width: `${Math.min(52, spread)}%`,
                    clipPath: "polygon(0 47%,100% 0,100% 100%,0 53%)",
                    background: mode === "emission" ? "linear-gradient(90deg,#67e8f9,#a78bfa,#fb7185)" : "linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4,#22c55e,#facc15,#f97316,#ef4444)",
                  }}
                />
              </div>

              <div>
                <SpectrumDisplay mode={mode} gas={gas} isOn={isOn} offLabel={t.screenOff} screenLabel={`${t.screen}: ${t[`${mode}Name`]}`} />
                <p className={`mt-2 text-center text-[11px] font-bold ${isOn ? "text-slate-300" : "text-slate-600"}`}>{t.screen}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1.05fr]">
            <div className="rounded-2xl border border-physics/20 bg-physics/5 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-physics">{t.result}</p>
              <h3 className="mt-2 text-xl font-black text-foreground">{modeName}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{observation}</p>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{t.conclusion}</p>
              <p className="mt-2 text-sm font-medium leading-7 text-foreground">{t.conclusionText}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <fieldset>
            <legend className="mb-3 text-sm font-black text-foreground">{t.source}</legend>
            <div className="grid gap-2">
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => chooseMode(item)}
                  aria-pressed={mode === item}
                  className={`min-h-12 rounded-xl border px-4 text-start text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${
                    mode === item
                      ? "border-physics bg-physics text-white shadow-lg shadow-physics/20"
                      : "border-border bg-background text-foreground hover:border-physics/40 hover:bg-physics/5"
                  }`}
                >
                  {t[item]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={mode === "continuous" ? "opacity-45" : ""} disabled={mode === "continuous"}>
            <legend className="mb-3 text-sm font-black text-foreground">{t.material}</legend>
            <div className="grid grid-cols-3 gap-2">
              {gases.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setGas(item);
                  }}
                  aria-pressed={gas === item}
                  className={`relative min-h-11 overflow-hidden rounded-xl border px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-physics ${
                    gas === item && mode !== "continuous"
                      ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-700 shadow-[inset_0_-3px_0_rgba(34,211,238,.55)] dark:text-cyan-300"
                      : "border-border bg-background text-muted-foreground hover:border-physics/40"
                  }`}
                >
                  {t[item]}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block rounded-2xl border border-border bg-background p-4">
            <span className="flex items-center justify-between gap-3 text-sm font-black text-foreground">
              {t.angle}
              <span className="font-mono text-physics">{angle}°</span>
            </span>
            <input
              type="range"
              min="20"
              max="60"
              value={angle}
              onChange={(event) => setAngle(Number(event.target.value))}
              className="mt-4 w-full accent-[hsl(var(--physics))]"
            />
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">{t.angleHint}</span>
          </label>

        </aside>
      </div>
    </section>
  );
};

export default SpectrumTypesActivity;
