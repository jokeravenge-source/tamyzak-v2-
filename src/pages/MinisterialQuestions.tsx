import { Helmet } from "react-helmet-async";
import SeoHead from "@/components/SeoHead";
import { ministerialPhysicsCh1Ar } from "@/data/ministerialPhysicsCh1Ar";
import { ministerialPhysicsCh2Ar } from "@/data/ministerialPhysicsCh2Ar";
import { ministerialChemCh1Ar } from "@/data/ministerialChemCh1Ar";
import { ministerialChemCh3Ar } from "@/data/ministerialChemCh3Ar";
import { ministerialBioCh1Ar } from "@/data/ministerialBioCh1Ar";
import { ministerialIslamicUnit1 } from "@/data/ministerialIslamicUnit1";
import { ministerialIslamicUnit2 } from "@/data/ministerialIslamicUnit2";
import { ministerialArabicIstifham } from "@/data/ministerialArabicIstifham";
import { ministerialArabicNida } from "@/data/ministerialArabicNida";

const SITE_URL = "https://tamyazak.site";

const sections = [
  { id: "physics", title: "الفيزياء — الفصل الأول", items: ministerialPhysicsCh1Ar.slice(0, 12) },
  { id: "physics2", title: "الفيزياء — الفصل الثاني (الفيزياء الحديثة)", items: ministerialPhysicsCh2Ar.slice(0, 12) },
  { id: "chemistry", title: "الكيمياء — الفصل الأول", items: ministerialChemCh1Ar.slice(0, 12) },
  { id: "chemistry3", title: "الكيمياء — الفصل الثالث (الكهروكيمياء)", items: ministerialChemCh3Ar.slice(0, 12) },
  { id: "biology", title: "الأحياء — الفصل الأول", items: ministerialBioCh1Ar.slice(0, 12) },
  { id: "islamic", title: "الإسلامية — الوحدة الأولى", items: ministerialIslamicUnit1.slice(0, 10) },
  { id: "islamic2", title: "الإسلامية — الوحدة الثانية", items: ministerialIslamicUnit2.slice(0, 10) },
  { id: "arabic", title: "اللغة العربية — الاستفهام", items: ministerialArabicIstifham.slice(0, 10) },
  { id: "arabic-nida", title: "اللغة العربية — النداء", items: ministerialArabicNida.slice(0, 10) },
];

/**
 * Public, crawlable landing page for ministerial (وزاريات) questions.
 * Rendered before any auth gate so search engines and signed-out students
 * can read real question/answer content.
 */
const MinisterialQuestions = () => {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.flatMap((s) =>
      s.items.slice(0, 6).map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    ),
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Cairo','IBM Plex Sans Arabic',system-ui,sans-serif" }}
    >
      <SeoHead
        path="/ministerial-questions"
        title="وزاريات السادس العلمي — أسئلة وزارية بالأجوبة | تميزك"
        description="أسئلة وزارية للسادس العلمي في العراق مع الأجوبة النموذجية: فيزياء، كيمياء، أحياء، إسلامية، ولغة عربية — مجاناً على منصة تميزك."
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <div className="mx-auto max-w-3xl px-5 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold leading-tight">
            وزاريات السادس العلمي — أسئلة وزارية مع الأجوبة
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            مجموعة من الأسئلة الوزارية المتكررة لطلاب السادس العلمي في العراق (الأحيائي والتطبيقي)،
            مرتّبة حسب المادة والفصل، مع الأجوبة النموذجية كما تُعتمد في التصحيح الوزاري.
            يمكنك تصفح المزيد من الأسئلة وحل امتحانات كاملة داخل منصة تميزك.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"
          >
            افتح بنك الأسئلة الكامل في تميزك
          </a>
        </header>

        <nav aria-label="المواد" className="mb-10 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              {s.title}
            </a>
          ))}
        </nav>

        {sections.map((s) => (
          <section key={s.id} id={s.id} className="mb-10">
            <h2 className="mb-4 text-xl font-bold">{s.title}</h2>
            <div className="space-y-4">
              {s.items.map((it, i) => (
                <article key={i} className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="text-base font-semibold leading-relaxed">{it.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.a}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            هذه عيّنة من بنك الأسئلة الوزارية في{" "}
            <a href={`${SITE_URL}/`} className="underline">
              منصة تميزك
            </a>
            ، حيث تجد فلاش كاردات وملخصات وامتحانات كاملة مع تصحيح آلي.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default MinisterialQuestions;
