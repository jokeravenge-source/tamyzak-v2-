import { Helmet } from "react-helmet-async";
import SeoHead from "@/components/SeoHead";
import { PUBLIC_TOOLS, getPublicTool } from "@/data/publicTools";

const SITE_URL = "https://tamyazak.site";

const ToolLanding = ({ slug }: { slug: string }) => {
  const tool = getPublicTool(slug);
  if (!tool) return null;

  const related = PUBLIC_TOOLS.filter((t) => t.slug !== tool.slug).slice(0, 6);

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
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "تميزك", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "الأدوات", item: `${SITE_URL}/tools` },
          { "@type": "ListItem", position: 3, name: tool.title, item: `${SITE_URL}/tools/${tool.slug}` },
        ],
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
        <nav aria-label="مسار التنقل" className="mb-4 text-sm text-muted-foreground">
          <a href="/" className="underline">تميزك</a>
          {" / "}
          <a href="/tools" className="underline">الأدوات</a>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-extrabold leading-tight">{tool.title}</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">{tool.intro}</p>
          <a
            href="/"
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
            {related.map((t) => (
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
                href="/tools"
                className="inline-block rounded-full border border-border bg-card px-4 py-2 font-medium"
              >
                كل الأدوات
              </a>
            </li>
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
