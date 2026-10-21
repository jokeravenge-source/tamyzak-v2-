import { useMemo } from "react";

export type StudyTextBlock = { type: "text"; text: string } | {
  type: "math";
  width: number;
  height: number;
  runs: { t: string; x: number; y: number; s: number; w?: number }[];
  rules: number[][];
};

/** Real, selectable text. Layout is retained only for mathematical working. */
export function TextStudyContent({ blocks }: { blocks: StudyTextBlock[] }) {
  const hasMath = blocks.some(block => block.type === "math");
  const measure = useMemo(() => {
    if (!hasMath || typeof document === "undefined") return undefined;
    return document.createElement("canvas").getContext("2d");
  }, [hasMath]);
  const scale = 1.2;
  return <div className="min-w-0 space-y-4 text-left" dir="ltr">
    {blocks.map((block, index) => block.type === "text"
      ? <p key={index} dir="auto" className="whitespace-pre-line break-words text-base leading-8 sm:text-lg">{block.text}</p>
      : <div key={index} className="max-w-full overflow-x-auto rounded-xl border border-current/15 bg-current/[0.03] p-3" tabIndex={0} aria-label="Calculation; scroll horizontally if needed">
        <div className="relative select-text font-serif" style={{ width: block.width * scale, height: block.height * scale }}>
          {block.runs.map((run, i) => {
            let ratio = 1;
            if (measure && run.w) {
              measure.font = `${run.s * scale}px serif`;
              const width = measure.measureText(run.t).width;
              if (width) ratio = run.w * scale / width;
            }
            return <span key={i} className="absolute whitespace-pre leading-none" style={{
              left: run.x * scale, top: (run.y - run.s * .82) * scale,
              fontSize: run.s * scale, transform: `scaleX(${ratio})`, transformOrigin: "left top",
            }}>{run.t}</span>;
          })}
          {block.rules.map(([x, y, width], i) => <span key={`rule-${i}`} aria-hidden="true" className="pointer-events-none absolute border-t border-current" style={{ left: x * scale, top: y * scale, width: width * scale }} />)}
        </div>
      </div>)}
  </div>;
}
