import arabicQuestions from "@/data/physicsChapter5ArabicMcqs.json";
import englishQuestions from "@/data/physicsChapter5EnglishMcqs.json";

// The published rows keep the same UUIDs so attempts also work after rollout.
export function getBuiltInPhysicsCh5(language: "ar" | "en") {
  const questions = language === "ar" ? arabicQuestions : englishQuestions;
  const chapterTitle = language === "ar" ? "البصريات الفيزيائية" : "Physical Optics";
  return questions.map(({ id, question, choices, answer_index }) => ({
    id, question, choices, answer_index,
    subject: "physics",
    chapter: 5,
    chapter_title: chapterTitle,
    explanation: null,
  }));
}
