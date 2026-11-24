import type { CSSProperties } from "react";
import { ArrowUpRight, Crown, Flame, Trophy, UserRound } from "lucide-react";
import { CharacterAvatar, type CharacterTraits, type Gender } from "@/components/CharacterAvatar";
import type { AppLanguage } from "@/components/LanguageGate";
import RankStone from "@/components/RankStone";
import { RANKS, type Rank } from "@/lib/points";

export type AccountProgress = { lifetimePoints: number; currentStreak: number | null };

type AccountOverviewProps = {
  language: AppLanguage;
  name: string;
  userId: string;
  gender: Gender | null;
  traits: CharacterTraits | null;
  rank: Rank;
  progress: AccountProgress | null;
  premium: boolean;
  onLeaderboard?: () => void;
};

const copy = {
  en: { student: "Student", points: "Lifetime points", streak: "Day streak", rank: "Your rank", rankProgress: "Progress to the next rank", leaderboard: "Leaderboard", highest: "Highest rank reached" },
  ar: { student: "طالب", points: "مجموع النقاط", streak: "أيام متتالية", rank: "رتبتك", rankProgress: "التقدّم للرتبة التالية", leaderboard: "لوحة المتصدرين", highest: "وصلت لأعلى رتبة" },
} as const;

export default function AccountOverview({ language, name, userId, gender, traits, rank, progress, premium, onLeaderboard }: AccountOverviewProps) {
  const isAr = language === "ar";
  const text = copy[language];
  const number = (value: number) => value.toLocaleString(isAr ? "ar-IQ" : "en");
  const points = progress?.lifetimePoints ?? 0;
  const nextRank = RANKS.find((tier) => tier.min > rank.min);
  const fill = nextRank ? Math.max(0, Math.min(1, (points - rank.min) / (nextRank.min - rank.min))) : 1;
  const percent = Math.floor(fill * 100);

  return (
    <section
      aria-labelledby="account-overview-name"
      className={`account-overview grid items-center gap-4 rounded-[1.75rem] p-4 text-white sm:gap-5 sm:p-6 lg:p-7 ${progress ? "md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]" : ""}`}
      style={{ "--account-rank-color": rank.color } as CSSProperties}
    >
      <div className="min-w-0 space-y-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <div aria-hidden="true" className="account-portrait flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/25 bg-white/10 sm:size-24 sm:rounded-[1.5rem]">
            {gender && traits ? <CharacterAvatar seed={userId} gender={gender} traits={traits} size={84} /> : <UserRound className="size-8 text-slate-200 sm:size-10" strokeWidth={1.5} />}
          </div>
          <div className="min-w-0">
            <h2 id="account-overview-name" className="text-2xl font-black leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-4xl" dir="auto">
              {name.trim() || text.student}
            </h2>
            {premium && <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-200/10 px-2.5 py-1 text-xs font-bold text-amber-100">
              <Crown aria-hidden="true" className="size-3.5" />{isAr ? "بريميوم" : "Premium"}
            </p>}
          </div>
        </div>

        {progress && <dl className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.08] p-2.5 sm:gap-3 sm:p-3">
            <Trophy aria-hidden="true" className="size-4 shrink-0 text-amber-200 sm:size-5" />
            <div className="min-w-0">
              <dt className="text-xs leading-snug text-slate-200">{text.points}</dt>
              <dd className="mt-0.5 text-lg font-black leading-none tabular-nums [overflow-wrap:anywhere] sm:text-xl"><bdi>{number(points)}</bdi></dd>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.08] p-2.5 sm:gap-3 sm:p-3">
            <Flame aria-hidden="true" className="size-4 shrink-0 text-orange-200 sm:size-5" />
            <div className="min-w-0">
              <dt className="text-xs leading-snug text-slate-200">{text.streak}</dt>
              <dd className="mt-0.5 text-lg font-black leading-none tabular-nums [overflow-wrap:anywhere] sm:text-xl"><bdi>{progress.currentStreak === null ? "—" : number(progress.currentStreak)}</bdi></dd>
            </div>
          </div>
        </dl>}
      </div>

      {progress && <div className="min-w-0 rounded-[1.25rem] border border-white/20 bg-slate-950/30 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div aria-hidden="true" className="shrink-0"><RankStone rank={rank.key} size={36} fillProgress={fill} glow /></div>
            <div className="min-w-0">
              <p className="text-xs text-slate-200">{text.rank}</p>
              <p className="account-rank-name text-lg font-black leading-snug">{rank.label[language]}</p>
            </div>
          </div>
          {onLeaderboard && <button type="button" onClick={onLeaderboard} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/20 px-2.5 text-xs font-bold text-white transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white">
            {text.leaderboard}<ArrowUpRight aria-hidden="true" className={`size-3.5 ${isAr ? "-scale-x-100" : ""}`} />
          </button>}
        </div>
        {nextRank ? <div className="mt-3.5 space-y-2">
          <div role="progressbar" aria-label={text.rankProgress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 overflow-hidden rounded-full bg-white/15">
            <div className="account-rank-meter h-full rounded-full" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-xs leading-relaxed text-slate-200">{isAr
            ? `${number(nextRank.min - points)} نقطة حتى رتبة ${nextRank.label.ar}`
            : `${number(nextRank.min - points)} points to ${nextRank.label.en}`}</p>
        </div> : <p className="mt-3 text-xs text-slate-200">{text.highest}</p>}
      </div>}
    </section>
  );
}
