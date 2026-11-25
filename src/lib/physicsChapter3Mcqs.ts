import arabicQuestions from "@/data/physicsChapter3ArabicMcqs.json";
import englishQuestions from "@/data/physicsChapter3EnglishMcqs.json";

// The published rows keep the same UUIDs so attempts also work after rollout.
export function getBuiltInPhysicsCh3(language: "ar" | "en") {
  const questions = language === "ar" ? arabicQuestions : englishQuestions;
  const chapterTitle = language === "ar" ? "التيار المتناوب" : "Alternating Current";
  return questions.map(({ id, section, question, choices, answer_index }) => ({
    id, section, question, choices, answer_index,
    subject: "physics",
    chapter: 3,
    chapter_title: chapterTitle,
    explanation: null,
  }));
}
