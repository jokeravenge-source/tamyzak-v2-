import { expect, it } from "vitest";
import { botCanPostToGroup, groupIdCommand, isTelegramGroupId, resolvedGroupId, telegramGroupTarget } from "../../supabase/functions/_shared/battle-group-target";

it("resolves the selected public group link without a manually supplied ID", () => {
  expect(telegramGroupTarget("", "https://t.me/tamayzak")).toBe("@tamayzak");
  expect(telegramGroupTarget("https://t.me/tamayzak", "")).toBe("@tamayzak");
  expect(telegramGroupTarget("@tamayzak", "")).toBe("@tamayzak");
  expect(telegramGroupTarget("", "https://t.me/+PrivateInvite")).toBeNull();
  expect(telegramGroupTarget("", "https://t.me.evil.invalid/tamayzak")).toBeNull();
});

it("supports ordinary group IDs as well as supergroups, and rejects user IDs", () => {
  expect(isTelegramGroupId("-123456789")).toBe(true);
  expect(isTelegramGroupId("-1001234567890")).toBe(true);
  expect(isTelegramGroupId("123456789")).toBe(false);
  expect(isTelegramGroupId("-9007199254740992")).toBe(false);
  expect(resolvedGroupId({ id: -123456789, type: "group" })).toBe("-123456789");
  expect(resolvedGroupId({ id: -1001234567890, type: "supergroup" })).toBe("-1001234567890");
});

it("accepts group administrators without channel-only posting flags", () => {
  for (const type of ["group", "supergroup"]) expect(botCanPostToGroup({ id: -1001234567890, type }, { status: "administrator", can_post_messages: false })).toBe(true);
});

it("allows members only when their actual group send permissions permit it", () => {
  const group = { id: -1001234567890, type: "supergroup", permissions: { can_send_messages: true } };
  expect(botCanPostToGroup(group, { status: "member" })).toBe(true);
  expect(botCanPostToGroup({ ...group, permissions: { can_send_messages: false } }, { status: "member" })).toBe(false);
  expect(botCanPostToGroup(group, { status: "restricted", is_member: true, can_send_messages: true })).toBe(true);
  expect(botCanPostToGroup(group, { status: "restricted", is_member: false, can_send_messages: true })).toBe(false);
  expect(botCanPostToGroup(group, { status: "left" })).toBe(false);
  expect(botCanPostToGroup(group, { status: "kicked" })).toBe(false);
});

it("never accepts a channel or private chat even if its bot can post", () => {
  expect(resolvedGroupId({ id: -1001234567890, type: "channel" })).toBeNull();
  expect(botCanPostToGroup({ id: -1001234567890, type: "channel" }, { status: "administrator", can_post_messages: true })).toBe(false);
  expect(botCanPostToGroup({ id: 123456789, type: "private" }, { status: "creator" })).toBe(false);
});

it("reports a group ID only on an explicit command directed to this bot", () => {
  const message = { text: "/groupid", chat: { id: -123456789, type: "group" } };
  expect(groupIdCommand(message, "sovforcejoin_bot")).toBe("-123456789");
  expect(groupIdCommand({ ...message, text: "/groupid@sovforcejoin_bot" }, "sovforcejoin_bot")).toBe("-123456789");
  expect(groupIdCommand({ ...message, text: "/groupid@another_bot" }, "sovforcejoin_bot")).toBeNull();
  expect(groupIdCommand({ ...message, text: "normal group conversation" }, "sovforcejoin_bot")).toBeNull();
  expect(groupIdCommand({ ...message, chat: { id: 123456789, type: "private" } }, "sovforcejoin_bot")).toBeNull();
});
