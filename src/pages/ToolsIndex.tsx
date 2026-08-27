import { Helmet } from "react-helmet-async";
import SeoHead from "@/components/SeoHead";
import { PUBLIC_TOOLS } from "@/data/publicTools";

const SITE_URL = "https://tamyazak.site";

/** Public hub listing every Tamayzak study tool — crawlable, no auth. */
const ToolsIndex = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "أدوات منصة تميزك",
    itemListElement: PUBLIC_TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title,
      url: `${SITE_URL}/tools/${t.slug}`,
    })),
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Cairo','IBM Plex Sans Arabic',system-ui,sans-serif" }}
    >
      <SeoHead
        path="/tools"
        title="أدوات الدراسة للسادس العلمي — فلاش كاردات، وزاريات، MCQ | تميزك"
        description="كل أدوات منصة تميزك لطلاب السادس العلمي في العراق: فلاش كاردات، بنك الأسئلة الوزارية، أسئلة MCQ، خرائط ذهنية، ملخصات، ملازم، ومؤقت دراسة — مجاناً."
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="mx-auto max-w-3xl px-5 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold leading-tight">أدوات الدراسة في منصة تميزك</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            مجموعة أدوات مجانية لطلاب السادس العلمي في العراق: مراجعة بالفلاش كاردات، بنك أسئلة وزارية
            مع الأجوبة، أسئلة اختيار من متعدد، خرائط ذهنية، ملخصات وملازم، وأدوات تنظيم الوقت.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"
          >
            ابدأ الآن مجاناً
          </a>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {PUBLIC_TOOLS.map((t) => (
            <li key={t.slug}>
              <a href={`/tools/${t.slug}`} className="block h-full rounded-2xl border border-border bg-card p-4">
                <h2 className="text-base font-bold leading-relaxed">{t.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {t.metaDescription}
                </p>
              </a>
            </li>
          ))}
        </ul>

        <footer className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          <a href="/ministerial-questions" className="underline">
            تصفّح الأسئلة الوزارية مع الأجوبة
          </a>
        </footer>
      </div>
    </main>
  );
};

export default ToolsIndex;
