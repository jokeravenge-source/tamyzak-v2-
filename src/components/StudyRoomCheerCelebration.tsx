import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";
import { STUDY_ROOM_CHEER_RECEIVED, type RoomCheer, type StudyRoomCheerEvent } from "@/hooks/useStudyRoomActivity";
import { censorText } from "@/lib/censor";
import "./StudyRoomCheerCelebration.css";

const DURATION_MS = 3200;
const numberFormats = { ar: new Intl.NumberFormat("ar-IQ"), en: new Intl.NumberFormat("en") };
const colors = ["#77deff", "#daf8ff", "#ffbf76", "#f299d3", "#a39eff"];
const particles = Array.from({ length: 28 }, (_, index) => {
  const angle = index * 2.399963;
  const distance = 0.5 + (index % 5) * 0.12;
  return {
    shape: ["star", "diamond", "ribbon"][index % 3],
    style: {
      "--cheer-x": `${Math.cos(angle) * 48 * distance}vw`,
      "--cheer-y": `${Math.sin(angle) * 43 * distance + 12}dvh`,
      "--cheer-spin": `${80 + (index % 7) * 37}deg`,
      "--cheer-size": `${5 + (index % 5) * 2}px`,
      "--cheer-color": colors[index % colors.length],
      "--cheer-delay": `${(index % 7) * 26}ms`,
    } as CSSProperties,
  };
});

type Celebration = { latest: RoomCheer; count: number; points: number };

export default function StudyRoomCheerCelebration({ room, user, language }: {
  room: string;
  user: string;
  language: "ar" | "en";
}) {
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const isArabic = language === "ar";

  useEffect(() => {
    let timeout: number | undefined;
    const receive = (event: Event) => {
      const cheer = (event as StudyRoomCheerEvent).detail;
      if (cheer?.room !== room || cheer.recipient !== user || cheer.cheers.length === 0) return;
      const points = cheer.cheers.reduce((total, item) => total + (item.reward_points ?? 0), 0);
      setCelebration(current => ({
        latest: cheer.cheers[0],
        count: (current?.count ?? 0) + cheer.cheers.length,
        points: (current?.points ?? 0) + points,
      }));
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setCelebration(null), DURATION_MS);
    };

    window.addEventListener(STUDY_ROOM_CHEER_RECEIVED, receive);
    return () => {
      window.removeEventListener(STUDY_ROOM_CHEER_RECEIVED, receive);
      window.clearTimeout(timeout);
    };
  }, [room, user]);

  const numberFormat = numberFormats[language];

  return createPortal(
    <div className="room-cheer" role="status" aria-live="polite" aria-atomic="true" dir={isArabic ? "rtl" : "ltr"}>
      {celebration && (
        <div className="room-cheer__scene" key={`${celebration.latest.created_at}:${celebration.count}`}>
          <div className="room-cheer__halo" aria-hidden="true" />
          <div className="room-cheer__burst" aria-hidden="true">
            {particles.map(({ shape, style }, index) => (
              <span key={index} className="room-cheer__particle" data-shape={shape} style={style} />
            ))}
          </div>
          <div className="room-cheer__card">
            <span className="room-cheer__medal" aria-hidden="true"><Heart size={23} fill="currentColor" /></span>
            <p className="room-cheer__message">
              {celebration.count === 1 ? (
                <><bdi>{censorText(celebration.latest.sender_name)}</bdi> {isArabic ? "شجّعك!" : "cheered you on!"}</>
              ) : isArabic ? `وصلك ${numberFormat.format(celebration.count)} تشجيع!` : `You got ${celebration.count} cheers!`}
            </p>
            {celebration.points > 0 && (
              <p className="room-cheer__points">
                <bdi dir="ltr" className="room-cheer__amount">+{numberFormat.format(celebration.points)}</bdi>
                <span>{isArabic ? "نقاط" : "points"}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
