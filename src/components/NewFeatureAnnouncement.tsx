import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Megaphone, Sparkles, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isExternalAnnouncementLink, normalizeAnnouncementLink } from "@/lib/announcementLinks";

export type FeatureAnnouncement = {
  id: string;
  kind: "feature" | "fix";
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  link_url: string | null;
  created_at: string;
};

/**
 * Non-blocking home-screen announcement rail.
 *
 * Active announcements remain available as horizontally scrollable cards;
 * they never interrupt the student with a modal or full-screen overlay.
 */
const NewFeatureAnnouncement = ({ language }: { language: "en" | "ar" }) => {
  const isAr = language === "ar";
  const [announcements, setAnnouncements] = useState<FeatureAnnouncement[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("feature_announcements")
        .select("id, kind, title_ar, title_en, desc_ar, desc_en, link_url, created_at")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled && data) setAnnouncements(data as FeatureAnnouncement[]);
    })();
    return () => { cancelled = true; };
  }, []);

  if (announcements.length === 0) return null;

  return (
    <section className="mb-6" aria-labelledby="home-announcements-title">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Megaphone className="h-4 w-4" />
          </span>
          <div>
            <h2 id="home-announcements-title" className="text-sm font-black text-foreground sm:text-base">
              {isAr ? "آخر تحديثات تميّزك" : "What’s new in Tamayzak"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {isAr ? "اسحب حتى تشوف كل الأخبار" : "Swipe to see every update"}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-black text-muted-foreground">
          {announcements.length}
        </span>
      </div>

      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-color:hsl(var(--primary)/0.35)_transparent] [scrollbar-width:thin]"
        dir={isAr ? "rtl" : "ltr"}
      >
        {announcements.map((announcement, index) => {
          const isFix = announcement.kind === "fix";
          const Icon = isFix ? Wrench : Sparkles;
          const linkUrl = normalizeAnnouncementLink(announcement.link_url ?? "");
          const cardClassName = `relative flex min-h-44 w-[82%] min-w-[270px] max-w-[360px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.6rem] border p-5 shadow-sm transition-transform sm:w-[340px] ${
            linkUrl ? "cursor-pointer hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" : ""
          } ${
            isFix
              ? "border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-card to-teal-500/10"
              : "border-violet-400/30 bg-gradient-to-br from-violet-500/15 via-card to-sky-500/10"
          }`;
          const cardContent = (
            <>
              <span
                aria-hidden="true"
                className={`absolute -end-10 -top-12 h-32 w-32 rounded-full blur-2xl ${isFix ? "bg-emerald-400/20" : "bg-violet-400/20"}`}
              />
              <div className="relative flex items-start gap-3">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${isFix ? "bg-emerald-500 text-white" : "bg-violet-600 text-white"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${isFix ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-violet-500/15 text-violet-700 dark:text-violet-300"}`}>
                    {isFix ? (isAr ? "تم الإصلاح" : "Fixed") : (isAr ? "ميزة جديدة" : "New feature")}
                  </span>
                  <h3 className="mt-2 line-clamp-2 text-base font-black leading-6 text-foreground">
                    {isAr ? announcement.title_ar : announcement.title_en}
                  </h3>
                </div>
              </div>
              <p className="relative mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {isAr ? announcement.desc_ar : announcement.desc_en}
              </p>
              {linkUrl && (
                <span className="relative mt-auto flex items-center gap-1.5 pt-3 text-xs font-black text-primary">
                  {isAr ? "فتح الرابط" : "Open link"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              )}
            </>
          );
          const motionProps = {
            initial: { opacity: 0, x: isAr ? 14 : -14 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: Math.min(index * 0.05, 0.25), duration: 0.28 },
          };

          return linkUrl ? (
            <motion.a
              key={announcement.id}
              href={linkUrl}
              target={isExternalAnnouncementLink(linkUrl) ? "_blank" : undefined}
              rel={isExternalAnnouncementLink(linkUrl) ? "noopener noreferrer" : undefined}
              aria-label={`${isAr ? announcement.title_ar : announcement.title_en} — ${isAr ? "فتح الرابط" : "Open link"}`}
              className={cardClassName}
              {...motionProps}
            >
              {cardContent}
            </motion.a>
          ) : (
            <motion.article key={announcement.id} className={cardClassName} {...motionProps}>
              {cardContent}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default NewFeatureAnnouncement;
