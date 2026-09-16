import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PremiumToolLock from "./PremiumToolLock";

afterEach(cleanup);
describe("Premium lock screen", () => {
  it.each(["en", "ar"] as const)("links the %s unlock action directly to Telegram", (language) => {
    const onBack = vi.fn();
    render(<PremiumToolLock language={language} loading={false} onBack={onBack} />);
    expect(screen.getByRole("main")).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://t.me/ias404");
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("@ias404")).toHaveAttribute("dir", "ltr");
    fireEvent.click(screen.getByRole("button"));
    expect(onBack).toHaveBeenCalledOnce();
  });
  it("does not show an upgrade action until membership has been checked", () => {
    render(<PremiumToolLock language="en" loading onBack={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Checking your membership");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
