import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { studyRoomActivityRpc } from "@/lib/studyRoomActivityRpc";

export const STUDY_ROOM_CHEER_RECEIVED = "study-room-cheer-received";

type MicState = "pending" | "approved" | "declined" | "live";
type MicAction = "request" | "approve" | "decline" | "revoke" | "start" | "stop" | "heartbeat";
export type RoomCheer = { sender_id: string; sender_name: string; created_at: string; reward_points?: number };
export type StudyRoomCheerEvent = CustomEvent<{ room: string; recipient: string; cheers: RoomCheer[] }>;
export type RoomSpeaker = { user_id: string; name: string; connection_id: string };
export type RoomActivity = {
  owner: boolean;
  inbox: RoomCheer[];
  mic: MicState | null;
  requests: { user_id: string; name: string; state: Exclude<MicState, "declined"> }[];
  speaker: RoomSpeaker | null;
};

type VoiceDescription = { type: "offer" | "answer"; sdp: string } | { type: "leave" };
export type VoiceSignal = { from: string; connection: string; attempt: string | null; description: VoiceDescription };

export async function setStudyRoomMic(room: string, action: MicAction, requester?: string, connection?: string) {
  const { error } = await studyRoomActivityRpc("set_study_room_mic", {
    _room: room, _action: action, _requester: requester, _connection: connection,
  });
  if (error) throw error;
}

export async function sendStudyRoomVoice(room: string, target: string, connection: string, attempt: string, description: VoiceDescription) {
  const { error } = await studyRoomActivityRpc("signal_study_room_voice", {
    _room: room, _target: target, _connection: connection, _attempt: attempt, _description: description,
  });
  if (error) throw error;
}

export function useStudyRoomActivity(room: string | undefined, user: string | null, poll = true) {
  const queryClient = useQueryClient();
  const voiceListener = useRef<((signal: VoiceSignal) => void) | null>(null);
  const seenCheers = useRef<{ room: string; user: string; bySender: Map<string, number> } | null>(null);
  const [readyRoom, setReadyRoom] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["study-room-activity", room, user],
    queryFn: async () => {
      if (!room || !user) throw new Error("ROOM_MEMBERSHIP_REQUIRED");
      const { data, error } = await studyRoomActivityRpc("study_room_activity", { _room: room });
      if (error) throw error;
      return data as RoomActivity;
    },
    enabled: !!room && !!user,
    retry: false,
    refetchInterval: room && user && poll ? 15000 : false,
  });

  const { data, isSuccess } = query;
  useEffect(() => {
    if (!room || !user) {
      seenCheers.current = null;
      return;
    }
    if (!isSuccess || !data) return;

    const previous = seenCheers.current;
    if (previous?.room !== room || previous.user !== user) {
      const bySender = new Map<string, number>();
      // The first snapshot is history. Track each sender so later commits from
      // different senders can arrive in any order without losing a cheer.
      for (const cheer of data.inbox) {
        if (!bySender.has(cheer.sender_id)) bySender.set(cheer.sender_id, Date.parse(cheer.created_at));
      }
      seenCheers.current = { room, user, bySender };
      return;
    }

    const cheers = data.inbox.filter(cheer => {
      const receivedAt = Date.parse(cheer.created_at);
      const lastSeen = previous.bySender.get(cheer.sender_id) ?? 0;
      if (Number.isNaN(receivedAt) || receivedAt <= lastSeen) return false;
      previous.bySender.set(cheer.sender_id, receivedAt);
      return true;
    });
    if (cheers.length > 0) {
      window.dispatchEvent(new CustomEvent<StudyRoomCheerEvent["detail"]>(STUDY_ROOM_CHEER_RECEIVED, {
        detail: { room, recipient: user, cheers },
      }));
    }
  }, [room, user, data, isSuccess]);

  useEffect(() => {
    if (!room || !user) return;
    let listening = true;
    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ["study-room-activity", room, user] });
      }, 100);
    };
    const activity = supabase.channel(`study-room-activity:${room}`, { config: { private: true } })
      .on("broadcast", { event: "changed" }, refresh)
      .subscribe((status) => { if (status === "SUBSCRIBED") refresh(); });
    const inbox = supabase.channel(`study-room-inbox:${room}:${user}`, { config: { private: true } })
      .on("broadcast", { event: "changed" }, refresh)
      .on("broadcast", { event: "voice" }, ({ payload }) => {
        if (listening) voiceListener.current?.(payload as VoiceSignal);
      })
      .subscribe((status) => {
        if (!listening) return;
        setReadyRoom(status === "SUBSCRIBED" ? room : null);
        if (status === "SUBSCRIBED") refresh();
      });
    return () => {
      listening = false;
      setReadyRoom(null);
      window.clearTimeout(timer);
      void supabase.removeChannel(inbox);
      void supabase.removeChannel(activity);
    };
  }, [room, user, queryClient]);

  const refetch = query.refetch;
  const refresh = useCallback(async () => {
    const result = await refetch({ cancelRefetch: false });
    return result.isSuccess ? result.data : null;
  }, [refetch]);
  return { data: query.data, failed: query.isError, refresh, voiceListener, voiceReady: !!room && readyRoom === room };
}

export const StudyRoomActivityContext = createContext<{
  room: string | undefined;
  user: string | null;
  activity: ReturnType<typeof useStudyRoomActivity>;
} | null>(null);

export function useJoinedStudyRoomActivity(room: string | undefined, user: string | null) {
  const shared = useContext(StudyRoomActivityContext);
  const standalone = useStudyRoomActivity(shared ? undefined : room, shared ? null : user);
  return shared && shared.room === room && shared.user === user ? shared.activity : standalone;
}
