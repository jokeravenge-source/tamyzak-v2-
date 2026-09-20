import type { BuiltInMcqRow } from "@/lib/physicsChapter2Mcqs";

// Built-in fallback so Section 3 is visible before the database seed is applied.
const SECTION_3: Array<readonly [string, readonly string[], number]> = [
  ["From which novel is the extract taken?", ["Jane Eyre", "Pride and Prejudice", "Great Expectations", "Oliver Twist"], 1],
  ["On which page of the Student’s Book can the extract be found?", ["Page 105", "Page 172", "Page 173", "Page 115"], 0],
  ["What happens first in the extract?", ["Mr Darcy compliments Elizabeth’s eyes.", "Louisa discusses the Bennets’ social class.", "Elizabeth goes to see her sick sister.", "Caroline mentions Mr Darcy’s sister."], 2],
  ["Why does Elizabeth go to the estate?", ["To meet Mr Darcy", "To visit her sick sister, Jane", "To attend a party", "To speak to Louisa"], 1],
  ["What happens immediately after Elizabeth goes to see Jane?", ["Mr Darcy compliments Elizabeth.", "The Bingley sisters discuss Elizabeth’s clothes.", "Caroline talks about Jane’s marriage.", "Louisa discusses the Bennet family."], 1],
  ["What is the third event in the extract?", ["Caroline mentions Mr Darcy’s sister.", "Elizabeth returns home.", "Mr Bingley criticizes Elizabeth.", "Louisa compliments Elizabeth’s clothes."], 0],
  ["What does Mr Darcy compliment?", ["Elizabeth’s dress", "Elizabeth’s intelligence", "Elizabeth’s eyes", "Elizabeth’s family"], 2],
  ["Which event happens last?", ["Elizabeth visits Jane.", "Louisa talks about the Bennets’ social class.", "Mr Darcy compliments Elizabeth’s eyes.", "Caroline mentions Mr Darcy’s sister."], 1],
  ["Which is the correct order of events?", ["Elizabeth visits Jane → the sisters discuss her clothes → Caroline mentions Darcy’s sister → Darcy compliments Elizabeth’s eyes → Louisa discusses social class", "Darcy compliments Elizabeth → Elizabeth visits Jane → Louisa discusses social class → Caroline mentions Darcy’s sister → the sisters discuss her clothes", "The sisters discuss Elizabeth’s clothes → Elizabeth visits Jane → Darcy compliments her eyes → Louisa discusses social class → Caroline mentions Darcy’s sister", "Elizabeth visits Jane → Darcy compliments her eyes → Caroline mentions Darcy’s sister → the sisters discuss her clothes → Louisa discusses social class"], 0],
  ["Who defends Elizabeth’s appearance?", ["Caroline", "Mr Darcy", "Mr Bingley", "Mrs Louisa Hurst"], 2],
  ["Who compliments Elizabeth’s eyes?", ["Mr Darcy", "Mr Bingley", "Caroline", "Jane"], 0],
  ["Who comments on Elizabeth’s dirty clothes?", ["Caroline", "Mrs Louisa Hurst", "Mr Bingley", "Mr Darcy"], 1],
  ["Who thinks that Jane will not marry well?", ["Elizabeth", "Louisa", "Mr Darcy", "Caroline"], 3],
  ["Which character is supportive of Elizabeth rather than critical of her appearance?", ["Mr Bingley", "Caroline", "Mrs Louisa Hurst", "Louisa and Caroline"], 0],
  ["Why does Elizabeth only like Mr Bingley?", ["Because he is wealthy", "Because he compliments her eyes", "Because he cares about her and Jane", "Because he invites her to the estate"], 2],
  ["Why does Louisa call Elizabeth “an excellent walker”?", ["To honestly praise her athletic ability", "To make fun of her for walking a long distance to the estate", "To encourage her to walk home", "To explain why her clothes are expensive"], 1],
  ["Louisa’s description of Elizabeth as “an excellent walker” is mainly:", ["A sincere compliment", "An apology", "A sarcastic comment", "A warning"], 2],
  ["Why are Bingley’s sisters worried about Elizabeth’s appearance?", ["They believe appearance is a sign of social status.", "They are worried that she is sick.", "They want to give her new clothes.", "They believe Mr Bingley dislikes her."], 0],
  ["What do Bingley’s sisters associate appearance with?", ["Intelligence", "Social status", "Health", "Age"], 1],
  ["Why is Caroline worried about Mr Darcy’s opinion of Elizabeth?", ["She wants Darcy to marry Jane.", "She considers Elizabeth her best friend.", "She wants to marry Darcy herself.", "She wants Elizabeth to leave the estate."], 2],
  ["What does Louisa mean by “such a father and mother” and “such low connections”?", ["The Bennet parents are unfriendly.", "The Bennets live far away.", "The Bennet family is too poor to join the upper social class.", "Elizabeth does not care about her family."], 2],
  ["What social issue is emphasized by Louisa’s comments?", ["Education", "Social class", "Health", "Travel"], 1],
  ["Which statement reflects Louisa’s opinion of the Bennet family?", ["They are wealthy members of the upper class.", "They are too poor to join the higher social class.", "They have no interest in marriage.", "They own the estate."], 1],
  ["Which word from the extract means “fear”?", ["Anxiety", "Lack", "Excessive", "Indifference"], 0],
  ["Which word means “missing” or not having enough of something?", ["Untidy", "Anxiety", "Lack", "Excessive"], 2],
  ["Which word means “messy”?", ["Indifference", "Untidy", "Excessive", "Anxiety"], 1],
  ["Which word means “not caring very much”?", ["Indifference", "Lack", "Anxiety", "Untidy"], 0],
  ["Which word means “a lot” or “too much”?", ["Untidy", "Indifference", "Excessive", "Lack"], 2],
  ["If someone shows “indifference,” they:", ["Feel very frightened", "Do not care very much", "Look untidy", "Have too much of something"], 1],
  ["Which sentence uses “excessive” correctly?", ["Her excessive worry made it difficult for her to relax.", "He excessive his missing book.", "They were excessive because they did not care.", "The room was excessive because it was messy."], 0],
];

export const getBuiltInEnglishLiteratureSection3 = (language: "ar" | "en"): BuiltInMcqRow[] =>
  SECTION_3.map(([question, choices, answerIndex], index) => ({
    id: `builtin-english-literature-3-${language}-${String(index + 1).padStart(2, "0")}`,
    subject: "english_literature",
    chapter: 3,
    chapter_title: "Section 3",
    question,
    choices: [...choices],
    answer_index: answerIndex,
    explanation: null,
  }));
