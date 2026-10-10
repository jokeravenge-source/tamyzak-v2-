// Ahmed Al-Nadawi Chemistry CH4 — all 203 source questions and 27 worked practice problems.
// Source: docs/flashcards/ahmed-al-nadawi/Chapter_4_Electrochemistry_Complete_Study_Deck.txt.
// Printed exercise labels are not exam years; no verified ministerial years were supplied.
// Preserve source order (cards 202/203 follow 37), numerical values and source caveats.

export type AhmedNadawiChemCh4Card = {
  id: string;
  q: string;
  a: string;
  topic: string;
  kind: "source" | "practice";
  pages: string;
  sourceQuestion?: string;
  idea?: string;
};

export const ahmedNadawiChemCh4Source = {
  "file": "Chapter_4_Electrochemistry_Complete_Study_Deck.txt",
  "sourcePdf": "Chapter four.pdf",
  "pdfPages": 138,
  "sha256": "c9b922399ad06327f8790f3189802bb1b114ee6373a5a0512518bde5bd5d4650",
  "verifiedMinisterialYears": false,
  "importantNotes": "F = 96,500 C mol^-1 e^- ; N_A = 6.02 × 10^23 mol^-1 ; R = 8.314 J mol^-1 K^-1.\nQ_electric (C) = I(A) × t(s).  n(e^-) = Q_electric/F.\nAt 25°C, RT/F ≈ 0.026 V (natural-log form).  ln x = 2.303 log10 x.\nAt STP, molar gas volume ≈ 22.4 L/mol.  For other gas conditions use PV = nRT.\nFor an electrochemical reaction: E°cell = E°red,cathode − E°red,anode.\nAt 25°C: Ecell = E°cell − (0.026/n) ln Qreaction.\nΔG = −nFEcell, ΔG° = −nFE°cell, and E°cell = (0.026/n) ln Keq (at 25°C, as rounded in the PDF).",
  "accuracyNotes": "1. No official ministry-year labels were legible for these exercise IDs. Do not attach made-up ministry years to the questions; to verify genuine ministry provenance, a year-tagged official exam source is needed.\n2. The PDF repeatedly calls the galvanic anode 'positive' and galvanic cathode 'negative' (pp.18,21,30). That is incorrect for the usual DISCHARGING galvanic cell: its anode is negative and cathode positive. The universal accurate rule is oxidation at anode and reduction at cathode. For an electrolytic cell driven by an external supply, the anode is positive and cathode negative.\n3. Ni2+/Ni appears as both −0.24 V and −0.25 V (and at least one reproduced question appears to omit a negative sign). Select the potential explicitly supplied by each original problem; this changes E° answers by ~0.01 V.\n4. Some molar masses/species in the repeated series-cell exercise around p.78 are inconsistent (the example refers to AgNO3/CaCl2 but subsequently uses Cu; and 'Ag = 180 g/mol' is printed in one place). Preserve the correct species from the original question before calculating a numeric key. The worked practice problem P17 is internally consistent and is separately marked as new practice.\n5. Several Faraday examples round electron-moles too early. For example p.67 uses 0.9 mol electrons for 25 A × 1 h although the unrounded value with F = 96,500 is 0.9326 mol. Both the teacher-key rounded result and the accurate result are identified where helpful.\n6. In the Nernst/ΔG worked examples, some intermediate rounding causes ~0.001 V variations (notably p.132 Cd/Cu). Use the stated 0.026/n approximation consistently, or the full RT/nF expression, and state your convention.\n7. Garbled/rearranged characters occur in PDF extraction, especially Arabic overlay, mathematical superscripts, and a few printed problem statements. I have not manufactured missing numbers, missing questions, or years. When a literal source expression appeared inconsistent, the question was identified or the calculation was explained from readable data.\n8. This file is a consolidated study deck, not a certified verbatim transcript of every sentence. Exact page excerpts remain in the original PDF. Printed questions have been grouped by idea; repeated examples with distinct data have generally been kept."
} as const;

export const ahmedNadawiChemCh4Topics = [
  {
    "key": "01",
    "title": "Oxidation Numbers and Redox Reactions",
    "titleAr": "أعداد التأكسد وتفاعلات التأكسد والاختزال",
    "expectedCount": 39
  },
  {
    "key": "02",
    "title": "Galvanic Cells, Daniell Cell and Salt Bridge",
    "titleAr": "الخلايا الكلفانية وخلية دانيال والقنطرة الملحية",
    "expectedCount": 18
  },
  {
    "key": "03",
    "title": "Electrode Potential, SHE and Cell Notation",
    "titleAr": "جهود الأقطاب وقطب الهيدروجين القياسي والمخطط الخطي",
    "expectedCount": 44
  },
  {
    "key": "04",
    "title": "Electrolysis, Electroplating and Faraday Laws",
    "titleAr": "التحليل الكهربائي والطلاء الكهربائي وقانونا فاراداي",
    "expectedCount": 44
  },
  {
    "key": "05",
    "title": "Gibbs Free Energy and Equilibrium Constant",
    "titleAr": "طاقة غبس الحرة وثابت الاتزان",
    "expectedCount": 13
  },
  {
    "key": "06",
    "title": "Nernst Equation, Concentration and pH",
    "titleAr": "معادلة نرنست والتراكيز والأس الهيدروجيني",
    "expectedCount": 24
  },
  {
    "key": "07",
    "title": "Batteries and Fuel-Cell Source Notes",
    "titleAr": "البطاريات وملاحظات المصدر عن خلايا الوقود",
    "expectedCount": 11
  },
  {
    "key": "7B",
    "title": "Numerical Variants from the Final Review",
    "titleAr": "مسائل المراجعة النهائية ذات البيانات المختلفة",
    "expectedCount": 10
  },
  {
    "key": "08",
    "title": "Worked Practice — One Problem per Idea",
    "titleAr": "تطبيقات تدريبية محلولة لكل فكرة",
    "expectedCount": 27
  }
] as const;

export const ahmedNadawiChemCh4Cards: AhmedNadawiChemCh4Card[] = [
  {
    "id": "CH4-001",
    "q": "Define oxidation number.",
    "a": "The formal number indicating the electrical charge associated with an atom in a compound, used to track electron transfer.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3"
  },
  {
    "id": "CH4-002",
    "q": "What is the oxidation number of an element in its free state?",
    "a": "Zero, e.g., Na, H2, O2, and P4.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3–4"
  },
  {
    "id": "CH4-003",
    "q": "What is the oxidation number of a monatomic ion?",
    "a": "Its ionic charge: K+ = +1, Fe3+ = +3, O2− = −2.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3"
  },
  {
    "id": "CH4-004",
    "q": "What is the oxidation number of hydrogen, and what is its exception?",
    "a": "Usually +1; in metal hydrides such as NaH, it is −1.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3"
  },
  {
    "id": "CH4-005",
    "q": "What is the oxidation number of oxygen, and what is its exception?",
    "a": "Usually −2; in peroxides such as H2O2, it is −1.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 3"
  },
  {
    "id": "CH4-006",
    "q": "What are the usual oxidation numbers of Group IA, IIA, and IIIA elements in their compounds?",
    "a": "IA = +1; IIA = +2; IIIA = +3 (the values taught in the file).",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 4"
  },
  {
    "id": "CH4-007",
    "q": "What is the usual oxidation number of halogens in compounds?",
    "a": "−1 in the standard cases shown in the chapter.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 4"
  },
  {
    "id": "CH4-008",
    "q": "Calculate the oxidation number of sulfur in H2SO4.",
    "a": "2(+1) + S + 4(−2) = 0; S = +6.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 6"
  },
  {
    "id": "CH4-009",
    "q": "Calculate the oxidation number of phosphorus in PO4^3−.",
    "a": "P + 4(−2) = −3; P = +5.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 6"
  },
  {
    "id": "CH4-010",
    "q": "Calculate oxidation numbers in NaIO3, H2CO3, HPO4^2−, K2Cr2O7, MnO4−, BaO, F2, KCl, Mg2+, and SO2.",
    "a": "I in NaIO3 +5; C in H2CO3 +4; P in HPO4^2− +5; Cr in K2Cr2O7 +6; Mn in MnO4− +7; Ba +2/O −2 in BaO; F2 zero; K +1/Cl −1 in KCl; Mg2+ +2; S in SO2 +4. NOTE: the HPO4 charge is faint in extraction; apply the ion's displayed charge when studying from its printed page.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 6–7"
  },
  {
    "id": "CH4-011",
    "q": "Define electrochemistry.",
    "a": "The branch of chemistry studying transformations between chemical energy and electrical energy.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 7"
  },
  {
    "id": "CH4-012",
    "q": "Define oxidation–reduction (redox) reaction.",
    "a": "A reaction in which electrons transfer from one chemical species to another; oxidation and reduction occur together.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 7–8"
  },
  {
    "id": "CH4-013",
    "q": "Define oxidation. What happens to electrons and oxidation number?",
    "a": "Loss of electrons, with an increase in oxidation number; e.g., Na → Na+ + e−.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 8–9"
  },
  {
    "id": "CH4-014",
    "q": "Define reduction. What happens to electrons and oxidation number?",
    "a": "Gain of electrons, with a decrease in oxidation number; e.g., Cl2 + 2e− → 2Cl−.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 8–9"
  },
  {
    "id": "CH4-015",
    "q": "Can a reduction process occur without oxidation? Explain.",
    "a": "No. Electrons lost by one species must be gained by another species.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 9"
  },
  {
    "id": "CH4-016",
    "q": "On which side of a half-reaction are electrons written?",
    "a": "On the product side for oxidation and the reactant side for reduction.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 9"
  },
  {
    "id": "CH4-017",
    "q": "Identify oxidation and reduction and write half-reactions for Mg + Fe2+ → Mg2+ + Fe.",
    "a": "Oxidation: Mg → Mg2+ + 2e−. Reduction: Fe2+ + 2e− → Fe. Mg is oxidized; Fe2+ is reduced.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 10–11"
  },
  {
    "id": "CH4-018",
    "q": "Identify oxidation and reduction for Cl2 + 2I− → 2Cl− + I2.",
    "a": "Oxidation: 2I− → I2 + 2e−. Reduction: Cl2 + 2e− → 2Cl−.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 10"
  },
  {
    "id": "CH4-019",
    "q": "Write balanced half-reactions for 2Na + Cl2 → 2NaCl.",
    "a": "Oxidation: 2Na → 2Na+ + 2e−. Reduction: Cl2 + 2e− → 2Cl−. Equalize electron counts before addition.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 10"
  },
  {
    "id": "CH4-020",
    "q": "Identify the oxidized/reduced species in Zn + Cu2+ → Zn2+ + Cu.",
    "a": "Zn is oxidized; Cu2+ is reduced. Zn → Zn2+ + 2e−; Cu2+ + 2e− → Cu.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 11"
  },
  {
    "id": "CH4-021",
    "q": "For Mg + 2HCl → MgCl2 + H2, give both half-reactions.",
    "a": "Mg → Mg2+ + 2e− and 2H+ + 2e− → H2. Cl− is a spectator ion.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 11,16"
  },
  {
    "id": "CH4-022",
    "q": "How many electrons pass in Cu + 2Ag+ → Cu2+ + 2Ag?",
    "a": "2 mol of electrons per mole of the overall reaction: Cu → Cu2+ + 2e−; 2Ag+ + 2e− → 2Ag.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 11,16"
  },
  {
    "id": "CH4-023",
    "q": "How many electrons are exchanged in 3Fe + 2Au3+ → 3Fe2+ + 2Au?",
    "a": "Six electrons: 3Fe → 3Fe2+ + 6e− and 2Au3+ + 6e− → 2Au.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 16"
  },
  {
    "id": "CH4-024",
    "q": "Describe oxidation of metals, reduction of metals, oxidation of nonmetals, and reduction of nonmetals as presented in the chapter.",
    "a": "Metals oxidize by forming higher positive oxidation states and reduce by forming lower oxidation states/atoms. Nonmetal anions oxidize to elemental molecules, and molecular nonmetals reduce to anions. Hydrogen is discussed as an exception to the gas trend.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 12–13"
  },
  {
    "id": "CH4-025",
    "q": "Define reducing agent and state its properties.",
    "a": "A substance that causes another to be reduced while it itself is oxidized. It loses electrons and its oxidation number increases.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 13"
  },
  {
    "id": "CH4-026",
    "q": "Define oxidizing agent and state its properties.",
    "a": "A substance that causes another to be oxidized while it itself is reduced. It gains electrons and its oxidation number decreases.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 13,16"
  },
  {
    "id": "CH4-027",
    "q": "Identify oxidizing and reducing agents for Cu + 4HNO3 → Cu(NO3)2 + 2NO2 + 2H2O.",
    "a": "Cu is the reducing agent (0 → +2); nitrate nitrogen in HNO3 is reduced (+5 → +4 in NO2), so HNO3 is the oxidizing reactant.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 13"
  },
  {
    "id": "CH4-028",
    "q": "Identify oxidizing and reducing agents in AgNO2 + Cl2 + 2KOH → AgNO3 + 2KCl + H2O.",
    "a": "Cl2 is the oxidizing agent (0 → −1); AgNO2 is the reducing agent because N increases from +3 to +5.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 14",
    "sourceQuestion": "4-15"
  },
  {
    "id": "CH4-029",
    "q": "Identify the agents in Zn + CuSO4 → ZnSO4 + Cu.",
    "a": "Zn is the reducing agent; Cu2+ (in CuSO4) is the oxidizing agent.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 14"
  },
  {
    "id": "CH4-030",
    "q": "Identify the agents in Cu + 2AgNO3 → Cu(NO3)2 + 2Ag.",
    "a": "Cu is the reducing agent; Ag+ (in AgNO3) is the oxidizing agent.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 14"
  },
  {
    "id": "CH4-031",
    "q": "Identify the agents in 2C + O2 → 2CO.",
    "a": "C is the reducing agent (0 → +2); O2 is the oxidizing agent (0 → −2).",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 15–16"
  },
  {
    "id": "CH4-032",
    "q": "Identify the agents in Mg + Fe2+ → Mg2+ + Fe.",
    "a": "Mg is the reducing agent; Fe2+ is the oxidizing agent.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 15"
  },
  {
    "id": "CH4-033",
    "q": "Identify the agents in Mg + Cl2 → MgCl2.",
    "a": "Mg is the reducing agent; Cl2 is the oxidizing agent.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 15–16"
  },
  {
    "id": "CH4-034",
    "q": "Which are redox? (1) Al2O3 + HCl, (2) Na + Cl2, (3) KClO3 decomposes into KCl + O2, (4) SiBr4 hydrolysis, (5) Zn + CuSO4.",
    "a": "(2), (3), and (5). Oxidation states change in these reactions. The other listed reactions do not have net oxidation-state change.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 15",
    "sourceQuestion": "4-23"
  },
  {
    "id": "CH4-035",
    "q": "Identify the oxidizing and reducing agents in 2H2 + O2 → 2H2O.",
    "a": "H2 is the reducing agent; O2 is the oxidizing agent.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 16"
  },
  {
    "id": "CH4-036",
    "q": "Define oxidation potential.",
    "a": "The tendency of a substance to lose electrons.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 16"
  },
  {
    "id": "CH4-037",
    "q": "Give three characteristic facts about a reducing agent.",
    "a": "It is itself oxidized, it loses electrons, and its oxidation number increases.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 16–17"
  },
  {
    "id": "CH4-202",
    "q": "What must the sum of all oxidation numbers be in a neutral compound?",
    "a": "Zero. Example: in H2SO4, 2(+1) + S + 4(−2) = 0, so S = +6.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 5–6"
  },
  {
    "id": "CH4-203",
    "q": "What must the sum of all oxidation numbers equal in a polyatomic ion?",
    "a": "The net ionic charge. Example: in PO4^3−, P + 4(−2) = −3, so P = +5.",
    "topic": "01",
    "kind": "source",
    "pages": "PDF 5–6"
  },
  {
    "id": "CH4-038",
    "q": "Define an electrochemical cell and name its two main classes.",
    "a": "A system containing electrodes and an electrolyte where oxidation and reduction occur; classes: galvanic/voltaic cells and electrolytic cells.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 18"
  },
  {
    "id": "CH4-039",
    "q": "At which electrode does oxidation occur? At which does reduction occur?",
    "a": "Oxidation occurs at the anode; reduction occurs at the cathode, in either kind of cell.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 18"
  },
  {
    "id": "CH4-040",
    "q": "Define a galvanic (voltaic) cell.",
    "a": "A cell that converts energy from a spontaneous redox reaction into electrical energy.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 20"
  },
  {
    "id": "CH4-041",
    "q": "What happens when a zinc rod is placed in copper(II) sulfate solution?",
    "a": "Zinc dissolves as Zn2+ (oxidation); copper metal deposits as a brownish layer (Cu2+ reduction); the solution's blue color fades as Cu2+ is consumed. Zn + Cu2+ → Zn2+ + Cu.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 19"
  },
  {
    "id": "CH4-042",
    "q": "When does this spontaneous Zn/Cu2+ reaction stop?",
    "a": "When the reactive zinc or available copper ions are exhausted, as described in the chapter.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 20"
  },
  {
    "id": "CH4-043",
    "q": "State the four main components of a Daniell cell.",
    "a": "Zinc anode in ZnSO4, copper cathode in CuSO4, connecting external wire, and salt bridge.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 20"
  },
  {
    "id": "CH4-044",
    "q": "Write the two Daniell cell half-reactions and overall reaction.",
    "a": "Anode: Zn → Zn2+ + 2e−. Cathode: Cu2+ + 2e− → Cu. Overall: Zn + Cu2+ → Zn2+ + Cu.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 20–21"
  },
  {
    "id": "CH4-045",
    "q": "Compare the physical changes at zinc and copper electrodes in Daniell cell.",
    "a": "Zinc rod becomes thinner and its ion concentration rises; copper rod becomes thicker as Cu2+ concentration declines. Electrons leave zinc and reach copper through the wire.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 21"
  },
  {
    "id": "CH4-046",
    "q": "Why keep the Daniell cell half-cells in separate vessels?",
    "a": "To force electrons to travel through the external circuit instead of allowing Cu2+ to react directly on zinc.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 21"
  },
  {
    "id": "CH4-047",
    "q": "Why were zinc and copper selected for the Daniell cell in the chapter?",
    "a": "They provide a useful potential difference (about 1.10 V under the supplied standard data).",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 21"
  },
  {
    "id": "CH4-048",
    "q": "Define a salt bridge and name salts used to fill it.",
    "a": "A U-shaped conducting electrolyte connector, commonly containing inert electrolyte such as KNO3, KCl, or K2SO4 (and agar medium in the discussion).",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 22–23"
  },
  {
    "id": "CH4-049",
    "q": "State the functions of the salt bridge.",
    "a": "Completes the internal ionic circuit, prevents charge buildup, and maintains electroneutrality in both half-cells.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 22–23"
  },
  {
    "id": "CH4-050",
    "q": "In a KNO3 salt bridge connecting Cu/Ag half-cells, where do K+ and NO3− travel?",
    "a": "K+ migrates toward the cathode; NO3− migrates toward the anode.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 21–23"
  },
  {
    "id": "CH4-051",
    "q": "What is the role of the external wire?",
    "a": "It carries electrons from the anode to the cathode, completing the external circuit.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 23"
  },
  {
    "id": "CH4-052",
    "q": "For Cu + 2Ag+ → Cu2+ + 2Ag, specify both half-reactions and electron flow.",
    "a": "Cu → Cu2+ + 2e− (anode); 2Ag+ + 2e− → 2Ag (cathode). Electrons flow Cu → Ag through the wire; anions migrate to the anode and cations to the cathode through the salt bridge.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 23"
  },
  {
    "id": "CH4-053",
    "q": "Define cell potential / EMF and give its unit.",
    "a": "Potential difference between the cell's electrodes, measured in volts (V), and often called electromotive force, emf.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 24,30"
  },
  {
    "id": "CH4-054",
    "q": "List factors on which cell potential depends.",
    "a": "Electrode/ion properties, ion concentrations, temperature, and electrode reactions.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 24"
  },
  {
    "id": "CH4-055",
    "q": "Give the signs of ΔG and Ecell in a spontaneous galvanic reaction.",
    "a": "ΔG < 0 and Ecell > 0.",
    "topic": "02",
    "kind": "source",
    "pages": "PDF 30"
  },
  {
    "id": "CH4-056",
    "q": "Define reduction potential and oxidation potential.",
    "a": "Reduction potential reflects tendency to gain electrons; oxidation potential reflects tendency to lose electrons.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 24–25"
  },
  {
    "id": "CH4-057",
    "q": "Define a reference electrode.",
    "a": "An electrode with assigned/known potential used to compare other electrode potentials.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 25"
  },
  {
    "id": "CH4-058",
    "q": "Describe standard hydrogen electrode (SHE) construction and standard conditions.",
    "a": "A platinum/black-Pt electrode in a 1 M H+ solution with H2 gas at 1 atm and 25°C; E°(2H+/H2) = 0.00 V.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 25–26,29"
  },
  {
    "id": "CH4-059",
    "q": "Why is platinum used in SHE?",
    "a": "It is inert under the described conditions, provides a surface for H2 reactions, and conducts electrons.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 25,29"
  },
  {
    "id": "CH4-060",
    "q": "Write SHE half-reactions when acting as anode and cathode.",
    "a": "As anode: H2 → 2H+ + 2e−. As cathode: 2H+ + 2e− → H2. Both have assigned standard potential 0 V.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 26"
  },
  {
    "id": "CH4-061",
    "q": "What is the importance of SHE?",
    "a": "It is the zero-potential reference for measuring relative standard electrode potentials.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 26–29"
  },
  {
    "id": "CH4-062",
    "q": "Why cannot a single standard electrode potential be measured by itself?",
    "a": "An oxidation half-reaction cannot occur independently of a reduction half-reaction; a reference electrode is needed.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 26"
  },
  {
    "id": "CH4-063",
    "q": "How does pH change when a hydrogen electrode operates as anode in the described setup?",
    "a": "H2 oxidizes to H+, so [H+] rises and pH decreases.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 27"
  },
  {
    "id": "CH4-064",
    "q": "Which of two species with different E°reduction has stronger oxidizing tendency?",
    "a": "The one with the higher (more positive) standard reduction potential.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 27,31"
  },
  {
    "id": "CH4-065",
    "q": "How do you choose anode and cathode using standard reduction potentials?",
    "a": "The lower E°reduction species is used as oxidation/anode; the higher E°reduction species is reduction/cathode for the spontaneous cell.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 31–32"
  },
  {
    "id": "CH4-066",
    "q": "What is the standard cell potential formula?",
    "a": "E°cell = E°reduction(cathode) − E°reduction(anode), or E°oxidation(anode) + E°reduction(cathode).",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 31–32"
  },
  {
    "id": "CH4-067",
    "q": "Why are E° values NOT multiplied by stoichiometric coefficients?",
    "a": "Electrode potential is an intensive property; balance electrons in half-reactions, not the electrode potentials.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 31–32,51"
  },
  {
    "id": "CH4-068",
    "q": "What does positive or negative E°cell indicate?",
    "a": "Positive: forward reaction is spontaneous under standard conditions. Negative: forward reaction is nonspontaneous under standard conditions.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 32"
  },
  {
    "id": "CH4-069",
    "q": "Find Daniell cell standard potential if E°Cu2+/Cu = +0.34 V and E°Zn2+/Zn = −0.76 V.",
    "a": "E°cell = 0.34 − (−0.76) = +1.10 V.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 33"
  },
  {
    "id": "CH4-070",
    "q": "A standard hydrogen anode and copper cathode form a cell with E°cell = +0.337 V. Find copper's E°reduction.",
    "a": "+0.337 V (the SHE reference potential is zero).",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 33",
    "sourceQuestion": "4-4"
  },
  {
    "id": "CH4-071",
    "q": "Find E°cell for Cd2+/Cd = −0.40 V and Cr2+/Cr = −0.74 V.",
    "a": "Cd is cathode and Cr anode; E°cell = −0.40 − (−0.74) = +0.34 V. [The file inconsistently labels chromium ion charge elsewhere; follow the given reaction data.]",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 34",
    "sourceQuestion": "4-5"
  },
  {
    "id": "CH4-072",
    "q": "What is E°cell for standard Al/Al3+ and Cu2+/Cu, given −1.66 V and +0.34 V?",
    "a": "0.34 − (−1.66) = +2.00 V; spontaneous in the Al oxidation / Cu2+ reduction direction.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 34"
  },
  {
    "id": "CH4-073",
    "q": "In Daniell cell E°cell = 1.10 V and E°Zn2+/Zn = −0.76 V. Find Cu reduction and Cu oxidation potentials.",
    "a": "E°Cu2+/Cu = +0.34 V, and the reverse oxidation potential Cu/Cu2+ = −0.34 V.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 35"
  },
  {
    "id": "CH4-074",
    "q": "Does Ni + Co2+ → Ni2+ + Co occur spontaneously if E°Ni2+/Ni = −0.25 and E°Co2+/Co = −0.28 V?",
    "a": "No. E°cell = (−0.28) − (−0.25) = −0.03 V.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 35"
  },
  {
    "id": "CH4-075",
    "q": "List three electrode types described in the chapter.",
    "a": "Metal/metal-ion electrodes, gas/ion electrodes with an inert conductor (usually Pt), and redox electrodes with two oxidation states in solution and an inert Pt/graphite conductor.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 36–38"
  },
  {
    "id": "CH4-076",
    "q": "Write Daniell cell line notation under standard conditions.",
    "a": "Zn(s) | Zn2+(1 M) || Cu2+(1 M) | Cu(s).",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 36,50"
  },
  {
    "id": "CH4-077",
    "q": "Explain the symbols '|' and '||' in cell notation.",
    "a": "'|' separates phases/interfaces; '||' represents the salt bridge/liquid junction. Conventionally write anode to the left and cathode to the right.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 37–38"
  },
  {
    "id": "CH4-078",
    "q": "Why is Pt included in gas and soluble redox electrode notation?",
    "a": "It provides an inert conducting surface when no solid conducting reactant is present.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 37–38"
  },
  {
    "id": "CH4-079",
    "q": "Express Cl2 + 2Ag → 2Cl− + 2Ag+ by standard cell notation.",
    "a": "Ag(s) | Ag+(1 M) || Cl−(1 M) | Cl2(1 atm) | Pt.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 37–38"
  },
  {
    "id": "CH4-080",
    "q": "Express Zn + 2H+ → Zn2+ + H2 by standard cell notation.",
    "a": "Zn(s) | Zn2+(1 M) || H+(1 M) | H2(1 atm) | Pt.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 38"
  },
  {
    "id": "CH4-081",
    "q": "In Zn + 2Fe3+ → Zn2+ + 2Fe2+ with E°cell = 1.53 V and E°Fe3+/Fe2+ = +0.77 V, find E°Zn2+/Zn and line notation.",
    "a": "E°oxidation(Zn) = 1.53 − 0.77 = +0.76 V, so E°Zn2+/Zn = −0.76 V. Zn | Zn2+ || Fe3+,Fe2+ | Pt (standard concentrations).",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 38"
  },
  {
    "id": "CH4-082",
    "q": "Is 3Fe + 2Au3+ → 3Fe2+ + 2Au spontaneous if E°Fe2+/Fe = −0.44 V, E°Au3+/Au = +1.50 V?",
    "a": "Yes. E°cell = 1.50 − (−0.44) = +1.94 V. Notation: Fe | Fe2+ || Au3+ | Au.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 39"
  },
  {
    "id": "CH4-083",
    "q": "Determine spontaneity of Pt | Fe2+,Fe3+ || Br− | Br2 | Pt, using E°Br2/Br− = 1.07 V and E°Fe3+/Fe2+ = 0.77 V.",
    "a": "Fe2+ oxidizes and Br2 reduces; E°cell = 1.07 − 0.77 = +0.30 V, spontaneous in that direction.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 40",
    "sourceQuestion": "4-13"
  },
  {
    "id": "CH4-084",
    "q": "In Al | Al3+ || Cd2+ | Cd, E°cell = 1.26 V and E°Cd2+/Cd = −0.40 V. Find E°Al3+/Al.",
    "a": "E°Al3+/Al = −1.66 V. E°oxidation(Al) = +1.66 V.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 40–41",
    "sourceQuestion": "4-28"
  },
  {
    "id": "CH4-085",
    "q": "Given the same Al/Cd cell, E°cell = 1.26 V and E°oxidation(Al) = +1.66 V, find Cd potentials.",
    "a": "E°reduction(Cd2+/Cd) = −0.40 V, E°oxidation(Cd/Cd2+) = +0.40 V.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 41"
  },
  {
    "id": "CH4-086",
    "q": "Which two electrodes give maximum E°cell from Al3+/Al −1.66, Zn2+/Zn −0.76, F2/F− +2.87, Pb2+/Pb −0.13 V?",
    "a": "Aluminum anode and fluorine cathode. E°cell = 2.87 − (−1.66) = +4.53 V; Al | Al3+ || F− | F2 | Pt.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 41–42"
  },
  {
    "id": "CH4-087",
    "q": "Can NaCl solution be kept in a copper vessel according to the standard-potential test used in the chapter? E°Na+/Na = −2.70, E°Cu2+/Cu = +0.34 V.",
    "a": "The tested Cu + 2Na+ → Cu2+ + 2Na has E°cell = −3.04 V, so the chapter calls it nonspontaneous and suitable to keep.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 42,52"
  },
  {
    "id": "CH4-088",
    "q": "Can CuSO4 solution be kept in a nickel vessel? E°Ni2+/Ni = −0.24 V, E°Cu2+/Cu = +0.34 V.",
    "a": "No; Ni + Cu2+ → Ni2+ + Cu, E°cell = 0.34 − (−0.24) = +0.58 V, spontaneous. Other pages use −0.25 V, yielding +0.59 V; values differ in the file.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 43",
    "sourceQuestion": "'17-4'"
  },
  {
    "id": "CH4-089",
    "q": "Can Co(NO3)2 solution be kept in zinc or copper, given E°Zn2+/Zn = −0.76, E°Cu2+/Cu = +0.34, E°Co2+/Co = −0.28 V?",
    "a": "In zinc: E°cell = (−0.28) − (−0.76) = +0.48 V; not suitable. In copper: E°cell = (−0.28) − (+0.34) = −0.62 V; suitable in the chapter's test.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 43–44"
  },
  {
    "id": "CH4-090",
    "q": "Which metal among Al and Au can liberate H2 from H+ under the stated standard potentials?",
    "a": "Aluminum, because E°Al3+/Al = −1.66 V and E°H+/H2 = 0.00 V, giving +1.66 V for Al oxidation with H+ reduction.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 46",
    "sourceQuestion": "4-12"
  },
  {
    "id": "CH4-091",
    "q": "Can copper metal deposit Zn from a standard Zn2+ solution? (E°Cu2+/Cu = +0.34, E°Zn2+/Zn = −0.76 V.)",
    "a": "No; Cu + Zn2+ → Cu2+ + Zn gives E°cell = −0.76 − (+0.34) = −1.10 V.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 46"
  },
  {
    "id": "CH4-092",
    "q": "Does 1 M HCl dissolve Ag spontaneously? E°Ag+/Ag = +0.80 V.",
    "a": "No. 2Ag + 2H+ → 2Ag+ + H2 gives E°cell = 0 − 0.80 = −0.80 V.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 47",
    "sourceQuestion": "4-8"
  },
  {
    "id": "CH4-093",
    "q": "Write line notation for Fe + Sn2+ → Fe2+ + Sn.",
    "a": "Fe(s) | Fe2+(1 M) || Sn2+(1 M) | Sn(s).",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 50–54"
  },
  {
    "id": "CH4-094",
    "q": "Is Ag | Ag+ || Zn2+ | Zn a correctly oriented notation for a spontaneous standard cell (E°Ag+/Ag = +0.80, E°Zn2+/Zn = −0.76 V)?",
    "a": "No. In the written direction E°cell = −0.76 − (+0.80) = −1.56 V; reverse the halves for a spontaneous cell.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 50–54"
  },
  {
    "id": "CH4-095",
    "q": "Can silver or copper be dissolved by hydrogen ions in the simple standard-potential test?",
    "a": "The file obtains E°cell = −0.80 V for Ag/H+ and −0.34 V for Cu/H+, so not spontaneously in the stated idealized model.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 50–55"
  },
  {
    "id": "CH4-096",
    "q": "Can CuSO4 be stored in an aluminium cup?",
    "a": "No; Al + Cu2+ redox is spontaneous, E°cell = +2.00 V under the provided potentials.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 52"
  },
  {
    "id": "CH4-097",
    "q": "Can NaCl solution be stored in a silver or aluminium cup in the chapter's hypothetical standard test?",
    "a": "Ag gives E°cell = −3.50 V (0.80 vs −2.70); Al gives E°cell = −1.04 V (−1.66 vs −2.70): both proposed metal/Na+ displacement directions are nonspontaneous.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 50–52"
  },
  {
    "id": "CH4-098",
    "q": "Determine spontaneity of 2Cr + 3Zn2+ → 2Cr3+ + 3Zn, if E°Cr3+/Cr = −0.74 V and E°Zn2+/Zn = −0.76 V.",
    "a": "E°cell = −0.76 − (−0.74) = −0.02 V: nonspontaneous in the written direction.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 52–53"
  },
  {
    "id": "CH4-099",
    "q": "Why may an equation be written with anode and cathode opposite from the preferred pair based on potentials?",
    "a": "When the question specifies a reaction or a notation, determine oxidation/reduction from that direction first; the computed E°cell will reveal if the direction is nonspontaneous.",
    "topic": "03",
    "kind": "source",
    "pages": "PDF 54"
  },
  {
    "id": "CH4-100",
    "q": "Define an electrolytic cell.",
    "a": "A cell that uses electrical energy to drive a nonspontaneous chemical reaction; electrical energy is converted into chemical energy.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 59–60"
  },
  {
    "id": "CH4-101",
    "q": "Compare galvanic and electrolytic cells.",
    "a": "Galvanic: spontaneous, chemical → electrical, Ecell positive/ΔG negative for the reaction, e.g., Daniell cell. Electrolytic: externally driven, electrical → chemical, forward reaction nonspontaneous without power, e.g., electroplating. Oxidation remains at anode and reduction at cathode in both.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 59–60",
    "sourceQuestion": "4-9"
  },
  {
    "id": "CH4-102",
    "q": "Define electroplating and give its uses.",
    "a": "Depositing a thin layer of one metal onto another using electrolysis; used to coat surfaces and improve appearance or protection.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 60–63"
  },
  {
    "id": "CH4-103",
    "q": "What two factors does the chapter name as controlling electroplating quality?",
    "a": "Applied voltage/current conditions and concentration of the metal ions in the electroplating solution.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 61–63"
  },
  {
    "id": "CH4-104",
    "q": "At which electrode does plating occur?",
    "a": "The cathode, where dissolved metal ions gain electrons and deposit as metal.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 61–63"
  },
  {
    "id": "CH4-105",
    "q": "How is the plating metal replenished in a typical soluble-anode electroplating cell?",
    "a": "The metal anode dissolves by oxidation; metal ions deposit at the cathode.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 61–63"
  },
  {
    "id": "CH4-106",
    "q": "State Faraday's first law.",
    "a": "The mass deposited, dissolved, or released at an electrode is directly proportional to the quantity of charge that passes through the cell, for the same half-reaction.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 64,82",
    "sourceQuestion": "4-2"
  },
  {
    "id": "CH4-107",
    "q": "State Faraday's second law.",
    "a": "For an equal quantity of electrical charge, the masses of substances deposited or released are proportional to their chemical equivalent masses (molar mass divided by electrons per ion/molecule).",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 64,84"
  },
  {
    "id": "CH4-108",
    "q": "Derive the approximate Faraday constant and its unit.",
    "a": "F = N_A × |charge of one electron| ≈ (6.023 × 10^23 mol−1)(1.6 × 10−19 C) ≈ 96,500 C per mole of electrons.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 64,82",
    "sourceQuestion": "4-2"
  },
  {
    "id": "CH4-109",
    "q": "Define electric current (I), electric charge (Q), and units.",
    "a": "I is current in amperes (A); Q is charge in coulombs (C). Q = It when time is measured in seconds.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 64–65"
  },
  {
    "id": "CH4-110",
    "q": "Express the amount of electrons in moles from current and time.",
    "a": "n(e−) = It/F.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 65"
  },
  {
    "id": "CH4-111",
    "q": "How do you calculate the deposited mass from electrons passed?",
    "a": "n(metal) = It/(zF), then m = MIt/(zF), where z is electrons per atom/ion and M is molar mass.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 65–66"
  },
  {
    "id": "CH4-112",
    "q": "How do you convert deposited moles into number of atoms?",
    "a": "Number of atoms = n × N_A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 65–66"
  },
  {
    "id": "CH4-113",
    "q": "How do you find gas amount during electrolysis under non-STP conditions?",
    "a": "PV = nRT using consistent units, then convert gas moles into electron moles from the balanced half-reaction.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 65–66"
  },
  {
    "id": "CH4-114",
    "q": "What gas relationship is used for electrolysis of water?",
    "a": "2H2O → 2H2 + O2; hydrogen and oxygen gas have a 2:1 mole and volume ratio under the same temperature and pressure.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 65–66"
  },
  {
    "id": "CH4-115",
    "q": "How is electric charge allocated when two products compete at one electrode?",
    "a": "Total electron-moles = electron-moles used for product 1 + electron-moles used for product 2; subtract one known part to find the other.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 65–66"
  },
  {
    "id": "CH4-116",
    "q": "For Mg2+ + 2e− → Mg, what mass and number of atoms deposit at 25 A for 1 hour (M = 24 g/mol)?",
    "a": "Q = 25 × 3600 = 90,000 C; n(e−) ≈ 0.933 mol; n(Mg) ≈ 0.466 mol; mass ≈ 11.19 g; atoms ≈ 2.81 × 10^23. IMPORTANT: the PDF rounds charge to 0.9 mol e− and therefore reports about 10.8 g and 2.7 × 10^23 atoms; use its rounded-answer convention if matching the teacher's key.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 67",
    "sourceQuestion": "4-9"
  },
  {
    "id": "CH4-117",
    "q": "Find current to deposit 3 g Au from AuCl3 in 200 s (M_Au = 197 g/mol).",
    "a": "Au3+ + 3e− → Au. I = (3/197)(3)(96500)/200 ≈ 22.04 A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 68",
    "sourceQuestion": "4-13"
  },
  {
    "id": "CH4-118",
    "q": "In 600 mL of 0.2 M CuSO4, how long at 96.5 A to leave 0.03 mol Cu2+?",
    "a": "Initial Cu2+ = 0.12 mol; Cu to deposit = 0.12 − 0.03 = 0.09 mol; n(e−) = 0.18 mol; t = 0.18 × 96500/96.5 = 180 s.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 69",
    "sourceQuestion": "4-14"
  },
  {
    "id": "CH4-119",
    "q": "For 0.08 L O2 at 25°C and 755 mmHg, determine electron moles from 2H2O → O2 + 4H+ + 4e−.",
    "a": "n(O2) = PV/RT ≈ (755/760 × 0.08)/(0.08206 × 298) ≈ 0.00325 mol, so n(e−) ≈ 0.0130 mol. The chapter gives the rounded figure 0.012 mol e−; it rounds the gas moles to 0.003.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 70",
    "sourceQuestion": "4-10"
  },
  {
    "id": "CH4-120",
    "q": "For 0.06 L O2 at 25°C and 750 mmHg, find electrons in moles for water oxidation.",
    "a": "n(O2) ≈ 0.00242 mol; n(e−) ≈ 0.00969 mol. The source rounds to n(O2) ≈ 0.002 and 0.008 mol e−.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 71"
  },
  {
    "id": "CH4-121",
    "q": "10 A flows through CuSO4 for 965 s. Find copper mass and atoms (M_Cu = 63 g/mol).",
    "a": "n(e−) = 0.10 mol; n(Cu) = 0.05 mol; m(Cu) = 3.15 g; atoms = 0.05 × 6.02 × 10^23 = 3.01 × 10^22.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 72",
    "sourceQuestion": "4-31"
  },
  {
    "id": "CH4-122",
    "q": "A monovalent metal deposits 0.648 g when 3 A flows for 3 min 13 s. Find molar mass.",
    "a": "Time = 193 s; n(e−) = 3 × 193/96500 = 0.006 mol; n(metal) = 0.006 mol; M = 0.648/0.006 = 108 g/mol.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 73",
    "sourceQuestion": "4-32"
  },
  {
    "id": "CH4-123",
    "q": "How many electrons release twice the molar volume of O2 at STP?",
    "a": "O2 volume = 44.8 L → n(O2) = 2 mol; n(e−) = 8 mol; number electrons = 8 × 6.02 × 10^23 = 4.816 × 10^24.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 74",
    "sourceQuestion": "4-33"
  },
  {
    "id": "CH4-124",
    "q": "How many electrons release half the molar volume of O2 at STP?",
    "a": "O2 = 0.5 mol → n(e−) = 2 mol → 1.204 × 10^24 electrons.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 74"
  },
  {
    "id": "CH4-125",
    "q": "In water electrolysis, 36.12 × 10^21 total H2 and O2 molecules are evolved in 2 h + 520 s. Find current.",
    "a": "Total gas units split 2 H2 : 1 O2. O2 molecules = 12.04 × 10^21 → 0.0200 mol O2; n(e−) = 0.0800 mol; time = 7720 s; I = 0.0800 × 96500/7720 = 1.00 A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 75",
    "sourceQuestion": "4-34"
  },
  {
    "id": "CH4-126",
    "q": "What if total hydrogen + oxygen molecules = 27.09 × 10^21 in the same 7720 s?",
    "a": "Oxygen molecules = 9.03 × 10^21 → 0.015 mol O2; n(e−) = 0.060 mol; I = 0.75 A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 75"
  },
  {
    "id": "CH4-127",
    "q": "How much aluminium deposits after one faraday passes through Al3+ solution (M_Al = 27)?",
    "a": "One mole of electrons deposits 1/3 mol Al; mass = 27/3 = 9 g.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 76"
  },
  {
    "id": "CH4-128",
    "q": "A 10 A plating cell operates 9.65 s with 75% current efficiency; what mass Au3+ → Au plates (M = 197)?",
    "a": "Effective electron-moles = (10 × 9.65/96500) × 0.75 = 0.00075 mol; Au = 0.00025 mol; mass = 0.04925 g ≈ 0.05 g.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 76"
  },
  {
    "id": "CH4-129",
    "q": "Electrolysis of water at STP produces 0.0672 L total H2 + O2 in 193 s. Find each gas volume and current.",
    "a": "H2 = 0.0448 L, O2 = 0.0224 L (2:1); n(O2) = 0.001 mol; n(e−) = 0.004 mol; I = 0.004 × 96500/193 = 2 A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 77"
  },
  {
    "id": "CH4-130",
    "q": "How is charge treated when two electrolytic cells are connected in series?",
    "a": "The same electrical charge passes each series cell; moles of products differ with electron number and molar mass. CAUTION: This particular printed example mixes chemical species/atomic masses (AgNO3/CaCl2 versus copper), so its numerical key is not reliable as printed.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 78"
  },
  {
    "id": "CH4-131",
    "q": "0.20 mol electrons pass through CuSO4; 0.448 L H2 evolves at STP; how much copper deposits (M_Cu = 63 g/mol)?",
    "a": "H2 moles = 0.02, consuming 0.04 mol e−. Cu uses 0.20 − 0.04 = 0.16 mol e−, corresponding to 0.08 mol Cu or 5.04 g.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 79"
  },
  {
    "id": "CH4-132",
    "q": "How much current deposits 3 g copper from CuSO4 (M = 63) in 482.5 s?",
    "a": "I = (3/63)(2)(96500)/482.5 ≈ 19.05 A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 84–85"
  },
  {
    "id": "CH4-133",
    "q": "Find current needed to deposit 2 g Au in 180 s (Au3+, M = 197).",
    "a": "I = (2/197)(3)(96500)/180 ≈ 16.33 A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 84–85"
  },
  {
    "id": "CH4-134",
    "q": "How much current deposits 5 g Au from Au3+ in one hour?",
    "a": "I = (5/197)(3)(96500)/3600 ≈ 2.04 A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 85,71"
  },
  {
    "id": "CH4-135",
    "q": "How long is needed at 96.5 A to lower Cu2+ from 0.15 mol to 0.03 mol?",
    "a": "Deposited Cu = 0.12 mol → electron-moles 0.24 mol → t = 0.24 × 96500/96.5 = 240 s.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 86–87"
  },
  {
    "id": "CH4-136",
    "q": "At 96.5 A, for 0.24 M CuSO4 in 0.5 L, how long to leave 0.04 mol Cu2+?",
    "a": "Initially 0.12 mol; deposit 0.08 mol; 0.16 mol e−; t = 160 s.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 87–88"
  },
  {
    "id": "CH4-137",
    "q": "What deposit corresponds to 3.01 × 10^23 electrons in a Cu2+ cathode?",
    "a": "Electrons = 0.50 mol; copper = 0.25 mol; with M_Cu = 63 g/mol, mass = 15.75 g. (The calculation concept also appears among supplemental problems.)",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 88–89"
  },
  {
    "id": "CH4-138",
    "q": "After 0.10 mol electrons pass through CuSO4 and 0.224 L H2 evolves at STP, find Cu deposited (M = 63).",
    "a": "H2 = 0.01 mol; charge used for H2 = 0.02 mol e−; charge for Cu = 0.08 mol e−; Cu = 0.04 mol = 2.52 g.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 94–95"
  },
  {
    "id": "CH4-139",
    "q": "How much gold deposits from Au3+ when 8 g Au are requested in 30 min; calculate the current (M_Au = 197)?",
    "a": "I = (8/197)(3)(96500)/1800 ≈ 6.53 A. The source rounds an intermediate number to 0.12 mol e− and reports ~6.43 A; the unrounded calculation is ~6.53 A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 95–96"
  },
  {
    "id": "CH4-140",
    "q": "At 96.5 A, how long to go from 0.18 M CuSO4 × 400 mL to 0.04 mol Cu2+ remaining?",
    "a": "Initial amount 0.072 mol; deposit 0.032 mol Cu; n(e−) = 0.064 mol; time = 64 s.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 95–96"
  },
  {
    "id": "CH4-141",
    "q": "At 96.5 A, how long for 0.3 M CuSO4 × 400 mL to leave 0.02 mol Cu2+?",
    "a": "Initial amount 0.12 mol; deposit 0.10 mol; electrons 0.20 mol; time = 200 s.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 95"
  },
  {
    "id": "CH4-142",
    "q": "With Al3+ + 3e− → Al, 25 A for 1 h, find mass and number of aluminium atoms (M = 27).",
    "a": "n(e−) = 90000/96500 ≈ 0.9326; n(Al) = 0.3109; mass ≈ 8.39 g; atoms ≈ 1.87 × 10^23.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 96"
  },
  {
    "id": "CH4-143",
    "q": "How much current deposits 3.94 g Au3+ → Au in 300 s (M = 197)?",
    "a": "Au = 0.020 mol; electrons = 0.060 mol; I = 0.060 × 96500/300 = 19.3 A.",
    "topic": "04",
    "kind": "source",
    "pages": "PDF 96"
  },
  {
    "id": "CH4-144",
    "q": "What is the relation between Gibbs free energy and cell potential?",
    "a": "ΔG = −nFE and ΔG° = −nFE°. n is electrons transferred (in mole-equivalents) per stoichiometric reaction; F is Faraday constant.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 97–98"
  },
  {
    "id": "CH4-145",
    "q": "How is E°cell related to equilibrium constant?",
    "a": "ΔG° = −RT ln Keq = −nFE°cell; therefore E°cell = (RT/nF) ln Keq; at 25°C it is approximately (0.026/n) ln Keq.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 97–98"
  },
  {
    "id": "CH4-146",
    "q": "What do E°cell, ΔG°, and Keq indicate when the cell reaction is spontaneous?",
    "a": "E°cell > 0, ΔG° < 0, Keq > 1 (for the forward reaction under the given standard thermodynamic relationship).",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 98"
  },
  {
    "id": "CH4-147",
    "q": "What if Keq = 1? Prove the relation.",
    "a": "ln(1) = 0; E°cell = (RT/nF) × 0 = 0; ΔG° = −nF × 0 = 0.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 98"
  },
  {
    "id": "CH4-148",
    "q": "What if Keq < 1?",
    "a": "ln Keq < 0; E°cell < 0 and ΔG° > 0, with reactants favored at equilibrium.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 98"
  },
  {
    "id": "CH4-149",
    "q": "Pb + 2Ag+ → Pb2+ + 2Ag. Given E°Ag+/Ag = +0.80 and E°Pb2+/Pb = −0.13, find E°cell, ΔG°, Keq and notation.",
    "a": "E°cell = +0.93 V; ΔG° = −2 × 96500 × 0.93 = −179,490 J/mol; ln Keq = (2 × 0.93)/0.026 ≈ 71.54, Keq ≈ 1.17 × 10^31 (file value); Pb | Pb2+ || Ag+ | Ag.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 99",
    "sourceQuestion": "4-7"
  },
  {
    "id": "CH4-150",
    "q": "For 3Hg2^2+ + 2Cr → 6Hg + 2Cr3+, with E°Hg2^2+/Hg = +0.85 and E°Cr3+/Cr = −0.74, find ΔG°.",
    "a": "E°cell = +1.59 V; 6 mol electrons; ΔG° = −6 × 96500 × 1.59 = −920,610 J/mol.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 100",
    "sourceQuestion": "4-9"
  },
  {
    "id": "CH4-151",
    "q": "For 2Fe3+ + 2I− → 2Fe2+ + I2, given E°Fe3+/Fe2+ = +0.77 and E°I2/I− = +0.53 V, find E°cell, ΔG° and Keq.",
    "a": "E°cell = 0.77 − 0.53 = +0.24 V; ΔG° = −46,320 J/mol; ln Keq = 2 × 0.24/0.026 = 18.46; Keq ≈ 1.0 × 10^8.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 100",
    "sourceQuestion": "4-10"
  },
  {
    "id": "CH4-152",
    "q": "For Fe2+ + Ce4+ → Fe3+ + Ce3+, given E°Fe3+/Fe2+ = +0.77 and E°Ce4+/Ce3+ = +1.61 V, find E°cell, ΔG°, Keq.",
    "a": "E°cell = 1.61 − 0.77 = +0.84 V; n = 1; ΔG° = −81,060 J/mol; Keq ≈ 1.1 × 10^14 (file value).",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 101",
    "sourceQuestion": "4-5"
  },
  {
    "id": "CH4-153",
    "q": "Sn + Pb2+ → Sn2+ + Pb, given E°Pb2+/Pb = −0.13 and E°Sn2+/Sn = −0.14 V, find Keq.",
    "a": "E°cell = +0.01 V; n = 2; ln Keq = 2(0.01)/0.026 ≈ 0.769; Keq ≈ 2.16.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 102",
    "sourceQuestion": "4-37"
  },
  {
    "id": "CH4-154",
    "q": "For a nonstandard Zn/Cu cell, why must Ecell be calculated before nonstandard ΔG?",
    "a": "Because ΔG = −nF Ecell for the actual concentrations, whereas ΔG° = −nF E°cell applies only to standard-state cell potential.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 118–120"
  },
  {
    "id": "CH4-155",
    "q": "When a problem gives ΔG and asks for actual potential, which equation is used?",
    "a": "Ecell = −ΔG/(nF); use ΔG in joules and the balanced transferred-electron number n.",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 120–123"
  },
  {
    "id": "CH4-156",
    "q": "For Cd → Cd2+ + 2e−, E°oxidation = +0.40 V. Find ΔG° for this written half-reaction by the chapter's convention.",
    "a": "−2 × 96500 × 0.40 = −77,200 J/mol (formal half-reaction calculation shown in the source; full-cell reactions are the physical context for ΔG).",
    "topic": "05",
    "kind": "source",
    "pages": "PDF 132"
  },
  {
    "id": "CH4-157",
    "q": "Define the Nernst equation and write its general expression with symbols.",
    "a": "Ecell = E°cell − (RT/nF) ln Qreaction. E = actual potential, E° = standard potential, R = gas constant, T = Kelvin, n = transferred electrons, F = Faraday constant, Qreaction = reaction quotient.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 102–103",
    "sourceQuestion": "4-6"
  },
  {
    "id": "CH4-158",
    "q": "Write the Nernst equation at 25°C, as used in the chapter.",
    "a": "Ecell ≈ E°cell − (0.026/n) ln Qreaction.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 103"
  },
  {
    "id": "CH4-159",
    "q": "When does Ecell = E°cell?",
    "a": "When Qreaction = 1, so ln Qreaction = 0; standard concentrations and pressure satisfy this in the simple cases presented.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 103"
  },
  {
    "id": "CH4-160",
    "q": "How is a reaction quotient constructed for Nernst problems?",
    "a": "Products over reactants, each raised to its balanced coefficient; activities of pure solids and pure liquids are 1, so they do not appear.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 103–104"
  },
  {
    "id": "CH4-161",
    "q": "For 2Ag+ + Cu → 2Ag + Cu2+ at 25°C, [Ag+] = [Cu2+] = 0.01 M and E°Ag+/Ag = +0.80, E°Cu2+/Cu = +0.34 V. Find E.",
    "a": "E°cell = 0.46 V; Q = [Cu2+]/[Ag+]² = 0.01/(0.01)² = 100; E = 0.46 − (0.026/2) ln 100 ≈ 0.4002 V.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 104",
    "sourceQuestion": "4-8"
  },
  {
    "id": "CH4-162",
    "q": "Mg | Mg2+(0.05 M) || Sn2+(0.04 M) | Sn. Given E°Mg2+/Mg = −2.37, E°Sn2+/Sn = −0.14 V, find E°, E and ΔG.",
    "a": "E°cell = +2.23 V; Q = 0.05/0.04 = 1.25; E ≈ 2.227 V; ΔG ≈ −2 × 96500 × 2.227 = −429,811 J/mol.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 105–106",
    "sourceQuestion": "4-12"
  },
  {
    "id": "CH4-163",
    "q": "Zn/H2 galvanic cell has E = 0.73 V, [Zn2+] = 0.1 M, PH2 = 1 atm, E°Zn2+/Zn = −0.76 V. Find [H+] at 25°C.",
    "a": "E°cell = +0.76 V. Q = 0.1/[H+]². 0.73 ≈ 0.76 − 0.013 ln(0.1/[H+]²); [H+] ≈ 0.10 M (rounded PDF answer).",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 105",
    "sourceQuestion": "4-1"
  },
  {
    "id": "CH4-164",
    "q": "For 3Zn + 2Cr3+ → 3Zn2+ + 2Cr, [Zn2+] = 0.001 M, [Cr3+] = 0.01 M, E°Zn2+/Zn = −0.76 and E°Cr3+/Cr = −0.74 V. Find E°cell, Ecell and ΔG.",
    "a": "E°cell = (−0.74) − (−0.76) = +0.02 V; n = 6; Q = [Zn2+]³/[Cr3+]² = 10^−9/10^−4 = 10^−5; E ≈ 0.02 − (0.026/6) ln(10^−5) = 0.0699 V; ΔG ≈ −6 × 96500 × 0.0699 ≈ −40.5 kJ/mol. [Calculated from source data; this homework result is not printed clearly.]",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 106",
    "sourceQuestion": "4-7"
  },
  {
    "id": "CH4-165",
    "q": "Zn/H2 cell: [H+] = 1.8 M, [Zn2+] = 0.45 M, PH2 = 1 atm, E°Zn2+/Zn = −0.76 V. Find E° and E.",
    "a": "E°cell = +0.76 V; Q = 0.45/(1.8)² ≈ 0.1389; E ≈ 0.76 − 0.013 ln(0.1389) ≈ 0.786 V.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 107–108",
    "sourceQuestion": "4-8"
  },
  {
    "id": "CH4-166",
    "q": "Find the H2/H+ electrode reduction potential when pH = 1 at PH2 = 1 atm and 25°C.",
    "a": "[H+] = 10^−1 M; E ≈ 0 − (0.026/2) ln(1/[H+]²) = −0.013 ln 100 ≈ −0.0599 V.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 108",
    "sourceQuestion": "4-14"
  },
  {
    "id": "CH4-167",
    "q": "What [Zn2+] gives E(Zn2+/Zn) = −0.82 V when E°Zn2+/Zn = −0.76 V at 25°C?",
    "a": "−0.82 = −0.76 + (0.026/2) ln[Zn2+]; ln[Zn2+] ≈ −4.6; [Zn2+] ≈ 0.01 M.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 109",
    "sourceQuestion": "4-21"
  },
  {
    "id": "CH4-168",
    "q": "Daniell cell with [ZnSO4] = 0.1 M, [CuSO4] = 0.01 M and E°cell = 1.10 V. Find Ecell at 25°C.",
    "a": "Q = [Zn2+]/[Cu2+] = 10; E = 1.10 − 0.013 ln10 ≈ 1.0701 V.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 109–110",
    "sourceQuestion": "4-22"
  },
  {
    "id": "CH4-169",
    "q": "For Cd + Cu2+(0.01 M) → Cd2+(0.1 M) + Cu, E°cell = +0.74 V, calculate E and ΔG.",
    "a": "Q = 10; E ≈ 0.74 − 0.013 ln 10 ≈ 0.7101 V; ΔG ≈ −137,049 J/mol.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 110",
    "sourceQuestion": "4-24"
  },
  {
    "id": "CH4-170",
    "q": "Mg | Mg2+(1 M) || Br−(0.1 M) | Br2(1 atm) | Pt, E°Br2/Br− = +1.07 and E°Mg2+/Mg = −2.37 V. Find E and ΔG.",
    "a": "E°cell = 3.44 V; Q = [Mg2+][Br−]² = 0.01; E ≈ 3.44 − 0.013 ln0.01 ≈ 3.50 V; ΔG ≈ −675,500 J/mol.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 110–111",
    "sourceQuestion": "4-25"
  },
  {
    "id": "CH4-171",
    "q": "For 2H+(1 M) + Pb → H2 + Pb2+(0.01 M), Keq = 2.3 × 10^4 at 25°C. Calculate E°cell, Ecell and ΔG.",
    "a": "E° ≈ (0.026/2) ln 23000 ≈ 0.13 V; Q = 0.01; E ≈ 0.1898 V; ΔG ≈ −2 × 96500 × 0.1898 = −36,631 J/mol.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 111",
    "sourceQuestion": "4-26"
  },
  {
    "id": "CH4-172",
    "q": "Ni + Sn2+(1 M) → Ni2+ + Sn has E = 0.17 V, with E°Ni2+/Ni = −0.25 and E°Sn2+/Sn = −0.14 V. Find [Ni2+].",
    "a": "E° = 0.11 V; E = 0.11 − 0.013 ln[Ni2+]; ln[Ni2+] ≈ −4.615; [Ni2+] ≈ 0.01 M.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 111–112",
    "sourceQuestion": "4-27"
  },
  {
    "id": "CH4-173",
    "q": "For Ni/H+ cell at 25°C, [Ni2+] = 0.01 M, PH2 = 1 atm, E°Ni2+/Ni = −0.25 V and ΔG = −48.25 kJ/mol, find pH.",
    "a": "E = −ΔG/(2F) = +0.25 V. E°cell = +0.25 V. Therefore Q = 1 and [Ni2+]/[H+]² = 1; [H+] = 0.10 M; pH = 1.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 112–113",
    "sourceQuestion": "4-29"
  },
  {
    "id": "CH4-174",
    "q": "Sn | Sn2+(? M) || Ag+(1 M) | Ag has E = 0.9992 V, E°Sn2+/Sn = −0.14, E°Ag+/Ag = +0.80 V. Find [Sn2+].",
    "a": "E°cell = 0.94 V; 0.9992 ≈ 0.94 − 0.013 ln[Sn2+]; [Sn2+] ≈ 0.0105 M, rounded by the source to 0.01 M.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 113–114",
    "sourceQuestion": "4-30"
  },
  {
    "id": "CH4-175",
    "q": "Standard Daniell cell cathode (Cu2+/Cu) potential falls by 0.0592 V after dilution. Find [Cu2+] at 25°C.",
    "a": "For Cu2+ + 2e− → Cu, E − E° = (0.026/2) ln[Cu2+]. If fall is 0.0592 V, ln[Cu2+] = −0.0592/0.013 ≈ −4.55, [Cu2+] ≈ 0.0105 M (source approximates 0.01 M).",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 114",
    "sourceQuestion": "4-39"
  },
  {
    "id": "CH4-176",
    "q": "For Zn and Ag galvanic cell with E°Zn2+/Zn = −0.76 and E°Ag+/Ag = +0.80 V, which electrode gains or loses mass? If [Ag+] = 0.1 M and [Zn2+] = 1 M, calculate E and ΔG.",
    "a": "Zn (anode) loses mass; Ag (cathode) gains mass. E°cell = 1.56 V; Q = 1/(0.1)² = 100; E ≈ 1.5002 V; ΔG ≈ −289,539 J/mol.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 115–118",
    "sourceQuestion": "4-40"
  },
  {
    "id": "CH4-177",
    "q": "What information must be known to calculate pH from a Zn/H+ cell potential?",
    "a": "Determine E°cell, balanced reaction and n, pressure of H2, [Zn2+], and Ecell (or ΔG to derive Ecell); solve Nernst for [H+], then pH = −log[H+].",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 118–119"
  },
  {
    "id": "CH4-178",
    "q": "How do you calculate the unknown concentration of an electrode using Ecell?",
    "a": "First find E°cell. Rearrange ln Q = n(E°−E)/0.026 (25°C); substitute known concentrations and reaction stoichiometry; solve for the unknown ion.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 120–132"
  },
  {
    "id": "CH4-179",
    "q": "Why can a solution concentration alter electrode potential without changing the standard potential?",
    "a": "E° is the assigned standard-state value; actual E depends on reaction quotient Q through the Nernst equation.",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 120–132"
  },
  {
    "id": "CH4-180",
    "q": "For Cd | Cd2+(0.2 M) || Cu2+(0.1 M) | Cu, E°Cd2+/Cd = −0.40 and E°Cu2+/Cu = +0.34 V, find E and ΔG.",
    "a": "E°cell = 0.74 V; Q = 2; E ≈ 0.74 − 0.013 ln2 ≈ 0.7310 V (the file rounds to about 0.732 V); ΔG ≈ −141.1 kJ/mol (file uses −141,276 J/mol with its rounded E).",
    "topic": "06",
    "kind": "source",
    "pages": "PDF 132"
  },
  {
    "id": "CH4-181",
    "q": "Define a battery according to the chapter and name its categories.",
    "a": "A source based on one or more galvanic cells; primary (non-rechargeable) and secondary (rechargeable) batteries.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 133"
  },
  {
    "id": "CH4-182",
    "q": "Describe lead–acid (lead storage) battery construction and voltage.",
    "a": "Lead (Pb) anode, lead dioxide (PbO2) cathode, sulfuric acid electrolyte; a cell provides a little more than 2 V, with multiple cells giving common 6 V or 12 V arrangements.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 133–134"
  },
  {
    "id": "CH4-183",
    "q": "Write the lead battery discharge anode half-reaction.",
    "a": "Pb(s) + SO4^2−(aq) → PbSO4(s) + 2e−.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 134"
  },
  {
    "id": "CH4-184",
    "q": "Write the lead battery discharge cathode half-reaction.",
    "a": "PbO2(s) + 4H+(aq) + SO4^2−(aq) + 2e− → PbSO4(s) + 2H2O(l).",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 134"
  },
  {
    "id": "CH4-185",
    "q": "Write the lead battery total discharge reaction.",
    "a": "Pb + PbO2 + 2H2SO4 → 2PbSO4 + 2H2O.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 134"
  },
  {
    "id": "CH4-186",
    "q": "Explain why sulfuric-acid density decreases during lead battery discharge.",
    "a": "Sulfuric acid is consumed and water forms; the sulfuric-acid solution becomes less concentrated/dense.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 135"
  },
  {
    "id": "CH4-187",
    "q": "Can a lead–acid battery be recharged? Explain.",
    "a": "Yes. An external current drives discharge reactions in reverse, converting PbSO4 back to Pb/PbO2 and restoring acid concentration.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 135–137"
  },
  {
    "id": "CH4-188",
    "q": "What are the anode and cathode of the dry cell made from, and what are its properties?",
    "a": "Zinc casing serves as anode; carbon/graphite rod with MnO2-containing paste functions as cathode system, with NH4Cl paste electrolyte. Source properties: approximately 1.48 V, non-rechargeable, used in radios/calculators/toys.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 135–138",
    "sourceQuestion": "4-19"
  },
  {
    "id": "CH4-189",
    "q": "Write the dry cell half-reactions and overall reaction as supplied in the chapter.",
    "a": "Anode: Zn + 2OH− → Zn(OH)2 + 2e−. Cathode: 2MnO2 + 2H2O + 2e− → 2MnO(OH) + 2OH−. Overall: Zn + 2MnO2 + 2H2O → Zn(OH)2 + 2MnO(OH). [These are the exact electrode-reaction style illustrated in the file.]",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 135–138",
    "sourceQuestion": "4-19"
  },
  {
    "id": "CH4-190",
    "q": "Relate standard Gibbs energy, Keq and E°cell; define symbols.",
    "a": "ΔG° = −RT ln Keq = −nF E°cell, so E°cell = (RT/nF) ln Keq. R gas constant, T Kelvin, n electrons transferred, F Faraday constant.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 136,138",
    "sourceQuestion": "4-4"
  },
  {
    "id": "CH4-191",
    "q": "Does the uploaded file provide detailed fuel-cell reaction questions?",
    "a": "Although the heading says 'Batteries and Fuel Cells', the available pages chiefly discuss lead storage and dry batteries; no full worked fuel-cell half-reaction question is established by the extracted text. Do not invent one as a source question.",
    "topic": "07",
    "kind": "source",
    "pages": "PDF 133"
  },
  {
    "id": "CH4-192",
    "q": "Zn | Zn2+(10^-1 M) || Cu2+(10^-4 M) | Cu has ΔG = −195.1616 kJ/mol at 25°C; E°Cu2+/Cu = +0.34 V. Find ΔG° and E°Zn2+/Zn.",
    "a": "Ecell = −ΔG/(2F) = +1.0112 V. Q = (10^-1)/(10^-4) = 1000. E°cell = 1.0112 + 0.013 ln(1000) ≈ 1.10 V. ΔG° = −2 × 96500 × 1.10 = −212,300 J/mol; E°Zn2+/Zn = −0.76 V.",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 118–119"
  },
  {
    "id": "CH4-193",
    "q": "For Ni + Sn2+(1 M) → Ni2+(0.01 M) + Sn, E°Ni2+/Ni = −0.25 V and E°Sn2+/Sn = −0.14 V, find nonstandard ΔG.",
    "a": "E°cell = +0.11 V. Q = 0.01; Ecell = 0.11 − 0.013 ln0.01 ≈ 0.1699 V. ΔG ≈ −2 × 96500 × 0.1699 = −32,791 J/mol (source rounding gives −32,771 J/mol).",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 121"
  },
  {
    "id": "CH4-194",
    "q": "Mg | Mg2+(0.06 M) || Sn2+(0.03 M) | Sn, with E°Mg2+/Mg = −2.37 V and E°Sn2+/Sn = −0.14 V. Find E and ΔG.",
    "a": "E°cell = 2.23 V, Q = 2; E ≈ 2.23 − 0.013 ln2 ≈ 2.221 V. ΔG ≈ −2 × 96500 × 2.221 ≈ −428,653 J/mol. CAUTION: the PDF reports −424,600 J/mol despite listing E = 2.221 V, a multiplication inconsistency.",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 121–122"
  },
  {
    "id": "CH4-195",
    "q": "3Zn + 2Cr3+ → 3Zn2+ + 2Cr at [Zn2+] = 0.01 M, [Cr3+] = 0.10 M, E°Zn2+/Zn = −0.76 V, E°Cr3+/Cr = −0.74 V. Find E and ΔG.",
    "a": "E° = +0.02 V, n = 6. Q = (0.01)^3/(0.10)^2 = 10^-4. Using the chapter's formula E = 0.02 − (0.026/6) ln10^-4 ≈ 0.0599 V; ΔG ≈ −34.7 kJ/mol. The PDF's worked line rounds (0.026/6) down to 0.004 and gives E ≈ 0.056 V, ΔG ≈ −32,424 J/mol; both are recorded here so the key difference is visible.",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 122"
  },
  {
    "id": "CH4-196",
    "q": "In a STANDARD Cd + Cu2+ → Cd2+ + Cu cell, if E°Cd2+/Cd = −0.40 and E°Cu2+/Cu = +0.34 V, find ΔG°.",
    "a": "E°cell = 0.74 V; n = 2; ΔG° = −2 × 96500 × 0.74 = −142,820 J/mol.",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 123"
  },
  {
    "id": "CH4-197",
    "q": "In Al | Al3+(0.008 M) || H+(? M) | H2(1 atm) | Pt, the actual and standard cell potentials are equal. Find pH.",
    "a": "E = E° means Qreaction = 1. For 2Al + 6H+ → 2Al3+ + 3H2, Q = (0.008)^2/[H+]^6 = 1. [H+] = (0.008)^(1/3) = 0.20 M. pH = −log(0.20) ≈ 0.70. Line notation: Al | Al3+(0.008 M) || H+(0.20 M) | H2(1 atm) | Pt.",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 123–124"
  },
  {
    "id": "CH4-198",
    "q": "SHE/Zn cell with [H+] = 0.20 M, PH2 = 1 atm, [Zn2+] = 0.40 M, E°Zn2+/Zn = −0.76 V. Find Ecell.",
    "a": "Q = 0.40/(0.20)^2 = 10. E°cell = 0.76 V. Ecell = 0.76 − 0.013 ln10 ≈ 0.730 V.",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 124"
  },
  {
    "id": "CH4-199",
    "q": "For 2Al + 3Cd2+ → 2Al3+ + 3Cd, with E°cell = 1.26 V and n = 6, find ΔG°.",
    "a": "ΔG° = −6 × 96500 × 1.26 = −729,540 J/mol.",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 124"
  },
  {
    "id": "CH4-200",
    "q": "For Ni + 2H+ → Ni2+ + H2 at 25°C, E°cell = 0.25 V, pH = 2, [Ni2+] = 0.001 M, PH2 = 1 atm. Find ΔG.",
    "a": "[H+] = 0.01 M; Q = 0.001/(0.01)^2 = 10. E = 0.25 − 0.013 ln10 ≈ 0.2201 V; ΔG ≈ −2 × 96500 × 0.2201 ≈ −42.48 kJ/mol (source rounds to around −42.46 kJ/mol).",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 127"
  },
  {
    "id": "CH4-201",
    "q": "For Ni + Sn2+(1 M) → Ni2+ + Sn, E°cell = 0.11 V and Ecell = 0.14 V at 25°C. Find [Ni2+].",
    "a": "0.14 = 0.11 − 0.013 ln[Ni2+], hence ln[Ni2+] ≈ −2.308; [Ni2+] ≈ 0.10 M.",
    "topic": "7B",
    "kind": "source",
    "pages": "PDF 131"
  },
  {
    "id": "CH4-P01",
    "q": "Worked practice: Find the oxidation number of Mn in KMnO4.",
    "a": "K = +1 and O = −2. 1 + x + 4(−2) = 0; x = +7.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "oxidation number"
  },
  {
    "id": "CH4-P02",
    "q": "Worked practice: Balance the electron transfer in Zn + Ag+ → Zn2+ + Ag and identify oxidant/reductant.",
    "a": "Zn → Zn2+ + 2e−; 2Ag+ + 2e− → 2Ag. Overall Zn + 2Ag+ → Zn2+ + 2Ag. Reducing agent Zn; oxidizing agent Ag+.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "electron balancing"
  },
  {
    "id": "CH4-P03",
    "q": "Worked practice: Given E°Zn2+/Zn = −0.76 V and E°Ag+/Ag = +0.80 V, choose electrodes and calculate E°cell.",
    "a": "Zinc is anode; silver is cathode. E°cell = +0.80 − (−0.76) = +1.56 V.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "electrode selection / standard E"
  },
  {
    "id": "CH4-P04",
    "q": "Worked practice: A Zn/Cu cell has E°cell = 1.10 V and E°Zn2+/Zn = −0.76 V. Find E°Cu2+/Cu.",
    "a": "E°Cu2+/Cu = 1.10 + (−0.76) = +0.34 V.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "recover missing electrode potential"
  },
  {
    "id": "CH4-P05",
    "q": "Worked practice: From standard reductions Al3+/Al = −1.66, Zn2+/Zn = −0.76, Cu2+/Cu = +0.34 V, choose a pair giving maximum E°cell.",
    "a": "Al anode, Cu cathode; E°cell = 0.34 − (−1.66) = +2.00 V.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "choose greatest voltage"
  },
  {
    "id": "CH4-P06",
    "q": "Worked practice: Write cell notation for Zn + 2Ag+ → Zn2+ + 2Ag under standard conditions.",
    "a": "Zn(s) | Zn2+(1 M) || Ag+(1 M) | Ag(s).",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "cell line notation"
  },
  {
    "id": "CH4-P07",
    "q": "Worked practice: Can copper metal spontaneously reduce Zn2+ to Zn if E°Cu2+/Cu = +0.34 V and E°Zn2+/Zn = −0.76 V?",
    "a": "E°cell for Cu + Zn2+ → Cu2+ + Zn = −0.76 − (+0.34) = −1.10 V; the proposed direction is nonspontaneous under standard conditions.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "spontaneous vessel/material reaction"
  },
  {
    "id": "CH4-P08",
    "q": "Worked practice: A 5.00 A current flows for 1930 s through CuSO4. Find the mass of Cu deposited. Use M_Cu = 63 g/mol and Cu2+ + 2e− → Cu.",
    "a": "Q = 5 × 1930 = 9650 C. n(e−) = 9650/96500 = 0.100 mol. n(Cu) = 0.0500 mol. Mass = 0.0500 × 63 = 3.15 g.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "Faraday charge and Cu mass"
  },
  {
    "id": "CH4-P09",
    "q": "Worked practice: What current deposits 0.985 g Au from Au3+ solution in 965 s? M_Au = 197 g/mol.",
    "a": "n(Au) = 0.985/197 = 0.005 mol. n(e−) = 3 × 0.005 = 0.015 mol. I = 0.015 × 96500 / 965 = 1.50 A.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "current needed from desired mass"
  },
  {
    "id": "CH4-P10",
    "q": "Worked practice: 500 mL of 0.10 M Cu2+ solution is electrolyzed at 19.3 A. How long until only 0.010 mol Cu2+ remains?",
    "a": "Initially 0.500 × 0.10 = 0.050 mol; copper removed = 0.040 mol. Electrons required = 0.080 mol. t = 0.080 × 96500/19.3 = 400 s.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "time from molarity / remaining ions"
  },
  {
    "id": "CH4-P11",
    "q": "Worked practice: A monovalent metal deposits 0.540 g at 5 A for 193 s. Calculate molar mass.",
    "a": "n(e−) = (5 × 193)/96500 = 0.010 mol. n(metal) = 0.010 mol. M = 0.540/0.010 = 54 g/mol.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "atomic mass from Faraday"
  },
  {
    "id": "CH4-P12",
    "q": "Worked practice: A cathode deposits 0.020 mol Cu. How many atoms were deposited?",
    "a": "N = 0.020 × 6.02 × 10^23 = 1.204 × 10^22 atoms.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "number of atoms"
  },
  {
    "id": "CH4-P13",
    "q": "Worked practice: How many electrons are needed to evolve 11.2 L oxygen at STP? Half-reaction: 2H2O → O2 + 4H+ + 4e−.",
    "a": "n(O2) = 11.2/22.4 = 0.50 mol. n(e−) = 4 × 0.50 = 2.00 mol electrons. Number = 1.204 × 10^24 electrons.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "gas volume at STP / electrons"
  },
  {
    "id": "CH4-P14",
    "q": "Worked practice: Oxygen gas occupies 0.244 L at 25°C and 1 atm. How many moles of electrons correspond to its formation? R = 0.08206 L atm mol−1 K−1.",
    "a": "n(O2) = 1 × 0.244/(0.08206 × 298) ≈ 0.0100 mol. Four electrons per O2: n(e−) ≈ 0.0400 mol.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "PV = nRT for gas electrolysis"
  },
  {
    "id": "CH4-P15",
    "q": "Worked practice: Water electrolysis produces a total 0.336 L of H2 + O2 at STP in 100 s. Find each gas volume and current.",
    "a": "H2 = (2/3) × 0.336 = 0.224 L; O2 = 0.112 L. n(O2) = 0.112/22.4 = 0.005 mol; n(e−) = 0.020 mol; I = 0.020 × 96500/100 = 19.3 A.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "water electrolysis H2/O2 ratio"
  },
  {
    "id": "CH4-P16",
    "q": "Worked practice: 10 A flows for 965 s through Ag+ solution and only 80% of the charge deposits silver. M_Ag = 108 g/mol. Find deposited mass.",
    "a": "Total electron-moles = 10 × 965/96500 = 0.100 mol. Effective = 0.080 mol; each Ag+ needs 1e−; mass = 0.080 × 108 = 8.64 g.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "current efficiency"
  },
  {
    "id": "CH4-P17",
    "q": "Worked practice: Two cells are in series. If 1.08 g Ag (M = 108, Ag+ needs 1 electron) deposits in one, how much Cu (M = 63, Cu2+ needs 2 electrons) deposits in the other?",
    "a": "Silver amount = 0.0100 mol, hence 0.0100 mol electrons travel through both cells. Cu deposited = 0.0100/2 = 0.0050 mol; mass = 0.005 × 63 = 0.315 g.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "electrolysis cells in series"
  },
  {
    "id": "CH4-P18",
    "q": "Worked practice: 0.50 mol electrons are supplied in a copper electrolysis cell, with 2.24 L H2 evolved at STP. How much Cu deposits (M = 63)?",
    "a": "H2 = 2.24/22.4 = 0.10 mol, consuming 0.20 mol electrons. Left for Cu2+ = 0.30 mol electrons; Cu = 0.15 mol; mass = 9.45 g.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "competing cathode products and charge partition"
  },
  {
    "id": "CH4-P19",
    "q": "Worked practice: A galvanic reaction transfers 2 electrons and has E°cell = +1.10 V. Calculate ΔG°.",
    "a": "ΔG° = −nFE° = −2 × 96500 × 1.10 = −212,300 J/mol = −212.3 kJ/mol.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "standard Gibbs energy"
  },
  {
    "id": "CH4-P20",
    "q": "Worked practice: At 25°C a cell with n = 2 has E°cell = 0.130 V. Find Keq using 0.026/n ln Keq.",
    "a": "ln Keq = 2 × 0.130/0.026 = 10; Keq = e^10 ≈ 2.20 × 10^4.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "equilibrium constant from E°"
  },
  {
    "id": "CH4-P21",
    "q": "Worked practice: Daniell cell: E° = 1.10 V, [Zn2+] = 0.20 M, [Cu2+] = 0.020 M, 25°C. Find E.",
    "a": "Qreaction = [Zn2+]/[Cu2+] = 10. E = 1.10 − (0.026/2) ln 10 ≈ 1.0701 V.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "actual cell potential from Nernst"
  },
  {
    "id": "CH4-P22",
    "q": "Worked practice: For Zn + Cu2+ → Zn2+ + Cu, E° = 1.10 V, actual E = 1.0701 V, [Cu2+] = 0.10 M, 25°C. Find [Zn2+].",
    "a": "ln Q = (1.10 − 1.0701)/0.013 ≈ 2.30 → Q ≈ 10; [Zn2+] = 10 × 0.10 ≈ 1.0 M.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "unknown ionic concentration from E"
  },
  {
    "id": "CH4-P23",
    "q": "Worked practice: Find the H+/H2 reduction potential at pH = 2, PH2 = 1 atm and 25°C.",
    "a": "[H+] = 10^−2 M; E = −(0.026/2) ln(1/[H+]²) = −0.013 ln(10^4) ≈ −0.1197 V.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "hydrogen electrode potential from pH"
  },
  {
    "id": "CH4-P24",
    "q": "Worked practice: For Ni + 2H+ → Ni2+ + H2 at 25°C, E° = 0.25 V, actual E ≈ 0.1901 V, [Ni2+] = 0.010 M, PH2 = 1 atm. Find pH.",
    "a": "E° − E = 0.0599 V. Thus lnQ ≈ 0.0599/0.013 ≈ 4.605; Q ≈ 100. Since Q = 0.010/[H+]², [H+]² = 10^−4, [H+] = 0.010 M, pH = 2.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "calculate pH from Nernst potential"
  },
  {
    "id": "CH4-P25",
    "q": "Worked practice: In P21, E = 1.0701 V and n = 2. Calculate actual ΔG.",
    "a": "ΔG = −2 × 96500 × 1.0701 ≈ −206,529 J/mol = −206.5 kJ/mol.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "nonstandard free energy"
  },
  {
    "id": "CH4-P26",
    "q": "Worked practice: If a lead-acid battery uses 3 galvanic cells of approximately 2 V each in series, what approximate terminal voltage is obtained?",
    "a": "About 6 V. This is a voltage-in-series illustration, not a claim about how battery capacity/charge adds.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "batteries connected in series"
  },
  {
    "id": "CH4-P27",
    "q": "Worked practice: In lead battery discharge Pb + PbO2 + 2H2SO4 → 2PbSO4 + 2H2O, how many moles H2SO4 are consumed for 0.50 mol Pb reacting (assuming complete reaction)?",
    "a": "2 mol H2SO4 per 1 mol Pb; for 0.50 mol Pb, consume 1.00 mol H2SO4.",
    "topic": "08",
    "kind": "practice",
    "pages": "",
    "idea": "battery half-reaction stoichiometry"
  }
];
