import { ArrowLeft, FlaskConical, Sparkles } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import DaniellCell from "@/components/chemistry/DaniellCell";

const copy = {
  en: {
    back: "Back",
    eyebrow: "Interactive laboratory",
    title: "Chemistry Experiment",
    description: "Explore chemistry concepts through interactive experiments.",
    experiment: "Daniell Cell",
  },
  ar: {
    back: "رجوع",
    eyebrow: "مختبر تفاعلي",
    title: "تجربة الكيمياء",
    description: "استكشف مفاهيم الكيمياء من خلال تجارب تفاعلية.",
    experiment: "خلية دانييل",
  },
} as const;

const ChemistryExperiments = ({
  language,
  onBack,
}: {
  language: AppLanguage;
  onBack: () => void;
}) => {
  const isRTL = language === "ar";
  const text = copy[language];

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen bg-background pb-28 ${isRTL ? "font-body-ar" : "font-body"}`}
    >
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/80 px-4 text-sm font-bold backdrop-blur transition-colors hover:border-chemistry/45 hover:bg-secondary"
        >
          <ArrowLeft className={`size-4 ${isRTL ? "rotate-180" : ""}`} aria-hidden="true" />
          {text.back}
        </button>

        <header className="clip-facet-lg relative mb-6 overflow-hidden border border-chemistry/30 bg-card/70 p-5 shadow-[0_22px_70px_-35px_hsl(var(--chemistry)/0.5)] backdrop-blur-xl sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,hsl(var(--chemistry)/0.2),transparent_42%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-chemistry/35 bg-chemistry/15 text-chemistry shadow-[0_0_28px_hsl(var(--chemistry)/0.18)]">
              <FlaskConical className="size-7" aria-hidden="true" />
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-chemistry">
                <Sparkles className="size-3.5" aria-hidden="true" />
                {text.eyebrow}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{text.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{text.description}</p>
            </div>
          </div>
        </header>

        <section aria-labelledby="daniell-cell-heading">
          <div className="mb-3 flex items-center gap-3">
            <span className="size-2.5 rotate-45 bg-chemistry shadow-[0_0_14px_hsl(var(--chemistry)/0.7)]" />
            <h2 id="daniell-cell-heading" className="text-xl font-extrabold text-foreground sm:text-2xl">
              {text.experiment}
            </h2>
          </div>
          <DaniellCell language={language} />
        </section>
      </div>
    </main>
  );
};

export default ChemistryExperiments;
