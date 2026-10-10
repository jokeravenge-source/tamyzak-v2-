// Ahmed Al-Nadawi Chemistry CH6: the complete supplied Chemical Analysis deck.
// All 147 cards, source classifications, numerical variants and exam labels are retained.
// Original: docs/flashcards/ahmed-al-nadawi/Chapter_Six_Chemical_Analysis_Complete_Flashcards.txt.
// Content-specific IDs keep this replacement distinct from the removed duplicate deck.

export type AhmedNadawiChemCh6Card = {
  id: string;
  q: string;
  a: string;
  topic: string;
  kind: "ministerial" | "note" | "practice";
  examLabels: string[];
};

export const ahmedNadawiChemCh6Source = {
  "file": "Chapter_Six_Chemical_Analysis_Complete_Flashcards.txt",
  "uploadedFile": "Chapter_Six_Chemical_Analysis_Complete_Flashcards(1).txt",
  "chapter": 6,
  "sha256": "f8e20dad20875f6c3163fd2995006ca369894a0a770e502b565e47f6c2ae7448",
  "cardCount": 147,
  "ministerialCards": 117,
  "noteCards": 16,
  "practiceCards": 14,
  "examLabels": "Preserved exactly as supplied; no labels are invented for undated cards."
} as const;

export const ahmedNadawiChemCh6Topics = [
  {
    "key": "01",
    "title": "Foundations of Chemical Analysis",
    "titleAr": "أساسيات التحليل الكيميائي",
    "expectedCount": 9
  },
  {
    "key": "02",
    "title": "Qualitative Analysis of Positive Ions",
    "titleAr": "التحليل النوعي للأيونات الموجبة",
    "expectedCount": 30
  },
  {
    "key": "03",
    "title": "Gravimetric Analysis and Volatilization",
    "titleAr": "التحليل الوزني والتطاير",
    "expectedCount": 28
  },
  {
    "key": "04",
    "title": "Volumetric Analysis and Titration",
    "titleAr": "التحليل الحجمي والتسحيح",
    "expectedCount": 10
  },
  {
    "key": "05",
    "title": "Molarity, Normality and Equivalent Mass",
    "titleAr": "المولارية والعيارية والكتلة المكافئة",
    "expectedCount": 24
  },
  {
    "key": "06",
    "title": "Titration Calculations",
    "titleAr": "حسابات التسحيح",
    "expectedCount": 39
  },
  {
    "key": "07",
    "title": "Final Rapid Review",
    "titleAr": "المراجعة النهائية السريعة",
    "expectedCount": 7
  }
] as const;

export const ahmedNadawiChemCh6Cards: AhmedNadawiChemCh6Card[] = [
  {
    "id": "CH6-ANALYSIS-001",
    "q": "What is chemical analysis?",
    "a": "It is the branch of chemistry used to identify the substances or elements in a sample, separate them when necessary, and determine their amounts.",
    "topic": "01",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-002",
    "q": "What is qualitative analysis?",
    "a": "Analysis used to identify what components are present and how they are bonded or combined.",
    "topic": "01",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-003",
    "q": "What is quantitative analysis?",
    "a": "A group of methods used to determine the amount or percentage of a target component in a sample.",
    "topic": "01",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-004",
    "q": "Practice: A chemist identifies chloride in a sample and then determines that it forms 18.5% of the sample. Which part is qualitative and which is quantitative?",
    "a": "Identifying chloride is qualitative analysis; determining 18.5% is quantitative analysis.",
    "topic": "01",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-005",
    "q": "What two operations are required when a mixture of positive ions is analyzed qualitatively?",
    "a": "(1) Separate the ions into groups or individual ions. (2) Detect each ion using a characteristic chemical reaction.",
    "topic": "01",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-006",
    "q": "What is a detector/reagent in qualitative analysis?",
    "a": "A known chemical substance that converts the target ion into a compound with recognizable properties, such as a characteristic precipitate or color.",
    "topic": "01",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-007",
    "q": "Ministerial: What steps precede quantitative analysis?",
    "a": "(1) Obtain a representative sample, (2) prepare it by grinding, mixing, homogenizing and removing moisture, (3) measure the sample, (4) dissolve it, and (5) separate interfering substances.",
    "topic": "01",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-008",
    "q": "Ministerial: What is sampling/representative sampling?",
    "a": "Obtaining a sample that correctly represents the whole material to be analyzed.",
    "topic": "01",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-009",
    "q": "Practice: A solid sample contains wet lumps and is not homogeneous. What must be done before analysis?",
    "a": "Grind it, mix it thoroughly, make it homogeneous, remove moisture, accurately measure it, then dissolve it in a suitable solvent.",
    "topic": "01",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-010",
    "q": "Give the positive-ion groups and their ions.",
    "a": "Group I: Ag+, Hg2^2+, Pb2+. Group II: Cd2+, Bi3+, Cu2+, As3+, Sn2+, Sb3+, Hg2+, Pb2+. Group IIIA: Al3+, Cr3+, Fe3+. Group IIIB: Mn2+, Zn2+, Ni2+, Co2+. Group IV: Ba2+, Ca2+, Sr2+. Group V: Mg2+, Na+, K+, NH4+.",
    "topic": "02",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-011",
    "q": "Ministerial: What are the precipitants of Groups I, II, IIIA and IV?",
    "a": "Group I: dilute HCl. Group II: H2S in the presence of dilute HCl. Group IIIA: NH4OH in the presence of NH4Cl. Group IV: (NH4)2CO3 in the presence of NH4OH and NH4Cl.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-012",
    "q": "Ministerial: What is the precipitant of Group IIIB?",
    "a": "H2S in the presence of NH4OH and NH4Cl.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-013",
    "q": "Ministerial: Which two groups precipitate as sulfides?",
    "a": "Group II and Group IIIB.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-014",
    "q": "Ministerial: Complete: Group I precipitates as ___, Group II as ___, Group IIIA as ___, Group IV as ___.",
    "a": "Chlorides; sulfides; hydroxides; carbonates.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-015",
    "q": "Ministerial: Why is Pb2+ included in both Groups I and II?",
    "a": "PbCl2 has appreciable solubility, so dilute HCl may not precipitate all Pb2+. The remaining Pb2+ can later precipitate as PbS with Group II.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-016",
    "q": "Practice: A solution contains Ag+, Fe3+ and Ba2+. State the ordered reagents used to separate them.",
    "a": "Add dilute HCl to precipitate AgCl; filter. Add NH4OH with NH4Cl to precipitate Fe(OH)3; filter. Add (NH4)2CO3 with NH4OH/NH4Cl to precipitate BaCO3.",
    "topic": "02",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-017",
    "q": "Ministerial (3/2015, 2/2017, 1/2013): How are Ag+ and Cd2+ separated?",
    "a": "Add dilute HCl: Ag+ + HCl -> AgCl(s) + H+; filter AgCl. Pass H2S through the acidified filtrate: Cd2+ + H2S -> CdS(s) + 2H+; filter CdS.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": [
      "3/2015",
      "2/2017",
      "1/2013"
    ]
  },
  {
    "id": "CH6-ANALYSIS-018",
    "q": "Ministerial: How are Ag+, Ba2+ and Al3+ separated?",
    "a": "Dilute HCl precipitates AgCl. NH4OH/NH4Cl then precipitates Al(OH)3. Finally (NH4)2CO3 in NH4OH/NH4Cl precipitates BaCO3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-019",
    "q": "Ministerial: How are Ag+, Ba2+ and Fe3+ separated?",
    "a": "Dilute HCl precipitates AgCl; NH4OH/NH4Cl precipitates Fe(OH)3; (NH4)2CO3 in NH4OH/NH4Cl precipitates BaCO3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-020",
    "q": "Ministerial (2/2019, 3/2016): How are Ag+, Cd2+ and Fe3+ separated?",
    "a": "Dilute HCl precipitates AgCl. H2S in dilute HCl precipitates CdS. NH4OH/NH4Cl precipitates Fe(OH)3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": [
      "2/2019",
      "3/2016"
    ]
  },
  {
    "id": "CH6-ANALYSIS-021",
    "q": "Ministerial: How are Sr2+, As3+ and Mn2+ separated?",
    "a": "H2S in dilute HCl precipitates As2S3. H2S in NH4OH/NH4Cl precipitates MnS. (NH4)2CO3 in NH4OH/NH4Cl precipitates SrCO3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-022",
    "q": "Ministerial: How are Cu2+ and Fe3+ in the same solution separated?",
    "a": "Pass H2S in dilute HCl to precipitate CuS; filter. Add NH4OH/NH4Cl to the filtrate to precipitate Fe(OH)3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-023",
    "q": "Ministerial: How are Sr2+ and Al3+ separated?",
    "a": "Add NH4OH/NH4Cl to precipitate Al(OH)3; filter. Add (NH4)2CO3 in NH4OH/NH4Cl to precipitate SrCO3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-024",
    "q": "Ministerial: How are Hg2^2+ and Hg2+ separated?",
    "a": "Dilute HCl precipitates Hg2Cl2 from Hg2^2+; filter. Pass H2S through the acidified filtrate to precipitate HgS from Hg2+.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-025",
    "q": "Ministerial (2/2012): How are Hg2^2+ and Bi3+ separated?",
    "a": "Dilute HCl precipitates Hg2Cl2; filter. Pass H2S in dilute HCl to precipitate Bi2S3 from the filtrate.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": [
      "2/2012"
    ]
  },
  {
    "id": "CH6-ANALYSIS-026",
    "q": "Ministerial: How are Hg2^2+, Bi3+ and Al3+ separated?",
    "a": "Dilute HCl precipitates Hg2Cl2. H2S in dilute HCl precipitates Bi2S3. NH4OH/NH4Cl precipitates Al(OH)3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-027",
    "q": "Ministerial: How can Cu2+ be separated from Zn2+?",
    "a": "Pass H2S in dilute HCl. Cu2+ precipitates as CuS while Zn2+ remains dissolved; Zn2+ can later be precipitated as ZnS in NH4OH/NH4Cl medium.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-028",
    "q": "Ministerial: How can Cu2+ be separated from Ca2+?",
    "a": "Pass H2S in dilute HCl to precipitate CuS; Ca2+ remains dissolved and can later be precipitated as CaCO3 with (NH4)2CO3 in NH4OH/NH4Cl.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-029",
    "q": "Ministerial: How can Co2+, Cu2+ and Ca2+ be separated?",
    "a": "H2S in dilute HCl precipitates CuS. H2S in NH4OH/NH4Cl precipitates CoS. (NH4)2CO3 in NH4OH/NH4Cl precipitates CaCO3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-030",
    "q": "Ministerial: How can Ca2+ and Ni2+ be separated?",
    "a": "Pass H2S in NH4OH/NH4Cl to precipitate NiS; filter. Add (NH4)2CO3 in NH4OH/NH4Cl to precipitate CaCO3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-031",
    "q": "Ministerial: Classify Cr3+ and state how it precipitates.",
    "a": "Cr3+ is in Group IIIA and precipitates as Cr(OH)3 using NH4OH in the presence of NH4Cl.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-032",
    "q": "Ministerial: Name the Group IIIB ions and their precipitant.",
    "a": "Mn2+, Zn2+, Ni2+ and Co2+. They precipitate as sulfides by passing H2S in the presence of NH4OH and NH4Cl.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-033",
    "q": "Ministerial: What are the Group IV ions, their precipitant and their precipitate type?",
    "a": "Ba2+, Ca2+ and Sr2+; (NH4)2CO3 in NH4OH/NH4Cl; carbonate precipitates BaCO3, CaCO3 and SrCO3.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-034",
    "q": "Practice: Write the precipitation equation for Ca2+ in Group IV.",
    "a": "Ca2+ + (NH4)2CO3 -> CaCO3(s) + 2NH4+ (in NH4OH/NH4Cl medium).",
    "topic": "02",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-035",
    "q": "Ministerial: How are Group I ions separated and detected?",
    "a": "Precipitate AgCl, Hg2Cl2 and PbCl2 with dilute HCl. Hot water dissolves PbCl2; detect Pb2+ by yellow PbCrO4 after adding K2CrO4. NH3 dissolves AgCl as [Ag(NH3)2]Cl; reprecipitate AgCl with HNO3 or yellow AgI with KI. Hg2Cl2 reacts with NH3 to form a black mixture containing Hg.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-036",
    "q": "Ministerial: How is Pb2+ detected after separating Group I?",
    "a": "Dissolve PbCl2 in hot water, then add K2CrO4: PbCl2 + K2CrO4 -> PbCrO4(s) + 2KCl. A yellow precipitate confirms Pb2+.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-037",
    "q": "Ministerial: How is Ag+ detected after separating Group I?",
    "a": "Dissolve AgCl in NH3: AgCl + 2NH3 -> [Ag(NH3)2]Cl. Add dilute HNO3 to form white AgCl again, or add KI to form yellow AgI.",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-038",
    "q": "Ministerial (1/2018): How is mercury detected in HgCl2?",
    "a": "Add SnCl2. A white Hg2Cl2 precipitate first forms, then turns black due to metallic Hg: 2HgCl2 + SnCl2 -> SnCl4 + Hg2Cl2(s); Hg2Cl2 + SnCl2 -> SnCl4 + 2Hg(s).",
    "topic": "02",
    "kind": "ministerial",
    "examLabels": [
      "1/2018"
    ]
  },
  {
    "id": "CH6-ANALYSIS-039",
    "q": "Practice: An unknown Group I precipitate dissolves in NH3 and gives yellow AgI after KI is added. Identify the ion.",
    "a": "Ag+.",
    "topic": "02",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-040",
    "q": "What is gravimetric analysis?",
    "a": "Quantitative analysis based on separating a substance of known composition and accurately measuring its mass.",
    "topic": "03",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-041",
    "q": "Ministerial: Name the principal gravimetric methods.",
    "a": "Volatilization, precipitation, electro-deposition/electrical precipitation, and other physical separation methods.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-042",
    "q": "What is direct volatilization?",
    "a": "The volatile product is collected and weighed directly.",
    "topic": "03",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-043",
    "q": "What is indirect volatilization?",
    "a": "The volatile component is determined from the loss in sample mass: mass volatile = mass before heating - mass after heating.",
    "topic": "03",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-044",
    "q": "Practice: A hydrated salt has a mass of 2.500 g before heating and 2.140 g after heating. Find the mass and percentage of volatile water.",
    "a": "Water mass = 0.360 g; percentage = (0.360/2.500)x100 = 14.4%.",
    "topic": "03",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-045",
    "q": "Ministerial: List the quantitative steps in precipitation gravimetry.",
    "a": "Accurately weigh and dissolve the sample; precipitate the target with a suitable reagent; separate by filtration; wash; dry or ignite; cool and accurately weigh the stable mass form.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-046",
    "q": "Ministerial: What conditions are required for accurate precipitation gravimetry?",
    "a": "The precipitate must have very low solubility, crystals large enough for filtration and washing, low contamination, and the ability to be converted by drying/ignition into a pure stable compound of known formula.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-047",
    "q": "Ministerial: Why are dilute solutions preferred during precipitation?",
    "a": "They slow precipitation and provide time for larger, purer crystals to form.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-048",
    "q": "Ministerial: Why is precipitation often carried out at elevated temperature?",
    "a": "The higher solubility slows precipitation, giving ions time to form larger, well-crystallized particles.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-049",
    "q": "Ministerial: What factors affect formation and size of a crystalline precipitate?",
    "a": "The chemical nature of the precipitate, its solubility, temperature, and concentrations of the reacting substances.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-050",
    "q": "Practice: Two procedures form the same precipitate. Procedure A rapidly mixes concentrated cold solutions; Procedure B slowly mixes dilute hot solutions. Which gives the better gravimetric precipitate?",
    "a": "Procedure B, because slower precipitation favors larger, purer crystals that are easier to filter.",
    "topic": "03",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-051",
    "q": "What is the gravimetric factor (Gf)?",
    "a": "The stoichiometric ratio of the molar mass of the sought substance to the molar mass of the weighed mass form: Gf = (a x M sought)/(b x M mass form).",
    "topic": "03",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-052",
    "q": "Practice: If 0.600 g of AgCl is obtained, what mass of Cl is present? Use AgCl = 143.5 g/mol and Cl = 35.5 g/mol.",
    "a": "Gf = 35.5/143.5; mass Cl = 0.600 x 35.5/143.5 = 0.1484 g.",
    "topic": "03",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-053",
    "q": "Ministerial: Calculate Gf for Fe in Fe2O3. Use Fe = 56 and Fe2O3 = 160 g/mol.",
    "a": "Gf = (2x56)/160 = 0.700.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-054",
    "q": "Ministerial: Calculate Gf for Fe in Fe3O4. Use Fe3O4 = 232 g/mol.",
    "a": "Gf = (3x56)/232 = 0.7241.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-055",
    "q": "Ministerial: Calculate Gf for Fe2O3 represented by Fe3O4.",
    "a": "Balance iron atoms: 2Fe3O4 corresponds to 3Fe2O3. Gf = (3x160)/(2x232) = 1.0345.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-056",
    "q": "Ministerial: A 0.700 g alloy gives 1.100 mg CO2 on combustion. Find %C.",
    "a": "Carbon mass = 1.100x(12/44) = 0.300 mg; %C = (0.300/700)x100 = 0.0429%.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-057",
    "q": "Ministerial: Burning 5.700 mg of a hydrocarbon produces 15.675 mg CO2. Find %H.",
    "a": "Carbon mass = 15.675x12/44 = 4.275 mg; hydrogen mass = 5.700-4.275 = 1.425 mg; %H = 25.0%.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-058",
    "q": "Ministerial: Burning a 24 mg organic compound gives 44 mg CO2 and 9 mg H2O. Find %C and %H.",
    "a": "C = 44x12/44 = 12 mg, so %C = 50.0%. H = 9x2/18 = 1 mg, so %H = 4.167%.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-059",
    "q": "Ministerial: Burning 5.4 mg of a compound gives 13.2 mg CO2 and 2.7 mg H2O. Find %C and %H.",
    "a": "C = 13.2x12/44 = 3.6 mg, so %C = 66.667%. H = 2.7x2/18 = 0.3 mg, so %H = 5.556%.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-060",
    "q": "Ministerial: A 0.500 g impure NaI sample gives 0.740 g AgI. Find %NaI. Use NaI = 150 and AgI = 235 g/mol.",
    "a": "NaI mass = 0.740x150/235 = 0.4723 g; %NaI = 94.47%.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-061",
    "q": "Ministerial: A 0.600 g impure NaI sample gives 0.750 g AgI. Find %NaI.",
    "a": "NaI mass = 0.750x150/235 = 0.4787 g; %NaI = 79.79%.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-062",
    "q": "Ministerial: What mass of CaO forms by complete heating of 10.0 g CaC2O4? Use CaO = 56 and CaC2O4 = 128 g/mol.",
    "a": "Mass CaO = 10.0x56/128 = 4.375 g.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-063",
    "q": "Ministerial: A 24.4 g sample of BaX2.2H2O gives 23.3 g BaSO4. Identify X. Use BaSO4 = 233 and Ba = 137 g/mol.",
    "a": "One mole ratio gives molar mass BaX2.2H2O = 244 g/mol. Thus 137 + 2X + 36 = 244, so X = 35.5; X is Cl.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-064",
    "q": "Ministerial: A 120 mg organic sample gives 160 mg AgCl. Find %Cl using Cl = 36 and AgCl = 144 g/mol.",
    "a": "Cl mass = 160x36/144 = 40 mg; %Cl = 33.33%.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-065",
    "q": "Ministerial: What percent of a 0.740 g impure pesticide C14H9Cl5 is pure if it gives 0.253 g AgCl? Use pesticide = 354.5 and AgCl = 143.5 g/mol.",
    "a": "Pure pesticide mass = (354.5/(5x143.5))x0.253 = 0.125 g; purity = about 17.0%.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-066",
    "q": "Ministerial: A 0.680 g phosphate sample gives 0.435 g Mg2P2O7. Find %P. Use Mg = 24, P = 31, O = 16.",
    "a": "M(Mg2P2O7) = 222; P mass = 0.435x62/222 = 0.1215 g; %P = 17.87%.",
    "topic": "03",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-067",
    "q": "Practice: A 0.800 g sample gives 0.400 g Fe2O3. Find %Fe.",
    "a": "Fe mass = 0.400x0.700 = 0.280 g; %Fe = 35.0%.",
    "topic": "03",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-068",
    "q": "What is volumetric analysis?",
    "a": "Quantitative analysis based on measuring the volume of a reagent of known concentration required to react with an unknown solution.",
    "topic": "04",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-069",
    "q": "Ministerial: Define titration.",
    "a": "The gradual addition of a standard solution from a burette to an unknown solution until the end point is reached, allowing the unknown concentration to be calculated.",
    "topic": "04",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-070",
    "q": "Ministerial: Define a standard solution.",
    "a": "A solution containing an accurately known amount of reagent in a known volume.",
    "topic": "04",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-071",
    "q": "Ministerial: Define an indicator and state why it is used.",
    "a": "A substance that does not take part stoichiometrically in the reaction but shows a clear physical change, usually color, near completion; it locates the practical end point.",
    "topic": "04",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-072",
    "q": "Ministerial (2/2014, 2/2018): Distinguish the end point from the equivalence point.",
    "a": "The end point is observed experimentally using an indicator. The equivalence point is the theoretical point at which chemically equivalent amounts have reacted.",
    "topic": "04",
    "kind": "ministerial",
    "examLabels": [
      "2/2014",
      "2/2018"
    ]
  },
  {
    "id": "CH6-ANALYSIS-073",
    "q": "Ministerial (3/2016, 1/2018, 2/2017): What conditions must a primary standard substance satisfy?",
    "a": "High purity; stable to air, moisture, oxygen, CO2 and light; large equivalent mass; soluble in the chosen solvent; preferably non-poisonous, inexpensive and readily available.",
    "topic": "04",
    "kind": "ministerial",
    "examLabels": [
      "3/2016",
      "1/2018",
      "2/2017"
    ]
  },
  {
    "id": "CH6-ANALYSIS-074",
    "q": "Ministerial: Why should a standard substance have a large equivalent mass?",
    "a": "To reduce the relative error caused by weighing uncertainty.",
    "topic": "04",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-075",
    "q": "Ministerial: What conditions must a titration reaction satisfy?",
    "a": "It must have a simple balanced equation, proceed in one direction, be complete and fast, and have a detectable end point near the equivalence point.",
    "topic": "04",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-076",
    "q": "Ministerial: Name the four types of reactions used in titration.",
    "a": "Neutralization, oxidation-reduction, precipitation, and complex-formation reactions.",
    "topic": "04",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-077",
    "q": "Practice: A reaction is slow, reversible and has no observable change near equivalence. Is it suitable for titration?",
    "a": "No. It fails the requirements of rapid completion, one-direction behavior and detectable end point.",
    "topic": "04",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-078",
    "q": "Give the main concentration relations used in this chapter.",
    "a": "m = M x molar mass x V(L); N = n x M; equivalent mass EM = molar mass/n; m = N x EM x V(L); and at equivalence N1V1 = N2V2.",
    "topic": "05",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-079",
    "q": "Ministerial: Define normality.",
    "a": "The number of gram-equivalents of solute per liter of solution; a 1 N solution contains one equivalent per liter.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-080",
    "q": "Why is normality reaction-dependent?",
    "a": "Because n, and therefore equivalent mass and normality, depends on the actual reaction and the number of H+, OH-, electrons, ionic charges or electron pairs involved.",
    "topic": "05",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-081",
    "q": "Ministerial: Define equivalent mass of an acid.",
    "a": "The mass of acid that supplies one mole of ionizable H+ in the stated reaction: EM = molar mass/number of ionized H+.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-082",
    "q": "Ministerial: How is n determined in precipitation reactions?",
    "a": "From the number of reacting ionic charges per formula unit; for a salt it is commonly the number of positive ions multiplied by their charge.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-083",
    "q": "Ministerial: How is n determined in redox reactions?",
    "a": "It is the number of electrons gained or lost per formula unit in the stated reaction.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-084",
    "q": "Ministerial: How is equivalent mass determined in complex-formation reactions?",
    "a": "EM = molar mass divided by the number of electron pairs donated or accepted.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-085",
    "q": "Practice: Find EM and N for 0.40 M H2SO4 in complete neutralization.",
    "a": "n = 2; EM = 98/2 = 49 g/eq; N = 2x0.40 = 0.80 N.",
    "topic": "05",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-086",
    "q": "Ministerial (2/2018): Find EM of AgNO3 in Ag+ + Br- -> AgBr and EM of Na2CO3 in Na2CO3 + 2H+ -> 2Na+ + CO2 + H2O.",
    "a": "AgNO3: n=1, EM=170 g/eq. Na2CO3: n=2, EM=106/2=53 g/eq.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": [
      "2/2018"
    ]
  },
  {
    "id": "CH6-ANALYSIS-087",
    "q": "Ministerial: A solution is 1.5 N and 0.5 M. Find n.",
    "a": "n = N/M = 3 eq/mol.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-088",
    "q": "Ministerial: A solution is 1.0 N and 0.20 M. Find n.",
    "a": "n = 5 eq/mol.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-089",
    "q": "Ministerial: Find the molarity of 0.20 N Fe2(SO4)3 in a precipitation reaction.",
    "a": "n = 2x3 = 6; M = 0.20/6 = 0.0333 M.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-090",
    "q": "Ministerial: Find the molarity of 0.08 N Pb(IO3)2.",
    "a": "n = 2; M = 0.08/2 = 0.040 M.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-091",
    "q": "Ministerial: Find the molarity of 0.30 N Al2(SO4)3.",
    "a": "n = 2x3 = 6; M = 0.30/6 = 0.050 M.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-092",
    "q": "Ministerial: KMnO4 is reduced to MnO2. Find n and the normality of 0.05 M, 0.03 M and 0.08 M solutions.",
    "a": "Mn changes from +7 to +4, so n=3. Normalities: 0.15 N, 0.09 N and 0.24 N respectively.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-093",
    "q": "Ministerial: Find EM of MnO4- in the acidic reaction where Mn(+7) becomes Mn2+. Use M(MnO4-) = 119 g/mol.",
    "a": "n=5; EM=119/5=23.8 g/eq.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-094",
    "q": "Ministerial: For 6.0 M H3PO4, find EM and N when 3, 2 or 1 H+ react.",
    "a": "n=3: EM=98/3=32.67 g/eq, N=18 N. n=2: EM=49 g/eq, N=12 N. n=1: EM=98 g/eq, N=6 N.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-095",
    "q": "Ministerial: What mass of NaOH is needed to prepare 500 mL of 0.20 M solution?",
    "a": "m = 0.20x40x0.500 = 4.00 g.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-096",
    "q": "Ministerial: Find M and N for these Ba(OH)2 solutions (M=171): (a) 9.5 g/2.0 L, (b) 9.3 g/3.0 L, (c) 8.55 g/2.5 L, (d) 8.5 g/1.5 L.",
    "a": "(a) M=0.0278, N=0.0556. (b) M=0.0181, N=0.0363. (c) M=0.0200, N=0.0400. (d) M=0.0331, N=0.0663.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-097",
    "q": "Ministerial: Find M and N for (a) 8.85 g Ba(OH)2 in 1.6 L and (b) 5.7 g in 1.5 L.",
    "a": "(a) M=0.03235, N=0.0647. (b) M=0.02222, N=0.04444.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-098",
    "q": "Ministerial: Find M and N of 3.7 g Ca(OH)2 in 1.5 L. Use M=74 g/mol.",
    "a": "M=3.7/(74x1.5)=0.0333 M; n=2; N=0.0667 N.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-099",
    "q": "Practice: What mass of Ca(OH)2 is required to prepare 250 mL of 0.40 N solution?",
    "a": "EM=74/2=37 g/eq; m=0.40x37x0.250=3.70 g.",
    "topic": "05",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-100",
    "q": "Ministerial: What mass of K2Cr2O7 is required in its six-electron reduction? Use M=294 g/mol. (a) 2.4 L of 0.16 N, (b) 1.5 L of 0.16 N, (c) 2.0 L of 0.12 N.",
    "a": "EM=294/6=49 g/eq. (a) 18.816 g. (b) 11.760 g. (c) 11.760 g.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-101",
    "q": "Ministerial: Calculate the mass of borax Na2B4O7.10H2O needed for 250 mL of 0.12 N solution in a reaction with n=2. Use M=381 g/mol.",
    "a": "EM=381/2=190.5 g/eq; m=0.12x190.5x0.250=5.715 g.",
    "topic": "05",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-102",
    "q": "Ministerial: 36.7 mL HCl is equivalent to 43.2 mL of 0.24 M NaOH. Find M and N of HCl.",
    "a": "HCl and NaOH both have n=1. M(HCl)=N(HCl)=0.24x43.2/36.7=0.2825.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-103",
    "q": "Ministerial: 300 mL HCl is equivalent to 400 mL of 0.20 M NaOH. Find M(HCl).",
    "a": "M(HCl)=0.20x400/300=0.2667 M.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-104",
    "q": "Ministerial: Find N for H2SO4 solutions in complete neutralization: (a) 0.23 M, (b) 0.43 M, (c) 0.25 M.",
    "a": "n=2. (a) 0.46 N, (b) 0.86 N, (c) 0.50 N.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-105",
    "q": "Ministerial: Find M and N when 6.4 g H2SO4 is dissolved to 600 mL. Use M=98 g/mol.",
    "a": "M=6.4/(98x0.600)=0.1088 M; N=2M=0.2177 N.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-106",
    "q": "Ministerial: Find M and N when 5.0 g H2SO4 is dissolved to 500 mL.",
    "a": "M=5/(98x0.500)=0.1020 M; N=0.2041 N.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-107",
    "q": "Ministerial: A 50 mL HIO3 sample requires 45.8 mL of 0.145 N NaOH. Find N(HIO3).",
    "a": "N=0.145x45.8/50=0.13282 N.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-108",
    "q": "Ministerial: A 42 mL HIO3 sample requires 38 mL of 0.15 N NaOH. Find its normality and mass. Use M(HIO3)=176 and n=1 for neutralization.",
    "a": "N=0.1357 N; mass=NxEMxV=0.1357x176x0.042=1.003 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-109",
    "q": "Ministerial: A 45 mL HIO3 sample requires 42 mL of 0.15 N NaOH. Find its neutralization normality and its normality when HIO3 is reduced from I(+5) to I(+1).",
    "a": "Neutralization N=0.140 N. Sample mass=0.140x176x0.045=1.1088 g. Redox n=4, so redox N=4x0.140=0.560 N.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-110",
    "q": "Ministerial: A 50 mL HIO3 sample requires 50 mL of 0.10 N NaOH. Find its neutralization normality and its redox normality for I(+5) to I(+1).",
    "a": "Neutralization N=0.100 N; redox N=0.400 N.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-111",
    "q": "Ministerial: A 50 mL HIO3 sample requires 45 mL of 0.145 N NaOH. Find its neutralization normality and redox normality for I(+5) to I(+1).",
    "a": "Neutralization N=0.1305 N; redox N=0.522 N.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-112",
    "q": "Ministerial: A 0.175 g impure H2C2O4 sample uses 40 mL of 0.09 M NaOH. Find purity. Use M=90 g/mol.",
    "a": "n(acid)=2. Pure acid mass=0.09x40/1000x45=0.162 g; purity=92.57%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-113",
    "q": "Ministerial: A 0.220 g impure H2C2O4 sample uses 43 mL of 0.09 M NaOH. Find purity.",
    "a": "Pure mass=0.09x0.043x45=0.17415 g; purity=79.16%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-114",
    "q": "Ministerial: A 0.180 g impure H2C2O4 sample uses 40 mL of 0.09 M NaOH. Find purity.",
    "a": "Pure mass=0.162 g; purity=90.0%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-115",
    "q": "Ministerial: A 1.600 g impure H2C2O4 sample uses 36 mL of 0.20 M NaOH. Find purity.",
    "a": "Pure mass=0.20x0.036x45=0.324 g; purity=20.25%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-116",
    "q": "Ministerial (1/2017): A 0.1743 g impure H2C2O4 sample uses 39.82 mL of 0.09 M NaOH. Find purity.",
    "a": "Pure mass=0.09x0.03982x45=0.16127 g; purity=92.52%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": [
      "1/2017"
    ]
  },
  {
    "id": "CH6-ANALYSIS-117",
    "q": "Ministerial: A 0.86 g acetic-acid sample uses 32.2 mL of 0.225 N NaOH. Find %CH3COOH. Use EM=60 g/eq.",
    "a": "Acid mass=0.225x0.0322x60=0.4347 g; percentage=50.55%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-118",
    "q": "Ministerial: A 1.20 g acetic-acid sample uses 35 mL of 0.30 N NaOH. Find the percentage.",
    "a": "Acid mass=0.30x0.035x60=0.630 g; percentage=52.50%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-119",
    "q": "Ministerial: A 0.96 g acetic-acid sample uses 35 mL of 0.25 N NaOH. Find the percentage.",
    "a": "Acid mass=0.25x0.035x60=0.525 g; percentage=54.69%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-120",
    "q": "Ministerial (3/2019): A 0.958 g acetic-acid sample uses 33.6 mL of 0.225 N NaOH. Find the percentage.",
    "a": "Acid mass=0.4536 g; percentage=47.35%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": [
      "3/2019"
    ]
  },
  {
    "id": "CH6-ANALYSIS-121",
    "q": "Ministerial: A 0.96 g acetic-acid sample uses 32.6 mL of 0.23 N NaOH. Find the percentage.",
    "a": "Acid mass=0.23x0.0326x60=0.4499 g; percentage=46.86%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-122",
    "q": "Ministerial: A 0.96 g acetic-acid sample uses 33.6 mL of 0.225 N NaOH. Find the percentage.",
    "a": "Acid mass=0.4536 g; percentage=47.25%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-123",
    "q": "Ministerial: A 0.88 g acetic-acid sample uses 32.6 mL of 0.24 N NaOH. Find the percentage.",
    "a": "Acid mass=0.46944 g; percentage=53.35%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-124",
    "q": "Ministerial: A 0.96 g acetic-acid sample uses 32.4 mL of 0.24 N NaOH. Find the percentage.",
    "a": "Acid mass=0.46656 g; percentage=48.60%.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-125",
    "q": "Ministerial: 30 mL NaOH is titrated with 45 mL of 0.06 M H2SO4. Find M(NaOH) and the NaOH mass in 200 mL.",
    "a": "M(NaOH)=2x0.06x45/30=0.18 M; mass=0.18x40x0.200=1.44 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-126",
    "q": "Ministerial: 30 mL NaOH is titrated with 55 mL of 0.06 M H2SO4. Find M(NaOH) and the NaOH mass in 500 mL.",
    "a": "M=0.22 M; mass=0.22x40x0.500=4.40 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-127",
    "q": "Ministerial: 24 mL NaOH is titrated with 48 mL of 0.06 M H2SO4. Find M(NaOH) and the NaOH mass in 600 mL.",
    "a": "M=0.24 M; mass=0.24x40x0.600=5.76 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-128",
    "q": "Ministerial (1/2021): 25 mL NaOH is titrated with 47 mL of 0.08 M H2SO4. Find M(NaOH) and the NaOH mass in 600 mL.",
    "a": "M=2x0.08x47/25=0.3008 M; mass=0.3008x40x0.600=7.219 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": [
      "1/2021"
    ]
  },
  {
    "id": "CH6-ANALYSIS-129",
    "q": "Ministerial: 25 mL NaOH is titrated with 47.1 mL of 0.08 M H2SO4. Find M(NaOH) and the NaOH mass in 500 mL.",
    "a": "M=0.30144 M; mass=0.30144x40x0.500=6.029 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-130",
    "q": "Ministerial: 32 mL NaOH is titrated with 48 mL of 0.08 M H2SO4. Find M(NaOH) and the NaOH mass in 400 mL.",
    "a": "M=0.24 M; mass=0.24x40x0.400=3.84 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-131",
    "q": "Ministerial: 35 mL Ba(OH)2 is titrated with 55.5 mL of 0.04 M HNO3. Find M(Ba(OH)2) and its mass in 750 mL.",
    "a": "2M(base)x35 = 0.04x55.5, so M=0.03171 M. Mass=0.03171x171x0.750=4.07 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-132",
    "q": "Ministerial: 28 mL of 0.12 N HCl requires 24 mL Ba(OH)2. Find N(base) and the mass of Ba(OH)2 in 30 mL. Use M=171.",
    "a": "N=0.12x28/24=0.14 N. EM=171/2=85.5; mass=0.14x85.5x0.030=0.3591 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-133",
    "q": "Ministerial (2/2016): 20 mL of 0.30 N KMnO4 ultimately produces I2 that requires 25 mL Na2S2O3. Find N(thiosulfate) and its mass for 1.0 L and 2.0 L. Use M=158 and n=1.",
    "a": "N=0.30x20/25=0.24 N. Mass for 1 L=37.92 g; for 2 L=75.84 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": [
      "2/2016"
    ]
  },
  {
    "id": "CH6-ANALYSIS-134",
    "q": "Ministerial: 30 mL of 0.20 N KMnO4 ultimately produces I2 that requires 40 mL Na2S2O3. Find N(thiosulfate) and its mass for 1.5 L.",
    "a": "N=0.15 N; mass=0.15x158x1.5=35.55 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-135",
    "q": "Ministerial: 30 mL of 0.28 N KMnO4 ultimately produces I2 that requires 20 mL Na2S2O3. Find N(thiosulfate) and its mass for 800 mL.",
    "a": "N=0.42 N; mass=0.42x158x0.800=53.088 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-136",
    "q": "Ministerial: A 2.5 g metal carbonate MCO3 (M forms M2+) reacts with 100 mL of 0.60 N acid; excess acid requires 50 mL of 0.20 N NaOH. Identify M.",
    "a": "Acid consumed by carbonate = 0.060-0.010=0.050 eq. EM(MCO3)=2.5/0.050=50 g/eq. Since n=2, molar mass MCO3=100; M=100-60=40 g/mol, so the metal is Ca.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-137",
    "q": "Ministerial: 16 mL of 0.10 M NaOH neutralizes 20 mL H2SO4. What mass of BaSO4 forms when 100 mL of that acid is completely precipitated? Use H2SO4=98 and BaSO4=233.",
    "a": "M(H2SO4)=0.04 M. Moles in 100 mL=0.004 mol; BaSO4 is 1:1, so mass=0.004x233=0.932 g.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-138",
    "q": "Ministerial: 4.29 g Na2CO3.xH2O is dissolved to 250 mL. A 25 mL aliquot requires 15 mL of 0.20 N HCl. Find x.",
    "a": "Solution N=0.20x15/25=0.12 N. Hydrate molar mass=286 g/mol. 106+18x=286, so x=10; the salt is Na2CO3.10H2O.",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-139",
    "q": "Ministerial: A 160 mg sample containing Ni2O3 requires 38.3 mL of 0.137 N KCN in Ni2+ + 4CN- -> [Ni(CN)4]2-. Find %Ni2O3. Use M=165 g/mol.",
    "a": "n(Ni2O3)=2 Ni x4=8; EM=165/8=20.625 g/eq. Mass Ni2O3=0.137x0.0383x20.625=0.1082 g; percentage=67.6% (about 67.8% with source rounding).",
    "topic": "06",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-140",
    "q": "Practice: A 0.500 g monoprotic acid sample requires 40.0 mL of 0.100 N NaOH. If the pure acid has EM=100 g/eq, find its purity.",
    "a": "Pure mass=0.100x0.0400x100=0.400 g; purity=80.0%.",
    "topic": "06",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-141",
    "q": "What is the fastest way to decide the reagent order in a cation-separation problem?",
    "a": "Identify each ion's group and apply group reagents in numerical order: I, II, IIIA/IIIB, then IV, filtering after every precipitate.",
    "topic": "07",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-142",
    "q": "What is the safest calculation sequence in a titration problem?",
    "a": "Write the balanced reaction; determine n; convert M to N if needed; apply N1V1=N2V2; then use m=NxEMxV or m=MxMrxV; finally calculate percentage if requested.",
    "topic": "07",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-143",
    "q": "What is the safest calculation sequence in a gravimetric problem?",
    "a": "Identify the sought substance and weighed mass form; balance their stoichiometric relation; calculate Gf; use mass sought=Gf x mass form; divide by original sample mass for percentage.",
    "topic": "07",
    "kind": "note",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-144",
    "q": "Practice: A student uses the same numerical EM for H3PO4 in every reaction. What is the error?",
    "a": "Equivalent mass is reaction-dependent. H3PO4 may have n=1, 2 or 3 depending on how many H+ ions participate.",
    "topic": "07",
    "kind": "practice",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-145",
    "q": "Ministerial: Calculate the gravimetric factor of Na3P3O10 (368 g/mol) represented by Mg2P2O7 (222.6 g/mol).",
    "a": "Match six P atoms: 2Na3P3O10 corresponds to 3Mg2P2O7. Gf=(2x368)/(3x222.6)=1.102.",
    "topic": "07",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-146",
    "q": "Ministerial: Calculate the gravimetric factor of MgI2 (278 g/mol) represented by AgI (235 g/mol).",
    "a": "One MgI2 contains two I atoms and corresponds to 2AgI. Gf=278/(2x235)=0.5915.",
    "topic": "07",
    "kind": "ministerial",
    "examLabels": []
  },
  {
    "id": "CH6-ANALYSIS-147",
    "q": "Ministerial: Calculate the gravimetric factor of Fe3O4 represented by Fe2O3.",
    "a": "Match six Fe atoms: 2Fe3O4 corresponds to 3Fe2O3. Gf=(2x232)/(3x160)=0.9667 (approximately 0.97).",
    "topic": "07",
    "kind": "ministerial",
    "examLabels": []
  }
];
