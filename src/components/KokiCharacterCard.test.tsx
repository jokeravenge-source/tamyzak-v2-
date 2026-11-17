import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import KokiCharacterCard from "./KokiCharacterCard";

const api = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: api.rpc } }));
const onSelect = vi.fn(async () => {});
const props = { userId: "student", language: "en" as const, selected: false, onSelect };
const status = (unlocked: boolean, owner = "student") => ({ data: { user_id: owner, unlocked: unlocked ? ["koki"] : [] }, error: null });

beforeEach(() => { vi.clearAllMocks(); api.rpc.mockResolvedValue(status(false)); });
afterEach(cleanup);

it("requires a code even when the profile claims Koki is selected", async () => {
  render(<KokiCharacterCard {...props} selected />);
  expect(await screen.findByLabelText("Character access code")).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Use Koki" })).not.toBeInTheDocument();
  expect(onSelect).not.toHaveBeenCalled();
});

it("keeps an incorrect code locked, then unlocks and permits selection after server acceptance", async () => {
  api.rpc.mockImplementation(async (name: string, args?: { access_code: string }) => name === "character_unlock_status" ? status(false)
    : { data: args?.access_code === "KOKI" ? { ok: true, user_id: "student", character_key: "koki" } : { ok: false, reason: "invalid_code" }, error: null });
  render(<KokiCharacterCard {...props} />);
  const field = await screen.findByLabelText("Character access code");
  fireEvent.change(field, { target: { value: "wrong" } });
  fireEvent.click(screen.getByRole("button", { name: "Unlock character" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect code");
  expect(onSelect).not.toHaveBeenCalled();
  fireEvent.change(field, { target: { value: "  KOKI  " } });
  fireEvent.click(screen.getByRole("button", { name: "Unlock character" }));
  const select = await screen.findByRole("button", { name: "Use Koki" });
  expect(api.rpc).toHaveBeenLastCalledWith("redeem_character_code", { access_code: "KOKI" });
  expect(screen.queryByLabelText("Character access code")).not.toBeInTheDocument();
  fireEvent.click(select);
  await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
});

it("restores account access without requiring the code again", async () => {
  api.rpc.mockResolvedValue(status(true));
  render(<KokiCharacterCard {...props} language="ar" selected />);
  expect(await screen.findByRole("button", { name: "كوكي هي شخصيتك الحالية" })).toBeDisabled();
  expect(screen.queryByLabelText("كود فتح الشخصية")).not.toBeInTheDocument();
});

it("fails closed on network errors and allows a fresh status check", async () => {
  api.rpc.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(status(true));
  render(<KokiCharacterCard {...props} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not load");
  expect(screen.queryByRole("button", { name: "Use Koki" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Check again" }));
  expect(await screen.findByRole("button", { name: "Use Koki" })).toBeEnabled();
});

it("does not trust an entitlement or redemption returned for another account", async () => {
  api.rpc.mockResolvedValueOnce(status(true, "other"))
    .mockResolvedValueOnce({ data: { ok: true, user_id: "other", character_key: "koki" }, error: null });
  render(<KokiCharacterCard {...props} />);
  const field = await screen.findByLabelText("Character access code");
  fireEvent.change(field, { target: { value: "code" } });
  fireEvent.click(screen.getByRole("button", { name: "Unlock character" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Incorrect code"));
  expect(screen.queryByRole("button", { name: "Use Koki" })).not.toBeInTheDocument();
});

it("reports a failed profile save without losing the permanent unlock", async () => {
  api.rpc.mockResolvedValue(status(true));
  onSelect.mockRejectedValueOnce(new Error("save failed"));
  render(<KokiCharacterCard {...props} />);
  fireEvent.click(await screen.findByRole("button", { name: "Use Koki" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not save");
  expect(screen.getByRole("button", { name: "Use Koki" })).toBeEnabled();
});
