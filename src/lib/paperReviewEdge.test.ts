import { webcrypto } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { paperExercise, paperReviewImage, parsePaperReport } from "../../supabase/functions/_shared/paperReview";

const backend = vi.hoisted(() => ({
  auth: vi.fn(), guard: vi.fn(), rpc: vi.fn(), premium: vi.fn(), ai: vi.fn(),
  handler: null as null | ((req: Request) => Promise<Response>),
}));
vi.mock("../../supabase/functions/_shared/auth.ts", () => ({ requireUser: backend.auth }));
vi.mock("../../supabase/functions/_shared/guard.ts", () => ({ protect: backend.guard }));
vi.mock("https://esm.sh/@supabase/supabase-js@2.57.4", () => ({
  createClient: (_url: string, key: string) => ({ rpc: key === "server-fixture" ? backend.rpc : backend.premium }),
}));
vi.mock("@lovable.dev/ai-gateway", () => ({ generateChatCompletion: backend.ai, GatewayError: class extends Error {} }));

const photo = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2Q==";
const id = "00000000-0000-4000-8000-000000000012";
const leaseId = "00000000-0000-4000-8000-000000000014";
const request = (body: Record<string, unknown>) => backend.handler!(new Request("https://fixture.test/paper-review", {
  method: "POST", headers: { Authorization: "Bearer student-fixture" }, body: JSON.stringify(body),
}));
const review = { mode: "review", requestId: id, image: photo, exercise: "units", language: "ar" };
const report = {
  status: "reviewed", summary: "عدّل وحدة السعة.", skill: "الوحدات", matchedExercise: true,
  findings: [{ excerpt: "5 F", explanation: "المايكرو يعني عشرة أس سالب ستة.", kind: "teacher-mark", location: [120, 200, 250, 540] }],
  practice: { question: "Untrusted alternative", choices: ["A", "B", "C"], correctIndex: 0, explanation: "An alternative explanation" },
};
const completion = (data: unknown) => ({
  choices: [{ finish_reason: "stop", message: { tool_calls: [{ type: "function", function: { name: "submit_paper_review", arguments: JSON.stringify(data) } }] } }],
});

beforeAll(async () => {
  vi.stubGlobal("Deno", {
    serve: (handler: (req: Request) => Promise<Response>) => { backend.handler = handler; },
    env: { get: (key: string) => ({ SUPABASE_URL: "https://fixture.test", SUPABASE_SERVICE_ROLE_KEY: "server-fixture", SUPABASE_ANON_KEY: "student-fixture" })[key] },
  });
  vi.stubGlobal("crypto", webcrypto);
  const path = "../../supabase/functions/paper-review/index.ts";
  await import(path);
});
afterAll(() => vi.unstubAllGlobals());

beforeEach(() => {
  backend.auth.mockReset().mockResolvedValue({ ok: true, userId: "account-a" });
  backend.guard.mockReset().mockResolvedValue({ ok: true });
  backend.premium.mockReset().mockResolvedValue({ data: false, error: null });
  backend.rpc.mockReset().mockImplementation(async (name: string) => ({
    data: name === "reserve_paper_review" ? { status: "reserved", leaseId } : true, error: null,
  }));
  backend.ai.mockReset().mockResolvedValue(completion(report));
});

describe("paper review edge function", () => {
  it("requires a signed-in account and verifies Premium on the server", async () => {
    backend.auth.mockResolvedValueOnce({ ok: false, status: 401 });
    expect((await request(review)).status).toBe(401);
    expect(backend.premium).not.toHaveBeenCalled();

    await request({ ...review, premium: true, userId: "somebody-else" });
    expect(backend.premium).toHaveBeenCalledWith("can_use_premium_tools");
    expect(backend.rpc).toHaveBeenCalledWith("reserve_paper_review", expect.objectContaining({
      _premium: false, _user_id: "account-a", _request_id: id, _image_digest: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));
  });

  it("does not pass invalid or multiple images on to the reviewer", async () => {
    expect(paperReviewImage("https://fixture.test/photo.jpeg")).toBeNull();
    expect(paperReviewImage("data:image/jpeg;base64,c29tZSB0ZXh0IGJ5dGVz")).toBeNull();
    expect((await request({ ...review, image: [photo, photo] })).status).toBe(400);
    expect(backend.rpc).not.toHaveBeenCalled();
    expect(backend.ai).not.toHaveBeenCalled();
  });

  it("sends one photo, uses the prepared exercise, and returns only public feedback", async () => {
    const response = await (await request(review)).json();
    expect(response.report).toMatchObject({
      summary: report.summary, findings: report.findings,
      practice: { question: paperExercise("units")!.practice.ar.question },
    });
    expect(response.report.practice).not.toHaveProperty("correctIndex");
    expect(response.report.practice).not.toHaveProperty("explanation");
    const parts = backend.ai.mock.calls[0][0].messages[1].content;
    expect(parts.filter((part: { type: string }) => part.type === "image_url")).toHaveLength(1);
    expect(parts[0].text).toContain("5 µF");
    expect(backend.rpc).toHaveBeenCalledWith("settle_paper_review", expect.objectContaining({
      _lease_id: leaseId, _report: expect.objectContaining({ practice: expect.objectContaining({ correctIndex: 1 }) }),
    }));
  });

  it("rejects an over-quota review before calling the model", async () => {
    backend.rpc.mockResolvedValueOnce({ data: { status: "daily_limit" }, error: null })
      .mockResolvedValueOnce({ data: { premium: false, remaining: 0 }, error: null });
    expect(await (await request(review)).json()).toEqual({ error: "daily_limit", access: { premium: false, remaining: 0 } });
    expect(backend.ai).not.toHaveBeenCalled();
  });

  it("passes a verified paid entitlement to the quota reservation", async () => {
    backend.premium.mockResolvedValue({ data: true, error: null });
    expect((await request(review)).status).toBe(200);
    expect(backend.rpc).toHaveBeenCalledWith("reserve_paper_review", expect.objectContaining({ _premium: true }));
  });

  it("reuses the completed report on a network retry", async () => {
    backend.rpc.mockResolvedValueOnce({ data: { status: "cached", report: parsePaperReport(report), practicePassed: true }, error: null });
    const result = await (await request(review)).json();
    expect(result.practicePassed).toBe(true);
    expect(result.report.findings).toEqual(report.findings);
    expect(backend.ai).not.toHaveBeenCalled();
  });

  it("releases the reservation if the model call fails or output is invalid", async () => {
    backend.ai.mockRejectedValueOnce(new Error("service unavailable"));
    expect((await request(review)).status).toBe(503);
    backend.ai.mockResolvedValueOnce(completion({ status: "made-up", summary: "bad" }));
    expect((await request(review)).status).toBe(503);
    expect(backend.rpc.mock.calls.filter(([name, values]) => name === "settle_paper_review" && values._report === null)).toHaveLength(2);
  });

  it("keeps readable feedback when photo coordinates are out of bounds", () => {
    const result = parsePaperReport({ ...report, findings: [{ ...report.findings[0], location: [-1, 100, 300, 1100] }] });
    expect(result?.findings[0]).toMatchObject({ excerpt: "5 F", location: null });
  });

  it("answers saved exercises even after the photo quota was used", async () => {
    backend.rpc.mockResolvedValueOnce({ data: { correct: true, explanation: "Verified explanation" }, error: null });
    const result = await (await request({ mode: "answer", requestId: id, choice: 1 })).json();
    expect(result.answer.correct).toBe(true);
    expect(backend.rpc).toHaveBeenCalledWith("answer_paper_review", { _user_id: "account-a", _request_id: id, _choice: 1 });
    expect(backend.premium).not.toHaveBeenCalled();
  });
});
