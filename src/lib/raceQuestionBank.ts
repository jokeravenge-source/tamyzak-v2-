import { supabase } from "@/integrations/supabase/client";
import { getBuiltInBiologyChapter2 } from "@/lib/biologyChapter2Mcqs";
import { getBuiltInPhysicsCh2 } from "@/lib/physicsChapter2Mcqs";
import { getBuiltInPhysicsCh3 } from "@/lib/physicsChapter3Mcqs";
import { getBuiltInPhysicsCh4 } from "@/lib/physicsChapter4Mcqs";
import { getBuiltInEnglishLiteratureSection1 } from "@/lib/englishLiteratureSection1Mcqs";
import { getBuiltInEnglishLiteratureSection2 } from "@/lib/englishLiteratureSection2Mcqs";
import { getBuiltInEnglishLiteratureSection3 } from "@/lib/englishLiteratureSection3Mcqs";

export type RaceQuestion = {
  id: string;
  subject: string;
  chapter: number;
  question: string;
  choices: string[];
  answer_index: number;
  explanation: string | null;
  tags?: string[];
};

export async function loadRaceQuestionBank(
  language: "ar" | "en",
  signal: AbortSignal,
) {
  const rows: unknown[] = [];
  let partial = false;
  // Read every page in a stable order so large subjects cannot hide later ones.
  try {
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase
        .from("mcq_banks")
        .select(
          "id,subject,chapter,question,choices,answer_index,explanation,tags",
        )
        .eq("language", language)
        .order("id")
        .range(offset, offset + pageSize - 1)
        .abortSignal(signal);
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < pageSize) break;
    }
  } catch {
    partial = true;
  }
  rows.push(
    ...getBuiltInBiologyChapter2(language),
    ...getBuiltInPhysicsCh2(language),
    ...getBuiltInPhysicsCh3(language),
    ...getBuiltInPhysicsCh4(language),
    ...getBuiltInEnglishLiteratureSection1(language),
    ...getBuiltInEnglishLiteratureSection2(language),
    ...getBuiltInEnglishLiteratureSection3(language),
  );
  const seen = new Set<string>();
  const questions = rows.filter((value): value is RaceQuestion => {
    const row = value as RaceQuestion;
    if (
      !row ||
      typeof row.question !== "string" ||
      !row.question.trim() ||
      typeof row.subject !== "string" ||
      !row.subject.trim() ||
      !Number.isInteger(row.chapter) ||
      !Array.isArray(row.choices) ||
      row.choices.length < 2 ||
      !row.choices.every(
        (choice) => typeof choice === "string" && choice.trim(),
      ) ||
      !Number.isInteger(row.answer_index) ||
      row.answer_index < 0 ||
      row.answer_index >= row.choices.length
    )
      return false;
    const key = `${row.subject}\u0000${row.chapter}\u0000${row.question.trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { questions, partial };
}
