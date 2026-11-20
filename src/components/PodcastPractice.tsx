import { useEffect, useRef, useState } from "react";
import { loadPodcastTopics, type PodcastTopic } from "@/lib/podcastTopics";
import {
  loadPodcastPractice,
  type PracticeKind,
  type PodcastPracticeQuestion,
} from "@/lib/podcastPractice";

const subjects = {
  physics: "الفيزياء",
  chemistry: "الكيمياء",
  biology: "الأحياء",
  math: "الرياضيات",
  arabic: "اللغة العربية",
  english: "اللغة الإنجليزية",
  english_literature: "الأدب الإنكليزي",
  french: "الفرنسية",
  islamic: "الإسلامية",
};
const button =
  "rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-bold disabled:opacity-50";

export default function PodcastPractice({
  sessionId,
  subject,
  onSpeak,
}: {
  sessionId: string;
  subject: string | null;
  onSpeak: (text: string) => void;
}) {
  const [choice, setChoice] = useState<PracticeKind | "later" | null>(null);
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState<PodcastTopic[]>([]);
  const [resolving, setResolving] = useState(false);
  const [topicError, setTopicError] = useState("");
  const topicRequest = useRef<AbortController | null>(null);
  const [selectedSubject, setSelectedSubject] = useState(
    Object.entries(subjects).find(
      ([key, label]) => subject === key || subject === label,
    )?.[0] ?? "",
  );
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [questions, setQuestions] = useState<PodcastPracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const request = useRef<AbortController | null>(null);
  const revision = useRef(0);
  useEffect(
    () => () => {
      revision.current++;
      request.current?.abort();
      topicRequest.current?.abort();
      topicRequest.current = null;
    },
    [],
  );
  const prepareTopics = async () => {
    if (resolving || topics.length) return;
    const controller = new AbortController();
    topicRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 60000);
    setResolving(true);
    setTopicError("");
    try {
      const found = await loadPodcastTopics(sessionId, controller.signal);
      if (controller.signal.aborted) throw new Error("Request timed out");
      setTopics(found);
      setTopic((value) => value || found[0].ar);
    } catch {
      if (topicRequest.current === controller) setTopicError("تعذّر تحديد مفاهيم الدرس. جرّب مرة ثانية أو اكتب المفهوم بنفسك.");
    } finally {
      window.clearTimeout(timeout);
      if (topicRequest.current === controller) setResolving(false);
    }
  };
  const current = questions[index];
  const load = async () => {
    if (!choice || choice === "later" || !topic.trim() || !selectedSubject)
      return;
    const id = ++revision.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 60000);
    setBusy(true);
    setQuestions([]);
    setMessage("");
    setIndex(0);
    setPicked(null);
    setAnswer("");
    setRevealed(false);
    try {
      const selected = topics.find((item) => item.ar === topic.trim() || item.en === topic.trim());
      const concepts = selected ? [selected] : await loadPodcastTopics(sessionId, controller.signal, topic.trim());
      if (controller.signal.aborted) throw new Error("Request timed out");
      if (id !== revision.current) return;
      const result = await loadPodcastPractice(
        selectedSubject,
        concepts.flatMap((item) => [item.ar, item.en]),
        language,
        choice,
        controller.signal,
      );
      if (id !== revision.current) return;
      setQuestions(result.questions);
      const missing =
        choice === "both" &&
        result.questions.length &&
        new Set(result.questions.map((q) => q.kind)).size < 2;
      setMessage(
        !result.questions.length
          ? "ما لكينا أسئلة مطابقة لهذا المفهوم بالبنك واللغة المختارة. اختَر مفهوماً آخر أو لغة الأسئلة الثانية."
          : result.partial
            ? "بعض أسئلة البنك ما تحمّلت. هاي الأسئلة المتاحة حالياً."
            : missing
              ? "لقينا نوع واحد فقط من الأسئلة المطابقة لهذا الموضوع."
              : "",
      );
    } catch {
      if (id === revision.current)
        setMessage("تعذّر تحميل الأسئلة. حاول مرة ثانية.");
    } finally {
      window.clearTimeout(timeout);
      if (id === revision.current) setBusy(false);
    }
  };
  return (
    <section
      className="mt-6 space-y-4 rounded-2xl border border-cyan-300/25 bg-slate-950/40 p-5"
      dir="rtl"
    >
      <h2 className="text-xl font-black">
        خلصنا المراجعة! تحب نتمرّن على أسئلة تخص الموضوع؟
      </h2>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["ministerial", "وزاريات"],
            ["mcq", "اختيار من متعدد MCQ"],
            ["both", "الاثنين"],
            ["later", "مو هسه"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            className={button}
            disabled={busy}
            aria-pressed={choice === value}
            onClick={() => {
              setChoice(value);
              setQuestions([]);
              setMessage("");
              if (value !== "later") void prepareTopics();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {choice && choice !== "later" && (
        <>
          {resolving && <p role="status">جاري تحديد مفاهيم الدرس…</p>}
          {topicError && <div role="status">{topicError} <button className={button} disabled={resolving} onClick={() => void prepareTopics()}>إعادة تحديد المفاهيم</button></div>}
          {topics.length > 0 && <label className="block">
            مفاهيم مستخرجة من الدرس
            <select className="mt-2 block w-full rounded-xl bg-slate-900 p-3" value={topics.find((item) => item.ar === topic || item.en === topic)?.ar ?? ""} disabled={busy} onChange={(e) => setTopic(e.target.value)}>
              <option value="">اختَر مفهوماً أو اكتبه أدناه</option>
              {topics.map((item) => <option key={item.ar} value={item.ar}>{item.ar} · {item.en}</option>)}
            </select>
          </label>}
          <label className="block">
            المادة
            <select
              className="mt-2 block w-full rounded-xl bg-slate-900 p-3"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={busy}
            >
              <option value="">اختَر المادة</option>
              {Object.entries(subjects).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            المفهوم اللي تريد تتدرّب عليه
            <input
              className="mt-2 block w-full rounded-xl bg-slate-900 p-3"
              value={topic}
              maxLength={160}
              disabled={busy}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثلاً: الحث الكهرومغناطيسي"
            />
          </label>
          <label className="block">
            لغة الأسئلة
            <select
              className="mt-2 block w-full rounded-xl bg-slate-900 p-3"
              value={language}
              disabled={busy}
              onChange={(e) => setLanguage(e.target.value as "ar" | "en")}
            >
              <option value="ar">عربي</option>
              <option value="en">إنكليزي</option>
            </select>
          </label>
          <button
            className={button}
            onClick={() => void load()}
            disabled={busy || !topic.trim() || !selectedSubject}
          >
            {busy ? "جاري تحميل الأسئلة…" : "ابدأ التدريب"}
          </button>
        </>
      )}
      {message && <p role="status">{message}</p>}
      {current && (
        <article className="space-y-4 border-t border-white/15 pt-4">
          <p>
            {index + 1} / {questions.length} ·{" "}
            {current.kind === "mcq" ? "MCQ" : "من بنك الوزاريات"}
          </p>
          <h3 className="text-lg font-bold leading-8" dir="auto">
            {current.question}
          </h3>
          <button className={button} onClick={() => onSpeak(current.question)}>
            اسمع السؤال
          </button>
          {current.choices ? (
            <div className="grid gap-2">
              {current.choices.map((text, n) => (
                <button
                  key={n}
                  dir="auto"
                  disabled={revealed}
                  aria-pressed={picked === n}
                  className={`${button} ${picked === n ? "ring-2 ring-cyan-300" : ""}`}
                  onClick={() => setPicked(n)}
                >
                  {text}
                </button>
              ))}
            </div>
          ) : (
            <label className="block">
              جاوب بكلماتك
              <textarea
                className="mt-2 block w-full rounded-xl bg-slate-900 p-3"
                value={answer}
                disabled={revealed}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </label>
          )}
          {!revealed ? (
            <button
              className={button}
              disabled={current.choices ? picked === null : !answer.trim()}
              onClick={() => setRevealed(true)}
            >
              شوف الإجابة والتفسير
            </button>
          ) : (
            <div className="space-y-3" aria-live="polite">
              <p className="font-bold">
                {current.kind === "mcq"
                  ? picked === current.answerIndex
                    ? "عاشت إيدك، صحيح!"
                    : "مو مشكلة، خل نراجع الإجابة."
                  : "قارن جوابك بالإجابة الموجودة بالبنك."}
              </p>
              <p dir="auto" className="whitespace-pre-wrap leading-8">
                {current.answer}
              </p>
              {current.explanation && <p dir="auto">{current.explanation}</p>}
              <button
                className={button}
                onClick={() =>
                  onSpeak(`${current.answer}. ${current.explanation ?? ""}`)
                }
              >
                اسمع الإجابة
              </button>
              {index + 1 < questions.length ? (
                <button
                  className={button}
                  onClick={() => {
                    setIndex((n) => n + 1);
                    setPicked(null);
                    setAnswer("");
                    setRevealed(false);
                  }}
                >
                  السؤال التالي
                </button>
              ) : (
                <p className="font-bold text-emerald-200">
                  عاشت إيدك، خلّصت التدريب!
                </p>
              )}
            </div>
          )}
        </article>
      )}
    </section>
  );
}
