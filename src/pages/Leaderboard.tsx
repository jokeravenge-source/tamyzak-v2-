import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppLanguage } from "@/components/LanguageGate";
import type { MainMenuChoice } from "@/pages/MainMenu";
import type { Gender, CharacterTraits } from "@/components/CharacterAvatar";
import { LeaderboardView, type LeaderboardRow } from "@/components/leaderboard/LeaderboardView";
import { readDaily, writeDaily } from "@/lib/dailyCache";
import StudentProfileDialog from "@/components/StudentProfileDialog";

const Leaderboard = ({ language, onBack, onNav }: {
  language: AppLanguage;
  onBack: () => void;
  onNav: (choice: MainMenuChoice) => void;
}) => {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [openProfile, setOpenProfile] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    setError(false);
    try {
      const { data: user } = await supabase.auth.getUser();
      setMe(user.user?.id ?? null);

      // Keep the full-board read limited to once per Baghdad day, unless
      // the student explicitly refreshes. Totals still match profile points.
      if (!force) {
        const cached = readDaily<LeaderboardRow[]>("leaderboard");
        if (cached) {
          setRows(cached);
          return;
        }
      }

      const pageSize = 1000;
      const totals = new Map<string, number>();
      let from = 0;
      while (true) {
        const { data: page, error: pointsError } = await supabase
          .from("user_points")
          .select("user_id, points")
          .range(from, from + pageSize - 1);
        if (pointsError) throw pointsError;
        (page ?? []).forEach((row) => {
          totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + (row.points ?? 0));
        });
        if (!page || page.length < pageSize) break;
        from += pageSize;
      }

      const names = new Map<string, string>();
      const genders = new Map<string, Gender | null>();
      const characters = new Map<string, Partial<CharacterTraits> | null>();
      let profileFrom = 0;
      while (true) {
        const { data: page, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, display_name, gender, character")
          .order("updated_at", { ascending: false })
          .range(profileFrom, profileFrom + pageSize - 1);
        if (profileError) throw profileError;
        (page ?? []).forEach((profile) => {
          if (!names.has(profile.user_id)) {
            names.set(profile.user_id, (profile.display_name || "").trim() || "Student");
            genders.set(profile.user_id, (profile.gender as Gender) ?? null);
            characters.set(profile.user_id, (profile.character as Partial<CharacterTraits>) ?? null);
          }
        });
        if (!page || page.length < pageSize) break;
        profileFrom += pageSize;
      }

      const list: LeaderboardRow[] = Array.from(totals.entries()).map(([user_id, points]) => ({
        user_id, points,
        name: names.get(user_id) || "Student",
        gender: genders.get(user_id) ?? null,
        traits: characters.get(user_id) ?? null,
      })).sort((a, b) => b.points - a.points);

      setRows(list);
      writeDaily("leaderboard", list);
    } catch {
      // A failed page must not replace the last complete board with partial totals.
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <>
    <LeaderboardView
      language={language} rows={rows} me={me} loading={loading}
      refreshing={refreshing} error={error} onBack={onBack}
      onRefresh={() => { void load(true); }}
      onProfile={setOpenProfile}
      onStudy={() => onNav("subjectsHub")}
    />
    <StudentProfileDialog userId={openProfile} language={language} onClose={() => setOpenProfile(null)} />
  </>;
};

export default Leaderboard;
