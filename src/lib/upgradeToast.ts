import { toast } from "sonner";
import { openPremiumInstagram } from "@/lib/premium";
import { aiErrorNotice } from "@/lib/aiErrorNotice";

/**
 * Offer Instagram contact only for membership errors, not rate limits.
 */
export function handleAiError(err: unknown, opts?: { onUpgrade?: () => void; language?: "en" | "ar" }) {
  const lang = opts?.language ?? "en";
  const { message, premiumRequired } = aiErrorNotice(err, lang);
  if (premiumRequired) {
    toast.error(message,
      { action: { label: lang === "ar" ? "تواصل عبر إنستغرام" : "Contact on Instagram", onClick: openPremiumInstagram } },
    );
    return;
  }
  toast.error(message);
}
