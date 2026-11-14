import { supabase } from "@/integrations/supabase/client";
import type { FlightInvitation, FlightStudent, Journey, JourneyRepository } from "./journeys";

/** Server-owned clocks and city ledger. Never fall back to local points. */
export function createCloudRepository(): JourneyRepository {
  async function action<T>(name: string, args: { _flight_id?: string; _destination_id?: string; _invitee_id?: string; _accept?: boolean } = {}) {
    const { data, error } = await supabase.rpc("study_flights_action", { _action: name, ...args });
    if (error) throw new Error(error.code === "PGRST202" || error.code === "42883" ? "flight_setup_required" : error.message);
    return data as unknown as T;
  }
  const list = async (studentId: string) => {
    const state = await action<{ userId: string; serverNow: number; journeys: Journey[]; accountChanges?: { pointsAdded: number; studySecondsAdded: number } }>("state");
    if (state.userId !== studentId) throw new Error("authentication_required");
    if (state.accountChanges && (state.accountChanges.pointsAdded > 0 || state.accountChanges.studySecondsAdded > 0)) {
      window.dispatchEvent(new Event("app:progress-updated"));
    }
    const clockOffsetMs = Number(state.serverNow) - Date.now();
    return state.journeys.map((journey) => ({ ...journey, clockOffsetMs }));
  };
  return {
    accountBacked: true,
    list,
    async create(studentId, destinationId) {
      const result = await action<{ journeyId: string; created: boolean }>("create", { _destination_id: destinationId });
      const journey = (await list(studentId)).find((row) => row.id === result.journeyId);
      if (!journey) throw new Error("flight_not_found");
      return { journey, created: result.created };
    },
    async markArrivalSeen(_studentId, id) { await action("seen", { _flight_id: id }); },
    async pause(_studentId, id) { await action("pause", { _flight_id: id }); },
    async resume(_studentId, id) { await action("resume", { _flight_id: id }); },
    async invite(flightId, userId) { await action("invite", { _flight_id: flightId, _invitee_id: userId }); },
    invitations: () => action<FlightInvitation[]>("inbox"),
    async respondInvitation(flightId, accept) { await action("respond", { _flight_id: flightId, _accept: accept }); },
    async sellVisa(_studentId, id) { return action<{ points: number }>("sell", { _flight_id: id }); },
    async searchStudents(query) {
      const clean = query.trim().replace(/[%_\\]/g, "");
      if (clean.length < 2) return [];
      const { data, error } = await supabase.from("profiles").select("user_id,display_name,gender,character")
        .ilike("display_name", `%${clean}%`).limit(12);
      if (error) throw error;
      return (data ?? []).map((row) => ({ userId: row.user_id, displayName: row.display_name,
        gender: row.gender === "female" ? "female" : "male", character: row.character })) as FlightStudent[];
    },
  };
}
