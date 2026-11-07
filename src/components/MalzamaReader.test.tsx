import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MalzamaReader from "./MalzamaReader";
import type { ReactNode } from "react";

const mocks = vi.hoisted(() => ({ getDocument: vi.fn(), getPage: vi.fn(), destroy: vi.fn() }));
vi.mock("pdfjs-dist", () => ({ GlobalWorkerOptions: {}, getDocument: mocks.getDocument }));
vi.mock("@/lib/malazamPdf", () => ({ downloadMalzamaPdf: vi.fn() }));
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: ReactNode }) => <>{children}</>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));
const blob = { arrayBuffer: async () => new ArrayBuffer(10) } as Blob;

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  HTMLElement.prototype.scrollTo = vi.fn();
  mocks.getPage.mockReset().mockResolvedValue({
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }),
    render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
  });
  mocks.destroy.mockReset();
  mocks.getDocument.mockReset().mockReturnValue({ promise: Promise.resolve({ numPages: 5, getPage: mocks.getPage }), destroy: mocks.destroy });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("in-app PDF reader", () => {
  it("resumes the stored page, navigates, and reports progress", async () => {
    const progress = vi.fn();
    render(<MalzamaReader blob={blob} name="ملزمة الكيمياء" initialPage={3} onPage={progress} onClose={vi.fn()} />);
    await waitFor(() => expect(mocks.getPage).toHaveBeenCalledWith(3));
    fireEvent.click(screen.getByRole("button", { name: "الصفحة التالية" }));
    await waitFor(() => expect(mocks.getPage).toHaveBeenCalledWith(4));
    expect(progress).toHaveBeenCalledWith(4);
    fireEvent.click(screen.getByRole("button", { name: "الصفحة السابقة" }));
    await waitFor(() => expect(screen.getByLabelText("صفحة 3 من ملزمة الكيمياء").parentElement).toHaveAttribute("aria-busy", "false"));
    expect(progress).toHaveBeenLastCalledWith(3);
  });
  it("clamps invalid saved progress to the document length and destroys the document on close", async () => {
    const { unmount } = render(<MalzamaReader blob={blob} name="PDF" initialPage={99} onClose={vi.fn()} />);
    await waitFor(() => expect(mocks.getPage).toHaveBeenCalledWith(5));
    expect(screen.getByRole("button", { name: "الصفحة التالية" })).toBeDisabled();
    await waitFor(() => expect(screen.getByLabelText("صفحة 5 من PDF").parentElement).toHaveAttribute("aria-busy", "false"));
    unmount();
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });
  it("shows a useful error when the PDF cannot be decoded", async () => {
    mocks.getDocument.mockReturnValue({ promise: Promise.reject(new Error("Invalid PDF")), destroy: mocks.destroy });
    render(<MalzamaReader blob={blob} name="تالف" onClose={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("تعذّر فتح PDF");
  });
});
