import { ArrowLeft, ArrowRight } from "lucide-react";

export type AppLanguage = "ar" | "en";

export const LANGUAGE_STORAGE_KEY = "app_language_v1";

const options: Array<{
  code: AppLanguage;
  title: string;
  subtitle: string;
  action: string;
  direction: "rtl" | "ltr";
}> = [
  {
    code: "ar",
    title: "العربية",
    subtitle: "ادرس وتصفح جميع أدوات تميّزك باللغة العربية.",
    action: "المتابعة بالعربية",
    direction: "rtl",
  },
  {
    code: "en",
    title: "English",
    subtitle: "Study and explore every Tamayzak tool in English.",
    action: "Continue in English",
    direction: "ltr",
  },
];

export const LanguageGate = ({ onSelect }: { onSelect: (language: AppLanguage) => void }) => {
  const chooseLanguage = (language: AppLanguage) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    onSelect(language);
  };

  return (
    <main className="tmz-home flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <section className="w-full max-w-3xl">
        <header className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <img src="/app-icon-192.png" alt="" className="h-12 w-12 rounded-2xl" />
            <span className="text-base font-semibold text-[var(--tmz-ink)]">{"تميّزك · Tamayzak"}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--tmz-ink)] sm:text-3xl">
            اختر لغة التطبيق
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--tmz-muted)] sm:text-base">
            اختر اللغة التي ترتاح بها، وتكدر تغيّرها لاحقاً من إعدادات الحساب.
            <span className="mt-1 block">Choose what feels comfortable—you can change it later.</span>
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
          {options.map((option) => {
            const DirectionArrow = option.code === "ar" ? ArrowLeft : ArrowRight;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => chooseLanguage(option.code)}
                dir={option.direction}
                className="group flex min-h-40 flex-col justify-between rounded-2xl border border-[var(--tmz-line)] bg-[var(--tmz-surface)] p-5 text-start text-[var(--tmz-ink)] transition-colors hover:bg-[var(--tmz-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tmz-blue)]"
              >
                <div>
                  <span className="text-xs font-medium text-[var(--tmz-muted)]">{option.code === "ar" ? "واجهة عربية" : "English interface"}</span>
                  <h2 className="mt-2 text-xl font-semibold">{option.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--tmz-muted)]">{option.subtitle}</p>
                </div>
                <span className="mt-5 inline-flex min-h-11 items-center justify-between gap-3 rounded-full bg-[#163A73] px-4 text-sm font-medium text-white transition-colors group-hover:bg-[#1b477f]">
                  {option.action}
                  <DirectionArrow className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-[var(--tmz-muted)]">
          اللغة تغيّر واجهة الموقع فقط ولا تؤثر على تقدمك الدراسي.
        </p>
      </section>
    </main>
  );
};
