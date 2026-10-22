import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AhmedFlashcardOverride } from "@/lib/ahmedFlashcardOverrides";

export const ahmedOverridesKey = ["ahmed-flashcard-overrides"];

export function useAhmedFlashcardOverrides() {
  return useQuery({
    queryKey: ahmedOverridesKey,
    queryFn: async () => {
      const rows: AhmedFlashcardOverride[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase.from("ahmed_flashcard_overrides")
          .select("chapter,language,card_id,question,answer,deleted")
          .order("chapter").order("language").order("card_id").range(offset, offset + 999);
        if (error) throw error;
        rows.push(...data);
        if (data.length < 1000) return rows;
      }
    },
    staleTime: 0,
  });
}