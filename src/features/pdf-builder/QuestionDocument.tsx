import { readableMath } from "@/lib/readableMath";
import { kindLabel, type PdfQuestion, type PdfSettings } from "./model";

function Answer({ question }: { question: PdfQuestion }) {
  return <div className="pdf-answer">
    {question.answerBlocks?.length ? question.answerBlocks.map((block, index) => block.type === "text"
      ? <p key={index} dir="auto">{readableMath(block.text)}</p>
      : <svg key={index} className="pdf-calculation" viewBox={`0 0 ${block.width} ${block.height}`} role="img" aria-label="Calculation" xmlns="http://www.w3.org/2000/svg">
          {block.runs.map((run, i) => <text key={i} x={run.x} y={run.y} fontSize={run.s} textLength={run.w || undefined} lengthAdjust={run.w ? "spacingAndGlyphs" : undefined}>{run.t}</text>)}
          {block.rules.map(([x, y, width], i) => <path key={`r${i}`} d={`M${x} ${y}h${width}`} stroke="currentColor" strokeWidth=".7" />)}
        </svg>) : <p dir="auto">{readableMath(question.answer)}</p>}
  </div>;
}

export function QuestionDocument({ questions, settings }: { questions: readonly PdfQuestion[]; settings: PdfSettings }) {
  const ar = settings.language === "ar";
  return <>
    <div className="pdf-intro pdf-unit"><p className="pdf-eyebrow">{ar ? "ملزمة دراسية خاصة" : "YOUR STUDY BOOKLET"}</p><h1>{settings.title}</h1><p>{settings.subtitle}</p>{settings.student && <p>{ar ? "إعداد الطالب: " : "Prepared for: "}{settings.student}</p>}<p>{questions.length} {ar ? "سؤالاً" : "questions"}</p></div>
    {(["ministerial", "review", "mcq"] as const).map(kind => {
      const items = questions.filter(q => q.kind === kind);
      if (!items.length) return null;
      return <div key={kind} className="pdf-section-fragment">
        <h2 className="pdf-section-title pdf-unit">{kindLabel(kind, ar)} <small>({items.length})</small></h2>
        {items.map(question => {
          const number = questions.indexOf(question) + 1;
          return <article key={question.id} className="pdf-question pdf-unit">
            <div className="pdf-question-meta"><b>{ar ? "س" : "Q"}{number}</b><span>{question.origin === "ministerial" ? ar ? "بنك الوزاريات" : "Ministerial bank" : question.kind === "mcq" ? "MCQ" : ar ? "بطاقات المراجعة" : "Revision cards"}</span></div>
            <p className="pdf-prompt" dir="auto">{readableMath(question.question)}</p>
            {question.choices && <ol className="pdf-choices">{question.choices.map((choice, index) => <li key={index} dir="auto"><b>{String.fromCharCode(65 + index)}.</b> {readableMath(choice)}</li>)}</ol>}
            {settings.answers === "after" ? <Answer question={question} /> : settings.template === "exam" && <div className="pdf-writing-space" aria-hidden="true" />}
          </article>;
        })}
      </div>;
    })}
    {settings.answers === "end" && <>
      <h2 className="pdf-section-title pdf-unit pdf-answer-heading">{ar ? "الأجوبة" : "Answer key"}</h2>
      {questions.map((question, index) => <article key={`answer:${question.id}`} className="pdf-question pdf-unit"><b className="pdf-answer-number">{ar ? "جواب " : "Answer "}{index + 1}</b><Answer question={question} /></article>)}
    </>}
  </>;
}
