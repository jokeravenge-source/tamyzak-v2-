import { useState, useEffect } from "react";
import { useRef } from "react";
import { ChevronDown, Mic, Square, Play, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { SrsRating } from "@/lib/srs";

interface FlashcardProps {
  question: string;
  answer: string;
  index: number;
  total: number;
  direction: "left" | "right";
  language?: "ar" | "en";
  /** When provided, rating buttons appear once the answer is revealed. */
  onRate?: (rating: SrsRating) => void;
  /** Short "next review in …" hints keyed by rating. */
  intervalHints?: Partial<Record<SrsRating, string>>;
  /** Enables an inner reading pane for long, structured cards. */
  comfortableScrolling?: boolean;
}

export const Flashcard = ({ question, answer, index, total, direction, language = "en", onRate, intervalHints, comfortableScrolling = false }: FlashcardProps) => {
  const [flipped, setFlipped] = useState(false);
  const labels = language === "ar"
    ? { question: "السؤال", answer: "الإجابة", reveal: "اضغط لإظهار الإجابة", back: "اضغط لرؤية السؤال", scroll: "مرّر داخل البطاقة لقراءة المزيد", record: "سجل صوتك", stop: "إيقاف التسجيل", play: "تشغيل تسجيلك", listen: "استمع للإجابة", stopAudio: "إيقاف الصوت", micError: "تعذّر الوصول إلى المايكروفون" }
    : { question: "Question", answer: "Answer", reveal: "Tap to reveal answer", back: "Tap to see question", scroll: "Scroll inside the card to read more", record: "Record your voice", stop: "Stop recording", play: "Play your recording", listen: "Hear the answer", stopAudio: "Stop audio", micError: "Microphone unavailable" };

  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const playbackRef = useRef<HTMLAudioElement | null>(null);
  const questionScrollRef = useRef<HTMLDivElement | null>(null);
  const answerScrollRef = useRef<HTMLDivElement | null>(null);
  const [questionOverflow, setQuestionOverflow] = useState(false);
  const [answerOverflow, setAnswerOverflow] = useState(false);
  const [questionAtEnd, setQuestionAtEnd] = useState(false);
  const [answerAtEnd, setAnswerAtEnd] = useState(false);

  useEffect(() => {
    setFlipped(false);
    // reset audio between cards
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    stopRecording();
    stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, question, answer]);

  // Nadia's source-derived cards often contain multi-line ministerial answers.
  // Measure both faces and expose a real inner reading pane only when needed.
  useEffect(() => {
    if (!comfortableScrolling) return;
    const questionNode = questionScrollRef.current;
    const answerNode = answerScrollRef.current;
    if (!questionNode || !answerNode) return;

    questionNode.scrollTop = 0;
    answerNode.scrollTop = 0;
    setQuestionAtEnd(false);
    setAnswerAtEnd(false);

    const measure = () => {
      setQuestionOverflow(questionNode.scrollHeight > questionNode.clientHeight + 2);
      setAnswerOverflow(answerNode.scrollHeight > answerNode.clientHeight + 2);
    };
    const frame = window.requestAnimationFrame(measure);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(questionNode);
    observer?.observe(answerNode);
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [comfortableScrolling, index, question, answer]);

  const scrollFrameRef = useRef<number | null>(null);
  const updateScrollEnd = (face: "question" | "answer") => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const node = face === "question" ? questionScrollRef.current : answerScrollRef.current;
      if (!node) return;
      const atEnd = node.scrollTop + node.clientHeight >= node.scrollHeight - 6;
      if (face === "question") setQuestionAtEnd((prev) => (prev === atEnd ? prev : atEnd));
      else setAnswerAtEnd((prev) => (prev === atEnd ? prev : atEnd));
    });
  };

  useEffect(() => () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    stopRecording();
    stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      alert(labels.micError);
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  };

  const playRecording = () => {
    if (!recordedUrl) return;
    if (playbackRef.current) { playbackRef.current.pause(); playbackRef.current = null; }
    const a = new Audio(recordedUrl);
    playbackRef.current = a;
    a.play().catch(() => {});
  };

  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const speakAnswer = async () => {
    // Create + unlock the <audio> element synchronously inside the user gesture
    // so mobile/Safari autoplay policies allow playback after the async fetch.
    if (ttsAudioRef.current) {
      try { ttsAudioRef.current.pause(); } catch { /* noop */ }
      ttsAudioRef.current = null;
    }
    const audio = new Audio();
    audio.preload = "auto";
    ttsAudioRef.current = audio;
    setSpeaking(true);
    setFlipped(true);
    audio.onended = () => setSpeaking(false);
    audio.onerror = () => {
      setSpeaking(false);
      // Browser TTS fallback
      try {
        if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(answer);
          u.lang = language === "ar" ? "ar-SA" : "en-US";
          u.onend = () => setSpeaking(false);
          u.onerror = () => setSpeaking(false);
          setSpeaking(true);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
      } catch { /* noop */ }
    };

    try {
      const { data, error } = await supabase.functions.invoke("tts-speak", {
        body: { text: answer, language, voice: language === "ar" ? "shimmer" : "alloy", speed: 1.5 },
      });
      if (error || !data?.audio) throw error || new Error("No audio");
      audio.src = `data:${data.mime || "audio/mpeg"};base64,${data.audio}`;
      await audio.play();
    } catch {
      // Trigger fallback via onerror path
      audio.onerror?.(new Event("error"));
    }
  };

  const stopSpeaking = () => {
    if (ttsAudioRef.current) {
      try { ttsAudioRef.current.pause(); } catch { /* noop */ }
      ttsAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const animClass = direction === "right" ? "animate-card-slide-in-right" : "animate-card-slide-in-left";

  return (
    <div key={index} className={`perspective flex w-full max-w-2xl flex-col gap-3 overflow-hidden will-change-transform ${animClass}`}>
      <button
        onClick={() => setFlipped((f) => !f)}
        aria-label="Flip card"
        className="group relative h-[360px] w-full preserve-3d transition-transform duration-700 ease-[cubic-bezier(0.4,0.0,0.2,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-[400px] md:h-[440px]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex backface-hidden flex-col justify-between rounded-3xl border border-border p-6 sm:p-8 md:p-10"
          style={{ background: "var(--gradient-card-front)", boxShadow: "var(--shadow-card)", color: "hsl(var(--card-front-fg))" }}
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] opacity-60">
            <span>{labels.question}</span>
            <span className="font-mono">{String(index + 1).padStart(2, "0")} / {total}</span>
          </div>
          <div className="relative min-h-0 flex-1">
            <div
              ref={questionScrollRef}
              onScroll={() => updateScrollEnd("question")}
              className={comfortableScrolling
                ? "flashcard-reading-scroll flex h-full touch-pan-y items-start justify-center overflow-y-auto overscroll-contain px-2 py-5 pb-11"
                : "flex h-full items-center justify-center px-2"}
            >
            <p className={`whitespace-pre-line text-center font-semibold ${comfortableScrolling ? "text-lg leading-8 sm:text-xl sm:leading-9 md:text-2xl" : "text-xl leading-relaxed sm:text-2xl md:text-3xl"}`}>
              {question}
            </p>
            </div>
            {comfortableScrolling && questionOverflow && !questionAtEnd && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-card/95 via-card/75 to-transparent pb-1 pt-8 text-[10px] font-semibold tracking-normal opacity-80">
                <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1">
                  {labels.scroll}<ChevronDown className="size-3.5" />
                </span>
              </div>
            )}
          </div>
          <div className="text-center text-xs opacity-50 tracking-widest uppercase group-hover:opacity-80 transition-opacity">
            {labels.reveal}
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex backface-hidden rotate-y-180 flex-col justify-between rounded-3xl border border-border p-6 sm:p-8 md:p-10"
          style={{ background: "var(--gradient-card-back)", boxShadow: "var(--shadow-card)", color: "hsl(var(--card-back-fg))" }}
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] opacity-70">
            <span>{labels.answer}</span>
            <span className="font-mono">{String(index + 1).padStart(2, "0")} / {total}</span>
          </div>
          <div className="relative min-h-0 flex-1">
            <div
              ref={answerScrollRef}
              onScroll={() => updateScrollEnd("answer")}
              className={comfortableScrolling
                ? "flashcard-reading-scroll flex h-full touch-pan-y items-start justify-center overflow-y-auto overscroll-contain px-2 py-5 pb-11"
                : "flex h-full items-center justify-center px-2"}
            >
            <p className={`whitespace-pre-line text-center font-semibold ${comfortableScrolling ? "text-lg leading-8 sm:text-xl sm:leading-9 md:text-2xl" : "text-xl leading-relaxed sm:text-2xl md:text-3xl"}`}>
              {answer}
            </p>
            </div>
            {comfortableScrolling && answerOverflow && !answerAtEnd && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/25 via-black/10 to-transparent pb-1 pt-8 text-[10px] font-semibold tracking-normal text-white/90">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1">
                  {labels.scroll}<ChevronDown className="size-3.5" />
                </span>
              </div>
            )}
          </div>
          <div className="text-center text-xs opacity-60 tracking-widest uppercase group-hover:opacity-90 transition-opacity">
            {labels.back}
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-sm backdrop-blur" dir={language === "ar" ? "rtl" : "ltr"}>
        {onRate && flipped && (
          <div className="w-full grid grid-cols-4 gap-2 mb-1">
            {([
              { r: "forgot" as const, ar: "نسيت", en: "Forgot", cls: "border-destructive/60 text-destructive hover:bg-destructive/10" },
              { r: "hard" as const, ar: "صعبة", en: "Hard", cls: "border-border text-foreground hover:bg-accent" },
              { r: "good" as const, ar: "جيدة", en: "Good", cls: "border-primary/60 text-primary hover:bg-primary/10" },
              { r: "easy" as const, ar: "سهلة", en: "Easy", cls: "border-primary bg-primary text-primary-foreground hover:opacity-90" },
            ]).map((b) => (
              <button
                key={b.r}
                type="button"
                onClick={(e) => { e.stopPropagation(); onRate(b.r); }}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl border px-2 py-2 text-sm font-semibold transition-colors ${b.cls}`}
              >
                <span>{language === "ar" ? b.ar : b.en}</span>
                {intervalHints?.[b.r] && (
                  <span className="text-[10px] font-normal opacity-70 tabular-nums">{intervalHints[b.r]}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Mic className="size-4" /> {labels.record}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 rounded-full border border-destructive bg-destructive/10 text-destructive px-4 py-2 text-sm font-medium animate-pulse"
          >
            <Square className="size-4" /> {labels.stop}
          </button>
        )}

        {recordedUrl && !recording && (
          <button
            type="button"
            onClick={playRecording}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Play className="size-4" /> {labels.play}
          </button>
        )}

        {!speaking ? (
          <button
            type="button"
            onClick={speakAnswer}
            className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Volume2 className="size-4" /> {labels.listen}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopSpeaking}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <VolumeX className="size-4" /> {labels.stopAudio}
          </button>
        )}
      </div>
    </div>
  );
};
