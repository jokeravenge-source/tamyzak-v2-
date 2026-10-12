import { ArrowRight, BookOpen, Languages, ListChecks, Video } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { NADIA_CURRICULA, type NadiaCurriculum } from "@/data/nadiaTeacherContent";

export default function NadiaCurriculumCards({ language, onSelect }: {
  language: AppLanguage;
  onSelect: (curriculum: NadiaCurriculum) => void;
}) {
  const isArabic = language === "ar";
  const title = isArabic ? "المحاضرات وبنك الأسئلة" : "Lectures & MCQ Bank";

  return (
    <section className="grid gap-4 sm:grid-cols-2" aria-label={isArabic ? "اختَر المنهج" : "Choose curriculum"}>
      {NADIA_CURRICULA.map((curriculum) => (
        <button
          type="button"
          key={curriculum.id}
          onClick={() => onSelect(curriculum.id)}
          aria-label={`${title} — ${curriculum[language]}`}
          className="group rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-sky-500/10 p-6 text-start shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            {curriculum.id === "ar" ? <BookOpen className="h-6 w-6" /> : <Languages className="h-6 w-6" />}
          </span>
          <h2 className="text-xl font-black text-foreground">{curriculum[language]}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-primary">
            <Video className="h-4 w-4" /> <ListChecks className="h-4 w-4" /> {title}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {isArabic
              ? "محاضرات وملاحظات وأسئلة خاصة بهذا المنهج. اختَر الفصل للبدء."
              : "Lectures, notes, and questions for this curriculum. Choose a chapter to begin."}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-primary">
            {isArabic ? "فتح الفصول" : "Open chapters"} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </span>
        </button>
      ))}
    </section>
  );
}
