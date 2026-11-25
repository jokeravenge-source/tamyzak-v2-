import { useEffect, useRef, useState, type FormEvent } from "react";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, Loader2, Maximize2, Pause, PenLine, Play, RotateCcw, Send, Volume2, X } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWhiteboardPlayback } from "@/hooks/useWhiteboardPlayback";
import { BOARD_QUESTION_MAX, parseBoardAnswer, type BoardAnswer, type BoardError, type BoardInput, type BoardLesson, type BoardReference, type BoardSource } from "../../../supabase/functions/_shared/whiteboard";
import { reviewedDielectricAnswer } from "../../../supabase/functions/_shared/whiteboardDielectric";
import BoardDrawing, { drawingFrame } from "./BoardDrawing";
import BoardViewport from "./BoardViewport";
import DrawingNotes from "./DrawingNotes";
import type { DrawingSelection } from "./drawingQuestions";

const copy = {
  ar: {
    step: "الخطوة", of: "من", scopes: "خطوات الدرس", board: "رسم السبورة", source: "مصدر الخطوة",
    transcript: "متميّز يشرح", play: "شغّل الشرح", pause: "إيقاف مؤقت", resume: "كمّل الشرح", replay: "أعِد الخطوة",
    prev: "الخطوة السابقة", next: "الخطوة التالية", audioProgress: "تقدّم الصوت", preparing: "جاري تجهيز الصوت…",
    nextMark: "أظهر الجزء التالي من الرسم",
    soundError: "الصوت تعذّر هسه. تكدر تقرأ الشرح وتتنقّل بين الخطوات.", retryPlay: "اضغط تشغيل حتى يبدأ الصوت.",
    ask: "اسأل عن هاي الخطوة", placeholder: "مثلاً: ليش يتغيّر هالشكل؟", send: "دزّ السؤال",
    tap: "اضغط على جزء من الرسم حتى تسأل عنه", notes: "كبّر الرسم للملاحظات", clearPart: "ألغِ تحديد الجزء",
    asking: "متميّز دا يراجع الخطوة…", followUp: "توضيح متميّز", returnToStep: "ارجع للخطوة", askError: "تعذّر التوضيح هسه. سؤالك باقي وتكدر تحاول مرة ثانية.",
    askMissing: "ما لكيت جواب لهذا السؤال بالمقتطف المربوط بالخطوة.", filePage: "صفحة الملف", bookPage: "صفحة الكتاب", openSource: "افتح المصدر",
    quiz: "إذا ضاعفنا المسافة وبقيت المساحة والعازل نفسهم، شكد تصير السعة؟",
    half: "نص السعة الأصلية", same: "تبقى نفسها", double: "ضعف السعة الأصلية",
    correct: "صح. المسافة صارت ضعفين، فالسعة صارت نص القيمة الأصلية.",
    tryAgain: "جرّب مرة ثانية. تذكّر إن المسافة بالمقام.",
  },
  en: {
    step: "Step", of: "of", scopes: "Lesson steps", board: "Whiteboard drawing", source: "Step source",
    transcript: "Mutamayiz explains", play: "Play explanation", pause: "Pause", resume: "Resume", replay: "Replay step",
    prev: "Previous step", next: "Next step", audioProgress: "Audio progress", preparing: "Preparing audio…",
    nextMark: "Show next drawing mark",
    soundError: "Audio is unavailable. Read the transcript and move between steps.", retryPlay: "Press play to start the audio.",
    ask: "Ask about this step", placeholder: "What causes this change?", send: "Send question",
    tap: "Tap part of the drawing to ask about it", notes: "Expand for notes", clearPart: "Clear drawing selection",
    asking: "Mutamayiz is reviewing this step…", followUp: "Mutamayiz clarifies", returnToStep: "Back to the step", askError: "Could not answer now. Your question is still here to retry.",
    askMissing: "The excerpt for this step does not cover that question.", filePage: "File page", bookPage: "Printed page", openSource: "Open source",
    quiz: "What happens to capacitance when the distance doubles and the area and dielectric stay fixed?",
    half: "Half its original value", same: "It stays the same", double: "Twice its original value",
    correct: "Correct. Twice the distance gives half the original capacitance.",
    tryAgain: "Try again. Remember that distance is in the denominator.",
  },
} as const;

function SourceReference({ source, reference, ar }: { source: BoardSource; reference: BoardReference; ar: boolean }) {
  const text = copy[ar ? "ar" : "en"];
  const number = (value: number) => value.toLocaleString(ar ? "ar-IQ" : "en");
  return (
    <details className="group min-w-0 rounded-xl border border-border bg-muted/35 text-sm">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 py-2 font-semibold [&::-webkit-details-marker]:hidden">
        <BookOpen aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 leading-snug [overflow-wrap:anywhere]">
          {text.source}{source.pdfPage ? " · " + text.filePage + " " + number(source.pdfPage)
            : source.printedPage ? " · " + text.bookPage + " " + number(source.printedPage) : ""}
          <bdi className="ms-2 font-normal text-muted-foreground">{source.title}</bdi>
        </span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-open:rotate-180" />
      </summary>
      <div className="space-y-2 border-t border-border px-3 pb-3 pt-2.5">
        {source.chapter && <p dir="auto" className="text-xs font-semibold text-muted-foreground">{source.chapter}</p>}
        {source.pdfPage && source.printedPage && <p className="text-xs text-muted-foreground">{text.bookPage} {number(source.printedPage)}</p>}
        <blockquote dir="auto" className="border-s-2 border-primary/40 ps-3 text-sm leading-relaxed [overflow-wrap:anywhere]">{reference.quote}</blockquote>
        {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center font-semibold text-primary underline underline-offset-4">{text.openSource}</a>}
      </div>
    </details>
  );
}

export default function WhiteboardPlayer({ lesson, input, language, ownerId }: {
  lesson: BoardLesson;
  input: BoardInput;
  language: AppLanguage;
  ownerId?: string;
}) {
  const ar = language === "ar";
  const text = copy[language];
  const player = useWhiteboardPlayback(lesson.steps, lesson.template !== "parallel-plates");
  const { index, progress, status } = player;
  const step = lesson.steps[index];
  const source = lesson.sources.find(({ id }) => id === step.reference.sourceId);
  const frame = drawingFrame(lesson, index, progress, player.instant);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<BoardAnswer | null>(null);
  const [askError, setAskError] = useState("");
  const [part, setPart] = useState<DrawingSelection | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [choice, setChoice] = useState<"same" | "double" | "half" | null>(null);
  const request = useRef<AbortController | null>(null);
  const answerPanel = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const sendButton = useRef<HTMLButtonElement>(null);
  const notesButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef(false);
  const questionStepIndex = part?.stepIndex ?? index;
  const questionStep = lesson.steps[questionStepIndex];
  const questionSource = lesson.sources.find(({ id }) => id === questionStep.reference.sourceId);
  const sounding = status === "playing" || status === "loading";
  const canContinue = status === "paused" || status === "blocked";
  const showQuiz = lesson.template === "parallel-plates" && index === lesson.steps.length - 1 && progress >= 1;
  const number = (value: number) => value.toLocaleString(ar ? "ar-IQ" : "en");

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (answer || askError) answerPanel.current?.scrollIntoView?.({ block: "nearest" });
  }, [answer, askError]);
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    sendButton.current?.focus({ preventScroll: true });
  }, [part]);

  const dismissAnswer = () => {
    request.current?.abort();
    request.current = null;
    setAsking(false);
    setAnswer(null);
    setAskError("");
  };

  const goTo = (target: number) => {
    if (target === index || target < 0 || target >= lesson.steps.length) return;
    dismissAnswer();
    setPart(null);
    setQuestion("");
    player.goTo(target);
    scroller.current?.scrollTo?.({ top: 0 });
  };

  const play = (replay = false) => {
    dismissAnswer();
    if (part) setQuestion("");
    setPart(null);
    player.play(replay);
  };

  const selectPart = (selected: DrawingSelection) => {
    player.pause();
    dismissAnswer();
    pendingFocus.current = true;
    setPart(selected);
    setQuestion(selected.question);
  };

  const ask = async (event: FormEvent) => {
    event.preventDefault();
    const questionText = question.trim();
    if (!questionText || request.current) return;
    player.pause();
    setAnswer(null);
    setAskError("");
    const reviewed = reviewedDielectricAnswer(lesson, questionText, [...frame.visible]);
    if (reviewed && questionSource?.id === reviewed.reference.sourceId) {
      setAnswer(reviewed);
      setQuestion("");
      return;
    }
    setAsking(true);
    const current = new AbortController();
    request.current = current;
    try {
      const board = questionSource?.kind === "pdf" && input.attachment?.pages
        ? { ...input, attachment: { ...input.attachment, pages: input.attachment.pages.filter(page => page.page === questionSource.pdfPage) } }
        : input;
      const { data, error } = await supabase.functions.invoke<{ answer?: BoardAnswer; error?: BoardError }>("excellence-companion", {
        body: { mode: "whiteboard_question", board, question: questionText, step: questionStep, stepIndex: questionStepIndex, visible: [...frame.visible] },
        signal: current.signal,
        timeout: 45_000,
      });
      if (request.current !== current) return;
      const valid = questionSource && !error && parseBoardAnswer(data?.answer, questionSource, [...frame.visible]);
      if (!valid) {
        setAskError(data?.error === "missing_source" ? text.askMissing : text.askError);
      } else {
        setAnswer(valid);
        setQuestion("");
      }
    } catch {
      if (request.current === current) setAskError(text.askError);
    } finally {
      if (request.current === current) {
        request.current = null;
        setAsking(false);
      }
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-6xl space-y-4 px-3 pb-5 pt-4 sm:space-y-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            {source?.chapter && <p className="mb-1 text-xs font-bold text-primary" dir="auto">{source.chapter}</p>}
            <h2 className="text-xl font-black leading-snug tracking-tight [overflow-wrap:anywhere] sm:text-3xl" dir="auto">{lesson.title}</h2>
          </div>
          <nav aria-label={text.scopes} className="flex w-full gap-1.5 sm:gap-2">
            {lesson.steps.map((item, stepIndex) => (
              <button
                key={stepIndex}
                type="button"
                onClick={() => goTo(stepIndex)}
                aria-current={stepIndex === index ? "step" : undefined}
                aria-label={text.step + " " + number(stepIndex + 1) + " · " + item.title}
                className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border px-1.5 text-xs font-bold transition-colors hover:border-primary/50 sm:rounded-xl sm:px-2.5 ${stepIndex === index
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"}`}
              >
                <span className="shrink-0 tabular-nums">{number(stepIndex + 1)}</span>
                <bdi className="hidden truncate sm:block">{item.title}</bdi>
              </button>
            ))}
          </nav>

          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] lg:gap-4">
            <section aria-label={text.board} className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-3xl">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-1.5 border-b border-border px-3 py-2.5 sm:px-4">
                <h3 className="min-w-0 font-bold leading-snug [overflow-wrap:anywhere]" dir="auto">{step.title}</h3>
                <p className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">{text.step} {number(index + 1)} {text.of} {number(lesson.steps.length)}</p>
              </div>
              <BoardViewport ar={ar}>
                <BoardDrawing template={lesson.template} frame={frame} interruption={answer?.highlight ?? null} language={language} solved={showQuiz && choice === "half"}
                  onAsk={selectPart} selected={part} />
              </BoardViewport>
              <div className="space-y-2.5 border-t border-border p-2.5 sm:px-4 sm:py-3">
                {frame.visible.size > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs leading-snug text-muted-foreground">{text.tap}</p>
                    <Button ref={notesButton} type="button" variant="outline" className="min-h-11 shrink-0 gap-1.5 rounded-xl px-2.5 text-xs"
                      onClick={() => { player.pause(); setNotesOpen(true); }}>
                      <Maximize2 aria-hidden="true" className="size-4" />{text.notes}
                    </Button>
                  </div>
                )}
                <div role="progressbar" aria-label={text.audioProgress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: (progress * 100) + "%" }} />
                </div>
                {!sounding && player.hasNextMark && <Button variant="ghost" type="button" disabled={asking}
                  onClick={() => { dismissAnswer(); if (part) setQuestion(""); setPart(null); player.advanceDrawing(); }}
                  className="min-h-9 gap-2 rounded-lg px-2 text-xs text-muted-foreground">
                  <PenLine aria-hidden="true" className="size-3.5" />{text.nextMark}
                </Button>}
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:gap-2">
                  <Button type="button" variant="outline" size="icon" disabled={index === 0} aria-label={text.prev} onClick={() => goTo(index - 1)} className="size-11 rounded-xl">
                    <ChevronLeft className={ar ? "rotate-180" : undefined} />
                  </Button>
                  <Button type="button" disabled={asking} onClick={() => sounding ? player.pause() : play()} className="min-h-11 rounded-xl px-1.5 font-bold sm:px-3">
                    {status === "loading" ? <Loader2 className="animate-spin" /> : sounding ? <Pause /> : <Play />}
                    {sounding ? text.pause : canContinue ? text.resume : text.play}
                  </Button>
                  <Button type="button" variant="outline" size="icon" disabled={asking} aria-label={text.replay} onClick={() => play(true)} className="size-11 rounded-xl">
                    <RotateCcw />
                  </Button>
                  <Button type="button" variant="outline" size="icon" disabled={index === lesson.steps.length - 1} aria-label={text.next} onClick={() => goTo(index + 1)} className="size-11 rounded-xl">
                    <ChevronRight className={ar ? "rotate-180" : undefined} />
                  </Button>
                </div>
                {(status === "loading" || status === "failed" || status === "blocked") && (
                  <p role="status" className="text-xs leading-relaxed text-muted-foreground">
                    {status === "loading" ? text.preparing : status === "failed" ? text.soundError : text.retryPlay}
                  </p>
                )}
              </div>
            </section>

            <div className="min-w-0 space-y-3">
              {(asking || answer || askError) && (
                <section ref={answerPanel} className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 sm:p-4" aria-busy={asking}>
                  <h3 className="font-black text-primary">{text.followUp}</h3>
                  <div role="status" className="min-w-0 text-sm leading-7 [overflow-wrap:anywhere]">
                    {asking ? text.asking : <p dir={answer ? "rtl" : undefined}>{answer?.reply ?? askError}</p>}
                  </div>
                  {answer && questionSource && answer.reference.sourceId === questionSource.id && <SourceReference source={questionSource} reference={answer.reference} ar={ar} />}
                  {!asking && <Button type="button" variant="outline" onClick={() => {
                    if (canContinue) play();
                    else { dismissAnswer(); setPart(null); }
                  }} className="rounded-xl">
                    {canContinue ? text.resume : text.returnToStep}
                  </Button>}
                </section>
              )}

              <section className="space-y-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm sm:p-4" aria-label={text.transcript}>
                <h3 className="flex items-center gap-2 text-sm font-black"><Volume2 aria-hidden="true" className="size-4 text-primary" />{text.transcript}</h3>
                <p lang="ar-IQ" dir="rtl" className="text-start text-[0.95rem] leading-7 [overflow-wrap:anywhere]">{step.narration}</p>
                {source && <SourceReference source={source} reference={step.reference} ar={ar} />}
              </section>

              {showQuiz && (
                <fieldset className="min-w-0 space-y-2 rounded-2xl border border-primary/25 bg-primary/5 p-3.5 sm:p-4">
                  <legend className="max-w-full rounded-lg px-1.5 text-sm font-black leading-6">{text.quiz}</legend>
                  <div className="grid gap-2">
                    {(["same", "double", "half"] as const).map(key => (
                      <Button key={key} type="button" variant="outline" disabled={choice === "half"} aria-pressed={choice === key} onClick={() => setChoice(key)}
                        className={`justify-start rounded-xl px-3 text-start aria-pressed:border-primary aria-pressed:bg-primary/10 ${choice === "half" && key === "half" ? "!border-emerald-500/50 !bg-emerald-500/10 !opacity-100" : ""}`}>
                        {key === "half" && choice === "half" && <CircleCheck aria-hidden="true" className="text-emerald-600 dark:text-emerald-300" />}{text[key]}
                      </Button>
                    ))}
                  </div>
                  {choice && <p role="status" className="text-sm font-medium leading-6 text-foreground">{choice === "half" ? text.correct : text.tryAgain}</p>}
                </fieldset>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-border bg-card">
        <form onSubmit={ask} className="mx-auto max-w-6xl space-y-1.5 px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-h-6 items-center justify-between gap-2">
            <label htmlFor="whiteboard-follow-up" className="min-w-0 truncate text-sm font-black">{part ? <bdi>{part.label}</bdi> : text.ask}</label>
            {part && <button type="button" aria-label={text.clearPart} title={text.clearPart} onClick={() => { dismissAnswer(); setPart(null); setQuestion(""); }}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X aria-hidden="true" className="size-4" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <input id="whiteboard-follow-up" value={question} placeholder={text.placeholder} maxLength={BOARD_QUESTION_MAX} onChange={event => setQuestion(event.target.value)}
              dir="auto" className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            <Button ref={sendButton} type="submit" variant="default" size="icon" aria-label={text.send} disabled={asking || !question.trim()} className="size-11 shrink-0 rounded-xl">
              {asking ? <Loader2 className="animate-spin" /> : <Send className={ar ? "-scale-x-100" : undefined} />}
            </Button>
          </div>
        </form>
      </footer>
      {notesOpen && <DrawingNotes lesson={lesson} index={index} language={language} ownerId={ownerId}
        onClose={() => setNotesOpen(false)} onReturnFocus={() => notesButton.current?.focus({ preventScroll: true })} />}
    </div>
  );
}
