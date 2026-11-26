import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { CharacterAvatar, FEMALE_VARIANTS, MALE_VARIANTS, getAvatarStyle, type Gender, type CharacterVariant } from "./CharacterAvatar";
import type { AppLanguage } from "./LanguageGate";
import UsageIntroGate from "./UsageIntroGate";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { STUDY_TIMER_CHANGED } from "@/hooks/useStudyTimerPresence";
import { STUDY_SESSION_STORAGE_KEY, timerDisplayFromPersistedSession } from "@/lib/studyTimerDisplay";
import { PROFILE_CHARACTER_CHANGED, loadProfileCharacter, saveInitialProfileCharacter, type ProfileCharacter } from "@/lib/profileCharacter";
import { cn } from "@/lib/utils";

const copy = {
  ar: {
    title: "اختار شخصيتك", description: "هاي الشخصية راح تمثّلك بتميّزك. تگدر تغيّر شكلها من حسابك.",
    male: "ولد", female: "بنية", options: "أشكال الشخصيات", choice: "الشخصية",
    save: "اختار هاي الشخصية", saving: "جاري الحفظ…", later: "لاحقاً", error: "تعذّر حفظ الشخصية. جرّب مرة ثانية.",
    toggle: "حالة دراستك", ready: "جاهز للدراسة", studying: "دا أدرس هسه", paused: "موقّف الدراسة مؤقتاً", rest: "دا آخذ استراحة",
  },
  en: {
    title: "Choose your character", description: "This character represents you on Tamayzak. You can customize it in your account.",
    male: "Boy", female: "Girl", options: "Character styles", choice: "Character",
    save: "Use this character", saving: "Saving…", later: "Later", error: "Could not save your character. Please try again.",
    toggle: "Your study status", ready: "Ready to study", studying: "Studying now", paused: "Study paused", rest: "On a break",
  },
} as const;

function subscribeToStudyStatus(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STUDY_SESSION_STORAGE_KEY) listener();
  };
  window.addEventListener(STUDY_TIMER_CHANGED, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(STUDY_TIMER_CHANGED, listener);
    window.removeEventListener("storage", onStorage);
  };
}

type StudyStatus = "ready" | "studying" | "paused" | "rest";

function readStudyStatus(userId: string): StudyStatus {
  try {
    const session = JSON.parse(localStorage.getItem(STUDY_SESSION_STORAGE_KEY) ?? "null");
    if (typeof session?.userId === "string" && session.userId !== userId) return "ready";
    const timer = timerDisplayFromPersistedSession(session);
    if (!timer) return "ready";
    if (session.pomodoro === true && session.phase === "rest") return "rest";
    return timer.isRunning ? "studying" : "paused";
  } catch {
    return "ready";
  }
}

function CharacterStatus({ userId, character, language }: { userId: string; character: ProfileCharacter; language: AppLanguage }) {
  const [open, setOpen] = useState(true);
  const messageId = useId();
  const status = useSyncExternalStore(subscribeToStudyStatus, () => readStudyStatus(userId), (): StudyStatus => "ready");
  const t = copy[language];
  return (
    <aside className="pointer-events-none fixed bottom-[calc(var(--nav-safe)+.5rem)] left-[max(.625rem,env(safe-area-inset-left))] z-[34] flex max-w-[75vw] items-end gap-2" dir="ltr">
      <button type="button" onClick={() => setOpen(value => !value)} aria-label={t.toggle} aria-expanded={open} aria-controls={open ? messageId : undefined}
        className="pointer-events-auto grid size-12 shrink-0 place-items-center rounded-full border border-primary/30 bg-card shadow-md transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <span aria-hidden="true"><CharacterAvatar gender={character.gender} traits={character.traits} size={42} /></span>
      </button>
      {open && <p id={messageId} role="status" dir={language === "ar" ? "rtl" : "ltr"}
        className="relative mb-2 rounded-2xl rounded-bl-sm border border-border bg-card px-3 py-2 text-start text-xs font-semibold leading-5 text-foreground shadow-sm">
        {t[status]}
      </p>}
    </aside>
  );
}

export default function StudentCharacter({ userId, language, visible, onNeedHelp }: {
  userId: string; language: AppLanguage; visible: boolean; onNeedHelp: () => void;
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
    <UsageIntroGate language={language} onNeedHelp={onNeedHelp} />
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
