import { parseBoardLesson, type BoardSource } from "./whiteboard.ts";

// Quote the existing chapter-one Tamayzak bank. This is bank evidence,
// so it carries no asserted textbook page, edition, or exam year.
const applications = [
  {
    ar: "في مصباح فلاش الكاميرا: تزوّد المصباح بسرعة بالطاقة المخزونة الكافية لإصدار ومضة ضوء قوية ومفاجئة عند تفريغها.",
    en: "Camera flash lamp: quickly supplies the lamp with enough stored energy to emit a sudden bright flash when discharged.",
    title: "فلاش الكاميرا", titleEn: "Camera flash",
    reason: "تفريغ سريع للطاقة المخزونة", result: "ومضة ضوء قوية",
    narration: "بفلاش الكاميرا المتسعة تخزّن طاقة. ولمن نحتاج الومضة، تفرّغ هالطاقة بسرعة للمصباح، فيطلع ضوء قوي بلحظة.",
  },
  {
    ar: "في الميكروفونات: تحوّل الاهتزازات الميكانيكية الصوتية إلى اهتزازات كهربائية بنفس تردد موجات الصوت.",
    en: "Microphones: transform mechanical sound vibrations into electrical vibrations of matching frequency.",
    title: "الميكروفون", titleEn: "Microphone",
    reason: "اهتزازات صوتية ميكانيكية", result: "إشارة كهربائية بنفس التردد",
    narration: "بالمايكروفون، الفايدة إن الاهتزازات الميكانيكية مال الصوت تتحوّل إلى اهتزازات كهربائية بنفس تردد الصوت.",
  },
  {
    ar: "في جهاز الصدم القلبي (المُنظِّم): يفرّغ كمية كبيرة من الطاقة المخزونة (10 J إلى 360 J) في جسم المريض خلال زمن قصير جداً، فتُنبّه الصدمة القوية عضلات القلب وتعيد تنظيم نبضاته.",
    en: "Defibrillator (heart-stimulating device): discharges a massive stored energy (10 J to 360 J) into the patient's body over a very short duration; the strong shock stimulates the heart muscles and reorganizes its rhythm.",
    title: "جهاز الصدم القلبي", titleEn: "Defibrillator",
    reason: "طاقة مخزونة تُفرَّغ بزمن قصير", result: "صدمة تساعد على إعادة تنظيم النبض",
    narration: "بجهاز الصدم القلبي، المتسعة تخزّن طاقة وتفرّغها بزمن قصير جداً. هالمثال يبيّن شلون يفيد التفريغ السريع للطاقة المخزونة.",
  },
  {
    ar: "في لوحة مفاتيح الحاسوب: توضع تحت المفاتيح؛ والضغط على المفتاح يقلل المسافة بين اللوحين فتزداد السعة، مما يسمح للدوائر الإلكترونية بتمييز المفتاح المضغوط فوراً.",
    en: "Computer keyboard: a capacitor sits under each key; pressing the key decreases the plate separation, increasing capacitance, which lets external circuits recognize which key was pressed.",
    title: "لوحة المفاتيح", titleEn: "Computer keyboard",
    reason: "الضغط يقلّل المسافة فتزيد السعة", result: "الدائرة تميّز المفتاح المضغوط",
    narration: "بلوحة المفاتيح السعوية، ضغط المفتاح يقرّب اللوحين. من تقل المسافة تزيد السعة، والدائرة تميّز أي مفتاح انضغط.",
  },
];

export function capacitorApplicationsLesson(language: "ar" | "en") {
  const source: BoardSource = {
    id: "tamayzak:physics:ch1:capacitor-applications:" + language,
    kind: "lesson",
    title: language === "ar" ? "بنك وزاريات تميّزك · فيزياء السادس العلمي" : "Tamayzak question bank · Sixth scientific physics",
    chapter: language === "ar" ? "الفصل الأول · المتسعات" : "Chapter 1 · Capacitors",
    excerpt: applications.map(application => application[language]).join("\n"),
  };
  const lesson = parseBoardLesson({
    title: language === "ar" ? "تطبيقات المتسعات" : "Applications of capacitors",
    steps: applications.map(application => ({
      title: language === "ar" ? application.title : application.titleEn,
      narration: application.narration,
      reference: { sourceId: source.id, quote: application[language] },
      actions: [
        { kind: "label", target: "idea", text: application.title, at: 0.04 },
        { kind: "label", target: "reason", text: application.reason, at: 0.36 },
        { kind: "arrow", target: "idea-reason", at: 0.42 },
        { kind: "label", target: "result", text: application.result, at: 0.70 },
        { kind: "arrow", target: "reason-result", at: 0.78 },
      ],
    })),
  }, [source], "notes");
  if (!lesson) throw new Error("Invalid capacitor applications lesson");
  return lesson;
}
