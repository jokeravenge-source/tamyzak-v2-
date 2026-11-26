import type { CharacterTraits, Gender } from "@/components/CharacterAvatar";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getSignupSource } from "@/lib/analytics";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type CharacterRow = Pick<Profile, "gender" | "character">;
export type ProfileCharacter = { gender: Gender; traits: Partial<CharacterTraits> | null };

const columns = "gender, character";
export const PROFILE_CHARACTER_CHANGED = "app:profile-character-changed";

export function notifyProfileCharacterChanged(userId: string) {
  window.dispatchEvent(new CustomEvent(PROFILE_CHARACTER_CHANGED, { detail: userId }));
}

function readCharacter(profile: CharacterRow | null): ProfileCharacter | null {
  if (!profile) return null;
  const { gender, character } = profile;
  const traits = character && typeof character === "object" && !Array.isArray(character) && Object.keys(character).length
    ? character as Partial<CharacterTraits>
    : null;
  if (gender !== "male" && gender !== "female" && !traits) return null;
  return { gender: gender === "female" ? "female" : "male", traits };
}

export async function loadProfileCharacter(userId: string) {
  const { data, error } = await supabase.from("profiles").select(columns).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return readCharacter(data);
}

export async function saveInitialProfileCharacter(userId: string, gender: Gender, traits: CharacterTraits) {
  const { data: inserted, error: insertError } = await supabase.from("profiles")
    .upsert({ user_id: userId, gender, character: traits, source: getSignupSource() }, { onConflict: "user_id", ignoreDuplicates: true })
    .select(columns).maybeSingle();
  if (insertError) throw insertError;
  if (inserted) return { gender, traits };

  // An initial selection must never overwrite a character saved on another device.
  const { data: updated, error: updateError } = await supabase.from("profiles")
    .update({ gender, character: traits }).eq("user_id", userId).is("gender", null)
    .or("character.is.null,character.eq.{}").select(columns).maybeSingle();
  if (updateError) throw updateError;
  if (updated) return { gender, traits };

  const existing = await loadProfileCharacter(userId);
  if (existing) return existing;
  throw new Error("Character could not be saved");
}
