import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Camera, CheckCircle2, ChevronDown, CircleHelp, Crown, FileImage, Link2, Loader2, Pause, Presentation, QrCode, RotateCcw, ScanLine, Volume2, X } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { usePodcastSpeech } from "@/hooks/usePodcastSpeech";
import { supabase } from "@/integrations/supabase/client";
import { edgeErrorMessage } from "@/lib/edgeError";
import { PREMIUM_ACCESS_CHANGED_EVENT } from "@/lib/premium";
import { readPaperCatalog } from "@/lib/paperReviewCatalog";
import { readPaperPhoto } from "@/lib/paperReviewPhoto";
import { PAPER_REVIEW_PATH, paperExerciseId, type PaperReviewAccess, type PaperReviewView } from "../../supabase/functions/_shared/paperReview";
import { PAPER_REVIEW_SUBJECTS, paperChapter, paperSubject, type PaperSubjectId } from "../../supabase/functions/_shared/paperReviewCurriculum";

const copy = {
  ar: {
    title: "ورقتك تحچي", back: "رجوع", subtitle: "صوّر سؤال ويّا حلّك المصحّح. متميّز يوضح الملاحظة على نفس الورقة، وبعدين تجرّب سؤال مشابه.",
    upload: "صوّر أو اختار صورة", loadingPhoto: "جاري تجهيز الصورة…", hint: "خلي السؤال والجواب واضحين بالصورة، وخلي اسمك خارجها.",
    photo: "صورة السؤال والحل", remove: "احذف الصورة", review: "حلّل الصورة", reviewing: "متميّز دا يراجع الورقة…",
    limit: "حصة اليوم استُخدمت", pending: "أكو صورة دا تنحلّل", daily: "صورة متاحة اليوم", premium: "بريميوم · صور متعددة",
    resets: "الحصة المجانية تتجدّد بنص الليل بتوقيت بغداد.", upgrade: "افتح بريميوم", access: "جاري التحقق من الحصة…", refresh: "حدّث الحصة",
    findings: "ملاحظات على الورقة", teacherMark: "علامة بالورقة", suggestion: "توضيح متميّز", location: "روح إلى الملاحظة",
    listen: "اسمع التوضيح", pause: "وقف الصوت", resume: "كمّل الصوت", audioError: "تعذّر تشغيل الصوت. التوضيح مكتوب هنا.",
    tryPractice: "جرّب سؤال مشابه", check: "تحقق من إجابتي", checking: "جاري التحقق…", correct: "إجابة صحيحة وانحفظت بتقدّمك",
    incorrect: "راجع التوضيح وحاول مرّة ثانية", practiced: "تمرين انحلّ صح", another: "راجع صورة ثانية",
    subject: "المادة", anySubject: "بدون تحديد مادة", chapter: "الفصل أو الموضوع", anyChapter: "بدون تحديد فصل",
    exercise: "تمرين من هذا الفصل", own: "سؤالي من الورقة", arabic: "المنهج العربي", distinguished: "المتميزين",
    loadingExercises: "جاري تحميل التمارين…", noExercises: "ماكو تمارين جاهزة بهالفصل حالياً. تگدر تراجع سؤالك من الصورة.",
    catalog_unavailable: "تعذّر تحميل التمارين.", retryCatalog: "أعد التحميل", exercise_missing: "هذا التمرين غير متاح هسه.",
    teacher: "رابط المشاركة للمدرّس", copyLink: "انسخ الرابط",
    copied: "اننسخ الرابط", copyManually: "انسخ الرابط من الحقل", qr: "حمّل QR الميزة",
    invalid_image: "تعذّر فتح الصورة. جرّب صورة JPEG أو PNG واضحة.",
    image_too_large: "الصورة كبيرة. جرّب صورة أصغر أو قصّها على سؤال واحد.",
    review_unavailable: "تعذّر إكمال التحليل هسه. حاول مرة ثانية بنفس الصورة.",
    access_unavailable: "تعذّر التحقق من حصة الصور. اضغط حدّث الحصة وحاول مرة ثانية.",
    daily_limit: "استعملت صورة اليوم. تكدر ترجع باچر أو تفتح بريميوم.",
    rate_limit: "انتظر شوي قبل المحاولة الجاية.",
    auth_required: "سجّل دخولك حتى تراجع ورقتك.",
    conflict: "تغيّرت الصورة أو تفاصيل السؤال. اختار الصورة مرة ثانية.",
    practice_missing: "تعذّر فتح التمرين هسه.",
  },
  en: {
    title: "Paper Review", back: "Back", subtitle: "Photograph one question and your marked solution. Mutamayiz explains the feedback on your paper and gives you a similar question.",
    upload: "Take or choose a photo", loadingPhoto: "Preparing your photo…", hint: "Keep the question and answer in view, and leave your name out of the photo.",
    photo: "Photo of your question and answer", remove: "Remove photo", review: "Review photo", reviewing: "Mutamayiz is reviewing your paper…",
    limit: "Today’s free photo was used", pending: "A photo is being reviewed", daily: "One photo available today", premium: "Premium · multiple photos",
    resets: "Your free photo renews at midnight Baghdad time.", upgrade: "Open Premium", access: "Checking your photo allowance…", refresh: "Refresh allowance",
    findings: "Feedback on your paper", teacherMark: "Visible mark", suggestion: "Mutamayiz explains", location: "Go to note",
    listen: "Listen to the explanation", pause: "Pause audio", resume: "Resume audio", audioError: "Audio is unavailable. You can read the explanation here.",
    tryPractice: "Try a similar question", check: "Check my answer", checking: "Checking…", correct: "Correct. Your progress was saved.",
    incorrect: "Read the explanation and try again", practiced: "practice questions solved", another: "Review another photo",
    subject: "Subject", anySubject: "No subject selected", chapter: "Chapter or topic", anyChapter: "No chapter selected",
    exercise: "Exercise from this chapter", own: "Use the question on my paper", arabic: "Arabic curriculum", distinguished: "Distinguished curriculum",
    loadingExercises: "Loading exercises…", noExercises: "This chapter has no prepared exercises yet. You can review a question from your own photo.",
    catalog_unavailable: "Could not load the exercises.", retryCatalog: "Reload", exercise_missing: "This exercise is currently unavailable.",
    teacher: "Share a link with students", copyLink: "Copy link",
    copied: "Link copied", copyManually: "Copy the link from the field", qr: "Download the tool QR",
    invalid_image: "Could not open this image. Try a clear JPEG or PNG photo.",
    image_too_large: "This photo is too large. Try a smaller image or crop to one question.",
    review_unavailable: "Could not finish the review. Retry with the same image.",
    access_unavailable: "Could not check your photo allowance. Refresh it to try again.",
    daily_limit: "Today’s free photo was used. Come back tomorrow or open Premium.",
    rate_limit: "Wait a moment before trying again.",
    auth_required: "Sign in to review your paper.",
    conflict: "The photo or question details changed. Choose the photo again.",
    practice_missing: "Could not open this practice question.",
  },
} as const;

type Photo = { url: string; id: string };
type PaperSource = { subject: PaperSubjectId | null; chapter: string | null; exerciseId: string };
type PracticeAnswer = { correct: boolean; explanation: string };
type ReviewResponse = {
  access?: PaperReviewAccess;
  report?: PaperReviewView;
  practicePassed?: boolean;
  answer?: PracticeAnswer;
  error?: string;
};

async function paperRequest(body: Record<string, unknown>, signal: AbortSignal) {
  const { data, error } = await supabase.functions.invoke<ReviewResponse>("paper-review", { body, signal, timeout: 50_000 });
  if (error) throw new Error(await edgeErrorMessage(error, "review_unavailable"));
  if (!data) throw new Error("review_unavailable");
  return data;
}

const actionError = (value: unknown) => value instanceof Error ? value.message : "review_unavailable";

export default function PaperReview({ language, initialSubject, initialChapter, initialExercise, onBack, onUpgrade }: {
  language: AppLanguage;
  initialSubject?: string | null;
  initialChapter?: string | null;
  initialExercise?: string | null;
  onBack: () => void;
  onUpgrade: () => void;
}) {
  const ar = language === "ar";
  const text = copy[language];
  const [access, setAccess] = useState<PaperReviewAccess | null>(null);
  const [accessError, setAccessError] = useState(false);
  const [selection, setSelection] = useState<PaperSource | null>(null);
  const linkedId = paperExerciseId(initialExercise) ? initialExercise : "";
  const linkedCatalog = useQuery({
    queryKey: ["paper-review-catalog", "exercise", linkedId, language],
    queryFn: ({ signal }) => readPaperCatalog({ exerciseId: linkedId }, language, signal),
    enabled: !!linkedId && !selection,
    retry: false,
  });
  const linkedExercise = linkedCatalog.data?.find(exercise => exercise.id === linkedId);
  const routeSubject = paperSubject(initialSubject ?? (initialChapter ? "physics" : null));
  const { subject, chapter, exerciseId } = selection ?? {
    subject: linkedExercise?.subject ?? routeSubject?.id ?? null,
    chapter: linkedExercise?.chapter ?? paperChapter(routeSubject, initialChapter)?.key ?? null,
    exerciseId: linkedExercise?.id ?? "",
  };
  const currentSubject = paperSubject(subject);
  const openingLink = !selection && !!linkedId && linkedCatalog.isPending;
  const useLinkedCatalog = !!linkedExercise && linkedExercise.subject === subject && linkedExercise.chapter === chapter;
  const chapterCatalog = useQuery({
    queryKey: ["paper-review-catalog", "chapter", subject, chapter, language],
    queryFn: ({ signal }) => readPaperCatalog({ subject: subject!, chapter: chapter! }, language, signal),
    enabled: !!subject && !!chapter && !useLinkedCatalog && !openingLink,
    retry: false,
  });
  const activeCatalog = useLinkedCatalog ? linkedCatalog : chapterCatalog;
  const chapterExercises = activeCatalog.data ?? [];
  const currentExercise = chapterExercises.find(exercise => exercise.id === exerciseId);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [attempted, setAttempted] = useState("");
  const [report, setReport] = useState<PaperReviewView | null>(null);
  const [busy, setBusy] = useState<"review" | "answer" | null>(null);
  const [finding, setFinding] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [answer, setAnswer] = useState<PracticeAnswer | null>(null);
  const [error, setError] = useState("");
  const [audioError, setAudioError] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const fileRevision = useRef(0);
  const accessRequest = useRef<AbortController | null>(null);
  const actionRequest = useRef<AbortController | null>(null);
  const speech = usePodcastSpeech();

  const refreshAccess = useCallback(async () => {
    accessRequest.current?.abort();
    const controller = new AbortController();
    accessRequest.current = controller;
    setAccessError(false);
    try {
      const data = await paperRequest({ mode: "status" }, controller.signal);
      if (controller.signal.aborted) return;
      if (!data.access) throw new Error("access_unavailable");
      setAccess(data.access);
    } catch {
      if (!controller.signal.aborted) setAccessError(true);
    }
  }, []);

  useEffect(() => {
    void refreshAccess();
    const refresh = () => { void refreshAccess(); };
    window.addEventListener("focus", refresh);
    window.addEventListener(PREMIUM_ACCESS_CHANGED_EVENT, refresh);
    return () => {
      fileRevision.current++;
      accessRequest.current?.abort();
      actionRequest.current?.abort();
      window.removeEventListener("focus", refresh);
      window.removeEventListener(PREMIUM_ACCESS_CHANGED_EVENT, refresh);
    };
  }, [refreshAccess]);

  useEffect(() => {
    const wait = Date.parse(access?.resetAt ?? "") - Date.now();
    if (!Number.isFinite(wait) || wait <= 0 || wait > 86_401_000) return;
    const timeout = window.setTimeout(() => void refreshAccess(), wait + 250);
    return () => window.clearTimeout(timeout);
  }, [access?.resetAt, refreshAccess]);

  useEffect(() => {
    if (report) resultHeading.current?.focus({ preventScroll: true });
  }, [report]);

  const readFile = async (file: File) => {
    const revision = ++fileRevision.current;
    setPhotoBusy(true);
    setError("");
    setPhoto(null);
    try {
      const url = await readPaperPhoto(file);
      if (fileRevision.current === revision) setPhoto({ url, id: crypto.randomUUID() });
    } catch (reason) {
      if (fileRevision.current === revision) setError(actionError(reason));
    } finally {
      if (fileRevision.current === revision) setPhotoBusy(false);
    }
  };

  const beginAction = (kind: "review" | "answer") => {
    if (actionRequest.current) return null;
    const controller = new AbortController();
    actionRequest.current = controller;
    setBusy(kind);
    setError("");
    return controller;
  };

  const endAction = (controller: AbortController) => {
    if (actionRequest.current === controller && !controller.signal.aborted) {
      actionRequest.current = null;
      setBusy(null);
    }
  };

  const quotaAvailable = access?.premium || access?.remaining === 1;
  const canReview = !!photo && !photoBusy && !busy && !openingLink && !!access && (quotaAvailable || attempted === photo.id);

  const changeSource = (next: PaperSource) => {
    setSelection(next);
    setShareNotice("");
    setError("");
    if (photo) setPhoto({ ...photo, id: crypto.randomUUID() });
  };

  const review = async () => {
    if (!photo || !canReview) return;
    const controller = beginAction("review");
    if (!controller) return;
    setAttempted(photo.id);
    try {
      const data = await paperRequest({ mode: "review", image: photo.url, requestId: photo.id, subject, chapter, exercise: exerciseId, language }, controller.signal);
      if (controller.signal.aborted) return;
      if (data.access) setAccess(data.access);
      if (!data.report) throw new Error(data.error ?? "review_unavailable");
      if (!data.access) setAccess(current => current && !current.premium ? { ...current, remaining: 0, pending: false } : current);
      setFinding(0);
      setPassed(data.practicePassed === true);
      setReport(data.report);
    } catch (reason) {
      if (!controller.signal.aborted) setError(actionError(reason));
    } finally {
      endAction(controller);
      if (!controller.signal.aborted) void refreshAccess();
    }
  };

  const checkPractice = async (event: FormEvent) => {
    event.preventDefault();
    if (picked === null || passed || !photo) return;
    const controller = beginAction("answer");
    if (!controller) return;
    try {
      const data = await paperRequest({ mode: "answer", requestId: photo.id, choice: picked }, controller.signal);
      if (controller.signal.aborted) return;
      if (!data.answer) throw new Error(data.error ?? "practice_missing");
      setAnswer(data.answer);
      if (data.answer.correct) {
        setPassed(true);
        void refreshAccess();
      }
    } catch (reason) {
      if (!controller.signal.aborted) setError(actionError(reason));
    } finally {
      endAction(controller);
    }
  };

  const selectFinding = (index: number, scroll: boolean) => {
    speech.stop();
    setAudioError(false);
    setFinding(index);
    if (scroll) requestAnimationFrame(() => marker.current?.scrollIntoView?.({ block: "nearest" }));
  };

  const newPhoto = () => {
    speech.stop();
    setPhoto(null);
    setReport(null);
    setFinding(0);
    setPicked(null);
    setPassed(false);
    setAnswer(null);
    setError("");
    setAudioError(false);
    window.scrollTo({ top: 0 });
  };

  const toggleSpeech = () => {
    const current = report?.findings[finding];
    if (!current) return;
    setAudioError(false);
    if (speech.paused) speech.resume();
    else if (speech.active) speech.pause();
    else speech.play(current.explanation, { onEnd: () => {}, onError: () => setAudioError(true) });
  };

  const teacherLink = new URL(PAPER_REVIEW_PATH, window.location.origin);
  if (exerciseId) teacherLink.searchParams.set("exercise", exerciseId);
  else {
    if (subject) teacherLink.searchParams.set("subject", subject);
    if (chapter) teacherLink.searchParams.set("chapter", chapter);
  }
  const activeFinding = report?.findings[finding];
  const knownError = error === "pending" ? text.pending : error && Object.prototype.hasOwnProperty.call(text, error)
    ? text[error as keyof typeof text] : error ? text.review_unavailable : "";
  const allowance = access?.premium ? text.premium : !access ? text.access
    : access.pending ? text.pending : access.remaining ? text.daily : text.limit;

  return (
    <main dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 pb-24 text-foreground sm:px-6">
      <div className="mx-auto max-w-5xl space-y-5 pt-4 sm:pt-7">
        <Button type="button" variant="outline" onClick={onBack} className="min-h-11 rounded-xl">
          <ArrowLeft className={ar ? "rotate-180" : undefined} />{text.back}
        </Button>

        <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-blue-400/25 bg-[#142b51] px-4 py-5 text-white shadow-[0_24px_58px_-38px_rgba(24,55,112,.8)] sm:p-7">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#236bbd80,transparent_60%)]" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="grid size-11 place-items-center rounded-2xl border border-white/20 bg-white/10"><ScanLine aria-hidden="true" className="size-6" /></span>
            <span className="inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold sm:text-sm" role="status">
              {access?.premium ? <Crown aria-hidden="true" className="size-4 text-amber-200" /> : <FileImage aria-hidden="true" className="size-4" />}{allowance}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{text.title}</h1>
          <p className="mt-2 max-w-[40rem] text-sm leading-7 text-slate-100 sm:text-base">{text.subtitle}</p>
          {!!access?.completedPractices && <p className="mt-2 text-sm font-bold text-cyan-100">{access.completedPractices.toLocaleString(ar ? "ar-IQ" : "en")} {text.practiced}</p>}
        </header>

        {accessError && <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
          <p role="alert" className="min-w-0 flex-1 text-sm text-destructive">{text.access_unavailable}</p>
          <Button type="button" variant="outline" onClick={() => void refreshAccess()} className="min-h-11 rounded-xl">{text.refresh}</Button>
        </div>}
        {access && !access.premium && access.remaining === 0 && <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
          <p className="max-w-full text-sm leading-6 text-foreground">{access.pending ? text.pending : text.resets}</p>
          <Button type="button" variant="outline" onClick={access.pending ? () => void refreshAccess() : onUpgrade} className="min-h-11 rounded-xl">
            {access.pending ? <RotateCcw /> : <Crown />}{access.pending ? text.refresh : text.upgrade}
          </Button>
        </div>}

        {report && photo ? (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
            <figure className="min-w-0 overflow-hidden rounded-2xl border border-border bg-muted/40">
              <div className="max-h-[66dvh] overflow-auto overscroll-contain">
                <div className="relative">
                  <img src={photo.url} alt={text.photo} className="block w-full" />
                  {report.findings.map(({ location }, index) => location && (
                    <div key={index} ref={finding === index ? marker : undefined}
                      className={`absolute rounded-md border-2 ${finding === index ? "z-10 border-sky-600 bg-sky-400/20 ring-2 ring-white/95" : "border-sky-600/55 bg-sky-300/10"}`}
                      style={{ top: location[0] / 10 + "%", left: location[1] / 10 + "%", height: (location[2] - location[0]) / 10 + "%", width: (location[3] - location[1]) / 10 + "%" }}>
                      <button type="button" aria-label={text.location + " " + (index + 1)} onClick={() => selectFinding(index, false)}
                        className="absolute -top-3 left-0 grid size-8 min-h-8 place-items-center rounded-full bg-blue-800 text-xs font-black text-white ring-2 ring-white">{index + 1}</button>
                    </div>
                  ))}
                </div>
              </div>
            </figure>
            <div className="min-w-0 space-y-4">
              <section className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <h2 ref={resultHeading} tabIndex={-1} className="text-lg font-black outline-none">{text.findings}</h2>
                <p className="text-sm leading-7 [overflow-wrap:anywhere]" dir="auto">{report.summary}</p>
                {report.skill && <p className="text-xs font-bold text-primary" dir="auto">{report.skill}</p>}
                {report.findings.length > 0 && <div className="grid gap-2">
                  {report.findings.map((note, index) => (
                    <button type="button" key={index} aria-pressed={finding === index} onClick={() => selectFinding(index, true)}
                      className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-border px-3 py-2 text-start text-sm aria-pressed:border-primary/50 aria-pressed:bg-primary/10">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">{index + 1}</span>
                      <bdi className="min-w-0 flex-1 font-semibold [overflow-wrap:anywhere]">{note.excerpt}</bdi>
                    </button>
                  ))}
                </div>}
                {activeFinding && <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-bold text-primary">{activeFinding.kind === "teacher-mark" ? text.teacherMark : text.suggestion}</p>
                  <p className="text-sm leading-7 [overflow-wrap:anywhere]" dir="auto">{activeFinding.explanation}</p>
                  {ar && <Button type="button" variant="outline" onClick={toggleSpeech} className="min-h-11 rounded-xl">
                    {speech.active && !speech.paused ? <Pause /> : <Volume2 />}
                    {speech.paused ? text.resume : speech.active ? text.pause : text.listen}
                  </Button>}
                  {audioError && <p role="status" className="text-sm text-muted-foreground">{text.audioError}</p>}
                </div>}
              </section>

              {report.practice && <form className="space-y-3 rounded-2xl border border-primary/25 bg-card p-4 sm:p-5" onSubmit={checkPractice}>
                <h2 className="flex items-center gap-2 text-lg font-black"><CircleHelp aria-hidden="true" className="size-5 text-primary" />{text.tryPractice}</h2>
                <fieldset className="min-w-0 space-y-2" disabled={passed || busy === "answer"}>
                  <legend className="mb-2 text-sm font-semibold leading-7 [overflow-wrap:anywhere]" dir="auto">{report.practice.question}</legend>
                  {report.practice.choices.map((option, index) => <label key={option}
                    className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-border p-3 text-sm has-[:checked]:border-primary/55 has-[:checked]:bg-primary/10">
                    <input type="radio" name="paper-practice" value={index} checked={picked === index} className="size-4 shrink-0 accent-primary"
                      onChange={() => { setPicked(index); setAnswer(null); }} />
                    <bdi className="min-w-0 [overflow-wrap:anywhere]">{option}</bdi>
                  </label>)}
                </fieldset>
                {passed
                  ? <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-bold"><CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />{text.correct}</p>
                  : <Button type="submit" disabled={picked === null || busy !== null} className="min-h-11 w-full rounded-xl">{busy === "answer" ? text.checking : text.check}</Button>}
                {answer && <p role="status" className="text-sm leading-7 text-muted-foreground" dir="auto">{!answer.correct && text.incorrect + ". "}{answer.explanation}</p>}
              </form>}
              {quotaAvailable && <Button type="button" variant="outline" onClick={newPhoto} disabled={!!busy} className="min-h-11 rounded-xl"><Camera />{text.another}</Button>}
            </div>
          </div>
        ) : (
          <section className="space-y-4 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm sm:p-6">
            <input ref={upload} type="file" accept="image/*" hidden onChange={event => {
              if (event.target.files?.[0]) void readFile(event.target.files[0]);
              event.currentTarget.value = "";
            }} />
            {photo ? (
              <div className="relative min-w-0 overflow-hidden rounded-2xl border border-border bg-muted">
                <img src={photo.url} alt={text.photo} className="mx-auto block max-h-[46dvh] w-auto max-w-full object-contain" />
                <Button type="button" variant="outline" size="icon" aria-label={text.remove} disabled={!!busy}
                  onClick={() => { setPhoto(null); setError(""); }} className="absolute end-2 top-2 size-11 rounded-xl"><X /></Button>
              </div>
            ) : (
              <button type="button" onClick={() => upload.current?.click()} disabled={photoBusy || !quotaAvailable}
                className="grid min-h-40 w-full place-content-center justify-items-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-5 text-center transition-colors hover:bg-primary/10 disabled:opacity-65">
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  {photoBusy ? <Loader2 className="size-6 animate-spin" /> : <Camera className="size-6" />}
                </span>
                <span className="font-black text-foreground">{photoBusy ? text.loadingPhoto : text.upload}</span>
                <span className="text-xs leading-6 text-muted-foreground">{text.hint}</span>
              </button>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <label htmlFor="paper-subject" className="flex items-center gap-2 text-sm font-semibold"><BookOpen aria-hidden="true" className="size-4 text-primary" />{text.subject}</label>
                <select id="paper-subject" value={subject ?? ""} disabled={!!busy}
                  onChange={event => changeSource({ subject: paperSubject(event.target.value)?.id ?? null, chapter: null, exerciseId: "" })}
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground">
                  <option value="">{text.anySubject}</option>
                  {PAPER_REVIEW_SUBJECTS.map(item => <option key={item.id} value={item.id}>{item[language]}</option>)}
                </select>
              </div>
              {currentSubject && <div className="min-w-0 space-y-2">
                <label htmlFor="paper-chapter" className="block text-sm font-semibold">{text.chapter}</label>
                <select id="paper-chapter" value={chapter ?? ""} disabled={!!busy}
                  onChange={event => changeSource({ subject, chapter: paperChapter(currentSubject, event.target.value)?.key ?? null, exerciseId: "" })}
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground">
                  <option value="">{text.anyChapter}</option>
                  {currentSubject.chapters.map(item => <option key={item.key} value={item.key}>{item[language]}</option>)}
                </select>
              </div>}
            </div>

            {(openingLink || (chapter && activeCatalog.isPending)) && <p role="status" className="text-sm text-muted-foreground">{text.loadingExercises}</p>}
            {!selection && linkedId && linkedCatalog.isSuccess && !linkedExercise && <p role="status" className="text-sm text-muted-foreground">{text.exercise_missing}</p>}
            {((!selection && linkedId && linkedCatalog.isError) || (chapter && activeCatalog.isError)) && (
              <div className="flex flex-wrap items-center gap-2">
                <p role="status" className="text-sm text-muted-foreground">{text.catalog_unavailable}</p>
                <Button type="button" variant="outline" onClick={() => void (!selection && linkedId && linkedCatalog.isError ? linkedCatalog : activeCatalog).refetch()}>{text.retryCatalog}</Button>
              </div>
            )}
            {chapter && activeCatalog.isSuccess && chapterExercises.length === 0 && <p className="text-sm leading-6 text-muted-foreground">{text.noExercises}</p>}

            {chapterExercises.length > 0 && <div className="space-y-2">
              <label htmlFor="paper-exercise" className="text-sm font-semibold">{text.exercise}</label>
              <select id="paper-exercise" value={exerciseId} disabled={!!busy}
                onChange={event => changeSource({ subject, chapter, exerciseId: event.target.value })}
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground">
                <option value="">{text.own}</option>
                {chapterExercises.map(exercise => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.title}{exercise.curriculum !== "shared" ? " · " + text[exercise.curriculum] : ""}
                  </option>
                ))}
              </select>
              {currentExercise && <p className="whitespace-pre-wrap break-words rounded-xl bg-muted/50 p-3 text-sm leading-7" dir="auto">{currentExercise.question}</p>}
            </div>}

            <Button type="button" disabled={!canReview} onClick={() => void review()} className="min-h-12 w-full rounded-xl font-bold">
              {busy === "review" ? <Loader2 className="animate-spin" /> : <Presentation />}{busy === "review" ? text.reviewing : text.review}
            </Button>
          </section>
        )}
        {knownError && <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm leading-6 text-destructive">{knownError}</p>}

        <details className="group rounded-2xl border border-border bg-card p-3.5 sm:p-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-bold [&::-webkit-details-marker]:hidden">
            <Link2 aria-hidden="true" className="size-4 text-primary" /><span className="min-w-0 flex-1">{text.teacher}</span><ChevronDown aria-hidden="true" className="size-4 group-open:rotate-180" />
          </summary>
          <div className="space-y-2 pt-2">
            <input readOnly aria-label={text.teacher} dir="ltr" value={teacherLink.href} onFocus={event => event.target.select()}
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="min-h-11 rounded-xl" onClick={() => {
                void navigator.clipboard?.writeText(teacherLink.href).then(() => setShareNotice(text.copied)).catch(() => setShareNotice(text.copyManually));
                if (!navigator.clipboard) setShareNotice(text.copyManually);
              }}><Link2 />{text.copyLink}</Button>
              <Button asChild type="button" variant="outline" className="min-h-11 rounded-xl">
                <a aria-label={text.qr} href="/paper-review-qr.svg" download="Tamayzak-Paper-Review-QR.svg"><QrCode />{text.qr}</a>
              </Button>
            </div>
            {shareNotice && <p role="status" className="text-sm text-muted-foreground">{shareNotice}</p>}
          </div>
        </details>
      </div>
    </main>
  );
}
