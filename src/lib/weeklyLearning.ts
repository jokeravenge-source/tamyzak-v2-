import { missionsData, type MissionChapter, type MissionTopic } from "@/data/missions";
import type { WeakArea } from "@/lib/weaknessProfile";

export const WEEKLY_LEARNING_KEY = "tamayzak:weekly-learning-profile:v1";
export const DAILY_FLASHCARD_TARGET_KEY = "tamayzak:daily-flashcard-target";
export const DAILY_MCQ_TARGET_KEY = "tamayzak:daily-mcq-target";

export type WeeklyLearningProfile = {
  isoWeek: string;
  subject: string;
  chapterKey: string;
  chapterNumber: number;
  topicKey: string;
  topicEn: string;
  topicAr: string;
  weaknessText: string;
  weakAreas?: WeakArea[];
  planTasks?: Array<{ day: string; text: string }>;
  updatedAt: string;
};

export function getISOWeek(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo}`;
}

export function chapterNumber(subject: string, chapterKey: string): number {
  const chapters = missionsData[subject]?.chapters ?? [];
  const index = chapters.findIndex((chapter) => chapter.key === chapterKey);
  const keyNumber = Number(chapterKey.match(/(\d+)(?!.*\d)/)?.[1]);
  return Number.isFinite(keyNumber) && keyNumber > 0 ? keyNumber : Math.max(1, index + 1);
}

export function readWeeklyLearningProfile(): WeeklyLearningProfile | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(WEEKLY_LEARNING_KEY) || "null") as WeeklyLearningProfile | null;
    return parsed?.isoWeek === getISOWeek() ? parsed : null;
  } catch {
    return null;
  }
}

export function saveWeeklyLearningProfile(profile: WeeklyLearningProfile): void {
  localStorage.setItem(WEEKLY_LEARNING_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent("app:weekly-learning-updated", { detail: profile }));
}

export function profileFromWeakAreas(areas: WeakArea[]): WeeklyLearningProfile | null {
  const primary = areas[0];
  if (!primary) return null;
  return {
    isoWeek: getISOWeek(),
    subject: primary.subject,
    chapterKey: primary.chapterKey,
    chapterNumber: primary.chapterNumber,
    topicKey: primary.topicKey,
    topicEn: primary.topicEn,
    topicAr: primary.topicAr,
    weaknessText: primary.weaknessText,
    weakAreas: areas,
    updatedAt: new Date().toISOString(),
  };
}

/** Rotate multiple confirmed weak areas by day while keeping the existing
 * single-target contract used by the MCQ and flashcard pages. */
export function dailyLearningProfile(profile: WeeklyLearningProfile | null, date = todayKey()): WeeklyLearningProfile | null {
  if (!profile) return null;
  const areas = profile.weakAreas?.filter(Boolean) ?? [];
  if (areas.length < 2) return profile;
  let seed = 0;
  for (const char of date) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const area = areas[seed % areas.length];
  return {
    ...profile,
    subject: area.subject,
    chapterKey: area.chapterKey,
    chapterNumber: area.chapterNumber,
    topicKey: area.topicKey,
    topicEn: area.topicEn,
    topicAr: area.topicAr,
    weaknessText: area.weaknessText,
  };
}

const normalize = (value: string) => value
  .normalize("NFKC")
  .toLocaleLowerCase()
  .replace(/[\u064B-\u065F\u0670ـ]/g, "")
  .replace(/[أإآ]/g, "ا")
  .replace(/[^\p{L}\p{N}\s]/gu, " ")
  .replace(/\s+/g, " ")
  .trim();

export function rankFahrastTopics(query: string, topics: MissionTopic[]): MissionTopic[] {
  const words = new Set(normalize(query).split(" ").filter((word) => word.length > 1));
  if (!words.size) return topics;
  return topics
    .map((topic, index) => {
      const haystack = normalize(`${topic.ar} ${topic.en}`);
      let score = haystack.includes(normalize(query)) ? 12 : 0;
      words.forEach((word) => { if (haystack.includes(word)) score += 2; });
      return { topic, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ topic }) => topic);
}

export function getWeeklyChapter(profile: WeeklyLearningProfile): MissionChapter | null {
  return missionsData[profile.subject]?.chapters.find((chapter) => chapter.key === profile.chapterKey) ?? null;
}

export function dailyRotate<T>(items: T[], limit: number, seedText: string): T[] {
  if (items.length <= limit) return items;
  let seed = 0;
  for (const char of seedText) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const start = seed % items.length;
  return Array.from({ length: Math.min(limit, items.length) }, (_, index) => items[(start + index) % items.length]);
}

export function todayKey(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
