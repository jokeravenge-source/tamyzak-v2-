import { describe, expect, it } from "vitest";
import { readOAuthCallback } from "./oauthCallback";

describe("OAuth callback recovery", () => {
  it("reads broker tokens and removes them from the visible URL", () => {
    expect(readOAuthCallback("https://tamyazak.site/#access_token=access&refresh_token=refresh&state=abc")).toEqual({
      kind: "tokens",
      tokens: { access_token: "access", refresh_token: "refresh" },
      cleanPath: "/",
    });
  });

  it("surfaces provider errors without keeping them in the URL", () => {
    expect(readOAuthCallback("https://tamyazak.site/?error=access_denied&error_description=Cancelled&menu=mcq")).toEqual({
      kind: "error",
      message: "Cancelled",
      cleanPath: "/?menu=mcq",
    });
  });

  it("leaves normal and PKCE URLs for the existing Supabase handler", () => {
    expect(readOAuthCallback("https://tamyazak.site/?code=pkce-code")).toEqual({ kind: "none" });
    expect(readOAuthCallback("https://tamyazak.site/mcq-bank?chapter=2")).toEqual({ kind: "none" });
  });
});
