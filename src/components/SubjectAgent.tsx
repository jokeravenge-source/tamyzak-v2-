import MutamayizMascot from "./MutamayizMascot";
import type { AppSubject } from "@/pages/Subjects";
import type { AppLanguage } from "@/components/LanguageGate";
export default function SubjectAgent({ subject, language }: { subject: AppSubject; language: AppLanguage }) {
  return <button onClick={() => window.dispatchEvent(new CustomEvent("app:open-mutamayiz", { detail: { subject } }))} className="my-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 font-bold text-blue-700 dark:text-blue-200"><MutamayizMascot className="size-7" />{language === "ar" ? "اسأل متميز عن المادة" : "Ask متميز about this subject"}</button>;
}
