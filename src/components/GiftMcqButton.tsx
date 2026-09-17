import { useState } from "react";
import GiftDailyScreen from "@/components/GiftDailyScreen";
import type { AppLanguage } from "@/components/LanguageGate";
import giftVideo from "@/assets/gift-premium.mp4.asset.json";
import { Gift } from "lucide-react";

/**
 * Gift animation in the profile row. Tapping it opens the full-screen daily
 * gift question (one attempt per day, ministerial bank, chapters 1-2).
 */
export default function GiftMcqButton({ language, compact = false }: { language: AppLanguage; compact?: boolean }) {
  const isAr = language === "ar";
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={isAr ? "سؤال هدية" : "Gift question"}
        title={isAr ? "سؤال الهدية اليومي" : "Daily gift question"}
        className={compact
          ? "group/gift relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-300/70 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-amber-950 shadow-[0_10px_24px_-12px_rgba(245,158,11,0.95)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgba(245,158,11,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          : "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/40 bg-primary/5 transition-colors hover:border-primary hover:bg-primary/10 sm:h-16 sm:w-16"
        }
      >
        {compact ? (
          <>
            <span aria-hidden className="absolute -right-2 -top-2 size-6 rounded-full bg-white/55 blur-md" />
            <Gift className="relative size-5 transition-transform group-hover/gift:scale-110" strokeWidth={2.4} />
          </>
        ) : (
          <video
            src={giftVideo.url}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        )}
      </button>

      {open && <GiftDailyScreen language={language} onClose={() => setOpen(false)} />}
    </>
  );
}
