import type { ReactNode } from "react";
import { StudyRoomActivityContext, useStudyRoomActivity } from "@/hooks/useStudyRoomActivity";
import { useActiveStudyRoomId } from "@/lib/activeStudyRoom";
import StudyRoomCheerCelebration from "./StudyRoomCheerCelebration";

export default function StudyRoomActivityProvider({ user, language, inSessions = false, children }: {
  user: string | null;
  language: "ar" | "en";
  inSessions?: boolean;
  children: ReactNode;
}) {
  const room = useActiveStudyRoomId();
  const activity = useStudyRoomActivity(room, user, inSessions);
  return (
    <StudyRoomActivityContext.Provider value={{ room, user, activity }}>
      {user && <StudyRoomCheerCelebration key={user} user={user} language={language} />}
      {children}
    </StudyRoomActivityContext.Provider>
  );
}
