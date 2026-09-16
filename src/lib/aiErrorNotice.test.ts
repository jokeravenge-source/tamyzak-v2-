import { describe, expect, it } from "vitest";
import { aiErrorNotice } from "./aiErrorNotice";

describe("AI error copy without daily limits", () => {
  it.each(["en", "ar"] as const)("explains temporary throttling in %s without a daily reset or upgrade", (language) => {
    for (const error of [{ status: 429, upgrade: true }, { message: "rate_limited" }, { message: "Too many requests" }]) {
      const notice = aiErrorNotice(error, language);
      expect(notice.premiumRequired).toBe(false);
      expect(notice.message).not.toMatch(/daily|midnight|tomorrow|Premium|يومي|منتصف|بريميوم/);
      expect(notice.message).toMatch(language === "ar" ? /طلبات كثيرة/ : /Too many requests/);
    }
  });
  it.each(["en", "ar"] as const)("keeps membership errors distinct in %s", (language) => {
    for (const error of [{ message: "Premium membership required. Unlock via Telegram: @ias404." }, { status: 403, upgrade: true }, { code: "PREMIUM_REQUIRED" }]) {
      const notice = aiErrorNotice(error, language);
      expect(notice.premiumRequired).toBe(true);
      expect(notice.message).toMatch(language === "ar" ? /بريميوم/ : /Premium/);
    }
  });
  it("does not mislabel a membership lookup failure as an upgrade requirement", () => {
    expect(aiErrorNotice({ status: 500, message: "Could not verify Premium membership. Please try again." }).premiumRequired).toBe(false);
  });
  it("does not repeat obsolete daily quota copy from an older deployment", () => {
    expect(aiErrorNotice({ message: "You've used your 5 free uses today. Upgrade to Premium for unlimited access." }).message).not.toMatch(/5|free uses|daily|Premium/);
  });
  it("preserves unrelated errors", () => {
    expect(aiErrorNotice({ message: "AI service is not configured" })).toEqual({ message: "AI service is not configured", premiumRequired: false });
  });
});
