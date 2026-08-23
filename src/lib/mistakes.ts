import { supabase } from "@/integrations/supabase/client";

export type MistakeSource =
  | "mcq_bank"
  | "mcq_generator"
  | "daily_gift"
  | "daily_game"
  | "challenge"
  | "flashcard"
  | "other";

export type Mistake = {
  id: string;
  source: string;
  subject: string | null;
  chapter: string | null;
  language: string | null;
  question: string;
  choices: unknown;
  correct_answer: string | null;
  user_answer: string | null;
  explanation: string | null;
  times_wrong: number;
  times_redone: number;
  resolved: boolean;
  next_review_at: string;
};

export type MistakeInput = {
  source: MistakeSource;
  question: string;
  refId?: string | null;
  subject?: string | null;
  chapter?: string | null;
  language?: string | null;
  choices?: string[];
  correctAnswer?: string | null;
  userAnswer?: string | null;
  explanation?: string | null;
};

/** Store a wrong answer in "My mistakes". Best-effort: never throws. */
export async function recordMistake(input: MistakeInput): Promise<void> {
  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await (supabase as any).rpc("record_mistake", {
      _source: input.source,
      _question: input.question,
      _ref_id: input.refId ?? null,
      _subject: input.subject ?? null,
      _chapter: input.chapter ?? null,
      _language: input.language ?? null,
      _choices: input.choices ?? [],
      _correct_answer: input.correctAnswer ?? null,
      _user_answer: input.userAnswer ?? null,
      _explanation: input.explanation ?? null,
    });
  } catch {
    /* mistakes tracking is best-effort */
  }
}

/** Mistakes that are due again (3 days after the last wrong answer). */
export async function fetchDueMistakes(): Promise<Mistake[]> {
  const { data } = await (supabase as any)
    .from("my_mistakes")
    .select("*")
    .eq("resolved", false)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true })
    .limit(100);
  return (data ?? []) as Mistake[];
}

export async function fetchAllMistakes(): Promise<Mistake[]> {
  const { data } = await (supabase as any)
    .from("my_mistakes")
    .select("*")
    .order("resolved", { ascending: true })
    .order("next_review_at", { ascending: true })
    .limit(300);
  return (data ?? []) as Mistake[];
}

export async function dueMistakesCount(): Promise<number> {
  const { count } = await (supabase as any)
    .from("my_mistakes")
    .select("id", { count: "exact", head: true })
    .eq("resolved", false)
    .lte("next_review_at", new Date().toISOString());
  return count ?? 0;
}

export async function resolveMistake(id: string, correct: boolean): Promise<void> {
  try {
    await (supabase as any).rpc("resolve_mistake", { _id: id, _correct: correct });
  } catch {
    /* best-effort */
  }
}
