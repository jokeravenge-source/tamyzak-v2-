import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function speechPhrases(text: string, maxLength = 220): string[] {
  let remaining = text.replace(/\s+/g, " ").trim();
  const phrases: string[] = [];
  while (remaining) {
    let end = Math.min(maxLength, remaining.length);
    if (end < remaining.length) {
      const space = remaining.lastIndexOf(" ", end);
      if (space > 0) end = space;
    }
    phrases.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trim();
  }
  return phrases;
}

type Callbacks = {
  onStart?: () => void;
  onEnd: () => void;
  onError: () => void;
};

export function usePodcastSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runRef = useRef(0);
  const pausedRef = useRef(false);
  const readyRef = useRef(false);
  const startRef = useRef<(() => Promise<void>) | null>(null);
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [offset, setOffset] = useState(0);

  const stop = useCallback(() => {
    runRef.current++;
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
    }
    audioRef.current = null;
    readyRef.current = false;
    pausedRef.current = false;
    startRef.current = null;
    setActive(false);
    setPaused(false);
    setPhrase("");
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    audioRef.current?.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
    if (readyRef.current) void startRef.current?.();
  }, []);

  const play = useCallback(
    (text: string, callbacks: Callbacks) => {
      stop();
      const phrases = speechPhrases(text);
      if (!phrases.length) {
        callbacks.onEnd();
        return;
      }
      const run = runRef.current;
      const audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
      setActive(true);
      let index = 0;
      let started = false;
      let failed = false;
      let searchFrom = 0;
      const normalized = text.replace(/\s+/g, " ").trim();
      const requestPhrase = (value: string) =>
        supabase.functions
          .invoke<{ audio: string; mime?: string }>("tts-speak", {
            body: {
              text: value,
              language: "ar",
              voice: "fable",
              speed: 1,
              purpose: "podcast",
            },
          })
          .catch((error) => ({ data: null, error }));
      let upcoming: ReturnType<typeof requestPhrase> | null = null;
      const fail = () => {
        if (run !== runRef.current || failed) return;
        failed = true;
        stop();
        callbacks.onError();
      };
      const next = async () => {
        if (run !== runRef.current) return;
        readyRef.current = false;
        if (index >= phrases.length) {
          stop();
          callbacks.onEnd();
          return;
        }
        const current = phrases[index++];
        const position = normalized.indexOf(current, searchFrom);
        searchFrom = position + current.length;
        try {
          const request = upcoming ?? requestPhrase(current);
          upcoming = null;
          const { data, error } = await request;
          if (run !== runRef.current) return;
          if (error || !data?.audio) throw new Error("Speech unavailable");
          audio.src = `data:${data.mime || "audio/mpeg"};base64,${data.audio}`;
          audio.onended = () => {
            void next();
          };
          audio.onerror = fail;
          readyRef.current = true;
          startRef.current = async () => {
            if (run !== runRef.current || pausedRef.current) return;
            try {
              setPhrase(current);
              setOffset(position);
              await audio.play();
              if (run === runRef.current && !started) {
                started = true;
                callbacks.onStart?.();
              }
              // Prepare only the next phrase while this one plays to reduce gaps.
              if (
                run === runRef.current &&
                !pausedRef.current &&
                !upcoming &&
                index < phrases.length
              ) {
                upcoming = requestPhrase(phrases[index]);
              }
            } catch {
              fail();
            }
          };
          if (!pausedRef.current) await startRef.current();
        } catch {
          fail();
        }
      };
      void next();
    },
    [stop],
  );

  useEffect(
    () => () => {
      stop();
    },
    [stop],
  );
  return { play, pause, resume, stop, active, paused, phrase, offset };
}
