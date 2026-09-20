import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getBuiltInEnglishLiteratureSection3 } from "@/lib/englishLiteratureSection3Mcqs";

describe("English Literature Section 3 MCQs", () => {
  it("contains all 30 questions with valid answer indexes", () => {
    const questions = getBuiltInEnglishLiteratureSection3("en");
    expect(questions).toHaveLength(30);
    expect(questions.every((row) => row.subject === "english_literature" && row.chapter === 3)).toBe(true);
    expect(questions.every((row) => row.choices.length === 4 && row.answer_index >= 0 && row.answer_index < 4)).toBe(true);
  });

  it("keeps stable bilingual fallback IDs without duplicating rewards", () => {
    const en = getBuiltInEnglishLiteratureSection3("en")[0];
    const ar = getBuiltInEnglishLiteratureSection3("ar")[0];
    expect(en.id).toBe("builtin-english-literature-3-en-01");
    expect(ar.id).toBe("builtin-english-literature-3-ar-01");
    expect(en.question).toBe(ar.question);
  });

  it("matches the database seed exactly", () => {
    const sql = readFileSync(
      `${process.cwd()}/supabase/migrations/20260920040000_english_literature_section_3_mcq_seed.sql`,
      "utf8",
    );
    const seedJson = sql.match(/\$questions\$\s*([\s\S]*?)\s*\$questions\$/)?.[1];
    expect(seedJson).toBeTruthy();
    const seeded = JSON.parse(seedJson!) as Array<{
      question: string;
      choices: string[];
      answer_index: number;
    }>;
    const builtIn = getBuiltInEnglishLiteratureSection3("en");
    expect(seeded.map(({ question, choices, answer_index }) => ({ question, choices, answer_index }))).toEqual(
      builtIn.map(({ question, choices, answer_index }) => ({ question, choices, answer_index })),
    );
  });
});
