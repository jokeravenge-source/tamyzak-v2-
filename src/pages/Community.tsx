import { ArrowLeft, ArrowRight, MessagesSquare, Timer, UsersRound } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

const copy = {
  en: {
    title: "Community",
    sessions: "Sessions",
    sessionsDescription: "Track your study time and join a room to study together.",
    friends: "Friends",
    friendsDescription: "See your friends and add people by name.",
    chat: "Chat",
    chatDescription: "Write a post and join the discussion with other students.",
  },
  ar: {
    title: "المجتمع",
    sessions: "الجلسات",
    sessionsDescription: "سجّل وقت دراستك وانضم لغرفة حتى تدرس ويّه غيرك.",
    friends: "الأصدقاء",
    friendsDescription: "شوف أصدقاءك وأضف غيرهم بالاسم.",
    chat: "الدردشة",
    chatDescription: "اكتب منشور وشارك بالنقاش ويّه الطلاب.",
  },
} as const;

export default function Community({ language, onOpenSessions, onOpenFriends, onOpenChat }: {
  language: AppLanguage;
  onOpenSessions: () => void;
  onOpenFriends: () => void;
  onOpenChat: () => void;
}) {
  const t = copy[language];
  const ar = language === "ar";
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const secondaryCard = `flex items-start gap-3 rounded-[1.4rem] border border-border bg-card p-4 text-start shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 sm:p-5 ${focus}`;

  return (
    <main dir={ar ? "rtl" : "ltr"} className="mx-auto w-full max-w-3xl px-4 pb-24 pt-7 sm:px-6 sm:pt-10">
      <h1 className="mb-5 text-3xl font-bold tracking-tight sm:mb-7 sm:text-4xl">{t.title}</h1>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <button type="button" onClick={onOpenSessions}
          className={`flex min-h-[9.5rem] items-center gap-4 rounded-[1.6rem] border border-sky-400/40 bg-gradient-to-br from-[#103863] via-[#132f59] to-[#091a33] p-5 text-start text-white shadow-lg shadow-blue-900/10 transition-[filter] hover:brightness-110 sm:col-span-2 sm:p-6 ${focus}`}>
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-cyan-100/30 bg-cyan-300/15 text-cyan-100 sm:size-16">
            <Timer className="size-7" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-bold">{t.sessions}</span>
            <span className="mt-1 block max-w-sm text-sm leading-relaxed text-blue-100">{t.sessionsDescription}</span>
          </span>
          <Arrow className="size-5 shrink-0 text-cyan-200" aria-hidden="true" />
        </button>

        <button type="button" onClick={onOpenFriends} className={secondaryCard}>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-700 dark:text-violet-300">
            <UsersRound className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">{t.friends}</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t.friendsDescription}</span>
          </span>
          <Arrow className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>

        <button type="button" onClick={onOpenChat} className={secondaryCard}>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
            <MessagesSquare className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">{t.chat}</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t.chatDescription}</span>
          </span>
          <Arrow className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
