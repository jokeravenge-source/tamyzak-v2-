import { useId, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Crown, Trophy } from "lucide-react";
import houdiniArt from "@/assets/houdini-hoodie-icon.png";
import lightningArt from "@/assets/points-guide-lightning.webp";
import type { AppLanguage } from "@/components/LanguageGate";
import { PREMIUM_POINTS_OFFER } from "@/lib/premium";
import { HOUDINI_STORE_URL, TESLA_STORE_URL } from "@/lib/storeLinks";

const copy = {
  ar: {
    list: "خيارات النقاط",
    tesla: { title: "متجر تيسلا", description: "خصم على التوصيل لكل ١٬٠٠٠ نقطة.", action: "افتح متجر تيسلا" },
    premium: { title: "بريميوم بالنقاط", detail: "تستخدم مولّد الأسئلة وملاحظات الفيديو بدون حد.", action: "شوف تفاصيل البريميوم" },
    houdini: { title: "هوديني", description: "تصفّح هودي تميّزك واطلبه من متجر هوديني.", action: "افتح متجر هوديني" },
    leaderboard: { title: "لوحة المتصدرين", description: "اجمع نقاط وتنافس ويّه طلاب تميّزك حتى تصعد بالترتيب.", action: "شوف لوحة المتصدرين" },
    rank: "مركزك الحالي",
  },
  en: {
    list: "Ways to use points",
    tesla: { title: "Tesla Store", description: "Get a delivery discount for every 1,000 points.", action: "Visit Tesla Store" },
    premium: { title: "Premium with points", detail: "Includes unlimited access to the MCQ Generator and Video to Notes.", action: "View Premium" },
    houdini: { title: "Houdini", description: "Browse and order the Tamayzak hoodie from Houdini.", action: "Visit Houdini" },
    leaderboard: { title: "Leaderboard", description: "Earn points and compete with other Tamayzak students to climb the rankings.", action: "Open leaderboard" },
    rank: "Your current position",
  },
} as const;

type GuideCard = {
  key: string;
  title: string;
  description: string;
  detail?: string;
  action: string;
  tone: string;
  icon: ReactNode;
} & ({ href: string } | { onClick: () => void });

export default function PointsGuideCards({ language, rank, onOpenPremium, onOpenLeaderboard }: {
  language: AppLanguage;
  rank: number | null;
  onOpenPremium: () => void;
  onOpenLeaderboard: () => void;
}) {
  const id = useId();
  const t = copy[language];
  const isAr = language === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const cards: GuideCard[] = [
    {
      ...t.tesla,
      key: "tesla",
      tone: "border-rose-400/40 from-[#991e32] to-[#4d0e20]",
      icon: <img src={lightningArt} width={320} height={320} alt="" className="size-12 object-contain hue-rotate-[162deg]" />,
      href: TESLA_STORE_URL,
    },
    {
      ...t.premium,
      key: "premium",
      description: PREMIUM_POINTS_OFFER[language],
      tone: "border-amber-400/35 from-[#795016] to-[#392309]",
      icon: <Crown aria-hidden="true" className="size-7 fill-amber-300/25 text-amber-200" />,
      onClick: onOpenPremium,
    },
    {
      ...t.houdini,
      key: "houdini",
      tone: "border-emerald-400/35 from-[#17604e] to-[#0a3127]",
      icon: <img src={houdiniArt} width={816} height={816} alt="" className="size-11 object-contain" />,
      href: HOUDINI_STORE_URL,
    },
    {
      ...t.leaderboard,
      key: "leaderboard",
      detail: rank === null ? undefined : `${t.rank} · #${rank.toLocaleString(isAr ? "ar-IQ" : "en")}`,
      tone: "border-sky-400/35 from-[#214e89] to-[#132949]",
      icon: <Trophy aria-hidden="true" className="size-7 fill-sky-200/20 text-sky-100" />,
      onClick: onOpenLeaderboard,
    },
  ];

  return (
    <ul aria-label={t.list} className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {cards.map(card => {
        const title = `${id}-${card.key}-title`;
        const description = `${id}-${card.key}-description`;
        const Icon = "href" in card ? ArrowUpRight : Arrow;
        const props = {
          "aria-labelledby": title,
          "aria-describedby": description,
          className: `flex h-full min-h-40 w-full flex-col justify-between gap-4 rounded-3xl border bg-gradient-to-br p-4 text-start text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:brightness-110 motion-safe:transition motion-safe:hover:-translate-y-0.5 sm:p-5 ${card.tone}`,
        };
        const content = (
          <>
            <span className="flex items-start gap-3">
              <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white/25 bg-white/10">
                {card.icon}
              </span>
              <span className="min-w-0">
                <span id={title} className="block text-lg font-black leading-snug">{card.title}</span>
                <span id={description} className="mt-1 block space-y-1.5 text-sm leading-relaxed text-white/90">
                  <span className="block">{card.description}</span>
                  {card.detail && <span className="block text-xs leading-relaxed text-white/85">{card.detail}</span>}
                </span>
              </span>
            </span>
            <span className="flex items-center justify-between gap-2 border-t border-white/20 pt-3 text-sm font-bold">
              {card.action}
              <Icon aria-hidden="true" className={`size-4 shrink-0 ${"href" in card && isAr ? "-scale-x-100" : ""}`} />
            </span>
          </>
        );

        return (
          <li key={card.key} className="min-w-0">
            {"href" in card
              ? <a {...props} href={card.href} target="_blank" rel="noopener noreferrer">{content}</a>
              : <button {...props} type="button" onClick={card.onClick}>{content}</button>}
          </li>
        );
      })}
    </ul>
  );
}
