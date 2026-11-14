import { useRef, useState } from "react";
import { RotateCcw, VolumeX } from "lucide-react";
import type { PhysicsSchemePart } from "@/data/physicsSchemes";
import type { AppLanguage } from "@/components/LanguageGate";

export function SchemeVideo({ part, language, describedBy }: { part: PhysicsSchemePart; language: AppLanguage; describedBy: string }) {
  const player = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [speed, setSpeed] = useState(1);
  const ar = language === "ar";
  if (!part.video) return null;
  return <div className="overflow-hidden rounded-2xl border border-sky-200 bg-[#07182e]">
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-sky-100">
      <span className="inline-flex items-center gap-2"><VolumeX className="size-4" aria-hidden />{ar ? "توضيح متحرك بدون صوت" : "Silent visual explanation"}</span>
      <span>{part.video.durationSeconds} {ar ? "ثانية" : "seconds"}</span>
    </div>
    {failed ? <div role="status" className="p-3 text-center text-sky-50">
      <img src={part.image} alt={part.imageAlt[language]} className="w-full" />
      <p className="my-3 text-sm">{ar ? "تعذّر تحميل الفيديو. المخطط والنص متاحان، وتكدر تعيد المحاولة." : "Video could not load. The diagram and text are available; you can retry."}</p>
      <button onClick={() => setFailed(false)} className="min-h-11 rounded-xl bg-sky-600 px-5 font-bold">{ar ? "إعادة المحاولة" : "Try again"}</button>
    </div> : <video ref={player} key={part.id} controls playsInline muted loop preload="metadata" poster={part.image}
      aria-label={part.title[language]} aria-describedby={describedBy}
      onError={() => setFailed(true)} onLoadedMetadata={() => { if (player.current) player.current.playbackRate = speed; }}
      className="aspect-[4/3] w-full object-contain">
      <source src={part.video.src} type="video/mp4" />
      {ar ? "متصفحك لا يدعم الفيديو. راجع المخطط والنص أسفله." : "Your browser does not support video. Read the diagram and text below."}
    </video>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-sm text-sky-50">
      <button disabled={failed} onClick={() => { if (player.current) { player.current.currentTime = 0; void player.current.play().catch(() => {}); } }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-3 font-bold disabled:opacity-40"><RotateCcw className="size-4" aria-hidden />{ar ? "أعد التوضيح" : "Replay"}</button>
      <label className="flex min-h-11 items-center gap-2">{ar ? "السرعة" : "Speed"}<select aria-label={ar ? "سرعة الفيديو" : "Video speed"} value={speed} onChange={(e) => { const rate = Number(e.target.value); setSpeed(rate); if (player.current) player.current.playbackRate = rate; }} className="min-h-11 rounded-lg bg-[#173b5e] px-3 text-white">{[0.5,0.75,1,1.25,1.5].map(rate => <option key={rate} value={rate}>{rate}×</option>)}</select></label>
    </div>
  </div>;
}
