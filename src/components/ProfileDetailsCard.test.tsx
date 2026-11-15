import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfileDetailsCard from "./ProfileDetailsCard";

const api = vi.hoisted(() => ({ getUser: vi.fn(), read: vi.fn(), write: vi.fn(), from: vi.fn(),
  success: vi.fn(), error: vi.fn(), listener: null as null | ((event: string, session: unknown) => void) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: api.getUser, onAuthStateChange: (listener: typeof api.listener) => {
    api.listener = listener; return { data: { subscription: { unsubscribe: vi.fn() } } };
  } }, from: api.from,
} }));
vi.mock("sonner", () => ({ toast: { success: api.success, error: api.error } }));

let profile: { bio: string | null; socials: Record<string, string>; show_study_hours: boolean };
beforeEach(() => {
  vi.clearAllMocks();
  profile = { bio: "My saved bio", socials: { instagram: "@student" }, show_study_hours: true };
  api.getUser.mockResolvedValue({ data: { user: { id: "student" } }, error: null });
  api.read.mockImplementation(async () => ({ data: { ...profile }, error: null }));
  api.write.mockImplementation(async (patch, owner) => { Object.assign(profile, patch); return { data: { user_id: owner }, error: null }; });
  api.from.mockImplementation(() => {
    let patch: unknown, owner: string;
    const query = {
      select: () => query,
      eq: (_column: string, value: string) => { owner = value; return query; },
      maybeSingle: api.read,
      update: (value: unknown) => { patch = value; return query; },
      single: () => api.write(patch, owner),
    };
    return query;
  });
});

const view = () => render(<ProfileDetailsCard language="en" userId="student" />);
const save = async () => { await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save profile" }))); };

describe("profile bio editing", () => {
  it("loads existing details and saves a trimmed bio without changing the username", async () => {
    const initial = view();
    fireEvent.change(await screen.findByLabelText("Bio"), { target: { value: "  A new bio\nfor my profile  " } });
    fireEvent.change(screen.getByRole("textbox", { name: "Instagram" }), { target: { value: " @new_name " } });
    await save();
    expect(api.write).toHaveBeenCalledWith({ bio: "A new bio\nfor my profile", socials: { instagram: "@new_name" } }, "student");
    expect(api.success).toHaveBeenCalledWith("Profile saved");
    initial.unmount(); view();
    expect(await screen.findByLabelText("Bio")).toHaveValue("A new bio\nfor my profile");
  });

  it("lets the student remove an existing bio", async () => {
    view(); fireEvent.change(await screen.findByLabelText("Bio"), { target: { value: "   " } });
    await save(); expect(api.write.mock.calls[0][0].bio).toBeNull();
  });

  it("does not overwrite a bio when loading fails and supports retry", async () => {
    api.read.mockResolvedValueOnce({ data: null, error: new Error("offline") });
    view(); await screen.findByRole("alert");
    expect(screen.queryByLabelText("Bio")).not.toBeInTheDocument();
    expect(api.write).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByLabelText("Bio")).toHaveValue("My saved bio");
  });

  it("keeps the draft and offers another save after a rejected write", async () => {
    api.write.mockResolvedValueOnce({ data: null, error: new Error("write rejected") });
    view(); fireEvent.change(await screen.findByLabelText("Bio"), { target: { value: "Keep this draft" } });
    await save(); expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
    expect(screen.getByLabelText("Bio")).toHaveValue("Keep this draft");
    expect(api.success).not.toHaveBeenCalled();
    await save(); expect(api.success).toHaveBeenCalledWith("Profile saved");
  });

  it("does not report success when an update affects no profile", async () => {
    api.write.mockResolvedValueOnce({ data: null, error: null });
    view(); await screen.findByLabelText("Bio"); await save();
    expect(api.success).not.toHaveBeenCalled(); expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("never transfers a previous student's draft into another account", async () => {
    view(); fireEvent.change(await screen.findByLabelText("Bio"), { target: { value: "Private draft" } });
    api.getUser.mockResolvedValue({ data: { user: { id: "another-student" } }, error: null });
    await save(); expect(api.write).not.toHaveBeenCalled();
    act(() => api.listener?.("SIGNED_IN", { user: { id: "another-student" } }));
    expect(screen.queryByLabelText("Bio")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("session changed");
  });

  it("ignores a late save completion after sign-out", async () => {
    let finish!: (value: unknown) => void;
    api.write.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    view(); await screen.findByLabelText("Bio"); await save();
    await waitFor(() => expect(api.write).toHaveBeenCalledOnce());
    act(() => api.listener?.("SIGNED_OUT", null));
    await act(async () => finish({ data: { user_id: "student" }, error: null }));
    expect(api.success).not.toHaveBeenCalled(); expect(screen.queryByLabelText("Bio")).not.toBeInTheDocument();
  });

  it("preserves study-hours privacy and rolls back a failed visibility change", async () => {
    api.write.mockResolvedValueOnce({ data: null, error: new Error("offline") });
    view(); const toggle = await screen.findByRole("switch");
    await act(async () => fireEvent.click(toggle)); expect(toggle).toBeChecked();
    await act(async () => fireEvent.click(toggle)); expect(toggle).not.toBeChecked();
    expect(api.write.mock.calls[1]).toEqual([{ show_study_hours: false }, "student"]);
    expect(profile.bio).toBe("My saved bio");
  });

  it("provides the Arabic editor with an accessible bio field and 280-character limit", async () => {
    render(<ProfileDetailsCard language="ar" userId="student" />);
    const bio = await screen.findByLabelText("نبذة عنك");
    expect(screen.getByRole("heading", { name: "تعديل الملف الشخصي" })).toBeInTheDocument();
    fireEvent.change(bio, { target: { value: "ا".repeat(300) } });
    expect(bio).toHaveValue("ا".repeat(280));
    expect(screen.getByText("280/280")).toBeInTheDocument();
  });
});
