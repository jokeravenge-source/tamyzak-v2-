import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { authorizeFeature, PREMIUM_AI_FEATURES } from "../../supabase/functions/_shared/premium-access";

describe("AI access without daily quotas", () => {
  it("allows repeated free-feature use without a subscription or quota lookup", async () => {
    const check = vi.fn();
    for (let attempt = 0; attempt < 100; attempt++) {
      expect(await authorizeFeature("student", "chat", check)).toEqual({ ok: true, userId: "student", bypassed: false });
    }
    expect(check).not.toHaveBeenCalled();
  });
  it.each([...PREMIUM_AI_FEATURES])("keeps %s behind Premium", async (feature) => {
    const check = vi.fn(async () => ({ data: false, error: null }));
    expect(await authorizeFeature("student", feature, check)).toMatchObject({ ok: false, status: 403 });
    expect(check).toHaveBeenCalledOnce();
  });
  it("allows repeated Premium use without a daily counter", async () => {
    const check = vi.fn(async () => ({ data: true, error: null }));
    for (let attempt = 0; attempt < 100; attempt++) {
      expect(await authorizeFeature("member", "mcq", check)).toEqual({ ok: true, userId: "member", bypassed: true });
    }
  });
  it.each(["chat", "mcq"])("still rejects anonymous %s access", async (feature) => {
    const check = vi.fn();
    expect(await authorizeFeature(undefined, feature, check)).toMatchObject({ ok: false, status: 401 });
    expect(check).not.toHaveBeenCalled();
  });
  it("still fails closed on a Premium lookup failure", async () => {
    expect(await authorizeFeature("member", "mcq", async () => ({ data: true, error: new Error("offline") }))).toMatchObject({ ok: false, status: 500 });
  });
  it("keeps legacy SQL membership restrictions aligned with the edge policy", () => {
    const sql = readFileSync("supabase/migrations/20260916130000_remove_daily_ai_limits.sql", "utf8");
    const featureBlock = sql.match(/IF _feature IN \(([\s\S]*?)\) THEN RETURN false/)?.[1] ?? "";
    const features = [...featureBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
    expect(features.sort()).toEqual([...PREMIUM_AI_FEATURES].sort());
    expect(sql).toContain("IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'");
    expect(sql).toContain("IF _feature = 'gift_daily_mcq' THEN");
  });
  it("does not leave quota calls or stale refund deletions in the active AI paths", () => {
    const entitlement = readFileSync("supabase/functions/_shared/entitlement.ts", "utf8");
    expect(entitlement).not.toMatch(/claim_daily_feature|dailyLimit/);
    for (const path of ["grade-course-exam", "video-notes"]) {
      const source = readFileSync(`supabase/functions/${path}/index.ts`, "utf8");
      expect(source).not.toMatch(/refundQuota|refundFeatureUse|quotaReserved|claim_daily_feature/);
      expect(source).toContain("await protect(req,");
      expect(source).toContain("await requireUser(req)");
    }
  });
});
