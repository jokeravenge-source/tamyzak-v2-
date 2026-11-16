import type { ScienceEvidence } from "../../supabase/functions/_shared/scienceEvidence";

export default function ScienceEvidenceCard({ evidence, ar }: { evidence: ScienceEvidence; ar: boolean }) {
  const exact = evidence.sources.filter(source => source.match === "exact");
  const classifications = [...new Set(exact.map(source => source.classification).filter(Boolean))];
  const classification = classifications.length === 1 ? classifications[0] : null;
  const labels = ar ? { curriculum: "من المنهج", enrichment: "إثرائي", mixed: "يجمع بين المنهج والإثراء" } : { curriculum: "Curriculum", enrichment: "Enrichment", mixed: "Curriculum and enrichment" };
  const unknown = ar ? "غير متحقق" : "Unverified";
  const exams = exact.flatMap(source => source.exams);
  const hasPrintedPage = evidence.sources.some(source => source.printed_page !== null);
  return <section aria-label={ar ? "مصادر الجواب" : "Answer sources"} className="mt-4 space-y-2 whitespace-normal rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs leading-6">
    <p className="font-bold">{ar ? "المصادر والتصنيف" : "Sources and classification"} · <span dir="ltr">{evidence.academicYear}</span></p>
    {!hasPrintedPage && <p>{ar ? "صفحة الكتاب: " : "Textbook page: "}{unknown}</p>}
    <p>{ar ? "تصنيف السؤال: " : "Question classification: "}{classification ? labels[classification] : unknown}</p>
    {classification && exact.filter(s => s.classification === classification && s.classification_url).map(s => <a key={s.id} href={s.classification_url!} target="_blank" rel="noopener noreferrer" className="block font-semibold text-blue-700 underline dark:text-blue-200">{ar ? "مصدر التصنيف" : "Classification evidence"}</a>)}
    <p>{ar ? "الورود الوزاري المطابق: " : "Exact ministerial occurrence: "}{exams.length ? null : unknown}</p>
    {exams.map((exam, i) => <a key={`${exam.year}-${exam.round}-${i}`} href={exam.url} target="_blank" rel="noopener noreferrer" className="block font-semibold text-blue-700 underline dark:text-blue-200">{exam.year} · {exam.round}</a>)}
    {evidence.sources.map(source => <div key={source.id} className="space-y-1 border-t border-blue-500/15 pt-2">
      <p className="font-semibold">{source.match === "exact" ? (ar ? "سؤال مطابق بالنص" : "Exact question text") : (ar ? "مصدر ذو صلة — لا يثبت تطابق السؤال" : "Related source — does not establish an exact match")}</p>
      <p>{source.question}</p>
      {source.chapter && <p>{source.chapter}</p>}
      {source.book_title && source.book_url && <a href={source.book_url} target="_blank" rel="noopener noreferrer" className="block text-blue-700 underline dark:text-blue-200">{source.book_title} · {source.book_edition}{source.printed_page !== null ? ` · ${ar ? "صفحة الكتاب المطبوعة" : "Printed textbook page"} ${source.printed_page}` : ""}{source.pdf_page !== null ? ` · ${ar ? "صفحة ملف PDF" : "PDF file page"} ${source.pdf_page}` : ""}</a>}
      {source.match === "related" && source.exams.map((exam, i) => <a key={i} href={exam.url} target="_blank" rel="noopener noreferrer" className="block text-blue-700 underline dark:text-blue-200">{ar ? "وزاري مشابه بالفكرة، وليس إثباتاً لنفس السؤال: " : "Related ministerial question, not proof of this exact question: "}{exam.year} · {exam.round}</a>)}
    </div>)}
    {evidence.sources.length === 0 && <p>{ar ? "ما متوفر مصدر موثّق لهذا الجواب بطبعة ٢٠٢٦–٢٠٢٧. تگدر ترفق صفحة الكتاب حتى أشرحها، لكن الإرفاق وحده ما يثبت الطبعة أو سنة الوزاري." : "No verified 2026–2027 source is available for this answer. Attach the textbook page for explanation; an attachment alone does not verify its edition or exam history."}</p>}
    <p className="text-muted-foreground">{ar ? "غير متحقق ما تعني أن السؤال لم يرد وزارياً أو أنه إثرائي. التشابه بالفكرة ما يثبت التطابق." : "Unverified does not mean a question never appeared in an exam or is enrichment. Similarity is not an exact match."}</p>
  </section>;
}
