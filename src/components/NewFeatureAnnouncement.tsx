import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wrench, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type FeatureAnnouncement = {
  id: string;
  kind: "feature" | "fix";
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
};

/**
 * Announcements are managed by admins in the admin dashboard.
 * Each announcement is shown ONCE per device (tracked forever by its id),
 * so users never see the same change repeated day after day.
 */
const KEY = "seen_feature_announcement_ids";

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeSeen(seen: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(seen.slice(-300)));
  } catch {
    /* ignore */
  }
}

const NewFeatureAnnouncement = ({ language }: { language: "en" | "ar" }) => {
  const isAr = language === "ar";
  const [queue, setQueue] = useState<FeatureAnnouncement[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("feature_announcements")
        .select("id, kind, title_ar, title_en, desc_ar, desc_en")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(20);
      if (cancelled || !data) return;
      const seen = readSeen();
      setQueue((data as FeatureAnnouncement[]).filter((f) => !seen.includes(f.id)));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = queue[0];
  const dismiss = () => {
    if (!current) return;
    writeSeen([...readSeen(), current.id]);
    setQueue((q) => q.slice(1));
  };

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={dismiss} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-primary/40 bg-card/95 p-7 text-center shadow-[var(--shadow-glow)]"
          >
            <button
              onClick={dismiss}
              aria-label={isAr ? "إغلاق" : "Close"}
              className="absolute top-3 end-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
              {current.kind === "fix" ? (
                <Wrench className="h-7 w-7 text-primary" />
              ) : (
                <Sparkles className="h-7 w-7 text-primary" />
              )}
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {current.kind === "fix"
                ? (isAr ? "تم الإصلاح" : "Fixed")
                : (isAr ? "ميزة جديدة" : "New feature")}
            </p>

            <h2 className="mt-2 text-2xl font-bold gradient-text">
              {isAr ? current.title_ar : current.title_en}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {isAr ? current.desc_ar : current.desc_en}
            </p>
            <button
              onClick={dismiss}
              className="mt-6 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {isAr ? "تمام" : "Got it"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewFeatureAnnouncement;
