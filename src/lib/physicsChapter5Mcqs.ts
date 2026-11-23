import questions from "@/data/physicsChapter5ArabicMcqs.json";

// The published rows keep the same UUIDs so attempts also work after rollout.
export function getBuiltInPhysicsCh5(language: "ar" | "en") {
  if (language !== "ar") return [];
  return questions.map(({ id, question, choices, answer_index }) => ({
    id, question, choices, answer_index,
    subject: "physics",
    chapter: 5,
    chapter_title: "البصريات الفيزيائية",
    explanation: null,
  }));
}
