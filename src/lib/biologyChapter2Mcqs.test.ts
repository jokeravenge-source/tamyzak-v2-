import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getBuiltInBiologyChapter2 } from "@/lib/biologyChapter2Mcqs";

const SOURCE_ANSWER_KEY = [1,2,1,2,1,0,1,2,3,0,1,2,1,0,1,2,0,1,2,1,0,2,0,2,0,3,0,2,0,1,2,2,1,0,1,0,2,1,2,1,0,1,2,1,1,2,1,2,0,2];

describe("Biology Chapter 2 supplied MCQs", () => {
  it("contains all 50 questions and the complete source answer key", () => {
    const questions = getBuiltInBiologyChapter2("en");
    expect(questions).toHaveLength(50);
    expect(questions.map(({ answer_index }) => answer_index)).toEqual(SOURCE_ANSWER_KEY);
    expect(questions.every((row) => row.subject === "biology" && row.chapter === 2 && row.chapter_title === "Tissues")).toBe(true);
    expect(questions.every((row) => row.choices.length === 4 && new Set(row.choices).size === 4)).toBe(true);
    expect(questions[44].question).toBe("Compared with blood plasma, lymph has:");
    expect(questions.at(-1)?.question).toBe("Neuroglia cells function mainly to:");
  });

  it("keeps stable IDs and exposes the English source in either interface language", () => {
    const english = getBuiltInBiologyChapter2("en");
    const arabicUi = getBuiltInBiologyChapter2("ar");
    expect(english[0].id).toBe("builtin-biology-2-en-01");
    expect(arabicUi[0].id).toBe("builtin-biology-2-ar-01");
    expect(arabicUi.map(({ question }) => question)).toEqual(english.map(({ question }) => question));
  });

  it("matches the database seed exactly", () => {
    const sql = readFileSync(
      `${process.cwd()}/supabase/migrations/20261118170000_biology_ch2_mcq_bank_seed.sql`,
      "utf8",
    );
    const seedJson = sql.match(/\$questions\$\s*([\s\S]*?)\s*\$questions\$/)?.[1];
    expect(seedJson).toBeTruthy();
    const seeded = JSON.parse(seedJson!) as Array<{
      question: string;
      choices: string[];
      answer_index: number;
      section: string;
    }>;
    const builtIn = getBuiltInBiologyChapter2("en");
    expect(seeded.map(({ question, choices, answer_index, section }) => ({ question, choices, answer_index, tags: [section] }))).toEqual(
      builtIn.map(({ question, choices, answer_index, tags }) => ({ question, choices, answer_index, tags })),
    );
  });
});
