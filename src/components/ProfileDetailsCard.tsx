import { useEffect, useId, useRef, useState } from "react";
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

export default function ProfileDetailsCard({ language, userId }: { language: AppLanguage; userId: string }) {
  const isAr = language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState<Socials>({});
  const [showHours, setShowHours] = useState(true);
  const [hoursSaving, setHoursSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<"load" | "save" | "session" | null>(null);
  const [retry, setRetry] = useState(0);
  const revision = useRef(0);
  const id = useId();
  const busy = saving || hoursSaving;
  const errorText = error === "session"
    ? t("Your session changed. Reopen your account to edit your profile.", "تغيّر حسابك. افتح مركز الحساب من جديد لتعديل ملفك.")
    : error === "load"
      ? t("Could not load your profile. Try again before editing.", "تعذّر تحميل ملفك. حاول مرة ثانية قبل التعديل.")
      : t("Could not save your profile. Your changes are still here; try again.", "تعذّر حفظ ملفك. تعديلاتك باقية، حاول مرة ثانية.");

  useEffect(() => {
    const request = ++revision.current;
    const current = () => revision.current === request;
    setLoading(true); setReady(false); setError(null); setSaving(false); setHoursSaving(false);
    setBio(""); setSocials({}); setShowHours(true);
    (async () => {
      try {
        const { data: u, error: authError } = await supabase.auth.getUser();
        if (!current()) return;
        if (authError || !userId || u.user?.id !== userId) { setError("session"); return; }
        const { data, error: readError } = await supabase.from("profiles")
          .select("bio, socials, show_study_hours").eq("user_id", userId).maybeSingle();
        if (!current()) return;
        if (readError || !data) throw new Error("profile_unavailable");
        const clean: Socials = {};
        const stored = data.socials as Socials | null;
        FIELDS.forEach(({ key }) => { if (typeof stored?.[key] === "string") clean[key] = stored[key]; });
        setBio(data.bio ?? ""); setSocials(clean); setShowHours(data.show_study_hours ?? true); setReady(true);
      } catch { if (current()) setError("load"); }
      finally { if (current()) setLoading(false); }
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user.id === userId) return;
      revision.current++; setLoading(false); setReady(false); setSaving(false); setHoursSaving(false);
      setBio(""); setSocials({}); setShowHours(true); setError("session");
    });
    return () => { revision.current++; listener.subscription.unsubscribe(); };
  }, [userId, retry]);

  const persist = async (patch: { bio?: string | null; socials?: Socials; show_study_hours?: boolean }, request: number) => {
    const { data: u } = await supabase.auth.getUser();
    if (u.user?.id !== userId || revision.current !== request) throw new Error("session_changed");
    const { data, error } = await supabase.from("profiles").update(patch)
      .eq("user_id", userId).select("user_id").single();
    if (error || data?.user_id !== userId) throw new Error("profile_not_saved");
  };

  const toggleHours = async () => {
    if (!ready || busy) return;
    const request = revision.current;
    const next = !showHours;
    setShowHours(next); setHoursSaving(true); setError(null);
    try {
      await persist({ show_study_hours: next }, request);
      if (revision.current !== request) return;
      toast.success(next ? t("Study hours are now visible", "ساعات دراستك ظاهرة الآن") : t("Study hours are now hidden", "تم إخفاء ساعات دراستك"));
    } catch {
      if (revision.current !== request) return;
      setShowHours(!next);
      setError("save");
      toast.error(t("Could not save", "تعذّر الحفظ"));
    } finally { if (revision.current === request) setHoursSaving(false); }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready || busy) return;
    const request = revision.current;
    setSaving(true); setError(null);
    try {
      const clean: Socials = {};
      (Object.keys(socials) as (keyof Socials)[]).forEach((k) => {
        const v = (socials[k] || "").trim().slice(0, 120);
        if (v) clean[k] = v;
      });
      const nextBio = bio.trim().slice(0, 280);
      await persist({ bio: nextBio || null, socials: clean }, request);
      if (revision.current !== request) return;
      setBio(nextBio); setSocials(clean);
      toast.success(t("Profile saved", "تم حفظ الملف"));
    } catch {
      if (revision.current !== request) return;
      setError("save");
      toast.error(t("Could not save", "تعذّر الحفظ"));
    } finally {
      if (revision.current === request) setSaving(false);
    }
  };

  if (loading) {
    return (
      <div role="status" aria-label={t("Loading profile", "جاري تحميل الملف")} className="rounded-3xl border border-border bg-card p-6 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section aria-labelledby={`${id}-heading`} dir={isAr ? "rtl" : "ltr"} className="min-w-0 rounded-[1.5rem] border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">{t("Edit profile", "تعديل الملف الشخصي")}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("Your bio and social links appear on your student profile.", "نبذتك وحساباتك الاجتماعية تظهر بملفك للطلاب.")}</p>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{errorText}</p>}
      {!ready ? <Button type="button" onClick={() => setRetry(value => value + 1)} className="mt-4">{t("Try again", "حاول مرة ثانية")}</Button> : <form onSubmit={save} className="mt-5 space-y-5">

      {/* Study hours visibility */}
      <button
        type="button"
        role="switch"
        aria-checked={showHours}
        disabled={busy}
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
        <label htmlFor={`${id}-bio`} className="text-sm font-semibold text-foreground">{t("Bio", "نبذة عنك")}</label>
        <Textarea
          id={`${id}-bio`}
          aria-describedby={`${id}-count`}
          disabled={busy}
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 280))}
          maxLength={280}
          rows={3}
          placeholder={t("Tell others about you…", "اكتب نبذة قصيرة عنك…")}
        />
        <p id={`${id}-count`} className="text-[11px] text-muted-foreground">{bio.length}/280</p>
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
              aria-label={label}
              disabled={busy}
              value={socials[key] || ""}
              onChange={(e) => setSocials((s) => ({ ...s, [key]: e.target.value }))}
              placeholder={`${label} — ${ph}`}
              maxLength={120}
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={busy} className="w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Save profile", "حفظ الملف")}
      </Button>
      </form>}
    </section>
  );
}
