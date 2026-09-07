import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { ensureDailyLogin, fetchProgress } from "@/lib/unlocks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KEY = "streak_sky_state_v1";
const FULL_DAYS = 5;
const MAX_STREAK_DAYS = 60;

type StreakState = { days: number; lastDate: string; celebrated?: boolean };

// The server stores the account's streak, so it survives deployments, browser
// storage cleanup, and moves between the Lovable and custom-domain addresses.
function useStreak(enabled = true) {
  const [state, setState] = useState<StreakState>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { days: 0, lastDate: "", celebrated: false };
  });

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    const refresh = async () => {
      // Safe to call repeatedly: the server awards a daily login only once.
      await ensureDailyLogin();
      const progress = await fetchProgress();
      if (!active) return;

      setState((prev) => {
        // Keep an existing local value only when the remote account has not yet
        // recorded a streak (for example, while an older account is migrating).
        const days = progress.current_streak > 0 ? progress.current_streak : prev.days;
        const next = {
          days,
          lastDate: progress.last_active_date ?? prev.lastDate,
          celebrated: prev.celebrated && days >= MAX_STREAK_DAYS,
        };
        try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    };

    void refresh();
    window.addEventListener("app:progress-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("app:progress-updated", refresh);
    };
  }, [enabled]);

  const markCelebrated = () => {
    setState((p) => {
      const n = { ...p, celebrated: true };
      try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
      return n;
    });
  };

  return { state, markCelebrated };
}

const STAR_POSITIONS = [
  { left: 13, top: 31, size: 38 }, { left: 35, top: 21, size: 44 },
  { left: 59, top: 30, size: 39 }, { left: 81, top: 19, size: 45 },
  { left: 20, top: 55, size: 43 }, { left: 46, top: 52, size: 38 },
  { left: 70, top: 55, size: 44 }, { left: 89, top: 48, size: 36 },
  { left: 10, top: 76, size: 37 }, { left: 34, top: 75, size: 42 },
  { left: 60, top: 76, size: 38 }, { left: 82, top: 73, size: 43 },
];

function RewardStar({ index, compact }: { index: number; compact: boolean }) {
  const star = STAR_POSITIONS[index];
  const size = compact ? Math.round(star.size * 0.72) : star.size;
  return (
    <span
      className="streak-star absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${star.left}%`, top: `${star.top}%`, width: size, height: size, animationDelay: `${260 + index * 90}ms` }}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full overflow-visible" aria-hidden="true">
        <path d="M24 3.5 30.1 16l13.8 2-10 9.7 2.4 13.8L24 35l-12.3 6.5 2.4-13.8-10-9.7 13.8-2z" fill="#FFE796" stroke="#F5B94C" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M17 18.5c2.4-5.1 5.8-7.3 10.2-7.1" fill="none" stroke="#FFF9D9" strokeWidth="3" strokeLinecap="round" opacity=".9" />
      </svg>
    </span>
  );
}

const StreakTree = ({
  language = "en",
  daysOverride,
  compact = false,
}: {
  language?: "en" | "ar";
  daysOverride?: number;
  compact?: boolean;
}) => {
  const { state, markCelebrated } = useStreak(daysOverride === undefined);
  const days = Math.min(MAX_STREAK_DAYS, Math.max(0, daysOverride ?? state.days));
  const earnedStars = Math.min(12, Math.floor(days / FULL_DAYS));
  const daysIntoNextStar = days >= MAX_STREAK_DAYS ? FULL_DAYS : days % FULL_DAYS;
  const daysToNextStar = days >= MAX_STREAK_DAYS ? 0 : FULL_DAYS - daysIntoNextStar;
  const nextStarPct = days >= MAX_STREAK_DAYS ? 100 : Math.round((daysIntoNextStar / FULL_DAYS) * 100);

  const skyBoxRef = useRef<HTMLDivElement | null>(null);
  const prevStarCountRef = useRef<number>(-1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [streakDraft, setStreakDraft] = useState(days);
  const [savingStreak, setSavingStreak] = useState(false);

  useEffect(() => {
    setStreakDraft(days);
  }, [days]);

  useEffect(() => {
    if (compact || daysOverride !== undefined) return;
    let active = true;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (active) setIsAdmin(Boolean(data));
    })();
    return () => { active = false; };
  }, [compact, daysOverride]);

  const saveOwnStreak = async () => {
    if (streakDraft <= days) {
      toast.error(language === "ar" ? "حرّك المؤشر لزيادة أيام المثابرة" : "Move the slider to increase your streak");
      return;
    }
    setSavingStreak(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user?.id) throw new Error("Not signed in");
      const { data, error } = await supabase.functions.invoke("admin-manage-users", {
        body: { action: "set_streak", user_id: auth.user.id, days: streakDraft },
      });
      if (error || (data as any)?.error) throw error ?? new Error((data as any).error);
      window.dispatchEvent(new CustomEvent("app:progress-updated"));
      toast.success(language === "ar" ? `تم تحديث المثابرة إلى ${streakDraft} يوم` : `Streak updated to ${streakDraft} days`);
    } catch (error) {
      console.error("Failed to update admin streak", error);
      toast.error(language === "ar" ? "تعذّر تحديث أيام المثابرة" : "Couldn't update streak days");
    } finally {
      setSavingStreak(false);
    }
  };

  // Celebrate only when another five-day reward star is earned.
  useEffect(() => {
    const prev = prevStarCountRef.current;
    if (prev === -1) {
      prevStarCountRef.current = earnedStars;
      return;
    }
    if (earnedStars > prev) {
      const bursts = earnedStars - prev;
      const box = skyBoxRef.current?.getBoundingClientRect();
      for (let i = 0; i < bursts; i++) {
        setTimeout(() => {
          if (box) {
            const x = (box.left + box.width * (0.25 + Math.random() * 0.5)) / window.innerWidth;
            const y = (box.top + box.height * (0.2 + Math.random() * 0.4)) / window.innerHeight;
            confetti({
              particleCount: 18,
              spread: 60,
              startVelocity: 22,
              scalar: 0.7,
              ticks: 80,
              gravity: 0.6,
              origin: { x, y },
              colors: ["#FFD700", "#FFFFFF", "#FFE680", "#FFB347"],
              shapes: ["star", "circle"],
            });
          }
        }, i * 220);
      }
    }
    prevStarCountRef.current = earnedStars;
  }, [earnedStars]);

  useEffect(() => {
    if (daysOverride === undefined && days >= MAX_STREAK_DAYS && !state.celebrated) {
      const end = Date.now() + 4000;
      const burst = () => {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.7 } });
        confetti({ particleCount: 60, spread: 100, angle: 60, origin: { x: 0, y: 0.8 } });
        confetti({ particleCount: 60, spread: 100, angle: 120, origin: { x: 1, y: 0.8 } });
        if (Date.now() < end) setTimeout(burst, 700);
      };
      burst();
      markCelebrated();
    }
  }, [days, daysOverride, state.celebrated, markCelebrated]);

  const T = language === "ar"
    ? { days: days === 1 ? "يوم" : "يوماً", label: "سماء المثابرة", stars: earnedStars === 1 ? "نجمة" : "نجوم", next: "للنجمة القادمة", complete: "اكتملت سماء المثابرة" }
    : { days: days === 1 ? "day" : "days", label: "Streak sky", stars: earnedStars === 1 ? "star" : "stars", next: "until your next star", complete: "Your streak sky is complete" };

  return (
    <section dir={language === "ar" ? "rtl" : "ltr"} className={`w-full ${compact ? "my-0" : "mt-12 mb-6"}`}>
      <div className={`mx-auto rounded-2xl border border-border bg-card overflow-hidden ${compact ? "p-3" : "max-w-lg p-5 sm:p-6"}`}>
        <div className={`mb-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-400/20 bg-indigo-500/10 ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
          <div className="min-w-0 text-start">
            <p className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-indigo-600 dark:text-indigo-200`}>
              {days >= MAX_STREAK_DAYS
                ? T.complete
                : language === "ar"
                  ? `متبقي ${daysToNextStar} ${daysToNextStar === 1 ? "يوم" : "أيام"} للنجمة القادمة`
                  : `${daysToNextStar} ${daysToNextStar === 1 ? "day" : "days"} until your next star`}
            </p>
            <div className="mt-2 flex gap-1" aria-hidden="true">
              {Array.from({ length: FULL_DAYS }, (_, index) => (
                <span key={index} className={`h-1.5 w-5 rounded-full transition-colors ${index < daysIntoNextStar ? "bg-amber-300" : "bg-indigo-300/25"}`} />
              ))}
            </div>
          </div>
          <div className="shrink-0 text-center">
            <p className={`${compact ? "text-lg" : "text-2xl"} font-black tabular-nums text-amber-500`}>{earnedStars}<span className="text-xs text-muted-foreground">/12</span></p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{T.stars}</p>
          </div>
        </div>
        <div
          ref={skyBoxRef}
          className={`relative overflow-hidden rounded-xl border border-indigo-300/20 bg-[radial-gradient(circle_at_50%_48%,rgba(159,122,234,0.55),transparent_48%),linear-gradient(180deg,#5578d8_0%,#6465c9_48%,#313b8d_100%)] ${compact ? "h-44" : "h-72"}`}
        >
          <style>{`
            @keyframes streak-star-reveal { 0% { opacity: 0; transform: translate(-50%,-50%) scale(.15) rotate(-28deg); } 70% { opacity: 1; transform: translate(-50%,-50%) scale(1.18) rotate(5deg); } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(0); } }
            @keyframes streak-star-glow { 0%,100% { filter: drop-shadow(0 0 5px rgba(255,220,120,.65)); } 50% { filter: drop-shadow(0 0 14px rgba(255,229,145,.95)); } }
            .streak-star { opacity: 0; animation: streak-star-reveal .7s cubic-bezier(.22,1,.36,1) forwards, streak-star-glow 2.8s ease-in-out 1.1s infinite; }
            @media (prefers-reduced-motion: reduce) { .streak-star { opacity: 1; animation: none; } }
          `}</style>
          <div aria-hidden="true" className="absolute end-[7%] top-[8%] h-14 w-14 rounded-full bg-amber-100 shadow-[0_0_28px_rgba(255,232,161,.65)] after:absolute after:-start-2 after:-top-2 after:h-14 after:w-14 after:rounded-full after:bg-[#5873d2]" />
          <div aria-hidden="true" className="absolute start-[8%] top-[15%] h-5 w-20 rounded-full bg-indigo-200/25 before:absolute before:-top-3 before:start-4 before:h-8 before:w-9 before:rounded-full before:bg-indigo-200/25 after:absolute after:-top-2 after:end-3 after:h-7 after:w-10 after:rounded-full after:bg-indigo-200/25" />
          <div aria-hidden="true" className="absolute end-[25%] top-[30%] h-3 w-14 rounded-full bg-violet-200/20" />
          {[7,16,27,39,49,62,74,86,94,22,55,80].map((left, index) => (
            <span key={left} aria-hidden="true" className="absolute z-10 rounded-full bg-amber-100/80" style={{ left: `${left}%`, top: `${10 + (index * 17) % 56}%`, width: index % 3 === 0 ? 3 : 2, height: index % 3 === 0 ? 3 : 2 }} />
          ))}
          <div aria-hidden="true" className="absolute -bottom-[22%] -start-[12%] h-[48%] w-[70%] rounded-[50%] bg-[#344c9c]" />
          <div aria-hidden="true" className="absolute -bottom-[25%] start-[24%] h-[43%] w-[65%] rounded-[50%] bg-[#4654ae]" />
          <div aria-hidden="true" className="absolute -bottom-[23%] -end-[18%] h-[52%] w-[65%] rounded-[50%] bg-[#263a83]" />
          {Array.from({ length: earnedStars }, (_, index) => <RewardStar key={index} index={index} compact={compact} />)}
        </div>
        <div className={`${compact ? "mt-2" : "mt-4"} text-center`}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{T.label}</p>
          <p className={`${compact ? "text-xl" : "text-3xl"} font-semibold text-foreground mt-1`}>
            {days} <span className={`${compact ? "text-xs" : "text-base"} font-normal text-muted-foreground`}>{T.days}</span>
            <span className="mx-2 text-muted-foreground/40">·</span>
            <span className={`${compact ? "text-xs" : "text-sm"} font-medium text-amber-500`}>{earnedStars}/12 {T.stars}</span>
          </p>
          <div className={`${compact ? "mt-2" : "mt-4"} h-1.5 w-full rounded-full bg-muted overflow-hidden`}>
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 transition-all duration-700"
              style={{ width: `${nextStarPct}%` }}
            />
          </div>
          {isAdmin && !compact && daysOverride === undefined && (
            <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-start">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "تعديل أيام المثابرة" : "Adjust streak days"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {language === "ar" ? "خاص بحساب الإدارة" : "Admin account only"}
                  </p>
                </div>
                <span className="min-w-16 rounded-lg bg-amber-500/15 px-3 py-1.5 text-center text-lg font-black text-amber-600 dark:text-amber-300">
                  {streakDraft}
                </span>
              </div>
              <input
                type="range"
                min={days}
                max={MAX_STREAK_DAYS}
                step={1}
                value={streakDraft}
                onChange={(event) => setStreakDraft(Number(event.target.value))}
                className="h-2 w-full cursor-pointer accent-amber-500"
                aria-label={language === "ar" ? "أيام المثابرة" : "Streak days"}
              />
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{days}</span>
                <span>{MAX_STREAK_DAYS}</span>
              </div>
              <button
                type="button"
                onClick={saveOwnStreak}
                disabled={savingStreak || streakDraft === days}
                className="mt-3 h-10 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingStreak
                  ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                  : (language === "ar" ? "حفظ أيام المثابرة" : "Save streak days")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StreakTree;
