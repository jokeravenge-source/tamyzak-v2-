import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Link2, Loader2, LogOut, RefreshCw, Send } from "lucide-react";
import { invokeTelegramStart } from "@/lib/telegramStart";
import { TAMAYZAK_BOT_URL, tamayzakBotLink } from "@/lib/tamayzakTelegram";
import { SITE_TELEGRAM_CHANNELS } from "@/lib/siteTelegramChannels";
import type { AppLanguage } from "./LanguageGate";

const T = {
  ar: {
    title: "اشترك بالقناتين حتى تستخدم تميّزك",
    desc: "الاشتراك بالقناتين إجباري لكل الطلاب. اتبع الخطوات وراح نتأكد من اشتراكك بالاثنين.",
    step1: "افتح رابط كل قناة وبعدين اضغط JOIN / انضمام داخل تلغرام بالقناتين.",
    step2: "اضغط «اربط تلغرام بتميّزك» وبالبوت اضغط START / ابدأ.",
    step3: "ارجع لهنا واضغط «تحقق من اشتراكي».",
    join: "اشترك بالقناة",
    link: "اربط تلغرام بتميّزك",
    linked: "حساب تلغرام مربوط ✓",
    verify: "تحقق من اشتراكي",
    checking: "جاري التحقق…",
    notJoined: "بعدك مو مشترك بكل القنوات المطلوبة. اشترك بالقناتين وارجع اضغط «تحقق من اشتراكي».",
    notLinked: "لازم تربط حساب تلغرام أولاً (الخطوة ٢) حتى نكدر نتأكد من اشتراكك.",
    unavailable: "تعذّر التحقق هسه. حاول مرة ثانية بعد شوية.",
    signOut: "تسجيل الخروج",
    codeHint: "إذا البوت انفتح بدون ما يكول «تم الربط بنجاح»، انسخ هذا الكود وأرسله للبوت:",
    copy: "نسخ الكود",
    copied: "تم النسخ ✓",
    openBot: "افتح البوت",
    linkedAs: "البوت مربوط بحساب تلغرام:",
    wrongAccount: "إذا هذا مو الحساب اللي اشتركت بيه بالقناتين، اشترك بالاثنين من هذا الحساب أو اربط حسابك الصحيح:",
    relink: "اربط حساب تلغرام آخر",
  },
  en: {
    title: "Join both channels to use Tamayzak",
    desc: "Joining both channels is required for all students. Follow the steps and we'll verify both memberships.",
    step1: "Open each channel below, then press JOIN in Telegram for both channels.",
    step2: "Tap “Connect Telegram” and press START in the bot.",
    step3: "Come back here and tap “Verify my membership”.",
    join: "Join the channel",
    link: "Connect Telegram to Tamayzak",
    linked: "Telegram connected ✓",
    verify: "Verify my membership",
    checking: "Checking…",
    notJoined: "You haven't joined all required channels yet. Join both, then tap “Verify my membership”.",
    notLinked: "Connect your Telegram account first (step 2) so we can verify your membership.",
    unavailable: "Couldn't verify right now. Please try again shortly.",
    signOut: "Sign out",
    codeHint: "If the bot opened without saying “linked successfully”, copy this code and send it to the bot:",
    copy: "Copy code",
    copied: "Copied ✓",
    openBot: "Open the bot",
    linkedAs: "The bot is linked to Telegram account:",
    wrongAccount: "If this isn't the account you joined both channels with, join both from this account or link the right one:",
    relink: "Link a different Telegram account",
  },
} as const;

type Props = { language: AppLanguage; onVerified: () => void };
type CheckResponse = { ok?: boolean; joined?: boolean; error?: string; telegramAccount?: { username?: string | null; name?: string | null } };

export default function TelegramChannelGate({ language, onVerified }: Props) {
  const t = T[language] ?? T.ar;
  const rtl = language === "ar";
  const [checking, setChecking] = useState(true);
  const [linked, setLinked] = useState<boolean | null>(null);
  const [botLink, setBotLink] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [joinedChannels, setJoinedChannels] = useState<string[]>([]);
  const verifying = useRef(false);
  const verifiedCallback = useRef(onVerified);
  useEffect(() => { verifiedCallback.current = onVerified; }, [onVerified]);

  const prepareLink = useCallback(async () => {
    const res = await invokeTelegramStart({ source: "site-gate" });
    const link = res.error ? null : tamayzakBotLink(res.data);
    setBotLink(link);
    const tok = link?.split("start=")[1] ?? null;
    setCode(tok && /^[a-f0-9]{48}$/i.test(tok) ? tok : null);
  }, []);

  const verify = useCallback(async (silent = false) => {
    if (verifying.current) return;
    verifying.current = true;
    setChecking(true);
    if (!silent) setMessage(null);
    try {
      // Installed apps often resume with an expired token; refresh before checking.
      const { data: sess } = await supabase.auth.getSession();
      const exp = sess.session?.expires_at ?? 0;
      if (!sess.session || exp * 1000 - Date.now() < 60_000) await supabase.auth.refreshSession();
      const check = async (scope: typeof SITE_TELEGRAM_CHANNELS[number]["scope"]) => {
        const call = () => supabase.functions.invoke<CheckResponse>("telegram-channel-check", { body: { scope } });
        let result = await call();
        if (result.error || result.data?.error === "unauthenticated") {
          if (result.data?.error === "unauthenticated") await supabase.auth.refreshSession();
          await new Promise((resolve) => setTimeout(resolve, 800));
          result = await call();
        }
        return result;
      };
      const checks = await Promise.all(SITE_TELEGRAM_CHANNELS.map(channel => check(channel.scope)));
      setJoinedChannels(SITE_TELEGRAM_CHANNELS.filter((_, index) => !checks[index].error && checks[index].data?.ok === true && checks[index].data?.joined === true).map(channel => channel.username));
      if (checks.every(({ data, error }) => !error && data?.ok === true && data.joined === true)) {
        return verifiedCallback.current();
      }
      if (checks.some(({ data }) => data?.error === "not_linked")) {
        setLinked(false);
        void prepareLink();
        if (!silent) setMessage(t.notLinked);
        return;
      }
      setLinked(true);
      const acc = checks.find(({ data }) => data?.telegramAccount)?.data?.telegramAccount;
      setAccount(acc ? [acc.name, acc.username ? `@${acc.username}` : null].filter(Boolean).join(" ") || null : null);
      // An unavailable check or bot setup problem is not proof of membership.
      if (checks.some(({ data, error }) => error || data?.ok !== true)) {
        setMessage(t.unavailable);
        return;
      }
      const missing = SITE_TELEGRAM_CHANNELS.filter((_, index) => checks[index].data?.joined !== true).map(channel => `@${channel.username}`);
      setMessage(`${t.notJoined} ${missing.join("، ")}`);
    } catch {
      setMessage(t.unavailable);
    } finally {
      setChecking(false);
      verifying.current = false;
    }
  }, [prepareLink, t]);

  useEffect(() => { void verify(true); }, [verify]);
  // While waiting for the bot link, re-check quietly so the gate opens by itself.
  useEffect(() => {
    if (linked !== false) return;
    const id = window.setInterval(() => { if (document.visibilityState === "visible") void verify(true); }, 10000);
    return () => window.clearInterval(id);
  }, [linked, verify]);
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
          {SITE_TELEGRAM_CHANNELS.map(channel => <a key={channel.username} href={`https://t.me/${channel.username}`} target="_blank" rel="noopener noreferrer"
            className="flex min-h-12 flex-wrap items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-center text-sm font-bold text-primary-foreground hover:bg-primary/90">
            {joinedChannels.includes(channel.username) ? <CheckCircle2 className="size-4 shrink-0" /> : <Send className="size-4 shrink-0" />}{t.join} {rtl ? channel.nameAr : channel.nameEn} <span dir="ltr" className="whitespace-nowrap">@{channel.username}</span>
          </a>)}
          {linked === true ? (
            <p className="flex min-h-11 items-center justify-center rounded-xl border border-border text-sm font-bold text-muted-foreground">{t.linked}</p>
          ) : (
            <a href={botLink ?? undefined} target="_blank" rel="noopener noreferrer"
              onClick={(e) => { if (!botLink) { e.preventDefault(); void prepareLink(); } }}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 font-bold text-primary hover:bg-primary/15">
              <Link2 className="size-4" />{t.link}
            </a>
          )}
          {linked === true && account && (
            <div className="rounded-xl border border-border bg-muted/50 p-3 text-xs leading-5 text-foreground">
              <p>{t.linkedAs} <b dir="ltr">{account}</b></p>
              <p className="mt-1 text-muted-foreground">{t.wrongAccount}</p>
              {(
                <button type="button" onClick={async () => {
                    const win = window.open("", "_blank");
                    const res = await invokeTelegramStart({ source: "site-gate", action: "relink" });
                    const link = res.error ? null : tamayzakBotLink(res.data);
                    if (link) { if (win) win.location.href = link; else window.location.href = link; } else win?.close();
                    setLinked(false); setAccount(null); setBotLink(link);
                    const tok = link?.split("start=")[1] ?? null;
                    setCode(tok && /^[a-f0-9]{48}$/i.test(tok) ? tok : null);
                  }}
                  className="mt-2 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 font-bold text-primary">
                  <Link2 className="size-4" />{t.relink}
                </button>
              )}
            </div>
          )}
          {linked === false && code && (
            <div className="rounded-xl border border-border bg-muted/50 p-3 text-xs leading-5 text-foreground">
              <p className="mb-2">{t.codeHint}</p>
              <p dir="ltr" className="mb-2 select-all break-all rounded-lg bg-background p-2 font-mono text-[11px]">{code}</p>
              <div className="flex gap-2">
                <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ } }}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 font-bold text-primary-foreground">{copied ? t.copied : t.copy}</button>
                <a href={TAMAYZAK_BOT_URL} target="_blank" rel="noopener noreferrer"
                  className="flex-1 rounded-lg border border-primary/30 px-3 py-2 text-center font-bold text-primary">{t.openBot}</a>
              </div>
            </div>
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
