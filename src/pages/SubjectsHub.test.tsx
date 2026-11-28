import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SubjectsHub from "./SubjectsHub";
import { rememberStudySubjectFocus, resetStudySubjectFocus } from "@/lib/studySubjectFocus";

const test = vi.hoisted(() => ({
  fetchDue: vi.fn(),
  subscription: { isPremium: false, loading: false, userId: "test-student" },
}));
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => test.subscription }));
vi.mock("@/lib/analytics", () => ({ trackFeature: vi.fn(), trackFeatureUnlocked: vi.fn() }));
vi.mock("@/lib/mistakes", () => ({ hasDueSubjectMistakes: test.fetchDue }));
vi.mock("@/components/StudyStartIntake", () => ({
  default: ({ subject, onStart }: { subject: string; onStart: () => void }) => <button onClick={onStart}>Start {subject}</button>,
}));

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
  test.fetchDue.mockReset().mockResolvedValue(false);
});
afterEach(() => vi.clearAllMocks());

it("chooses from eight subjects first in Arabic, then shows only applicable tools", async () => {
  const onSelect = vi.fn();
  render(<SubjectsHub language="ar" onBack={vi.fn()} onSelect={onSelect} />);
  expect(screen.getByRole("main")).toHaveAttribute("dir", "rtl");
  expect(screen.getByRole("heading", { name: "اختَر مادة" })).toBeVisible();
  expect(within(screen.getByRole("list")).getAllByRole("button")).toHaveLength(8);
  expect(screen.queryByRole("button", { name: /اسأل متميّز/ })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "الكيمياء" }));
  expect(screen.getByRole("heading", { name: "الكيمياء" })).toHaveFocus();
  const categories = screen.getByRole("group", { name: "أقسام الأدوات" });
  expect(within(categories).getAllByRole("button").map(button => button.textContent)).toEqual(["أدوات المادة", "الأدوات العامة والذكاء الاصطناعي"]);
  expect(screen.getByRole("region", { name: "أدوات المادة" })).toBeVisible();
  expect(screen.queryByRole("button", { name: /الرسم الحر بالأحياء/ })).not.toBeInTheDocument();
  fireEvent.click(within(categories).getByRole("button", { name: "الأدوات العامة والذكاء الاصطناعي" }));
  expect(screen.queryByRole("button", { name: /المعادلات الكيميائية/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "ورقتك تحچي" }));
  expect(onSelect).toHaveBeenCalledWith("paperReview", { subject: "chemistry" });
  fireEvent.click(screen.getByRole("button", { name: "اسأل متميّز" }));
  expect(onSelect).toHaveBeenCalledWith("mutamayiz", { subject: "chemistry" });
  fireEvent.click(screen.getByRole("button", { name: /Start chemistry/ }));
  expect(onSelect).toHaveBeenCalledWith("mcqBank");

  fireEvent.click(screen.getByRole("button", { name: "كل المواد" }));
  fireEvent.click(screen.getByRole("button", { name: "الإنجليزية" }));
  expect(screen.getByRole("button", { name: "Start english_literature" })).toBeVisible();
  expect(screen.getByRole("button", { name: /بنك أسئلة الأدب الإنكليزي/ })).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "كل المواد" }));
  fireEvent.click(screen.getByRole("button", { name: "الرياضيات" }));
  expect(screen.getByRole("button", { name: /مبرهنات الهندسة المجسمة/ })).toBeVisible();
  expect(screen.queryByRole("button", { name: /Start / })).not.toBeInTheDocument();
});

it("routes actual due mistakes directly and starts fresh on a new Study tab entry", async () => {
  test.fetchDue.mockImplementation(async subject => subject === "physics");
  rememberStudySubjectFocus("physics");
  const onSelect = vi.fn();
  render(<SubjectsHub language="en" onBack={vi.fn()} onSelect={onSelect} />);
  fireEvent.click(await screen.findByRole("button", { name: "Review your due mistakes in this subject" }));
  expect(test.fetchDue).toHaveBeenCalledWith("physics");
  expect(onSelect).toHaveBeenCalledWith("mistakes", { subject: "physics", startReview: true });
  fireEvent.click(screen.getByRole("button", { name: /MCQ Bank/ }));
  expect(onSelect).toHaveBeenCalledWith("mcqBank", { subject: "physics" });

  // The bottom tab uses this explicit fresh-entry action even when already on Study.
  act(() => resetStudySubjectFocus());
  await waitFor(() => expect(screen.getByRole("heading", { name: "Choose a subject" })).toBeVisible());
  fireEvent.click(screen.getByRole("button", { name: "Chemistry" }));
  await waitFor(() => expect(test.fetchDue).toHaveBeenCalledWith("chemistry"));
  expect(screen.queryByRole("button", { name: "Review your due mistakes in this subject" })).not.toBeInTheDocument();
});


it("shows the same general and AI catalog for every subject", async () => {
  test.subscription.userId = "";
  const onSelect = vi.fn();
  render(<SubjectsHub language="en" onBack={vi.fn()} onSelect={onSelect} />);
  let baseline: string[] | undefined;
  for (const subject of ["Physics", "Chemistry", "Biology", "Mathematics", "English", "French", "Arabic", "Islamic"]) {
    fireEvent.click(screen.getByRole("button", { name: subject }));
    fireEvent.click(screen.getByRole("button", { name: "General and AI tools" }));
    const tools = within(screen.getByRole("region", { name: "General and AI tools" })).getAllByRole("button");
    const labels = tools.map(tool => tool.textContent ?? "");
    if (baseline === undefined) baseline = labels;
    expect(labels).toEqual(baseline);
    expect(labels.join(" ")).toContain("Audio Tutor");
    expect(labels.join(" ")).toContain("Physics Problem Generator");
    fireEvent.click(screen.getByRole("button", { name: "All Subjects" }));
  }
  test.subscription.userId = "test-student";
});
