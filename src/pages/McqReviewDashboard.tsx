import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Search, Save, Trash2, Pencil, ShieldAlert, RefreshCw } from "lucide-react";

type McqRow = { id: string; subject: string; chapter: number; language: string; question: string; choices: unknown; answer_index: number; explanation: string | null; difficulty: string };
const parseChoices = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : [];
export default function McqReviewDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [rows, setRows] = useState<McqRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [chapter, setChapter] = useState("all");
  const [language, setLanguage] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<McqRow | null>(null);
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    const wasNotionDark = root.classList.contains("theme-notion-dark");
    root.classList.remove("dark", "theme-notion-dark");
    return () => { if (wasDark) root.classList.add("dark"); if (wasNotionDark) root.classList.add("theme-notion-dark"); };
  }, []);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { if (active) setAuthorized(false); return; }
      const { data: isAdmin, error } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (active) setAuthorized(!error && isAdmin === true);
    });
    return () => { active = false; };
  }, []);
  const load = async () => {
    setBusy(true);
    const all: McqRow[] = [];
    for (let from = 0; from < 10000; from += 1000) {
      const { data, error } = await supabase.from("mcq_banks")
        .select("id,subject,chapter,language,question,choices,answer_index,explanation,difficulty")
        .order("id").range(from, from + 999);
      if (error) { toast.error(error.message); break; }
      all.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    setRows(all);
    setBusy(false);
  };
  useEffect(() => { if (authorized) void load(); }, [authorized]);
  const subjects = [...new Set(rows.map(r => r.subject))].sort();
  const chapters = [...new Set(rows.filter(r => subject === "all" || r.subject === subject).map(r => r.chapter))].sort((a,b) => a-b);
  const filtered = useMemo(() => rows.filter(r =>
    (subject === "all" || r.subject === subject) && (chapter === "all" || String(r.chapter) === chapter) &&
    (language === "all" || r.language === language) &&
    (r.question + " " + r.explanation + " " + r.choices).toLowerCase().includes(search.toLowerCase())
  ), [rows, subject, chapter, language, search]);
  const save = async () => {
    if (!draft || !draft.question.trim()) return toast.error("Question is required");
    const choices = parseChoices(draft.choices);
    if (choices.length < 2 || choices.some(c => !c.trim()) || draft.answer_index < 0 || draft.answer_index >= choices.length) return toast.error("Check choices and correct answer");
    setBusy(true);
    const { error } = await supabase.from("mcq_banks").update({ question: draft.question, choices, answer_index: draft.answer_index, explanation: draft.explanation, difficulty: draft.difficulty }).eq("id", draft.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Question updated");
    setEditing(null); setDraft(null); void load();
  };
  const remove = async (row: McqRow) => {
    if (!window.confirm("Permanently delete this MCQ?")) return;
    setBusy(true);
    const { error } = await supabase.from("mcq_banks").delete().eq("id", row.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Question deleted");
    setRows(previous => previous.filter(item => item.id !== row.id));
  };
  if (authorized === null) return <main className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></main>;
  if (!authorized) return <main className="grid min-h-screen place-items-center p-6"><div className="text-center"><ShieldAlert className="mx-auto mb-3 text-destructive" /><h1 className="font-bold">Admin access required</h1><p className="text-sm text-muted-foreground">Sign in to Tamayzak with an administrator account.</p><a href="/" className="mt-4 inline-block text-primary underline">Go to Tamayzak</a></div></main>;
  return <main dir="rtl" className="min-h-screen bg-[#F7F4EC] p-4 pb-24 text-[#183A72] md:p-8"><div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-primary">TAMAYZAK · ADMIN</p><h1 className="text-3xl font-black">لوحة مراجعة بنك الأسئلة</h1><p className="text-sm text-muted-foreground">مراجعة وتعديل وحذف الأسئلة الموجودة في قاعدة البيانات</p></div><Button variant="outline" disabled={busy} onClick={load}><RefreshCw className="h-4 w-4" /> تحديث</Button></header>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{[[ "إجمالي الأسئلة", rows.length ],["النتائج المفلترة", filtered.length],["المواد", subjects.length]].map(([label,value]) => <div key={String(label)} className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</div>
    <section className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-4"><label className="flex items-center gap-2 rounded-lg border px-3"><Search className="h-4 w-4" /><input className="h-10 w-full bg-transparent outline-none" placeholder="ابحث عن سؤال..." value={search} onChange={e => setSearch(e.target.value)} /></label>
    <select className="rounded-lg border bg-background p-2" value={subject} onChange={e => {setSubject(e.target.value);setChapter("all");}}><option value="all">كل المواد</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
    <select className="rounded-lg border bg-background p-2" value={chapter} onChange={e => setChapter(e.target.value)}><option value="all">كل الفصول</option>{chapters.map(c => <option key={c} value={c}>الفصل {c}</option>)}</select>
    <select className="rounded-lg border bg-background p-2" value={language} onChange={e => setLanguage(e.target.value)}><option value="all">كل اللغات</option><option value="ar">العربية</option><option value="en">English</option></select></section>
    <div className="space-y-3">{filtered.slice(0,200).map((row, index) => { const choices = parseChoices(row.choices); const active = editing === row.id && draft; return <article key={row.id} className="rounded-2xl border bg-card p-5 shadow-sm"><div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{index+1} · {row.subject} · الفصل {row.chapter} · {row.language}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={busy} onClick={() => {setEditing(row.id);setDraft({...row,choices:[...choices]});}}><Pencil className="h-4 w-4" /> تعديل</Button><Button size="sm" variant="destructive" disabled={busy} onClick={() => remove(row)}><Trash2 className="h-4 w-4" /> حذف</Button></div></div>
      {active ? <div className="space-y-3"><textarea className="w-full rounded-lg border bg-background p-3" rows={3} value={draft.question} onChange={e => setDraft({...draft,question:e.target.value})} />{parseChoices(draft.choices).map((choice,i) => <div key={i} className="flex items-center gap-2"><input type="radio" checked={draft.answer_index===i} onChange={() => setDraft({...draft,answer_index:i})} /><input className="w-full rounded-lg border bg-background p-2" value={choice} onChange={e => {const next=parseChoices(draft.choices);next[i]=e.target.value;setDraft({...draft,choices:next});}} /></div>)}<textarea className="w-full rounded-lg border bg-background p-3" placeholder="الشرح" value={draft.explanation??""} onChange={e=>setDraft({...draft,explanation:e.target.value})}/><div className="flex gap-2"><Button disabled={busy} onClick={save}><Save className="h-4 w-4" /> حفظ</Button><Button variant="outline" onClick={()=>{setEditing(null);setDraft(null);}}>إلغاء</Button></div></div> : <><p className="mb-3 font-bold">{row.question}</p><div className="grid gap-2 sm:grid-cols-2">{choices.map((choice,i)=><div key={i} className={`rounded-xl border p-3 text-sm ${i===row.answer_index?"border-emerald-500/50 bg-emerald-500/10 font-bold":"bg-background"}`}>{String.fromCharCode(65+i)}. {choice}{i===row.answer_index?" ✓":""}</div>)}</div>{row.explanation&&<p className="mt-3 text-sm text-muted-foreground">{row.explanation}</p>}</>}
    </article>;})}{filtered.length>200&&<p className="text-center text-sm text-muted-foreground">يتم عرض أول 200 نتيجة. استخدم الفلاتر لتضييق البحث.</p>}{!filtered.length&&!busy&&<p className="py-12 text-center text-muted-foreground">لا توجد أسئلة مطابقة.</p>}</div>
  </div></main>;
}
