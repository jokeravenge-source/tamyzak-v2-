import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getBuiltInBiologyChapter2 } from "@/lib/biologyChapter2Mcqs";

const ENGLISH_SOURCE_ANSWER_KEY = [1,2,1,2,1,0,1,2,3,0,1,2,1,0,1,2,0,1,2,1,0,2,0,2,0,3,0,2,0,1,2,2,1,0,1,0,2,1,2,1,0,1,2,1,1,2,1,2,0,2];
const ARABIC_SOURCE_ANSWER_KEY = [0,1,2,1,3,1,0,3,2,1,1,0,2,2,1,1,2,0,3,1,2,0,1,1,1,0,0,1,0,1,2,1,2,1,1,1,0,2,2,2,3,1,3,0,2,1,0,3,1,3,2,0,2,0,1,2,3,0,1,2,0,2,3,2,0,3,2,3,2,1,3,1,3,2,0,1,3,0,1,2,0,2,1,3];

type SeedRow = {
  question: string;
  choices: string[];
  answer_index: number;
  section: string;
};

const readSeed = (filename: string): SeedRow[] => {
  const sql = readFileSync(`${process.cwd()}/supabase/migrations/${filename}`, "utf8");
  const seedJson = sql.match(/\$questions\$\s*([\s\S]*?)\s*\$questions\$/)?.[1];
  expect(seedJson).toBeTruthy();
  return JSON.parse(seedJson!) as SeedRow[];
};

const comparable = (rows: Array<SeedRow | ReturnType<typeof getBuiltInBiologyChapter2>[number]>) =>
  rows.map((row) => ({
    question: row.question,
    choices: row.choices,
    answer_index: row.answer_index,
    tags: "section" in row ? [row.section] : row.tags,
  }));

describe("Biology Chapter 2 supplied MCQs", () => {
  it("contains all 50 English questions and their complete source answer key", () => {
    const questions = getBuiltInBiologyChapter2("en");
    expect(questions).toHaveLength(50);
    expect(questions.map(({ answer_index }) => answer_index)).toEqual(ENGLISH_SOURCE_ANSWER_KEY);
    expect(questions.every((row) => row.subject === "biology" && row.chapter === 2 && row.chapter_title === "Tissues")).toBe(true);
    expect(questions.every((row) => row.choices.length === 4 && new Set(row.choices).size === 4)).toBe(true);
    expect(questions[44].question).toBe("Compared with blood plasma, lymph has:");
    expect(questions.at(-1)?.question).toBe("Neuroglia cells function mainly to:");
  });

  it("contains all 84 Arabic questions and the supplied DOCX answer key", () => {
    const questions = getBuiltInBiologyChapter2("ar");
    expect(questions).toHaveLength(84);
    expect(questions.map(({ answer_index }) => answer_index)).toEqual(ARABIC_SOURCE_ANSWER_KEY);
    expect(questions.every((row) => row.subject === "biology" && row.chapter === 2 && row.chapter_title === "الأنسجة")).toBe(true);
    expect(questions.every((row) => row.choices.length === 4 && new Set(row.choices).size === 4)).toBe(true);
    expect(questions[0]).toMatchObject({
      id: "builtin-biology-2-ar-01",
      question: "النسيج المرستيمي يتميز بأن خلاياه:",
      answer_index: 0,
    });
    expect(questions.at(-1)).toMatchObject({
      id: "builtin-biology-2-ar-84",
      question: "الخلية العصبية ثنائية القطب يكون جسمها:",
      answer_index: 3,
    });
  });

  it("keeps stable language-specific IDs", () => {
    expect(getBuiltInBiologyChapter2("en")[0].id).toBe("builtin-biology-2-en-01");
    expect(getBuiltInBiologyChapter2("ar")[0].id).toBe("builtin-biology-2-ar-01");
  });

  it("matches both database seeds exactly", () => {
    expect(comparable(readSeed("20261118170000_biology_ch2_mcq_bank_seed.sql"))).toEqual(
      comparable(getBuiltInBiologyChapter2("en")),
    );
    expect(comparable(readSeed("20261118171000_biology_ch2_ar_mcq_bank_seed.sql"))).toEqual(
      comparable(getBuiltInBiologyChapter2("ar")),
    );
  });
});
