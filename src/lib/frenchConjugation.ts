import { alwaysAuxEtre, getConjugation } from "french-verbs";
import Lefff from "french-verbs-lefff/dist/conjugations.json";

export type ConjugationValue = string | string[] | { [key: string]: ConjugationValue };

export type FrenchConjugation = {
  verb: string;
  infinitive: string;
  group: string;
  auxiliary: string;
  pronominal: boolean;
  moods: Record<string, ConjugationValue>;
  meta: { source: string; canonical_url: string; license: string };
};

const lexicon = Lefff as Record<string, Record<string, string[]>>;
const infinitives = Object.keys(lexicon);
const searchableInfinitives = infinitives.map((verb) => ({ verb, normalized: verb.normalize("NFD").replace(/[\u0300-\u036f]/g, "") }));
const dualAuxiliaryVerbs = new Set(["descendre", "entrer", "monter", "passer", "rentrer", "retourner", "sortir"]);
const subjects = ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"];
const subjunctiveSubjects = ["que je", "que tu", "qu’il / elle / on", "que nous", "que vous", "qu’ils / elles"];
const aspiratedHVerbs = /^(haïr|haleter|harceler|hasarder|hâter|hausser|héler|hennir|heurter|hisser|hoqueter|hurler)/u;

const normalize = (value: string) => value.toLocaleLowerCase("fr").normalize("NFC").trim();
const withoutMarks = (value: string) => normalize(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const editDistance = (left: string, right: string) => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = new Array<number>(right.length + 1);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + Number(left[leftIndex - 1] !== right[rightIndex - 1]),
      );
    }
    for (let index = 0; index <= right.length; index += 1) previous[index] = current[index];
  }

  return previous[right.length];
};

const parseVerb = (raw: string) => {
  const value = normalize(raw).replace(/\s+/g, " ");
  if (value.startsWith("se ")) return { base: value.slice(3).trim(), pronominal: true };
  if (/^s['’]/u.test(value)) return { base: value.slice(2).trim(), pronominal: true };
  return { base: value, pronominal: false };
};

const auxiliaryFor = (verb: string, pronominal: boolean): "ETRE" | "AVOIR" =>
  pronominal || alwaysAuxEtre(verb) || dualAuxiliaryVerbs.has(verb) ? "ETRE" : "AVOIR";

const form = (verb: string, tense: string, person: number, pronominal: boolean, auxiliary?: "ETRE" | "AVOIR") => {
  try {
    return getConjugation(
      lexicon,
      verb,
      tense as never,
      person,
      { aux: auxiliary || auxiliaryFor(verb, pronominal) },
      pronominal,
      undefined,
      undefined,
      "Act",
    )?.trim() || "";
  } catch {
    return "";
  }
};

const withSubject = (label: string, conjugated: string, verb: string) => {
  const beginsWithVowelSound = /^[aeiouyàâäéèêëîïôöùûüÿœæ]/iu.test(conjugated)
    || (/^h/iu.test(conjugated) && !aspiratedHVerbs.test(verb));
  if (beginsWithVowelSound && label === "je") return `j’${conjugated}`;
  if (beginsWithVowelSound && label === "que je") return `que j’${conjugated}`;
  return `${label} ${conjugated}`;
};

const finiteForms = (
  verb: string,
  tense: string,
  pronominal: boolean,
  mood: "indicative" | "subjunctive" = "indicative",
  auxiliary?: "ETRE" | "AVOIR",
) => Array.from({ length: 6 }, (_, person) => {
  const conjugated = form(verb, tense, person, pronominal, auxiliary);
  if (!conjugated) return "";
  const label = mood === "subjunctive" ? subjunctiveSubjects[person] : subjects[person];
  return withSubject(label, conjugated, verb);
}).filter(Boolean);

const compoundForms = (verb: string, tense: string, pronominal: boolean, mood: "indicative" | "subjunctive" = "indicative") => {
  if (!pronominal && dualAuxiliaryVerbs.has(verb)) {
    return [
      ...finiteForms(verb, tense, false, mood, "ETRE").map((item) => `${item} — avec être`),
      ...finiteForms(verb, tense, false, mood, "AVOIR").map((item) => `${item} — avec avoir`),
    ];
  }
  return finiteForms(verb, tense, pronominal, mood);
};

const imperativeForms = (verb: string, tense: string, pronominal: boolean) => [1, 3, 4]
  .map((person) => form(verb, tense, person, pronominal))
  .filter(Boolean);

const singleForm = (verb: string, tense: string, pronominal: boolean) => {
  const value = form(verb, tense, 0, pronominal);
  return value ? [value] : [];
};

const groupFor = (verb: string) => {
  if (verb.endsWith("er") && verb !== "aller") return "1er groupe";
  const nousPresent = form(verb, "PRESENT", 3, false);
  if (verb.endsWith("ir") && nousPresent.endsWith("issons")) return "2e groupe";
  return "3e groupe";
};

const displayInfinitive = (verb: string, pronominal: boolean) => {
  if (!pronominal) return verb;
  return /^[aeiouyàâäéèêëîïôöùûüÿœæh]/iu.test(verb) ? `s’${verb}` : `se ${verb}`;
};

export const findFrenchVerbSuggestions = (raw: string, limit = 6) => {
  const { base, pronominal } = parseVerb(raw);
  const needle = withoutMarks(base);
  if (!needle) return [];

  const directMatches = searchableInfinitives
    .filter(({ normalized }) => normalized.startsWith(needle) || normalized.includes(needle))
    .sort((a, b) => (
      Number(!a.normalized.startsWith(needle)) - Number(!b.normalized.startsWith(needle))
      || a.normalized.indexOf(needle) - b.normalized.indexOf(needle)
      || a.verb.length - b.verb.length
      || a.verb.localeCompare(b.verb, "fr")
    ));

  const matches = directMatches.length > 0 || needle.length < 3
    ? directMatches
    : searchableInfinitives
      .map((entry) => ({ ...entry, distance: editDistance(needle, entry.normalized) }))
      .filter(({ distance }) => distance <= Math.min(2, Math.max(1, Math.floor(needle.length / 4))))
      .sort((a, b) => a.distance - b.distance || a.verb.length - b.verb.length || a.verb.localeCompare(b.verb, "fr"));

  return matches
    .slice(0, limit)
    .map(({ verb }) => displayInfinitive(verb, pronominal));
};

export const conjugateFrenchVerb = (raw: string): FrenchConjugation | null => {
  const parsed = parseVerb(raw);
  let verb = parsed.base;
  if (!lexicon[verb]) {
    const accentInsensitive = infinitives.find((candidate) => withoutMarks(candidate) === withoutMarks(verb));
    if (!accentInsensitive) return null;
    verb = accentInsensitive;
  }

  const pronominal = parsed.pronominal;
  const aux = auxiliaryFor(verb, pronominal);
  const auxiliary = pronominal || alwaysAuxEtre(verb)
    ? "être"
    : dualAuxiliaryVerbs.has(verb) ? "être / avoir" : "avoir";
  const infinitive = displayInfinitive(verb, pronominal);

  return {
    verb: infinitive,
    infinitive,
    group: groupFor(verb),
    auxiliary,
    pronominal,
    moods: {
      indicatif: {
        présent: finiteForms(verb, "PRESENT", pronominal),
        imparfait: finiteForms(verb, "IMPARFAIT", pronominal),
        "passé simple": finiteForms(verb, "PASSE_SIMPLE", pronominal),
        "futur simple": finiteForms(verb, "FUTUR", pronominal),
        "passé composé": compoundForms(verb, "PASSE_COMPOSE", pronominal),
        "plus-que-parfait": compoundForms(verb, "PLUS_QUE_PARFAIT", pronominal),
        "passé antérieur": compoundForms(verb, "PASSE_ANTERIEUR", pronominal),
        "futur antérieur": compoundForms(verb, "FUTUR_ANTERIEUR", pronominal),
      },
      subjonctif: {
        présent: finiteForms(verb, "SUBJONCTIF_PRESENT", pronominal, "subjunctive"),
        imparfait: finiteForms(verb, "SUBJONCTIF_IMPARFAIT", pronominal, "subjunctive"),
        passé: compoundForms(verb, "SUBJONCTIF_PASSE", pronominal, "subjunctive"),
        "plus-que-parfait": compoundForms(verb, "SUBJONCTIF_PLUS_QUE_PARFAIT", pronominal, "subjunctive"),
      },
      conditionnel: {
        présent: finiteForms(verb, "CONDITIONNEL_PRESENT", pronominal),
        "passé — 1re forme": compoundForms(verb, "CONDITIONNEL_PASSE_1", pronominal),
        "passé — 2e forme": compoundForms(verb, "CONDITIONNEL_PASSE_2", pronominal),
      },
      impératif: {
        présent: imperativeForms(verb, "IMPERATIF_PRESENT", pronominal),
        passé: imperativeForms(verb, "IMPERATIF_PASSE", pronominal),
      },
      infinitif: {
        présent: [infinitive],
        passé: singleForm(verb, "INFINITIF_PASSE", pronominal),
      },
      participe: {
        présent: singleForm(verb, "PARTICIPE_PRESENT", pronominal),
        passé: lexicon[verb]?.K?.filter(Boolean) || singleForm(verb, "PARTICIPE_PASSE", pronominal),
        composé: singleForm(verb, "PARTICIPE_PASSE_COMPOSE", pronominal),
      },
      gérondif: {
        présent: singleForm(verb, "PARTICIPE_PRESENT", pronominal).map((item) => `en ${item}`),
        passé: singleForm(verb, "PARTICIPE_PASSE_COMPOSE", pronominal).map((item) => `en ${item}`),
      },
    },
    meta: {
      source: "Lefff",
      canonical_url: "https://github.com/ClaudeCoulombe/FrenchLefffLemmatizer",
      license: "LGPL-LR",
    },
  };
};
