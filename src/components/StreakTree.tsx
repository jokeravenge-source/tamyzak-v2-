import { useEffect, useId, useRef, useState } from "react";
import confetti from "canvas-confetti";
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

/* Canvas-free SVG tree: reliable in iOS/PWA and when many trees are visible. */
function TreeIllustration({ progress }: { progress: number }) {
  const id = useId().replace(/:/g, "");
  const growth = Math.max(0.08, Math.min(1, progress));
  const applePositions = [
    [55, 70], [82, 48], [108, 70], [43, 98], [72, 91], [99, 100],
    [122, 98], [58, 123], [88, 120], [112, 128], [73, 145], [100, 149],
  ];
  const appleCount = Math.min(applePositions.length, Math.max(0, Math.ceil(progress * applePositions.length)));

  return (
    <svg viewBox="0 0 160 210" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`trunk-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9a5b2f" />
          <stop offset="1" stopColor="#5b321d" />
        </linearGradient>
        <radialGradient id={`leaf-${id}`} cx="35%" cy="25%" r="75%">
          <stop offset="0" stopColor="#86d34d" />
          <stop offset="0.52" stopColor="#3f9f42" />
          <stop offset="1" stopColor="#176534" />
        </radialGradient>
        <filter id={`shadow-${id}`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#123524" floodOpacity=".25" />
        </filter>
      </defs>
      <ellipse cx="80" cy="193" rx="48" ry="9" fill="#14532d" opacity=".18" />
      <g
        style={{ transform: `scale(${growth})`, transformOrigin: "80px 188px", transition: "transform 900ms cubic-bezier(.22,1,.36,1)" }}
        filter={`url(#shadow-${id})`}
      >
        <path d="M67 188c5-27 7-49 6-72l14-1c-1 27 2 49 8 73z" fill={`url(#trunk-${id})`} />
        <path d="M78 142 54 112M83 133l25-31M76 157l-28-19M87 157l29-21" fill="none" stroke="#6f4226" strokeWidth="7" strokeLinecap="round" />
        <g fill={`url(#leaf-${id})`} stroke="#126232" strokeWidth="2.2">
          <circle cx="48" cy="110" r="31" />
          <circle cx="66" cy="76" r="37" />
          <circle cx="96" cy="68" r="38" />
          <circle cx="120" cy="105" r="31" />
          <circle cx="86" cy="112" r="46" />
          <circle cx="63" cy="133" r="31" />
          <circle cx="106" cy="134" r="32" />
        </g>
        <g fill="none" stroke="#b8ef76" strokeWidth="3" strokeLinecap="round" opacity=".55">
          <path d="M48 94c8-12 16-17 25-18" />
          <path d="M90 50c10 0 19 4 27 12" />
          <path d="M96 117c11-8 20-9 28-6" />
        </g>
        {applePositions.slice(0, appleCount).map(([cx, cy], index) => (
          <g key={index} className="animate-apple-pop" style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <circle cx={cx} cy={cy} r="6.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
            <circle cx={cx - 2} cy={cy - 2} r="1.6" fill="#fecaca" />
            <path d={`M${cx} ${cy - 6}q2-6 6-7`} fill="none" stroke="#5b321d" strokeWidth="1.6" strokeLinecap="round" />
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
                  <TreeIllustration progress={treeProgress} />
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
