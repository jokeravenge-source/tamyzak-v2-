import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  CircleAlert,
  Crown,
  Headphones,
  History,
  Loader2,
  Mic,
  Pause,
  Play,
  Podcast,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  Youtube,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";

type SessionStatus = "processing" | "ready" | "in_progress" | "completed" | "failed";
type Verdict = "correct" | "partial" | "incorrect";
type TutorPhase = "idle" | "narration" | "listening" | "recording" | "grading" | "correction";
type StudyPlaybackItem = { kind: "speech"; text: string } | { kind: "audio"; url: string };

type PodcastSession = {
  id: string;
  youtube_url: string;
  title: string | null;
  subject: string | null;
  status: SessionStatus;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

type PodcastSegment = {
  id: string;
  session_id: string;
  segment_order: number;
  narration_text: string;
  narration_audio_url: string | null;
  checkpoint_prompt: string;
  student_answer_text: string | null;
  student_answer_audio_url: string | null;
  verdict: Verdict | null;
  correction_text: string | null;
  correction_audio_url: string | null;
  completed_at: string | null;
};

const SUBJECTS = ["الفيزياء", "الكيمياء", "الأحياء", "الرياضيات", "اللغة العربية", "اللغة الإنجليزية"];

const verdictCopy: Record<Verdict, { label: string; style: string }> = {
  correct: { label: "ممتاز", style: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" },
  partial: { label: "إجابة جزئية", style: "border-amber-400/30 bg-amber-500/15 text-amber-100" },
  incorrect: { label: "تحتاج مراجعة", style: "border-rose-400/30 bg-rose-500/15 text-rose-100" },
};

function speechChunks(text: string, maxLength = 220): string[] {
  const sentences = text.replace(/\s+/g, " ").trim().split(/(?<=[.!؟؛:])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (!sentence) continue;
    if (current && `${current} ${sentence}`.length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks.flatMap((chunk) => chunk.length <= maxLength
    ? [chunk]
    : chunk.match(new RegExp(`.{1,${maxLength}}(?:\\s|$)`, "g"))?.map((part) => part.trim()).filter(Boolean) ?? [chunk]);
}

async function invoke<T>(name: string, options?: { body?: unknown }): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, options);
  if (!error) return data as T;
  let message = "حدث خطأ غير متوقع. حاول مرة أخرى.";
  const response = (error as unknown as { context?: unknown }).context;
  if (response instanceof Response) {
    try {
      const payload = await response.json();
      if (typeof payload?.error === "string") message = payload.error;
    } catch { /* keep fallback */ }
  } else if (error.message) message = error.message;
  throw new Error(message);
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`border border-white/15 bg-white/[0.08] shadow-[0_24px_70px_rgba(2,8,23,0.28)] backdrop-blur-2xl ${className}`}
      style={{ clipPath: "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)" }}
    >
      {children}
    </div>
  );
}

export default function PodcastTutor({
  language: _language,
  onBack,
  onPremium,
}: {
  language: AppLanguage;
  onBack: () => void;
  onPremium: () => void;
}) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [subject, setSubject] = useState("");
  const [history, setHistory] = useState<PodcastSession[]>([]);
  const [session, setSession] = useState<PodcastSession | null>(null);
  const [segments, setSegments] = useState<PodcastSegment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<TutorPhase>("idle");
  const [busy, setBusy] = useState(false);
  const [premiumRequired, setPremiumRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingSupported, setRecordingSupported] = useState(true);
  const [recordPlaying, setRecordPlaying] = useState(false);
  const recordAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechRunRef = useRef(0);
  const speechVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const current = segments[currentIndex] ?? null;
  const isComplete = session?.status === "completed";

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => () => {
    stopStream();
    recordAudioRef.current?.pause();
    speechRunRef.current += 1;
    window.speechSynthesis?.cancel();
    activeUtteranceRef.current = null;
  }, [stopStream]);

  const loadHistory = useCallback(async () => {
    try {
      const result = await invoke<{ sessions: PodcastSession[] }>("get-session-status", { body: {} });
      setHistory(result.sessions);
    } catch { /* history is secondary */ }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    const result = await invoke<{ session: PodcastSession; segments: PodcastSegment[] }>("get-session-status", {
      body: { session_id: id },
    });
    setSession(result.session);
    setSegments(result.segments);
    const firstIncomplete = result.segments.findIndex((item) => !item.completed_at);
    setCurrentIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    setPhase("idle");
    setError(null);
    return result;
  }, []);

  useEffect(() => {
    setRecordingSupported(typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia);
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!session || session.status !== "processing") return;
    const poll = window.setInterval(() => {
      void loadSession(session.id).catch((e: Error) => setError(e.message));
    }, 3000);
    return () => window.clearInterval(poll);
  }, [session, loadSession]);

  const createSession = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setPremiumRequired(false);
    try {
      const result = await invoke<{ session_id: string }>("create-podcast-session", {
        body: { youtube_url: youtubeUrl, subject: subject || undefined },
      });
      setSession({
        id: result.session_id,
        youtube_url: youtubeUrl,
        title: null,
        subject: subject || null,
        status: "processing",
        error_message: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      });
      setSegments([]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "تعذّر إنشاء الجلسة.";
      setError(message);
      setPremiumRequired(message.includes("المميز") || message.includes("الاشتراك"));
    } finally {
      setBusy(false);
    }
  };

  const selectArabicVoice = useCallback(() => {
    if (speechVoiceRef.current) return speechVoiceRef.current;
    const voices = window.speechSynthesis.getVoices();
    let saved = "";
    try { saved = localStorage.getItem("tamyzak_podcast_voice_v1") ?? ""; } catch { /* unavailable */ }
    const voice = voices.find((item) => item.voiceURI === saved)
      ?? voices.find((item) => item.lang.toLowerCase() === "ar-iq")
      ?? voices.find((item) => item.lang.toLowerCase().startsWith("ar"))
      ?? null;
    speechVoiceRef.current = voice;
    if (voice) {
      try { localStorage.setItem("tamyzak_podcast_voice_v1", voice.voiceURI); } catch { /* unavailable */ }
    }
    return voice;
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const refreshVoice = () => {
      speechVoiceRef.current = null;
      selectArabicVoice();
    };
    refreshVoice();
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refreshVoice);
  }, [selectArabicVoice]);

  const speakArabic = useCallback((
    text: string,
    speakingPhase: TutorPhase | null,
    onEnd: () => void,
    onFailure?: () => void,
  ) => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setError("هذا المتصفح لا يدعم الصوت العربي المدمج. افتح Tamyzak في Chrome أو Safari محدث.");
      setPhase("idle");
      onFailure?.();
      return;
    }
    const chunks = speechChunks(text);
    if (!chunks.length) {
      onEnd();
      return;
    }
    const runId = ++speechRunRef.current;
    window.speechSynthesis.cancel();
    activeUtteranceRef.current = null;
    setError(null);
    if (speakingPhase) setPhase(speakingPhase);
    const voice = selectArabicVoice();
    let index = 0;
    const speakNext = () => {
      if (runId !== speechRunRef.current) return;
      if (index >= chunks.length) {
        activeUtteranceRef.current = null;
        onEnd();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index++]);
      utterance.lang = voice?.lang || "ar-IQ";
      utterance.rate = 0.92;
      utterance.pitch = 1;
      if (voice) utterance.voice = voice;
      activeUtteranceRef.current = utterance;
      utterance.onend = () => {
        if (runId !== speechRunRef.current) return;
        activeUtteranceRef.current = null;
        speakNext();
      };
      utterance.onerror = (event) => {
        if (runId !== speechRunRef.current || event.error === "canceled" || event.error === "interrupted") return;
        activeUtteranceRef.current = null;
        setPhase("idle");
        setError("تعذّر تشغيل صوت الجهاز. تأكد من تثبيت صوت عربي ثم حاول مجدداً.");
        onFailure?.();
      };
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  }, [selectArabicVoice]);

  const playNarration = useCallback(() => {
    if (!current) return;
    speakArabic(`${current.narration_text}. ${current.checkpoint_prompt}`, "narration", () => setPhase("listening"));
  }, [current, speakArabic]);

  const advance = async () => {
    if (!session) return;
    const refreshed = await loadSession(session.id).catch(() => null);
    if (refreshed?.session.status === "completed") {
      await loadHistory();
      return;
    }
    const next = Math.min(currentIndex + 1, Math.max(0, segments.length - 1));
    setCurrentIndex(next);
    setPhase("idle");
  };

  const submitRecording = async (blob: Blob) => {
    if (!current) return;
    setPhase("grading");
    setError(null);
    try {
      const form = new FormData();
      form.append("segment_id", current.id);
      form.append("audio", new File([blob], "answer.webm", { type: blob.type || "audio/webm" }));
      const { data, error: fnError } = await supabase.functions.invoke("submit-checkpoint-answer", { body: form });
      if (fnError) {
        let message = fnError.message;
        const response = (fnError as unknown as { context?: unknown }).context;
        if (response instanceof Response) {
          try { message = (await response.json())?.error || message; } catch { /* keep */ }
        }
        throw new Error(message);
      }
      setSegments((previous) => previous.map((item) => item.id === current.id ? {
        ...item,
        student_answer_text: data.student_answer_text,
        verdict: data.verdict,
        correction_text: data.correction_text,
        correction_audio_url: data.correction_audio_url,
        completed_at: new Date().toISOString(),
      } : item));
      if (data.correction_text) {
        speakArabic(data.correction_text, "correction", () => { void advance(); });
      } else {
        await advance();
      }
    } catch (e) {
      setPhase("listening");
      setError(e instanceof Error ? e.message : "تعذّر تقييم التسجيل. يمكنك المحاولة مجدداً.");
    }
  };

  const startRecording = async () => {
    if (!recordingSupported) return;
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stopStream();
        void submitRecording(blob);
      };
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => setRecordingSeconds((value) => value + 1), 1000);
      recorder.start();
      setPhase("recording");
    } catch {
      stopStream();
      setError("لم نتمكن من استخدام الميكروفون. اسمح بالوصول إليه ثم حاول مرة أخرى.");
      setPhase("listening");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const studyRecord = useMemo<StudyPlaybackItem[]>(() => segments.flatMap((item) => {
    const items: StudyPlaybackItem[] = [
      { kind: "speech", text: `${item.narration_text}. ${item.checkpoint_prompt}` },
    ];
    if (item.student_answer_audio_url) items.push({ kind: "audio", url: item.student_answer_audio_url });
    if (item.correction_text) items.push({ kind: "speech", text: item.correction_text });
    return items;
  }), [segments]);

  const playStudyRecord = () => {
    if (!studyRecord.length) return;
    recordAudioRef.current?.pause();
    speechRunRef.current += 1;
    window.speechSynthesis?.cancel();
    setRecordPlaying(true);
    const playNext = (index: number) => {
      if (index >= studyRecord.length) {
        setRecordPlaying(false);
        return;
      }
      const item = studyRecord[index];
      if (item.kind === "speech") {
        speakArabic(item.text, null, () => playNext(index + 1), () => setRecordPlaying(false));
        return;
      }
      const audio = new Audio(item.url);
      recordAudioRef.current = audio;
      audio.onended = () => playNext(index + 1);
      audio.onerror = () => setRecordPlaying(false);
      void audio.play().catch(() => {
        setError("تعذّر تشغيل تسجيل الطالب.");
        setRecordPlaying(false);
      });
    };
    playNext(0);
  };

  const stopStudyRecord = () => {
    recordAudioRef.current?.pause();
    speechRunRef.current += 1;
    window.speechSynthesis?.cancel();
    activeUtteranceRef.current = null;
    setRecordPlaying(false);
  };

  const resetHome = () => {
    speechRunRef.current += 1;
    window.speechSynthesis?.cancel();
    activeUtteranceRef.current = null;
    setSession(null);
    setSegments([]);
    setPhase("idle");
    setError(null);
    void loadHistory();
  };

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-[#07111f] text-white" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 opacity-80" style={{ background: "radial-gradient(circle at 85% 5%, rgba(34,211,238,.22), transparent 32%), radial-gradient(circle at 8% 78%, rgba(99,102,241,.22), transparent 35%)" }} />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-5 sm:px-7">
        <header className="mb-8 flex items-center justify-between">
          <button onClick={session ? resetHome : onBack} className="flex h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-bold transition hover:bg-white/15">
            <ArrowRight className="h-4 w-4" /> رجوع
          </button>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-xs text-cyan-200/70">TAMYZAK AUDIO LAB</p>
              <h1 className="text-lg font-black">المعلّم الصوتي</h1>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20"><Podcast className="h-6 w-6" /></div>
          </div>
        </header>

        {!session ? (
          <div className="grid gap-6 lg:grid-cols-[1.12fr_.88fr]">
            <section>
              <div className="mb-7 max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-100"><Crown className="h-4 w-4" /> ميزة مميّزة</div>
                <h2 className="text-3xl font-black leading-tight sm:text-5xl">محاضرتك تتحوّل إلى<br /><span className="bg-gradient-to-l from-cyan-300 to-indigo-300 bg-clip-text text-transparent">حوار يثبت المعلومة</span></h2>
                <p className="mt-4 max-w-xl leading-8 text-slate-300">الصق رابط المحاضرة، واستمع إلى شرح عربي مقسّم حسب الأفكار. بعد كل فكرة، لخّص بصوتك ليقيّمك المعلّم ويصحح لك فوراً.</p>
              </div>
              <GlassCard className="p-5 sm:p-7">
                <form onSubmit={createSession} className="space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-200">رابط محاضرة يوتيوب</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/40 px-4 focus-within:border-cyan-400/70">
                      <Youtube className="h-5 w-5 shrink-0 text-red-400" />
                      <input dir="ltr" type="url" required value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="h-14 w-full bg-transparent text-left text-sm outline-none placeholder:text-slate-600" />
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-200">المادة (اختياري)</span>
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-14 w-full rounded-2xl border border-white/15 bg-slate-950/60 px-4 text-sm outline-none focus:border-cyan-400/70">
                      <option value="">اختر المادة</option>
                      {SUBJECTS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  {error && <ErrorBanner message={error} />}
                  {premiumRequired && <button type="button" onClick={onPremium} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 py-3 text-sm font-black text-amber-100"><Crown className="h-4 w-4" /> عرض الاشتراك والتفعيل بالنقاط</button>}
                  <button disabled={busy} className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-cyan-400 to-indigo-500 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:opacity-60">
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                    {busy ? "جاري إنشاء الجلسة..." : "أنشئ جلستي الصوتية"}
                  </button>
                </form>
              </GlassCard>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                {["٣–٥ مقاطع ذكية", "تقييم صوتي", "سجل للمراجعة"].map((text, index) => <div key={text} className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3"><span className="mb-1 block font-black text-cyan-200">{index + 1}</span>{text}</div>)}
              </div>
            </section>
            <HistoryPanel history={history} onOpen={(id) => void loadSession(id).catch((e: Error) => setError(e.message))} />
          </div>
        ) : session.status === "processing" ? (
          <ProcessingCard title={session.title} />
        ) : session.status === "failed" ? (
          <GlassCard className="mx-auto max-w-xl p-8 text-center">
            <CircleAlert className="mx-auto mb-4 h-12 w-12 text-rose-300" />
            <h2 className="text-2xl font-black">تعذّر تجهيز الجلسة</h2>
            <p className="mt-3 leading-7 text-slate-300">{session.error_message || "قد يكون الفيديو خاصاً أو مقيّداً أو غير متاح."}</p>
            <button onClick={resetHome} className="mt-6 rounded-2xl bg-white px-6 py-3 font-black text-slate-950">جرّب رابطاً آخر</button>
          </GlassCard>
        ) : isComplete ? (
          <SummaryView session={session} segments={segments} recordPlaying={recordPlaying} onPlay={playStudyRecord} onStop={stopStudyRecord} />
        ) : (
          <SessionView
            session={session}
            segments={segments}
            current={current}
            currentIndex={currentIndex}
            phase={phase}
            recordingSeconds={recordingSeconds}
            recordingSupported={recordingSupported}
            error={error}
            onPlay={playNarration}
            onRecord={startRecording}
            onStop={stopRecording}
            onReplayCorrection={() => current?.correction_text && speakArabic(current.correction_text, "correction", () => setPhase("idle"))}
            onAdvance={() => void advance()}
          />
        )}
      </div>
    </main>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="flex items-start gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-3 text-sm text-rose-100"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>;
}

function ProcessingCard({ title }: { title: string | null }) {
  const steps = ["استخراج محتوى المحاضرة", "تقسيم الأفكار وكتابة الشرح", "تحضير مقاطع المراجعة التفاعلية"];
  return <GlassCard className="mx-auto max-w-2xl p-7 sm:p-10">
    <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[28px] bg-cyan-400/15"><Loader2 className="h-10 w-10 animate-spin text-cyan-300" /></div>
    <h2 className="text-center text-2xl font-black">نجهّز جلستك الصوتية</h2>
    {title && <p className="mt-2 text-center text-sm text-slate-400">{title}</p>}
    <p className="mt-3 text-center leading-7 text-slate-300">يمكنك إبقاء هذه الصفحة مفتوحة. سيظهر زر تشغيل الشرح الصوتي عندما تجهز المقاطع.</p>
    <div className="mt-7 space-y-3">{steps.map((step, index) => <motion.div key={step} initial={{ opacity: .35 }} animate={{ opacity: [0.4, 1, .4] }} transition={{ duration: 2, delay: index * .45, repeat: Infinity }} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-sm font-black">{index + 1}</span><span className="font-bold">{step}</span></motion.div>)}</div>
  </GlassCard>;
}

function HistoryPanel({ history, onOpen }: { history: PodcastSession[]; onOpen: (id: string) => void }) {
  return <GlassCard className="min-h-[360px] p-5 sm:p-6">
    <div className="mb-5 flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-black"><History className="h-5 w-5 text-indigo-300" /> جلساتي السابقة</h3><span className="text-xs text-slate-500">{history.length}</span></div>
    {history.length === 0 ? <div className="grid min-h-[260px] place-items-center text-center"><div><Headphones className="mx-auto mb-3 h-10 w-10 text-slate-600" /><p className="font-bold text-slate-400">لا توجد جلسات بعد</p><p className="mt-1 text-xs text-slate-600">ستظهر جلساتك المحفوظة هنا</p></div></div> : <div className="space-y-3">{history.map((item) => <button key={item.id} onClick={() => onOpen(item.id)} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/25 p-3 text-right transition hover:border-cyan-300/30 hover:bg-white/10"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-400/15"><Podcast className="h-5 w-5 text-indigo-200" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.title || "محاضرة قيد التجهيز"}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString("ar-IQ")}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-black ${item.status === "completed" ? "bg-emerald-500/15 text-emerald-200" : item.status === "failed" ? "bg-rose-500/15 text-rose-200" : "bg-cyan-500/15 text-cyan-200"}`}>{item.status === "completed" ? "مكتملة" : item.status === "failed" ? "متعثرة" : "متابعة"}</span><ChevronLeft className="h-4 w-4 text-slate-600" /></button>)}</div>}
  </GlassCard>;
}

function SessionView(props: {
  session: PodcastSession; segments: PodcastSegment[]; current: PodcastSegment | null; currentIndex: number;
  phase: TutorPhase; recordingSeconds: number; recordingSupported: boolean; error: string | null;
  onPlay: () => void; onRecord: () => void; onStop: () => void; onReplayCorrection: () => void; onAdvance: () => void;
}) {
  const { session, segments, current, currentIndex, phase } = props;
  if (!current) return <ProcessingCard title={session.title} />;
  const progress = ((currentIndex + 1) / segments.length) * 100;
  const answered = !!current.completed_at;
  return <div className="mx-auto max-w-3xl">
    <div className="mb-5 flex items-center justify-between text-sm"><div><p className="font-black">{session.title || "جلسة صوتية"}</p><p className="mt-1 text-xs text-slate-500">المقطع {currentIndex + 1} من {segments.length}</p></div><div className="h-2 w-32 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-gradient-to-l from-cyan-300 to-indigo-400" animate={{ width: `${progress}%` }} /></div></div>
    <GlassCard className="relative overflow-hidden p-6 sm:p-9">
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <AnimatePresence mode="wait">
        <motion.div key={`${current.id}-${phase}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="relative text-center">
          {phase === "narration" ? <StateIcon icon={<Volume2 className="h-9 w-9" />} pulse label="المعلّم يشرح الآن" />
          : phase === "recording" ? <StateIcon icon={<Mic className="h-9 w-9" />} pulse label={`جاري التسجيل · ${props.recordingSeconds} ث`} danger />
          : phase === "grading" ? <StateIcon icon={<Loader2 className="h-9 w-9 animate-spin" />} label="أفكّر في إجابتك..." />
          : phase === "correction" ? <StateIcon icon={<Volume2 className="h-9 w-9" />} pulse label="استمع إلى التصحيح" />
          : <StateIcon icon={answered ? <Check className="h-9 w-9" /> : <Podcast className="h-9 w-9" />} label={answered ? "اكتمل هذا المقطع" : "اضغط لتسمع شرح المقطع"} />}

          {phase === "idle" && !answered && <button onClick={props.onPlay} className="mx-auto mt-5 flex items-center gap-2 rounded-2xl bg-gradient-to-l from-cyan-300 to-indigo-400 px-7 py-3.5 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110"><Play className="h-5 w-5 fill-current" /> تشغيل الشرح الصوتي</button>}

          <p className="mx-auto mt-6 max-w-2xl text-right text-base leading-8 text-slate-200 sm:text-lg">{current.narration_text}</p>
          {(phase === "listening" || phase === "recording") && <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-base font-black text-cyan-100">{current.checkpoint_prompt}</div>}
          {answered && current.verdict && <div className="mt-5 text-right"><span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${verdictCopy[current.verdict].style}`}>{verdictCopy[current.verdict].label}</span>{current.student_answer_text && <p className="mt-3 rounded-2xl bg-slate-950/30 p-4 text-sm leading-7 text-slate-300"><span className="font-black text-white">إجابتك: </span>{current.student_answer_text}</p>}{current.correction_text && <p className="mt-3 rounded-2xl border border-indigo-300/15 bg-indigo-400/10 p-4 text-sm leading-7 text-indigo-100"><span className="font-black">تصحيح المعلّم: </span>{current.correction_text}</p>}</div>}
          {props.error && <div className="mt-5"><ErrorBanner message={props.error} /></div>}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {phase === "narration" && <span className="flex items-center gap-2 text-sm text-cyan-200"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" /> استمع حتى نهاية المقطع</span>}
            {phase === "listening" && <><button disabled={!props.recordingSupported} onClick={props.onRecord} className="flex items-center gap-2 rounded-2xl bg-gradient-to-l from-rose-400 to-fuchsia-500 px-6 py-3 font-black shadow-lg shadow-rose-500/20 disabled:opacity-40"><Mic className="h-5 w-5" /> ابدأ التلخيص بصوتك</button><button onClick={props.onPlay} className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold"><RotateCcw className="h-4 w-4" /> إعادة الشرح الصوتي</button></>}
            {phase === "recording" && <button onClick={props.onStop} className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-black text-rose-600"><Square className="h-4 w-4 fill-current" /> إنهاء وإرسال</button>}
            {answered && phase === "idle" && <><button onClick={props.onAdvance} className="flex items-center gap-2 rounded-2xl bg-gradient-to-l from-cyan-400 to-indigo-500 px-6 py-3 font-black text-slate-950">{currentIndex + 1 === segments.length ? "عرض النتيجة" : "المقطع التالي"}<ChevronLeft className="h-5 w-5" /></button>{current.correction_text && <button onClick={props.onReplayCorrection} className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold"><RotateCcw className="h-4 w-4" /> إعادة التصحيح</button>}</>}
          </div>
          {!props.recordingSupported && <p className="mt-4 text-xs text-rose-200">هذا المتصفح لا يدعم التسجيل الصوتي. افتح Tamyzak في Chrome أو Safari محدث.</p>}
        </motion.div>
      </AnimatePresence>
    </GlassCard>
  </div>;
}

function StateIcon({ icon, label, pulse = false, danger = false }: { icon: React.ReactNode; label: string; pulse?: boolean; danger?: boolean }) {
  return <div><div className={`relative mx-auto grid h-24 w-24 place-items-center rounded-[32px] ${danger ? "bg-rose-400/15 text-rose-200" : "bg-cyan-400/15 text-cyan-200"}`}>{pulse && <span className={`absolute inset-0 animate-ping rounded-[32px] ${danger ? "bg-rose-400/10" : "bg-cyan-400/10"}`} />}{icon}</div><h2 className="mt-4 text-xl font-black">{label}</h2></div>;
}

function SummaryView({ session, segments, recordPlaying, onPlay, onStop }: { session: PodcastSession; segments: PodcastSegment[]; recordPlaying: boolean; onPlay: () => void; onStop: () => void }) {
  const correct = segments.filter((item) => item.verdict === "correct").length;
  return <div className="mx-auto max-w-4xl">
    <GlassCard className="mb-5 p-6 sm:p-8">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-right"><div className="grid h-20 w-20 shrink-0 place-items-center rounded-[28px] bg-emerald-400/15 text-emerald-200"><Check className="h-10 w-10" /></div><div className="flex-1"><p className="text-sm font-bold text-emerald-200">اكتملت الجلسة</p><h2 className="mt-1 text-2xl font-black">{session.title || "مراجعتك الصوتية"}</h2><p className="mt-2 text-sm text-slate-400">أتقنت {correct} من {segments.length} مقاطع من المحاولة الأولى.</p></div><button onClick={recordPlaying ? onStop : onPlay} className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950">{recordPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}{recordPlaying ? "إيقاف السجل" : "تشغيل سجل الجلسة"}</button></div>
    </GlassCard>
    <div className="space-y-3">{segments.map((item) => <GlassCard key={item.id} className="p-5"><div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-sm font-black">{item.segment_order}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black">المقطع {item.segment_order}</h3>{item.verdict && <span className={`rounded-full border px-3 py-1 text-xs font-black ${verdictCopy[item.verdict].style}`}>{verdictCopy[item.verdict].label}</span>}</div>{item.student_answer_text && <p className="mt-3 text-sm leading-7 text-slate-300"><span className="font-bold text-white">تلخيصك: </span>{item.student_answer_text}</p>}{item.correction_text && <p className="mt-2 text-sm leading-7 text-indigo-200"><span className="font-bold">التصحيح: </span>{item.correction_text}</p>}</div></div></GlassCard>)}</div>
  </div>;
}
