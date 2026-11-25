import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import WhiteboardDialog from "./WhiteboardDialog";

const app = vi.hoisted(() => ({ invoke: vi.fn(), openPdf: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: app.invoke } } }));
vi.mock("@/lib/mutamayizFile", () => ({ openWhiteboardPdf: app.openPdf }));

it("keeps an uploaded chapter open and retries the chosen page without sending the rest of the chapter", async () => {
  const quote = "Pressing a capacitive key reduces the separation between the plates.";
  const page = { page: 57, text: quote };
  const reader = {
    name: "Physics Chapter 1.pdf", totalPages: 65,
    readPage: vi.fn().mockResolvedValue(page), close: vi.fn().mockResolvedValue(undefined),
  };
  const reference = { sourceId: "pdf:57", quote };
  const lesson = {
    title: "Capacitive keyboards", template: "notes",
    sources: [{ id: "pdf:57", kind: "pdf", title: reader.name, excerpt: quote, pdfPage: 57 }],
    steps: [
      { title: "The key", narration: "هسه نضغط المفتاح.", reference, actions: [{ kind: "label", target: "idea", text: "ضغط المفتاح", at: .1 }] },
      { title: "The spacing", narration: "المسافة بين اللوحين تقل.", reference, actions: [{ kind: "label", target: "result", text: "المسافة تقل", at: .1 }] },
    ],
  };
  app.openPdf.mockResolvedValue(reader);
  app.invoke
    .mockResolvedValueOnce({ data: { error: "missing_source" }, error: null })
    .mockResolvedValueOnce({ data: { error: "invalid_lesson" }, error: null })
    .mockResolvedValueOnce({ data: { lesson }, error: null });
  const view = render(<WhiteboardDialog
    input={{ question: "Explain momentum on page 2", topic: "Momentum", language: "en" }}
    language="en" missingAttachment={false} onClose={vi.fn()} onReturnFocus={vi.fn()}
  />);
  const dialog = await screen.findByRole("dialog");
  await screen.findByRole("button", { name: "Upload PDF" });
  fireEvent.change(dialog.querySelector("input[type='file']")!, {
    target: { files: [new File(["pdf"], reader.name, { type: "application/pdf" })] },
  });
  const number = await screen.findByLabelText(/Page number in the PDF/);
  expect(reader.readPage).not.toHaveBeenCalled();
  expect(app.invoke).toHaveBeenCalledTimes(1);
  fireEvent.change(number, { target: { value: "٥٧" } });
  fireEvent.click(screen.getByRole("button", { name: "Explain this page" }));
  expect(await screen.findByText(/source was read, but the explanation/)).toBeInTheDocument();
  expect(screen.getByText(/Text read from the page 57/)).toBeInTheDocument();
  const request = app.invoke.mock.calls[1][1].body;
  expect(request).toEqual({ mode: "whiteboard_lesson", board: {
    question: "Explain the contents of the selected PDF page on the whiteboard.",
    language: "en", attachment: { name: reader.name, pages: [page], selectedPage: true },
  } });
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByRole("heading", { name: "Capacitive keyboards" })).toBeInTheDocument();
  expect(app.invoke.mock.calls[2][1].body).toEqual(request);
  expect(reader.readPage.mock.calls).toEqual([[57]]);
  view.unmount();
  expect(reader.close).toHaveBeenCalledOnce();
});
