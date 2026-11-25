import englishQuestions from "@/data/physicsChapter7EnglishMcqs.json";

export function getBuiltInPhysicsCh7(language: "ar" | "en") {
  if (language !== "en") return [];
  return englishQuestions.map(({ id, section, question, choices, answer_index }) => ({
    id, section, question, choices, answer_index,
    subject: "physics",
    chapter: 7,
    chapter_title: "Solid-State Electronics",
    explanation: null,
  }));
}
