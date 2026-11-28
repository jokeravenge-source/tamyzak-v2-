import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVisibilityGatedChannel } from "@/lib/realtimeVisibility";
import { displayedPresenceSeconds } from "@/lib/sessionPresenceClock";
import { displayedStudyTimerSeconds, formatStudyTimer as formatHMS, isStudyTimerFocusing } from "@/lib/studyTimerDisplay";
import { useStudyTimerPresence } from "@/hooks/useStudyTimerPresence";
import { CharacterAvatar, type CharacterTraits, type Gender } from "./CharacterAvatar";
import StudentProfileDialog from "./StudentProfileDialog";
import { LoungeScenery, LoungeDesk, LoungeStatus, type LoungeState } from "./StudyLounge";
import { Users } from "lucide-react";

type Occupant = {
  user_id: string;
  subject: string;
  mission: string;
  display_name: string;
  gender: Gender | null;
  character: Partial<CharacterTraits> | null;
  started_at: string;
  last_seen_at: string;
  elapsed_seconds: number;
  is_running: boolean;
  observed_at_ms?: number;
};

const SUBJECT_LABEL: Record<string, { en: string; ar: string }> = {
  islamic: { en: "Islamic", ar: "التربية الإسلامية" },
  arabic: { en: "Arabic", ar: "العربية" },
  english: { en: "English", ar: "الإنجليزية" },
  french: { en: "French", ar: "الفرنسية" },
  math: { en: "Math", ar: "الرياضيات" },
  physics: { en: "Physics", ar: "الفيزياء" },
  chemistry: { en: "Chemistry", ar: "الكيمياء" },
  biology: { en: "Biology", ar: "الأحياء" },
};

const ROOM_CAPACITY = 20;
const PRESENCE_WINDOW_MS = 8 * 60 * 1000;

export default function StudyRoom({
  language,
  subject,
  currentUserId,
  timerSeconds,
  timerRunning,
  timerDisplayRunning,
  timerStarted,
}: {
  language: "en" | "ar";
  subject: string;
  currentUserId?: string | null;
  timerSeconds?: number;
  timerRunning?: boolean;
  timerDisplayRunning?: boolean;
  timerStarted?: boolean;
}) {
  const [people, setPeople] = useState<Occupant[]>([]);
  const roomTimers = useStudyTimerPresence();
  const [now, setNow] = useState(Date.now());
  const [openProfile, setOpenProfile] = useState<string | null>(null);
  const loadRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // Keep users visible through short network hiccups, background tab throttling,
      // and delayed reconnects instead of dropping them after one missed heartbeat.
      const since = new Date(Date.now() - PRESENCE_WINDOW_MS).toISOString();
      const { data: active, error: activeErr } = await supabase
        .from("active_sessions")
        .select("user_id,subject,mission,last_seen_at,started_at,elapsed_seconds,is_running")
        .eq("subject", subject)
        .gte("last_seen_at", since);
      if (!mounted) return;
      // On transient query errors, keep the previous list so characters don't flash out.
      if (activeErr) return;
      const rows = active ?? [];
      if (rows.length === 0) { setPeople([]); return; }
      const ids = rows.map((r: any) => r.user_id);
      const { data: profs, error: profErr } = await supabase
        .from("profiles")
        .select("user_id,display_name,gender,character")
        .in("user_id", ids);
      // If profile lookup fails, keep showing the previous render rather than wiping.
      if (profErr) return;
      const pmap = new Map<string, any>();
      (profs ?? []).forEach((p: any) => pmap.set(p.user_id, p));
      const observedAtMs = Date.now();
      setPeople((previousPeople) => {
        // Preserve the local tick anchor while realtime refreshes return the
        // same snapshot; reset it when that student's heartbeat advances.
        const prevById = new Map(previousPeople.map((p) => [p.user_id, p] as const));
        const mapped: Occupant[] = rows.map((r: any) => {
          const p = pmap.get(r.user_id) ?? {};
          const prev = prevById.get(r.user_id);
          const elapsedSeconds = r.elapsed_seconds ?? 0;
          const isRunning = !!r.is_running;
          const unchangedSnapshot = prev &&
            prev.elapsed_seconds === elapsedSeconds &&
            prev.is_running === isRunning &&
            prev.last_seen_at === r.last_seen_at;
          return {
            user_id: r.user_id,
            subject: r.subject,
            mission: r.mission,
            display_name: p.display_name ?? prev?.display_name ?? "Student",
            gender: (p.gender ?? prev?.gender ?? "male") as Gender,
            character: p.character ?? prev?.character ?? null,
            started_at: r.started_at,
            last_seen_at: r.last_seen_at,
            elapsed_seconds: elapsedSeconds,
            is_running: isRunning,
            // A first fetch is not proof that the owner is still active. Start
            // the clock-skew-safe local anchor only after a snapshot advances.
            observed_at_ms: unchangedSnapshot
              ? prev.observed_at_ms
              : prev ? observedAtMs : undefined,
          };
        });
        // Put current user first
        mapped.sort((a, b) => {
          if (currentUserId) {
            if (a.user_id === currentUserId) return -1;
            if (b.user_id === currentUserId) return 1;
          }
          return new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
        });
        return mapped.slice(0, ROOM_CAPACITY);
      });
    };

    load();
    loadRef.current = load;
    return () => { mounted = false; };
  }, [subject, currentUserId]);

  // Realtime updates only while the tab is visible; one fresh fetch on regain.
  useVisibilityGatedChannel(
    () =>
      supabase
        .channel(`active_sessions_room_${subject}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "active_sessions", filter: `subject=eq.${subject}` }, () => loadRef.current?.())
        .subscribe(),
    [subject],
    () => loadRef.current?.(),
  );

  const subj = SUBJECT_LABEL[subject];
  const subjLabel = subj ? (language === "ar" ? subj.ar : subj.en) : subject;
  const label = language === "ar" ? `غرفة ${subjLabel}` : `${subjLabel} Room`;
  const empty = language === "ar" ? "لا يوجد أحد يدرس هنا الآن. كن أوّل من يبدأ!" : "Empty room. Be the first to start!";
  const capacityLabel = language === "ar"
    ? `${people.length}/${ROOM_CAPACITY} داخل الغرفة`
    : `${people.length}/${ROOM_CAPACITY} inside`;

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          {label}
          <span className="text-xs text-muted-foreground font-normal">
            ({capacityLabel})
          </span>
        </h2>
      </div>

      {/* Client-rendered focus lounge */}
      <div className="tmz-lounge">
        <LoungeScenery language={language} />

        {/* People */}
        {people.length === 0 ? (
          <div className="tmz-lounge-empty">
            <p className="text-sm text-muted-foreground bg-background/60 backdrop-blur px-4 py-2 rounded-full">{empty}</p>
          </div>
        ) : (
          <div className="tmz-lounge-people">
            {people.map((p) => {
              const isMe = currentUserId && p.user_id === currentUserId;
              const roomTimer = roomTimers[p.user_id];
              const liveSeconds = displayedStudyTimerSeconds(roomTimer, now);
              const remoteSeconds = liveSeconds ?? displayedPresenceSeconds(p, now);
              const liveTimer = liveSeconds !== null ? roomTimer : undefined;
              const hasLocalTimer = isMe && timerStarted !== undefined;
              const reading = hasLocalTimer ? !!(timerStarted && timerRunning) : remoteSeconds !== null &&
                isStudyTimerFocusing(liveTimer, p.is_running);
              const clockRunning = hasLocalTimer ? timerStarted && (timerDisplayRunning ?? timerRunning) :
                remoteSeconds !== null && (liveTimer?.isRunning ?? p.is_running);
              const loungeState: LoungeState = reading ? "focus" : clockRunning ? "break" : "idle";
              return (
                <button
                  key={p.user_id}
                  type="button"
                  onClick={() => setOpenProfile(p.user_id)}
                  className="tmz-seat flex flex-col items-center rounded-xl transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={language === "ar" ? `ملف ${p.display_name}` : `${p.display_name} profile`}
                >
                  <div className={`mb-1 px-2 py-0.5 rounded-full backdrop-blur border text-xs font-medium max-w-[120px] truncate ${isMe ? "bg-primary text-primary-foreground border-primary" : "bg-background/80 border-primary/30"}`}>
                    {isMe ? (language === "ar" ? "أنت" : "You") : p.display_name}
                  </div>
                  {remoteSeconds !== null && !!p.mission && (
                    <div className="mb-1 max-w-[120px] truncate rounded-full bg-background/75 px-2 py-0.5 text-[10px] text-muted-foreground" title={p.mission}>
                      {p.mission}
                    </div>
                  )}
                  <LoungeDesk state={loungeState}>
                    <CharacterAvatar gender={p.gender} traits={p.character} size={96} reading={reading} />
                  </LoungeDesk>
                  <LoungeStatus state={loungeState} language={language} />
                  <div dir="ltr" className={`mt-1.5 text-sm font-semibold font-mono tabular-nums px-2 py-1 rounded-full border ${clockRunning ? "bg-primary/15 text-primary border-primary/30" : "bg-background/60 text-muted-foreground border-border"}`}>
                    {hasLocalTimer
                      ? timerStarted ? formatHMS(timerSeconds ?? 0) : "--:--"
                      : remoteSeconds !== null ? formatHMS(remoteSeconds) : "--:--"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <StudentProfileDialog userId={openProfile} language={language} onClose={() => setOpenProfile(null)} />
    </section>
  );
}
