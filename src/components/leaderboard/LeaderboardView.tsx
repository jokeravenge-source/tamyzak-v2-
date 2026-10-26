import type { CSSProperties } from "react";
import { ArrowLeft, ChevronDown, Crown, Medal, RefreshCw, Trophy, WifiOff } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { CharacterAvatar, type CharacterTraits, type Gender } from "@/components/CharacterAvatar";
import { rankFor, RANKS } from "@/lib/points";
import "./leaderboard.css";

export type LeaderboardRow = {
  user_id: string;
  name: string;
  points: number;
  gender: Gender | null;
  traits: Partial<CharacterTraits> | null;
};

export type LeaderboardViewProps = {
  language: AppLanguage;
  rows: LeaderboardRow[];
  me: string | null;
  loading: boolean;
  refreshing: boolean;
  error: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onProfile: (id: string) => void;
  onStudy: () => void;
};

function RankBadge({ points, language }: { points: number; language: AppLanguage }) {
  const rank = rankFor(points);
  return (
    <span className="leaderboard-rank" style={{ "--rank-color": rank.color } as CSSProperties}>
      <Medal aria-hidden="true" />
      {language === "ar" ? rank.label.ar : rank.label.en}
    </span>
  );
}

export function LeaderboardView({ language, rows, me, loading, refreshing, error, onBack, onRefresh, onProfile, onStudy }: LeaderboardViewProps) {
  const isAr = language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);
  const format = new Intl.NumberFormat(isAr ? "ar-IQ" : "en-US");
  const myIndex = rows.findIndex((row) => row.user_id === me);
  const myRow = myIndex >= 0 ? rows[myIndex] : null;
  const rest = rows.slice(3, 10);
  const podium = [
    { row: rows[1], place: 2, key: "second" },
    { row: rows[0], place: 1, key: "first" },
    { row: rows[2], place: 3, key: "third" },
  ];

  const profileLabel = (row: LeaderboardRow, place: number) =>
    t(`View ${row.name}'s profile, place ${place}, ${format.format(row.points)} points`, `عرض ملف ${row.name}، المركز ${format.format(place)}، ${format.format(row.points)} نقطة`);

  const renderRow = (row: LeaderboardRow, index: number) => (
    <li key={row.user_id} value={index + 1}>
      <button
        type="button"
        className={`leaderboard-row ${row.user_id === me ? "leaderboard-row--me" : ""}`}
        onClick={() => onProfile(row.user_id)}
        aria-label={profileLabel(row, index + 1)}
      >
        <span className="leaderboard-row-place" aria-hidden="true">{format.format(index + 1)}</span>
        <span className="leaderboard-row-avatar" aria-hidden="true">
          <CharacterAvatar seed={row.user_id} gender={row.gender} traits={row.traits} size={44} />
        </span>
        <span className="leaderboard-row-person">
          <span className="leaderboard-row-name"><bdi>{row.name}</bdi>{row.user_id === me && <span className="leaderboard-you">{t("You", "أنت")}</span>}</span>
          <RankBadge points={row.points} language={language} />
        </span>
        <span className="leaderboard-row-score"><bdi>{format.format(row.points)}</bdi><span>{t("pts", "نقطة")}</span></span>
      </button>
    </li>
  );

  return (
    <main className="leaderboard-page" dir={isAr ? "rtl" : "ltr"}>
      <div className="leaderboard-shell">
        <header className="leaderboard-header">
          <div className="leaderboard-toolbar">
            <button type="button" onClick={onBack} className="leaderboard-icon-button" aria-label={t("Go back", "رجوع")}>
              <ArrowLeft aria-hidden="true" className={isAr ? "rotate-180" : ""} />
            </button>
            <h1>{t("Top Students", "لوحة المتصدرين")}</h1>
            <button type="button" onClick={onRefresh} disabled={refreshing || loading} className="leaderboard-icon-button" aria-label={t("Refresh points", "تحديث النقاط")} title={t("Refresh points", "تحديث النقاط")}>
              <RefreshCw aria-hidden="true" className={refreshing ? "leaderboard-refreshing" : ""} />
            </button>
          </div>
          <p>{t("All-time points, matching the points on your profile.", "مجموع النقاط الكلي، مثل النقاط في ملفك الشخصي.")}</p>
        </header>

        <div className="sr-only" role="status" aria-live="polite">{refreshing ? t("Updating standings…", "جارٍ تحديث الترتيب…") : ""}</div>

        {error && (
          <div className="leaderboard-error" role="alert">
            <WifiOff aria-hidden="true" />
            <div><p>{t("We couldn't update the standings.", "تعذّر تحديث الترتيب.")}</p><span>{rows.length ? t("Your last loaded standings are still shown.", "الترتيب الظاهر هو آخر نسخة محمّلة.") : t("Check your connection, then try again.", "تأكد من الاتصال، ثم حاول مرة أخرى.")}</span></div>
            <button type="button" onClick={onRefresh} disabled={refreshing || loading}>{t("Try again", "حاول مجددًا")}</button>
          </div>
        )}

        {loading ? (
          <section className="leaderboard-loading" role="status" aria-label={t("Loading leaderboard", "جارٍ تحميل لوحة المتصدرين")}>
            <div className="leaderboard-podium" aria-hidden="true">{[2, 1, 3].map((place) => <div key={place} className={`leaderboard-skeleton podium-entry podium-entry--${place}`}><div className="podium-skeleton-avatar"/><div className="podium-skeleton-line"/><div className="podium-skeleton-line"/></div>)}</div>
            <div className="leaderboard-skeleton leaderboard-skeleton-row"/><div className="leaderboard-skeleton leaderboard-skeleton-row"/>
          </section>
        ) : rows.length === 0 ? (
          !error && <section className="leaderboard-empty"><Trophy aria-hidden="true"/><h2>{t("The podium is waiting for you", "المنصة تنتظرك")}</h2><p>{t("Earn points while you study and take your place here.", "اجمع النقاط أثناء دراستك واحجز مكانك هنا.")}</p><button type="button" onClick={onStudy}>{t("Start studying", "ابدأ الدراسة")}</button></section>
        ) : (
          <>
            <section aria-label={t("Top three students", "الطلاب الثلاثة الأوائل")} className="leaderboard-podium-section">
              <ol className="leaderboard-podium" dir="ltr">
                {podium.map(({ row, place, key }) => row && (
                  <li key={key} value={place} className={`podium-entry podium-entry--${place}`}>
                    <button type="button" className="podium-button" onClick={() => onProfile(row.user_id)} aria-label={profileLabel(row, place)} aria-current={row.user_id === me ? "true" : undefined} dir={isAr ? "rtl" : "ltr"}>
                      {place === 1 && <Crown className="podium-crown" aria-hidden="true" fill="currentColor" strokeWidth={1.5} />}
                      <span className="podium-avatar" aria-hidden="true"><CharacterAvatar seed={row.user_id} gender={row.gender} traits={row.traits} size={100} /><span className="podium-medal">{format.format(place)}</span></span>
                      <span className="podium-name"><bdi>{row.name}</bdi></span>
                      {row.user_id === me && <span className="podium-you">{t("You", "أنت")}</span>}
                      <span className="podium-score"><bdi>{format.format(row.points)}</bdi><span>{t("points", "نقطة")}</span></span>
                      <RankBadge points={row.points} language={language} />
                    </button>
                  </li>
                ))}
              </ol>
            </section>

            {myRow && <button type="button" className="leaderboard-personal" onClick={() => onProfile(myRow.user_id)} aria-label={t(`Your position: ${myIndex + 1}`, `مركزك: ${format.format(myIndex + 1)}`)}>
              <span className="leaderboard-personal-place"><span aria-hidden="true">#</span>{format.format(myIndex + 1)}</span>
              <span className="leaderboard-personal-copy"><strong>{t("Your position", "مركزك")}</strong><span>{myIndex === 0 ? t("You're leading the way. Keep it up!", "أنت في الصدارة، استمر!") : t("Every study session makes a difference.", "كل جلسة دراسة تصنع فرقًا.")}</span></span>
              <span className="leaderboard-personal-points"><bdi>{format.format(myRow.points)}</bdi><span>{t("pts", "نقطة")}</span></span>
            </button>}

            {rest.length > 0 && <section className="leaderboard-standings" aria-labelledby="leaderboard-standings-title">
              <div className="leaderboard-section-heading"><h2 id="leaderboard-standings-title">{t("Standings", "الترتيب")}</h2><span>{t("Total points", "مجموع النقاط")}</span></div>
              <ol start={4} className="leaderboard-list">{rest.map((row, index) => renderRow(row, index + 3))}</ol>
            </section>}

            {myRow && myIndex >= 10 && <section className="leaderboard-outside-top" aria-label={t("Your place in the standings", "مركزك في الترتيب")}><p>{t("Your place", "مركزك في القائمة")}</p><ol start={myIndex + 1} className="leaderboard-list">{renderRow(myRow, myIndex)}</ol></section>}

            <details className="leaderboard-rank-key"><summary>{t("How ranks work", "شلون تتحدد المراتب؟")}<ChevronDown aria-hidden="true"/></summary><div>{RANKS.map((rank) => <span key={rank.key} className="leaderboard-rank-key-item"><RankBadge points={rank.min} language={language}/><bdi>{format.format(rank.min)}+</bdi></span>)}</div></details>
          </>
        )}
      </div>
    </main>
  );
}
