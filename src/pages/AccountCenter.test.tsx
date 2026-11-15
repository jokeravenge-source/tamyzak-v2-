import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import AccountCenter from "./AccountCenter";

const api = vi.hoisted(() => ({ details: vi.fn(), pending: false }));
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
  rpc: async () => ({ data: { lifetime_points: 0 }, error: null }),
  from: (table: string) => {
    const query = { select: () => query, eq: () => query, order: () => query, limit: () => query,
      maybeSingle: async () => ({ data: table === "profiles" ? { display_name: "Student", gender: null, character: null }
        : api.pending ? { id: "request", requested_name: "Requested name" } : null, error: null }),
    };
    return query;
  },
} }));
beforeEach(() => { vi.clearAllMocks(); api.pending = false; localStorage.clear(); });

it("restores the profile editor in Account Center for a free student", async () => {
  render(<AccountCenter language="en" onBack={() => {}} />);
  expect(await screen.findByRole("region", { name: "Profile editor" })).toBeInTheDocument();
  expect(api.details).toHaveBeenCalledWith({ userId: "student", language: "en" });
});

it("keeps bio editing available while a username change awaits approval", async () => {
  api.pending = true;
  render(<AccountCenter language="ar" onBack={() => {}} />);
  expect(await screen.findByRole("button", { name: "Save profile" })).toBeEnabled();
  expect(screen.getByDisplayValue("Student")).toBeDisabled();
  expect(api.details).toHaveBeenCalledWith({ userId: "student", language: "ar" });
});
