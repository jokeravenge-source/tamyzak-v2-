import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, Check, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import { setPendingBattle } from "@/lib/battleInvite";
import { BATTLE_INVITE_LIFETIME, respondToBattleChallenge, type BattleInvitation } from "@/lib/battleChallenges";

const subjects: Record<string, [string, string]> = {
  physics: ["الفيزياء", "Physics"], chemistry: ["الكيمياء", "Chemistry"], biology: ["الأحياء", "Biology"],
  math: ["الرياضيات", "Math"], english: ["الإنكليزي", "English"], arabic: ["العربية", "Arabic"],
  english_literature: ["الأدب الإنكليزي", "English literature"], french: ["الفرنسية", "French"], islamic: ["الإسلامية", "Islamic studies"],
};
export default function ChallengeInviteWatcher({ language, onAccept }: { language: AppLanguage; onAccept: () => void }) {
  const ar = language === "ar";
  const [userId, setUserId] = useState("");
  const [invite, setInvite] = useState<BattleInvitation | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const revision = useRef(0);
  const alive = useRef(true);
  const invalidate = useCallback(() => { revision.current++; }, []);
  const [locked, setLocked] = useState(!!(window as Window & { __battleLocked?: boolean }).__battleLocked);
  useEffect(() => {
    alive.current = true;
    void supabase.auth.getUser().then(({ data }) => { if (alive.current) setUserId(data.user?.id ?? ""); }).catch(() => {});
    const updateLock = (event: Event) => setLocked(!!(event as CustomEvent<{ locked: boolean }>).detail?.locked);
    window.addEventListener("app:battle-lock", updateLock);
    return () => { alive.current = false; invalidate(); window.removeEventListener("app:battle-lock", updateLock); };
  }, [invalidate]);
  const check = useCallback(async () => {
    if (!userId || document.visibilityState === "hidden" || busyRef.current) return;
    const version = ++revision.current;
    try {
      const { data, error } = await supabase.from("battle_invites")
        .select("id,from_name,room_code,created_at,subject,chapter,language,question_count")
        .eq("to_user_id", userId).eq("status", "pending")
        .gte("created_at", new Date(Date.now() - BATTLE_INVITE_LIFETIME).toISOString())
        .order("created_at", { ascending: false }).limit(1);
      if (!error && alive.current && version === revision.current) setInvite((data?.[0] as BattleInvitation) ?? null);
    } catch { /* Keep the current invitation until its expiry when the network is unavailable. */ }
  }, [userId]);
  useEffect(() => {
    if (!userId) return;
    void check();
    const channel = supabase.channel(`battle-invitations:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "battle_invites", filter: `to_user_id=eq.${userId}` }, () => { void check(); })
      .subscribe((status) => { if (status === "SUBSCRIBED") void check(); });
    const timer = setInterval(() => { void check(); }, 25000);
    const visible = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", visible);
    return () => { invalidate(); clearInterval(timer); document.removeEventListener("visibilitychange", visible); void supabase.removeChannel(channel); };
  }, [userId, check, invalidate]);
  useEffect(() => {
    if (!invite) return;
    const timer = setTimeout(() => setInvite((current) => current?.id === invite.id ? null : current), Math.max(0, new Date(invite.created_at).getTime() + BATTLE_INVITE_LIFETIME - Date.now()));
    return () => clearTimeout(timer);
  }, [invite]);
  const respond = async (accepted: boolean) => {
    if (!invite || !userId || busyRef.current || (accepted && locked)) return;
    const selected = invite;
    busyRef.current = true; setBusy(true); revision.current++;
    try {
      await respondToBattleChallenge(selected, userId, accepted);
      if (!alive.current) return;
      setInvite(null);
      if (accepted) {
        setPendingBattle({ code: selected.room_code, host: false, subject: selected.subject, chapter: selected.chapter, lang: selected.language, count: selected.question_count });
        onAccept();
        // The page can already be mounted; its initial mount effect will not run again.
        window.dispatchEvent(new Event("app:join-battle"));
      }
    } catch {
      if (alive.current) { setInvite(null); toast.error(ar ? "الدعوة انتهت أو أُلغيت. اطلب من صديقك يرسلها مرة ثانية." : "The invitation expired, was cancelled, or could not be accepted. Ask your friend to resend it."); }
    } finally {
      busyRef.current = false;
      if (alive.current) setBusy(false);
    }
  };
  if (!invite) return null;
  return <section role="region" aria-label={ar ? "دعوة تحدّي جديدة" : "New challenge invitation"} aria-live="polite" dir={ar ? "rtl" : "ltr"}
    className="fixed bottom-24 end-4 z-[95] w-[calc(100%-2rem)] max-w-sm space-y-3 rounded-2xl border border-primary/40 bg-card p-5 text-foreground shadow-2xl">
    <div className="flex items-start gap-3"><BellRing className="mt-1 h-6 w-6 shrink-0 text-primary" /><div className="min-w-0"><p className="text-xs font-bold text-primary">{ar ? "دعوة تحدّي جديدة" : "New challenge"}</p><h2 className="mt-1 break-words font-bold">{ar ? `${invite.from_name} يتحدّاك!` : `${invite.from_name} challenged you!`}</h2></div></div>
    <p className="text-sm leading-6 text-muted-foreground">{subjects[invite.subject]?.[ar ? 0 : 1] ?? invite.subject} · {invite.chapter ? (ar ? `الفصل ${invite.chapter}` : `Chapter ${invite.chapter}`) : (ar ? "كل الفصول" : "All chapters")} · {invite.question_count} {ar ? "أسئلة" : "questions"} · {invite.language === "ar" ? "عربي" : "English"}</p>
    {locked && <p className="text-xs text-muted-foreground">{ar ? "كمّل الجولة الحالية حتى تقبل التحدّي." : "Finish your current battle before accepting."}</p>}
    <div className="flex gap-2"><Button className="flex-1 gap-1" disabled={busy || locked} onClick={() => void respond(true)}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{ar ? "اقبل وادخل" : "Accept & join"}</Button><Button variant="outline" className="flex-1 gap-1" disabled={busy} onClick={() => void respond(false)}><X className="h-4 w-4" />{ar ? "رفض" : "Decline"}</Button></div>
  </section>;
}
