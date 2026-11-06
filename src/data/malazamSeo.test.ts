import { describe, expect, it } from "vitest";
import {
  MALAZAM_SEO_CATEGORIES,
  MALAZAM_SEO_ITEMS,
  getMalazamSeoCategory,
  getMalazamSeoItem,
} from "./malazamSeo";

describe("Al-Malazam SEO catalog", () => {
  it("uses unique, URL-safe slugs", () => {
    const slugs = [...MALAZAM_SEO_CATEGORIES, ...MALAZAM_SEO_ITEMS].map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((slug) => expect(slug).toMatch(/^[a-z0-9-]+$/));
  });

  it("links every booklet to a real category", () => {
    MALAZAM_SEO_ITEMS.forEach((item) => {
      expect(getMalazamSeoCategory(item.subject), item.slug).toBeDefined();
      expect(item.title.length).toBeGreaterThan(20);
      expect(item.description).toContain("العلمي");
    });
  });

  it("resolves category and booklet deep links", () => {
    expect(getMalazamSeoCategory("physics")?.name).toBe("الفيزياء");
    expect(getMalazamSeoItem("haider-abdul-aemma-chapter-1")?.subject).toBe("math");
  });
});
