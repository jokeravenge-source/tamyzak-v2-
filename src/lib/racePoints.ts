import { supabase } from "@/integrations/supabase/client";
import type { RaceQuestion } from "./raceQuestionBank";

export type RaceReward = {
  attemptId: string;
  question: RaceQuestion;
  language: "ar" | "en";
  choice: string;
};

export async function saveRaceReward(reward: RaceReward): Promise<void> {
  // The server validates the bank answer and uses this attempt ID to make retries idempotent.
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const { data, error } = await supabase
      .rpc(
        "answer_race_question" as never,
        {
          _attempt_id: reward.attemptId,
          _question_id: reward.question.id,
          _subject: reward.question.subject,
          _chapter: reward.question.chapter,
          _language: reward.language,
          _question: reward.question.question,
          _choice: reward.choice,
        } as never,
      )
      .abortSignal(controller.signal);
    const result = data as { correct?: boolean; points?: number } | null;
    if (error || !result?.correct)
      throw new Error("Race points could not be saved");
    window.dispatchEvent(new CustomEvent("app:progress-updated"));
  } finally {
    window.clearTimeout(timeout);
  }
}
