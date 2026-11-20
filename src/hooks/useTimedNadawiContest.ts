import { useCallback, useEffect, useRef, useState } from "react";
import { answerTimedNadawi, getTimedNadawiState, startTimedNadawi, type TimedNadawiState } from "@/lib/nadawiContestApi";

type Reply = { state: TimedNadawiState; clockOffset: number };
export function useTimedNadawiContest(adminTest = false) {
  const [state, setState] = useState<TimedNadawiState | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now);
  const stateRef = useRef(state); stateRef.current = state;
  const alive = useRef(false);
  const busy = useRef(false);
  const offset = useRef(0);
  const nextSync = useRef(0);
  const perform = useCallback(async (action: () => Promise<Reply>) => {
    if (!alive.current || busy.current) return;
    busy.current = true; setPending(true); setError("");
    try {
      const result = await action();
      if (!alive.current) return;
      offset.current = result.clockOffset; stateRef.current = result.state;
      setState(result.state); setNow(Date.now()); nextSync.current = 0;
    } catch (e) {
      if (alive.current) { setError(e instanceof Error ? e.message : "CONTEST_UNAVAILABLE"); nextSync.current = Date.now() + 3000; }
    } finally { busy.current = false; if (alive.current) setPending(false); }
  }, []);
  const refresh = useCallback(() => perform(() => getTimedNadawiState(adminTest)), [perform, adminTest]);
  const start = useCallback(() => perform(() => startTimedNadawi(adminTest)), [perform, adminTest]);
  const restart = useCallback(() => adminTest ? perform(() => startTimedNadawi(true, true)) : Promise.resolve(), [perform, adminTest]);
  const submit = useCallback((answer: string | null) => {
    const current = stateRef.current;
    if (current?.status !== "active") return Promise.resolve();
    return perform(() => answerTimedNadawi(current.attempt_id, current.question_index, answer, adminTest));
  }, [perform, adminTest]);
  useEffect(() => {
    alive.current = true; void refresh();
    const visible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", visible);
    return () => { alive.current = false; document.removeEventListener("visibilitychange", visible); };
  }, [refresh]);
  useEffect(() => {
    if (state?.status !== "active") return;
    const timer = setInterval(() => {
      const local = Date.now(); setNow(local);
      const current = stateRef.current;
      if (current?.status === "active" && document.visibilityState !== "hidden" && local + offset.current >= Date.parse(current.deadline_at) && local >= nextSync.current && !busy.current) {
        nextSync.current = local + 1000; void submit(null);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [state?.status, submit]);
  const serverNow = now + offset.current;
  return { state, pending, error, refresh, start, restart, submit,
    seconds: state?.status === "active" ? Math.max(0, Math.min(30, Math.ceil((Date.parse(state.deadline_at) - serverNow) / 1000))) : 0,
    elapsed: state?.status === "active" ? Math.max(0, serverNow - Date.parse(state.started_at)) : state?.status === "completed" ? state.elapsed_ms : 0 };
}
