import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, MessageCircle, MessageSquarePlus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import CommunityChatMark, { chatBannerClass } from "@/components/CommunityChatMark";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { censorText, isMessageAllowed } from "@/lib/censor";
import {
  COMMUNITY_COMMENT_LIMIT, COMMUNITY_POST_LIMIT, createChatComment, createChatPost,
  listChatComments, listChatPosts, removeChatEntry, type ChatComment, type ChatCursor, type ChatDraft, type ChatPost,
} from "@/lib/communityChat";

const copy = {
  en: {
    back: "Community", title: "Chat", description: "Posts and conversations from Tamayzak students.",
    writePost: "Write a post", postPlaceholder: "What would you like to share?",
    post: "Post", writeComment: "Write a comment", commentPlaceholder: "Share your reply…", sendComment: "Send comment", publishing: "Sending…",
    feed: "Posts", comments: "Comments", hideComments: "Hide comments", student: "Student",
    empty: "There are no posts yet. Start the conversation.", noComments: "No comments yet.",
    loading: "Loading posts…", loadingComments: "Loading comments…", retry: "Try again", loadMore: "More posts", moreComments: "More comments",
    feedError: "Couldn't load the posts.", commentError: "Couldn't load the comments.",
    sendError: "Couldn't send that. Your text is still here.", blocked: "This text contains words blocked by the chat filter.",
    deletePost: "Delete post", deleteComment: "Delete comment", confirmPost: "Delete this post and its comments?",
    confirmComment: "Delete this comment?", deleteError: "Couldn't delete that. Try again.",
    signIn: "Sign in to read and join the conversation.",
  },
  ar: {
    back: "المجتمع", title: "الدردشة", description: "منشورات ونقاشات طلاب تميّزك.",
    writePost: "اكتب منشور", postPlaceholder: "شنو تحب تشارك؟",
    post: "نشر", writeComment: "اكتب تعليق", commentPlaceholder: "شارك بردّك…", sendComment: "إرسال التعليق", publishing: "جاري الإرسال…",
    feed: "المنشورات", comments: "التعليقات", hideComments: "إخفاء التعليقات", student: "طالب",
    empty: "ماكو منشورات بعد. ابدأ النقاش.", noComments: "ماكو تعليقات بعد.",
    loading: "جاري تحميل المنشورات…", loadingComments: "جاري تحميل التعليقات…", retry: "جرّب مرة ثانية",
    loadMore: "منشورات أكثر", moreComments: "تعليقات أكثر", feedError: "ما قدرنا نحمّل المنشورات.", commentError: "ما قدرنا نحمّل التعليقات.",
    sendError: "ما تم الإرسال. النص بعده موجود.", blocked: "النص بيه كلمات يمنعها فلتر الدردشة.",
    deletePost: "حذف المنشور", deleteComment: "حذف التعليق", confirmPost: "تحذف هذا المنشور وتعليقاته؟",
    confirmComment: "تحذف هذا التعليق؟", deleteError: "ما قدرنا نحذف. جرّب مرة ثانية.",
    signIn: "سجّل دخولك حتى تقرأ وتشارك بالنقاش.",
  },
} as const;

const dates = {
  en: new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Baghdad" }),
  ar: new Intl.DateTimeFormat("ar-IQ", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Baghdad" }),
};
type Copy = (typeof copy)[AppLanguage];

function Composer({ label, placeholder, button, limit, isPost, t, send, refresh }: {
  label: string;
  placeholder: string;
  button: string;
  limit: number;
  isPost?: boolean;
  t: Copy;
  send: (draft: ChatDraft) => Promise<void>;
  refresh: () => Promise<void>;
}) {
  const inputId = useId();
  const draftId = useRef<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const save = useMutation({
    mutationFn: send,
    onSuccess: async () => {
      setText("");
      draftId.current = null;
      await refresh();
    },
    onError: () => setError(t.sendError),
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || save.isPending) return;
    if (!isMessageAllowed(body)) { setError(t.blocked); return; }
    setError("");
    draftId.current ??= crypto.randomUUID();
    save.mutate({ id: draftId.current, body });
  };

  return (
    <form onSubmit={submit} className={isPost ? "rounded-3xl border border-teal-700/20 bg-card p-4 shadow-sm dark:border-teal-300/25 sm:p-5" : "mt-3"}>
      <label htmlFor={inputId} className={isPost ? "mb-3 flex items-center gap-2.5 font-bold" : "mb-1.5 block text-sm font-semibold"}>
        {isPost && (
          <span className="grid size-9 place-items-center rounded-xl bg-teal-700/10 text-teal-800 dark:bg-teal-300/15 dark:text-teal-200">
            <MessageSquarePlus className="size-4" aria-hidden="true" />
          </span>
        )}{label}
      </label>
      <Textarea id={inputId} value={text} onChange={event => {
        setText(event.target.value);
        setError("");
        draftId.current = null;
      }} maxLength={limit} disabled={save.isPending} rows={2} dir="auto"
        aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined}
        placeholder={placeholder} className="min-h-[4.5rem] resize-y rounded-xl bg-background text-base" />
      {error && <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      <div className="mt-2 flex items-center justify-between gap-3">
        {text.length > 0 && <span className="text-xs tabular-nums text-muted-foreground" dir="ltr">{text.length} / {limit}</span>}
        <Button type="submit" disabled={!text.trim() || save.isPending}
          className="ms-auto min-h-11 bg-teal-800 text-white hover:bg-teal-900 dark:bg-teal-300 dark:text-teal-950 dark:hover:bg-teal-200">
          <Send aria-hidden="true" />{save.isPending ? t.publishing : button}
        </Button>
      </div>
    </form>
  );
}

function Message({ entry, language, student, small, actions }: {
  entry: ChatComment;
  language: AppLanguage;
  student: string;
  small?: boolean;
  actions?: ReactNode;
}) {
  const name = (entry.author_name && censorText(entry.author_name)) || student;
  const body = isMessageAllowed(entry.body) ? entry.body : censorText(entry.body);
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <span className={`grid shrink-0 place-items-center rounded-full bg-teal-700/10 font-bold text-teal-900 dark:bg-teal-300/15 dark:text-teal-100 ${small ? "size-8 text-xs" : "size-10 text-sm"}`} aria-hidden="true">
          {Array.from(name)[0]?.toLocaleUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <bdi className="inline-block max-w-full text-sm font-bold [overflow-wrap:anywhere]">{name}</bdi>
          <time dateTime={entry.created_at} className="block text-xs text-muted-foreground">{dates[language].format(new Date(entry.created_at))}</time>
        </div>
        {actions}
      </div>
      <p className={`mt-2 whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere] ${small ? "text-sm" : "text-base"}`} dir="auto">{body}</p>
    </div>
  );
}

function DeleteEntry({ type, id, t, refresh }: {
  type: "post" | "comment";
  id: string;
  t: Copy;
  refresh: () => Promise<void>;
}) {
  const remove = useMutation({
    mutationFn: () => removeChatEntry(type, id),
    onSuccess: refresh,
    onError: () => toast.error(t.deleteError),
  });
  const post = type === "post";
  return (
    <Button size="icon" variant="ghost" type="button" disabled={remove.isPending}
      aria-label={post ? t.deletePost : t.deleteComment} className="size-11 shrink-0 text-muted-foreground hover:text-destructive"
      onClick={() => { if (window.confirm(post ? t.confirmPost : t.confirmComment)) remove.mutate(); }}>
      <Trash2 aria-hidden="true" />
    </Button>
  );
}

function ChatThread({ id, postId, userId, language, canModerate, refreshFeed }: {
  id: string;
  postId: string;
  userId: string;
  language: AppLanguage;
  canModerate: boolean;
  refreshFeed: () => Promise<void>;
}) {
  const t = copy[language];
  const store = useQueryClient();
  const queryKey = ["community-chat-comments", userId, postId];
  const comments = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => listChatComments(postId, pageParam, signal),
    initialPageParam: null as ChatCursor | null,
    getNextPageParam: page => page.next ?? undefined,
    refetchInterval: 30_000,
    retry: false,
  });
  const refresh = async () => {
    await Promise.all([store.invalidateQueries({ queryKey }), refreshFeed()]);
  };
  const items = comments.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-3 rounded-2xl border border-teal-800/15 bg-teal-700/5 p-3 dark:border-teal-300/20 dark:bg-teal-300/5 sm:p-4">
      <h3 id={`${id}-heading`} className="flex items-center gap-2 text-sm font-bold text-teal-900 dark:text-teal-100">
        <MessageCircle className="size-4" aria-hidden="true" />{t.comments}
      </h3>
      <Composer label={t.writeComment} placeholder={t.commentPlaceholder} button={t.sendComment} limit={COMMUNITY_COMMENT_LIMIT}
        t={t} send={draft => createChatComment(postId, userId, draft)} refresh={refresh} />
      {comments.isPending && <p role="status" className="mt-3 text-sm text-muted-foreground">{t.loadingComments}</p>}
      {comments.isError && <p role="alert" className="mt-3 text-sm">{t.commentError}{" "}
        <Button type="button" variant="link" onClick={() => void comments.refetch()}>{t.retry}</Button>
      </p>}
      {comments.isSuccess && items.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{t.noComments}</p>}
      <ul className="mt-3 space-y-2">
        {items.map(comment => (
          <li key={comment.id} className="rounded-xl border border-border/70 bg-card p-3">
            <Message entry={comment} language={language} student={t.student} small
              actions={(canModerate || comment.author_id === userId) && <DeleteEntry type="comment" id={comment.id} t={t} refresh={refresh} />} />
          </li>
        ))}
      </ul>
      {comments.hasNextPage && <Button type="button" variant="outline" className="mt-3" disabled={comments.isFetching}
        onClick={() => void comments.fetchNextPage()}>{t.moreComments}</Button>}
    </section>
  );
}

function PostCard({ post, userId, language, canModerate, refreshFeed }: {
  post: ChatPost;
  userId: string;
  language: AppLanguage;
  canModerate: boolean;
  refreshFeed: () => Promise<void>;
}) {
  const t = copy[language];
  const threadId = useId();
  const [open, setOpen] = useState(false);
  const count = post.comment_count.toLocaleString(language === "ar" ? "ar-IQ" : "en");
  return (
    <article className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <Message entry={post} language={language} student={t.student}
        actions={(canModerate || post.author_id === userId) && <DeleteEntry type="post" id={post.id} t={t} refresh={refreshFeed} />} />
      <div className="mt-3 border-t border-border/80 pt-3">
        <Button type="button" variant="secondary" aria-expanded={open} aria-controls={open ? threadId : undefined}
          onClick={() => setOpen(value => !value)}
          className="min-h-11 rounded-full bg-teal-700/10 text-teal-900 hover:bg-teal-700/20 dark:bg-teal-300/15 dark:text-teal-100 dark:hover:bg-teal-300/25">
          <MessageCircle aria-hidden="true" />
          {open ? t.hideComments : `${t.comments} (${count})`}
          <ChevronDown className={open ? "rotate-180" : undefined} aria-hidden="true" />
        </Button>
      </div>
      {open && <ChatThread id={threadId} postId={post.id} userId={userId} language={language} canModerate={canModerate} refreshFeed={refreshFeed} />}
    </article>
  );
}

export default function CommunityChat({ language, userId, canModerate, onBack }: {
  language: AppLanguage;
  userId: string | null;
  canModerate: boolean;
  onBack: () => void;
}) {
  const t = copy[language];
  const ar = language === "ar";
  const feedHeading = useId();
  const store = useQueryClient();
  const queryKey = ["community-chat-posts", userId];
  const posts = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => listChatPosts(pageParam, signal),
    initialPageParam: null as ChatCursor | null,
    getNextPageParam: page => page.next ?? undefined,
    enabled: !!userId,
    refetchInterval: 30_000,
    retry: false,
  });
  const refreshFeed = () => store.invalidateQueries({ queryKey });
  const items = posts.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <main dir={ar ? "rtl" : "ltr"} className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-9">
      <Button type="button" variant="ghost" onClick={onBack} className="-ms-2 mb-3 gap-2">
        <ArrowLeft className={ar ? "rotate-180" : ""} aria-hidden="true" />{t.back}
      </Button>
      <header className={`mb-4 flex items-center gap-4 rounded-3xl px-4 py-5 sm:gap-5 sm:px-6 ${chatBannerClass}`}>
        <CommunityChatMark className="size-[3.75rem] sm:size-[4.5rem]" />
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.title}</h1>
          <p className="mt-1 text-sm leading-relaxed text-teal-50">{t.description}</p>
        </div>
      </header>
      {!userId ? <p className="text-sm text-muted-foreground">{t.signIn}</p> : (
        <>
          <Composer label={t.writePost} placeholder={t.postPlaceholder} button={t.post} limit={COMMUNITY_POST_LIMIT}
            isPost t={t} send={draft => createChatPost(userId, draft)} refresh={refreshFeed} />
          <section aria-labelledby={feedHeading} className="mt-6 space-y-3">
            <h2 id={feedHeading} className="flex items-center gap-2 text-lg font-bold">
              <MessageCircle className="size-5 text-teal-800 dark:text-teal-200" aria-hidden="true" />{t.feed}
            </h2>
            {posts.isPending && <p role="status" className="text-sm text-muted-foreground">{t.loading}</p>}
            {posts.isError && <p role="alert" className="text-sm">{t.feedError}{" "}
              <Button type="button" variant="link" onClick={() => void posts.refetch()}>{t.retry}</Button>
            </p>}
            {posts.isSuccess && items.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">{t.empty}</p>
            )}
            {items.map(post => <PostCard key={post.id} post={post} userId={userId} language={language} canModerate={canModerate} refreshFeed={refreshFeed} />)}
            {posts.hasNextPage && <Button type="button" variant="outline" disabled={posts.isFetching} onClick={() => void posts.fetchNextPage()}>{t.loadMore}</Button>}
          </section>
        </>
      )}
    </main>
  );
}
