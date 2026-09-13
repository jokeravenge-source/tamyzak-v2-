import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, Search, Sparkles, X } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { englishVerbForms, type EnglishVerbForm } from "@/data/englishVerbForms";

type VerbField = "present" | "past" | "pastParticiple";

const COPY = {
  en: {
    badge: "English · Verb Forms",
    title: "Find Any Verb Form",
    description: "Type the present, past, or past participle. We’ll show you the complete verb family.",
    placeholder: "Try: go, went, or gone",
    hint: "You can enter any form",
    emptyTitle: "Start with any verb form",
    emptyText: "The result will include the present, past, past participle, and Arabic meaning.",
    noResult: "This verb is not in the list yet.",
    noResultHint: "Check the spelling or try another form.",
    matchedAs: "You entered",
    present: "Present",
    past: "Past",
    pastParticiple: "Past Participle (P.P.)",
    meaning: "Arabic Meaning",
    examples: "Quick examples",
  },
  ar: {
    badge: "الإنجليزية · تصريف الأفعال",
    title: "اعرف تصريف أي فعل",
    description: "اكتب المضارع أو الماضي أو التصريف الثالث، وسنعرض لك جميع صيغ الفعل.",
    placeholder: "جرّب: go أو went أو gone",
    hint: "يمكنك كتابة أي صيغة",
    emptyTitle: "ابدأ بأي صيغة للفعل",
    emptyText: "ستظهر صيغة المضارع والماضي والتصريف الثالث مع المعنى بالعربي.",
    noResult: "هذا الفعل غير موجود في القائمة حالياً.",
    noResultHint: "تأكد من الكتابة أو جرّب صيغة أخرى.",
    matchedAs: "الصيغة المدخلة",
    present: "المضارع",
    past: "الماضي",
    pastParticiple: "التصريف الثالث (P.P.)",
    meaning: "المعنى بالعربي",
    examples: "أمثلة سريعة",
  },
} as const;

const QUICK_EXAMPLES = ["go", "went", "written", "swam", "been", "taught"];

const normalize = (value: string) => value.toLowerCase().trim().replace(/\s+/g, " ");

const variants = (value: string) => value.split("/").map(normalize).filter(Boolean);

function matchedFields(verb: EnglishVerbForm, query: string): VerbField[] {
  const normalized = normalize(query);
  if (!normalized) return [];
  const fields: VerbField[] = [];
  if (variants(verb.present).includes(normalized)) fields.push("present");
  if (variants(verb.past).includes(normalized)) fields.push("past");
  if (variants(verb.pastParticiple).includes(normalized)) fields.push("pastParticiple");
  return fields;
}

function FacetCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`border border-white/15 bg-secondary/55 shadow-[0_22px_70px_rgba(15,23,42,.18)] backdrop-blur-xl ${className}`}
      style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
    >
      {children}
    </div>
  );
}

export default function EnglishVerbForms({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const [query, setQuery] = useState("");
  const text = COPY[language];
  const isArabic = language === "ar";
  const normalizedQuery = normalize(query);
  const results = useMemo(
    () => normalizedQuery
      ? englishVerbForms.filter((verb) => matchedFields(verb, normalizedQuery).length > 0)
      : [],
    [normalizedQuery],
  );

  const fieldLabel: Record<VerbField, string> = {
    present: text.present,
    past: text.past,
    pastParticiple: text.pastParticiple,
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-24 pt-6 text-foreground sm:px-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/.18),transparent_34%),radial-gradient(circle_at_90%_80%,hsl(var(--accent)/.15),transparent_34%)]" />
      <div className="relative mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className="mb-8 grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-secondary/60 text-muted-foreground backdrop-blur transition hover:border-primary/40 hover:text-foreground"
          aria-label={isArabic ? "رجوع" : "Back"}
        >
          {isArabic ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </button>

        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {text.badge}
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-6xl">{text.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground sm:text-lg">{text.description}</p>
        </header>

        <FacetCard className="mx-auto mt-10 max-w-3xl p-4 sm:p-6">
          <label className="block">
            <span className="mb-3 block text-sm font-bold text-muted-foreground">{text.hint}</span>
            <div className="flex h-16 items-center gap-3 rounded-2xl border border-white/15 bg-background/65 px-4 transition focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
              <Search className="h-5 w-5 shrink-0 text-primary" />
              <input
                dir="ltr"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={text.placeholder}
                className="h-full min-w-0 flex-1 bg-transparent text-left text-lg font-bold outline-none placeholder:font-normal placeholder:text-muted-foreground/50"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label={isArabic ? "مسح" : "Clear"}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{text.examples}:</span>
            {QUICK_EXAMPLES.map((example) => (
              <button key={example} type="button" onClick={() => setQuery(example)} className="rounded-full border border-white/10 bg-background/45 px-3 py-1 text-xs font-bold text-primary transition hover:border-primary/40 hover:bg-primary/10">
                {example}
              </button>
            ))}
          </div>
        </FacetCard>

        <section className="mx-auto mt-6 max-w-3xl" aria-live="polite">
          {!normalizedQuery ? (
            <FacetCard className="p-8 text-center sm:p-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-primary/15 text-primary"><BookOpenCheck className="h-8 w-8" /></div>
              <h2 className="mt-5 text-xl font-black">{text.emptyTitle}</h2>
              <p className="mx-auto mt-2 max-w-lg leading-7 text-muted-foreground">{text.emptyText}</p>
            </FacetCard>
          ) : results.length === 0 ? (
            <FacetCard className="p-8 text-center">
              <p className="text-lg font-black">{text.noResult}</p>
              <p className="mt-2 text-sm text-muted-foreground">{text.noResultHint}</p>
            </FacetCard>
          ) : (
            <div className="space-y-4">
              {results.map((verb) => {
                const matches = matchedFields(verb, normalizedQuery);
                return (
                  <FacetCard key={verb.present} className="overflow-hidden">
                    <div className="border-b border-white/10 bg-primary/[0.07] px-5 py-4 sm:px-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 dir="ltr" className="text-3xl font-black tracking-tight text-primary">{verb.present}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{text.matchedAs}:</span>
                          {matches.map((field) => <span key={field} className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-bold text-primary">{fieldLabel[field]}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                      <FormCell label={text.present} value={verb.present} accent="text-sky-400" />
                      <FormCell label={text.past} value={verb.past} accent="text-violet-400" />
                      <FormCell label={text.pastParticiple} value={verb.pastParticiple} accent="text-fuchsia-400" />
                      <FormCell label={text.meaning} value={verb.meaning} accent="text-emerald-400" rtl />
                    </div>
                  </FacetCard>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FormCell({ label, value, accent, rtl = false }: { label: string; value: string; accent: string; rtl?: boolean }) {
  return (
    <div className="bg-secondary/65 p-5 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p dir={rtl ? "rtl" : "ltr"} className={`mt-2 text-xl font-black ${accent}`}>{value}</p>
    </div>
  );
}
