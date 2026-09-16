type ErrorDetails = { message?: unknown; error?: unknown; status?: number; code?: string; upgrade?: boolean; context?: { status?: number; error?: unknown; upgrade?: boolean } };

/** Daily quotas are gone. Distinguish temporary throttling from membership. */
export function aiErrorNotice(error: unknown, language: "en" | "ar" = "en") {
  const details = (error ?? {}) as ErrorDetails;
  const status = details.status ?? details.context?.status;
  const message = String(details.error || details.context?.error || details.message ||
    (language === "ar" ? "حدث خطأ" : "Something went wrong"));
  const premiumRequired = details.code === "PREMIUM_REQUIRED" ||
    (status === 403 && Boolean(details.upgrade || details.context?.upgrade)) ||
    /Premium.*(required|members? only)|requires?.*Premium|members? in Premium/i.test(message);
  if (premiumRequired) return {
    premiumRequired,
    message: language === "ar" ? "هذه الأداة للمشتركين في البريميوم فقط." : "This tool requires Premium membership.",
  };
  if (status === 429 || /429|rate[_ -]?limit|too many requests/i.test(message)) return {
    premiumRequired: false,
    message: language === "ar" ? "طلبات كثيرة الآن. حاول مرة أخرى بعد لحظات." : "Too many requests right now. Please try again shortly.",
  };
  // Older deployments may still return quota copy until their redeployment.
  if (/free (daily )?uses|daily (usage )?limit|today.*(limit|free use)|5 free uses/i.test(message)) return {
    premiumRequired: false,
    message: language === "ar" ? "تعذّر استخدام الأداة الآن. حاول مرة أخرى لاحقاً." : "The tool is unavailable right now. Please try again later.",
  };
  return { premiumRequired: false, message };
}
