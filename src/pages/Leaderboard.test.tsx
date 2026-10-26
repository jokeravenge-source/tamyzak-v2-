import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Leaderboard from "./Leaderboard";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), readDaily: vi.fn(), writeDaily: vi.fn(), from: vi.fn(),
  range: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: mocks.getUser }, from: mocks.from } }));
vi.mock("@/lib/dailyCache", () => ({ readDaily: mocks.readDaily, writeDaily: mocks.writeDaily }));
vi.mock("@/components/CharacterAvatar", () => ({ CharacterAvatar: () => <span /> }));
vi.mock("@/components/StudentProfileDialog", () => ({ default: ({ userId, onClose }: { userId: string | null; onClose: () => void }) => userId ? <div role="dialog" aria-label={`Profile ${userId}`}><button onClick={onClose}>Close</button></div> : null }));

const savedRows = [{ user_id: "ali", name: "Ali", points: 100, gender: "male", traits: { variant: 3 } }];

describe("Leaderboard data and profile integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "ali" } } });
    mocks.readDaily.mockReturnValue(null);
    mocks.range.mockImplementation(async (table: string) => ({ data: table === "user_points" ? [{ user_id: "ali", points: 40 }, { user_id: "ali", points: 60 }] : [{ user_id: "ali", display_name: "Ali", gender: "male", character: { variant: 3 } }], error: null }));
    mocks.from.mockImplementation((table: string) => {
      const query = { select: () => query, order: () => query, range: (start: number, end: number) => mocks.range(table, start, end) };
      return query;
    });
  });

  it("keeps the daily cached board without scanning points again", async () => {
    mocks.readDaily.mockReturnValue(savedRows);
    render(<Leaderboard language="en" onBack={vi.fn()} onNav={vi.fn()} />);
    expect(await screen.findByRole("button", { name: /Ali's profile, place 1, 100 points/ })).toBeInTheDocument();
    expect(mocks.readDaily).toHaveBeenCalledWith("leaderboard");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("aggregates all point records and preserves the character data in the cache", async () => {
    render(<Leaderboard language="en" onBack={vi.fn()} onNav={vi.fn()} />);
    expect(await screen.findByRole("button", { name: /Ali's profile, place 1, 100 points/ })).toBeInTheDocument();
    expect(mocks.writeDaily).toHaveBeenCalledWith("leaderboard", [expect.objectContaining({ user_id: "ali", points: 100, traits: { variant: 3 } })]);
  });

  it("opens and closes the existing profile dialog from the podium", async () => {
    mocks.readDaily.mockReturnValue(savedRows);
    render(<Leaderboard language="en" onBack={vi.fn()} onNav={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /Ali's profile/ }));
    expect(screen.getByRole("dialog", { name: "Profile ali" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("bypasses the cache only when the student explicitly refreshes", async () => {
    mocks.readDaily.mockReturnValue(savedRows);
    render(<Leaderboard language="en" onBack={vi.fn()} onNav={vi.fn()} />);
    await screen.findByRole("button", { name: /Ali's profile/ });
    fireEvent.click(screen.getByRole("button", { name: "Refresh points" }));
    await waitFor(() => expect(mocks.writeDaily).toHaveBeenCalledOnce());
    expect(mocks.readDaily).toHaveBeenCalledOnce();
    expect(mocks.from).toHaveBeenCalledWith("user_points");
    expect(screen.getByRole("button", { name: "Refresh points" })).toBeEnabled();
  });

  it("does not publish partial or failed point totals over a complete cached board", async () => {
    mocks.readDaily.mockReturnValue(savedRows);
    render(<Leaderboard language="en" onBack={vi.fn()} onNav={vi.fn()} />);
    await screen.findByRole("button", { name: /Ali's profile/ });
    mocks.range.mockResolvedValue({ data: null, error: { message: "Connection failed" } });
    fireEvent.click(screen.getByRole("button", { name: "Refresh points" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn't update");
    expect(screen.getByRole("button", { name: /Ali's profile, place 1, 100 points/ })).toBeInTheDocument();
    expect(mocks.writeDaily).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Refresh points" })).toBeEnabled();
  });

  it("paginates both points and profiles beyond the 1000-row database limit", async () => {
    mocks.range.mockImplementation(async (table: string, start: number) => {
      if (table === "user_points") return { data: start === 0 ? Array.from({ length: 1000 }, () => ({ user_id: "ali", points: 1 })) : [{ user_id: "ali", points: 27 }, { user_id: "sarah", points: 900 }], error: null };
      return { data: start === 0 ? Array.from({ length: 1000 }, (_, i) => ({ user_id: i === 0 ? "ali" : `other-${i}`, display_name: i === 0 ? "Ali" : "Other", gender: "male", character: null })) : [{ user_id: "sarah", display_name: "Sarah", gender: "female", character: null }], error: null };
    });
    render(<Leaderboard language="en" onBack={vi.fn()} onNav={vi.fn()} />);
    expect(await screen.findByRole("button", { name: /Ali's profile, place 1, 1,027 points/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sarah's profile, place 2, 900 points/ })).toBeInTheDocument();
    expect(mocks.range).toHaveBeenCalledWith("user_points", 1000, 1999);
    expect(mocks.range).toHaveBeenCalledWith("profiles", 1000, 1999);
  });

  it("routes the empty-state study action through existing navigation", async () => {
    mocks.range.mockResolvedValue({ data: [], error: null });
    const onNav = vi.fn();
    render(<Leaderboard language="en" onBack={vi.fn()} onNav={onNav} />);
    fireEvent.click(await screen.findByRole("button", { name: "Start studying" }));
    expect(onNav).toHaveBeenCalledWith("subjectsHub");
  });
});
