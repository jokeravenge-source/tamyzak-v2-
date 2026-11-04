import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20261104160000_english_reading_three_day_trial.sql",
  "utf8",
);
const entitlement = readFileSync("supabase/functions/_shared/entitlement.ts", "utf8");

describe("English reading three-day trial", () => {
  it("starts once per account and expires after exactly 72 hours", () => {
    expect(migration).toContain("user_id uuid PRIMARY KEY");
    expect(migration).toContain("now() + interval '3 days'");
    expect(migration).toContain("expires_at = started_at + interval '3 days'");
    expect(migration).toContain("ON CONFLICT (user_id) DO NOTHING");
  });

  it("allows paid members and denies an expired free trial", () => {
    expect(migration).toContain("IF public.can_use_premium_tools() THEN");
    expect(migration).toContain("'premium', true");
    expect(migration).toContain("'access', now() < _trial.expires_at");
  });

  it("protects both generation and grading on the server", () => {
    expect(entitlement).toContain('feature === "english_reading_generate"');
    expect(entitlement).toContain('feature === "english_reading_grade"');
    expect(entitlement).toContain('supabase.rpc("claim_english_reading_access")');
    expect(entitlement).toContain("Your 3-day reading-practice trial has ended");
  });
});
