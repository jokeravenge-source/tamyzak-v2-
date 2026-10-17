import { flashcardsBioCh2NadiaEn, nadiaBioCh2TopicRanges } from "./flashcardsBioCh2NadiaEn";
import { flashcardsBioCh4NadiaEn, nadiaBioCh4TopicRanges } from "./flashcardsBioCh4NadiaEn";
import { flashcardsBioCh5NadiaEn, nadiaBioCh5TopicRanges } from "./flashcardsBioCh5NadiaEn";
import { getNadiaNavigationItems, type NadiaChapterNumber } from "./nadiaTeacherContent";

type SourceCard = { q: string; a: string };
type SourceRange = { key: string; en: string; start: number; end: number };

export type NadiaBuiltInMcq = {
  question: string;
  choices: string[];
  answer_index: number;
  explanation: string;
};

export type NadiaBuiltInMcqSet = {
  id: string;
  teacher_id: "nadia-al-nuaimy";
  topic_key: string;
  title: string;
  questions: NadiaBuiltInMcq[];
  created_at: string;
};

const chapterSources: Partial<Record<NadiaChapterNumber, { cards: readonly SourceCard[]; ranges: readonly SourceRange[] }>> = {
  2: { cards: flashcardsBioCh2NadiaEn, ranges: nadiaBioCh2TopicRanges },
  4: { cards: flashcardsBioCh4NadiaEn, ranges: nadiaBioCh4TopicRanges },
  5: { cards: flashcardsBioCh5NadiaEn, ranges: nadiaBioCh5TopicRanges },
};

const parameciumAsexualQuestions: NadiaBuiltInMcq[] = [
  {
    question: "To which group does Paramecium belong?",
    choices: ["Flagellated protists", "Ciliated protists", "Conjugating fungi", "Unicellular green algae"],
    answer_index: 1,
    explanation: "Paramecium is a ciliated protist.",
  },
  {
    question: "How does Paramecium reproduce asexually?",
    choices: ["Longitudinal binary fission", "Transverse binary fission", "External budding", "Spore formation"],
    answer_index: 1,
    explanation: "Paramecium reproduces asexually by transverse binary fission.",
  },
  {
    question: "What is the first nuclear event during asexual reproduction in Paramecium?",
    choices: ["The macronucleus disappears", "The micronucleus divides by mitosis", "The cytoplasm constricts immediately", "The contractile vacuoles disintegrate"],
    answer_index: 1,
    explanation: "Division starts with normal mitotic division of the micronucleus.",
  },
  {
    question: "How does the macronucleus divide during transverse binary fission?",
    choices: ["By meiosis", "By direct division (amitosis)", "By mitosis with a spindle", "It does not divide"],
    answer_index: 1,
    explanation: "The macronucleus divides directly by amitosis.",
  },
  {
    question: "Where do the two micronuclei move after division?",
    choices: ["Toward opposite ends of the cell", "Toward the oral groove", "Outside the cell", "Into the macronucleus"],
    answer_index: 0,
    explanation: "The two micronuclei move toward opposite ends of the Paramecium.",
  },
  {
    question: "Which new structures form while the Paramecium elongates and divides?",
    choices: ["Two flagella and a capsule", "A new oral groove and two new contractile vacuoles", "A chloroplast and cell wall", "A conjugation bridge"],
    answer_index: 1,
    explanation: "A new oral groove and two new contractile vacuoles develop during division.",
  },
  {
    question: "What is the final result of transverse binary fission in Paramecium?",
    choices: ["Four genetically different cells", "Two identical new paramecia", "One resistant spore", "One male and one female cell"],
    answer_index: 1,
    explanation: "The parent divides into two genetically identical new paramecia.",
  },
];

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const selectStudyCards = (cards: readonly SourceCard[], limit = 12): Array<SourceCard & { sourceIndex: number }> => {
  if (cards.length <= limit) return cards.map((card, sourceIndex) => ({ ...card, sourceIndex }));
  return Array.from({ length: limit }, (_, index) => {
    const sourceIndex = Math.round(index * (cards.length - 1) / (limit - 1));
    return { ...cards[sourceIndex], sourceIndex };
  });
};

const buildQuestions = (
  topicCards: readonly SourceCard[],
  chapterCards: readonly SourceCard[],
  lecture: number,
): NadiaBuiltInMcq[] => {
  const answerPool = [...topicCards, ...chapterCards]
    .map((card) => normalize(card.a))
    .filter((answer, index, answers) => answer.length > 0 && answers.indexOf(answer) === index);

  return selectStudyCards(topicCards).map((card) => {
    const correct = normalize(card.a);
    const correctPoolIndex = Math.max(0, answerPool.indexOf(correct));
    const distractors: string[] = [];

    for (let offset = 1; distractors.length < 3 && offset <= answerPool.length; offset += 1) {
      const candidate = answerPool[(correctPoolIndex + offset * 7) % answerPool.length];
      if (candidate !== correct && !distractors.includes(candidate)) distractors.push(candidate);
    }

    while (distractors.length < 3) distractors.push(`Incorrect statement ${distractors.length + 1}`);

    const answerIndex = (card.sourceIndex + lecture) % 4;
    const choices = [...distractors];
    choices.splice(answerIndex, 0, correct);

    return {
      question: normalize(card.q),
      choices,
      answer_index: answerIndex,
      explanation: correct,
    };
  });
};

/**
 * Provides a complete built-in English MCQ bank for topics that do not yet
 * have an admin-authored database set. Saved database sets always take priority.
 */
export const getNadiaEnglishBuiltInMcqSet = (
  chapter: NadiaChapterNumber,
  lecture: number,
): NadiaBuiltInMcqSet | null => {
  const navigationItem = getNadiaNavigationItems("en", chapter).find((item) => item.lecture === lecture);
  if (!navigationItem?.sourceTopicKey) return null;

  const topicKey = `nadia-en-ch${chapter}-lec${lecture}-exam`;
  if (chapter === 3 && navigationItem.sourceTopicKey === "paramecium-asexual") {
    return {
      id: `built-in:${topicKey}`,
      teacher_id: "nadia-al-nuaimy",
      topic_key: topicKey,
      title: navigationItem.en,
      questions: parameciumAsexualQuestions,
      created_at: "2026-10-17T00:00:00.000Z",
    };
  }

  const source = chapterSources[chapter];
  const range = source?.ranges.find((item) => item.key === navigationItem.sourceTopicKey);
  if (!source || !range) return null;

  const topicCards = source.cards.slice(range.start - 1, range.end);
  return {
    id: `built-in:${topicKey}`,
    teacher_id: "nadia-al-nuaimy",
    topic_key: topicKey,
    title: navigationItem.en,
    questions: buildQuestions(topicCards, source.cards, lecture),
    created_at: "2026-10-17T00:00:00.000Z",
  };
};

export const isNadiaBuiltInMcqSet = (id: string) => id.startsWith("built-in:");
