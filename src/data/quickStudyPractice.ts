import type { AppLanguage } from "@/components/LanguageGate";
import { quickStudyArabicPractice } from "./quickStudyArabicPractice";

import { choose, matchingPairs, type PracticeItem } from "@/lib/quickStudyChoices";

function number(q: string, answer: number, alternatives: number[]): PracticeItem {
  return { q, a: String(answer), wrong: [...new Set(alternatives)].filter(value => value !== answer).map(String) };
}

function mathPractice(chapter: string, language: AppLanguage): PracticeItem[] {
  const ar = language === "ar";
  return Array.from({ length: 8 }, (_, i) => i + 2).flatMap(n => {
    switch (chapter) {
      case "3": return [
        number(ar ? `احسب ميل المماس للمنحنى y = ${n}x² عند x = 2.` : `Find the slope of the tangent to y = ${n}x² at x = 2.`, 4 * n, [2 * n, 8 * n, n]),
        number(ar ? `عند أي قيمة لـ x تبلغ f(x) = (x − ${n})² + 1 قيمتها الصغرى؟` : `At what x-value does f(x) = (x − ${n})² + 1 reach its minimum?`, n, [-n, n + 1, 0]),
        number(ar ? `إذا كان ضلع مربع طوله ${n} cm ويزداد بمعدل 3 cm/s، فما معدل ازدياد مساحته بوحدة cm²/s؟` : `A square has side length ${n} cm, increasing at 3 cm/s. At what rate is its area increasing in cm²/s?`, 6 * n, [3 * n, 12, n * n]),
      ];
      case "4": return [
        number(ar ? `احسب ∫₀^(${n}) 2x dx.` : `Evaluate ∫₀^(${n}) 2x dx.`, n * n, [n, n * n * 2, n * n + 1]),
        number(ar ? `احسب ∫ من 0 إلى 2 للدالة الثابتة f(x) = ${n}.` : `Evaluate the integral of f(x) = ${n} from 0 to 2.`, 2 * n, [n, 4 * n, 2 * n + 1]),
        choose(ar ? `جد التكامل غير المحدد للدالة f(x) = ${n}x².` : `Find the antiderivative of f(x) = ${n}x².`,
          `(${n}/3)x³ + C`, [`(${n}/3)x³ + C`, `(${n}/2)x² + C`, `${n}x³ + C`, `${2 * n}x + C`]),
      ];
      case "5": return [
        choose(ar ? `حلّ y′ = 2x مع الشرط y(0) = ${n}.` : `Solve y′ = 2x with y(0) = ${n}.`,
          `y = x² + ${n}`, [`y = x² + ${n}`, `y = x² − ${n}`, `y = 2x + ${n}`, `y = 2x² + ${n}`]),
        choose(ar ? `حلّ dy/dx = ${n}y مع الشرط y(0) = 1.` : `Solve dy/dx = ${n}y with y(0) = 1.`,
          `y = exp(${n}x)`, [`y = exp(${n}x)`, `y = exp(−${n}x)`, `y = 1 + ${n}x`, `y = ${n}exp(x)`]),
        choose(ar ? `شنو الحل العام للمعادلة y′ = ${n}x؟` : `What is the general solution of y′ = ${n}x?`,
          `y = (${n}/2)x² + C`, [`y = (${n}/2)x² + C`, `y = ${n}x + C`, `y = ${n}x² + C`, `y = (${n}/2)x³ + C`]),
      ];
      case "6": return [
        number(ar ? `قطعة طولها ${5 * n}، وطول المركّبة العمودية على المستوى ${3 * n}. ما طول الإسقاط على المستوى؟` :
          `A segment is ${5 * n} units long. Its perpendicular component is ${3 * n} units. Find the length of its projection onto the plane.`,
          4 * n, [n, 2 * n, 3 * n]),
        number(ar ? `قطعة موازية للمستوى طولها ${n} وحدات. ما طول إسقاطها المتعامد؟` : `A segment parallel to a plane is ${n} units long. How long is its orthogonal projection?`,
          n, [0, 2 * n, n + 1]),
        number(ar ? `الزاوية الثنائية بين نصفي مستويين قياسها ${10 * n}°. جد قياس الزاوية المجاورة المكمّلة لها.` : `The plane angle of a dihedral angle is ${10 * n}°. Find its adjacent supplementary angle.`,
          180 - 10 * n, [10 * n, 90 - 10 * n, 180 + 10 * n]),
      ];
      default: return [];
    }
  });
}

const biologyParts = [
  ["الجدار الخلوي", "The cell wall", "حدّ خلوي صلب يقع خارج الغشاء البلازمي في الخلية النباتية", "The rigid boundary outside a plant cell’s plasma membrane"],
  ["النوية", "The nucleolus", "منطقة داخل النواة تُجمّع فيها الوحدات الرايبوسومية", "A region inside the nucleus where ribosomal subunits are assembled"],
  ["الفجوة العصارية المركزية", "The central vacuole", "حيّز كبير في وسط الخلية النباتية يخزّن العصارة الخلوية", "The large compartment that stores cell sap in a plant cell"],
  ["الأعراف", "The cristae", "ثنيات الغشاء الداخلي للمايتوكوندريا", "Folds of the mitochondrial inner membrane"],
  ["الحشوة المايتوكوندرية", "The mitochondrial matrix", "الحيّز المحاط بالغشاء الداخلي للمايتوكوندريا", "The compartment enclosed by the mitochondrial inner membrane"],
  ["الغرانا", "The grana", "حُزَم الأقراص الثايلاكويدية في البلاستيدة الخضراء", "Stacks of thylakoid discs in a chloroplast"],
  ["الستروما", "The stroma", "الوسط داخل البلاستيدة الخضراء المحيط بالثايلاكويدات", "The fluid that surrounds the thylakoids inside a chloroplast"],
  ["المريكز", "The centriole", "بنية أسطوانية من تسع ثلاثيات من الأنابيب الدقيقة", "A cylindrical structure made of nine microtubule triplets"],
  ["السنترومير", "The centromere", "منطقة التضيق الأولي التي تربط الكروماتيدين الشقيقين في رسم الكروموسوم", "The constricted region joining sister chromatids in a chromosome drawing"],
  ["غمد المايلين", "The myelin sheath", "غلاف عازل حول محور بعض الخلايا العصبية", "An insulating covering around the axon of some neurons"],
  ["عقد رانفييه", "Nodes of Ranvier", "فواصل بين أجزاء غمد المايلين على طول المحور العصبي", "Gaps between segments of myelin along an axon"],
  ["التغصّنات", "Dendrites", "تفرعات عصبية تستقبل الإشارات وتنقلها باتجاه جسم الخلية", "Neuron branches that receive signals and convey them toward the cell body"],
] as const;

const englishUnit8 = [
  ["A tiny organism is a ___organism.", "micro-", "eco-", "anti-", "re-"],
  ["To write something again is to ___write it.", "re-", "de-", "micro-", "anti-"],
  ["A device that works against theft is an ___theft device.", "anti-", "micro-", "re-", "de-"],
  ["Which suffix turns 'hope' into an adjective meaning 'without hope'?", "-less", "-ful", "-ist", "-ology"],
  ["Which suffix turns 'care' into an adjective meaning 'showing care'?", "-ful", "-less", "-ist", "-ology"],
  ["Which word means 'to remove frost'?", "defrost", "refrost", "frosty", "frosting"],
  ["Which word means 'to rebuild'?", "reconstruct", "deconstruct", "construction", "constructive"],
  ["Which word describes a decision based in part on protecting the environment?", "eco-friendly", "microclimate", "reusable", "devalued"],
  ["Which word is formed with a suffix meaning 'a person who studies or practises something'?", "scientist", "scientific", "science", "scientifically"],
  ["The adjective 'golden' uses the same suffix as which word?", "wooden", "careful", "fearless", "biologist"],
  ["We were pleased ___ the exam results.", "with", "for", "to", "from"],
  ["I’m afraid ___ spiders.", "of", "with", "for", "at"],
  ["She is good ___ solving puzzles.", "at", "of", "to", "from"],
  ["He is angry ___ himself for forgetting.", "with", "to", "for", "from"],
  ["My brother is fond ___ old films.", "of", "on", "at", "to"],
  ["The town is famous ___ its old market.", "for", "of", "with", "to"],
  ["I’m ready ___ the test.", "for", "of", "with", "on"],
  ["They are worried ___ the weather forecast.", "about", "from", "of", "by"],
  ["She is very keen ___ photography.", "on", "at", "of", "to"],
  ["I am grateful ___ your help.", "for", "of", "from", "with"],
] as const;

const relativeFrench = [
  ["Le livre ___ tu lis est passionnant.", "que"],
  ["L’élève ___ parle est dans ma classe.", "qui"],
  ["Voici la ville ___ je suis né.", "où"],
  ["C’est le film ___ nous parlons.", "dont"],
  ["Les lettres ___ j’écris sont longues.", "que"],
  ["Le chien ___ aboie appartient à Marie.", "qui"],
  ["Le jour ___ nous sommes arrivés, il pleuvait.", "où"],
  ["Voilà l’outil ___ j’ai besoin.", "dont"],
  ["La chanson ___ vous écoutez est ancienne.", "que"],
  ["Les amis ___ viennent ce soir habitent à Lyon.", "qui"],
  ["Le parc ___ les enfants jouent est fermé le lundi.", "où"],
  ["L’histoire ___ elle se souvient est drôle.", "dont"],
  ["Le plat ___ le chef prépare contient du riz.", "que"],
  ["La personne ___ a téléphoné est ma sœur.", "qui"],
  ["C’est la salle ___ nous étudions.", "où"],
  ["J’ai un voisin ___ la voiture est rouge.", "dont"],
  ["Les photos ___ elle regarde sont anciennes.", "que"],
  ["Le facteur ___ passe chaque matin a un vélo.", "qui"],
  ["L’année ___ j’ai déménagé, il faisait très froid en hiver.", "où"],
  ["Le sujet ___ ils discutent est difficile.", "dont"],
] as const;

const frenchDialogs = [
  ["Demandez le prix du billet.", "Combien coûte le billet ?"],
  ["Demandez l’heure du départ.", "À quelle heure part le train ?"],
  ["Demandez où se trouve la gare.", "Où est la gare ?"],
  ["Proposez votre aide.", "Puis-je vous aider ?"],
  ["Répondez poliment à un remerciement.", "Je vous en prie."],
  ["Présentez-vous.", "Je m’appelle Nadia."],
  ["Dites que vous ne comprenez pas.", "Je ne comprends pas."],
  ["Demandez à votre interlocuteur de répéter.", "Pouvez-vous répéter ?"],
  ["Demandez la permission d’entrer.", "Puis-je entrer ?"],
  ["Demandez l’addition au restaurant.", "L’addition, s’il vous plaît."],
  ["Excusez-vous pour un retard.", "Excusez-moi pour le retard."],
  ["Prenez congé jusqu’au lendemain.", "À demain !"],
] as const;

const frenchVerbs = [
  ["parle", "parlé", "parlais", "parlerai"],
  ["travaille", "travaillé", "travaillais", "travaillerai"],
  ["cherche", "cherché", "cherchais", "chercherai"],
  ["chante", "chanté", "chantais", "chanterai"],
  ["danse", "dansé", "dansais", "danserai"],
  ["dessine", "dessiné", "dessinais", "dessinerai"],
  ["joue", "joué", "jouais", "jouerai"],
  ["nage", "nagé", "nageais", "nagerai"],
] as const;

const englishLiteratureExtras = {
  "literature-3": [
    ["Which word describes someone who does not seem interested?", "indifferent", "anxious", "untidy", "excessive"],
    ["Which word completes 'Her room was messy and ___'?", "untidy", "anxious", "excessive", "indifferent"],
    ["Which word means that there is too much of something?", "excessive", "untidy", "missing", "careful"],
    ["Choose a suitable word for 'He showed ___ about the outcome and did not care either way.'", "indifference", "anxiety", "tidiness", "excess"],
    ["Which word completes 'They could not finish due to a ___ of time'?", "lack", "fear", "mess", "status"],
    ["What feeling is close in meaning to 'anxiety'?", "worry", "indifference", "pride", "relief"],
  ],
  "literature-6": [
    ["Fill in the blank. 'She can speak the language freely and ___.'", "fluently", "unluckily", "generously", "angrily"],
    ["Which adjective describes an item worth a lot?", "valuable", "generous", "unlucky", "fluent"],
    ["What does 'for a short period' mean?", "for a short time", "at a low price", "with little luck", "with great kindness"],
    ["Which verb could replace 'fight' in 'They often fight about the rules'?", "argue", "agree", "wait", "help"],
    ["A person who is happy to give and share is usually described as ___ .", "generous", "valuable", "fluent", "unlucky"],
  ],
} as const;

export function getQuickStudyPractice(subject: string, chapter: string, language: AppLanguage): PracticeItem[] {
  if (subject === "math") return mathPractice(chapter, language);
  if (subject === "arabic" || subject === "islamic") return quickStudyArabicPractice(subject, chapter);
  if (subject === "biology" && chapter === "drawings") {
    const ar = language === "ar";
    const parts = biologyParts.map(([nameAr, nameEn, labelAr, labelEn]) => ar ? [nameAr, labelAr] as const : [nameEn, labelEn] as const);
    return matchingPairs(parts,
      description => ar ? `أي جزء يطابق هالوصف بالرسم؟ ${description}` : `Which structure matches this description? ${description}`,
      part => ar ? `أي وصف يدل على «${part}» بالرسم؟` : `Which description identifies ${part.toLowerCase()} in a diagram?`);
  }
  if (subject === "english") {
    const quiz: readonly (readonly [string, string, ...string[]])[] = chapter === "8"
      ? englishUnit8
      : englishLiteratureExtras[chapter as keyof typeof englishLiteratureExtras] ?? [];
    return quiz.map(([q, a, ...wrong]) => ({ q, a, wrong }));
  }
  if (subject !== "french") return [];
  if (chapter === "relative-pronouns") return relativeFrench.map(([sentence, answer]) =>
    choose(`Complétez avec le pronom relatif : ${sentence}`, answer, ["qui", "que", "où", "dont"]));
  if (chapter === "negation") return frenchVerbs.flatMap(([verb]) => [
    choose(`Mettez à la forme négative (ne … pas) : « Je ${verb}. »`, `Je ne ${verb} pas.`,
      [`Je ne ${verb} pas.`, `Je ne ${verb} jamais.`, `Je ne ${verb} plus.`, `Je ${verb}.`]),
    choose(`Répondez avec « jamais » : « Tu ${verb.endsWith("e") ? `${verb}s` : verb} parfois ? »`, `Je ne ${verb} jamais.`,
      [`Je ne ${verb} jamais.`, `Je ne ${verb} plus.`, `Je ne ${verb} pas.`]),
    choose(`Dites que vous avez arrêté cette activité : « Maintenant, je … » (verbe : ${verb}).`, `Je ne ${verb} plus.`,
      [`Je ne ${verb} plus.`, `Je ne ${verb} jamais.`, `Je ${verb} encore.`]),
  ]);
  if (chapter === "tenses") return frenchVerbs.flatMap(([present, participle, imperfect, future]) => {
    const forms = [`je ${present}`, `j’ai ${participle}`, `je ${imperfect}`, `je ${future}`];
    return [
      choose(`Mettez au passé composé : « ${forms[0]} ».`, forms[1], forms),
      choose(`Mettez à l’imparfait : « ${forms[0]} ».`, forms[2], forms),
      choose(`Mettez au futur simple : « ${forms[0]} ».`, forms[3], forms),
    ];
  });
  if (chapter === "dialogues") return matchingPairs(frenchDialogs,
    phrase => `Dans quelle situation emploie-t-on « ${phrase} » ?`,
    situation => `Quelle phrase convient ? ${situation}`);
  return [];
}
