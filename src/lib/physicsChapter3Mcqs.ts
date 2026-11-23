import questions from "@/data/physicsChapter3EnglishMcqs.json";

// The published rows keep the same UUIDs so attempts also work after rollout.
export function getBuiltInPhysicsCh3(language: "ar" | "en") {
  if (language !== "en") return [];
  return questions.map(({ id, question, choices, answer_index }) => ({
    id, question, choices, answer_index,
    subject: "physics",
    chapter: 3,
    chapter_title: "Alternating Current",
    explanation: null,
  }));
}
