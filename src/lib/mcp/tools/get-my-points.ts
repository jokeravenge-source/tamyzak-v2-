import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function getEnv(key: string): string | undefined {
  const g = globalThis as any;
  if (g.Deno) return g.Deno.env.get(key);
  return g.process?.env?.[key];
}

export default defineTool({
  name: "get_my_points",
  title: "Get my points",
  description: "Get the total points the signed-in user has earned.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input: unknown, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text" as const, text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(
      getEnv("SUPABASE_URL")!,
      getEnv("SUPABASE_PUBLISHABLE_KEY") ?? getEnv("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data, error } = await supabase
      .from("user_points")
      .select("points")
      .eq("user_id", ctx.getUserId());
    if (error) return { content: [{ type: "text" as const, text: error.message }], isError: true };
    const total = ((data ?? []) as Array<{ points?: number }>).reduce((s, r) => s + (r.points ?? 0), 0);
    return {
      content: [{ type: "text" as const, text: `Total points: ${total}` }],
      structuredContent: { total, entries: data?.length ?? 0 },
    };
  },
}) as any;