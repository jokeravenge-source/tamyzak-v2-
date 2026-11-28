import { useLayoutEffect, useRef, useState, type ReactElement } from "react";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";
import challengeArt from "@/assets/challenge-3d-icon.png";
import hoodieArt from "@/assets/houdini-hoodie-icon.png";
import pointsArt from "@/assets/points-guide-lightning.webp";
import type { AppLanguage } from "@/components/LanguageGate";
import { TelegramLinkCard } from "@/components/TelegramLinkCard";
import { HOUDINI_STORE_URL } from "@/lib/storeLinks";
import "./homeCards.css";

function getCardOffset(card: Element, start: number, rtl: boolean) {
  const bounds = card.getBoundingClientRect();
  return (rtl ? bounds.right : bounds.left) - start;
}

function getTrackStart(track: HTMLElement) {
  const style = getComputedStyle(track);
  const bounds = track.getBoundingClientRect();
  const rtl = style.direction === "rtl";
  const padding = parseFloat(rtl ? style.paddingRight : style.paddingLeft);
  const start = rtl ? bounds.right - padding : bounds.left + padding;
  return { start, rtl, style };
}

const promoClass = "home-illustrated-card group grid min-h-[8.5rem] grid-cols-[minmax(0,1fr)_37%] items-center gap-2 overflow-hidden rounded-[1.4rem] border border-sky-400/25 px-3.5 py-3 text-start text-white transition-[filter] hover:brightness-110 focus-visible:!outline-offset-[-3px] sm:min-h-40 sm:gap-3 sm:px-5";

function PromoContent({ art, title, description, artSize = 816 }: { art: string | ReactElement; title: string; description?: string; artSize?: number }) {
  return (
    <>
      <span className="min-w-0">
        <span className="block text-[clamp(1.125rem,5.4vw,1.625rem)] font-black leading-snug tracking-tight">{title}</span>
        {description && <span className="mt-1.5 block text-[13px] leading-relaxed text-sky-100/85 sm:text-sm">{description}</span>}
      </span>
      {typeof art === "string" ? <img src={art} alt="" width={artSize} height={artSize} className="aspect-square max-h-32 w-full object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.35)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-105" /> : art}
    </>
  );
}

export default function HomeHighlights({ language, onOpenChallenge, pointsGuideTitle, onOpenPointsGuide, quickStudyTitle, onOpenQuickStudy }: {
  language: AppLanguage;
  onOpenChallenge: () => void;
  pointsGuideTitle: string;
  onOpenPointsGuide: () => void;
  quickStudyTitle: string;
  onOpenQuickStudy: () => void;
}) {
  const isRTL = language === "ar";
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ index: 0, count: 4 });

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const wide = window.matchMedia("(min-width: 640px)");
    let frame = 0;

    const measure = () => {
      frame = 0;
      const count = track.children.length;
      const { start, rtl, style } = getTrackStart(track);
      let index = 0;
      let nearest = Infinity;
      for (const [candidate, card] of Array.from(track.children).entries()) {
        const distance = Math.abs(getCardOffset(card, start, rtl));
        if (distance < nearest) {
          nearest = distance;
          index = candidate;
        }
      }
      if (wide.matches || !track.clientWidth) {
        track.style.removeProperty("--highlight-height");
      } else {
        const cardHeight = track.children[index].getBoundingClientRect().height;
        const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        track.style.setProperty("--highlight-height", `${Math.ceil(cardHeight + padding)}px`);
      }
      setPosition((current) => current.index === index && current.count === count ? current : { index, count });
    };

    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    const watchCards = () => {
      resize?.disconnect();
      resize?.observe(track);
      for (const card of track.children) resize?.observe(card);
    };
    const changes = new MutationObserver(() => {
      watchCards();
      schedule();
    });
    changes.observe(track, { childList: true });
    watchCards();
    measure();
    track.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      changes.disconnect();
      resize?.disconnect();
      track.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [language]);

  const showCard = (index: number) => {
    const track = trackRef.current;
    const card = track?.children[index];
    if (!track || !card) return;
    const { start, rtl } = getTrackStart(track);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: track.scrollLeft + getCardOffset(card, start, rtl), behavior: reduceMotion ? "auto" : "smooth" });
  };

  const Direction = isRTL ? ChevronLeft : ChevronRight;
  const challengeTitle = isRTL ? "انضم إلى التحدي" : "Join the challenge";
  const houdiniTitle = isRTL ? "اشتري من هوديني" : "Buy from Houdini";

  return (
    <section className="mb-3 min-w-0" aria-labelledby="home-highlights-title">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h2 id="home-highlights-title" className="text-lg font-black leading-snug tracking-tight sm:text-2xl">{isRTL ? "مختارات تميّزك" : "Tamayzak highlights"}</h2>
        <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-muted-foreground lg:hidden">
          {isRTL ? "اسحب للمزيد" : "Swipe for more"}<Direction aria-hidden="true" className="size-4" />
        </span>
      </div>
      <div
        ref={trackRef}
        className="-mx-3 flex h-[var(--highlight-height,auto)] min-w-0 snap-x snap-mandatory items-start gap-2.5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-3 px-3 pb-2 pt-0.5 [scrollbar-width:none] after:shrink-0 after:basis-[calc(12%_-_0.625rem)] after:content-[''] sm:mx-0 sm:h-auto sm:items-stretch sm:scroll-px-0 sm:px-0 sm:after:basis-[calc(50%_-_0.3125rem)] lg:after:basis-[calc(66.666667%_-_0.208333rem)] [&::-webkit-scrollbar]:hidden [&>*]:min-w-0 [&>*]:shrink-0 [&>*]:basis-[88%] [&>*]:snap-start [&>*]:snap-always sm:[&>*]:basis-[calc(50%_-_0.3125rem)] lg:[&>*]:basis-[calc(33.333333%_-_0.416667rem)]"
        role="group"
        aria-label={isRTL ? "عروض تميّزك" : "Tamayzak highlights"}
      >
        <button type="button" id="points-details-trigger" onClick={onOpenPointsGuide} className={promoClass}>
          <PromoContent art={pointsArt} artSize={320} title={pointsGuideTitle} />
        </button>
        <button type="button" id="quickStudy-details-trigger" onClick={onOpenQuickStudy} className={promoClass} aria-label={quickStudyTitle}>
          <PromoContent
            art={
              <span aria-hidden="true" className="mx-auto grid aspect-square w-full max-w-[5.25rem] place-items-center rounded-[1.3rem] border border-cyan-200/40 bg-gradient-to-br from-cyan-200/35 via-sky-400/25 to-blue-900/55 text-cyan-50 shadow-[0_8px_20px_#04172d70,inset_0_1px_0_#caf3ff50] motion-safe:transition-transform motion-safe:group-hover:scale-105">
                <Timer className="h-auto w-3/5" />
              </span>
            }
            title={quickStudyTitle}
            description={isRTL ? "اختار المادة والفصل وابدأ المراجعة" : "Choose a subject and chapter to review"}
          />
        </button>
        <button type="button" onClick={onOpenChallenge} className={promoClass} aria-label={challengeTitle}>
          <PromoContent art={challengeArt} title={challengeTitle} description={isRTL ? "اختبر مستواك وتنافس ويّه طلاب تميّزك" : "Test your skills against other Tamayzak students"} />
        </button>
        <a href={HOUDINI_STORE_URL} target="_blank" rel="noopener noreferrer" className={promoClass} aria-label={houdiniTitle}>
          <PromoContent art={hoodieArt} title={houdiniTitle} description={isRTL ? "اطلب هودي تميّزك من هوديني على إنستغرام" : "Order your Tamayzak hoodie from Houdini on Instagram"} />
        </a>
        <TelegramLinkCard language={language} source="home" variant="home" />
      </div>
      <div className="flex justify-center" role="group" aria-label={isRTL ? "اختيار بطاقة" : "Choose a highlight card"}>
        {Array.from({ length: position.count }, (_, index) => (
          <button
            type="button"
            key={index}
            aria-label={isRTL ? `عرض البطاقة ${index + 1} من ${position.count}` : `Show card ${index + 1} of ${position.count}`}
            aria-current={index === position.index ? "true" : undefined}
            className="grid size-8 !min-h-8 place-items-center rounded-full"
            onClick={() => showCard(index)}
          >
            <span aria-hidden="true" className={`h-1.5 rounded-full transition-[width,background-color] ${index === position.index ? "w-4 bg-primary" : "w-1.5 bg-border"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
