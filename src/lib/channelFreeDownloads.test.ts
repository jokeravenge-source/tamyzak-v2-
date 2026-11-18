import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ModuleKind, ScriptTarget, transpileModule } from "typescript";
import { beforeEach, describe, expect, it, vi } from "vitest";

type AuthResult = { ok: boolean; userId?: string; status?: number; error?: string };
const auth = vi.fn(async (): Promise<AuthResult> => ({ ok: true, userId: "student-1" }));
const protect = vi.fn(async () => ({ ok: true, status: 200, error: "" }));
const sign = vi.fn(async () => ({ data: { signedUrl: "https://example.test/signed?token=short" }, error: null as { message: string } | null }));
const record = vi.fn(async () => ({ error: null }));
const book = { id: "12345678-1234-4123-8123-123456789abc", name: "ملزمة الفصل الأول", file_path: "physics/chapter-1.pdf", is_published: true };
let item: typeof book | null;
const from = vi.fn((table: string) => {
  if (table === "malazam") {
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: item, error: null }) };
    return query;
  }
  if (table === "malazam_downloads") return { insert: record };
  throw new Error(`Unexpected table access: ${table}`);
});
const createClient = vi.fn(() => ({ from, storage: { from: (bucket: string) => {
  if (bucket !== "malazam-files") throw new Error("Wrong bucket");
  return { createSignedUrl: sign };
} } }));

/** Execute the actual Deno handler with injected auth/storage instead of network imports. */
function loadHandler(name: "malazam-download" | "telegram-channel-check") {
  let handler: ((request: Request) => Promise<Response>) | undefined;
  const source = readFileSync(join(process.cwd(), "supabase/functions", name, "index.ts"), "utf8").replace(/^import .+;\r?$/gm, "");
  const compiled = transpileModule(source, { compilerOptions: { module: ModuleKind.None, target: ScriptTarget.ES2022 } }).outputText;
  new Function("Deno", "requireUser", "protect", "createClient", "corsHeaders", compiled)(
    { serve: (fn: typeof handler) => { handler = fn; }, env: { get: () => "test-config" } },
    auth, protect, createClient, { "Access-Control-Allow-Origin": "*" },
  );
  if (!handler) throw new Error("Handler was not registered");
  return handler;
}
const request = (body: Record<string, unknown>) => new Request("https://example.test/function", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => {
  item = { ...book };
  auth.mockReset().mockResolvedValue({ ok: true, userId: "student-1" });
  protect.mockReset().mockResolvedValue({ ok: true, status: 200, error: "" });
  sign.mockReset().mockResolvedValue({ data: { signedUrl: "https://example.test/signed?token=short" }, error: null });
  record.mockClear(); from.mockClear(); createClient.mockClear();
});

describe("downloads without Telegram membership", () => {
  it("signs a published PDF for a signed-in user without reading Telegram records", async () => {
    const response = await loadHandler("malazam-download")(request({ malzamaId: book.id }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, downloadUrl: `https://example.test/signed?token=short&download=${encodeURIComponent(book.name + ".pdf")}`, expiresIn: 120 });
    expect(from.mock.calls.map(call => call[0])).toEqual(["malazam", "malazam_downloads"]);
    expect(sign).toHaveBeenCalledWith(book.file_path, 120);
    expect(record).toHaveBeenCalledWith({ malzama_id: book.id, user_id: "student-1" });
  });
  it("still requires a signed-in user before signing a file", async () => {
    auth.mockResolvedValue({ ok: false, status: 401, error: "unauthenticated" });
    const response = await loadHandler("malazam-download")(request({ malzamaId: book.id }));
    expect(response.status).toBe(401);
    expect(createClient).not.toHaveBeenCalled();
    expect(sign).not.toHaveBeenCalled();
  });
  it.each([null, { ...book, is_published: false }])("does not expose a missing or unpublished file", async value => {
    item = value;
    const response = await loadHandler("malazam-download")(request({ malzamaId: book.id }));
    expect(response.status).toBe(404);
    expect(sign).not.toHaveBeenCalled();
  });
  it("rejects an invalid file identifier before querying storage", async () => {
    const response = await loadHandler("malazam-download")(request({ malzamaId: "../other-file" }));
    expect(response.status).toBe(400);
    expect(createClient).not.toHaveBeenCalled();
  });
  it("retains rate limiting", async () => {
    protect.mockResolvedValue({ ok: false, status: 429, error: "too_many_requests" });
    const response = await loadHandler("malazam-download")(request({ malzamaId: book.id }));
    expect(response.status).toBe(429);
    expect(auth).not.toHaveBeenCalled();
    expect(sign).not.toHaveBeenCalled();
  });
  it("does not record a download when URL signing fails", async () => {
    sign.mockResolvedValue({ data: { signedUrl: "" }, error: { message: "signing_failed" } });
    const response = await loadHandler("malazam-download")(request({ malzamaId: book.id }));
    expect(response.status).toBe(500);
    expect(record).not.toHaveBeenCalled();
  });
});

describe("installed-client membership compatibility", () => {
  it.each(["default", "dhs", "nadia", "malazam"])("reports that %s channel membership is no longer required", async scope => {
    const response = await loadHandler("telegram-channel-check")(request({ scope }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, joined: true, required: false, scope, channels: [], missingChannels: [] });
    expect(createClient).not.toHaveBeenCalled();
  });
  it("still rejects an unauthenticated request", async () => {
    auth.mockResolvedValue({ ok: false, status: 401, error: "unauthenticated" });
    const response = await loadHandler("telegram-channel-check")(request({ scope: "dhs" }));
    expect(response.status).toBe(401);
    expect((await response.json()).joined).toBe(false);
  });
});
