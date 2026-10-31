import { protect } from "../_shared/guard.ts";
import { requireUser } from "../_shared/auth.ts";
import { generateChatCompletion, GatewayError, type GeminiChatMessage } from "npm:@lovable.dev/ai-gateway@0.1.11";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_MODEL = "google/gemini-3.8-flash";
const MAX_CHARS = 180000;

const SYSTEM_PROMPT = `You are a scientific information architect. Build a comprehensive hierarchical mind map STRICTLY from the uploaded PDF content.

SOURCE FIDELITY
- Use only facts explicitly supported by the supplied source text or page images. Never add outside knowledge, assumptions, corrections, or invented examples.
- Preserve the source's scientific meaning, terminology, numbers, formulas, symbols, units, qualifications, and uncertainty.
- Write in the primary language used by the source.

SCIENTIFIC SCOPE
- Include all substantive scientific material present: definitions, concepts, classifications, structures, components, functions, mechanisms, processes, ordered steps, relationships, causes and effects, conditions, variables, formulas, equations, units, quantitative values, comparisons, exceptions, examples, experiments, observations, results, interpretations, and conclusions.
- Exclude non-scientific filler such as author biographies, publisher details, navigation, page furniture, advertisements, acknowledgements, and repeated headers or footers.
- Include an exercise or question only when its scientific explanation or answer adds source-backed knowledge; omit instructions, scoring, and administrative wording.

NODE QUALITY
- Infer a concise scientific title for the root from the PDF itself; no user-supplied topic exists.
- Organize the material into a clear hierarchy without dropping unique scientific information or repeating the same fact across nodes.
- Give every substantive node a short, specific label and a detailed, self-contained \`info\` field containing everything the PDF states about that concept. Do not reduce details to vague keywords or arbitrary 1-3 sentence summaries.
- Keep structural grouping nodes to a minimum. If a grouping node has source-backed scientific meaning, include that meaning in \`info\` too.
- Split genuinely different concepts into child nodes so blocks remain readable, but do not omit details to make the map shorter.
- Every non-root node must reference its parent's ID. Use stable, unique string IDs.

If the source contains no scientific content, return an empty \`nodes\` array. Return only raw JSON matching the schema.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const guard = await protect(req, "generate-mindmap", { max: 6, windowSeconds: 60 });
  if (!guard.ok) return new Response(JSON.stringify({ error: guard.error }), { status: guard.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { context, pageImages } = await req.json();

    const ctx = typeof context === "string" ? context.slice(0, MAX_CHARS) : "";
    const images: string[] = Array.isArray(pageImages)
      ? pageImages.filter((s: unknown): s is string => typeof s === "string" && s.startsWith("data:image/")).slice(0, 12)
      : [];
    if (!ctx.trim() && images.length === 0) {
      return new Response(
        JSON.stringify({ error: "No source material provided. Mind maps must be built only from the uploaded PDF." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const instructions = "Create the complete scientific mind map directly from this PDF material. Check the entire supplied source before organizing the hierarchy, and retain every unique source-backed scientific detail.";
    type UserContentParts = Exclude<Extract<GeminiChatMessage, { role: "user" }>["content"], string>;
    const userContent: UserContentParts = [{ type: "text", text: instructions }];
    if (ctx.trim()) {
      userContent.push({ type: "text", text: `=== SOURCE TEXT START ===\n${ctx}\n=== SOURCE TEXT END ===` });
    }
    for (const img of images) {
      userContent.push({ type: "image_url", image_url: { url: img } });
    }

    const data = await generateChatCompletion({
        model: AI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        max_tokens: 16000,
        tools: [
          {
            type: "function",
            function: {
              name: "submit_mindmap",
              description: "Submit the hierarchical mind map nodes",
              parameters: {
                type: "object",
                properties: {
                  nodes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { type: "string" },
                        label: { type: "string" },
                        parentId: { type: "string" },
                        info: { type: "string", description: "Complete source-backed scientific detail for this concept" },
                      },
                      required: ["id", "type", "label", "info"],
                    },
                  },
                },
                required: ["nodes"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_mindmap" } },
    });
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No mind map generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const status = e instanceof GatewayError ? e.httpStatus ?? 500 : 500;
    console.error("Mind map generation failed", e instanceof GatewayError ? { code: e.code, status, ids: e.ids } : { message: String(e) });
    const message = status === 429 ? "AI is busy. Please try again shortly."
      : status === 402 ? "AI credits are unavailable. Please contact the site owner."
      : "Could not generate the mind map. Please try again or use a smaller PDF.";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
