import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { AppLanguage } from "./LanguageGate";

export const NADIA_TELEGRAM_CHANNEL = "nadiakhaleelalnuaimy";
export const NADIA_CHANNEL_GATE_STORAGE_KEY = "nadia_channel_gate_completed_v1";

const COPY = {
  ar: {
    eyebrow: "فلاش كاردات نادية النعيمي",
    title: "تابع قناة الأستاذة نادية",
    description: "افتح قناة الأستاذة نادية خليل النعيمي على تيليغرام حتى تتابع الملازم والتحديثات الخاصة بالفلاش كاردات.",
    channel: "فتح قناة نادية النعيمي",
    continue: "فتحت القناة — ابدأ الفلاش كاردات",
    hint: "بعد فتح القناة ارجع إلى تميّزك واضغط زر البدء.",
    back: "الرجوع",
  },
  en: {
    eyebrow: "Nadia Al-Nuaimi flashcards",
    title: "Follow Nadia's channel",
    description: "Open Nadia Khaleel Al-Nuaimi's Telegram channel for handouts and flashcard updates.",
    channel: "Open Nadia's channel",
    continue: "I opened the channel — start flashcards",
    hint: "After opening the channel, return to Tamayzak and press start.",
    back: "Back",
  },
} as const;

type NadiaTelegramGateProps = {
  language: AppLanguage;
  onContinue: () => void;
};

/**
 * Teacher-specific entry gate for Nadia Al-Nuaimi's biology decks.
 *
 * Telegram does not expose membership confirmation to the browser, so the
 * continue action becomes available after the student opens the channel.
 * The parent stores completion locally to avoid showing the gate repeatedly.
 */
export default function NadiaTelegramGate({ language, onContinue }: NadiaTelegramGateProps) {
  const [channelOpened, setChannelOpened] = useState(false);
  const rtl = language === "ar";
  const t = COPY[language] ?? COPY.ar;

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
            onClick={() => setChannelOpened(true)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 font-black text-white shadow-lg shadow-[#229ED9]/20 transition hover:bg-[#1b8fc6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] focus-visible:ring-offset-2"
          >
            <Send className="size-5" />
            {t.channel}
          </a>

          <button
            type="button"
            disabled={!channelOpened}
            onClick={onContinue}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary px-4 font-black text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60"
          >
            <CheckCircle2 className="size-5" />
            {t.continue}
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-muted-foreground">{t.hint}</p>
        <p className="mt-2 font-mono text-xs font-bold text-[#229ED9]" dir="ltr">
          @{NADIA_TELEGRAM_CHANNEL}
        </p>
      </section>
    </main>
  );
}
