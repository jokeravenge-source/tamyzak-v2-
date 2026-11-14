import { afterEach, beforeEach, expect, it, vi } from "vitest";

let forward: (req: Request) => Promise<Response>;
const fetchMock = vi.fn();
beforeEach(async () => {
  vi.stubGlobal("Deno", { env: { get: (key: string) => key === "SUPABASE_URL" ? "https://project.supabase.co" : "public-anon-key" } });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockResolvedValue(new Response(JSON.stringify({ reply: "متميز" })));
  const path = "../../supabase/functions/_shared/legacyMutamayiz.ts";
  forward = (await import(path)).legacyMutamayiz;
});
afterEach(() => vi.unstubAllGlobals());

it("forwards old guide and support requests to the one authenticated backend only", async () => {
  const response = await forward(new Request("https://project.test/psych-chat", {
    method: "POST", headers: { Authorization: "Bearer student-session" },
    body: JSON.stringify({ message: "متوتر", history: [{ role: "user", content: "عندي امتحان" }] }),
  }));
  expect(response.status).toBe(200);
  expect(fetchMock).toHaveBeenCalledOnce();
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe("https://project.supabase.co/functions/v1/excellence-companion");
  expect(options.headers.Authorization).toBe("Bearer student-session");
  expect(JSON.parse(options.body)).toMatchObject({ mode: "unified", language: "ar", messages: [
    { role: "user", content: "عندي امتحان" }, { role: "user", content: "متوتر" },
  ] });
});

it("distinguishes invalid input from an unavailable backend", async () => {
  const bad = await forward(new Request("https://project.test/guide-chat", { method: "POST", body: "invalid" }));
  expect(bad.status).toBe(400); expect(fetchMock).not.toHaveBeenCalled();
  fetchMock.mockRejectedValue(new Error("offline"));
  const failed = await forward(new Request("https://project.test/guide-chat", { method: "POST", body: JSON.stringify({ message: "وين الجلسات" }) }));
  expect(failed.status).toBe(503);
});
