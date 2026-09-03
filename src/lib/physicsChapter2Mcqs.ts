// Built-in fallback for Physics Chapter 2. The database migrations remain the primary source.
// This keeps the chapter available when a hosting deployment has not applied new Supabase migrations yet.
export type BuiltInMcqRow = {
  id: string;
  subject: string;
  chapter: number;
  chapter_title: string;
  question: string;
  choices: string[];
  answer_index: number;
  explanation: null;
};

const PHYSICS_CH2: Record<"ar" | "en", BuiltInMcqRow[]> = {
  "en": [
    {
      "id": "builtin-physics-2-en-01",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "A positively charged particle enters a uniform magnetic field with its velocity perpendicular to the magnetic flux density. According to the chapter, which combination correctly describes its motion?",
      "choices": [
        "Force parallel to velocity → straight-line acceleration",
        "Force perpendicular to velocity → circular path",
        "Force parallel to magnetic field → circular path",
        "No magnetic force → constant straight-line motion"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-02",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The magnetic force acting on a charged particle moving in a uniform magnetic field reaches its maximum value when the angle between v and B is:",
      "choices": [
        "0^\\circ",
        "30^\\circ",
        "60^\\circ",
        "90^\\circ"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-03",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "If the velocity vector of a charged particle becomes parallel to the magnetic flux density vector, the magnetic force becomes:",
      "choices": [
        "qvB",
        "qB/v",
        "Zero",
        "Maximum"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-04",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Which set contains all the factors stated in the chapter as affecting the magnetic force on a charged particle?",
      "choices": [
        "q,\\;v,\\;B,\\;\\theta",
        "q,\\;A,\\;B,\\;\\theta",
        "q,\\;v,\\;A,\\;t",
        "B,\\;A,\\;N,\\;R"
      ],
      "answer_index": 0,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-05",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "A magnetic rod remains stationary relative to a coil connected to an ammeter. The ammeter reads zero primarily because:",
      "choices": [
        "The magnetic flux through the coil is zero",
        "The magnetic flux does not change with time",
        "The magnetic rod has no magnetic field",
        "The coil must contain an iron core"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-06",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "A magnetic rod and a coil move in the same direction with exactly the same velocity. According to the chapter, no induced current is produced because:",
      "choices": [
        "The magnetic flux is necessarily zero",
        "The coil has no resistance",
        "There is no relative motion and hence no change in magnetic flux through the coil",
        "The magnetic field becomes parallel to the current"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-07",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Which observation in Faraday’s primary–secondary coil experiment most directly demonstrates that a constant primary current does NOT continuously induce current in the secondary coil?",
      "choices": [
        "The secondary pointer deflects while the switch is being closed",
        "The secondary pointer returns to zero after the primary current becomes constant",
        "The secondary pointer deflects oppositely when the switch is opened",
        "The primary circuit contains a battery"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-08",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Faraday observed secondary current during which stages of the primary current?",
      "choices": [
        "Only while the primary current remained constant",
        "Only during growth of primary current",
        "Only during decay of primary current",
        "During both growth and decay of primary current"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-09",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "According to the chapter, the fundamental condition for generating induced current in a closed circuit is:",
      "choices": [
        "Presence of a permanent magnet",
        "Presence of an iron core",
        "Change in magnetic flux penetrating the circuit per unit time",
        "Large constant magnetic flux"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-10",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Why did attempts preceding Faraday’s discovery fail to generate electric current using magnetic fields?",
      "choices": [
        "They used alternating magnetic fields",
        "They relied on constant magnetic fields",
        "They used closed circuits",
        "They used coils instead of straight conductors"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-11",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Which modification can increase the induced current in a coil facing a moving magnetic rod according to the chapter?",
      "choices": [
        "Decreasing the number of turns",
        "Decreasing the relative velocity",
        "Inserting a wrought-iron core instead of air",
        "Making the magnet and coil move together at the same velocity"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-12",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "A magnet is pushed toward a coil and then pulled away with the same speed. The induced currents in the two cases are:",
      "choices": [
        "Equal in direction because the speed is equal",
        "Opposite in direction because the magnetic-flux change reverses",
        "Zero because the net displacement is zero",
        "Identical because the same magnet is used"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-13",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "In motional EMF, the charges in a conducting rod moving through a magnetic field accumulate at its ends because they are acted upon by:",
      "choices": [
        "Gravitational force",
        "Magnetic force",
        "Self-induced EMF",
        "Eddy-current heating"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-14",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "For a rod moving perpendicular to a uniform magnetic field, which expression is given for motional EMF?",
      "choices": [
        "vB/\\ell",
        "B\\ell/v",
        "vB\\ell",
        "v\\ell/B"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-15",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "According to the chapter, the motional EMF generated in a moving rod depends on:",
      "choices": [
        "B,\\;v,\\;\\ell only",
        "B,\\;v,\\;\\ell,\\;\\theta",
        "B,\\;A,\\;N only",
        "I,\\;R,\\;N only"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-16",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Maximum motional EMF occurs when the moving rod is:",
      "choices": [
        "Parallel to the magnetic flux",
        "Perpendicular to the magnetic flux",
        "Stationary inside the magnetic field",
        "At 45^\\circ to the magnetic flux"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-17",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "If either the direction of motion of a rod OR the direction of the magnetic field is reversed, the chapter states that:",
      "choices": [
        "The magnitude and polarity of motional EMF remain unchanged",
        "Motional EMF becomes zero",
        "The polarity of motional EMF reverses",
        "The length of the rod effectively changes"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-18",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "A conducting rod moves parallel to the magnetic field. Which statement is consistent with the chapter?",
      "choices": [
        "Motional EMF is maximum",
        "Motional EMF is zero",
        "Motional EMF equals vB\\ell",
        "Motional EMF depends only on resistance"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-19",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "In the conductor-bar arrangement, the obstructive magnetic force acting on the rod is represented by:",
      "choices": [
        "F=B/I\\ell",
        "F=I\\ell B",
        "F=IB/\\ell",
        "F=I\\ell/B"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-20",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The obstructive force produced after induced current flows through a moving conductor acts:",
      "choices": [
        "In the same direction as the velocity",
        "Opposite to the rod's velocity",
        "Parallel to the magnetic flux",
        "Perpendicular to both velocity and magnetic field without affecting motion"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-21",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "In the conductor-bar system described in the chapter, constant velocity is maintained when:",
      "choices": [
        "Pulling force exceeds obstructive force",
        "Obstructive force exceeds pulling force",
        "Pulling force and obstructive force have equal magnitudes and opposite directions",
        "Both forces act in the same direction"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-22",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The work done in moving a conductor rod through a magnetic field is converted mainly into:",
      "choices": [
        "Magnetic potential energy only",
        "Heat dissipated in the resistance",
        "Gravitational potential energy",
        "Mechanical energy stored permanently in the rod"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-23",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Which of the following is NOT listed as one of the three fundamental quantities whose change can alter magnetic flux?",
      "choices": [
        "Magnetic flux density B",
        "Surface area A",
        "Angle \\theta",
        "Circuit resistance R"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-24",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "According to the chapter, magnetic flux through a surface is expressed as:",
      "choices": [
        "\\Phi_B=BA\\sin\\theta",
        "\\Phi_B=BA\\cos\\theta",
        "\\Phi_B=B/A",
        "\\Phi_B=BA/\\cos\\theta"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-25",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "If the area vector of a ring is parallel to the magnetic flux density vector, the magnetic flux is:",
      "choices": [
        "Zero",
        "Half its maximum value",
        "Maximum",
        "Independent of the area"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-26",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "When the plane of a conducting ring is parallel to the magnetic flux density vector, the chapter indicates that the magnetic flux through the ring is:",
      "choices": [
        "BA",
        "BA/2",
        "Zero",
        "2BA"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-27",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Faraday’s law states that the magnitude of induced EMF is directly proportional to:",
      "choices": [
        "Magnetic flux itself",
        "Time interval alone",
        "Time rate of change of magnetic flux",
        "Resistance of the conductor"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-28",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "In Faraday’s law, the negative sign is included according to:",
      "choices": [
        "Ohm’s law",
        "Lenz’s law",
        "Coulomb’s law",
        "The definition of magnetic flux"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-29",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The polarity of the induced EMF depends on whether magnetic flux is:",
      "choices": [
        "Large or small",
        "Uniform or nonuniform",
        "Increasing or decreasing",
        "Produced by a coil or magnet"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-30",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "A north magnetic pole approaches the face of a conducting ring. According to the chapter, the face of the ring behaves as:",
      "choices": [
        "A south pole to attract the magnet",
        "A north pole to repel the approaching north pole",
        "A neutral region",
        "A south pole first and then a north pole"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-31",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The same north pole is now moved away from the ring. The face of the ring becomes:",
      "choices": [
        "North, to repel the magnet",
        "South, to attract the receding north pole",
        "Magnetically neutral",
        "Alternately north and south regardless of motion"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-32",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The practical importance of Lenz’s law, as explicitly stated in the chapter, includes:",
      "choices": [
        "Calculating electrical resistance only",
        "Determining the direction of induced current and demonstrating conservation of energy",
        "Determining magnetic permeability only",
        "Increasing generator speed"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-33",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Which best distinguishes external magnetic flux density B from induced magnetic flux density B_{ind}?",
      "choices": [
        "Both always act in the same direction",
        "B is generated by induced current, while B_{ind} causes that current",
        "A change in B causes induction, while B_{ind} opposes the change responsible for induction",
        "B_{ind} exists before any induced current is produced"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-34",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Eddy currents are described in the chapter as currents that are:",
      "choices": [
        "Straight and parallel to the magnetic field",
        "Closed and circular in the conducting material",
        "Present only in wires",
        "Independent of electromagnetic induction"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-35",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Eddy currents arise primarily as a consequence of:",
      "choices": [
        "Constant magnetic flux with no relative motion",
        "Relative motion between a metal conductor and magnetic flux",
        "Static electric charges",
        "Constant current through an isolated resistor"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-36",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The major disadvantage of eddy currents discussed in the chapter is:",
      "choices": [
        "Destruction of magnetic flux",
        "Energy loss in the form of heat",
        "Complete elimination of resistance",
        "Prevention of electromagnetic induction"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-37",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Why is an iron core divided into mutually insulated thin plates in transformers according to the chapter?",
      "choices": [
        "To decrease electrical resistance and increase eddy currents",
        "To increase electrical resistance within the plates and reduce eddy currents",
        "To eliminate magnetic flux density",
        "To increase the thickness of current paths"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-38",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "In the pendulum experiment comparing a sliced and an unsliced conducting plate moving through a magnetic field, which plate stops sooner?",
      "choices": [
        "Sliced plate because it has smaller eddy currents",
        "Unsliced plate because large eddy currents oppose its motion",
        "Both stop simultaneously",
        "Neither stops because eddy currents conserve mechanical motion"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-39",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The vibration energy lost when the unsliced conducting plate eventually stops is transformed mainly into:",
      "choices": [
        "Electrical charge stored permanently on the plate",
        "Heat energy due to eddy currents",
        "Magnetic flux",
        "Chemical energy"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-40",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Electric generators are described in the chapter as devices that convert:",
      "choices": [
        "Electric energy into mechanical energy",
        "Mechanical energy into electric energy by the effect of a magnetic field",
        "Thermal energy directly into magnetic energy",
        "Magnetic energy into gravitational energy"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-41",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "A single-phase AC generator contains which combination?",
      "choices": [
        "Coil, two magnetic poles, two sliding rings and two carbon brushes",
        "Coil, commutator, one carbon brush and one magnetic pole",
        "Three coils, commutator and no brushes",
        "Coil, battery, resistor and galvanometer"
      ],
      "answer_index": 0,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-42",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "During one complete rotation of a single-phase generator coil in a uniform magnetic field, the polarity of the induced EMF reverses:",
      "choices": [
        "Once",
        "Twice",
        "Three times",
        "Four times"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-43",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "According to the chapter, the induced EMF of a generator depends on all of the following EXCEPT:",
      "choices": [
        "Number of turns N",
        "Area of one turn A",
        "Magnetic flux density B",
        "Resistance of the external circuit R"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-44",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "A three-phase AC generator consists of three coils separated by equal angles. The angular separation stated in the chapter is:",
      "choices": [
        "60^\\circ",
        "90^\\circ",
        "120^\\circ",
        "180^\\circ"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-45",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The component that replaces the two sliding rings when constructing the DC generator described in the chapter is:",
      "choices": [
        "An iron core",
        "A commutator consisting of two electrically isolated halves",
        "A second coil",
        "A galvanometer"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-46",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The average output current of the DC generator described in the chapter is related to its maximum current by:",
      "choices": [
        "I_{average}=I_{max}",
        "I_{average}=0.636I_{max}",
        "I_{average}=2I_{max}",
        "I_{average}=0.5I_{max}"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-47",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Why is the induced EMF generated in a rotating motor coil called “back EMF”?",
      "choices": [
        "It is always larger than the applied voltage",
        "It acts in the same direction as the applied voltage",
        "It opposes the EMF that generated the motor current according to Lenz’s law",
        "It exists only after the motor stops"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-48",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "According to the motor relation given in the chapter, the current flowing through the motor is determined by:",
      "choices": [
        "I=\\dfrac{V_{applied}+E_{back}}{R}",
        "I=\\dfrac{E_{back}-V_{applied}}{R}",
        "I=\\dfrac{V_{applied}-E_{back}}{R}",
        "I=R(V_{applied}-E_{back})"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-49",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "The coefficient of self-inductance of a coil depends on all of the following EXCEPT:",
      "choices": [
        "Size of the coil",
        "Geometrical shape of the coil",
        "Number of turns",
        "Time rate of change of current through the coil"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-en-50",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "Electromagnetic Induction",
      "question": "Two adjacent closed coils are arranged so that current in the primary coil changes with time. According to mutual induction, an EMF appears in the secondary because:",
      "choices": [
        "The secondary resistance changes automatically",
        "The changing primary current changes the magnetic flux penetrating the secondary coil",
        "The secondary current must initially be constant",
        "Both coils must carry identical currents"
      ],
      "answer_index": 1,
      "explanation": null
    }
  ],
  "ar": [
    {
      "id": "builtin-physics-2-ar-01",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "إذا تحركت شحنة موجبة داخل مجال مغناطيسي منتظم بحيث كانت سرعتها عمودية على اتجاه كثافة الفيض المغناطيسي، فإنها:",
      "choices": [
        "تتحرك بخط مستقيم",
        "تسلك مسارًا دائريًا",
        "تتوقف",
        "تتحرك باتجاه المجال"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-02",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تكون القوة المغناطيسية المؤثرة في شحنة متحركة أعظم ما يمكن عندما تكون الزاوية بين متجه السرعة ومتجه كثافة الفيض:",
      "choices": [
        "0°",
        "30°",
        "60°",
        "90°"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-03",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "إذا كان متجه سرعة الجسيمة المشحونة موازيًا لمتجه كثافة الفيض المغناطيسي، فإن القوة المغناطيسية:",
      "choices": [
        "عظمى",
        "نصف قيمتها العظمى",
        "تساوي صفرًا",
        "تزداد مع الزمن"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-04",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تعتمد القوة المغناطيسية المؤثرة في جسيمة مشحونة متحركة داخل مجال مغناطيسي منتظم على:",
      "choices": [
        "مقدار الشحنة والسرعة وكثافة الفيض والزاوية بينهما",
        "مساحة السطح والمقاومة فقط",
        "عدد اللفات والزمن فقط",
        "كثافة الفيض والمقاومة فقط"
      ],
      "answer_index": 0,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-05",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "عند وضع مغناطيس ساكن بالنسبة لملف موصول بأميتر، تكون قراءة الأميتر صفرًا لأن:",
      "choices": [
        "الفيض المغناطيسي يساوي صفرًا",
        "الفيض المغناطيسي لا يتغير مع الزمن",
        "الملف لا يحتوي على مقاومة",
        "المغناطيس لا يمتلك مجالًا مغناطيسيًا"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-06",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "إذا تحرك المغناطيس والملف بالسرعة نفسها وفي الاتجاه نفسه، فلا يتولد تيار حثي لأن:",
      "choices": [
        "المجال المغناطيسي يختفي",
        "المقاومة تصبح كبيرة جدًا",
        "لا توجد حركة نسبية بينهما وبالتالي لا يتغير الفيض",
        "عدد لفات الملف يقل"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-07",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "أي ملاحظة من تجربة فاراداي تؤكد أن التيار الابتدائي الثابت لا يولد تيارًا حثيًا مستمرًا في الملف الثانوي؟",
      "choices": [
        "انحراف المؤشر عند غلق المفتاح",
        "عودة المؤشر للصفر بعد ثبات التيار الابتدائي",
        "انحراف المؤشر عند فتح المفتاح",
        "وجود بطارية في الدائرة الابتدائية"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-08",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "ظهر التيار الحثي في الملف الثانوي بتجربة فاراداي أثناء:",
      "choices": [
        "ثبات التيار الابتدائي فقط",
        "نمو التيار الابتدائي فقط",
        "اضمحلال التيار الابتدائي فقط",
        "نمو واضمحلال التيار الابتدائي"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-09",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "العامل الأساسي لتوليد تيار حثي في دائرة مغلقة هو:",
      "choices": [
        "وجود مغناطيس دائم",
        "وجود قلب حديدي فقط",
        "تغير الفيض المغناطيسي النافذ خلال الدائرة بالنسبة للزمن",
        "ثبات الفيض المغناطيسي"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-10",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "فشلت المحاولات السابقة لاكتشاف فاراداي في توليد تيار كهربائي باستعمال المجال المغناطيسي لأنها اعتمدت على:",
      "choices": [
        "مجال مغناطيسي متغير",
        "مجال مغناطيسي ثابت",
        "تيار متناوب",
        "ملفات ذات لفات كثيرة"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-11",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "أي مما يأتي يزيد التيار الحثي المتولد في ملف أمام مغناطيس متحرك؟",
      "choices": [
        "تقليل السرعة النسبية",
        "تقليل عدد اللفات",
        "إدخال قلب من الحديد المطاوع داخل الملف",
        "جعل المغناطيس والملف يتحركان معًا بالسرعة نفسها"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-12",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "عند تقريب قطب مغناطيسي من ملف ثم إبعاده عنه بالسرعة نفسها، يكون التيار الحثي في الحالتين:",
      "choices": [
        "بنفس الاتجاه",
        "باتجاهين متعاكسين",
        "صفرًا",
        "متساويًا في الاتجاه والمقدار دائمًا"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-13",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "عند تحريك ساق موصلة داخل مجال مغناطيسي، تتجمع الشحنات عند طرفي الساق نتيجة:",
      "choices": [
        "قوة كهربائية ساكنة",
        "قوة مغناطيسية",
        "قوة جذب أرضي",
        "مقاومة الساق"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-14",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "القوة الدافعة الكهربائية الحركية لساق تتحرك عموديًا على مجال مغناطيسي منتظم تُعطى بالعلاقة:",
      "choices": [
        "vB/\\ell",
        "B\\ell/v",
        "vB\\ell",
        "v\\ell/B"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-15",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تعتمد القوة الدافعة الكهربائية الحركية على:",
      "choices": [
        "كثافة الفيض والسرعة وطول الساق فقط عند الحركة العمودية",
        "المقاومة فقط",
        "عدد اللفات فقط",
        "مساحة الملف فقط"
      ],
      "answer_index": 0,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-16",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تكون القوة الدافعة الكهربائية الحركية أعظم ما يمكن عندما تتحرك الساق:",
      "choices": [
        "موازية لخطوط الفيض",
        "عمودية على خطوط الفيض",
        "بزاوية 45° فقط",
        "وهي ساكنة"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-17",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "عند عكس اتجاه حركة الساق داخل المجال أو عكس اتجاه المجال المغناطيسي فإن:",
      "choices": [
        "مقدار واتجاه القوة الدافعة لا يتغيران",
        "القوة الدافعة تصبح صفرًا",
        "قطبية القوة الدافعة الكهربائية الحركية تنعكس",
        "طول الساق يتغير"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-18",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "إذا تحركت الساق الموصلة باتجاه موازٍ للمجال المغناطيسي فإن القوة الدافعة الكهربائية الحركية:",
      "choices": [
        "عظمى",
        "تساوي صفرًا",
        "تساوي vB\\ell",
        "تتضاعف"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-19",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "القوة المغناطيسية المعيقة المؤثرة في ساق يمر فيها تيار داخل مجال مغناطيسي تُعطى بالعلاقة:",
      "choices": [
        "F=IB/\\ell",
        "F=I\\ell B",
        "F=I\\ell/B",
        "F=B/I\\ell"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-20",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "اتجاه القوة المغناطيسية المعيقة المؤثرة في الساق المتحركة يكون:",
      "choices": [
        "مع اتجاه الحركة",
        "بعكس اتجاه الحركة",
        "مع اتجاه المجال",
        "عموديًا على الساق فقط دون تأثير على الحركة"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-21",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تتحرك الساق بسرعة ثابتة عندما:",
      "choices": [
        "تكون قوة السحب أكبر من القوة المعيقة",
        "تكون القوة المعيقة أكبر من قوة السحب",
        "تتساوى القوتان مقدارًا وتتعاكسان اتجاهًا",
        "تنعدم القوتان دائمًا"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-22",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "الشغل المبذول لتحريك ساق موصلة داخل مجال مغناطيسي يتحول إلى:",
      "choices": [
        "طاقة وضع فقط",
        "طاقة حرارية مبددة في المقاومة",
        "طاقة كيميائية",
        "طاقة ضوئية فقط"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-23",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "أي مما يأتي لا يُعد من العوامل الأساسية التي يؤدي تغيرها إلى تغير الفيض المغناطيسي؟",
      "choices": [
        "كثافة الفيض B",
        "المساحة A",
        "الزاوية \\theta",
        "المقاومة R"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-24",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "يعطى الفيض المغناطيسي بالعلاقة:",
      "choices": [
        "\\Phi_B=BA\\sin\\theta",
        "\\Phi_B=BA\\cos\\theta",
        "\\Phi_B=B/A",
        "\\Phi_B=AB/\\theta"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-25",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "يكون الفيض المغناطيسي أعظم ما يمكن عندما يكون متجه المساحة:",
      "choices": [
        "عموديًا على متجه كثافة الفيض",
        "موازيًا لمتجه كثافة الفيض",
        "بزاوية 90° معه",
        "بعكس اتجاه الحركة فقط"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-26",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "عندما يكون مستوى الحلقة موازيًا لخطوط المجال المغناطيسي، فإن الفيض خلال الحلقة:",
      "choices": [
        "أعظم ما يمكن",
        "نصف القيمة العظمى",
        "يساوي صفرًا",
        "يساوي 2BA"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-27",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "ينص قانون فاراداي على أن مقدار القوة الدافعة الكهربائية الحثية يتناسب طرديًا مع:",
      "choices": [
        "مقدار الفيض المغناطيسي فقط",
        "معدل التغير الزمني في الفيض المغناطيسي",
        "المقاومة فقط",
        "مساحة الحلقة فقط"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-28",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "الإشارة السالبة في قانون فاراداي تعود إلى:",
      "choices": [
        "قانون أوم",
        "قانون لنز",
        "قانون كولوم",
        "قانون حفظ الشحنة"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-29",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تعتمد قطبية القوة الدافعة الكهربائية الحثية على كون الفيض المغناطيسي:",
      "choices": [
        "كبيرًا أو صغيرًا",
        "منتظمًا أو غير منتظم",
        "متزايدًا أو متناقصًا",
        "ناتجًا من مغناطيس أو ملف فقط"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-30",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "عند تقريب القطب الشمالي لمغناطيس من وجه حلقة موصلة، فإن وجه الحلقة المقابل للمغناطيس يتصرف كأنه:",
      "choices": [
        "قطب جنوبي",
        "قطب شمالي",
        "غير ممغنط",
        "قطب يتغير عشوائيًا"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-31",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "عند إبعاد القطب الشمالي للمغناطيس عن وجه الحلقة فإن وجه الحلقة يصبح:",
      "choices": [
        "شماليًا ليطرده",
        "جنوبيًا ليجذبه",
        "غير ممغنط",
        "لا يتولد فيه مجال"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-32",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "من الفوائد العملية لقانون لنز:",
      "choices": [
        "حساب المقاومة فقط",
        "تحديد اتجاه التيار الحثي وبيان حفظ الطاقة",
        "حساب عدد لفات الملف فقط",
        "تحديد سرعة الإلكترونات"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-33",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "كثافة الفيض المغناطيسي الحثي المتولد بفعل التيار الحثي:",
      "choices": [
        "تساعد دائمًا على زيادة سبب حدوثه",
        "تعاكس التغير في الفيض الذي سبب التيار الحثي",
        "تكون دائمًا مساوية للصفر",
        "لا ترتبط بقانون لنز"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-34",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "التيارات الدوامة هي تيارات:",
      "choices": [
        "مستقيمة داخل الموصل",
        "مغلقة ودائرية داخل الموصل",
        "توجد فقط في الأسلاك",
        "لا ترتبط بالحث الكهرومغناطيسي"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-35",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تتولد التيارات الدوامة بسبب:",
      "choices": [
        "ثبات الفيض",
        "الحركة النسبية بين الموصل والفيض المغناطيسي",
        "وجود شحنة ساكنة",
        "انعدام المجال"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-36",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "الأثر غير المرغوب للتيارات الدوامة في الأجهزة هو:",
      "choices": [
        "زيادة الطاقة الميكانيكية",
        "ضياع الطاقة على شكل حرارة",
        "إلغاء المقاومة",
        "منع المجال المغناطيسي"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-37",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "يُصنع قلب المحولة على شكل صفائح حديدية معزولة كهربائيًا عن بعضها بهدف:",
      "choices": [
        "تقليل المقاومة الكهربائية",
        "زيادة التيارات الدوامة",
        "زيادة المقاومة لمسارات التيارات الدوامة وتقليلها",
        "إلغاء الفيض المغناطيسي"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-38",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "في تجربة اللوحين المتأرجحين بين قطبي مغناطيس، أيهما يتوقف أسرع؟",
      "choices": [
        "اللوح المشقوق",
        "اللوح غير المشقوق",
        "كلاهما في الوقت نفسه",
        "لا يتوقف أي منهما"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-39",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تتحول طاقة اهتزاز اللوح غير المشقوق عند توقفه إلى:",
      "choices": [
        "طاقة حرارية",
        "طاقة وضع",
        "طاقة كيميائية",
        "طاقة نووية"
      ],
      "answer_index": 0,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-40",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "المولد الكهربائي يحول:",
      "choices": [
        "الطاقة الكهربائية إلى ميكانيكية",
        "الطاقة الميكانيكية إلى كهربائية بتأثير المجال المغناطيسي",
        "الحرارية إلى ميكانيكية",
        "المغناطيسية إلى كيميائية"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-41",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "يتكون مولد التيار المتناوب أحادي الطور من:",
      "choices": [
        "ملف وقطبين مغناطيسيين وحلقتين انزلاقيتين وفرشتين كاربونيتين",
        "ملف ومبدل وفرشاة واحدة",
        "ثلاثة ملفات فقط",
        "بطارية ومقاومة فقط"
      ],
      "answer_index": 0,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-42",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "خلال دورة كاملة واحدة لملف المولد المتناوب أحادي الطور، تنعكس قطبية القوة الدافعة الكهربائية:",
      "choices": [
        "مرة واحدة",
        "مرتين",
        "ثلاث مرات",
        "أربع مرات"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-43",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تعتمد القوة الدافعة الكهربائية المتولدة في المولد على جميع الآتي ما عدا:",
      "choices": [
        "عدد اللفات",
        "مساحة اللفة",
        "كثافة الفيض",
        "مقاومة الدائرة الخارجية"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-44",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تفصل بين ملفات المولد المتناوب ثلاثي الطور زوايا مقدار كل منها:",
      "choices": [
        "60°",
        "90°",
        "120°",
        "180°"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-45",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "للحصول على تيار باتجاه واحد في مولد التيار المستمر تُستبدل الحلقتان الانزلاقيتان بـ:",
      "choices": [
        "قلب حديدي",
        "مبدل يتكون من نصفين معدنيين معزولين كهربائيًا",
        "ملف ثانوي",
        "مقاومة كبيرة"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-46",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "متوسط التيار الخارج من مولد التيار المستمر حسب العلاقة الواردة في الفصل هو:",
      "choices": [
        "I_{avg}=I_{max}",
        "I_{avg}=0.636I_{max}",
        "I_{avg}=0.5I_{max}",
        "I_{avg}=2I_{max}"
      ],
      "answer_index": 1,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-47",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "تسمى القوة الدافعة المتولدة في ملف المحرك أثناء دورانه بالقوة الدافعة العكسية لأنها:",
      "choices": [
        "أكبر دائمًا من الجهد المسلط",
        "تكون باتجاه الجهد المسلط",
        "تعاكس الجهد المسبب للتيار وفق قانون لنز",
        "لا تتولد إلا بعد توقف المحرك"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-48",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "التيار المار في دائرة المحرك يُعطى بالعلاقة:",
      "choices": [
        "I=\\frac{V_{applied}+E_{back}}{R}",
        "I=\\frac{E_{back}-V_{applied}}{R}",
        "I=\\frac{V_{applied}-E_{back}}{R}",
        "I=R(V_{applied}-E_{back})"
      ],
      "answer_index": 2,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-49",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "يعتمد معامل الحث الذاتي للملف على جميع الآتي ما عدا:",
      "choices": [
        "حجم الملف",
        "الشكل الهندسي للملف",
        "عدد اللفات",
        "معدل تغير التيار مع الزمن"
      ],
      "answer_index": 3,
      "explanation": null
    },
    {
      "id": "builtin-physics-2-ar-50",
      "subject": "physics",
      "chapter": 2,
      "chapter_title": "الحث الكهرومغناطيسي",
      "question": "في الحث المتبادل، تتولد قوة دافعة حثية في الملف الثانوي عندما:",
      "choices": [
        "يبقى تيار الملف الابتدائي ثابتًا",
        "يتغير تيار الملف الابتدائي مع الزمن فيتغير الفيض النافذ في الملف الثانوي",
        "تنعدم كثافة الفيض",
        "يجب أن يحمل الملفان تيارين متماثلين"
      ],
      "answer_index": 1,
      "explanation": null
    }
  ]
};

export function getBuiltInPhysicsCh2(language: "ar" | "en"): BuiltInMcqRow[] {
  return PHYSICS_CH2[language];
}
