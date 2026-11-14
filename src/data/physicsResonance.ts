import type { PhysicsSchemeLesson } from "./physicsSchemes";

export const RESONANCE_LESSON: PhysicsSchemeLesson = {
  "id": "electrical-resonance",
  "chapter": 3,
  "title": {
    "ar": "الرنين الكهربائي وعامل النوعية",
    "en": "Electrical Resonance & Quality Factor"
  },
  "description": {
    "ar": "١٣ توضيحاً متحركاً قصيراً، وتحت كل واحد نص الملزمة وشرح ومفتاح للحفظ.",
    "en": "13 short silent visual explanations, with booklet text, equations, and recall prompts."
  },
  "parts": [
    {
      "id": "tuning",
      "title": {
        "ar": "ليش الراديو يختار محطة وحدة؟",
        "en": "Tuning a radio station"
      },
      "text": {
        "ar": "تخيّل كل محطة إلها تردد. نضبط دائرة الاستقبال على نفس تردد المحطة المطلوبة؛ بهالحالة يصير الرنين وتكون استجابة التيار أكبر. التوضيح يعرض دائرة R–L–C متوالية عند ثبات جهد المصدر.",
        "en": "Tune the receiver to the signal frequency."
      },
      "image": "/physics-schemes/resonance/tuning.svg",
      "imageAlt": {
        "ar": "ليش الراديو يختار محطة وحدة؟",
        "en": "Tuning a radio station"
      },
      "video": {
        "src": "/physics-schemes/resonance/tuning.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          41,
          42
        ],
        "text": "How can resonance be achieved in an electromagnetic vibration circuit?\nResonance can be achieved in electromagnetic oscillations circuit if this circuit is tuned with the frequency of desired signal (i.e reception circuit frequency equals frequency of desired signal). This is the case with tuning Tv or radio stations, by changing capacitor capacitance in the oscillated circuit.",
        "language": "en"
      },
      "formulas": [
        "f = fᵣ"
      ],
      "memory": {
        "ar": "نفس التردد ← أقوى استجابة.",
        "en": "Same frequency → strongest response."
      },
      "recall": {
        "question": {
          "ar": "شنو لازم يتساوى حتى نحصل على الرنين؟",
          "en": "What two frequencies must match?"
        },
        "answer": {
          "ar": "تردد الإشارة وتردد الرنين للدائرة.",
          "en": "The signal frequency and the circuit resonant frequency."
        }
      },
      "group": {
        "ar": "فكرة الرنين",
        "en": "Understanding resonance"
      }
    },
    {
      "id": "reactances",
      "title": {
        "ar": "شرط الرنين: تعادل المفاعلتين",
        "en": "Equal reactances"
      },
      "text": {
        "ar": "بزيادة التردد، مفاعلة الملف Xₗ تزيد ومفاعلة المتسعة X꜀ تقل. عند نقطة تقاطع المنحنيين يصير Xₗ = X꜀. المفاعلتان تتساويان بالمقدار؛ مو معناها كل واحدة تساوي صفراً.",
        "en": "Inductive reactance increases with frequency; capacitive reactance decreases. Their equality is the resonance condition."
      },
      "image": "/physics-schemes/resonance/reactances.svg",
      "imageAlt": {
        "ar": "شرط الرنين: تعادل المفاعلتين",
        "en": "Equal reactances"
      },
      "video": {
        "src": "/physics-schemes/resonance/reactances.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          42
        ],
        "text": "What is the condition of electrical resonance?\nInductive reactance (Xₗ = ωL) is equal to capacitive reactance (X꜀ = 1/ωC).",
        "language": "en"
      },
      "formulas": [
        "Xₗ = ωL",
        "X꜀ = 1 / (ωC)",
        "At resonance: Xₗ = X꜀"
      ],
      "memory": {
        "ar": "واحدة تصعد، الثانية تنزل؛ التقاطع هو الرنين.",
        "en": "One rises, one falls; the crossing is resonance."
      },
      "recall": {
        "question": {
          "ar": "بالرنين، هل مفاعلة الملف تساوي صفراً؟",
          "en": "Must the inductor reactance be zero at resonance?"
        },
        "answer": {
          "ar": "لا. تساوي مفاعلة المتسعة بالمقدار، فيتلاشى الفرق بينهما.",
          "en": "No. Xₗ equals X꜀; their difference is zero."
        }
      },
      "group": {
        "ar": "فكرة الرنين",
        "en": "Understanding resonance"
      }
    },
    {
      "id": "impedance",
      "title": {
        "ar": "أقل ممانعة، أكبر تيار",
        "en": "Minimum impedance, maximum current"
      },
      "text": {
        "ar": "الممانعة تجمع تأثير المقاومة وفرق المفاعلتين. من يصير الفرق صفراً تبقى المقاومة فقط: Z = R. ولأن جهد المصدر ثابت، أصغر ممانعة تعني أكبر تيار. المقاومة الحقيقية تبقى موجودة؛ التيار مو لا نهائي.",
        "en": "At this point, the circuit’s inductive reactance becomes Xₗ = ωL equal to the capacitive reactance X꜀ = 1/ωC, which makes the impedance of the circuit the minimum value Z = R, this case is called electrical resonance."
      },
      "image": "/physics-schemes/resonance/impedance.svg",
      "imageAlt": {
        "ar": "أقل ممانعة، أكبر تيار",
        "en": "Minimum impedance, maximum current"
      },
      "video": {
        "src": "/physics-schemes/resonance/impedance.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          42
        ],
        "text": "At this point, the circuit’s inductive reactance becomes Xₗ = ωL equal to the capacitive reactance X꜀ = 1/ωC, which makes the impedance of the circuit the minimum value Z = R, this case is called electrical resonance.",
        "language": "en"
      },
      "formulas": [
        "Z = √[R² + (Xₗ − X꜀)²]",
        "Xₗ − X꜀ = 0 → Z = R",
        "Iᵣₘₛ,max = Vᵣₘₛ / R"
      ],
      "memory": {
        "ar": "تلاشي الفرق ← Z أصغر ← I أكبر.",
        "en": "Reactances cancel → Z is smallest → I is largest."
      },
      "recall": {
        "question": {
          "ar": "ليش التيار يبقى محدوداً عند الرنين؟",
          "en": "Why is the resonant current finite?"
        },
        "answer": {
          "ar": "لأن المقاومة R تبقى موجودة وليست صفراً.",
          "en": "The resistance R remains nonzero."
        }
      },
      "group": {
        "ar": "فكرة الرنين",
        "en": "Understanding resonance"
      }
    },
    {
      "id": "phasors",
      "title": {
        "ar": "فولتيتان كبيرتان… والمحصلّة أصغر",
        "en": "Voltage phasors cancel"
      },
      "text": {
        "ar": "فولتية الملف وفولتية المتسعة متعاكستان بالطور بمقدار ١٨٠°. عند الرنين يتساويان بالمقدار فتكون محصلتهما صفراً، ويبقى جهد المصدر مساوياً لجهد المقاومة. ممكن كل واحدة من Vₗ أو V꜀ تتجاوز جهد المصدر؛ نجمع الفولتيات اتجاهياً، مو جمعاً عددياً.",
        "en": "Because voltages is a directional sum not an algebraic sum due to the presence of the phase difference angle between the voltages across the inductor and the voltages across the capacitance and their amount (180°)."
      },
      "image": "/physics-schemes/resonance/phasors.svg",
      "imageAlt": {
        "ar": "فولتيتان كبيرتان… والمحصلّة أصغر",
        "en": "Voltage phasors cancel"
      },
      "video": {
        "src": "/physics-schemes/resonance/phasors.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          44
        ],
        "text": "The voltage across one of the two reactance in a series-connected AC circuit may be greater than the total voltage, why?\nBecause voltages is a directional sum not an algebraic sum due to the presence of the phase difference angle between the voltages across the inductor and the voltages across the capacitance and their amount (180°).",
        "language": "en"
      },
      "formulas": [
        "Vₗ = V꜀",
        "V = √[Vᵣ² + (Vₗ − V꜀)²]",
        "At resonance: V = Vᵣ"
      ],
      "memory": {
        "ar": "سهمان متساويان ومتعاكسان ← المحصلة صفر.",
        "en": "Equal and opposite voltage arrows cancel."
      },
      "recall": {
        "question": {
          "ar": "إذا كان Vₗ كبيراً، لازم جهد المصدر يكون أكبر منه؟",
          "en": "Must the source voltage exceed each reactive voltage?"
        },
        "answer": {
          "ar": "مو بالضرورة؛ فولتية المتسعة تعاكسه، والجمع اتجاهي.",
          "en": "No. Reactive voltages oppose each other; voltages add as phasors."
        }
      },
      "group": {
        "ar": "فكرة الرنين",
        "en": "Understanding resonance"
      }
    },
    {
      "id": "phase",
      "title": {
        "ar": "نفس الطور وأكبر قدرة متوسطة",
        "en": "Phase and average power"
      },
      "text": {
        "ar": "بالرنين، التيار وجهد المصدر بنفس الطور: φ = 0 وعامل القدرة cosφ = 1. عند ثبات جهد المصدر والمقاومة تكون القدرة المتوسطة أكبر ما يمكن. مو صحيح عامل القدرة يتجاوز الواحد.",
        "en": "When the angular frequency of the circuit is equal to the resonance frequency, i.e. ω = ωᵣ, then the average power Pₐᵥ is at its maximum value.\nWhen the total impedance is at its smallest value and the current is at its largest value, the power factor is equal to one."
      },
      "image": "/physics-schemes/resonance/phase.svg",
      "imageAlt": {
        "ar": "نفس الطور وأكبر قدرة متوسطة",
        "en": "Phase and average power"
      },
      "video": {
        "src": "/physics-schemes/resonance/phase.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          37,
          44
        ],
        "text": "When is the resonance state achieved in a series AC circuit containing (R-L-C)?\nWhen the angular frequency of the circuit is equal to the resonance frequency, i.e. ω = ωᵣ, then the average power Pₐᵥ is at its maximum value.\nWhen the total impedance is at its smallest value and the current is at its largest value, the power factor is equal to one.",
        "language": "en"
      },
      "formulas": [
        "φ = 0 → cosφ = 1",
        "Pₐᵥ = Vᵣₘₛ Iᵣₘₛ cosφ",
        "At resonance: Pₐᵥ,max = Vᵣₘₛ² / R"
      ],
      "memory": {
        "ar": "طور صفر، عامل قدرة واحد.",
        "en": "Zero phase angle; power factor equals one."
      },
      "recall": {
        "question": {
          "ar": "شكد عامل القدرة عند الرنين؟",
          "en": "What is the power factor at resonance?"
        },
        "answer": {
          "ar": "يساوي ١؛ التيار وجهد المصدر بنفس الطور.",
          "en": "One: current and source voltage are in phase."
        }
      },
      "group": {
        "ar": "فكرة الرنين",
        "en": "Understanding resonance"
      }
    },
    {
      "id": "frequency",
      "title": {
        "ar": "اشتقاق قانون تردد الرنين خطوة خطوة",
        "en": "Deriving resonant frequency"
      },
      "text": {
        "ar": "ابدأ من شرط الرنين، مو من الحفظ وحده. عوّض مفاعلة الملف والمتسعة، واضرب بـωᵣC، بعدها خذ الجذر الموجب. انتبه للفرق: ω بالراديان/ثانية، وf بالهرتز؛ بينهما العامل 2π.",
        "en": "Xₗ = X꜀ → ωᵣL = 1/(ωᵣC) → ωᵣ²LC = 1 → ωᵣ = 1/√(LC).\nDerive the resonant frequency law.\nfᵣ = 1/[2π√(LC)]."
      },
      "image": "/physics-schemes/resonance/frequency.svg",
      "imageAlt": {
        "ar": "اشتقاق قانون تردد الرنين خطوة خطوة",
        "en": "Deriving resonant frequency"
      },
      "video": {
        "src": "/physics-schemes/resonance/frequency.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          43
        ],
        "text": "Derive the resonant angular frequency law.\nXₗ = X꜀ → ωᵣL = 1/(ωᵣC) → ωᵣ²LC = 1 → ωᵣ = 1/√(LC).\nDerive the resonant frequency law.\nfᵣ = 1/[2π√(LC)].",
        "language": "en"
      },
      "formulas": [
        "ωᵣL = 1 / (ωᵣC)",
        "ωᵣ²LC = 1",
        "ωᵣ = 1 / √(LC)",
        "fᵣ = 1 / [2π√(LC)]"
      ],
      "memory": {
        "ar": "من تساوي المفاعلتين يطلع قانون التردد.",
        "en": "Equal reactances give the frequency formula."
      },
      "recall": {
        "question": {
          "ar": "أي قانون يحتاج 2π بالمقام: fᵣ لو ωᵣ؟",
          "en": "Which formula contains 2π in the denominator?"
        },
        "answer": {
          "ar": "قانون fᵣ؛ لأن ωᵣ = 2πfᵣ.",
          "en": "fᵣ = 1/[2π√(LC)]; ωᵣ = 2πfᵣ."
        }
      },
      "group": {
        "ar": "القوانين والتطبيق",
        "en": "Laws and applications"
      }
    },
    {
      "id": "tuning-lc",
      "title": {
        "ar": "شنو يغيّر تردد الرنين؟",
        "en": "Changing L and C"
      },
      "text": {
        "ar": "تردد الرنين يعتمد على L وC. إذا زادت واحدة منهما مع ثبات الثانية، التردد يقل. مثال يثبّت العلاقة: إذا صارت C أربعة أضعاف، يصير fᵣ نصف قيمته. المقاومة تغيّر شكل المنحني وحدّته؛ ما تدخل بقانون تردد رنين دائرة RLC المتوالية المثالية.",
        "en": "1. Self-inductance coefficient (L).\n2. Capacitance of capacitor (C).\nHow can the resonant frequency be changed?\nThis occurred either by changing the capacitance of the capacitor or the self-inductance coefficient."
      },
      "image": "/physics-schemes/resonance/tuning-lc.svg",
      "imageAlt": {
        "ar": "شنو يغيّر تردد الرنين؟",
        "en": "Changing L and C"
      },
      "video": {
        "src": "/physics-schemes/resonance/tuning-lc.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          42,
          43
        ],
        "text": "What does the natural frequency of the oscillating circuit depend on?\n1. Self-inductance coefficient (L).\n2. Capacitance of capacitor (C).\nHow can the resonant frequency be changed?\nThis occurred either by changing the capacitance of the capacitor or the self-inductance coefficient.",
        "language": "en"
      },
      "formulas": [
        "fᵣ ∝ 1 / √L  (C fixed)",
        "fᵣ ∝ 1 / √C  (L fixed)",
        "C × 4 → fᵣ ÷ 2"
      ],
      "memory": {
        "ar": "L أو C تصعد ← تردد الرنين ينزل.",
        "en": "L or C increases → resonant frequency decreases."
      },
      "recall": {
        "question": {
          "ar": "إذا تضاعفت C أربع مرات، شنو يصير بـfᵣ؟",
          "en": "What happens to fᵣ if C becomes four times as large?"
        },
        "answer": {
          "ar": "ينخفض إلى النصف إذا بقيت L ثابتة.",
          "en": "It halves, if L stays fixed."
        }
      },
      "group": {
        "ar": "القوانين والتطبيق",
        "en": "Laws and applications"
      }
    },
    {
      "id": "regimes",
      "title": {
        "ar": "قبل الرنين وبعده",
        "en": "Below and above resonance"
      },
      "text": {
        "ar": "رتّب الحالات حسب التردد: أقل من fᵣ تكون الدائرة سعوية لأن X꜀ أكبر، وعند fᵣ تتعادل المفاعلتان، وأعلى من fᵣ تصير حثية لأن Xₗ أكبر. بهذا الترتيب تتذكّر علاقة الطور أيضاً: التيار يتقدم بالسعوية ويتأخر بالحثية.",
        "en": "False, capacitive properties because X꜀ > Xₗ."
      },
      "image": "/physics-schemes/resonance/regimes.svg",
      "imageAlt": {
        "ar": "قبل الرنين وبعده",
        "en": "Below and above resonance"
      },
      "video": {
        "src": "/physics-schemes/resonance/regimes.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          43
        ],
        "text": "When the oscillator frequency is less than the resonant frequency of this circuit, it has inductive properties because Xₗ > X꜀.\nFalse, capacitive properties because X꜀ > Xₗ.",
        "language": "en"
      },
      "formulas": [
        "f < fᵣ → X꜀ > Xₗ → capacitive",
        "f = fᵣ → Xₗ = X꜀ → resistive",
        "f > fᵣ → Xₗ > X꜀ → inductive"
      ],
      "memory": {
        "ar": "قبل الرنين: C. بعد الرنين: L.",
        "en": "Below resonance: C. Above resonance: L."
      },
      "recall": {
        "question": {
          "ar": "إذا f أقل من fᵣ، الدائرة حثية لو سعوية؟",
          "en": "Is the circuit capacitive or inductive below fᵣ?"
        },
        "answer": {
          "ar": "سعوية؛ لأن X꜀ > Xₗ.",
          "en": "Capacitive, because X꜀ > Xₗ."
        }
      },
      "group": {
        "ar": "القوانين والتطبيق",
        "en": "Laws and applications"
      }
    },
    {
      "id": "lamp",
      "title": {
        "ar": "المصباح يخلّي الفكرة تنشاف",
        "en": "A lamp makes it visible"
      },
      "text": {
        "ar": "المقارنة هنا مع مصباح مقاومته R على نفس المصدر. إضافة ملف نقي وحده أو متسعة نقية وحدها تزيد الممانعة وتخفّض الإضاءة. إذا أضفنا الاثنين وضبطنا الدائرة على الرنين، تتلاشى المفاعلة الكلية وتبقى R؛ ترجع الإضاءة لنفس حالة المصباح وحده. التوضيح يفترض عناصر مثالية.",
        "en": "1. Pure inductor: the glow decreases due to a decrease in current due to an increase in impedance.\n2. Pure capacitor: the glow decreases due to a decrease in current due to an increase in impedance.\n3. Capacitor and inductor, and the circuit is resonant: the glow remains constant because the impedance equals the lamp resistance (Z = R)."
      },
      "image": "/physics-schemes/resonance/lamp.svg",
      "imageAlt": {
        "ar": "المصباح يخلّي الفكرة تنشاف",
        "en": "A lamp makes it visible"
      },
      "video": {
        "src": "/physics-schemes/resonance/lamp.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          43
        ],
        "text": "What is the change that takes place in the glow of a lamp connected to an alternating current circuit when it is connected to the lamp in series combination?\n1. Pure inductor: the glow decreases due to a decrease in current due to an increase in impedance.\n2. Pure capacitor: the glow decreases due to a decrease in current due to an increase in impedance.\n3. Capacitor and inductor, and the circuit is resonant: the glow remains constant because the impedance equals the lamp resistance (Z = R).",
        "language": "en"
      },
      "formulas": [
        "I = V / Z",
        "At resonance: Z = R"
      ],
      "memory": {
        "ar": "الرنين يرجّع التيار لحالة المقاومة وحدها.",
        "en": "At resonance, current returns to the resistor-only value."
      },
      "recall": {
        "question": {
          "ar": "بالرنين، الإضاءة أكبر من المصباح وحده على نفس المصدر؟",
          "en": "Does a resonant lamp become brighter than the resistor-only lamp?"
        },
        "answer": {
          "ar": "لا؛ تبقى مثل حالته وحده إذا كانت العناصر مثالية ونفس R ونفس المصدر.",
          "en": "No. With ideal components and the same R and source, its brightness is unchanged."
        }
      },
      "group": {
        "ar": "القوانين والتطبيق",
        "en": "Laws and applications"
      }
    },
    {
      "id": "current-curves",
      "title": {
        "ar": "المقاومة وشكل منحني التيار",
        "en": "Resistance and the current peak"
      },
      "text": {
        "ar": "قارن مع ثبات L وC وجهد المصدر: المقاومة الصغيرة تعطي قمة تيار أعلى وأحدّ. المقاومة الكبيرة تعطي قمة أقل وأعرض. القمم تبقى عند نفس fᵣ؛ تغيير R وحده ما ينقل تردد الرنين.",
        "en": "1. When resistance is small (200 Ω), current curve will be thin (sharp) and huge.\n2. If resistance is big (1000 Ω), current curve will be wide and small."
      },
      "image": "/physics-schemes/resonance/current-curves.svg",
      "imageAlt": {
        "ar": "المقاومة وشكل منحني التيار",
        "en": "Resistance and the current peak"
      },
      "video": {
        "src": "/physics-schemes/resonance/current-curves.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          42
        ],
        "text": "Explain the effect of resistance on current curve at resonant frequency.\n1. When resistance is small (200 Ω), current curve will be thin (sharp) and huge.\n2. If resistance is big (1000 Ω), current curve will be wide and small.",
        "language": "en"
      },
      "formulas": [
        "Iᵣₘₛ,max = Vᵣₘₛ / R",
        "Same L, C → same fᵣ"
      ],
      "memory": {
        "ar": "R أقل ← قمة أعلى وأحدّ.",
        "en": "Smaller R → higher, sharper current peak."
      },
      "recall": {
        "question": {
          "ar": "إذا زدنا R وحدها، هل تتحرك القمة إلى تردد جديد؟",
          "en": "Does changing R alone move the resonance frequency?"
        },
        "answer": {
          "ar": "لا، تبقى عند نفس fᵣ ما دامت L وC ثابتتين.",
          "en": "No. fᵣ stays fixed if L and C stay fixed."
        }
      },
      "group": {
        "ar": "المنحنيات وعامل النوعية",
        "en": "Curves and quality"
      }
    },
    {
      "id": "bandwidth",
      "title": {
        "ar": "عرض الحزمة يُقاس عند نصف القدرة",
        "en": "Half-power bandwidth"
      },
      "text": {
        "ar": "انزل إلى نصف القدرة العظمى، وارسم خطاً أفقياً. تقاطعه ويا المنحني يعطي ω₁ وω₂؛ الفرق بينهما هو عرض الحزمة الزاوي. لا تخلط نصف القدرة ويا نصف التيار: عند نصف القدرة يكون التيار Imax/√2، مو Imax/2.",
        "en": "It is the difference between angular frequency at half-maximum average power.\nΔω = ω₂ − ω₁. It is directly proportional to the resistance and inversely proportional to the self-inductance coefficient of the coil.\nΔω = R/L."
      },
      "image": "/physics-schemes/resonance/bandwidth.svg",
      "imageAlt": {
        "ar": "عرض الحزمة يُقاس عند نصف القدرة",
        "en": "Half-power bandwidth"
      },
      "video": {
        "src": "/physics-schemes/resonance/bandwidth.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          44
        ],
        "text": "What is meant by angular frequency width?\nIt is the difference between angular frequency at half-maximum average power.\nΔω = ω₂ − ω₁. It is directly proportional to the resistance and inversely proportional to the self-inductance coefficient of the coil.\nΔω = R/L.",
        "language": "en"
      },
      "formulas": [
        "P = Pₘₐₓ / 2",
        "Δω = ω₂ − ω₁ = R / L",
        "I = Iₘₐₓ / √2"
      ],
      "memory": {
        "ar": "نصف القدرة ← تقاطعان ← فرق الترددين.",
        "en": "Half power → two crossings → their frequency difference."
      },
      "recall": {
        "question": {
          "ar": "نقيس عرض الحزمة عند نصف التيار لو نصف القدرة؟",
          "en": "Is bandwidth measured at half current or half power?"
        },
        "answer": {
          "ar": "عند نصف القدرة المتوسطة العظمى.",
          "en": "Half maximum average power."
        }
      },
      "group": {
        "ar": "المنحنيات وعامل النوعية",
        "en": "Curves and quality"
      }
    },
    {
      "id": "quality",
      "title": {
        "ar": "عامل النوعية: من المعنى إلى القانون",
        "en": "Quality factor"
      },
      "text": {
        "ar": "عامل النوعية يقارن تردد الرنين بعرض الحزمة. كلما كانت القمة أضيق بالنسبة لترددها، تكون الانتقائية أعلى وQF أكبر. بالتعويض عن ωᵣ وΔω نحصل على QF = (1/R)√(L/C). هو نسبة بلا وحدة؛ لا تخلط QF ويا الشحنة Q.",
        "en": "It is the ratio of resonance angular frequency (ωᵣ) to angular frequency width (Δω), and it is symbolized by QF.\nQF = ωᵣ/Δω = (1/R)√(L/C).\nWhat does the quality factor depend on?\nSelf-inductance coefficient, capacitance of the capacitor, and resistance."
      },
      "image": "/physics-schemes/resonance/quality.svg",
      "imageAlt": {
        "ar": "عامل النوعية: من المعنى إلى القانون",
        "en": "Quality factor"
      },
      "video": {
        "src": "/physics-schemes/resonance/quality.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          44,
          45
        ],
        "text": "What is meant by the quality factor?\nIt is the ratio of resonance angular frequency (ωᵣ) to angular frequency width (Δω), and it is symbolized by QF.\nQF = ωᵣ/Δω = (1/R)√(L/C).\nWhat does the quality factor depend on?\nSelf-inductance coefficient, capacitance of the capacitor, and resistance.",
        "language": "en"
      },
      "formulas": [
        "QF = ωᵣ / Δω",
        "QF = (1/R) √(L/C)",
        "QF: unitless"
      ],
      "memory": {
        "ar": "قمة ضيقة بالنسبة لترددها ← Q أعلى.",
        "en": "Narrower relative bandwidth → higher QF."
      },
      "recall": {
        "question": {
          "ar": "إذا كبر Δω وبقي ωᵣ ثابتاً، شنو يصير بـQF؟",
          "en": "What happens to QF if Δω increases at fixed ωᵣ?"
        },
        "answer": {
          "ar": "يقل، لأن QF = ωᵣ/Δω.",
          "en": "QF decreases."
        }
      },
      "group": {
        "ar": "المنحنيات وعامل النوعية",
        "en": "Curves and quality"
      }
    },
    {
      "id": "memory",
      "title": {
        "ar": "ثبّت الصورة: مقاومة قليلة أو كبيرة",
        "en": "The resistance–bandwidth–quality chain"
      },
      "text": {
        "ar": "احفظها كسلسلتين متعاكستين، مع ثبات L وC وجهد المصدر. مقاومة أقل تعني قمة قدرة أعلى وأحدّ، وعرض حزمة أصغر وعامل نوعية أكبر. إذا زادت المقاومة يصير العكس. هذا ملخّص الشكل، مو قانوناً جديداً.",
        "en": "When the resistance in the circuit is large, the average power curve is wide, the angular frequency width (Δω) is large, and the quality factor (QF) is low."
      },
      "image": "/physics-schemes/resonance/memory.svg",
      "imageAlt": {
        "ar": "ثبّت الصورة: مقاومة قليلة أو كبيرة",
        "en": "The resistance–bandwidth–quality chain"
      },
      "video": {
        "src": "/physics-schemes/resonance/memory.mp4",
        "durationSeconds": 12
      },
      "source": {
        "name": "عصام الشمري — فيزياء المتميزين — الفصل الثالث",
        "pages": [
          45,
          46
        ],
        "text": "When the resistance in the circuit is small, the average power curve is very sharp, the angular frequency width (Δω) is small, and the quality factor (QF) is high.\nWhen the resistance in the circuit is large, the average power curve is wide, the angular frequency width (Δω) is large, and the quality factor (QF) is low.",
        "language": "en"
      },
      "formulas": [
        "R ↓ → Δω ↓ → QF ↑",
        "R ↑ → Δω ↑ → QF ↓",
        "L, C fixed → ωᵣ unchanged"
      ],
      "memory": {
        "ar": "R عكس Q، وبنفس اتجاه عرض الحزمة.",
        "en": "R follows bandwidth and opposes QF."
      },
      "recall": {
        "question": {
          "ar": "مقاومة كبيرة: منحني ضيق وQ عالي؟",
          "en": "Does a large R give a narrow peak and high QF?"
        },
        "answer": {
          "ar": "لا؛ المنحني أعرض وQ أقل.",
          "en": "No. Large R gives a broader peak and a lower QF."
        }
      },
      "group": {
        "ar": "المنحنيات وعامل النوعية",
        "en": "Curves and quality"
      }
    }
  ]
};
