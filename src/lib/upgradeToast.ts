import { toast } from "sonner";
import { openPremiumTelegram } from "@/lib/premium";
import { aiErrorNotice } from "@/lib/aiErrorNotice";

/**
 * Offer Telegram activation only for membership errors, not rate limits.
 */
export function handleAiError(err: unknown, opts?: { onUpgrade?: () => void; language?: "en" | "ar" }) {
  const lang = opts?.language ?? "en";
  const { message, premiumRequired } = aiErrorNotice(err, lang);
  if (premiumRequired) {
    toast.error(message,
      { action: { label: lang === "ar" ? "افتح عبر تيليجرام" : "Unlock via Telegram", onClick: openPremiumTelegram } },
    );
    return;
  }
  toast.error(message);
}
