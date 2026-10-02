import { ArrowLeft, CheckCircle2, Link2, Loader2, RefreshCw, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { AppLanguage } from "./LanguageGate";

export const NADIA_TELEGRAM_CHANNEL = "nadiakhaleelalnuaimy";

const COPY = {
  ar: {
    eyebrow: "فلاش كاردات نادية النعيمي",
    title: "انضم إلى قناة الأستاذة نادية",
    description: "هذه الفلاش كاردات متاحة لأعضاء قناة الأستاذة نادية خليل النعيمي. سيتم التحقق من عضويتك قبل الدخول.",
    channel: "١. انضم إلى قناة نادية",
    connect: "٢. اربط حساب تلغرام بتميّزك",
    verify: "تحقق من الانضمام وافتح الفلاش كاردات",
    checking: "جارٍ التحقق من العضوية…",
    notJoined: "لم يظهر انضمامك بعد. انضم إلى القناة، ثم ارجع واضغط «تحقق من الانضمام».",
    notLinked: "اربط حساب تلغرام بتميّزك أولاً، ثم انضم إلى القناة وأعد التحقق.",
    unavailable: "تعذّر التحقق الآن. حاول مرة أخرى بعد قليل.",
    back: "الرجوع",
  },
  en: {
    eyebrow: "Nadia Al-Nuaimi flashcards",
    title: "Join Nadia's channel",
    description: "These flashcards are available to members of Nadia Khaleel Al-Nuaimi's channel. Membership is verified before access.",
    channel: "1. Join Nadia's channel",
    connect: "2. Connect Telegram to Tamayzak",
    verify: "Verify membership and open flashcards",
    checking: "Checking membership…",
    notJoined: "Your membership was not found. Join the channel, return here, and press Verify membership.",
    notLinked: "Connect your Telegram account to Tamayzak first, then join the channel and verify again.",
    unavailable: "Membership could not be checked right now. Please try again shortly.",
    back: "Back",
  },
} as const;

type NadiaTelegramGateProps = {
  language: AppLanguage;
  onVerified: () => void;
};

type MembershipResponse = {
  ok?: boolean;
  joined?: boolean;
  error?: string;
};

/**
 * Server-verified force-join gate for Nadia Al-Nuaimi's biology decks.
 * Access is granted only after the linked Telegram user is returned as a
 * channel member by Telegram's getChatMember API.
 */
export default function NadiaTelegramGate({ language, onVerified }: NadiaTelegramGateProps) {
  const rtl = language === "ar";
  const t = COPY[language] ?? COPY.ar;
  const [checking, setChecking] = useState(true);
  const [connectLink, setConnectLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prepareTelegramLink = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("telegram-start");
      if (error) throw error;
      setConnectLink(data?.deepLink ?? null);
    } catch {
      setConnectLink(null);
    }
  }, []);

  const verifyMembership = useCallback(async () => {
    setChecking(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke<MembershipResponse>("telegram-channel-check", {
        body: { scope: "nadia" },
      });
      if (error) throw error;

      if (data?.joined) {
        onVerified();
        return;
      }

      if (data?.error === "not_linked") {
        await prepareTelegramLink();
        setErrorMessage(t.notLinked);
        return;
      }

      setErrorMessage(data?.ok ? t.notJoined : t.unavailable);
    } catch {
      setErrorMessage(t.unavailable);
    } finally {
      setChecking(false);
    }
  }, [onVerified, prepareTelegramLink, t.notJoined, t.notLinked, t.unavailable]);

  useEffect(() => {
    void verifyMembership();
  }, [verifyMembership]);

  return (
    <main
      dir={rtl ? "rtl" : "ltr"}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-biology/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 size-72 rounded-full bg-primary/15 blur-3xl" />

      <Link
        to="/"
        className="absolute left-4 top-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/90 px-3 text-sm font-bold text-foreground shadow-sm backdrop-blur transition-colors hover:border-primary/50 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-4" />
        <span>{t.back}</span>
      </Link>

      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card/95 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#229ED9]/15 text-[#229ED9] ring-1 ring-[#229ED9]/25">
          <Send className="size-8" />
        </div>

        <p className="mb-2 text-xs font-black tracking-wide text-primary">{t.eyebrow}</p>
        <h1 className="text-2xl font-black text-card-foreground sm:text-3xl">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">{t.description}</p>

        <div className="mt-7 space-y-3">
          <a
            href={`https://t.me/${NADIA_TELEGRAM_CHANNEL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 font-black text-white shadow-lg shadow-[#229ED9]/20 transition hover:bg-[#1b8fc6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] focus-visible:ring-offset-2"
          >
            <Send className="size-5" />
            {t.channel}
          </a>

          {connectLink && (
            <a
              href={connectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#229ED9]/35 bg-[#229ED9]/10 px-4 font-black text-[#229ED9] transition hover:bg-[#229ED9]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] focus-visible:ring-offset-2"
            >
              <Link2 className="size-5" />
              {t.connect}
            </a>
          )}

          <button
            type="button"
            disabled={checking}
            onClick={() => void verifyMembership()}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary px-4 font-black text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {checking ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
            {checking ? t.checking : t.verify}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-start text-xs leading-5 text-destructive" role="alert">
            <RefreshCw className="mt-0.5 size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <p className="mt-4 font-mono text-xs font-bold text-[#229ED9]" dir="ltr">
          @{NADIA_TELEGRAM_CHANNEL}
        </p>
      </section>
    </main>
  );
}
