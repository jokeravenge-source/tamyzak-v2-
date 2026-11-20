import { useEffect, useState } from "react";
import { Clock3, Loader2, Trophy } from "lucide-react";
import type { AppLanguage } from "./LanguageGate";
import { useTimedNadawiContest } from "@/hooks/useTimedNadawiContest";
import { formatNadawiDuration } from "@/lib/nadawiContestApi";
import { NADAWI_LETTER_PROMPT } from "@/lib/nadawiContestSettings";
import NadawiLeaderboard from "./NadawiLeaderboard";
import NadawiMistakes from "./NadawiMistakes";
const button = "min-h-11 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40";

export default function NadawiContest({ language, adminTest = false }: { language: AppLanguage; adminTest?: boolean }) {
  const ar = language === "ar";
  const contest = useTimedNadawiContest(adminTest);
  const { state, pending, seconds, elapsed } = contest;
  const [answer, setAnswer] = useState<string | number>("");
  const [letter, setLetter] = useState("");
  const questionIndex = state?.status === "active" ? state.question_index : -1;
  const attemptId = state && state.status !== "not_started" ? state.attempt_id : "";
  useEffect(() => { setAnswer(""); }, [questionIndex, attemptId]);
  const testControls = adminTest && <div className="space-y-2 rounded-xl border border-amber-200/40 bg-amber-100/10 p-3 text-sm text-amber-100"><p>{ar ? "تجربة أدمن — لا تدخل بترتيب الطلاب ولا تستهلك محاولتك الرسمية." : "Admin test — excluded from student rankings and your official attempt."}</p>{state && state.status !== "not_started" && <button className={button} disabled={pending} onClick={() => void contest.restart()}>{ar ? "بدء تجربة جديدة" : "Restart test"}</button>}</div>;
  const error = contest.error && <div role="alert" className="space-y-2 rounded-xl border border-amber-200/30 bg-amber-100/5 p-3 text-sm leading-6 text-amber-100"><p>{contest.error.includes("ADMIN_REQUIRED") ? (ar ? "هذه التجربة متاحة لحساب أدمن فقط." : "This test requires an administrator account.") : contest.error.includes("AUTH_REQUIRED") ? (ar ? "سجّل دخولك حتى تدخل المسابقة وينحفظ ترتيبك." : "Sign in to enter and save your ranking.") : (ar ? "تعذّر الاتصال بالمسابقة. حاول مرة ثانية؛ الوقت بالمحاولة الجارية يستمر." : "Could not connect to the competition. Retry; an active attempt’s time keeps running.")}</p><button className={button} disabled={pending} onClick={() => void contest.refresh()}>{ar ? "إعادة الاتصال" : "Retry connection"}</button></div>;
  if (!state) return <div className="space-y-3">{testControls}{error || <p role="status" className="flex items-center justify-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />{ar ? "جاري فتح المسابقة…" : "Opening competition…"}</p>}</div>;
  if (state.status === "not_started") return <section className="space-y-4 text-start">
    {testControls}{error}<h2 className="text-lg font-black">{ar ? "جاهز للتحدّي؟" : "Ready for the challenge?"}</h2>
    <ul className="space-y-2 text-sm leading-7 text-blue-100"><li>{ar ? "٤١ سؤال: ٢٤ MCQ و١٧ إجابة بكلمة واحدة." : "41 questions: 24 MCQs and 17 one-word answers."}</li><li>{ar ? "٣٠ ثانية لكل سؤال. الصحيح نقطة، والخطأ أو انتهاء الوقت صفر." : "30 seconds per question. Correct = 1 point; wrong or timed out = 0."}</li><li>{ar ? "الفائز صاحب أعلى نقاط؛ عند التعادل، الأقل وقتاً كلياً." : "Higher score wins; total completion time breaks a score tie."}</li><li>{adminTest ? (ar ? "نفس الأسئلة والمؤقت، وتگدر تعيد التجربة من جديد." : "The same questions and timer; you can restart the test.") : (ar ? "ترتيب الأسئلة والاختيارات عشوائي لكل طالب. محاولة رسمية واحدة." : "Questions and choices are shuffled for each student. One official attempt.")}</li></ul>
    <p className="text-xs leading-6 text-amber-100">{ar ? "من تبدي، الوقت ما يتوقف بإغلاق النافذة أو تحديث الصفحة، وما تگدر ترجع لسؤال سابق. الرسالة الإنشائية خارج المنافسة." : "Once started, closing or refreshing does not pause time. You cannot return to previous questions. Letter writing is outside the competition."}</p>
    <button className={`${button} w-full bg-cyan-200/20`} disabled={pending} onClick={() => void contest.start()}>{pending ? (ar ? "جاري البدء…" : "Starting…") : (adminTest ? (ar ? "ابدأ التجربة" : "Start test") : (ar ? "ابدأ المسابقة" : "Start challenge"))}</button>
  </section>;
  if (state.status === "completed") return <section className="space-y-5 text-start">
    {testControls}
    <div className="space-y-3 rounded-2xl border border-cyan-200/25 bg-cyan-200/10 p-5 text-center"><Trophy className="mx-auto h-10 w-10 text-amber-200" /><h2 className="text-xl font-black">{adminTest ? (ar ? "اكتملت التجربة!" : "Test complete!") : (ar ? "انحفظت نتيجتك!" : "Your result is saved!")}</h2><p className="text-3xl font-black" dir="ltr">{state.score} / {state.total_questions}</p><p className="text-sm text-blue-100">{ar ? "الوقت الكلي" : "Total time"}: <span dir="ltr" className="inline-block font-mono">{formatNadawiDuration(state.elapsed_ms, true)}</span></p></div>
    {!adminTest && <NadawiLeaderboard language={language} completed />}
    <NadawiMistakes key={state.attempt_id} language={language} adminTest={adminTest} />
    <details className="rounded-xl border border-white/20 p-4"><summary className="cursor-pointer text-sm font-bold">{ar ? "سؤال الرسالة الأصلي — خارج الترتيب" : "Original letter task — not ranked"}</summary><p dir="ltr" className="mt-3 text-sm leading-7">{NADAWI_LETTER_PROMPT}</p><label htmlFor="nadawi-letter" className="my-2 block text-sm">{ar ? "مسودة رسالتك" : "Your letter draft"}</label><textarea id="nadawi-letter" dir="ltr" rows={6} maxLength={5000} value={letter} onChange={(e) => setLetter(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-sm leading-7" /><p className="mt-2 text-xs leading-6 text-blue-200">{ar ? "للتدريب والتصحيح اليدوي، وليست ضمن نقاط المسابقة. هذه المسودة لا تُرسل للأستاذ." : "For practice and manual marking, outside the competition score. This draft is not sent to the teacher."}</p></details>
  </section>;
  const question = state.question;
  const valid = question.kind === "mcq" ? typeof answer === "number" : typeof answer === "string" && !!answer.trim() && !/\s/.test(answer.trim());
  const submit = () => { if (valid && seconds > 0 && !pending) void contest.submit(String(answer).trim()); };
  return <section className="space-y-4 text-start">
    {testControls}{error}<div className="flex justify-between gap-2 text-xs text-blue-100"><span>{ar ? "السؤال" : "Question"} {state.question_index + 1} / {state.total_questions}</span><span>{ar ? "الكلي" : "Total"}: <span dir="ltr" className="inline-block font-mono">{formatNadawiDuration(elapsed)}</span></span></div>
    <div role="timer" aria-live="off" className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-2xl font-black tabular-nums ${seconds <= 5 ? "border-rose-300/50 bg-rose-200/10 text-rose-200" : "border-cyan-200/30 text-cyan-100"}`}><Clock3 className="h-5 w-5" />{seconds} <span className="text-sm">{ar ? "ثانية" : "seconds"}</span></div>
    <h2 dir="ltr" className="break-words text-lg font-bold leading-8">{question.prompt}</h2>
    {question.word_bank.length > 0 && <p dir="ltr" className="rounded-xl bg-white/10 p-3 text-sm leading-7 text-blue-100">Word box: {question.word_bank.join(" · ")}</p>}
    {question.kind === "mcq" ? <div className="grid gap-2">{question.choices.map((choice, i) => <button key={i} className={`${button} text-start font-medium leading-7 ${answer === i ? "border-cyan-200 bg-cyan-200/20" : ""}`} dir="ltr" aria-pressed={answer === i} disabled={pending || seconds === 0} onClick={() => setAnswer(i)}>{choice}</button>)}</div>
      : <form onSubmit={(e) => { e.preventDefault(); submit(); }}><label htmlFor="nadawi-word" className="mb-2 block text-sm">{ar ? "اكتب كلمة واحدة" : "Type one word"}</label><input id="nadawi-word" dir="ltr" value={typeof answer === "string" ? answer : ""} maxLength={60} autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={pending || seconds === 0} className="min-h-12 w-full rounded-xl border border-white/25 bg-white/5 px-4" onChange={(e) => setAnswer(e.target.value)} /></form>}
    <button className={`${button} w-full bg-cyan-200/20`} disabled={!valid || pending || seconds === 0} onClick={submit}>{pending ? (ar ? "جاري حفظ الإجابة…" : "Saving answer…") : seconds === 0 ? (ar ? "انتهى الوقت، جاري الانتقال…" : "Time’s up, moving on…") : (ar ? "ثبّت الإجابة وانتقل" : "Submit and continue")}</button>
    <p className="text-xs leading-6 text-blue-200">{ar ? "ما تگدر ترجع بعد تثبيت الإجابة. الصحيح نقطة واحدة؛ نتيجتك تظهر بالنهاية." : "Answers cannot be changed after submission. Each correct answer earns one point; results appear at the end."}</p>
  </section>;
}
