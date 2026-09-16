import { describe, expect, it } from "vitest";
import { hasActivePremiumSubscription, isPremiumTool, PREMIUM_TELEGRAM_URL } from "./premium";
import { PREMIUM_AI_FEATURES, verifyPremiumAccess } from "../../supabase/functions/_shared/premium-access";

describe("Premium access policy", () => {
  const now = Date.parse("2026-09-16T12:00:00Z");
  const subscription = { status: "active", environment: "live", current_period_end: "2026-10-16T12:00:00Z" };
  it.each(["active", "trialing", "past_due"])("accepts a valid %s membership", (status) => {
    expect(hasActivePremiumSubscription({ ...subscription, status }, "live", now)).toBe(true);
  });
  it.each(["canceled", "paused", "expired", "unknown"])("rejects %s status", (status) => {
    expect(hasActivePremiumSubscription({ ...subscription, status }, "live", now)).toBe(false);
  });
  it("rejects missing, expired, malformed, and other-environment subscriptions", () => {
    expect(hasActivePremiumSubscription(null, "live", now)).toBe(false);
    for (const current_period_end of ["2026-09-16T12:00:00Z", "2026-09-15T12:00:00Z", "invalid"]) {
      expect(hasActivePremiumSubscription({ ...subscription, current_period_end }, "live", now)).toBe(false);
    }
    expect(hasActivePremiumSubscription({ ...subscription, environment: "sandbox" }, "live", now)).toBe(false);
    expect(hasActivePremiumSubscription({ ...subscription, current_period_end: null }, "live", now)).toBe(true);
  });
  it.each(["flashcards", "mcqBank", "ministerialBank", "malazam", "sessions", "todo", "chemicalEquations", "physicsActivities", "chemistryExperiments", "notes"])("keeps %s free", (tool) => {
    expect(isPremiumTool(tool)).toBe(false);
  });
  it.each(["mcq", "essay", "subjectTutor", "problemGenerator", "physicsProblemSolver", "examGenerator", "videoNotes", "podcastTutor", "englishReadingPractice", "liveBattle"])("locks %s for non-members", (tool) => {
    expect(isPremiumTool(tool)).toBe(true);
  });
  it("uses the requested Telegram account", () => {
    expect(PREMIUM_TELEGRAM_URL).toBe("https://t.me/ias404");
  });
  it("protects the paid AI generation and grading features", () => {
    for (const feature of ["mcq", "essay", "agent", "problem_generator", "exam_generator", "exam_grade", "english_reading_generate", "english_reading_grade"]) {
      expect(PREMIUM_AI_FEATURES.has(feature)).toBe(true);
    }
    expect(PREMIUM_AI_FEATURES.has("chat")).toBe(false);
  });
  it("accepts only an explicit server entitlement", async () => {
    expect(await verifyPremiumAccess(async () => ({ data: true, error: null }))).toEqual({ ok: true });
    for (const data of [false, null, undefined, "true", 1]) {
      expect(await verifyPremiumAccess(async () => ({ data, error: null }))).toMatchObject({ ok: false, status: 403 });
    }
  });
  it("fails closed when entitlement lookup fails", async () => {
    expect(await verifyPremiumAccess(async () => ({ data: true, error: { message: "unavailable" } }))).toMatchObject({ ok: false, status: 500 });
    expect(await verifyPremiumAccess(async () => { throw new Error("offline"); })).toMatchObject({ ok: false, status: 500 });
  });
});
