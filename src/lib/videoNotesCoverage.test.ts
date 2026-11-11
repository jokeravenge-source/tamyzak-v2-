import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as languageRules from "../../supabase/functions/_shared/lecture-question-language";

let handler: (request: Request) => Promise<Response>;
let modelRequest: any;
let finishReason: string;
let cacheFilter: string;
let saved: any[];
const finalNotes = "Final chapter: integration and its worked example.";

beforeEach(() => {
  finishReason = "tool_calls";
  cacheFilter = "";
  saved = [];
  const query = {
    select: () => query,
    eq: (_key: string, value: string) => { cacheFilter = value; return query; },
    maybeSingle: async () => ({ data: cacheFilter.includes("|seg-v5-argon|") ? null : { notes: "Old incomplete notes", parts: [] } }),
    upsert: async (row: any) => { saved.push(row); return { error: null }; },
  };
  const code = ts.transpileModule(readFileSync("supabase/functions/video-notes/index.ts", "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  runInNewContext(code, {
    exports: {}, Request, Response, URL, AbortController, setTimeout, clearTimeout,
    console: { error: vi.fn() },
    Deno: { env: { get: (key: string) => key === "SUPADATA_API_KEY" || key === "GEMINI_API_KEY" ? undefined : "test" }, serve: (fn: typeof handler) => { handler = fn; } },
    require(name: string) {
      if (name.includes("ai-gateway")) return {
        GatewayError: class GatewayError extends Error {},
        generateChatCompletion: async (payload: unknown) => {
          modelRequest = payload;
          return { choices: [{ finish_reason: finishReason, message: { tool_calls: [{ type: "function", function: { name: "submit_video_notes", arguments: JSON.stringify({ parts: [{ title: "Full lecture", notes: finalNotes }] }) } }] } }] };
        },
      };
      if (name.includes("supabase-js")) return { createClient: () => ({ from: () => query }) };
      if (name.endsWith("/auth.ts")) return { requireUser: async () => ({ ok: true, userId: "student" }) };
      if (name.endsWith("/guard.ts")) return { protect: async () => ({ ok: true }) };
      if (name.endsWith("/entitlement.ts")) return { claimFeature: async () => ({ ok: true }) };
      if (name.endsWith("/lecture-question-language.ts")) return languageRules;
      throw new Error(`Unexpected dependency ${name}`);
    },
    fetch: async (url: string, init?: RequestInit) => {
      if (url.includes("youtube.com/watch")) return new Response('"captionTracks":[{"baseUrl":"https://captions.test","languageCode":"ar"}],"audioTracks"');
      if (url.includes("captions.test")) return Response.json({ events: [{ segs: [{ utf8: "Beginning and final chapter" }] }] });
      modelRequest = JSON.parse(String(init?.body));
      return Response.json({ choices: [{ finish_reason: finishReason, message: { tool_calls: [{ function: { arguments: JSON.stringify({ parts: [{ title: "Full lecture", notes: finalNotes }] }) } }] } }] });
    },
  });
});

const request = (body: Record<string, unknown>) => new Request("https://example.test/video-notes", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

describe("Full video notes coverage", () => {
  it("uses the frontier video-capable model without an optional output cap", async () => {
    await handler(request({ transcript: "Full lecture", language: "ar" }));
    expect(modelRequest.model).toBe("google/gemini-4-argon");
    expect(modelRequest).not.toHaveProperty("max_tokens");
    expect(modelRequest).not.toHaveProperty("max_completion_tokens");
  });

  it("splits a long transcript into sections and the last section contains the final chapter", async () => {
    const transcript = "Opening. " + "Lecture detail. ".repeat(10000) + "FINAL_CHAPTER_INTEGRATION";
    const first = await (await handler(request({ transcript, language: "ar", segment: 0 }))).json();
    expect(first.totalSegments).toBe(14);
    expect(first.done).toBe(false);
    expect(first.transcript).toBe(transcript);
    const last = await (await handler(request({ transcript, language: "ar", segment: 13 }))).json();
    expect(last.done).toBe(true);
    expect(modelRequest.messages[1].content).toContain("FINAL_CHAPTER_INTEGRATION");
  });

  it("does not reuse older partial video notes and caches the corrected result", async () => {
    const response = await handler(request({ url: "https://www.youtube.com/watch?v=lecture123", language: "ar" }));
    expect((await response.json()).notes).toContain(finalNotes);
    expect(saved).toHaveLength(1);
    expect(saved[0].cache_key).toBe("lecture123|ar|std|seg-v5-argon|0");
  });

  it("gives each raw-video section a 10-minute window", async () => {
    await handler(request({ url: "https://example.com/lecture.mp4", language: "ar", segment: 1 }));
    const content = modelRequest.messages[1].content;
    const text = Array.isArray(content) ? content[0].text : content;
    expect(text).toContain("from minute 10:00 to minute 20:00");
  });

  it("rejects token-truncated output instead of showing it as complete notes", async () => {
    finishReason = "length";
    const response = await handler(request({ transcript: "Entire lecture", language: "ar" }));
    expect(response.status).toBe(502);
    expect((await response.json()).retryable).toBe(false);
    expect(saved).toHaveLength(0);
  });
});