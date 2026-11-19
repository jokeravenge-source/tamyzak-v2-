import { beforeEach, expect, it, vi } from "vitest";
import { loadRaceQuestionBank } from "./raceQuestionBank";

const api = vi.hoisted(() => ({ pages: vi.fn(), ranges: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => {
      let start = 0;
      const query = {
        select: () => query,
        eq: () => query,
        order: () => query,
        range: (from: number, to: number) => {
          start = from;
          api.ranges(from, to);
          return query;
        },
        abortSignal: () => api.pages(start),
      };
      return query;
    },
  },
}));
beforeEach(() => vi.clearAllMocks());
const question = (id: number, subject = "chemistry") => ({
  id: String(id),
  subject,
  chapter: 1,
  question: `Question ${id}`,
  choices: ["True", "False"],
  answer_index: 1,
  explanation: null,
});

it("includes subjects beyond 2000 rows, all built-in literature sections, and two-choice questions", async () => {
  const rows = Array.from({ length: 2500 }, (_, i) => question(i));
  rows.push(
    question(2500, "math"),
    question(2501, "french"),
    question(2502, "islamic"),
    question(2503, "arabic"),
    question(2504, "english"),
  );
  api.pages.mockImplementation(async (offset: number) => ({
    data: rows.slice(offset, offset + 500),
    error: null,
  }));
  const result = await loadRaceQuestionBank("ar", new AbortController().signal);
  expect(result.partial).toBe(false);
  expect(api.ranges).toHaveBeenLastCalledWith(2500, 2999);
  expect(new Set(result.questions.map((row) => row.subject))).toEqual(
    new Set([
      "chemistry",
      "math",
      "french",
      "islamic",
      "arabic",
      "english",
      "biology",
      "physics",
      "english_literature",
    ]),
  );
  expect(
    result.questions.find((row) => row.id === "2500")?.choices,
  ).toHaveLength(2);
  expect(
    new Set(
      result.questions
        .filter((row) => row.subject === "english_literature")
        .map((row) => row.chapter),
    ),
  ).toEqual(new Set([1, 2, 3]));
});

it("keeps earlier pages when a later page fails and excludes malformed questions", async () => {
  api.pages.mockImplementation(async (offset: number) =>
    offset === 0
      ? {
          data: [
            ...Array.from({ length: 499 }, (_, i) => question(i)),
            { ...question(499), answer_index: 5 },
          ],
          error: null,
        }
      : { data: null, error: new Error("Network") },
  );
  const result = await loadRaceQuestionBank("en", new AbortController().signal);
  expect(result.partial).toBe(true);
  expect(
    result.questions.filter((row) => row.subject === "chemistry"),
  ).toHaveLength(499);
  expect(result.questions.some((row) => row.subject === "biology")).toBe(true);
});
