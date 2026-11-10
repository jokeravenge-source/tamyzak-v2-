import { describe, expect, it } from "vitest";
import { validateCoupon } from "./adminCoupons";

describe("Admin coupon durations", () => {
  it("accepts an admin-selected duration in hours", () => expect(validateCoupon("test", 6, "hours")).toBeNull());
  it("accepts an admin-selected duration in days", () => expect(validateCoupon("test", 7, "days")).toBeNull());
  it("accepts an admin-selected duration in months", () => expect(validateCoupon("test", 3, "months")).toBeNull());
  it("rejects zero duration", () => expect(validateCoupon("test", 0, "hours")).not.toBeNull());
  it("rejects fractional durations", () => expect(validateCoupon("test", 1.5, "days")).not.toBeNull());
  it("rejects unsupported units", () => expect(validateCoupon("test", 1, "years")).not.toBeNull());
  it("requires a code", () => expect(validateCoupon("   ", 1, "hours")).not.toBeNull());
});