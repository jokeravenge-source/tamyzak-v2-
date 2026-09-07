import { useEffect, useId, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { ensureDailyLogin, fetchProgress } from "@/lib/unlocks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KEY = "streak_state_v1";
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

/* Canvas-free SVG tree: reliable in iOS/PWA and when many trees are visible. */
function TreeIllustration({ progress, variant = 0 }: { progress: number; variant?: number }) {
  const id = useId().replace(/:/g, "");
  const growth = Math.max(0.08, Math.min(1, progress));
  const palettes = [
    { light: "#a7e66a", mid: "#46a84f", dark: "#176538", edge: "#10552f" },
    { light: "#b6e76c", mid: "#58aa43", dark: "#216b35", edge: "#15592d" },
    { light: "#91df72", mid: "#369d58", dark: "#146044", edge: "#0d5138" },
  ];
  const palette = palettes[Math.abs(variant) % palettes.length];
  const applePositions = [
    [56, 72], [88, 48], [117, 72], [41, 103], [72, 98], [102, 97],
    [133, 104], [56, 130], [87, 122], [117, 132], [76, 151], [103, 151],
  ];
  const appleCount = Math.min(applePositions.length, Math.max(0, Math.ceil(progress * FULL_DAYS)));

  return (
    <svg viewBox="0 0 180 220" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`trunk-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c18043" />
          <stop offset="0.48" stopColor="#87502c" />
          <stop offset="1" stopColor="#4c291b" />
        </linearGradient>
        <radialGradient id={`leaf-${id}`} cx="34%" cy="21%" r="80%">
          <stop offset="0" stopColor={palette.light} />
          <stop offset="0.5" stopColor={palette.mid} />
          <stop offset="1" stopColor={palette.dark} />
        </radialGradient>
        <radialGradient id={`apple-${id}`} cx="30%" cy="23%" r="78%">
          <stop offset="0" stopColor="#ff9b89" />
          <stop offset="0.28" stopColor="#f04444" />
          <stop offset="1" stopColor="#a91528" />
        </radialGradient>
        <filter id={`shadow-${id}`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#123524" floodOpacity=".3" />
        </filter>
      </defs>
      <ellipse cx="90" cy="204" rx="55" ry="9" fill="#17452d" opacity=".2" />
      <g opacity=".75" fill="#4f9d43">
        <path d="M45 202q3-15 7 0q8-13 6 2z" />
        <path d="M124 204q4-17 7 0q9-12 6 2z" />
        <path d="M36 205q3-10 6 0z" />
      </g>
      <g
        style={{ transform: `scale(${growth})`, transformOrigin: "90px 199px", transition: "transform 900ms cubic-bezier(.22,1,.36,1)" }}
        filter={`url(#shadow-${id})`}
      >
        <path d="M70 200c8-32 10-60 8-91h24c-3 34 0 62 10 91-12 5-29 5-42 0z" fill={`url(#trunk-${id})`} stroke="#4d2a1b" strokeWidth="2" />
        <path d="M89 171c0-26-1-47-3-63M85 143 53 109M94 133l31-38M86 159l-35-22M97 159l34-25" fill="none" stroke="#714026" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 193c8-22 10-46 8-70" fill="none" stroke="#d19a5b" strokeWidth="3.5" strokeLinecap="round" opacity=".62" />
        <path d="M101 191c-4-17-3-34-2-48" fill="none" stroke="#4a2719" strokeWidth="2.2" strokeLinecap="round" opacity=".65" />
        <g transform="translate(-9 0)" fill={`url(#leaf-${id})`} stroke={palette.edge} strokeWidth="2.3" strokeLinejoin="round">
          <path d="M31 118c-4-18 6-34 23-40-3-19 12-35 31-34 8-20 37-23 49-5 20-2 34 14 32 32 17 8 22 30 11 44 8 20-8 40-29 40-9 18-33 23-49 11-15 13-40 6-45-13-20 0-32-18-23-35z" />
          <path d="M49 92c3-18 20-28 37-23 8-17 33-17 43 0 17-2 30 12 28 29 11 10 8 29-5 36-12-12-32-17-47-8-12-13-35-13-48-2-11-8-15-22-8-32z" opacity=".5" />
        </g>
        <g transform="translate(-9 0)" fill="none" stroke="#d8f6a8" strokeWidth="4" strokeLinecap="round" opacity=".5">
          <path d="M48 104c5-20 20-31 36-35" />
          <path d="M91 54c14-8 32-3 41 8" />
          <path d="M116 139c14-9 28-9 39-3" />
        </g>
        <g transform="translate(-9 0)" fill="#b8e779" opacity=".85">
          <ellipse cx="45" cy="123" rx="4" ry="8" transform="rotate(-38 45 123)" />
          <ellipse cx="68" cy="58" rx="4" ry="8" transform="rotate(44 68 58)" />
          <ellipse cx="145" cy="93" rx="4" ry="8" transform="rotate(35 145 93)" />
          <ellipse cx="132" cy="148" rx="4" ry="8" transform="rotate(55 132 148)" />
          <ellipse cx="55" cy="149" rx="4" ry="8" transform="rotate(-55 55 149)" />
        </g>
        {applePositions.slice(0, appleCount).map(([cx, cy], index) => (
          <g key={index} className="animate-apple-pop" style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <path d={`M${cx} ${cy - 6}q1-6 5-9`} fill="none" stroke="#4b2d1c" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx={cx + 6} cy={cy - 10} rx="4.5" ry="2.6" fill="#8fd14f" transform={`rotate(-25 ${cx + 6} ${cy - 10})`} />
            <circle cx={cx} cy={cy} r="7.2" fill={`url(#apple-${id})`} stroke="#8f1724" strokeWidth="1.5" />
            <ellipse cx={cx - 2.4} cy={cy - 2.6} rx="2" ry="2.8" fill="#ffd2ca" opacity=".9" />
          </g>
        ))}
      </g>
    </svg>
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
  const treeCount = Math.max(1, Math.ceil(Math.max(days, 1) / FULL_DAYS));
  const visibleTreeCount = Math.min(treeCount, 12);
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
          className={`relative overflow-hidden rounded-xl border border-emerald-500/15 bg-gradient-to-b from-sky-400/10 via-emerald-400/5 to-amber-700/10 ${compact ? (visibleTreeCount > 4 ? "h-48" : "h-36") : "h-72"}`}
        >
          <div aria-hidden="true" className="pointer-events-none absolute end-5 top-5 h-10 w-10 rounded-full bg-amber-300/50 shadow-[0_0_35px_rgba(251,191,36,0.35)]" />
          <div aria-hidden="true" className="pointer-events-none absolute start-[9%] top-[13%] h-5 w-20 rounded-full bg-white/35 blur-[1px] before:absolute before:-top-2 before:start-3 before:h-6 before:w-7 before:rounded-full before:bg-white/35 after:absolute after:-top-3 after:end-3 after:h-7 after:w-9 after:rounded-full after:bg-white/35" />
          <div aria-hidden="true" className="pointer-events-none absolute end-[18%] top-[28%] h-3 w-14 rounded-full bg-white/25 blur-[1px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-14 -start-16 h-36 w-[70%] rounded-[50%] bg-emerald-600/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -end-20 h-40 w-[72%] rounded-[50%] bg-lime-600/10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-emerald-700/25 via-emerald-600/10 to-transparent" />
          <div className={`relative z-10 grid h-full items-end justify-items-center ${compact
            ? visibleTreeCount > 8
              ? "grid-cols-4 grid-rows-3 gap-0 px-1 py-2"
              : visibleTreeCount > 4
                ? "grid-cols-4 grid-rows-2 gap-0 px-1 py-2"
                : "grid-cols-4 gap-0 px-1 pb-2 pt-3"
            : visibleTreeCount > 8
              ? "grid-cols-4 grid-rows-3 gap-x-1 gap-y-0 px-3 pb-2 pt-4 sm:px-6"
              : visibleTreeCount > 4
                ? "grid-cols-4 grid-rows-2 gap-x-1 gap-y-0 px-3 pb-2 pt-5 sm:px-6"
                : "grid-cols-4 gap-1 px-3 pb-3 pt-6 sm:px-7"
          }`}>
            {Array.from({ length: visibleTreeCount }, (_, index) => {
              const actualIndex = treeCount - visibleTreeCount + index;
              const treeProgress = Math.max(0, Math.min(1, (days - actualIndex * FULL_DAYS) / FULL_DAYS));
              const isActive = actualIndex === treeCount - 1;
              return (
                <div
                  key={`${actualIndex}-${isActive ? popKey : 0}`}
                  className={`${compact
                    ? visibleTreeCount > 8
                      ? "h-14 w-12"
                      : visibleTreeCount > 4
                        ? "h-20 w-16"
                        : "h-[5.25rem] w-[4.25rem]"
                    : visibleTreeCount > 8
                      ? "h-20 w-[4.25rem] sm:w-20"
                      : visibleTreeCount > 4
                        ? "h-24 w-20 sm:h-28 sm:w-24"
                        : "h-36 w-28 sm:h-40 sm:w-32"
                  } origin-bottom ${isActive ? "animate-apple-pop" : ""}`}
                  style={{
                    transform: `scale(${0.82 + (actualIndex % 3) * 0.06})`,
                    filter: isActive ? "none" : "saturate(.88)",
                  }}
                >
                  <TreeIllustration progress={treeProgress} variant={actualIndex} />
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
