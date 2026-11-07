import { Blob as NativeBlob } from "node:buffer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMalzamaPdf, validateMalzamaPdf } from "./malazamPdf";

afterEach(() => vi.unstubAllGlobals());
describe("protected PDF fetch", () => {
  it("keeps the authorization token but removes the attachment parameter", async () => {
    const blob = new NativeBlob(["%PDF-1.7\ncontent"], { type: "application/pdf" }) as unknown as Blob;
    const fetcher = vi.fn().mockResolvedValue({ ok: true, blob: async () => blob });
    vi.stubGlobal("fetch", fetcher);
    expect(await fetchMalzamaPdf("https://example.test/file.pdf?token=secret&download=name.pdf")).toBe(blob);
    expect(fetcher).toHaveBeenCalledWith("https://example.test/file.pdf?token=secret", { credentials: "omit" });
  });
  it("rejects an HTML error page even if the server returned 200", async () => {
    const blob = new NativeBlob(["<html>expired link</html>"]) as unknown as Blob;
    await expect(validateMalzamaPdf(blob)).rejects.toThrow("ليس PDF صالحاً");
  });
  it("rejects an expired signed response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchMalzamaPdf("https://example.test/file.pdf?token=expired")).rejects.toThrow("رابط جديد");
  });
});
