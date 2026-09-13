import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_chapters",
  title: "List chapters for a subject",
  description: "List uploaded chapter folders available for a given subject.",
  inputSchema: {
    subject: z.string().min(1).describe("Subject id, e.g. physics, chemistry, biology."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ subject }: { subject: string }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text" as const, text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data, error } = await supabase.rpc("list_subject_chapters", { _subject: subject });
    if (error) return { content: [{ type: "text" as const, text: error.message }], isError: true };
    const chapters = ((data ?? []) as Array<{ chapter: string }>).map((r) => r.chapter);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(chapters, null, 2) }],
      structuredContent: { subject, chapters },
    };
  },
}) as any;