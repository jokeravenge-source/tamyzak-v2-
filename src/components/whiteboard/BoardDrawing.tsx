import { Fragment, useId } from "react";
import { ArrowRight, Presentation } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { readableMath } from "@/lib/readableMath";
import {
  BOARD_NOTES,
  type BoardAction,
  type BoardFocus,
  type BoardLesson,
  type BoardNote,
} from "../../../supabase/functions/_shared/whiteboard";

type DrawingFrame = {
  visible: Set<BoardFocus>;
  links: Set<Extract<BoardAction, { kind: "arrow" }>["target"]>;
  notes: Partial<Record<BoardNote, string>>;
  equation: string | null;
  highlight: BoardFocus | null;
  gap: number;
};

export function drawingFrame(lesson: BoardLesson, index: number, progress: number): DrawingFrame {
  const frame: DrawingFrame = {
    visible: new Set(),
    links: new Set(),
    notes: {},
    equation: null,
    highlight: null,
    gap: 0,
  };
  lesson.steps.slice(0, index + 1).forEach((step, stepIndex) => {
    const time = index === stepIndex ? progress : 1;
    for (const action of step.actions) {
      if (action.at > time) break;
      switch (action.kind) {
        case "reveal":
          frame.visible.add(action.target);
          break;
        case "label":
          frame.notes[action.target] = action.text;
          frame.visible.add(action.target);
          break;
        case "equation":
          frame.equation = action.text;
          frame.visible.add("equation");
          break;
        case "arrow":
          frame.links.add(action.target);
          if (action.target === "distance") frame.visible.add("distance");
          break;
        case "highlight":
          if (stepIndex === index && frame.visible.has(action.target)) frame.highlight = action.target;
          break;
        case "double-gap": {
          const t = Math.min(1, (time - action.at) / 0.23);
          frame.gap = t * t * (3 - 2 * t);
          break;
        }
      }
    }
  });
  return frame;
}

function ParallelPlates({ frame, focus, ar }: { frame: DrawingFrame; focus: BoardFocus | null; ar: boolean }) {
  const id = useId().replace(/:/g, "");
  const gap = 120 * (1 + frame.gap);
  const left = 310 - gap / 2;
  const right = 310 + gap / 2;
  const distance = frame.gap === 1 ? "2d" : frame.gap > 0 ? "d → 2d" : "d";
  const distanceShown = frame.visible.has("distance");

  return (
    <svg
      viewBox="85 10 450 270"
      role="img"
      aria-label={(ar ? "لوحان متوازيان" : "Two parallel plates") + (distanceShown ? " · " + (ar ? "المسافة " : "Distance ") + distance : "")}
      className="mx-auto block w-full max-w-[27rem]"
      data-distance={distanceShown ? distance : undefined}
    >
      <defs>
        <linearGradient id={id + "-plate"} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="hsl(var(--primary) / .1)" />
          <stop offset="1" stopColor="hsl(var(--primary) / .36)" />
        </linearGradient>
        <marker id={id + "-arrow"} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto-start-reverse">
          <path d="M1 1 L5 3.5 L1 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      {frame.visible.has("dielectric") && (
        <>
          <path d={`M${left} 67 L${left + 38} 44 H${right + 38} L${right} 67 V195 H${left}Z`}
            className={focus === "dielectric" ? "fill-primary/25 stroke-primary" : "fill-primary/10 stroke-primary/25"}
            strokeWidth="2" strokeDasharray="6 6" />
          <text x="326" y="135" textAnchor="middle" className="fill-foreground text-[32px] font-bold">ε</text>
        </>
      )}
      {[{ x: left, key: "left" }, { x: right, key: "right" }].map(({ x, key }) => (
        <g key={key} className={focus === "plates" || (focus === "area" && key === "left") ? "stroke-primary" : "stroke-foreground/75"} strokeLinejoin="round">
          <path d={`M${x} 67 L${x + 38} 44 V195 L${x} 218 Z`} fill={`url(#${id}-plate)`} strokeWidth="3.2" />
          <path d={`M${x} 67 l-8 -5 38 -23 8 5 M${x - 8} 62 V213 l8 5`} fill="none" strokeWidth="2" opacity=".55" />
        </g>
      ))}
      {frame.visible.has("area") && (
        <g className={focus === "area" ? "text-primary" : "text-foreground"} stroke="currentColor" strokeWidth="2.5">
          <path d={`M${left - 12} 94 H${left - 48} V177 H${left - 12}`} fill="none" strokeLinecap="round" />
          <text x={left - 67} y="146" textAnchor="middle" stroke="none" fill="currentColor" className="text-[31px] font-bold">A</text>
        </g>
      )}
      {distanceShown && (
        <g className={focus === "distance" ? "text-primary" : "text-foreground"}>
          <path d={`M${left} 220 V248 M${right} 220 V248`} stroke="currentColor" strokeWidth="1.8" opacity=".5" strokeDasharray="4 4" />
          <path d={`M${left + 3} 241 H${right - 3}`} stroke="currentColor" strokeWidth="2.4" markerStart={`url(#${id}-arrow)`} markerEnd={`url(#${id}-arrow)`} />
          <text x="310" y="270" textAnchor="middle" fill="currentColor" className="text-[26px] font-bold">{distance}</text>
        </g>
      )}
    </svg>
  );
}

function ConceptNotes({ frame, focus, ar }: { frame: DrawingFrame; focus: BoardFocus | null; ar: boolean }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
      {BOARD_NOTES.map((key, index) => {
        const value = frame.notes[key];
        const next = BOARD_NOTES[index + 1];
        const linked = next && frame.notes[next] && frame.links.has(key === "idea" ? "idea-reason" : "reason-result");
        return (
          <Fragment key={key}>
            <div className={value ? `min-w-0 rounded-xl border px-3 py-3 text-center text-sm font-bold leading-relaxed [overflow-wrap:anywhere] ${focus === key ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20" : "border-border bg-background/80"}` : "hidden sm:block"} dir="auto">{value}</div>
            {linked && value
              ? <ArrowRight aria-hidden="true" className={`mx-auto size-5 rotate-90 text-primary ${ar ? "sm:rotate-180" : "sm:rotate-0"}`} />
              : next && <span className="hidden w-2 sm:block" />}
          </Fragment>
        );
      })}
    </div>
  );
}

export default function BoardDrawing({
  template, frame, interruption, language, solved,
}: {
  template: BoardLesson["template"];
  frame: DrawingFrame;
  interruption: BoardFocus | null;
  language: AppLanguage;
  solved: boolean;
}) {
  const ar = language === "ar";
  const focus = interruption ?? frame.highlight;
  const visual = frame.visible.size > 0;
  return (
    <div className="whiteboard-surface flex min-w-0 flex-1 flex-col justify-center gap-3 px-3 py-4 sm:min-h-[18rem] sm:p-6">
      {!visual && <div className="grid min-h-[8.5rem] place-content-center justify-items-center gap-3 text-center text-sm text-muted-foreground">
        <Presentation aria-hidden="true" className="size-8 text-primary/70" strokeWidth={1.5} />
        <span>{ar ? "شغّل الشرح حتى نبدي الرسم" : "Play the explanation to start drawing"}</span>
      </div>}
      {template === "parallel-plates" && frame.visible.has("plates") && <ParallelPlates frame={frame} focus={focus} ar={ar} />}
      {template === "notes" && Object.keys(frame.notes).length > 0 && <ConceptNotes frame={frame} focus={focus} ar={ar} />}
      {frame.equation && (
        <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
          <div role="math" aria-label={frame.equation} className={`max-w-full rounded-xl border bg-card px-4 py-2 font-mono text-lg font-bold [overflow-wrap:anywhere] sm:text-xl ${focus === "equation" ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
            {frame.equation === "C = εA/d" ? (
              <span aria-hidden="true" className="inline-flex items-center gap-2">
                C = <span className="grid text-center leading-tight"><span className="border-b border-current px-1.5 pb-0.5">εA</span><span className="pt-0.5">d</span></span>
              </span>
            ) : readableMath(frame.equation)}
          </div>
          {solved && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-base font-bold text-foreground">C₂ = εA/(2d) = C/2</div>}
        </div>
      )}
    </div>
  );
}
