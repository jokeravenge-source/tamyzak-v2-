export type MalazamSeoItem = {
  slug: string;
  title: string;
  description: string;
};

export const MALAZAM_SEO_ITEMS: MalazamSeoItem[] = [
  { slug: "haider-abdul-aemma-chapter-1", title: "حيدر عبد الأئمة فصل أول متميزين", description: "حيدر عبد الأئمة فصل أول متميزين ضمن ملازم السادس العلمي على منصة تميزك." },
  { slug: "haider-abdul-aemma-chapter-2", title: "حيدر عبد الأئمة فصل ثاني متميزين", description: "حيدر عبد الأئمة فصل ثاني متميزين ضمن ملازم السادس العلمي على منصة تميزك." },
  { slug: "ustathna-istifham", title: "استفهام أستاذنا", description: "ملزمة استفهام أستاذنا لطلاب السادس العلمي ضمن قسم الملازم في منصة تميزك." },
  { slug: "ustathna-negation", title: "النفي أستاذنا", description: "ملزمة النفي أستاذنا لطلاب السادس العلمي ضمن قسم الملازم في منصة تميزك." },
  { slug: "istifham-homework", title: "واجبات أسلوب الاستفهام", description: "واجبات أسلوب الاستفهام لطلاب السادس العلمي ضمن ملازم اللغة العربية في تميزك." },
  { slug: "negation-homework", title: "واجبات أسلوب النفي", description: "واجبات أسلوب النفي لطلاب السادس العلمي ضمن ملازم اللغة العربية في تميزك." },
  { slug: "al-wadih-wal-madmoon", title: "الواضح والمضمون", description: "ملزمة الواضح والمضمون لطلاب السادس العلمي متاحة عبر قسم الملازم في منصة تميزك." },
  { slug: "qusay-al-nadawi-chapter-1", title: "قصي النداوي فصل أول متميزين", description: "قصي النداوي فصل أول متميزين ضمن ملازم السادس العلمي على منصة تميزك." },
  { slug: "qusay-al-nadawi-chapter-2", title: "قصي النداوي فصل ثاني متميزين", description: "قصي النداوي فصل ثاني متميزين ضمن ملازم السادس العلمي على منصة تميزك." },
  { slug: "sajjad-al-ubaidi-unit-1", title: "سجاد العبيدي اليونت الأول", description: "ملزمة سجاد العبيدي لليونت الأول ضمن ملازم الإنكليزي للسادس العلمي في تميزك." },
  { slug: "sajjad-al-ubaidi-unit-2", title: "سجاد العبيدي اليونت الثاني", description: "ملزمة سجاد العبيدي لليونت الثاني ضمن ملازم الإنكليزي للسادس العلمي في تميزك." },
  { slug: "sajjad-al-ubaidi-unit-3", title: "سجاد العبيدي اليونت الثالث", description: "ملزمة سجاد العبيدي لليونت الثالث ضمن ملازم الإنكليزي للسادس العلمي في تميزك." },
  { slug: "sajjad-al-ubaidi-unit-4", title: "سجاد العبيدي اليونت الرابع", description: "ملزمة سجاد العبيدي لليونت الرابع ضمن ملازم الإنكليزي للسادس العلمي في تميزك." },
  { slug: "sajjad-al-ubaidi-literature-part-1", title: "سجاد العبيدي أدب الجزء الأول", description: "ملزمة سجاد العبيدي للأدب الجزء الأول ضمن ملازم الإنكليزي للسادس العلمي في تميزك." },
  { slug: "mohammed-al-anazi-chapter-1", title: "محمد العنزي الفصل الأول متميزين", description: "محمد العنزي الفصل الأول متميزين ضمن ملازم السادس العلمي على منصة تميزك." },
  { slug: "diagrams-capsule", title: "كبسولة المخططات", description: "كبسولة المخططات للسادس العلمي ضمن قسم الملازم التعليمية في منصة تميزك." },
  { slug: "drawings-capsule", title: "كبسولة الرسومات", description: "كبسولة الرسومات للسادس العلمي ضمن قسم الملازم التعليمية في منصة تميزك." },
  { slug: "chapters-1-2-homework", title: "واجبات فصل أول وثاني متميزين", description: "واجبات الفصل الأول والثاني للمتميزين ضمن ملازم السادس العلمي في منصة تميزك." },
  { slug: "lecture-notebook-chapter-1", title: "دفتر محاضرات فصل أول متميزين", description: "دفتر محاضرات الفصل الأول للمتميزين ضمن ملازم السادس العلمي في منصة تميزك." },
  { slug: "binary-math-chapter-1", title: "الثنائية فصل أول رياضيات", description: "ملزمة الثنائية للفصل الأول في الرياضيات ضمن ملازم السادس العلمي على تميزك." },
  { slug: "binary-enrichment-chapter-1", title: "الثنائية إثرائيات فصل أول متميزين", description: "الثنائية إثرائيات الفصل الأول للمتميزين ضمن ملازم السادس العلمي في منصة تميزك." },
];

export const getMalazamSeoItem = (slug: string | null | undefined) =>
  MALAZAM_SEO_ITEMS.find((item) => item.slug === slug);
