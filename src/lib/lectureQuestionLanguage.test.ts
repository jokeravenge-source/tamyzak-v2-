import { describe, expect, it, vi } from "vitest";
import {
  applyQuestionTranslations, hasArabicLectureQuestions, splitLectureNoteForTranslation, translateLectureQuestions,
} from "../../supabase/functions/_shared/lecture-question-language";

describe("English lecture question language", () => {
  it.each([
    "### لماذا تعد الأسموزية حالة من الانتشار؟",
    "**السؤال:** كيف يلتئم الجرح وفق النظرية الخلوية؟",
    "## Review Questions\n1. اذكر وظائف النسيج المرستيمي.",
    "### أسئلة مراجعة\n١. قارن بين نوعي الخلايا.",
    "| ما أصل حامض الستريك؟ | اتحاد Acetyl-CoA مع حامض الأوكسالو أسيتيك |",
    '> ⚠️ **سؤال وزاري:** "اشرح التحول الشكلي عند الإنسان".',
    "علل زيادة قطر الساق.",
    "**ما أصل حامض اللاكتيك**",
  ])("detects saved and fallback question formats: %s", (notes) => {
    expect(hasArabicLectureQuestions(notes)).toBe(true);
  });

  it.each([
    "الخلية هي الوحدة الأساسية للتركيب والوظيفة.",
    "## Review Questions\n1. What is osmosis?\n**الإجابة:** انتقال الماء عبر غشاء شبه نافذ.",
    "## Review Questions\n1. What is osmosis? انتقال الماء عبر غشاء شبه نافذ.",
    "| What is the source of pyruvic acid? | الجلوكوز بعد التحلل السكري |",
    "### Review Questions\n1. الإجابة: تنقسم الخلايا.",
  ])("allows Arabic explanations and English questions: %s", (notes) => {
    expect(hasArabicLectureQuestions(notes)).toBe(false);
  });

  it("translates inline questions while retaining Arabic explanations and Markdown exactly", () => {
    const notes = "**لماذا تنتشر هذه النباتات بالرياح بسهولة؟** لأنها خفيفة الوزن.\n| ما أصل البذرة؟ | البويضة |\n**الإجابة:** تبقى بالعربية.\n";
    const result = applyQuestionTranslations(notes, [
      { source: "لماذا تنتشر هذه النباتات بالرياح بسهولة؟", english: "Why are these plants easily dispersed by wind?" },
      { source: "ما أصل البذرة؟", english: "What is the origin of the seed?" },
    ]);
    expect(result).toBe("**Why are these plants easily dispersed by wind?** لأنها خفيفة الوزن.\n| What is the origin of the seed? | البويضة |\n**الإجابة:** تبقى بالعربية.\n");
    expect(hasArabicLectureQuestions(result)).toBe(false);
  });

  it("translates repeated prompts without losing a copy", () => {
    expect(applyQuestionTranslations("ما الخلية؟\nما الخلية؟", [{ source: "ما الخلية؟", english: "What is a cell?" }]))
      .toBe("What is a cell?\nWhat is a cell?");
  });

  it.each([
    { edits: [{ source: "سؤال غير موجود؟", english: "Missing?" }] },
    { edits: [{ source: "ما الخلية؟", english: "What is الخلية?" }] },
    { edits: [{ source: "ما الخلية؟ الجواب: وحدة الحياة.", english: "What is a cell?" }] },
    { edits: [{ source: "ما الخلية؟\nالشرح", english: "What is a cell?" }] },
    { edits: [{ source: "ما الخلية؟", english: "" }] },
    { edits: [{ source: "ما الخلية؟", english: "What is a cell?" }, { source: "الخلية؟", english: "A cell?" }] },
  ])("rejects unmatched, overlapping, incomplete and explanation-changing edits", ({ edits }) => {
    expect(() => applyQuestionTranslations("ما الخلية؟ الجواب: وحدة الحياة.", edits)).toThrow();
  });

  it("keeps every character in long lectures, including the final review section", async () => {
    const notes = `${"شرح علمي كامل.\r\n".repeat(3000)}## Review Questions\r\n1. ما الخلية؟\r\n`;
    const chunks = splitLectureNoteForTranslation(notes);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join("")).toBe(notes);
    const translate = vi.fn(async (chunk: string) => chunk.replace("ما الخلية؟", "What is a cell?"));
    const result = await translateLectureQuestions(notes, translate);
    expect(result).toBe(notes.replace("ما الخلية؟", "What is a cell?"));
    expect(translate).toHaveBeenCalledTimes(chunks.length);
  });

  it("retries an incomplete translation and rejects untranslated questions", async () => {
    const translate = vi.fn(async (chunk: string) => chunk);
    await expect(translateLectureQuestions("ما الخلية؟", translate)).rejects.toThrow("Some questions were not translated");
    expect(translate).toHaveBeenCalledTimes(2);
  });

  it("passes section context across chunk boundaries without adding it to the notes", async () => {
    const notes = `# Topic\n## Review Questions\n${"1. اذكر وظيفة الخلية.\n".repeat(1800)}`;
    const translate = vi.fn(async (chunk: string, _context: string) => chunk.split("اذكر وظيفة الخلية.").join("State the function of the cell."));
    const result = await translateLectureQuestions(notes, translate);
    expect(translate.mock.calls[1][1]).toBe("# Topic\n## Review Questions");
    expect(result).toBe(notes.split("اذكر وظيفة الخلية.").join("State the function of the cell."));
  });

  it("does not call AI when questions are already English", async () => {
    const translate = vi.fn();
    const notes = "What is a cell?\nالخلية هي وحدة الحياة.";
    expect(await translateLectureQuestions(notes, translate)).toBe(notes);
    expect(translate).not.toHaveBeenCalled();
  });
});
