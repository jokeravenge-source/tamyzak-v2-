import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FlashcardTeacherBadge } from "@/components/FlashcardTeacherBadge";
import type { AppSubject } from "@/pages/Subjects";

afterEach(cleanup);

describe("FlashcardTeacherBadge", () => {
  it("shows the exact teacher name in Arabic with RTL direction", () => {
    render(<FlashcardTeacherBadge language="ar" subject="physics" />);
    expect(screen.getByText("حيدر ديوان")).toBeInTheDocument();
    expect(screen.getByText("المدرّس").closest("p")).toHaveAttribute("dir", "rtl");
  });

  it("shows an English teacher label with LTR direction", () => {
    render(<FlashcardTeacherBadge language="en" subject="physics" />);
    expect(screen.getByText("Haydar Diwan")).toBeInTheDocument();
    expect(screen.getByText("Teacher").closest("p")).toHaveAttribute("dir", "ltr");
  });

  it.each<AppSubject>(["chemistry", "biology", "arabic", "english", "french", "islamic", "revision"])(
    "does not attribute %s flashcards to the Physics teacher",
    (subject) => {
      const { container } = render(<FlashcardTeacherBadge language="ar" subject={subject} />);
      expect(container).toBeEmptyDOMElement();
    },
  );
});
