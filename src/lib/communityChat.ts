import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Functions = Database["public"]["Functions"];
export type ChatPost = Functions["list_community_chat_posts_v2"]["Returns"][number];
export type ChatComment = Functions["list_community_chat_comments"]["Returns"][number];
export type ChatReactionSummary = Functions["set_community_chat_reaction"]["Returns"][number];
export type ChatReaction = NonNullable<ChatReactionSummary["viewer_reaction"]>;
export type ChatCursor = { _before_id: string; _before_at: string };
export type ChatDraft = { id: string; body: string };
export type ChatPostDraft = ChatDraft & { photos?: File[] };

export const COMMUNITY_POST_LIMIT = 2000;
export const COMMUNITY_COMMENT_LIMIT = 1000;
export const CHAT_PHOTO_LIMIT = 4;
export const CHAT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const photoExtensions = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
export const CHAT_PHOTO_ACCEPT = Array.from(photoExtensions.keys()).join(",");
const CHAT_PHOTO_BUCKET = "community-chat-photos";

export function isChatPhoto(file: File) {
  return photoExtensions.has(file.type) && file.size > 0 && file.size <= CHAT_PHOTO_MAX_BYTES;
}

function pageOf<Row extends { id: string; created_at: string }>(rows: Row[], size: number) {
  const items = rows.slice(0, size);
  const last = items.at(-1);
  return {
    items,
    next: rows.length > size && last ? { _before_id: last.id, _before_at: last.created_at } : null,
  };
}

export async function listChatPosts(before: ChatCursor | null, signal: AbortSignal) {
  const { data, error } = await supabase.rpc("list_community_chat_posts_v2", before ?? {}).abortSignal(signal);
  if (error) throw error;
  return pageOf(data ?? [], 20);
}

export async function listChatComments(postId: string, before: ChatCursor | null, signal: AbortSignal) {
  const { data, error } = await supabase.rpc("list_community_chat_comments", { _post_id: postId, ...before }).abortSignal(signal);
  if (error) throw error;
  return pageOf(data ?? [], 30);
}

export async function createChatPost(authorId: string, { id, body, photos = [] }: ChatPostDraft) {
  if (photos.length > CHAT_PHOTO_LIMIT || photos.some(file => !isChatPhoto(file))) throw new Error("INVALID_CHAT_PHOTOS");
  const photoPaths = photos.map((photo, index) => `${authorId}/${id}/${index + 1}.${photoExtensions.get(photo.type)}`);
  if (photoPaths.length) {
    const bucket = supabase.storage.from(CHAT_PHOTO_BUCKET);
    try {
      for (const [index, path] of photoPaths.entries()) {
        const { error } = await bucket.upload(path, photos[index], {
          contentType: photos[index].type,
          upsert: false,
          cacheControl: "3600",
        });
        if (!error) continue;
        // The same immutable paths let a retry finish after an interrupted upload.
        const stored = await bucket.exists(path);
        if (!stored.data) throw error;
      }
    } catch (error) {
      await bucket.remove(photoPaths).catch(() => {});
      throw error;
    }
  }
  const { error } = await supabase.from("community_posts")
    .upsert({ id, body, author_id: authorId, photo_paths: photoPaths }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function createChatComment(postId: string, authorId: string, { id, body }: ChatDraft) {
  const { error } = await supabase.from("community_comments")
    .upsert({ id, body, post_id: postId, author_id: authorId }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeChatEntry(kind: "post" | "comment", id: string) {
  if (kind === "post") {
    const { data, error } = await supabase.from("community_posts").delete().eq("id", id).select("photo_paths").maybeSingle();
    if (error) throw error;
    if (data?.photo_paths.length) await supabase.storage.from(CHAT_PHOTO_BUCKET).remove(data.photo_paths).catch(() => {});
    return;
  }
  const { error } = await supabase.from("community_comments").delete().eq("id", id);
  if (error) throw error;
}

export async function getChatPhotoUrls(paths: string[]) {
  const { data, error } = await supabase.storage.from(CHAT_PHOTO_BUCKET).createSignedUrls(paths, 3600);
  if (error) throw error;
  return Object.fromEntries((data ?? []).flatMap(photo => photo.path && photo.signedUrl ? [[photo.path, photo.signedUrl]] : []));
}

export async function setChatReaction(postId: string, reaction: ChatReaction | null) {
  const { data, error } = await supabase.rpc("set_community_chat_reaction", { _post_id: postId, _reaction: reaction }).single();
  if (error || !data) throw error ?? new Error("REACTION_NOT_SAVED");
  return data;
}
