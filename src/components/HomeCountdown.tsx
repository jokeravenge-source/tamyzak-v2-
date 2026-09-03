import { useEffect, useState } from "react";
import { Timer, X } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";

const DEFAULT_TARGET_ISO = "2026-06-13T07:00";

function readCountdownSettings() {
  return {
    name: localStorage.getItem("custom_countdown_name_v1") || "",
    target: localStorage.getItem("custom_countdown_date_v1") || DEFAULT_TARGET_ISO,
  };
}

export default function HomeCountdown({ language }: { language: AppLanguage }) {
  const [settings, setSettings] = useState(readCountdownSettings);
  const [now, setNow] = useState(Date.now);
  const [visible, setVisible] = useState(() => localStorage.getItem("countdown_hidden_v1") !== "1");

  useEffect(() => {
    const sync = () => setSettings(readCountdownSettings());
    window.addEventListener("storage", sync);
    window.addEventListener("app:countdown-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("app:countdown-changed", sync);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  const targetDate = new Date(settings.target);
  const targetMs = targetDate.getTime();
  const diff = Math.max(0, (Number.isFinite(targetMs) ? targetMs : now) - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const units = language === "ar"
    ? { d: "يوم", h: "ساعة", m: "دقيقة" }
    : { d: "Days", h: "Hours", m: "Min" };
  const eventName = settings.name.trim() || (language === "ar" ? "موعد مهم" : "Important date");
  const formattedTarget = Number.isFinite(targetMs)
    ? targetDate.toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : "";

  const dismiss = () => {
    localStorage.setItem("countdown_hidden_v1", "1");
    setVisible(false);
  };

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 shrink-0">
        <Timer className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {language === "ar" ? "موعد مهم" : "Save the date"}
        </p>
        <p className="font-semibold text-sm truncate">{eventName} — {formattedTarget}</p>
      </div>
      <div className="sm:hidden shrink-0 rounded-xl bg-primary/10 px-3 py-2 text-center">
        <span className="block text-base font-black tabular-nums text-primary">{days}</span>
        <span className="block text-[9px] text-muted-foreground">{units.d}</span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-sm font-bold tabular-nums">
        <span>{String(days).padStart(2, "0")}</span><span className="text-muted-foreground text-xs">{units.d}</span>
        <span className="text-muted-foreground mx-1">·</span>
        <span>{String(hours).padStart(2, "0")}</span><span className="text-muted-foreground text-xs">{units.h}</span>
        <span className="text-muted-foreground mx-1">·</span>
        <span>{String(minutes).padStart(2, "0")}</span><span className="text-muted-foreground text-xs">{units.m}</span>
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground p-1 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
