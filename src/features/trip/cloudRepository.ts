import { supabase } from "@/integrations/supabase/client";
import { createLocalRepository, type Journey, type JourneyRepository } from "./journeys";

/** Local repository mirrored to the account so journeys (and admin-granted visas) follow the student across devices. */
export function createCloudRepository(): JourneyRepository {
  const local = createLocalRepository();

  const push = async (studentId: string) => {
    const list = await local.list(studentId);
    if (!list.length) return;
    await supabase.from("trip_journeys").upsert(
      list.map((j) => ({ id: j.id, user_id: studentId, data: j as never, updated_at: new Date().toISOString() })),
    );
  };

  const pull = async (studentId: string) => {
    const { data } = await supabase.from("trip_journeys").select("data").eq("user_id", studentId);
    const remote = (data ?? []).map((r) => r.data as unknown as Journey);
    if (!remote.length) return;
    const KEY = "tamayzak.trip.journeys.v1";
    const all: Journey[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    for (const r of remote) {
      const i = all.findIndex((x) => x.id === r.id);
      if (i < 0) all.push(r);
    }
    localStorage.setItem(KEY, JSON.stringify(all));
  };

  const after = <T,>(studentId: string, p: Promise<T>) =>
    p.then(async (v) => { try { await push(studentId); } catch { /* offline */ } return v; });

  return {
    async list(studentId) {
      try { await pull(studentId); } catch { /* offline */ }
      return local.list(studentId);
    },
    create: (s, c, n) => after(s, local.create(s, c, n)),
    markArrivalSeen: (s, id, n) => after(s, local.markArrivalSeen(s, id, n)),
    pause: (s, id, n) => after(s, local.pause(s, id, n)),
    resume: (s, id, n) => after(s, local.resume(s, id, n)),
  };
}
