import { useEffect, useId, useRef, useState } from "react";
import { Check, KeyRound, Loader2, LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import koki from "@/assets/character-koki.png";
import type { AppLanguage } from "@/components/LanguageGate";

export const KOKI_VARIANT = 16 as const;

// These RPCs are introduced by the character-unlock migration.
type UnlockResponse = { user_id?: string; unlocked?: string[]; ok?: boolean; character_key?: string };
type CharacterRpcClient = {
  rpc: (name: "character_unlock_status" | "redeem_character_code", args?: { access_code: string }) => PromiseLike<{ data: UnlockResponse | null; error: unknown }>;
};
const db = supabase as unknown as CharacterRpcClient;

export default function KokiCharacterCard({ userId, language, selected, onSelect }: {
  userId: string;
  language: AppLanguage;
  selected: boolean;
  onSelect: () => Promise<void>;
}) {
  const ar = language === "ar";
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const inputId = useId();
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const liveOwner = useRef<string | null>(userId);
  const running = useRef(false);

  useEffect(() => {
    let cancelled = false;
    liveOwner.current = userId;
    setUnlocked(false);
    setChecking(true);
    setError("");
    void (async () => {
      try {
        const { data, error: failure } = await db.rpc("character_unlock_status");
        if (failure) throw failure;
        if (cancelled) return;
        if (data?.user_id !== userId) throw new Error("account_changed");
        setUnlocked(data.unlocked?.includes("koki") === true);
      } catch {
        if (!cancelled) setError(tr("تعذّر تحميل حالة الشخصية. أعد المحاولة.", "Could not load character access. Try again."));
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; liveOwner.current = null; };
    // Language changes do not require another account lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, retry]);

  const redeem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim() || running.current || checking) return;
    running.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data, error: failure } = await db.rpc("redeem_character_code", { access_code: code.trim() });
      if (liveOwner.current !== userId) return;
      if (failure) throw failure;
      if (!data?.ok || data.user_id !== userId || data.character_key !== "koki") {
        setError(tr("الكود غير صحيح. تأكد منه وجرّب مرة ثانية.", "Incorrect code. Check it and try again."));
        return;
      }
      setUnlocked(true);
      setCode("");
      setNotice(tr("انفتحت كوكي بحسابك! تگدر تختارها بأي وقت.", "Koki is unlocked on your account! You can select her anytime."));
    } catch {
      if (liveOwner.current === userId) setError(tr("تعذّر تفعيل الكود. جرّب مرة ثانية.", "Could not redeem the code. Please try again."));
    } finally {
      running.current = false;
      if (liveOwner.current === userId) setBusy(false);
    }
  };

  const select = async () => {
    if (!unlocked || running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      await onSelect();
    } catch {
      if (liveOwner.current === userId) setError(tr("تعذّر حفظ الشخصية. أعد المحاولة.", "Could not save the character. Please try again."));
    } finally {
      running.current = false;
      if (liveOwner.current === userId) setBusy(false);
    }
  };

  return (
    <section aria-label={tr("شخصية كوكي", "Koki character")} className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-center gap-3">
        <img src={koki} alt={tr("كوكي ويا الأرنب", "Koki with her rabbit")} className="h-28 w-24 shrink-0 object-contain" draggable={false} />
        <div className="min-w-0 space-y-2">
          <h3 className="font-bold">{tr("كوكي", "Koki")}</h3>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : unlocked ? <Check className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
            {checking ? tr("جاري التحقق…", "Checking…") : unlocked ? tr("مفتوحة بحسابك", "Unlocked on your account") : tr("شخصية خاصة — تنفتح بكود", "Special character — code required")}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">{tr("فعّل كود الشخصية مرة وحدة، وتبقى مفتوحة بحسابك.", "Redeem a character code once to keep her unlocked on your account.")}</p>
        </div>
      </div>
      {!checking && (unlocked ? (
        <button type="button" disabled={busy || selected} onClick={() => void select()} aria-pressed={selected}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : selected ? <Check className="h-4 w-4" /> : null}
          {selected ? tr("كوكي هي شخصيتك الحالية", "Koki is your current character") : tr("استعمال كوكي", "Use Koki")}
        </button>
      ) : (
        <form onSubmit={redeem} className="mt-3 space-y-2">
          <label htmlFor={inputId} className="block text-xs font-semibold">{tr("كود فتح الشخصية", "Character access code")}</label>
          <div className="flex flex-wrap gap-2">
            <input id={inputId} value={code} onChange={event => setCode(event.target.value)} disabled={busy}
              dir="ltr" autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={100} required
              className="min-h-11 w-32 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-base" />
            <button type="submit" disabled={busy || !code.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {tr("فتح الشخصية", "Unlock character")}
            </button>
          </div>
        </form>
      ))}
      {notice && <p role="status" className="mt-3 text-sm text-primary">{notice}</p>}
      {error && <div className="mt-3 space-y-2"><p role="alert" className="text-sm text-destructive">{error}</p>
        {!unlocked && <button type="button" disabled={busy || checking} className="min-h-11 text-xs font-bold underline" onClick={() => setRetry(value => value + 1)}>{tr("إعادة التحقق", "Check again")}</button>}
      </div>}
    </section>
  );
}
