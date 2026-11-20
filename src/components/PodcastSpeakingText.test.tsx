import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import PodcastSpeakingText from "./PodcastSpeakingText";
it("bolds the active occurrence without altering the rest of the text", () => {
  const view = render(
    <PodcastSpeakingText text="فكرة فكرة" phrase="فكرة" offset={5} />,
  );
  expect(view.container.textContent).toBe("فكرة فكرة");
  expect(
    view.container.querySelector("strong")?.previousSibling?.textContent,
  ).toBe("فكرة ");
  expect(view.container.querySelector("strong")).toHaveAttribute(
    "aria-current",
    "true",
  );
});
