import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MutamayizMascot from "@/components/MutamayizMascot";

export type AppLanguage = "ar" | "en";

export const LANGUAGE_STORAGE_KEY = "app_language_v1";

const messages = [
  { id: "hello", ar: "هلا بيك! آني متميّز، مساعدك بتميّزك.", en: "Hi! I’m Mutamayiz, your study assistant in Tamayzak." },
  { id: "study", ar: "اختار مادتك وفصلك. تگدر تقرأ الملازم، تسمع الشرح، وتتدرّب على الأسئلة الوزارية.", en: "Pick a subject and chapter to read study notes, listen to explanations and practise past exam questions." },
  { id: "language", ar: "تحب تستخدم تميّزك بأي لغة؟", en: "Which language would you like to use?" },
] as const;

const options = [
  { code: "ar", title: "العربية", dir: "rtl", Icon: ArrowLeft },
  { code: "en", title: "English", dir: "ltr", Icon: ArrowRight },
] as const;

export const LanguageGate = ({ onSelect, showWelcome = true }: {
  onSelect: (language: AppLanguage) => void;
  showWelcome?: boolean;
}) => {
  const [visibleCount, setVisibleCount] = useState(() =>
    showWelcome && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 1 : messages.length,
  );
  const complete = visibleCount === messages.length;

  useEffect(() => {
    if (complete) return;
    const timer = window.setTimeout(() => setVisibleCount(visibleCount + 1), visibleCount === 1 ? 1000 : 1400);
    return () => window.clearTimeout(timer);
  }, [complete, visibleCount]);

  const chooseLanguage = (language: AppLanguage) => {
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Allow selection for this visit. */ }
    onSelect(language);
  };

  const visibleMessages = showWelcome ? messages.slice(0, visibleCount) : messages.slice(-1);

  return (
    <main dir="ltr" className="tmz-home flex min-h-[100dvh] justify-center px-4 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 sm:pt-[clamp(2.5rem,10vh,7rem)]">
      <section aria-labelledby="tamayzak-welcome" className="h-fit w-full max-w-[38rem] overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-primary/10">
        <header className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-4 sm:gap-4 sm:px-6">
          <MutamayizMascot speaking={!complete} className="size-16 drop-shadow-[0_4px_10px_rgba(34,147,250,.26)] sm:size-[4.5rem]" />
          <div className="min-w-0">
            <h1 id="tamayzak-welcome" className="flex flex-wrap items-baseline gap-x-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              <span lang="ar" dir="rtl">متميّز</span><span lang="en">Mutamayiz</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground"><span lang="ar" dir="rtl">تميّزك</span> · <span lang="en">Tamayzak</span></p>
          </div>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <div role="log" aria-label="Welcome conversation / محادثة الترحيب" aria-relevant="additions" className="space-y-3">
            {visibleMessages.map(({ id, ar, en }) => (
              <div key={id} id={id === "language" ? "tamayzak-language-question" : undefined} className="lv-rise space-y-2 rounded-2xl rounded-tl-sm border border-primary/15 bg-primary/5 px-4 py-3.5 text-sm leading-6 text-foreground sm:text-base">
                <p lang="ar" dir="rtl">{ar}</p>
                <p lang="en" className="text-muted-foreground">{en}</p>
              </div>
            ))}
          </div>

          {!complete && <div aria-hidden="true" className="flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2.5 motion-safe:animate-pulse">
            <span className="size-1.5 rounded-full bg-primary/60" />
            <span className="size-1.5 rounded-full bg-primary/80" />
            <span className="size-1.5 rounded-full bg-primary" />
          </div>}

          {complete && <div role="group" aria-labelledby="tamayzak-language-question" className="lv-rise grid grid-cols-2 gap-3">
            {options.map(({ code, title, dir, Icon }) => (
              <button key={code} type="button" lang={code} dir={dir} onClick={() => chooseLanguage(code)}
                className="flex min-h-14 items-center justify-between gap-2 rounded-xl border border-primary/35 bg-background px-3 text-start font-bold text-foreground transition-colors hover:border-primary hover:bg-primary/10 sm:px-4">
                {title}<Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
              </button>
            ))}
          </div>}
        </div>
      </section>
    </main>
  );
};
