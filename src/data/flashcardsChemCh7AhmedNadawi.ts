// Ahmed Al-Nadawi Chemistry CH7 — all 117 complete supplied Organic Chemistry cards.
// Retain source order, structural formulas, reaction conditions and ministerial labels.
// The unverified 214-entry source question index is preserved in the original document.
// Source: docs/flashcards/ahmed-al-nadawi/Ahmed_Al_Nadawi_CH7_Organic_Chemistry_Flashcards.txt.

export type AhmedNadawiChemCh7Card = {
  id: string;
  q: string;
  a: string;
  topic: string;
  pages: string;
  ministerialLabel: string;
  years: string[];
};

export const ahmedNadawiChemCh7Source = {
  "file": "Ahmed_Al_Nadawi_CH7_Organic_Chemistry_Flashcards.txt",
  "uploadedFile": "Ahmed_Al_Nadawi_CH7_Organic_Chemistry_Flashcards(1).txt",
  "chapter": 7,
  "sourcePdf": "ف7 انكليزي احمد النداوي.pdf",
  "pdfPages": 144,
  "sha256": "97f643349c966f83bbeed4b555130486c0f050e34d3af29664d15caa6a678e44",
  "cardCount": 117,
  "cardsWithMinisterialLabels": 15,
  "additionalQuestionIndexEntries": 214,
  "additionalQuestionIndexPages": 90,
  "sourceFidelityNote": "Cards below are study conversions of the legible chapter material. Ministerial years are included only where clearly seen. The appended question/expression index preserves more source text, including partially garbled diagrams; do not treat OCR-like text as verified equations."
} as const;

export const ahmedNadawiChemCh7Topics = [
  {
    "key": "01",
    "title": "Foundations",
    "titleAr": "أساسيات الكيمياء العضوية",
    "pages": "6–9",
    "expectedCount": 12
  },
  {
    "key": "02",
    "title": "Alkyl Halides",
    "titleAr": "هاليدات الألكيل",
    "pages": "10–24, 61–65",
    "expectedCount": 23
  },
  {
    "key": "03",
    "title": "Alcohols",
    "titleAr": "الكحولات",
    "pages": "25–42, 66–77",
    "expectedCount": 24
  },
  {
    "key": "04",
    "title": "Ethers",
    "titleAr": "الإيثرات",
    "pages": "43–50, 78–80",
    "expectedCount": 6
  },
  {
    "key": "05",
    "title": "Aldehydes and Ketones",
    "titleAr": "الألديهايدات والكيتونات",
    "pages": "82–102",
    "expectedCount": 21
  },
  {
    "key": "06",
    "title": "Carboxylic Acids",
    "titleAr": "الحوامض الكاربوكسيلية",
    "pages": "103–118",
    "expectedCount": 14
  },
  {
    "key": "07",
    "title": "Esters",
    "titleAr": "الإسترات",
    "pages": "119–127",
    "expectedCount": 8
  },
  {
    "key": "08",
    "title": "Amines",
    "titleAr": "الأمينات",
    "pages": "128–140",
    "expectedCount": 9
  }
] as const;

export const ahmedNadawiChemCh7Cards: AhmedNadawiChemCh7Card[] = [
  {
    "id": "CH7-001",
    "q": "Define organic chemistry.",
    "a": "The branch of chemistry studying compounds in which carbon is the principal element.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-002",
    "q": "Define hydrocarbons.",
    "a": "Organic compounds containing only carbon and hydrogen.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-003",
    "q": "Distinguish saturated and unsaturated hydrocarbons.",
    "a": "Saturated: alkanes with C–C single bonds. Unsaturated: alkenes (C=C) and alkynes (C≡C).",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-004",
    "q": "What are aromatic hydrocarbons?",
    "a": "Benzene and its cyclic derivatives.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-005",
    "q": "What bond is present in alkanes, alkenes and alkynes?",
    "a": "Alkanes: C–C; alkenes: C=C; alkynes: C≡C.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-006",
    "q": "Define isomeric compounds.",
    "a": "Compounds having the same molecular formula but different structural formulas and properties.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-007",
    "q": "Give both structural isomers of C4H10.",
    "a": "CH3–CH2–CH2–CH3 (butane); CH3–CH(CH3)–CH3 (2-methylpropane).",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-008",
    "q": "Give all three structural isomers of C5H12.",
    "a": "CH3–CH2–CH2–CH2–CH3; CH3–CH(CH3)–CH2–CH3; C(CH3)4.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-009",
    "q": "What are the alkane/alkene/alkyne naming suffixes?",
    "a": "-ane / -ene / -yne.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-010",
    "q": "Give roots for carbon numbers 1–10.",
    "a": "meth, eth, prop, but, pent, hex, hept, oct, non, dec.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-011",
    "q": "Define a functional group.",
    "a": "An atom or group of atoms attached to carbon that gives organic compounds distinctive physical and chemical properties.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-012",
    "q": "State general formulas for alkyl halides, alcohols, ethers.",
    "a": "R–X, R–OH, R–O–R′, respectively.",
    "topic": "01",
    "pages": "PDF 6–9",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-013",
    "q": "Define an alkyl group.",
    "a": "A group formed by removal of one hydrogen atom from an alkane: R–H → R–.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-014",
    "q": "What is an alkyl halide?",
    "a": "An alkyl group bonded to a halogen (X = Cl, Br or I): R–X.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-015",
    "q": "Ministerial (2021, 2022): How are alkyl halides classified?",
    "a": "Primary (1°), secondary (2°), tertiary (3°), according to the carbon attached to X.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2021, 2022",
    "years": [
      "2021",
      "2022"
    ]
  },
  {
    "id": "CH7-016",
    "q": "Ministerial (2017): Define Markovnikov’s rule.",
    "a": "In addition of HX to an unsymmetrical alkene, H joins the double-bond carbon carrying more hydrogens and X joins the other carbon.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2017",
    "years": [
      "2017"
    ]
  },
  {
    "id": "CH7-017",
    "q": "Ministerial (2016, 2017, 2018): Why does propene + HBr yield 2-bromopropane?",
    "a": "Markovnikov addition: CH3–CH=CH2 + HBr → CH3–CHBr–CH3.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2016, 2017, 2018",
    "years": [
      "2016",
      "2017",
      "2018"
    ]
  },
  {
    "id": "CH7-018",
    "q": "Ministerial (2014): Prepare 2-bromobutane from 1-butene.",
    "a": "CH3–CH2–CH=CH2 + HBr → CH3–CH2–CHBr–CH3.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2014",
    "years": [
      "2014"
    ]
  },
  {
    "id": "CH7-019",
    "q": "Ministerial (2013 / first sitting): Prepare 2-bromopropane from propene.",
    "a": "CH3–CH=CH2 + HBr → CH3–CHBr–CH3.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2013 / first sitting",
    "years": [
      "2013"
    ]
  },
  {
    "id": "CH7-020",
    "q": "Ministerial (2015, 2016): React HCl with 1-butene.",
    "a": "CH3–CH2–CH=CH2 + HCl → CH3–CH2–CHCl–CH3.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2015, 2016",
    "years": [
      "2015",
      "2016"
    ]
  },
  {
    "id": "CH7-021",
    "q": "Ministerial (2022): React HCl with 2-butene.",
    "a": "CH3–CH=CH–CH3 + HCl → CH3–CH2–CHCl–CH3.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2022",
    "years": [
      "2022"
    ]
  },
  {
    "id": "CH7-022",
    "q": "React HCl with 2-methylpropene.",
    "a": "(CH3)2C=CH2 + HCl → (CH3)3CCl (2-chloro-2-methylpropane).",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-023",
    "q": "Ministerial (2018): Why are alkyl halides insoluble in water?",
    "a": "They cannot form hydrogen bonds with water; they dissolve well in organic solvents.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2018",
    "years": [
      "2018"
    ]
  },
  {
    "id": "CH7-024",
    "q": "Ministerial (2015): Define electrophilic reagent.",
    "a": "Electron-loving atom, ion or molecule able to accept a pair of electrons due to an empty orbital.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2015",
    "years": [
      "2015"
    ]
  },
  {
    "id": "CH7-025",
    "q": "Ministerial (2014, 2017, 2019): Give the reaction of bromoethane with aqueous KOH, heated.",
    "a": "CH3CH2Br + KOH(aq) → CH3CH2OH + KBr.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2014, 2017, 2019",
    "years": [
      "2014",
      "2017",
      "2019"
    ]
  },
  {
    "id": "CH7-026",
    "q": "Ministerial (2021, 2022): Give the reaction of bromoethane with alcoholic KOH, heated.",
    "a": "CH3CH2Br + KOH(ethanol) → CH2=CH2 + KBr + H2O.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2021, 2022",
    "years": [
      "2021",
      "2022"
    ]
  },
  {
    "id": "CH7-027",
    "q": "Compare aqueous versus alcoholic KOH with an alkyl halide.",
    "a": "Aqueous: substitution forming alcohol; alcoholic: elimination forming alkene.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-028",
    "q": "React 1-bromopropane with aqueous KOH.",
    "a": "CH3CH2CH2Br + KOH(aq) → CH3CH2CH2OH + KBr.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-029",
    "q": "React 1-bromopropane with alcoholic KOH.",
    "a": "CH3CH2CH2Br + KOH(ethanol) → CH3CH=CH2 + KBr + H2O.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-030",
    "q": "Ministerial (2016): React chloroethane with aqueous KOH.",
    "a": "CH3CH2Cl + KOH(aq) → CH3CH2OH + KCl.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2016",
    "years": [
      "2016"
    ]
  },
  {
    "id": "CH7-031",
    "q": "Ministerial (2021): React 2-chloro-2-methylpropane with aqueous KOH.",
    "a": "(CH3)3CCl + KOH(aq) → (CH3)3COH + KCl.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2021",
    "years": [
      "2021"
    ]
  },
  {
    "id": "CH7-032",
    "q": "Ministerial (2016): Prepare ethylmagnesium bromide (Grignard reagent).",
    "a": "CH3CH2Br + Mg —dry ether→ CH3CH2MgBr.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "2016",
    "years": [
      "2016"
    ]
  },
  {
    "id": "CH7-033",
    "q": "Prepare ethylmagnesium chloride from ethene.",
    "a": "CH2=CH2 + HCl → CH3CH2Cl; then CH3CH2Cl + Mg —dry ether→ CH3CH2MgCl.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-034",
    "q": "Give the structural formula of 2,3-dibromobutane.",
    "a": "CH3–CHBr–CHBr–CH3.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-035",
    "q": "Give the structural formula of 2-bromo-2-methylpentane.",
    "a": "CH3–C(Br)(CH3)–CH2–CH2–CH3.",
    "topic": "02",
    "pages": "PDF 10–24, 61–65",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-036",
    "q": "Define alcohol and give the functional group.",
    "a": "Hydroxyl (–OH) attached to a saturated carbon; R–OH. General formula CnH2n+2O for acyclic monohydric saturated alcohols.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-037",
    "q": "Classify alcohols by the carbon bearing OH.",
    "a": "Primary RCH2OH; secondary R2CHOH; tertiary R3COH.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-038",
    "q": "Ministerial (2022): Why do alcohols have relatively high boiling points?",
    "a": "Intermolecular hydrogen bonds between –OH groups.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "2022",
    "years": [
      "2022"
    ]
  },
  {
    "id": "CH7-039",
    "q": "Give the structural formula of 3-methyl-3-pentanol.",
    "a": "CH3CH2–C(OH)(CH3)–CH2CH3.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-040",
    "q": "Prepare ethanol from ethene.",
    "a": "CH2=CH2 + H2O —H+→ CH3CH2OH.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-041",
    "q": "Prepare ethanol from chloroethane.",
    "a": "CH3CH2Cl + KOH(aq), heat → CH3CH2OH + KCl.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-042",
    "q": "Prepare 2-propanol from 2-bromopropane.",
    "a": "CH3CHBrCH3 + KOH(aq), heat → CH3CHOHCH3 + KBr.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-043",
    "q": "What is Lucas reagent?",
    "a": "Concentrated HCl with anhydrous ZnCl2.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-044",
    "q": "How does Lucas reagent distinguish 1°, 2° and 3° alcohols?",
    "a": "Tertiary: immediate turbidity; secondary: delayed turbidity; primary: no turbidity at room temperature (as presented in the chapter).",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-045",
    "q": "Distinguish 2-methyl-2-propanol from 2-propanol by Lucas reagent.",
    "a": "2-methyl-2-propanol (3°) gives immediate turbidity; 2-propanol (2°) gives turbidity more slowly.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-046",
    "q": "Distinguish ethanol from 2-methyl-2-propanol by Lucas reagent.",
    "a": "Ethanol (1°) has no immediate turbidity; 2-methyl-2-propanol (3°) gives immediate turbidity.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-047",
    "q": "Write the Lucas substitution reaction of 2-propanol.",
    "a": "CH3CHOHCH3 + HCl —ZnCl2→ CH3CHClCH3 + H2O.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-048",
    "q": "Write the Lucas substitution reaction of tert-butanol.",
    "a": "(CH3)3COH + HCl —ZnCl2→ (CH3)3CCl + H2O.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-049",
    "q": "What oxidants are used for alcohol oxidation?",
    "a": "Acidified K2Cr2O7 or KMnO4.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-050",
    "q": "Oxidize a primary alcohol to an aldehyde.",
    "a": "RCH2OH + [O] → RCHO + H2O (controlled oxidation).",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-051",
    "q": "Oxidize a primary alcohol completely to a carboxylic acid.",
    "a": "RCH2OH + 2[O] → RCOOH + H2O.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-052",
    "q": "Oxidize a secondary alcohol.",
    "a": "R2CHOH + [O] → R2CO + H2O.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-053",
    "q": "What happens when a tertiary alcohol is subjected to the usual mild oxidation?",
    "a": "It does not undergo the corresponding carbonyl-forming oxidation under those conditions.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-054",
    "q": "Oxidize 2-propanol.",
    "a": "CH3CHOHCH3 + [O] —K2Cr2O7/H+→ CH3COCH3 + H2O.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-055",
    "q": "Oxidize 2-butanol.",
    "a": "CH3CH(OH)CH2CH3 + [O] → CH3COCH2CH3 + H2O.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-056",
    "q": "Oxidize 1-butanol completely.",
    "a": "CH3CH2CH2CH2OH + 2[O] → CH3CH2CH2COOH + H2O.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-057",
    "q": "What is dehydration of alcohol?",
    "a": "Elimination of water from alcohol to form an alkene (under suitable acid/heat conditions).",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-058",
    "q": "Dehydrate ethanol to ethene.",
    "a": "CH3CH2OH —conc. H2SO4, heat→ CH2=CH2 + H2O.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-059",
    "q": "React ethanol with sodium.",
    "a": "2CH3CH2OH + 2Na → 2CH3CH2ONa + H2.",
    "topic": "03",
    "pages": "PDF 25–42, 66–77",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-060",
    "q": "What is the functional group of an ether?",
    "a": "R–O–R′.",
    "topic": "04",
    "pages": "PDF 43–50, 78–80",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-061",
    "q": "Name CH3–O–CH3.",
    "a": "Dimethyl ether (methoxymethane).",
    "topic": "04",
    "pages": "PDF 43–50, 78–80",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-062",
    "q": "Name CH3CH2–O–CH2CH3.",
    "a": "Ethoxyethane (diethyl ether).",
    "topic": "04",
    "pages": "PDF 43–50, 78–80",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-063",
    "q": "What is Williamson ether synthesis?",
    "a": "Alkoxide + alkyl halide → ether + halide salt.",
    "topic": "04",
    "pages": "PDF 43–50, 78–80",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-064",
    "q": "Prepare ethoxyethane using Williamson synthesis.",
    "a": "CH3CH2ONa + CH3CH2Cl → CH3CH2OCH2CH3 + NaCl.",
    "topic": "04",
    "pages": "PDF 43–50, 78–80",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-065",
    "q": "Prepare ethoxypropane starting from ethanol (two steps).",
    "a": "2CH3CH2OH + 2Na → 2CH3CH2ONa + H2; CH3CH2ONa + CH3CH2CH2X → CH3CH2OCH2CH2CH3 + NaX.",
    "topic": "04",
    "pages": "PDF 43–50, 78–80",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-066",
    "q": "Define aldehydes.",
    "a": "Carbonyl compounds R–CHO, with a hydrogen attached to carbonyl carbon; general formula CnH2nO for saturated acyclic monoaldehydes.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-067",
    "q": "Define ketones.",
    "a": "Carbonyl compounds R–CO–R′, with two alkyl groups attached to carbonyl carbon; general formula CnH2nO for saturated acyclic monoketones.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-068",
    "q": "Why are aldehydes and ketones called carbonyl compounds?",
    "a": "Both possess the carbonyl group C=O.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-069",
    "q": "Why are aldehydes more readily oxidized than ketones?",
    "a": "Aldehydes have a hydrogen directly bonded to the carbonyl carbon.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-070",
    "q": "What are aldehyde and ketone naming suffixes?",
    "a": "Aldehyde: -al; ketone: -one.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-071",
    "q": "Give formulas of methanal, ethanal and propanal.",
    "a": "HCHO; CH3CHO; CH3CH2CHO.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-072",
    "q": "Give formulas of propanone, butan-2-one and pentan-3-one.",
    "a": "CH3COCH3; CH3COCH2CH3; CH3CH2COCH2CH3.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-073",
    "q": "Give the formula of 3-methylbutanal.",
    "a": "CH3–CH(CH3)–CH2–CHO.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-074",
    "q": "Give the formula of hexan-2-one.",
    "a": "CH3COCH2CH2CH2CH3.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-075",
    "q": "Prepare methanal from methanol.",
    "a": "CH3OH + [O] —K2Cr2O7/H+→ HCHO + H2O.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-076",
    "q": "Prepare propanal from 1-propanol.",
    "a": "CH3CH2CH2OH + [O] → CH3CH2CHO + H2O.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-077",
    "q": "Prepare propanone from 2-propanol.",
    "a": "CH3CHOHCH3 + [O] → CH3COCH3 + H2O.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-078",
    "q": "Reduce propanal to 1-propanol.",
    "a": "CH3CH2CHO + H2 —Ni→ CH3CH2CH2OH.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-079",
    "q": "Reduce propanone to 2-propanol.",
    "a": "CH3COCH3 + H2 —Ni→ CH3CHOHCH3.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-080",
    "q": "Reduce propanal to propane (carbonyl removal).",
    "a": "CH3CH2CHO —Zn/Hg + HCl→ CH3CH2CH3 (Clemmensen reduction).",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-081",
    "q": "What is the aldehyde oxidation equation?",
    "a": "RCHO + [O] → RCOOH.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-082",
    "q": "What is Tollens’ reagent used for?",
    "a": "It distinguishes aldehydes from ketones by silver mirror formation with aldehydes.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-083",
    "q": "What is Fehling’s solution used for?",
    "a": "It differentiates aldehydes from ketones: aldehydes give brick-red Cu2O precipitate (as studied in the PDF).",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-084",
    "q": "What does propanone give with Tollens’ reagent?",
    "a": "No reaction / no silver mirror.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-085",
    "q": "How can ethanal and propanone be distinguished experimentally?",
    "a": "Tollens’ silver mirror or Fehling’s brick-red precipitate with ethanal; no corresponding positive test with propanone.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-086",
    "q": "Write the condensation of propanal with hydrazine.",
    "a": "CH3CH2CHO + H2NNH2 → CH3CH2CH=NNH2 + H2O.",
    "topic": "05",
    "pages": "PDF 82–102",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-087",
    "q": "Define carboxylic acid and its functional group.",
    "a": "R–COOH; carboxyl functional group –COOH composed of C=O and –OH. General formula CnH2nO2 for saturated acyclic monocarboxylic acids.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-088",
    "q": "What suffix is used to name carboxylic acids?",
    "a": "-oic acid; the carbon of –COOH is carbon number 1.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-089",
    "q": "Name HCOOH, CH3COOH and CH3CH2COOH.",
    "a": "Methanoic, ethanoic and propanoic acids.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-090",
    "q": "Give the structural formula of 2-methylbutanoic acid.",
    "a": "CH3CH2CH(CH3)COOH.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-091",
    "q": "Give the structural formula of 3-chloropropanoic acid.",
    "a": "ClCH2CH2COOH.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-092",
    "q": "Give the structural formula of butanoic acid.",
    "a": "CH3CH2CH2COOH.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-093",
    "q": "Describe Grignard preparation of carboxylic acid.",
    "a": "RX + Mg —dry ether→ RMgX; RMgX + CO2 → RCOOMgX; then H2O/H+ → RCOOH.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-094",
    "q": "Prepare ethanoic acid from chloromethane using Grignard.",
    "a": "CH3Cl + Mg —dry ether→ CH3MgCl; + CO2 → CH3COOMgCl; + H2O/H+ → CH3COOH.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-095",
    "q": "Prepare ethanoic acid by oxidation of ethanol.",
    "a": "CH3CH2OH + [O] → CH3CHO + H2O; CH3CHO + [O] → CH3COOH.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-096",
    "q": "Prepare propanoic acid from propanal.",
    "a": "CH3CH2CHO + [O] —K2Cr2O7/H+→ CH3CH2COOH.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-097",
    "q": "How do carboxylic acids react with carbonates?",
    "a": "2RCOOH + Na2CO3 → 2RCOONa + CO2 + H2O.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-098",
    "q": "How do carboxylic acids react with bicarbonates?",
    "a": "RCOOH + NaHCO3 → RCOONa + CO2 + H2O.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-099",
    "q": "How can you distinguish butanal from butanoic acid?",
    "a": "Butanoic acid reacts with sodium bicarbonate to release CO2; butanal does not.",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-100",
    "q": "Prepare ethyl ethanoate from ethanoic acid.",
    "a": "CH3COOH + CH3CH2OH ⇌ CH3COOCH2CH3 + H2O (H+, heat).",
    "topic": "06",
    "pages": "PDF 103–118",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-101",
    "q": "Define ester and functional group.",
    "a": "Carboxylic acid derivative with general structure R–COO–R′.",
    "topic": "07",
    "pages": "PDF 119–127",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-102",
    "q": "Name CH3COOCH3.",
    "a": "Methyl ethanoate.",
    "topic": "07",
    "pages": "PDF 119–127",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-103",
    "q": "Name HCOOCH3.",
    "a": "Methyl methanoate.",
    "topic": "07",
    "pages": "PDF 119–127",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-104",
    "q": "How are esters prepared by esterification?",
    "a": "RCOOH + R′OH ⇌ RCOOR′ + H2O (acid-catalyzed).",
    "topic": "07",
    "pages": "PDF 119–127",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-105",
    "q": "How is an ester hydrolyzed in acid?",
    "a": "RCOOR′ + H2O ⇌ RCOOH + R′OH (H+).",
    "topic": "07",
    "pages": "PDF 119–127",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-106",
    "q": "What is alkaline ester hydrolysis (saponification)?",
    "a": "RCOOR′ + NaOH → RCOONa + R′OH.",
    "topic": "07",
    "pages": "PDF 119–127",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-107",
    "q": "Hydrolyze methyl ethanoate with NaOH.",
    "a": "CH3COOCH3 + NaOH → CH3COONa + CH3OH.",
    "topic": "07",
    "pages": "PDF 119–127",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-108",
    "q": "Hydrolyze ethyl ethanoate with NaOH.",
    "a": "CH3COOCH2CH3 + NaOH → CH3COONa + CH3CH2OH.",
    "topic": "07",
    "pages": "PDF 119–127",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-109",
    "q": "Define amines.",
    "a": "Derivatives of ammonia NH3 in which one or more H atoms are replaced by alkyl groups.",
    "topic": "08",
    "pages": "PDF 128–140",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-110",
    "q": "Classify amines by alkyl substitution.",
    "a": "Primary RNH2; secondary R2NH; tertiary R3N.",
    "topic": "08",
    "pages": "PDF 128–140",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-111",
    "q": "Give formulas for methylamine, ethylamine, propylamine.",
    "a": "CH3NH2; CH3CH2NH2; CH3CH2CH2NH2.",
    "topic": "08",
    "pages": "PDF 128–140",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-112",
    "q": "Prepare a primary amine from alkyl halide and ammonia.",
    "a": "RX + NH3 → RNH3+X−; then base (NaOH) → RNH2 + NaX + H2O.",
    "topic": "08",
    "pages": "PDF 128–140",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-113",
    "q": "Prepare propylamine from 1-iodopropane.",
    "a": "CH3CH2CH2I + NH3 → [CH3CH2CH2NH3]I; + NaOH → CH3CH2CH2NH2 + NaI + H2O.",
    "topic": "08",
    "pages": "PDF 128–140",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-114",
    "q": "Prepare methylamine from methanol.",
    "a": "CH3OH + NH3 —Al2O3, heat→ CH3NH2 + H2O.",
    "topic": "08",
    "pages": "PDF 128–140",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-115",
    "q": "Prepare ethylamine from ethanol.",
    "a": "CH3CH2OH + NH3 —Al2O3, heat→ CH3CH2NH2 + H2O.",
    "topic": "08",
    "pages": "PDF 128–140",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-116",
    "q": "Why are amines Lewis bases?",
    "a": "The nitrogen atom has a lone electron pair that can be donated.",
    "topic": "08",
    "pages": "PDF 128–140",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH7-117",
    "q": "How can you distinguish ethylamine and ethane?",
    "a": "Ethylamine is basic and changes moist red litmus toward blue; ethane is not basic.",
    "topic": "08",
    "pages": "PDF 128–140",
    "ministerialLabel": "",
    "years": []
  }
];
