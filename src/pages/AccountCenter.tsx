import { useEffect, useState, type ReactNode } from "react";
import { getSignupSource } from "@/lib/analytics";
import { notifyProfileCharacterChanged } from "@/lib/profileCharacter";
import { supabase } from "@/integrations/supabase/client";
import { User, Loader2, Save, Palette, MessageCircle, Settings, Lock, LogOut, Globe, ArrowLeft, ChevronDown, Sparkles, Eye, EyeOff, RotateCcw, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import { LANGUAGE_STORAGE_KEY } from "@/components/LanguageGate";
import type { MainMenuChoice } from "@/pages/MainMenu";

import { ThemePicker } from "@/components/ThemePicker";
import { ReferralCard } from "@/components/ReferralCard";
import { TelegramLinkCard } from "@/components/TelegramLinkCard";
import { PushNotificationsCard } from "@/components/PushNotificationsCard";
import ProfileDetailsCard from "@/components/ProfileDetailsCard";
import AccountOverview, { type AccountProgress } from "@/components/AccountOverview";
import KokiCharacterCard, { KOKI_VARIANT } from "@/components/KokiCharacterCard";
import strawHat from "@/assets/straw-hat.png.asset.json";
import redCap from "@/assets/red-cap-front.png.asset.json";
import pixelSunglasses from "@/assets/pixel-sunglasses.png.asset.json";
import goldChain from "@/assets/gold-chain.png.asset.json";
import { PET_DEFINITIONS, getSelectedPets, isPetUnlocked, type PetDefinition } from "@/lib/pets";
import { RANKS, rankFor } from "@/lib/points";

import { useSubscription } from "@/hooks/useSubscription";
import { openPremiumInstagram } from "@/lib/premium";
import { CUSTOMIZABLE_STUDY_TOOLS, saveHiddenStudyTools, useHiddenStudyTools } from "@/lib/studyToolVisibility";
import {
  CharacterAvatar,
  type Gender,
  type CharacterTraits,
  SKIN_COLORS,
  HAIR_COLORS,
  SHIRT_COLORS,
  MALE_HAIRSTYLES,
  FEMALE_HAIRSTYLES,
  getAvatarStyle,
  LIPSTICK_COLORS,
  EYESHADOW_COLORS,
  HEADBAND_COLORS,
  MALE_VARIANTS,
  FEMALE_VARIANTS,
  type CharacterVariant,
} from "@/components/CharacterAvatar";
import "./accountCenter.css";

const t = {
  en: { title: "My profile", username: "Username", save: "Save", saving: "Saving…", back: "Back", email: "Email", saved: "Profile updated", points: "Your Points", rank: "Rank", nextRank: "to next rank", theme: "Theme", support: "Support", supportDesc: "Contact us on Telegram for help or feedback.", character: "Your Character", male: "Male", female: "Female", pickGender: "Pick your character", skin: "Skin", hairStyle: "Hair style", hairColor: "Hair color", shirt: "Shirt", glasses: "Glasses", crown: "Crown", on: "On", off: "Off", randomize: "Randomize", premiumOnly: "Premium only", upgrade: "Upgrade to unlock", manageSub: "Manage subscription", openingPortal: "Opening…", makeupRoom: "Makeup Room", lipstick: "Lipstick", eyeshadow: "Eyeshadow", musclePack: "Muscle Pack", muscleDesc: "Show off those gains", headband: "Headband", accessories: "Accessories", pets: "Pets", cat: "Cat", necklaceGold: "Gold chain", necklacePearl: "Pearl necklace", none: "None", requestSent: "Name change request submitted — waiting for admin approval", pendingReview: "Pending admin approval", pendingHint: "Your requested name is awaiting admin review.", requestName: "Request name change", noChange: "No change to save", signOut: "Sign out", changeLanguage: "Change language", account: "Account", navBar: "Navigation bar", navBarDesc: "Choose how the bottom nav behaves on every page.", navAlways: "Always visible", navAutoHide: "Hide on scroll down", navSaved: "Navigation preference saved" },
  ar: { title: "ملفي الشخصي", username: "اسم المستخدم", save: "حفظ", saving: "جارٍ الحفظ…", back: "رجوع", email: "البريد الإلكتروني", saved: "تم تحديث الملف", points: "نقاطك", rank: "المرتبة", nextRank: "للمرتبة التالية", theme: "الثيم", support: "الدعم", supportDesc: "تواصل معنا على تيليجرام للمساعدة أو الملاحظات.", character: "شخصيتك", male: "ذكر", female: "أنثى", pickGender: "اختر شخصيتك", skin: "لون البشرة", hairStyle: "تسريحة الشعر", hairColor: "لون الشعر", shirt: "القميص", glasses: "النظارات", crown: "تاج", on: "نعم", off: "لا", randomize: "عشوائي", premiumOnly: "للبريميوم فقط", upgrade: "رقّ لفتح هذه الميزة", manageSub: "إدارة الاشتراك", openingPortal: "جاري الفتح…", makeupRoom: "غرفة المكياج", lipstick: "أحمر الشفاه", eyeshadow: "ظلال العيون", musclePack: "حزمة العضلات", muscleDesc: "أظهر عضلاتك", headband: "عصابة الرأس", accessories: "إكسسوارات", pets: "الحيوانات", cat: "قطة", necklaceGold: "سلسلة ذهبية", necklacePearl: "عقد لؤلؤ", none: "بدون", requestSent: "تم إرسال طلب تغيير الاسم — بانتظار موافقة الإدارة", pendingReview: "بانتظار موافقة الإدارة", pendingHint: "اسمك المطلوب قيد المراجعة من قبل الإدارة.", requestName: "طلب تغيير الاسم", noChange: "لا يوجد تغيير للحفظ", signOut: "تسجيل الخروج", changeLanguage: "تغيير اللغة", account: "الحساب", navBar: "شريط التنقل", navBarDesc: "اختر طريقة ظهور شريط التنقل السفلي في كل الصفحات.", navAlways: "ظاهر دائماً", navAutoHide: "إخفاء عند التمرير للأسفل", navSaved: "تم حفظ تفضيل شريط التنقل" },
} as const;

const uxText = {
  en: {
    personalInfo: "Personal information",
    personalInfoDesc: "Review your email and update the name shown to other students.",
    customize: "Customize your character",
    customizeDesc: "Change your character's appearance and accessories.",
    preferences: "App & study settings",
    services: "Notifications, invites & support",
  },
  ar: {
    personalInfo: "المعلومات الشخصية",
    personalInfoDesc: "راجع بريدك وحدّث الاسم الذي يظهر للطلاب الآخرين.",
    customize: "تخصيص شخصيتك",
    customizeDesc: "غيّر مظهر الشخصية وإكسسواراتها.",
    preferences: "إعدادات التطبيق والدراسة",
    services: "التنبيهات والدعوات والدعم",
  },
} as const;

const HAIR_LABELS: Record<string, { en: string; ar: string }> = {
  short: { en: "Short", ar: "قصير" },
  buzz: { en: "Buzz", ar: "حلاقة" },
  spiky: { en: "Spiky", ar: "منتصب" },
  curly: { en: "Curly", ar: "مجعد" },
  fade: { en: "Fade", ar: "متدرج" },
  messy: { en: "Messy", ar: "فوضوي" },
  long: { en: "Long", ar: "طويل" },
  bun: { en: "Bun", ar: "كعكة" },
  ponytail: { en: "Ponytail", ar: "ذيل حصان" },
  bob: { en: "Bob", ar: "بوب" },
  curly_long: { en: "Curly Long", ar: "مجعد طويل" },
  braids: { en: "Braids", ar: "ضفائر" },
};

function AccountPanel({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description?: string; children: ReactNode }) {
  return (
    <details className="group overflow-hidden rounded-[1.5rem] border border-border/80 bg-card text-card-foreground shadow-sm">
      <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/45 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring group-open:bg-muted/35 [&::-webkit-details-marker]:hidden">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black leading-snug">{title}</span>
          {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>}
        </span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 border-t border-border px-3 py-4 sm:px-4">{children}</div>
    </details>
  );
}

const AccountCenter = ({
  language,
  onBack,
  onNav,
  onChangeLanguage,
}: {
  language: AppLanguage;
  onBack: () => void;
  onNav?: (c: MainMenuChoice) => void;
  onChangeLanguage?: () => void;
}) => {
  const text = t[language];
  const ux = uxText[language];
  const [name, setName] = useState("");
  const hiddenStudyTools = useHiddenStudyTools();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [traits, setTraits] = useState<CharacterTraits | null>(null);
  const [progress, setProgress] = useState<AccountProgress | null>(null);
  const [characterTab, setCharacterTab] = useState<"appearance" | "hats" | "accessories" | "pets">("appearance");
  const { isPremium } = useSubscription();
  const [savedName, setSavedName] = useState("");
  const [pendingRequest, setPendingRequest] = useState<{ id: string; requested_name: string } | null>(null);

  const tryPremium = (apply: () => void) => {
    if (!isPremium) {
      toast.error(text.upgrade, {
        action: { label: language === "ar" ? "تواصل عبر إنستغرام" : "Contact on Instagram", onClick: openPremiumInstagram },
      });
      return;
    }
    apply();
  };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      setUserId(u.user.id);
      const { data: p } = await supabase.from("profiles").select("display_name, gender, character").eq("user_id", u.user.id).maybeSingle();
      setName(p?.display_name ?? "");
      setSavedName(p?.display_name ?? "");
      setGender((p?.gender as Gender) ?? null);
      setTraits(((p as any)?.character as CharacterTraits) ?? null);
      const { data: publicProfile } = await supabase.rpc("public_student_profile", { _user_id: u.user.id });
      const stats = publicProfile as { lifetime_points?: number; current_streak?: number } | null;
      if (typeof stats?.lifetime_points === "number" && Number.isFinite(stats.lifetime_points)) {
        const streak = stats.current_streak;
        setProgress({ lifetimePoints: stats.lifetime_points, currentStreak: typeof streak === "number" && Number.isFinite(streak) ? streak : null });
      }
      const { data: pend } = await supabase
        .from("username_requests")
        .select("id, requested_name")
        .eq("user_id", u.user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (pend) setPendingRequest(pend as any);
      setLoading(false);
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const trimmed = name.trim();
      const { data: existing } = await supabase.from("profiles").select("id, display_name").eq("user_id", u.user.id).maybeSingle();
      const currentName = (existing as any)?.display_name ?? "";
      const nameChanged = trimmed !== currentName;

      if (!existing) {
        // First-time profile: create directly (no approval needed for initial name)
        const { error } = await supabase.from("profiles").insert({ user_id: u.user.id, display_name: trimmed, gender, source: getSignupSource() });
        if (error) throw error;
        setSavedName(trimmed);
        localStorage.setItem("app_display_name_v1", trimmed);
        window.dispatchEvent(new Event("app:username-changed"));
        toast.success(text.saved);
      } else if (nameChanged) {
        // Submit a request; do NOT change the profile name yet
        const { data: req, error } = await supabase
          .from("username_requests")
          .insert({ user_id: u.user.id, current_name: currentName, requested_name: trimmed, status: "pending" })
          .select("id, requested_name")
          .single();
        if (error) throw error;
        setPendingRequest(req as any);
        setName(currentName);
        toast.success(text.requestSent);
      } else {
        toast.message(text.noChange);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    } finally { setSaving(false); }
  };

  const pickGender = async (g: Gender) => {
    const base = getAvatarStyle(userId || "anon", g);
    const next = { ...(traits ?? base), ...(g === "male" && traits?.variant === KOKI_VARIANT ? { variant: 1 as const } : {}) };
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: existing } = await supabase.from("profiles").select("id").eq("user_id", u.user.id).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("profiles").update({ gender: g, character: next as any }).eq("user_id", u.user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert({ user_id: u.user.id, display_name: name.trim() || "Student", gender: g, character: next as any, source: getSignupSource() });
        if (error) throw error;
      }
      setGender(g);
      setTraits(next);
      notifyProfileCharacterChanged(u.user.id);
    } catch {
      toast.error(language === "ar" ? "تعذّر حفظ الشخصية. جرّب مرة ثانية." : "Could not save your character. Please try again.");
    }
  };

  const updateTraits = async (patch: Partial<CharacterTraits>) => {
    const next: CharacterTraits = {
      ...(traits ?? getAvatarStyle(userId || "anon", gender ?? "male")),
      ...patch,
    };
    const previous = traits;
    setTraits(next);
    try {
      if (!userId) return;
      const { error } = await supabase.from("profiles").update({ character: next as any }).eq("user_id", userId);
      if (error) throw error;
      notifyProfileCharacterChanged(userId);
    } catch {
      setTraits(current => current === next ? previous : current);
      toast.error(language === "ar" ? "تعذّر حفظ الشخصية. جرّب مرة ثانية." : "Could not save your character. Please try again.");
    }
  };

  const selectKoki = async () => {
    if (!userId) throw new Error("Not signed in");
    const next = { ...(traits ?? getAvatarStyle(userId, "female")), variant: KOKI_VARIANT };
    const { data, error } = await supabase.from("profiles").update({ gender: "female", character: next as any }).eq("user_id", userId).select("user_id").single();
    if (error) throw error;
    if (data?.user_id !== userId) throw new Error("Profile was not saved");
    setGender("female");
    setTraits(next);
    notifyProfileCharacterChanged(userId);
  };

  // Auto-give Premium users the crown by default — but only once, so if they
  // toggle it off it stays off across reloads.
  useEffect(() => {
    if (!userId || !isPremium || !gender) return;
    const flagKey = `crown-defaulted:${userId}`;
    if (localStorage.getItem(flagKey)) return;
    if (traits?.accessory === "crown") { localStorage.setItem(flagKey, "1"); return; }
    updateTraits({ accessory: "crown" });
    localStorage.setItem(flagKey, "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, userId, gender]);

  const randomize = () => {
    if (!gender) return;
    const seed = String(Date.now()) + Math.random();
    updateTraits(getAvatarStyle(seed, gender));
  };

  const effective: CharacterTraits | null = gender
    ? { ...getAvatarStyle(userId || "anon", gender), ...(traits ?? {}) }
    : null;
  const hairOptions = gender === "female" ? FEMALE_HAIRSTYLES : MALE_HAIRSTYLES;
  const currentRank = rankFor(progress?.lifetimePoints ?? 0);
  const selectedPets = getSelectedPets(effective);

  const togglePet = (pet: PetDefinition) => {
    if (!isPetUnlocked(pet, currentRank.key)) {
      const requiredRank = RANKS.find((rank) => rank.key === pet.rank);
      toast.error(language === "ar" ? `تُفتح عند رتبة ${requiredRank?.label.ar ?? ""}` : `Unlocks at ${requiredRank?.label.en ?? ""} rank`);
      return;
    }
    if (selectedPets.includes(pet.key)) {
      updateTraits({ pets: selectedPets.filter((key) => key !== pet.key), pet: null });
      return;
    }
    if (selectedPets.length >= 3) {
      toast.error(language === "ar" ? "يمكنك اختيار 3 حيوانات كحد أقصى" : "You can select up to 3 pets");
      return;
    }
    updateTraits({ pets: [...selectedPets, pet.key], pet: null });
  };


  return (
    <main className="account-profile min-h-screen px-3.5 pb-32 text-foreground sm:px-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[67rem] space-y-4 pt-5 sm:space-y-5 sm:pt-8">
        <header className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            aria-label={text.back}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <ArrowLeft className={`w-4 h-4 ${language === "ar" ? "rotate-180" : ""}`} />
          </button>
          <h1 className="text-[1.65rem] font-black leading-tight tracking-tight sm:text-4xl">{text.title}</h1>
        </header>

        {!loading && userId && <AccountOverview
          language={language}
          name={savedName}
          userId={userId}
          gender={gender}
          traits={effective}
          rank={currentRank}
          progress={progress}
          premium={isPremium}
          onLeaderboard={onNav ? () => onNav("leaderboard") : undefined}
        />}

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-5">
          <div className="min-w-0 space-y-4">
            <section aria-labelledby="account-personal-info" className="min-w-0 rounded-[1.5rem] border border-border/80 bg-card p-4 text-card-foreground shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <User aria-hidden="true" className="size-5" />
                </div>
                <div className="min-w-0">
                  <h2 id="account-personal-info" className="text-lg font-black leading-snug">{ux.personalInfo}</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{ux.personalInfoDesc}</p>
                </div>
              </div>

              {loading ? (
                <div role="status" aria-label={language === "ar" ? "جارٍ تحميل الملف" : "Loading account"} className="flex justify-center py-6">
                  <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={save} className="grid gap-3.5 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor="account-email" className="text-sm font-bold">{text.email}</label>
                    <input id="account-email" value={email} dir="ltr" disabled className="mt-1.5 h-11 w-full rounded-xl border border-border bg-muted/45 px-3 text-sm text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="account-username" className="text-sm font-bold">{text.username}</label>
                    <input
                      id="account-username"
                      dir="auto"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={40}
                      required
                      disabled={!!pendingRequest}
                      className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:bg-muted/45 disabled:text-muted-foreground"
                    />
                  </div>
                  {pendingRequest && <div className="flex min-w-0 items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200 sm:col-span-2">
                    <Lock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    <p className="min-w-0">{text.pendingReview} <bdi className="font-bold [overflow-wrap:anywhere]">{pendingRequest.requested_name}</bdi></p>
                  </div>}
                  <button type="submit" disabled={saving || !name.trim() || !!pendingRequest} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 sm:col-span-2 sm:w-auto sm:justify-self-end">
                    {saving ? <><Loader2 aria-hidden="true" className="size-4 animate-spin" />{text.saving}</> : <><Save aria-hidden="true" className="size-4" />{name.trim() && name.trim() !== savedName ? text.requestName : text.save}</>}
                  </button>
                </form>
              )}
            </section>
            {!loading && userId && <ProfileDetailsCard key={userId} userId={userId} language={language} />}
          </div>

          <div className="min-w-0 space-y-4">
        {!loading && (
          <AccountPanel icon={Sparkles} title={ux.customize} description={ux.customizeDesc}>
            {gender ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex max-w-full justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-primary/10 to-muted/25 p-3">
                    <CharacterAvatar seed={userId} gender={gender} traits={effective} size={218} />
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => pickGender("male")}
                        className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition ${gender === "male" ? "bg-primary text-primary-foreground border-primary" : "border-white/10 bg-background/40 text-muted-foreground hover:text-foreground"}`}
                      >{text.male}</button>
                      <button
                        onClick={() => pickGender("female")}
                        className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition ${gender === "female" ? "bg-primary text-primary-foreground border-primary" : "border-white/10 bg-background/40 text-muted-foreground hover:text-foreground"}`}
                      >{text.female}</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/30 p-1.5 min-[375px]:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => setCharacterTab("appearance")}
                    aria-pressed={characterTab === "appearance"}
                    className={`h-10 rounded-xl text-xs font-bold transition ${characterTab === "appearance" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {language === "ar" ? "المظهر" : "Appearance"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCharacterTab("hats")}
                    aria-pressed={characterTab === "hats"}
                    className={`h-10 rounded-xl text-xs font-bold transition ${characterTab === "hats" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {language === "ar" ? "القبعات" : "Hats"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCharacterTab("accessories")}
                    aria-pressed={characterTab === "accessories"}
                    className={`h-10 rounded-xl text-xs font-bold transition ${characterTab === "accessories" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {text.accessories}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCharacterTab("pets")}
                    aria-pressed={characterTab === "pets"}
                    className={`h-10 rounded-xl text-[10px] font-bold transition sm:text-xs ${characterTab === "pets" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {text.pets}
                  </button>
                </div>

                {characterTab === "appearance" ? (
                  <>

                {/* Skin */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">{text.skin}</p>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateTraits({ skin: c })}
                        className={`w-8 h-8 rounded-full border-2 transition ${effective?.skin === c ? "border-primary scale-110" : "border-white/20 hover:border-white/40"}`}
                        style={{ backgroundColor: c }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Character style */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">{language === "ar" ? "الشخصية" : "Character"}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(gender === "female" ? FEMALE_VARIANTS : MALE_VARIANTS).map((src, i) => {
                      const v = (i + 1) as CharacterVariant;
                      const active = (effective?.variant ?? 1) === v;
                      return (
                        <button
                          key={i}
                          onClick={() => updateTraits({ variant: v })}
                          className={`aspect-square rounded-xl border-2 bg-background/40 transition flex items-center justify-center overflow-hidden ${active ? "border-primary scale-105" : "border-white/10 hover:border-white/30"}`}
                          aria-label={`Style ${v}`}
                        >
                          <img src={src} alt="" className="w-full h-full object-contain" draggable={false} />
                        </button>
                      );
                    })}
                  </div>
                  <KokiCharacterCard key={userId} userId={userId} language={language}
                    selected={gender === "female" && effective?.variant === KOKI_VARIANT} onSelect={selectKoki} />
                </div>

                {/* Crown accessory — Premium only */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                    👑 {text.crown}
                    {!isPremium && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-400/40 text-amber-300">
                        {text.premiumOnly}
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => tryPremium(() => updateTraits({ accessory: "crown" }))}
                      className={`flex-1 h-10 rounded-lg text-xs font-semibold border transition ${effective?.accessory === "crown" ? "bg-amber-500/20 border-amber-400 text-amber-200" : "border-white/10 bg-background/40 text-muted-foreground hover:text-foreground"}`}
                    >{text.on}</button>
                    <button
                      onClick={() => tryPremium(() => updateTraits({ accessory: null }))}
                      className={`flex-1 h-10 rounded-lg text-xs font-semibold border transition ${effective?.accessory !== "crown" ? "bg-primary/15 border-primary text-primary" : "border-white/10 bg-background/40 text-muted-foreground hover:text-foreground"}`}
                    >{text.off}</button>
                  </div>
                </div>
                  </>
                ) : characterTab === "hats" ? (
                  <div>
                    <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {language === "ar" ? "اختر قبعتك" : "Choose your hat"}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => updateTraits({ hat: null })}
                        className={`aspect-square rounded-2xl border-2 bg-background/40 p-3 text-xs font-bold transition ${!effective?.hat ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/30"}`}
                      >
                        {text.none}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTraits({ hat: "straw", accessory: null })}
                        className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-background/40 p-2 transition ${effective?.hat === "straw" ? "border-primary bg-primary/10 scale-[1.03]" : "border-white/10 hover:border-white/30"}`}
                        aria-label={language === "ar" ? "قبعة القش" : "Straw hat"}
                      >
                        <img src={strawHat.url} alt="" className="h-full w-full object-contain [image-rendering:pixelated]" draggable={false} />
                        <span className="absolute inset-x-1 bottom-1 rounded-lg bg-background/80 px-1 py-1 text-[10px] font-bold text-foreground backdrop-blur-sm">
                          {language === "ar" ? "قبعة القش" : "Straw hat"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTraits({ hat: "red-cap", accessory: null })}
                        className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-background/40 p-2 transition ${effective?.hat === "red-cap" ? "border-primary bg-primary/10 scale-[1.03]" : "border-white/10 hover:border-white/30"}`}
                        aria-label={language === "ar" ? "القبعة الحمراء" : "Red cap"}
                      >
                        <img src={redCap.url} alt="" className="h-full w-full object-contain [image-rendering:pixelated]" draggable={false} />
                        <span className="absolute inset-x-1 bottom-1 rounded-lg bg-background/80 px-1 py-1 text-[10px] font-bold text-foreground backdrop-blur-sm">
                          {language === "ar" ? "القبعة الحمراء" : "Red cap"}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : characterTab === "accessories" ? (
                  <div className="space-y-5">
                    <div>
                      <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {text.glasses}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (effective?.accessory === "glasses") updateTraits({ accessory: null });
                          }}
                          className={`aspect-square rounded-2xl border-2 bg-background/40 p-3 text-xs font-bold transition ${effective?.accessory !== "glasses" ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/30"}`}
                        >
                          {text.none}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTraits({ accessory: "glasses" })}
                          className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-background/40 p-3 transition ${effective?.accessory === "glasses" ? "border-primary bg-primary/10 scale-[1.03]" : "border-white/10 hover:border-white/30"}`}
                          aria-label={text.glasses}
                        >
                          <img src={pixelSunglasses.url} alt="" className="h-full w-full object-contain [image-rendering:pixelated]" draggable={false} />
                          <span className="absolute inset-x-1 bottom-1 rounded-lg bg-background/80 px-1 py-1 text-[10px] font-bold text-foreground backdrop-blur-sm">
                            {text.glasses}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {language === "ar" ? "القلادات" : "Necklaces"}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => updateTraits({ chain: null })}
                          className={`aspect-square rounded-2xl border-2 bg-background/40 p-3 text-xs font-bold transition ${!effective?.chain ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/30"}`}
                        >
                          {text.none}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTraits({ chain: "gold" })}
                          className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-background/40 p-3 transition ${effective?.chain === "gold" ? "border-primary bg-primary/10 scale-[1.03]" : "border-white/10 hover:border-white/30"}`}
                          aria-label={text.necklaceGold}
                        >
                          <img src={goldChain.url} alt="" className="h-full w-full object-contain [image-rendering:pixelated]" draggable={false} />
                          <span className="absolute inset-x-1 bottom-1 rounded-lg bg-background/80 px-1 py-1 text-[10px] font-bold text-foreground backdrop-blur-sm">
                            {text.necklaceGold}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/40 p-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">{language === "ar" ? "إظهار الحيوانات في ملفك" : "Show pets on your profile"}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{language === "ar" ? `${selectedPets.length} من 3 مختارة` : `${selectedPets.length} of 3 selected`}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateTraits({ showPets: effective?.showPets === false })}
                        aria-pressed={effective?.showPets !== false}
                        className={`inline-flex h-10 min-w-20 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${effective?.showPets !== false ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground"}`}
                      >
                        {effective?.showPets !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        {effective?.showPets !== false ? text.on : text.off}
                      </button>
                    </div>

                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {language === "ar" ? "اختر حتى 3 حيوانات — تُفتح حسب الرتبة" : "Choose up to 3 pets — unlocked by rank"}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {PET_DEFINITIONS.map((pet) => {
                        const unlocked = isPetUnlocked(pet, currentRank.key);
                        const selected = selectedPets.includes(pet.key);
                        const requiredRank = RANKS.find((rank) => rank.key === pet.rank);
                        return (
                          <button
                            key={pet.key}
                            type="button"
                            onClick={() => togglePet(pet)}
                            aria-pressed={selected}
                            className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-background/40 p-2 transition ${selected ? "scale-[1.03] border-primary bg-primary/10" : unlocked ? "border-white/10 hover:border-white/30" : "border-white/5 opacity-55"}`}
                          >
                            <img src={pet.image} alt="" className={`h-full w-full object-contain [image-rendering:pixelated] ${unlocked ? "" : "grayscale"}`} draggable={false} />
                            {!unlocked && (
                              <span className="absolute end-1 top-1 rounded-full bg-background/85 p-1 text-muted-foreground">
                                <Lock className="h-3 w-3" />
                              </span>
                            )}
                            <span className="absolute inset-x-1 bottom-1 rounded-lg bg-background/85 px-1 py-1 text-[9px] font-bold text-foreground backdrop-blur-sm">
                              {pet.name[language]}
                              {!unlocked && <span className="block text-[8px] text-muted-foreground">{requiredRank?.label[language]}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">{text.pickGender}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => pickGender("male")}
                    className="rounded-2xl border border-white/10 bg-background/40 p-4 hover:border-primary/60 transition flex flex-col items-center gap-2"
                  >
                    <CharacterAvatar seed={userId} gender="male" size={80} />
                    <span className="text-sm font-semibold">{text.male}</span>
                  </button>
                  <button
                    onClick={() => pickGender("female")}
                    className="rounded-2xl border border-white/10 bg-background/40 p-4 hover:border-primary/60 transition flex flex-col items-center gap-2"
                  >
                    <CharacterAvatar seed={userId} gender="female" size={80} />
                    <span className="text-sm font-semibold">{text.female}</span>
                  </button>
                </div>
              </div>
            )}
          </AccountPanel>
        )}

        <AccountPanel icon={Palette} title={ux.preferences}>
            <div className="space-y-3 rounded-2xl border border-border bg-muted/25 p-3.5 sm:p-4">
              <h3 className="text-sm font-semibold">{text.theme}</h3>
              <ThemePicker language={language} variant="inline" />
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-muted/25 p-3.5 sm:p-4">
              <div className="flex flex-wrap items-start gap-2.5">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/15 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-[8rem] flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {language === "ar" ? "تخصيص أدوات الدراسة" : "Customize study tools"}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {language === "ar"
                      ? "اخفِ الأدوات التي لا تحتاجها. إذا لم تُخفِ أي أداة فستظهر جميع الأدوات."
                      : "Hide tools you do not need. When none are hidden, every tool is shown."}
                  </p>
                </div>
                {hiddenStudyTools.size > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      saveHiddenStudyTools(new Set());
                      toast.success(language === "ar" ? "تم إظهار جميع الأدوات" : "All tools are now visible");
                    }}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {language === "ar" ? "إظهار الكل" : "Show all"}
                  </button>
                )}
              </div>

              <div className="grid gap-2">
                {CUSTOMIZABLE_STUDY_TOOLS.map((tool) => {
                  const hidden = hiddenStudyTools.has(tool.key);
                  return (
                    <div key={tool.key} className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border bg-background/60 p-2.5">
                      <span className={`min-w-0 truncate text-sm font-medium ${hidden ? "text-muted-foreground" : "text-foreground"}`}>
                        {language === "ar" ? tool.ar : tool.en}
                      </span>
                      <button
                        type="button"
                        aria-pressed={!hidden}
                        onClick={() => {
                          const next = new Set(hiddenStudyTools);
                          if (hidden) next.delete(tool.key);
                          else next.add(tool.key);
                          saveHiddenStudyTools(next);
                        }}
                        className={`inline-flex h-9 min-w-[88px] shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                          hidden
                            ? "border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            : "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        }`}
                      >
                        {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {hidden
                          ? (language === "ar" ? "مخفي" : "Hidden")
                          : (language === "ar" ? "ظاهر" : "Shown")}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-border bg-muted/25 p-3.5 sm:p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Settings aria-hidden="true" className="size-4" /></span>
                <h3 className="text-sm font-bold">{text.account}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
                  onChangeLanguage?.();
                }}
                className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background/60 px-3 text-start text-sm text-foreground transition-colors hover:border-primary/40"
              >
                <span className="inline-flex items-center gap-2"><Globe aria-hidden="true" className="size-4 text-primary" />{text.changeLanguage}</span>
                <span className="text-xs uppercase text-muted-foreground">{language}</span>
              </button>
              <button
                type="button"
                onClick={async () => { await supabase.auth.signOut(); }}
                className="inline-flex min-h-11 w-full items-center gap-2 rounded-xl border border-destructive/30 px-3 text-start text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut aria-hidden="true" className="size-4" />{text.signOut}
              </button>
            </div>
        </AccountPanel>

        <AccountPanel icon={MessageCircle} title={ux.services}>
            <ReferralCard language={language} />
            <PushNotificationsCard language={language} />

            <a
              href="https://t.me/ias404"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-border bg-muted/25 p-3.5 transition-colors hover:border-primary/40 sm:p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{text.support}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{text.supportDesc}</p>
                </div>
              </div>
            </a>
        </AccountPanel>

        <TelegramLinkCard language={language} source="profile" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default AccountCenter;
