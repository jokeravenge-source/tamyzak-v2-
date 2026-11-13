import nadiaEnChapter3Lecture20 from "@/data/lectureNotes/nadia-en-ch3-lec20.md?raw";
import nadiaEnChapter3Lecture25 from "@/data/lectureNotes/nadia-en-ch3-lec25.md?raw";
import nadiaEnChapter3Lecture26 from "@/data/lectureNotes/nadia-en-ch3-lec26.md?raw";
import nadiaEnChapter3Lecture27 from "@/data/lectureNotes/nadia-en-ch3-lec27.md?raw";
import nadiaEnChapter3Lecture28 from "@/data/lectureNotes/nadia-en-ch3-lec28.md?raw";
import nadiaEnChapter3Lecture29 from "@/data/lectureNotes/nadia-en-ch3-lec29.md?raw";
import nadiaEnChapter3Lecture30 from "@/data/lectureNotes/nadia-en-ch3-lec30.md?raw";
import nadiaEnChapter3Lecture31 from "@/data/lectureNotes/nadia-en-ch3-lec31.md?raw";
import nadiaEnChapter3Lecture32 from "@/data/lectureNotes/nadia-en-ch3-lec32.md?raw";
import nadiaEnChapter3Lecture33 from "@/data/lectureNotes/nadia-en-ch3-lec33.md?raw";
import nadiaEnChapter3Lecture2 from "@/data/lectureNotes/nadia-en-ch3-lec2.md?raw";
import nadiaEnChapter3Lecture4 from "@/data/lectureNotes/nadia-en-ch3-lec4.md?raw";
import nadiaEnChapter3Lecture6 from "@/data/lectureNotes/nadia-en-ch3-lec6.md?raw";

export type CuratedTeacherLectureNote = {
  title: string;
  notes: string;
  createdAt: string;
  /** Missing source coverage must remain visible to students. */
  remainingCoverage?: string;
};

const CURATED_TEACHER_LECTURE_NOTES: Record<string, CuratedTeacherLectureNote> = {
  "nadia-al-nuaimy:nadia-en-ch3-lec20-study": {
    title: "Double Fertilization and Embryo Formation",
    notes: nadiaEnChapter3Lecture20,
    createdAt: "2026-11-13T00:00:00+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec25-study": {
    title: "Fertilization and Metamorphosis in Insects",
    notes: nadiaEnChapter3Lecture25,
    createdAt: "2026-11-13T00:00:00+03:00",
    remainingCoverage: "Source coverage is partial: insect fertilization and reproductive modes are summarized, but insect metamorphosis is not present in the uploaded handout.",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec26-study": {
    title: "Reproductive System of the Frog",
    notes: nadiaEnChapter3Lecture26,
    createdAt: "2026-11-13T00:00:00+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec27-study": {
    title: "Mating, Fertilization, and Metamorphosis in Frogs",
    notes: nadiaEnChapter3Lecture27,
    createdAt: "2026-11-13T00:00:00+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec28-study": {
    title: "Human Male Reproductive System",
    notes: nadiaEnChapter3Lecture28,
    createdAt: "2026-11-13T00:00:00+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec29-study": {
    title: "Human Sperm Structure and Transport",
    notes: nadiaEnChapter3Lecture29,
    createdAt: "2026-11-13T00:00:00+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec30-study": {
    title: "Human Fertilization, Implantation, and Pregnancy",
    notes: nadiaEnChapter3Lecture30,
    createdAt: "2026-11-13T00:00:00+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec31-study": {
    title: "Menstrual and Ovarian Cycle",
    notes: nadiaEnChapter3Lecture31,
    createdAt: "2026-11-13T00:00:00+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec32-study": {
    title: "Uterine Cycle",
    notes: nadiaEnChapter3Lecture32,
    createdAt: "2026-11-13T00:00:00+03:00",
  },
  "nadia-al-nuaimy:nadia-en-ch3-lec33-study": {
    title: "Parthenogenesis and Hermaphroditism",
    notes: nadiaEnChapter3Lecture33,
    createdAt: "2026-11-13T00:00:00+03:00",
  },

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
