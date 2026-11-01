// Exercise the real Edge Function handler with local auth, database and model
// boundaries. No live AI credentials or production writes are used by tests.
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as questions from "../../supabase/functions/_shared/lecture-question-language";
import * as sources from "../../supabase/functions/_shared/nadia-lecture-note-sources";

const id = "00000000-0000-4000-8000-000000000001";
const original = "## Review Questions\n1. ما الخلية؟\n\n**الإجابة:** الخلية هي وحدة الحياة.";
const expected = "## Review Questions\n1. What is a cell?\n\n**الإجابة:** الخلية هي وحدة الحياة.";
let handler: (request: Request) => Promise<Response>;
let rows: any[];
let cache: Map<string, any>;
let authorize: ReturnType<typeof vi.fn>;
let generate: ReturnType<typeof vi.fn>;
let save: ReturnType<typeof vi.fn>;

function request(chapter = 1) {
  return new Request("https://example.test/english-lecture-questions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer student" },
    body: JSON.stringify({ topicKey: `nadia-en-ch${chapter}-lec1-study`, sourceIds: [id] }),
  });
}
function source(topicKey: string) {
  return { id, teacher_id: "nadia-al-nuaimy", topic_key: topicKey, approved: true,
    notes_parts: [{ title: "ملاحظات", notes: original }] };
}

beforeEach(() => {
  rows = [source("nadia-en-ch1-lec1-study")];
  cache = new Map();
  authorize = vi.fn(async () => ({ ok: true, userId: "student" }));
  save = vi.fn(async (record: any) => { cache.set(record.source_hash, record); return { error: null }; });
  generate = vi.fn(async () => ({ choices: [{ message: { tool_calls: [{ type: "function", function: {
    arguments: JSON.stringify({ edits: [{ source: "ما الخلية؟", english: "What is a cell?" }] }),
  } }] } }] }));
  const database = { from(table: string) {
    const filters: Array<(row: any) => boolean> = [];
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => { filters.push((row) => row[key] === value); return query; },
      in: (key: string, values: unknown[]) => { filters.push((row) => values.includes(row[key])); return query; },
      maybeSingle: async () => ({ data: [...cache.values()].find((row) => filters.every((filter) => filter(row))) ?? null, error: null }),
      upsert: save,
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({
        data: table === "teacher_topic_videos" ? rows.filter((row) => filters.every((filter) => filter(row))) : [], error: null,
      }).then(resolve),
    };
    return query;
  } };
  const code = ts.transpileModule(readFileSync("supabase/functions/english-lecture-questions/index.ts", "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  runInNewContext(code, {
    exports: {}, TextEncoder, crypto: webcrypto, Response, console: { error: vi.fn() },
    Deno: { env: { get: () => "test" }, serve: (fn: typeof handler) => { handler = fn; } },
    require(name: string) {
      if (name.includes("supabase-js")) return { createClient: () => database };
      if (name.startsWith("npm:@lovable.dev/ai-gateway")) return { generateChatCompletion: generate, GatewayError: class extends Error {} };
      if (name.endsWith("/auth.ts")) return { requireUser: authorize };
      if (name.endsWith("/guard.ts")) return { protect: async () => ({ ok: true }) };
      if (name.endsWith("/lecture-question-language.ts")) return questions;
      if (name.endsWith("/nadia-lecture-note-sources.ts")) return sources;
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
});

describe("English lecture question Edge Function", () => {
  it.each([1, 2, 3, 4, 5])("translates approved English notes in chapter %s", async (chapter) => {
    rows = [source(`nadia-en-ch${chapter}-lec1-study`)];
    const response = await handler(request(chapter));
    expect(response.status).toBe(200);
    expect((await response.json()).parts[0].notes).toBe(expected);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("translates permitted Arabic fallback notes without writing to the source row", async () => {
    rows = [source("nadia-ar-ch2-lec2-study")];
    expect((await handler(request(2))).status).toBe(200);
    expect(rows[0].notes_parts[0].notes).toBe(original);
    expect([...cache.values()][0].notes_parts[0].notes).toBe(expected);
  });

  it("reuses cached translations and invalidates them when source notes change", async () => {
    expect((await handler(request())).status).toBe(200);
    expect((await handler(request())).status).toBe(200);
    expect(generate).toHaveBeenCalledTimes(1);
    rows[0].notes_parts[0].notes += "\nشرح إضافي محفوظ.";
    const updated = await handler(request());
    expect(updated.status).toBe(200);
    expect((await updated.json()).parts[0].notes).toBe(`${expected}\nشرح إضافي محفوظ.`);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(cache.size).toBe(2);
  });

  it("requires a signed-in user", async () => {
    authorize.mockResolvedValue({ ok: false, error: "Sign in", status: 401 });
    expect((await handler(request())).status).toBe(401);
    expect(generate).not.toHaveBeenCalled();
  });

  it.each(["unapproved", "wrong topic", "wrong teacher"])("rejects %s source notes", async (reason) => {
    if (reason === "unapproved") rows[0].approved = false;
    if (reason === "wrong topic") rows[0].topic_key = "nadia-ar-ch5-lec1-study";
    if (reason === "wrong teacher") rows[0].teacher_id = "another-teacher";
    expect((await handler(request())).status).toBe(404);
    expect(generate).not.toHaveBeenCalled();
  });

  it("does not save a model response that leaves Arabic questions behind", async () => {
    generate.mockResolvedValue({ choices: [{ message: { tool_calls: [{ type: "function", function: { arguments: '{"edits":[]}' } }] } }] });
    expect((await handler(request())).status).toBe(502);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(save).not.toHaveBeenCalled();
  });
});
