import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Auth from "./Auth";

const mocks = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { signInWithPassword: mocks.signIn } } }));
vi.mock("@/integrations/lovable", () => ({ lovable: { auth: { signInWithOAuth: vi.fn() } } }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), getSignupSource: vi.fn() }));
beforeEach(() => { localStorage.clear(); mocks.signIn.mockReset(); });
afterEach(cleanup);

describe("bilingual sign-in", () => {
  it("defaults to Arabic and changes language without losing the entered details", () => {
    render(<Auth onAuthed={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("بريد Gmail"), { target: { value: "student@gmail.com" } });
    fireEvent.change(screen.getByLabelText("كلمة المرور"), { target: { value: "example-password" } });
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByLabelText("Gmail address")).toHaveValue("student@gmail.com");
    expect(screen.getByLabelText("Password")).toHaveValue("example-password");
    expect(screen.getByRole("main")).toHaveAttribute("dir", "ltr");
    expect(localStorage.getItem("app_language_v1")).toBe("en");
  });

  it("explains an invalid address next to the form without submitting it", () => {
    render(<Auth onAuthed={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("بريد Gmail"), { target: { value: "student@example.com" } });
    fireEvent.change(screen.getByLabelText("كلمة المرور"), { target: { value: "example-password" } });
    fireEvent.click(screen.getByRole("button", { name: "تسجيل الدخول" }));
    expect(screen.getByRole("alert")).toHaveTextContent("gmail.com");
    expect(screen.getByLabelText("بريد Gmail")).toHaveAttribute("aria-invalid", "true");
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
});
