import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowUpRight, Bot, Check, Loader2, Paperclip, Plus, Send, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AppLanguage } from "@/components/LanguageGate";
import { readAssistantFile } from "@/lib/mutamayizFile";
import { readableMath } from "@/lib/readableMath";
import { getISOWeek, pullTodos, pushTodos, type SyncedTodo } from "@/lib/todosSync";
import { readWeeklyLearningProfile, saveWeeklyLearningProfile, type WeeklyLearningProfile } from "@/lib/weeklyLearning";
import WeeklyWeaknessIntake from "@/components/WeeklyWeaknessIntake";
import { edgeErrorMessage } from "@/lib/edgeError";
import { aiErrorNotice } from "@/lib/aiErrorNotice";
import { assistantSnapshot, subscribeAssistant, setAssistantOwner, updateAssistant, newAssistantConversation } from "@/lib/mutamayizConversation";
import { MUTAMAYIZ_NAME, extractAssistantPlan, stripAssistantPlan, renderAssistantParts } from "../../supabase/functions/_shared/mutamayiz";

const copy = {
  ar: {
    subtitle: "سؤالك، مشكلتك، جدولك ودليلك للموقع… آني وياك.",
    intro: "هلا بيك، آني متميز ✨ اسألني عن درسك، احچيلي عن مشكلة أو ضغط تمر بيه، خلّيني أرتب جدولك، أو كلي شنو تحتاج بالموقع. نكمل كلشي بنفس المحادثة.",
    placeholder: "احچي ويا متميز…", back: "رجوع", send: "إرسال", fresh: "محادثة جديدة", loading: "متميز يفكر…", disclaimer: "متميز ممكن يخطئ. راجع المعلومات المهمة، وللدعم النفسي المتخصص تواصل مع مختص.",
    quick: ["حلي مشكلتي", "أحتاج دعم نفسي", "رتبلي جدول دراسة", "اشرحلي سؤال علمي", "دلّيني على أدوات الموقع"],
    approve: "أوافق على الخطة وأضيفها لمهامي", approved: "الخطة انضافت لمهامك", upload: "إرفاق ملف درس", reading: "جاري قراءة الملف…", remove: "حذف الملف", fileError: "تعذّر قراءة الملف. استخدم PDF نصي أو TXT أو MD، بحجم لحد ١٥ ميغابايت.",
    error: "تعذّر الرد هسه. رسالتك باقية وتكدر تحاول مرة ثانية.", login: "سجّل دخولك حتى تحچي ويا متميز.", weakness: "أربط خطتي بنقطة ضعف من الفهرست", cancel: "رجوع للمحادثة", approveError: "تعذّر حفظ الخطة. حاول مرة ثانية.", syncError: "انحفظت الخطة على جهازك، لكن تعذّرت مزامنة الحساب. اضغط اعتماد الخطة للمحاولة مرة ثانية.",
  },
  en: {
    subtitle: "Your questions, problems, study plan and everything in Tamayzak.",
    intro: "Hi, I'm متميز ✨ Ask about your lessons, work through a problem, talk about study pressure, plan your week, or find a tool. We can do all of that in this one conversation.",
    placeholder: "Talk to متميز…", back: "Back", send: "Send", fresh: "New conversation", loading: "متميز is thinking…", disclaimer: "متميز can make mistakes. Check important information. Professional mental-health support is available from qualified specialists.",
    quick: ["Help solve my problem", "I need emotional support", "Plan my study week", "Explain a scientific question", "Help me find a website tool"],
    approve: "Approve this plan and add to my tasks", approved: "Plan added to your tasks", upload: "Attach lesson file", reading: "Reading file…", remove: "Remove file", fileError: "Could not read the file. Use a text-based PDF, TXT or MD, up to 15 MB.",
    error: "Could not respond. Your message is still here; please try again.", login: "Sign in to talk to متميز.", weakness: "Match my plan to an Al-Fahras weak point", cancel: "Back to conversation", approveError: "Could not save the plan. Please try again.", syncError: "Plan saved on this device. Account sync failed; approve the plan again to retry.",
  },
};

type Props = { language: AppLanguage; onBack?: () => void; onOpenTool?: (key: string) => void; embedded?: boolean };
export default function MutamayizChat({ language, onBack, onOpenTool, embedded = false }: Props) {
  const ar = language === "ar", t = copy[language];
  const conversation = useSyncExternalStore(subscribeAssistant, assistantSnapshot, assistantSnapshot);
  const [owner, setOwner] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [input, setInput] = useState("");
  const [fileBusy, setFileBusy] = useState(false);
  const [intake, setIntake] = useState(false);
  const [notice, setNotice] = useState("");
  const upload = useRef<HTMLInputElement>(null), scroll = useRef<HTMLDivElement>(null);
  const ownerRef = useRef<string | null>(null);
  const scheduleRequested = useRef(false);
  const uploadOperation = useRef(0);
  const active = authReady && owner !== null && conversation.owner === owner;
  const messages = active ? conversation.messages : [];
  const busy = active && conversation.busy;
  const approving = active && conversation.approvingPlan !== null;
  useEffect(() => {
    let live = true, revision = 0;
    const apply = (id: string | null) => {
      if (!live) return;
      if (ownerRef.current !== null && ownerRef.current !== id) {
        setInput(""); setIntake(false); setNotice(""); setFileBusy(false);
        scheduleRequested.current = false; uploadOperation.current++;
      }
      ownerRef.current = id; setAssistantOwner(id); setOwner(id); setAuthReady(true);
      if (id && scheduleRequested.current) {
        updateAssistant(id, state => ({ ...state, profile: readWeeklyLearningProfile() }));
        scheduleRequested.current = false;
      }
    };
    const started = revision;
    void supabase.auth.getUser().then(({ data }) => { if (revision === started) apply(data.user?.id ?? null); }).catch(() => { if (revision === started) apply(null); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { revision++; apply(session?.user.id ?? null); });
    return () => { live = false; uploadOperation.current++; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => { scroll.current?.scrollTo?.({ top: scroll.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);
  useEffect(() => {
    const autoSchedule = () => {
      setIntake(false); setInput(t.quick[2]);
      scheduleRequested.current = true;
      if (ownerRef.current) {
        updateAssistant(ownerRef.current, state => ({ ...state, profile: readWeeklyLearningProfile() }));
        scheduleRequested.current = false;
      }
    };
    window.addEventListener("app:companion-auto-schedule", autoSchedule);
    try { if (sessionStorage.getItem("companion:autoSchedule") === "1") { sessionStorage.removeItem("companion:autoSchedule"); autoSchedule(); } } catch { /* optional shortcut */ }
    return () => window.removeEventListener("app:companion-auto-schedule", autoSchedule);
  }, [t]);
  const send = async (raw?: string) => {
    const text = (raw ?? input).trim(), state = assistantSnapshot();
    if (!text || !owner || state.owner !== owner || state.busy || fileBusy) return;
    const epoch = state.epoch;
    const next = [...state.messages, { id: crypto.randomUUID(), role: "user" as const, content: text }].slice(-60);
    updateAssistant(owner, current => ({ ...current, messages: next, busy: true })); setInput(""); setNotice("");
    try {
      const { data, error } = await supabase.functions.invoke("excellence-companion", { body: {
        mode: "unified", language, messages: next.slice(-16).map(({ role, content }) => ({ role, content: content.slice(0, 6000) })),
        ...(state.profile ? { learningProfile: state.profile } : {}), ...(state.file ? { clientContext: state.file.text } : {}),
      } });
      if (error) { const message = await edgeErrorMessage(error, t.error); throw new Error(aiErrorNotice({ message, status: error.context?.status }, language).message); }
      const reply = typeof data?.reply === "string" && data.reply.trim() ? data.reply : t.error;
      updateAssistant(owner, current => current.epoch !== epoch ? current : ({ ...current, messages: [...current.messages, { id: crypto.randomUUID(), role: "assistant" as const, content: reply }].slice(-60) }));
    } catch (error) {
      updateAssistant(owner, current => current.epoch !== epoch ? current : ({ ...current, messages: [...current.messages, { id: crypto.randomUUID(), role: "assistant" as const, content: error instanceof Error ? error.message : t.error }].slice(-60) }));
    } finally { updateAssistant(owner, current => current.epoch !== epoch ? current : ({ ...current, busy: false })); }
  };
  const lastAssistant = [...messages].reverse().find(message => message.role === "assistant");
  const plan = lastAssistant ? extractAssistantPlan(lastAssistant.content) : null;
  const approved = lastAssistant ? conversation.approved.includes(lastAssistant.id) : false;
  const persistProfile = async (profile: WeeklyLearningProfile, account: string) => {
    const { data } = await supabase.auth.getUser(); if (data.user?.id !== account) return;
    await (supabase as any).from("weekly_learning_profiles").upsert({ user_id: account, iso_week: profile.isoWeek,
      subject: profile.subject, chapter_key: profile.chapterKey, chapter_number: profile.chapterNumber,
      topic_key: profile.topicKey, topic_en: profile.topicEn, topic_ar: profile.topicAr,
      weakness_text: profile.weaknessText, weak_areas: profile.weakAreas ?? [], plan_tasks: profile.planTasks ?? [], updated_at: profile.updatedAt,
    }, { onConflict: "user_id,iso_week" });
  };
  const approve = async () => {
    const state = assistantSnapshot();
    if (!owner || !plan || !lastAssistant || approved || state.owner !== owner || state.approvingPlan) return;
    const epoch = state.epoch, planId = lastAssistant.id;
    const currentConversation = () => assistantSnapshot().owner === owner && assistantSnapshot().epoch === epoch;
    updateAssistant(owner, current => ({ ...current, approvingPlan: planId })); setNotice("");
    try {
      const { data } = await supabase.auth.getUser(); if (data.user?.id !== owner || !currentConversation()) throw new Error("account_changed");
      const week = getISOWeek(); let previous: SyncedTodo[] = [];
      try { const rows = JSON.parse(localStorage.getItem("app_todos_v1") || "[]"); if (Array.isArray(rows)) previous = rows.filter(row => row && typeof row.id === "string" && typeof row.text === "string"); } catch { /* empty */ }
      const remote = await pullTodos(owner);
      const account = await supabase.auth.getUser();
      if (account.data.user?.id !== owner || !currentConversation()) throw new Error("account_changed");
      if (remote) { const ids = new Set(remote.map(task => task.id)); previous = [...remote, ...previous.filter(task => !ids.has(task.id))]; }
      const additions = plan.filter(task => !previous.some(existing => existing.text === task.text && existing.day === task.day))
        .map(task => ({ ...task, id: crypto.randomUUID(), done: false }));
      const merged = [...previous, ...additions];
      localStorage.setItem("app_todos_week_v1", week); localStorage.setItem("app_todos_v1", JSON.stringify(merged)); localStorage.removeItem("app_todos_celebrated_v1");
      window.dispatchEvent(new Event("app:todos-changed")); const synced = await pushTodos(merged, owner);
      if (!currentConversation()) return;
      if (!synced) { setNotice(t.syncError); return; }
      updateAssistant(owner, current => ({ ...current, approved: [...current.approved, planId] }));
      const profile = assistantSnapshot().profile;
      if (profile) { const updated = { ...profile, planTasks: plan, updatedAt: new Date().toISOString() }; updateAssistant(owner, current => ({ ...current, profile: updated })); saveWeeklyLearningProfile(updated); void persistProfile(updated, owner).catch(() => {}); }
    } catch { if (currentConversation()) setNotice(t.approveError); }
    finally { updateAssistant(owner, current => current.epoch === epoch && current.approvingPlan === planId ? { ...current, approvingPlan: null } : current); }
  };
  const attach = async (file: File) => {
    if (!owner) return;
    const scope = owner, epoch = assistantSnapshot().epoch, operation = ++uploadOperation.current;
    const currentConversation = () => operation === uploadOperation.current && ownerRef.current === scope && assistantSnapshot().owner === scope && assistantSnapshot().epoch === epoch;
    setFileBusy(true); setNotice("");
    try { const text = await readAssistantFile(file); if (!text.trim()) throw new Error("empty_file"); if (currentConversation()) updateAssistant(scope, state => ({ ...state, file: { name: file.name, text } })); }
    catch { if (currentConversation()) setNotice(t.fileError); }
    finally { if (operation === uploadOperation.current) { setFileBusy(false); if (upload.current) upload.current.value = ""; } }
  };
  const openTool = (key: string) => onOpenTool ? onOpenTool(key) : window.dispatchEvent(new CustomEvent("app:mutamayiz-open-tool", { detail: { key } }));
  return <main dir={ar ? "rtl" : "ltr"} className={`mx-auto flex w-full min-w-0 max-w-3xl flex-col bg-background text-foreground ${embedded ? "h-full min-h-0" : "h-[100dvh] min-h-0"}`}>
    <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
      {onBack && <button onClick={onBack} aria-label={t.back} className="grid size-11 shrink-0 place-items-center rounded-xl border border-border hover:bg-secondary"><ArrowLeft className={`size-5 ${ar ? "rotate-180" : ""}`} /></button>}
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/15"><Bot className="size-6" /></div>
      <div className="min-w-0 flex-1"><h1 className="text-xl font-black">{MUTAMAYIZ_NAME}</h1><p className="mt-1 text-xs leading-5 text-muted-foreground">{t.subtitle}</p></div>
      <button disabled={!active || busy || fileBusy || approving} onClick={() => { if (owner) { newAssistantConversation(owner); setInput(""); setNotice(""); } }} aria-label={t.fresh} className="grid size-11 shrink-0 place-items-center rounded-xl border border-border hover:bg-secondary disabled:opacity-40"><Plus className="size-5" /></button>
    </header>
    <div ref={scroll} role="log" aria-label={ar ? "محادثة متميز" : "Mutamayiz conversation"} aria-live="polite" className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
      {!authReady ? <Loader2 className="mx-auto size-6 animate-spin" /> : !owner ? <p>{t.login}</p> : intake ? <div><button onClick={() => setIntake(false)} className="mb-3 min-h-11 rounded-xl border px-4">{t.cancel}</button><WeeklyWeaknessIntake language={language} onComplete={(profile: WeeklyLearningProfile) => { updateAssistant(owner, current => ({ ...current, profile })); saveWeeklyLearningProfile(profile); void persistProfile(profile, owner).catch(() => {}); setIntake(false); setInput(t.quick[2]); }} /></div> : <>
        {messages.length === 0 && <section className="space-y-5"><div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-5 text-base leading-8"><Sparkles className="mb-3 size-6 text-blue-600" />{t.intro}</div><div className="grid gap-2 sm:grid-cols-2">{t.quick.map(prompt => <button key={prompt} disabled={busy} onClick={() => { setInput(prompt); }} className="min-h-12 rounded-2xl border border-border bg-card px-4 py-3 text-start text-sm font-semibold hover:border-blue-500">{prompt}</button>)}</div></section>}
        {messages.map(message => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`min-w-0 max-w-[95%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[15px] leading-8 [overflow-wrap:anywhere] sm:max-w-[90%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>
          {message.role === "user" ? message.content : renderAssistantParts(stripAssistantPlan(message.content)).map((part, index) => part.t === "text" ? <span key={index}>{readableMath(part.v)}</span> : <button key={index} onClick={() => openTool(part.key)} className="my-2 inline-flex min-h-11 max-w-full items-center gap-2 whitespace-normal rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-700 dark:text-blue-200">{part.label}<ArrowUpRight className="size-4 shrink-0" /></button>)}
        </div></div>)}
        {busy && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{t.loading}</p>}
        {plan && <section aria-label={ar ? "مراجعة الخطة" : "Review plan"} className="space-y-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
          <ul className="space-y-2">{plan.map((task, index) => <li key={index} className="min-w-0 break-words text-sm leading-7"><strong>{task.day}: </strong>{task.text}</li>)}</ul>
          <button onClick={() => void approve()} disabled={approved || approving || busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-70">{approving ? <Loader2 className="size-4 animate-spin" /> : approved ? <Check className="size-4" /> : null}{approved ? t.approved : t.approve}</button>
        </section>}
      </>}
    </div>
    <footer className="shrink-0 space-y-2 border-t border-border bg-background px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
      {active && conversation.file && <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-secondary px-3 py-2 text-xs"><span className="min-w-0 truncate">{conversation.file.name}</span><button disabled={busy} onClick={() => owner && updateAssistant(owner, state => ({ ...state, file: null }))} aria-label={t.remove} className="grid size-9 shrink-0 place-items-center"><X className="size-4" /></button></div>}
      {notice && <p role="alert" className="text-sm text-destructive">{notice}</p>}
      <div className="flex min-w-0 items-end gap-2"><input ref={upload} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={event => event.target.files?.[0] && void attach(event.target.files[0])} />
        <button disabled={!active || busy || fileBusy} onClick={() => upload.current?.click()} aria-label={t.upload} className="grid size-11 shrink-0 place-items-center rounded-xl border border-border disabled:opacity-40">{fileBusy ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-5" />}</button>
        <textarea aria-label={t.placeholder} placeholder={t.placeholder} rows={2} maxLength={6000} value={input} disabled={!active || busy || fileBusy} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} className="min-h-12 min-w-0 flex-1 resize-none rounded-xl border border-border bg-card px-3 py-2 text-base leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60" />
        <button onClick={() => void send()} disabled={!active || busy || fileBusy || !input.trim()} aria-label={t.send} className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white disabled:opacity-40"><Send className={`size-5 ${ar ? "rotate-180" : ""}`} /></button></div>
      {active && !intake && <button disabled={busy} onClick={() => setIntake(true)} className="min-h-9 text-xs font-semibold text-blue-700 dark:text-blue-200">{t.weakness}</button>}
      <p className="text-center text-[11px] leading-5 text-muted-foreground">{t.disclaimer}</p>
    </footer>
  </main>;
}
