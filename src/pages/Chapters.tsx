import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { LANGUAGE_STORAGE_KEY, type AppLanguage } from "@/components/LanguageGate";
import type { AppSubject } from "@/pages/Subjects";
import {
  SUBJECT_STORAGE_KEY,
  PREVIOUS_SUBJECT_STORAGE_KEY,
  PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY,
} from "@/pages/Subjects";
import SubjectAgent from "@/components/SubjectAgent";
import { ENGLISH_CATEGORY_STORAGE_KEY, type EnglishCategory } from "@/pages/EnglishCategory";
import CrossfadeSubjectTheme from "@/components/CrossfadeSubjectTheme";
import SeoHead from "@/components/SeoHead";
import haydarDiwanImage from "@/assets/teachers/haydar-diwan-flashcards.png";
import { getFlashcardChapters, type FlashcardSection } from "@/data/flashcardChapters";



const copy = {
  en: {
    title: "Choose a Chapter",
    description: "Eight chapters of physics, distilled into beautiful flashcards. Start with what you need.",
  },
  ar: {
    title: "اختر الفصل",
    description: "ثمانية فصول في الفيزياء، مختصرة في بطاقات تعليمية جميلة. ابدأ بما تحتاجه.",
  },
};

const teacherBadge: Partial<Record<AppSubject, { ar: string; en: string }>> = {
  math: { ar: "احمد فتحي النداوي", en: "AHMED FATHI AL-NADAWI" },
  physics: { ar: "حيدر ديوان", en: "HYDAR DIWAN" },
  chemistry: { ar: "احمد النداوي", en: "AHMED AL-NADAWI" },
  biology: { ar: "محمد العنزي", en: "MOHAMMED AL-ANZI" },
  english: { ar: "محمد النداوي", en: "MOHAMMED AL-NADAWI" },
  french: { ar: "محمد علي الكناني", en: "MOHAMMED ALI AL-KANANI" },
  arabic: { ar: "", en: "" },
};

const Chapters = ({ language, subject, onChangeLanguage }: { language: AppLanguage; subject: AppSubject; onChangeLanguage: () => void }) => {
  const navigate = useNavigate();
  const text = copy[language];
  const [physicsTeacherSelected, setPhysicsTeacherSelected] = useState(() =>
    subject !== "physics" || sessionStorage.getItem(PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY) === "haydar-diwan"
  );
  const showPhysicsTeacherPicker = subject === "physics" && !physicsTeacherSelected;
  const badge = (teacherBadge[subject] ?? { ar: "", en: "" })[language];
  const englishCategory = (typeof window !== "undefined"
    ? (localStorage.getItem(ENGLISH_CATEGORY_STORAGE_KEY) as EnglishCategory | null)
    : null);
  const chapters = getFlashcardChapters(subject, (englishCategory ?? "grammar") as FlashcardSection);

  const handleChangeLanguage = () => {
    localStorage.removeItem(SUBJECT_STORAGE_KEY);
    sessionStorage.removeItem(PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY);
    onChangeLanguage();
  };

  const chooseHaydarDiwan = () => {
    sessionStorage.setItem(PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY, "haydar-diwan");
    setPhysicsTeacherSelected(true);
  };

  const handleClick = (chapter: typeof chapters[number]) => {
    if (!chapter.locked) navigate(`/flashcards/${chapter.n}`);
  };

  return (
    <>
    <SeoHead
      path="/"
      title={language === "ar" ? "تميزك — فصول ومواد السادس العلمي" : "Tamayzak — Sixth Scientific chapters and subjects"}
      description={language === "ar"
        ? "اختر مادتك وفصلك في تميزك: فلاش كاردات، ملخصات، أسئلة وزارية ومتابعة تقدم لطلاب السادس العلمي في العراق."
        : "Pick your subject and chapter on Tamayzak: flashcards, notes, ministerial questions and progress tracking for Iraq's Sixth Scientific students."}
    />
    <main className="min-h-screen px-4 py-12 md:py-20 pb-48 relative overflow-hidden" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl animate-float" style={{ animationDelay: "4s" }} />

      {/* Subject theme crossfade */}
      <CrossfadeSubjectTheme
        subject={subject}
        previousSubject={typeof window !== "undefined" ? (localStorage.getItem(PREVIOUS_SUBJECT_STORAGE_KEY) as AppSubject | null) : null}
        onComplete={() => {
          try { localStorage.removeItem(PREVIOUS_SUBJECT_STORAGE_KEY); } catch { /* ignore */ }
        }}
      />

      <button
        onClick={handleChangeLanguage}
        aria-label={language === "ar" ? "تغيير اللغة" : "Change language"}
        className="absolute top-6 left-6 z-20 w-11 h-11 rounded-full border border-white/10 bg-secondary/60 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:-translate-x-0.5 transition-all duration-300 animate-fade-up"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <header className="text-center max-w-3xl mx-auto z-10 relative animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-secondary/40 backdrop-blur mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {showPhysicsTeacherPicker ? (language === "ar" ? "الفيزياء" : "Physics") : badge}
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold gradient-text leading-[1.1] mb-4">
          {showPhysicsTeacherPicker
            ? (language === "ar" ? "اختر المدرّس" : "Choose your teacher")
            : text.title}
        </h1>
        <p className="text-muted-foreground md:text-lg max-w-xl mx-auto">
          {showPhysicsTeacherPicker
            ? (language === "ar"
                ? "اختر المدرّس لعرض فصول الفيزياء وبطاقاتها التعليمية."
                : "Choose a teacher to view all eight physics chapters and their flashcards.")
            : subject === "math"
              ? (language === "ar" ? "اختر الفصل المتاح لمراجعة بطاقات الرياضيات." : "Choose an available mathematics chapter to review its flashcards.")
              : text.description}
        </p>
      </header>

      {showPhysicsTeacherPicker ? (
        <section className="relative z-10 mx-auto mt-12 flex max-w-5xl justify-center md:mt-16">
          <button
            type="button"
            onClick={chooseHaydarDiwan}
            className="group relative aspect-square w-full max-w-[390px] overflow-hidden rounded-[2rem] border border-primary/40 bg-secondary text-start shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-primary hover:shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            aria-label={language === "ar" ? "فتح بطاقات حيدر ديوان" : "Open Haydar Diwan flashcards"}
          >
            <img
              src={haydarDiwanImage}
              alt="حيدر ديوان"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white md:p-7" dir="rtl">
              <div>
                <span className="mb-2 inline-flex rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[11px] font-bold backdrop-blur-md">
                  8 {language === "ar" ? "فصول" : "Chapters"}
                </span>
                <h2 className="text-3xl font-black drop-shadow-lg">حيدر ديوان</h2>
                <p className="mt-1 text-sm font-medium text-white/80">Hydar Diwan · Physics Teacher</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md transition-transform duration-300 group-hover:-translate-x-1">
                <ArrowRight className="h-5 w-5 rotate-180" />
              </span>
            </div>
          </button>
        </section>
      ) : (
      <section className="max-w-6xl mx-auto mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 z-10 relative">
        {chapters.map((c, i) => {
          const isAvailable = !c.locked;
          return (
            <button
              key={c.n}
              onClick={() => handleClick(c)}
              disabled={c.locked}
              style={{ animationDelay: `${i * 70}ms` }}
              className={`group relative text-left rounded-3xl p-6 h-56 border backdrop-blur overflow-hidden transition-all duration-500 animate-fade-up
                ${isAvailable
                  ? "border-primary/40 bg-secondary/40 hover:-translate-y-2 hover:border-primary cursor-pointer shadow-lg hover:shadow-[var(--shadow-glow)]"
                  : "border-white/5 bg-secondary/20 opacity-60 cursor-not-allowed"}`}
            >
              {/* Gradient sheen for available */}
              {isAvailable && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "var(--gradient-primary)", mixBlendMode: "overlay" }}
                />
              )}

              {/* Number */}
              <div className="relative z-10 flex items-start justify-between">
                <span
                  className={`text-6xl font-bold font-mono leading-none ${
                    isAvailable ? "gradient-text" : "text-muted-foreground/40"
                  }`}
                >
                  {String(c.n).padStart(2, "0")}
                </span>
                {c.locked ? (
                  <Lock className="w-4 h-4 text-muted-foreground/60" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                )}
              </div>

              {/* Title */}
              <div className="relative z-10 absolute bottom-6 left-6 right-6">
                <h3 className={`text-lg font-semibold mb-1 ${language === "ar" ? "text-center" : ""} ${isAvailable ? "text-foreground" : "text-muted-foreground"}`}>
                  {language === "ar" ? c.arTitle : c.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{c.subtitle}</p>
              </div>

              {/* Bottom border accent */}
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
      )}

      <footer className="text-center mt-16 text-xs text-muted-foreground tracking-widest z-10 relative">
        {"\n"}
      </footer>
      {!showPhysicsTeacherPicker && <SubjectAgent subject={subject} language={language} />}
    </main>
    </>
  );
};

export default Chapters;
