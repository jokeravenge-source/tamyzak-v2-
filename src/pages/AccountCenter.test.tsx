import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AccountCenter from "./AccountCenter";

const api = vi.hoisted(() => ({ details: vi.fn(), pending: false, gender: null as string | null, update: vi.fn(), rpc: vi.fn(), saveError: false }));
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => ({ isPremium: false }) }));
vi.mock("@/components/ProfileDetailsCard", () => ({ default: (props: unknown) => {
  api.details(props); return <section aria-label="Profile editor"><button>Save profile</button></section>;
} }));
vi.mock("@/components/ThemePicker", () => ({ ThemePicker: () => null }));
vi.mock("@/components/ReferralCard", () => ({ ReferralCard: () => null }));
vi.mock("@/components/TelegramLinkCard", () => ({ TelegramLinkCard: () => null }));
vi.mock("@/components/PushNotificationsCard", () => ({ PushNotificationsCard: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: "student", email: "student@example.test" } } }) },
  rpc: (name: string) => api.rpc(name),
  from: (table: string) => {
    const query = { select: () => query, eq: () => query, order: () => query, limit: () => query,
      update: (patch: unknown) => { api.update(patch); return query; },
      single: async () => api.saveError ? { data: null, error: new Error("save rejected") } : { data: { user_id: "student" }, error: null },
      maybeSingle: async () => ({ data: table === "profiles" ? { display_name: "Student", gender: api.gender, character: { variant: 1, pets: ["cat"] } }
        : api.pending ? { id: "request", requested_name: "Requested name" } : null, error: null }),
    };
    return query;
  },
} }));
beforeEach(() => {
  vi.clearAllMocks(); api.pending = false; api.gender = null; api.saveError = false; localStorage.clear();
  api.rpc.mockImplementation(async (name: string) => ({ data: name === "character_unlock_status" ? { user_id: "student", unlocked: ["koki"] } : { lifetime_points: 0 }, error: null }));
});
afterEach(cleanup);

it("restores the profile editor in Account Center for a free student", async () => {
  render(<AccountCenter language="en" onBack={() => {}} />);
  expect(await screen.findByRole("region", { name: "Profile editor" })).toBeInTheDocument();
  expect(api.details).toHaveBeenCalledWith({ userId: "student", language: "en" });
});

it("shows the student's actual points, streak, and progress to the next rank", async () => {
  api.rpc.mockResolvedValueOnce({ data: { lifetime_points: 3319, current_streak: 6 }, error: null });
  const onNav = vi.fn();
  render(<AccountCenter language="en" onBack={() => {}} onNav={onNav} />);

  const overview = within(await screen.findByRole("region", { name: "Student" }));
  expect(overview.getByText("3,319")).toBeVisible();
  expect(overview.getByText("6")).toBeVisible();
  expect(overview.getByText("Diamond")).toBeVisible();
  expect(overview.getByRole("progressbar", { name: "Progress to the next rank" })).toHaveAttribute("aria-valuenow", "43");
  expect(overview.getByText("1,681 points to Royal")).toBeVisible();

  fireEvent.click(overview.getByRole("button", { name: "Leaderboard" }));
  expect(onNav).toHaveBeenCalledWith("leaderboard");
});

it("keeps bio editing available while a username change awaits approval", async () => {
  api.pending = true;
  render(<AccountCenter language="ar" onBack={() => {}} />);
  expect(await screen.findByRole("button", { name: "Save profile" })).toBeEnabled();
  expect(screen.getByDisplayValue("Student")).toBeDisabled();
  expect(api.details).toHaveBeenCalledWith({ userId: "student", language: "ar" });
});

it("saves Koki atomically with her gender and preserves existing character options", async () => {
  api.gender = "male";
  render(<AccountCenter language="en" onBack={() => {}} />);
  fireEvent.click(await screen.findByText("Customize your character"));
  fireEvent.click(await screen.findByRole("button", { name: "Use Koki" }));
  await waitFor(() => expect(api.update).toHaveBeenCalledWith(expect.objectContaining({
    gender: "female", character: expect.objectContaining({ variant: 16, pets: ["cat"] }),
  })));
  expect(await screen.findByRole("button", { name: "Koki is your current character" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Male" }));
  await waitFor(() => expect(api.update).toHaveBeenLastCalledWith(expect.objectContaining({
    gender: "male", character: expect.objectContaining({ variant: 1, pets: ["cat"] }),
  })));
});

it("does not display Koki as saved when the profile update is rejected", async () => {
  api.gender = "male";
  api.saveError = true;
  render(<AccountCenter language="en" onBack={() => {}} />);
  fireEvent.click(await screen.findByText("Customize your character"));
  fireEvent.click(await screen.findByRole("button", { name: "Use Koki" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not save the character");
  expect(screen.queryByRole("button", { name: "Koki is your current character" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Use Koki" })).toBeEnabled();
});
