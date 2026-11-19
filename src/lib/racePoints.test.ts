import { beforeEach, expect, it, vi } from "vitest";
import { saveRaceReward } from "./racePoints";
import { getBuiltInBiologyChapter2 } from "./biologyChapter2Mcqs";
const api = vi.hoisted(() => ({ rpc: vi.fn(), request: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (...args: unknown[]) => {
      api.rpc(...args);
      return { abortSignal: api.request };
    },
  },
}));
beforeEach(() => vi.clearAllMocks());
it("sends the answer and stable attempt ID and accepts a duplicate acknowledgement", async () => {
  const question = getBuiltInBiologyChapter2("ar")[0];
  const reward = {
    question,
    language: "ar" as const,
    attemptId: "same-attempt",
    choice: question.choices[question.answer_index],
  };
  api.request
    .mockResolvedValueOnce({ data: { correct: true, points: 10 }, error: null })
    .mockResolvedValueOnce({ data: { correct: true, points: 0 }, error: null });
  await saveRaceReward(reward);
  await saveRaceReward(reward);
  expect(api.rpc).toHaveBeenCalledWith(
    "answer_race_question",
    expect.objectContaining({
      _attempt_id: "same-attempt",
      _question_id: question.id,
      _choice: reward.choice,
    }),
  );
});
it("reports a missing backend migration instead of treating points as saved", async () => {
  api.request.mockResolvedValue({ data: null, error: { code: "PGRST202" } });
  const question = getBuiltInBiologyChapter2("en")[0];
  await expect(
    saveRaceReward({
      question,
      language: "en",
      attemptId: "attempt",
      choice: "answer",
    }),
  ).rejects.toThrow();
});
