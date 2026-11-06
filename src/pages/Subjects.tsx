import { Lock, ArrowLeft, ArrowRight, Sparkles, Atom, FlaskConical, Leaf, BookOpen, Languages as LangIcon, RefreshCw, Moon, Sigma } from "lucide-react";
import { LANGUAGE_STORAGE_KEY, type AppLanguage } from "@/components/LanguageGate";
import { Helmet } from "react-helmet-async";
import SeoHead from "@/components/SeoHead";
import {
  MALAZAM_SEO_CATEGORIES,
  MALAZAM_SEO_ITEMS,
  getMalazamItemsForSubject,
  getMalazamSeoCategory,
  getMalazamSeoItem,
} from "@/data/malazamSeo";

export const SUBJECT_STORAGE_KEY = "app_subject_v1";
export const PREVIOUS_SUBJECT_STORAGE_KEY = "app_previous_subject_v1";
export const PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY = "physics_flashcard_teacher_v1";
export const BIOLOGY_FLASHCARD_TEACHER_STORAGE_KEY = "biology_flashcard_teacher_v1";
export const CHEMISTRY_FLASHCARD_TEACHER_STORAGE_KEY = "chemistry_flashcard_teacher_v1";

export type AppSubject = "physics" | "english" | "chemistry" | "biology" | "french" | "arabic" | "islamic" | "math" | "revision";

const subjects: Array<{
  code: AppSubject;
  en: string;
  ar: string;
  Icon: React.ComponentType<{ className?: string }>;
  locked: boolean;
}> = [
  { code: "physics", en: "Physics", ar: "الفيزياء", Icon: Atom, locked: false },
  { code: "chemistry", en: "Chemistry", ar: "الكيمياء", Icon: FlaskConical, locked: false },
  { code: "biology", en: "Biology", ar: "الأحياء", Icon: Leaf, locked: false },
  { code: "english", en: "English", ar: "الإنجليزية", Icon: BookOpen, locked: false },
  { code: "french", en: "French", ar: "الفرنسية", Icon: LangIcon, locked: false },
  { code: "arabic", en: "Arabic", ar: "العربية", Icon: BookOpen, locked: false },
  { code: "islamic", en: "Islamic", ar: "التربية الإسلامية", Icon: Moon, locked: false },
  { code: "math", en: "Mathematics", ar: "الرياضيات", Icon: Sigma, locked: false },
];

const revisionSubject = { code: "revision" as AppSubject, en: "Revision", ar: "المراجعة", Icon: RefreshCw, locked: false };

const copy = {
  en: {
    badge: "Choose Subject",
    title: "Pick a Subject",
    description: "Select the subject you want to study. More subjects coming soon.",
    soon: "Coming soon",
  },
  ar: {
    badge: "اختر المادة",
    title: "اختر المادة",
    description: "اختر المادة التي تريد دراستها. المزيد من المواد قريباً.",
    soon: "قريباً",
  },
};

const Subjects = ({
  language,
  onChangeLanguage,
  onSelectSubject,
  mode = "flashcards",
}: {
  language: AppLanguage;
  onChangeLanguage: () => void;
  onSelectSubject: (subject: AppSubject) => void;
  mode?: "flashcards" | "malazam";
}) => {
  const text = copy[language];
  const displayedSubjects = mode === "malazam" ? [...subjects, revisionSubject] : subjects;
  const malazamSlug =
    mode === "malazam" && typeof window !== "undefined"
      ? decodeURIComponent(window.location.pathname.replace(/\/+$/, "").split("/")[2] ?? "")
      : "";
  const seoItem = getMalazamSeoItem(malazamSlug);
  const requestedCategory = getMalazamSeoCategory(malazamSlug);
  const seoCategory = requestedCategory ?? getMalazamSeoCategory(seoItem?.subject);
  const categoryItems = getMalazamItemsForSubject(seoCategory?.slug);
  const seoTitle = seoItem
    ? `${seoItem.title} PDF | تميزك`
    : requestedCategory
      ? `${requestedCategory.title} | تميزك`
      : "ملازم السادس العلمي 2027 PDF | تميزك";
  const resolvedSeoPath = seoItem || requestedCategory ? `/malazam/${malazamSlug}/` : "/malazam/";
  const seoDescription = seoItem?.description ?? requestedCategory?.description ??
    "تصفح ملازم السادس العلمي 2027 لجميع المواد والأساتذة في العراق من خلال منصة تميزك التعليمية.";
  const learningResourceJsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: seoItem?.title ?? requestedCategory?.title ?? "ملازم السادس العلمي 2027",
    description: seoDescription,
    url: `https://tamyazak.site${resolvedSeoPath}`,
    inLanguage: "ar",
    educationalLevel: "السادس العلمي",
    provider: {
      "@type": "Organization",
      name: "تميزك",
      url: "https://tamyazak.site/",
    },
  };

  const handleChangeLanguage = () => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    localStorage.removeItem(SUBJECT_STORAGE_KEY);
    onChangeLanguage();
  };

  const handleClick = (s: typeof subjects[number]) => {
    if (s.locked) return;
    if (mode === "malazam") {
      window.location.assign(`/malazam/${s.code}/`);
      return;
    }
    const previousSubject = localStorage.getItem(SUBJECT_STORAGE_KEY) as AppSubject | null;
    if (previousSubject && previousSubject !== s.code) {
      localStorage.setItem(PREVIOUS_SUBJECT_STORAGE_KEY, previousSubject);
    }
    if (s.code === "physics") {
      sessionStorage.removeItem(PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY);
    }
    if (s.code === "biology") {
      sessionStorage.removeItem(BIOLOGY_FLASHCARD_TEACHER_STORAGE_KEY);
    }
    if (s.code === "chemistry") {
      sessionStorage.removeItem(CHEMISTRY_FLASHCARD_TEACHER_STORAGE_KEY);
    }
    localStorage.setItem(SUBJECT_STORAGE_KEY, s.code);
    onSelectSubject(s.code);
  };

  return (
    <main className="min-h-screen px-4 py-12 md:py-20 relative overflow-hidden" dir={language === "ar" ? "rtl" : "ltr"}>
      {mode === "malazam" && (
        <>
          <SeoHead path={resolvedSeoPath} title={seoTitle} description={seoDescription} />
          <Helmet>
            <html lang="ar" dir="rtl" />
            <script type="application/ld+json">{JSON.stringify(learningResourceJsonLd)}</script>
          </Helmet>
        </>
      )}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <button
        onClick={handleChangeLanguage}
        aria-label={language === "ar" ? "تغيير اللغة" : "Change language"}
        className="absolute top-6 left-6 z-20 w-11 h-11 rounded-full border border-white/10 bg-secondary/60 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-300 animate-fade-up"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <header className="text-center max-w-3xl mx-auto z-10 relative animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-secondary/40 backdrop-blur mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{text.badge}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold gradient-text leading-[1.25] mb-4">
          {seoItem?.title ?? requestedCategory?.title ?? "ملازم السادس العلمي 2027"}
        </h1>
        <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto leading-relaxed">
          {mode === "malazam" ? seoDescription : text.description}
        </p>
        {(seoItem || requestedCategory) && (
          <p className="mt-3 text-sm font-semibold text-primary">
            {seoItem ? `المادة: ${seoCategory?.name ?? "السادس العلمي"}` : "اختر الملزمة أو افتح ملفات المادة"}
          </p>
        )}
      </header>

      {mode === "malazam" && (seoItem || requestedCategory) && (
        <nav aria-label="مسار الصفحة" className="max-w-6xl mx-auto mt-8 relative z-10 text-sm text-muted-foreground">
          <a className="hover:text-primary" href="/malazam/">الملازم</a>
          <span className="mx-2">/</span>
          {seoItem && seoCategory ? (
            <>
              <a className="hover:text-primary" href={`/malazam/${seoCategory.slug}/`}>{seoCategory.name}</a>
              <span className="mx-2">/</span>
              <span>{seoItem.title}</span>
            </>
          ) : (
            <span>{requestedCategory?.name}</span>
          )}
        </nav>
      )}

      {mode === "malazam" && seoCategory && (
        <section className="max-w-6xl mx-auto mt-8 relative z-10 rounded-3xl border border-primary/30 bg-secondary/50 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-foreground">
            {seoItem ? "الوصول إلى الملزمة" : `ملازم ${seoCategory.name}`}
          </h2>
          <p className="mt-3 text-muted-foreground leading-7">
            {seoItem?.description ?? seoCategory.description}
          </p>
          {seoItem?.teacher && (
            <p className="mt-3 text-sm text-foreground">إعداد: <strong>{seoItem.teacher}</strong></p>
          )}
          <a
            href={seoCategory.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:opacity-90"
          >
            افتح ملفات {seoCategory.name}
          </a>
        </section>
      )}

      <section className="max-w-6xl mx-auto mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 z-10 relative">
        {displayedSubjects.map((s, i) => {
          const Icon = s.Icon;
          const isAvailable = !s.locked;
          return (
            <button
              key={s.code}
              onClick={() => handleClick(s)}
              disabled={s.locked}
              style={{ animationDelay: `${i * 70}ms` }}
              className={`group relative text-left rounded-3xl p-6 h-44 border backdrop-blur overflow-hidden transition-all duration-500 animate-fade-up
                ${isAvailable
                  ? "border-primary/40 bg-secondary/40 hover:-translate-y-2 hover:border-primary cursor-pointer shadow-lg hover:shadow-[var(--shadow-glow)]"
                  : "border-white/5 bg-secondary/20 opacity-60 cursor-not-allowed"}`}
            >
              {isAvailable && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "var(--gradient-primary)", mixBlendMode: "overlay" }}
                />
              )}

              <div className="relative z-10 flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAvailable ? "bg-primary/15" : "bg-muted/20"}`}>
                  <Icon className={`w-6 h-6 ${isAvailable ? "text-primary" : "text-muted-foreground/60"}`} />
                </div>
                {s.locked ? (
                  <Lock className="w-4 h-4 text-muted-foreground/60" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                )}
              </div>

              <div className="relative z-10 mt-6">
                <h3 className={`text-2xl font-semibold mb-1 ${isAvailable ? "text-foreground" : "text-muted-foreground"}`}>
                  {language === "ar" ? s.ar : s.en}
                </h3>
                {s.locked && <p className="text-xs text-muted-foreground">{text.soon}</p>}
              </div>

              {isAvailable && (
                <div
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700"
                  style={{ background: "var(--gradient-primary)" }}
                />
              )}
            </button>
          );
        })}
      </section>

      {mode === "malazam" && (
        <section className="max-w-6xl mx-auto mt-16 relative z-10" aria-labelledby="malazam-catalog-title">
          <h2 id="malazam-catalog-title" className="text-2xl md:text-3xl font-bold text-foreground">
            {seoCategory ? `ملازم أخرى في ${seoCategory.name}` : "تصفح الملازم حسب المادة"}
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(seoCategory ? categoryItems : MALAZAM_SEO_CATEGORIES).map((entry) => {
              const isItem = "subject" in entry;
              const href = `/malazam/${entry.slug}/`;
              return (
                <a key={entry.slug} href={href} className="rounded-2xl border border-white/10 bg-secondary/40 p-5 transition hover:-translate-y-1 hover:border-primary/50">
                  <h3 className="font-bold text-foreground">{isItem ? entry.title : entry.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">{entry.description}</p>
                </a>
              );
            })}
          </div>

          {!seoCategory && (
            <div className="mt-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">أحدث ملازم السادس العلمي</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MALAZAM_SEO_ITEMS.map((item) => (
                  <a key={item.slug} href={`/malazam/${item.slug}/`} className="rounded-2xl border border-white/10 bg-secondary/30 p-5 transition hover:border-primary/50">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default Subjects;
