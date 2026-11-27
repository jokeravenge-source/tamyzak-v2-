import { useEffect, useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Search, UserMinus, UserPlus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import type { AppLanguage } from "@/components/LanguageGate";
import StudentProfileDialog from "@/components/StudentProfileDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { censorText } from "@/lib/censor";
import { addCommunityFriend, listCommunityFriends, removeCommunityFriend } from "@/lib/communityFriends";
import { searchStudentDirectory, type DirectoryStudent } from "@/lib/studentDirectory";

const copy = {
  en: {
    back: "Community", title: "Friends", addTitle: "Find friends", search: "Search by name",
    placeholder: "Type a student's name", searching: "Searching…", noMatches: "No students match that name.",
    add: "Add", remove: "Remove", saved: "Added", added: "Added to your friends", removed: "Removed from your friends",
    yours: "Your friends", empty: "Your list is empty. Search by name to add your first friend.",
    loading: "Loading friends…", signIn: "Sign in to save and view your friends.",
    listError: "Couldn't load your friends.", searchError: "Couldn't search for students.",
    saveError: "Couldn't update your friends. Try again.", retry: "Try again", profile: "View profile for",
  },
  ar: {
    back: "المجتمع", title: "الأصدقاء", addTitle: "دوّر على أصدقاء", search: "ابحث بالاسم",
    placeholder: "اكتب اسم الطالب", searching: "جاري البحث…", noMatches: "ما لقينا طالب بهالاسم.",
    add: "إضافة", remove: "إزالة", saved: "تمت الإضافة", added: "انضاف لقائمة أصدقائك", removed: "انحذف من قائمة أصدقائك",
    yours: "أصدقاؤك", empty: "قائمتك فارغة. ابحث بالاسم حتى تضيف أول صديق.",
    loading: "جاري تحميل الأصدقاء…", signIn: "سجّل دخولك حتى تحفظ وتشوف قائمة أصدقائك.",
    listError: "ما قدرنا نحمّل أصدقاءك.", searchError: "ما قدرنا نبحث عن الطلاب.",
    saveError: "ما قدرنا نحدّث قائمة أصدقائك. جرّب مرة ثانية.", retry: "جرّب مرة ثانية", profile: "عرض ملف",
  },
} as const;

function FriendName({ student, label, onOpen }: { student: DirectoryStudent; label: string; onOpen: () => void }) {
  const name = censorText(student.display_name);
  return (
    <button type="button" aria-label={`${label} ${name}`} onClick={onOpen}
      className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg text-start font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-hidden="true">
        {Array.from(name)[0]?.toLocaleUpperCase() || <UsersRound className="size-4" />}
      </span>
      <bdi className="min-w-0 [overflow-wrap:anywhere]">{name}</bdi>
    </button>
  );
}

export default function Friends({ language, userId, onBack }: {
  language: AppLanguage;
  userId: string | null;
  onBack: () => void;
}) {
  const t = copy[language];
  const ar = language === "ar";
  const id = useId();
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const friendsKey = ["community-friends", userId];
  const term = input.trim();
  const searching = term.length >= 2;
  useEffect(() => {
    const timer = window.setTimeout(() => setSearchTerm(term), 250);
    return () => window.clearTimeout(timer);
  }, [term]);

  const friends = useQuery({
    queryKey: friendsKey,
    queryFn: ({ signal }) => listCommunityFriends(userId!, signal),
    enabled: !!userId,
    retry: false,
  });
  const matches = useQuery({
    queryKey: ["community-name-search", userId, searchTerm],
    queryFn: ({ signal }) => searchStudentDirectory(searchTerm, signal),
    enabled: !!userId && searching && term === searchTerm,
    retry: false,
  });
  const update = useMutation({
    mutationFn: async ({ friend, add }: { friend: DirectoryStudent; add: boolean }) => {
      if (!userId) throw new Error("AUTH_REQUIRED");
      await (add ? addCommunityFriend : removeCommunityFriend)(userId, friend.user_id);
    },
    onSuccess: async (_result, { add }) => {
      await queryClient.invalidateQueries({ queryKey: friendsKey });
      toast.success(add ? t.added : t.removed);
    },
    onError: () => toast.error(t.saveError),
  });
  const saved = new Set(friends.data?.map(row => row.user_id));
  const rowClass = "flex min-w-0 items-center gap-2 py-2";

  return (
    <main dir={ar ? "rtl" : "ltr"} className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-9">
      <Button variant="ghost" onClick={onBack} className="-ms-2 mb-3 gap-2">
        <ArrowLeft className={`size-4 ${ar ? "rotate-180" : ""}`} aria-hidden="true" />{t.back}
      </Button>
      <h1 className="mb-5 text-3xl font-bold tracking-tight">{t.title}</h1>
      {!userId ? <p className="text-sm text-muted-foreground">{t.signIn}</p> : (
        <div className="space-y-4">
          <section aria-labelledby={`${id}-find`} className="rounded-3xl border border-primary/20 bg-card p-4 shadow-sm sm:p-5">
            <h2 id={`${id}-find`} className="mb-3 flex items-center gap-2 font-bold"><UserPlus className="size-5 text-primary" aria-hidden="true" />{t.addTitle}</h2>
            <label htmlFor={`${id}-search`} className="sr-only">{t.search}</label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id={`${id}-search`} type="search" value={input} onChange={event => setInput(event.target.value)}
                autoComplete="off" maxLength={60} placeholder={t.placeholder} className="min-h-11 rounded-xl ps-9" />
            </div>
            {searching && (
              <div className="mt-2">
                {term !== searchTerm || matches.isPending ? <p role="status" className="px-1 py-2 text-sm text-muted-foreground">{t.searching}</p> :
                  matches.isError ? <p className="px-1 py-2 text-sm" role="alert">{t.searchError}{" "}<Button size="sm" variant="link" onClick={() => void matches.refetch()}>{t.retry}</Button></p> :
                  !matches.data?.length ? <p role="status" className="px-1 py-2 text-sm text-muted-foreground">{t.noMatches}</p> : (
                    <ul className="divide-y divide-border">
                      {matches.data.map(student => (
                        <li key={student.user_id} className={rowClass}>
                          <FriendName student={student} label={t.profile} onOpen={() => setProfile(student.user_id)} />
                          {saved.has(student.user_id) ? (
                            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary"><Check className="size-4" aria-hidden="true" />{t.saved}</span>
                          ) : (
                            <Button size="sm" type="button" disabled={update.isPending || friends.isPending}
                              aria-label={`${t.add} ${censorText(student.display_name)}`} onClick={() => update.mutate({ friend: student, add: true })}>
                              <UserPlus className="size-4" aria-hidden="true" />{t.add}
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            )}
          </section>

          <section aria-labelledby={`${id}-saved`} className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <h2 id={`${id}-saved`} className="mb-2 flex items-center gap-2 font-bold"><UsersRound className="size-5 text-primary" aria-hidden="true" />{t.yours}</h2>
            {friends.isPending ? <p role="status" className="py-2 text-sm text-muted-foreground">{t.loading}</p> :
              friends.isError ? <p role="alert" className="py-2 text-sm">{t.listError}{" "}<Button size="sm" variant="link" onClick={() => void friends.refetch()}>{t.retry}</Button></p> :
              !friends.data?.length ? <p className="py-2 text-sm leading-relaxed text-muted-foreground">{t.empty}</p> : (
                <ul className="divide-y divide-border">
                  {friends.data.map(student => (
                    <li key={student.user_id} className={rowClass}>
                      <FriendName student={student} label={t.profile} onOpen={() => setProfile(student.user_id)} />
                      <Button type="button" size="icon" variant="ghost" disabled={update.isPending}
                        className="size-11 shrink-0 text-muted-foreground" aria-label={`${t.remove} ${censorText(student.display_name)}`}
                        onClick={() => update.mutate({ friend: student, add: false })}>
                        <UserMinus className="size-4" aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        </div>
      )}
      {profile && <StudentProfileDialog userId={profile} language={language} onClose={() => setProfile(null)} />}
    </main>
  );
}
