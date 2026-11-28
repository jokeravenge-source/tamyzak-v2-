import type { AppLanguage } from "@/components/LanguageGate";
import type { SourceCard } from "@/features/pdf-builder/bankSources";
import { supabase } from "@/integrations/supabase/client";
import { isExamRelevantQuestion } from "@/lib/examRelevantMcq";
import { normalizeStudySearch } from "@/lib/studySearch";
import { topicForQuestion } from "@/lib/topicMastery";
import type { WeeklyLearningProfile } from "@/lib/weeklyLearning";
import {
  getQuickStudyBankScope,
  getQuickStudyProgressScope,
  loadQuickStudyBuiltInMcqs,
  loadQuickStudyCards,
  matchesQuickStudyChapter,
  type QuickStudyCards,
  type QuickStudySelection,
} from "@/lib/quickStudySources";

const QUICK_STUDY_SUBJECT = "physics";
const QUICK_STUDY_CHAPTER = 1;

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

type BankQuestion = {
  id: string;
  question: string;
  choices: string[];
  answer_index: number;
  explanation: string | null;
  section: string | null;
  sort_order: number;
};

function topicOfQuestion(question: string, context = "") {
  const key = topicForQuestion(QUICK_STUDY_SUBJECT, QUICK_STUDY_CHAPTER, question, context).key.split(":").at(-1);
  return key === "factors" || key === "parallel-plate" ? "capacitance" : key;
}

function matchesPlan(topic: Topic, planText: string) {
  const text = normalizeStudySearch(planText);
  return topics[topic].planTerms.some(term => text.includes(normalizeStudySearch(term)));
}

function recommendCapacitors({ questions, mistakes, plannedTexts, profile, language, count, deck }: {
  questions: BankQuestion[];
  mistakes: RecentMistake[];
  plannedTexts: string[];
  profile: WeeklyLearningProfile | null;
  language: AppLanguage;
  count: number;
  deck: readonly SourceCard[];
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
  const missedFirst = (question: BankQuestion) => missed.has(question.id) || missed.has(question.question) ? 0 : 1;
  const order = (question: BankQuestion) => {
    const index = (config.orders as readonly number[]).indexOf(question.sort_order);
    return index >= 0 ? index : config.orders.length;
  };
  return {
    title: config.title[language],
    reason,
    cards: config.cards[language].map(index => deck[index]).filter(Boolean),
    questions: picked.questions.sort((a, b) => missedFirst(a) - missedFirst(b) || order(a) - order(b)).slice(0, count),
  };
}

type ReviewSource = "flashcard" | "ministerial" | "exercise" | "mcq";
export type ReviewCard = SourceCard & { source: ReviewSource };
export type QuickStudyQuestion =
  | (BankQuestion & { kind: "mcq" })
  | (ReviewCard & { kind: "recall"; id: string; question: string });

type QuickStudyData = QuickStudyCards & { questions: BankQuestion[]; mistakes: RecentMistake[]; unavailable: boolean };

export async function loadQuickStudy(selection: QuickStudySelection, language: AppLanguage, userId: string | null, signal: AbortSignal): Promise<QuickStudyData> {
  const bankScope = getQuickStudyBankScope(selection);
  const progressScope = getQuickStudyProgressScope(selection);
  const [cards, bank, builtIn, mistakes] = await Promise.all([
    loadQuickStudyCards(selection, language, signal),
    bankScope.chapters.length ? supabase.from("mcq_banks")
      .select("id,subject,chapter,chapter_title,question,choices,answer_index,explanation,section,sort_order")
      .eq("subject", bankScope.subject).in("chapter", bankScope.chapters).eq("language", language)
      .order("sort_order").order("id").limit(120).abortSignal(signal)
      : Promise.resolve({ data: [], error: null }),
    loadQuickStudyBuiltInMcqs(selection, language).catch(() => []),
    userId ? supabase.from("my_mistakes").select("id,question,correct_answer,ref_id")
      .eq("user_id", userId).eq("subject", progressScope.subject).eq("chapter", progressScope.chapter)
      .eq("resolved", false).order("updated_at", { ascending: false }).limit(12).abortSignal(signal) : Promise.resolve({ data: [] }),
  ]);

  const questions: BankQuestion[] = [];
  const seen = new Set<string>();
  for (const row of [...(bank.data ?? []), ...builtIn]) {
    const { choices, answer_index } = row;
    if (!matchesQuickStudyChapter(selection, row) || !isExamRelevantQuestion(row.question) ||
      !Array.isArray(choices) || choices.length < 2 ||
      !choices.every(choice => typeof choice === "string" && !!choice.trim()) ||
      !Number.isInteger(answer_index) || answer_index < 0 || answer_index >= choices.length) continue;
    const key = normalizeStudySearch(row.question);
    if (seen.has(key)) continue;
    seen.add(key);
    const explanation = row.explanation?.trim();
    questions.push({ ...row, choices: choices as string[], section: row.section ?? null,
      sort_order: "sort_order" in row ? row.sort_order : Number.MAX_SAFE_INTEGER,
      explanation: explanation === "Ministerial-style bank" ? null : explanation || null });
  }
  return { ...cards, questions, mistakes: mistakes.data ?? [], unavailable: cards.unavailable || Boolean(bank.error) };
}

function withSource(cards: readonly SourceCard[], source: ReviewSource): ReviewCard[] {
  return cards.filter(card => card.q.trim() && (card.a.trim() || card.answerBlocks?.length)).map(card => ({ ...card, source }));
}

export function recommendQuickStudy({ selection, data, plannedTexts, profile, language, count }: {
  selection: QuickStudySelection;
  data: QuickStudyData;
  plannedTexts: string[];
  profile: WeeklyLearningProfile | null;
  language: AppLanguage;
  count: number;
}) {
  const isCapacitors = selection.subject === QUICK_STUDY_SUBJECT && selection.chapter === String(QUICK_STUDY_CHAPTER);
  const pilot = isCapacitors ? recommendCapacitors({ ...data, plannedTexts, profile, language, count, deck: data.flashcards }) : null;
  const missed = new Set(data.mistakes.flatMap(mistake => [mistake.ref_id, normalizeStudySearch(mistake.question)]));
  const recentMistake = (question: BankQuestion) => missed.has(question.id) || missed.has(normalizeStudySearch(question.question));
  const bank = pilot?.questions ?? [...data.questions].sort((a, b) => Number(recentMistake(b)) - Number(recentMistake(a)));

  const flashcards = withSource(pilot?.cards.length ? pilot.cards : data.flashcards, "flashcard");
  const ministerial = withSource(data.ministerial, "ministerial");
  const exercises = withSource(data.exercises, "exercise");
  const questions: QuickStudyQuestion[] = bank.slice(0, count).map(question => ({ ...question, kind: "mcq" }));
  const used = new Set(questions.map(question => normalizeStudySearch(question.question)));

  const cards: ReviewCard[] = [];
  const addReview = (items: readonly ReviewCard[]) => {
    const card = items.find(item => !used.has(normalizeStudySearch(item.q)));
    if (card) {
      cards.push(card);
      used.add(normalizeStudySearch(card.q));
    }
  };
  addReview([...flashcards, ...exercises, ...ministerial]);
  // Keep a second item in reserve for recall if the chapter has no graded questions.
  if (questions.length === count) addReview([...ministerial, ...flashcards, ...exercises]);
  for (const card of [...ministerial, ...flashcards, ...exercises]) {
    if (questions.length >= count) break;
    const key = normalizeStudySearch(card.q);
    if (used.has(key)) continue;
    used.add(key);
    questions.push({ ...card, kind: "recall", id: `${card.source}:${key}`, question: card.q });
  }

  if (!questions.length && cards.length) {
    const card = cards[0];
    questions.push({ ...card, kind: "recall", id: `${card.source}:${card.q}`, question: card.q });
  }
  if (!questions.length) return null;

  if (!cards.length && questions[0].kind === "mcq") {
    const extra = bank.find(question => !used.has(normalizeStudySearch(question.question))) ?? questions[0];
    const answer = extra.choices[extra.answer_index];
    cards.push({ q: extra.question, a: extra.explanation ? `${answer}\n${extra.explanation}` : answer, source: "mcq" });
  }
  const reason = pilot?.reason ?? (bank[0] && recentMistake(bank[0]) ? "mistake" : "chapter");
  return { title: pilot?.title, reason, cards, questions, selection, mistakes: data.mistakes };
}

export function quickStudyAnswer(question: QuickStudyQuestion) {
  return question.kind === "mcq" ? question.choices[question.answer_index] : question.a;
}
