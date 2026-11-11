import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Link2, Loader2, LogOut, RefreshCw, Send } from "lucide-react";
import { invokeTelegramStart } from "@/lib/telegramStart";
import { tamayzakBotLink } from "@/lib/tamayzakTelegram";
import type { AppLanguage } from "./LanguageGate";

export const DHS_CHANNEL = "a6th_DHS";

const T = {
  ar: {
    title: "اشترك بقناة 6th D'H'S حتى تستخدم تميّزك",
    desc: "الاشتراك بالقناة إجباري لكل الطلاب. اتبع الخطوات وراح نتأكد من اشتراكك تلقائياً.",
    step1: "اضغط «اشترك بالقناة» وبعدين اضغط JOIN / انضمام داخل تلغرام.",
    step2: "اضغط «اربط تلغرام بتميّزك» وبالبوت اضغط START / ابدأ.",
    step3: "ارجع لهنا واضغط «تحقق من اشتراكي».",
    join: "اشترك بالقناة",
    link: "اربط تلغرام بتميّزك",
    linked: "حساب تلغرام مربوط ✓",
    verify: "تحقق من اشتراكي",
    checking: "جاري التحقق…",
    notJoined: "بعدك مو مشترك بالقناة. اشترك بيها وارجع اضغط «تحقق من اشتراكي».",
    notLinked: "لازم تربط حساب تلغرام أولاً (الخطوة ٢) حتى نكدر نتأكد من اشتراكك.",
    unavailable: "تعذّر التحقق هسه. حاول مرة ثانية بعد شوية.",
    signOut: "تسجيل الخروج",
  },
  en: {
    title: "Join the 6th D'H'S channel to use Tamayzak",
    desc: "Joining the channel is required for all students. Follow the steps and we'll verify automatically.",
    step1: "Tap “Join the channel”, then press JOIN in Telegram.",
    step2: "Tap “Connect Telegram” and press START in the bot.",
    step3: "Come back here and tap “Verify my membership”.",
    join: "Join the channel",
    link: "Connect Telegram to Tamayzak",
    linked: "Telegram connected ✓",
    verify: "Verify my membership",
    checking: "Checking…",
    notJoined: "You haven't joined the channel yet. Join it, then tap “Verify my membership”.",
    notLinked: "Connect your Telegram account first (step 2) so we can verify your membership.",
    unavailable: "Couldn't verify right now. Please try again shortly.",
    signOut: "Sign out",
  },
} as const;

type Props = { language: AppLanguage; onVerified: () => void };
type CheckResponse = { ok?: boolean; joined?: boolean; error?: string };
// Server/bot configuration problems must not lock every student out.
const INFRA_ERRORS = new Set(["bot_not_channel_admin", "wrong_bot_connection", "telegram_not_configured", "telegram_gateway_unavailable"]);

export default function TelegramChannelGate({ language, onVerified }: Props) {
  const t = T[language] ?? T.ar;
  const rtl = language === "ar";
  const [checking, setChecking] = useState(true);
  const [linked, setLinked] = useState<boolean | null>(null);
  const [botLink, setBotLink] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const prepareLink = useCallback(async () => {
    const res = await invokeTelegramStart({ source: "dhs-gate" });
    setBotLink(res.error ? null : tamayzakBotLink(res.data));
  }, []);

  const verify = useCallback(async (silent = false) => {
    setChecking(true);
    if (!silent) setMessage(null);
    try {
      // Installed apps often resume with an expired token; refresh before checking.
      const { data: sess } = await supabase.auth.getSession();
      const exp = sess.session?.expires_at ?? 0;
      if (!sess.session || exp * 1000 - Date.now() < 60_000) await supabase.auth.refreshSession();
      const call = () => supabase.functions.invoke<CheckResponse>("telegram-channel-check", { body: { scope: "dhs" } });
      let { data, error } = await call();
      if (error || data?.error === "unauthenticated" || (data && !data.ok && data.error !== "not_linked")) {
        if (data?.error === "unauthenticated") await supabase.auth.refreshSession();
        await new Promise((r) => setTimeout(r, 800));
        ({ data, error } = await call());
      }
      if (error) throw error;
      if (data?.joined) return onVerified();
      if (data?.error && INFRA_ERRORS.has(data.error)) return onVerified();
      if (data?.error === "not_linked") {
        setLinked(false);
        void prepareLink();
        if (!silent) setMessage(t.notLinked);
        return;
      }
      setLinked(true);
      if (!silent) setMessage(data?.ok ? t.notJoined : t.unavailable);
    } catch {
      if (!silent) setMessage(t.unavailable);
    } finally {
      setChecking(false);
    }
  }, [onVerified, prepareLink, t]);

  useEffect(() => { void verify(true); }, [verify]);
  useEffect(() => {
    const onFocus = () => { if (document.visibilityState === "visible") void verify(true); };
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [verify]);

  return (
    <main dir={rtl ? "rtl" : "ltr"} className="flex min-h-screen items-center justify-center bg-background p-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Send className="size-6" /></div>
          <div>
            <h1 className="text-lg font-black text-card-foreground">{t.title}</h1>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.desc}</p>
          </div>
        </div>

        <ol className="mb-5 space-y-2 text-sm text-foreground">
          {[t.step1, t.step2, t.step3].map((s, i) => (
            <li key={i} className="flex gap-2 rounded-xl bg-muted/50 p-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">{i + 1}</span>
              <span className="leading-6">{s}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-2">
          <a href={`https://t.me/${DHS_CHANNEL}`} target="_blank" rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90">
            <Send className="size-4" />{t.join} <span dir="ltr">@{DHS_CHANNEL}</span>
          </a>
          {linked === true ? (
            <p className="flex min-h-11 items-center justify-center rounded-xl border border-border text-sm font-bold text-muted-foreground">{t.linked}</p>
          ) : (
            <a href={botLink ?? undefined} target="_blank" rel="noopener noreferrer"
              onClick={(e) => { if (!botLink) { e.preventDefault(); void prepareLink(); } }}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 font-bold text-primary hover:bg-primary/15">
              <Link2 className="size-4" />{t.link}
            </a>
          )}
          <button type="button" disabled={checking} onClick={() => void verify(false)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background font-bold text-foreground hover:border-primary/40 disabled:opacity-60">
            {checking ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            {checking ? t.checking : t.verify}
          </button>
          <button type="button" onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
            className="inline-flex h-9 items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="size-3" />{t.signOut}
          </button>
        </div>

        {message && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs leading-5 text-destructive">
            <RefreshCw className="mt-0.5 size-4 shrink-0" />{message}
          </p>
        )}
      </section>
    </main>
  );
}
