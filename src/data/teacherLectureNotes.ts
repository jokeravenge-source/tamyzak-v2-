import nadiaEnChapter3Lecture2 from "@/data/lectureNotes/nadia-en-ch3-lec2.md?raw";

export type CuratedTeacherLectureNote = {
  title: string;
  notes: string;
  createdAt: string;
};

const CURATED_TEACHER_LECTURE_NOTES: Record<string, CuratedTeacherLectureNote> = {
  "nadia-al-nuaimy:nadia-en-ch3-lec2-study": {
    title: "المحاضرة الثانية — تكوين النطف",
    notes: nadiaEnChapter3Lecture2,
    createdAt: "2026-10-17T00:37:23+03:00",
  },
};

export function getCuratedTeacherLectureNote(teacherId: string, topicKey: string) {
  return CURATED_TEACHER_LECTURE_NOTES[`${teacherId}:${topicKey}`] ?? null;
}
