import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BoardStep } from "../../supabase/functions/_shared/whiteboard";

type PlaybackStatus = "ready" | "loading" | "playing" | "paused" | "ended" | "blocked" | "failed";
type Clip = {
  audio: HTMLAudioElement;
  step: number;
  request: AbortController;
  ready: boolean;
  wanted: boolean;
  frame: number | null;
};

function stopClock(clip: Clip) {
  if (clip.frame !== null) cancelAnimationFrame(clip.frame);
  clip.frame = null;
}

function audioProgress(audio: HTMLAudioElement) {
  return Number.isFinite(audio.duration) && audio.duration > 0
    ? Math.max(0, Math.min(1, audio.currentTime / audio.duration))
    : 0;
}

export function useWhiteboardPlayback(steps: readonly BoardStep[], liveDrawing = false) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<PlaybackStatus>("ready");
  const [instant, setInstant] = useState(false);
  const selected = useRef(0);
  const active = useRef<Clip | null>(null);
  const cached = useRef(new Map<number, string>());

  const release = useCallback(() => {
    const clip = active.current;
    if (!clip) return;
    active.current = null;
    clip.request.abort();
    stopClock(clip);
    clip.audio.onplaying = clip.audio.onpause = clip.audio.onended = clip.audio.onerror = null;
    clip.audio.pause();
    clip.audio.removeAttribute("src");
  }, []);

  useEffect(() => release, [release]);

  const fail = (clip: Clip) => {
    if (active.current !== clip) return;
    cached.current.delete(clip.step);
    release();
    if (!liveDrawing) setProgress(1);
    setStatus("failed");
  };

  const start = (clip: Clip) => {
    if (active.current !== clip || !clip.wanted) return;
    setStatus("loading");
    void clip.audio.play().catch((error: unknown) => {
      if (active.current !== clip || !clip.wanted) return;
      if (error instanceof Error && error.name === "NotAllowedError") {
        clip.wanted = false;
        setStatus("blocked");
        return;
      }
      fail(clip);
    });
  };

  const play = (replay = false) => {
    const stepIndex = selected.current;
    const current = active.current;
    if (current && !current.audio.ended && !replay) {
      current.wanted = true;
      if (current.ready) start(current);
      else setStatus("loading");
      return;
    }

    release();
    const step = steps[stepIndex];
    if (!step) return;
    const audio = new Audio();
    audio.preload = "auto";
    const clip: Clip = { audio, step: stepIndex, request: new AbortController(), ready: false, wanted: true, frame: null };
    active.current = clip;
    setProgress(0);
    setInstant(false);
    setStatus("loading");

    const synchronize = () => {
      clip.frame = null;
      if (active.current !== clip || audio.paused || audio.ended || !clip.wanted) return;
      setProgress(audioProgress(audio));
      clip.frame = requestAnimationFrame(synchronize);
    };
    audio.onplaying = () => {
      if (active.current !== clip) return;
      if (!clip.wanted) { audio.pause(); return; }
      setStatus("playing");
      stopClock(clip);
      synchronize();
    };
    audio.onpause = () => {
      if (active.current !== clip || audio.ended) return;
      stopClock(clip);
      setProgress(audioProgress(audio));
      setStatus("paused");
    };
    audio.onended = () => {
      if (active.current !== clip) return;
      stopClock(clip);
      setProgress(1);
      setStatus("ended");
    };
    audio.onerror = () => fail(clip);

    const load = (url: string) => {
      if (active.current !== clip) return;
      audio.src = url;
      clip.ready = true;
      if (clip.wanted) start(clip);
    };
    const url = cached.current.get(stepIndex);
    if (url) {
      load(url);
      return;
    }
    void supabase.functions.invoke<{ audio?: string }>("tts-speak", {
      body: { text: step.narration, language: "ar", voice: "fable", speed: 1, purpose: "podcast" },
      signal: clip.request.signal,
      timeout: 30_000,
    }).then(({ data, error }) => {
      if (active.current !== clip) return;
      const encoded = data?.audio;
      if (error || typeof encoded !== "string" || !encoded || encoded.length > 4_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
        fail(clip);
        return;
      }
      const url = "data:audio/mpeg;base64," + encoded;
      cached.current.set(stepIndex, url);
      load(url);
    }).catch(() => fail(clip));
  };

  const pause = () => {
    const clip = active.current;
    if (!clip || clip.audio.ended) return;
    clip.wanted = false;
    stopClock(clip);
    setProgress(audioProgress(clip.audio));
    clip.audio.pause();
    setStatus("paused");
  };

  const goTo = (target: number) => {
    if (!Number.isInteger(target) || target < 0 || target >= steps.length || target === selected.current) return;
    release();
    selected.current = target;
    setIndex(target);
    setProgress(liveDrawing ? 0 : 1);
    setInstant(false);
    setStatus("ready");
  };

  const nextMark = steps[index]?.actions.find(action => action.at > progress || (progress === 0 && !instant && action.at === 0));
  const advanceDrawing = () => {
    if (!nextMark || status === "playing" || status === "loading") return;
    release();
    setInstant(true);
    setProgress(nextMark.at);
    if (status !== "failed") setStatus("ready");
  };

  return { index, progress, status, instant, play, pause, goTo, advanceDrawing, hasNextMark: Boolean(nextMark) };
}
