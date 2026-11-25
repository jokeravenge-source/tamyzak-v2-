import { Fragment, useId, type ReactNode } from "react";
import { Presentation } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { readableMath } from "@/lib/readableMath";
import DielectricDrawing from "./DielectricDrawing";
import { askPartLabel, drawingPart, drawingText, type DrawingSelection } from "./drawingQuestions";
import {
  BOARD_NOTES,
  type BoardFocus,
  type BoardLesson,
  type BoardNote,
} from "../../../supabase/functions/_shared/whiteboard";

type NoteRow = {
  stepIndex: number;
  labels: Partial<Record<BoardNote, { text: string; reveal: number }>>;
  arrows: Partial<Record<"idea-reason" | "reason-result", number>>;
};

type DrawingFrame = {
  visible: Set<BoardFocus>;
  equation: string | null;
  equations: { text: string; reveal: number; stepIndex: number }[];
  reveal: Partial<Record<BoardFocus, number>>;
  origins: Partial<Record<BoardFocus, number>>;
  noteRows: NoteRow[];
  highlight: BoardFocus | null;
  gap: number;
};

export function drawingFrame(lesson: BoardLesson, index: number, progress: number, instant = false): DrawingFrame {
  const frame: DrawingFrame = {
    visible: new Set(),
    equation: null,
    equations: [],
    reveal: {},
    origins: {},
    noteRows: [],
    highlight: null,
    gap: 0,
  };
  lesson.steps.slice(0, index + 1).forEach((step, stepIndex) => {
    const time = index === stepIndex ? progress : 1;
    if (stepIndex === index && time === 0 && !instant) return;
    const row: NoteRow = { stepIndex, labels: {}, arrows: {} };
    for (const action of step.actions) {
      if (action.at > time) break;
      const ink = instant || time === 1 ? 1 : Math.min(1, (time - action.at) / .15);
      switch (action.kind) {
        case "reveal":
          frame.visible.add(action.target);
          frame.reveal[action.target] = ink;
          frame.origins[action.target] = stepIndex;
          break;
        case "label":
          row.labels[action.target] = { text: action.text, reveal: ink };
          frame.visible.add(action.target);
          break;
        case "equation":
          frame.equation = action.text;
          frame.equations.push({ text: action.text, reveal: ink, stepIndex });
          frame.visible.add("equation");
          break;
        case "arrow":
          if (action.target === "distance") {
            frame.visible.add("distance");
            frame.reveal.distance = ink;
            frame.origins.distance = stepIndex;
          } else row.arrows[action.target] = ink;
          break;
        case "highlight":
          if (stepIndex === index && frame.visible.has(action.target)) frame.highlight = action.target;
          break;
        case "double-gap": {
          const t = instant ? 1 : Math.min(1, (time - action.at) / 0.23);
          frame.gap = t * t * (3 - 2 * t);
          if (frame.visible.has("distance")) frame.origins.distance = stepIndex;
          break;
        }
      }
    }
    if (Object.keys(row.labels).length) frame.noteRows.push(row);
  });
  return frame;
}

type Interaction = { selected?: DrawingSelection | null; onAsk?: (part: DrawingSelection) => void };
type PartRegion = [target: Parameters<typeof drawingPart>[0], x: number, y: number, width: number, height: number];

function DrawingDiagram({ children, template, frame, ar, selected, onAsk }: Interaction & {
  children: ReactNode;
  template: "parallel-plates" | "dielectric-plates";
  frame: DrawingFrame;
  ar: boolean;
}) {
  const dielectric = template === "dielectric-plates";
  const halfGap = 60 * (1 + frame.gap);
  const left = 310 - halfGap;
  const right = 310 + halfGap;
  const regions: PartRegion[] = dielectric
    ? [
      ["dielectric", 147, 78, 326, 219],
      ["plates", 98, 84, 49, 163], ["plates", 474, 84, 49, 163],
      ["field", 158, 96, 305, 44], ["polarization", 155, 140, 304, 46],
      ["net-field", 225, 187, 172, 42],
    ]
    : [
      ["dielectric", left + 24, 54, right - left - 24, 140],
      ["plates", left - 16, 29, 66, 184], ["plates", right - 16, 29, 66, 184],
      ["area", left - 89, 79, 76, 99], ["distance", left, 216, right - left, 51],
    ];
  const view = dielectric ? { x: 0, y: 0, width: 620, height: 340 } : { x: 85, y: 10, width: 450, height: 270 };
  return (
    <div className={`relative mx-auto w-full ${dielectric ? "max-w-[39rem]" : "max-w-[27rem]"}`}>
      {children}
      {onAsk && regions.map(([target, x, y, width, height], index) => {
        const origin = frame.origins[target];
        if (origin === undefined || (frame.reveal[target] ?? 0) <= 0) return null;
        const part = drawingPart(target, origin, ar);
        const label = askPartLabel(part.label, ar);
        return (
          <button key={target + index} type="button" aria-label={label} title={label} aria-pressed={selected?.target === target}
            tabIndex={target === "plates" && regions[index - 1]?.[0] === target ? -1 : undefined}
            onClick={() => onAsk(part)} className="absolute cursor-pointer rounded-lg hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            style={{ left: (x - view.x) / view.width * 100 + "%", top: (y - view.y) / view.height * 100 + "%", width: width / view.width * 100 + "%", height: height / view.height * 100 + "%" }} />
        );
      })}
    </div>
  );
}

function ParallelPlates({ frame, focus, ar }: { frame: DrawingFrame; focus: BoardFocus | null; ar: boolean }) {
  const id = useId().replace(/:/g, "");
  const gap = 120 * (1 + frame.gap);
  const left = 310 - gap / 2;
  const right = 310 + gap / 2;
  const distance = frame.gap === 1 ? "2d" : frame.gap > 0 ? "d → 2d" : "d";
  const distanceShown = frame.visible.has("distance");
  const ink = (key: BoardFocus) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - (frame.reveal[key] ?? 1) });

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
            strokeWidth="2" opacity={frame.reveal.dielectric ?? 1} />
          <text x="326" y="135" textAnchor="middle" className="fill-foreground text-[32px] font-bold">ε</text>
        </>
      )}
      {[{ x: left, key: "left" }, { x: right, key: "right" }].map(({ x, key }) => (
        <g key={key} className={focus === "plates" || (focus === "area" && key === "left") ? "stroke-primary" : "stroke-foreground/75"} strokeLinejoin="round">
          <path d={`M${x} 67 L${x + 38} 44 V195 L${x} 218 Z`} fill={`url(#${id}-plate)`} fillOpacity={frame.reveal.plates ?? 1} strokeWidth="3.2" {...ink("plates")} />
          <path d={`M${x} 67 l-8 -5 38 -23 8 5 M${x - 8} 62 V213 l8 5`} fill="none" strokeWidth="2" opacity=".55" {...ink("plates")} />
        </g>
      ))}
      {frame.visible.has("area") && (
        <g className={focus === "area" ? "text-primary" : "text-foreground"} stroke="currentColor" strokeWidth="2.5">
          <path d={`M${left - 12} 94 H${left - 48} V177 H${left - 12}`} fill="none" strokeLinecap="round" {...ink("area")} />
          <text x={left - 67} y="146" textAnchor="middle" stroke="none" fill="currentColor" className="text-[31px] font-bold">A</text>
        </g>
      )}
      {distanceShown && (
        <g className={focus === "distance" ? "text-primary" : "text-foreground"}>
          <path d={`M${left} 220 V248 M${right} 220 V248`} stroke="currentColor" strokeWidth="1.8" opacity=".5" strokeDasharray="4 4" />
          <path d={`M${left + 3} 241 H${right - 3}`} stroke="currentColor" strokeWidth="2.4" {...ink("distance")}
            markerStart={(frame.reveal.distance ?? 1) === 1 ? `url(#${id}-arrow)` : undefined}
            markerEnd={(frame.reveal.distance ?? 1) === 1 ? `url(#${id}-arrow)` : undefined} />
          <text x="310" y="270" textAnchor="middle" fill="currentColor" className="text-[26px] font-bold">{distance}</text>
        </g>
      )}
    </svg>
  );
}

function ConceptNotes({ frame, focus, ar, selected, onAsk, paper }: { frame: DrawingFrame; focus: BoardFocus | null; ar: boolean; paper: boolean } & Interaction) {
  const grid = paper
    ? "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center"
    : "sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center";
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {frame.noteRows.map((row, rowIndex) => (
        <div key={rowIndex} className={`grid gap-1 border-b border-primary/15 pb-3 last:border-b-0 ${grid}`}>
          {BOARD_NOTES.map((key, index) => {
            const value = row.labels[key];
            const next = BOARD_NOTES[index + 1];
            const arrow = key === "idea" ? row.arrows["idea-reason"] : row.arrows["reason-result"];
            const allowed = value && value.reveal > 0 && onAsk;
            const part = value && drawingText(key, row.stepIndex, value.text, ar);
            const isSelected = selected?.target === key && selected.stepIndex === row.stepIndex && selected.label === value?.text;
            const highlight = selected ? isSelected : focus === key && rowIndex === frame.noteRows.length - 1;
            const className = value
              ? `min-w-0 px-2 py-1 text-center text-base font-bold leading-relaxed [overflow-wrap:anywhere] ${highlight ? "rounded-lg bg-primary/10 text-primary" : "text-foreground"}`
              : paper ? "block" : "hidden sm:block";
            return (
              <Fragment key={key}>
                {allowed && part ? (
                  <button type="button" aria-label={askPartLabel(part.label, ar)} aria-pressed={isSelected} onClick={() => onAsk(part)}
                    className={className + " rounded-lg hover:bg-primary/10"} style={{ opacity: value.reveal }} dir="auto">{value.text}</button>
                ) : <div className={className} style={{ opacity: value?.reveal ?? 1 }} dir="auto">{value?.text}</div>}
                {value && next && row.labels[next] && arrow !== undefined ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className={`mx-auto size-5 text-primary ${paper ? (ar ? "rotate-180" : "") : ar ? "rotate-90 sm:rotate-180" : "rotate-90 sm:rotate-0"}`}>
                    <path d="M3 12 Q11 11.6 20 12 M15 7 L20 12 L15 17" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - arrow} />
                  </svg>
                ) : next && <span className={paper ? "w-2" : "hidden w-2 sm:block"} />}
              </Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function BoardDrawing({
  template, frame, interruption, language, solved, onAsk, selected, paper = false,
}: {
  template: BoardLesson["template"];
  frame: DrawingFrame;
  interruption: BoardFocus | null;
  language: AppLanguage;
  solved: boolean;
  paper?: boolean;
} & Interaction) {
  const ar = language === "ar";
  const focus = selected?.target ?? interruption ?? (paper ? null : frame.highlight);
  const visual = frame.visible.size > 0;
  return (
    <div className={`flex min-w-0 flex-col justify-center gap-3 ${paper ? "px-8 py-6" : "whiteboard-surface min-h-[clamp(300px,51dvh,700px)] px-3 pb-5 pt-12 sm:px-6"}`}>
      {!visual && <div className="grid min-h-[8.5rem] place-content-center justify-items-center gap-3 text-center text-sm text-muted-foreground">
        <Presentation aria-hidden="true" className="size-8 text-primary/70" strokeWidth={1.5} />
        <span>{ar ? "شغّل الشرح حتى نبدي الرسم" : "Play the explanation to start drawing"}</span>
      </div>}
      {template !== "notes" && frame.visible.has("plates") && (
        <DrawingDiagram template={template} frame={frame} ar={ar} onAsk={onAsk} selected={selected}>
          {template === "parallel-plates" ? <ParallelPlates frame={frame} focus={focus} ar={ar} />
            : <DielectricDrawing ar={ar} visible={frame.visible} focus={focus} reveal={frame.reveal} />}
        </DrawingDiagram>
      )}
      {template === "notes" && frame.noteRows.length > 0 && <ConceptNotes frame={frame} focus={focus} ar={ar} onAsk={onAsk} selected={selected} paper={paper} />}
      {frame.equation && (
        <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
          {(template === "parallel-plates" ? frame.equations.slice(-1) : frame.equations).map((entry, index, entries) => {
            const part = drawingText("equation", entry.stepIndex, entry.text, ar);
            const isSelected = selected?.target === "equation" && selected.stepIndex === entry.stepIndex && selected.label === entry.text;
            const highlight = selected ? isSelected : focus === "equation" && index === entries.length - 1;
            const equation = (
              <span role="math" aria-label={entry.text} className={`block max-w-full rounded-lg border border-transparent py-1 font-mono font-bold [overflow-wrap:anywhere] ${paper ? "px-4 text-xl" : "px-2 text-base sm:px-4 sm:text-xl"} ${highlight ? "border-primary ring-2 ring-primary/20" : ""}`}>
                {entry.text === "C = εA/d" ? (
                  <span aria-hidden="true" className="inline-flex items-center gap-2">
                    C = <span className="grid text-center leading-tight"><span className="border-b border-current px-1.5 pb-0.5">εA</span><span className="pt-0.5">d</span></span>
                  </span>
                ) : readableMath(entry.text)}
              </span>
            );
            return onAsk && entry.reveal > 0 ? (
              <button key={index} type="button" aria-label={askPartLabel(part.label, ar)} aria-pressed={isSelected}
                onClick={() => onAsk(part)} className="max-w-full rounded-lg hover:bg-primary/10" style={{ opacity: entry.reveal }}>{equation}</button>
            ) : <div key={index} className="max-w-full" style={{ opacity: entry.reveal }}>{equation}</div>;
          })}
          {solved && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-base font-bold text-foreground">C₂ = εA/(2d) = C/2</div>}
        </div>
      )}
    </div>
  );
}
