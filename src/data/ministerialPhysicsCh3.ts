import type { MinisterialQuestion } from "./ministerialChemCh1";

export const ministerialPhysicsCh3: MinisterialQuestion[] = [
  {
    "q": "The alternating current is recommended in electrical circuits? Why?",
    "a": "• Because it is easy to transport to long distances with minimum energy loss. • It allows Faraday’s law of electromagnetic induction to be used. Therefore, electric transformers can increase or decrease AC voltage when power is transmitted."
  },
  {
    "q": "The electric power is transmitted with high voltage and low current using step-up transformers. Why?",
    "a": "In order to reduce power loss in transfer wires P_{\\text{loss}}=I^2R."
  },
  {
    "q": "Why is the power curve always positive for a circuit with pure resistance?",
    "a": "Because voltage and current are in the same phase. They are positive at the same time and negative at the same time, so their product is always positive. P=VI"
  },
  {
    "q": "What is the meaning of the positive curve of power in an AC circuit whose load is pure resistance?",
    "a": "It means that the electrical energy consumed in the resistance is in the form of heat."
  },
  {
    "q": "The dissipated power of alternating current with maximum amount does not equal the power produced by direct current with the same amount. Why?",
    "a": "Because AC changes continuously from zero to maximum positive value, then to zero and maximum negative value. Therefore, its effective value is used."
  },
  {
    "q": "Can we use DC meters in AC circuits? Explain.",
    "a": "No. Most DC meters measure the average current, and the average value of alternating current over a complete cycle is zero. Therefore, AC meters must measure an effective value."
  },
  {
    "q": "Is it possible and why P.M.C meters cannot be used in AC circuit?",
    "a": "No, because most PMMC/DC meters measure average current, and the average alternating current over a full cycle is zero."
  },
  {
    "q": "In most DC, the plug pointer reads zero when connected to AC circuit. Why?",
    "a": "Because the meter measures average current, and the average value of AC through a complete cycle is zero."
  },
  {
    "q": "What is meant by Effective Alternating Current?",
    "a": "The amount of alternating current which produces the same thermal effect in a resistor as a direct current of the same value during the same resistance and same period."
  },
  {
    "q": "In an AC circuit in series combinations, the load is a pure resistance R. The average power of a full period is:",
    "a": "Half maximum power. P_{\\text{av}}=\\frac{P_{\\max}}{2}"
  },
  {
    "q": "What is the relation between Maximum current and Effective Alternating Current?",
    "a": "I_{\\text{eff}}=\\frac{I_{\\max}}{\\sqrt2}=0.707I_{\\max}"
  },
  {
    "q": "What is the relation between inductive reactance and voltage frequency and coefficient of self-induction of the inductor?",
    "a": "Inductive reactance is directly proportional to both frequency and self-inductance: X_L=2\\pi fL"
  },
  {
    "q": "How do you explain increase in inductive reactance when current frequency increases according to Lenz’s law?",
    "a": "When frequency increases, the rate of change of current increases. According to Lenz’s law, the induced electromotive force opposes the change in current, so inductive reactance increases."
  },
  {
    "q": "At a very high frequency, what happens to a coil?",
    "a": "The coil acts as an open switch because inductive reactance becomes very large."
  },
  {
    "q": "What is the amount of average power in a circuit containing a pure inductor for one period? Why?",
    "a": "The average power equals zero, because energy stored in the magnetic field during one part of the cycle is returned to the source during another part."
  },
  {
    "q": "What do positive parts and negative parts in instantaneous power curve represent in an AC circuit containing only pure inductor?",
    "a": "• Positive parts: energy is transferred from the source and stored in the magnetic field of the inductor. • Negative parts: stored magnetic energy is returned from the inductor to the source. Therefore, average power for a complete cycle is zero."
  },
  {
    "q": "What are the properties of power curve in pure inductor? With draw.",
    "a": "• It contains equal positive and negative parts. • It is a sinusoidal function. • Its frequency is twice the frequency of voltage or current. • Average power during a complete cycle equals zero."
  },
  {
    "q": "Why is it recommended to use an inductor to control discharge current of fluorescent lamp and not use a pure resistance?",
    "a": "Because a pure inductor does not consume average power, while a resistor consumes electrical power as heat."
  },
  {
    "q": "Explain the change that happens in the brightness of lamp connected in an alternating current circuit when connected with a pure inductor and when frequency increases.",
    "a": "Lamp brightness decreases at high frequency because inductive reactance increases, so current decreases. X_L=2\\pi fL"
  },
  {
    "q": "AC circuit consists of a pure inductor and alternating current source. At very high or low angular frequencies, does the lamp glow? Explain.",
    "a": "• At high frequency, inductive reactance increases, current decreases, and the lamp becomes dimmer. • At low frequency, inductive reactance decreases, current increases, and lamp brightness increases."
  },
  {
    "q": "An AC circuit contains a pure inductor connected to an oscillator of constant voltage. Increasing the frequency decreases the current. True or False?",
    "a": "True."
  },
  {
    "q": "Decreasing the brightness of the lamp connected in series combination with a pure inductor in an AC circuit when increasing frequency. Explain.",
    "a": "Increasing frequency increases inductive reactance, which reduces current through the circuit, so the lamp brightness decreases. X_L=2\\pi fL"
  },
  {
    "q": "An AC circuit in series combination with pure inductor; average power for full period equals zero.",
    "a": "True. Average power is zero."
  },
  {
    "q": "What is the difference between the characteristics of the power curve in an AC circuit containing a pure resistance and one containing a pure inductor?",
    "a": "Pure resistance: instantaneous power is always positive, and average power equals half the maximum power (P_av = P_max/2). Pure inductor: power is sinusoidal with equal positive and negative values, its frequency is twice the current or voltage frequency, and average power over a complete cycle is zero."
  },
  {
    "q": "A capacitor with pure capacitance is connected to an alternating voltage source with variable frequency. Illustrate the work of the capacitor at very high frequency and very low frequency.",
    "a": "At very high frequency, capacitive reactance becomes very small and the capacitor acts almost as a closed switch. At very low frequency, capacitive reactance becomes very large and it acts nearly as an open circuit. X_C=\\frac{1}{2\\pi fC}"
  },
  {
    "q": "What are the characteristics of the power curve in AC circuit with pure capacitor?",
    "a": "• Current leads voltage by a phase difference of \\frac{\\pi}{2}. • The power curve is sinusoidal and has positive and negative values. • Its frequency is twice voltage or current frequency. • Average power equals zero."
  },
  {
    "q": "What do positive parts and negative parts in instantaneous power curve represent in AC circuit containing only pure capacitor?",
    "a": "• During one quarter-cycle, the capacitor charges and stores energy in its electric field. • During the next quarter-cycle, it discharges and returns energy to the source. • This process repeats, so average power over a complete cycle is zero."
  },
  {
    "q": "A lamp is connected in series with a pure capacitor and alternating current source. At which high or low angular frequencies does the lamp become less glowing?",
    "a": "At low frequencies the lamp becomes less glowing because capacitive reactance increases. X_C=\\frac{1}{2\\pi fC}"
  },
  {
    "q": "A lamp is connected in series combination with a pure capacitor and alternating current source. At very high angular frequency, what happens to lamp brightness?",
    "a": "Lamp brightness increases because capacitive reactance decreases and circuit current increases."
  },
  {
    "q": "Explain the change that happens to the brightness of a lamp connected in series with pure capacitor when frequency increases.",
    "a": "Increasing frequency decreases capacitive reactance, causing current and lamp brightness to increase. X_C=\\frac{1}{2\\pi fC}"
  },
  {
    "q": "What happens when connecting the two poles of capacitor between the ends of an alternating voltage source?",
    "a": "The capacitor charges and discharges periodically, so it allows alternating current to flow."
  },
  {
    "q": "In an AC circuit with electric oscillator and constant potential difference, a capacitor is connected. When oscillator frequency is increased, what happens to current?",
    "a": "Current increases because capacitive reactance decreases."
  },
  {
    "q": "Define power factor.",
    "a": "Power factor is the ratio of real power to apparent power. PF=\\frac{P_{\\text{real}}}{P_{\\text{apparent}}} and: PF=\\cos\\phi"
  },
  {
    "q": "What is the relation between real power and apparent power in an alternating current circuit containing pure resistor, pure inductor, and pure capacitor?",
    "a": "P_{\\text{real}}=P_{\\text{apparent}}\\cos\\phi"
  },
  {
    "q": "What is the amount of power factor in AC circuit? Mention the reason if load is pure capacitor.",
    "a": "PF=0 because the current and voltage differ in phase by 90^\\circ."
  },
  {
    "q": "What is the power factor in AC circuit if load is pure resistance? Mention the reason.",
    "a": "PF=1 because voltage and current are in the same phase."
  },
  {
    "q": "What is the power factor in AC circuit if load is pure inductor?",
    "a": "PF=0 because current and voltage differ in phase by 90^\\circ."
  },
  {
    "q": "An AC circuit in series combination containing capacitor and glowing lamp. What is the effect of inserting dielectric between capacitor plates on lamp glowing and power factor?",
    "a": "Inserting a dielectric increases capacitance, so capacitive reactance decreases: X_C=\\frac{1}{2\\pi fC} Therefore current increases and lamp brightness increases."
  },
  {
    "q": "When inserting a dielectric between capacitor plates, why does current increase?",
    "a": "Because dielectric increases capacitance, which decreases capacitive reactance and circuit impedance."
  },
  {
    "q": "An AC circuit with pure resistance, pure inductor and capacitor in series combination. The circuit is resonant when:",
    "a": "X_L=X_C or: \\omega L=\\frac{1}{\\omega C}"
  },
  {
    "q": "What is amount of power factor in an AC circuit if load is pure resistance?",
    "a": "One."
  },
  {
    "q": "What is amount of power factor in an AC circuit if load is pure inductor or pure capacitor?",
    "a": "Zero."
  },
  {
    "q": "What happens to amplitude of energy oscillation in electromagnetic oscillation circuit containing a capacitor and coil if there is no resistance?",
    "a": "The amplitude does not decrease because the circuit has no resistance."
  },
  {
    "q": "In an electromagnetic oscillation circuit, when current is zero, stored energy in electric field between capacitor plates is:",
    "a": "Maximum value."
  },
  {
    "q": "In electromagnetic oscillation circuit, stored energy in electric field between capacitor plates is maximum when amount of current is:",
    "a": "Zero."
  },
  {
    "q": "In AC series circuit containing pure inductor, pure capacitor and pure resistance, the properties of circuit are:",
    "a": "Capacitive properties when: X_C>X_L"
  },
  {
    "q": "True or False: An AC series circuit containing a pure inductor, pure capacitor, and pure resistance has capacitive properties when X_C > X_L.",
    "a": "True."
  },
  {
    "q": "What is the practical importance of AC circuit R-L-C in series combination?",
    "a": "It is used in tuning circuits containing frequency sources with a wide range of frequencies to select a certain desired frequency, such as radio receivers."
  },
  {
    "q": "What are the properties of a series resonant electrical circuit that contains resistance, pure inductor, pure capacitor and electric oscillator?",
    "a": "At resonance: 1. Inductive reactance equals capacitive reactance. X_L=X_C 2. Impedance is minimum and equals resistance. Z=R 3. Circuit current is maximum. 4. Phase difference between voltage and current equals zero. \\phi=0 5. Power factor equals one. PF=1 6. Real power equals apparent power. 7. Circuit has pure resistance properties. 8. Resonance frequency is: f_r=\\frac{1}{2\\pi\\sqrt{LC}}"
  },
  {
    "q": "What are the properties of an electrical resonant circuit containing resistance, pure inductor and capacitor? Mention three properties.",
    "a": "Any three of the above, for example: • f=f_r. • X_L=X_C. • Phase difference equals zero. • Power factor equals one. • Current is maximum."
  },
  {
    "q": "What is Quality Factor? And what does it depend on?",
    "a": "Quality factor is the ratio of resonance angular frequency to angular frequency width: QF=\\frac{\\omega_r}{\\Delta\\omega} It depends on: • Resistance R. • Self-inductance L. • Capacitance C. It may also be expressed as: QF=\\frac{\\omega_r L}{R}"
  },
  {
    "q": "On what does the quality factor in an AC circuit containing pure resistance, pure inductor and capacitor depend?",
    "a": "It depends on the resistance and coefficient of self-inductance, or equivalently on circuit parameters R,L,C."
  },
  {
    "q": "What is meant by angular frequency width?",
    "a": "It is the difference between the two angular frequencies at which average power becomes half its maximum value. \\Delta\\omega=\\omega_2-\\omega_1"
  },
  {
    "q": "Quality factor is given by which relation?",
    "a": "QF=\\frac{\\omega_r}{\\Delta\\omega} Also: QF=\\frac{\\omega_r L}{R}"
  },
  {
    "q": "When does resonance happen in an AC circuit in series combination?",
    "a": "When angular frequency of the circuit equals resonance angular frequency: \\omega=\\omega_r"
  },
  {
    "q": "Explain: Quality factor in resonance circuit connected in series is high when resistance of the circuit is small.",
    "a": "Because: QF=\\frac{\\omega_rL}{R} so quality factor is inversely proportional to resistance."
  },
  {
    "q": "Show the effect of increasing electric resistance on quality factor in resonance circuit.",
    "a": "Increasing resistance decreases quality factor: QF\\propto\\frac{1}{R}"
  },
  {
    "q": "Show that quality factor increases by increasing resonance angular frequency and self-inductance, and decreases by increasing resistance.",
    "a": "QF=\\frac{\\omega_rL}{R} Therefore: QF\\propto\\omega_r,\\qquad QF\\propto L,\\qquad QF\\propto\\frac1R"
  },
  {
    "q": "What is the effect of increasing electrical resistance on angular frequency width and resonance angular frequency?",
    "a": "Angular frequency width increases as resistance increases: \\Delta\\omega=\\frac{R}{L} and quality factor decreases."
  },
  {
    "q": "Explain how resonance and quality factor change when the frequency of the source is doubled in series AC circuit containing resistance, capacitor and source.",
    "a": "According to the relationships shown in the source, increasing frequency changes the reactances: X_L=2\\pi fL X_C=\\frac1{2\\pi fC} so X_L increases and X_C decreases."
  },
  {
    "q": "AC circuit in parallel combination with pure inductor, pure capacitor and pure resistance has inductive properties if:",
    "a": "X_L<X_C"
  },
  {
    "q": "AC circuit in parallel combination with pure inductor, capacitor and resistor has capacitive properties if:",
    "a": "X_C<X_L"
  },
  {
    "q": "AC circuit in parallel combination with a pure inductor, capacitor and resistance has inductive properties when:",
    "a": "The current vector relationship gives an inductive resultant, as illustrated in the source."
  },
  {
    "q": "Inductive reactance X_L depends on?",
    "a": "1. Coefficient of self-inductance L. 2. Current frequency f. X_L=2\\pi fL So: X_L\\propto L,\\qquad X_L\\propto f"
  },
  {
    "q": "What does total impedance of an AC circuit in series combination containing pure resistance, pure inductor and pure capacitor depend on?",
    "a": "• Resistance R. • Coefficient of self-inductance L. • Capacitance C. • Frequency f. According to: Z=\\sqrt{R^2+(X_L-X_C)^2}"
  },
  {
    "q": "What are two factors on which the value of normal frequency in electromagnetic oscillation circuit depends?",
    "a": "1. Coefficient of self-inductance L. 2. Capacitance C. f=\\frac{1}{2\\pi\\sqrt{LC}}"
  },
  {
    "q": "On what does power factor in an AC circuit in series combination with pure resistance, pure inductor and pure capacitor depend?",
    "a": "It depends on: PF=\\cos\\phi and on the relation between real power and apparent power."
  },
  {
    "q": "On what does quality factor in an AC circuit depend?",
    "a": "It depends on resonance angular frequency, resistance and self-inductance, according to: QF=\\frac{\\omega_rL}{R}"
  },
  {
    "q": "What does angular frequency in resonance circuit depend on?",
    "a": "It depends on capacitance and self-inductance: \\omega_r=\\frac1{\\sqrt{LC}}"
  },
  {
    "q": "On what does angular frequency width depend on?",
    "a": "It depends directly on resistance and inversely on self-inductance: \\Delta\\omega=\\frac{R}{L}"
  },
  {
    "q": "Using an activity, illustrate the effect of changing current frequency f on inductive reactance X_L.",
    "a": "Tools: oscillator, ammeter, voltmeter, coil of negligible resistance, wires, and switch. Connect the circuit, close it, then gradually change the oscillator frequency while keeping voltage constant and observe the ammeter. Conclusion: inductive reactance is directly proportional to frequency when self-inductance is constant: X_L ∝ f and X_L = 2πfL."
  },
  {
    "q": "By an activity illustrate the effect of changing self-induction coefficient L on inductive reactance X_L.",
    "a": "Keep source frequency constant and gradually change the self-inductance of the coil. Observe the ammeter reading. Conclusion: X_L\\propto L when frequency is constant."
  },
  {
    "q": "In an AC circuit where load is a capacitor with pure capacitance, illustrate the effect of changing frequency of voltage source on capacitive reactance.",
    "a": "Connect a capacitor, AC source, ammeter and voltmeter. Keep voltage constant and increase oscillator frequency. Observation: Current increases as frequency increases. Conclusion: Capacitive reactance is inversely proportional to frequency: X_C=\\frac1{2\\pi fC} X_C\\propto\\frac1f"
  },
  {
    "q": "Illustrate the effect of changing capacitance of capacitor on capacitive reactance.",
    "a": "Use a variable capacitor and maintain source voltage and frequency constant. Increase capacitance and note current increase. Conclusion: X_C\\propto\\frac1C when frequency is constant."
  },
  {
    "q": "Illustrate by a diagram how capacitive reactance changes with voltage frequency.",
    "a": "X_C decreases nonlinearly as f increases: X_C\\propto\\frac1f"
  },
  {
    "q": "Illustrate by a diagram how inductive reactance changes with current frequency.",
    "a": "X_L increases linearly with current frequency: X_L\\propto f"
  },
  {
    "q": "Illustrate by a diagram how inductive reactance changes with current frequency and capacitive reactance changes with voltage frequency.",
    "a": "• X_L increases linearly with f. • X_C decreases inversely with f."
  },
  {
    "q": "What is the effect of voltage source on inductive reactance and capacitive reactance? Illustrate by a diagram.",
    "a": "The source shows that inductive reactance increases with increasing frequency while capacitive reactance decreases: X_L=2\\pi fL X_C=\\frac1{2\\pi fC}"
  },
  {
    "q": "Prove that inductive reactance is measured in ohm.",
    "a": "From: X_L=2\\pi fL the dimensional/unit analysis gives the unit of resistance, so: [X_L]=\\Omega"
  },
  {
    "q": "An alternating AC contains a capacitor with pure capacitance. Prove that current equation is given by the following relation.",
    "a": "Starting from: q=CV and differentiating with respect to time: i=\\frac{dq}{dt} For sinusoidal voltage, the current leads the voltage by \\frac{\\pi}{2}."
  },
  {
    "q": "Prove that capacitive reactance is measured by Ohm.",
    "a": "From: X_C=\\frac1{2\\pi fC} unit analysis gives: [X_C]=\\Omega"
  },
  {
    "q": "In a condition of electric resonance, prove that: \\omega_r=\\frac1{\\sqrt{LC}}",
    "a": "At resonance: X_L=X_C Therefore: \\omega_rL=\\frac1{\\omega_rC} \\omega_r^2LC=1 Hence: \\boxed{\\omega_r=\\frac1{\\sqrt{LC}}} and: fr​=2πLCsvg​1​​"
  }
];
