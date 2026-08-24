import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, EyeOff, Instagram, Send, Loader2, Music2, Facebook } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

type Socials = { telegram?: string; instagram?: string; tiktok?: string; facebook?: string };

const FIELDS: { key: keyof Socials; icon: typeof Instagram; label: string; ph: string }[] = [
  { key: "telegram", icon: Send, label: "Telegram", ph: "@username" },
  { key: "instagram", icon: Instagram, label: "Instagram", ph: "@username" },
  { key: "tiktok", icon: Music2, label: "TikTok", ph: "@username" },
  { key: "facebook", icon: Facebook, label: "Facebook", ph: "profile link or name" },
];

export default function ProfileDetailsCard({ language }: { language: AppLanguage }) {
  const isAr = language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState<Socials>({});
  const [showHours, setShowHours] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("bio, socials, show_study_hours")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (!alive) return;
      setBio((data?.bio as string) || "");
      setSocials(((data?.socials as Socials) ?? {}) || {});
      setShowHours((data?.show_study_hours as boolean) ?? true);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const persist = async (patch: Record<string, unknown>) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", u.user.id);
    if (error) throw error;
  };

  const toggleHours = async () => {
    const next = !showHours;
    setShowHours(next);
    try {
      await persist({ show_study_hours: next });
      toast.success(next ? t("Study hours are now visible", "ساعات دراستك ظاهرة الآن") : t("Study hours are now hidden", "تم إخفاء ساعات دراستك"));
    } catch {
      setShowHours(!next);
      toast.error(t("Could not save", "تعذّر الحفظ"));
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const clean: Socials = {};
      (Object.keys(socials) as (keyof Socials)[]).forEach((k) => {
        const v = (socials[k] || "").trim().slice(0, 120);
        if (v) clean[k] = v;
      });
      await persist({ bio: bio.trim().slice(0, 280) || null, socials: clean as never });
      toast.success(t("Profile saved", "تم حفظ الملف"));
    } catch {
      toast.error(t("Could not save", "تعذّر الحفظ"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-secondary/40 backdrop-blur-xl p-6 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-secondary/40 backdrop-blur-xl p-6 space-y-5">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {t("Your profile", "ملفك الشخصي")}
      </p>

      {/* Study hours visibility */}
      <button
        onClick={toggleHours}
        className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-start transition ${
          showHours
            ? "border-primary/50 bg-primary/10 shadow-[0_10px_30px_hsl(var(--primary)/0.25)]"
            : "border-white/10 bg-background/40"
        }`}
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${showHours ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
          {showHours ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-foreground">
            {t("Study hours on my profile", "ساعات الدراسة في ملفي")}
          </span>
          <span className="block text-xs text-muted-foreground">
            {showHours ? t("Visible to everyone", "ظاهرة للجميع") : t("Hidden from others", "مخفية عن الآخرين")}
          </span>
        </span>
        <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${showHours ? "bg-primary" : "bg-muted"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all ${showHours ? "left-[1.375rem]" : "left-0.5"}`} />
        </span>
      </button>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">{t("Bio", "نبذة عنك")}</label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 280))}
          maxLength={280}
          rows={3}
          placeholder={t("Tell others about you…", "اكتب نبذة قصيرة عنك…")}
        />
        <p className="text-[11px] text-muted-foreground">{bio.length}/280</p>
      </div>

      {/* Socials */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">{t("Social accounts", "حساباتك الاجتماعية")}</label>
        {FIELDS.map(({ key, icon: Icon, label, ph }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-background/40 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <Input
              value={socials[key] || ""}
              onChange={(e) => setSocials((s) => ({ ...s, [key]: e.target.value }))}
              placeholder={`${label} — ${ph}`}
              maxLength={120}
            />
          </div>
        ))}
      </div>

      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Save profile", "حفظ الملف")}
      </Button>
    </div>
  );
}
