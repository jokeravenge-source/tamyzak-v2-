import { supabase } from "@/integrations/supabase/client";

type RoomArgs = { _room: string };
type ActivityArgs = {
  study_room_activity: RoomArgs;
  encourage_study_room_member: RoomArgs & { _recipient: string };
  dismiss_study_room_encouragements: RoomArgs & { _through: string };
  set_study_room_mic: RoomArgs & {
    _action: "request" | "approve" | "decline" | "revoke" | "start" | "stop" | "heartbeat";
    _requester?: string;
    _connection?: string;
  };
  signal_study_room_voice: RoomArgs & {
    _target: string;
    _connection: string;
    _attempt: string;
    _description: { type: "offer" | "answer"; sdp: string } | { type: "leave" };
  };
  study_room_voice_ice: RoomArgs;
};

type ActivityRpc = <Name extends keyof ActivityArgs>(
  name: Name,
  args: ActivityArgs[Name],
) => PromiseLike<{ data: unknown; error: { message: string } | null }>;

// The pending migration is not reflected in generated types yet. Keep the
// compatibility cast here; calls still use the signed-in client and server checks.
export const studyRoomActivityRpc: ActivityRpc = (name, args) =>
  (supabase.rpc as unknown as ActivityRpc).call(supabase, name, args);