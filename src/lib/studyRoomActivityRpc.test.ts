import { beforeEach, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
import { studyRoomActivityRpc } from "./studyRoomActivityRpc";
import { sendStudyRoomVoice, setStudyRoomMic } from "@/hooks/useStudyRoomActivity";

beforeEach(() => vi.clearAllMocks());

it("forwards the room and recipient to the existing signed-in client", async () => {
  rpc.mockResolvedValue({ data: null, error: null });
  expect(await studyRoomActivityRpc("encourage_study_room_member", {
    _room: "room-a", _recipient: "student-b",
  })).toEqual({ data: null, error: null });
  expect(rpc).toHaveBeenCalledWith("encourage_study_room_member", {
    _room: "room-a", _recipient: "student-b",
  });
});

it("preserves missing-migration errors rather than pretending an action succeeded", async () => {
  const error = { message: "Could not find the function public.set_study_room_mic" };
  rpc.mockResolvedValue({ data: null, error });
  await expect(setStudyRoomMic("room-a", "request")).rejects.toEqual(error);
});

it("preserves server rejection of unauthorized voice signaling", async () => {
  const error = { message: "ROOM_MEMBERSHIP_REQUIRED" };
  rpc.mockResolvedValue({ data: null, error });
  await expect(sendStudyRoomVoice("room-a", "student-b", "connection", "attempt", {
    type: "leave",
  })).rejects.toEqual(error);
});