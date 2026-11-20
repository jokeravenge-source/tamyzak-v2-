import { supabase } from "@/integrations/supabase/client";
import { readPodcastTopics, type PodcastTopic } from "../../supabase/functions/_shared/podcastTopics";

export type { PodcastTopic };

export async function loadPodcastTopics(sessionId: string, signal: AbortSignal, topic?: string): Promise<PodcastTopic[]> {
  const { data, error } = await supabase.functions.invoke("podcast-practice-topics", {
    body: { session_id: sessionId, ...(topic ? { topic } : {}) },
    signal,
  });
  if (error || data?.error) throw new Error("Could not resolve lesson concepts");
  const topics = readPodcastTopics(data?.topics);
  if (!topics.length) throw new Error("No lesson concepts");
  return topics;
}
