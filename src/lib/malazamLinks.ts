type MalzamaLinkSource = {
  id: string;
  name: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function slugifyMalzamaName(name: string) {
  return name
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110) || "malzama";
}

export function malzamaPath(item: MalzamaLinkSource) {
  return `/malazam/file/${item.id}/${encodeURIComponent(slugifyMalzamaName(item.name))}/`;
}

export function malzamaUrl(item: MalzamaLinkSource) {
  return `https://tamyazak.site${malzamaPath(item)}`;
}

export function parseMalzamaId(pathname: string) {
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (segments[0] !== "malazam" || segments[1] !== "file") return null;
  const id = segments[2] ?? "";
  return UUID_PATTERN.test(id) ? id : null;
}
