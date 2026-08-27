import { Helmet } from "react-helmet-async";
import SeoHead from "@/components/SeoHead";

const SITE_URL = "https://tamyazak.site";

type Tool = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  appPath: string;
  cta: string;
  sections: { h: string; p: string }[];
  faq: { q: string; a: string }[];
};

export const PUBLIC_TOOLS: Tool[] = [
  {
    slug: "flashcards",
    title: "فلاش كاردات السادس العلمي — مراجعة بالتكرار المتباعد",
    metaTitle: "فلاش كاردات السادس العلمي مجاناً | تميزك",
    metaDescription:
      "فلاش كاردات جاهزة للسادس العلمي في العراق: فيزياء، كيمياء، أحياء وإسلامية مع نظام التكرار المتباعد لتثبيت المعلومة. مجاناً على منصة تميزك.",
    intro:
      "الفلاش كاردات في تميزك مبنية على نظام التكرار المتباعد (Spaced Repetition) الذي يعيد عرض البطاقة عليك قبل أن تنساها بقليل، فتثبت المعلومة بأقل وقت مراجعة. البطاقات مرتّبة حسب المادة والفصل لمنهج السادس العلمي في العراق، بالعربي والإنكليزي.",
    appPath: "/flashcards",
    cta: "ابدأ الفلاش كاردات الآن",
    sections: [
      {
        h: "كيف تعمل الفلاش كاردات؟",
        p: "تعرض البطاقة سؤالاً قصيراً، تحاول الإجابة من ذاكرتك ثم تكشف الجواب وتقيّم نفسك. النظام يحسب الموعد التالي لكل بطاقة حسب مدى تذكّرك لها، فالبطاقات الصعبة تعود سريعاً والسهلة تتباعد.",
      },
      {
        h: "المواد المتوفرة",
        p: "فيزياء، كيمياء، أحياء، إسلامية، لغة عربية وإنكليزي — مع بطاقات مأخوذة من المنهج والأسئلة الوزارية المتكررة.",
      },
      {
        h: "مجاني بالكامل",
        p: "لا حاجة لأي اشتراك: سجّل دخولك في تميزك وابدأ المراجعة من الهاتف أو الحاسبة.",
      },
    ],
    faq: [
      {
        q: "هل الفلاش كاردات مجانية؟",
        a: "نعم، فلاش كاردات تميزك متاحة مجاناً لجميع طلاب السادس العلمي.",
      },
      {
        q: "ما هو التكرار المتباعد؟",
        a: "أسلوب مراجعة يعيد عرض المعلومة على فترات متزايدة قبل نسيانها، وهو أثبت الطرق علمياً لحفظ المعلومات لفترة طويلة.",
      },
    ],
  },
  {
    slug: "ministerial-bank",
    title: "بنك الأسئلة الوزارية — وزاريات السادس العلمي",
    metaTitle: "بنك الأسئلة الوزارية للسادس العلمي | تميزك",
    metaDescription:
      "بنك وزاريات السادس العلمي في العراق: أسئلة وزارية سابقة مع الأجوبة النموذجية لكل مادة وفصل، مرتّبة وقابلة للحل مباشرة على منصة تميزك.",
    intro:
      "بنك الأسئلة الوزارية يجمع الأسئلة التي تكررت في الدورات الوزارية للسادس العلمي مع أجوبتها النموذجية، مرتّبة حسب المادة والفصل، لتراجع ما يهم فعلاً قبل الامتحان.",
    appPath: "/ministerial-bank",
    cta: "افتح بنك الوزاريات",
    sections: [
      {
        h: "ماذا يحتوي البنك؟",
        p: "أسئلة وزارية في الفيزياء والكيمياء والأحياء والإسلامية واللغة العربية، مع الجواب النموذجي كما يُعتمد في التصحيح الوزاري.",
      },
      {
        h: "مرتّب حسب الفصول",
        p: "تختار المادة ثم الفصل أو الوحدة، فتظهر لك أسئلة ذلك الجزء فقط — مناسب للمراجعة أثناء الدراسة وليس فقط قبل الامتحان.",
      },
      {
        h: "مع التصحيح الآلي",
        p: "تستطيع حل امتحان كامل ورفع ورقة إجابتك ليتم تصحيحها آلياً ومقارنتها بالأجوبة النموذجية.",
      },
    ],
    faq: [
      {
        q: "هل الأسئلة الوزارية محدّثة؟",
        a: "نعم، يتم تحديث بنك الوزاريات باستمرار بأسئلة الدورات الأخيرة للسادس العلمي في العراق.",
      },
      {
        q: "هل يمكن رؤية الأجوبة؟",
        a: "نعم، كل سؤال وزاري في تميزك مرفق بجوابه النموذجي.",
      },
    ],
  },
  {
    slug: "mcq",
    title: "أسئلة الاختيار من متعدد (MCQ) — بنك وتوليد تلقائي",
    metaTitle: "أسئلة اختيار من متعدد MCQ للسادس العلمي | تميزك",
    metaDescription:
      "بنك أسئلة اختيار من متعدد MCQ للسادس العلمي في العراق مع التصحيح الفوري، وإمكانية توليد أسئلة MCQ من أي ملاحظة أو ملف PDF مجاناً على تميزك.",
    intro:
      "أداة الـ MCQ في تميزك تمنحك بنك أسئلة اختيار من متعدد لكل مادة مع تصحيح فوري ونقاط، بالإضافة إلى مولّد أسئلة يحوّل أي محاضرة أو ملف PDF إلى أسئلة اختيارية خلال ثوانٍ.",
    appPath: "/mcq-bank",
    cta: "ابدأ حل أسئلة MCQ",
    sections: [
      {
        h: "بنك MCQ جاهز",
        p: "أسئلة اختيار من متعدد بالعربي والإنكليزي حسب المنهج العراقي، مع تصحيح فوري ونظام نقاط يحفّزك على الاستمرار.",
      },
      {
        h: "مولّد أسئلة من PDF",
        p: "ارفع ملف المحاضرة أو الملزمة، وسيقوم الذكاء الاصطناعي بتوليد أسئلة اختيارية مع الجواب الصحيح والشرح.",
      },
      {
        h: "سجل الأخطاء",
        p: "كل سؤال تخطئ فيه يُحفظ في «أخطائي» ليُعاد عليك لاحقاً حتى تتقنه.",
      },
    ],
    faq: [
      {
        q: "هل يمكن توليد أسئلة MCQ من ملف PDF؟",
        a: "نعم، يمكنك رفع ملف PDF أو نص محاضرة وسيولّد تميزك أسئلة اختيار من متعدد مع الأجوبة.",
      },
      {
        q: "هل أسئلة MCQ مجانية؟",
        a: "نعم، بنك أسئلة الاختيار من متعدد متاح مجاناً مع حد يومي لاستخدام أدوات الذكاء الاصطناعي.",
      },
    ],
  },
];

const ToolLanding = ({ slug }: { slug: string }) => {
  const tool = PUBLIC_TOOLS.find((t) => t.slug === slug);
  if (!tool) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.metaTitle,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        url: `${SITE_URL}/tools/${tool.slug}`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "IQD" },
        publisher: { "@type": "Organization", name: "تميزك", url: SITE_URL },
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Cairo','IBM Plex Sans Arabic',system-ui,sans-serif" }}
    >
      <SeoHead path={`/tools/${tool.slug}`} title={tool.metaTitle} description={tool.metaDescription} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="mx-auto max-w-3xl px-5 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold leading-tight">{tool.title}</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">{tool.intro}</p>
          <a
            href={tool.appPath}
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"
          >
            {tool.cta}
          </a>
        </header>

        {tool.sections.map((s) => (
          <section key={s.h} className="mb-8">
            <h2 className="mb-2 text-xl font-bold">{s.h}</h2>
            <p className="leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">أسئلة شائعة</h2>
          <div className="space-y-4">
            {tool.faq.map((f) => (
              <article key={f.q} className="rounded-2xl border border-border bg-card p-4">
                <h3 className="text-base font-semibold leading-relaxed">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </article>
            ))}
          </div>
        </section>

        <nav aria-label="أدوات أخرى" className="border-t border-border pt-6">
          <h2 className="mb-3 text-lg font-bold">أدوات أخرى في تميزك</h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {PUBLIC_TOOLS.filter((t) => t.slug !== tool.slug).map((t) => (
              <li key={t.slug}>
                <a
                  href={`/tools/${t.slug}`}
                  className="inline-block rounded-full border border-border bg-card px-4 py-2 font-medium"
                >
                  {t.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/ministerial-questions"
                className="inline-block rounded-full border border-border bg-card px-4 py-2 font-medium"
              >
                الأسئلة الوزارية مع الأجوبة
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
};

export default ToolLanding;
