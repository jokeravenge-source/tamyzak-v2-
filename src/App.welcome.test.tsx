import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App";
import { LanguageGate, LANGUAGE_STORAGE_KEY } from "./components/LanguageGate";
import { usageIntroAnswered } from "./lib/usageIntro";

const auth = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: {
    getSession: auth.getSession,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  } },
}));
vi.mock("@/hooks/useFlightStudySync", () => ({ useFlightStudySync: vi.fn() }));
vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => ({ isPremium: false, loading: false, userId: null }),
}));
vi.mock("@/components/PointsAwardOverlay", () => ({ default: () => null }));
vi.mock("@/components/FeatureUnlockCelebration", () => ({ default: () => null }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.history.replaceState(null, "", "/");
  localStorage.clear();
  sessionStorage.clear();
  auth.getSession.mockReset();
  auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
});

afterEach(() => {
  cleanup();
  document.documentElement.lang = "en";
  document.documentElement.removeAttribute("dir");
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it.each([
  { language: "en", option: "English", direction: "ltr", signIn: "Welcome back" },
  { language: "ar", option: "العربية", direction: "rtl", signIn: "أهلاً بعودتك" },
])("introduces Tamayzak before sign-in and remembers $language", async ({ language, option, direction, signIn }) => {
  const view = render(<App />);
  expect(screen.getByRole("log")).toHaveTextContent("Hi! I’m Mutamayiz");
  expect(screen.queryByRole("tablist")).toBeNull();
  expect(screen.queryByRole("button", { name: option })).toBeNull();

  await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
  expect(screen.getByRole("log")).toHaveTextContent("read study notes");
  expect(screen.queryByRole("button", { name: option })).toBeNull();
  await act(async () => { await vi.advanceTimersByTimeAsync(1400); });
  expect(screen.getByRole("log")).toHaveTextContent("Which language would you like to use?");
  fireEvent.click(screen.getByRole("button", { name: option }));

  expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(language);
  expect(usageIntroAnswered()).toBe(true);
  expect(document.documentElement).toHaveAttribute("lang", language);
  expect(document.documentElement).toHaveAttribute("dir", direction);
  expect(screen.getByRole("heading", { name: signIn })).toBeVisible();

  view.unmount();
  render(<App />);
  await act(async () => { await vi.advanceTimersByTimeAsync(0); });
  expect(screen.queryByRole("log")).toBeNull();
  expect(screen.getByRole("heading", { name: signIn })).toBeVisible();
});

it("opens the language choices immediately when changing a preference", () => {
  const onSelect = vi.fn();
  render(<LanguageGate onSelect={onSelect} showWelcome={false} />);
  expect(screen.getByRole("log")).not.toHaveTextContent("Pick a subject");
  fireEvent.click(screen.getByRole("button", { name: "English" }));
  expect(onSelect).toHaveBeenCalledWith("en");
});

it("changes the sign-in language without remounting the form", async () => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, "ar");
  render(<App />);
  await act(async () => { await vi.advanceTimersByTimeAsync(0); });
  fireEvent.change(screen.getByLabelText("بريد Gmail"), { target: { value: "student@gmail.com" } });
  fireEvent.click(screen.getByRole("button", { name: "English" }));
  expect(screen.getByLabelText("Gmail address")).toHaveValue("student@gmail.com");
  expect(document.documentElement).toHaveAttribute("lang", "en");
  expect(document.documentElement).toHaveAttribute("dir", "ltr");
});
