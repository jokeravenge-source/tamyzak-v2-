import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_my_todos",
  title: "Get my todos",
  description: "Get the signed-in user's current todo list items.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input: unknown, ctx: ToolContext) => {
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
    const { data, error } = await supabase
      .from("student_todos")
      .select("items, updated_at, week_key")
      .eq("user_id", ctx.getUserId())
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return { content: [{ type: "text" as const, text: error.message }], isError: true };
    const items = (data?.items as unknown) ?? [];
    return {
      content: [{ type: "text" as const, text: JSON.stringify(items, null, 2) }],
      structuredContent: { items, updated_at: data?.updated_at ?? null, week_key: data?.week_key ?? null },
    };
  },
}) as any;