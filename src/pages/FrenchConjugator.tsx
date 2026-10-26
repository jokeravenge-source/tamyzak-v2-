import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleAlert,
  Languages,
  Loader2,
  Search,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import {
  conjugateFrenchVerb,
  findFrenchVerbSuggestions,
  type ConjugationValue,
  type FrenchConjugation,
} from "@/lib/frenchConjugation";

export type { FrenchConjugation } from "@/lib/frenchConjugation";

const COMMON_VERBS = [
  "être", "avoir", "aller", "faire", "pouvoir", "vouloir", "savoir", "devoir",
  "venir", "prendre", "dire", "voir", "mettre", "partir", "sortir", "dormir",
  "lire", "écrire", "boire", "croire", "connaître", "vivre", "tenir", "comprendre",
  "attendre", "parler", "aimer", "donner", "trouver", "penser", "demander",
  "travailler", "appeler", "acheter", "manger", "commencer", "finir", "choisir",
] as const;

const MOOD_ORDER = ["indicatif", "subjonctif", "conditionnel", "impératif", "infinitif", "participe", "gérondif"];

const copy = {
  ar: {
    back: "رجوع",
    title: "French Conjugator",
    titleAr: "مصرّف الأفعال الفرنسية",
    description: "اكتب مصدر أي فعل فرنسي لتشاهد تصريفاته في جميع الصيغ والأزمنة المتاحة.",
    creator: "أداة من إعداد الأستاذ محمد علي الكناني",
    verified: "تصريف موثّق",
    placeholder: "مثال: être, finir, se lever…",
    search: "عرض التصريف",
    searching: "جاري البحث…",
    common: "الأفعال الأكثر استعمالاً",
    commonHint: "اختر فعلاً أو اكتب أي فعل آخر في حقل البحث.",
    result: "جدول التصريف الكامل",
    group: "المجموعة",
    auxiliary: "الفعل المساعد",
    pronominal: "فعل انعكاسي",
    all: "الكل",
    forms: "صيغة",
    cached: "يعمل بدون اتصال بالإنترنت",
    loadingTitle: "نجمع جميع تصريفات الفعل",
    loadingText: "لحظات ونرتبها حسب الصيغة والزمن.",
    emptyTitle: "ابدأ بكتابة فعل فرنسي",
    emptyText: "ستظهر هنا جميع تصريفاته مرتبة حسب الصيغة والزمن.",
    invalidTitle: "اكتب فعلاً فرنسياً صحيحاً",
    invalidText: "استخدم الحروف الفرنسية فقط، ويمكنك كتابة فعل انعكاسي مثل se lever.",
    notFoundTitle: "لم نعثر على هذا الفعل",
    notFoundText: "تحقق من كتابة المصدر أو اختر واحداً من الاقتراحات.",
    suggestions: "هل تقصد؟",
    attribution: "بيانات التصريف من معجم Lefff بترخيص LGPL-LR.",
    sourceLink: "مصدر البيانات",
    moodFallback: "الصيغة",
    tenseFallback: "الزمن",
  },
  en: {
    back: "Back",
    title: "French Conjugator",
    titleAr: "Complete French verb forms",
    description: "Enter any French infinitive to see every available form, mood, and tense.",
    creator: "Created by Ustadh Mohammed Ali Al-Kinani",
    verified: "Verified conjugation",
    placeholder: "Example: être, finir, se lever…",
    search: "Conjugate verb",
    searching: "Searching…",
    common: "Most-used French verbs",
    commonHint: "Choose a common verb or type any other verb above.",
    result: "Complete conjugation table",
    group: "Group",
    auxiliary: "Auxiliary",
    pronominal: "Pronominal verb",
    all: "All",
    forms: "forms",
    cached: "Works without an internet connection",
    loadingTitle: "Collecting every form",
    loadingText: "The conjugations are being organised by mood and tense.",
    emptyTitle: "Start with a French verb",
    emptyText: "Every available form will appear here, organised by mood and tense.",
    invalidTitle: "Enter a valid French verb",
    invalidText: "Use French letters only. Pronominal verbs such as se lever are supported.",
    notFoundTitle: "That verb was not found",
    notFoundText: "Check the infinitive spelling or choose one of the suggestions.",
    suggestions: "Did you mean?",
    attribution: "Conjugation data from the Lefff lexicon under LGPL-LR.",
    sourceLink: "Data source",
    moodFallback: "Mood",
    tenseFallback: "Tense",
  },
} as const;

const moodLabels: Record<string, { ar: string; en: string }> = {
  indicatif: { ar: "الصيغة الخبرية", en: "Indicatif" },
  subjonctif: { ar: "صيغة الشك والرغبة", en: "Subjonctif" },
  conditionnel: { ar: "الصيغة الشرطية", en: "Conditionnel" },
  impératif: { ar: "صيغة الأمر", en: "Impératif" },
  imperatif: { ar: "صيغة الأمر", en: "Impératif" },
  infinitif: { ar: "المصدر", en: "Infinitif" },
  participe: { ar: "اسم الفاعل والمفعول", en: "Participe" },
  gérondif: { ar: "صيغة Gérondif", en: "Gérondif" },
  gerondif: { ar: "صيغة Gérondif", en: "Gérondif" },
};

const normalizeKey = (value: string) => value.toLocaleLowerCase("fr").normalize("NFC");

const sentenceCase = (value: string) => {
  const cleaned = value.replace(/_/g, " ").trim();
  return cleaned ? `${cleaned.charAt(0).toLocaleUpperCase("fr")}${cleaned.slice(1)}` : cleaned;
};

const normalizeForms = (value: ConjugationValue): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap((item) => normalizeForms(item));
};

const isValidFrenchVerbInput = (value: string) => /^[a-zàâäçéèêëîïôöùûüÿœæ'’ -]+$/iu.test(value.trim());

const FrenchConjugator = ({ language, onBack }: { language: AppLanguage; onBack: () => void }) => {
  const isRTL = language === "ar";
  const t = copy[language];
  const [query, setQuery] = useState("être");
  const [data, setData] = useState<FrenchConjugation | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "invalid" | "not-found">("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeMood, setActiveMood] = useState("all");
  const conjugate = useCallback((rawVerb: string) => {
    const verb = rawVerb.trim().toLocaleLowerCase("fr").normalize("NFC");
    setQuery(verb);
    setSuggestions([]);
    setActiveMood("all");

    if (!verb || !isValidFrenchVerbInput(verb)) {
      setData(null);
      setStatus("invalid");
      return;
    }

    setStatus("loading");

    const result = conjugateFrenchVerb(verb);
    if (!result) {
      setData(null);
      setStatus("not-found");
      setSuggestions(findFrenchVerbSuggestions(verb));
      return;
    }
    setData(result);
    setQuery(result.infinitive);
    setStatus("success");
  }, []);

  useEffect(() => {
    conjugate("être");
  }, [conjugate]);

  const moodEntries = useMemo(() => {
    if (!data?.moods) return [];
    const entries = Object.entries(data.moods).filter(([, value]) => value && typeof value === "object");
    return entries.sort(([a], [b]) => {
      const aIndex = MOOD_ORDER.indexOf(normalizeKey(a));
      const bIndex = MOOD_ORDER.indexOf(normalizeKey(b));
      return (aIndex < 0 ? 999 : aIndex) - (bIndex < 0 ? 999 : bIndex);
    });
  }, [data]);

  const visibleMoods = activeMood === "all"
    ? moodEntries
    : moodEntries.filter(([mood]) => normalizeKey(mood) === activeMood);

  const formCount = useMemo(
    () => moodEntries.reduce((total, [, moodValue]) => {
      if (typeof moodValue === "string" || Array.isArray(moodValue)) return total + normalizeForms(moodValue).length;
      return total + Object.values(moodValue).reduce((sum, value) => sum + normalizeForms(value).length, 0);
    }, 0),
    [moodEntries],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    conjugate(query);
  };

  const errorTitle = status === "invalid" ? t.invalidTitle : t.notFoundTitle;
  const errorText = status === "invalid" ? t.invalidText : t.notFoundText;

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background pb-28 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-bold text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isRTL ? <ArrowRight className="size-4" aria-hidden="true" /> : <ArrowLeft className="size-4" aria-hidden="true" />}
          {t.back}
        </button>

        <section className="relative overflow-hidden rounded-[30px] border border-blue-900/10 bg-[#f9f8f4] text-slate-950 shadow-[0_28px_80px_-48px_rgba(15,36,76,.7)] dark:border-white/10 dark:bg-[#07111f] dark:text-white">
          <div className="absolute inset-x-0 top-0 flex h-1" aria-hidden="true">
            <span className="flex-1 bg-[#1f4e9d]" />
            <span className="flex-1 bg-white" />
            <span className="flex-1 bg-[#dc2438]" />
          </div>

          <div className="relative grid gap-8 px-5 pb-8 pt-9 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)] lg:px-10 lg:pb-10 lg:pt-11">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-950 px-3 py-1.5 text-xs font-black text-white dark:bg-blue-400 dark:text-blue-950">
                  <BadgeCheck className="size-4" aria-hidden="true" />
                  {t.creator}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-blue-100/70">
                  <Check className="size-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                  {t.verified}
                </span>
              </div>
              <h1 className="mt-7 text-balance text-4xl font-black leading-[1.02] tracking-[-0.035em] sm:text-6xl">{t.title}</h1>
              <p className="mt-2 text-lg font-black text-blue-900 dark:text-blue-200 sm:text-xl">{t.titleAr}</p>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 dark:text-slate-300 sm:text-base">{t.description}</p>

              <form onSubmit={onSubmit} className="mt-7">
                <label className="sr-only" htmlFor="french-verb-search">{t.placeholder}</label>
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-white p-2 shadow-[0_14px_34px_-22px_rgba(15,36,76,.55)] focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 dark:border-white/15 dark:bg-white/5 sm:flex-row">
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                    <Search className="size-5 shrink-0 text-blue-800 dark:text-blue-300" aria-hidden="true" />
                    <input
                      id="french-verb-search"
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t.placeholder}
                      autoComplete="off"
                      spellCheck="false"
                      className="min-h-12 w-full bg-transparent text-left text-lg font-black text-slate-950 caret-blue-600 outline-none placeholder:font-medium placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                      dir="ltr"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-950 px-5 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-blue-400 dark:text-blue-950 dark:hover:bg-blue-300"
                  >
                    {status === "loading" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Languages className="size-4" aria-hidden="true" />}
                    {status === "loading" ? t.searching : t.search}
                  </button>
                </div>
              </form>
            </div>

            <div className="self-end border-t border-slate-300 pt-6 dark:border-white/15 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
              <h2 className="text-lg font-black">{t.common}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{t.commonHint}</p>
              <div className="mt-4 flex max-h-44 flex-wrap gap-2 overflow-y-auto pe-1 [scrollbar-color:#1f4e9d_transparent]">
                {COMMON_VERBS.map((verb) => (
                  <button
                    key={verb}
                    type="button"
                    onClick={() => conjugate(verb)}
                    aria-pressed={data?.infinitive === verb}
                    className={`rounded-full border px-3 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${data?.infinitive === verb ? "border-blue-900 bg-blue-950 text-white dark:border-blue-300 dark:bg-blue-300 dark:text-blue-950" : "border-slate-300 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-800 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-blue-300 dark:hover:text-blue-200"}`}
                  >
                    {verb}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6" aria-live="polite" aria-busy={status === "loading"}>
          {status === "loading" ? (
            <div className="grid min-h-72 place-items-center rounded-[26px] border border-border bg-card px-6 text-center">
              <div>
                <Loader2 className="mx-auto size-9 animate-spin text-blue-700" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-black text-foreground">{t.loadingTitle}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.loadingText}</p>
              </div>
            </div>
          ) : status === "invalid" || status === "not-found" ? (
            <div className="rounded-[26px] border border-rose-300/60 bg-rose-50 p-6 text-rose-950 dark:border-rose-400/20 dark:bg-rose-950/25 dark:text-rose-100 sm:p-8">
              <CircleAlert className="size-7 text-rose-600 dark:text-rose-300" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black">{errorTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-rose-800 dark:text-rose-200/80">{errorText}</p>
              {suggestions.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-black">{t.suggestions}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => conjugate(suggestion)} className="rounded-full border border-rose-300 bg-white px-3 py-2 text-sm font-bold text-rose-900 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-400/25 dark:bg-rose-950/40 dark:text-rose-100">{suggestion}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : data ? (
            <div>
              <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-black text-blue-800 dark:text-blue-300">{t.result}</p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h2 className="text-4xl font-black tracking-[-0.035em] text-foreground sm:text-5xl" dir="ltr">{data.infinitive}</h2>
                    <span className="text-sm font-bold tabular-nums text-muted-foreground">{formCount} {t.forms}</span>
                  </div>
                </div>
                <dl className="flex flex-wrap gap-2 text-sm">
                  {data.group && <div className="rounded-full border border-border bg-card px-3 py-2"><dt className="inline text-muted-foreground">{t.group}: </dt><dd className="inline font-black text-foreground" dir="ltr">{data.group}</dd></div>}
                  {data.auxiliary && <div className="rounded-full border border-border bg-card px-3 py-2"><dt className="inline text-muted-foreground">{t.auxiliary}: </dt><dd className="inline font-black text-foreground" dir="ltr">{data.auxiliary}</dd></div>}
                  {data.pronominal && <div className="rounded-full border border-border bg-card px-3 py-2 font-black text-foreground">{t.pronominal}</div>}
                </dl>
              </div>

              <div className="sticky top-0 z-10 -mx-4 mt-5 overflow-x-auto border-y border-border bg-background/95 px-4 py-3 shadow-[0_10px_24px_-20px_rgba(15,23,42,.4)] [scrollbar-width:none] sm:mx-0 sm:rounded-xl sm:border sm:px-3">
                <div className="flex min-w-max gap-2">
                  <button type="button" onClick={() => setActiveMood("all")} aria-pressed={activeMood === "all"} className={`min-h-10 rounded-lg px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeMood === "all" ? "bg-blue-950 text-white dark:bg-blue-300 dark:text-blue-950" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>{t.all}</button>
                  {moodEntries.map(([mood]) => {
                    const key = normalizeKey(mood);
                    const label = moodLabels[key]?.[language] || sentenceCase(mood) || t.moodFallback;
                    return <button key={mood} type="button" onClick={() => setActiveMood(key)} aria-pressed={activeMood === key} className={`min-h-10 rounded-lg px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeMood === key ? "bg-blue-950 text-white dark:bg-blue-300 dark:text-blue-950" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>{label}</button>;
                  })}
                </div>
              </div>

              <div className="mt-8 space-y-12">
                {visibleMoods.map(([mood, moodValue]) => {
                  const moodKey = normalizeKey(mood);
                  const tenseEntries = typeof moodValue === "string" || Array.isArray(moodValue)
                    ? [[mood, moodValue] as const]
                    : Object.entries(moodValue);
                  return (
                    <article key={mood}>
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-blue-950 text-white dark:bg-blue-300 dark:text-blue-950"><BookOpenCheck className="size-5" aria-hidden="true" /></div>
                        <h3 className="text-2xl font-black text-foreground">{moodLabels[moodKey]?.[language] || sentenceCase(mood) || t.moodFallback}</h3>
                      </div>
                      <div className="mt-5 grid gap-x-8 gap-y-7 md:grid-cols-2 xl:grid-cols-3">
                        {tenseEntries.map(([tense, value]) => {
                          const forms = normalizeForms(value);
                          if (forms.length === 0) return null;
                          return (
                            <section key={tense} className="border-t-2 border-slate-900 pt-3 dark:border-blue-200">
                              <h4 className="text-sm font-black text-blue-900 dark:text-blue-200">{sentenceCase(tense) || t.tenseFallback}</h4>
                              <ol className="mt-3 space-y-1.5" dir="ltr">
                                {forms.map((form, index) => (
                                  <li key={`${form}-${index}`} className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-foreground odd:bg-secondary/65">
                                    <ChevronRight className="size-3.5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                                    <span>{form}</span>
                                  </li>
                                ))}
                              </ol>
                            </section>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="grid min-h-72 place-items-center rounded-[26px] border border-dashed border-border bg-card px-6 text-center">
              <div><Languages className="mx-auto size-9 text-blue-700" aria-hidden="true" /><h2 className="mt-4 text-xl font-black text-foreground">{t.emptyTitle}</h2><p className="mt-2 text-sm text-muted-foreground">{t.emptyText}</p></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default FrenchConjugator;
