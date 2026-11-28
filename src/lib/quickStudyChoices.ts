import type { AppLanguage } from "@/components/LanguageGate";
import type { SourceCard } from "@/features/pdf-builder/bankSources";
import { isExamRelevantQuestion } from "@/lib/examRelevantMcq";
import { questionKey } from "@/lib/topicMastery";

export type PracticeItem = {
  q: string;
  a: string;
  wrong: readonly string[];
  sourcePrompt?: string;
  explanation?: string;
};

export function choose<T extends string>(q: string, a: T, options: readonly T[]): PracticeItem {
  return { q, a, wrong: options.filter(option => option !== a) };
}

export function matchingPairs(
  pairs: readonly (readonly [string, string])[],
  askTerm: (definition: string) => string,
  askDefinition: (term: string) => string,
): PracticeItem[] {
  const terms = pairs.map(([term]) => term);
  const definitions = pairs.map(([, definition]) => definition);
  return pairs.flatMap(([term, definition]) => [
    choose(askTerm(definition), term, terms),
    choose(askDefinition(term), definition, definitions),
  ]);
}

export function quickStudyChoiceKey(value: string) {
  // Case and punctuation can vary, but vowel marks and mathematical signs can change the answer.
  return value.normalize("NFKC").toLowerCase().replace(/[.?!؟]+$/u, "").replace(/\s+/g, " ").trim();
}

export function practiceChoices(item: PracticeItem) {
  const answer = item.a.trim();
  const key = quickStudyChoiceKey(answer);
  const alternatives = [...new Map(item.wrong.map(value => [quickStudyChoiceKey(value), value.trim()])).entries()]
    .filter(([value]) => value && value !== key).map(([, value]) => value);
  if (!key || !alternatives.length) return null;

  const seed = parseInt(questionKey(item.q), 16);
  const start = seed % alternatives.length;
  const choices = [...alternatives.slice(start), ...alternatives.slice(0, start)].slice(0, 3);
  const answer_index = Math.floor(seed / 17) % (choices.length + 1);
  choices.splice(answer_index, 0, answer);
  return { choices, answer_index };
}

const script = (text: string) => /\p{Script=Arabic}/u.test(text) ? "ar" : /[a-z]/i.test(text) ? "latin" : "math";
const isExact = (a: string, b: string) => a === b || (Math.min(a.length, b.length) > 7 && (a.includes(b) || b.includes(a)));
const questionStyle = (q: string) => {
  if (/true or false|صح أم خطأ|صح أو خطأ/i.test(q)) return "boolean";
  if (/_{2,}|\.{3,}/.test(q)) return "blank";
  if (/^(?:why|علل|لماذا|بم تفسر)\b/i.test(q) || /^(?:علّل|علل|لماذا)/u.test(q)) return "why";
  if (/^who\b|^مَن\s|^من هو\s|^من هي\s/i.test(q)) return "who";
  if (/^where\b|^أين\s/i.test(q)) return "where";
  if (/^when\b|^متى\s/i.test(q)) return "when";
  if (/^how many\b|^كم\s/i.test(q)) return "number";
  return "term";
};

function contextualLabel(card: SourceCard, language: AppLanguage) {
  const stem = card.q.trim();
  const instruction = language === "ar" || /\p{Script=Arabic}/u.test(stem)
    ? "اختر الإجابة المطابقة لبطاقة المراجعة."
    : "Choose the answer that matches the study card.";
  return `${instruction}\n${stem}`;
}

/** Turns sourced answer pairs into recognition practice when the chapter's exam bank runs short. */
export function buildCardChoiceItems(cards: readonly SourceCard[], language: AppLanguage): PracticeItem[] {
  const eligible = cards.filter(card => isExamRelevantQuestion(card.q) && card.q.length < 400 &&
    card.a.trim() && card.a.length < 260 && !(card.answerBlocks?.some(block => block.type === "math")))
    .slice(0, 130)
    .map(card => ({ card, key: quickStudyChoiceKey(card.a), script: script(card.a), style: questionStyle(card.q) }));

  return eligible.flatMap(({ card, key, script: writing, style }) => {
    const q = contextualLabel(card, language);
    if (style === "boolean" && /^(true|false)$/.test(key)) {
      return [{ q, a: card.a, sourcePrompt: card.q, wrong: [key === "true" ? "False" : "True"] }];
    }
    const sorted = eligible.filter(other => other.script === writing && other.style !== "boolean" && !isExact(key, other.key))
      .sort((a, b) => {
        const fit = (option: typeof a) => (option.style === style ? 0 : 60) + Math.abs(option.key.length - key.length);
        return fit(a) - fit(b);
      });
    const wrong = [...new Map(sorted.map(other => [other.key, other.card.a])).values()].slice(0, 8);
    return wrong.length >= 2 ? [{ q, a: card.a, sourcePrompt: card.q, wrong }] : [];
  });
}
