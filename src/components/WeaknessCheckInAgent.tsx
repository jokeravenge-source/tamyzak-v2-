import { useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, Loader2, Send, Sparkles, Target, X } from "lucide-react";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";
import { edgeErrorMessage } from "@/lib/edgeError";
import { loadTopicPractice } from "@/lib/topicMastery";
import {
  detectWeakAreas,
  mergeWeakAreas,
  type WeakArea,
  type WeaknessMessage,
  type WeaknessSession,
} from "@/lib/weaknessProfile";
import {
  getISOWeek,
  profileFromWeakAreas,
  saveWeeklyLearningProfile,
} from "@/lib/weeklyLearning";

const LOCAL_PREFIX = "tamayzak:weakness-check-in:v1:";
const PLANNED_WEEK_KEY = "app_companion_planned_week_v2";

const copy = {
  ar: {
    title: "خل نحدد نقاط ضعفك",
    subtitle: "رفيق التميز يجمع نتائجك ويا رأيك حتى يرتب تدريبك.",
    detected: "نقاط تحتاج تقوية",
    empty: "بعد ما عندي إجابات كافية، فخل نحددها من كلامك.",
    placeholder: "اكتب المادة أو الفصل اللي تحس يحتاج تقوية…",
    finish: "إنهاء وحفظ",
    finishing: "جارٍ الحفظ…",
    saved: "تم حفظ نقاط ضعفك وتخصيص البطاقات والأسئلة إلك",
    needArea: "حدد مادة وفصلاً واحداً على الأقل قبل الإنهاء",
    close: "إغلاق مؤقت",
    reopen: "أكمل تحديد نقاط ضعفك",
    mcq: "اختيارات",
    flashcards: "بطاقات",
    error: "تعذر الرد الآن. حاول مرة ثانية.",
  },
  en: {
    title: "Let’s identify your weak areas",
    subtitle: "Tamayzak combines your results with what you tell the study agent.",
    detected: "Areas to strengthen",
    empty: "There are not enough answers yet, so let’s identify them from your experience.",
    placeholder: "Tell me which subject or chapter feels difficult…",
    finish: "Finish and save",
    finishing: "Saving…",
    saved: "Your weak areas now personalize both flashcards and MCQs",
    needArea: "Confirm at least one subject and chapter before finishing",
    close: "Close for now",
    reopen: "Continue weakness check-in",
    mcq: "MCQ",
    flashcards: "Flashcards",
    error: "Could not respond right now. Please try again.",
  },
} as const;

function localKey(userId: string) {
  return `${LOCAL_PREFIX}${userId}`;
}

function initialMessage(language: AppLanguage, areas: WeakArea[]): WeaknessMessage {
  if (!areas.length) {
    return {
      role: "assistant",
      content: language === "ar"
        ? "هلا بيك! بعد ما عندي نتائج كافية حتى أحدد نقاط ضعفك. شنو المادة اللي تحسها أصعب عليك هالفترة، وبأي فصل؟"
        : "Hi! I do not have enough results to detect a weak area yet. Which subject feels hardest right now, and which chapter?",
    };
  }
  const list = areas.slice(0, 4).map((area) =>
    `• ${language === "ar" ? area.topicAr : area.topicEn} — ${language === "ar" ? "الفصل" : "chapter"} ${area.chapterNumber}`).join("\n");
  return {
    role: "assistant",
    content: language === "ar"
      ? `راجعت آخر إجاباتك بالاختيارات والبطاقات، وظهرت هاي النقاط كأكثر شي يحتاج تقوية:\n${list}\n\nهل النتائج دقيقة؟ وأكو مادة أو فصل ثاني تحس نفسك ضعيف بيه؟`
      : `I reviewed your latest MCQ and flashcard answers. These areas currently need the most attention:\n${list}\n\nDoes that look accurate? Is another subject or chapter difficult for you?`,
  };
}

function parseStoredSession(value: unknown): WeaknessSession | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const messages = Array.isArray(raw.messages)
    ? raw.messages.filter((message): message is WeaknessMessage => {
        if (!message || typeof message !== "object") return false;
        const row = message as Record<string, unknown>;
        return (row.role === "user" || row.role === "assistant") && typeof row.content === "string";
      }).slice(-30)
    : [];
  const weakAreas = mergeWeakAreas([], Array.isArray(raw.weakAreas) ? raw.weakAreas as Array<Partial<WeakArea>> : []);
  const detectedAreas = mergeWeakAreas([], Array.isArray(raw.detectedAreas) ? raw.detectedAreas as Array<Partial<WeakArea>> : []);
  const status = raw.status === "finished" ? "finished" : "active";
  return {
    id: typeof raw.id === "string" ? raw.id : undefined,
    isoWeek: typeof raw.isoWeek === "string" ? raw.isoWeek : getISOWeek(),
    status,
    messages,
    weakAreas,
    detectedAreas,
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
    finishedAt: typeof raw.finishedAt === "string" ? raw.finishedAt : null,
  };
}

function rowToSession(row: Record<string, unknown>): WeaknessSession | null {
  return parseStoredSession({
    id: row.id,
    isoWeek: row.iso_week,
    status: row.status,
    messages: row.messages,
    weakAreas: row.weak_areas,
    detectedAreas: row.detected_areas,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    finishedAt: row.finished_at,
  });
}

function sameArea(a: WeakArea, b: WeakArea) {
  const sameTopic = a.topicKey === b.topicKey
    || a.topicAr === b.topicAr
    || a.topicEn.toLocaleLowerCase() === b.topicEn.toLocaleLowerCase();
  return a.subject === b.subject && a.chapterNumber === b.chapterNumber && sameTopic;
}

export default function WeaknessCheckInAgent({ language }: { language: AppLanguage }) {
  const t = copy[language];
  const [open, setOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<WeaknessSession | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const persist = async (next: WeaknessSession) => {
    const userId = userIdRef.current;
    if (!userId) return;
    localStorage.setItem(localKey(userId), JSON.stringify(next));
    await supabase.from("student_weakness_sessions").upsert({
      ...(next.id ? { id: next.id } : {}),
      user_id: userId,
      iso_week: next.isoWeek,
      status: next.status,
      messages: next.messages,
      weak_areas: next.weakAreas,
      detected_areas: next.detectedAreas,
      started_at: next.startedAt,
      updated_at: next.updatedAt,
      finished_at: next.finishedAt ?? null,
    }, { onConflict: "user_id,iso_week" });
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!active || !auth.user) return;
      const userId = auth.user.id;
      userIdRef.current = userId;
      const local = (() => {
        try { return parseStoredSession(JSON.parse(localStorage.getItem(localKey(userId)) || "null")); }
        catch { return null; }
      })();

      const { data: activeRow } = await supabase.from("student_weakness_sessions")
        .select("*").eq("user_id", userId).eq("status", "active")
        .order("updated_at", { ascending: false }).limit(1).maybeSingle();
      const remoteActive = activeRow ? rowToSession(activeRow as Record<string, unknown>) : null;
      const unfinished = remoteActive ?? (local?.status === "active" ? local : null);
      if (unfinished) {
        setSession(unfinished);
        setOpen(true);
        setInitializing(false);
        return;
      }

      const week = getISOWeek();
      const { data: weekRow } = await supabase.from("student_weakness_sessions")
        .select("*").eq("user_id", userId).eq("iso_week", week).maybeSingle();
      const completed = weekRow ? rowToSession(weekRow as Record<string, unknown>) : null;
      if (completed?.status === "finished" || local?.isoWeek === week && local.status === "finished"
        || localStorage.getItem(PLANNED_WEEK_KEY) === week) {
        const saved = completed ?? local;
        const savedProfile = saved ? profileFromWeakAreas(saved.weakAreas) : null;
        if (savedProfile) saveWeeklyLearningProfile(savedProfile);
        setSession(completed ?? local);
        setInitializing(false);
        return;
      }

      const detectedAreas = detectWeakAreas(await loadTopicPractice());
      const now = new Date().toISOString();
      const created: WeaknessSession = {
        isoWeek: week,
        status: "active",
        messages: [initialMessage(language, detectedAreas)],
        weakAreas: detectedAreas,
        detectedAreas,
        startedAt: now,
        updatedAt: now,
        finishedAt: null,
      };
      if (!active) return;
      setSession(created);
      setOpen(true);
      setInitializing(false);
      void persist(created);
    })().catch(() => { if (active) setInitializing(false); });
    return () => { active = false; };
    // Run once per authenticated app mount; language is captured for the first prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [session?.messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || !session || sending) return;
    const userMessage: WeaknessMessage = { role: "user", content: text };
    const pending: WeaknessSession = {
      ...session,
      messages: [...session.messages, userMessage].slice(-30),
      updatedAt: new Date().toISOString(),
    };
    setSession(pending);
    setInput("");
    setSending(true);
    void persist(pending);
    try {
      const { data, error } = await supabase.functions.invoke("excellence-companion", {
        body: {
          mode: "weakness",
          language,
          messages: pending.messages,
          learningProfile: { detectedAreas: pending.detectedAreas, weakAreas: pending.weakAreas },
        },
      });
      let reply = (data as { reply?: string } | null)?.reply;
      if (error && !reply) reply = await edgeErrorMessage(error, t.error);
      const returned = (data as { weakAreas?: Array<Partial<WeakArea>> } | null)?.weakAreas;
      let weakAreas = pending.weakAreas;
      if (Array.isArray(returned)) {
        const normalized = mergeWeakAreas([], returned);
        weakAreas = normalized.map((area) => {
          const previous = pending.weakAreas.find((item) => sameArea(item, area));
          return previous ? {
            ...previous,
            topicAr: area.topicAr || previous.topicAr,
            topicEn: area.topicEn || previous.topicEn,
            weaknessText: area.weaknessText || previous.weaknessText,
            source: previous.source === area.source ? previous.source : "combined",
          } : area;
        });
      }
      const finished: WeaknessSession = {
        ...pending,
        messages: [...pending.messages, { role: "assistant", content: reply || t.error } as WeaknessMessage].slice(-30),
        weakAreas,
        updatedAt: new Date().toISOString(),
      };
      setSession(finished);
      void persist(finished);
    } catch {
      const failed: WeaknessSession = {
        ...pending,
        messages: [...pending.messages, { role: "assistant", content: t.error } as WeaknessMessage].slice(-30),
        updatedAt: new Date().toISOString(),
      };
      setSession(failed);
      void persist(failed);
    } finally {
      setSending(false);
    }
  };

  const finish = async () => {
    if (!session || finishing) return;
    const profile = profileFromWeakAreas(session.weakAreas);
    if (!profile) {
      toast.error(t.needArea);
      return;
    }
    setFinishing(true);
    saveWeeklyLearningProfile(profile);
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      await supabase.from("weekly_learning_profiles").upsert({
        user_id: auth.user.id,
        iso_week: profile.isoWeek,
        subject: profile.subject,
        chapter_key: profile.chapterKey,
        chapter_number: profile.chapterNumber,
        topic_key: profile.topicKey,
        topic_en: profile.topicEn,
        topic_ar: profile.topicAr,
        weakness_text: profile.weaknessText,
        weak_areas: profile.weakAreas ?? [],
        updated_at: profile.updatedAt,
      }, { onConflict: "user_id,iso_week" });
    }
    const now = new Date().toISOString();
    const completed: WeaknessSession = { ...session, status: "finished", updatedAt: now, finishedAt: now };
    await persist(completed);
    localStorage.setItem(PLANNED_WEEK_KEY, getISOWeek());
    setSession(completed);
    setFinishing(false);
    setOpen(false);
    toast.success(t.saved);
  };

  if (initializing || !session) return null;
  if (!open) {
    return session.status === "active" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-32 end-5 z-[56] inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/40 bg-primary px-4 text-sm font-black text-primary-foreground shadow-xl"
      >
        <Target className="h-4 w-4" /> {t.reopen}
      </button>
    ) : null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <section className="flex h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] border border-primary/25 bg-background shadow-2xl sm:h-[720px] sm:rounded-[2rem]" aria-labelledby="weakness-agent-title">
        <header className="border-b border-border bg-card/90 p-4 backdrop-blur sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <h2 id="weakness-agent-title" className="font-black text-foreground">{t.title}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.subtitle}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.close} title={t.close} className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-black text-foreground">{t.detected}</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{session.weakAreas.length}</span>
            </div>
            {session.weakAreas.length ? (
              <div className="flex flex-wrap gap-2">
                {session.weakAreas.map((area) => (
                  <span key={`${area.subject}:${area.chapterNumber}:${area.topicKey}`} className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground">
                    {language === "ar" ? area.topicAr : area.topicEn}
                    <span className="ms-1 text-muted-foreground">· {language === "ar" ? "ف" : "Ch"} {area.chapterNumber}</span>
                    {area.mcqAccuracy != null && <span className="ms-2 text-violet-600 dark:text-violet-300">{t.mcq} {area.mcqAccuracy}%</span>}
                    {area.flashcardAccuracy != null && <span className="ms-2 text-sky-600 dark:text-sky-300">{t.flashcards} {area.flashcardAccuracy}%</span>}
                  </span>
                ))}
              </div>
            ) : <p className="text-xs leading-5 text-muted-foreground">{t.empty}</p>}
          </div>

          <div className="space-y-5">
            {session.messages.map((message, index) => message.role === "user" ? (
              <div key={index} className="flex justify-end">
                <div className="max-w-[86%] whitespace-pre-wrap rounded-2xl rounded-ee-md bg-primary px-4 py-3 text-sm leading-7 text-primary-foreground">{message.content}</div>
              </div>
            ) : (
              <div key={index} className="flex items-start gap-3">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Sparkles className="h-3.5 w-3.5" /></span>
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{message.content}</p>
              </div>
            ))}
            {sending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {language === "ar" ? "دا أراجع إجاباتك…" : "Reviewing your answers…"}</div>}
            <div ref={endRef} />
          </div>
        </div>

        <footer className="border-t border-border bg-card/90 p-3 backdrop-blur sm:p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 ps-4 focus-within:border-primary/50">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); }
              }}
              rows={1}
              placeholder={t.placeholder}
              className="max-h-28 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm outline-none"
            />
            <button type="button" onClick={() => void send()} disabled={!input.trim() || sending} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50" aria-label={language === "ar" ? "إرسال" : "Send"}><Send className="h-4 w-4" /></button>
          </div>
          <button type="button" onClick={() => void finish()} disabled={finishing || !session.weakAreas.length} className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-black text-white transition-opacity disabled:opacity-50">
            {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {finishing ? t.finishing : t.finish}
          </button>
        </footer>
      </section>
    </div>
  );
}
