import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, ClipboardCheck, KeyRound, Loader2, LockKeyhole, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { edgeErrorMessage } from "@/lib/edgeError";
import { extractStudyMaterial } from "@/lib/fileText";
import { literatureCount, literatureExamExtension, validateLiteratureQuestions, type LiteratureQuestion } from "@/lib/literatureCourse";

type Access = { supervisor: boolean; unlocked: boolean };
type Exam = { id: string; title: string; chapter: string; file_path: string; is_published: boolean };
type SetRow = { id: string; title: string; chapter: string; count?: number; requested_count?: number; is_published?: boolean; questions?: LiteratureQuestion[]; source_name?: string };
type Code = { id: string; code_hint: string; label: string; max_uses: number; uses: number; expires_at: string | null; revoked: boolean };
type Quiz = { id: string; title: string; questions: { question: string; choices: string[] }[] };
type Result = { score: number; total: number; review: { answer_index: number; explanation: string }[] };
const db = supabase as any;
const field = "w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-base";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold disabled:opacity-50";
const primary = `${button} border-primary bg-primary text-primary-foreground`;

export default function LiteratureCourse({ isAr: ar, onClose }: { isAr: boolean; onClose: () => void }) {
  const tr = (a: string, e: string) => ar ? a : e;
  const [access, setAccess] = useState<Access | null>(null), [loading, setLoading] = useState(true), [notice, setNotice] = useState("");
  const [owner, setOwner] = useState<string | null>(null), [busy, setBusy] = useState(false), [tab, setTab] = useState<"exams" | "mcq" | "codes">("exams");
  const [exams, setExams] = useState<Exam[]>([]), [sets, setSets] = useState<SetRow[]>([]), [codes, setCodes] = useState<Code[]>([]);
  const [code, setCode] = useState(""), [newCodes, setNewCodes] = useState<{ id: string; code: string }[]>([]);
  const [quantity, setQuantity] = useState("1"), [uses, setUses] = useState("1"), [expiry, setExpiry] = useState(""), [codeLabel, setCodeLabel] = useState("");
  const [examTitle, setExamTitle] = useState(""), [examChapter, setExamChapter] = useState(""), [examFile, setExamFile] = useState<File | null>(null);
  const [setTitle, setSetTitle] = useState(""), [setChapter, setSetChapter] = useState(""), [count, setCount] = useState("10"), [source, setSource] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null), [sourceName, setSourceName] = useState("");
  const [draft, setDraft] = useState<LiteratureQuestion[]>([]), [coverage, setCoverage] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null), [answers, setAnswers] = useState<number[]>([]), [result, setResult] = useState<Result | null>(null);
  const initialized = useRef(false);
  const version = useRef(0), activeOwner = useRef<string | null>(null), running = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null), sourceInput = useRef<HTMLInputElement>(null);
  const rpc = async (name: string, args?: object) => { const { data, error } = await db.rpc(name, args); if (error) throw error; return data; };
  const resetPrivate = () => { setAccess(null); setExams([]); setSets([]); setCodes([]); setNewCodes([]); setDraft([]); setEditId(null); setSourceName(""); setSource(null); setExamFile(null); setQuiz(null); setResult(null); setAnswers([]); setCode(""); setNotice(""); setTab("exams"); setCoverage(""); setExamTitle(""); setExamChapter(""); setSetTitle(""); setSetChapter(""); setCodeLabel(""); setExpiry(""); setQuantity("1"); setUses("1"); setCount("10"); if (fileInput.current) fileInput.current.value=""; if (sourceInput.current) sourceInput.current.value=""; };
  const refresh = async (scope = version.current) => {
    const a = await rpc("literature_course_access") as Access;
    if (scope !== version.current) return;
    setAccess(a);
    if (!a.unlocked) { setQuiz(null); setResult(null); setExams([]); setSets([]); return; }
    const [e, s, c] = await Promise.all([
      db.from("literature_exams").select("id,title,chapter,file_path,is_published").order("created_at", { ascending: false }),
      a.supervisor ? db.from("literature_mcq_sets").select("id,title,chapter,requested_count,is_published,questions,source_name").order("created_at", { ascending: false }) : db.rpc("list_literature_mcq_sets"),
      a.supervisor ? db.from("literature_access_codes").select("id,label,code_hint,max_uses,uses,expires_at,revoked").order("created_at", { ascending: false }).limit(300) : Promise.resolve({ data: [], error: null }),
    ]);
    for (const r of [e,s,c]) if (r.error) throw r.error;
    if (scope !== version.current) return;
    setExams(e.data ?? []); setSets(s.data ?? []); setCodes(c.data ?? []);
  };
  useEffect(() => {
    let mounted = true, revision = 0;
    const apply = async (id: string | null) => {
      if (!mounted) return;
      const scope = ++version.current; initialized.current = true; activeOwner.current = id; setOwner(id); resetPrivate(); running.current = false; setBusy(false); setLoading(true);
      try { if (id) await refresh(scope); }
      catch { if (mounted && scope === version.current) setNotice(tr("تعذّر تحميل الدورة. حاول مرة ثانية.", "Could not load the course. Please retry.")); }
      finally { if (mounted && scope === version.current) setLoading(false); }
    };
    const initial = revision;
    void supabase.auth.getUser().then(({ data }) => { if (revision === initial) void apply(data.user?.id ?? null); }).catch(() => { if (revision === initial) void apply(null); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { revision++; if (initialized.current && (session?.user.id ?? null) === activeOwner.current) return; void apply(session?.user.id ?? null); });
    return () => { mounted = false; version.current++; data.subscription.unsubscribe(); };
  }, []);
  const run = async (task: (check: () => void, scope: number) => Promise<void>) => {
    if (running.current || !activeOwner.current) return;
    const scope = version.current; running.current = true; setBusy(true); setNotice("");
    const check = () => { if (scope !== version.current) throw new Error("stale_operation"); };
    try { await task(check, scope); }
    catch (e) { if (scope === version.current) setNotice(e instanceof Error && e.message === "invalid_count" ? tr("اختار عدد صحيح من ١ إلى ١٠٠.", "Choose an integer from 1 to 100.") : e instanceof Error && /invalid_questions|duplicate_questions/.test(e.message) ? tr("راجع الأسئلة: كل سؤال يحتاج ٤ اختيارات مختلفة، جواب صحيح وشرح، دون تكرار.", "Review the questions: four distinct choices, a correct answer and explanation are required, without duplicates.") : (e as any)?.message || tr("تعذّر إكمال العملية.", "Could not complete the action.")); }
    finally { if (scope === version.current) { running.current = false; setBusy(false); } }
  };
  const redeem = () => run(async (check, scope) => {
    const r = await rpc("redeem_literature_code", { access_code: code.trim() }); check();
    if (!r.ok) throw new Error(r.error === "rate_limited" ? tr("محاولات كثيرة. انتظر ١٥ دقيقة.", "Too many attempts. Wait 15 minutes.") : tr("الكود غير صالح، منتهي أو مستخدم بالكامل.", "The code is invalid, expired, or fully used."));
    setCode(""); await refresh(scope);
  });
  const uploadExam = () => run(async (check, scope) => {
    if (!examFile || !examTitle.trim()) throw new Error(tr("اكتب عنوان الامتحان واختار ملفه.", "Enter an exam title and choose its file."));
    let ext: string; try { ext = literatureExamExtension(examFile); } catch { throw new Error(tr("اختار PDF أو صورة JPG/PNG بحجم لحد ١٠٠ ميغابايت.", "Choose a PDF or JPG/PNG image up to 100 MB.")); }
    const path = `exams/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("literature-course").upload(path, examFile, { contentType: ext === "pdf" ? "application/pdf" : ext === "png" ? "image/png" : "image/jpeg", upsert: false });
    if (error) throw error;
    try {
      check(); const saved = await db.from("literature_exams").insert({ title: examTitle.trim(), chapter: examChapter.trim(), file_path: path }); if (saved.error) throw saved.error;
    } catch(e) { await supabase.storage.from("literature-course").remove([path]); throw e; }
    check(); setExamTitle(""); setExamFile(null); if (fileInput.current) fileInput.current.value=""; await refresh(scope); check(); setNotice(tr("انرفع الامتحان كمسودة. انشره من القائمة حتى يظهر للمشتركين.", "Exam uploaded as a draft. Publish it from the list to make it available."));
  });
  const generate = (append = false) => run(async (check) => {
    const target = literatureCount(count);
    if (!source || !setTitle.trim()) throw new Error(tr("اكتب عنوان المجموعة واختار ملف المصدر.", "Enter a set title and choose a source file."));
    if (!/\.(pdf|docx|txt)$/i.test(source.name) || !source.size || source.size > 100 * 1024 * 1024) throw new Error(tr("اختار PDF أو DOCX أو TXT بحجم لحد ١٠٠ ميغابايت.", "Choose a PDF, DOCX or TXT up to 100 MB."));
    const material = await extractStudyMaterial(source); check();
    if (!material.text.trim() && !material.pageImages?.length && !material.fileData) throw new Error(tr("ما قدرنا نقرأ محتوى الملف. جرّب نسخة أوضح.", "No readable source content. Try a clearer file."));
    const remaining = target - (append ? draft.length : 0); if (remaining < 1) return;
    const { data, error } = await supabase.functions.invoke("generate-mcq", { body: { ...material, count: remaining, language: "ar", literatureGeneration: true } });
    if (error) throw new Error(await edgeErrorMessage(error, tr("تعذّر توليد الأسئلة.", "Could not generate questions.")));
    if (data?.error) throw new Error(data.error); check();
    const generated = validateLiteratureQuestions(data?.questions);
    const combined = [...(append ? draft : []), ...generated]; const seen = new Set<string>();
    const unique = combined.filter(q => { const key=q.question.trim().replace(/\s+/g," ").toLowerCase(); if(seen.has(key))return false; seen.add(key); return true; }).slice(0,target);
    setDraft(unique); setSourceName(source.name);
    setCoverage(tr("راجع الأسئلة والإجابات قبل النشر. الملفات الكبيرة أو المصوّرة قد تُقرأ جزئياً؛ قسّم الملف إذا تحتاج تغطية كل أجزائه.", "Review questions and answers before publishing. Large or scanned files may be read partially; split the file when full coverage is needed."));
    if (unique.length < target) setNotice(tr(`تولّد ${unique.length} من ${target}. تكدر تطلب إكمال العدد، أو ترفع مصدر أغنى.`, `Generated ${unique.length} of ${target}. Request the remainder or use a richer source.`));
  });
  const saveSet = () => run(async (check, scope) => {
    const qs=validateLiteratureQuestions(draft); if(qs.length!==literatureCount(count))throw new Error(tr("كمّل العدد المطلوب قبل حفظ المجموعة.", "Complete the requested count before saving."));
    if(!setTitle.trim() || !sourceName)throw new Error(tr("العنوان والمصدر مطلوبان.", "Title and source are required.")); check();
    const payload={title:setTitle.trim(),chapter:setChapter.trim(),source_name:sourceName,requested_count:qs.length,questions:qs,is_published:false};
    const {error}=editId ? await db.from("literature_mcq_sets").update(payload).eq("id",editId) : await db.from("literature_mcq_sets").insert(payload); if(error)throw error; check();setDraft([]);setEditId(null);setSourceName("");setSetTitle("");await refresh(scope);check();setNotice(tr("انحفظت المجموعة كمسودة. انشرها من القائمة بعد المراجعة.", "Set saved as a draft. Publish it from the list after review."));
  });
  const toggle = (kind: "exams"|"sets", row: Exam|SetRow) => run(async(check,scope)=>{
    const {error}=await db.from(kind==="exams"?"literature_exams":"literature_mcq_sets").update({is_published:!row.is_published}).eq("id",row.id);if(error)throw error;check();await refresh(scope);
  });
  const remove = (kind:"exams"|"sets",row:Exam|SetRow) => {
    if(!window.confirm(tr("تأكيد حذف هذا المحتوى؟","Delete this content?")))return;
    void run(async(check,scope)=>{const {error}=await db.from(kind==="exams"?"literature_exams":"literature_mcq_sets").delete().eq("id",row.id);if(error)throw error;check();if(kind==="exams"){const r=await supabase.storage.from("literature-course").remove([(row as Exam).file_path]);if(r.error)throw r.error;}await refresh(scope);});
  };
  const openExam=(exam:Exam)=>run(async(check)=>{
    const {data,error}=await supabase.storage.from("literature-course").createSignedUrl(exam.file_path,60);if(error)throw error;check();
    const link=document.createElement("a");link.href=data.signedUrl;link.target="_blank";link.rel="noopener noreferrer";document.body.appendChild(link);link.click();link.remove();
  });
  const createCodes=()=>run(async(check,scope)=>{
    const n=literatureCount(quantity),u=Number(uses);if(!Number.isInteger(u)||u<1||u>10000)throw new Error(tr("عدد الاستخدامات من ١ إلى ١٠٠٠٠.","Use limit must be 1–10,000."));
    const date=expiry?new Date(`${expiry}+03:00`).toISOString():null;
    const r=await rpc("create_literature_codes",{quantity:n,use_limit:u,expiry:date,code_label:codeLabel.trim()});check();setNewCodes(r);await refresh(scope);
  });
  const startQuiz=(row:SetRow)=>run(async(check)=>{const q=await rpc("get_literature_mcq_set",{set_id:row.id});check();setQuiz(q);setAnswers(Array(q.questions.length).fill(-1));setResult(null);});
  const submit=()=>run(async(check)=>{if(!quiz)return;const r=await rpc("submit_literature_mcq",{set_id:quiz.id,selections:answers});check();setResult(r);});
  const updateDraft=(i:number,patch:Partial<LiteratureQuestion>)=>setDraft(old=>old.map((q,j)=>j===i?{...q,...patch}:q));

  return <main dir={ar?"rtl":"ltr"} className="min-h-screen bg-background px-4 py-6 pb-28 text-foreground"><div className="mx-auto max-w-4xl space-y-5">
    <button onClick={onClose} className={button}><ArrowLeft className={`size-4 ${ar?"rotate-180":""}`}/>{tr("رجوع","Back")}</button>
    <header className="rounded-3xl bg-slate-900 p-6 text-white"><BookOpen className="mb-3 size-8 text-amber-300"/><p className="text-xs font-bold text-amber-200">{tr("تميّزك · اللغة العربية","Tamayzak · Arabic")}</p><h1 className="mt-2 text-3xl font-black">{tr("دورة الأدب","Literature course")}</h1><p className="mt-3 text-sm leading-7 text-slate-200">{tr("امتحانات يرفعها المشرف، وأسئلة اختيار من متعدد للمراجعة. فعّل كودك حتى تدخل للدورة.","Supervisor-uploaded exams and multiple-choice revision. Redeem your code to access the course.")}</p></header>
    {notice&&<p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm leading-7">{notice}</p>}
    {loading?<p role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin"/>{tr("جاري التحميل…","Loading…")}</p>:!owner?<p>{tr("سجّل دخولك حتى تدخل للدورة.","Sign in to access the course.")}</p>:!access?<button className={button} disabled={busy} onClick={()=>void run(async(_check,scope)=>refresh(scope))}>{tr("إعادة المحاولة","Retry")}</button>:!access.unlocked?<form onSubmit={e=>{e.preventDefault();void redeem();}} className="space-y-4 rounded-2xl border border-border bg-card p-5"><LockKeyhole className="size-7 text-primary"/><h2 className="text-xl font-bold">{tr("الدورة مقفولة بكود","Code required")}</h2><p className="text-sm text-muted-foreground">{tr("احصل على كود من المشرف. التفعيل يرتبط بحسابك ويفتح امتحانات الدورة وقسم MCQ.","Get a code from the supervisor. Activation is tied to your account and unlocks course exams and MCQs.")}</p><label className="block space-y-2"><span>{tr("كود الدخول","Access code")}</span><input aria-label={tr("كود الدخول","Access code")} dir="ltr" value={code} maxLength={100} onChange={e=>setCode(e.target.value)} className={field} autoComplete="off" required/></label><button className={primary} disabled={busy||!code.trim()}>{tr("تفعيل الكود","Redeem code")}</button></form>:<>
      {access.supervisor&&<p className="rounded-xl bg-primary/10 p-3 text-sm font-semibold">{tr("لوحة المشرف — إدارة الامتحانات والأسئلة وأكواد الدخول","Supervisor dashboard — exams, questions and access codes")}</p>}
      <nav aria-label={tr("أقسام الدورة","Course sections")} className="flex flex-wrap gap-2">{(["exams","mcq",...(access.supervisor?["codes"]:[])] as const).map(t=><button key={t} className={tab===t?primary:button} disabled={busy} onClick={()=>{setTab(t as any);setQuiz(null);setResult(null);}}>{t==="exams"?<ClipboardCheck className="size-4"/>:t==="codes"?<KeyRound className="size-4"/>:<BookOpen className="size-4"/>}{t==="exams"?tr("الامتحانات","Exams"):t==="codes"?tr("أكواد الدخول","Access codes"):"MCQ"}</button>)}</nav>
      {tab==="exams"&&<section className="space-y-4">
        {access.supervisor&&<form onSubmit={e=>{e.preventDefault();void uploadExam();}} className="space-y-3 rounded-2xl border border-border bg-card p-4"><h2 className="font-bold">{tr("رفع امتحان جديد","Upload exam")}</h2><label className="block">{tr("عنوان الامتحان","Exam title")}<input className={field} value={examTitle} maxLength={180} required disabled={busy} onChange={e=>setExamTitle(e.target.value)}/></label><label className="block">{tr("الفصل أو الموضوع","Chapter or topic")}<input className={field} value={examChapter} maxLength={180} disabled={busy} onChange={e=>setExamChapter(e.target.value)}/></label><label className="block">{tr("ملف الامتحان — PDF أو JPG/PNG، لحد ١٠٠ MB","Exam file — PDF or JPG/PNG, up to 100 MB")}<input ref={fileInput} type="file" accept=".pdf,.jpg,.jpeg,.png" className={field} disabled={busy} onChange={e=>setExamFile(e.target.files?.[0]??null)}/></label><button className={primary} disabled={busy||!examFile}><Upload className="size-4"/>{tr("رفع كمسودة","Upload draft")}</button></form>}
        {!exams.length&&<p>{tr("ماكو امتحانات منشورة حالياً.","No exams are available yet.")}</p>}
        {exams.map(exam=><article key={exam.id} className="space-y-3 rounded-2xl border border-border bg-card p-4"><h3 className="text-lg font-bold">{exam.title}</h3><p className="text-sm text-muted-foreground">{exam.chapter}{access.supervisor&&` · ${exam.is_published?tr("منشور","Published"):tr("مسودة","Draft")}`}</p><div className="flex flex-wrap gap-2"><button className={button} disabled={busy} onClick={()=>void openExam(exam)}>{tr("فتح الامتحان","Open exam")}</button>{access.supervisor&&<><button className={button} disabled={busy} onClick={()=>void toggle("exams",exam)}>{exam.is_published?tr("إلغاء النشر","Unpublish"):tr("نشر الامتحان","Publish exam")}</button><button className={button} disabled={busy} onClick={()=>remove("exams",exam)} aria-label={tr(`حذف ${exam.title}`,`Delete ${exam.title}`)}><Trash2 className="size-4"/></button></>}</div></article>)}
      </section>}
      {tab==="mcq"&&<section className="space-y-5">
        {access.supervisor&&!quiz&&<form onSubmit={e=>{e.preventDefault();void generate();}} className="space-y-3 rounded-2xl border border-border bg-card p-4"><h2 className="text-lg font-bold">{tr("توليد أسئلة من ملف","Generate questions from a file")}</h2><label className="block">{tr("عنوان مجموعة الأسئلة","Question set title")}<input className={field} value={setTitle} maxLength={180} required disabled={busy} onChange={e=>setSetTitle(e.target.value)}/></label><label className="block">{tr("الفصل أو الموضوع","Chapter or topic")}<input className={field} value={setChapter} maxLength={180} disabled={busy} onChange={e=>setSetChapter(e.target.value)}/></label><label className="block">{tr("عدد الأسئلة (١–١٠٠)","Question count (1–100)")}<input className={field} type="number" min={1} max={100} step={1} value={count} required disabled={busy} onChange={e=>{setCount(e.target.value);setDraft([]);}}/></label><label className="block">{tr("ملف المصدر — PDF أو DOCX أو TXT، لحد ١٠٠ MB","Source file — PDF, DOCX or TXT, up to 100 MB")}<input ref={sourceInput} className={field} type="file" accept=".pdf,.docx,.txt" disabled={busy} onChange={e=>{setSource(e.target.files?.[0]??null);setSourceName(e.target.files?.[0]?.name??"");setEditId(null);setDraft([]);setCoverage("");}}/></label><button className={primary} disabled={busy||!source}>{busy?<Loader2 className="size-4 animate-spin"/>:<Plus className="size-4"/>}{tr("توليد للمراجعة","Generate for review")}</button></form>}
        {access.supervisor&&draft.length>0&&!quiz&&<div className="space-y-3"><h2 className="text-lg font-bold">{tr("مراجعة الأسئلة","Review questions")} · {draft.length}/{count}</h2><p className="text-sm text-muted-foreground">{coverage}</p>{draft.map((q,i)=><article key={i} className="space-y-2 rounded-2xl border border-border p-4"><label className="block">{tr("السؤال","Question")} {i+1}<textarea className={field} value={q.question} disabled={busy} maxLength={4000} onChange={e=>updateDraft(i,{question:e.target.value})}/></label>{q.choices.map((choice,j)=><label key={j} className="flex items-center gap-2"><input type="radio" name={`correct-${i}`} aria-label={tr(`الإجابة الصحيحة للسؤال ${i+1}: الاختيار ${j+1}`,`Correct answer for question ${i+1}: choice ${j+1}`)} checked={q.answer_index===j} disabled={busy} onChange={()=>updateDraft(i,{answer_index:j})}/><input className={field} aria-label={tr(`اختيار ${j+1} للسؤال ${i+1}`,`Choice ${j+1} for question ${i+1}`)} value={choice} maxLength={1000} disabled={busy} onChange={e=>updateDraft(i,{choices:q.choices.map((c,k)=>k===j?e.target.value:c)})}/></label>)}<label className="block">{tr("شرح الإجابة","Answer explanation")}<textarea className={field} value={q.explanation} maxLength={6000} disabled={busy} onChange={e=>updateDraft(i,{explanation:e.target.value})}/></label></article>)}<div className="flex flex-wrap gap-2">{draft.length<Number(count)&&<button className={button} disabled={busy} onClick={()=>void generate(true)}>{tr("إكمال العدد المتبقي","Generate the remainder")}</button>}<button className={primary} disabled={busy||draft.length!==Number(count)} onClick={()=>void saveSet()}>{tr("حفظ المجموعة كمسودة","Save set as draft")}</button></div></div>}
        {quiz?<div className="space-y-4"><button className={button} disabled={busy} onClick={()=>{setQuiz(null);setResult(null);}}>{tr("رجوع للمجموعات","Back to sets")}</button><h2 className="text-xl font-bold">{quiz.title}</h2>{result&&<p role="status" className="rounded-xl bg-primary/10 p-4 font-bold">{tr("نتيجتك","Your score")}: {result.score}/{result.total}</p>}{quiz.questions.map((q,i)=><fieldset key={i} disabled={busy||!!result} className="space-y-2 rounded-2xl border border-border p-4"><legend className="px-2 font-bold">{i+1}. {q.question}</legend>{q.choices.map((c,j)=><label key={j} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3"><input type="radio" className="mt-1" name={`answer-${i}`} checked={answers[i]===j} onChange={()=>setAnswers(old=>old.map((v,k)=>k===i?j:v))}/><span>{c}</span></label>)}{result&&<p className="text-sm leading-7">{tr("الإجابة الصحيحة:","Correct answer:")} {q.choices[result.review[i].answer_index]}<br/>{result.review[i].explanation}</p>}</fieldset>)}{!result&&<button className={primary} disabled={busy||answers.some(a=>a<0)} onClick={()=>void submit()}>{tr("تسليم ومعرفة النتيجة","Submit and view score")}</button>}</div>:<div className="space-y-3">{!sets.length&&<p>{tr("ماكو مجموعات أسئلة منشورة حالياً.","No question sets are available yet.")}</p>}{sets.map(s=><article key={s.id} className="space-y-3 rounded-2xl border border-border bg-card p-4"><h3 className="font-bold">{s.title}</h3><p className="text-sm text-muted-foreground">{s.chapter} · {s.count??s.requested_count} {tr("سؤال","questions")}{access.supervisor&&` · ${s.is_published?tr("منشور","Published"):tr("مسودة","Draft")}`}</p><div className="flex flex-wrap gap-2">{s.is_published!==false&&<button className={button} disabled={busy} onClick={()=>void startQuiz(s)}>{tr("ابدأ الأسئلة","Start questions")}</button>}{access.supervisor&&<><button className={button} disabled={busy} onClick={()=>void toggle("sets",s)}>{s.is_published?tr("إلغاء النشر","Unpublish"):tr("نشر المجموعة","Publish set")}</button><button className={button} disabled={busy} onClick={()=>{setSetTitle(s.title);setSetChapter(s.chapter);setCount(String(s.requested_count));setDraft(s.questions??[]);setSource(null);setEditId(s.id);setSourceName(s.source_name??"");if(sourceInput.current)sourceInput.current.value="";setCoverage(tr("حفظ التعديلات يرجّع المجموعة لمسودة؛ انشرها بعد المراجعة.","Saving edits returns this set to draft; publish it again after review."));}}>{tr("مراجعة وتعديل","Review and edit")}</button><button className={button} disabled={busy} onClick={()=>remove("sets",s)}><Trash2 className="size-4"/>{tr("حذف","Delete")}</button></>}</div></article>)}</div>}
      </section>}
      {tab==="codes"&&access.supervisor&&<section className="space-y-4"><form onSubmit={e=>{e.preventDefault();void createCodes();}} className="space-y-3 rounded-2xl border border-border bg-card p-4"><h2 className="font-bold">{tr("إنشاء أكواد للدورة","Create course codes")}</h2><label className="block">{tr("وصف الدفعة","Batch label")}<input className={field} value={codeLabel} maxLength={180} disabled={busy} onChange={e=>setCodeLabel(e.target.value)}/></label><div className="grid gap-3 sm:grid-cols-2"><label>{tr("عدد الأكواد (١–١٠٠)","Number of codes (1–100)")}<input className={field} type="number" min={1} max={100} step={1} required disabled={busy} value={quantity} onChange={e=>setQuantity(e.target.value)}/></label><label>{tr("عدد الطلاب لكل كود","Students per code")}<input className={field} type="number" min={1} max={10000} step={1} required disabled={busy} value={uses} onChange={e=>setUses(e.target.value)}/></label></div><label className="block">{tr("انتهاء الوصول — بتوقيت بغداد (اختياري)","Access expiry — Baghdad time (optional)")}<input className={field} type="datetime-local" value={expiry} disabled={busy} onChange={e=>setExpiry(e.target.value)}/></label><p className="text-xs text-muted-foreground">{tr("الكود يفتح الدورة كلها. الافتراضي طالب واحد لكل كود، والوصول ينتهي بالتاريخ المحدد إن وُجد.","Codes unlock the whole course. The default is one student per code; access ends at the selected expiry, if set.")}</p><button className={primary} disabled={busy}>{tr("إنشاء الأكواد","Create codes")}</button></form>{newCodes.length>0&&<div className="space-y-3 rounded-2xl border border-primary/30 p-4"><p className="font-bold">{tr("انسخ الأكواد الآن؛ النص الكامل يظهر بهالمرة فقط.","Copy these codes now; full codes are only shown once.")}</p><textarea readOnly aria-label={tr("الأكواد الجديدة","New codes")} dir="ltr" rows={Math.min(10,newCodes.length+1)} className={field} value={newCodes.map(c=>c.code).join("\n")}/><button className={button} onClick={()=>void navigator.clipboard.writeText(newCodes.map(c=>c.code).join("\n")).then(()=>setNotice(tr("اننسخت الأكواد.","Codes copied."))).catch(()=>setNotice(tr("حدد الأكواد وانسخها يدوياً.","Select and copy the codes manually.")))}>{tr("نسخ الكل","Copy all")}</button></div>}{codes.map(c=><article key={c.id} className="space-y-2 rounded-xl border border-border p-4"><p className="font-bold">{c.label||tr("كود دورة الأدب","Literature course code")} <span dir="ltr" className="font-mono text-xs">…{c.code_hint||c.id.slice(0,8)}</span></p><p className="text-xs text-muted-foreground">{c.uses}/{c.max_uses} · {c.expires_at?new Date(c.expires_at).toLocaleString(ar?"ar-IQ":"en-GB",{timeZone:"Asia/Baghdad"}):tr("بدون انتهاء","No expiry")} · {c.revoked?tr("متوقف","Revoked"):tr("فعال","Active")}</p><button className={button} disabled={busy||c.revoked} onClick={()=>{if(!window.confirm(tr("إيقاف الكود يسحب وصول الطلاب اللي فعّلوه. متأكد؟","Revoking also removes access from students who redeemed this code. Continue?")))return;void run(async(check,scope)=>{await rpc("revoke_literature_code",{code_id:c.id});check();await refresh(scope);});}}>{tr("إيقاف وسحب الوصول","Revoke code and access")}</button></article>)}</section>}
    </>}
    {busy&&<p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin"/>{tr("جاري تنفيذ الطلب…","Working…")}</p>}
  </div></main>;
}
