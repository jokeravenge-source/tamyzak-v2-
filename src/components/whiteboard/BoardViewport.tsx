import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Maximize, Minus, Plus } from "lucide-react";

type Point = { x: number; y: number };
type View = Point & { scale: number };
const fitted: View = { scale: 1, x: 0, y: 0 };
const center = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const spacing = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

export default function BoardViewport({ children, ar }: { children: ReactNode; ar: boolean }) {
  const surface = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const firstPoint = useRef<Point | null>(null);
  const gesture = useRef(false);
  const camera = useRef<View>(fitted);
  const [view, setView] = useState<View>(fitted);
  const change = (next: View) => {
    const bounds = surface.current?.getBoundingClientRect();
    if (!bounds) return;
    camera.current = {
      scale: next.scale,
      x: clamp(next.x, bounds.width * (next.scale - 1) / 2),
      y: clamp(next.y, bounds.height * (next.scale - 1) / 2),
    };
    setView(camera.current);
  };

  const zoom = (factor: number, from = { x: 0, y: 0 }, to = from) => {
    const current = camera.current;
    const scale = Math.max(1, Math.min(3, current.scale * factor));
    const ratio = scale / current.scale;
    change({ scale, x: to.x - (from.x - current.x) * ratio, y: to.y - (from.y - current.y) * ratio });
  };

  const point = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - (bounds.left + bounds.width / 2), y: event.clientY - (bounds.top + bounds.height / 2) };
  };

  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const position = point(event);
    if (pointers.current.size === 0) {
      firstPoint.current = position;
      gesture.current = false;
    } else {
      gesture.current = true;
    }
    pointers.current.set(event.pointerId, position);
    // Capture on the button itself so a stationary touch still dispatches its click.
    const target = event.target instanceof Element ? event.target.closest("button") : null;
    (target ?? event.currentTarget).setPointerCapture?.(event.pointerId);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    const before = [...pointers.current.values()];
    const position = point(event);
    if (firstPoint.current && spacing(firstPoint.current, position) > 7) gesture.current = true;
    pointers.current.set(event.pointerId, position);
    const after = [...pointers.current.values()];
    if (before.length >= 2) {
      const span = spacing(before[0], before[1]);
      if (span >= 4) zoom(spacing(after[0], after[1]) / span, center(before[0], before[1]), center(after[0], after[1]));
    } else if (gesture.current && camera.current.scale > 1) {
      change({
        ...camera.current,
        x: camera.current.x + after[0].x - before[0].x,
        y: camera.current.y + after[0].y - before[0].y,
      });
    }
  };

  const stop = (event: PointerEvent<HTMLDivElement>) => { pointers.current.delete(event.pointerId); };
  const controls = [
    { label: ar ? "صغّر السبورة" : "Zoom out", icon: Minus, run: () => zoom(1 / 1.3), disabled: view.scale === 1 },
    { label: ar ? "كبّر السبورة" : "Zoom in", icon: Plus, run: () => zoom(1.3), disabled: view.scale === 3 },
    { label: ar ? "ارجع لحجم السبورة" : "Fit board", icon: Maximize, run: () => change(fitted), disabled: view.scale === 1 },
  ];

  return (
    <div className="relative">
      <div ref={surface} onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
        onClickCapture={event => { if (gesture.current && event.detail > 0) { event.preventDefault(); event.stopPropagation(); } }}
        data-testid="board-viewport" className="touch-none overflow-hidden"
        style={{ cursor: view.scale > 1 ? "grab" : undefined }}>
        <div data-board-scale={view.scale} className="origin-center select-none"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
          {children}
        </div>
      </div>
      <div role="group" aria-label={ar ? "حجم السبورة" : "Board zoom"}
        className="absolute end-2 top-2 flex rounded-xl border border-border bg-card/95 p-0.5 shadow-sm">
        {controls.map(({ label, icon: Icon, run, disabled }) => (
          <button key={label} type="button" aria-label={label} title={label} disabled={disabled} onClick={run}
            className="grid size-10 place-items-center rounded-lg text-foreground hover:bg-muted disabled:opacity-35">
            <Icon aria-hidden="true" className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
