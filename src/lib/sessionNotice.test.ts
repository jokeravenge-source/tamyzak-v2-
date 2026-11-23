import { describe, expect, it } from "vitest";
import { makeSessionNotice } from "../../supabase/functions/_shared/session-notice";

describe("Baghdad session announcements", () => {
  const origin = "https://tamyazak.site";
  it("maps all eight local start times to the right session and room", () => {
    const orders = ["الثامن", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع"];
    orders.forEach((order, index) => {
      const slot = `2026-11-23T${String(index * 3).padStart(2, "0")}:00:00+03:00`;
      const post = makeSessionNotice(slot, origin);
      expect(post.text).toContain(`بدأ السشن ${order}`);
      expect(post.text).toContain(origin + "/room?code=37ECJK");
      expect(post.reply_markup.inline_keyboard[0][0].url).toBe(origin + "/room?code=37ECJK");
    });
  });
  it("announces the entire winning ballot without exposing keys", () => {
    const post = makeSessionNotice("2026-11-23T00:00:00+03:00", origin, { subject: "physics", chapter: 4, language: "en" });
    expect(post.text).toContain("الفيزياء · الفصل 4 · المنهج الإنكليزي");
    expect(post.text).toContain(origin + "/room?code=37ECJK");
  });
});
