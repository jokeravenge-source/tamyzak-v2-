import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import { PUBLIC_TOOLS } from "@/data/publicTools";
import { applyTheme, getInitialTheme } from "@/components/ThemePicker";

const SITE_URL = "https://tamyazak.site";
const GROUPS = [
  { id: "all", label: "كل الأدوات" },
  { id: "study", label: "مراجعة وحفظ" },
  { id: "organize", label: "تنظيم الدراسة" },
  { id: "subjects", label: "مواد وأدوات" },
] as const;

const groupFor = (slug: string) => {
  if (["flashcards", "ministerial-bank", "mcq", "mind-map", "summaries", "malazam"].includes(slug)) return "study";
  if (["sessions", "leaderboard", "missions", "todo", "daily-report", "advices", "news"].includes(slug)) return "organize";
  return "subjects";
};

/** Public hub listing every Tamayzak study tool — crawlable, no auth. */
const ToolsIndex = () => {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<(typeof GROUPS)[number]["id"]>("all");

  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ar");
    return PUBLIC_TOOLS.filter((tool) => {
      const matchesGroup = activeGroup === "all" || groupFor(tool.slug) === activeGroup;
      const matchesQuery = !normalized || `${tool.title} ${tool.metaDescription}`.toLocaleLowerCase("ar").includes(normalized);
      return matchesGroup && matchesQuery;
    });
  }, [activeGroup, query]);

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

      <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
        <header className="mb-8 sm:mb-10">
          <p className="mb-3 text-sm font-semibold text-primary">منصة تميزك</p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">أدوات الدراسة في مكان واحد.</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            مجموعة أدوات مجانية لطلاب السادس العلمي في العراق: مراجعة بالفلاش كاردات، بنك أسئلة وزارية
            مع الأجوبة، أسئلة اختيار من متعدد، خرائط ذهنية، ملخصات وملازم، وأدوات تنظيم الوقت.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            ابدأ الآن مجاناً
          </a>
        </header>

        <div className="mb-5 rounded-2xl bg-muted/60 p-2 sm:p-3">
          <label className="flex min-h-12 items-center gap-3 rounded-xl bg-background px-4 text-muted-foreground ring-1 ring-border focus-within:ring-2 focus-within:ring-primary">
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
            <span className="sr-only">ابحث عن أداة</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن أداة دراسية..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="تصفية الأدوات">
          {GROUPS.map((group) => {
            const selected = activeGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveGroup(group.id)}
                className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"}`}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        {filteredTools.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((t) => (
            <li key={t.slug}>
              <a
                href={`/tools/${t.slug}`}
                className="group block h-full rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <h2 className="text-base font-bold leading-relaxed text-foreground">{t.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {t.metaDescription}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">استكشف الأداة ←</span>
              </a>
            </li>
          ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-muted/60 px-5 py-8 text-center text-sm text-muted-foreground" role="status">
            ما لقينا أدوات تطابق بحثك. جرّب كلمة ثانية.
          </p>
        )}

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
