import type { Flashcard } from "./flashcards";

/**
 * Reading-comprehension questions transcribed and checked against the
 * Mohammed Ali Al-Kinani booklet (PDF pages 143, 146, 149, 152, and 155).
 */
export const flashcardsFrenchReadingComprehension: Flashcard[] = [
  // Jean Dugommier — PDF page 143 (8 questions)
  { q: "Jean Dugommier\nD’où le métro vient-il de sortir ?", a: "Il vient de sortir du tunnel sombre." },
  { q: "Jean Dugommier\nQui est Jean Dugommier ?", a: "Vieux solitaire à quelques années de la retraite." },
  { q: "Jean Dugommier\nDe quoi a-t-il l’habitude en conduisant le métro ?", a: "Il a l’habitude de feuilleter un livre d’histoire." },
  { q: "Jean Dugommier\nQuel est le métier de J. Dugommier ?", a: "Il est conducteur de métro." },
  { q: "Jean Dugommier\nQuand va-t-il au cinéma ?", a: "Il y va quand, par hasard, on joue un film historique." },
  { q: "Jean Dugommier\nOù J. Dugommier habite-t-il ?", a: "Il habite à Paris, dans un petit studio de la rue Alexandre Dumas." },
  { q: "Jean Dugommier\nComment son petit studio est-il ?", a: "Les murs sont tapissés de livres d’histoire." },
  {
    q: "Jean Dugommier\nQue fait-il les jours de congé ?",
    a: "Il rend quelquefois visite aux bouquinistes des quais de la Seine ; se promène dans le Marais, au château de Versailles, ou il va visiter un musée.",
  },

  // Rêves de gloire — PDF page 146 (9 questions)
  { q: "Rêves de gloire\nQui appelle J. D. quand il arrive au terminus ?", a: "Son chef de service, Robert Colonna." },
  {
    q: "Rêves de gloire\nPourquoi le chef de service l’appelle-t-il ?",
    a: "Pour lui faire des reproches parce qu’il a quinze minutes de retard et il s’est arrêté plus de huit minutes à Pigalle.",
  },
  { q: "Rêves de gloire\nPourquoi s’est-il arrêté plus de 8 minutes à Pigalle ?", a: "Parce que quelqu’un a tiré le signal d’alarme." },
  {
    q: "Rêves de gloire\nPourquoi ne s’est-il pas arrêté à Philippe Auguste ?",
    a: "Parce qu’il n’y avait personne sur le quai et il voulait rattraper son retard.",
  },
  { q: "Rêves de gloire\nQu’est-ce que Colonna va faire si cela continue ?", a: "Il va le mettre à la retraite anticipée." },
  {
    q: "Rêves de gloire\nPourquoi Dugommier renonce-t-il à continuer la discussion ?",
    a: "Parce que ça fait 20 ans qu’il subit les réprimandes de Colonna.",
  },
  { q: "Rêves de gloire\nQuand Dugommier commence-t-il à rêver ?", a: "En traversant la station Alésia." },
  {
    q: "Rêves de gloire\nComment Dugommier ne serait-il pas un simple conducteur de métro ?",
    a: "S’il pouvait vivre dans un autre siècle, par un coup de baguette magique.",
  },
  { q: "Rêves de gloire\nS’il pouvait être transporté dans le temps, que ferait-il ?", a: "Il choisirait d’être Jules César." },

  // Rêves d’enfance — PDF page 149 (8 questions)
  { q: "Rêves d’enfance\nOù Dugommier était-il il y a 40 ans ?", a: "Il était en 5e dans un collège parisien." },
  { q: "Rêves d’enfance\nDans la classe, où Dugommier est-il assis ?", a: "Il était assis au fond de la classe." },
  { q: "Rêves d’enfance\nQue fait-il au fond de la classe ?", a: "Il baisse les yeux sur son livre d’histoire ouvert sur ses genoux." },
  { q: "Rêves d’enfance\nComment la leçon est-elle pour Dugommier ?", a: "Elle est ennuyeuse." },
  { q: "Rêves d’enfance\nPar qui Dugommier est-il fasciné ?", a: "Il est fasciné par une princesse." },
  {
    q: "Rêves d’enfance\nComment la femme qui a fasciné Dugommier est-elle ?",
    a: "Elle a le visage pur et ovale, une taille fine et élancée.",
  },
  {
    q: "Rêves d’enfance\nComment la princesse paraît-elle ?",
    a: "Elle paraît indifférente aux bijoux qu’elle est en train de déposer dans un coffret.",
  },
  { q: "Rêves d’enfance\nPourquoi Dugommier sursaute-t-il ?", a: "Parce que la voix du professeur l’a surpris au milieu de ses rêves." },

  // Rêves de révolte — PDF page 152 (5 questions)
  {
    q: "Rêves de révolte\nPourquoi Dugommier frappe-t-il à la porte du propriétaire de son immeuble ?",
    a: "Pour lui demander un délai de paiement de son loyer.",
  },
  { q: "Rêves de révolte\nPourquoi l’argent des loyers lui est-il indispensable ?", a: "Pour faire réparer l’ascenseur." },
  { q: "Rêves de révolte\nCombien de factures Dugommier doit-il payer ?", a: "Il doit payer quatre factures." },
  { q: "Rêves de révolte\nCombien de jours de délai le propriétaire lui a-t-il donné ?", a: "Il lui a donné quinze jours de délai." },
  {
    q: "Rêves de révolte\nQuand les images de révolte reviennent-elles à la mémoire de Jean Dugommier ?",
    a: "Quand le métro entre dans la station Bastille.",
  },

  // Rêves de sagesse — PDF page 155 (7 questions)
  {
    q: "Rêves de sagesse\nOù le métro est-il en panne ?",
    a: "Le métro est en panne sur la ligne 3, juste après la station Parmentier.",
  },
  { q: "Rêves de sagesse\nComment J. Dugommier parle-t-il aux voyageurs ?", a: "Son micro fonctionne." },
  { q: "Rêves de sagesse\nEst-ce une panne d’essence ?", a: "Non, c’est une panne d’électricité." },
  { q: "Rêves de sagesse\nQui prend la parole dans la salle de réunion ?", a: "Le chef du personnel prend la parole." },
  {
    q: "Rêves de sagesse\nPourquoi regretteront-ils Jean Dugommier ?",
    a: "Parce que, en 30 ans de service, il n’a pas été absent un seul jour, et il leur a apporté beaucoup de fantaisie.",
  },
  { q: "Rêves de sagesse\nDe quoi le chef du personnel décore-t-il Dugommier ?", a: "Il le décore de la médaille du travail." },
  {
    q: "Rêves de sagesse\nOù passera-t-il sa retraite ? Pourquoi ?",
    a: "Il passera sa retraite à Poitiers, où il a hérité d’une petite maison.",
  },
];
