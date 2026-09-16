import { describe, expect, it } from "vitest";
import { getFlashcardChapters } from "@/data/flashcardChapters";
import { getMcqChapterGroups, resolveMcqChapter, validatedGeneratedChapter, type ChapteredMcq } from "@/lib/mcqChapters";
import { applyCurriculumChapter, curriculumInstructions, validSelectedChapter } from "../../supabase/functions/_shared/mcq-curriculum";

const row = (subject: string, chapter: number, chapter_title: string | null): ChapteredMcq => ({ id: `${subject}-${chapter}-${chapter_title}`, subject, chapter, chapter_title });

describe("shared flashcard chapter divisions", () => {
  it("retains all eight physics chapters and existing flashcard availability", () => {
    expect(getFlashcardChapters("physics").map(c => c.n)).toEqual([1,2,3,4,5,6,7,8]);
    expect(getFlashcardChapters("biology").find(c => c.n === 4)?.locked).toBe(true);
    expect(getFlashcardChapters("english").filter(c => !c.locked)).toHaveLength(3);
  });
  it("uses actual Arabic flashcard numbers, not ministerial-bank numbers", () => {
    expect(getFlashcardChapters("arabic").find(c => c.n === 6)?.arTitle).toBe("الاستفهام");
    expect(resolveMcqChapter(row("arabic", 2, "Istifham"))?.n).toBe(6);
    expect(resolveMcqChapter(row("arabic", 4, "أسلوب التعجب"))?.n).toBe(2);
    expect(resolveMcqChapter(row("arabic", 4, "التعجب"))?.n).toBe(2);
  });
  it("does not mislabel Islamic units as the Meanings flashcard chapter", () => {
    expect(getFlashcardChapters("islamic")[0].title).toBe("Meanings");
    expect(resolveMcqChapter(row("islamic", 1, "الوحدة الأولى"))).toBeNull();
    expect(resolveMcqChapter(row("islamic", 1, "المعاني"))?.n).toBe(1);
  });
  it("keeps chemistry's known numbers when its flashcard titles are generic", () => {
    expect(resolveMcqChapter(row("chemistry", 1, "Thermodynamics"))?.n).toBe(1);
  });
  it("does not guess from conflicting titles or unknown numbers", () => {
    expect(resolveMcqChapter(row("physics", 1, "Unknown topic"))).toBeNull();
    expect(resolveMcqChapter(row("physics", 99, null))).toBeNull();
    expect(resolveMcqChapter(row("arabic", 2, null))).toBeNull();
  });
  it("preserves every row once, with empty chapters visible and unknown rows separate", () => {
    const rows = [row("physics", 1, "Capacitors"), row("physics", 2, "Electromagnetic Induction"), row("physics", 99, "Other")];
    const groups = getMcqChapterGroups("physics", rows, "en");
    expect(groups).toHaveLength(9);
    expect(groups.flatMap(g => g.questionIds).sort()).toEqual(rows.map(r => r.id).sort());
    expect(groups.find(g => g.chapter === 3)?.count).toBe(0);
    expect(groups.at(-1)?.key).toBe("unclassified");
  });
  it("uses Arabic titles and preserves the separate English literature sections", () => {
    expect(getMcqChapterGroups("physics", [], "ar")[0].title).toBe("المتسعات");
    expect(getMcqChapterGroups("english_literature", [row("english_literature", 1, "Section 1"), row("english_literature", 2, "Section 2")], "en").map(g => g.title)).toEqual(["Section 1", "Section 2"]);
  });
  it("keeps English sections separate and allows MCQ classification even when flashcards are unavailable", () => {
    expect(getFlashcardChapters("english", "paragraphs")[0].title).toBe("Paragraphs");
    expect(validatedGeneratedChapter(8, "english", "grammar", null)).toBe(8);
    expect(validatedGeneratedChapter(1, "english", "literature", null)).toBeNull();
  });
  it("validates generated labels and supports explicitly chosen context on older deployments", () => {
    expect(validatedGeneratedChapter(99, "physics", "grammar", null)).toBeNull();
    expect(validatedGeneratedChapter("1", "physics", "grammar", null)).toBeNull();
    expect(validatedGeneratedChapter(2, "physics", "grammar", 1)).toBeNull();
    expect(validatedGeneratedChapter(undefined, "physics", "grammar", 1)).toBe(1);
    expect(validatedGeneratedChapter(undefined, "physics", "grammar", null)).toBeNull();
    expect(validatedGeneratedChapter(null, "physics", "grammar", 1)).toBeNull();
  });
});

describe("generation chapter contract", () => {
  const curriculum = { subject: "physics", chapter: null, chapters: getFlashcardChapters("physics") };
  it("accepts valid selections and rejects unknown or duplicate chapter numbers", () => {
    expect(validSelectedChapter(curriculum)).toBe(true);
    expect(validSelectedChapter({ ...curriculum, chapter: 99 })).toBe(false);
    expect(validSelectedChapter({ ...curriculum, chapters: [curriculum.chapters[0], curriculum.chapters[0]] })).toBe(false);
  });
  it("keeps correct choices and answers unchanged when assigning a chapter", () => {
    const q = { chapter: 1, choices: ["A", "B", "C", "D"], answer_index: 2 };
    expect(applyCurriculumChapter(q, curriculum)).toEqual(q);
    expect(applyCurriculumChapter({ ...q, chapter: 99 }, curriculum)).toEqual({ ...q, chapter: null });
    expect(applyCurriculumChapter({ ...q, chapter: 2 }, { ...curriculum, chapter: 1 }).chapter).toBeNull();
  });
  it("preserves older callers and requires source-grounded, non-guessed classifications", () => {
    const q = { chapter: undefined };
    expect(applyCurriculumChapter(q)).toBe(q);
    expect(curriculumInstructions()).toBe("");
    expect(curriculumInstructions(curriculum)).toContain("Never guess a chapter");
    expect(curriculumInstructions(curriculum)).toContain("facts absent from the source");
    expect(curriculumInstructions({ ...curriculum, chapter: 1 })).toContain("belong to chapter 1");
  });
});
