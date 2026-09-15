import { ArrowLeft, ArrowRight, Check, Globe2, Sparkles } from "lucide-react";

export type AppLanguage = "ar" | "en";

export const LANGUAGE_STORAGE_KEY = "app_language_v1";

const options: Array<{
  code: AppLanguage;
  eyebrow: string;
  title: string;
  subtitle: string;
  action: string;
  symbol: string;
  direction: "rtl" | "ltr";
  cardClass: string;
  iconClass: string;
  actionClass: string;
}> = [
  {
    code: "ar",
    eyebrow: "الواجهة العربية",
    title: "العربية",
    subtitle: "ادرس وتصفح جميع أدوات تميّزك باللغة العربية.",
    action: "المتابعة بالعربية",
    symbol: "ع",
    direction: "rtl",
    cardClass: "border-blue-500/35 bg-gradient-to-br from-blue-500/15 via-card to-cyan-500/10 hover:border-blue-500/70 hover:shadow-[0_22px_55px_-30px_rgba(59,130,246,0.8)]",
    iconClass: "bg-blue-500 text-white shadow-[0_10px_28px_rgba(59,130,246,0.28)]",
    actionClass: "bg-blue-500/12 text-blue-600 dark:text-blue-300",
  },
  {
    code: "en",
    eyebrow: "English interface",
    title: "English",
    subtitle: "Study and explore every Tamayzak tool in English.",
    action: "Continue in English",
    symbol: "EN",
    direction: "ltr",
    cardClass: "border-violet-500/35 bg-gradient-to-br from-violet-500/15 via-card to-fuchsia-500/10 hover:border-violet-500/70 hover:shadow-[0_22px_55px_-30px_rgba(139,92,246,0.8)]",
    iconClass: "bg-violet-500 text-white shadow-[0_10px_28px_rgba(139,92,246,0.28)]",
    actionClass: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
  },
];

export const LanguageGate = ({ onSelect }: { onSelect: (language: AppLanguage) => void }) => {
  const chooseLanguage = (language: AppLanguage) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    onSelect(language);
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -start-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -end-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      <section className="relative z-10 w-full max-w-4xl animate-fade-up">
        <header className="mx-auto mb-7 max-w-2xl text-center sm:mb-9">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary text-primary-foreground shadow-[0_12px_35px_hsl(var(--primary)/0.25)]">
            <Globe2 className="h-6 w-6" />
          </div>
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/75 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Personalize your experience
          </div>
          <h1 className="text-balance text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
            اختر لغتك <span className="text-primary">·</span> Choose your language
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            اختر اللغة التي ترتاح بها، وتكدر تغيّرها لاحقاً من إعدادات الحساب.
            <span className="mt-1 block">Choose what feels comfortable—you can change it later.</span>
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {options.map((option) => {
            const DirectionArrow = option.code === "ar" ? ArrowLeft : ArrowRight;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => chooseLanguage(option.code)}
                dir={option.direction}
                className={`group relative min-h-[260px] overflow-hidden rounded-[30px] border p-5 text-start backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0 sm:p-6 ${option.cardClass}`}
              >
                <div className="pointer-events-none absolute end-0 top-0 h-24 w-24 bg-white/15 [clip-path:polygon(100%_0,0_0,100%_100%)]" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-14 min-w-14 items-center justify-center rounded-2xl px-3 text-lg font-black ${option.iconClass}`}>
                      {option.symbol}
                    </div>
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-background/75 transition-transform duration-300 group-hover:scale-105 ${option.actionClass}`}>
                      <DirectionArrow
                        className={`h-5 w-5 transition-transform duration-300 ${
                          option.code === "ar" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
                        }`}
                      />
                    </span>
                  </div>

                  <div className="mt-7 flex-1">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{option.eyebrow}</p>
                    <h2 className="mt-2 text-3xl font-black text-foreground">{option.title}</h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{option.subtitle}</p>
                  </div>

                  <div className={`mt-6 flex min-h-11 items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-sm font-extrabold ${option.actionClass}`}>
                    <span>{option.action}</span>
                    <Check className="h-4 w-4 opacity-70" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          اللغة تغيّر واجهة الموقع فقط ولا تؤثر على تقدمك الدراسي.
        </p>
      </section>
    </main>
  );
};
