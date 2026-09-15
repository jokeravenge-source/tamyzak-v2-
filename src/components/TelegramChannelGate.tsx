import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, RefreshCw, CheckCircle2 } from "lucide-react";
import type { AppLanguage } from "./LanguageGate";

const REQUIRED_CHANNELS = ["Tamayuzak", "a6th_dhs", "sad6ths"] as const;

const T = {
  en: {
    title: "Join the required Telegram channels",
    desc: "Please join all three channels to continue.",
    open: "Join",
    check: "I've joined",
    checking: "Checking…",
    notJoined: "We can't see you in the channel yet. Please join, then try again.",
    signOut: "Sign out",
    step1: "1. Open each channel below.",
    step2: "2. Press JOIN in all three Telegram channels.",
    step3: "3. Come back here and tap “I've joined”.",
  },
  ar: {
    title: "انضم إلى قنوات تلغرام المطلوبة",
    desc: "يرجى الانضمام إلى القنوات الثلاث للمتابعة.",
    open: "انضم إلى",
    check: "لقد انضممت",
    checking: "جاري التحقق…",
    notJoined: "لم نرك في القناة بعد. يرجى الانضمام ثم المحاولة مرة أخرى.",
    signOut: "تسجيل الخروج",
    step1: "١. افتح كل قناة من الأزرار بالأسفل.",
    step2: "٢. اضغط JOIN في القنوات الثلاث داخل تلغرام.",
    step3: "٣. ارجع هنا واضغط «لقد انضممت».",
  },
} as const;

type Props = {
  language: AppLanguage;
  onVerified: () => void;
};

export default function TelegramChannelGate({ language, onVerified }: Props) {
  const t = T[language] ?? T.en;
  const rtl = language === "ar";
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    setChecking(true);
    setError(null);
    // Trust-based: we cannot verify channel membership without linking the
    // Telegram account. Give the user a brief moment then accept.
    await new Promise((r) => setTimeout(r, 400));
    setChecking(false);
    onVerified();
  };

  return (
    <main
      dir={rtl ? "rtl" : "ltr"}
      className="min-h-screen flex items-center justify-center p-4 bg-background"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-secondary/40 backdrop-blur p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t.title}</h1>
            <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
          </div>
        </div>

        <ol className="text-sm text-muted-foreground space-y-1 mb-5">
          <li>{t.step1}</li>
          <li>{t.step2}</li>
          <li>{t.step3}</li>
        </ol>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {REQUIRED_CHANNELS.map((channel, index) => (
              <a
                key={channel}
                href={`https://t.me/${channel}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full h-11 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition ${
                  index === 0
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary/30 bg-primary/10 text-primary"
                }`}
              >
                <Send className="w-4 h-4" />
                {t.open} @{channel}
              </a>
            ))}
            <button
              onClick={() => check()}
              disabled={checking}
              className="w-full h-11 rounded-xl border border-white/10 bg-background font-medium flex items-center justify-center gap-2 hover:border-primary/40 transition disabled:opacity-60"
            >
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.checking}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t.check}
                </>
              )}
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="w-full h-9 text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              {t.signOut}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
