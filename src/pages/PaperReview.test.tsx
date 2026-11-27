import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaperReview from "./PaperReview";

const backend = vi.hoisted(() => ({ invoke: vi.fn(), read: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: backend.invoke } } }));
vi.mock("@/lib/paperReviewPhoto", () => ({ readPaperPhoto: backend.read }));
const photo = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2Q==";
const access = { premium: false, remaining: 1, pending: false, resetAt: "2099-01-01T21:00:00Z", completedPractices: 0 };
const report = {
  status: "reviewed", summary: "الملاحظة على وحدة الناتج.", skill: "تحويل وحدات السعة",
  findings: [{ excerpt: "5 F", explanation: "المايكرو يعني عشرة أس سالب ستة.", kind: "teacher-mark", location: [100, 240, 200, 390] }],
  practice: { question: "حوّل 8 µF إلى الفاراد.", choices: ["8 × 10⁻³ F", "8 × 10⁻⁶ F", "8 × 10⁶ F"] },
};

beforeEach(() => {
  backend.invoke.mockReset();
  backend.read.mockReset().mockResolvedValue(photo);
});

async function upload(container: HTMLElement) {
  await act(async () => fireEvent.change(container.querySelector("input[type=file]")!, {
    target: { files: [new File(["fixture-photo"], "solution.jpg", { type: "image/jpeg" })] },
  }));
  expect(screen.getByRole("img", { name: "صورة السؤال والحل" })).toBeVisible();
}

describe("Paper Review student flow", () => {
  it("previews one image, highlights the note, and saves the practice after the free analysis", async () => {
    let reviewed = false;
    let passed = false;
    backend.invoke.mockImplementation(async (_name, { body }) => {
      if (body.mode === "status") return { data: { access: { ...access, remaining: reviewed ? 0 : 1, completedPractices: passed ? 1 : 0 } }, error: null };
      if (body.mode === "review") { reviewed = true; return { data: { report }, error: null }; }
      passed = body.choice === 1;
      return { data: { answer: { correct: passed, explanation: "µ يساوي 10⁻⁶." } }, error: null };
    });
    const { container } = render(<PaperReview language="ar" initialExercise="units" onBack={vi.fn()} onUpgrade={vi.fn()} />);
    await screen.findByText("صورة متاحة اليوم");
    expect(screen.getByLabelText("فصل الفيزياء")).toHaveValue("1");
    expect(screen.getByLabelText("تمرين من هذا الفصل")).toHaveValue("units");
    await upload(container);
    fireEvent.click(screen.getByRole("button", { name: "حلّل الصورة" }));
    await screen.findByText("الملاحظة على وحدة الناتج.");
    expect(await screen.findByText("حصة اليوم استُخدمت")).toBeVisible();
    const pin = screen.getByRole("button", { name: "روح إلى الملاحظة 1" });
    expect(pin.parentElement).toHaveStyle({ left: "24%", top: "10%", width: "15%", height: "10%" });
    expect(screen.getByText("المايكرو يعني عشرة أس سالب ستة.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "راجع صورة ثانية" })).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "8 × 10⁻⁶ F" }));
    fireEvent.click(screen.getByRole("button", { name: "تحقق من إجابتي" }));
    expect(await screen.findByText("إجابة صحيحة وانحفظت بتقدّمك")).toBeVisible();
    expect(await screen.findByText(/تمرين انحلّ صح/)).toBeVisible();
    const send = backend.invoke.mock.calls.find(([, options]) => options.body.mode === "review");
    const answer = backend.invoke.mock.calls.find(([, options]) => options.body.mode === "answer");
    expect(send?.[1].body).toMatchObject({ exercise: "units", image: photo, requestId: expect.any(String) });
    expect(answer?.[1].body.requestId).toEqual(send?.[1].body.requestId);
  });

  it("filters exercises by chapter, opens shared selections, and sends a chapter-only review", async () => {
    backend.invoke.mockImplementation(async (_name, { body }) => ({
      data: body.mode === "status" ? { access } : { report }, error: null,
    }));
    const { container } = render(<PaperReview language="ar" initialChapter="8" initialExercise="ch8-ionization" onBack={vi.fn()} onUpgrade={vi.fn()} />);
    await screen.findByText("صورة متاحة اليوم");
    const chapters = screen.getByLabelText("فصل الفيزياء");
    const exercises = screen.getByLabelText("تمرين من هذا الفصل");
    const share = screen.getByRole("textbox", { name: "رابط المشاركة للمدرّس", hidden: true });
    expect(chapters).toHaveValue("8");
    expect(exercises).toHaveValue("ch8-ionization");
    expect(share).toHaveValue(window.location.origin + "/paper-review?exercise=ch8-ionization");

    fireEvent.change(chapters, { target: { value: "5" } });
    expect(exercises).toHaveValue("");
    expect(exercises).toHaveTextContent("محزّز الحيود");
    expect(exercises).not.toHaveTextContent("طاقة التأيّن");
    expect(share).toHaveValue(window.location.origin + "/paper-review?chapter=5");

    await upload(container);
    fireEvent.click(screen.getByRole("button", { name: "حلّل الصورة" }));
    await screen.findByText(report.summary);
    expect(backend.invoke).toHaveBeenCalledWith("paper-review", expect.objectContaining({
      body: expect.objectContaining({ mode: "review", chapter: 5, exercise: "", language: "ar" }),
    }));
  });

  it("blocks a new upload for an exhausted account and opens the existing Premium screen", async () => {
    backend.invoke.mockResolvedValue({ data: { access: { ...access, remaining: 0 } }, error: null });
    const onUpgrade = vi.fn();
    render(<PaperReview language="ar" onBack={vi.fn()} onUpgrade={onUpgrade} />);
    await screen.findByText("حصة اليوم استُخدمت");
    expect(screen.getByRole("button", { name: /صوّر أو اختار صورة/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "حلّل الصورة" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "افتح بريميوم" }));
    expect(onUpgrade).toHaveBeenCalledOnce();
    expect(backend.invoke).toHaveBeenCalledTimes(1);
  });

  it("lets a Premium student start and review another photo without a daily gate", async () => {
    backend.invoke.mockImplementation(async (_name, { body }) => ({
      data: body.mode === "status" ? { access: { ...access, premium: true, remaining: null } } : { report }, error: null,
    }));
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const { container } = render(<PaperReview language="ar" onBack={vi.fn()} onUpgrade={vi.fn()} />);
    await screen.findByText("بريميوم · صور متعددة");
    await upload(container);
    fireEvent.click(screen.getByRole("button", { name: "حلّل الصورة" }));
    fireEvent.click(await screen.findByRole("button", { name: "راجع صورة ثانية" }));
    await upload(container);
    fireEvent.click(screen.getByRole("button", { name: "حلّل الصورة" }));
    await waitFor(() => expect(backend.invoke.mock.calls.filter(([, { body }]) => body.mode === "review")).toHaveLength(2));
    expect(await screen.findByText("الملاحظة على وحدة الناتج.")).toBeVisible();
    vi.restoreAllMocks();
  });
});
