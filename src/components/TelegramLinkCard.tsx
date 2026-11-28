import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invokeTelegramStart } from "@/lib/telegramStart";
import { BellRing, CheckCircle2, Gift, Loader2, RefreshCw, Send, ShieldCheck, Unlink } from "lucide-react";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import { TAMAYZAK_BOT_USERNAME, tamayzakBotLink } from "@/lib/tamayzakTelegram";

type TelegramLinkVariant = "profile" | "home";

const T = {
  en: {
    title: "Connect Telegram",
    desc: `Connect your account through @${TAMAYZAK_BOT_USERNAME} to receive useful reminders.`,
    linked: "Telegram connected",
    linkedDesc: "Reminders and important Tamayzak updates can reach you here.",
    connect: "Connect in Telegram", reconnect: "Connect another account", disconnect: "Disconnect",
    opened: "Press Start in Telegram. We’ll confirm the connection automatically when you return.",
    check: "Check connection", checking: "Checking…",
    stillNot: "We still can’t see the connection. Open the bot, press Start, then return here.",
    done: "Telegram connected successfully", removed: "Telegram disconnected",
    daily: "Daily gift", review: "Due reviews", updates: "Exam updates", secure: "Secure one-time link",
  },
  ar: {
    title: "اربط تيليجرام",
    desc: `اربط حسابك حصراً عبر @${TAMAYZAK_BOT_USERNAME} حتى تستلم التذكيرات المفيدة.`,
    linked: "تيليجرام مرتبط",
    linkedDesc: "توصلك تذكيرات الدراسة وتحديثات تميّزك المهمة هنا.",
    connect: "اربط عبر تيليجرام", reconnect: "ربط حساب آخر", disconnect: "فصل الربط",
    opened: "اضغط Start داخل تيليجرام. سنتأكد من الربط تلقائياً عند رجوعك.",
    check: "تحقق من الربط", checking: "جارٍ التحقق…",
    stillNot: "لم يظهر الربط بعد. افتح البوت واضغط Start ثم ارجع هنا.",
    done: "تم ربط تيليجرام بنجاح", removed: "تم فصل تيليجرام",
    daily: "الهدية اليومية", review: "المراجعات المستحقة", updates: "تحديثات الامتحانات", secure: "رابط آمن لمرة واحدة",
  },
} as const;

type TelegramLinkCardProps = { language: AppLanguage; source?: string; variant?: TelegramLinkVariant };

export function TelegramLinkCard({ language, source = "profile", variant = "profile" }: TelegramLinkCardProps) {
  const t = T[language] ?? T.en;
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data, error, signedOut } = await invokeTelegramStart({ source });
      if (signedOut) return;
      if (error) throw error;
      setVerified(Boolean(data?.verified));
      setUsername(data?.telegramUsername ?? null);
      setLink(tamayzakBotLink(data));
      if (data?.verified) setPending(false);
    } catch {
      // Retry after the next focus event or explicit action.
    } finally {
      setLoading(false);
    }
  }, [source]);

  const recheck = useCallback(async (quiet = false) => {
    if (!pending || busy) return;
    if (!quiet) setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-recheck");
      if (error) throw error;
      if (data?.linked) {
        setPending(false);
        setVerified(true);
        if (!quiet) toast.success(t.done);
        await load();
      } else if (!quiet) toast.error(t.stillNot);
    } catch (error) {
      if (!quiet) toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      if (!quiet) setBusy(false);
    }
  }, [busy, load, pending, t.done, t.stillNot]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!pending) return;
    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") void recheck(true);
    };
    window.addEventListener("focus", checkWhenVisible);
    document.addEventListener("visibilitychange", checkWhenVisible);
    return () => {
      window.removeEventListener("focus", checkWhenVisible);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, [pending, recheck]);

  const openBot = async () => {
    setBusy(true);
    try {
      const { data, error } = await invokeTelegramStart({ action: verified ? "relink" : "start", source });
      if (error) throw error;
      const deepLink = tamayzakBotLink(data) ?? link;
      setLink(deepLink ?? null);
      setPending(true);
      setVerified(false);
      setUsername(null);
      if (deepLink) window.open(deepLink, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally { setBusy(false); }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      const { error } = await invokeTelegramStart({ action: "disconnect", source });
      if (error) throw error;
      setVerified(false); setUsername(null); setLink(null); setPending(false);
      toast.success(t.removed);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally { setBusy(false); }
  };

  if (variant === "home") {
    if (loading) return <div className="h-[8.5rem] animate-pulse rounded-[1.4rem] border border-border bg-card sm:h-40 lg:h-auto" aria-hidden="true" />;
    if (verified) return null;
    return (
      <section data-home-tone="telegram" className="home-illustrated-card overflow-hidden rounded-[1.4rem] border p-3.5 sm:p-5" aria-labelledby="telegram-connect-title">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
          <div className="min-w-0">
            <h2 id="telegram-connect-title" className="text-[clamp(1.125rem,5.4vw,1.625rem)] font-black leading-snug tracking-tight">{t.title}</h2>
            <p className="home-card-muted mt-1.5 break-words text-[13px] leading-relaxed sm:text-sm">{pending ? t.opened : t.desc}</p>
          </div>
          <span className="home-card-art grid size-12 place-items-center rounded-2xl sm:size-16"><Send aria-hidden="true" className="size-6 sm:size-8" /></span>
          <div className="home-card-muted col-span-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1"><Gift aria-hidden="true" className="size-3" />{t.daily}</span>
            <span className="inline-flex items-center gap-1"><RefreshCw aria-hidden="true" className="size-3" />{t.review}</span>
            <span className="inline-flex items-center gap-1"><BellRing aria-hidden="true" className="size-3" />{t.updates}</span>
          </div>
          <div className="col-span-2 mt-0.5 flex gap-2">
            <button type="button" onClick={openBot} disabled={busy} className="home-card-action inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition-colors hover:brightness-105 disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{t.connect}
            </button>
            {pending && <button type="button" onClick={() => void recheck(false)} disabled={busy} aria-label={busy ? t.checking : t.check} className="home-card-tile inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold hover:brightness-110 disabled:opacity-60"><CheckCircle2 aria-hidden="true" className="size-4" /><span className="hidden sm:inline">{busy ? t.checking : t.check}</span></button>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm" aria-labelledby="profile-telegram-title">
      <div className="flex items-start gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${verified ? "bg-emerald-600 text-white" : "bg-sky-600 text-white"}`}>{verified ? <CheckCircle2 className="h-5 w-5" /> : <Send className="h-5 w-5" />}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="profile-telegram-title" className="text-base font-black text-foreground">{verified ? t.linked : t.title}</h2>
            {verified && username && <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">@{username}</span>}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{verified ? t.linkedDesc : pending ? t.opened : t.desc}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />{t.secure}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={openBot} disabled={busy} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : verified ? <RefreshCw className="h-4 w-4" /> : <Send className="h-4 w-4" />}{verified ? t.reconnect : t.connect}</button>
        {pending && <button type="button" onClick={() => void recheck(false)} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-bold hover:bg-secondary disabled:opacity-60"><CheckCircle2 className="h-4 w-4" />{busy ? t.checking : t.check}</button>}
        {verified && <button type="button" onClick={disconnect} disabled={busy} aria-label={t.disconnect} title={t.disconnect} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 text-sm font-bold text-destructive hover:bg-destructive/10 disabled:opacity-60"><Unlink className="h-4 w-4" /><span className="sm:hidden">{t.disconnect}</span></button>}
      </div>
    </section>
  );
}

export default TelegramLinkCard;
