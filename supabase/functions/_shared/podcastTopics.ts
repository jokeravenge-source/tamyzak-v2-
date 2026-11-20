export type PodcastTopic = { ar: string; en: string };

/** Validate the model boundary; never fall back to a document filename. */
export function readPodcastTopics(value: unknown): PodcastTopic[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { ar, en } = item as Record<string, unknown>;
    if (typeof ar !== "string" || typeof en !== "string") return [];
    const topic = { ar: ar.trim(), en: en.trim() };
    if (!topic.ar || !topic.en || topic.ar.length > 160 || topic.en.length > 160) return [];
    const key = `${topic.ar}:${topic.en}`.toLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [topic];
  }).slice(0, 12);
}
