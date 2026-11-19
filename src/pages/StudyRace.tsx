import { useEffect, useRef, useState } from "react";
import { Flag, Trophy, Pause, Play } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getBuiltInBiologyChapter2 } from "@/lib/biologyChapter2Mcqs";
import { getBuiltInPhysicsCh2 } from "@/lib/physicsChapter2Mcqs";
import boy from "@/assets/character-boy-1.png";
import girl from "@/assets/character-girl-1.png";
import "./StudyRace.css";
import StudyRunner from "@/components/StudyRunner";

type Question = {
  id: string;
  subject: string;
  chapter: number;
  question: string;
  choices: string[];
  answer_index: number;
  explanation: string | null;
  tags?: string[];
};
type Turn = {
  question: Question;
  choices: { text: string; correct: boolean }[];
  retry: boolean;
};
const names: Record<string, string> = {
  biology: "الأحياء",
  physics: "الفيزياء",
  chemistry: "الكيمياء",
  math: "الرياضيات",
  arabic: "العربية",
  english: "الإنكليزية",
  french: "الفرنسية",
  islamic: "الإسلامية",
  english_literature: "الأدب الإنكليزي",
};
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function turn(question: Question, retry = false): Turn {
  const wrong = shuffle(
    question.choices
      .map((text, index) => ({
        text,
        correct: index === question.answer_index,
      }))
      .filter((c) => !c.correct),
  ).slice(0, 2);
  return {
    question,
    retry,
    choices: shuffle([
      { text: question.choices[question.answer_index], correct: true },
      ...wrong,
    ]),
  };
}

export default function StudyRace({
  language,
  onBack,
}: {
  language: AppLanguage;
  onBack: () => void;
}) {
  const ar = language === "ar";
  const tr = (a: string, e: string) => (ar ? a : e);
  const [bank, setBank] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [subject, setSubject] = useState("biology");
  const [chapter, setChapter] = useState(2);
  const [avatar, setAvatar] = useState(boy);
  const [phase, setPhase] = useState<"setup" | "play" | "result">("setup");
  const [queue, setQueue] = useState<Turn[]>([]);
  const [index, setIndex] = useState(0);
  const [lane, setLane] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [missed, setMissed] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const answerLock = useRef(false);
  const [running, setRunning] = useState(true);
  const [crashed, setCrashed] = useState(false);
  const current = queue[index];

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      const fallback = [
        ...getBuiltInBiologyChapter2(language),
        ...getBuiltInPhysicsCh2(language),
      ];
      try {
        const { data, error } = await supabase
          .from("mcq_banks")
          .select(
            "id,subject,chapter,question,choices,answer_index,explanation,tags",
          )
          .eq("language", language)
          .order("subject")
          .order("chapter")
          .limit(2000)
          .abortSignal(AbortSignal.timeout(15000));
        if (error) throw error;
        const rows = [...(data ?? []), ...fallback];
        const seen = new Set<string>();
        const valid = rows.filter((row) => {
          const key = `${row.subject}:${row.chapter}:${row.question.trim()}`;
          if (
            seen.has(key) ||
            !Array.isArray(row.choices) ||
            row.choices.length < 3 ||
            !row.choices.every((c) => typeof c === "string" && c.trim()) ||
            !Number.isInteger(row.answer_index) ||
            row.answer_index < 0 ||
            row.answer_index >= row.choices.length
          )
            return false;
          seen.add(key);
          return true;
        }) as Question[];
        if (active) {
          setBank(valid);
          setOffline(false);
        }
      } catch {
        if (active) {
          setBank(fallback);
          setOffline(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [language]);

  useEffect(() => {
    const hide = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        phase !== "play" ||
        running ||
        paused ||
        revealed ||
        !["ArrowLeft", "ArrowRight"].includes(event.key)
      )
        return;
      event.preventDefault();
      setLane((value) =>
        Math.max(0, Math.min(2, value + (event.key === "ArrowLeft" ? -1 : 1))),
      );
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [phase, paused, revealed, running]);

  const start = () => {
    const selected = shuffle(
      bank.filter((q) => q.subject === subject && q.chapter === chapter),
    ).slice(0, 12);
    if (!selected.length) return;
    setQueue(selected.map((q) => turn(q)));
    setTotal(selected.length);
    setIndex(0);
    setCorrect(0);
    setAnswered(0);
    setMissed([]);
    setLane(1);
    setRevealed(false);
    setPaused(false);
    answerLock.current = false;
    setRunning(true);
    setCrashed(false);
    setPhase("play");
  };
  const answer = () => {
    if (!current || answerLock.current || paused || running) return;
    answerLock.current = true;
    setRevealed(true);
    if (!current.retry) {
      setAnswered((n) => n + 1);
      if (current.choices[lane].correct) setCorrect((n) => n + 1);
      else {
        setMissed((rows) => [...rows, current.question]);
        const retry = turn(current.question, true);
        setQueue((rows) => [
          ...rows.slice(0, index + 3),
          retry,
          ...rows.slice(index + 3),
        ]);
      }
    }
  };
  const next = () => {
    if (index + 1 >= queue.length) {
      setPhase("result");
      return;
    }
    setRunning(true);
    setIndex((n) => n + 1);
    setLane(1);
    setRevealed(false);
    answerLock.current = false;
  };
  const subjects = [...new Set(bank.map((q) => q.subject))];
  const chapters = [
    ...new Set(bank.filter((q) => q.subject === subject).map((q) => q.chapter)),
  ].sort((a, b) => a - b);
  return (
    <main className="study-race" dir={ar ? "rtl" : "ltr"}>
      <header className="race-header">
        <Button variant="ghost" onClick={onBack}>
          {tr("رجوع", "Back")}
        </Button>
        <span>
          <Flag size={18} /> {tr("سباق تميّزك", "Tamayzak Race")}
        </span>
        {phase === "play" && (
          <Button
            variant="ghost"
            onClick={() => setPaused((v) => !v)}
            aria-label={tr("إيقاف أو استئناف", "Pause or resume")}
          >
            {paused ? <Play /> : <Pause />}
          </Button>
        )}
      </header>
      {phase === "setup" && (
        <section className="race-panel">
          <div className="race-emblem">
            <Flag size={40} />
          </div>
          <h1>{tr("اركض، تفادى، وجاوب", "Run, dodge and answer")}</h1>
          <p>
            {tr(
              "اجمع النجوم وتفادى الحواجز بثلاث مسارات. كل ١٠ ثواني يوقف اللعب لسؤال من فصلك. عندك ٣ قلوب، والسؤال يبقى لحد ما تجاوب.",
              "Collect stars and dodge barriers in three lanes. Every 10 seconds, play pauses for a chapter question. You have 3 lives and unlimited reading time.",
            )}
          </p>
          {loading ? (
            <p role="status">
              {tr("جارٍ تحميل بنك الأسئلة…", "Loading question bank…")}
            </p>
          ) : (
            <>
              {offline && (
                <p role="status">
                  {tr(
                    "تعذّر تحميل البنك الكامل. متاحة حالياً أسئلة الفصل الثاني للأحياء والفيزياء.",
                    "The full bank is unavailable. Biology and Physics chapter 2 are available.",
                  )}
                </p>
              )}
              <label>
                {tr("المادة", "Subject")}
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setChapter(
                      bank.find((q) => q.subject === e.target.value)?.chapter ??
                        2,
                    );
                  }}
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {ar ? (names[s] ?? s) : s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {tr("الفصل", "Chapter")}
                <select
                  value={chapter}
                  onChange={(e) => setChapter(Number(e.target.value))}
                >
                  {chapters.map((c) => (
                    <option key={c} value={c}>
                      {tr("الفصل", "Chapter")} {c}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend>{tr("شخصيتك", "Your runner")}</legend>
                <div className="race-avatars">
                  {[boy, girl].map((src, i) => (
                    <button
                      key={src}
                      aria-label={
                        i === 0
                          ? tr("شخصية طالب", "Boy runner")
                          : tr("شخصية طالبة", "Girl runner")
                      }
                      aria-pressed={avatar === src}
                      onClick={() => setAvatar(src)}
                    >
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              </fieldset>
              <Button
                className="race-start"
                onClick={start}
                disabled={
                  !bank.some(
                    (q) => q.subject === subject && q.chapter === chapter,
                  )
                }
              >
                {tr("ابدأ السباق", "Start race")}
              </Button>
            </>
          )}
        </section>
      )}
      {phase === "play" && current && (
        <>
          <div className="race-progress">
            <span>
              {answered} / {total} {tr("سؤال", "questions")}
            </span>
            <span>
              {correct} {tr("صح", "correct")}
            </span>
            <progress value={answered} max={total} />
          </div>
          <StudyRunner
            active={running && !paused}
            segment={index}
            avatar={avatar}
            ar={ar}
            onQuestion={() => {
              setRunning(false);
              setLane(1);
            }}
            onFinish={() => {
              setCrashed(true);
              setPhase("result");
            }}
          />
          {paused ? (
            <section className="race-panel" role="status">
              <h2>{tr("السباق متوقف", "Race paused")}</h2>
              <Button onClick={() => setPaused(false)}>
                {tr("كمّل السباق", "Resume")}
              </Button>
            </section>
          ) : running ? (
            <p className="runner-help">
              {tr(
                "اسحب يمين ويسار لتبديل المسار، واسحب لفوك حتى تقفز. كل ١٠ ثواني يوقف الركض ويطلع سؤال.",
                "Swipe sideways to change lanes and up to jump. Every 10 seconds, running pauses for a question.",
              )}
            </p>
          ) : (
            <section className="race-question">
              {current.retry && (
                <p className="race-retry">
                  {tr("فرصة مراجعة", "Review attempt")}
                </p>
              )}
              <h1 dir="auto">{current.question.question}</h1>
              <div className="race-lanes" dir="ltr">
                {current.choices.map((choice, i) => (
                  <button
                    key={i}
                    dir="auto"
                    disabled={revealed}
                    aria-pressed={lane === i}
                    onClick={() => setLane(i)}
                    className={`${lane === i ? "selected" : ""} ${revealed && choice.correct ? "right" : ""} ${revealed && lane === i && !choice.correct ? "wrong" : ""}`}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
              {revealed ? (
                <div className="race-feedback" aria-live="polite">
                  <h2>
                    {current.choices[lane].correct
                      ? tr("إجابة صحيحة!", "Correct!")
                      : tr("راجع الإجابة", "Review the answer")}
                  </h2>
                  <p dir="auto">
                    {current.question.choices[current.question.answer_index]}
                  </p>
                  {current.question.explanation && (
                    <p dir="auto">{current.question.explanation}</p>
                  )}
                  <Button onClick={next}>
                    {index + 1 >= queue.length
                      ? tr("شوف نتيجتك", "See results")
                      : tr("كمّل", "Continue")}
                  </Button>
                </div>
              ) : (
                <Button className="race-start" onClick={answer}>
                  {tr("تأكيد المسار", "Confirm lane")}
                </Button>
              )}
            </section>
          )}
        </>
      )}
      {phase === "result" && (
        <section className="race-panel">
          <Trophy className="race-trophy" size={60} />
          <h1>
            {crashed
              ? tr("انتهت الجولة", "Run over")
              : tr("وصلت للنهاية!", "Finish line!")}
          </h1>
          <p className="race-score">
            {Math.round((correct / Math.max(answered, 1)) * 100)}%
          </p>
          <p>
            {correct} / {answered}{" "}
            {tr(
              "إجابة صحيحة من المحاولة الأولى",
              "correct on the first attempt",
            )}
          </p>
          {missed.length > 0 && (
            <>
              <h2>{tr("راجع هاي المواضيع", "Topics to review")}</h2>
              <ul>
                {[
                  ...new Set(
                    missed.flatMap((q) =>
                      q.tags?.length ? q.tags : [q.question],
                    ),
                  ),
                ].map((topic) => (
                  <li key={topic} dir="auto">
                    {topic}
                  </li>
                ))}
              </ul>
            </>
          )}
          <Button onClick={start}>{tr("جولة جديدة", "New race")}</Button>
          <Button variant="ghost" onClick={() => setPhase("setup")}>
            {tr("غيّر المادة والفصل", "Change subject or chapter")}
          </Button>
        </section>
      )}
    </main>
  );
}
