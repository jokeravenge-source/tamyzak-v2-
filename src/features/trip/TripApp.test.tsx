import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TripApp } from "./TripApp";
import { createLocalRepository } from "./journeys";

vi.mock("./Globe", () => ({ Globe: () => <div>Flight map preview</div> }));
vi.mock("@/components/CharacterAvatar", () => ({
  CharacterAvatar: ({ gender, traits }: { gender: string; traits?: { variant?: number } }) => (
    <span data-testid="character" data-gender={gender} data-variant={traits?.variant} />
  ),
}));

describe("study flight cabin", () => {
  it("resumes with the saved character and keeps break and map controls working", async () => {
    const values = new Map<string, string>();
    const repository = createLocalRepository({ getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } });
    await repository.create("student-1", "AE:dubai");
    const view = render(<TripApp studentId="student-1" studentName="Zahraa" studentGender="female" studentCharacter={{ variant: 7 }} repository={repository} language="en" />);
    const cabin = await screen.findByRole("region", { name: "Cabin" });
    expect(cabin.textContent).toContain("Zahraa");
    expect(cabin.textContent).toContain("Dubai");
    expect(screen.getAllByTestId("character")).toHaveLength(3);
    expect(screen.getAllByTestId("character")[1]).toHaveAttribute("data-gender", "female");
    expect(screen.getAllByTestId("character")[1]).toHaveAttribute("data-variant", "7");
    fireEvent.click(screen.getByRole("button", { name: /TAKE A BREAK AT A STATION/ }));
    await waitFor(() => expect(cabin.className).toContain("flight-cabin-still"));
    fireEvent.click(screen.getByRole("button", { name: "CONTINUE THE TRIP" }));
    await waitFor(() => expect(cabin.className).not.toContain("flight-cabin-still"));
    fireEvent.click(screen.getByRole("button", { name: "Flight map" }));
    expect(screen.queryByRole("region", { name: "Cabin" })).toBeNull();
    expect(screen.getByText("Flight map preview")).toBeTruthy();
    view.unmount();
  });
});
