import { supabase } from "@/integrations/supabase/client";

const KEY = "seen_admin_notes_v1";

function readSeen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function writeSeen(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids)).slice(-500)));
  } catch {
    /* ignore */
  }
}

async function fetchNoteIds(): Promise<string[]> {
  const { data } = await (supabase as any).from("admin_notes").select("id").limit(500);
  return Array.isArray(data) ? data.map((r: any) => String(r.id)) : [];
}

/** Number of admin notes the user has never opened. */
export async function unseenAdminNotesCount(): Promise<number> {
  try {
    const ids = await fetchNoteIds();
    const seen = new Set(readSeen());
    return ids.filter((id) => !seen.has(id)).length;
  } catch {
    return 0;
  }
}

/** Called when the user opens the Study Notes screen. */
export async function markAllAdminNotesSeen(): Promise<void> {
  try {
    const ids = await fetchNoteIds();
    writeSeen([...readSeen(), ...ids]);
  } catch {
    /* ignore */
  }
}
