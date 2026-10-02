import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import NadiaTelegramGate, { NADIA_TELEGRAM_CHANNEL } from "./NadiaTelegramGate";

afterEach(cleanup);

const renderGate = (language: "ar" | "en", onContinue = vi.fn()) => {
  render(
    <MemoryRouter>
      <NadiaTelegramGate language={language} onContinue={onContinue} />
    </MemoryRouter>,
  );
  return onContinue;
};

describe("NadiaTelegramGate", () => {
  it("links to Nadia Al-Nuaimi's Telegram channel", () => {
    renderGate("ar");

    expect(screen.getByRole("link", { name: /فتح قناة نادية النعيمي/ })).toHaveAttribute(
      "href",
      `https://t.me/${NADIA_TELEGRAM_CHANNEL}`,
    );
  });

  it("requires the channel to be opened before continuing", () => {
    const onContinue = renderGate("en");
    const continueButton = screen.getByRole("button", { name: /start flashcards/i });

    expect(continueButton).toBeDisabled();
    fireEvent.click(screen.getByRole("link", { name: /open Nadia's channel/i }));
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
