import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, Clock3, Loader2, Swords, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { AppLanguage } from "@/components/LanguageGate";
import { remainingLabel, type StudyChallenge } from "@/lib/studyChallenges";

const POLL_MS = 30_000;

const COPY = {
  en: {
    eyebrow: "New friend challenge", title: "invited you to study",
    description: "Your saved Sessions study time will count toward this challenge.",
    duration: "Time remaining", participants: "Invited students",
    accept: "Accept challenge", decline: "Decline", accepted: "Challenge accepted",
    declined: "Invitation declined", failed: "Could not respond to this invitation",
  },
  ar: {
    eyebrow: "تحدي أصدقاء جديد", title: "دعاك لتحدي دراسة",
    description: "وقت دراستك المحفوظ داخل الجلسات راح ينحسب بهذا التحدي.",
    duration: "الوقت المتبقي", participants: "الطلاب المدعوون",
    accept: "قبول التحدي", decline: "رفض", accepted: "تم قبول التحدي",
    declined: "تم رفض الدعوة", failed: "تعذّر الرد على الدعوة",
  },
} as const;

export default function StudyChallengeInviteWatcher({ language }: { language: AppLanguage }) {
  const t = COPY[language];
  const [invite, setInvite] = useState<StudyChallenge | null>(null);
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setInvite(null); return; }
    const { data, error } = await supabase.rpc("get_my_study_challenges");
    if (error) return;
    const challenges = (Array.isArray(data) ? data : []) as unknown as StudyChallenge[];
    setInvite(challenges.find((challenge) =>
      challenge.myStatus === "pending" &&
      challenge.status === "active" &&
      new Date(challenge.endsAt).getTime() > Date.now()
    ) ?? null);
  }, []);

  useEffect(() => {
    void check();
    const interval = window.setInterval(() => void check(), POLL_MS);
    const onVisible = () => { if (document.visibilityState === "visible") void check(); };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check]);

  const respond = async (accept: boolean) => {
    if (!invite || busy) return;
    setBusy(true);
    const { error } = await supabase.rpc("respond_study_challenge", {
      _challenge_id: invite.id,
      _accept: accept,
    });
    setBusy(false);
    if (error) { toast.error(t.failed); return; }
    setInvite(null);
    toast.success(accept ? t.accepted : t.declined);
    window.setTimeout(() => void check(), 250);
  };

  if (!invite) return null;
  const accepted = invite.participants.filter((participant) => participant.status === "accepted").length;
  const pending = invite.participants.filter((participant) => participant.status === "pending").length;

  return (
    <div className="fixed inset-0 z-[98] grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md" dir={language === "ar" ? "rtl" : "ltr"} role="dialog" aria-modal="true" aria-labelledby="study-challenge-invite-title">
      <article className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-card shadow-[0_35px_110px_-35px_rgba(124,58,237,0.85)]">
        <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-6 text-white sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20"><Swords className="h-7 w-7" /></span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{t.eyebrow}</span>
          </div>
          <h2 id="study-challenge-invite-title" className="mt-6 text-2xl font-black leading-tight sm:text-3xl">{invite.creatorName} {t.title}</h2>
          <p className="mt-2 text-lg font-black text-cyan-100">{invite.title}</p>
        </div>

        <div className="p-6 sm:p-7">
          <p className="text-sm leading-7 text-muted-foreground">{t.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-secondary/45 p-3">
              <Clock3 className="h-4 w-4 text-violet-600" />
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{t.duration}</p>
              <p className="mt-0.5 text-sm font-black">{remainingLabel(invite.endsAt, language)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/45 p-3">
              <UsersRound className="h-4 w-4 text-cyan-600" />
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{t.participants}</p>
              <p className="mt-0.5 text-sm font-black">{accepted + pending}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <Button onClick={() => void respond(true)} disabled={busy} className="h-12 w-full gap-2 rounded-xl bg-violet-600 font-black hover:bg-violet-700">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{t.accept}
            </Button>
            <Button onClick={() => void respond(false)} disabled={busy} variant="ghost" className="h-11 w-full gap-2 rounded-xl text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />{t.decline}
            </Button>
          </div>
        </div>
        <CalendarDays aria-hidden="true" className="pointer-events-none absolute -bottom-8 -end-8 h-28 w-28 text-violet-500/[0.04]" />
      </article>
    </div>
  );
}
