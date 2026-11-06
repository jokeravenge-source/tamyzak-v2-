import catalog from "./malazamSeo.json";

export type MalazamSeoCategory = {
  slug: string;
  name: string;
  title: string;
  description: string;
  telegramUrl: string;
};

export type MalazamSeoItem = {
  slug: string;
  subject: string;
  teacher: string;
  title: string;
  description: string;
};

export const MALAZAM_SEO_CATEGORIES = catalog.categories as MalazamSeoCategory[];
export const MALAZAM_SEO_ITEMS = catalog.items as MalazamSeoItem[];

export const getMalazamSeoItem = (slug: string | null | undefined) =>
  MALAZAM_SEO_ITEMS.find((item) => item.slug === slug);

export const getMalazamSeoCategory = (slug: string | null | undefined) =>
  MALAZAM_SEO_CATEGORIES.find((category) => category.slug === slug);

export const getMalazamItemsForSubject = (subject: string | null | undefined) =>
  MALAZAM_SEO_ITEMS.filter((item) => item.subject === subject);
