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
