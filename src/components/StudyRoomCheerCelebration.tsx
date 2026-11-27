import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";
import { STUDY_ROOM_CHEER_RECEIVED, type RoomCheer, type StudyRoomCheerEvent } from "@/hooks/useStudyRoomActivity";
import { censorText } from "@/lib/censor";
import "./StudyRoomCheerCelebration.css";

const DURATION_MS = 3800;
const numberFormats = { ar: new Intl.NumberFormat("ar-IQ"), en: new Intl.NumberFormat("en") };
const colors = ["#66ddff", "#e3fbff", "#ffd27f", "#ff8dc8", "#ab9fff"];
const particles = Array.from({ length: 40 }, (_, index) => {
  const angle = index * 2.399963;
  const distance = 0.46 + (index % 7) * 0.11;
  return {
    shape: ["star", "diamond", "ribbon"][index % 3],
    style: {
      "--cheer-x": `${Math.cos(angle) * 47 * distance}vw`,
      "--cheer-y": `${Math.sin(angle) * 49 * distance + 14}vh`,
      "--cheer-spin": `${(index % 2 ? -1 : 1) * (90 + index % 7 * 42)}deg`,
      "--cheer-size": `${6 + index % 5 * 2}px`,
      "--cheer-color": colors[index % colors.length],
      "--cheer-delay": `${(index % 8) * 28}ms`,
    } as CSSProperties,
  };
});

type Celebration = { latest: RoomCheer; count: number; points: number };

function combine(current: Celebration | null, incoming: Celebration): Celebration {
  return {
    latest: incoming.latest,
    count: (current?.count ?? 0) + incoming.count,
    points: (current?.points ?? 0) + incoming.points,
  };
}

export default function StudyRoomCheerCelebration({ user, language }: {
  user: string;
  language: "ar" | "en";
}) {
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const isArabic = language === "ar";

  useEffect(() => {
    let timeout: number | undefined;
    let pending: Celebration | null = null;
    const show = (incoming: Celebration) => {
      setCelebration(current => combine(current, incoming));
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setCelebration(null), DURATION_MS);
    };
    const receive = (event: Event) => {
      const cheer = (event as StudyRoomCheerEvent).detail;
      if (cheer?.recipient !== user || cheer.cheers.length === 0) return;
      const incoming = {
        latest: cheer.cheers[0],
        count: cheer.cheers.length,
        points: cheer.cheers.reduce((total, item) => total + (item.reward_points ?? 0), 0),
      };
      if (document.hidden) pending = combine(pending, incoming);
      else show(incoming);
    };
    const resume = () => {
      if (document.hidden || !pending) return;
      show(pending);
      pending = null;
    };

    window.addEventListener(STUDY_ROOM_CHEER_RECEIVED, receive);
    document.addEventListener("visibilitychange", resume);
    return () => {
      window.removeEventListener(STUDY_ROOM_CHEER_RECEIVED, receive);
      document.removeEventListener("visibilitychange", resume);
      window.clearTimeout(timeout);
    };
  }, [user]);

  const numberFormat = numberFormats[language];

  return createPortal(
    <div className="room-cheer" role="status" aria-live="polite" aria-atomic="true" dir={isArabic ? "rtl" : "ltr"}>
      {celebration && (
        <div className="room-cheer__scene" key={`${celebration.latest.created_at}:${celebration.count}`}
          style={{ "--cheer-duration": `${DURATION_MS}ms` } as CSSProperties}>
          <div className="room-cheer__halo" aria-hidden="true" />
          <div className="room-cheer__wave" aria-hidden="true" />
          <div className="room-cheer__burst" aria-hidden="true">
            {particles.map(({ shape, style }, index) => (
              <span key={index} className="room-cheer__particle" data-shape={shape} style={style} />
            ))}
          </div>
          <div className="room-cheer__card">
            <span className="room-cheer__medal" aria-hidden="true"><Heart size={31} fill="currentColor" /></span>
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
