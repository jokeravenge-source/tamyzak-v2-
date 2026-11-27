import type { PaperExercise, PaperPractice } from "./paperReview.ts";

type Choices = PaperPractice["choices"];
type Preset = Omit<PaperExercise, "chapter" | "practice"> & {
  practice: {
    question: PaperExercise["question"];
    choices: Choices | Record<"ar" | "en", Choices>;
    correctIndex: 0 | 1 | 2;
    explanation: PaperExercise["question"];
  };
};

const chapterPresets: Readonly<Record<number, readonly Preset[]>> = {
  1: [
    {
      id: "distance",
      title: { ar: "المسافة بين اللوحين", en: "Plate separation" },
      question: {
        ar: "سعة متسعة ذات لوحين متوازيين تساوي 12 µF. إذا تضاعفت المسافة بين اللوحين مع ثبات المساحة والعازل، فما السعة الجديدة؟",
        en: "A parallel-plate capacitor has a capacitance of 12 µF. What is its new capacitance when the plate separation doubles and area and dielectric stay fixed?",
      },
      guide: {
        ar: "سلم تدريب · درجتان: درجة لاستخدام العلاقة العكسية C ∝ 1/d مع ثبات المساحة والعازل، ودرجة للناتج 6 µF مع الوحدة.",
        en: "Practice key · 2 marks: 1 for the inverse relation C ∝ 1/d at fixed area and dielectric, and 1 for 6 µF with the unit.",
      },
      practice: {
        question: {
          ar: "سعة المتسعة 24 µF. إذا صارت المسافة ثلاثة أمثالها وبقيت المساحة والعازل ثابتين، شكد السعة الجديدة؟",
          en: "Capacitance is 24 µF. The separation triples at fixed area and dielectric. What is the new capacitance?",
        },
        choices: ["72 µF", "8 µF", "12 µF"], correctIndex: 1,
        explanation: {
          ar: "المسافة صارت 3d، فالسعة صارت ثلث قيمتها: 24 ÷ 3 = 8 µF.",
          en: "With 3d in the denominator, capacitance becomes one-third: 24 ÷ 3 = 8 µF.",
        },
      },
    },
    {
      id: "area",
      title: { ar: "المساحة المتقابلة", en: "Overlapping plate area" },
      question: {
        ar: "متسعة سعتها 8 µF. أصبحت المساحة المتقابلة للوحين مرة ونصف مساحتها الأصلية، مع ثبات المسافة والعازل. احسب السعة الجديدة.",
        en: "A capacitor has capacitance 8 µF. Its overlapping plate area increases to 1.5 times the original at fixed separation and dielectric. Find the new capacitance.",
      },
      guide: {
        ar: "سلم تدريب · درجتان: درجة للعلاقة الطردية C ∝ A، ودرجة للتعويض الصحيح 8 × 1.5 = 12 µF.",
        en: "Practice key · 2 marks: 1 for the direct relation C ∝ A and 1 for 8 × 1.5 = 12 µF.",
      },
      practice: {
        question: {
          ar: "إذا كانت السعة 6 µF وتضاعفت المساحة المتقابلة للوحين وبقي كلشي ثاني ثابت، شكد تصير؟",
          en: "What happens to a 6 µF capacitance if the overlapping area doubles with the other variables fixed?",
        },
        choices: ["3 µF", "6 µF", "12 µF"], correctIndex: 2,
        explanation: {
          ar: "المساحة بالبسط. إذا تضاعفت المساحة وحدها، تتضاعف السعة: 6 × 2 = 12 µF.",
          en: "Area is in the numerator, so doubling it doubles the capacitance to 12 µF.",
        },
      },
    },
    {
      id: "dielectric",
      title: { ar: "إدخال العازل", en: "Inserting a dielectric" },
      question: {
        ar: "متسعة هوائية سعتها 4 µF. ملأ عازل ثابت عزله النسبي 3 الفراغ بين لوحيها تماماً. احسب سعتها بعد إدخال العازل.",
        en: "An air capacitor has capacitance 4 µF. A dielectric of relative permittivity 3 completely fills the gap. Find the new capacitance.",
      },
      guide: {
        ar: "سلم تدريب · درجتان: درجة لكتابة C₂ = κC₁ عند امتلاء الفراغ بالعازل، ودرجة للناتج 12 µF.",
        en: "Practice key · 2 marks: 1 for C₂ = κC₁ when the dielectric fills the gap, and 1 for 12 µF.",
      },
      practice: {
        question: {
          ar: "متسعة هوائية 5 µF. عازل ثابت عزله 4 ملأ كل الفراغ بين اللوحين. شكد تصير السعة؟",
          en: "The air capacitance is 5 µF and a dielectric with κ = 4 fills the gap. What is the new capacitance?",
        },
        choices: ["20 µF", "1.25 µF", "9 µF"], correctIndex: 0,
        explanation: {
          ar: "نضرب السعة الهوائية بثابت العزل لأن العازل ملأ الفراغ كله: 5 × 4 = 20 µF.",
          en: "The dielectric fills the gap, so multiply the air capacitance by κ: 5 × 4 = 20 µF.",
        },
      },
    },
    {
      id: "units",
      title: { ar: "تحويل وحدات السعة", en: "Capacitance units" },
      question: { ar: "حوّل سعة مقدارها 5 µF إلى الفاراد.", en: "Convert a capacitance of 5 µF to farads." },
      guide: {
        ar: "سلم تدريب · درجتان: درجة لإدراك أن المايكرو يساوي 10⁻⁶، ودرجة لكتابة 5 × 10⁻⁶ F.",
        en: "Practice key · 2 marks: 1 for the micro prefix 10⁻⁶ and 1 for 5 × 10⁻⁶ F.",
      },
      practice: {
        question: {
          ar: "حوّل 8 µF إلى الفاراد.",
          en: "Convert 8 µF to farads.",
        },
        choices: ["8 × 10⁻³ F", "8 × 10⁻⁶ F", "8 × 10⁶ F"], correctIndex: 1,
        explanation: {
          ar: "الرمز µ يعني جزءاً من مليون، فـ 8 µF تساوي 8 × 10⁻⁶ F.",
          en: "The prefix micro means one millionth, so 8 µF equals 8 × 10⁻⁶ F.",
        },
      },
    },
    {
      id: "formula",
      title: { ar: "التعويض بقانون السعة", en: "Using the capacitance formula" },
      question: {
        ar: "سماحية العازل ε = 4 × 10⁻¹¹ F/m، ومساحة اللوح A = 0.02 m² والمسافة d = 0.004 m. احسب سعة المتسعة ذات اللوحين.",
        en: "A parallel-plate capacitor has ε = 4 × 10⁻¹¹ F/m, A = 0.02 m², and d = 0.004 m. Find its capacitance.",
      },
      guide: {
        ar: "سلم تدريب · درجتان: درجة للتعويض في C = εA/d، ودرجة للناتج بوحدته 2 × 10⁻¹⁰ F.",
        en: "Practice key · 2 marks: 1 for substitution into C = εA/d and 1 for 2 × 10⁻¹⁰ F with the unit.",
      },
      practice: {
        question: {
          ar: "إذا كانت ε = 5 × 10⁻¹¹ F/m، وكانت A = 0.03 m² وd = 0.005 m، شكد C؟",
          en: "Find C when ε = 5 × 10⁻¹¹ F/m, A = 0.03 m², and d = 0.005 m.",
        },
        choices: ["3 × 10⁻⁹ F", "3 × 10⁻¹² F", "3 × 10⁻¹⁰ F"], correctIndex: 2,
        explanation: {
          ar: "نقسم A على d فنحصل على 6، ثم نضرب بسماحية العازل: 6 × 5 × 10⁻¹¹ = 3 × 10⁻¹⁰ F.",
          en: "A/d = 6. Multiply by the permittivity: 6 × 5 × 10⁻¹¹ = 3 × 10⁻¹⁰ F.",
        },
      },
    },
  ],
  2: [
    {
      id: "ch2-faraday",
      title: { ar: "قانون فاراداي", en: "Faraday’s law" },
      question: {
        ar: "ملف من 100 لفة. تغيّر الفيض خلال كل لفة من 0.020 Wb إلى 0.008 Wb خلال 0.40 s. احسب مقدار القوة الدافعة الحثية المتوسطة.",
        en: "The magnetic flux per turn of a 100-turn coil drops from 0.020 Wb to 0.008 Wb in 0.40 s. Find the magnitude of the average induced emf.",
      },
      guide: {
        ar: "درجة لإيجاد مقدار تغيّر الفيض 0.012 Wb. درجة لاستخدام |ε| = N|ΔΦ|/Δt وإيجاد 3 V.",
        en: "One mark for the flux change magnitude of 0.012 Wb. One for using |ε| = N|ΔΦ|/Δt to get 3 V.",
      },
      practice: {
        question: {
          ar: "ملف من 80 لفة. نقص الفيض خلال كل لفة من 0.016 Wb إلى 0.004 Wb خلال 0.30 s. ما مقدار القوة الدافعة الحثية المتوسطة؟",
          en: "Flux per turn through an 80-turn coil falls from 0.016 Wb to 0.004 Wb in 0.30 s. What is the magnitude of the average induced emf?",
        },
        choices: ["0.04 V", "3.2 V", "0.96 V"], correctIndex: 1,
        explanation: {
          ar: "نضرب تغيّر الفيض بكل لفة بعدد اللفات ونقسم على الزمن. 80 × (0.016 − 0.004) ÷ 0.30 = 3.2 V.",
          en: "Multiply the flux change per turn by the turns, then divide by time. 80 × (0.016 − 0.004) ÷ 0.30 = 3.2 V.",
        },
      },
    },
    {
      id: "ch2-lenz",
      title: { ar: "اتجاه التيار بقانون لنز", en: "Current direction and Lenz’s law" },
      question: {
        ar: "حلقة مغلقة بمستوى الورقة، ومجال مغناطيسي خارجي داخل إلى الورقة يزداد. بأي اتجاه يسري التيار الحثي كما تراه وأنت تنظر للورقة؟",
        en: "A closed loop lies in the page. An external magnetic field into the page is increasing. Which way does induced current flow as you face the page?",
      },
      guide: {
        ar: "درجة لأن المجال الحثي يتجه خارج الورقة لمعارضة الزيادة. درجة لاستنتاج اتجاه التيار عكس عقارب الساعة بقاعدة اليد اليمنى.",
        en: "One mark for an induced field out of the page to oppose the increase. One for using the right-hand rule to get counterclockwise current.",
      },
      practice: {
        question: {
          ar: "إذا صار المجال الخارجي الداخل للورقة يتناقص، بأي اتجاه يسري التيار الحثي وأنت تنظر لنفس الوجه من الحلقة؟",
          en: "If the external field into the page now decreases, which way does current flow when viewed from the same side of the loop?",
        },
        choices: {
          ar: ["عكس عقارب الساعة", "مع عقارب الساعة", "ما يتولّد تيار"],
          en: ["Counterclockwise", "Clockwise", "No current flows"],
        },
        correctIndex: 1,
        explanation: {
          ar: "المجال الحثي يكون داخل للورقة حتى يقاوم نقصان الفيض. قاعدة اليد اليمنى تنطي اتجاه مع عقارب الساعة.",
          en: "The induced field points into the page to oppose the loss of flux. The right-hand rule gives clockwise current.",
        },
      },
    },
    {
      id: "ch2-motional-emf",
      title: { ar: "القوة الدافعة الحركية", en: "Motional emf" },
      question: {
        ar: "قضيب موصل طوله 0.40 m يتحرك بسرعة 6 m/s في مجال مغناطيسي كثافته 0.25 T. إذا كان القضيب والسرعة والمجال متعامدة اثنين اثنين، احسب القوة الدافعة بين طرفيه.",
        en: "A 0.40 m conducting rod moves at 6 m/s in a 0.25 T field. The rod, velocity, and field are mutually perpendicular. Find the emf across its ends.",
      },
      guide: {
        ar: "درجة لاختيار العلاقة ε = Bℓv للتعامد. درجة للتعويض 0.25 × 0.40 × 6 = 0.60 V.",
        en: "One mark for choosing ε = Bℓv in the perpendicular geometry. One for 0.25 × 0.40 × 6 = 0.60 V.",
      },
      practice: {
        question: {
          ar: "قضيب طوله 0.20 m يتحرك بسرعة 8 m/s في مجال 0.50 T بنفس وضع التعامد. شكد القوة الدافعة بين طرفيه؟",
          en: "A 0.20 m rod moves at 8 m/s in a 0.50 T field with the same perpendicular geometry. What is the emf?",
        },
        choices: ["0.10 V", "4.0 V", "0.80 V"], correctIndex: 2,
        explanation: { ar: "هنا نضرب كثافة المجال بطول القضيب وبسرعته. 0.50 × 0.20 × 8 = 0.80 V.", en: "Multiply the field strength, rod length, and speed. 0.50 × 0.20 × 8 = 0.80 V." },
      },
    },
    {
      id: "ch2-transformer",
      title: { ar: "نسبة الجهد في المحوّلة", en: "Transformer voltage ratio" },
      question: {
        ar: "محوّلة مثالية عدد لفات ملفها الابتدائي 600 والثانوي 150. الجهد المتناوب الفعّال للابتدائي 120 V. احسب الجهد الفعّال للثانوي.",
        en: "An ideal transformer has 600 primary turns and 150 secondary turns. The primary RMS voltage is 120 V. Find the secondary RMS voltage.",
      },
      guide: {
        ar: "درجة لكتابة Vₛ/Vₚ = Nₛ/Nₚ. درجة لاستخدام نسبة 150/600 وإيجاد 30 V.",
        en: "One mark for Vₛ/Vₚ = Nₛ/Nₚ. One for using 150/600 to obtain 30 V.",
      },
      practice: {
        question: {
          ar: "محوّلة مثالية ابتدائيها 500 لفة وثانويها 100 لفة. إذا كان الجهد الفعّال للابتدائي 200 V، شكد الجهد الفعّال للثانوي؟",
          en: "An ideal transformer has 500 primary turns and 100 secondary turns. Its primary RMS voltage is 200 V. What is the secondary RMS voltage?",
        },
        choices: ["40 V", "1,000 V", "50 V"], correctIndex: 0,
        explanation: { ar: "نضرب جهد الابتدائي بنسبة لفات الثانوي إلى الابتدائي. 200 × (100/500) = 40 V.", en: "Multiply the primary voltage by the secondary-to-primary turns ratio. 200 × (100/500) = 40 V." },
      },
    },
    {
      id: "ch2-self-induction",
      title: { ar: "الحث الذاتي للمحث", en: "Self-induced emf" },
      question: {
        ar: "محث معامل حثه الذاتي 0.40 H. تزايد التيار فيه بانتظام من 1 A إلى 5 A خلال 0.20 s. احسب مقدار القوة الدافعة للحث الذاتي.",
        en: "Current through a 0.40 H inductor rises uniformly from 1 A to 5 A in 0.20 s. Find the magnitude of the self-induced emf.",
      },
      guide: {
        ar: "درجة لإيجاد معدّل تغيّر التيار 20 A/s. درجة لتطبيق |ε| = L|ΔI|/Δt والحصول على 8 V.",
        en: "One mark for the current change rate of 20 A/s. One for |ε| = L|ΔI|/Δt and 8 V.",
      },
      practice: {
        question: {
          ar: "محث 0.25 H، نزل التيار فيه بانتظام من 6 A إلى 2 A خلال 0.50 s. ما مقدار القوة الدافعة للحث الذاتي؟",
          en: "The current in a 0.25 H inductor falls uniformly from 6 A to 2 A in 0.50 s. What is the magnitude of the self-induced emf?",
        },
        choices: ["0.50 V", "8 V", "2 V"], correctIndex: 2,
        explanation: { ar: "مقدار التغيّر 4 A ومعدّله 8 A/s. نضرب المعدّل في 0.25 H ونحصل على 2 V.", en: "The current changes by 4 A at a rate of 8 A/s. Multiply by 0.25 H to obtain 2 V." },
      },
    },
  ],
  3: [
    {
      id: "ch3-rms",
      title: { ar: "القيمة الفعّالة", en: "Effective (RMS) value" },
      question: {
        ar: "جهد متناوب جيبي قيمته العظمى 24√2 V. احسب قيمته الفعّالة.",
        en: "A sinusoidal voltage has a peak value of 24√2 V. Find its RMS value.",
      },
      guide: {
        ar: "درجة لاستخدام Vᵣₘₛ = Vₘ/√2 للموجة الجيبية. درجة لإيجاد 24 V.",
        en: "One mark for using Vᵣₘₛ = Vₘ/√2 for a sine wave. One for 24 V.",
      },
      practice: {
        question: { ar: "تيار متناوب جيبي قيمته العظمى 4√2 A. شكد قيمته الفعّالة؟", en: "A sinusoidal current has a peak of 4√2 A. What is its RMS value?" },
        choices: ["8 A", "2 A", "4 A"], correctIndex: 2,
        explanation: { ar: "نقسم القيمة العظمى للتيار الجيبي على √2 ونحصل على 4 A.", en: "Divide the peak sinusoidal current by √2 to obtain 4 A." },
      },
    },
    {
      id: "ch3-inductive-reactance",
      title: { ar: "الرادّة الحثية", en: "Inductive reactance" },
      question: {
        ar: "محث مثالي حثه 0.30 H موصول بمصدر متناوب تردده الزاوي 100 rad/s. احسب الرادّة الحثية.",
        en: "An ideal inductor of 0.30 H is connected to an AC source with angular frequency 100 rad/s. Find its inductive reactance.",
      },
      guide: {
        ar: "درجة لكتابة X_L = ωL. درجة للتعويض 100 × 0.30 والحصول على 30 Ω.",
        en: "One mark for X_L = ωL. One for 100 × 0.30 = 30 Ω.",
      },
      practice: {
        question: { ar: "محث 0.20 H بمصدر متناوب تردده الزاوي 200 rad/s. شكد رادّته الحثية؟", en: "A 0.20 H inductor is connected at 200 rad/s. What is its inductive reactance?" },
        choices: ["40 Ω", "1,000 Ω", "20 Ω"], correctIndex: 0,
        explanation: { ar: "التردد الزاوي معطى مباشرة. نضرب 200 × 0.20 = 40 Ω.", en: "The angular frequency is already given. Multiply 200 × 0.20 to get 40 Ω." },
      },
    },
    {
      id: "ch3-capacitive-reactance",
      title: { ar: "الرادّة السعوية", en: "Capacitive reactance" },
      question: {
        ar: "متسعة 20 µF في دائرة متناوبة ترددها الزاوي 1,000 rad/s. احسب الرادّة السعوية.",
        en: "A 20 µF capacitor is in an AC circuit at 1,000 rad/s. Find its capacitive reactance.",
      },
      guide: {
        ar: "درجة لتحويل السعة إلى 20 × 10⁻⁶ F. درجة لتطبيق X_C = 1/(ωC) وإيجاد 50 Ω.",
        en: "One mark for converting to 20 × 10⁻⁶ F. One for X_C = 1/(ωC) and 50 Ω.",
      },
      practice: {
        question: { ar: "متسعة 50 µF تعمل بتردد زاوي 500 rad/s. شكد الرادّة السعوية؟", en: "A 50 µF capacitor operates at 500 rad/s. What is its capacitive reactance?" },
        choices: ["25 Ω", "40 Ω", "0.025 Ω"], correctIndex: 1,
        explanation: { ar: "بعد تحويل السعة إلى الفاراد يصير ωC = 0.025. مقلوبه يساوي 40 Ω.", en: "After converting capacitance to farads, ωC = 0.025. Its reciprocal is 40 Ω." },
      },
    },
    {
      id: "ch3-series-impedance",
      title: { ar: "الممانعة في دائرة RLC", en: "Series RLC impedance" },
      question: {
        ar: "دائرة RLC على التوالي فيها R = 30 Ω وX_L = 60 Ω وX_C = 20 Ω. احسب مقدار الممانعة.",
        en: "A series RLC circuit has R = 30 Ω, X_L = 60 Ω, and X_C = 20 Ω. Find the magnitude of its impedance.",
      },
      guide: {
        ar: "درجة لإيجاد صافي الرادّة 40 Ω. درجة لتطبيق Z = √(R² + (X_L − X_C)²) وإيجاد 50 Ω.",
        en: "One mark for the net reactance of 40 Ω. One for Z = √(R² + (X_L − X_C)²) and 50 Ω.",
      },
      practice: {
        question: { ar: "بدائرة RLC على التوالي، R = 6 Ω وX_L = 15 Ω وX_C = 7 Ω. شكد مقدار الممانعة؟", en: "In a series RLC circuit, R = 6 Ω, X_L = 15 Ω, and X_C = 7 Ω. What is the magnitude of the impedance?" },
        choices: ["10 Ω", "14 Ω", "28 Ω"], correctIndex: 0,
        explanation: { ar: "نطرح الرادّتين أولاً فنحصل على 8 Ω. مقدار الممانعة √(6² + 8²) = 10 Ω.", en: "Subtract the reactances first to get 8 Ω. The impedance magnitude is √(6² + 8²) = 10 Ω." },
      },
    },
    {
      id: "ch3-resonance",
      title: { ar: "التردد الزاوي للرنين", en: "Angular resonance frequency" },
      question: {
        ar: "بدائرة RLC على التوالي، الحث 0.10 H والسعة 10 µF. احسب التردد الزاوي عند الرنين.",
        en: "In a series RLC circuit, L = 0.10 H and C = 10 µF. Find its angular resonance frequency.",
      },
      guide: {
        ar: "درجة لإيجاد LC = 10⁻⁶ بعد تحويل السعة إلى الفاراد. درجة لاستخدام ω₀ = 1/√(LC) وإيجاد 1,000 rad/s.",
        en: "One mark for LC = 10⁻⁶ after converting capacitance to farads. One for ω₀ = 1/√(LC) and 1,000 rad/s.",
      },
      practice: {
        question: { ar: "إذا صار الحث 0.20 H والسعة 20 µF، شكد يصير التردد الزاوي للرنين؟", en: "With L = 0.20 H and C = 20 µF, what is the angular resonance frequency?" },
        choices: ["250 rad/s", "1,000 rad/s", "500 rad/s"], correctIndex: 2,
        explanation: { ar: "LC = 4 × 10⁻⁶، وجذره 0.002. ناخذ مقلوبه حتى نحصل على 500 rad/s.", en: "LC = 4 × 10⁻⁶ and its square root is 0.002. Taking the reciprocal gives 500 rad/s." },
      },
    },
  ],
  4: [
    {
      id: "ch4-wavelength",
      title: { ar: "الطول الموجي لموجة الراديو", en: "Radio wavelength" },
      question: {
        ar: "موجة راديو ترددها 100 MHz تنتشر في الفراغ بسرعة 3 × 10⁸ m/s. احسب طولها الموجي.",
        en: "A 100 MHz radio wave travels through vacuum at 3 × 10⁸ m/s. Find its wavelength.",
      },
      guide: {
        ar: "درجة لتحويل التردد إلى 10⁸ Hz. درجة لتطبيق λ = c/f والحصول على 3 m.",
        en: "One mark for converting frequency to 10⁸ Hz. One for λ = c/f and 3 m.",
      },
      practice: {
        question: { ar: "موجة ترددها 150 MHz في الفراغ. باستخدام c = 3 × 10⁸ m/s، شكد طولها الموجي؟", en: "What is the wavelength of a 150 MHz wave in vacuum? Use c = 3 × 10⁸ m/s." },
        choices: ["0.5 m", "4.5 m", "2 m"], correctIndex: 2,
        explanation: { ar: "نحوّل 150 MHz إلى 1.5 × 10⁸ Hz. نقسم سرعة الضوء على التردد فيطلع 2 m.", en: "Convert 150 MHz to 1.5 × 10⁸ Hz. Dividing the wave speed by that frequency gives 2 m." },
      },
    },
    {
      id: "ch4-field-directions",
      title: { ar: "اتجاه المجالين والانتشار", en: "Fields and propagation" },
      question: {
        ar: "ليش الموجة الكهرومغناطيسية مستعرضة؟ وضّح اتجاه اهتزاز المجالين الكهربائي والمغناطيسي بالنسبة لاتجاه انتشارها وبالنسبة لبعضهما.",
        en: "Why is an electromagnetic wave transverse? Describe how the electric and magnetic fields are oriented relative to propagation and to each other.",
      },
      guide: {
        ar: "درجة لأن اهتزاز كل مجال عمودي على اتجاه الانتشار. درجة لأن المجالين الكهربائي والمغناطيسي متعامدان.",
        en: "One mark for both fields being perpendicular to propagation. One for the fields being perpendicular to each other.",
      },
      practice: {
        question: { ar: "موجة كهرومغناطيسية مستوية تنتشر على محور x ومجالها الكهربائي يهتز على محور y. على أي محور يهتز المجال المغناطيسي؟", en: "A plane electromagnetic wave travels along the x-axis and its electric field oscillates along the y-axis. Along which axis does its magnetic field oscillate?" },
        choices: ["x", "z", "y"], correctIndex: 1,
        explanation: { ar: "المجال المغناطيسي لازم يكون عمودي على x وعلى y، فمحور اهتزازه z.", en: "The magnetic field must be perpendicular to both x and y, so its oscillation axis is z." },
      },
    },
    {
      id: "ch4-antenna",
      title: { ar: "طول الهوائي", en: "Antenna length" },
      question: {
        ar: "هوائي نصف موجة مصمم لإشارة راديوية طولها الموجي 4 m. احسب الطول الكلي للهوائي في النموذج المثالي.",
        en: "An ideal half-wave antenna is designed for a radio signal with a 4 m wavelength. Find the total antenna length.",
      },
      guide: {
        ar: "درجة لاختيار العلاقة L = λ/2. درجة للناتج 2 m.",
        en: "One mark for L = λ/2. One for 2 m.",
      },
      practice: {
        question: { ar: "إذا كان طول الموجة 6 m، شكد طول الهوائي المثالي إذا كان من نوع ربع الموجة؟", en: "For a 6 m wavelength, how long is an ideal quarter-wave antenna?" },
        choices: ["1.5 m", "3 m", "6 m"], correctIndex: 0,
        explanation: { ar: "هوائي ربع الموجة طوله λ/4. هنا نقسم 6 على 4 فيطلع 1.5 m.", en: "The antenna is a quarter wavelength long. Divide 6 by 4 to obtain 1.5 m." },
      },
    },
    {
      id: "ch4-modulation",
      title: { ar: "التضمين AM وFM", en: "AM and FM modulation" },
      question: {
        ar: "في تضمين السعة (AM)، أي خاصية في الموجة الحاملة تتغيّر لتتبع إشارة المعلومات؟",
        en: "In amplitude modulation (AM), which property of the carrier changes to follow the information signal?",
      },
      guide: {
        ar: "المطلوب تحديد سعة الموجة الحاملة. تتغيّر سعتها بما يتوافق مع الإشارة المراد إرسالها.",
        en: "Identify the carrier amplitude. It varies in response to the information signal.",
      },
      practice: {
        question: { ar: "عند استخدام تضمين التردد (FM)، أي خاصية من خصائص الحاملة تتغيّر مع إشارة المعلومات؟", en: "In frequency modulation (FM), which carrier property varies with the information signal?" },
        choices: { ar: ["السعة", "التردد اللحظي", "سرعة الانتشار في الفراغ"], en: ["Amplitude", "Instantaneous frequency", "Propagation speed in vacuum"] },
        correctIndex: 1,
        explanation: { ar: "في FM يتغيّر التردد اللحظي للحاملة حول ترددها المركزي حسب إشارة المعلومات.", en: "In FM the carrier’s instantaneous frequency shifts around its center frequency with the information signal." },
      },
    },
    {
      id: "ch4-radio-tuning",
      title: { ar: "ضبط دائرة الاستقبال", en: "Tuning a radio receiver" },
      question: {
        ar: "صارت السعة في دائرة ضبط LC أربعة أمثال قيمتها الأصلية وبقي الحث ثابتاً. كيف يتغيّر تردد الرنين؟",
        en: "A student increases the capacitance in an LC tuning circuit to four times its original value at fixed inductance. What happens to the resonant frequency?",
      },
      guide: {
        ar: "درجة لكتابة f = 1/(2π√(LC)). درجة لاستنتاج أن التردد يصير نصف قيمته لأن √4 = 2.",
        en: "One mark for f = 1/(2π√(LC)). One for halving the frequency because √4 = 2.",
      },
      practice: {
        question: { ar: "إذا صار حث ملف دائرة الضبط تسعة أمثال قيمته وبقيت السعة ثابتة، شكد يصير تردد الرنين مقارنة بالأصلي؟", en: "Inductance becomes nine times its original value and capacitance is fixed. What is the new tuning frequency relative to the original?" },
        choices: { ar: ["تسعة أمثاله", "تُسع قيمته", "ثلث قيمته"], en: ["Nine times as high", "One ninth as high", "One third as high"] },
        correctIndex: 2,
        explanation: { ar: "الحث تحت الجذر بالمقام. إذا صار 9L، المقام يصير ثلاثة أمثاله والتردد يصير ثلثه.", en: "Inductance is under a square root in the denominator. Replacing L by 9L triples the denominator and reduces the frequency to one third." },
      },
    },
  ],
  5: [
    {
      id: "ch5-young-fringes",
      title: { ar: "المسافة بين أهداب يونك", en: "Young’s fringe spacing" },
      question: {
        ar: "بتجربة شقي يونك، المسافة بين الشقين 0.50 mm، والشاشة تبعد 2.0 m، والطول الموجي 600 nm. احسب المسافة بين هدبين مضيئين متجاورين قرب مركز الشاشة.",
        en: "In Young’s experiment, the slits are 0.50 mm apart, the screen is 2.0 m away, and wavelength is 600 nm. Find the spacing between adjacent bright fringes near the center.",
      },
      guide: {
        ar: "درجة لتحويل d وλ إلى المتر. درجة لتطبيق Δy = λD/d وإيجاد 2.4 mm.",
        en: "One mark for converting d and λ to meters. One for Δy = λD/d and 2.4 mm.",
      },
      practice: {
        question: { ar: "إذا كان الطول الموجي 500 nm، وبعد الشاشة 1.5 m، والمسافة بين الشقين 0.25 mm، شكد المسافة بين هدبين مضيئين متجاورين قرب المركز؟", en: "For 500 nm light, screen distance 1.5 m, and slit separation 0.25 mm, what is the spacing between adjacent bright fringes near the center?" },
        choices: ["0.30 mm", "3.0 mm", "0.75 mm"], correctIndex: 1,
        explanation: { ar: "بالتعويض بالمتر، Δy = (5 × 10⁻⁷ × 1.5)/(2.5 × 10⁻⁴) = 0.003 m، يعني 3.0 mm.", en: "Using meters, Δy = (5 × 10⁻⁷ × 1.5)/(2.5 × 10⁻⁴) = 0.003 m, or 3.0 mm." },
      },
    },
    {
      id: "ch5-path-difference",
      title: { ar: "فرق المسير ونوع التداخل", en: "Path difference and interference" },
      question: {
        ar: "في تجربة شقي يونك بشقين متماثلين وموجتين متفقتين بالطور عند الشقين، وصل الضوء إلى نقطة بفرق مسير 3λ/2. حدّد نوع التداخل عندها.",
        en: "In Young’s experiment with identical slits and waves in phase at the slits, the light reaches a point with path difference 3λ/2. Identify the type of interference there.",
      },
      guide: {
        ar: "درجة للتعرّف أن فرق المسير مضاعف فردي لنصف طول موجي. درجة لتحديد تداخل هدّام.",
        en: "One mark for recognizing an odd multiple of half a wavelength. One for identifying destructive interference.",
      },
      practice: {
        question: { ar: "إذا كان فرق المسير عند نقطة ثانية يساوي 2λ في نفس التجربة، شنو نوع التداخل؟", en: "In the same experiment, the path difference at another point is 2λ. What type of interference occurs?" },
        choices: { ar: ["هدّام", "ماكو تداخل", "بنّاء"], en: ["Destructive", "No interference", "Constructive"] },
        correctIndex: 2,
        explanation: { ar: "فرق المسير 2λ مضاعف صحيح لطول موجي كامل. الموجتان توصلان بنفس الطور ويصير تداخل بنّاء.", en: "A path difference of 2λ is a whole number of wavelengths. The waves arrive in phase and interfere constructively." },
      },
    },
    {
      id: "ch5-diffraction-grating",
      title: { ar: "محزّز الحيود", en: "Diffraction grating" },
      question: {
        ar: "يسقط ضوء طوله الموجي 500 nm عمودياً على محزّز المسافة بين شقوقه 2.0 µm. احسب جيب زاوية الهدب المضيء من الرتبة الأولى.",
        en: "Light of wavelength 500 nm is incident normally on a grating with 2.0 µm spacing. Find the sine of the angle of the first-order bright fringe.",
      },
      guide: {
        ar: "درجة لكتابة d sin θ = mλ وتوحيد وحدات d وλ. درجة لإيجاد sin θ = 0.25.",
        en: "One mark for d sin θ = mλ and consistent length units. One for sin θ = 0.25.",
      },
      practice: {
        question: { ar: "يسقط ضوء 500 nm عمودياً على محزّز مسافة شقوقه 2.5 µm. شكد sin θ للرتبة الثانية؟", en: "Light of 500 nm is incident normally on a grating with 2.5 µm spacing. What is sin θ for the second order?" },
        choices: ["0.20", "0.40", "0.80"], correctIndex: 1,
        explanation: { ar: "500 nm تساوي 0.50 µm. للرتبة الثانية، sin θ = 2 × 0.50 ÷ 2.5 = 0.40.", en: "500 nm equals 0.50 µm. In second order, sin θ = 2 × 0.50 ÷ 2.5 = 0.40." },
      },
    },
    {
      id: "ch5-single-slit",
      title: { ar: "عرض الهدب المركزي في حيود الشق المفرد", en: "Central fringe in single-slit diffraction" },
      question: {
        ar: "في حيود الشق المفرد وعند الزوايا الصغيرة، شلون يتغيّر عرض الهدب المركزي على الشاشة إذا نقص عرض الشق إلى النصف، والطول الموجي وبعد الشاشة ثابتان؟",
        en: "In single-slit diffraction at small angles, what happens to the central fringe width on the screen when the slit width halves at fixed wavelength and screen distance?",
      },
      guide: {
        ar: "درجة لبيان أن عرض الهدب المركزي يقارب 2λD/a. درجة لاستنتاج أنه يتضاعف إذا صار عرض الشق a/2.",
        en: "One mark for the approximate central width 2λD/a. One for doubling the width when the slit becomes a/2.",
      },
      practice: {
        question: { ar: "إذا صار عرض الشق ثلاثة أمثال قيمته عند الزوايا الصغيرة، شكد يصير عرض الهدب المركزي مع ثبات بقية المعطيات؟", en: "At small angles, what happens to the central fringe width if the slit becomes three times as wide with all else fixed?" },
        choices: { ar: ["ثلث قيمته", "ثلاثة أمثاله", "نفس قيمته"], en: ["One third as wide", "Three times as wide", "The same width"] },
        correctIndex: 0,
        explanation: { ar: "عرض الشق بالمقام في العلاقة التقريبية 2λD/a. من يزيد a للثلاثة، العرض يصير ثلثه.", en: "Slit width is in the denominator of 2λD/a. Tripling a reduces the fringe width to one third." },
      },
    },
    {
      id: "ch5-brewster",
      title: { ar: "زاوية بروستر", en: "Brewster’s angle" },
      question: {
        ar: "يسقط الضوء من الهواء على وسط شفاف ويصير الشعاع المنعكس مستقطباً كلياً عند زاوية سقوط θ. إذا كان tan θ = 1.50، احسب معامل انكسار الوسط بالنسبة للهواء.",
        en: "Light is incident from air onto a transparent medium. At incidence angle θ the reflected ray is completely polarized. Given tan θ = 1.50, find the medium’s refractive index relative to air.",
      },
      guide: {
        ar: "درجة لتحديد أن θ زاوية بروستر. درجة لتطبيق n = tan θ وإيجاد 1.50.",
        en: "One mark for identifying θ as Brewster’s angle. One for using n = tan θ to get 1.50.",
      },
      practice: {
        question: { ar: "عند السقوط بزاوية بروستر، شكد تكون الزاوية بين الشعاع المنعكس والمنكسر؟", en: "At Brewster’s angle, what is the angle between the reflected and refracted rays?" },
        choices: ["45°", "180°", "90°"], correctIndex: 2,
        explanation: { ar: "عند زاوية بروستر، الشعاع المنعكس والمنكسر متعامدان. الزاوية بينهما 90°.", en: "At Brewster’s angle the reflected and refracted rays are perpendicular. Their angle is 90°." },
      },
    },
  ],
  6: [
    {
      id: "ch6-photon-energy",
      title: { ar: "طاقة الفوتون", en: "Photon energy" },
      question: {
        ar: "فوتون تردده 5 × 10¹⁴ Hz. احسب طاقته باستعمال ثابت بلانك h = 6.6 × 10⁻³⁴ J·s.",
        en: "A photon has frequency 5 × 10¹⁴ Hz. Find its energy using Planck’s constant h = 6.6 × 10⁻³⁴ J·s.",
      },
      guide: {
        ar: "درجة لاختيار E = hf. درجة للتعويض وإيجاد 3.3 × 10⁻¹⁹ J.",
        en: "One mark for E = hf. One for substituting to obtain 3.3 × 10⁻¹⁹ J.",
      },
      practice: {
        question: { ar: "شكد طاقة فوتون تردده 6 × 10¹⁴ Hz إذا استعملنا h = 6.6 × 10⁻³⁴ J·s؟", en: "What is the energy of a 6 × 10¹⁴ Hz photon? Use h = 6.6 × 10⁻³⁴ J·s." },
        choices: ["3.96 × 10⁻¹⁹ J", "3.96 × 10⁻²⁰ J", "1.10 × 10⁻⁴⁸ J"], correctIndex: 0,
        explanation: { ar: "نضرب h في f. الناتج 39.6 × 10⁻²⁰ J، ونكتبه بالصيغة العلمية 3.96 × 10⁻¹⁹ J.", en: "Multiply h by f to get 39.6 × 10⁻²⁰ J, or 3.96 × 10⁻¹⁹ J in scientific notation." },
      },
    },
    {
      id: "ch6-photoelectric",
      title: { ar: "أقصى طاقة حركية للإلكترون", en: "Maximum photoelectron energy" },
      question: {
        ar: "سقط فوتون طاقته 5.0 eV على سطح فلز دالة شغله 2.2 eV. احسب أقصى طاقة حركية للإلكترون المنبعث.",
        en: "A photon of energy 5.0 eV hits a metal with work function 2.2 eV. Find the maximum kinetic energy of an emitted electron.",
      },
      guide: {
        ar: "درجة لكتابة K_max = E − φ. درجة لإيجاد 2.8 eV.",
        en: "One mark for K_max = E − φ. One for 2.8 eV.",
      },
      practice: {
        question: { ar: "إذا كانت طاقة الفوتون 6.1 eV ودالة شغل الفلز 2.6 eV، شكد أقصى طاقة حركية؟", en: "The photon energy is 6.1 eV and the work function is 2.6 eV. What is the maximum kinetic energy?" },
        choices: ["8.7 eV", "3.5 eV", "2.6 eV"], correctIndex: 1,
        explanation: { ar: "نطرح طاقة تحرير الإلكترون من طاقة الفوتون. الباقي 6.1 − 2.6 = 3.5 eV.", en: "Subtract the energy needed to free the electron from the photon energy. The remainder is 6.1 − 2.6 = 3.5 eV." },
      },
    },
    {
      id: "ch6-stopping-voltage",
      title: { ar: "جهد الإيقاف", en: "Stopping potential" },
      question: {
        ar: "أقصى طاقة حركية لإلكترون منبعث كهروضوئياً هي 1.8 eV. احسب مقدار جهد الإيقاف.",
        en: "A photoelectron has a maximum kinetic energy of 1.8 eV. Find the magnitude of the stopping potential.",
      },
      guide: {
        ar: "درجة لكتابة K_max = e|Vₛ| حيث e مقدار شحنة الإلكترون. درجة لاستخدام وحدة eV مباشرة وإيجاد 1.8 V.",
        en: "One mark for K_max = e|Vₛ|, where e is the magnitude of the electron charge. One for using the eV unit to get 1.8 V.",
      },
      practice: {
        question: { ar: "إذا كانت أقصى طاقة حركية 3.2 eV، شكد مقدار جهد الإيقاف؟", en: "If the maximum kinetic energy is 3.2 eV, what is the magnitude of the stopping potential?" },
        choices: ["0.32 V", "5.12 V", "3.2 V"], correctIndex: 2,
        explanation: { ar: "كل إلكترون فولت هو طاقة شحنة إلكترون عبر فولت واحد. نحتاج مقدار جهد 3.2 V حتى نوقف أسرع إلكترون.", en: "An electronvolt is the energy for an electron charge across one volt. Stopping the fastest electron requires a potential magnitude of 3.2 V." },
      },
    },
    {
      id: "ch6-de-broglie",
      title: { ar: "الطول الموجي لدي برولي", en: "de Broglie wavelength" },
      question: {
        ar: "صار مقدار زخم جسيم ثلاثة أمثال قيمته الأصلية. شلون يتغيّر طول موجة دي برولي المصاحبة له؟",
        en: "A particle’s momentum magnitude triples. What happens to its de Broglie wavelength?",
      },
      guide: {
        ar: "درجة لكتابة λ = h/p. درجة لاستنتاج أن الطول الموجي يصير ثلث قيمته عند 3p.",
        en: "One mark for λ = h/p. One for concluding that the wavelength is one third as long at 3p.",
      },
      practice: {
        question: { ar: "إذا نزل مقدار زخم جسيم إلى نصف قيمته، شكد يصير طول موجة دي برولي مقارنة بالأصلي؟", en: "If the particle’s momentum falls to half its original magnitude, what is its new de Broglie wavelength?" },
        choices: { ar: ["نصف الأصلي", "ضعف الأصلي", "نفس الأصلي"], en: ["Half the original", "Twice the original", "The same as before"] },
        correctIndex: 1,
        explanation: { ar: "الزخم بالمقام في λ = h/p. من يصير p/2، الطول الموجي يتضاعف.", en: "Momentum is in the denominator of λ = h/p. Replacing p with p/2 doubles the wavelength." },
      },
    },
    {
      id: "ch6-wien",
      title: { ar: "إزاحة قمة طيف الجسم الأسود", en: "Blackbody peak and Wien’s law" },
      question: {
        ar: "تضاعفت درجة حرارة جسم أسود مقاسة بالكلفن. شلون يتغيّر الطول الموجي عند قمة طيف إشعاعه بدلالة الطول الموجي؟",
        en: "A blackbody’s temperature in kelvins doubles. What happens to the peak wavelength of its wavelength spectrum?",
      },
      guide: {
        ar: "درجة لكتابة قانون فين λ_max T = ثابت. درجة لاستنتاج أن الطول الموجي لقمة الطيف يصير نصفه.",
        en: "One mark for Wien’s law λ_max T = constant. One for halving the peak wavelength.",
      },
      practice: {
        question: { ar: "إذا ارتفعت درجة حرارة جسم أسود من 1,000 K إلى 3,000 K، شكد يصير الطول الموجي لقمة الطيف مقارنة بقيمته الأولى؟", en: "A blackbody warms from 1,000 K to 3,000 K. What is the new peak wavelength relative to the original?" },
        choices: { ar: ["ثلث قيمته", "ثلاثة أمثال قيمته", "نصف قيمته"], en: ["One third", "Three times", "One half"] },
        correctIndex: 0,
        explanation: { ar: "بما أن λ_max T ثابت، رفع درجة الحرارة إلى ثلاثة أمثالها يقسّم طول الموجة عند القمة على ثلاثة.", en: "Since λ_max T is constant, tripling the absolute temperature divides the peak wavelength by three." },
      },
    },
  ],
  7: [
    {
      id: "ch7-doping",
      title: { ar: "التطعيم وحوامل الشحنة", en: "Doping and majority carriers" },
      question: {
        ar: "طُعّم السيليكون النقي بذرات فسفور خماسية التكافؤ. اذكر نوع شبه الموصل الناتج وحوامل الشحنة الأكثرية.",
        en: "Pure silicon is doped with pentavalent phosphorus atoms. State the resulting semiconductor type and its majority charge carriers.",
      },
      guide: {
        ar: "درجة للنوع n. درجة لتحديد الإلكترونات حوامل أكثرية لأن الفسفور يمنح إلكتروناً إضافياً قابلاً للتوصيل.",
        en: "One mark for n-type. One for electrons as majority carriers because phosphorus donates an additional electron that can conduct.",
      },
      practice: {
        question: { ar: "إذا طعّمنا السيليكون بالبورون ثلاثي التكافؤ، أي نوع ينتج ومنو حوامل الأكثرية؟", en: "When silicon is doped with trivalent boron, what type results and what are its majority carriers?" },
        choices: { ar: ["النوع n والإلكترونات", "النوع p والفجوات", "النوع p والإلكترونات"], en: ["n-type and electrons", "p-type and holes", "p-type and electrons"] },
        correctIndex: 1,
        explanation: { ar: "البورون يعمل كمستقبِل. ينتج نوع p وتصير الفجوات هي الحوامل الأكثرية.", en: "Boron acts as an acceptor. The silicon becomes p-type, with holes as the majority carriers." },
      },
    },
    {
      id: "ch7-band-gap",
      title: { ar: "حزم الطاقة في شبه الموصل", en: "Semiconductor energy bands" },
      question: {
        ar: "في شبه موصل نقي، شنو المقصود بفجوة الطاقة المحرّمة؟ سمِّ الحزمتين اللي تقع بينهن.",
        en: "In an intrinsic semiconductor, what is the forbidden energy gap? Name the two bands on either side.",
      },
      guide: {
        ar: "درجة لأنها مدى طاقات لا توجد فيه حالات إلكترونية مسموحة في البلورة النقية. درجة لأنها بين حزمة التكافؤ وحزمة التوصيل.",
        en: "One mark for the range of energies with no allowed electronic states in the ideal pure crystal. One for naming the valence and conduction bands.",
      },
      practice: {
        question: { ar: "إذا اكتسب إلكترون في حزمة التكافؤ طاقة حرارية كافية لعبور فجوة الطاقة، إلى أي حزمة ينتقل؟", en: "A valence-band electron gains enough thermal energy to cross the gap. Which band does it enter?" },
        choices: { ar: ["حزمة التوصيل", "يبقى في حزمة التكافؤ", "يبقى داخل فجوة الطاقة"], en: ["The conduction band", "It stays in the valence band", "It stays in the gap"] },
        correctIndex: 0,
        explanation: { ar: "الإلكترون يصعد لحزمة التوصيل ويترك مكانه فجوة في حزمة التكافؤ.", en: "It moves to the conduction band and leaves a hole behind in the valence band." },
      },
    },
    {
      id: "ch7-diode-bias",
      title: { ar: "انحياز الوصلة الثنائية", en: "Diode bias" },
      question: {
        ar: "حتى تنحاز الوصلة PN أمامياً، بأي منطقة توصل قطب البطارية الموجب وبأي منطقة توصل السالب؟",
        en: "To forward-bias a PN junction, which region do you connect to the battery’s positive terminal and which to its negative terminal?",
      },
      guide: {
        ar: "درجة للموجب مع منطقة p. درجة للسالب مع منطقة n.",
        en: "One mark for connecting positive to p. One for connecting negative to n.",
      },
      practice: {
        question: { ar: "وصلنا الموجب بمنطقة n والسالب بمنطقة p. شنو نوع الانحياز وشنو يصير لعرض منطقة الاستنزاف؟", en: "Positive is connected to n and negative to p. What is the bias, and what happens to the depletion region’s width?" },
        choices: { ar: ["أمامي وتتسع", "عكسي وتضيق", "عكسي وتتسع"], en: ["Forward bias and it widens", "Reverse bias and it narrows", "Reverse bias and it widens"] },
        correctIndex: 2,
        explanation: { ar: "هذا انحياز عكسي. قطبا المصدر يسحبان حوامل الشحنة الأكثرية بعيداً عن الوصلة فتتسع منطقة الاستنزاف.", en: "This is reverse bias. The applied voltage draws majority carriers away from the junction, widening the depletion region." },
      },
    },
    {
      id: "ch7-transistor-currents",
      title: { ar: "تيارات الترانزستور", en: "Transistor currents" },
      question: {
        ar: "في ترانزستور ثنائي القطبية، مقدار تيار المجمع 2.95 mA ومقدار تيار القاعدة 50 µA. احسب مقدار تيار الباعث.",
        en: "In a bipolar transistor, the collector current magnitude is 2.95 mA and the base current magnitude is 50 µA. Find the emitter current magnitude.",
      },
      guide: {
        ar: "درجة لتوحيد الوحدات بتحويل 50 µA إلى 0.050 mA. درجة لاستخدام I_E = I_C + I_B وإيجاد 3.00 mA.",
        en: "One mark for converting 50 µA to 0.050 mA. One for using I_E = I_C + I_B to get 3.00 mA.",
      },
      practice: {
        question: { ar: "مقدار تيار المجمع 4.90 mA ومقدار تيار القاعدة 100 µA. شكد مقدار تيار الباعث؟", en: "Collector and base current magnitudes are 4.90 mA and 100 µA. What is the emitter current magnitude?" },
        choices: ["4.80 mA", "104.90 mA", "5.00 mA"], correctIndex: 2,
        explanation: { ar: "100 µA تساوي 0.10 mA. نجمع تيار المجمع والقاعدة فنحصل على 5.00 mA.", en: "100 µA equals 0.10 mA. Adding the collector and base currents gives 5.00 mA." },
      },
    },
    {
      id: "ch7-current-gain",
      title: { ar: "كسب التيار في الباعث المشترك", en: "Common-emitter current gain" },
      question: {
        ar: "ترانزستور في المنطقة الفعّالة يمر فيه تيار مجمع 4.0 mA وتيار قاعدة 40 µA. احسب معامل كسب التيار المستمر β.",
        en: "An active-region transistor has collector current 4.0 mA and base current 40 µA. Find the DC current gain β.",
      },
      guide: {
        ar: "درجة لتحويل 40 µA إلى 0.040 mA. درجة لاستخدام β = I_C/I_B وإيجاد 100 بلا وحدة.",
        en: "One mark for converting 40 µA to 0.040 mA. One for β = I_C/I_B and a dimensionless gain of 100.",
      },
      practice: {
        question: { ar: "في المنطقة الفعّالة، إذا كان تيار المجمع 6.0 mA وتيار القاعدة 50 µA، شكد قيمة β؟", en: "In the active region, what is β when the collector current is 6.0 mA and the base current is 50 µA?" },
        choices: ["0.12", "120", "300"], correctIndex: 1,
        explanation: { ar: "نوحّد الوحدات ونقسم تيار المجمع على تيار القاعدة. β = 6.0 ÷ 0.050 = 120.", en: "Use consistent units and divide collector current by base current. β = 6.0 ÷ 0.050 = 120." },
      },
    },
  ],
  8: [
    {
      id: "ch8-emission-energy",
      title: { ar: "طاقة فوتون الانبعاث", en: "Emission photon energy" },
      question: {
        ar: "انتقل إلكترون في ذرة الهيدروجين من مستوى طاقته سالب 1.51 إلكترون فولت إلى مستوى طاقته سالب 3.40 إلكترون فولت. احسب طاقة الفوتون المنبعث.",
        en: "A hydrogen electron drops from an energy level at −1.51 eV to one at −3.40 eV. Find the energy of the emitted photon.",
      },
      guide: {
        ar: "درجة لكتابة طاقة الفوتون = طاقة المستوى الابتدائي − طاقة المستوى النهائي. درجة لحساب 1.89 eV.",
        en: "One mark for photon energy = initial level energy − final level energy. One for 1.89 eV.",
      },
      practice: {
        question: { ar: "إلكترون هبط من مستوى طاقته سالب 0.85 إلكترون فولت إلى مستوى طاقته سالب 3.40 إلكترون فولت. شكد طاقة الفوتون المنبعث؟", en: "An electron drops from −0.85 eV to −3.40 eV. What is the emitted photon energy?" },
        choices: ["−2.55 eV", "4.25 eV", "2.55 eV"], correctIndex: 2,
        explanation: { ar: "الفوتون يحمل الطاقة اللي فقدها الإلكترون. نطرح سالب 3.40 من سالب 0.85 فيصير الفرق 2.55 إلكترون فولت.", en: "The photon carries the energy lost by the electron. Subtract the final energy from the initial energy: −0.85 − (−3.40) = 2.55 eV." },
      },
    },
    {
      id: "ch8-hydrogen-series",
      title: { ar: "متسلسلات طيف الهيدروجين", en: "Hydrogen spectral series" },
      question: {
        ar: "انتقل إلكترون الهيدروجين من المستوى n = 4 إلى المستوى n = 1. لأي متسلسلة طيفية ينتمي خط الانبعاث الناتج؟ وضّح السبب.",
        en: "A hydrogen electron transitions from n = 4 to n = 1. Which spectral series contains the emitted line? Explain why.",
      },
      guide: {
        ar: "درجة لتحديد متسلسلة لايمان. درجة لأن المستوى النهائي هو n = 1.",
        en: "One mark for the Lyman series. One for identifying n = 1 as the final level.",
      },
      practice: {
        question: { ar: "الانتقال من n = 5 إلى n = 2 بذرّة الهيدروجين ينطي خط من أي متسلسلة؟", en: "Which hydrogen series contains the line from a transition from n = 5 to n = 2?" },
        choices: { ar: ["بالمر", "لايمان", "باشن"], en: ["Balmer", "Lyman", "Paschen"] },
        correctIndex: 0,
        explanation: { ar: "نحدّد المتسلسلة من المستوى اللي انتهى عنده الإلكترون. كل انتقال انبعاث إلى n = 2 ينتمي لمتسلسلة بالمر.", en: "The final level determines the series. Every emission transition ending at n = 2 is in the Balmer series." },
      },
    },
    {
      id: "ch8-ionization",
      title: { ar: "طاقة التأيّن", en: "Ionization energy" },
      question: {
        ar: "إلكترون الهيدروجين موجود في مستوى طاقته سالب 3.40 إلكترون فولت. احسب أقل طاقة لازمة لتأيين الذرّة من هذا المستوى، إذا كان حد التأيّن عند صفر إلكترون فولت.",
        en: "A hydrogen electron is in a level at −3.40 eV. What is the minimum energy needed to ionize it from this level if the ionization limit is 0 eV?",
      },
      guide: {
        ar: "درجة لتحديد حد التأيّن عند صفر إلكترون فولت. درجة لطرح سالب 3.40 من الصفر والحصول على 3.40 إلكترون فولت.",
        en: "One mark for recognizing the free-electron threshold at 0 eV. One for 0 − (−3.40) = 3.40 eV.",
      },
      practice: {
        question: { ar: "إذا كانت طاقة المستوى الأرضي للهيدروجين سالب 13.6 إلكترون فولت، شكد أقل طاقة لازم نطيها حتى نأيّن الذرّة من هذا المستوى؟", en: "The hydrogen ground state is at −13.6 eV. How much energy is needed to ionize it from that state?" },
        choices: ["3.4 eV", "13.6 eV", "−13.6 eV"], correctIndex: 1,
        explanation: { ar: "حتى يطلع الإلكترون من الذرّة لازم يوصل من سالب 13.6 إلكترون فولت إلى حد التأيّن عند الصفر. يحتاج يمتص 13.6 إلكترون فولت.", en: "To leave the atom the electron must reach 0 eV from −13.6 eV. It must absorb 13.6 eV." },
      },
    },
    {
      id: "ch8-stimulated-emission",
      title: { ar: "الانبعاث المستحث", en: "Stimulated emission" },
      question: {
        ar: "تفاعل فوتون طاقته توافق فرق مستويين مع ذرّة مثارة، وحفّزها للهبوط وانبعاث فوتون. شنو اسم العملية وشلون يقارن تردد الفوتونين؟",
        en: "A photon matching the energy gap interacts with an excited atom and stimulates it to drop and emit a photon. Name the process and compare the two photon frequencies.",
      },
      guide: {
        ar: "درجة للانبعاث المستحث. درجة لأن الفوتون المنبعث له نفس تردد الفوتون المحفِّز.",
        en: "One mark for stimulated emission. One for the emitted photon having the same frequency as the stimulating photon.",
      },
      practice: {
        question: { ar: "بالانبعاث المستحث في نمط الليزر، شنو العلاقة بين الفوتون المنبعث والفوتون المحفِّز؟", en: "In stimulated emission into the laser mode, how does the emitted photon compare with the stimulating photon?" },
        choices: {
          ar: ["تردد مختلف واتجاه عشوائي", "نفس التردد وطور عشوائي", "نفس التردد والطور والاتجاه"],
          en: ["Different frequency and random direction", "Same frequency but random phase", "Same frequency, phase, and direction"],
        },
        correctIndex: 2,
        explanation: { ar: "الانبعاث المستحث يضيف ضوءاً متوافقاً ويّا الضوء المحفِّز في التردد والطور والاتجاه.", en: "Stimulated emission adds light that matches the stimulating light in frequency, phase, and direction." },
      },
    },
    {
      id: "ch8-population-inversion",
      title: { ar: "الضخ والانقلاب السكاني", en: "Pumping and population inversion" },
      question: {
        ar: "شنو دور الضخ في الوسط الفعّال لليزر؟ اشرح شلون يرتبط بانقلاب الإشغال بين مستويي الانتقال.",
        en: "What does pumping do in a laser’s active medium? Explain its role in creating an inversion between the two laser transition levels.",
      },
      guide: {
        ar: "درجة لتزويد الوسط الفعّال بالطاقة ورفع ذرات إلى مستويات أعلى. درجة لأن الضخ يمكن أن يجعل عدد الذرات بالمستوى العلوي للانتقال أكبر من السفلي.",
        en: "One mark for supplying energy to promote atoms to higher levels. One for raising the upper laser level’s population above the lower level’s population.",
      },
      practice: {
        question: { ar: "من نقارن عدد الذرات بمستويي انتقال الليزر، أي حالة تبيّن حصول انقلاب سكاني؟", en: "When comparing the populations of the two laser transition levels, which condition indicates a population inversion?" },
        choices: {
          ar: ["عدد الذرات بالعلوي أكبر", "عدد الذرات بالسفلي أكبر", "العددان متساويان"],
          en: ["More atoms in the upper level", "More atoms in the lower level", "Equal populations"],
        },
        correctIndex: 0,
        explanation: { ar: "الضخ يگدر يخلّي إشغال المستوى العلوي أكبر من السفلي، وهي حالة الانقلاب السكاني.", en: "Pumping can make the upper laser level more populated than the lower one. That is population inversion." },
      },
    },
  ],
};

function practiceForLanguage(practice: Preset["practice"], language: "ar" | "en"): PaperPractice {
  return {
    question: practice.question[language],
    choices: Array.isArray(practice.choices) ? practice.choices : practice.choices[language],
    correctIndex: practice.correctIndex,
    explanation: practice.explanation[language],
  };
}

export const PAPER_EXERCISES: readonly PaperExercise[] = Object.entries(chapterPresets).flatMap(([chapter, exercises]) =>
  exercises.map(({ practice, ...exercise }) => ({
    ...exercise,
    chapter: Number(chapter),
    practice: { ar: practiceForLanguage(practice, "ar"), en: practiceForLanguage(practice, "en") },
  })),
);

export const paperExercise = (value: unknown) => PAPER_EXERCISES.find(exercise => exercise.id === value);
