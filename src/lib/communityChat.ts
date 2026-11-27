import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Functions = Database["public"]["Functions"];
export type ChatPost = Functions["list_community_chat_posts"]["Returns"][number];
export type ChatComment = Functions["list_community_chat_comments"]["Returns"][number];
export type ChatCursor = { _before_id: string; _before_at: string };
export type ChatDraft = { id: string; body: string };

export const COMMUNITY_POST_LIMIT = 2000;
export const COMMUNITY_COMMENT_LIMIT = 1000;

function pageOf<Row extends { id: string; created_at: string }>(rows: Row[], size: number) {
  const items = rows.slice(0, size);
  const last = items.at(-1);
  return {
    items,
    next: rows.length > size && last ? { _before_id: last.id, _before_at: last.created_at } : null,
  };
}

export async function listChatPosts(before: ChatCursor | null, signal: AbortSignal) {
  const { data, error } = await supabase.rpc("list_community_chat_posts", before ?? {}).abortSignal(signal);
  if (error) throw error;
  return pageOf(data ?? [], 20);
}

export async function listChatComments(postId: string, before: ChatCursor | null, signal: AbortSignal) {
  const { data, error } = await supabase.rpc("list_community_chat_comments", { _post_id: postId, ...before }).abortSignal(signal);
  if (error) throw error;
  return pageOf(data ?? [], 30);
}

export async function createChatPost(authorId: string, draft: ChatDraft) {
  const { error } = await supabase.from("community_posts")
    .upsert({ ...draft, author_id: authorId }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function createChatComment(postId: string, authorId: string, draft: ChatDraft) {
  const { error } = await supabase.from("community_comments")
    .upsert({ ...draft, post_id: postId, author_id: authorId }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeChatEntry(kind: "post" | "comment", id: string) {
  const { error } = await supabase.from(kind === "post" ? "community_posts" : "community_comments").delete().eq("id", id);
  if (error) throw error;
}
