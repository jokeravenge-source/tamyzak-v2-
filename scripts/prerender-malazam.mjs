import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(projectRoot, "dist");
const catalog = JSON.parse(await readFile(path.join(projectRoot, "src/data/malazamSeo.json"), "utf8"));
const template = await readFile(path.join(distDir, "index.html"), "utf8");
const siteUrl = "https://tamyazak.site";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const staticStyles = `
  <style>
    .seo-shell{min-height:100vh;background:#0b1020;color:#f8fafc;font-family:Cairo,Arial,sans-serif;padding:64px 20px;direction:rtl}
    .seo-wrap{max-width:960px;margin:auto}.seo-badge{color:#a78bfa;font-weight:700}.seo-shell h1{font-size:clamp(2rem,6vw,4rem);line-height:1.25;margin:16px 0}.seo-shell p{color:#cbd5e1;line-height:2;max-width:760px}
    .seo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:32px}.seo-card{display:block;color:#f8fafc;text-decoration:none;border:1px solid #334155;border-radius:18px;padding:20px;background:#151c35}.seo-card:hover{border-color:#8b5cf6}.seo-card small{display:block;color:#94a3b8;margin-top:8px;line-height:1.7}.seo-cta{display:inline-block;margin-top:26px;background:#8b5cf6;color:white;text-decoration:none;padding:13px 24px;border-radius:14px;font-weight:700}
  </style>`;

const categoryFor = (item) => catalog.categories.find((category) => category.slug === item.subject);

function renderCards(entries) {
  return entries.map((entry) => `
    <a class="seo-card" href="/malazam/${escapeHtml(entry.slug)}/">
      <strong>${escapeHtml(entry.name ?? entry.title)}</strong>
      <small>${escapeHtml(entry.description)}</small>
    </a>`).join("");
}

function pageData(resource) {
  if (!resource) {
    return {
      path: "/malazam/",
      title: "ملازم السادس العلمي 2027 PDF | تميزك",
      description: "تصفح ملازم السادس العلمي 2027 لجميع المواد والأساتذة في العراق، مرتبة حسب المادة والفصل على منصة تميزك.",
      body: `<span class="seo-badge">منصة تميزك التعليمية</span><h1>ملازم السادس العلمي 2027 PDF</h1><p>اختر المادة أو الملزمة التي تبحث عنها. جمعنا روابط الملازم وملفات الدراسة والمراجعة في صفحات واضحة وسريعة لطلاب السادس العلمي في العراق.</p><h2>الملازم حسب المادة</h2><div class="seo-grid">${renderCards(catalog.categories)}</div><h2>ملازم مختارة</h2><div class="seo-grid">${renderCards(catalog.items)}</div>`,
      schemaType: "CollectionPage",
    };
  }

  if (resource.kind === "category") {
    const items = catalog.items.filter((item) => item.subject === resource.slug);
    return {
      path: `/malazam/${resource.slug}/`,
      title: `${resource.title} | تميزك`,
      description: resource.description,
      body: `<a class="seo-badge" href="/malazam/">الملازم</a><h1>${escapeHtml(resource.title)}</h1><p>${escapeHtml(resource.description)}</p><a class="seo-cta" href="${escapeHtml(resource.telegramUrl)}">افتح ملفات ${escapeHtml(resource.name)}</a>${items.length ? `<h2>ملازم ${escapeHtml(resource.name)}</h2><div class="seo-grid">${renderCards(items)}</div>` : ""}`,
      schemaType: "CollectionPage",
    };
  }

  const category = categoryFor(resource);
  const related = catalog.items.filter((item) => item.subject === resource.subject && item.slug !== resource.slug);
  return {
    path: `/malazam/${resource.slug}/`,
    title: `${resource.title} PDF | تميزك`,
    description: resource.description,
    body: `<a class="seo-badge" href="/malazam/${escapeHtml(category.slug)}/">ملازم ${escapeHtml(category.name)}</a><h1>${escapeHtml(resource.title)}</h1><p>${escapeHtml(resource.description)}</p>${resource.teacher ? `<p>إعداد: <strong>${escapeHtml(resource.teacher)}</strong></p>` : ""}<a class="seo-cta" href="${escapeHtml(category.telegramUrl)}">افتح ملفات ${escapeHtml(category.name)}</a>${related.length ? `<h2>ملازم مشابهة</h2><div class="seo-grid">${renderCards(related)}</div>` : ""}`,
    schemaType: "LearningResource",
    teacher: resource.teacher,
  };
}

function buildHtml(data) {
  const canonical = `${siteUrl}${data.path}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": data.schemaType,
    name: data.title.replace(" | تميزك", ""),
    description: data.description,
    url: canonical,
    inLanguage: "ar",
    educationalLevel: "السادس العلمي",
    provider: { "@type": "Organization", name: "تميزك", url: `${siteUrl}/` },
    ...(data.teacher ? { author: { "@type": "Person", name: data.teacher } } : {}),
  };

  let html = template
    .replace('<html lang="en">', '<html lang="ar" dir="rtl">')
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(data.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(data.description)}">`)
    .replace("</head>", `<link rel="canonical" href="${canonical}"><meta property="og:title" content="${escapeHtml(data.title)}"><meta property="og:description" content="${escapeHtml(data.description)}"><meta property="og:url" content="${canonical}">${staticStyles}<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script></head>`)
    .replace('<div id="root"></div>', `<div id="root"><main class="seo-shell"><div class="seo-wrap">${data.body}</div></main></div>`);
  return html;
}

const pages = [
  pageData(null),
  ...catalog.categories.map((category) => pageData({ ...category, kind: "category" })),
  ...catalog.items.map((item) => pageData({ ...item, kind: "item" })),
];

for (const page of pages) {
  const relative = page.path.slice(1);
  const outputDir = path.join(distDir, relative);
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), buildHtml(page));
}

const sitemapPath = path.join(distDir, "sitemap.xml");
let sitemap = await readFile(sitemapPath, "utf8");
const missingUrls = pages
  .filter((page) => !sitemap.includes(`<loc>${siteUrl}${page.path}</loc>`))
  .map((page) => `  <url>\n    <loc>${siteUrl}${page.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`)
  .join("\n");
if (missingUrls) sitemap = sitemap.replace("</urlset>", `${missingUrls}\n</urlset>`);
await writeFile(sitemapPath, sitemap);

console.log(`Pre-rendered ${pages.length} Al-Malazam SEO pages.`);
