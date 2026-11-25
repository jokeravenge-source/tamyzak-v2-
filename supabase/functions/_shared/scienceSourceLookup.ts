import { readScienceSources, SCIENCE_ACADEMIC_YEAR, type ScienceSource } from "./scienceEvidence.ts";

export async function lookupScienceSources(question: string, curriculum: string, authorization: string): Promise<ScienceSource[]> {
  return fetchScienceSources("/rpc/search_science_sources", curriculum, authorization, {
    method: "POST",
    body: JSON.stringify({ question_text: question.slice(0, 6000), curriculum_key: curriculum, school_year: SCIENCE_ACADEMIC_YEAR }),
  });
}

export async function lookupScienceSourcesById(ids: unknown[], curriculum: string, authorization: string): Promise<ScienceSource[]> {
  const valid = [...new Set(ids.slice(0, 8).filter((id): id is string =>
    typeof id === "string" && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)).map(id => id.toLowerCase()))];
  if (!valid.length) return [];
  const query = new URLSearchParams({
    id: "in.(" + valid.join(",") + ")",
    verified: "eq.true",
    curriculum: "eq." + curriculum,
    academic_year: "eq." + SCIENCE_ACADEMIC_YEAR,
  });
  const sources = await fetchScienceSources("/science_sources?" + query, curriculum, authorization);
  return valid.flatMap(id => sources.filter(source => source.id === id));
}

async function fetchScienceSources(
  path: string,
  curriculum: string,
  authorization: string,
  init?: RequestInit,
): Promise<ScienceSource[]> {
  const base = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_ANON_KEY");
  if (!base || !key) return [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${base}/rest/v1${path}`, {
      ...init,
      headers: { Authorization: authorization, apikey: key, "Content-Type": "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return [];
    return readScienceSources(await response.json(), curriculum);
  } catch { return []; } finally { clearTimeout(timeout); }
}
