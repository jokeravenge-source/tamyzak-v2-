import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TAMAYZAK_BOT_URL, TAMAYZAK_BOT_USERNAME, tamayzakBotLink } from "./tamayzakTelegram";

describe("Tamayzak Telegram bot links", () => {
  const token = "a".repeat(48);

  it("always builds links for the official bot", () => {
    expect(TAMAYZAK_BOT_USERNAME).toBe("sovforcejoin_bot");
    expect(tamayzakBotLink({ token, deepLink: "https://t.me/wrong_bot?start=bad" }))
      .toBe(`${TAMAYZAK_BOT_URL}?start=${token}`);
  });

  it("accepts only official fallback links", () => {
    expect(tamayzakBotLink({ deepLink: `${TAMAYZAK_BOT_URL}?start=${token}` }))
      .toBe(`${TAMAYZAK_BOT_URL}?start=${token}`);
    expect(tamayzakBotLink({ deepLink: `https://t.me/wrong_bot?start=${token}` })).toBeNull();
    expect(tamayzakBotLink({ deepLink: "not-a-url" })).toBeNull();
  });

  it("keeps the Edge Functions on the same official bot and internal auth flow", () => {
    const edgeGateway = readFileSync(
      join(process.cwd(), "supabase/functions/_shared/telegram-gateway.ts"),
      "utf8",
    );
    const config = readFileSync(join(process.cwd(), "supabase/config.toml"), "utf8");

    expect(edgeGateway).toContain(`TAMAYZAK_BOT_USERNAME = "${TAMAYZAK_BOT_USERNAME}"`);
    for (const functionName of ["telegram-start", "telegram-recheck", "telegram-channel-check"]) {
      expect(config).toContain(`[functions.${functionName}]\nverify_jwt = false`);
    }
  });
});
