import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePodcastSpeech } from "@/hooks/usePodcastSpeech";
import PodcastSpeakingText from "./PodcastSpeakingText";
import MutamayizMascot from "./MutamayizMascot";

export default function PodcastQuestion({
  segmentId,
  onClose,
}: {
  segmentId: string;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<
    { question: string; answer: string }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [speakingAnswer, setSpeakingAnswer] = useState<number | null>(null);
  const [error, setError] = useState("");
  const request = useRef(0);
  const dialog = useRef<HTMLDivElement | null>(null);
  const speech = usePodcastSpeech();
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      request.current++;
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  const ask = async () => {
    if (busy || question.trim().length < 2) return;
    speech.stop();
    const id = ++request.current;
    setBusy(true);
    setError("");
    const text = question.trim();
    try {
      const { data, error: failure } = await supabase.functions.invoke(
        "ask-podcast-question",
        {
          body: {
            segment_id: segmentId,
            question: text,
            history: history.slice(-3).map((item) => ({
              question: item.question.slice(0, 500),
              answer: item.answer.slice(0, 1500),
            })),
          },
        },
      );
      if (id !== request.current) return;
      if (failure || typeof data?.answer !== "string")
        throw new Error("Question failed");
      setHistory((items) => [
        ...items,
        { question: text, answer: data.answer },
      ]);
      setSpeakingAnswer(history.length);
      setQuestion("");
      speech.play(data.answer, {
        onEnd: () => {},
        onError: () => setError("تعذّر تشغيل الجواب، تكدر تقراه وتعيد تشغيله."),
      });
    } catch {
      if (id === request.current) setError("تعذّر جواب السؤال. جرّب مرة ثانية.");
    } finally {
      if (id === request.current) setBusy(false);
    }
  };
  const button =
    "rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-bold disabled:opacity-50";
  return (
    <div
      ref={dialog}
      className="fixed inset-0 z-[180] overflow-y-auto overscroll-contain bg-slate-950/95 p-5 text-white"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
        if (event.key !== "Tab") return;
        const controls = dialog.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), textarea:not([disabled])",
        );
        if (!controls?.length) return;
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="podcast-question-title"
      dir="rtl"
    >
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center gap-4">
          <MutamayizMascot alt="متميّز" speaking={speech.playing} className="size-20" />
          <h2 id="podcast-question-title" className="text-2xl font-black">
            اسأل المدرّس عن هذا الجزء
          </h2>
        </div>
        <p>الشرح متوقف. ترجع وتكمّل الصوت من نفس المكان.</p>
        <button className={button} onClick={onClose}>
          رجوع للشرح
        </button>
        {history.map((item, index) => (
          <article
            key={index}
            className="space-y-3 rounded-2xl border border-white/15 p-4"
          >
            <p className="font-bold">{item.question}</p>
            <p className="whitespace-pre-wrap leading-8">
              <PodcastSpeakingText
                text={item.answer}
                phrase={index === speakingAnswer ? speech.phrase : ""}
                offset={speech.offset}
              />
            </p>
            <button
              className={button}
              onClick={() => {
                setSpeakingAnswer(index);
                speech.play(item.answer, {
                  onEnd: () => {},
                  onError: () => setError("تعذّر تشغيل الصوت."),
                });
              }}
            >
              اسمع الجواب
            </button>
          </article>
        ))}
        {speech.active && (
          <button
            className={button}
            onClick={speech.paused ? speech.resume : speech.pause}
          >
            {speech.paused ? "متابعة صوت الجواب" : "إيقاف صوت الجواب مؤقتاً"}
          </button>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void ask();
          }}
          className="space-y-3"
        >
          <label className="block">
            سؤالك
            <textarea
              autoFocus
              className="mt-2 block min-h-28 w-full rounded-xl bg-slate-900 p-3"
              maxLength={2000}
              value={question}
              disabled={busy}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </label>
          <button
            className={button}
            disabled={busy || question.trim().length < 2}
          >
            {busy ? "المدرّس يفكّر…" : "اسأل"}
          </button>
        </form>
        {error && <p role="alert">{error}</p>}
      </div>
    </div>
  );
}
