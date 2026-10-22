// Ahmed Al-Nadawi Chemistry Chapter 4 — verbatim verbal flashcards.
// Source: the uploaded 138-page distinguished-curriculum handout, Chapter four.pdf.
// Student-facing questions and answers preserve the source wording; calculation-only items and authored practice were removed.

export type AhmedNadawiChemCh4Card = {
  id: string;
  q: string;
  a: string;
  topic: string;
  kind: "source";
  pages: string;
  sourceQuestion?: string;
};

export const ahmedNadawiChemCh4Source = {
  file: "Chapter four.pdf",
  sourcePdf: "Chapter four.pdf",
  pdfPages: 138,
  sha256: "c4fb03a88a69c6d6de0360c88009f53fa1ce5e7eb80d8b5654726e73604fe763",
  curriculum: "distinguished",
  language: "en",
  verbatimVerbalOnly: true,
  verifiedMinisterialYears: false,
  accuracyNotes: "The source wording, spelling and grammar are preserved. Calculation-only questions and authored practice cards are excluded."
} as const;

export const ahmedNadawiChemCh4Topics = [
  {
    "key": "01",
    "title": "Oxidation Numbers and Redox Reactions",
    "titleAr": "أعداد التأكسد وتفاعلات التأكسد والاختزال",
    "expectedCount": 16
  },
  {
    "key": "02",
    "title": "Electrochemical and Galvanic Cells",
    "titleAr": "الخلايا الكهروكيميائية والكلفانية",
    "expectedCount": 12
  },
  {
    "key": "03",
    "title": "Electrode Potential, SHE and Cell Notation",
    "titleAr": "جهود الأقطاب وقطب الهيدروجين القياسي والمخطط الخطي",
    "expectedCount": 15
  },
  {
    "key": "04",
    "title": "Electrolysis, Electroplating and Faraday Laws",
    "titleAr": "التحليل الكهربائي والطلاء الكهربائي وقانونا فاراداي",
    "expectedCount": 8
  },
  {
    "key": "05",
    "title": "Gibbs Free Energy and Equilibrium Constant",
    "titleAr": "طاقة غبس الحرة وثابت الاتزان",
    "expectedCount": 5
  },
  {
    "key": "06",
    "title": "Nernst Equation",
    "titleAr": "معادلة نرنست",
    "expectedCount": 4
  },
  {
    "key": "07",
    "title": "Batteries",
    "titleAr": "البطاريات",
    "expectedCount": 5
  },
  {
    "key": "7B",
    "title": "Numerical Variants from the Final Review",
    "titleAr": "مسائل المراجعة النهائية ذات البيانات المختلفة",
    "expectedCount": 0
  },
  {
    "key": "08",
    "title": "Worked Practice — One Problem per Idea",
    "titleAr": "تطبيقات تدريبية محلولة لكل فكرة",
    "expectedCount": 0
  }
] as const;

export const ahmedNadawiChemCh4Cards: AhmedNadawiChemCh4Card[] = [
  {
    "id": "CH4-001",
    "q": "Oxidation Number (or oxidation steps)",
    "a": "it is the number of electrons (electrical charge) gained or lost by an atom in a compound molecule. It is shown with an electrocharge written above the element symbol.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3"
  },
  {
    "id": "CH4-002",
    "q": "The oxidation number of free elements",
    "a": "The oxidation number of free elements is equal to zero\n\nNa , Be , K , Pb , H2 , O2 , P4 = 0",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3"
  },
  {
    "id": "CH4-003",
    "q": "The oxidation number of monoatomic ion",
    "a": "The oxidation number of monoatomic ion is equal to the charge on this ion",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3"
  },
  {
    "id": "CH4-004",
    "q": "The oxidation number of hydrogen",
    "a": "The oxidation number of hydrogen is equal to +1 , except the oxidation number of hydrides is -1",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3"
  },
  {
    "id": "CH4-005",
    "q": "The oxidation number of oxygen",
    "a": "The oxidation number of oxygen is ( -2 ) , except the oxidation number of oxygen in peroxides is ( -1 )",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3"
  },
  {
    "id": "CH4-006",
    "q": "The oxidation number of Group IA, Group IIA and Group IIIA elements",
    "a": "A- The oxidation number of Group IA element in a compound is +1\n\nB- The oxidation number of Group IIA element in a compound is +2\n\nC- The oxidation number of Group IIIA element in a compound is +3",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 4"
  },
  {
    "id": "CH4-007",
    "q": "the oxidation number of halogens group VIIA element",
    "a": "the oxidation number of halogens group VIIA element in a compound is (-1)",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 4"
  },
  {
    "id": "CH4-011",
    "q": "Electrochemistry",
    "a": "Electrochemistry is one of the branches of chemistry. It deals with the changes between chemical energy and electrical energy.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 7"
  },
  {
    "id": "CH4-012",
    "q": "Oxidation-reduction (Redox) reaction",
    "a": "During this reaction electrons are transferred from one atom to another. According to this the atom that loses electron is a reducing agent, the atom that gains electron is an oxidizing agent. The energy released from combustibles electric current from batteries and oxidation of iron are examples for these reaction",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 7"
  },
  {
    "id": "CH4-013",
    "q": "What is the oxidation reaction properties?",
    "a": "Oxidation is a chemical change which causes loss of electrons from an atom or atom group and increasing oxidation number.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 8, 80"
  },
  {
    "id": "CH4-014",
    "q": "Reduction",
    "a": "Reduction is a chemical change which causes gain of electrons to an atom or atom group and decreasing oxidation number.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 80"
  },
  {
    "id": "CH4-025",
    "q": "Define: reduction agent",
    "a": "A substance which takes place in oxidation reaction but causes another substance to reduce",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 16"
  },
  {
    "id": "CH4-026",
    "q": "Oxidizing Agent",
    "a": "is a substance that reduced and causes another substance to oxidize.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 80"
  },
  {
    "id": "CH4-036",
    "q": "Define: oxidation potential:",
    "a": "is the tendency of matter losing its electrons.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 16"
  },
  {
    "id": "CH4-037",
    "q": "Among the Properties of the Reduction agent ------- , --------- and --------",
    "a": "1- is a substance that oxidized and causes another substance to reduce.\n2-Reduction agent loss electrons\n3-its oxidation number increases during the oxidation - reducing reaction",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 17"
  },
  {
    "id": "CH4-024",
    "q": "Oxidation and reduction of metals and non-metals",
    "a": "1. The oxidation of metals represents the transition of the atoms into positive ions or the transition of positive ions into positive ions of greater oxidation number\n\n2. The oxidation of non-metals (especially gases) represents the transition of negative ions into molecules except hydrogen which represents the transition of a molecule into positive ions.\n\n3. The reduction of metals represents the transition of positive ions into atoms or the transition of positive ions into positive ions of less oxidation number.\n\n4. The reduction of non-metals represents the transition of the molecules into negative ions except the hydrogen which represents the transition of positive ions into a molecule.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 12"
  },
  {
    "id": "CH4-038",
    "q": "Electrochemical cells",
    "a": "consist of two electrodes of which one is positive and called as anode and the other is negative and called as cathode. Both electrodes are dipped into an electrolyte solution which includes substances to help reduction and oxidation reactions.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 81"
  },
  {
    "id": "CH4-039",
    "q": "Anode",
    "a": "is the electrode at which oxidation reaction occurs and is source of electrons.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 81"
  },
  {
    "id": "CH4-040",
    "q": "Cathode",
    "a": "is the electrode at which reduction reaction occurs and attracts electrons from the anode.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 81"
  },
  {
    "id": "CH4-041",
    "q": "Galvanic cells",
    "a": "the cells in which chemical energy is transformed into electrical energy during spontaneous chemical reactions occur to produce electricity. Such cells are called galvanic or voltage cells.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 81"
  },
  {
    "id": "CH4-042",
    "q": "What happens when a zinc rod is dipped into copper sulfate solution?",
    "a": "1- the zinc rod starts to corrode and disappear. The concentration of zinc ions increases. That means a spontaneous reaction occurs. The zinc (Zn) atoms are oxidized and transform into ions Zn+2.\n\n2- brownish copper element starts plating zinc rod as a spongy layer. Some of the copper settles at the bottom because the copper ions Cu+2 are reduced and thus transform into copper atoms Cu\n\n3- the blue color of the solution starts to disappear due to the decrease in the concentration of copper ions and finally it becomes colorless.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 19"
  },
  {
    "id": "CH4-043",
    "q": "Daniel cells are the most famous and simplest galvanic cells. Explain the components of this cell with drawing.",
    "a": "1- anode (zinc pole)\n2- cathode (copper pole)\n3- salt bridge\n4- external wire",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 20"
  },
  {
    "id": "CH4-044",
    "q": "What does Daniell cell depends on ?",
    "a": "1- Zn , Zn+2 Oxidation\n2- Cu+2 , Cu reduction\n3- This event occurs in two different containers as Zn dipped into ZnSO4 and Cu dipped into CuSO4",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 20"
  },
  {
    "id": "CH4-045",
    "q": "Compare the anode with the cathode in Daniel cell.",
    "a": "Anode (zinc pole)\nIt has oxidation (transforms from atom to ion)\nZn → Zn+2 + 2e-\nIt is considered a source of electrons\nThe zinc rod is used up with time\nIt represents the cell's positive pole\nThe concentration of the pole solution increases with time\n\nCathode (copper pole)\nIt has reduction (transforms from ion to atom)\nCu+2 + 2e- → Cu\nIt is considered a receiver or consumer of electrons\nThe copper rod gets thicker with time\nIt represents the cell's negative pole\nThe concentration of the pole solution decreases with time",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 21"
  },
  {
    "id": "CH4-047",
    "q": "Why are Zn and Cu chosen as Daniel Cell's poles?",
    "a": "because the potential difference between them is high",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 21"
  },
  {
    "id": "CH4-048",
    "q": "Salt Bridge",
    "a": "The salt bridge is a conducting medium turned down U-shaped glass tube inside the tube there is an inert electrolyte solution which does not change chemically during the process. The solution contains ager substance (a natural , sticky substance). (it has different uses when heated it liquefies , it solidifies at room temperature) . Function: It is used to transfer the negative ions from the cathode solution to the anode solution and the positive ions from the anode solution to the cathode solution in order to equalize (balance) the concentrations. The salt bridge represents the internal circuit through which ions transfer. the compounds which are used while filling the salt bridge is K2SO4 , KCl , KNO3",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 22"
  },
  {
    "id": "CH4-051",
    "q": "The external wire",
    "a": "It is a metal wire that connects the anode Zn rod to the cathode Cu rod.\n\nFunction\nthrough it electrons transfer (pass) from anode to cathode. It represents the cell's external circuit.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 22"
  },
  {
    "id": "CH4-049",
    "q": "What is the importance (function) of the salt bridge and external wire in Daniel's cell?",
    "a": "1. It keeps the potential difference constant of the cell\n2. Completes the circuit\n3. Transfers ions between the two solutions\n\nExternal wire through it electrons transfer from anode to cathode",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 23"
  },
  {
    "id": "CH4-053",
    "q": "Electromotive force",
    "a": "it is shown (emf) symbol. It describes the potential between electrodes in the galvanic cell. It is expressed as cell potential (E0 cell). But here it refer to the measurement of force but potential.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 82"
  },
  {
    "id": "CH4-054",
    "q": "Cell potential depends not only on --------- , but also ------- and -------",
    "a": "1. Properties of electrode or ions\n2. Concentrations of ions\n3. Temperature",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 30"
  },
  {
    "id": "CH4-055",
    "q": "Among the Properties of the galvanic cell ------- and ---------",
    "a": "Spontaneous reactions'G value of its reactions is negative and the cell potential is positive\nChemical energy is converted into electrical\nIt contains a salt bridge\nLike Daniel cell, the Dry cell",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 30"
  },
  {
    "id": "CH4-057",
    "q": "Define reference electrode",
    "a": "is an electrode with Known standard potential used to measure other electrode potentials. There are different types of electrodes used as reference The most important is standard hydrogen electrode",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 25"
  },
  {
    "id": "CH4-058",
    "q": "What is a standard hydrogen electrode made of ? Then write Its reactions when it is anode once and when it is cathode another.",
    "a": "is made up of a glass tube. Into 1M solution (as HCl) containing H+ ions, hydrogen gas is pumped under 1 atm pressure and 25°C. At the bottom of the glass tube, a piece of platinum is placed. That piece of platinum is attached to a platinum wire. The reason why platinum is used with this kind of electrodes is that it never oxidizes or reduces under any conditions.\n\nH2(g) → 2H+(aq) + 2e-    E0 anode = (0) V\n2H+ + 2e- → H2          E0 cathode = (0) V",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 29"
  },
  {
    "id": "CH4-059",
    "q": "platinum is used to made Standard Hydrogen Electrodes?",
    "a": "Because it never oxidizes or reduces under any conditions.\n\nBut platinum performs two duties:\nA. It supplies a surface on which hydrogen molecules can dissociate.\nB. It supplies a method to conduct electricity through outer circuit.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 28–29"
  },
  {
    "id": "CH4-061",
    "q": "what is the importance of standard hydrogen electrode?",
    "a": "We can use standard hydrogen electrode to measure standard potentials of other electrodes. When this electrode is connected with any other electrode to set up a cell, the standard cell potential is equal to the sum of element’s standard electrode potential and standard hydrogen electrode potential. As (SHE) potential is equal to zero that means element’s standard electrode potential is equal to cell potential. Over this fundamental, standard oxidation potentials of elements were measured.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 26, 29"
  },
  {
    "id": "CH4-062",
    "q": "A standard electrode potential can't be measured by itself unless there is a reduction process at the same time.",
    "a": "Because it is impossible to have an oxidation process by itself without an accompanying reduction process.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 26"
  },
  {
    "id": "CH4-063",
    "q": "PH value of the hydrogen electrode solution decrease when it is anode",
    "a": "As it is oxidized, it gives H+ ions increasing thus acidity and decreasing PH (inverse proportion)",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 27"
  },
  {
    "id": "CH4-064",
    "q": "Knowing the reduction potential of two elements, which one is considered a stronger oxidizing agent?",
    "a": "the one with the greater reduction potential is considered a stronger oxidizing agent while the other is a less reduction potential is considered a stronger reducing agent or a weaker oxidizing agent.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 27"
  },
  {
    "id": "CH4-067",
    "q": "When the reduction or oxidation reaction is doubled, standard electrode potentials is not doubled ? Explain",
    "a": "Because potential is a characteristic property which does not depend on the amount of substance.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 51"
  },
  {
    "id": "CH4-075",
    "q": "Types of Electrodes",
    "a": "1. Metal Electrodes\n2. Gas Electrodes\n3. Oxidation-Reduction Electrodes",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 36–38"
  },
  {
    "id": "CH4-077",
    "q": "The expression of Galvanic cell By notation",
    "a": "To express by notation, on the left hand side , the reaction in anode in written. the reaction in cathode is written on the right hand side .between those two parallel vertical lines are drawn to express salt bridge in the cell",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 36–38"
  },
  {
    "id": "CH4-078",
    "q": "Reduction and oxidation electrodes",
    "a": "They are set up by dipping a graphite rod or platinum strip into a solution containing ions of an element which has double oxidation state. In this kind of reactions , as they do not conduct electricity just like gases ,a platinum strip needs to be immerse into the solution.While the electrode is expressed by writing ,the symbol of platinum ,Pt is written just as the gas electrode is expressed . As both ions are found in the same solution , a semicolon (;) is put between symbols of two ions.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 38"
  },
  {
    "id": "CH4-204",
    "q": "Explain there are some atomic groups that are inactive in this subject",
    "a": "as they do not participate in the oxidation and reduction processes like CH3COO-, CO3-2, NO3-, SO4-2",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 43"
  },
  {
    "id": "CH4-100",
    "q": "What is the Electrolyte cells ? what is its properties? And what it is used for?",
    "a": "These are cells which consume electricity. In these cells ,electrical energy is transformed into chemical energy.\n\nIts properties:\n1-its poles are from the same elements (graphite)\n2-Their reactions do not occur spontaneously ΔG = + and Eocell = -\n3-it doesn’t need a salt bridge\n4-for example electroplating cells\n5- They are widely used in industry. For example to purify metals and in electroplating.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 62"
  },
  {
    "id": "CH4-101",
    "q": "4-9 Tell the differences between a galvanic cell and an electrolysis cell",
    "a": "Galvanic cell\nChemical energy is converted into electrical\nSpontaneous reactions\nΔG value of its reactions is negative and the cell potential is positive\nIt contains a salt bridge\nThe released electrons are transferred from the atoms to the ions through the external conductive wire, while the ions are transferred between the two solutions by the salt bridge.\nLike Daniel cell, the Dry cell\n\nElectrolysis cell\nelectrical energy is converted into Chemical\nNon-spontaneous reactions\nΔG value of its reactions is positive and the cell potential is negative\nIt doesn't contain a salt bridge\nElectrons move from the external voltage source (battery) by positive and negative ions in the electrolytic solution or molten materials.\nLike the electroplating cell",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 60, 63"
  },
  {
    "id": "CH4-102",
    "q": "What is the electroplaring? And What does the quality of it depends on?",
    "a": "Electroplating is plating of a metal with another metal as a thin layer by electrolysis. This process is very important as it is used to protect metals from corrosion.\nThe quality of plating depends on\n1. voltage of electric current\n2. concentration of the plating metal",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 63"
  },
  {
    "id": "CH4-104",
    "q": "What does the electroplating cell made of? And What does the quality of it depends on?",
    "a": "Electroplating cell consists of anode and cathode cells. Anode includes metals like gold or silver which we choose as plating material.\nCathode is formed from spoon or alike which we want to plate.\nSalt solutions of plating metal is filled into the cell.\nThe quality of plating depends on\n1. voltage of electric current\n2. concentration of the plating metal",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 63"
  },
  {
    "id": "CH4-109",
    "q": "What are the applications of electrolytic cell in industry ?",
    "a": "1- used to protect metals from corrosion\n2- The dyeing of utensils , electrical hardware and appliances\n3- production of electric circuits\n4- purification of metals and production of some elements are other examples for reactions that use electrical energy",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 63"
  },
  {
    "id": "CH4-106",
    "q": "First Law",
    "a": "The mass of substance is precipitates on the cathode or melts at the anode or is released as gases at these electrodes are directly proportional to the amount of electric current passing through the electrolysis circuit.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 61, 64"
  },
  {
    "id": "CH4-107",
    "q": "Second Law",
    "a": "when equal amount of electric current passes, the mass of each substance at electrodes is directly proportional to their equivalent masses.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 61, 64"
  },
  {
    "id": "CH4-108",
    "q": "Question 4-2 Explain Faraday's equations and tell their units.",
    "a": "F = NA mol -1 × e- (c )\nF = 6.023 × 10^23 × 1.6 × 10^-19\nF = 96487 c/mol\nF = 96500 (c/mol)",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 82"
  },
  {
    "id": "CH4-144",
    "q": "The Cell Potential E, Gibbs Free Energy ΔG° and Equilibrium Constant Keq",
    "a": "ΔG = - n F Ecell\nΔG° = - n F E°cell",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 97–98"
  },
  {
    "id": "CH4-145",
    "q": "The relationship between ΔG°, Keq and E°cell",
    "a": "-RT ln Keq = -n F E°cell\nE°cell = RT/nF × ln Keq\nE°cell = 0.026/n ln Keq",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 98"
  },
  {
    "id": "CH4-146",
    "q": "If E°cell is positive",
    "a": "ΔG° is negative and the reaction is spontaneous. That it is preferred to make products. The value of Keq > 1",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 98"
  },
  {
    "id": "CH4-147",
    "q": "If the value of Keq = 1",
    "a": "E°cell = 0 and ΔG° = 0. That the reactant and product equally preferred",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 98"
  },
  {
    "id": "CH4-148",
    "q": "If the value of Keq < 1",
    "a": "E° is negative and ΔG° is positive and the reaction is non-spontaneous. It is preferred to make reactants.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 98"
  },
  {
    "id": "CH4-157",
    "q": "Nernst Equation",
    "a": "it is the equation that relates non-standard cell potential E cell (in which ingredient substances have concentrations different from 1M and at different temperatures) with standard cell potential E0 cell .",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 102"
  },
  {
    "id": "CH4-158",
    "q": "4-6 : write down the Nernst Equation with all its symbols.",
    "a": "Ecell = E°cell - RT/nF lnQ\n\nEcell = Non-standard cell potential\nE°cell = standard cell potential\nR = 8.314 j/k.mol\nn= moles number of lost or gained e- at the electrodes\nF = 96500 c/mol.e-\nQ = reaction quotient\nT = Temperature in (K) unit",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 103"
  },
  {
    "id": "CH4-159",
    "q": "When is E0 = Ecell ?",
    "a": "When the reactants and products are under standard conditions that is 1M Q is equal to 1 , So lnQ is equal to zero. The second part of Nernst equation is equal to zero therefore , Ecell = Eocell",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 103"
  },
  {
    "id": "CH4-160",
    "q": "At 25 C° Nernst equation become :",
    "a": "Ecell = E°cell - 0.026/n lnQ",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 103"
  },
  {
    "id": "CH4-181",
    "q": "A battery",
    "a": "Generally galvanic cells are called as batteries and divided into two : Rechargeable and non-rechargeable batteries .Generally consists of a few galvanic cells that are connected one after another. The total charge is equal to the sum of the charges of these cells.\n\nTheir types:\n1. primary batteries that are not rechargeable\n2. secondary batteries that are rechargeable",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 133"
  },
  {
    "id": "CH4-182",
    "q": "Lead Storage Battery (Accumulator)",
    "a": "is used in industry and to supply energy for many appliances and vehicles. It consists of lead galvanic cells that have potentials a little more than 2V. Every cell has got two poles:\n1. Anode: made up of lead\n2. Cathode: made up of lead oxide PbO\n\nThese two poles are immerse in sulfuric acid solution which is an electrolysis solution and has density between 1.2 g/mL and 1.3 g/ml .This battery consist of 3 or more cells and and works as a galvanic cell with a potential of 6V or 12V",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 134"
  },
  {
    "id": "CH4-186",
    "q": "Explain as long as the battery works, the density of sulfuric acid solution decreases",
    "a": "sulfuric acid is consumed as ions. So the amount of water increases and therefore the density of acid solution decreases.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 135"
  },
  {
    "id": "CH4-187",
    "q": "can we recharge the lead battery?",
    "a": "Pb,PbO2 and H2SO4 are formed again . By supplying an electric current opposite to the reaction in the battery, it can be recharged again. In this case it becomes a battery that consists of a group of electrolysis cells. PbSO4 decomposes at two poles and the density of acid returns to the original state.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 135"
  },
  {
    "id": "CH4-188",
    "q": "What is the anode and cathode of dry battery? And then mention its properties and uses?",
    "a": "This type of battery is made up of a zinc box works as anode filled with MnO2, carbon (graphite) and ammonium chloride (NH4Cl) wet paste.\n\nProperties :\n1. Their potential is 1.48 V\n2. Not rechargeable\n\nUse :\nThey are used in many appliances like radios, calculators, toys, etc.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 137"
  }
];
