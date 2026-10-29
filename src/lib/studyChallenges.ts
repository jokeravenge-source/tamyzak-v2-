export type StudyChallengeParticipant = {
  userId: string;
  displayName: string;
  status: "pending" | "accepted" | "declined";
  totalSeconds: number;
};

export type StudyChallenge = {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  startsAt: string;
  endsAt: string;
  status: "active" | "cancelled";
  myStatus: "pending" | "accepted" | "declined";
  participants: StudyChallengeParticipant[];
};

export function challengePhase(challenge: StudyChallenge, now = Date.now()) {
  if (challenge.status === "cancelled") return "cancelled" as const;
  if (new Date(challenge.endsAt).getTime() <= now) return "completed" as const;
  if (challenge.myStatus === "pending") return "invited" as const;
  return "active" as const;
}

export function acceptedStandings(challenge: StudyChallenge) {
  return challenge.participants
    .filter((participant) => participant.status === "accepted")
    .sort((a, b) => b.totalSeconds - a.totalSeconds || a.displayName.localeCompare(b.displayName));
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
  if (days > 0) return language === "ar" ? `${days} يوم ${hours} ساعة` : `${days}d ${hours}h`;
  return language === "ar" ? `${hours} ساعة` : `${hours}h`;
}
