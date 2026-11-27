import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CommunityChat from "./CommunityChat";
import type { ChatComment, ChatDraft, ChatPost } from "@/lib/communityChat";

const api = vi.hoisted(() => ({ posts: vi.fn(), comments: vi.fn(), post: vi.fn(), comment: vi.fn(), remove: vi.fn() }));
vi.mock("@/lib/communityChat", () => ({
  COMMUNITY_POST_LIMIT: 2000, COMMUNITY_COMMENT_LIMIT: 1000,
  listChatPosts: api.posts, listChatComments: api.comments,
  createChatPost: api.post, createChatComment: api.comment, removeChatEntry: api.remove,
}));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

function open(userId: string | null = "student") {
  const query = new QueryClient();
  return render(<QueryClientProvider client={query}>
    <CommunityChat language="en" userId={userId} canModerate={false} onBack={vi.fn()} />
  </QueryClientProvider>);
}

it("creates a post and adds a comment to that post only", async () => {
  const time = "2026-11-27T18:05:00Z";
  const entries: ChatPost[] = [{ id: "other", author_id: "noor", author_name: "Noor", body: "My exam question", created_at: time, comment_count: 0 }];
  const replies = new Map<string, ChatComment[]>();
  api.posts.mockImplementation(async () => ({
    items: entries.map(post => ({ ...post, comment_count: replies.get(post.id)?.length ?? 0 })), next: null,
  }));
  api.comments.mockImplementation(async (id: string) => ({ items: replies.get(id) ?? [], next: null }));
  api.post.mockImplementation(async (author: string, draft: ChatDraft) => {
    entries.unshift({ ...draft, author_id: author, author_name: "Ali", created_at: time, comment_count: 0 });
  });
  api.comment.mockImplementation(async (post: string, author: string, draft: ChatDraft) => {
    replies.set(post, [{ ...draft, author_id: author, author_name: "Ali", created_at: time }]);
  });
  open();
  const composer = screen.getByRole("textbox", { name: "Write a post" });
  expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
  fireEvent.change(composer, { target: { value: "  Who wants to revise physics?  " } });
  fireEvent.click(screen.getByRole("button", { name: "Post" }));
  const feed = within(screen.getByRole("region", { name: "Posts" }));
  const created = await feed.findByText("Who wants to revise physics?");
  const article = within(created.closest("article")!);
  expect(composer).toHaveValue("");
  expect(article.getByText("Ali")).toBeVisible();
  expect(screen.getAllByRole("button", { name: "Delete post" })).toHaveLength(1);
  fireEvent.click(article.getByRole("button", { name: "Comments (0)" }));
  fireEvent.change(article.getByRole("textbox", { name: "Write a comment" }), { target: { value: "Let's start with chapter two." } });
  fireEvent.click(article.getByRole("button", { name: "Send comment" }));
  expect(await article.findByText("Let's start with chapter two.", { selector: "p" })).toBeVisible();
  expect(api.comment).toHaveBeenCalledWith(entries[0].id, "student", expect.objectContaining({ body: "Let's start with chapter two." }));
  fireEvent.click(article.getByRole("button", { name: "Hide comments" }));
  expect(await article.findByRole("button", { name: "Comments (1)" })).toBeVisible();
  expect(within(screen.getByText("My exam question").closest("article")!).getByRole("button", { name: "Comments (0)" })).toBeVisible();
});

it("keeps the draft and retries with the same identifier after a failed save", async () => {
  api.posts.mockResolvedValue({ items: [], next: null });
  api.post.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(undefined);
  open();
  const composer = screen.getByRole("textbox", { name: "Write a post" });
  fireEvent.change(composer, { target: { value: "Try this maths question" } });
  fireEvent.click(screen.getByRole("button", { name: "Post" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Your text is still here");
  expect(composer).toHaveValue("Try this maths question");
  fireEvent.click(screen.getByRole("button", { name: "Post" }));
  await waitFor(() => expect(api.post.mock.calls[1]).toEqual(api.post.mock.calls[0]));
});

it("asks unauthenticated visitors to sign in", () => {
  open(null);
  expect(screen.getByText("Sign in to read and join the conversation.")).toBeVisible();
  expect(api.posts).not.toHaveBeenCalled();
});
