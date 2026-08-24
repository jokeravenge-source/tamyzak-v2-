import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import { setPendingBattle, CHALLENGE_SUBJECTS, type ChallengeSubject } from "@/lib/battleInvite";

type Invite = {
  id: string;
  from_name: string;
  room_code: string;
  created_at: string;
  subject: ChallengeSubject;
  chapter: number;
  language: "ar" | "en";
  question_count: number;
};

const POLL_MS = 25000;
/** Invites older than this are stale — the challenger is long gone. */
const MAX_AGE_MS = 3 * 60 * 1000;

export default function ChallengeInviteWatcher({
  language,
  onAccept,
}: {
  language: AppLanguage;
  onAccept: () => void;
}) {
  const isAr = language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const since = new Date(Date.now() - MAX_AGE_MS).toISOString();
    const { data } = await supabase
      .from("battle_invites")
      .select("id, from_name, room_code, created_at, subject, chapter, language, question_count")
      .eq("to_user_id", u.user.id)
      .eq("status", "pending")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);
    setInvite((data?.[0] as Invite) ?? null);
  }, []);

  useEffect(() => {
    void check();
    const iv = window.setInterval(() => void check(), POLL_MS);
    const onVis = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [check]);

  const respond = async (accepted: boolean) => {
    if (!invite) return;
    setBusy(true);
    const { error } = await supabase
      .from("battle_invites")
      .update({ status: accepted ? "accepted" : "declined" })
      .eq("id", invite.id);
    setBusy(false);
    if (error) {
      toast.error(t("Could not respond", "تعذّر الرد"));
      return;
    }
    const code = invite.room_code;
    setInvite(null);
    if (accepted) {
      setPendingBattle({
        code,
        host: false,
        subject: invite.subject,
        chapter: invite.chapter,
        lang: invite.language,
        count: invite.question_count,
      });
      onAccept();
    } else {
      toast.success(t("Challenge declined", "تم رفض التحدي"));
    }
  };

  return (
    <AnimatePresence>
      {invite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          dir={isAr ? "rtl" : "ltr"}
        >
          <motion.div
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl border border-primary/40 bg-secondary/90 p-6 text-center shadow-[0_25px_70px_hsl(var(--primary)/0.35)]"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Swords className="h-8 w-8" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">
              {t("New challenge", "تحدٍ جديد")}
            </p>
            <h3 className="mt-2 text-xl font-bold text-foreground">
              {isAr ? `${invite.from_name} يتحداك في معركة!` : `${invite.from_name} challenged you to a battle!`}
            </h3>
            <div className="mt-3 space-y-1.5 rounded-2xl border border-border bg-card p-3 text-start text-sm">
              <p className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("Subject", "المادة")}</span>
                <b>{CHALLENGE_SUBJECTS.find((s) => s.key === invite.subject)?.[isAr ? "ar" : "en"] ?? invite.subject}</b>
              </p>
              <p className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("Curriculum", "المنهج")}</span>
                <b>{invite.language === "ar" ? t("Arabic", "عربي") : t("English", "إنجليزي")}</b>
              </p>
              <p className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("Chapter", "الفصل")}</span>
                <b>{invite.chapter}</b>
              </p>
              <p className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("Questions", "عدد الأسئلة")}</span>
                <b>{invite.question_count}</b>
              </p>
              <p className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("Room code", "رمز الغرفة")}</span>
                <span className="font-mono font-bold">{invite.room_code}</span>
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <Button onClick={() => respond(true)} disabled={busy} className="flex-1">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="me-1 h-4 w-4" /> {t("Accept", "قبول")}</>}
              </Button>
              <Button onClick={() => respond(false)} disabled={busy} variant="outline" className="flex-1">
                <X className="me-1 h-4 w-4" /> {t("Deny", "رفض")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
