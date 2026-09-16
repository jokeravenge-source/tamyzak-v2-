export const PREMIUM_TELEGRAM_URL = "https://t.me/ias404";
// Telegram activations are live subscriptions, independent of Paddle test mode.
export const PREMIUM_ENVIRONMENT = "live";

// One policy for home cards, subject tools, and persisted/deep-linked screens.
// Flashcards, both question banks, Malazam, and everyday study tracking stay free.
const PREMIUM_TOOLS = new Set([
  "mcq", "essay", "videoNotes", "podcastTutor", "mindmap", "textToVideo",
  "subjectTutor", "physicsProblemSolver", "problemGenerator", "examGenerator",
  "biologyDrawings", "physicsLaws", "organicEquations", "islamicSurahs",
  "hadithChecker", "poemsChecker", "englishEssays", "englishIsqat",
  "englishVerbForms", "englishReadingPractice", "liveBattle",
]);

export function isPremiumTool(menu: string | null): boolean {
  return menu !== null && PREMIUM_TOOLS.has(menu);
}

export function openPremiumTelegram() {
  // Same-tab navigation also works in mobile in-app browsers with popup blocking.
  window.location.assign(PREMIUM_TELEGRAM_URL);
}

export type PremiumSubscription = {
  status: string;
  current_period_end: string | null;
  environment: string;
};

export function hasActivePremiumSubscription(
  subscription: PremiumSubscription | null,
  environment: string,
  now = Date.now(),
): boolean {
  // Match the existing has_active_premium SQL policy, including billing grace.
  if (!subscription || subscription.environment !== environment ||
    !["active", "trialing", "past_due"].includes(subscription.status)) return false;
  return subscription.current_period_end === null ||
    new Date(subscription.current_period_end).getTime() > now;
}
