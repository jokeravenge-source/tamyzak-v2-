import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoonStar, Sparkles, Trophy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type DailySummary = { date: string; points: number };
const SEEN_KEY_PREFIX = "points_daily_summary_seen_v1";

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function previousDayRange() {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 1);
  return { date: localDateKey(start), start: start.toISOString(), end: end.toISOString() };
}

const PointsAwardOverlay = ({ language }: { language: "en" | "ar" }) => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const checkingRef = useRef(false);
  const isAr = language === "ar";

  const checkDailySummary = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) return;

      const range = previousDayRange();
      const seenKey = `${SEEN_KEY_PREFIX}:${user.id}`;
      if (localStorage.getItem(seenKey) === range.date) return;

      const { data, error } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", user.id)
        .gte("created_at", range.start)
        .lt("created_at", range.end);
      if (error) return;

      localStorage.setItem(seenKey, range.date);
      const points = (data ?? []).reduce(
        (total, award) => total + (Number(award.points) || 0),
        0,
      );
      if (points > 0) setSummary({ date: range.date, points });
    } finally {
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void checkDailySummary();
    let midnightTimer: ReturnType<typeof setTimeout>;

    const scheduleMidnightCheck = () => {
      clearTimeout(midnightTimer);
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 2, 0);
      midnightTimer = setTimeout(() => {
        void checkDailySummary();
        scheduleMidnightCheck();
      }, Math.max(1_000, nextMidnight.getTime() - Date.now()));
    };
    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") void checkDailySummary();
    };

    scheduleMidnightCheck();
    document.addEventListener("visibilitychange", checkWhenVisible);
    window.addEventListener("focus", checkWhenVisible);
    return () => {
      clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      window.removeEventListener("focus", checkWhenVisible);
    };
  }, [checkDailySummary]);

  return (
    <AnimatePresence>
      {summary && (
        <motion.div
          key={summary.date}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/65 px-4 backdrop-blur-sm"
          dir={isAr ? "rtl" : "ltr"} role="dialog" aria-modal="true"
          aria-labelledby="daily-points-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[30px] border border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 p-6 text-center shadow-2xl"
          >
            <button type="button" onClick={() => setSummary(null)}
              aria-label={isAr ? "إغلاق" : "Close"}
              className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/65 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="pointer-events-none absolute -start-12 -top-12 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 -end-10 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25">
              <Trophy className="h-10 w-10" />
              <Sparkles className="absolute -end-2 -top-2 h-6 w-6 text-primary" />
            </div>
            <div className="mb-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <MoonStar className="h-4 w-4" />
              {isAr ? "حصيلة اليوم" : "Daily total"}
            </div>
            <h2 id="daily-points-title" className="text-xl font-black text-foreground">
              {isAr ? "شوف شكد أبدعت البارحة!" : "Look what you achieved yesterday!"}
            </h2>
            <div className="my-5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-5">
              <span className="block text-5xl font-black text-primary">+{summary.points}</span>
              <span className="mt-1 block text-sm font-semibold text-muted-foreground">
                {isAr ? "نقطة جمعتها خلال اليوم" : "points earned during the day"}
              </span>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              {isAr
                ? "جمعنالك كل نقاطك برسالة وحدة حتى يبقى تركيزك على دراستك. استمر، شغلك كلش حلو!"
                : "We collected all your points into one message so you can stay focused. Keep it up!"}
            </p>
            <button type="button" onClick={() => setSummary(null)}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98]">
              {isAr ? "يلا نكمل" : "Keep going"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PointsAwardOverlay;
