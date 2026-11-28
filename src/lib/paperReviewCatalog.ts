import { supabase } from "@/integrations/supabase/client";
import type { AppLanguage } from "@/components/LanguageGate";
import { readPaperExerciseSummary } from "../../supabase/functions/_shared/paperReview";
import type { PaperSubjectId } from "../../supabase/functions/_shared/paperReviewCurriculum";

type CatalogScope = { subject: PaperSubjectId; chapter: string } | { exerciseId: string };
type CatalogArgs = {
  _subject: PaperSubjectId | null;
  _chapter: string | null;
  _exercise_id: string | null;
  _language: AppLanguage;
};
type CatalogRpc = (name: "paper_review_catalog", args: CatalogArgs) => {
  abortSignal: (signal: AbortSignal) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

export async function readPaperCatalog(scope: CatalogScope, language: AppLanguage, signal: AbortSignal) {
  const args = "exerciseId" in scope
    ? { _subject: null, _chapter: null, _exercise_id: scope.exerciseId }
    : { _subject: scope.subject, _chapter: scope.chapter, _exercise_id: null };
  // Keep the new RPC signature local until the Supabase types are regenerated.
  const request = (supabase.rpc as unknown as CatalogRpc).call(supabase, "paper_review_catalog", { ...args, _language: language });
  const { data, error } = await request.abortSignal(signal);
  if (error || !Array.isArray(data)) throw new Error("catalog_unavailable");
  return data.map(readPaperExerciseSummary).filter(item => item !== null);
}
