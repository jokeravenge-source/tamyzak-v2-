import { useEffect, useRef, useState } from "react";
import type { SrsRating } from "@/lib/srs";
import { TextStudyContent, type StudyTextBlock } from "./TextStudyContent";

type Props = {
  question: string;
  answerBlocks: StudyTextBlock[];
  index: number;
  total: number;
  onRate?: (rating: SrsRating) => void;
  intervalHints?: Partial<Record<SrsRating, string>>;
};

export function TextStudyFlashcard({ question, answerBlocks, index, total, onRate, intervalHints }: Props) {
  const [revealed, setRevealed] = useState(false);
  const pane = useRef<HTMLDivElement>(null);
  useEffect(() => { setRevealed(false); pane.current?.scrollTo?.(0, 0); }, [question, index]);
  return <section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-lg sm:p-7" aria-label="Text flashcard">
    <div className="mb-5 flex justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground"><span>Question</span><span>{index + 1} / {total}</span></div>
    <div ref={pane} className="max-h-[58dvh] min-h-28 overflow-y-auto overscroll-contain pr-1">
      <p className="whitespace-pre-line break-words text-lg font-semibold leading-8 sm:text-xl" dir="auto">{question}</p>
      {revealed && <div className="mt-6 border-t border-border pt-5" aria-label="Answer">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Answer</p>
        <TextStudyContent blocks={answerBlocks} />
      </div>}
    </div>
    <button type="button" className="mt-5 min-h-11 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" aria-expanded={revealed} onClick={() => setRevealed(v => !v)}>{revealed ? "Hide answer" : "Reveal answer"}</button>
    {revealed && onRate && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {([['forgot', 'Again'], ['hard', 'Hard'], ['good', 'Good'], ['easy', 'Easy']] as const).map(([rating, label]) => <button key={rating} type="button" onClick={() => onRate(rating)} className="min-h-11 rounded-xl border border-border p-2 text-sm hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{label}{intervalHints?.[rating] && <span className="block text-xs text-muted-foreground">{intervalHints[rating]}</span>}</button>)}
    </div>}
  </section>;
}
