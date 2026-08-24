import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RankStone, { rankFromPoints, RANK_LABELS } from "./RankStone";
import { CharacterAvatar, type CharacterTraits, type Gender } from "./CharacterAvatar";
import { Flame, Clock, Trophy, EyeOff, Swords, Loader2, Instagram, Send, Music2, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { newRoomCode, setPendingBattle } from "@/lib/battleInvite";

type Socials = { telegram?: string; instagram?: string; tiktok?: string; facebook?: string };

type Profile = {
  display_name: string;
  gender: Gender | null;
  character: Partial<CharacterTraits> | null;
  bio: string | null;
  socials: Socials | null;
  show_study_hours: boolean;
  lifetime_points: number;
  current_streak: number;
  longest_streak: number;
  total_seconds: number | null;
};

const SOCIAL_META: { key: keyof Socials; icon: typeof Instagram; url: (v: string) => string }[] = [
  { key: "telegram", icon: Send, url: (v) => `https://t.me/${v.replace(/^@/, "")}` },
  { key: "instagram", icon: Instagram, url: (v) => `https://instagram.com/${v.replace(/^@/, "")}` },
  { key: "tiktok", icon: Music2, url: (v) => `https://tiktok.com/@${v.replace(/^@/, "")}` },
  { key: "facebook", icon: Facebook, url: (v) => (/^https?:\/\//.test(v) ? v : `https://facebook.com/${v.replace(/^@/, "")}`) },
];

export default function StudentProfileDialog({
  userId,
  language,
  onClose,
  onChallengeAccepted,
}: {
  userId: string | null;
  language: "en" | "ar";
  onClose: () => void;
  /** Called after a challenge is sent so the app can open Live Battle as host. */
  onChallengeAccepted?: () => void;
}) {
  const isAr = language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const [data, setData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [challenging, setChallenging] = useState(false);

  useEffect(() => {
    if (!userId) { setData(null); return; }
    let alive = true;
    setLoading(true);
    supabase.auth.getUser().then(({ data: u }) => { if (alive) setMeId(u.user?.id ?? null); });
    supabase.rpc("public_student_profile", { _user_id: userId }).then(({ data: d }) => {
      if (!alive) return;
      setData((d as unknown as Profile) ?? null);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [userId]);

  const points = data?.lifetime_points ?? 0;
  const rank = rankFromPoints(points);
  const hoursHidden = data ? data.show_study_hours === false || data.total_seconds === null : false;
  const hours = ((data?.total_seconds ?? 0) / 3600).toFixed(1);
  const socials = (data?.socials ?? {}) as Socials;
  const socialLinks = SOCIAL_META.filter((s) => (socials[s.key] || "").trim());

  const challenge = async () => {
    if (!userId || !meId) return;
    setChallenging(true);
    try {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", meId)
        .maybeSingle();
      const code = newRoomCode();
      const { error } = await supabase.from("battle_invites").insert({
        from_user_id: meId,
        to_user_id: userId,
        from_name: (myProfile?.display_name || "Student").slice(0, 40),
        room_code: code,
        status: "pending",
      });
      if (error) throw error;
      setPendingBattle({ code, host: true });
      toast.success(t("Challenge sent — get ready!", "تم إرسال التحدي — استعد!"));
      onClose();
      onChallengeAccepted?.();
    } catch {
      toast.error(t("Could not send the challenge", "تعذّر إرسال التحدي"));
    } finally {
      setChallenging(false);
    }
  };

  return (
    <Dialog open={!!userId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{isAr ? "ملف الطالب" : "Student profile"}</DialogTitle>
        </DialogHeader>
        {loading || !data ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {isAr ? "جارٍ التحميل..." : "Loading..."}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CharacterAvatar gender={data.gender ?? "male"} traits={data.character ?? undefined} size={72} />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-foreground">{data.display_name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {RANK_LABELS[rank][language]}
                </p>
              </div>
              <RankStone rank={rank} size={56} className="ms-auto" />
            </div>

            {data.bio && (
              <p className="rounded-xl border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
                {data.bio}
              </p>
            )}

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ key, icon: Icon, url }) => {
                  const value = (socials[key] || "").trim();
                  return (
                    <a
                      key={key}
                      href={url(value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {value.replace(/^https?:\/\/(www\.)?/, "").slice(0, 22)}
                    </a>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-border bg-card p-3">
                <Trophy className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1 font-mono text-lg font-black tabular-nums">{points}</p>
                <p className="text-[11px] text-muted-foreground">{isAr ? "نقطة" : "points"}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <Flame className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1 font-mono text-lg font-black tabular-nums">{data.current_streak}</p>
                <p className="text-[11px] text-muted-foreground">{isAr ? "يوم متتالي" : "day streak"}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                {hoursHidden ? (
                  <>
                    <EyeOff className="mx-auto h-4 w-4 text-muted-foreground" />
                    <p className="mt-1 font-mono text-lg font-black">—</p>
                    <p className="text-[11px] text-muted-foreground">{isAr ? "مخفية" : "hidden"}</p>
                  </>
                ) : (
                  <>
                    <Clock className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-1 font-mono text-lg font-black tabular-nums">{hours}</p>
                    <p className="text-[11px] text-muted-foreground">{isAr ? "ساعة دراسة" : "hours studied"}</p>
                  </>
                )}
              </div>
            </div>

            {meId && meId !== userId && (
              <Button onClick={challenge} disabled={challenging} className="w-full">
                {challenging ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Swords className="me-1 h-4 w-4" /> {t("Challenge to a battle", "تحدَّه في معركة")}</>}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
