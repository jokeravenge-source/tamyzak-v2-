import { SUBJECTS_ORDER, type BankSubject } from "@/data/subjectChapters";

export const STUDY_SUBJECT_FOCUS_KEY = "app_subject_focus_v1";
const STUDY_SUBJECT_FOCUS_EVENT = "app:open-subject";

export function parseStudySubject(value: unknown): BankSubject | null {
  return SUBJECTS_ORDER.find(subject => subject.code === value)?.code ?? null;
}

export function readStudySubjectFocus(): BankSubject | null {
  try { return parseStudySubject(window.localStorage.getItem(STUDY_SUBJECT_FOCUS_KEY)); }
  catch { return null; }
}

export function rememberStudySubjectFocus(subject: BankSubject | null) {
  try {
    if (subject) window.localStorage.setItem(STUDY_SUBJECT_FOCUS_KEY, subject);
    else window.localStorage.removeItem(STUDY_SUBJECT_FOCUS_KEY);
  } catch { /* session still works with storage disabled */ }
}

export function resetStudySubjectFocus() {
  rememberStudySubjectFocus(null);
  window.dispatchEvent(new CustomEvent(STUDY_SUBJECT_FOCUS_EVENT, { detail: { code: null } }));
}

export function subscribeStudySubjectFocus(setSubject: (subject: BankSubject | null) => void) {
  const onOpen = (event: Event) => {
    setSubject(parseStudySubject((event as CustomEvent<{ code?: unknown }>).detail?.code));
  };
  window.addEventListener(STUDY_SUBJECT_FOCUS_EVENT, onOpen);
  return () => window.removeEventListener(STUDY_SUBJECT_FOCUS_EVENT, onOpen);
}
