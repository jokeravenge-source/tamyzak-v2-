import type { AppLanguage } from "@/components/LanguageGate";
import { flashcardsCh1 } from "@/data/flashcardsCh1";
import { flashcardsCh1Ar } from "@/data/flashcardsCh1Ar";
import { supabase } from "@/integrations/supabase/client";
import { normalizeStudySearch } from "@/lib/studySearch";
import { topicForQuestion } from "@/lib/topicMastery";
import type { WeeklyLearningProfile } from "@/lib/weeklyLearning";

export const QUICK_STUDY_SUBJECT = "physics";
export const QUICK_STUDY_CHAPTER = 1;

const topics = {
  combinations: {
    title: { ar: "ربط المتسعات", en: "Capacitors in series and parallel" },
    sections: ["ربط المتسعات", "Capacitor combinations"],
    cards: { ar: [25, 26], en: [28, 24] },
    orders: [122, 125, 124, 128, 129, 126, 127, 130, 131, 123],
    planTerms: ["توالي", "توازي", "series", "parallel connection", "capacitor combinations", "ربط المتسعات"],
  },
  dielectric: {
    title: { ar: "تأثير العازل", en: "Effect of a dielectric" },
    sections: ["العوازل والأنشطة العملية", "Dielectrics & experimental activities"],
    cards: { ar: [14, 15, 16], en: [63, 64, 44] },
    orders: [120, 118, 121, 116, 117, 114, 115, 112, 113, 119],
    planTerms: ["عازل", "عوازل", "العزل", "dielectric"],
  },
  capacitance: {
    title: { ar: "سعة المتسعة", en: "Capacitance" },
    sections: ["السعة ومعاملات اللوحين المتوازيين", "Capacitance & parallel-plate parameters"],
    cards: { ar: [6, 20], en: [6, 18] },
    orders: [105, 109, 110, 111, 106, 107, 108],
    planTerms: ["السعة", "سعة المتسعة", "العوامل المؤثرة", "capacitance", "plate area"],
  },
} as const;

type Topic = keyof typeof topics;
type Reason = "plan" | "mistake" | "chapter";
type RecentMistake = { id: string; question: string; correct_answer: string | null; ref_id: string | null };
const topicKeys = Object.keys(topics) as Topic[];
const sectionTopics = new Map(topicKeys.flatMap(topic => topics[topic].sections.map(section => [normalizeStudySearch(section), topic] as const)));

export type QuickStudyQuestion = {
  id: string;
  question: string;
  choices: string[];
  answer_index: number;
  explanation: string | null;
  section: string | null;
  sort_order: number;
};

export async function loadQuickStudy(language: AppLanguage, userId: string | null) {
  const [bank, mistakes] = await Promise.all([
    supabase.from("mcq_banks").select("id,question,choices,answer_index,explanation,section,sort_order")
      .eq("subject", QUICK_STUDY_SUBJECT).eq("chapter", QUICK_STUDY_CHAPTER).eq("language", language)
      .order("sort_order").limit(120),
    userId ? supabase.from("my_mistakes").select("id,question,correct_answer,ref_id")
      .eq("user_id", userId).eq("subject", QUICK_STUDY_SUBJECT).eq("chapter", String(QUICK_STUDY_CHAPTER))
      .eq("resolved", false).order("updated_at", { ascending: false }).limit(12) : Promise.resolve({ data: [] }),
  ]);
  if (bank.error) throw bank.error;

  const questions: QuickStudyQuestion[] = (bank.data ?? []).flatMap(row => {
    const { choices, answer_index } = row;
    if (!row.question.trim() || !Array.isArray(choices) || choices.length < 2 ||
      !choices.every(choice => typeof choice === "string" && !!choice.trim()) ||
      !Number.isInteger(answer_index) || answer_index < 0 || answer_index >= choices.length) return [];
    // The original seed labels a bank source in the explanation field.
    const explanation = row.explanation?.trim();
    return [{ ...row, choices: choices as string[], explanation: explanation === "Ministerial-style bank" ? null : explanation || null }];
  });
  return { questions, mistakes: mistakes.data ?? [] };
}

function topicOfQuestion(question: string, context = "") {
  const key = topicForQuestion(QUICK_STUDY_SUBJECT, QUICK_STUDY_CHAPTER, question, context).key.split(":").at(-1);
  return key === "factors" || key === "parallel-plate" ? "capacitance" : key;
}

function matchesPlan(topic: Topic, planText: string) {
  const text = normalizeStudySearch(planText);
  return topics[topic].planTerms.some(term => text.includes(normalizeStudySearch(term)));
}

export function recommendQuickStudy({ questions, mistakes, plannedTexts, profile, language, count }: {
  questions: QuickStudyQuestion[];
  mistakes: RecentMistake[];
  plannedTexts: string[];
  profile: WeeklyLearningProfile | null;
  language: AppLanguage;
  count: number;
}) {
  const available = topicKeys.flatMap(topic => {
    const matches = questions.filter(question => {
      const section = question.section ?? "";
      return (sectionTopics.get(normalizeStudySearch(section)) ?? topicOfQuestion(question.question, section)) === topic;
    });
    const unique = [...new Map(matches.map(question => [normalizeStudySearch(question.question), question])).values()];
    return unique.length >= count ? [{ topic, questions: unique }] : [];
  });
  if (!available.length) return null;

  const planned = plannedTexts.find(task => /متسع|مكثف|capacit/.test(normalizeStudySearch(task)) &&
    available.some(entry => matchesPlan(entry.topic, task)));
  const profileText = profile?.subject === QUICK_STUDY_SUBJECT && profile.chapterNumber === QUICK_STUDY_CHAPTER
    ? `${profile.topicAr} ${profile.topicEn}` : "";
  const plan = available.find(entry => matchesPlan(entry.topic, planned ?? profileText));
  const recent = mistakes.map(mistake => {
    const exact = available.find(entry => entry.questions.some(question => question.id === mistake.ref_id || question.question === mistake.question));
    return exact ?? available.find(entry => topicOfQuestion(mistake.question, mistake.correct_answer ?? "") === entry.topic);
  }).find(Boolean);
  const picked = plan ?? recent ?? available[0];
  const reason: Reason = plan ? "plan" : recent ? "mistake" : "chapter";
  const config = topics[picked.topic];
  const missed = new Set(mistakes.map(mistake => mistake.ref_id ?? mistake.question));
  const missedFirst = (question: QuickStudyQuestion) => missed.has(question.id) || missed.has(question.question) ? 0 : 1;
  const order = (question: QuickStudyQuestion) => {
    const index = (config.orders as readonly number[]).indexOf(question.sort_order);
    return index >= 0 ? index : config.orders.length;
  };
  const deck = language === "ar" ? flashcardsCh1Ar : flashcardsCh1;
  return {
    title: config.title[language],
    reason,
    cards: config.cards[language].map(index => deck[index]),
    questions: picked.questions.sort((a, b) => missedFirst(a) - missedFirst(b) || order(a) - order(b)).slice(0, count),
  };
}
