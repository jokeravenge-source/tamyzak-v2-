import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Community from "./Community";
import Friends from "./Friends";

const data = vi.hoisted(() => ({ list: vi.fn(), add: vi.fn(), remove: vi.fn(), search: vi.fn() }));
vi.mock("@/lib/communityFriends", () => ({
  listCommunityFriends: data.list,
  addCommunityFriend: data.add,
  removeCommunityFriend: data.remove,
}));
vi.mock("@/lib/studentDirectory", () => ({ searchStudentDirectory: data.search }));
vi.mock("@/components/StudentProfileDialog", () => ({ default: () => null }));

afterEach(() => { cleanup(); vi.resetAllMocks(); });

it.each([
  { language: "en", title: "Community", session: "Sessions", friends: "Friends", chat: "Chat" },
  { language: "ar", title: "المجتمع", session: "الجلسات", friends: "الأصدقاء", chat: "الدردشة" },
] as const)("opens all three Community destinations in $language", ({ language, title, session, friends, chat }) => {
  const openSessions = vi.fn();
  const openFriends = vi.fn();
  const openChat = vi.fn();
  render(<Community language={language} onOpenSessions={openSessions} onOpenFriends={openFriends} onOpenChat={openChat} />);
  expect(screen.getByRole("heading", { name: title })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: new RegExp(session) }));
  fireEvent.click(screen.getByRole("button", { name: new RegExp(friends) }));
  expect(openSessions).toHaveBeenCalledOnce();
  expect(openFriends).toHaveBeenCalledOnce();
  const chatCard = screen.getByRole("button", { name: new RegExp(`^${chat}`) });
  expect(screen.getAllByRole("button")[2]).toBe(chatCard);
  fireEvent.click(chatCard);
  expect(openChat).toHaveBeenCalledOnce();
});

it("loads the account's friends, adds a name match once, and supports undoing a saved friend", async () => {
  const ali = { user_id: "ali", display_name: "Ali Hassan" };
  let saved = [{ user_id: "noor", display_name: "Noor Karim" }];
  data.list.mockImplementation(async () => [...saved]);
  data.search.mockResolvedValue([ali]);
  data.add.mockImplementation(async () => { saved.push(ali); });
  data.remove.mockImplementation(async () => { saved = saved.filter(friend => friend.user_id !== ali.user_id); });

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><Friends language="en" userId="student" onBack={vi.fn()} /></QueryClientProvider>);
  const list = within(screen.getByRole("region", { name: "Your friends" }));
  expect(await list.findByText("Noor Karim")).toBeVisible();
  fireEvent.change(screen.getByRole("searchbox", { name: "Search by name" }), { target: { value: "Ali" } });
  fireEvent.click(await screen.findByRole("button", { name: "Add Ali Hassan" }));
  expect(await list.findByText("Ali Hassan")).toBeVisible();
  expect(data.search).toHaveBeenCalledWith("Ali", expect.any(AbortSignal));
  expect(data.add).toHaveBeenCalledExactlyOnceWith("student", "ali");
  expect(screen.queryByRole("button", { name: "Add Ali Hassan" })).toBeNull();
  expect(screen.getByText("Added")).toBeVisible();

  fireEvent.click(list.getByRole("button", { name: "Remove Ali Hassan" }));
  expect(await screen.findByRole("button", { name: "Add Ali Hassan" })).toBeVisible();
  expect(list.queryByText("Ali Hassan")).toBeNull();
  expect(data.remove).toHaveBeenCalledExactlyOnceWith("student", "ali");
});
