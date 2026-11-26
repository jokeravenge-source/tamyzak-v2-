import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type MicState = "pending" | "approved" | "declined" | "live";
type MicAction = "request" | "approve" | "decline" | "revoke" | "start" | "stop" | "heartbeat";
export type RoomSpeaker = { user_id: string; name: string; connection_id: string };
export type RoomActivity = {
  owner: boolean;
  inbox: { sender_id: string; sender_name: string; created_at: string }[];
  mic: MicState | null;
  requests: { user_id: string; name: string; state: Exclude<MicState, "declined"> }[];
  speaker: RoomSpeaker | null;
};

type VoiceDescription = { type: "offer" | "answer"; sdp: string } | { type: "leave" };
export type VoiceSignal = { from: string; connection: string; attempt: string | null; description: VoiceDescription };

export async function setStudyRoomMic(room: string, action: MicAction, requester?: string, connection?: string) {
  const { error } = await supabase.rpc("set_study_room_mic", {
    _room: room, _action: action, _requester: requester, _connection: connection,
  });
  if (error) throw error;
}

export async function sendStudyRoomVoice(room: string, target: string, connection: string, attempt: string, description: VoiceDescription) {
  const { error } = await supabase.rpc("signal_study_room_voice", {
    _room: room, _target: target, _connection: connection, _attempt: attempt, _description: description,
  });
  if (error) throw error;
}

export function useStudyRoomActivity(room: string | undefined, user: string | null) {
  const queryClient = useQueryClient();
  const voiceListener = useRef<((signal: VoiceSignal) => void) | null>(null);
  const [readyRoom, setReadyRoom] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["study-room-activity", room, user],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("study_room_activity", { _room: room! });
      if (error) throw error;
      return data as RoomActivity;
    },
    enabled: !!room && !!user,
    retry: false,
    refetchInterval: room && user ? 15000 : false,
  });

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
