import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LeaderboardView, type LeaderboardRow, type LeaderboardViewProps } from "./LeaderboardView";

vi.mock("@/components/CharacterAvatar", () => ({
  CharacterAvatar: ({ seed }: { seed: string }) => <span data-avatar-seed={seed} />,
}));

const rows: LeaderboardRow[] = Array.from({ length: 12 }, (_, index) => ({
  user_id: `student-${index + 1}`,
  name: ["Ali", "Sarah", "Nour"][index] ?? `Student ${index + 1}`,
  points: 11843 - index * 405,
  gender: index % 2 === 0 ? "male" : "female",
  traits: { variant: 2 },
}));

function setup(overrides: Partial<LeaderboardViewProps> = {}) {
  const props: LeaderboardViewProps = {
    language: "en", rows, me: "student-6", loading: false, refreshing: false, error: false,
    onBack: vi.fn(), onRefresh: vi.fn(), onProfile: vi.fn(), onStudy: vi.fn(), ...overrides,
  };
  return { ...render(<LeaderboardView {...props} />), props };
}

describe("Leaderboard podium and standings", () => {
  it.each(["en", "ar"] as const)("keeps physical left-to-right order 2, 1, 3 in %s", (language) => {
    const { container } = setup({ language });
    const podium = container.querySelector("ol.leaderboard-podium")!;
    expect(podium).toHaveAttribute("dir", "ltr");
    expect(Array.from(podium.children).map((child) => child.getAttribute("value"))).toEqual(["2", "1", "3"]);
    expect(podium.children[1]).toHaveClass("podium-entry--1");
    expect(podium.children[0].querySelector(".podium-crown")).toBeNull();
    expect(podium.children[1].querySelector(".podium-crown")).not.toBeNull();
    expect(podium.children[2].querySelector(".podium-crown")).toBeNull();
  });

  it("opens the same student profile from each podium position", () => {
    const { props } = setup();
    fireEvent.click(screen.getByRole("button", { name: /View Sarah's profile, place 2/ }));
    fireEvent.click(screen.getByRole("button", { name: /View Ali's profile, place 1/ }));
    fireEvent.click(screen.getByRole("button", { name: /View Nour's profile, place 3/ }));
    expect(props.onProfile).toHaveBeenNthCalledWith(1, "student-2");
    expect(props.onProfile).toHaveBeenNthCalledWith(2, "student-1");
    expect(props.onProfile).toHaveBeenNthCalledWith(3, "student-3");
  });

  it("starts remaining standings at fourth and never duplicates the top three", () => {
    setup();
    const list = within(screen.getByRole("region", { name: "Standings" })).getByRole("list");
    expect(list).toHaveAttribute("start", "4");
    expect(within(list).getAllByRole("listitem")).toHaveLength(7);
    expect(within(list).queryByText("Ali")).not.toBeInTheDocument();
    expect(within(list).getByRole("button", { name: /Student 4's profile, place 4/ })).toBeInTheDocument();
    expect(within(list).getByRole("button", { name: /Student 10's profile, place 10/ })).toBeInTheDocument();
  });

  it("retains the student's real place outside the top ten", () => {
    setup({ me: "student-12" });
    expect(screen.getByRole("button", { name: "Your position: 12" })).toBeInTheDocument();
    const ownPlace = screen.getByRole("region", { name: "Your place in the standings" });
    expect(within(ownPlace).getByRole("list")).toHaveAttribute("start", "12");
    expect(within(ownPlace).getByRole("button", { name: /Student 12's profile, place 12/ })).toHaveClass("leaderboard-row--me");
  });

  it("formats exact points without abbreviating or changing them", () => {
    setup();
    expect(screen.getByRole("button", { name: /Ali's profile, place 1, 11,843 points/ })).toHaveTextContent("11,843");
  });

  it.each([1, 2])("handles only %i students without fictitious podium winners", (count) => {
    const { container } = setup({ rows: rows.slice(0, count), me: null });
    expect(container.querySelectorAll(".podium-entry")).toHaveLength(count);
    expect(container.querySelectorAll(".podium-entry--1")).toHaveLength(1);
    expect(screen.queryByRole("region", { name: "Standings" })).not.toBeInTheDocument();
  });

  it("makes loading and empty states mutually exclusive", () => {
    setup({ rows: [], loading: true });
    expect(screen.getByRole("status", { name: "Loading leaderboard" })).toBeInTheDocument();
    expect(screen.queryByText("The podium is waiting for you")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh points" })).toBeDisabled();
  });

  it("offers a working study action on a genuinely empty board", () => {
    const { props } = setup({ rows: [], me: null });
    fireEvent.click(screen.getByRole("button", { name: "Start studying" }));
    expect(props.onStudy).toHaveBeenCalledOnce();
    expect(screen.queryByRole("region", { name: "Top three students" })).not.toBeInTheDocument();
  });

  it("keeps the board visible on a refresh failure and offers recovery", () => {
    const { props } = setup({ error: true });
    expect(screen.getByRole("alert")).toHaveTextContent("Your last loaded standings are still shown.");
    expect(screen.getByRole("button", { name: /Ali's profile/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(props.onRefresh).toHaveBeenCalledOnce();
  });

  it("disables duplicate refreshes and announces an in-progress update", () => {
    setup({ refreshing: true });
    expect(screen.getByRole("button", { name: "Refresh points" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Updating standings…");
  });

  it("keeps back and refresh controls connected", () => {
    const { props } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    fireEvent.click(screen.getByRole("button", { name: "Refresh points" }));
    expect(props.onBack).toHaveBeenCalledOnce();
    expect(props.onRefresh).toHaveBeenCalledOnce();
  });

  it("shows unabridged multilingual names to assistive technology", () => {
    const longName = "عبدالرحمن محمد عبدالكريم — an exceptionally long display name";
    const { container } = setup({ rows: [{ ...rows[0], name: longName, points: 1234567890 }], language: "ar", me: null });
    expect(container.querySelector("main")).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("button", { name: new RegExp(longName) })).toBeInTheDocument();
    expect(screen.getByText(longName).tagName).toBe("BDI");
  });
});
