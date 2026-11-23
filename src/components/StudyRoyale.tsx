import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLanguage } from "@/components/LanguageGate";
import { getRoyale, royaleSubjectName, type RoyaleAction, type RoyaleState } from "@/lib/sessionRoyale";

export default function StudyRoyale({ id, language, onBack, existingMember = false }: {
  id: string; language: AppLanguage; onBack: () => void; existingMember?: boolean;
}) {
  const ar = language === "ar";
  const t = (a: string, e: string) => ar ? a : e;
  const [room, setRoom] = useState<RoyaleState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(existingMember);
  const [now, setNow] = useState(Date.now());
  const clockOffset = useRef(0);
  const request = useRef<RoyaleAction | null>(null);
  const generation = useRef(0);
  const load = useCallback(async (action: RoyaleAction, index?: number, choice?: number) => {
    if (request.current && (action === "status" || request.current !== "status")) return;
    const version = ++generation.current;
    request.current = action;
    if (action !== "status") setBusy(true);
    try {
      const result = await getRoyale(id, action, index, choice);
      if (version !== generation.current) return;
      if (result) {
        clockOffset.current = Date.parse(result.server_now) - Date.now();
        setNow(Date.now() + clockOffset.current);
        setRoom(result); setJoined(true); setError("");
      }
    } catch (e) {
      if (version === generation.current) setError(e instanceof Error ? e.message : "CONNECTION");
    } finally {
      if (version === generation.current) { request.current = null; setBusy(false); }
    }
  }, [id]);
  useEffect(() => () => { generation.current++; request.current = null; }, [id]);
  useEffect(() => { if (!existingMember) void load("join"); }, [existingMember, load]);
  const terminal = room?.state === "done" || room?.state === "closed";
  const playing = room?.state === "playing" || (room?.state === "lobby" && !!room.starts_at);
  useEffect(() => {
    if (!playing) return;
    const battleWindow = window as Window & { __battleLocked?: boolean };
    battleWindow.__battleLocked = true;
    window.dispatchEvent(new CustomEvent("app:battle-lock", { detail: { locked: true } }));
    return () => {
      battleWindow.__battleLocked = false;
      window.dispatchEvent(new CustomEvent("app:battle-lock", { detail: { locked: false } }));
    };
  }, [playing]);
  useEffect(() => {
    if (!joined || terminal) return;
    void load("status");
    const refresh = window.setInterval(() => { void load("status"); }, 1400);
    const clock = window.setInterval(() => setNow(Date.now() + clockOffset.current), 250);
    return () => { clearInterval(refresh); clearInterval(clock); };
  }, [joined, load, terminal]);
  const depart = () => {
    if (room?.state === "lobby") void getRoyale(id, "leave").catch(() => {});
    onBack();
  };
  const left = (until: string) => Math.max(0, Math.ceil((Date.parse(until) - now) / 1000));
  const errors: Record<string, string> = {
    ROOM_FULL: t("الغرفة امتلت.", "This room is full."),
    INVITE_REQUIRED: t("اقبل دعوة التحدّي أولاً.", "Accept the battle invitation first."),
    ROOM_NOT_AVAILABLE: t("مهلة الانضمام خلصت أو التحدّي انلغى.", "The join window ended or the battle was cancelled."),
    ROOM_MEMBERS_ONLY: t("انضم لغرفة تميّزك أولاً.", "Join the Tamayzak study room first."),
    NEED_TWO_PLAYERS: t("انتظر انضمام لاعب ثاني حتى تبدي.", "Wait for a second player before starting."),
  };
  return <section dir={ar ? "rtl" : "ltr"} className="min-w-0 space-y-5 rounded-2xl border bg-card p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xl font-extrabold"><Swords className="h-5 w-5 text-primary" />{t("باتل رويال", "Battle Royale")}</h2>
      <Button variant="outline" disabled={busy || playing} onClick={depart}>{t("رجوع", "Back")}</Button>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{errors[error] ?? t("تعذّر الاتصال بالتحدّي. حاول مرة ثانية.", "Could not reach the battle. Try again.")}</p>}
    {!room && !error && <p role="status" className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 motion-safe:animate-spin" />{t("جاري فتح الغرفة…", "Opening the room…")}</p>}
    {!room && error && <Button disabled={busy} onClick={() => void load(joined ? "status" : "join")}>{t("حاول مرة ثانية", "Try again")}</Button>}
    {room && <>
      <p className="text-sm text-muted-foreground">{royaleSubjectName(room.subject, language)} · {room.chapter ? t(`الفصل ${room.chapter}`, `Chapter ${room.chapter}`) : t("كل الفصول", "All chapters")} · {room.language === "ar" ? t("المنهج العربي", "Arabic curriculum") : t("المنهج الإنكليزي", "English curriculum")}</p>
      {room.state === "lobby" && <div className="space-y-3">
        <p className="text-base font-semibold">{room.starts_at ? t(`الجولة تبدي بعد ${left(room.starts_at)} ث`, `Starts in ${left(room.starts_at)}s`) : t("بانتظار المدعوّين", "Waiting for invited players")}</p>
        <p className="text-sm text-muted-foreground">{room.players.length}/11 {t("لاعبين", "players")}</p>
        {room.host && !room.starts_at && <Button disabled={busy || room.players.length < 2} onClick={() => void load("start")}>{t("ابدأ الجولة", "Start round")}</Button>}
      </div>}
      {room.state === "playing" && room.question && room.index !== null && room.deadline && <div className="space-y-3">
        <p className="flex justify-between gap-3 text-sm tabular-nums"><span>{t("السؤال", "Question")} {room.index + 1}/{room.total}</span><span>{left(room.deadline)} {t("ث", "s")}</span></p>
        <h3 dir="auto" className="whitespace-pre-wrap break-words text-lg font-bold">{room.question.q}</h3>
        {room.question.choices.map((choice, i) => <Button key={i} type="button" variant={room.picked === i ? "secondary" : "outline"} aria-pressed={room.picked === i} disabled={busy || room.picked !== null || !left(room.deadline!)}
          className="h-auto min-h-12 w-full justify-between whitespace-normal py-2 text-start" onClick={() => void load("answer", room.index!, i)}><span dir="auto" className="min-w-0 break-words">{choice}</span>{room.picked === i && <Check className="h-4 w-4 shrink-0" />}</Button>)}
        {room.picked !== null && <p role="status" className="text-sm text-muted-foreground">{t("تسجّل جوابك. السؤال الجاي يطلع من يخلص الوقت.", "Answer saved. The next question appears when time runs out.")}</p>}
      </div>}
      {room.state === "done" && <h3 className="text-lg font-bold">{t("الترتيب النهائي", "Final standings")}</h3>}
      {room.state === "closed" && <p role="status">{t("الجولة أُغلقت. لازم ينضم لاعبين على الأقل حتى تبدي.", "This round closed. At least two players are needed to begin.")}</p>}
      {room.state !== "closed" && <ol className="max-h-48 divide-y overflow-y-auto" aria-label={t("اللاعبون والنقاط", "Players and scores")}>
        {room.players.map((player) => <li key={player.user_id} className="flex justify-between gap-3 py-2 text-sm"><span dir="auto" className="min-w-0 break-words">{player.me ? t("أنت", "You") : player.name}</span>{room.state !== "lobby" && <b>{player.score}</b>}</li>)}
      </ol>}
    </>}
  </section>;
}
