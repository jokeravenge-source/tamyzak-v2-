import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Server verifies arrival and elapsed study time; tabs never supply point amounts. */
export function useFlightStudySync(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let busy = false;
    let stopped = false;
    const sync = async () => {
      if (busy || stopped || document.visibilityState === "hidden") return;
      busy = true;
      try {
        const { data, error } = await supabase.rpc("sync_my_study_flights");
        if (!stopped && !error && data && typeof data === "object" && !Array.isArray(data) && (Number(data.pointsAdded) > 0 || Number(data.studySecondsAdded) > 0)) {
          window.dispatchEvent(new Event("app:progress-updated"));
        }
        if (error && !stopped) console.warn("Flight study sync:", error.message);
      } catch (error) {
        if (!stopped) console.warn("Flight study sync unavailable", error);
      } finally { busy = false; }
    };
    const refresh = () => { void sync(); };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [enabled]);
}
