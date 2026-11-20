type ReviewSection = {
  narration_text: string;
  verdict: string | null;
  completed_at: string | null;
};
export type PodcastBreakPlan = { minutes: number; reason: string };

export function planPodcastBreak(
  sections: ReviewSection[],
  earlierStruggles = 0,
): PodcastBreakPlan | null {
  const completed = sections.filter((section) => section.completed_at).length;
  if (
    sections.length < 2 ||
    !sections.some(section => section.completed_at && section.verdict === "correct") ||
    completed < Math.ceil(sections.length / 2) ||
    completed >= sections.length
  )
    return null;
  const words =
    sections.reduce(
      (count, section) => count + section.narration_text.split(/\s+/).length,
      0,
    ) / sections.length;
  const formulaCount = sections.reduce(
    (count, section) =>
      count +
      (section.narration_text.match(/[=∫√Σ∆Δ²³]|اشتقاق|برهان|تكامل|تعليل/g)
        ?.length ?? 0),
    0,
  );
  const struggling = Math.max(
    earlierStruggles,
    sections.filter(
      (section) => section.completed_at && (section.verdict === "partial" || section.verdict === "incorrect"),
    ).length,
  );
  if (words > 900 || formulaCount >= 12 || struggling >= 2)
    return {
      minutes: 5,
      reason:
        "المادة دسمة أو بعض الأفكار احتاجت تصحيح، فخلي المخ يرتّبها براحة.",
    };
  if (words > 450 || formulaCount >= 5 || struggling > 0)
    return {
      minutes: 3,
      reason: "وصلت لنص المراجعة، واستراحة قصيرة تساعدك ترجع للأفكار بتركيز.",
    };
  return {
    minutes: 2,
    reason: "عاشت إيدك، وصلنا للنص. تحب تاخذ نفس وتشرب مي ونرجع نكمّل؟",
  };
}
