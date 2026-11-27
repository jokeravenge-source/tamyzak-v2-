import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CommunityChat from "./CommunityChat";
import type { ChatComment, ChatDraft, ChatPost, ChatPostDraft, ChatReaction } from "@/lib/communityChat";

const api = vi.hoisted(() => ({ posts: vi.fn(), comments: vi.fn(), post: vi.fn(), comment: vi.fn(), remove: vi.fn(), photoUrls: vi.fn(), reaction: vi.fn() }));
vi.mock("@/lib/communityChat", () => ({
  COMMUNITY_POST_LIMIT: 2000, COMMUNITY_COMMENT_LIMIT: 1000,
  CHAT_PHOTO_ACCEPT: "image/jpeg,image/png,image/webp", CHAT_PHOTO_LIMIT: 4,
  isChatPhoto: (file: File) => file.type === "image/png",
  listChatPosts: api.posts, listChatComments: api.comments,
  createChatPost: api.post, createChatComment: api.comment, removeChatEntry: api.remove,
  getChatPhotoUrls: api.photoUrls, setChatReaction: api.reaction,
}));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const defaults = { photo_paths: [], like_count: 0, dislike_count: 0, viewer_reaction: null };

function open(userId: string | null = "student") {
  const query = new QueryClient();
  return render(<QueryClientProvider client={query}>
    <CommunityChat language="en" userId={userId} canModerate={false} onBack={vi.fn()} />
  </QueryClientProvider>);
}

it("creates a post and adds a comment to that post only", async () => {
  const time = "2026-11-27T18:05:00Z";
  const entries: ChatPost[] = [{ ...defaults, id: "other", author_id: "noor", author_name: "Noor", body: "My exam question", created_at: time, comment_count: 0 }];
  const replies = new Map<string, ChatComment[]>();
  api.posts.mockImplementation(async () => ({
    items: entries.map(post => ({ ...post, comment_count: replies.get(post.id)?.length ?? 0 })), next: null,
  }));
  api.comments.mockImplementation(async (id: string) => ({ items: replies.get(id) ?? [], next: null }));
  api.post.mockImplementation(async (author: string, draft: ChatDraft) => {
    entries.unshift({ ...defaults, ...draft, author_id: author, author_name: "Ali", created_at: time, comment_count: 0 });
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

it("publishes multiple photos with no caption and displays the saved photos", async () => {
  const photos = ["first.png", "second.png"].map(name => new File(["photo"], name, { type: "image/png" }));
  const entries: ChatPost[] = [];
  api.posts.mockImplementation(async () => ({ items: [...entries], next: null }));
  api.post.mockImplementation(async (userId: string, draft: ChatPostDraft) => {
    entries.push({ ...defaults, id: draft.id, author_id: userId, author_name: "Ali", body: draft.body,
      created_at: "2026-11-27T18:05:00Z", comment_count: 0, photo_paths: draft.photos!.map(photo => photo.name) });
  });
  api.photoUrls.mockResolvedValue({ "first.png": "https://example.test/first.png", "second.png": "https://example.test/second.png" });
  const { container } = open();
  const picker = container.querySelector('input[type="file"]')!;
  fireEvent.change(picker, { target: { files: [new File(["test"], "invalid.svg", { type: "image/svg+xml" })] } });
  expect(screen.getByRole("alert")).toHaveTextContent(/up to 5 MB/);
  expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
  fireEvent.change(picker, { target: { files: photos } });
  expect(screen.getByRole("button", { name: "Remove photo 2" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Post" }));
  expect(await screen.findByRole("img", { name: "Post photo 2" })).toHaveAttribute("src", "https://example.test/second.png");
  expect(api.post).toHaveBeenCalledWith("student", expect.objectContaining({ body: "", photos }));
});

it("animates selecting a reaction, switches the saved vote, and clears it on a second tap", async () => {
  const entry: ChatPost = { ...defaults, id: "post", author_id: "ali", author_name: "Ali", body: "Physics revision",
    created_at: "2026-11-27T18:05:00Z", comment_count: 0 };
  api.posts.mockImplementation(async () => ({ items: [{ ...entry }], next: null }));
  api.reaction.mockImplementation(async (_id: string, reaction: ChatReaction | null) => {
    const summary = { like_count: Number(reaction === "like"), dislike_count: Number(reaction === "dislike"), viewer_reaction: reaction };
    Object.assign(entry, summary);
    return summary;
  });
  open();
  const like = await screen.findByRole("button", { name: "Like" });
  const dislike = screen.getByRole("button", { name: "Dislike" });
  fireEvent.click(like);
  expect(like.querySelector(".chat-reaction-burst--like")).toBeInTheDocument();
  await waitFor(() => { expect(like).toHaveAttribute("aria-pressed", "true"); expect(like).not.toHaveAttribute("aria-disabled"); });
  expect(like).toHaveTextContent("1");
  fireEvent.click(dislike);
  expect(dislike.querySelector(".chat-reaction-burst--dislike")).toBeInTheDocument();
  await waitFor(() => { expect(dislike).toHaveAttribute("aria-pressed", "true"); expect(dislike).not.toHaveAttribute("aria-disabled"); });
  expect(like).toHaveTextContent("0");
  expect(dislike).toHaveTextContent("1");
  fireEvent.click(dislike);
  await waitFor(() => expect(api.reaction.mock.calls).toEqual([["post", "like"], ["post", "dislike"], ["post", null]]));
  expect(dislike).toHaveAttribute("aria-pressed", "false");
});
