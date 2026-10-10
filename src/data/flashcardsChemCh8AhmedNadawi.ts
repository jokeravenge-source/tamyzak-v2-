// Ahmed Al-Nadawi Chemistry CH8 — all 106 supplied Biochemistry cards.
// Retain source order, equations, numerical data and readable ministerial labels.
// Source: docs/flashcards/ahmed-al-nadawi/Ahmed_Al_Nadawi_CH8_Biochemistry_Flashcards.txt.

export type AhmedNadawiChemCh8Card = {
  id: string;
  q: string;
  a: string;
  topic: string;
  ministerialLabel: string;
  years: string[];
};

export const ahmedNadawiChemCh8Source = {
  "file": "Ahmed_Al_Nadawi_CH8_Biochemistry_Flashcards.txt",
  "uploadedFile": "نص ملصق(5).txt",
  "chapter": 8,
  "title": "Biochemistry",
  "sourcePdf": "Chapter Eight.pdf",
  "sourcePages": 26,
  "sha256": "605d0fa12b9f758566a4d0be3e22b1ccb6be569745dc62137a8ca99f5aab86ec",
  "cardCount": 106,
  "cardsWithMinisterialLabels": 7,
  "sourceFidelityNote": "All 106 supplied flashcards are retained in source order. Repeated ministerial questions are grouped in the supplied source; year labels are preserved only where readable, and structural drawings remain in the source's text or formula form."
} as const;

export const ahmedNadawiChemCh8Topics = [
  {
    "key": "01",
    "title": "Biochemistry & Carbohydrates",
    "titleAr": "أساسيات الكيمياء الحياتية والكربوهيدرات",
    "expectedCount": 8
  },
  {
    "key": "02",
    "title": "Glucose",
    "titleAr": "الكلوكوز",
    "expectedCount": 11
  },
  {
    "key": "03",
    "title": "Fructose",
    "titleAr": "الفركتوز",
    "expectedCount": 8
  },
  {
    "key": "04",
    "title": "Disaccharides & Sucrose",
    "titleAr": "السكريات الثنائية والسكروز",
    "expectedCount": 8
  },
  {
    "key": "05",
    "title": "Proteins & Amino Acids",
    "titleAr": "البروتينات والأحماض الأمينية",
    "expectedCount": 14
  },
  {
    "key": "06",
    "title": "Enzymes",
    "titleAr": "الإنزيمات",
    "expectedCount": 12
  },
  {
    "key": "07",
    "title": "Lipids & Fats",
    "titleAr": "الدهون والشحوم",
    "expectedCount": 10
  },
  {
    "key": "08",
    "title": "Soaps & Saponification",
    "titleAr": "الصابون والتصبّن",
    "expectedCount": 12
  },
  {
    "key": "09",
    "title": "Polysaccharides, Starch & Cellulose",
    "titleAr": "السكريات المتعددة والنشا والسليلوز",
    "expectedCount": 12
  },
  {
    "key": "10",
    "title": "Important Protein Reactions & Chapter Exercises",
    "titleAr": "تفاعلات البروتين المهمة وتمارين الفصل",
    "expectedCount": 11
  }
] as const;

export const ahmedNadawiChemCh8Cards: AhmedNadawiChemCh8Card[] = [
  {
    "id": "CH8-001",
    "q": "Define biochemistry.",
    "a": "Biochemistry is the branch of science that studies the chemical changes and biosynthesis occurring in living organisms and explains biological phenomena in chemical terms.",
    "topic": "01",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-002",
    "q": "Define carbohydrates.",
    "a": "Carbohydrates are organic compounds consisting of carbon, hydrogen, and oxygen. Their general formula is commonly represented as (CH₂O)ₙ or Cₙ(H₂O)ₙ.",
    "topic": "01",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-003",
    "q": "Why are carbohydrates called carbohydrates?",
    "a": "Because their name is derived from carbon and hydrate (water), reflecting their general composition.",
    "topic": "01",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-004",
    "q": "Classify carbohydrates and give examples of each.",
    "a": "1. Monosaccharides: Glucose and fructose.\n2. Disaccharides: Sucrose, maltose, and lactose.\n3. Polysaccharides: Starch and cellulose.",
    "topic": "01",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-005",
    "q": "What are the two general groups of carbohydrates?",
    "a": "1. Simple carbohydrates.\n2. Complex carbohydrates.",
    "topic": "01",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-006",
    "q": "In which structural forms can carbohydrates exist?",
    "a": "Open-chain and cyclic structures.",
    "topic": "01",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-007",
    "q": "Give an example of a disaccharide.",
    "a": "Maltose.",
    "topic": "01",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-008",
    "q": "Give two examples of polysaccharides.",
    "a": "Starch and cellulose.",
    "topic": "01",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-009",
    "q": "Define glucose and mention its occurrence in nature.",
    "a": "Glucose is a monosaccharide known as grape sugar. It is naturally found in grapes and blood.",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-010",
    "q": "What is the molecular formula of glucose?",
    "a": "C₆H₁₂O₆ or C₆(H₂O)₆.",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-011",
    "q": "Explain the open and cyclic structures of glucose.",
    "a": "- Open structure: Contains one aldehyde group (–CHO) and several hydroxyl groups (–OH).\n- Cyclic structure: Contains an ether linkage and several hydroxyl groups.",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-012",
    "q": "Justify: Glucose has a high boiling point.",
    "a": "Because hydrogen bonds form between glucose molecules through their hydroxyl groups, increasing its boiling point.",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-013",
    "q": "Justify: Glucose dissolves strongly in water.",
    "a": "Because glucose forms hydrogen bonds with water molecules.",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-014",
    "q": "Justify: Glucose has chemical properties similar to alcohols and aldehydes.",
    "a": "Because its open structure contains several hydroxyl groups (–OH) and one aldehyde group (–CHO).",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-015",
    "q": "Why does glucose react with Tollens' reagent and Fehling's solution?",
    "a": "Because glucose contains an aldehyde group in its open-chain structure and behaves as a reducing sugar.",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-016",
    "q": "Mention the physical properties of glucose.",
    "a": "1. Crystalline solid.\n2. High boiling point.\n3. Soluble in water.\n4. Forms hydrogen bonds.",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-017",
    "q": "Mention an important medical use of glucose.",
    "a": "It is used as a nutrient for patients who cannot be fed orally and during surgical operations.",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-018",
    "q": "Write the open structural formula of glucose.",
    "a": "```\n    CHO\n     |\n   H–C–OH\n     |\n  HO–C–H\n     |\n   H–C–OH\n     |\n   H–C–OH\n     |\n   CH₂OH\n```",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-019",
    "q": "What functional group distinguishes the open structure of glucose?",
    "a": "The aldehyde group (–CHO).",
    "topic": "02",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-020",
    "q": "Define fructose.",
    "a": "Fructose is a monosaccharide known as fruit sugar, found naturally in honey and most fruits.",
    "topic": "03",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-021",
    "q": "What is the molecular formula of fructose?",
    "a": "C₆H₁₂O₆.",
    "topic": "03",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-022",
    "q": "Compare glucose and fructose.",
    "a": "- Both have the molecular formula C₆H₁₂O₆.\n- Glucose contains an aldehyde group in its open structure.\n- Fructose contains a ketone group in its open structure.\n- Both contain hydroxyl groups.",
    "topic": "03",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-023",
    "q": "Explain the open and cyclic structures of fructose.",
    "a": "- Open structure: Contains a ketone carbonyl group and several hydroxyl groups.\n- Cyclic structure: Contains an ether linkage and hydroxyl groups.",
    "topic": "03",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-024",
    "q": "Justify: Fructose is classified as a reducing sugar although it is a ketone.",
    "a": "Because fructose gives positive reactions with Tollens' reagent and Fehling's solution.",
    "topic": "03",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-025",
    "q": "Why do fructose and glucose have similar physical properties?",
    "a": "Because they have the same molecular formula and contain several hydroxyl groups.",
    "topic": "03",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-026",
    "q": "Why is fructose soluble in water and has a high boiling point?",
    "a": "Because it contains hydroxyl groups capable of forming hydrogen bonds.",
    "topic": "03",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-027",
    "q": "What functional group distinguishes open-chain fructose from glucose?",
    "a": "The ketone group (C=O).",
    "topic": "03",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-028",
    "q": "Define disaccharides.",
    "a": "Disaccharides are carbohydrates formed from two monosaccharide units joined by a glycosidic bond with the elimination of one water molecule.",
    "topic": "04",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-029",
    "q": "Give three examples of disaccharides.",
    "a": "Sucrose, maltose, and lactose.",
    "topic": "04",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-030",
    "q": "Define sucrose.",
    "a": "Sucrose is a disaccharide known as cane sugar, produced from sugar cane and consisting of glucose and fructose.",
    "topic": "04",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-031",
    "q": "What is the molecular formula of sucrose?",
    "a": "C₁₂H₂₂O₁₁.",
    "topic": "04",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-032",
    "q": "Name the monosaccharides that form sucrose.",
    "a": "Glucose and fructose.",
    "topic": "04",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-033",
    "q": "What type of bond connects glucose and fructose in sucrose?",
    "a": "A glycosidic bond.",
    "topic": "04",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-034",
    "q": "Write the formation equation of sucrose.",
    "a": "Glucose + Fructose → Sucrose + H₂O\n\nC₆H₁₂O₆ + C₆H₁₂O₆ → C₁₂H₂₂O₁₁ + H₂O",
    "topic": "04",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-035",
    "q": "What happens to sucrose during digestion?",
    "a": "Its glycosidic bond is broken by hydrolysis, producing glucose and fructose.\n\nSucrose + H₂O → Glucose + Fructose",
    "topic": "04",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-036",
    "q": "Define proteins.",
    "a": "Proteins are organic compounds containing carbon, hydrogen, oxygen, and nitrogen, sometimes sulfur and phosphorus. They are formed by the bonding of many amino acids through peptide bonds.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-037",
    "q": "What are the main building units of proteins?",
    "a": "Amino acids.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-038",
    "q": "What elements are found in proteins?",
    "a": "Carbon, hydrogen, oxygen, and nitrogen. Some proteins also contain sulfur and phosphorus.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-039",
    "q": "What is the general structural formula of an amino acid?",
    "a": "```\n      H\n      |\nH₂N – C – COOH\n      |\n      R\n```\n\nWhere:\n\n- –NH₂: Amino group.\n- –COOH: Carboxyl group.\n- R: Alkyl or side-chain group.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-040",
    "q": "What two functional groups are found in all amino acids?",
    "a": "Amino group (–NH₂) and carboxyl group (–COOH).",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-041",
    "q": "What causes the differences between amino acids?",
    "a": "Differences in their R groups (side chains).",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-042",
    "q": "Justify: Proteins have amphoteric properties.",
    "a": "Because they contain carboxyl groups with acidic properties and amino groups with basic properties, allowing them to react with both acids and bases.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-043",
    "q": "Why can proteins react with acids and bases?",
    "a": "Because they possess both acidic carboxyl groups and basic amino groups.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-044",
    "q": "Justify: Proteins cannot easily be separated by simple chemical methods.",
    "a": "Because they have similar chemical compositions and physical and chemical properties.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-045",
    "q": "How are peptide bonds formed?",
    "a": "By joining amino acids together with the elimination of water molecules.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-046",
    "q": "What determines the functions of proteins?",
    "a": "The types, numbers, and sequences of amino acids within their structures.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-047",
    "q": "How can proteins be broken down into amino acids?",
    "a": "By hydrolysis using inorganic acids such as HCl, which breaks peptide (amide) bonds.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-048",
    "q": "What happens when proteins react with NaOH?",
    "a": "They can be broken down to form salts of amino acids.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-049",
    "q": "Give examples of important proteins in living organisms.",
    "a": "Enzymes, hormones, hemoglobin, and keratin.",
    "topic": "05",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-050",
    "q": "Ministerial (2013 Preliminary, 2014 First Round, 2016, 2017, 2019 (as indicated in the chapter)): Define enzymes.",
    "a": "Enzymes are biological catalysts, generally proteins, produced by living organisms. They participate in vital processes such as digestion, metabolism, and respiration by reducing the energy required for reactions.",
    "topic": "06",
    "ministerialLabel": "2013 Preliminary, 2014 First Round, 2016, 2017, 2019 (as indicated in the chapter)",
    "years": [
      "2013",
      "2014",
      "2016",
      "2017",
      "2019"
    ]
  },
  {
    "id": "CH8-051",
    "q": "Ministerial (2013, 2014, 2016, 2017): Enumerate the properties of enzymes.",
    "a": "1. They are proteins.\n2. They are found in living cells.\n3. They act as biological catalysts.\n4. They participate in digestion, metabolism, and respiration.\n5. They are produced in living organisms.\n6. They are constantly renewed.\n7. They work at a specific pH.\n8. High temperatures can destroy their activity.\n9. They reduce the energy needed for reactions.",
    "topic": "06",
    "ministerialLabel": "2013, 2014, 2016, 2017",
    "years": [
      "2013",
      "2014",
      "2016",
      "2017"
    ]
  },
  {
    "id": "CH8-052",
    "q": "What are the two types of enzymes?",
    "a": "Internal enzymes and external enzymes.",
    "topic": "06",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-053",
    "q": "Ministerial (2014 Second Round, 2016 Third Round, 2018 Third Round): Define internal enzymes.",
    "a": "Internal enzymes perform their functions inside cells and do not pass through the cell membrane, such as oxidative enzymes.",
    "topic": "06",
    "ministerialLabel": "2014 Second Round, 2016 Third Round, 2018 Third Round",
    "years": [
      "2014",
      "2016",
      "2018"
    ]
  },
  {
    "id": "CH8-054",
    "q": "Ministerial (2013 Second Round, 2015 First Round, 2018 First Round): Define external enzymes.",
    "a": "External enzymes perform their functions outside cells after being secreted, such as digestive enzymes.",
    "topic": "06",
    "ministerialLabel": "2013 Second Round, 2015 First Round, 2018 First Round",
    "years": [
      "2013",
      "2015",
      "2018"
    ]
  },
  {
    "id": "CH8-055",
    "q": "Compare internal and external enzymes.",
    "a": "| Internal enzymes           | External enzymes           |\n| -------------------------- | -------------------------- |\n| Work inside cells          | Work outside cells         |\n| Do not leave the cell      | Are secreted from cells    |\n| Example: Oxidative enzymes | Example: Digestive enzymes |",
    "topic": "06",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-056",
    "q": "Justify: High temperatures affect enzyme activity.",
    "a": "Because high temperatures disrupt the enzyme structure and prevent it from functioning properly.",
    "topic": "06",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-057",
    "q": "Why do enzymes work at a specific pH?",
    "a": "Their activity depends on the surrounding pH, and they function effectively within a suitable pH range.",
    "topic": "06",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-058",
    "q": "Why are enzymes continuously renewed in living organisms?",
    "a": "Because they gradually lose their effectiveness over time.",
    "topic": "06",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-059",
    "q": "What is the role of enzymes in biological reactions?",
    "a": "They act as catalysts that facilitate chemical reactions by lowering the required activation energy.",
    "topic": "06",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-060",
    "q": "Fill in the blanks: External enzymes perform their duties \\_\\_\\_\\_\\_\\_ cells, such as \\_\\_\\_\\_\\_\\_ enzymes.",
    "a": "Outside; digestive.",
    "topic": "06",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-061",
    "q": "Give an example of each type of enzyme.",
    "a": "- Internal: Oxidative enzymes.\n- External: Digestive enzymes.\n\nExam note: The source's English explanation says enzymes supply energy for reactions, while its Arabic explanation describes reducing the required energy. The flashcards use the latter meaning.",
    "topic": "06",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-062",
    "q": "Define lipids.",
    "a": "Lipids are organic compounds represented by animal fats and vegetable oils. They are used for energy storage and dissolve in organic solvents rather than water.",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-063",
    "q": "Compare animal fats and vegetable oils.",
    "a": "| Animal fats                         | Vegetable oils                           |\n| ----------------------------------- | ---------------------------------------- |\n| Generally solid at room temperature | Generally liquid at room temperature     |\n| Found in animal tissues             | Found in plants, such as cotton and corn |",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-064",
    "q": "Why are lipids important to living organisms?",
    "a": "They store energy that can be released when needed through digestion and oxidation.",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-065",
    "q": "Mention industrial uses of lipids.",
    "a": "Soap, paint, and candle production.",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-066",
    "q": "Why don't lipids dissolve in water?",
    "a": "Because they are largely nonpolar compounds, while water is polar.",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-067",
    "q": "Name two organic solvents in which lipids dissolve.",
    "a": "Ether and chloroform.",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-068",
    "q": "How are triglycerides formed?",
    "a": "By the esterification of glycerol with three fatty acid molecules.",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-069",
    "q": "Write the general equation for triglyceride formation.",
    "a": "Glycerol + 3 Fatty acids → Triglyceride + 3H₂O",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-070",
    "q": "What is the carbon-chain range of fatty acids mentioned in the chapter?",
    "a": "C₁₂–C₂₄.",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-071",
    "q": "What functional group is found at one end of a fatty acid?",
    "a": "The carboxyl group (–COOH).",
    "topic": "07",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-072",
    "q": "Ministerial (2014 First Round): Define soap.",
    "a": "Soap is the sodium or potassium salt of fatty acids.",
    "topic": "08",
    "ministerialLabel": "2014 First Round",
    "years": [
      "2014"
    ]
  },
  {
    "id": "CH8-073",
    "q": "Define saponification.",
    "a": "Saponification is the reaction of fats or oils with strong bases, such as NaOH or KOH, to produce soap and glycerol.",
    "topic": "08",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-074",
    "q": "What raw materials are used in soap production?",
    "a": "Fats or vegetable oils and sodium hydroxide (NaOH) or potassium hydroxide (KOH).",
    "topic": "08",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-075",
    "q": "Write the general saponification equation.",
    "a": "Triglyceride + 3NaOH → Glycerol + 3RCOONa\n\nWhere RCOONa represents the sodium salt of a fatty acid (soap).",
    "topic": "08",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-076",
    "q": "Ministerial (2014, 2015 Preliminary): Write the equation for the production of sodium palmitate soap.",
    "a": "Glyceryl tripalmitate + 3NaOH → Glycerol + 3Sodium palmitate\n\nC₃H₅(OCOC₁₅H₃₁)₃ + 3NaOH → C₃H₅(OH)₃ + 3C₁₅H₃₁COONa",
    "topic": "08",
    "ministerialLabel": "2014, 2015 Preliminary",
    "years": [
      "2014",
      "2015"
    ]
  },
  {
    "id": "CH8-077",
    "q": "On what do the shape and quality of soap depend?",
    "a": "On the type of base and oil used during saponification.",
    "topic": "08",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-078",
    "q": "What type of soap is produced using sodium hydroxide?",
    "a": "Hard soap, such as ordinary soap bars.",
    "topic": "08",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-079",
    "q": "What type of soap is produced using potassium hydroxide?",
    "a": "Soft soap, such as liquid soap and shaving foam.",
    "topic": "08",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-080",
    "q": "Justify: Sodium chloride is added during soap production.",
    "a": "To separate and precipitate the soap from the reaction mixture.",
    "topic": "08",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-081",
    "q": "Why is the final soap product washed with water?",
    "a": "To remove remaining salt.",
    "topic": "08",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-082",
    "q": "Ministerial (2017 First Round, Outside Iraq): Why are calcium hydroxide and magnesium hydroxide not used instead of NaOH and KOH in soap production?",
    "a": "Because Ca²⁺ and Mg²⁺ ions are associated with water hardness, and soap does not foam properly in hard water.",
    "topic": "08",
    "ministerialLabel": "2017 First Round, Outside Iraq",
    "years": [
      "2017"
    ]
  },
  {
    "id": "CH8-083",
    "q": "Compare the products formed when NaOH and KOH are used in saponification.",
    "a": "- NaOH: Sodium salts of fatty acids, producing hard soap.\n- KOH: Potassium salts of fatty acids, producing soft soap.",
    "topic": "08",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-084",
    "q": "Define polysaccharides.",
    "a": "Polysaccharides are large carbohydrate molecules (polymers) formed by joining many monosaccharide units.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-085",
    "q": "Polysaccharides — Give two examples of polysaccharides.",
    "a": "Starch and cellulose.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-086",
    "q": "Define starch.",
    "a": "Starch is a polysaccharide formed by linking many glucose molecules together to produce a large polymer.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-087",
    "q": "What is the basic structural unit of starch?",
    "a": "Glucose.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-088",
    "q": "Give an example of a food that contains starch.",
    "a": "Potato.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-089",
    "q": "Define cellulose.",
    "a": "Cellulose is a polysaccharide consisting of many glucose units linked together to form a large polymer.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-090",
    "q": "What are the natural sources of cellulose mentioned in the chapter?",
    "a": "Wood fibers and the peels of some fruits, including dates.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-091",
    "q": "Why do starch and cellulose have different properties although both are formed from glucose?",
    "a": "Because they differ in the number of glucose units and the way these units are bonded together.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-092",
    "q": "What substances can break down cellulose molecules according to the chapter?",
    "a": "Certain enzymes and acidic solutions.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-093",
    "q": "How can starch be detected?",
    "a": "Add a few drops of iodine solution in potassium iodide to the sample. The appearance of a blue color indicates starch.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-094",
    "q": "How can you distinguish between starch and glucose?",
    "a": "- Starch: Produces a blue color with iodine solution.\n- Glucose: Does not produce the blue color with iodine solution.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-095",
    "q": "What is the basic unit common to both starch and cellulose?",
    "a": "Glucose.",
    "topic": "09",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-096",
    "q": "What happens when proteins undergo hydrolysis?",
    "a": "Their peptide bonds break, producing smaller units and ultimately amino acids.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-097",
    "q": "What is the effect of HCl on proteins?",
    "a": "It breaks the amide (peptide) bonds during hydrolysis, producing amino acids.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-098",
    "q": "What is the effect of NaOH on proteins?",
    "a": "It can hydrolyze proteins to form salts of amino acids.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-099",
    "q": "How many different amino acids are mentioned in the chapter as occurring in nature?",
    "a": "More than 20.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-100",
    "q": "Give two different structural forms of proteins.",
    "a": "1. Fibrous form, such as keratin in hair and wool.\n2. Approximately globular form, such as proteins found in eggs.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-101",
    "q": "Why do proteins have different biological functions?",
    "a": "Because their sizes, shapes, amino acid compositions, and amino acid sequences differ.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-102",
    "q": "Which of the following is NOT a characteristic of proteins?\na) They can contain carbon, oxygen, hydrogen, and sulfur.\nb) They contain carbon, hydrogen, and nitrogen.\nc) They react with acids and bases.",
    "a": "None of the options is necessarily excluded; this question is ambiguous as written in the uploaded chapter.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-103",
    "q": "Which units form sucrose?\na) Glucose\nb) Fructose\nc) Glucose and fructose",
    "a": "c) Glucose and fructose.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-104",
    "q": "Which element is not part of the general amino acid structure?\na) Nitrogen\nb) Phosphorus\nc) Oxygen\nd) Carbon",
    "a": "b) Phosphorus.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-105",
    "q": "Which of the following substances are formed from fatty acids?\na) Proteins\nb) Carbohydrates\nc) Oils (lipids)",
    "a": "c) Oils (lipids).",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  },
  {
    "id": "CH8-106",
    "q": "Justify: Fructose is considered a reducing sugar.",
    "a": "Because it gives positive reactions with Tollens' reagent and Fehling's solution.",
    "topic": "10",
    "ministerialLabel": "",
    "years": []
  }
];
