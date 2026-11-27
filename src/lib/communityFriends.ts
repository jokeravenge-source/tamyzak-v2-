import { supabase } from "@/integrations/supabase/client";
import type { DirectoryStudent } from "./studentDirectory";

export async function listCommunityFriends(ownerId: string, signal: AbortSignal): Promise<DirectoryStudent[]> {
  const { data, error } = await supabase.from("community_friends")
    .select("friend:profiles!community_friends_friend_id_fkey(user_id,display_name)")
    .eq("owner_id", ownerId)
    .order("friend_id")
    .abortSignal(signal);
  if (error) throw error;
  return (data ?? []).flatMap(({ friend }) => friend ? [friend] : [])
    .sort((first, second) => first.display_name.localeCompare(second.display_name));
}

export async function addCommunityFriend(ownerId: string, friendId: string) {
  const { error } = await supabase.from("community_friends")
    .upsert({ owner_id: ownerId, friend_id: friendId }, { onConflict: "owner_id,friend_id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeCommunityFriend(ownerId: string, friendId: string) {
  const { error } = await supabase.from("community_friends").delete()
    .eq("owner_id", ownerId).eq("friend_id", friendId);
  if (error) throw error;
}
