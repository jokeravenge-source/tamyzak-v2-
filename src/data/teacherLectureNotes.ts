import nadiaEnChapter3Lecture2 from "@/data/lectureNotes/nadia-en-ch3-lec2.md?raw";
import nadiaEnChapter3Lecture4 from "@/data/lectureNotes/nadia-en-ch3-lec4.md?raw";
import nadiaEnChapter3Lecture6 from "@/data/lectureNotes/nadia-en-ch3-lec6.md?raw";

export type CuratedTeacherLectureNote = {
  title: string;
  notes: string;
  createdAt: string;
};

const CURATED_TEACHER_LECTURE_NOTES: Record<string, CuratedTeacherLectureNote> = {
  "nadia-al-nuaimy:nadia-en-ch3-lec2-study": {
    title: "Spermatogenesis",
    notes: nadiaEnChapter3Lecture2,
    createdAt: "2026-10-17T00:37:23+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec4-study": {
    title: "Viral Reproduction",
    notes: nadiaEnChapter3Lecture4,
    createdAt: "2026-10-17T00:47:45+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec6-study": {
    title: "Bacterial Conjugation",
    notes: nadiaEnChapter3Lecture6,
    createdAt: "2026-10-17T00:54:14+03:00",
  },
};

export function getCuratedTeacherLectureNote(teacherId: string, topicKey: string) {
  return CURATED_TEACHER_LECTURE_NOTES[`${teacherId}:${topicKey}`] ?? null;
}
