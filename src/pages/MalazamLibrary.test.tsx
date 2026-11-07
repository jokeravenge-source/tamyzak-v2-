import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MalazamLibrary from "./MalazamLibrary";

const mocks = vi.hoisted(() => ({ result: vi.fn(), session: vi.fn(), authChange: vi.fn(), invoke: vi.fn(), fetchPdf: vi.fn(), download: vi.fn(), validate: vi.fn(), list: vi.fn(), save: vi.fn(), read: vi.fn(), remove: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: mocks.session, onAuthStateChange: (callback: unknown) => { mocks.authChange(callback); return { data: { subscription: { unsubscribe: vi.fn() } } }; } },
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
vi.mock("@/lib/malazamDownload", () => ({ invokeMalazamDownload: mocks.invoke }));
vi.mock("@/lib/malazamPdf", () => ({ fetchMalzamaPdf: mocks.fetchPdf, downloadMalzamaPdf: mocks.download, validateMalzamaPdf: mocks.validate }));
vi.mock("@/lib/savedMalazam", () => ({ listSavedMalazam: mocks.list, saveMalzama: mocks.save, getSavedMalzama: mocks.read, removeSavedMalzama: mocks.remove, saveMalzamaPage: vi.fn() }));
vi.mock("@/components/MalzamaReader", () => ({ default: ({ name, initialPage }: { name: string; initialPage: number }) => <div role="dialog" aria-label={`قارئ ${name}`}>PDF reader — صفحة {initialPage}</div> }));

const book = {
  id: "12345678-1234-4123-8123-123456789abc", subject: "physics", topic: "الفصل الأول",
  name: "ملزمة تجريبية", cover_path: "physics/cover.png", is_published: true, sort_order: 0,
  created_at: "2026-11-07T00:00:00Z",
};

beforeEach(() => {
  window.history.replaceState({}, "", "/malazam/");
  mocks.result.mockReset();
  mocks.session.mockReset().mockResolvedValue({ data: { session: null } });
  mocks.list.mockReset().mockResolvedValue([]);
  mocks.invoke.mockReset(); mocks.fetchPdf.mockReset(); mocks.download.mockReset(); mocks.save.mockReset(); mocks.read.mockReset(); mocks.remove.mockReset();
  mocks.authChange.mockClear(); mocks.validate.mockReset();
});

describe("Malazam reader and saved copies", () => {
  const signedIn = () => mocks.session.mockResolvedValue({ data: { session: { user: { id: "student-1" } } } });
  it("requires authentication before saving or fetching a PDF", async () => {
    mocks.result.mockResolvedValue({ data: [book], error: null });
    render(<MalazamLibrary />);
    fireEvent.click(await screen.findByRole("button", { name: "حفظ الملزمة" }));
    expect(await screen.findByRole("heading", { name: "سجّل دخولك أولاً" })).toBeInTheDocument();
    expect(mocks.fetchPdf).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("opens the reader after downloading the verified PDF", async () => {
    signedIn();
    const blob = new Blob(["%PDF-1.7"]);
    mocks.result.mockResolvedValue({ data: [book], error: null });
    mocks.invoke.mockResolvedValue({ data: { downloadUrl: "https://example.test/signed" } });
    mocks.fetchPdf.mockResolvedValue(blob);
    render(<MalazamLibrary />);
    fireEvent.click(await screen.findByRole("button", { name: "تحميل الملزمة" }));
    expect(await screen.findByRole("dialog", { name: `قارئ ${book.name}` })).toBeInTheDocument();
    expect(mocks.download).toHaveBeenCalledWith(blob, book.name);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("does not store PDF data when the Telegram membership gate rejects access", async () => {
    signedIn(); mocks.result.mockResolvedValue({ data: [book], error: null });
    mocks.invoke.mockResolvedValue({ data: { error: "not_joined", missingChannels: ["@sad6ths"] } });
    render(<MalazamLibrary />);
    fireEvent.click(await screen.findByRole("button", { name: "حفظ الملزمة" }));
    expect(await screen.findByRole("heading", { name: "انضم إلى القناتين" })).toBeInTheDocument();
    expect(mocks.fetchPdf).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("stores the actual verified PDF for the current user", async () => {
    signedIn(); const blob = new Blob(["%PDF-1.7"]);
    mocks.result.mockResolvedValue({ data: [book], error: null });
    mocks.invoke.mockResolvedValue({ data: { downloadUrl: "https://example.test/signed" } });
    mocks.fetchPdf.mockResolvedValue(blob);
    render(<MalazamLibrary />);
    fireEvent.click(await screen.findByRole("button", { name: "حفظ الملزمة" }));
    expect(await screen.findByRole("dialog", { name: `قارئ ${book.name}` })).toBeInTheDocument();
    expect(mocks.save).toHaveBeenCalledWith("student-1", book, blob);
  });
  it("opens a saved copy even when the online catalog fails", async () => {
    signedIn(); mocks.result.mockResolvedValue({ data: null, error: { message: "Offline" } });
    mocks.list.mockResolvedValue([{ ...book, key: "student-1:" + book.id, owner: "student-1", page: 4, savedAt: 1 }]);
    mocks.read.mockResolvedValue(new Blob(["%PDF-1.7"]));
    render(<MalazamLibrary />);
    fireEvent.click(await screen.findByRole("button", { name: /المحفوظة \(1\)/ }));
    fireEvent.click(await screen.findByRole("button", { name: "قراءة داخل تميّزك" }));
    expect(await screen.findByRole("dialog", { name: `قارئ ${book.name}` })).toBeInTheDocument();
    expect(mocks.invoke).not.toHaveBeenCalled(); expect(mocks.fetchPdf).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toHaveTextContent("صفحة 4");
    const notify = mocks.authChange.mock.calls[0][0];
    act(() => notify("TOKEN_REFRESHED", { user: { id: "student-1" } }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    act(() => notify("SIGNED_OUT", null));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /المحفوظة \(0\)/ })).toBeInTheDocument();
  });
  it("opens an already downloaded PDF selected from the device", async () => {
    mocks.result.mockResolvedValue({ data: [], error: null });
    const file = new File(["%PDF-1.7"], "My-book.pdf", { type: "application/pdf" });
    mocks.validate.mockResolvedValue(file);
    render(<MalazamLibrary />);
    fireEvent.change(screen.getByLabelText("فتح PDF من جهازي"), { target: { files: [file] } });
    expect(await screen.findByRole("dialog", { name: "قارئ My-book" })).toBeInTheDocument();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });
  it("does not reopen a previous account's cached PDF if sign-out happens while reading storage", async () => {
    signedIn(); mocks.result.mockResolvedValue({ data: [book], error: null });
    mocks.list.mockResolvedValue([{ ...book, key: "student-1:" + book.id, owner: "student-1", page: 4, savedAt: 1 }]);
    let resolveFile: (value: Blob) => void;
    mocks.read.mockReturnValue(new Promise<Blob>((resolve) => { resolveFile = resolve; }));
    render(<MalazamLibrary />);
    await screen.findByRole("button", { name: /المحفوظة \(1\)/ });
    fireEvent.click(screen.getByRole("button", { name: "قراءة داخل تميّزك" }));
    await waitFor(() => expect(mocks.read).toHaveBeenCalled());
    act(() => mocks.authChange.mock.calls[0][0]("SIGNED_OUT", null));
    await act(async () => resolveFile(new Blob(["%PDF"])));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("reports failed storage without claiming the PDF was saved", async () => {
    signedIn(); mocks.result.mockResolvedValue({ data: [book], error: null });
    mocks.invoke.mockResolvedValue({ data: { downloadUrl: "https://example.test/signed" } });
    mocks.fetchPdf.mockResolvedValue(new Blob(["%PDF"]));
    mocks.save.mockRejectedValue(new Error("مساحة الجهاز غير كافية"));
    render(<MalazamLibrary />);
    fireEvent.click(await screen.findByRole("button", { name: "حفظ الملزمة" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("مساحة الجهاز غير كافية");
    expect(screen.queryByRole("button", { name: "إزالة الحفظ" })).not.toBeInTheDocument();
  });
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
