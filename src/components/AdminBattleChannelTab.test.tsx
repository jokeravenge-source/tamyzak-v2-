import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AdminBattleChannelTab from "./AdminBattleChannelTab";
const api = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn() }));
vi.mock("@/lib/battleChannel", () => ({ getBattleChannelAdminConfig: api.get, saveBattleChannelConfig: api.save }));
beforeEach(() => { vi.clearAllMocks(); api.get.mockResolvedValue({ enabled: false, chat_id: "", invite_url: "", bot_username: "sovforcejoin_bot" }); api.save.mockResolvedValue(undefined); });
afterEach(cleanup);
it("saves channel settings through the admin endpoint without collecting a bot token", async () => {
  render(<AdminBattleChannelTab />);
  const id = await screen.findByLabelText("معرّف الكروب أو اليوزر");
  fireEvent.change(id, { target: { value: "-1001234567890" } });
  fireEvent.change(screen.getByLabelText("رابط دعوة الكروب"), { target: { value: "https://t.me/+Example" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "تحقق من الربط واحفظ" }));
  await waitFor(() => expect(api.save).toHaveBeenCalledWith({ enabled: true, chat_id: "-1001234567890", invite_url: "https://t.me/+Example" }));
  expect(await screen.findByRole("status")).toHaveTextContent("تم التحقق");
  expect(screen.queryByLabelText(/token|توكن/i)).not.toBeInTheDocument();
});
it("explains missing bot rights without reporting that publishing is enabled", async () => {
  api.save.mockRejectedValue(new Error("BOT_GROUP_PERMISSION_REQUIRED"));
  render(<AdminBattleChannelTab />);
  fireEvent.change(await screen.findByLabelText("معرّف الكروب أو اليوزر"), { target: { value: "-1001234567890" } });
  fireEvent.click(screen.getByRole("checkbox")); fireEvent.click(screen.getByRole("button", { name: "تحقق من الربط واحفظ" }));
  expect(await screen.findByRole("status")).toHaveTextContent("أضف البوت للكروب");
  expect(screen.queryByText(/تم التحقق من صلاحيات البوت وتفعيل/)).not.toBeInTheDocument();
});

it("lets the owner configure the public group using its link alone", async () => {
  render(<AdminBattleChannelTab />);
  fireEvent.change(await screen.findByLabelText("رابط دعوة الكروب"), { target: { value: "https://t.me/tamayzak" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "تحقق من الربط واحفظ" }));
  await waitFor(() => expect(api.save).toHaveBeenCalledWith({ enabled: true, chat_id: "", invite_url: "https://t.me/tamayzak" }));
});
