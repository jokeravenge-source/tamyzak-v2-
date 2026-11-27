import { beforeEach, expect, it, vi } from "vitest";
import { createChatPost } from "./communityChat";

const api = vi.hoisted(() => ({ upsert: vi.fn(), upload: vi.fn(), exists: vi.fn(), remove: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ upsert: api.upsert }), storage: { from: () => api } },
}));

const photos = ["chart.png", "notes.png"].map(name => new File(["image"], name, { type: "image/png" }));
const draft = { id: "draft", body: "", photos };
const paths = ["student/draft/1.png", "student/draft/2.png"];

beforeEach(() => {
  vi.resetAllMocks();
  api.upload.mockResolvedValue({ error: null });
  api.exists.mockResolvedValue({ data: false, error: null });
  api.remove.mockResolvedValue({ error: null });
  api.upsert.mockResolvedValue({ error: null });
});

it("publishes after uploading all photos to the draft's fixed paths", async () => {
  await createChatPost("student", draft);
  expect(api.upload.mock.calls.map(([path, file]) => [path, file])).toEqual(paths.map((path, index) => [path, photos[index]]));
  expect(api.upsert).toHaveBeenCalledWith(
    { id: "draft", body: "", author_id: "student", photo_paths: paths },
    { onConflict: "id", ignoreDuplicates: true },
  );
  expect(api.upsert.mock.invocationCallOrder[0]).toBeGreaterThan(api.upload.mock.invocationCallOrder[1]);
});

it("cleans up an interrupted upload and preserves the draft's paths for a retry", async () => {
  const failure = new Error("upload interrupted");
  api.upload.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: failure });
  await expect(createChatPost("student", draft)).rejects.toBe(failure);
  expect(api.remove).toHaveBeenCalledWith(paths);
  expect(api.upsert).not.toHaveBeenCalled();
  api.upload.mockResolvedValueOnce({ error: new Error("already stored") });
  api.exists.mockResolvedValueOnce({ data: true, error: null });
  await expect(createChatPost("student", draft)).resolves.toBeUndefined();
  expect(api.exists).toHaveBeenLastCalledWith(paths[0]);
  expect(api.upsert).toHaveBeenCalledOnce();
});

it("rejects unsupported files before uploading anything", async () => {
  const invalid = new File(["image"], "drawing.svg", { type: "image/svg+xml" });
  await expect(createChatPost("student", { ...draft, photos: [invalid] })).rejects.toThrow("INVALID_CHAT_PHOTOS");
  expect(api.upload).not.toHaveBeenCalled();
  expect(api.upsert).not.toHaveBeenCalled();
});
