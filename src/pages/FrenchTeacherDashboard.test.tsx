import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FrenchTeacherDashboard from "./FrenchTeacherDashboard";

const backend = vi.hoisted(() => ({ session: true, allowed: false, owner: false }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: {
    getSession: vi.fn(async () => ({ data: { session: backend.session ? { user: { id: "teacher" } } : null } })),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  rpc: vi.fn(async (name: string) => ({ data: name === "french_flashcard_access" ? { allowed: backend.allowed, owner: backend.owner } : [], error: null })),
} }));
vi.mock("@/components/AdminFrenchFlashcardsTab", () => ({ default: () => <div>French card editor</div> }));
afterEach(() => { cleanup(); backend.session = true; backend.allowed = false; backend.owner = false; });

describe("French teacher access", () => {
  it("requires teacher sign-in for visitors", async () => {
    backend.session = false;
    render(<FrenchTeacherDashboard />);
    expect(await screen.findByRole("heading", { name: "Teacher sign-in" })).toBeInTheDocument();
    expect(screen.queryByText("French card editor")).not.toBeInTheDocument();
  });
  it("does not render the editor for a signed-in student", async () => {
    render(<FrenchTeacherDashboard />);
    expect(await screen.findByRole("heading", { name: "Staff access required" })).toBeInTheDocument();
    expect(screen.queryByText("French card editor")).not.toBeInTheDocument();
  });
  it("gives teachers the French editor without staff management", async () => {
    backend.allowed = true;
    render(<FrenchTeacherDashboard />);
    expect(await screen.findByText("French card editor")).toBeInTheDocument();
    expect(screen.queryByText("Manage French teaching staff")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Admin Dashboard" })).not.toBeInTheDocument();
  });
  it("lets the owner manage French staff", async () => {
    backend.allowed = true; backend.owner = true;
    render(<FrenchTeacherDashboard />);
    await waitFor(() => expect(screen.getByText("Manage French teaching staff")).toBeInTheDocument());
  });
});
