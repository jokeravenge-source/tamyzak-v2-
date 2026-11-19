import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Item = { id: number; lane: number; y: number; coin: boolean };
type Props = {
  active: boolean;
  segment: number;
  avatar: string;
  ar: boolean;
  onQuestion: () => void;
  onFinish: () => void;
};

export default function StudyRunner({
  active,
  segment,
  avatar,
  ar,
  onQuestion,
  onFinish,
}: Props) {
  const model = useRef({
    lane: 1,
    elapsed: 0,
    spawn: 0,
    distance: 0,
    hearts: 3,
    coins: 0,
    jump: 0,
    items: [] as Item[],
    id: 0,
    stopped: false,
  });
  const [view, setView] = useState({ ...model.current });
  const callbacks = useRef({ onQuestion, onFinish });
  callbacks.current = { onQuestion, onFinish };
  const touch = useRef<{ x: number; y: number } | null>(null);
  const move = (direction: number) => {
    if (!active) return;
    model.current.lane = Math.max(
      0,
      Math.min(2, model.current.lane + direction),
    );
    setView({ ...model.current });
  };
  const jump = () => {
    if (active && model.current.jump <= 0) model.current.jump = 0.85;
  };
  useEffect(() => {
    model.current.elapsed = 0;
    model.current.stopped = false;
  }, [segment]);
  useEffect(() => {
    if (!active) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      const game = model.current;
      if (document.hidden || game.stopped) return;
      game.elapsed = Math.min(10, game.elapsed + dt);
      game.distance += dt * 12;
      game.jump = Math.max(0, game.jump - dt);
      game.spawn += dt;
      if (game.spawn >= 1.6) {
        game.spawn = 0;
        const lane = Math.floor(Math.random() * 3);
        game.items.push({ id: game.id++, lane, y: -10, coin: false });
        game.items.push({
          id: game.id++,
          lane: (lane + 1) % 3,
          y: -10,
          coin: true,
        });
      }
      game.items = game.items.filter((item) => {
        const before = item.y;
        item.y += dt * 24;
        if (before < 79 && item.y >= 79 && item.lane === game.lane) {
          if (item.coin) game.coins++;
          else if (game.jump <= 0) game.hearts--;
          return false;
        }
        return item.y < 110;
      });
      setView({ ...game });
      if (game.hearts <= 0) {
        game.stopped = true;
        callbacks.current.onFinish();
      } else if (game.elapsed >= 10 - 0.001) {
        game.stopped = true;
        callbacks.current.onQuestion();
      }
    }, 40);
    return () => window.clearInterval(timer);
  }, [active, segment]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        !active ||
        !["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)
      )
        return;
      event.preventDefault();
      if (event.key === "ArrowLeft") move(-1);
      else if (event.key === "ArrowRight") move(1);
      else jump();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active]);

  return (
    <section className="runner-shell">
      <div className="runner-hud">
        <span aria-label={ar ? "القلوب" : "Lives"}>
          ♥ {Math.max(0, view.hearts)}
        </span>
        <span>● {view.coins}</span>
        <span>{Math.floor(view.distance)} m</span>
        <span>
          {ar ? "السؤال بعد" : "Question in"}{" "}
          {Math.max(0, 10 - Math.floor(view.elapsed))} s
        </span>
      </div>
      <div
        className={`runner-field ${active ? "" : "runner-frozen"}`}
        dir="ltr"
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          touch.current = null;
          if (!start) return;
          const dx = e.changedTouches[0].clientX - start.x;
          const dy = e.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 25)
            move(dx > 0 ? 1 : -1);
          else if (dy < -25) jump();
        }}
      >
        <div className="runner-scenery" />
        <div className="runner-road" />
        {view.items.map((item) => (
          <div
            key={item.id}
            className={`runner-item ${item.coin ? "runner-coin" : "runner-barrier"}`}
            style={{
              left: `${((item.lane + 0.5) * 100) / 3}%`,
              top: `${item.y}%`,
            }}
            aria-hidden="true"
          >
            {item.coin ? "✦" : "▰"}
          </div>
        ))}
        <div
          className={`runner-sprite ${view.jump > 0 ? "runner-jumping" : ""}`}
          style={{ left: `${((view.lane + 0.5) * 100) / 3}%` }}
        >
          <img src={avatar} alt={ar ? "شخصيتك" : "Your runner"} />
        </div>
        {!active && (
          <div className="runner-stop">
            {ar ? "الركض متوقف" : "Running paused"}
          </div>
        )}
      </div>
      <div className="runner-controls" dir="ltr">
        <Button
          disabled={!active}
          onClick={() => move(-1)}
          aria-label={ar ? "يسار" : "Left"}
        >
          ◀
        </Button>
        <Button disabled={!active} onClick={jump}>
          {ar ? "اقفز" : "Jump"}
        </Button>
        <Button
          disabled={!active}
          onClick={() => move(1)}
          aria-label={ar ? "يمين" : "Right"}
        >
          ▶
        </Button>
      </div>
    </section>
  );
}
