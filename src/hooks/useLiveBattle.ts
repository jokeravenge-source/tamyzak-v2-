import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isLiveBattleQuestion, type LiveBattleQuestion } from "@/lib/liveBattleBank";

export const BATTLE_QUESTION_SECONDS = 25;
type Player = { id: string; name: string };
type Phase = "idle" | "lobby" | "countdown" | "playing" | "done" | "disconnected";
type Channel = ReturnType<typeof supabase.channel>;

export function useLiveBattle(name: string) {
  const me = useRef(crypto.randomUUID());
  const [phase, setPhase] = useState<Phase>("idle");
  const [code, setCode] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<LiveBattleQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [answered, setAnswered] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(BATTLE_QUESTION_SECONDS);
  const [countdown, setCountdown] = useState(3);
  const channel = useRef<Channel | null>(null);
  const generation = useRef(0);
  const current = useRef({ phase: "idle" as Phase, index: 0, questions: [] as LiveBattleQuestion[], players: [] as Player[], host: false, started: false, answered: false, deadline: 0 });
  const answers = useRef(new Set<string>());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalDelivery = useRef<Promise<unknown> | null>(null);
  const changePhase = useCallback((value: Phase) => { current.current.phase = value; setPhase(value); }, []);
  const clearAdvance = useCallback(() => {
    if (advanceTimer.current !== null) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  }, []);
  const dispose = useCallback(() => {
    generation.current++;
    clearAdvance();
    const old = channel.current;
    channel.current = null;
    if (old) void supabase.removeChannel(old);
  }, [clearAdvance]);
  useEffect(() => () => dispose(), [dispose]);

  const applyNext = useCallback((next: number) => {
    if (next <= current.current.index || next > current.current.questions.length) return;
    clearAdvance();
    if (next === current.current.questions.length) { changePhase("done"); return; }
    current.current.index = next;
    current.current.answered = false;
    setAnswered(null);
    setSeconds(BATTLE_QUESTION_SECONDS);
    setIndex(next);
  }, [clearAdvance, changePhase]);
  const advance = useCallback((expectedIndex: number) => {
    if (current.current.phase !== "playing" || !current.current.host || expectedIndex !== current.current.index || !channel.current) return;
    const next = expectedIndex + 1;
    finalDelivery.current = channel.current.send({ type: "broadcast", event: "next", payload: { qIdx: next } });
    applyNext(next);
  }, [applyNext]);
  const scheduleAdvance = useCallback((delay: number, expectedIndex: number) => {
    if (advanceTimer.current !== null) return;
    advanceTimer.current = setTimeout(() => { advanceTimer.current = null; advance(expectedIndex); }, delay);
  }, [advance]);
  const recordAnswer = useCallback((playerId: string, qIdx: number, choice: number) => {
    const state = current.current;
    if (state.phase !== "playing" || state.index !== qIdx || !state.players.some((p) => p.id === playerId)) return;
    const key = `${qIdx}:${playerId}`;
    if (answers.current.has(key)) return;
    answers.current.add(key);
    if (choice === state.questions[qIdx]?.answer) setScores((prev) => ({ ...prev, [playerId]: (prev[playerId] ?? 0) + 1 }));
    if (state.host && state.players.every((p) => answers.current.has(`${qIdx}:${p.id}`))) scheduleAdvance(800, qIdx);
  }, [scheduleAdvance]);

  const connect = useCallback((room: string, host: boolean, bankQuestions?: LiveBattleQuestion[]) => {
    dispose();
    const token = generation.current;
    answers.current.clear();
    finalDelivery.current = null;
    current.current = { phase: "lobby", index: 0, questions: [], players: [], host, started: false, answered: false, deadline: 0 };
    setSeconds(BATTLE_QUESTION_SECONDS);
    setCode(room); setQuestions([]); setPlayers([]); setScores({}); setIndex(0); setAnswered(null); changePhase("lobby");
    const ch = supabase.channel(`battle:${room}`, { config: { presence: { key: me.current }, broadcast: { ack: true } } });
    channel.current = ch;
    const active = () => token === generation.current && channel.current === ch;
    const start = (qs: LiveBattleQuestion[], list: Player[]) => {
      if (!active() || current.current.started) return;
      if (!list.some((p) => p.id === me.current)) { changePhase("disconnected"); return; }
      current.current.started = true;
      current.current.questions = qs;
      current.current.players = list;
      setQuestions(qs); setPlayers(list); setScores(Object.fromEntries(list.map((p) => [p.id, 0])));
      setCountdown(3); changePhase("countdown");
    };
    ch.on("presence", { event: "sync" }, () => {
      if (!active()) return;
      const state = ch.presenceState() as Record<string, { name?: string }[]>;
      const list = Object.entries(state).map(([id, entries]) => ({ id, name: entries[0]?.name || "Player" }));
      if (current.current.started) {
        if (["countdown", "playing"].includes(current.current.phase) && current.current.players.some((p) => !list.some((online) => online.id === p.id))) changePhase("disconnected");
        return;
      }
      setPlayers(list);
      if (host && list.length >= 2 && bankQuestions?.length) {
        const pair = [list.find((p) => p.id === me.current)!, list.filter((p) => p.id !== me.current).sort((a, b) => a.id.localeCompare(b.id))[0]].filter(Boolean);
        if (pair.length !== 2) return;
        start(bankQuestions, pair);
        void ch.send({ type: "broadcast", event: "start", payload: { questions: bankQuestions, players: pair } }).then((status) => {
          if (active() && status !== "ok") changePhase("disconnected");
        });
      }
    });
    ch.on("broadcast", { event: "start" }, ({ payload }) => {
      if (!active() || !Array.isArray(payload?.questions) || !payload.questions.length || payload.questions.length > 20 || !payload.questions.every(isLiveBattleQuestion)) return;
      if (!Array.isArray(payload.players) || payload.players.length !== 2 || !payload.players.every((p: Player) => typeof p?.id === "string" && typeof p?.name === "string")) return;
      start(payload.questions, payload.players);
    });
    ch.on("broadcast", { event: "answer" }, ({ payload }) => {
      if (!active() || typeof payload?.playerId !== "string" || !Number.isInteger(payload.qIdx)) return;
      // Keep rooms usable while a friend's browser still has the previous client cached.
      if (Number.isInteger(payload.choice)) recordAnswer(payload.playerId, payload.qIdx, payload.choice);
      else if (typeof payload.correct === "boolean") recordAnswer(payload.playerId, payload.qIdx, payload.correct ? current.current.questions[payload.qIdx]?.answer : -1);
    });
    ch.on("broadcast", { event: "next" }, ({ payload }) => {
      if (active() && !host && current.current.phase === "playing" && Number.isInteger(payload?.qIdx)) applyNext(payload.qIdx);
    });
    ch.subscribe(async (status) => {
      if (!active()) return;
      if (status === "SUBSCRIBED") {
        try { await ch.track({ name: name.trim() || "Player" }); } catch { if (active()) changePhase("disconnected"); }
      } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status) && current.current.phase !== "done") changePhase("disconnected");
    });
  }, [dispose, changePhase, recordAnswer, name, applyNext]);

  useEffect(() => {
    if (phase !== "countdown") return;
    const started = Date.now();
    const timer = setInterval(() => {
      const left = Math.max(0, 3 - Math.floor((Date.now() - started) / 1000));
      setCountdown(left);
      if (left === 0) { clearInterval(timer); changePhase("playing"); }
    }, 100);
    return () => clearInterval(timer);
  }, [phase, changePhase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const deadline = Date.now() + BATTLE_QUESTION_SECONDS * 1000;
    current.current.deadline = deadline;
    const qIdx = index;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(left);
      if (left === 0) { clearInterval(timer); if (current.current.host) scheduleAdvance(800, qIdx); }
    }, 200);
    return () => { clearInterval(timer); clearAdvance(); };
  }, [phase, index, scheduleAdvance, clearAdvance]);

  useEffect(() => {
    if (phase !== "done") return;
    let active = true;
    // Let the last question transition reach the other player before closing realtime.
    void Promise.resolve(finalDelivery.current).catch(() => {}).then(() => {
      if (active && current.current.phase === "done") dispose();
    });
    return () => { active = false; };
  }, [phase, dispose]);

  const answer = useCallback((choice: number): boolean | null => {
    const state = current.current;
    if (state.phase !== "playing" || state.answered || Date.now() >= state.deadline || !channel.current) return null;
    const question = state.questions[state.index];
    if (!Number.isInteger(choice) || choice < 0 || choice >= question.choices.length) return null;
    state.answered = true;
    setAnswered(choice);
    recordAnswer(me.current, state.index, choice);
    void channel.current.send({ type: "broadcast", event: "answer", payload: { playerId: me.current, qIdx: state.index, choice, correct: question.answer === choice } });
    return question.answer === choice;
  }, [recordAnswer]);
  const reset = useCallback(() => {
    dispose(); current.current.started = false; changePhase("idle");
    setCode(""); setQuestions([]); setPlayers([]); setScores({}); setIndex(0); setAnswered(null);
  }, [dispose, changePhase]);
  return { phase, code, players, questions, index, scores, answered, seconds, countdown, meId: me.current, connect, answer, reset };
}
