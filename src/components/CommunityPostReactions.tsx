import { useEffect, useId, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { setChatReaction, type ChatReaction, type ChatReactionSummary } from "@/lib/communityChat";
import { cn } from "@/lib/utils";
import "./CommunityPostReactions.css";

const copy = {
  en: { label: "Post reactions", like: "Like", dislike: "Dislike", error: "Couldn't save your reaction." },
  ar: { label: "التفاعل ويّه المنشور", like: "إعجاب", dislike: "عدم إعجاب", error: "ما قدرنا نحفظ تفاعلك." },
} as const;

const options = [
  { reaction: "like", Icon: ThumbsUp, selected: "bg-teal-700/15 text-teal-900 hover:bg-teal-700/25 dark:bg-teal-300/15 dark:text-teal-100" },
  { reaction: "dislike", Icon: ThumbsDown, selected: "bg-rose-700/10 text-rose-800 hover:bg-rose-700/20 dark:bg-rose-300/15 dark:text-rose-100" },
] as const;

export default function CommunityPostReactions({ postId, summary, language, onSaved }: {
  postId: string; summary: ChatReactionSummary; language: AppLanguage; onSaved: (summary: ChatReactionSummary) => void;
}) {
  const t = copy[language];
  const countsId = useId();
  const [burst, setBurst] = useState<{ reaction: ChatReaction; key: number } | null>(null);
  const save = useMutation({
    mutationFn: (reaction: ChatReaction | null) => setChatReaction(postId, reaction),
    onSuccess: onSaved,
    onError: () => toast.error(t.error),
  });
  useEffect(() => {
    if (!burst) return;
    const timeout = window.setTimeout(() => setBurst(null), 720);
    return () => window.clearTimeout(timeout);
  }, [burst]);
  const selected = save.isPending ? save.variables : summary.viewer_reaction;

  return (
    <div role="group" aria-label={t.label} className="flex gap-1.5">
      {options.map(({ reaction, Icon, selected: activeStyle }) => {
        const active = selected === reaction;
        const saved = summary.viewer_reaction === reaction;
        const count = (reaction === "like" ? summary.like_count : summary.dislike_count) + Number(active) - Number(saved);
        const countId = `${countsId}-${reaction}`;
        return (
          <Button key={reaction} type="button" variant="secondary" aria-label={t[reaction]} aria-pressed={active}
            aria-describedby={countId}
            aria-disabled={save.isPending || undefined}
            className={cn("relative min-h-11 min-w-14 rounded-full px-2.5 tabular-nums sm:px-3", active && activeStyle)}
            onClick={() => {
              if (save.isPending) return;
              const next = active ? null : reaction;
              if (next) setBurst(previous => ({ reaction: next, key: (previous?.key ?? 0) + 1 }));
              else setBurst(null);
              save.mutate(next);
            }}>
            <Icon aria-hidden="true" />
            <span id={countId}>{count.toLocaleString(language === "ar" ? "ar-IQ" : "en")}</span>
            {burst?.reaction === reaction && <span key={burst.key} aria-hidden="true" className={`chat-reaction-burst chat-reaction-burst--${reaction}`}>
              <Icon />
            </span>}
          </Button>
        );
      })}
    </div>
  );
}
