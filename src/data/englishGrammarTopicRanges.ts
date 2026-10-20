/** Topic divisions for the English grammar flashcard decks.
 * The decks are authored in textbook order, so these ranges preserve the
 * original sequence and make each unit's study sections explicit.
 */
export interface EnglishGrammarTopicRange {
  key: string;
  en: string;
  ar: string;
  start: number;
  end: number;
}

export const englishGrammarTopicRanges: Record<string, EnglishGrammarTopicRange[]> = {
  "1": [
    { key: "vocabulary-health", en: "Health & injury vocabulary", ar: "مفردات الصحة والإصابات", start: 1, end: 50 },
    { key: "past-simple", en: "Past Simple", ar: "الماضي البسيط", start: 51, end: 61 },
    { key: "past-continuous", en: "Past Continuous", ar: "الماضي المستمر", start: 62, end: 71 },
    { key: "ed-ing-adjectives", en: "-ed / -ing adjectives", ar: "صفات ed و ing", start: 72, end: 77 },
    { key: "adjectives-adverbs", en: "Adjectives & adverbs", ar: "الصفات والظروف", start: 78, end: 86 },
    { key: "phrasal-verbs", en: "Phrasal verbs", ar: "الأفعال المركبة", start: 87, end: 95 },
    { key: "hurt-sore", en: "Hurt, sore & was/were", ar: "hurt و sore و was/were", start: 96, end: 100 },
  ],
  "2": [
    { key: "security-vocabulary", en: "Security, crime & travel vocabulary", ar: "مفردات الأمن والجريمة والسفر", start: 1, end: 40 },
    { key: "abbreviations-reading", en: "Abbreviations & reading skills", ar: "الاختصارات ومهارات القراءة", start: 41, end: 50 },
    { key: "necessity-prohibition", en: "Necessity & prohibition", ar: "الضرورة والمنع", start: 51, end: 63 },
    { key: "advice", en: "Giving advice", ar: "تقديم النصيحة", start: 64, end: 69 },
    { key: "polite-requests", en: "Polite requests", ar: "الطلبات المؤدبة", start: 70, end: 73 },
    { key: "suggestions-offers", en: "Suggestions & offers", ar: "الاقتراحات والعروض", start: 74, end: 80 },
    { key: "expectations", en: "Expectations", ar: "التوقعات", start: 81, end: 88 },
    { key: "used-to", en: "Used to", ar: "الماضي المعتاد: used to", start: 89, end: 91 },
    { key: "causatives", en: "Causative verbs", ar: "الأفعال السببية", start: 92, end: 100 },
  ],
  "3": [
    { key: "jobs-vocabulary", en: "Jobs, industries & vocabulary", ar: "المهن والصناعات والمفردات", start: 1, end: 50 },
    { key: "defining-jobs", en: "Defining jobs", ar: "تعريف المهن", start: 51, end: 54 },
    { key: "conditionals", en: "Conditionals", ar: "الجمل الشرطية", start: 55, end: 73 },
    { key: "reported-speech", en: "Reported speech", ar: "الكلام المنقول", start: 74, end: 92 },
    { key: "regrets", en: "Regrets", ar: "التعبير عن الندم", start: 93, end: 96 },
    { key: "applied-grammar", en: "Applied grammar & practice", ar: "قواعد وتطبيقات متنوعة", start: 97, end: 100 },
  ],
};
