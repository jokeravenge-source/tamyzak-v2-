import { readScienceSources, SCIENCE_ACADEMIC_YEAR, type ScienceSource } from "./scienceEvidence.ts";

export async function lookupScienceSources(question: string, curriculum: string, authorization: string): Promise<ScienceSource[]> {
  const base = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_ANON_KEY");
  if (!base || !key) return [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${base}/rest/v1/rpc/search_science_sources`, {
      method: "POST", headers: { Authorization: authorization, apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ question_text: question.slice(0, 6000), curriculum_key: curriculum, school_year: SCIENCE_ACADEMIC_YEAR }), signal: controller.signal,
    });
    if (!response.ok) return [];
    return readScienceSources(await response.json(), curriculum);
  } catch { return []; } finally { clearTimeout(timeout); }
}
