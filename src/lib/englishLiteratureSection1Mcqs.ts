import type { BuiltInMcqRow } from "@/lib/physicsChapter2Mcqs";

// Built-in fallback so the section stays available before a hosting deployment
// applies the matching Supabase seed migration.
const SECTION_1: Array<readonly [string, readonly string[], number]> = [
  ["According to the exercise, “Mr Bingley is looking to live in the Bennets’ estate” is:", ["True", "False", "Not mentioned", "Partly true"], 1],
  ["According to the exercise, “Mr Bennet is jealous of Mrs Bennet and Mr Bingley” is:", ["True", "False", "Not mentioned", "Partly true"], 1],
  ["According to the exercise, “Mr Bennet wants to visit Mr Bingley” is:", ["True", "False", "Not mentioned", "Partly true"], 1],
  ["Mrs Bennet thinks that Mr Bennet prefers whom over their other daughters?", ["Jane", "Lydia", "Lizzy", "Mrs Lucas"], 2],
  ["According to the exercise, Mrs Bennet often loses her patience with Mr Bennet. This statement is:", ["True", "False", "Not mentioned", "Partly true"], 0],
  ["According to the exercise, “Mr Bennet is visiting twenty men in the neighbourhood” is:", ["True", "False", "Not mentioned", "Partly true"], 1],
  ["How much money does Mr Bingley earn yearly?", ["Two or three thousand pounds", "Three or four thousand pounds", "Four or five thousand pounds", "Five or six thousand pounds"], 2],
  ["Why is Mr Bingley's arrival a good thing for the Bennet girls?", ["Because he might employ one of them", "Because he might marry one of them", "Because he might educate one of them", "Because he might visit their estate"], 1],
  ["Why does Mr Bennet think Mr Bingley might like Mrs Bennet best of all?", ["Because she is good-humoured", "Because she has a large fortune", "Because she is as beautiful as any of their daughters", "Because she often visits newcomers"], 2],
  ["What does Mr Bennet think of women who give up thinking about their own beauty?", ["They are often extraordinarily beautiful", "They often do not have much beauty to think of", "They are usually young and beautiful", "They do not understand other people's feelings"], 1],
  ["Why is it strange that Sir William and Lady Lucas want to visit Mr Bingley?", ["Because they do not know him", "Because they do not usually visit newcomers", "Because Mr Bingley does not receive visitors", "Because they live outside the neighbourhood"], 1],
  ["Why does Mrs Bennet want Mr Bennet to visit Mr Bingley?", ["So she can visit him with her daughters", "So Mr Bennet can ask him for money", "So Lizzy can visit him alone", "So Sir William can meet him"], 0],
  ["Why does Mr Bennet think Lizzy is different from her sisters?", ["Lizzy is more beautiful than her sisters", "Lizzy is richer than her sisters", "Lizzy is quicker than her sisters", "Lizzy is younger than her sisters"], 2],
  ["According to Mr Bennet, how are Lizzy's sisters described?", ["Friendly and good-humoured", "Silly and ignorant like other girls", "Quick and well educated", "Extraordinary and beautiful"], 1],
  ["Mrs Bennet wants her daughters to marry into _____.", ["sympathy", "fortune", "nonsense", "preference"], 1],
  ["Mr Bennet is not _____ to visit Mr Bingley.", ["grown-up", "extraordinary", "likely", "good-humoured"], 2],
  ["Mrs Bennet thinks Mr Bennet gives Lizzy the _____.", ["fortune", "sympathy", "share", "preference"], 3],
  ["Mr Bennet wants to _____ Lizzy to Mr Bingley.", ["consider", "mention", "flatter", "visit"], 1],
  ["The five Bennet daughters are all _____.", ["newcomers", "grown-ups", "good-humoured", "extraordinary"], 1],
  ["Sir William and Lady Lucas's visiting a new neighbour is _____.", ["likely", "ordinary", "extraordinary", "ignorant"], 2],
  ["Mr Bennet is _____.", ["good-humoured", "ignorant", "jealous", "extraordinary"], 0],
  ["Mrs Bennet wants Mr Bingley to _____ Jane and Lydia as well.", ["mention", "flatter", "consider", "visit"], 2],
];

export const getBuiltInEnglishLiteratureSection1 = (language: "ar" | "en"): BuiltInMcqRow[] =>
  SECTION_1.map(([question, choices, answerIndex], index) => ({
    id: `builtin-english-literature-1-${language}-${String(index + 1).padStart(2, "0")}`,
    subject: "english_literature",
    chapter: 1,
    chapter_title: "Section 1",
    question,
    choices: [...choices],
    answer_index: answerIndex,
    explanation: null,
  }));
