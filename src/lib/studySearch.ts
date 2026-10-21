/** Match common Arabic spellings and diacritics as well as English text. */
export function normalizeStudySearch(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "")
    .replace(/ـ/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي")
    .replace(/ة/g, "ه").toLocaleLowerCase().trim();
}
