import type { Flashcard } from "./flashcards";

type Entry = readonly [question: string, answer: string];

const makeCards = (entries: readonly Entry[]): Flashcard[] =>
  entries.map(([q, a]) => ({ q, a }));

const section1 = makeCards([
  ["True or False:\nMr. Bingley is looking to live in the Bennets' estate.", "False"],
  ["True or False:\nMr. Bennet is jealous of Mrs. Bennet and Mr. Bingley.", "False"],
  ["True or False:\nMr. Bennet wants to visit Mr. Bingley.", "False"],
  ["True or False:\nMrs. Bennet thinks Mr. Bennet prefers Lizzy over their other daughters.", "True"],
  ["True or False:\nMrs. Bennet often loses her patience with Mr. Bennet.", "True"],
  ["True or False:\nMr. Bennet is visiting 20 men in the neighbourhood.", "False"],
  ["How much money does Mr. Bingley earn yearly?", "Four or five thousand pounds."],
  ["Why is Mr. Bingley's arrival a good thing for the Bennet girls?", "Because he might marry one of them."],
  ["Why does Mr. Bennet think Mr. Bingley might like Mrs. Bennet best of all?", "Because she is as beautiful as any of their daughters."],
  ["What does Mr. Bennet think of women who give up thinking of their own beauty?", "That they often don't have much beauty to think of."],
  ["Why is it strange that Sir William and Lady Lucas want to visit Mr. Bingley?", "Because they don't usually visit newcomers."],
  ["Why does Mrs. Bennet want Mr. Bennet to visit Mr. Bingley?", "So she can visit him with her daughters."],
  ["Why does Mr. Bennet think Lizzy is different from her sisters?", "Because they are all silly and ignorant like other girls, but Lizzy is quicker than her sisters."],
  ["What does 'Fortune' mean?", "A large amount of money."],
  ["What does 'Likely' mean?", "Something that has a good chance of happening."],
  ["What does 'Grown-up' mean?", "Adult."],
  ["What does 'Extraordinary' mean?", "Unusual."],
  ["What does 'Consider' mean?", "Think about."],
  ["What does 'Preference' mean?", "Unfairly treating one person better than others."],
  ["What does 'Good-humoured' mean?", "Friendly."],
  ["What does 'Mention' mean?", "Refer."],
  ["In the text, what word means 'a large amount of money'?", "Fortune"],
  ["In the text, what word means 'something that has a good chance of happening'?", "Likely"],
  ["In the text, what word means 'adult'?", "Grown-up"],
  ["In the text, what word means 'unusual'?", "Extraordinary"],
  ["In the text, what word means 'think about'?", "Consider"],
  ["In the text, what word means 'unfairly treating one person better than others'?", "Preference"],
  ["In the text, what word means 'friendly'?", "Good-humoured"],
  ["In the text, what word means 'refer'?", "Mention"],
]);

const section2 = makeCards([
  ["Why doesn't Mr. Darcy want to dance?", "He does not like the women in the room."],
  ["Who does Mr. Darcy think is the only beautiful girl in the room?", "Jane."],
  ["How does Elizabeth react to Mr. Darcy's comment?", "She found it funny."],
  ["What did Mrs. Bennet think of Mr. Bingley?", "She was delighted."],
  ["What did Mrs. Bennet think of Mr. Darcy?", "She thought he was too proud."],
  ["True or False:\nBoth Bingley sisters have husbands.", "False"],
  ["True or False:\nMr. Bingley thinks Mr. Darcy is too difficult to please.", "True"],
  ["True or False:\nMr. Bingley thinks Elizabeth is pretty.", "True"],
  ["True or False:\nMr. Darcy thinks Elizabeth is the only beautiful girl in the room.", "False"],
  ["True or False:\nElizabeth found Mr. Darcy lively and playful.", "False"],
  ["True or False:\nMr. Bingley danced with all the girls twice.", "False"],
  ["True or False:\nMrs. Bennet thought Mr. Darcy was so great.", "False"],
  ["What does 'Several' mean?", "A good number of."],
  ["What does 'Introduce' mean?", "Help two people meet."],
  ["What does 'Coldly' mean?", "In a rude way, not very warm."],
  ["What does 'Lively' mean?", "Full of energy."],
  ["What does 'Admired' mean?", "Wanted, liked."],
  ["What does 'Elegant' mean?", "Fancy."],
  ["What does 'Gown' mean?", "Dress."],
  ["In the text, what word means 'a good number of'?", "Several"],
  ["In the text, what word means 'help two people meet'?", "Introduce"],
  ["In the text, what word means 'in a rude way, not very warm'?", "Coldly"],
  ["In the text, what word means 'full of energy'?", "Lively"],
  ["In the text, what word means 'wanted, liked'?", "Admired"],
  ["In the text, what word means 'fancy'?", "Elegant"],
  ["In the text, what word means 'dress'?", "Gown"],
  ["Who danced with Jane twice?", "Mr. Bingley."],
  ["Who did not attend the ball?", "Mr. Bennet."],
  ["Who thought the ball was a waste of time?", "Mr. Darcy."],
  ["Who was interested in the women's dresses?", "Mrs. Bennet."],
  ["Who laughed with their friends about Mr. Darcy?", "Elizabeth."],
]);

const section3 = makeCards([
  ["Why does Elizabeth only like Mr. Bingley?", "Because he cared about her and Jane."],
  ["Why does Louisa call Elizabeth 'an excellent walker'?", "To make fun of the fact she walked a long way to the estate."],
  ["Why were Bingley's sisters worried about Elizabeth's appearance?", "Because they see it as a sign of status."],
  ["Why is Caroline worried about Mr. Darcy's opinion of Elizabeth?", "Because she wants to marry him."],
  ["What does Louisa mean by 'such a father and mother and such low connections'?", "She means that the Bennets are too poor to join high society."],
  ["What does 'Anxiety' mean?", "Fear."],
  ["What does 'Lack' mean?", "Missing."],
  ["What does 'Untidy' mean?", "Messy."],
  ["What does 'Indifference' mean?", "Not caring much."],
  ["What does 'Excessive' mean?", "A lot, too much."],
  ["In the text, what word means 'fear'?", "Anxiety"],
  ["In the text, what word means 'missing'?", "Lack"],
  ["In the text, what word means 'messy'?", "Untidy"],
  ["In the text, what word means 'not caring much'?", "Indifference"],
  ["In the text, what word means 'a lot, too much'?", "Excessive"],
]);

const section4 = makeCards([
  ["True or False:\nMr. Darcy's father did not leave anything for his godson.", "False"],
  ["True or False:\nMr. Wickham wants to disgrace Mr. Darcy publicly.", "False"],
  ["True or False:\nElizabeth thinks Mr. Wickham is a good man.", "True"],
  ["True or False:\nMr. Wickham thinks Mr. Darcy is jealous of him.", "True"],
  ["True or False:\nMr. Wickham and Mr. Darcy were never close.", "False"],
  ["True or False:\nElizabeth did not think Mr. Darcy could be so cruel.", "True"],
  ["Why was Mr. Wickham not able to look for legal advice?", "Because the will was informal."],
  ["Why does Mr. Wickham think Mr. Darcy chose to doubt the will?", "Because he disliked him, or was jealous of him."],
  ["How old is Mr. Wickham now?", "He was 20 years old."],
  ["What does Mr. Wickham think of himself and Mr. Darcy?", "He thinks that they are very different sorts of men."],
  ["Why doesn't Mr. Wickham disgrace Mr. Darcy publicly?", "He doesn't disgrace him because of his father."],
  ["What does Elizabeth think of Mr. Wickham after he told her what happened?", "She thinks he is even more handsome than before."],
  ["What does 'Attached' mean?", "Very close to someone."],
  ["What does 'Inheritance' mean?", "Money or belongings passed on from someone who has died."],
  ["What does 'Accuse' mean?", "Blame someone of something."],
  ["What does 'Injustice' mean?", "Something unfair."],
  ["What does 'Irritated' mean?", "Make someone angry."],
  ["What does 'Malicious' mean?", "Evil."],
  ["What does 'Reflection' mean?", "Thought."],
  ["In the text, what word means 'very close to someone'?", "Attached"],
  ["In the text, what word means 'money or belongings passed on from someone who has died'?", "Inheritance"],
  ["In the text, what word means 'blame someone of something'?", "Accuse"],
  ["In the text, what word means 'something unfair'?", "Injustice"],
  ["In the text, what word means 'make someone angry'?", "Irritated"],
  ["In the text, what word means 'evil'?", "Malicious"],
  ["In the text, what word means 'thought'?", "Reflection"],
]);

const section5 = makeCards([
  ["Why does Elizabeth dislike Mr. Darcy so strongly?", "Because of everything he said and she heard about him."],
  ["Mr. Darcy thinks...", "Elizabeth is too proud."],
  ["Under what circumstances would Elizabeth have accepted Mr. Darcy's proposal?", "There was nothing he could have done."],
  ["At the end of the conversation, what does Mr. Darcy do?", "He wishes Elizabeth the best."],
  ["True or False:\nMr. Darcy thinks Mr. Wickham has suffered a lot.", "False"],
  ["True or False:\nMr. Darcy thinks Elizabeth rejected him because he insulted her pride.", "True"],
  ["True or False:\nElizabeth was concerned about rejecting Mr. Darcy.", "False"],
  ["True or False:\nElizabeth found Mr. Darcy to be rude from the moment they met.", "True"],
  ["True or False:\nElizabeth's dislike for Mr. Darcy only grew after learning about Jane and Mr. Wickham.", "True"],
  ["True or False:\nElizabeth thinks Mr. Darcy does not care for the feelings of others.", "True"],
  ["True or False:\nElizabeth says Mr. Darcy took too much of her time.", "False"],
  ["Why is Mr. Darcy reddish when he hears Elizabeth talking of Mr. Wickham?", "Because he is jealous."],
  ["Why does Mr. Darcy say Mr. Wickham's misfortunes have been great?", "Because he was being ironic."],
  ["Why does Elizabeth blame Mr. Darcy for Mr. Wickham's misfortunes?", "Because he took his father's inheritance from him."],
  ["What does Mr. Darcy think about his feelings for Elizabeth?", "He thinks he shouldn't want to marry someone socially inferior to him."],
  ["What was Elizabeth's opinion of Mr. Darcy barely a month into knowing him?", "That he was the last man in the world she could be persuaded to marry."],
  ["What does 'Dislike' mean?", "Hate."],
  ["What does 'Revealed' mean?", "To make something known."],
  ["What does 'Faults' mean?", "Mistakes, a bad part of someone's character."],
  ["What does 'Prevented' mean?", "Stopped from doing something."],
  ["What does 'Effort' mean?", "Trying hard."],
  ["What does 'Tone' mean?", "The way someone speaks."],
  ["In the text, what word means 'hate'?", "Dislike"],
  ["In the text, what word means 'to make something known'?", "Revealed"],
  ["In the text, what word means 'mistakes, a bad part of someone's character'?", "Faults"],
  ["In the text, what word means 'stopped from doing something'?", "Prevented"],
  ["In the text, what word means 'trying hard'?", "Effort"],
  ["In the text, what word means 'the way someone speaks'?", "Tone"],
]);

const section6 = makeCards([
  ["What does Mr. Darcy mean by 'you are too generous to play with me'?", "That Elizabeth is too nice to play with his feelings."],
  ["What does Mr. Darcy mean by 'one word from you will silence me on this subject forever'?", "If Elizabeth says no, he will never bother her again."],
  ["Why did Elizabeth's reply make Mr. Darcy happy?", "Because he could still feel hope."],
  ["Why doesn't Elizabeth look Mr. Darcy in the eyes?", "Because she feels embarrassed about her past behaviour."],
  ["How did Lady Catherine's visit make Mr. Darcy feel?", "It made him feel hopeful."],
  ["Who does Elizabeth feel is the most to blame for their arguments?", "No one. She thinks both of them were wrong in the situations."],
  ["What does 'Generous' mean?", "Nice, kind."],
  ["What does 'Fluently' mean?", "Clearly."],
  ["What does 'Period' mean?", "Time."],
  ["What does 'Valuable' mean?", "Worth a lot."],
  ["What does 'Unluckily' mean?", "Without luck."],
  ["What does 'Argue' mean?", "Discuss, fight."],
  ["In the text, what word means 'nice, kind'?", "Generous"],
  ["In the text, what word means 'clearly'?", "Fluently"],
  ["In the text, what word means 'time'?", "Period"],
  ["In the text, what word means 'worth a lot'?", "Valuable"],
  ["In the text, what word means 'without luck'?", "Unluckily"],
  ["In the text, what word means 'discuss, fight'?", "Argue"],
]);

export type EnglishLiteratureDeck = {
  section: number;
  title: string;
  titleAr: string;
  cards: readonly Flashcard[];
};

export const ENGLISH_LITERATURE_DECKS: readonly EnglishLiteratureDeck[] = [
  { section: 1, title: "Section 1", titleAr: "القسم الأول", cards: section1 },
  { section: 2, title: "Section 2", titleAr: "القسم الثاني", cards: section2 },
  { section: 3, title: "Section 3", titleAr: "القسم الثالث", cards: section3 },
  { section: 4, title: "Section 4", titleAr: "القسم الرابع", cards: section4 },
  { section: 5, title: "Section 5", titleAr: "القسم الخامس", cards: section5 },
  { section: 6, title: "Section 6", titleAr: "القسم السادس", cards: section6 },
] as const;

export const ENGLISH_LITERATURE_FLASHCARD_TOTAL = ENGLISH_LITERATURE_DECKS.reduce(
  (total, deck) => total + deck.cards.length,
  0,
);

export const getEnglishLiteratureDeck = (section: string | number) =>
  ENGLISH_LITERATURE_DECKS.find((deck) => deck.section === Number(section));
