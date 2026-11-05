import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PREMIUM_PROMO_ENDS_AT } from "./premium";

const migration = readFileSync(
  "supabase/migrations/20261105190000_premium_word_campaign.sql",
  "utf8",
);

describe("temporary Premium word campaign", () => {
  it("ends at 10:00 AM Baghdad time on Sunday, Nov 8 2026", () => {
    expect(PREMIUM_PROMO_ENDS_AT).toBe(Date.parse("2026-11-08T07:00:00Z"));
    expect(migration).toContain("'2026-11-08 10:00:00+03'");
  });

  it("redeems the requested Arabic word only for a signed-in student", () => {
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("'المستقبل'");
    expect(migration).toContain("WHERE code = btrim(COALESCE(_code, ''))");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.redeem_premium_promo(text) TO authenticated");
  });

  it("grants server-side access only while the redemption is unexpired", () => {
    expect(migration).toContain("redemption.user_id = auth.uid()");
    expect(migration).toContain("promo.expires_at > now()");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
  });

  it("keeps later campaign words configurable without a client release", () => {
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS public.premium_promo_codes");
    expect(migration).toContain("JOIN public.premium_promo_codes promo");
  });
});
