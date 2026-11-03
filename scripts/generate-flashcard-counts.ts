/** Print source-derived counts without loading the study content into the chapter picker. */
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { summarizeCard, type FlashcardSummary } from "../src/lib/flashcardSummaryIdentity";

const decks: Record<string, FlashcardSummary[]> = {};
async function add(subject: string, variant: string, language: string, chapter: number, file: string, name: string) {
  const source = await import(pathToFileURL(resolve("src/data", `${file}.ts`)).href);
  const cards = source[name];
  if (!Array.isArray(cards)) throw new Error(`Missing flashcard array: ${file}.${name}`);
  const key = `${subject}:${variant}:${language}:${chapter}`;
  const summaries = cards.map((card: { q: string; a: string; id?: string }, index: number) => {
    const summary = summarizeCard(card.q, card.a);
    return variant === "ahmed-al-nadawi" ? [...summary, card.id ?? `CH${chapter}-${String(index + 1).padStart(3, "0")}`] as FlashcardSummary : summary;
  });
  decks[key] = [...(decks[key] ?? []), ...summaries];
}

for (const language of ["ar", "en"]) {
  for (let chapter = 1; chapter <= 8; chapter++) {
    const physics = language === "ar" ? `flashcardsCh${chapter}Ar` : chapter === 3 ? "flashcards" : `flashcardsCh${chapter}`;
    await add("physics", "default", language, chapter, physics, physics);
    const suffix = language === "ar" ? "Ar" : "";
    const file = `flashcardsChemCh${chapter}AhmedNadawi${chapter === 3 ? (language === "en" ? "En" : "") : suffix}`;
    const name = `ahmedNadawiChemCh${chapter}Cards${chapter === 3 ? (language === "en" ? "En" : "") : suffix}`;
    await add("chemistry", "ahmed-al-nadawi", language, chapter, file, name);
  }
  const wijdan = `flashcardsChemCh3Wijdan${language === "ar" ? "Ar" : "En"}`;
  await add("chemistry", "wijdan", language, 3, wijdan, wijdan);
  for (const chapter of [1, 2, 3, 5]) {
    const name = `flashcardsBioCh${chapter}${language === "ar" ? "Ar" : "En"}`;
    await add("biology", "mohammed-al-anzi", language, chapter, name, name);
  }
  for (let chapter = 1; chapter <= 5; chapter++) {
    const name = `flashcardsBioCh${chapter}Nadia${language === "ar" ? "Ar" : "En"}`;
    await add("biology", "nadia-al-nuaimi", language, chapter, name, name);
  }
  for (let chapter = 1; chapter <= 8; chapter++) {
    const name = `flashcardsEngGrammar${chapter}`;
    await add("english", "grammar", language, chapter, name, name);
    if (chapter <= 2) {
      const extra = `${name}Nadawi2027`;
      await add("english", "grammar", language, chapter, extra, extra);
    }
  }
  await add("english", "paragraphs", language, 1, "flashcardsEngParagraphs", "flashcardsEngParagraphs");
  const literature = await import("../src/data/englishLiteratureFlashcards");
  for (const deck of literature.ENGLISH_LITERATURE_DECKS) decks[`english:literature:${language}:${deck.section}`] = deck.cards.map(card => summarizeCard(card.q, card.a));
  for (const chapter of [1, 2]) {
    const name = `flashcardsMathCh${chapter}Ar`;
    await add("math", "default", language, chapter, name, name);
  }
  const arabic = ["Taajjub", "Tawkeed", "Taqdim", "Nida", "Istifham"];
  for (const [index, topic] of arabic.entries()) {
    const name = `flashcardsArabic${topic}Ar`;
    await add("arabic", "default", language, index + 2, name, name);
  }
  decks[`arabic:default:${language}:1`] = [];
  decks[`arabic:default:${language}:7`] = [];
  await add("islamic", "default", language, 1, "flashcardsIslamicMeaningsAr", "flashcardsIslamicMeaningsAr");
}
if (process.argv.includes("--write")) {
  // Generated metadata: one compact entry per deck, with no study text.
  writeFileSync("src/data/flashcardDeckSummaries.json", `{\n${Object.entries(decks).map(([key, cards]) => `  ${JSON.stringify(key)}: ${JSON.stringify(cards)}`).join(",\n")}\n}\n`);
} else {
  process.stdout.write(`${JSON.stringify(Object.fromEntries(Object.entries(decks).map(([key, cards]) => [key, new Set(cards.map(card => `${card[0]}:${card[1]}`)).size])), null, 2)}\n`);
}
