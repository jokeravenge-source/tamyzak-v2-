import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import "./StudyLounge.css";

export type LoungeState = "focus" | "break" | "idle";

export function LoungeScenery({ language }: { language: "ar" | "en" }) {
  return <div className="tmz-lounge-decor" aria-hidden="true">
    <div className="tmz-lounge-wall" />
    <div className="tmz-lounge-window"><div className="tmz-lounge-city">
      {[36, 68, 52, 83, 46, 73, 58, 90, 45, 64].map((height, index) => <i key={index} style={{ height: height + "%" }} />)}
    </div></div>
    <div className="tmz-lounge-sign"><BookOpen size={24} strokeWidth={1.8} />Tamayzak<small>{language === "ar" ? "غرفة التركيز" : "FOCUS LOUNGE"}</small></div>
    <div className="tmz-lounge-shelf"><i/><i/><i/><i/></div>
    <div className="tmz-lounge-floor" />
  </div>;
}

export function LoungeDesk({ state, children }: { state: LoungeState; children: ReactNode }) {
  return <div className="tmz-desk" data-state={state}>
    <div className="tmz-desk-lamp" aria-hidden="true"/>
    <div className="tmz-desk-avatar">{children}</div>
    <div className="tmz-desk-front" aria-hidden="true"/>
    <div className="tmz-desk-top" aria-hidden="true"/>
    {state === "break" ? <div className="tmz-desk-cup" aria-hidden="true"/> : <div className="tmz-desk-books" aria-hidden="true"/>}
  </div>;
}

export function LoungeStatus({ state, language }: { state: LoungeState; language: "ar" | "en" }) {
  const copy = language === "ar" ? { focus: "يركّز", break: "استراحة", idle: "بانتظار البدء" } : { focus: "Focusing", break: "On break", idle: "Waiting" };
  return <span className="tmz-status" data-state={state}>{copy[state]}</span>;
}
