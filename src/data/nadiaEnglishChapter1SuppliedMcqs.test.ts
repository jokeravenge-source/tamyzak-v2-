import { describe, expect, it } from "vitest";
import {
  appendNadiaEnglishChapter1SuppliedMcqs,
  getNadiaEnglishChapter1SuppliedMcqSet,
  nadiaEnglishChapter1SuppliedQuestions,
} from "./nadiaEnglishChapter1SuppliedMcqs";

describe("Nadia's supplied Chapter 1 bank", () => {
  it("retains all 87 source questions, including restarted and skipped source numbers", () => {
    const questions = Object.values(nadiaEnglishChapter1SuppliedQuestions).flat();
    expect(questions).toHaveLength(87);
    expect(new Set(questions.map((item) => `${item.sourceSection}:${item.sourceNumber}`)).size).toBe(87);
    const sections = questions.reduce<Record<string, number>>((counts, item) => {
      counts[item.sourceSection] = (counts[item.sourceSection] ?? 0) + 1;
      return counts;
    }, {});
    expect(sections)
      .toEqual({ cells: 11, prokaryotes: 7, bacteria: 6, eukaryotes: 7, "cytoplasm-er": 12,
        golgi: 7, mitochondria: 7, plastids: 10, lysosomes: 7, cytoskeleton: 8, centrosome: 5 });
  });

  it("provides four choices and a valid answer for every question", () => {
    for (const lecture of Object.keys(nadiaEnglishChapter1SuppliedQuestions).map(Number)) {
      const set = getNadiaEnglishChapter1SuppliedMcqSet(lecture)!;
      expect(set.topic_key).toBe(`nadia-en-ch1-lec${lecture}-exam`);
      expect(set.title).not.toMatch(/Anas|Raad|أنس|انس رعد/);
      for (const question of set.questions) {
        expect(question.question.trim()).not.toBe("");
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices).size).toBe(4);
        expect(question.answer_index).toBeGreaterThanOrEqual(0);
        expect(question.answer_index).toBeLessThan(4);
        expect(question.explanation).toBe(question.choices[question.answer_index]);
        expect(/[\u0600-\u06ff]/.test(question.question + question.choices.join(""))).toBe(false);
      }
    }
    expect(getNadiaEnglishChapter1SuppliedMcqSet(1)?.questions[3].answer_index).toBe(0);
    expect(getNadiaEnglishChapter1SuppliedMcqSet(1)?.questions[8].answer_index).toBe(0);
    expect(getNadiaEnglishChapter1SuppliedMcqSet(7)?.questions[2].answer_index).toBe(3);
  });

  it("keeps saved sets and omits supplied questions already present despite punctuation differences", () => {
    const supplied = getNadiaEnglishChapter1SuppliedMcqSet(1)!;
    const saved = { id: "existing-admin-set", questions: [{ question: supplied.questions[0].question.toUpperCase().replace(/\?$/, " ? ") }] };
    const merged = appendNadiaEnglishChapter1SuppliedMcqs(1, 1, [saved]);
    expect(merged[0]).toBe(saved);
    expect(merged[1].questions).toHaveLength(10);
    expect(saved.questions).toHaveLength(1);
    expect(appendNadiaEnglishChapter1SuppliedMcqs(1, 1, [supplied])).toEqual([supplied]);
  });

  it("does not add questions to other chapters or unrelated Chapter 1 topics", () => {
    expect(appendNadiaEnglishChapter1SuppliedMcqs(2, 1, [])).toEqual([]);
    expect(appendNadiaEnglishChapter1SuppliedMcqs(1, 4, [])).toEqual([]);
    expect(appendNadiaEnglishChapter1SuppliedMcqs(1, 28, [])).toEqual([]);
  });
});
