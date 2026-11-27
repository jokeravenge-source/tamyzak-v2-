import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CharacterAvatar, FEMALE_VARIANTS, MALE_VARIANTS } from "./CharacterAvatar";
import koki from "@/assets/character-koki.png";

afterEach(cleanup);

it("renders the saved Koki image across shared avatar consumers, outside the free catalog", () => {
  render(<CharacterAvatar gender="female" traits={{ variant: 16 }} />);
  expect(screen.getByRole("img")).toHaveAttribute("src", koki);
  expect(FEMALE_VARIANTS).not.toContain(koki);
  expect(MALE_VARIANTS).not.toContain(koki);
});

it("preserves existing female variants", () => {
  render(<CharacterAvatar gender="female" traits={{ variant: 15 }} />);
  expect(screen.getByRole("img")).toHaveAttribute("src", FEMALE_VARIANTS[14]);
});

it("fits rectangular art, compact faces, and Koki independently at all display sizes", () => {
  const traits = {
    accessory: "glasses", hat: "red-cap",
    accessoryFits: { "female:16": { glasses: { x: 3, y: -2, scale: 120, rotation: 10 } } },
  } as const;
  const { container, rerender } = render(<CharacterAvatar gender="female" traits={{ ...traits, variant: 16 }} size={42} />);
  const glasses = () => container.querySelector('[data-avatar-accessory="glasses"]');
  expect(glasses()).toHaveStyle({ left: "53%", top: "40%", width: "36%", transform: "translate(-50%, -60%) rotate(10deg)" });
  rerender(<CharacterAvatar gender="female" traits={{ ...traits, variant: 16 }} size={218} />);
  expect(glasses()).toHaveStyle({ left: "53%", top: "40%", width: "36%" });
  rerender(<CharacterAvatar gender="female" traits={{ ...traits, variant: 15 }} />);
  expect(glasses()).toHaveStyle({ left: "50%", top: "20%", width: "24%" });
  rerender(<CharacterAvatar gender="male" traits={{ ...traits, variant: 8 }} />);
  expect(glasses()).toHaveStyle({ top: "23%", width: "23%" });
});
