import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, CalendarDays, HeartHandshake, CheckCircle2, Heart, ChevronDown, Plus, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GeminiStatus from "@/components/GeminiStatus";
import ChatBlobBackground from "@/components/ChatBlobBackground";
import type { AppLanguage } from "@/components/LanguageGate";
import { pushTodos } from "@/lib/todosSync";

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "schedule" | "problem" | "psych";
type PlanTask = { day: string; text: string };

const TODOS_KEY = "app_todos_v1";
const WEEK_KEY = "app_todos_week_v1";

const labels = {
  en: {
    fab: "Success Companion",
    title: "Success Companion",
    subtitle: "Choose how your AI should help",
    schedule: "Organize my schedule",
    scheduleDesc: "Tell me your subjects and I'll plan your week.",
    problem: "Solve my problem",
    problemDesc: "Share what's on your mind and we'll fix it together.",
    psych: "Psychological support",
    psychDesc: "A safe space to talk about stress, anxiety and study pressure.",
    welcomePsych: "Welcome. I'm here to listen and help you with stress, anxiety, and study pressure. Speak freely, everything is confidential.",
    placeholder: "Type your message…",
    welcomeSchedule: "Hi! Tell me which subjects you want to study this week, how many sessions for each, and which days work for you. I'll also ask if you have an upcoming exam in any of them and what grade you're aiming for, so I can tune the plan to your goal.",
    welcomeProblem: "Hi! I'm here to help. What's the problem you'd like to work on?",
    approve: "Approve plan & add to my to-do list",
    approved: "Plan added to your weekly to-do list ✓",
    back: "Back",
    error: "Something went wrong. Please try again.",
    introTitle: "Welcome to Tamyzak 👋",
    introBody: "Tamyzak is your AI study companion for the Iraqi 6th-grade ministerial exams. You'll find flashcards, MCQs, summaries, mind maps, ministerial banks, daily missions, an essay & poem checker, and more — all tailored to your subjects. I can build a personal weekly study plan and add it straight to your to-do list, so you always know what to do next.",
    introGenerate: "Generate my study plan",
    introSkip: "Skip — just explore the website",
    continueToApp: "Continue to the app",
    newChat: "New chat",
    modeLabel: "Assistant mode",
    disclaimer: "Tamayzak AI can make mistakes. Check important information.",
  },
  ar: {
    fab: "رفيق النجاح",
    title: "رفيق النجاح",
    subtitle: "اختار شلون تريدني أساعدك",
    schedule: "نظم جدولي",
    scheduleDesc: "أخبرني بموادك وسأنظّم لك أسبوعك.",
    problem: "حلي مشكلتي",
    problemDesc: "شاركني مشكلتك وسنحلها سوياً.",
    psych: "الدعم النفسي",
    psychDesc: "مساحة آمنة للحديث عن التوتر والقلق وضغوط الدراسة.",
    welcomePsych: "هلا بيك، آني هنا حتى أسمعك وأساعدك ويا التوتر والقلق وضغط الدراسة. احچي براحتك، شنو مضايقك هالفترة؟",
    placeholder: "اكتب رسالتك…",
    welcomeSchedule: "هلا بيك! خلّيني أرتبلك أسبوعك بشكل يناسبك. شنو المواد اللي تريد تدرسها، وشكد وقتك المتاح باليوم؟",
    welcomeProblem: "هلا بيك! احچيلي براحتك، شنو المشكلة اللي تريد نحلها سوّة؟",
    approve: "وافق على الخطة وأضفها لقائمة مهامي",
    approved: "تمت إضافة الخطة لقائمة مهامك الأسبوعية ✓",
    back: "رجوع",
    error: "حدث خطأ. حاول مرة أخرى.",
    introTitle: "أهلاً بك في تميزك 👋",
    introBody: "تميزك هو رفيقك الذكي للاستعداد للامتحانات الوزارية للسادس. ستجد بطاقات تعليمية، أسئلة اختيار من متعدد، ملخصات، خرائط ذهنية، بنوك وزارية، مهام يومية، مدقق المقالات والقصائد، والمزيد — كلها مخصصة لموادك. أستطيع بناء خطة دراسية أسبوعية لك وإضافتها مباشرة إلى قائمة مهامك حتى تعرف دائماً ماذا تفعل بعد.",
    introGenerate: "أنشئ خطتي الدراسية",
    introSkip: "تخطّي — استكشف الموقع فقط",
    continueToApp: "متابعة إلى التطبيق",
    newChat: "محادثة جديدة",
    modeLabel: "وضع المساعد",
    disclaimer: "رفيق التميز ممكن يخطئ، فتأكد من المعلومات المهمة.",
  },
};

function getISOWeek(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo}`;
}

function extractPlan(text: string): PlanTask[] | null {
  const m = text.match(/```(?:json|plan)\s*([\s\S]*?)```/i);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[1].trim());
    if (parsed && Array.isArray(parsed.tasks)) {
      const tasks: PlanTask[] = parsed.tasks
        .map((t: unknown): PlanTask | null => {
          if (typeof t === "string" && t.trim()) return { day: "", text: t.trim() };
          const o = t as Partial<PlanTask> | null;
          if (o && typeof o.text === "string" && o.text.trim()) {
            return { day: typeof o.day === "string" ? o.day.trim() : "", text: o.text.trim() };
          }
          return null;
        })
        .filter((t): t is PlanTask => t !== null);
      return tasks.length ? tasks : null;
    }
  } catch {
    return null;
  }
  return null;
}

function stripPlanBlock(text: string): string {
  return text.replace(/```(?:json|plan)\s*[\s\S]*?```/gi, "").trim();
}

const INTRO_DONE_KEY = "app_companion_intro_v1";
const PLANNED_WEEK_KEY = "app_companion_planned_week_v1";

const ExcellenceCompanion = ({ language, embedded = false }: { language: AppLanguage; embedded?: boolean }) => {
  const [open, setOpen] = useState(embedded);
  const t = labels[language];
  const [mode, setMode] = useState<Mode>("schedule");
  const [intro, setIntro] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => [{ role: "assistant", content: labels[language].welcomeSchedule }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onWelcome = () => {
      setIntro(true);
      setMode("schedule");
      setMessages([]);
      setApproved(false);
      setOpen(true);
    };
    const onAutoSchedule = () => {
      setIntro(false);
      setApproved(false);
      setOpen(true);
      setMode("schedule");
      setMessages([{ role: "assistant", content: t.welcomeSchedule }]);
    };
    if (!embedded) {
      window.addEventListener("app:open-excellence-companion", onOpen);
      window.addEventListener("app:welcome-excellence-companion", onWelcome);
    }
    window.addEventListener("app:companion-auto-schedule", onAutoSchedule);
    // If flag was set before mount, trigger immediately
    try {
      if (sessionStorage.getItem("companion:autoSchedule") === "1") {
        sessionStorage.removeItem("companion:autoSchedule");
        onAutoSchedule();
      }
    } catch { /* ignore */ }
    return () => {
      if (!embedded) {
        window.removeEventListener("app:open-excellence-companion", onOpen);
        window.removeEventListener("app:welcome-excellence-companion", onWelcome);
      }
      window.removeEventListener("app:companion-auto-schedule", onAutoSchedule);
    };
  }, [embedded, t]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const reset = () => {
    const welcome = mode === "schedule" ? t.welcomeSchedule : mode === "psych" ? t.welcomePsych : t.welcomeProblem;
    setMessages([{ role: "assistant", content: welcome }]);
    setInput("");
    setApproved(false);
  };

  const finishIntro = () => {
    try {
      localStorage.setItem(INTRO_DONE_KEY, "1");
      localStorage.setItem(PLANNED_WEEK_KEY, getISOWeek());
    } catch { /* ignore */ }
    setIntro(false);
    setOpen(false);
    reset();
  };

  const pickMode = (m: Mode) => {
    setMode(m);
    const welcome: Msg = {
      role: "assistant",
      content: m === "schedule" ? t.welcomeSchedule : m === "psych" ? t.welcomePsych : t.welcomeProblem,
    };
    setMessages([welcome]);
    if (m === "psych") {
      setLoading(true);
      (async () => {
        try {
          const { data } = await supabase
            .from("psych_messages")
            .select("role, content, created_at")
            .order("created_at", { ascending: true })
            .limit(200);
          if (Array.isArray(data) && data.length) {
            const history: Msg[] = data
              .filter((r) => r.role === "user" || r.role === "assistant")
              .map((r) => ({ role: r.role as Msg["role"], content: r.content as string }));
            setMessages([welcome, ...history]);
          }
        } catch { /* ignore */ }
        setLoading(false);
      })();
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      if (mode === "psych") {
        const { data, error } = await supabase.functions.invoke("psych-chat", {
          body: { message: text, history: messages.slice(-20) },
        });
        const reply = (data as { reply?: string } | null)?.reply;
        if (error && !reply) {
          setMessages([...next, { role: "assistant", content: t.error }]);
          return;
        }
        setMessages([...next, { role: "assistant", content: reply ?? t.error }]);
        return;
      }
      const { data, error } = await supabase.functions.invoke("excellence-companion", {
        body: { mode, language, messages: next },
      });
      const replyFromData = (data as { reply?: string; error?: string } | null)?.reply;
      if (error && !replyFromData) {
        const ctx = (error as { context?: { error?: string; upgrade?: boolean } }).context;
        const upgrade = ctx?.upgrade || /Premium|free uses/i.test(String(ctx?.error || ""));
        // Never surface the raw "Edge Function returned a non-2xx status code" string.
        const rawMsg = String(ctx?.error || error.message || "");
        const isNon2xx = /non-2xx/i.test(rawMsg);
        const msg = upgrade
          ? (language === "ar"
              ? "استهلكت 5 استخدامات اليومية. رقّ إلى البريميوم للاستخدام غير المحدود."
              : "You've used your 5 free uses today. Upgrade to Premium for unlimited access.")
          : (isNon2xx || !ctx?.error
              ? (language === "ar"
                  ? "تعذّر الرد الآن. حاول مرة أخرى بعد لحظات."
                  : "Could not respond just now. Please try again in a moment.")
              : ctx.error);
        setMessages([...next, { role: "assistant", content: msg }]);
        return;
      }
      const reply = replyFromData ?? t.error;
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: t.error }]);
    } finally {
      setLoading(false);
    }
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const pendingPlan = lastAssistant ? extractPlan(lastAssistant.content) : null;

  const approvePlan = () => {
    if (!pendingPlan) return;
    const currentWeek = getISOWeek();
    const storedWeek = localStorage.getItem(WEEK_KEY);
    let existing: Array<{ id: string; text: string; done: boolean; day?: string }> = [];
    if (storedWeek === currentWeek) {
      try { existing = JSON.parse(localStorage.getItem(TODOS_KEY) || "[]"); } catch { existing = []; }
    } else {
      localStorage.setItem(WEEK_KEY, currentWeek);
    }
    const newTodos = pendingPlan.map((p) => ({
      id: crypto.randomUUID(),
      text: p.text,
      done: false,
      day: p.day || undefined,
    }));
    const merged = [...existing, ...newTodos];
    localStorage.setItem(TODOS_KEY, JSON.stringify(merged));
    localStorage.removeItem("app_todos_celebrated_v1");
    window.dispatchEvent(new Event("app:todos-changed"));
    pushTodos(merged);
    setApproved(true);
    try {
      localStorage.setItem(INTRO_DONE_KEY, "1");
      localStorage.setItem(PLANNED_WEEK_KEY, getISOWeek());
    } catch { /* ignore */ }
  };

  const ActiveModeIcon = mode === "schedule" ? CalendarDays : mode === "psych" ? Heart : HeartHandshake;
  const activeModeLabel = mode === "schedule" ? t.schedule : mode === "psych" ? t.psych : t.problem;

  const panel = (
          <div
            dir={language === "ar" ? "rtl" : "ltr"}
            className={
              embedded
                ? "relative w-full h-[640px] flex flex-col rounded-3xl border border-primary/30 gemini-chat-bg shadow-[var(--shadow-glow)] overflow-hidden"
                : "relative w-full sm:max-w-lg h-[88vh] sm:h-[640px] flex flex-col rounded-t-3xl sm:rounded-3xl border border-primary/30 gemini-chat-bg shadow-[var(--shadow-glow)] overflow-hidden"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <ChatBlobBackground />
            <header className="relative z-10 border-b border-border/70 bg-background/80 px-3 py-3 backdrop-blur-xl sm:px-4">
              <div className="flex items-center gap-2">
                <div className="gemini-dot inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{t.title}</div>
                  {!intro && (
                    <div className="relative mt-0.5 inline-flex max-w-full items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                      <ActiveModeIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{activeModeLabel}</span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                      <select
                        value={mode}
                        onChange={(e) => pickMode(e.target.value as Mode)}
                        aria-label={t.modeLabel}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      >
                        <option value="schedule">{t.schedule}</option>
                        <option value="problem">{t.problem}</option>
                        <option value="psych">{t.psych}</option>
                      </select>
                    </div>
                  )}
                </div>
                {!intro && (
                  <button onClick={reset} aria-label={t.newChat} title={t.newChat} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Plus className="h-5 w-5" />
                  </button>
                )}
                {!embedded && !intro && (
                  <button onClick={() => setOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </header>

            {intro && messages.length === 0 ? (
              <div className="relative z-10 flex-1 overflow-y-auto p-6 flex flex-col gap-4 justify-center">
                <h2 className="text-xl font-bold text-center">{t.introTitle}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">{t.introBody}</p>
                <button
                  onClick={() => pickMode("schedule")}
                  className="mt-2 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                >
                  <CalendarDays className="w-4 h-4" /> {t.introGenerate}
                </button>
                <button
                  onClick={finishIntro}
                  className="inline-flex items-center justify-center h-11 rounded-xl border border-border bg-secondary/40 text-sm font-medium hover:border-primary transition"
                >
                  {t.introSkip}
                </button>
              </div>
            ) : (
              <>
                <div className="relative z-10 flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
                  {messages.map((m, i) => {
                    const display = m.role === "assistant" ? stripPlanBlock(m.content) : m.content;
                    return m.role === "user" ? (
                      <div key={i} className="flex justify-end">
                        <div className="max-w-[85%] rounded-[1.4rem] rounded-ee-md bg-secondary px-4 py-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                          {display}
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="gemini-dot mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full" aria-hidden><Sparkles className="h-3.5 w-3.5 text-white" /></span>
                        <div className="min-w-0 flex-1 whitespace-pre-wrap text-[15px] leading-7 text-foreground">
                          {display}
                        </div>
                      </div>
                    );
                  })}
                  {loading && <GeminiStatus language={language} />}
                  {pendingPlan && !approved && (
                    <button
                      onClick={approvePlan}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-sm font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {t.approve}
                    </button>
                  )}
                  {approved && (
                    <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary text-center">
                      {t.approved}
                    </div>
                  )}
                  {approved && intro && (
                    <button
                      onClick={finishIntro}
                      className="w-full mt-2 inline-flex items-center justify-center h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                    >
                      {t.continueToApp}
                    </button>
                  )}
                  <div ref={endRef} />
                </div>

                <div className="relative z-10 bg-background/85 px-3 pb-3 pt-2 backdrop-blur-xl sm:px-5">
                  <div className="flex items-end gap-2 rounded-[1.6rem] border border-border bg-card p-2 ps-4 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.55)] focus-within:border-primary/50">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder={t.placeholder}
                      rows={1}
                      className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm focus:outline-none"
                    />
                    <button
                      onClick={send}
                      disabled={!input.trim() || loading}
                      aria-label={language === "ar" ? "إرسال" : "Send"}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">{t.disclaimer}</p>
                </div>
              </>
            )}
          </div>
  );

  if (embedded) return panel;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t.fab}
        className="fixed bottom-32 right-5 z-[55] inline-flex items-center gap-2 h-12 px-4 rounded-full border border-primary/50 bg-gradient-to-r from-primary/90 to-accent/90 text-primary-foreground shadow-lg hover:scale-105 transition-all duration-300"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-semibold">{t.fab}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-background/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={intro ? undefined : () => setOpen(false)}
        >
          {panel}
        </div>
      )}
    </>
  );
};

export default ExcellenceCompanion;
