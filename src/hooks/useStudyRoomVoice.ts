import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendStudyRoomVoice, setStudyRoomMic, type RoomActivity, type RoomSpeaker, type VoiceSignal } from "./useStudyRoomActivity";

type Peer = { peer: RTCPeerConnection; attempt: string };
type Mic = { id: string; stream: MediaStream; ice: RTCIceServer[]; peers: Map<string, Peer>; heartbeat?: number; deadline?: number };
type Listener = Peer & { speaker: RoomSpeaker; timeout?: number };
type AudioError = "connection" | "microphone" | "unavailable" | "busy";

async function roomIceServers(room: string): Promise<RTCIceServer[]> {
  const { data, error } = await supabase.rpc("study_room_voice_ice", { _room: room });
  if (error) throw error;
  const servers: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
  if (Array.isArray(data)) {
    for (const server of data) {
      if (!server || typeof server !== "object" || Array.isArray(server)) continue;
      const { urls, username, credential } = server;
      if (Array.isArray(urls) && urls.every((url): url is string => typeof url === "string") &&
          typeof username === "string" && typeof credential === "string") {
        servers.push({ urls, username, credential });
      }
    }
  }
  return servers;
}

// Send a single offer/answer with the gathered candidates. Each side can
// then apply the remote description without a separate candidate queue.
async function gatherDescription(peer: RTCPeerConnection, type: "offer" | "answer") {
  await peer.setLocalDescription(type === "offer" ? await peer.createOffer() : await peer.createAnswer());
  if (peer.iceGatheringState !== "complete") {
    await new Promise<void>((resolve) => {
      const finish = () => {
        window.clearTimeout(timeout);
        peer.removeEventListener("icegatheringstatechange", onChange);
        resolve();
      };
      const onChange = () => { if (peer.iceGatheringState === "complete") finish(); };
      const timeout = window.setTimeout(finish, 4500);
      peer.addEventListener("icegatheringstatechange", onChange);
      onChange();
    });
  }
  const sdp = peer.localDescription?.sdp;
  if (!sdp || peer.signalingState === "closed") throw new Error("Voice connection closed");
  return { type, sdp };
}

export function useStudyRoomVoice({
  room, speaker, members, ready, signal, refresh,
}: {
  room: string;
  speaker: RoomSpeaker | null;
  members: string;
  ready: boolean;
  signal: MutableRefObject<((signal: VoiceSignal) => void) | null>;
  refresh: () => Promise<RoomActivity | null>;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const mic = useRef<Mic | null>(null);
  const listener = useRef<Listener | null>(null);
  const listeningAttempt = useRef<string | null>(null);
  const speakerRef = useRef(speaker);
  speakerRef.current = speaker;
  const mounted = useRef(false);
  const [speaking, setSpeaking] = useState(false);
  const [opening, setOpening] = useState(false);
  const [listening, setListening] = useState<"connecting" | "playing" | null>(null);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [error, setError] = useState<AudioError | null>(null);

  const stopMic = useCallback(() => {
    const current = mic.current;
    if (!current) return;
    mic.current = null;
    window.clearInterval(current.heartbeat);
    window.clearTimeout(current.deadline);
    current.stream.getTracks().forEach(track => track.stop());
    current.peers.forEach(({ peer }) => peer.close());
    if (mounted.current) setSpeaking(false);
    void setStudyRoomMic(room, "stop", undefined, current.id).then(() => {
      if (mounted.current) void refresh();
    }, () => {});
  }, [room, refresh]);

  const stopListening = useCallback(() => {
    const current = listener.current;
    listeningAttempt.current = null;
    listener.current = null;
    if (current) {
      window.clearTimeout(current.timeout);
      current.peer.close();
      void sendStudyRoomVoice(room, current.speaker.user_id, current.speaker.connection_id, current.attempt, { type: "leave" }).catch(() => {});
    }
    if (audio.current) audio.current.srcObject = null;
    if (mounted.current) {
      setNeedsPlay(false);
      setListening(null);
    }
  }, [room]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopMic();
      stopListening();
    };
  }, [stopMic, stopListening]);

  useEffect(() => {
    if (speaking && (!ready || speaker?.connection_id !== mic.current?.id)) stopMic();
    if (listener.current && (!ready || speaker?.connection_id !== listener.current.speaker.connection_id)) stopListening();
  }, [ready, speaker?.connection_id, speaking, stopListening, stopMic]);

  useEffect(() => {
    const current = mic.current;
    if (!current) return;
    const present = new Set(members.split(","));
    for (const [id, { peer }] of current.peers) {
      if (present.has(id)) continue;
      current.peers.delete(id);
      peer.close();
    }
  }, [members]);

  useEffect(() => {
    const handle = async (payload: VoiceSignal) => {
      const description = payload?.description;
      if (!description) return;
      if (description.type === "answer") {
        const active = listener.current;
        if (active?.attempt !== payload.attempt || active.speaker.user_id !== payload.from ||
            active.speaker.connection_id !== payload.connection || active.peer.signalingState !== "have-local-offer") return;
        try {
          await active.peer.setRemoteDescription(description);
        } catch {
          if (listener.current === active) {
            stopListening();
            setError("connection");
          }
        }
        return;
      }

      const active = mic.current;
      if (!active || active.id !== payload.connection) return;
      const previous = active.peers.get(payload.from);
      if (description.type === "leave") {
        if (previous && (!payload.attempt || previous.attempt === payload.attempt)) {
          active.peers.delete(payload.from);
          previous.peer.close();
        }
        return;
      }
      if (!payload.attempt || previous?.attempt === payload.attempt) return;
      const peer = new RTCPeerConnection({ iceServers: active.ice });
      const removePeer = () => {
        if (active.peers.get(payload.from)?.peer === peer) active.peers.delete(payload.from);
        peer.close();
      };
      active.peers.set(payload.from, { peer, attempt: payload.attempt });
      previous?.peer.close();
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed" || peer.connectionState === "closed") removePeer();
      };
      try {
        await peer.setRemoteDescription(description);
        const [audioLine, ...extra] = peer.getTransceivers();
        if (!audioLine || extra.length || audioLine.receiver.track.kind !== "audio") {
          removePeer();
          return;
        }
        audioLine.direction = "sendonly";
        await audioLine.sender.replaceTrack(active.stream.getAudioTracks()[0]);
        const answer = await gatherDescription(peer, "answer");
        if (mic.current === active && active.peers.get(payload.from)?.peer === peer) {
          await sendStudyRoomVoice(room, payload.from, active.id, payload.attempt, answer);
        }
      } catch {
        removePeer();
      }
    };
    signal.current = (payload) => { void handle(payload).catch(() => {}); };
    return () => { signal.current = null; };
  }, [room, signal, stopListening]);

  const supportsAudio = typeof window !== "undefined" && !!window.RTCPeerConnection;

  const startMic = async () => {
    if (opening || mic.current) return;
    setError(null);
    if (!ready || !supportsAudio || !navigator.mediaDevices?.getUserMedia) {
      setError("unavailable");
      return;
    }
    setOpening(true);
    let stream: MediaStream | undefined;
    let current: Mic | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) return;
      const tracks = stream.getAudioTracks();
      tracks.forEach(track => { track.enabled = false; });
      const ice = await roomIceServers(room);
      if (!mounted.current) return;
      current = { id: crypto.randomUUID(), stream, ice, peers: new Map() };
      mic.current = current;
      await setStudyRoomMic(room, "start", undefined, current.id);
      const state = await refresh();
      if (!mounted.current || mic.current !== current || state?.speaker?.connection_id !== current.id) {
        void setStudyRoomMic(room, "stop", undefined, current.id).catch(() => {});
        throw new Error("MIC_ENDED");
      }
      const renewDeadline = () => {
        window.clearTimeout(current.deadline);
        current.deadline = window.setTimeout(stopMic, 25000);
      };
      renewDeadline();
      current.heartbeat = window.setInterval(() => {
        void setStudyRoomMic(room, "heartbeat", undefined, current.id).then(() => {
          if (mic.current === current) renewDeadline();
        }, () => { if (mic.current === current) stopMic(); });
      }, 10000);
      tracks.forEach(track => {
        track.addEventListener("ended", stopMic, { once: true });
        track.enabled = true;
      });
      setSpeaking(true);
    } catch (cause) {
      if (current && mic.current === current) stopMic();
      if (mounted.current) {
        const message = (cause as { message?: string })?.message;
        setError(!stream ? "microphone" : message === "MIC_IN_USE" ? "busy" : "connection");
      }
    } finally {
      if (!current || mic.current !== current) stream?.getTracks().forEach(track => track.stop());
      if (mounted.current) setOpening(false);
    }
  };

  const playAudio = () => {
    const player = audio.current;
    if (!player?.srcObject) return;
    void player.play().then(() => {
      if (player.srcObject) setNeedsPlay(false);
    }, () => {
      if (player.srcObject) setNeedsPlay(true);
    });
  };

  const listen = async () => {
    if (!speaker || listeningAttempt.current) return;
    setError(null);
    if (!ready || !supportsAudio) { setError("unavailable"); return; }
    const attempt = crypto.randomUUID();
    listeningAttempt.current = attempt;
    setListening("connecting");
    try {
      const iceServers = await roomIceServers(room);
      if (!mounted.current || listeningAttempt.current !== attempt) return;
      if (speakerRef.current?.connection_id !== speaker.connection_id) { stopListening(); return; }
      const peer = new RTCPeerConnection({ iceServers });
      const active: Listener = { peer, speaker, attempt };
      const failed = () => {
        if (listener.current !== active) return;
        stopListening();
        setError("connection");
      };
      listener.current = active;
      active.timeout = window.setTimeout(failed, 24000);
      peer.addTransceiver("audio", { direction: "recvonly" });
      peer.ontrack = (event) => {
        if (listener.current !== active || !audio.current) return;
        audio.current.srcObject = event.streams[0] ?? new MediaStream([event.track]);
        playAudio();
      };
      peer.onconnectionstatechange = () => {
        if (listener.current !== active) return;
        if (peer.connectionState === "connected") {
          window.clearTimeout(active.timeout);
          setListening("playing");
        }
        if (peer.connectionState === "failed" || peer.connectionState === "closed") failed();
      };
      const offer = await gatherDescription(peer, "offer");
      if (listener.current === active) await sendStudyRoomVoice(room, speaker.user_id, speaker.connection_id, active.attempt, offer);
    } catch {
      if (mounted.current && listeningAttempt.current === attempt) {
        stopListening();
        setError("connection");
      }
    }
  };

  return { audio, speaking, opening, listening, needsPlay, error, startMic, stopMic, listen, stopListening, playAudio };
}
