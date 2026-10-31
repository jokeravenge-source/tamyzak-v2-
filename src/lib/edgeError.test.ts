import { describe, expect, it, vi } from "vitest";
import { edgeErrorMessage } from "./edgeError";

describe("edge error messages", () => {
  it("unwraps the mind map failure instead of returning the generic invocation error", async () => {
    const context = new Response(JSON.stringify({ error: "Missing topic" }), { status: 400 });
    expect(await edgeErrorMessage({ message: "Edge Function returned a non-2xx status code", context })).toBe("Missing topic");
  });
  it("does not call a 429 response a daily limit", async () => {
    const context = { status: 429, text: vi.fn(async () => { throw new Error("consumed"); }) };
    expect(await edgeErrorMessage({ context })).toBe("Too many requests right now. Please try again shortly.");
  });
  it("preserves the real Premium rejection", async () => {
    const context = { status: 403, text: async () => JSON.stringify({ error: "Premium membership required" }) };
    expect(await edgeErrorMessage({ context })).toBe("Premium membership required");
  });
  it("keeps timeout and credit errors separate", async () => {
    const context = { status: 504, text: async () => { throw new Error("consumed"); } };
    expect(await edgeErrorMessage({ context })).toMatch(/took too long/);
    expect(await edgeErrorMessage({ message: "AI credits exhausted" })).toBe("AI credits exhausted");
  });
});
