import { useEffect, useRef, useState } from "react";
import { Maximize2, RotateCcw } from "lucide-react";
import { SourceExcerpt, type SourceCardMedia } from "./SourceExcerpt";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import type { SrsRating } from "@/lib/srs";
type Props = { question: string; answer: string; sourceMedia: SourceCardMedia; index: number; total: number; language?: "ar" | "en"; onRate?: (rating: SrsRating) => void; intervalHints?: Partial<Record<SrsRating, string>> };
export function SourceFlashcard({ question, answer, sourceMedia, index, total, language = "en", onRate, intervalHints }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const reading = useRef<HTMLDivElement>(null);
  const ar = language === "ar";
  useEffect(() => { setRevealed(false); setEnlarged(false); reading.current?.scrollTo?.(0, 0); }, [question, index]);
  useEffect(() => { reading.current?.scrollTo?.(0, 0); }, [revealed]);
  const regions = revealed ? sourceMedia.answer : sourceMedia.question;
  return <section className="w-full max-w-3xl space-y-3" aria-label={ar ? "بطاقة من الملزمة الأصلية" : "Source flashcard"}>
    <div className="overflow-hidden rounded-3xl border border-border bg-card text-card-foreground">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 text-sm">
        <strong aria-live="polite">{revealed ? (ar ? "الإجابة الأصلية كاملة" : "Complete original answer") : (ar ? "السؤال" : "Question")}</strong>
        <span className="tabular-nums text-muted-foreground">{index + 1} / {total}</span>
      </div>
      <div ref={reading} className="max-h-[58dvh] min-h-48 overflow-auto overscroll-contain p-3 sm:p-5" tabIndex={0} aria-label={ar ? "محتوى البطاقة؛ مرر للقراءة" : "Card content; scroll to read"}>
        {regions.length ? <SourceExcerpt regions={regions} label={revealed ? answer : question} /> : <p className="whitespace-pre-line px-3 py-10 text-center text-xl font-semibold leading-9">{question}</p>}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border p-3">
        <button type="button" aria-pressed={revealed} onClick={() => setRevealed(v => !v)} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><RotateCcw size={17} />{revealed ? (ar ? "رجوع للسؤال" : "Back to question") : (ar ? "إظهار الجواب" : "Reveal answer")}</button>
        <button type="button" onClick={() => setEnlarged(true)} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-4 hover:bg-accent"><Maximize2 size={17} />{ar ? "تكبير" : "Enlarge"}</button>
      </div>
    </div>
    <p className="px-1 text-xs leading-5 text-muted-foreground">{ar ? "المقاطع الأصلية تحافظ على نص الملزمة والرموز وخطوات الحل كاملة. مرّر لقراءة التكملة." : "Original excerpts preserve the source wording, symbols and working. Scroll to read every part."}</p>
    {revealed && onRate && <div className="grid grid-cols-4 gap-2">{([['forgot','نسيت','Forgot'],['hard','صعبة','Hard'],['good','جيدة','Good'],['easy','سهلة','Easy']] as const).map(([rating, arabic, english]) => <button key={rating} type="button" onClick={() => onRate(rating)} className="min-h-12 rounded-xl border border-border bg-card p-2 text-sm font-semibold hover:bg-accent">{ar ? arabic : english}{intervalHints?.[rating] && <small className="block font-normal text-muted-foreground">{intervalHints[rating]}</small>}</button>)}</div>}
    <Dialog open={enlarged} onOpenChange={setEnlarged}><DialogContent className="max-h-[90dvh] max-w-5xl overflow-auto"><DialogTitle>{revealed ? (ar ? "الإجابة الأصلية" : "Original answer") : (ar ? "السؤال الأصلي" : "Original question")}</DialogTitle>{regions.length ? <SourceExcerpt regions={regions} label={revealed ? answer : question} enlarged /> : <p className="whitespace-pre-line text-xl leading-9">{question}</p>}</DialogContent></Dialog>
  </section>;
}
