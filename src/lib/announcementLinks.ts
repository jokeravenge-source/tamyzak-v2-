/**
 * Normalize an optional announcement destination while blocking unsafe URL
 * schemes. Relative paths keep students inside Tamayzak; bare domains are
 * promoted to HTTPS for easier admin entry.
 */
export const normalizeAnnouncementLink = (rawValue: string): string | null => {
  const value = rawValue.trim();
  if (!value) return null;

  if (value.startsWith("//")) return null;
  if (value.startsWith("/")) return value;

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? candidate : null;
  } catch {
    return null;
  }
};

export const isExternalAnnouncementLink = (url: string): boolean =>
  !url.startsWith("/");
