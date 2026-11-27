import type { CharacterTraits, Gender } from "@/components/CharacterAvatar";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getSignupSource } from "@/lib/analytics";
import { mergeAccessoryFitEdits, type AccessoryFitEdits, type CharacterAccessoryFits } from "@/lib/characterAccessoryFit";

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

export async function saveProfileAccessoryFit(userId: string, characterKey: string, edits: AccessoryFitEdits) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: profile, error: readError } = await supabase.from("profiles").select("character").eq("user_id", userId).maybeSingle();
    if (readError) throw readError;
    if (!profile) throw new Error("Profile unavailable");

    const previous = profile.character;
    const current = previous && typeof previous === "object" && !Array.isArray(previous) ? previous : {};
    const accessoryFits = mergeAccessoryFitEdits(current.accessoryFits as CharacterAccessoryFits | undefined, characterKey, edits);
    const character = { ...current, accessoryFits };
    const update = supabase.from("profiles").update({ character }).eq("user_id", userId);
    // Retry if another device changed the character while this fit was open.
    const unchanged = previous === null ? update.is("character", null) : update.eq("character", JSON.stringify(previous));
    const { data, error } = await unchanged.select("character").maybeSingle();
    if (error) throw error;
    if (data) {
      notifyProfileCharacterChanged(userId);
      return data.character as CharacterTraits;
    }
  }
  throw new Error("Character changed while saving");
}
