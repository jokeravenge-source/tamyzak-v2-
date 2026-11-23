import { useEffect, useState } from "react";
import { Swords, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AppLanguage } from "@/components/LanguageGate";
import { readSessionPoll, royaleSubjectName, type RoyaleTopic, type SessionPoll } from "@/lib/sessionRoyale";
import StudyRoyale from "./StudyRoyale";

export default function SessionRoyalePanel({ language }: { language: AppLanguage }) {
  const ar = language === "ar";
  const t = (a: string, e: string) => ar ? a : e;
  const [poll, setPoll] = useState<SessionPoll | null>(null);
  const [battle, setBattle] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState("");
  const [curriculum, setCurriculum] = useState<AppLanguage>(language);
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (busy) return;
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (pending) return;
      pending = true;
      try {
        const value = await readSessionPoll();
        if (active) { setPoll(value); setNow(Date.now()); }
      } catch { /* An unavailable poll must never interrupt study. */ }
      finally { pending = false; }
    };
    const tick = () => {
      // Baghdad's three-hour slots align with UTC slots. The DB still decides the authoritative window.
      if (document.visibilityState === "visible" && Date.now() % (3 * 60 * 60_000) < 16 * 60_000) void refresh();
    };
    void refresh();
    const id = window.setInterval(tick, 8000);
    const onReturn = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    return () => { active = false; clearInterval(id); window.removeEventListener("focus", onReturn); document.removeEventListener("visibilitychange", onReturn); };
  }, [busy]);
  useEffect(() => {
    if (poll?.state !== "voting" && poll?.state !== "ready") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [poll?.state]);
  const closeKey = poll ? `tmz:closed-session-vote:${poll.id}` : "";
  const wasDismissed = (() => { try { return !!closeKey && sessionStorage.getItem(closeKey) === "1"; } catch { return false; } })();
  const voting = poll?.state === "voting" && now < Date.parse(poll.closes_at);
  const canJoin = poll?.state === "ready" && now < Date.parse(poll.starts_at);
  const visible = voting && !battle && dismissed !== poll.id && !wasDismissed && !poll.vote && poll.topics.length > 0;
  const dismiss = () => {
    if (!poll) return;
    setDismissed(poll.id);
    try { sessionStorage.setItem(closeKey, "1"); } catch { /* optional storage */ }
  };
  const reopen = () => {
    setDismissed("");
    try { sessionStorage.removeItem(closeKey); } catch { /* optional storage */ }
  };
  const selectTopics = poll?.state === "voting" ? poll.topics.filter((topic) => topic.language === curriculum) : [];
  const subjects = [...new Set(selectTopics.map((topic) => topic.subject))];
  const chapters = selectTopics.filter((topic) => topic.subject === subject).map((topic) => topic.chapter);
  const submit = async (vote: RoyaleTopic) => {
    setBusy(true); setError(false);
    try { setPoll(await readSessionPoll(vote)); }
    catch { setError(true); }
    finally { setBusy(false); }
  };
  if (battle) return <StudyRoyale key={battle} id={battle} language={language} onBack={() => setBattle(null)} />;
  if (!poll) return null;
  const select = "block min-h-11 w-full rounded-lg border bg-background px-3 text-base";
  return <section dir={ar ? "rtl" : "ltr"} className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
    <div className="min-w-0">
      <h2 className="flex items-center gap-2 font-extrabold"><Swords className="h-4 w-4 text-primary" />{t("تحدّي نهاية السشن", "End-of-session battle")}</h2>
      {poll.state === "ready"
        ? <p className="mt-1 text-sm text-muted-foreground">{royaleSubjectName(poll.subject, language)} · {t(`الفصل ${poll.chapter}`, `Chapter ${poll.chapter}`)} · {poll.language === "ar" ? t("المنهج العربي", "Arabic curriculum") : t("المنهج الإنكليزي", "English curriculum")}</p>
        : <p className="mt-1 text-sm text-muted-foreground">{poll.state === "no_votes" ? t("ماكو تصويت كافي لبدء جولة.", "No eligible votes were cast.") : poll.vote ? t("تسجّل صوتك.", "Your vote was saved.") : t("اختار المادة والفصل والمنهج.", "Choose the subject, chapter and curriculum.")}</p>}
    </div>
    {voting && !poll.vote && poll.topics.length > 0 && <Button variant="outline" onClick={reopen}><Vote className="me-2 h-4 w-4" />{t("صوّت", "Vote")}</Button>}
    {canJoin && <Button onClick={() => setBattle(poll.id)}>{t("انضم للتحدّي", "Join the battle")}</Button>}
    {poll.state === "ready" && !canJoin && <p className="text-sm text-muted-foreground">{t("انتهت مهلة الانضمام.", "The join window has closed.")}</p>}
    <Dialog open={visible} onOpenChange={(open) => { if (!open && !busy) dismiss(); }}>
      <DialogContent dir={ar ? "rtl" : "ltr"} className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl" onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader className="pe-6 text-start">
          <DialogTitle>{t("شنو تحب يكون تحدّي السشن؟", "What should the session battle be?")}</DialogTitle>
          <DialogDescription>{t("صوّت على المادة والفصل والمنهج. الاختيار اللي يجمع أكثر أصوات يصير الجولة الجاية.", "Vote for a subject, chapter and curriculum. The most-voted combination becomes the next round.")}</DialogDescription>
        </DialogHeader>
        {poll.state === "voting" && <p className="text-sm tabular-nums text-muted-foreground">{t("باقي على نهاية التصويت", "Voting closes in")} <bdi>{Math.max(0, Math.ceil((Date.parse(poll.closes_at) - now) / 1000))}</bdi> {t("ثانية", "seconds")}</p>}
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (voting && chapter && subject && !busy) void submit({ subject, chapter, language: curriculum }); }}>
          <label className="block space-y-1.5 text-sm font-semibold">{t("المنهج", "Curriculum")}
            <select className={select} value={curriculum} onChange={(e) => { setCurriculum(e.target.value as AppLanguage); setSubject(""); setChapter(0); }}>
              <option value="ar">{t("عربي", "Arabic")}</option><option value="en">{t("إنكليزي", "English")}</option>
            </select>
          </label>
          <label className="block space-y-1.5 text-sm font-semibold">{t("المادة", "Subject")}
            <select className={select} value={subject} disabled={!subjects.length} onChange={(e) => { setSubject(e.target.value); setChapter(0); }}>
              <option value="">{subjects.length ? t("اختار المادة", "Choose a subject") : t("ماكو أسئلة لهذا المنهج", "No bank questions for this curriculum")}</option>
              {subjects.map((value) => <option key={value} value={value}>{royaleSubjectName(value, language)}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm font-semibold">{t("الفصل", "Chapter")}
            <select className={select} value={chapter} disabled={!chapters.length} onChange={(e) => setChapter(Number(e.target.value))}>
              <option value={0}>{t("اختار الفصل", "Choose a chapter")}</option>
              {chapters.map((value) => <option key={value} value={value}>{t(`الفصل ${value}`, `Chapter ${value}`)}</option>)}
            </select>
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{t("تعذّر تسجيل صوتك. حاول مرة ثانية قبل لا ينغلق التصويت.", "Your vote could not be saved. Try again before voting closes.")}</p>}
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-11 flex-1" disabled={!chapter || !subject || !voting || busy}>{t("ثبّت صوتي", "Submit my vote")}</Button>
            <Button className="min-h-11" type="button" variant="ghost" disabled={busy} onClick={dismiss}>{t("كمّل دراسة", "Keep studying")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </section>;
}
