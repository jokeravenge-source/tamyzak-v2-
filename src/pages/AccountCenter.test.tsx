import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AccountCenter from "./AccountCenter";
import type { CharacterTraits } from "@/components/CharacterAvatar";

const api = vi.hoisted(() => ({ details: vi.fn(), pending: false, gender: null as string | null, update: vi.fn(), rpc: vi.fn(), saveError: false, character: {} as Partial<CharacterTraits> }));
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
    let updatedCharacter: Partial<CharacterTraits> | undefined;
    const query = { select: () => query, eq: () => query, order: () => query, limit: () => query,
      update: (patch: { character?: Partial<CharacterTraits> }) => { api.update(patch); updatedCharacter = patch.character; return query; },
      single: async () => api.saveError ? { data: null, error: new Error("save rejected") } : { data: { user_id: "student" }, error: null },
      maybeSingle: async () => {
        if (table === "profiles") {
          if (updatedCharacter && api.saveError) return { data: null, error: new Error("save rejected") };
          if (updatedCharacter) api.character = updatedCharacter;
          return { data: { display_name: "Student", gender: api.gender, character: api.character }, error: null };
        }
        return { data: api.pending ? { id: "request", requested_name: "Requested name" } : null, error: null };
      },
    };
    return query;
  },
} }));
beforeEach(() => {
  vi.clearAllMocks(); api.pending = false; api.gender = null; api.saveError = false; localStorage.clear();
  api.character = { variant: 1, pets: ["cat"] };
  api.rpc.mockImplementation(async (name: string) => ({ data: name === "character_unlock_status" ? { user_id: "student", unlocked: ["koki"] } : { lifetime_points: 0 }, error: null }));
});
afterEach(cleanup);

it("restores the profile editor in Account Center for a free student", async () => {
  render(<AccountCenter language="en" onBack={() => {}} />);
  expect(await screen.findByRole("region", { name: "Profile editor" })).toBeInTheDocument();
  expect(api.details).toHaveBeenCalledWith({ userId: "student", language: "en" });
});

it("keeps profile editing and general settings in separate tabs without losing edits", async () => {
  const onChangeLanguage = vi.fn();
  render(<AccountCenter language="en" onBack={() => {}} onChangeLanguage={onChangeLanguage} />);
  const tabs = within(screen.getByRole("tablist", { name: "Settings" }));
  const profileTab = tabs.getByRole("tab", { name: "Character & profile" });
  const generalTab = tabs.getByRole("tab", { name: "General settings" });

  expect(profileTab).toHaveAttribute("aria-selected", "true");
  const profile = within(screen.getByRole("tabpanel", { name: "Character & profile" }));
  const input = await profile.findByRole("textbox", { name: "Username" });
  const editor = profile.getByRole("region", { name: "Profile editor" });
  expect(profile.getByText("Customize your character")).toBeVisible();
  expect(screen.queryByRole("tabpanel", { name: "General settings" })).not.toBeInTheDocument();
  fireEvent.change(input, { target: { value: "Draft name" } });

  fireEvent.mouseDown(generalTab, { button: 0, ctrlKey: false });
  const general = within(screen.getByRole("tabpanel", { name: "General settings" }));
  expect(generalTab).toHaveAttribute("aria-selected", "true");
  expect(screen.queryByRole("textbox", { name: "Username" })).not.toBeInTheDocument();
  fireEvent.click(general.getByText("App & study settings"));
  fireEvent.click(general.getByRole("button", { name: /Change language/ }));
  expect(onChangeLanguage).toHaveBeenCalledOnce();

  fireEvent.mouseDown(profileTab, { button: 0, ctrlKey: false });
  expect(input).toBeVisible();
  expect(input).toHaveValue("Draft name");
  expect(screen.getByRole("region", { name: "Profile editor" })).toBe(editor);
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
  expect(screen.getByRole("tab", { name: "الشخصية والملف الشخصي" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tab", { name: "الإعدادات العامة" })).toBeVisible();
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

it("previews adjustments locally and saves or resets them for only the selected accessory and character", async () => {
  api.gender = "female";
  const otherFit = { x: 2, y: 3, scale: 90, rotation: 4 };
  api.character = {
    variant: 16, hat: "red-cap", chain: "gold", pets: ["cat"],
    accessoryFits: { "female:6": { "red-cap": otherFit }, "female:16": { "gold-chain": otherFit } },
  };
  render(<AccountCenter language="en" onBack={() => {}} />);
  fireEvent.click(await screen.findByText("Customize your character"));
  fireEvent.click(screen.getByRole("button", { name: "Adjust accessories" }));
  const dialog = within(screen.getByRole("dialog", { name: "Adjust accessories" }));
  expect(dialog.getByRole("combobox", { name: "Accessory" })).toHaveValue("red-cap");
  const preview = dialog.getByRole("group", { name: "Character preview" });
  const cap = preview.querySelector('[data-avatar-accessory="red-cap"]');
  expect(cap).toHaveStyle({ left: "49%" });
  fireEvent.change(dialog.getByRole("slider", { name: "Horizontal" }), { target: { value: "6" } });
  expect(cap).toHaveStyle({ left: "55%" });
  expect(api.update).not.toHaveBeenCalled();
  fireEvent.click(dialog.getByRole("button", { name: "Save fit" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(api.character.pets).toEqual(["cat"]);
  expect(api.character.accessoryFits).toEqual({
    "female:6": { "red-cap": otherFit },
    "female:16": { "gold-chain": otherFit, "red-cap": { x: 6, y: 0, scale: 100, rotation: 0 } },
  });

  fireEvent.click(screen.getByRole("button", { name: "Adjust accessories" }));
  expect(screen.getByRole("slider", { name: "Horizontal" })).toHaveValue("6");
  fireEvent.click(screen.getByRole("button", { name: "Reset fit" }));
  expect(screen.getByRole("slider", { name: "Horizontal" })).toHaveValue("0");
  fireEvent.click(screen.getByRole("button", { name: "Save fit" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(api.character.accessoryFits).toEqual({ "female:6": { "red-cap": otherFit }, "female:16": { "gold-chain": otherFit } });
});
