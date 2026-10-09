// Imported from the user-supplied thermodynamics flashcard file; original wording preserved.
export const ahmedNadawiChemCh1Topics = [
  {
    "key": "01",
    "title": "Thermodynamics and systems",
    "pages": "2-8"
  },
  {
    "key": "02",
    "title": "Heat and calorimetry basics",
    "pages": "9-17"
  },
  {
    "key": "03",
    "title": "Enthalpy, state functions and properties",
    "pages": "18-24"
  },
  {
    "key": "04",
    "title": "Calorimeter and combustion calculations",
    "pages": "25-38"
  },
  {
    "key": "05",
    "title": "Standard reaction, formation and combustion enthalpies",
    "pages": "39-52"
  },
  {
    "key": "06",
    "title": "Enthalpy of physical changes and Hess law",
    "pages": "53-80"
  },
  {
    "key": "07",
    "title": "Spontaneity and entropy",
    "pages": "81-93"
  },
  {
    "key": "08",
    "title": "Gibbs free energy",
    "pages": "94-114"
  },
  {
    "key": "09",
    "title": "Gibbs signs and temperature effects",
    "pages": "115-133"
  },
  {
    "key": "10",
    "title": "Phase-transition entropy and equilibrium",
    "pages": "134-144"
  },
  {
    "key": "11",
    "title": "Specific heat: worked and review questions",
    "pages": "11-17"
  },
  {
    "key": "12",
    "title": "Calorimeter: review calculation questions",
    "pages": "27-38, 143-144"
  },
  {
    "key": "13",
    "title": "Formation, combustion and Hess: review questions",
    "pages": "43-80"
  },
  {
    "key": "14",
    "title": "Entropy and Gibbs: review calculations",
    "pages": "88-114"
  },
  {
    "key": "15",
    "title": "Gibbs sign questions and phase-transition bank",
    "pages": "129-144"
  },
  {
    "key": "16",
    "title": "Additional question-bank items and source cautions",
    "pages": "17, 38, 93, 109-114, 132-144"
  }
] as const;
export const ahmedNadawiChemCh1Cards = [
  {
    "q": "Define thermodynamics.",
    "a": "The branch of science that studies energy and its transformations.",
    "topic": "01"
  },
  {
    "q": "Give one practical example of thermodynamics.",
    "a": "Heat from fuel combustion is converted into mechanical energy that runs engines.",
    "topic": "01"
  },
  {
    "q": "What explains why chemical reactions occur?",
    "a": "Thermodynamics studies why reactions occur, and whether changes are thermodynamically possible.",
    "topic": "01"
  },
  {
    "q": "What can thermodynamics estimate about substances?",
    "a": "The physical and chemical changes that substances undergo under specified conditions.",
    "topic": "01"
  },
  {
    "q": "What does thermodynamics explain about spontaneous changes?",
    "a": "Why certain reactions occur spontaneously under given conditions while others do not.",
    "topic": "01"
  },
  {
    "q": "What does thermodynamics explain about reaction energy?",
    "a": "Why reactions may absorb energy or release it.",
    "topic": "01"
  },
  {
    "q": "Why does thermodynamics not determine the time or speed of a reaction?",
    "a": "Reaction rate is the concern of chemical kinetics, not thermodynamics.",
    "topic": "01"
  },
  {
    "q": "Define potential energy.",
    "a": "Stored energy, including chemical energy in substances and fuels.",
    "topic": "01"
  },
  {
    "q": "Define kinetic energy.",
    "a": "Energy that a body or molecules possess because of motion.",
    "topic": "01"
  },
  {
    "q": "Give examples of kinetic energy.",
    "a": "Moving molecules, water, cars, aircraft and other moving bodies.",
    "topic": "01"
  },
  {
    "q": "How does falling water demonstrate energy transformation?",
    "a": "Its potential energy changes to kinetic energy, which can operate turbines and generate electricity.",
    "topic": "01"
  },
  {
    "q": "Give the formula for kinetic energy.",
    "a": "KE = ½mv², with m in kg and v in m/s.",
    "topic": "01"
  },
  {
    "q": "State the first law of thermodynamics.",
    "a": "Energy is neither created nor destroyed; it is transformed from one form to another.",
    "topic": "01"
  },
  {
    "q": "What is the SI unit of energy?",
    "a": "The joule (J).",
    "topic": "01"
  },
  {
    "q": "Express 1 joule in SI base units.",
    "a": "1 J = 1 kg·m²/s².",
    "topic": "01"
  },
  {
    "q": "What is the SI thermodynamic unit of temperature?",
    "a": "Kelvin (K).",
    "topic": "01"
  },
  {
    "q": "Convert temperature in Celsius to kelvin.",
    "a": "T(K) = t(°C) + 273, as used in the chapter.",
    "topic": "01"
  },
  {
    "q": "Define the thermodynamic system.",
    "a": "The part of the universe selected for study, containing substances undergoing specified changes within defined boundaries.",
    "topic": "01"
  },
  {
    "q": "Define the surroundings.",
    "a": "Everything outside the system boundaries that may affect or interact with the system.",
    "topic": "01"
  },
  {
    "q": "Define the universe in thermodynamics.",
    "a": "System + surroundings.",
    "topic": "01"
  },
  {
    "q": "What are the observable properties of a thermodynamic system?",
    "a": "Physical state, moles, volume, pressure and temperature.",
    "topic": "01"
  },
  {
    "q": "How many basic system types are there?",
    "a": "Three: open, closed and isolated.",
    "topic": "01"
  },
  {
    "q": "Define an open system.",
    "a": "A system that exchanges both matter and energy with its surroundings.",
    "topic": "01"
  },
  {
    "q": "Give an example of an open system.",
    "a": "Boiling water in an open metal container.",
    "topic": "01"
  },
  {
    "q": "Define a closed system.",
    "a": "A system that exchanges energy but not matter with its surroundings.",
    "topic": "01"
  },
  {
    "q": "Give an example of a closed system.",
    "a": "A tightly sealed metal container.",
    "topic": "01"
  },
  {
    "q": "Define an isolated system.",
    "a": "A system that exchanges neither matter nor energy with its surroundings.",
    "topic": "01"
  },
  {
    "q": "Give an example of an isolated system.",
    "a": "An ideal thermos.",
    "topic": "01"
  },
  {
    "q": "Compare an open system with a closed system.",
    "a": "Open: exchanges matter and energy. Closed: exchanges energy only.",
    "topic": "01"
  },
  {
    "q": "Compare a closed system with an isolated system.",
    "a": "Closed: exchanges energy but not matter. Isolated: exchanges neither.",
    "topic": "01"
  },
  {
    "q": "Classify a system that exchanges matter and energy.",
    "a": "Open system.",
    "topic": "01"
  },
  {
    "q": "Classify a system that exchanges energy but not matter.",
    "a": "Closed system.",
    "topic": "01"
  },
  {
    "q": "Classify a system that exchanges neither energy nor matter.",
    "a": "Isolated system.",
    "topic": "01"
  },
  {
    "q": "Give a phenomenon illustrating the first law.",
    "a": "Stored energy of falling water becomes kinetic energy and then electrical energy; energy changes form.",
    "topic": "01"
  },
  {
    "q": "Define heat (q).",
    "a": "Energy transferred between objects at different temperatures.",
    "topic": "02"
  },
  {
    "q": "What symbol is used for heat?",
    "a": "q.",
    "topic": "02"
  },
  {
    "q": "What symbol is used for temperature?",
    "a": "T.",
    "topic": "02"
  },
  {
    "q": "How is a temperature change calculated?",
    "a": "ΔT = Tf − Ti.",
    "topic": "02"
  },
  {
    "q": "What do Tf and Ti mean?",
    "a": "Tf is final temperature; Ti is initial temperature.",
    "topic": "02"
  },
  {
    "q": "How does heat depend on temperature change?",
    "a": "q is directly proportional to ΔT for a given object: q ∝ ΔT.",
    "topic": "02"
  },
  {
    "q": "What constant converts q ∝ ΔT into an equation?",
    "a": "Heat capacity C: q = CΔT.",
    "topic": "02"
  },
  {
    "q": "Define heat capacity (C).",
    "a": "Heat needed to raise the temperature of a given mass of substance by 1°C.",
    "topic": "02"
  },
  {
    "q": "State the unit of heat capacity.",
    "a": "J/°C.",
    "topic": "02"
  },
  {
    "q": "Define specific heat capacity (c).",
    "a": "Heat needed to raise the temperature of 1 gram of a substance by 1°C.",
    "topic": "02"
  },
  {
    "q": "State the unit of specific heat.",
    "a": "J/(g·°C).",
    "topic": "02"
  },
  {
    "q": "Which is intensive: heat capacity or specific heat?",
    "a": "Specific heat (c) is intensive.",
    "topic": "02"
  },
  {
    "q": "Which is extensive: heat capacity or specific heat?",
    "a": "Heat capacity (C) is extensive.",
    "topic": "02"
  },
  {
    "q": "How are heat capacity and specific heat related?",
    "a": "C = mc.",
    "topic": "02"
  },
  {
    "q": "How is absorbed or released heat calculated from mass and specific heat?",
    "a": "q = mcΔT.",
    "topic": "02"
  },
  {
    "q": "When does heat capacity numerically equal specific heat?",
    "a": "When the mass equals 1 g, since C = mc.",
    "topic": "02"
  },
  {
    "q": "When does q = C?",
    "a": "When ΔT = 1°C, since q = CΔT.",
    "topic": "02"
  },
  {
    "q": "What does positive q indicate for the body?",
    "a": "Heat is absorbed (temperature increases if c is positive).",
    "topic": "02"
  },
  {
    "q": "What does negative q indicate for the body?",
    "a": "Heat is released (cooling, ΔT < 0).",
    "topic": "02"
  },
  {
    "q": "How are joules converted to kilojoules?",
    "a": "Divide by 1000: 1 kJ = 1000 J.",
    "topic": "02"
  },
  {
    "q": "How are kilojoules converted to joules?",
    "a": "Multiply by 1000.",
    "topic": "02"
  },
  {
    "q": "How can specific heat be calculated from heat, mass and temperature change?",
    "a": "c = q/(mΔT).",
    "topic": "02"
  },
  {
    "q": "How can heat capacity be found from heat and temperature change?",
    "a": "C = q/ΔT.",
    "topic": "02"
  },
  {
    "q": "How can final temperature be found using q = mcΔT?",
    "a": "Tf = Ti + q/(mc).",
    "topic": "02"
  },
  {
    "q": "How can initial temperature be found using q = mcΔT?",
    "a": "Ti = Tf − q/(mc).",
    "topic": "02"
  },
  {
    "q": "What units should mass have in q = mcΔT when c is in J/(g·°C)?",
    "a": "Grams (g).",
    "topic": "02"
  },
  {
    "q": "What must be done if c is in J/(g·°C) but mass is in kilograms?",
    "a": "Convert kg to g by multiplying by 1000.",
    "topic": "02"
  },
  {
    "q": "Define enthalpy (H).",
    "a": "An extensive thermodynamic state function related to the heat absorbed or released at constant pressure.",
    "topic": "03"
  },
  {
    "q": "Can absolute enthalpy H be measured directly?",
    "a": "No; only enthalpy change ΔH is measured.",
    "topic": "03"
  },
  {
    "q": "Define enthalpy of reaction.",
    "a": "The heat absorbed or released by a reaction at constant pressure.",
    "topic": "03"
  },
  {
    "q": "What is the relation between enthalpy change and constant-pressure heat?",
    "a": "ΔH = qp.",
    "topic": "03"
  },
  {
    "q": "How is reaction enthalpy obtained from reactants and products?",
    "a": "ΔHr = H(products) − H(reactants).",
    "topic": "03"
  },
  {
    "q": "What does ΔH < 0 indicate?",
    "a": "Exothermic reaction; heat is released by the system.",
    "topic": "03"
  },
  {
    "q": "What does ΔH > 0 indicate?",
    "a": "Endothermic reaction; heat is absorbed by the system.",
    "topic": "03"
  },
  {
    "q": "Define exothermic reaction.",
    "a": "Reaction that releases heat from the system to the surroundings; ΔH is negative.",
    "topic": "03"
  },
  {
    "q": "Define endothermic reaction.",
    "a": "Reaction that absorbs heat from the surroundings into the system; ΔH is positive.",
    "topic": "03"
  },
  {
    "q": "Where is energy written in an exothermic chemical equation?",
    "a": "On the products side.",
    "topic": "03"
  },
  {
    "q": "Where is energy written in an endothermic chemical equation?",
    "a": "On the reactants side.",
    "topic": "03"
  },
  {
    "q": "Compare reactant and product energy in an exothermic reaction.",
    "a": "Reactants have higher energy than products.",
    "topic": "03"
  },
  {
    "q": "Compare reactant and product energy in an endothermic reaction.",
    "a": "Products have higher energy than reactants.",
    "topic": "03"
  },
  {
    "q": "What is the energy-level diagram of an exothermic reaction?",
    "a": "Reactants at higher enthalpy than products; downward change (ΔH negative).",
    "topic": "03"
  },
  {
    "q": "What is the energy-level diagram of an endothermic reaction?",
    "a": "Products at higher enthalpy than reactants; upward change (ΔH positive).",
    "topic": "03"
  },
  {
    "q": "Give a source example of an exothermic reaction.",
    "a": "C(s) + O₂(g) → CO₂(g), ΔH ≈ −394 kJ/mol.",
    "topic": "03"
  },
  {
    "q": "Give a source example of an endothermic reaction.",
    "a": "2NH₃(g) → N₂(g) + 3H₂(g), ΔH = +92 kJ/mol.",
    "topic": "03"
  },
  {
    "q": "Define a state function.",
    "a": "A property whose change depends only on the initial and final states, not the path followed.",
    "topic": "03"
  },
  {
    "q": "Give three examples of state functions.",
    "a": "Enthalpy H, entropy S and Gibbs free energy G.",
    "topic": "03"
  },
  {
    "q": "Why are enthalpy and entropy state functions?",
    "a": "Their changes depend only on initial and final states of the system.",
    "topic": "03"
  },
  {
    "q": "Why are heat and work not state functions?",
    "a": "Their amounts depend on the process path and experimental steps.",
    "topic": "03"
  },
  {
    "q": "Define extensive properties.",
    "a": "Properties that depend on the amount of matter present.",
    "topic": "03"
  },
  {
    "q": "Give examples of extensive properties.",
    "a": "Mass, volume, heat capacity, enthalpy, entropy and free energy.",
    "topic": "03"
  },
  {
    "q": "Define intensive properties.",
    "a": "Properties independent of the amount of matter.",
    "topic": "03"
  },
  {
    "q": "Give examples of intensive properties.",
    "a": "Pressure, temperature, density and specific heat.",
    "topic": "03"
  },
  {
    "q": "What happens to extensive properties when a sample is divided?",
    "a": "They change with sample size.",
    "topic": "03"
  },
  {
    "q": "What happens to intensive properties when a sample is divided?",
    "a": "They remain unchanged, provided the material and conditions are the same.",
    "topic": "03"
  },
  {
    "q": "Why is enthalpy extensive?",
    "a": "Enthalpy depends on the amount of substance; doubling the reacting amount doubles ΔH.",
    "topic": "03"
  },
  {
    "q": "How does ΔH change when a thermochemical equation is doubled?",
    "a": "ΔH also doubles.",
    "topic": "03"
  },
  {
    "q": "Define thermochemistry.",
    "a": "Study of heat absorbed or released during physical and chemical changes.",
    "topic": "03"
  },
  {
    "q": "Can every spontaneous reaction be assumed exothermic?",
    "a": "No; some spontaneous processes are endothermic.",
    "topic": "03"
  },
  {
    "q": "Give an exothermic physical change.",
    "a": "Condensation: H₂O(g) → H₂O(l) + heat.",
    "topic": "03"
  },
  {
    "q": "Give an exothermic chemical change.",
    "a": "2H₂(g) + O₂(g) → 2H₂O(l) + heat.",
    "topic": "03"
  },
  {
    "q": "Define a calorimeter.",
    "a": "An instrument used to measure heat absorbed or released in a reaction, under the conditions described in the chapter.",
    "topic": "04"
  },
  {
    "q": "What is placed in the reaction compartment of a calorimeter?",
    "a": "The reacting substances.",
    "topic": "04"
  },
  {
    "q": "What surrounds the reaction compartment?",
    "a": "A well-insulated vessel containing a known mass of water.",
    "topic": "04"
  },
  {
    "q": "Which instrument measures temperature change in a calorimeter?",
    "a": "A thermometer.",
    "topic": "04"
  },
  {
    "q": "How does a calorimeter detect exothermic reaction heat?",
    "a": "The released heat raises the temperature of the water and calorimeter.",
    "topic": "04"
  },
  {
    "q": "How is heat absorbed by water in a calorimeter calculated?",
    "a": "qwater = mwater·cwater·ΔT.",
    "topic": "04"
  },
  {
    "q": "How does reaction heat compare with heat gained by water when calorimeter heat is negligible?",
    "a": "qreaction = −qwater.",
    "topic": "04"
  },
  {
    "q": "How do you calculate reaction heat when calorimeter heat capacity is included?",
    "a": "qreaction = −(mwater cwater + Ccal)ΔT.",
    "topic": "04"
  },
  {
    "q": "Why does reaction heat get a minus sign when water temperature rises during combustion?",
    "a": "Heat lost by the exothermic reaction equals heat gained by the surroundings.",
    "topic": "04"
  },
  {
    "q": "How is the number of moles calculated from mass?",
    "a": "n = m/M.",
    "topic": "04"
  },
  {
    "q": "How is combustion heat for 1 mole calculated from the measured heat for n moles?",
    "a": "ΔHcomb,1 mol = qreaction/n.",
    "topic": "04"
  },
  {
    "q": "How is the heat for multiple moles obtained from molar enthalpy?",
    "a": "q = nΔHmolar.",
    "topic": "04"
  },
  {
    "q": "What is the relationship between combusted mass and molar mass?",
    "a": "n = m/M, or m = nM.",
    "topic": "04"
  },
  {
    "q": "Which calorimeter questions ask for different final unknowns?",
    "a": "Heat for 1 mole or a fraction/multiple of a mole, ΔT, Ti/Tf, mass, molar mass, and number of moles.",
    "topic": "04"
  },
  {
    "q": "What is ΔT if calorimeter temperature increases from 24°C to 28°C?",
    "a": "+4°C.",
    "topic": "04"
  },
  {
    "q": "Why is a calorimeter ideally insulated?",
    "a": "To reduce heat exchange with the external surroundings.",
    "topic": "04"
  },
  {
    "q": "Does a rise in the calorimeter water temperature indicate exothermic or endothermic reaction?",
    "a": "Exothermic reaction inside the reaction vessel.",
    "topic": "04"
  },
  {
    "q": "What is the heat absorbed by 750 g of water heated 4°C at c = 4.2 J/(g·°C)?",
    "a": "12,600 J = 12.6 kJ.",
    "topic": "04"
  },
  {
    "q": "How many moles are present in 1.5 g acetic acid (M = 60 g/mol)?",
    "a": "0.025 mol.",
    "topic": "04"
  },
  {
    "q": "For 1.5 g acetic acid burning and 12.6 kJ absorbed by water, what is molar combustion heat?",
    "a": "−504 kJ/mol.",
    "topic": "04"
  },
  {
    "q": "What is the heat lost by reaction if 2.4 kJ/°C calorimeter rises 0.12°C?",
    "a": "−0.288 kJ = −288 J.",
    "topic": "04"
  },
  {
    "q": "What is the significance of neglecting calorimeter heat capacity?",
    "a": "Only the heat gained or lost by its water is counted.",
    "topic": "04"
  },
  {
    "q": "Why must physical states be specified in thermochemical equations?",
    "a": "Reaction enthalpy depends on whether reactants and products are solid, liquid or gas.",
    "topic": "05"
  },
  {
    "q": "How does ΔH change if a thermochemical equation is reversed?",
    "a": "Its sign reverses.",
    "topic": "05"
  },
  {
    "q": "How does ΔH change if every equation coefficient is multiplied by k?",
    "a": "ΔH is multiplied by k.",
    "topic": "05"
  },
  {
    "q": "Define standard enthalpy of reaction ΔH°r.",
    "a": "Enthalpy change accompanying the stated reaction under standard conditions (25°C/298 K and 1 atm as used in the chapter).",
    "topic": "05"
  },
  {
    "q": "Define standard enthalpy of formation ΔH°f.",
    "a": "Heat change when 1 mole of a compound forms from elements in their most stable standard forms.",
    "topic": "05"
  },
  {
    "q": "State the three conditions for ΔH°r = ΔH°f for a compound.",
    "a": "Exactly 1 mol of compound forms; reactants are elements; elements are in their most stable standard states.",
    "topic": "05"
  },
  {
    "q": "Why is ΔH°r not necessarily equal to ΔH°f?",
    "a": "The reaction may fail one or more standard formation conditions.",
    "topic": "05"
  },
  {
    "q": "What is ΔH°f of an element in its most stable standard state?",
    "a": "Zero.",
    "topic": "05"
  },
  {
    "q": "Why is ΔH°f zero for an element in its most stable standard state?",
    "a": "Formation of the element from itself causes no net enthalpy change.",
    "topic": "05"
  },
  {
    "q": "Give examples of stable standard forms of elements in this chapter.",
    "a": "H₂(g), Hg(l), Mg(s), carbon as graphite, and the specified most-stable elemental forms.",
    "topic": "05"
  },
  {
    "q": "Which is the standard formation equation for CO₂(g)?",
    "a": "C(graphite) + O₂(g) → CO₂(g).",
    "topic": "05"
  },
  {
    "q": "Which is the standard formation equation for H₂O(l)?",
    "a": "H₂(g) + ½O₂(g) → H₂O(l).",
    "topic": "05"
  },
  {
    "q": "Which equation forms exactly 1 mole of ammonia from elements?",
    "a": "½N₂(g) + 3/2 H₂(g) → NH₃(g).",
    "topic": "05"
  },
  {
    "q": "How is ΔH°r related to ΔH°f when 2 moles of a compound form from elements?",
    "a": "ΔH°f = ΔH°r / 2.",
    "topic": "05"
  },
  {
    "q": "How is the formation reaction of benzene C₆H₆(l) written?",
    "a": "6C(graphite) + 3H₂(g) → C₆H₆(l).",
    "topic": "05"
  },
  {
    "q": "Define standard enthalpy of combustion ΔH°c.",
    "a": "Heat released by complete combustion of 1 mole of substance in excess oxygen under standard conditions.",
    "topic": "05"
  },
  {
    "q": "What is the unit of standard combustion enthalpy?",
    "a": "kJ/mol.",
    "topic": "05"
  },
  {
    "q": "State the conditions for standard combustion enthalpy.",
    "a": "1 mole burned; sufficient oxygen; complete combustion.",
    "topic": "05"
  },
  {
    "q": "Why are combustion enthalpies negative?",
    "a": "Complete combustion releases heat (exothermic).",
    "topic": "05"
  },
  {
    "q": "When is ΔH°r = ΔH°c?",
    "a": "When the written reaction burns exactly 1 mole of the substance completely with excess oxygen.",
    "topic": "05"
  },
  {
    "q": "Does every reaction enthalpy equal a combustion enthalpy?",
    "a": "No; only reactions meeting the standard combustion conditions.",
    "topic": "05"
  },
  {
    "q": "What two applications of combustion heat are listed in the chapter?",
    "a": "Assessing fuels and foods; obtaining formation enthalpies of compounds not easily made directly from elements.",
    "topic": "05"
  },
  {
    "q": "What are the complete-combustion products of a compound containing C and H?",
    "a": "CO₂ and H₂O, as represented in the chapter.",
    "topic": "05"
  },
  {
    "q": "Give the balanced complete combustion equation of methane.",
    "a": "CH₄ + 2O₂ → CO₂ + 2H₂O.",
    "topic": "05"
  },
  {
    "q": "Give the balanced complete combustion equation of propane.",
    "a": "C₃H₈ + 5O₂ → 3CO₂ + 4H₂O.",
    "topic": "05"
  },
  {
    "q": "Give the balanced complete combustion equation of ethanol.",
    "a": "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O.",
    "topic": "05"
  },
  {
    "q": "Give the balanced complete combustion equation of methanol.",
    "a": "CH₃OH + 3/2 O₂ → CO₂ + 2H₂O.",
    "topic": "05"
  },
  {
    "q": "Give the balanced complete combustion equation of benzene.",
    "a": "C₆H₆ + 15/2 O₂ → 6CO₂ + 3H₂O.",
    "topic": "05"
  },
  {
    "q": "If 4H₂ + 2O₂ → 4H₂O has ΔH°r = −1144 kJ, what is ΔH°f of liquid H₂O?",
    "a": "−286 kJ/mol.",
    "topic": "05"
  },
  {
    "q": "If H₂ + F₂ → 2HF and ΔH°f(HF) = −271 kJ/mol, what is ΔH°r?",
    "a": "−542 kJ.",
    "topic": "05"
  },
  {
    "q": "Why is H₂ + F₂ → 2HF not itself the formation reaction of 1 mole of HF?",
    "a": "It produces 2 moles of HF, not 1 mole.",
    "topic": "05"
  },
  {
    "q": "What must be done to calculate ΔH°c for an element from a reaction burning 4 mol of it?",
    "a": "Divide the reaction enthalpy by 4.",
    "topic": "05"
  },
  {
    "q": "What is the difference between ΔH°r, ΔH°f and ΔH°c?",
    "a": "ΔH°r covers a reaction as written; ΔH°f forms 1 mol compound from standard elements; ΔH°c burns 1 mol completely in oxygen.",
    "topic": "05"
  },
  {
    "q": "Define enthalpy of vaporization.",
    "a": "Heat absorbed to convert 1 mole of liquid into gas, ΔHvap > 0.",
    "topic": "06"
  },
  {
    "q": "Define enthalpy of condensation.",
    "a": "Heat released when 1 mole of gas becomes liquid, ΔHcond < 0.",
    "topic": "06"
  },
  {
    "q": "Define enthalpy of fusion.",
    "a": "Heat absorbed when 1 mole of solid melts into liquid, ΔHfus > 0.",
    "topic": "06"
  },
  {
    "q": "Define enthalpy of crystallization.",
    "a": "Heat released when 1 mole of liquid solidifies, ΔHcryst < 0.",
    "topic": "06"
  },
  {
    "q": "Define enthalpy of sublimation.",
    "a": "Heat absorbed to change 1 mole of solid directly into gas.",
    "topic": "06"
  },
  {
    "q": "Relate vaporization and condensation enthalpies for one mole.",
    "a": "ΔHvap = −ΔHcond.",
    "topic": "06"
  },
  {
    "q": "Relate fusion and crystallization enthalpies for one mole.",
    "a": "ΔHfus = −ΔHcryst.",
    "topic": "06"
  },
  {
    "q": "How can sublimation enthalpy be obtained from other phase changes?",
    "a": "ΔHsub = ΔHfus + ΔHvap for the stated path.",
    "topic": "06"
  },
  {
    "q": "What is ΔH for H₂O(l) → H₂O(g) using the chapter's example?",
    "a": "+44 kJ/mol.",
    "topic": "06"
  },
  {
    "q": "What is ΔH for H₂O(g) → H₂O(l)?",
    "a": "−44 kJ/mol.",
    "topic": "06"
  },
  {
    "q": "What is ΔH for H₂O(s) → H₂O(l)?",
    "a": "+6 kJ/mol.",
    "topic": "06"
  },
  {
    "q": "What is ΔH for H₂O(l) → H₂O(s)?",
    "a": "−6 kJ/mol.",
    "topic": "06"
  },
  {
    "q": "If ammonia vaporization enthalpy is +23 kJ/mol, what is condensation enthalpy?",
    "a": "−23 kJ/mol.",
    "topic": "06"
  },
  {
    "q": "If acetic acid fusion enthalpy is +5.11 kJ/mol, what is crystallization enthalpy?",
    "a": "−5.11 kJ/mol.",
    "topic": "06"
  },
  {
    "q": "Why are condensation and crystallization exothermic?",
    "a": "Molecules move to lower-enthalpy phases and release heat.",
    "topic": "06"
  },
  {
    "q": "State Hess's law.",
    "a": "Total reaction enthalpy is the same whether a reaction happens in one step or several; add intermediate enthalpies.",
    "topic": "06"
  },
  {
    "q": "Why is Hess's law possible?",
    "a": "Enthalpy is a state function and ΔH depends only on initial and final states.",
    "topic": "06"
  },
  {
    "q": "Why are some reaction enthalpies calculated indirectly?",
    "a": "Some reactions are too slow, difficult to carry out directly, or form unwanted side products.",
    "topic": "06"
  },
  {
    "q": "Why is direct measurement of heat for forming CO from C and O₂ difficult?",
    "a": "Formation of CO₂ cannot be completely prevented in that reaction.",
    "topic": "06"
  },
  {
    "q": "What do you do to ΔH when you reverse an equation while using Hess's law?",
    "a": "Reverse its sign.",
    "topic": "06"
  },
  {
    "q": "What do you do to ΔH when you multiply a Hess equation by 3?",
    "a": "Multiply ΔH by 3.",
    "topic": "06"
  },
  {
    "q": "How is the overall ΔH found after combining equations using Hess's law?",
    "a": "Sum their adjusted ΔH values, cancelling intermediate species.",
    "topic": "06"
  },
  {
    "q": "State the standard formation-enthalpy equation for reaction enthalpy.",
    "a": "ΔH°r = ΣnΔH°f(products) − ΣnΔH°f(reactants).",
    "topic": "06"
  },
  {
    "q": "What does n represent in the formation-enthalpy sum?",
    "a": "The balanced stoichiometric coefficient of each species.",
    "topic": "06"
  },
  {
    "q": "What is ΔH°f of elements in their stable standard forms in formation sums?",
    "a": "0.",
    "topic": "06"
  },
  {
    "q": "What is the relation between heat of decomposition and formation for reverse reactions?",
    "a": "They are equal in magnitude and opposite in sign.",
    "topic": "06"
  },
  {
    "q": "State Laplace's law as given in the chapter.",
    "a": "Heat released in one direction equals the heat absorbed in the reverse direction, with opposite sign.",
    "topic": "06"
  },
  {
    "q": "In Al thermite reaction 2Al + Fe₂O₃ → Al₂O₃ + 2Fe, given ΔH°f(Al₂O₃)=−1670 and ΔH°f(Fe₂O₃)=−822, find ΔH°r.",
    "a": "−848 kJ.",
    "topic": "06"
  },
  {
    "q": "Using Hess's law, what is ΔH°f(SO₃) if ΔH°f(SO₂)=−297 and 2SO₂+O₂→2SO₃ has ΔH=−196 kJ?",
    "a": "−395 kJ/mol.",
    "topic": "06"
  },
  {
    "q": "Using Hess's law, find ΔH for 2S+3O₂→2SO₃ with 2SO₂+O₂→2SO₃ (−196 kJ) and S+O₂→SO₂ (−297 kJ).",
    "a": "−790 kJ.",
    "topic": "06"
  },
  {
    "q": "If the formation enthalpy of water(l) is −286 kJ/mol, what is its decomposition enthalpy?",
    "a": "+286 kJ/mol for H₂O(l) → H₂ + ½O₂.",
    "topic": "06"
  },
  {
    "q": "Define a spontaneous process.",
    "a": "A physical or chemical change that occurs on its own under the specified conditions.",
    "topic": "07"
  },
  {
    "q": "Define a non-spontaneous process.",
    "a": "A process that does not occur on its own under the specified conditions.",
    "topic": "07"
  },
  {
    "q": "Are spontaneity and reaction speed the same concept?",
    "a": "No; spontaneity concerns whether a change proceeds, not how quickly.",
    "topic": "07"
  },
  {
    "q": "Give a spontaneous example involving gravity.",
    "a": "Water flows downward from a waterfall.",
    "topic": "07"
  },
  {
    "q": "Give a spontaneous example of heat transfer.",
    "a": "Heat flows from a hot object to a colder object.",
    "topic": "07"
  },
  {
    "q": "Give a spontaneous dissolving example.",
    "a": "Sugar dissolving in coffee, or salt dissolving in water.",
    "topic": "07"
  },
  {
    "q": "What occurs spontaneously when a perfume bottle is opened?",
    "a": "Perfume vapor spreads through the surrounding room.",
    "topic": "07"
  },
  {
    "q": "What occurs to gas released into an evacuated space?",
    "a": "It expands and spreads spontaneously.",
    "topic": "07"
  },
  {
    "q": "Why doesn't ΔH alone establish spontaneity?",
    "a": "Some processes are spontaneous even though they absorb heat; entropy and Gibbs free energy must be considered.",
    "topic": "07"
  },
  {
    "q": "Give a spontaneous endothermic process from the chapter.",
    "a": "Dissolving NH₄Cl in water, or ice melting under the applicable conditions.",
    "topic": "07"
  },
  {
    "q": "Define entropy (S).",
    "a": "A thermodynamic state function describing the degree of disorder/randomness of a system.",
    "topic": "07"
  },
  {
    "q": "What is the symbol of entropy?",
    "a": "S.",
    "topic": "07"
  },
  {
    "q": "What is the unit used for entropy in the chapter?",
    "a": "J/(K·mol).",
    "topic": "07"
  },
  {
    "q": "How is entropy change calculated?",
    "a": "ΔS = Sf − Si.",
    "topic": "07"
  },
  {
    "q": "Does entropy itself or only its change determine the direction of the process?",
    "a": "The chapter's calculations use entropy change ΔS, which may be positive or negative.",
    "topic": "07"
  },
  {
    "q": "What does ΔS > 0 indicate?",
    "a": "Increased randomness/disorder.",
    "topic": "07"
  },
  {
    "q": "What does ΔS < 0 indicate?",
    "a": "Decreased randomness/increased order.",
    "topic": "07"
  },
  {
    "q": "Which state is most ordered, solid, liquid or gas?",
    "a": "Solid, for the usual states discussed.",
    "topic": "07"
  },
  {
    "q": "How does entropy change from solid to liquid?",
    "a": "It generally increases: ΔS > 0.",
    "topic": "07"
  },
  {
    "q": "How does entropy change from liquid to vapor?",
    "a": "It increases: ΔS > 0.",
    "topic": "07"
  },
  {
    "q": "How does entropy change during sublimation?",
    "a": "It increases: ΔS > 0.",
    "topic": "07"
  },
  {
    "q": "How does entropy change during freezing?",
    "a": "It decreases: ΔS < 0.",
    "topic": "07"
  },
  {
    "q": "How does entropy change during condensation?",
    "a": "It decreases: ΔS < 0.",
    "topic": "07"
  },
  {
    "q": "How does entropy change during deposition of vapor into solid?",
    "a": "It decreases: ΔS < 0.",
    "topic": "07"
  },
  {
    "q": "How does entropy change when iodine sublimes?",
    "a": "It increases.",
    "topic": "07"
  },
  {
    "q": "How does entropy change when liquid bromine evaporates?",
    "a": "It increases.",
    "topic": "07"
  },
  {
    "q": "How does entropy change when a gas dissolves in liquid?",
    "a": "It decreases, as described in the chapter.",
    "topic": "07"
  },
  {
    "q": "How does entropy usually change when an ionic solid such as NaCl dissolves in water?",
    "a": "It increases because of mixing with water and separation into ions.",
    "topic": "07"
  },
  {
    "q": "What two factors contribute to entropy increase upon NaCl dissolution?",
    "a": "Mixing solute and solvent; dissociation of the ionic solid into ions.",
    "topic": "07"
  },
  {
    "q": "How does entropy change when glucose dissolves in water?",
    "a": "It increases because mixing increases randomness.",
    "topic": "07"
  },
  {
    "q": "How does entropy change when sugar crystallizes out of a solution?",
    "a": "It decreases because an ordered crystal forms.",
    "topic": "07"
  },
  {
    "q": "How does entropy change when a gas is heated?",
    "a": "It increases because molecular translational, rotational and vibrational motions increase.",
    "topic": "07"
  },
  {
    "q": "How does cooling affect entropy?",
    "a": "It usually decreases it because molecular motion is reduced.",
    "topic": "07"
  },
  {
    "q": "How does compression of a gas at constant temperature affect entropy?",
    "a": "Entropy decreases, ΔS < 0.",
    "topic": "07"
  },
  {
    "q": "How can the sign of ΔS be predicted from gaseous mole counts?",
    "a": "More moles of gaseous products usually mean ΔS > 0; fewer mean ΔS < 0.",
    "topic": "07"
  },
  {
    "q": "For CO(g)+2H₂(g)→CH₃OH(g), what is the expected sign of ΔS?",
    "a": "Negative, because gaseous molecules decrease from 3 to 1 mole.",
    "topic": "07"
  },
  {
    "q": "For 2O₃(g)→3O₂(g), what is the expected sign of ΔS?",
    "a": "Positive: gaseous mole count rises from 2 to 3.",
    "topic": "07"
  },
  {
    "q": "Why does water vaporization increase entropy more than ice melting?",
    "a": "Conversion to gas creates much greater molecular freedom/disorder.",
    "topic": "07"
  },
  {
    "q": "What are two reasons water vapor has more entropy than liquid water?",
    "a": "Greater freedom of movement and more randomly distributed molecules.",
    "topic": "07"
  },
  {
    "q": "State the formula for standard entropy change of a reaction.",
    "a": "ΔS°r = ΣnS°(products) − ΣnS°(reactants).",
    "topic": "07"
  },
  {
    "q": "Is standard entropy S° of a stable elemental substance necessarily zero?",
    "a": "No; use its tabulated nonzero entropy value.",
    "topic": "07"
  },
  {
    "q": "What is the key difference between ΔH°f of an element and its standard entropy S°?",
    "a": "ΔH°f of stable elements is zero; S° need not be zero.",
    "topic": "07"
  },
  {
    "q": "For N₂ + 3H₂ → 2NH₃, what general sign is expected for ΔS?",
    "a": "Negative because gas moles decrease from four to two.",
    "topic": "07"
  },
  {
    "q": "Why does entropy rise on melting despite the substance remaining the same?",
    "a": "Particles become less fixed and more disordered than in the crystal lattice.",
    "topic": "07"
  },
  {
    "q": "Define Gibbs free energy (G).",
    "a": "A thermodynamic state function that helps predict spontaneity of physical and chemical processes at constant temperature and pressure.",
    "topic": "08"
  },
  {
    "q": "What symbol denotes Gibbs free energy?",
    "a": "G.",
    "topic": "08"
  },
  {
    "q": "State Gibbs's equation.",
    "a": "ΔG = ΔH − TΔS.",
    "topic": "08"
  },
  {
    "q": "In Gibbs's equation, what units must temperature have?",
    "a": "Kelvin.",
    "topic": "08"
  },
  {
    "q": "What does ΔG < 0 mean?",
    "a": "The process is spontaneous in the forward direction.",
    "topic": "08"
  },
  {
    "q": "What does ΔG > 0 mean?",
    "a": "The forward process is non-spontaneous under the stated conditions.",
    "topic": "08"
  },
  {
    "q": "What does ΔG = 0 mean?",
    "a": "The system is at equilibrium.",
    "topic": "08"
  },
  {
    "q": "Can a reaction be spontaneous if ΔH > 0?",
    "a": "Yes, if TΔS is sufficiently positive that ΔG < 0.",
    "topic": "08"
  },
  {
    "q": "Define standard Gibbs free energy of reaction ΔG°r.",
    "a": "Change of Gibbs free energy for the reaction under standard conditions (25°C and 1 atm in the chapter).",
    "topic": "08"
  },
  {
    "q": "Define standard Gibbs free energy of formation ΔG°f.",
    "a": "Free-energy change on formation of 1 mole compound from standard stable elements.",
    "topic": "08"
  },
  {
    "q": "What is ΔG°f for a stable element in its standard state?",
    "a": "Zero.",
    "topic": "08"
  },
  {
    "q": "How is ΔG°r calculated using standard formation energies?",
    "a": "ΔG°r = ΣnΔG°f(products) − ΣnΔG°f(reactants).",
    "topic": "08"
  },
  {
    "q": "What is the standard unit for ΔG° and ΔH° in the numerical problems?",
    "a": "kJ/mol for molar values, or kJ per reaction as written.",
    "topic": "08"
  },
  {
    "q": "What is the common unit of standard entropy in the numerical problems?",
    "a": "J/(K·mol).",
    "topic": "08"
  },
  {
    "q": "What conversion is needed before using J/(K·mol) with ΔH in kJ in Gibbs's equation?",
    "a": "Divide ΔS in J/(K·mol) by 1000 to obtain kJ/(K·mol).",
    "topic": "08"
  },
  {
    "q": "Rearrange Gibbs's equation to solve for entropy change.",
    "a": "ΔS = (ΔH − ΔG)/T.",
    "topic": "08"
  },
  {
    "q": "Rearrange Gibbs's equation to solve for enthalpy change.",
    "a": "ΔH = ΔG + TΔS.",
    "topic": "08"
  },
  {
    "q": "What is the sign of ΔG°r when ∆G°f products sum is lower than reactants sum?",
    "a": "Negative.",
    "topic": "08"
  },
  {
    "q": "For 2NO+O₂→2NO₂ with ΔG°f(NO)=87 and ΔG°f(NO₂)=52 kJ/mol, find ΔG°r.",
    "a": "−70 kJ; spontaneous.",
    "topic": "08"
  },
  {
    "q": "For 2CO+O₂→2CO₂ given ΔH°r=−566 kJ and ΔS°r=−173 J/(K·mol) at 298 K, find ΔG°r.",
    "a": "−514.446 kJ; spontaneous.",
    "topic": "08"
  },
  {
    "q": "For ethanol combustion with ΔH°r=−1368 kJ and ΔS°r=−138 J/(K·mol), find ΔG°r at 298 K.",
    "a": "−1326.876 kJ; spontaneous.",
    "topic": "08"
  },
  {
    "q": "For CaCO₃→CaO+CO₂ with ΔH°r=+178.5 kJ and ΔS°r=+160 J/(K·mol), what is ΔG°r at 298 K?",
    "a": "+130.82 kJ; non-spontaneous.",
    "topic": "08"
  },
  {
    "q": "At what temperature does CaCO₃→CaO+CO₂ become spontaneous if ΔH=178.5 kJ and ΔS=0.160 kJ/K?",
    "a": "T > 1115.6 K.",
    "topic": "08"
  },
  {
    "q": "What is the ΔG°r for HCOOH(l)→CO(g)+H₂O(l) when ΔH=16 kJ, ΔS=234 J/(K·mol) at 298 K?",
    "a": "−53.732 kJ; spontaneous.",
    "topic": "08"
  },
  {
    "q": "Why is a negative ΔG more informative about spontaneity than a negative ΔH alone?",
    "a": "ΔG accounts for both enthalpy and entropy at the temperature considered.",
    "topic": "08"
  },
  {
    "q": "What is the significance of constant pressure and temperature for Gibbs free energy?",
    "a": "Under those conditions, the sign of ΔG predicts the thermodynamic direction of change.",
    "topic": "08"
  },
  {
    "q": "Name the two thermodynamic factors governing spontaneity in Gibbs's equation.",
    "a": "Enthalpy change ΔH and entropy change ΔS, together with temperature T.",
    "topic": "09"
  },
  {
    "q": "If ΔH < 0 and ΔS > 0, is a reaction spontaneous at all temperatures?",
    "a": "Yes; ΔG = ΔH − TΔS is always negative for positive T.",
    "topic": "09"
  },
  {
    "q": "If ΔH > 0 and ΔS < 0, is a reaction spontaneous at any temperature?",
    "a": "No; ΔG is always positive for positive T.",
    "topic": "09"
  },
  {
    "q": "If ΔH > 0 and ΔS > 0, when is the reaction spontaneous?",
    "a": "At sufficiently high temperature, TΔS > ΔH.",
    "topic": "09"
  },
  {
    "q": "If ΔH < 0 and ΔS < 0, when is the reaction spontaneous?",
    "a": "At sufficiently low temperature, where the negative ΔH dominates and ΔG < 0.",
    "topic": "09"
  },
  {
    "q": "When does changing temperature not reverse predicted spontaneity?",
    "a": "When ΔH and ΔS have opposite signs (−/+, always spontaneous; +/−, always non-spontaneous).",
    "topic": "09"
  },
  {
    "q": "Which sign combination produces spontaneous reactions only at high temperature?",
    "a": "ΔH positive and ΔS positive.",
    "topic": "09"
  },
  {
    "q": "Which sign combination produces spontaneous reactions only at low temperature?",
    "a": "ΔH negative and ΔS negative.",
    "topic": "09"
  },
  {
    "q": "What is the threshold temperature for ΔH>0 and ΔS>0?",
    "a": "Tcritical = ΔH/ΔS; spontaneous above it.",
    "topic": "09"
  },
  {
    "q": "What is the threshold temperature for ΔH<0 and ΔS<0?",
    "a": "Tcritical = ΔH/ΔS (positive ratio); spontaneous below it.",
    "topic": "09"
  },
  {
    "q": "Why does increasing temperature favor an endothermic reaction with ΔS > 0?",
    "a": "The term −TΔS becomes more negative as T increases.",
    "topic": "09"
  },
  {
    "q": "Why does increasing temperature disfavor an exothermic reaction with ΔS < 0?",
    "a": "The term −TΔS becomes more positive as T increases.",
    "topic": "09"
  },
  {
    "q": "What are ΔH and ΔS signs for thermal decomposition of CaCO₃?",
    "a": "ΔH > 0; ΔS > 0 because CO₂ gas forms.",
    "topic": "09"
  },
  {
    "q": "Why does calcium carbonate not decompose spontaneously at ordinary temperature?",
    "a": "TΔS is smaller than positive ΔH, so ΔG > 0.",
    "topic": "09"
  },
  {
    "q": "How can decomposition of CaCO₃ be made spontaneous?",
    "a": "Raise temperature until TΔS > ΔH.",
    "topic": "09"
  },
  {
    "q": "Why is ozone decomposition 2O₃→3O₂ spontaneous according to the chapter's sign argument?",
    "a": "ΔH < 0 and ΔS > 0; therefore ΔG < 0 at any T.",
    "topic": "09"
  },
  {
    "q": "Why is ozone formation 3O₂→2O₃ non-spontaneous in the chapter's argument?",
    "a": "ΔH > 0 and ΔS < 0; ΔG > 0 at any T.",
    "topic": "09"
  },
  {
    "q": "How does changing temperature affect spontaneous formation of NH₄Cl(s) from NH₃(g)+HCl(g)?",
    "a": "The exothermic, entropy-decreasing reaction is favored at low temperature.",
    "topic": "09"
  },
  {
    "q": "Why does peroxide decomposition 2H₂O₂→2H₂O+O₂ have ΔS>0?",
    "a": "A gas is produced, increasing randomness.",
    "topic": "09"
  },
  {
    "q": "For reaction A, ΔH=+126 kJ and ΔS=+48 J/K, above what temperature is it spontaneous?",
    "a": "Above 2625 K.",
    "topic": "09"
  },
  {
    "q": "For reaction B, ΔH=−12 kJ and ΔS=−105 J/K, below what temperature is it spontaneous?",
    "a": "Below about 114.3 K.",
    "topic": "09"
  },
  {
    "q": "If ΔH=+11 kJ and ΔS=+30 J/K, what is ΔG at 298 K?",
    "a": "+2.06 kJ; non-spontaneous.",
    "topic": "09"
  },
  {
    "q": "If ΔH=+2 kJ and ΔS=+113 J/K, what is ΔG at 298 K?",
    "a": "−31.674 kJ; spontaneous.",
    "topic": "09"
  },
  {
    "q": "For CaCO₃ decomposition (ΔH=178.5 kJ, ΔS=160 J/K), what is ΔG at 627°C (900 K)?",
    "a": "+34.5 kJ; non-spontaneous.",
    "topic": "09"
  },
  {
    "q": "For the same CaCO₃ decomposition, what is ΔG at 927°C (1200 K)?",
    "a": "−13.5 kJ; spontaneous.",
    "topic": "09"
  },
  {
    "q": "If melting ice has ΔH=6 kJ and ΔS=22 J/K, what is ΔG at 300 K?",
    "a": "−0.6 kJ; spontaneous.",
    "topic": "09"
  },
  {
    "q": "If melting ice has ΔH=6 kJ and ΔS=22 J/K, what is ΔG at 250 K?",
    "a": "+0.5 kJ; non-spontaneous.",
    "topic": "09"
  },
  {
    "q": "Can an endothermic process such as salt dissolution be spontaneous?",
    "a": "Yes; if the entropy increase makes TΔS greater than ΔH.",
    "topic": "09"
  },
  {
    "q": "For spontaneous endothermic NaCl dissolution that cools the solution, what are ΔH, ΔS and ΔG signs?",
    "a": "ΔH positive, ΔS positive, ΔG negative.",
    "topic": "09"
  },
  {
    "q": "What does Tm mean?",
    "a": "Melting temperature in kelvin.",
    "topic": "10"
  },
  {
    "q": "What does Tb mean?",
    "a": "Boiling temperature in kelvin.",
    "topic": "10"
  },
  {
    "q": "What is ΔG at the phase-transition equilibrium temperature?",
    "a": "ΔG = 0.",
    "topic": "10"
  },
  {
    "q": "Why is ΔG zero at the melting or boiling equilibrium temperature?",
    "a": "The two phases are in thermodynamic equilibrium.",
    "topic": "10"
  },
  {
    "q": "What is the general formula for entropy of a physical transition at equilibrium?",
    "a": "ΔStr = ΔHtr/Ttr.",
    "topic": "10"
  },
  {
    "q": "What is the entropy of fusion at equilibrium?",
    "a": "ΔSfus = ΔHfus/Tm.",
    "topic": "10"
  },
  {
    "q": "What is the entropy of vaporization at equilibrium?",
    "a": "ΔSvap = ΔHvap/Tb.",
    "topic": "10"
  },
  {
    "q": "When can ΔS = ΔH/T be used for a phase change?",
    "a": "At its equilibrium phase-transition temperature.",
    "topic": "10"
  },
  {
    "q": "What temperature in kelvin is used for water melting/freezing?",
    "a": "273 K (0°C) in the chapter.",
    "topic": "10"
  },
  {
    "q": "What temperature in kelvin is used for water boiling/condensation?",
    "a": "373 K (100°C) in the chapter.",
    "topic": "10"
  },
  {
    "q": "If ΔHfus of ice is +6 kJ/mol at 273 K, calculate ΔSfus.",
    "a": "6000/273 ≈ +22 J/(K·mol) (chapter sometimes rounds to 21).",
    "topic": "10"
  },
  {
    "q": "If ΔHvap of water is +44 kJ/mol at 373 K, calculate ΔSvap.",
    "a": "44000/373 ≈ +118 J/(K·mol).",
    "topic": "10"
  },
  {
    "q": "What is entropy change when water vapor condenses at 373 K with ΔHcond = −44 kJ/mol?",
    "a": "≈ −118 J/(K·mol).",
    "topic": "10"
  },
  {
    "q": "What is entropy change when liquid water freezes at 273 K with ΔHcryst=−6 kJ/mol?",
    "a": "≈ −22 J/(K·mol).",
    "topic": "10"
  },
  {
    "q": "How is ΔHvap of water found from ΔH°f of H₂O(g)=−242 and H₂O(l)=−286 kJ/mol?",
    "a": "ΔHvap = −242 − (−286) = +44 kJ/mol.",
    "topic": "10"
  },
  {
    "q": "How is ΔHfus of ice found from ΔH°f water(l)=−286 and ice=−292 kJ/mol?",
    "a": "ΔHfus = −286 − (−292) = +6 kJ/mol.",
    "topic": "10"
  },
  {
    "q": "Given NH₃ vaporization ΔH=23.3 kJ/mol and ΔS=97.2 J/(K·mol), find boiling temperature.",
    "a": "Tb = 23,300/97.2 ≈ 239.7 K.",
    "topic": "10"
  },
  {
    "q": "What is the Gibbs relation to equilibrium constant used in the chapter review?",
    "a": "ΔG° = −RT ln K(eq).",
    "topic": "10"
  },
  {
    "q": "What is the condition for spontaneity at equilibrium for a phase change?",
    "a": "At equilibrium ΔG = 0; on either side of the transition point, the sign of ΔG determines favored direction.",
    "topic": "10"
  },
  {
    "q": "Why are phase-transition entropy formulas inappropriate away from equilibrium without further data?",
    "a": "The chapter derives ΔS=ΔH/T by setting ΔG=0 at the phase equilibrium temperature.",
    "topic": "10"
  },
  {
    "q": "[Review p11] Iron 870 g, c=0.45 J/(g°C), warmed 5→95°C: calculate q.",
    "a": "35.235 kJ.",
    "topic": "11"
  },
  {
    "q": "[Review p11] Mg 10 g absorbs 205 J, warmed 25→45°C: calculate c.",
    "a": "1.025 ≈ 1.03 J/(g°C).",
    "topic": "11"
  },
  {
    "q": "[Review p11] Metal 100 g absorbs 10 kJ, warmed 20→60°C: calculate c.",
    "a": "2.5 J/(g°C).",
    "topic": "11"
  },
  {
    "q": "[Review p11] Silver 360 g with C=86 J/°C: find c.",
    "a": "0.2389 J/(g°C).",
    "topic": "11"
  },
  {
    "q": "[Review p12] Copper 6 g, c=0.39 J/(g°C), heated 21→124°C: calculate q.",
    "a": "0.24102 kJ.",
    "topic": "11"
  },
  {
    "q": "[Review p12] Mercury 350 g, c=0.14 J/(g°C), cooled 77→12°C: find q.",
    "a": "−3.185 kJ (released).",
    "topic": "11"
  },
  {
    "q": "[Review p12] Ethanol 34 g, c=2.44 J/(g°C), heated 25→79°C: calculate heat absorbed.",
    "a": "4479.84 J ≈ 4.48 kJ.",
    "topic": "11"
  },
  {
    "q": "[Review p12] Substance 155 g absorbs 5700 J, heated 25→40°C: find c.",
    "a": "≈ 2.45 J/(g°C).",
    "topic": "11"
  },
  {
    "q": "[Review p13] Gold 360 g with C=85.7 J/°C: calculate c.",
    "a": "0.238 J/(g°C).",
    "topic": "11"
  },
  {
    "q": "[Review p13] Gold 4.5 g, c=0.13, absorbs 276 J from 25°C: find Tf.",
    "a": "≈ 496.8°C (arithmetic result as printed).",
    "topic": "11"
  },
  {
    "q": "[Review p15] Mg 10 g absorbs 200 J, heated 15→55°C: find c.",
    "a": "0.5 J/(g°C).",
    "topic": "11"
  },
  {
    "q": "[Review p15] Iron 550 g, c=0.45, heated through 80°C: find q.",
    "a": "19,800 J.",
    "topic": "11"
  },
  {
    "q": "[Review p15] Substance 155 g absorbs 5400 J with ΔT=15°C: find c.",
    "a": "≈ 2.32 J/(g°C).",
    "topic": "11"
  },
  {
    "q": "[Review p15] Substance 150 g absorbs 5400 J with ΔT=20°C: find c.",
    "a": "1.8 J/(g°C).",
    "topic": "11"
  },
  {
    "q": "[Review p15] Ethanol 26 g, c=2.44, warmed 48°C: calculate q.",
    "a": "3045.12 J.",
    "topic": "11"
  },
  {
    "q": "[Question bank p16 Q1] Heat capacity C=222 J/°C and warming 40→80°C: find q.",
    "a": "8880 J.",
    "topic": "11"
  },
  {
    "q": "[Question bank p16 Q2] Gold 360 g with heat capacity 85.7 J/°C: find c.",
    "a": "≈ 0.238 J/(g°C).",
    "topic": "11"
  },
  {
    "q": "[Question bank p16 Q3] Copper 100 g, c=0.389, warmed 10→100°C: find q.",
    "a": "3501 J.",
    "topic": "11"
  },
  {
    "q": "[Question bank p16 Q4] Water 1 g absorbs 58.8 J, c=4.2, initially 51°C: find Tf.",
    "a": "65°C.",
    "topic": "11"
  },
  {
    "q": "[Question bank p16 Q5] Metal 18.5 g absorbs 1.170 kJ and warms from 25 to 92.5°C: find c.",
    "a": "≈ 0.937 J/(g°C) (file rounds to 0.936).",
    "topic": "11"
  },
  {
    "q": "[Question bank p17 Q7] Ethanol 26 g, c=2.44, heats 50→98°C: find q.",
    "a": "3.04512 kJ.",
    "topic": "11"
  },
  {
    "q": "[Question bank p17 Q8] Silver 5 g, c=0.24, absorbs 252 J to reach 235°C: find Ti.",
    "a": "25°C.",
    "topic": "11"
  },
  {
    "q": "[Question bank p37 Q1] Al 0.1 g burns in 500 g water heated 20.8→22.02°C; cwater=4.2, MAl=27: find combustion heat per mole.",
    "a": "By the stated figures ≈ −691.74 kJ/mol (file's printed answer ≈ −692.4324 kJ/mol differs slightly).",
    "topic": "12"
  },
  {
    "q": "[Question bank p37 Q2] Burning 256 g naphthalene (M=128) releases 0.850 kJ/mol into 2020 g water; c=4.2: find ΔT.",
    "a": "≈ +0.20°C.",
    "topic": "12"
  },
  {
    "q": "[Question bank p37 Q4] Methanol 3.2 g (M=32) heats 300 g water 25→32.2°C; find heat for 0.5 mol.",
    "a": "−45.36 kJ for 0.5 mol (not per mole).",
    "topic": "12"
  },
  {
    "q": "[Question bank p37 Q5] Acetic acid 12 g (M=60) releases 130 kJ; ΔH°f(CO₂)=−393.5 and ΔH°f(H₂O)=−286: find ΔH°f(CH₃COOH).",
    "a": "−709 kJ/mol using combustion CH₃COOH+2O₂→2CO₂+2H₂O.",
    "topic": "12"
  },
  {
    "q": "[Question bank p38 Q7] Propane 4.4 g (M=44) releases 222 kJ; ΔH°f(CO₂)=−394, ΔH°f(H₂O)=−286: find ΔH°f(C₃H₈).",
    "a": "−106 kJ/mol from the stated data.",
    "topic": "12"
  },
  {
    "q": "[Question bank p38 Q8] Benzene 7.8 g (M=78) releases 326.8 kJ; ΔH°f(CO₂)=−394, ΔH°f(H₂O)=−286: find ΔH°f(C₆H₆).",
    "a": "+46 kJ/mol from the stated data.",
    "topic": "12"
  },
  {
    "q": "[Question bank p38 Q9] Acetylene 2.6 g (M=26) heats 2025 g water 12.15→27.44°C, c=4.2; find ΔH°f(C₂H₂) using ΔH°f(CO₂)=−393.5 and H₂O=−286.",
    "a": "Approximately +227.4 kJ/mol.",
    "topic": "12"
  },
  {
    "q": "[Question bank p143 Q17] Calorimeter C=1.2 kJ/°C contains 1 kg water (c=4.2); ΔT=28.2−24.6°C: find heat released.",
    "a": "19.44 kJ released by reaction, qreaction=−19.44 kJ.",
    "topic": "12"
  },
  {
    "q": "[Question bank p143 Q18] Methane releases 89.1 kJ when burned; molar combustion ΔH≈−891 kJ/mol and M=16: find mass.",
    "a": "1.6 g.",
    "topic": "12"
  },
  {
    "q": "[Question bank p143 Q19] Acetylene 2.6 g (M=26) releases 130 kJ; ΔH°f(H₂O)=−286, CO₂=−393.5: find ΔH°f(C₂H₂).",
    "a": "+227 kJ/mol.",
    "topic": "12"
  },
  {
    "q": "[Question bank p144 Q20] Acetylene 0.26 g burns in 309.54 g water, c=4.2, ΔT=10°C; find ΔH°f(C₂H₂).",
    "a": "Approximately +227 kJ/mol from the stated calorimetry and formation data.",
    "topic": "12"
  },
  {
    "q": "[Question bank p52 Q1] 4Fe+3O₂→2Fe₂O₃ has ΔH°r=−1644 kJ: find ΔH°f(Fe₂O₃) and ΔH°c(Fe).",
    "a": "ΔH°f(Fe₂O₃)=−822 kJ/mol; ΔH°c(Fe)=−411 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p52 Q3] 2H₂+O₂→2H₂O has ΔH°r=−572 kJ: find ΔH°f(H₂O) and ΔH°c(H₂).",
    "a": "Both −286 kJ/mol for the specified product state.",
    "topic": "13"
  },
  {
    "q": "[Question bank p75 Q2] ΔH°c(propane)=−2219, ΔH°f(CO₂)=−394, ΔH°f(H₂O)=−286: find ΔH°f(propane).",
    "a": "−107 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p75 Q4] Phosphorus transformations via combustion give −3005 and −3018 kJ: find solid→gas enthalpy.",
    "a": "+13 kJ/mol (source assumes compatible phosphorus equations).",
    "topic": "13"
  },
  {
    "q": "[Question bank p75 Q5] Orthorhombic S combustion ΔH=−297.2; rhombic S combustion ΔH=−296.9: find orthorhombic→rhombic ΔH.",
    "a": "−0.3 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p76 Q6] Butane combustion to liquid water is −2878.5; to vapor is −2658.5 kJ/mol: find water vaporization enthalpy.",
    "a": "+44 kJ/mol (5 mol water produced).",
    "topic": "13"
  },
  {
    "q": "[Question bank p76 Q7] ΔH°c(CS₂)=−1073.5, ΔH°f(CO₂)=−393.5, ΔH°f(SO₂)=−297: find ΔH°f(CS₂).",
    "a": "+86 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p76 Q8] Using ammonia combustion (−339 kJ/mol) with ΔH°f(NO₂)=33.8 and ΔH°f(H₂O)=−286: find ΔH°f(NH₃).",
    "a": "Source answer: −56.2 kJ/mol; check coefficients/physical state before reuse.",
    "topic": "13"
  },
  {
    "q": "[Question bank p76 Q9] 2NH₃+3Cl₂→N₂+6HCl, ΔH°f(NH₃)=−46.2 and HCl=−92.3: find ΔH°r.",
    "a": "−461.4 kJ.",
    "topic": "13"
  },
  {
    "q": "[Question bank p76 Q10] Pentane ΔH°c=−3526.3; ΔH°f(H₂O)=−286 and CO₂=−393.5: find ΔH°f(pentane).",
    "a": "−157.2 kJ/mol from the stated figures; source prints +157.2, which has the wrong sign.",
    "topic": "13"
  },
  {
    "q": "[Question bank p77 Q11] Benzene ΔH°f=+49; water ΔH°f=−286 and CO₂=−393.5: find ΔH°c(C₆H₆).",
    "a": "−3268 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p77 Q12] 2CO+O₂→2CO₂ has ΔH°r=−566 kJ: find molar ΔH°c(CO).",
    "a": "−283 kJ/mol; ΔH°f(CO₂)=−393.5 kJ/mol is separate data.",
    "topic": "13"
  },
  {
    "q": "[Question bank p77 Q13] 3FeCl₂→2FeCl₃+Fe, ΔH°f(FeCl₂)=−341, ΔH°f(FeCl₃)=−400: find ΔH°r.",
    "a": "+223 kJ, endothermic.",
    "topic": "13"
  },
  {
    "q": "[Question bank p77 Q14] Ethanol ΔH°c=−1367; ΔH°f(H₂O)=−286, CO₂=−393.5: find ΔH°f(C₂H₅OH).",
    "a": "−278 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p77 Q15] Ethylene ΔH°f(C₂H₄)=+52.3, H₂O=−286, CO₂=−393.5: find ΔH°c(C₂H₄).",
    "a": "−1411.3 kJ/mol (source prints magnitude 1411.3).",
    "topic": "13"
  },
  {
    "q": "[Question bank p77 Q16] Sn→SnO₂ ΔH°c=−580.8; SnO→SnO₂ ΔH=−294.8: find ΔH°f(SnO).",
    "a": "−286 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p78 Q17] Fe₂O₃ decomposition +822; 2Fe₂O₃+4Al→4Fe+2Al₂O₃ has −1600 kJ: find ΔH°f(Al₂O₃).",
    "a": "−1622 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p78 Q18] S→SO₂ ΔH=−297 and 2SO₂+O₂→2SO₃ ΔH=−196: find ΔH°f(SO₃).",
    "a": "−395 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p78 Q19] N₂+2O₂→2NO₂ ΔH=+67.6; 2NO+O₂→2NO₂ ΔH=−113.2: find ΔH°f(NO).",
    "a": "+90.4 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p78 Q20] S→SO₂ −297 and 2SO₂+O₂→2SO₃ −196: find ΔH for 2S+3O₂→2SO₃.",
    "a": "−790 kJ.",
    "topic": "13"
  },
  {
    "q": "[Question bank p78 Q21] Hydrogenation C₂H₄+H₂→C₂H₆ with ΔH°c(C₂H₆)=−1560, ΔH°c(C₂H₄)=−1410, ΔH°c(H₂)=−286: find ΔH.",
    "a": "−136 kJ.",
    "topic": "13"
  },
  {
    "q": "[Question bank p79 Q22] Ethane ΔH°f=−84.67, H₂O=−286, CO₂=−393.5: find ΔH°c(C₂H₆).",
    "a": "−1560.33 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p79 Q23] Burning methane 1.6 g releases 89.015 kJ; ΔH°f(H₂O)=−286 and CO₂=−393.5: find ΔH°f(CH₄).",
    "a": "−75.35 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p79 Q24] Methanol ΔH°c=−726.5; CO₂=−393.5 and H₂O=−286: find ΔH°f(CH₃OH).",
    "a": "−239 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p79 Q25] SO₂+2C→2CO+S, ΔH°f(CO)=−110.5 and SO₂=−296: find ΔH°r.",
    "a": "+75 kJ.",
    "topic": "13"
  },
  {
    "q": "[Question bank p79 Q27] Propane combustion is −2220; H₂O=−286 and CO₂=−393.5: find ΔH°f(C₃H₈).",
    "a": "−104.5 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p80 Q28] Methane combustion is −890; H₂O=−286 and CO₂=−393.5: find ΔH°f(CH₄).",
    "a": "−75.5 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p80 Q29] 2CO+O₂→2CO₂ has ΔH°r=−566, ΔH°f(CO₂)=−393.5: find ΔH°c(CO) and ΔH°f(CO).",
    "a": "−283 kJ/mol; −110.5 kJ/mol, respectively.",
    "topic": "13"
  },
  {
    "q": "[Question bank p80 Q34] H₂S+3/2O₂→SO₂+H₂O; ΔH°f(H₂S)=−20, SO₂=−296, H₂O=−286: find ΔH°r.",
    "a": "−562 kJ/mol.",
    "topic": "13"
  },
  {
    "q": "[Question bank p80 Q35] 3 g ethane C₂H₆ (M=30) combustion releases 180 kJ; CO₂=−394 and H₂O=−286: find ΔH°f(C₂H₆).",
    "a": "+154 kJ/mol from the stated heat/mass data.",
    "topic": "13"
  },
  {
    "q": "[Review p88] 2CO+O₂→2CO₂, S°(CO)=198, S°(O₂)=205, S°(CO₂)=214: find ΔS°r.",
    "a": "−173 J/(K·mol).",
    "topic": "14"
  },
  {
    "q": "[Review p88] N₂+3H₂→2NH₃, S°NH₃=193, S°N₂=192, S°H₂=131: find ΔS°r.",
    "a": "−199 J/(K·mol).",
    "topic": "14"
  },
  {
    "q": "[Question bank p109 Q1] CO+2H₂→CH₃OH with ΔG°f(CO)=−137, methanol=−162, ΔH°f(CO)=−110.5, methanol=−201: find ΔG°r, ΔH°r, ΔS°r at 298 K.",
    "a": "ΔG°r=−25 kJ; ΔH°r=−90.5 kJ; ΔS°r≈−219.8 J/K.",
    "topic": "14"
  },
  {
    "q": "[Question bank p109 Q2] 2CO→CO₂+C, ΔH°f(CO₂)=−393.5, CO=−110.5, ΔG°r=−119.8: find ΔS at 298 K.",
    "a": "≈ −0.1768 kJ/K.",
    "topic": "14"
  },
  {
    "q": "[Question bank p109 Q3] 2H₂+O₂→2H₂O(g), S°O₂=205, S°H₂O=189, ΔH°f(H₂O)=−242, ΔG°f(H₂O)=−229: find S°H₂.",
    "a": "≈ 130 J/(K·mol).",
    "topic": "14"
  },
  {
    "q": "[Question bank p109 Q4] N₂+3H₂→2NH₃, S°H₂=131, S°NH₃=193, ΔH°f(NH₃)=−46, ΔG°f(NH₃)=−17: find S°N₂.",
    "a": "≈ 187 J/(K·mol).",
    "topic": "14"
  },
  {
    "q": "[Question bank p110 Q6] 2CH₃OH+3O₂→2CO₂+4H₂O has ΔH=−1453 kJ: interpret.",
    "a": "Combustion of 2 mol methanol releases 1453 kJ; exothermic.",
    "topic": "14"
  },
  {
    "q": "[Question bank p110 Q7a] N₂+O₂→2NO, ΔG°f(NO)=87 kJ/mol: find ΔG°r.",
    "a": "+174 kJ, non-spontaneous.",
    "topic": "14"
  },
  {
    "q": "[Question bank p110 Q7b] H₂O(l)→H₂O(g), ΔG°f(l)=−237 and ΔG°f(g)=−229: find ΔG°r.",
    "a": "+8 kJ, non-spontaneous under the stated standard conditions.",
    "topic": "14"
  },
  {
    "q": "[Question bank p110 Q7c] 2C₂H₂+5O₂→4CO₂+2H₂O (balanced oxygen), ΔG°f(C₂H₂)=209, CO₂=−394, H₂O=−237: find ΔG°r.",
    "a": "−2468 kJ, spontaneous (question sheet's printed oxygen/water coefficients contain a typo elsewhere).",
    "topic": "14"
  },
  {
    "q": "[Question bank p110 Q8] For 2CO→CO₂+C, tabulated S°(CO)=198, S°(C)=6 and other thermodynamic data: find S°(CO₂).",
    "a": "214 J/(K·mol) (source's stated answer).",
    "topic": "14"
  },
  {
    "q": "[Question bank p111 Q19] CaCO₃→CaO+CO₂ with ΔH=161 kJ, ΔS=180 J/K: find ΔG at 27°C and 927°C.",
    "a": "At 300 K: +107 kJ (non-spontaneous). At 1200 K: −55 kJ (spontaneous).",
    "topic": "14"
  },
  {
    "q": "[Question bank p111 Q21] 2SO₂+O₂→2SO₃, Kp=10, at 298 K: find ΔS° using given Hess data.",
    "a": "File lists 32.5 J/K·mol; review the sign and input enthalpies when using this numerical item.",
    "topic": "14"
  },
  {
    "q": "[Question bank p112 Q23] 2CO+O₂→2CO₂, ΔH°f(CO₂)=−393.5, CO=−110.5, ΔS=−177 J/K at 298 K: find ΔG°.",
    "a": "−513.254 kJ.",
    "topic": "14"
  },
  {
    "q": "[Question bank p112 Q24] CH₄→C+2H₂, ΔH°f(CH₄)=−75.5 kJ/mol and ΔG°=0.8 kJ at 298 K: find ΔS.",
    "a": "≈ +250.7 J/(K·mol).",
    "topic": "14"
  },
  {
    "q": "[Question bank p112 Q25] HCl formation ΔG°f=−95.3 kJ/mol, ΔS°f=+10 J/(K·mol) at 298 K: find ΔH°f.",
    "a": "≈ −92.32 kJ/mol; decomposition is +92.32 kJ/mol.",
    "topic": "14"
  },
  {
    "q": "[Question bank p112 Q26] N₂O₅→2NO₂+½O₂, ΔH°f(NO₂)=33.8, N₂O₅=−41.8; ΔG°f(NO₂)=51.8, N₂O₅=133.76: find ΔH°, ΔS°.",
    "a": "ΔH°r=+109.4 kJ; ΔS°r≈+468.3 J/K; ΔG°r=−30.16 kJ (spontaneous at 298 K).",
    "topic": "14"
  },
  {
    "q": "[Question bank p113 Q27] H₂+F₂→2HF at 298 K, ΔH°f(HF)=−273, ΔG°f(HF)=−275: find ΔS°.",
    "a": "+0.0134 kJ/(K·mol) = +13.4 J/(K·mol).",
    "topic": "14"
  },
  {
    "q": "[Question bank p113 Q28] 2CO→CO₂+C with ΔG°f(CO)=−137.3, CO₂=−394.4; ΔH°f(CO)=−110.5, CO₂=−393.5: find ΔS°.",
    "a": "≈ −0.1768 kJ/K.",
    "topic": "14"
  },
  {
    "q": "[Question bank p113 Q29] 2NO₂→N₂O₄ at 298 K, ΔH°r=−58 kJ, ΔG°f(N₂O₄)=100, NO₂=52: find ΔS°.",
    "a": "≈ −0.1812 kJ/K; ΔG°r=−4 kJ, spontaneous.",
    "topic": "14"
  },
  {
    "q": "[Question bank p113 Q30] N₂O₄→2NO₂ at 298 K with ΔG°f(NO₂)=51.8, N₂O₄=98.8: find ΔG°r.",
    "a": "+4.8 kJ; K≈0.14 using ΔG°=−RT ln K.",
    "topic": "14"
  },
  {
    "q": "[Question bank p114 Q33] For ½H₂+½Cl₂→HCl, ΔG°f=−95.3 kJ/mol and ΔS°=10 J/K at 298 K: find ΔH°f.",
    "a": "−92.32 kJ/mol.",
    "topic": "14"
  },
  {
    "q": "[Question bank p129 Q1] Sodium reacts spontaneously with water and releases heat: what are signs of ΔH and ΔG?",
    "a": "ΔH < 0 and ΔG < 0 (ΔS sign requires reaction/species information).",
    "topic": "15"
  },
  {
    "q": "[Question bank p130 Q7] CO(g)+Cl₂(g)→COCl₂(g) is exothermic with fewer gas moles: what is temperature effect?",
    "a": "ΔH<0, ΔS<0; favored at low temperature.",
    "topic": "15"
  },
  {
    "q": "[Question bank p130 Q8] A reaction becomes non-spontaneous when temperature increases: give ΔH and ΔS signs.",
    "a": "ΔH < 0 and ΔS < 0.",
    "topic": "15"
  },
  {
    "q": "[Question bank p131 Q13] For spontaneous processes, what signs does ΔG take?",
    "a": "Negative if spontaneous, positive if non-spontaneous, zero at equilibrium.",
    "topic": "15"
  },
  {
    "q": "[Question bank p131 Q14] A reaction becomes non-spontaneous as temperature is reduced: what signs do ΔH and ΔS have?",
    "a": "ΔH > 0 and ΔS > 0.",
    "topic": "15"
  },
  {
    "q": "[Question bank p131 Q15] Ice sublimation is spontaneous when TΔS is ____ ΔH.",
    "a": "Greater than: TΔS > ΔH.",
    "topic": "15"
  },
  {
    "q": "[Question bank p132 Q22] Why do wet clothes dry on a line rather than inside a sealed bag?",
    "a": "In open air, water vapor can disperse, increasing overall entropy and favoring evaporation under suitable conditions.",
    "topic": "15"
  },
  {
    "q": "[Question bank p133 Q23] Why is solidification of CO₂ gas non-spontaneous under normal conditions?",
    "a": "The phase transition is not favored at ordinary temperature and pressure; the direction of ΔG is not negative for gas→solid there.",
    "topic": "15"
  },
  {
    "q": "[Question bank p133 Q24] Why does iodine sublime spontaneously at elevated temperature?",
    "a": "ΔH>0 and ΔS>0, so at high enough T, TΔS exceeds ΔH.",
    "topic": "15"
  },
  {
    "q": "[Question bank p133 Q27] ΔH=−100 kJ and ΔS=−100 J/K: below which temperature is the reaction spontaneous?",
    "a": "T < 1000 K.",
    "topic": "15"
  },
  {
    "q": "[Question bank p133 Q28] Why does SiO₂+2C→Si+2CO not proceed spontaneously at ordinary temperature?",
    "a": "ΔH>0 and ΔS>0; temperature must rise enough for TΔS>ΔH.",
    "topic": "15"
  },
  {
    "q": "[Question bank p138 Q1] Water vaporization: ΔH°f(g)=−242, ΔH°f(l)=−286; Tb=373 K: find ΔSvap.",
    "a": "+118 J/(K·mol).",
    "topic": "15"
  },
  {
    "q": "[Question bank p138 Q2] Benzene ΔHvap=30.7 kJ/mol and ΔSvap=86.9 J/(K·mol): find boiling °C.",
    "a": "Tb≈353.3 K≈80.3°C.",
    "topic": "15"
  },
  {
    "q": "[Question bank p138 Q3] Ice ΔHfus=6 kJ/mol, Tm=273 K: find ΔSfus.",
    "a": "≈0.0220 kJ/(K·mol) (file prints ~0.021).",
    "topic": "15"
  },
  {
    "q": "[Question bank p138 Q4] Methanol ΔHvap=37.4 kJ/mol and ΔSvap=111 J/(K·mol): find Tb.",
    "a": "≈336.9 K.",
    "topic": "15"
  },
  {
    "q": "[Question bank p139 Q5] NH₃ ΔHvap=23.3 kJ/mol and ΔSvap=97.2 J/(K·mol): find Tb.",
    "a": "≈239.7 K.",
    "topic": "15"
  },
  {
    "q": "[Question bank p140 Q10] ΔG° for K=100 at 298 K (R=8.314 J/mol·K): calculate.",
    "a": "≈−11.4 kJ/mol (≈−11,392 J/mol as source prints).",
    "topic": "15"
  },
  {
    "q": "[Question bank p141 Q11] N₂O₄→2NO₂, ΔG°f(NO₂)=52, N₂O₄=100 and ΔH°f(NO₂)=34, N₂O₄=10: find ΔG°, ΔH°.",
    "a": "ΔG°=+4 kJ, ΔH°=+58 kJ for this written forward direction; reverse direction gives −4 and −58 kJ.",
    "topic": "15"
  },
  {
    "q": "[Question bank p141 Q12] N₂+O₂→2NO, ΔH°=+180 kJ, Kp=10⁻³⁰ at 298 K: find ΔH°f(NO), ΔG°r, ΔG°f(NO).",
    "a": "ΔH°f(NO)=+90 kJ/mol; ΔG°r≈+171.1 kJ; ΔG°f(NO)≈+85.5 kJ/mol.",
    "topic": "15"
  },
  {
    "q": "[Question bank p143 Q17] 1 kg water heats 24.6→28.2°C in calorimeter Ccal=1.2 kJ/°C: find qreaction.",
    "a": "−19.44 kJ.",
    "topic": "15"
  },
  {
    "q": "[Question bank p17 Q6 — source typo] Gold 4.5 g, c=0.13 J/(g°C), absorbs 40 kJ and reaches 90°C: find initial temperature.",
    "a": "Formal calculation gives Ti≈−68,286°C; this is physically impossible, so the question's 40 kJ figure appears mistaken (verify PDF before using).",
    "topic": "16"
  },
  {
    "q": "[Question bank p17 Q9] What value of heat capacity makes q numerically equal ΔT?",
    "a": "C=1 J/°C, when q is in joules and ΔT in °C.",
    "topic": "16"
  },
  {
    "q": "[Question bank p38 Q6 — source typo] PDF says 'burning 4.4 g of CO₂' heats 800 g water by 5°C; what can be calculated?",
    "a": "Water absorbs 16.8 kJ; if 0.1 mol of an actually combustible gas released that heat, the scaled heat for 2 mol would be −336 kJ. CO₂ itself cannot combust as described.",
    "topic": "16"
  },
  {
    "q": "[Question bank p93 Q15] In what circumstances is ΔS°r expected to have the greatest positive value?",
    "a": "When products are substantially more disordered than reactants, particularly if the number of gaseous particles increases greatly.",
    "topic": "16"
  },
  {
    "q": "[Question bank p109 Q5] Acetylene combustion ΔH°c=−1301, ΔH°f(CO₂)=−394, ΔH°f(H₂O)=−286: find ΔH°f(C₂H₂).",
    "a": "≈+227 kJ/mol (using balanced combustion 2CO₂+H₂O per mole of C₂H₂).",
    "topic": "16"
  },
  {
    "q": "[Question bank p109 Q5] For formation 2C(graphite)+H₂→C₂H₂(g) with S°(C₂H₂)=201, S°(C)=6, S°(H₂)=137 J/(K·mol), find ΔS°f.",
    "a": "+52 J/(K·mol).",
    "topic": "16"
  },
  {
    "q": "[Question bank p109 Q5] Using ΔH°f(C₂H₂)=+227 kJ/mol and ΔS°f=52 J/(K·mol) at 298 K, find ΔG°f.",
    "a": "≈ +211.5 kJ/mol.",
    "topic": "16"
  },
  {
    "q": "[Question bank p110 Q9] Ethanol combustion ΔH°c=−1367, ΔH°f(CO₂)=−393.5, ΔH°f(H₂O)=−286, and ΔH°f(CH₃CHO)=−194: find ΔH for C₂H₅OH+½O₂→CH₃CHO+H₂O.",
    "a": "≈−202 kJ, using ΔH°f(ethanol)=−278 kJ/mol.",
    "topic": "16"
  },
  {
    "q": "[Question bank p111 Q20 — equation typo] Benzene ΔG° reaction worksheet lists −6496 kJ and ΔG°f(H₂O)=−237, CO₂=−394. What is the issue?",
    "a": "The printed benzene formula/equation is inconsistent (shown as 6CH₆); a unique reliable result requires correcting the reaction and coefficient before calculating.",
    "topic": "16"
  },
  {
    "q": "[Question bank p111 Q21] 2SO₂+O₂→2SO₃, ΔH°f(SO₃)=−295 and SO₂=−297, Kp=10 at 298 K: find ΔS°.",
    "a": "ΔH°r=+4 kJ, ΔG°≈−5.71 kJ, ΔS°≈+32.6 J/K.",
    "topic": "16"
  },
  {
    "q": "[Question bank p111 Q22] Ethane combustion ΔG°=−1467.5 kJ and ΔS°=+0.31 kJ/K at 298 K, ΔH°f(CO₂)=−393.5 and H₂O=−286: find ΔH°f(ethane).",
    "a": "−269.88 kJ/mol.",
    "topic": "16"
  },
  {
    "q": "[Question bank p114 Q31 — equation typo] Acetylene combustion equation in the bank has 2C₂H₂+5O₂→4CO₂+5H₂O: is it balanced?",
    "a": "No: the balanced equation is 2C₂H₂+5O₂→4CO₂+2H₂O; do not calculate from the misprinted equation without correction.",
    "topic": "16"
  },
  {
    "q": "[Question bank p114 Q32 — incomplete data] Can ΔS° for 2CO+O₂→2CO₂ be found solely from ΔG°f(CO,CO₂) and an incomplete heat-of-combustion equation?",
    "a": "Not reliably as written; ΔH°r (or sufficient formation data) and T are also needed to use ΔS°=(ΔH°−ΔG°)/T.",
    "topic": "16"
  },
  {
    "q": "[Question bank p114 Q33] Given ΔH°f(SO₃)=−395, SO₂=−295 kJ/mol, and ΔS°r=+100 J/K, find ΔG° for 2SO₂+O₂→2SO₃ at 298 K.",
    "a": "ΔH°r=−200 kJ; ΔG°r=−229.8 kJ.",
    "topic": "16"
  },
  {
    "q": "[Question bank p129 Q3] Does iodine vapor condense to solid iodine spontaneously at room temperature?",
    "a": "Iodine can deposit to solid when vapor is supersaturated; the direction is determined by ΔG under the actual vapor pressure and temperature, not temperature alone.",
    "topic": "16"
  },
  {
    "q": "[Question bank p132 Q19] Why is rain/condensation favored in cooler conditions, as discussed in Gibbs applications?",
    "a": "Condensation releases heat and reduces entropy (ΔH<0, ΔS<0), so lower temperatures favor condensation; humidity and pressure also matter.",
    "topic": "16"
  },
  {
    "q": "[Question bank p132 Q20] A salt cools its water solution as it dissolves spontaneously: what does Gibbs's relation show?",
    "a": "Endothermic ΔH>0 can still have ΔG<0 if positive TΔS is larger than ΔH.",
    "topic": "16"
  },
  {
    "q": "[Question bank p132 Q21] When does ice melting become spontaneous under the chapter's phase-change model?",
    "a": "Above its equilibrium melting temperature at the specified pressure; at equilibrium ΔG=0.",
    "topic": "16"
  },
  {
    "q": "[Question bank p140 Q9] AgCl dissolution ΔG°=56.9624 kJ; at 298 K and in HCl with pH=2, what solubility does the PDF give?",
    "a": "10⁻⁸ mol/L (source-listed result).",
    "topic": "16"
  },
  {
    "q": "[Question bank p139 Q7] 2A+B⇌2C has K=100 at 298 K, ΔG°f(B)=1.4 and C=3.2 kJ/mol: find ΔG°f(A).",
    "a": "≈+8.20 kJ/mol.",
    "topic": "16"
  },
  {
    "q": "[Question bank p142 Q14] Ammonia solution 0.1 M with pH=11 at 25°C: find standard free energy of ionization.",
    "a": "≈+28.48 kJ/mol (as printed in the PDF).",
    "topic": "16"
  },
  {
    "q": "[Question bank p142 Q16 — source typo] Nitrogen equilibrium question says 3 mol N₂ were initially present, 3 mol reacted and 2 mol remain. What is wrong?",
    "a": "Those quantities cannot simultaneously be true (3−3 ≠ 2); confirm the original data before solving for ΔS°.",
    "topic": "16"
  },
  {
    "q": "[Question bank p139 Q6 — ambiguous pressures] For A₂+B₂⇌2AB, how is Kp found from equilibrium partial pressures?",
    "a": "Kp=(PAB)²/(PA₂×PB₂). If PAB=1 atm and PA₂=PB₂=0.1 atm, Kp=100 and ΔG°≈−11.4 kJ/mol.",
    "topic": "16"
  },
  {
    "q": "[Question bank p140 Q8 — incomplete notation] For weak-acid ionization with ΔG°=28.4822 kJ/mol, what equilibrium constant is implied at 298 K?",
    "a": "Ka≈10⁻⁵ from ΔG°=−RT ln Ka; the requested added-HCl pH also requires a fully specified equilibrium setup.",
    "topic": "16"
  },
  {
    "q": "[Question bank p142 Q13 — ambiguity] H₂+Br₂⇌2HBr has Kc=4: how do you calculate ΔG° at 298 K?",
    "a": "ΔG°=−RT ln4≈−3.44 kJ/mol; the initial mole-count wording in the source needs clarification.",
    "topic": "16"
  },
  {
    "q": "[Question bank p114 repeated Q33 — source equation typo] Why must the proposed 'Ca+C+½O₂→CaO' formation equation be corrected before Hess calculation?",
    "a": "Carbon appears on the reactant side but not in the product CaO, so the equation does not conserve atoms.",
    "topic": "16"
  }
];
