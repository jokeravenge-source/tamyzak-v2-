import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { readPodcastTopics } from "../../supabase/functions/_shared/podcastTopics";

const api = vi.hoisted(() => ({ user: vi.fn(), protect: vi.fn(), admin: vi.fn(), tutor: vi.fn() }));
vi.mock("../../supabase/functions/_shared/auth.ts", () => ({ requireUser: api.user }));
vi.mock("../../supabase/functions/_shared/guard.ts", () => ({ protect: api.protect }));
vi.mock("../../supabase/functions/_shared/podcast.ts", () => ({
  adminClient: api.admin, callTutorJson: api.tutor, corsHeaders: {},
  json: (data: unknown, status = 200) => new Response(JSON.stringify(data), { status }),
}));
let handler: (req: Request) => Promise<Response>;
let owner: string;
const source = [{ narration_text: "تتكاثر البكتيريا بالانشطار الثنائي", checkpoint_prompt: "وضح الانشطار الثنائي" }];
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  owner = "student";
  api.user.mockResolvedValue({ ok: true, userId: "student" });
  api.protect.mockResolvedValue({ ok: true });
  api.admin.mockReturnValue({ from: (table: string) => {
    const query = { select: () => query, eq: () => query,
      maybeSingle: async () => ({ data: { user_id: owner, status: "completed", subject: "biology", title: "teacher-chapter-3.pdf" } }),
      order: async () => ({ data: table === "podcast_segments" ? source : [], error: null }),
    };
    return query;
  } });
  api.tutor.mockResolvedValue({ topics: [{ ar: "الانشطار الثنائي", en: "Binary fission" }] });
  vi.stubGlobal("Deno", { serve: (fn: typeof handler) => { handler = fn; } });
  const endpointPath = "../../supabase/functions/podcast-practice-topics/index.ts";
  await import(/* @vite-ignore */ endpointPath);
});
afterEach(() => vi.unstubAllGlobals());
const request = (extra = {}) => new Request("https://example.test", { method: "POST", body: JSON.stringify({ session_id: "11111111-1111-1111-1111-111111111111", ...extra }) });

it("extracts bilingual concepts from saved lesson content for existing sessions, excluding the title", async () => {
  const response = await handler(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ topics: [{ ar: "الانشطار الثنائي", en: "Binary fission" }] });
  const prompt = api.tutor.mock.calls[0][0];
  expect(prompt).toContain(source[0].narration_text);
  expect(prompt).not.toContain("teacher-chapter-3.pdf");
});
it("rejects other users' sessions before spending AI credits", async () => {
  owner = "someone-else";
  expect((await handler(request())).status).toBe(403);
  expect(api.tutor).not.toHaveBeenCalled();
});
it("resolves a custom concept in the lesson context", async () => {
  expect((await handler(request({ topic: "الانشطار الثنائي" }))).status).toBe(200);
  expect(api.tutor.mock.calls[0][0]).toContain("أرجع مفهوماً واحداً فقط");
});
it("rejects malformed model output instead of using a filename", async () => {
  api.tutor.mockResolvedValue({ topics: [{ ar: "", en: "" }] });
  expect((await handler(request())).status).toBe(500);
  expect(readPodcastTopics([null, { ar: "المفهوم", en: "Concept" }, { ar: "المفهوم", en: "Concept" }, { ar: "only" }])).toEqual([{ ar: "المفهوم", en: "Concept" }]);
});
