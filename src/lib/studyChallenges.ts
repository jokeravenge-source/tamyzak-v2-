import type { StudyFocusPeriod } from "./studyFocusPeriods";
import { STUDY_TIMER_HEARTBEAT_MS, type StudyTimerDisplay } from "./studyTimerDisplay";
import { STARTED_PRESENCE_MS } from "./sessionPresenceClock";

export type StudyChallengeParticipant = {
  userId: string;
  displayName: string;
  status: "pending" | "accepted" | "declined";
  totalSeconds: number;
  joinedAt?: string;
  savedFocus?: StudyFocusPeriod[];
};

export const ALL_OR_NOTHING_MIN_PLAYERS = 3;
export const ALL_OR_NOTHING_MAX_DAYS = 30;

export function isValidAllOrNothingDuration(days: number, hours: number) {
  return Number.isInteger(days) && Number.isInteger(hours) && days >= 0 && hours >= 0 && hours < 24 &&
    (days > 0 || hours > 0) && days * 24 + hours <= ALL_OR_NOTHING_MAX_DAYS * 24;
}

export type StudyChallenge = {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  startsAt: string;
  endsAt: string;
  status: "active" | "cancelled";
  myStatus: "pending" | "accepted" | "declined" | "open";
  isPublic?: boolean;
  challengeType?: "standard" | "all_or_nothing";
  publicSeries?: "weekly" | "monthly" | null;
  roomState?: "lobby" | "running" | "settled" | "cancelled";
  wagerPoints?: number | null;
  durationDays?: number;
  durationHours?: number;
  lobbyExpiresAt?: string | null;
  winnerId?: string | null;
  settledAt?: string | null;
  minimumPlayers?: number | null;
  potPoints?: number | null;
  participants: StudyChallengeParticipant[];
};

export function challengePhase(challenge: StudyChallenge, now = Date.now()) {
  if (challenge.status === "cancelled" || challenge.roomState === "cancelled") return "cancelled" as const;
  if (challenge.roomState === "settled") return "completed" as const;
  if (challenge.challengeType === "all_or_nothing" && challenge.roomState === "lobby") {
    if (challenge.lobbyExpiresAt && new Date(challenge.lobbyExpiresAt).getTime() <= now) return "cancelled" as const;
    if (challenge.myStatus === "open") return "open" as const;
    if (challenge.myStatus === "pending") return "invited" as const;
    return "lobby" as const;
  }
  if (new Date(challenge.endsAt).getTime() <= now) return "completed" as const;
  if (challenge.myStatus === "open") return "open" as const;
  if (challenge.myStatus === "pending") return "invited" as const;
  return "active" as const;
}

export function acceptedStandings(challenge: StudyChallenge, now = Date.now()) {
  const startsAt = Date.parse(challenge.startsAt);
  const endsAt = Math.min(Date.parse(challenge.endsAt), now);
  const elapsedSeconds = Number.isFinite(startsAt) && Number.isFinite(endsAt)
    ? Math.max(0, Math.floor((endsAt - startsAt) / 1000))
    : 0;
  return challenge.participants
    .filter((participant) => participant.status === "accepted")
    // Keep old/cached RPC responses within the physically possible window too.
    .map((participant) => ({
      ...participant,
      totalSeconds: Number.isFinite(participant.totalSeconds)
        ? Math.min(elapsedSeconds, Math.max(0, Math.floor(participant.totalSeconds)))
        : 0,
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds || a.displayName.localeCompare(b.displayName));
}

export const LIVE_STUDY_GRACE_MS = STUDY_TIMER_HEARTBEAT_MS * 3;
export const LIVE_STUDY_HANDOFF_MS = STUDY_TIMER_HEARTBEAT_MS;

/** Both lists are ordered and individually coalesced. Merge them without replaying an overlap. */
function coveredMilliseconds(saved: StudyFocusPeriod[], live: StudyFocusPeriod[], start: number, end: number) {
  let a = 0;
  let b = 0;
  let through = start;
  let total = 0;
  while (a < saved.length || b < live.length) {
    const [from, to] = b >= live.length || (a < saved.length && saved[a][0] <= live[b][0]) ? saved[a++] : live[b++];
    const clippedEnd = Math.min(to, end);
    if (clippedEnd > Math.max(from, through)) {
      total += clippedEnd - Math.max(from, through);
      through = clippedEnd;
    }
  }
  return total;
}

export function liveChallengeStandings(
  challenge: StudyChallenge,
  timers: Readonly<Record<string, StudyTimerDisplay>>,
  now: number,
  savedRequestedAt: number,
) {
  const liveRoom = challenge.challengeType === "all_or_nothing" && challenge.roomState === "running" &&
    challenge.myStatus === "accepted" && challengePhase(challenge, now) === "active";
  return acceptedStandings(challenge, now).map(participant => {
    const timer = liveRoom ? timers[participant.userId] : undefined;
    const saved = participant.savedFocus;
    const joinedAt = Date.parse(participant.joinedAt ?? "");
    if (!saved || !timer?.focus || !Number.isFinite(joinedAt)) return { ...participant, isStudying: false };
    const endedAt = timer.focusEndedAt;
    if (endedAt !== undefined && (savedRequestedAt >= endedAt || now - endedAt >= LIVE_STUDY_HANDOFF_MS)) {
      return { ...participant, isStudying: false };
    }
    const age = Math.min(now, endedAt ?? now) - (timer.observedAt ?? timer.sampledAt);
    if (age > STARTED_PRESENCE_MS || age < -60_000) return { ...participant, isStudying: false };

    const from = Math.max(Date.parse(challenge.startsAt), joinedAt);
    const until = Math.min(Date.parse(challenge.endsAt), now);
    const { periods, run } = timer.focus;
    const projected = timer.sampledAt + Math.max(0, Math.min(age, LIVE_STUDY_GRACE_MS));
    const runEnd = run
      ? Math.min(run[1], run[0] + Math.floor((projected - run[0]) / 1000) * 1000)
      : null;
    const live = run && runEnd !== null && runEnd > run[0] ? [...periods, [run[0], runEnd] as StudyFocusPeriod] : periods;
    return {
      ...participant,
      totalSeconds: Math.max(participant.totalSeconds, Math.floor(coveredMilliseconds(saved, live, from, until) / 1000)),
      isStudying: endedAt === undefined && !!run && age < LIVE_STUDY_GRACE_MS && run[1] > projected && until > from,
    };
  }).sort((a, b) => b.totalSeconds - a.totalSeconds || a.displayName.localeCompare(b.displayName));
}

export function formatStudySeconds(seconds: number, language: "ar" | "en") {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (language === "ar") return hours > 0 ? `${hours} س ${minutes} د` : `${minutes} د`;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function remainingLabel(endsAt: string, language: "ar" | "en", now = Date.now()) {
  const remaining = Math.max(0, new Date(endsAt).getTime() - now);
  if (remaining === 0) return language === "ar" ? "انتهى" : "Finished";
  const totalHours = Math.ceil(remaining / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return formatChallengeDuration(days, hours, language);
}

export function formatChallengeDuration(days: number, hours: number, language: "ar" | "en") {
  if (days > 0) return language === "ar" ? `${days} يوم ${hours} ساعة` : `${days}d ${hours}h`;
  return language === "ar" ? `${hours} ساعة` : `${hours}h`;
}
