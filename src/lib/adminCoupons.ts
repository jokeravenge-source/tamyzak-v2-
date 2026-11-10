export type CouponUnit = "hours" | "days" | "months";

export function validateCoupon(code: string, amount: number, unit: string): string | null {
  if (!code.trim() || code.trim().length > 100) return "اكتب كوداً من 1 إلى 100 حرف.";
  if (!Number.isInteger(amount) || amount < 1 || amount > 1200) return "المدة يجب أن تكون عدداً صحيحاً من 1 إلى 1200.";
  if (!["hours", "days", "months"].includes(unit)) return "اختر ساعات أو أيام أو أشهر.";
  return null;
}