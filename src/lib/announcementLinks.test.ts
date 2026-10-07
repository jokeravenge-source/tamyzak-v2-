import { describe, expect, it } from "vitest";
import { isExternalAnnouncementLink, normalizeAnnouncementLink } from "@/lib/announcementLinks";

describe("announcement links", () => {
  it("keeps the link optional", () => {
    expect(normalizeAnnouncementLink("   ")).toBeNull();
  });

  it("accepts internal Tamayzak paths", () => {
    expect(normalizeAnnouncementLink("/flashcards?subject=english")).toBe("/flashcards?subject=english");
    expect(isExternalAnnouncementLink("/flashcards")).toBe(false);
  });

  it("normalizes bare domains to HTTPS", () => {
    expect(normalizeAnnouncementLink("tamyazak.site/sessions")).toBe("https://tamyazak.site/sessions");
    expect(isExternalAnnouncementLink("https://tamyazak.site/sessions")).toBe(true);
  });

  it("rejects unsafe and malformed destinations", () => {
    expect(normalizeAnnouncementLink("javascript:alert(1)")).toBeNull();
    expect(normalizeAnnouncementLink("//unsafe.example")).toBeNull();
  });
});
