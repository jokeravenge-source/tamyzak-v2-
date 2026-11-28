import { describe, expect, it } from "vitest";
import { dueSessionPosts, makeSessionNotice } from "../../supabase/functions/_shared/session-notice";

describe("Baghdad session announcements", () => {
  const origin = "https://tamyazak.site";
  it("maps all eight local start times to the right session and room", () => {
    const orders = ["الثامن", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع"];
    orders.forEach((order, index) => {
      const slot = `2026-11-23T${String(index * 3).padStart(2, "0")}:00:00+03:00`;
      const post = makeSessionNotice(slot, origin, { kind: "session", studentCount: 12 });
      expect(post.text).toContain(`بدأ السشن ${order}`);
      expect(post.text).toContain("عدد الطلاب بالغرفة هسه · ١٢");
      expect(post.text).toContain(origin + "/room?code=37ECJK");
      expect(post.reply_markup.inline_keyboard[0][0].url).toBe(origin + "/room?code=37ECJK");
    });
  });
  it("schedules session and break together and keeps the existing voting and battle windows", () => {
    const slot = Date.parse("2026-11-23T00:00:00+03:00");
    expect(dueSessionPosts(slot, slot - 1)).toEqual([]);
    expect(dueSessionPosts(slot, slot)).toEqual(["session", "break"]);
    expect(dueSessionPosts(slot, slot + 179_999)).toEqual(["session", "break"]);
    expect(dueSessionPosts(slot, slot + 180_000)).toEqual(["battle"]);
    expect(dueSessionPosts(slot, slot + 299_999)).toEqual(["battle"]);
    expect(dueSessionPosts(slot, slot + 300_000)).toEqual([]);
  });
  it("shows the five-minute return time and a real zero count in the break notice", () => {
    const post = makeSessionNotice("2026-11-23T00:00:00+03:00", origin, { kind: "break", studentCount: 0 });
    expect(post.text).toContain("استراحة ٥ دقايق");
    expect(post.text).toContain("١٢:٠٥");
    expect(post.text).toContain("عدد الطلاب بالغرفة هسه · ٠");
    expect(post.reply_markup.inline_keyboard[0][0].url).toBe(origin + "/room?code=37ECJK");
  });
  it("announces the entire winning ballot without exposing keys", () => {
    const post = makeSessionNotice("2026-11-23T00:00:00+03:00", origin, { kind: "battle", winner: { subject: "physics", chapter: 4, language: "en" } });
    expect(post.text).toContain("الفيزياء · الفصل 4 · المنهج الإنكليزي");
    expect(post.text).toContain(origin + "/room?code=37ECJK");
  });
});
