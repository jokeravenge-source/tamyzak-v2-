import { GraduationCap } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import type { AppSubject } from "@/pages/Subjects";

export function FlashcardTeacherBadge({ language, subject }: { language: AppLanguage; subject: AppSubject }) {
  // Physics currently has one teacher: do not attribute other subjects to him.
  if (subject !== "physics") return null;

  const arabic = language === "ar";
  return (
    <p className="mt-3 flex justify-center" dir={arabic ? "rtl" : "ltr"}>
      <span className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm">
        <GraduationCap className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="text-muted-foreground">{arabic ? "المدرّس" : "Teacher"}</span>
        <span className="font-bold text-primary">{arabic ? "حيدر ديوان" : "Haydar Diwan"}</span>
      </span>
    </p>
  );
}
