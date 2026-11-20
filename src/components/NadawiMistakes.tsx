import { useEffect, useState } from "react";
import type { AppLanguage } from "./LanguageGate";
import { getNadawiMistakes, type NadawiMistake } from "@/lib/nadawiContestApi";

export default function NadawiMistakes({ language, adminTest = false }: { language: AppLanguage; adminTest?: boolean }) {
  const ar = language === "ar";
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NadawiMistake[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open) return;
    let active = true;
    setError(false);
    void getNadawiMistakes(adminTest).then((rows) => { if (active) setItems(rows); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [open, adminTest, retry]);
  return <details className="rounded-2xl border border-rose-200/30 bg-rose-100/5 p-4 text-start" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary className="min-h-8 cursor-pointer font-bold text-rose-100">{ar ? "مراجعة أغلاطي" : "Review my mistakes"}{items !== null ? ` (${items.length})` : ""}</summary>
    {open && <div className="mt-4 space-y-4">
      {error ? <div role="alert" className="space-y-2 text-sm text-amber-100"><p>{ar ? "تعذّر تحميل أغلاطك. جرّب مرة ثانية." : "Could not load your mistakes. Please retry."}</p><button type="button" className="min-h-11 rounded-xl border border-white/25 px-4 py-2 font-bold" onClick={() => setRetry((value) => value + 1)}>{ar ? "إعادة تحميل الأغلاط" : "Retry mistakes"}</button></div> : items === null ? <p role="status" className="text-sm">{ar ? "جاري تحميل أغلاطك…" : "Loading your mistakes…"}</p> : items.length === 0 ? <p className="text-sm text-emerald-200">{ar ? "عاشت إيدك! كل إجاباتك صحيحة، ما عندك أغلاط." : "Well done! All your answers are correct. No mistakes to review."}</p> : <ol className="space-y-4">{items.map((item) => <li key={item.question_number} className="space-y-3 rounded-xl border border-white/15 bg-white/5 p-4">
        <p className="text-xs font-bold text-blue-100">{ar ? "السؤال" : "Question"} {item.question_number}{item.timed_out ? (ar ? " · انتهى الوقت" : " · Timed out") : ""}</p>
        <p dir="ltr" className="break-words font-bold leading-7">{item.prompt}</p>
        {item.word_bank.length > 0 && <p dir="ltr" className="text-sm text-blue-100">Word box: {item.word_bank.join(" · ")}</p>}
        <div className="space-y-1 text-sm"><p className="text-rose-200">{ar ? "إجابتك" : "Your answer"}</p><p dir="auto" className="break-words leading-7">{item.user_answer ?? (ar ? "ما جاوبت" : "No answer")}</p></div>
        <div className="space-y-1 text-sm"><p className="text-emerald-200">{ar ? "الجواب الصحيح" : "Correct answer"}</p><p dir="ltr" className="break-words font-bold leading-7 text-emerald-100">{item.correct_answers.join(" / ")}</p></div>
      </li>)}</ol>}
    </div>}
  </details>;
}
