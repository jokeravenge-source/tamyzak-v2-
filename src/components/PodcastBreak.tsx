import { useEffect, useState } from "react";
import type { PodcastBreakPlan } from "@/lib/podcastBreak";

export default function PodcastBreak({
  plan,
  onContinue,
}: {
  plan: PodcastBreakPlan;
  onContinue: () => void;
}) {
  const [until, setUntil] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(plan.minutes * 60);
  useEffect(() => {
    if (until === null) return;
    const update = () =>
      setRemaining(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [until]);
  const button =
    "rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-bold";
  return (
    <section
      className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-cyan-300/25 bg-slate-900 p-7 text-center"
      dir="rtl"
    >
      <h2 className="text-2xl font-black">وقت نفس صغير؟</h2>
      <p className="leading-8 text-slate-200">{plan.reason}</p>
      {until === null ? (
        <>
          <p>نقترح استراحة {plan.minutes} دقايق حسب كثافة الشرح وإجاباتك.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              className={button}
              onClick={() => setUntil(Date.now() + plan.minutes * 60000)}
            >
              آخذ استراحة
            </button>
            <button className={button} onClick={onContinue}>
              نكمل هسه
            </button>
          </div>
        </>
      ) : (
        <>
          <p
            className="text-4xl font-black"
            role="timer"
            aria-label="الوقت المتبقي للاستراحة"
          >
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}
          </p>
          {remaining === 0 && <p role="status">خلصت الاستراحة، جاهز نكمّل؟</p>}
          <button className={button} onClick={onContinue}>
            جاهز، نكمّل المراجعة
          </button>
        </>
      )}
    </section>
  );
}
