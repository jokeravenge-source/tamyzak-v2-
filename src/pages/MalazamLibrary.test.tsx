import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MalazamLibrary from "./MalazamLibrary";

const mocks = vi.hoisted(() => ({ result: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => {
      const query = {
        select: () => query, eq: () => query, order: () => query,
        maybeSingle: () => mocks.result(),
        then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => mocks.result().then(resolve, reject),
      };
      return query;
    },
    storage: { from: () => ({ getPublicUrl: (path: string) => ({ data: { publicUrl: `https://example.test/${path}` } }) }) },
  },
}));
vi.mock("@/components/SeoHead", () => ({ default: () => null }));
vi.mock("react-helmet-async", () => ({ Helmet: () => null }));
vi.mock("@/lib/telegramStart", () => ({ invokeTelegramStart: vi.fn() }));
vi.mock("@/lib/malazamDownload", () => ({ invokeMalazamDownload: vi.fn() }));

const book = {
  id: "12345678-1234-4123-8123-123456789abc", subject: "physics", topic: "الفصل الأول",
  name: "ملزمة تجريبية", cover_path: "physics/cover.png", is_published: true, sort_order: 0,
  created_at: "2026-11-07T00:00:00Z",
};

beforeEach(() => {
  window.history.replaceState({}, "", "/malazam/");
  mocks.result.mockReset();
});
afterEach(cleanup);

describe("Malazam library loading", () => {
  it("does not describe an actual permission error as an empty library", async () => {
    mocks.result.mockResolvedValue({ data: null, error: { code: "42501", message: "permission denied for function has_role" } });
    render(<MalazamLibrary />);
    expect(await screen.findByRole("alert")).toHaveTextContent("تعذّر تحميل الملازم");
    expect(screen.queryByText(/ماكو ملازم/)).not.toBeInTheDocument();
  });

  it("retries a failed catalog request and displays the published book", async () => {
    mocks.result.mockResolvedValueOnce({ data: null, error: { message: "Network failure" } })
      .mockResolvedValue({ data: [book], error: null });
    render(<MalazamLibrary />);
    fireEvent.click(await screen.findByRole("button", { name: "إعادة المحاولة" }));
    expect(await screen.findByRole("link", { name: book.name })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "تحميل الملزمة" })).toBeInTheDocument();
  });

  it("only shows the empty state after a successful empty response", async () => {
    mocks.result.mockResolvedValue({ data: [], error: null });
    render(<MalazamLibrary />);
    expect(await screen.findByText("ماكو ملازم منشورة بهذا القسم حالياً")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps missing detail links distinct from empty subject catalogs", async () => {
    window.history.replaceState({}, "", `/malazam/file/${book.id}/missing/`);
    mocks.result.mockResolvedValue({ data: null, error: null });
    render(<MalazamLibrary />);
    expect(await screen.findByText("الملزمة غير متاحة حالياً")).toBeInTheDocument();
    expect(screen.queryByText(/ماكو ملازم/)).not.toBeInTheDocument();
  });
});
