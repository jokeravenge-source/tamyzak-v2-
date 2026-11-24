import arabicQuestions from "@/data/physicsChapter6ArabicMcqs.json";

export function getBuiltInPhysicsCh6(language: "ar" | "en") {
  if (language !== "ar") return [];
  return arabicQuestions.map(({ id, question, choices, answer_index }) => ({
    id, question, choices, answer_index,
    subject: "physics",
    chapter: 6,
    chapter_title: "الفيزياء الحديثة",
    explanation: null,
  }));
}
