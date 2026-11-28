import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Timer, X } from "lucide-react";
import { formatStudyTimer, STUDY_SESSION_STORAGE_KEY, timerDisplayFromPersistedSession } from "@/lib/studyTimerDisplay";
import { STUDY_TIMER_CHANGED } from "@/hooks/useStudyTimerPresence";

export const OPEN_FLOATING_STUDY_TIMER = "tamayzak:open-floating-study-timer";
type DocPiP = { requestWindow: (options: { width: number; height: number }) => Promise<Window> };
type VideoPiP = HTMLVideoElement & { requestPictureInPicture?: () => Promise<unknown> };
type PiPDocument = Document & { pictureInPictureEnabled?: boolean; pictureInPictureElement?: Element | null; exitPictureInPicture?: () => Promise<void> };
type Snapshot = { time: string; phase: "focus" | "rest" | "paused"; subject: string };
const SUBJECTS: Record<string, [string, string]> = { general:["General","عام"], physics:["Physics","الفيزياء"], chemistry:["Chemistry","الكيمياء"], biology:["Biology","الأحياء"], math:["Math","الرياضيات"], arabic:["Arabic","العربية"], english:["English","الإنجليزية"], french:["French","الفرنسية"], islamic:["Islamic","الإسلامية"] };

function readSnapshot(user: string | null, ar: boolean): Snapshot | null {
  if (!user) return null;
  try {
    const saved = JSON.parse(localStorage.getItem(STUDY_SESSION_STORAGE_KEY) ?? "null");
    if (!saved || (typeof saved.userId === "string" && saved.userId !== user)) return null;
    const clock = timerDisplayFromPersistedSession(saved);
    if (!clock) return null;
    return { time: formatStudyTimer(clock.seconds), phase: saved.pomodoro === true && saved.phase === "rest" ? "rest" : clock.isRunning ? "focus" : "paused", subject: SUBJECTS[saved.subject]?.[ar ? 1 : 0] ?? (ar ? "جلسة دراسة" : "Study session") };
  } catch { return null; }
}

function status(phase: Snapshot["phase"], ar: boolean) {
  return ar ? ({ focus: "تركيز", rest: "استراحة", paused: "متوقف مؤقتاً" })[phase] : ({ focus: "Focusing", rest: "Break", paused: "Paused" })[phase];
}

export default function FloatingStudyTimer({ user, language, inSessions, onReturn }: { user: string | null; language: "ar" | "en"; inSessions: boolean; onReturn: () => void }) {
  const ar = language === "ar";
  const [snapshot, setSnapshot] = useState<Snapshot | null>(() => readSnapshot(user, ar));
  const [external, setExternal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const pip = useRef<Window | null>(null);
  const media = useRef<{ video: VideoPiP; stream: MediaStream; canvas: HTMLCanvasElement } | null>(null);
  const opening = useRef(false);
  const grace = useRef(0);
  const returnRef = useRef(onReturn);
  returnRef.current = onReturn;
  const close = useCallback(() => {
    const popup = pip.current;
    pip.current = null;
    if (popup && !popup.closed) popup.close();
    const active = media.current;
    media.current = null;
    if (active) {
      const doc = document as PiPDocument;
      if (doc.pictureInPictureElement === active.video) void doc.exitPictureInPicture?.().catch(() => {});
      active.video.pause();
      active.stream.getTracks().forEach(track => track.stop());
      active.video.srcObject = null;
      active.video.remove();
    }
    setExternal(false);
  }, []);

  const paint = useCallback((value: Snapshot | null) => {
    const v = value ?? { time: "00:00:00", phase: "focus" as const, subject: ar ? "جلسة دراسة" : "Study session" };
    if (pip.current && !pip.current.closed) {
      const d = pip.current.document;
      const time = d.getElementById("tmz-time");
      const detail = d.getElementById("tmz-detail");
      if (time) time.textContent = v.time;
      if (detail) detail.textContent = v.subject + " · " + status(v.phase, ar);
    }
    const canvas = media.current?.canvas;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = "#17152a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center"; ctx.fillStyle = "#c4b5fd"; ctx.font = "bold 23px sans-serif";
      ctx.fillText("TAMAYZAK", 240, 35);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 66px monospace"; ctx.fillText(v.time, 240, 114);
      ctx.fillStyle = v.phase === "rest" ? "#facc80" : "#a7f3d0"; ctx.font = "24px sans-serif";
      ctx.fillText(v.subject + " · " + status(v.phase, ar), 240, 159, 450);
    }
  }, [ar]);

  const open = useCallback(async () => {
    if (!user || opening.current || (pip.current && !pip.current.closed) || media.current) return;
    opening.current = true;
    grace.current = Date.now() + 5000;
    setDismissed(false);
    setUnavailable(false);
    try {
      const api = (window as Window & { documentPictureInPicture?: DocPiP }).documentPictureInPicture;
      if (api) {
        const win = await api.requestWindow({ width: 300, height: 190 });
        pip.current = win;
        const d = win.document;
        d.documentElement.lang = language;
        d.documentElement.dir = ar ? "rtl" : "ltr";
        d.title = "Tamayzak Focus";
        d.body.style.cssText = "margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(140deg,#25213f,#131224);color:#fff;font-family:system-ui,sans-serif;text-align:center";
        const wrap = d.createElement("main"); wrap.style.cssText = "padding:12px;max-width:100%;box-sizing:border-box";
        const brand = d.createElement("div"); brand.textContent = "TAMAYZAK · FOCUS"; brand.style.cssText = "font-size:11px;letter-spacing:.14em;color:#c4b5fd;font-weight:800";
        const clock = d.createElement("div"); clock.id = "tmz-time"; clock.dir = "ltr"; clock.style.cssText = "font:bold clamp(24px,12vw,44px) monospace;margin:6px 0";
        const detail = d.createElement("div"); detail.id = "tmz-detail"; detail.style.cssText = "font-size:12px;color:#a7f3d0";
        const back = d.createElement("button"); back.type = "button"; back.textContent = ar ? "العودة للجلسة" : "Return to session";
        back.style.cssText = "margin-top:10px;padding:7px 13px;border:1px solid #7768ae;border-radius:9px;background:#39305c;color:#fff;cursor:pointer;font:inherit;font-size:12px";
        back.onclick = () => { returnRef.current(); window.focus(); };
        wrap.append(brand, clock, detail, back); d.body.append(wrap);
        win.addEventListener("pagehide", () => { if (pip.current === win) { pip.current = null; setExternal(false); } }, { once: true });
        setExternal(true); paint(readSnapshot(user, ar)); return;
      }
      const doc = document as PiPDocument;
      const video = document.createElement("video") as VideoPiP;
      const canvas = document.createElement("canvas");
      if (!doc.pictureInPictureEnabled || !video.requestPictureInPicture || !canvas.captureStream) throw new Error("PiP unsupported");
      canvas.width = 480; canvas.height = 180;
      const stream = canvas.captureStream(2);
      video.srcObject = stream; video.muted = true; video.playsInline = true;
      video.style.cssText = "position:fixed;bottom:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
      video.setAttribute("aria-hidden", "true"); document.body.append(video);
      media.current = { video, stream, canvas };
      video.addEventListener("leavepictureinpicture", () => { if (media.current?.video === video) close(); }, { once: true });
      paint(readSnapshot(user, ar));
      await video.play();
      await video.requestPictureInPicture();
      if (media.current?.video === video) setExternal(true);
    } catch {
      close(); setUnavailable(true);
    } finally { opening.current = false; }
  }, [user, ar, language, paint, close]);

  useEffect(() => {
    const tick = () => {
      const next = readSnapshot(user, ar);
      setSnapshot(next);
      if (next || Date.now() < grace.current) paint(next);
      else if (pip.current || media.current) close();
    };
    const start = () => { setDismissed(false); void open(); };
    tick();
    const id = window.setInterval(tick, 1000);
    window.addEventListener(STUDY_TIMER_CHANGED, tick);
    window.addEventListener("storage", tick);
    window.addEventListener(OPEN_FLOATING_STUDY_TIMER, start);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(STUDY_TIMER_CHANGED, tick);
      window.removeEventListener("storage", tick);
      window.removeEventListener(OPEN_FLOATING_STUDY_TIMER, start);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [user, ar, open, close, paint]);

  useEffect(() => () => close(), [user, close]);

  if (!snapshot || external || dismissed) return null;
  return (
    <aside dir={ar ? "rtl" : "ltr"} className="fixed bottom-[calc(var(--nav-safe,4.5rem)+0.75rem)] end-3 z-[80] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-card p-2.5 text-card-foreground shadow-xl">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onReturn} className="flex items-center gap-2 rounded-lg px-1 text-start" aria-label={ar ? "العودة للجلسة" : "Return to session"}>
          <Timer className="size-4 text-primary" /><span dir="ltr" className="font-mono text-base font-bold tabular-nums">{snapshot.time}</span>
          <span className="text-xs text-muted-foreground">{status(snapshot.phase, ar)}</span>
        </button>
        <button type="button" onClick={() => void open()} className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary" aria-label={ar ? "فتح المؤقت العائم" : "Open floating timer"} title={ar ? "فتح المؤقت العائم" : "Open floating timer"}><ExternalLink className="size-4"/></button>
        <button type="button" onClick={() => setDismissed(true)} className="grid size-8 place-items-center rounded-lg text-muted-foreground" aria-label={ar ? "إخفاء المؤقت" : "Hide timer"}><X className="size-4"/></button>
      </div>
      {unavailable && <p className="mt-1 max-w-64 text-[10px] text-muted-foreground">{ar ? "المتصفح لم يسمح بالنافذة العائمة. المؤقت مستمر داخل تميّزك." : "Browser did not allow PiP. Your timer continues in Tamayzak."}</p>}
    </aside>
  );
}
