import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FileText, Layers, Loader2, Palette, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { SUBJECTS_ORDER, type BankSubject } from "@/data/subjectChapters";
import { chapterOptions, listOptions } from "@/features/pdf-builder/catalog";
import { loadPdfBank, type BankLoadResult } from "@/features/pdf-builder/loadBank";
import { selectQuestions, eligibleQuestions, kindLabel, TEMPLATES, type AnswerPlacement, type BankSelection, type PdfSettings, type PdfTemplate, type QuestionFilters } from "@/features/pdf-builder/model";
import BookletPreview from "@/features/pdf-builder/BookletPreview";
import "@/features/pdf-builder/booklet.css";

const field = "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const panel = "rounded-2xl border border-border bg-card p-5 sm:p-6";

export default function PdfBuilder({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const ar = language === "ar";
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const [selection, setSelection] = useState<BankSelection>({ subject: "physics", chapter: "1", language, list: "haydar-diwan", section: "grammar" });
  const [bank, setBank] = useState<BankLoadResult>({ questions: [], warnings: [] });
  const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState(false), [retry, setRetry] = useState(0);
  const [filters, setFilters] = useState<QuestionFilters>({ includeMinisterial: true, includeReview: true, includeMcq: true, includeWritten: true, counts: { ministerial: "all", review: "all", mcq: "all" }, order: "bank" });
  const [template, setTemplate] = useState<PdfTemplate>("revision"), [answers, setAnswers] = useState<AnswerPlacement>("end"), [fontSize, setFontSize] = useState(16);
  const [title, setTitle] = useState(""), [student, setStudent] = useState("");
  const [preview, setPreview] = useState(false), [exporting, setExporting] = useState(false);
  const chapters = useMemo(() => chapterOptions(selection.subject, selection.section), [selection.subject, selection.section]);
  const lists = useMemo(() => listOptions(selection.subject), [selection.subject]);
  const chapter = chapters.find(c => c.key === selection.chapter);
  const subject = SUBJECTS_ORDER.find(s => s.code === selection.subject)!;
  const subtitle = `${ar ? subject.ar : subject.en} · ${ar ? chapter?.arTitle ?? "" : chapter?.title ?? ""}`;
  const settings = useMemo<PdfSettings>(() => ({ title: title.trim() || (ar ? "ملزمتي الدراسية" : "My study booklet"), student: student.trim(), subtitle, language, template, answers, fontSize }), [title, student, subtitle, language, template, answers, fontSize, ar]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setLoadError(false); setBank({ questions: [], warnings: [] }); setPreview(false);
    setFilters(value => ({ ...value, counts: { ministerial: "all", review: "all", mcq: "all" } }));
    void loadPdfBank(selection).then(result => { if (!cancelled) setBank(result); }).catch(() => { if (!cancelled) setLoadError(true); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selection, retry]);

  const available = useMemo(() => eligibleQuestions(bank.questions, filters), [bank.questions, filters]);
  const chosen = useMemo(() => {
    try { return { questions: selectQuestions(bank.questions, filters), error: "" }; }
    catch (error) { return { questions: [], error: error instanceof Error ? error.message : "no_questions" }; }
  }, [bank.questions, filters]);
  const changeSubject = (value: BankSubject) => {
    const list = listOptions(value)[0].value;
    const next = chapterOptions(value, "grammar")[0].key;
    setSelection({ subject: value, chapter: next, language: ["arabic", "islamic", "math", "french"].includes(value) ? "ar" : selection.language, list, section: "grammar" });
  };
  const errorText = chosen.error === "invalid_count" ? tr("اختر عدداً ضمن المتاح لكل قسم.", "Choose a number within each section’s available count.") : chosen.error === "choose_source" ? tr("اختر مصدر أسئلة واحداً على الأقل.", "Choose at least one question source.") : tr("لا توجد أسئلة مطابقة لاختياراتك. جرّب قسماً أو فصلاً آخر.", "No questions match these choices. Try another section or chapter.");
  const flags = [
    { key: "includeMinisterial" as const, label: tr("الأسئلة الوزارية", "Ministerial questions") },
    { key: "includeReview" as const, label: tr("غير الوزاري من بطاقات المراجعة", "Non-ministerial revision cards") },
    { key: "includeWritten" as const, label: tr("أسئلة تحريرية", "Written questions") },
    { key: "includeMcq" as const, label: tr("اختيار من متعدد MCQ", "Multiple-choice questions") },
  ];
  return <main className="min-h-screen px-4 py-6 pb-28 text-foreground sm:px-6" dir={ar ? "rtl" : "ltr"}>
    <div className="mx-auto max-w-6xl space-y-6">
      <button type="button" disabled={exporting} onClick={onBack} className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground">{ar ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}{tr("رجوع", "Back")}</button>
      <header className="rounded-3xl bg-[#142d50] p-6 text-[#faf6eb] sm:p-8"><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"><FileText className="h-4 w-4" /> TAMAYZAK PDF</div><h1 className="text-3xl font-bold sm:text-4xl">{tr("صمّم ملزمتك", "Build your study PDF")}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">{tr("اختَر أسئلة الفصل من بنوك تميّزك، رتّب الأجوبة، وحدّد التصميم. ملزمتك جاهزة للقراءة والطباعة.", "Choose chapter questions from Tamayzak’s existing banks, arrange the answers, and pick a design. Create a booklet for reading and printing.")}</p></header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <fieldset disabled={exporting} className="min-w-0 space-y-5 disabled:opacity-70">
          <section className={panel}><h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><Layers className="h-5 w-5 text-primary" />{tr("١. اختَر المحتوى", "1. Choose content")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">{tr("المادة", "Subject")}<select aria-label={tr("المادة", "Subject")} className={field} value={selection.subject} onChange={e => changeSubject(e.target.value as BankSubject)}>{SUBJECTS_ORDER.map(s => <option key={s.code} value={s.code}>{ar ? s.ar : s.en}</option>)}</select></label>
              {selection.subject === "english" && <label className="text-sm font-medium">{tr("القسم", "Section")}<select className={field} aria-label={tr("القسم", "Section")} value={selection.section} onChange={e => { const section = e.target.value as BankSelection["section"]; setSelection(value => ({ ...value, section, chapter: chapterOptions(value.subject, section)[0].key })); }}><option value="grammar">{tr("القواعد", "Grammar")}</option><option value="literature">{tr("الأدب الإنكليزي", "Literature")}</option><option value="paragraphs">{tr("القطع", "Passages")}</option></select></label>}
              <label className="text-sm font-medium">{tr("الفصل / الموضوع", "Chapter / topic")}<select className={field} aria-label={tr("الفصل / الموضوع", "Chapter / topic")} value={selection.chapter} onChange={e => setSelection(value => ({ ...value, chapter: e.target.value }))}>{chapters.map(c => <option key={c.key} value={c.key}>{ar ? c.arTitle : c.title}</option>)}</select></label>
              <label className="text-sm font-medium">{tr("قائمة البطاقات", "Flashcard list")}<select className={field} aria-label={tr("قائمة البطاقات", "Flashcard list")} value={selection.list} onChange={e => setSelection(value => ({ ...value, list: e.target.value }))}>{lists.map(list => <option key={list.value} value={list.value}>{ar ? list.ar : list.en}</option>)}</select></label>
              {["physics", "chemistry", "biology", "english"].includes(selection.subject) && <label className="text-sm font-medium">{tr("لغة المنهج", "Curriculum language")}<select className={field} aria-label={tr("لغة المنهج", "Curriculum language")} value={selection.language} onChange={e => setSelection(value => ({ ...value, language: e.target.value as AppLanguage }))}><option value="ar">{tr("عربي", "Arabic")}</option><option value="en">{tr("متميزين / إنكليزي", "English")}</option></select></label>}
            </div>
            <p className="mt-4 text-xs leading-6 text-muted-foreground">{tr("قائمة المدرّس تخص بطاقات المراجعة. الوزاريات وMCQ تُسحب من بنك الفصل. يبقى نص السؤال وجوابه بلغة المصدر.", "The teacher list selects revision cards. Ministerial questions and MCQs come from the chapter banks. Questions retain their source language.")}</p>
          </section>
          <section className={panel}><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><SlidersHorizontal className="h-5 w-5 text-primary" />{tr("٢. اختَر الأسئلة", "2. Choose questions")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">{flags.map(flag => <label key={flag.key} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm"><input type="checkbox" checked={filters[flag.key]} onChange={e => setFilters(value => ({ ...value, [flag.key]: e.target.checked }))} className="h-4 w-4 accent-primary" />{flag.label}</label>)}</div>
            <p className="my-4 text-xs leading-6 text-muted-foreground">{tr("فلاتر الوزاري وغير الوزاري تنطبق على MCQ أيضاً. التصنيف حسب بنك تميّزك الحالي، والأسئلة المتطابقة تُدرج مرة واحدة.", "Source filters apply to MCQs too. Classification follows the existing Tamayzak banks; duplicate prompts are included once.")}</p>
            {loading ? <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />{tr("جاري تحميل بنك الفصل…", "Loading the chapter banks…")}</p> : loadError ? <p role="alert" className="text-sm text-destructive">{tr("تعذّر تحميل البنك وتعديلاته. أعد المحاولة.", "Could not load the bank and its corrections. Please retry.")}</p> : <div className="space-y-3">{(["ministerial", "review", "mcq"] as const).map(kind => {
              const count = available.filter(q => q.kind === kind).length;
              return <div key={kind} className="rounded-xl bg-muted/45 p-3"><div className="mb-2 flex justify-between gap-2 text-sm"><b>{kindLabel(kind, ar)}</b><span className="text-muted-foreground">{count} {tr("متاح", "available")}</span></div><div className="flex gap-2"><select className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-sm" aria-label={`${kindLabel(kind, ar)} ${tr("العدد", "quantity")}`} disabled={!count} value={filters.counts[kind] === "all" ? "all" : "number"} onChange={e => setFilters(value => ({ ...value, counts: { ...value.counts, [kind]: e.target.value === "all" ? "all" : Math.min(10, count) } }))}><option value="all">{tr("كل الأسئلة", "All questions")}</option><option value="number">{tr("عدد محدد", "Choose a number")}</option></select>{filters.counts[kind] !== "all" && <input aria-label={`${kindLabel(kind, ar)} ${tr("عدد الأسئلة", "question count")}`} type="number" min={0} max={count} step={1} value={filters.counts[kind]} disabled={!count} onChange={e => setFilters(value => ({ ...value, counts: { ...value.counts, [kind]: Number(e.target.value) } }))} className="min-h-10 w-24 rounded-lg border border-border bg-background px-2 text-sm" />}</div></div>;
            })}</div>}
            {(loadError || bank.warnings.length > 0) && <div className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm"><p>{tr("بعض بيانات البنك لم تُحمّل؛ الأعداد المعروضة تخص ما تم تحميله فقط.", "Some bank data could not be loaded; counts reflect only the available data.")}</p><button type="button" onClick={() => setRetry(value => value + 1)} className="mt-2 inline-flex min-h-10 items-center gap-2 font-bold text-primary"><RefreshCw className="h-4 w-4" />{tr("إعادة التحميل", "Reload banks")}</button></div>}
            <label className="mt-4 block text-sm">{tr("ترتيب الأسئلة", "Question order")}<select className={field} value={filters.order} onChange={e => setFilters(value => ({ ...value, order: e.target.value as QuestionFilters["order"] }))}><option value="bank">{tr("ترتيب البنك", "Bank order")}</option><option value="random">{tr("اختيار عشوائي", "Random selection")}</option></select></label>
          </section>
          <section className={panel}><h2 className="mb-4 text-lg font-bold">{tr("٣. تفاصيل ملزمتك", "3. Booklet details")}</h2><label className="block text-sm">{tr("عنوان الملف", "Booklet title")}<input className={field} maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder={tr("ملزمتي الدراسية", "My study booklet")} /></label><label className="mt-4 block text-sm">{tr("اسم الطالب (اختياري)", "Student name (optional)")}<input className={field} maxLength={80} value={student} onChange={e => setStudent(e.target.value)} /></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm">{tr("مكان الأجوبة", "Answer placement")}<select className={field} aria-label={tr("مكان الأجوبة", "Answer placement")} value={answers} onChange={e => setAnswers(e.target.value as AnswerPlacement)}><option value="end">{tr("الأجوبة في النهاية", "Answers at the end")}</option><option value="after">{tr("تحت كل سؤال", "After each question")}</option><option value="none">{tr("أسئلة فقط", "Questions only")}</option></select></label><label className="text-sm">{tr("حجم الخط", "Font size")}<select className={field} aria-label={tr("حجم الخط", "Font size")} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}><option value={14}>{tr("صغير", "Small")}</option><option value={16}>{tr("متوسط", "Medium")}</option><option value={18}>{tr("كبير", "Large")}</option></select></label></div></section>
        </fieldset>
        <div className="min-w-0 space-y-5 lg:sticky lg:top-5">
          <fieldset disabled={exporting} className={panel}><legend className="sr-only">{tr("اختَر التصميم", "Choose a template")}</legend><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Palette className="h-5 w-5 text-primary" />{tr("٤. اختَر التصميم", "4. Choose a template")}</h2><div className="grid grid-cols-2 gap-3">{TEMPLATES.map(item => <button key={item.id} type="button" aria-label={ar ? item.ar : item.en} aria-pressed={template === item.id} onClick={() => setTemplate(item.id)} className={`relative min-w-0 rounded-xl border-2 p-2 text-start transition ${template === item.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            <div className="pdf-thumbnail" data-template={item.id}><b>{title || tr("ملزمتي الدراسية", "My study booklet")}</b><p dir="auto">{chosen.questions[0]?.question || tr("أسئلتك حسب التصميم المختار", "Your questions in the selected design")}</p><i /><i /><i /></div><div className="px-1 py-2"><b className="text-sm">{ar ? item.ar : item.en}</b><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{ar ? item.descriptionAr : item.descriptionEn}</p></div>{template === item.id && <span className="absolute end-2 top-2 rounded-full bg-primary p-1 text-primary-foreground"><Check className="h-3 w-3" /></span>}
          </button>)}</div></fieldset>
          {!loading && !loadError && chosen.error && <p role="status" className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">{errorText}</p>}
          <button type="button" disabled={loading || loadError || !!chosen.error || exporting} onClick={() => setPreview(true)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground disabled:opacity-40"><FileText className="h-5 w-5" />{tr("معاينة ملزمتي", "Preview my PDF")} {!chosen.error && !loading && `· ${chosen.questions.length}`}</button>
          {preview && !loading && !loadError && !chosen.error && <BookletPreview questions={chosen.questions} settings={settings} onBusy={setExporting} />}
        </div>
      </div>
    </div>
  </main>;
}
