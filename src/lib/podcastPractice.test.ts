import { expect, it, vi } from "vitest";
vi.mock("./raceQuestionBank", () => ({ loadRaceQuestionBank: vi.fn() }));
vi.mock("@/features/pdf-builder/bankSources", () => ({ loadSource: vi.fn() }));
import { relatedPractice, loadPodcastPractice } from "./podcastPractice";
import { loadRaceQuestionBank } from "./raceQuestionBank";
import { loadSource } from "@/features/pdf-builder/bankSources";
it("matches normalized Arabic topic words and excludes unrelated or generic titles", () => {
  const items = [
    {
      id: "a",
      kind: "ministerial" as const,
      question: "عرّف الحث الكهرومغناطيسي",
      answer: "الإجابة",
    },
    {
      id: "b",
      kind: "mcq" as const,
      question: "ما تركيب الخلية؟",
      answer: "الإجابة",
    },
  ];
  expect(
    relatedPractice(items, "الحَث الكهرومغناطيسي").map((q) => q.id),
  ).toEqual(["a"]);
  expect(relatedPractice(items, "شرح الفصل السادس العلمي")).toEqual([]);
  expect(relatedPractice(items, "الوراثة")).toEqual([]);
});

it("combines requested bank categories, deduplicates sources and excludes unrelated questions", async () => {
  vi.mocked(loadSource).mockResolvedValue([{ q: "عرّف الحث", a: "جواب من البنك" }]);
  vi.mocked(loadRaceQuestionBank).mockResolvedValue({ partial: false, questions: [{ id: "one", subject: "physics", chapter: 2, question: "ما سبب الحث؟", choices: ["أ", "ب"], answer_index: 1, explanation: null }, { id: "other", subject: "biology", chapter: 1, question: "الحث في الأحياء", choices: ["أ", "ب"], answer_index: 0, explanation: null }] });
  const result = await loadPodcastPractice("physics", "الحث", "ar", "both", new AbortController().signal);
  expect(result.questions).toHaveLength(2);
  expect(result.questions.map(q => q.kind)).toEqual(["ministerial", "mcq"]);
  expect(result.questions[1].answer).toBe("ب");
});
