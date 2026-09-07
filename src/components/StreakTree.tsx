import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import treeLottie from "@/assets/tree_growth.lottie?url";
import { ensureDailyLogin, fetchProgress } from "@/lib/unlocks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KEY = "streak_state_v1";
const FULL_DAYS = 20;

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
          celebrated: prev.celebrated && days >= FULL_DAYS,
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

/* ----- Lottie tree growth ----- */
function LottieTree({ progress }: { progress: number }) {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (!dotLottie) return;
    let raf = 0;
    let cancelled = false;
    let currentFrame = 0;

    const run = () => {
      const total = dotLottie.totalFrames || 0;
      if (!total) return;
      const target = Math.max(0, Math.min(total - 1, Math.round(total * progress)));
      const startFrame = currentFrame;
      const growMs = 1600; // smooth grow-in tween
      const t0 = performance.now();

      try { dotLottie.pause(); } catch {}

      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - t0;
        const k = Math.min(1, elapsed / growMs);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - k, 3);
        let f = startFrame + (target - startFrame) * eased;

        if (k >= 1) {
          // After growth: gentle apple sway by oscillating ±1.5 frames around target
          const sway = Math.sin((now - t0) / 600) * 1.5;
          f = target + sway;
        }

        const clamped = Math.max(0, Math.min(total - 1, f));
        try { dotLottie.setFrame(clamped); } catch {}
        currentFrame = clamped;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (dotLottie.isLoaded) run();
    else dotLottie.addEventListener("load", run);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      try { dotLottie.removeEventListener("load", run); } catch {}
    };
  }, [dotLottie, progress]);

  return (
    <DotLottieReact
      src={treeLottie}
      autoplay={false}
      loop={false}
      dotLottieRefCallback={setDotLottie}
      style={{ width: "100%", height: "100%" }}
    />
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
  const days = daysOverride ?? state.days;
  const treeCount = Math.max(1, Math.ceil(Math.max(days, 1) / FULL_DAYS));
  const visibleTreeCount = Math.min(treeCount, compact ? 4 : 8);
  const hiddenTreeCount = Math.max(0, treeCount - visibleTreeCount);
  const activeTreeDays = days > 0 && days % FULL_DAYS === 0 ? FULL_DAYS : days % FULL_DAYS;
  const progress = Math.min(activeTreeDays / FULL_DAYS, 1);
  const pct = Math.round(progress * 100);

  const treeBoxRef = useRef<HTMLDivElement | null>(null);
  const prevAppleCountRef = useRef<number>(-1);
  const [popKey, setPopKey] = useState(0);
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

  // Sparkle + pop when a new apple appears (roughly one per streak day).
  useEffect(() => {
    const appleCount = days; // 1 apple per day, up to FULL_DAYS
    const prev = prevAppleCountRef.current;
    if (prev === -1) {
      prevAppleCountRef.current = appleCount;
      return;
    }
    if (appleCount > prev) {
      const bursts = appleCount - prev;
      const box = treeBoxRef.current?.getBoundingClientRect();
      for (let i = 0; i < bursts; i++) {
        setTimeout(() => {
          // Pop the tree slightly
          setPopKey((k) => k + 1);
          // Sparkle burst near a random spot in the canopy
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
    prevAppleCountRef.current = appleCount;
  }, [days]);

  useEffect(() => {
    if (daysOverride === undefined && days >= FULL_DAYS && !state.celebrated) {
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
    ? { days: days === 1 ? "يوم" : "يوماً", label: "حقل المثابرة", trees: treeCount === 1 ? "شجرة" : "أشجار", next: "لإكمال الشجرة القادمة" }
    : { days: days === 1 ? "day" : "days", label: "Streak forest", trees: treeCount === 1 ? "tree" : "trees", next: "to grow the next tree" };

  return (
    <section dir={language === "ar" ? "rtl" : "ltr"} className={`w-full ${compact ? "my-0" : "mt-12 mb-6"}`}>
      <div className={`mx-auto rounded-2xl border border-border bg-card overflow-hidden ${compact ? "p-3" : "max-w-lg p-5 sm:p-6"}`}>
        <div
          ref={treeBoxRef}
          className={`relative overflow-hidden rounded-xl border border-emerald-500/15 bg-gradient-to-b from-sky-400/10 via-emerald-400/5 to-amber-700/10 ${compact ? "h-36" : "h-72"}`}
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-emerald-700/20 to-transparent" />
          <div className={`relative z-10 grid h-full items-end justify-items-center ${compact ? "grid-cols-4 gap-0 px-1 pb-1" : "grid-cols-4 gap-1 px-3 pb-2 sm:px-7"}`}>
            {Array.from({ length: visibleTreeCount }, (_, index) => {
              const actualIndex = treeCount - visibleTreeCount + index;
              const treeProgress = Math.max(0, Math.min(1, (days - actualIndex * FULL_DAYS) / FULL_DAYS));
              const isActive = actualIndex === treeCount - 1;
              return (
                <div
                  key={`${actualIndex}-${isActive ? popKey : 0}`}
                  className={`${compact ? "h-24 w-[4.75rem]" : "h-36 w-28 sm:h-40 sm:w-32"} origin-bottom ${isActive ? "animate-apple-pop" : ""}`}
                  style={{
                    transform: `scale(${0.82 + (actualIndex % 3) * 0.06})`,
                    filter: isActive ? "none" : "saturate(.88)",
                  }}
                >
                  <LottieTree progress={treeProgress} />
                </div>
              );
            })}
          </div>
          {hiddenTreeCount > 0 && (
            <div className="absolute start-2 top-2 z-20 rounded-full border border-emerald-500/20 bg-background/80 px-2 py-1 text-[10px] font-bold text-emerald-600 backdrop-blur">
              +{hiddenTreeCount} {T.trees}
            </div>
          )}
        </div>
        <div className={`${compact ? "mt-2" : "mt-4"} text-center`}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{T.label}</p>
          <p className={`${compact ? "text-xl" : "text-3xl"} font-semibold text-foreground mt-1`}>
            {days} <span className={`${compact ? "text-xs" : "text-base"} font-normal text-muted-foreground`}>{T.days}</span>
            <span className="mx-2 text-muted-foreground/40">·</span>
            <span className={`${compact ? "text-xs" : "text-sm"} font-medium text-emerald-600`}>{treeCount} {T.trees}</span>
          </p>
          <div className={`${compact ? "mt-2" : "mt-4"} h-1.5 w-full rounded-full bg-muted overflow-hidden`}>
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-2">
              {`${pct}% · ${Math.max(0, FULL_DAYS - activeTreeDays)} ${language === "ar" ? "يوم" : "days"} ${T.next}`}
            </p>
          )}
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
                max={Math.max(365, days + 100)}
                step={1}
                value={streakDraft}
                onChange={(event) => setStreakDraft(Number(event.target.value))}
                className="h-2 w-full cursor-pointer accent-amber-500"
                aria-label={language === "ar" ? "أيام المثابرة" : "Streak days"}
              />
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{days}</span>
                <span>{Math.max(365, days + 100)}</span>
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
