import questions from "@/data/physicsChapter4EnglishMcqs.json";

// The published rows keep the same UUIDs so attempts also work after rollout.
export function getBuiltInPhysicsCh4(language: "ar" | "en") {
  if (language !== "en") return [];
  return questions.map(({ id, section, question, choices, answer_index }) => ({
    id, section, question, choices, answer_index,
    subject: "physics",
    chapter: 4,
    chapter_title: "Electromagnetic Waves",
    explanation: null,
  }));
}
