import { useEffect, useId, useState, type CSSProperties } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Heart, Loader2 } from "lucide-react";
import { CharacterAvatar, FEMALE_VARIANTS, MALE_VARIANTS, SKIN_COLORS, getAvatarStyle, type Gender, type CharacterVariant } from "./CharacterAvatar";
import type { AppLanguage } from "./LanguageGate";
import UsageIntroGate from "./UsageIntroGate";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { STUDY_ROOM_CHEER_RECEIVED, type StudyRoomCheerEvent } from "@/hooks/useStudyRoomActivity";
import { useIsCharacterPracticing } from "@/hooks/useCharacterPractice";
import { useStudyStatus } from "@/hooks/useStudyStatus";
import { getCharacterPenGrip, getCharacterSighPosition } from "@/lib/characterAccessoryFit";
import { PROFILE_CHARACTER_CHANGED, loadProfileCharacter, saveInitialProfileCharacter, type ProfileCharacter } from "@/lib/profileCharacter";
import { cn } from "@/lib/utils";
import "./StudentCharacter.css";

const copy = {
  ar: {
    title: "اختار شخصيتك", description: "هاي الشخصية راح تمثّلك بتميّزك. تگدر تغيّر شكلها من حسابك.",
    male: "ولد", female: "بنية", options: "أشكال الشخصيات", choice: "الشخصية",
    save: "اختار هاي الشخصية", saving: "جاري الحفظ…", later: "لاحقاً", error: "تعذّر حفظ الشخصية. جرّب مرة ثانية.",
    toggle: "حالة دراستك", ready: "جاهز للدراسة", studying: "دا أدرس هسه", paused: "موقّف الدراسة مؤقتاً", rest: "دا آخذ استراحة",
    bored: "ملّيت شوي…", solving: "دا أحل أسئلة",
  },
  en: {
    title: "Choose your character", description: "This character represents you on Tamayzak. You can customize it in your account.",
    male: "Boy", female: "Girl", options: "Character styles", choice: "Character",
    save: "Use this character", saving: "Saving…", later: "Later", error: "Could not save your character. Please try again.",
    toggle: "Your study status", ready: "Ready to study", studying: "Studying now", paused: "Study paused", rest: "On a break",
    bored: "Getting a little bored…", solving: "Solving questions",
  },
} as const;

const CHEER_REACTION_MS = 900;
const BORED_AFTER_MS = 60_000;
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "scroll"] as const;

function useBoredCharacter(enabled: boolean) {
  const [bored, setBored] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setBored(false);
      return;
    }

    let lastActivity = performance.now();
    let timeout: number | undefined;
    const checkActivity = () => {
      const remaining = BORED_AFTER_MS - (performance.now() - lastActivity);
      if (remaining > 0) {
        timeout = window.setTimeout(checkActivity, remaining);
      } else {
        timeout = undefined;
        setBored(true);
      }
    };
    const onActivity = () => {
      if (document.hidden) return;
      lastActivity = performance.now();
      if (timeout === undefined) {
        setBored(false);
        timeout = window.setTimeout(checkActivity, BORED_AFTER_MS);
      }
    };
    const onVisibilityChange = () => {
      window.clearTimeout(timeout);
      timeout = undefined;
      setBored(false);
      onActivity();
    };

    onActivity();
    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, onActivity, { passive: true, capture: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearTimeout(timeout);
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, onActivity, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled]);

  return enabled && bored;
}

function CharacterStatus({ userId, character, language }: { userId: string; character: ProfileCharacter; language: AppLanguage }) {
  const [open, setOpen] = useState(true);
  const [cheer, setCheer] = useState(0);
  const messageId = useId();
  const studyStatus = useStudyStatus(userId);
  const practicing = useIsCharacterPracticing();
  const bored = useBoredCharacter(studyStatus === "ready" && !practicing);
  const status = practicing ? "solving" : bored ? "bored" : studyStatus;
  const hasPose = status === "solving" || status === "bored";
  const handStyle = { "--student-character-hand": character.traits?.skin ?? SKIN_COLORS[0] } as CSSProperties;
  const t = copy[language];

  useEffect(() => {
    let reset: number | undefined;
    const onCheer = (event: Event) => {
      if ((event as StudyRoomCheerEvent).detail?.recipient !== userId) return;
      setCheer(previous => previous + 1);
      window.clearTimeout(reset);
      reset = window.setTimeout(() => setCheer(0), CHEER_REACTION_MS);
    };
    window.addEventListener(STUDY_ROOM_CHEER_RECEIVED, onCheer);
    return () => {
      window.removeEventListener(STUDY_ROOM_CHEER_RECEIVED, onCheer);
      window.clearTimeout(reset);
    };
  }, [userId]);

  return (
    <aside data-study-status={status} className="student-character pointer-events-none fixed bottom-[calc(var(--nav-safe)+.5rem)] left-[max(.625rem,env(safe-area-inset-left))] z-[34] flex max-w-[75vw] items-end gap-2" dir="ltr">
      <button type="button" onClick={() => setOpen(value => !value)} aria-label={t.toggle} aria-expanded={open} aria-controls={open ? messageId : undefined}
        className={cn("student-character__button pointer-events-auto relative grid shrink-0 place-items-center rounded-full border border-primary/30 bg-card shadow-md transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", hasPose ? "size-[3.625rem]" : "size-12")}>
        <span aria-hidden="true" className="student-character__reaction" data-cheering={cheer > 0 || undefined}>
          <span className="student-character__sprite">
            <CharacterAvatar gender={character.gender} traits={character.traits} size={hasPose ? 52 : 42} reading={status === "studying"} />
            {status === "solving" && (
              <span className="student-character__writing" style={{ ...handStyle, ...getCharacterPenGrip(character.gender, character.traits?.variant) }}>
                <span className="student-character__notepad" />
                <span className="student-character__pen" />
                <span className="student-character__grip" />
              </span>
            )}
            {status === "bored" && <span className="student-character__sigh" style={getCharacterSighPosition(character.gender, character.traits?.variant)} />}
          </span>
          {status === "solving" && <span className="student-character__thought student-character__thought--question">{language === "ar" ? "؟" : "?"}</span>}
          {status === "bored" && <span className="student-character__thought student-character__thought--bored">…</span>}
        </span>
        {cheer > 0 && <span key={cheer} aria-hidden="true" className="student-character__cheer"><Heart fill="currentColor" className="size-2.5" /></span>}
      </button>
      {open && <p id={messageId} role="status" dir={language === "ar" ? "rtl" : "ltr"}
        className="student-character__message relative mb-2 rounded-2xl rounded-bl-sm border border-border bg-card px-3 py-2 text-start text-xs font-semibold leading-5 text-foreground shadow-sm">
        {t[status]}
      </p>}
    </aside>
  );
}

export default function StudentCharacter({ userId, language, visible, onNeedHelp }: {
  userId: string; language: AppLanguage; visible: boolean; onNeedHelp?: () => void;
}) {
  const t = copy[language];
  const queryClient = useQueryClient();
  const queryKey = ["profile-character", userId];
  const profile = useQuery({ queryKey, queryFn: () => loadProfileCharacter(userId) });
  const [skipped, setSkipped] = useState(false);
  const [gender, setGender] = useState<Gender>("male");
  const [variant, setVariant] = useState<CharacterVariant | null>(null);
  const variants = gender === "male" ? MALE_VARIANTS : FEMALE_VARIANTS;
  const save = useMutation({
    mutationFn: (selected: CharacterVariant) => saveInitialProfileCharacter(userId, gender, { ...getAvatarStyle(userId, gender), variant: selected }),
    onMutate: () => queryClient.cancelQueries({ queryKey }),
    onSuccess: character => queryClient.setQueryData(queryKey, character),
  });

  useEffect(() => {
    const refresh = (event: Event) => {
      if ((event as CustomEvent<string>).detail === userId) void queryClient.invalidateQueries({ queryKey: ["profile-character", userId] });
    };
    window.addEventListener(PROFILE_CHARACTER_CHANGED, refresh);
    return () => window.removeEventListener(PROFILE_CHARACTER_CHANGED, refresh);
  }, [queryClient, userId]);

  if (!visible) return null;
  if (profile.data) return <>
    <CharacterStatus userId={userId} character={profile.data} language={language} />
    {onNeedHelp && <UsageIntroGate language={language} onNeedHelp={onNeedHelp} />}
  </>;
  if (!profile.isSuccess) return null;

  return (
    <Dialog open={!skipped} onOpenChange={open => { if (!open && !save.isPending) setSkipped(true); }}>
      <DialogContent dir={language === "ar" ? "rtl" : "ltr"} onPointerDownOutside={event => event.preventDefault()}
        className="max-w-md rounded-3xl border-primary/25 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">{t.title}</DialogTitle>
          <DialogDescription className="leading-6">{t.description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/60 p-1" role="group" aria-label={t.options}>
          {(["male", "female"] as const).map(style => (
            <button key={style} type="button" aria-pressed={gender === style} disabled={save.isPending}
              onClick={() => { setGender(style); setVariant(null); save.reset(); }}
              className="min-h-11 rounded-lg text-sm font-bold text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm">
              {t[style]}
            </button>
          ))}
        </div>
        <div className="grid max-h-[40dvh] grid-cols-3 gap-2 overflow-y-auto p-1 sm:grid-cols-4">
          {variants.map((src, index) => {
            const option = (index + 1) as CharacterVariant;
            return <button key={src} type="button" aria-label={`${t.choice} ${option}`} aria-pressed={variant === option} disabled={save.isPending}
              className={cn("relative grid min-h-[4.5rem] place-items-center rounded-xl border bg-muted/30 transition-colors hover:border-primary", variant === option ? "border-primary bg-primary/10" : "border-border")}
              onClick={() => { setVariant(option); save.reset(); }}>
              <img src={src} alt="" width={60} height={60} loading="lazy" className="size-[3.75rem] object-contain" />
              {variant === option && <Check aria-hidden="true" className="absolute end-1.5 top-1.5 size-4 rounded-full bg-primary p-0.5 text-primary-foreground" />}
            </button>;
          })}
        </div>
        {save.isError && <p role="alert" className="text-sm font-medium text-destructive">{t.error}</p>}
        <div className="flex gap-2">
          <button type="button" disabled={!variant || save.isPending} onClick={() => { if (variant) save.mutate(variant); }}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {save.isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}{save.isPending ? t.saving : t.save}
          </button>
          <button type="button" disabled={save.isPending} onClick={() => setSkipped(true)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-secondary">{t.later}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
