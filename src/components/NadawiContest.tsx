import type { Dispatch, SetStateAction } from "react";
import { Check, ChevronLeft, ChevronRight, PenLine, Trophy } from "lucide-react";
import type { AppLanguage } from "./LanguageGate";
import { NADAWI_QUESTIONS, NADAWI_WRITING, nadawiCorrect, singleWord, type NadawiAttempt } from "@/data/nadawiContestUnit2";

const button = "min-h-11 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40";
const sectionNames = { reading: ["القطع", "Reading"], grammar: ["القواعد", "Grammar"], vocabulary: ["المفردات والإسقاطات", "Vocabulary"], spelling: ["الإملاء", "Spelling"] };

export default function NadawiContest({ language, attempt, setAttempt }: { language: AppLanguage; attempt: NadawiAttempt; setAttempt: Dispatch<SetStateAction<NadawiAttempt>> }) {
  const ar = language === "ar";
  const { index, answers, writing } = attempt;
  const question = NADAWI_QUESTIONS[index];
  const writingStep = index === NADAWI_QUESTIONS.length;
  const currentAnswer = question ? answers[question.id] : undefined;
  const valid = question?.kind === "mcq" ? typeof currentAnswer === "number" : typeof currentAnswer === "string" && singleWord(currentAnswer);
  const score = NADAWI_QUESTIONS.filter((q) => nadawiCorrect(q, answers[q.id])).length;
  const words = writing.trim() ? writing.trim().split(/\s+/).length : 0;
  const allAnswered = NADAWI_QUESTIONS.every((q) => q.kind === "mcq" ? typeof answers[q.id] === "number" : typeof answers[q.id] === "string" && singleWord(answers[q.id] as string));
  const updateAnswer = (value: string | number) => setAttempt((prev) => ({ ...prev, answers: { ...prev.answers, [question.id]: value } }));
  const next = () => { if (valid) setAttempt((prev) => ({ ...prev, index: prev.index + 1 })); };

  if (!attempt.started) return <section className="space-y-4 text-start">
    <h2 className="text-lg font-black">{ar ? "جاهز لتحدّي اليونت الثاني؟" : "Ready for the Unit Two challenge?"}</h2>
    <ul className="space-y-2 text-sm leading-7 text-blue-100">
      <li>{ar ? "٢٤ سؤال اختيار من متعدد للقطع والقواعد." : "24 multiple-choice reading and grammar questions."}</li>
      <li>{ar ? "١٧ سؤال مفردات وإملاء بإجابة من كلمة واحدة." : "17 vocabulary and spelling questions with one-word typed answers."}</li>
      <li>{ar ? "سؤال الرسالة موجود بقسم منفصل، وتصحيحه يدوي." : "The letter-writing task is separate and requires manual marking."}</li>
    </ul>
    <p className="text-xs leading-6 text-blue-200">{ar ? "تجاوب كل الأسئلة، وتگدر ترجع تعدّل قبل إنهاء المحاولة. الإجابات الصحيحة تظهر بعد التسليم." : "Answer every question. You can go back and edit before finishing; correct answers appear after submission."}</p>
    <button className={`${button} w-full border-cyan-200/40 bg-cyan-200/20`} onClick={() => setAttempt((prev) => ({ ...prev, started: true }))}>{ar ? "ابدأ المسابقة" : "Start challenge"}</button>
  </section>;

  if (attempt.submitted) return <section className="space-y-5 text-start">
    <div className="rounded-2xl border border-cyan-200/25 bg-cyan-200/10 p-5 text-center"><Trophy className="mx-auto mb-3 h-10 w-10 text-amber-200" /><h2 className="text-xl font-black">{ar ? "خلصت المحاولة!" : "Attempt complete!"}</h2><p className="mt-3 text-3xl font-black" dir="ltr">{score} / {NADAWI_QUESTIONS.length}</p><p className="mt-2 text-sm text-blue-100">{ar ? "الإجابات الصحيحة بالتصحيح الآلي. الإنشاء غير داخل بهذه النتيجة." : "Correct automatically marked answers. Letter writing is not included in this score."}</p></div>
    <h3 className="font-bold">{ar ? "راجع إجاباتك" : "Review your answers"}</h3>
    <div className="space-y-3">{NADAWI_QUESTIONS.map((q) => {
      const correct = nadawiCorrect(q, answers[q.id]);
      const answer = q.kind === "mcq" ? q.choices[answers[q.id] as number] : String(answers[q.id] ?? "");
      const expected = q.kind === "mcq" ? q.choices[q.correct] : q.answers[0];
      return <article key={q.id} className={`space-y-2 rounded-xl border p-4 ${correct ? "border-emerald-300/30" : "border-rose-300/40"}`}>
        <p className="text-xs text-blue-200">{q.source} · {correct ? (ar ? "صحيح" : "Correct") : (ar ? "يحتاج مراجعة" : "Review")}</p>
        <h4 dir="ltr" className="text-start text-sm font-bold leading-6">{q.prompt}</h4>
        <p dir="ltr" className="break-words text-sm text-blue-100">Your answer: {answer}</p>
        {!correct && <p dir="ltr" className="break-words text-sm font-bold text-emerald-200">Correct answer: {expected}</p>}
        <p dir="rtl" className="text-xs leading-6 text-blue-200">{q.explanation}</p>
      </article>;
    })}</div>
    <div className="space-y-2 rounded-xl border border-white/20 p-4"><h3 className="font-bold">{ar ? "Q4 · الرسالة — تصحيح يدوي" : "Q4 · Letter — manual marking"}</h3><p dir="ltr" className="text-sm leading-6">{NADAWI_WRITING.prompt}</p><p dir="ltr" className="whitespace-pre-wrap break-words text-sm leading-7 text-blue-100">{writing || (ar ? "لم تكتب إجابة لهذا السؤال." : "No answer written for this task.")}</p><p className="text-xs text-blue-200">{ar ? "هذا النص ضمن محاولتك على الشاشة، ولم يُرسل إلى الأستاذ." : "This text is part of your on-screen attempt; it has not been sent to the teacher."}</p></div>
  </section>;

  return <section className="space-y-4 text-start">
    <div className="flex items-center justify-between gap-3 text-xs text-blue-100"><span>{writingStep ? "Q4 · Writing" : `${question.source} · ${sectionNames[question.section][ar ? 0 : 1]}`}</span><span>{index + 1} / {NADAWI_QUESTIONS.length + 1}</span></div>
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-200" style={{ width: `${(index + 1) / (NADAWI_QUESTIONS.length + 1) * 100}%` }} /></div>
    {writingStep ? <>
      <div className="flex items-center gap-2 font-bold"><PenLine className="h-4 w-4" />{ar ? "سؤال الإنشاء الأصلي" : "Original writing task"}</div>
      <h2 dir="ltr" className="text-start text-base font-bold leading-8">{NADAWI_WRITING.prompt}</h2>
      <p className="text-xs leading-6 text-blue-200">{ar ? "هذا السؤال يحتاج تصحيحاً يدوياً ولا يدخل بالنتيجة الآلية. تگدر تكتب محاولتك أو تتركه فارغاً وتنهي الأسئلة المصحّحة." : "This task needs manual marking and does not count towards the automatic score. You may write a draft or leave it blank and finish the marked questions."}</p>
      <label className="block text-sm" htmlFor="nadawi-letter">{ar ? "رسالتك" : "Your letter"}</label>
      <textarea id="nadawi-letter" dir="ltr" rows={7} maxLength={5000} value={writing} onChange={(e) => setAttempt((prev) => ({ ...prev, writing: e.target.value }))} className="block w-full rounded-xl border border-white/25 bg-white/5 p-3 text-start leading-7 text-white" />
      <p className={`text-xs ${words > 0 && (words < 100 || words > 120) ? "text-amber-200" : "text-blue-200"}`}>{ar ? `${words} كلمة · المطلوب ١٠٠–١٢٠ كلمة` : `${words} words · Target: 100–120 words`}</p>
    </> : <>
      <h2 dir="ltr" className="break-words text-start text-lg font-bold leading-8">{question.prompt}</h2>
      {question.wordBank && <p dir="ltr" className="rounded-xl bg-white/10 p-3 text-start text-sm leading-7 text-cyan-100">Word box: {question.wordBank.join(" · ")}</p>}
      {question.kind === "mcq" ? <div className="grid gap-2">{question.choices.map((choice, i) => <button key={i} type="button" dir="ltr" aria-pressed={currentAnswer === i} className={`${button} flex items-center justify-between gap-3 text-start font-medium leading-6 ${currentAnswer === i ? "border-cyan-200 bg-cyan-200/20" : ""}`} onClick={() => updateAnswer(i)}><span>{choice}</span>{currentAnswer === i && <Check className="h-4 w-4 shrink-0 text-cyan-100" />}</button>)}</div>
        : <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-2"><label htmlFor="nadawi-word" className="block text-sm">{ar ? "اكتب كلمة واحدة" : "Type one word"}</label><input key={question.id} id="nadawi-word" dir="ltr" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={60} value={typeof currentAnswer === "string" ? currentAnswer : ""} onChange={(e) => updateAnswer(e.target.value)} className="min-h-12 w-full rounded-xl border border-white/25 bg-white/5 px-4 text-start text-white" /><p className="text-xs leading-6 text-blue-200">{typeof currentAnswer === "string" && currentAnswer.trim() && !singleWord(currentAnswer) ? (ar ? "المطلوب كلمة واحدة فقط؛ الكلمات المكمّلة موجودة بالسؤال." : "Enter one word only; the remaining words are already in the question.") : (ar ? "اكتب الإجابة بالإنكليزي. الأحرف الكبيرة والصغيرة ما تغيّر التصحيح." : "Answer in English. Capitalization does not affect marking.")}</p></form>}
    </>}
    <div className="flex gap-2 pt-2"><button type="button" className={`${button} flex items-center gap-1`} disabled={index === 0} onClick={() => setAttempt((prev) => ({ ...prev, index: Math.max(0, prev.index - 1) }))}><ChevronLeft className="h-4 w-4" />{ar ? "السابق" : "Previous"}</button>
      {writingStep ? <button className={`${button} flex-1 border-cyan-200/40 bg-cyan-200/20`} disabled={!allAnswered} onClick={() => setAttempt((prev) => ({ ...prev, submitted: true }))}>{ar ? "إنهاء المحاولة وإظهار النتيجة" : "Finish and show result"}</button>
        : <button className={`${button} flex flex-1 items-center justify-center gap-1`} disabled={!valid} onClick={next}>{index === NADAWI_QUESTIONS.length - 1 ? (ar ? "لسؤال الرسالة" : "Continue to letter") : (ar ? "التالي" : "Next")}<ChevronRight className="h-4 w-4" /></button>}
    </div>
  </section>;
}
