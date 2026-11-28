import { useEffect, useState } from "react";
import { ChartNoAxesColumnIncreasing, ChevronLeft, ChevronRight } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";
import { baghdadReportBounds, baghdadReportDate } from "../../../supabase/functions/_shared/baghdadReportDay";

type SessionsSummary = { userId: string; day: string; minutes: number; sessions: number } | { userId: string; day: string; error: true };

const copy = {
  en: { title: "My Daily Report", cta: "View report", empty: "No study sessions saved today yet.", guest: "Sign in to see today's study.", loading: "Loading today's study…", error: "Today's study summary is unavailable.", minutes: "focus min", session: "session", sessions: "sessions" },
  ar: { title: "تقريري اليومي", cta: "افتح التقرير", empty: "لهسه ماكو جلسات دراسة محفوظة اليوم.", guest: "سجّل دخولك حتى تشوف دراستك اليوم.", loading: "دا نحمل ملخص دراستك…", error: "ملخص دراسة اليوم مو متوفر هسه.", minutes: "دقيقة تركيز", session: "جلسة", sessions: "جلسات" },
} as const;

export default function HomeDailyReport({ language, userId, authLoading, onOpen }: { language: AppLanguage; userId?: string | null; authLoading?: boolean; onOpen: () => void }) {
  const [snapshot, setSnapshot] = useState<SessionsSummary | null>(null);
  const [day, setDay] = useState(() => baghdadReportDate());
  const t = copy[language];
  const Arrow = language === "ar" ? ChevronLeft : ChevronRight;
  const number = new Intl.NumberFormat(language === "ar" ? "ar-IQ" : "en");

  useEffect(() => {
    const updateDay = () => setDay(baghdadReportDate());
    window.addEventListener("focus", updateDay);
    document.addEventListener("visibilitychange", updateDay);
    const midnight = new Date(baghdadReportBounds(day).end).getTime();
    const timer = window.setTimeout(updateDay, Math.max(500, midnight - Date.now() + 50));
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", updateDay);
      document.removeEventListener("visibilitychange", updateDay);
    };
  }, [day]);

  useEffect(() => {
    if (!userId) return;
    let current = true;
    const { start, end } = baghdadReportBounds(day);
    void (async () => {
      try {
        const { data, error } = await supabase.from("study_sessions")
          .select("duration_seconds").eq("user_id", userId).gte("created_at", start).lt("created_at", end);
        if (!current) return;
        if (error || !data) setSnapshot({ userId, day, error: true });
        else setSnapshot({ userId, day, sessions: data.length, minutes: Math.round(data.reduce((sum, row) => sum + (row.duration_seconds ?? 0), 0) / 60) });
      } catch {
        if (current) setSnapshot({ userId, day, error: true });
      }
    })();
    return () => { current = false; };
  }, [day, userId]);

  const today = snapshot && snapshot.userId === userId && snapshot.day === day ? snapshot : null;
  const description = !userId ? (authLoading ? t.loading : t.guest) : !today ? t.loading : "error" in today ? t.error : !today.sessions ? t.empty
    : `${number.format(today.minutes)} ${t.minutes} · ${number.format(today.sessions)} ${today.sessions === 1 ? t.session : t.sessions}`;

  return (
    <button type="button" onClick={onOpen} aria-labelledby="home-daily-report-title" aria-describedby="home-daily-report-summary"
      className="flex min-h-16 w-full min-w-0 items-center gap-2.5 rounded-2xl border border-border bg-card px-3 py-2.5 text-start text-card-foreground shadow-sm transition-colors hover:bg-accent/50 sm:gap-3 sm:px-4">
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <ChartNoAxesColumnIncreasing className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span id="home-daily-report-title" className="block text-sm font-black sm:text-base">{t.title}</span>
        <span id="home-daily-report-summary" className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
      <span className="hidden shrink-0 text-xs font-bold text-primary min-[380px]:inline">{t.cta}</span>
      <Arrow aria-hidden="true" className="size-4 shrink-0 text-primary" />
    </button>
  );
}
