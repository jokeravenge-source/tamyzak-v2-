import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import NadiaMinisterialQuestions from "./NadiaMinisterialQuestions";
import {
  NADIA_MINISTERIAL_ACCESS_SESSION_KEY,
  NADIA_MINISTERIAL_QUESTION_COUNT,
  nadiaMinisterialChapters,
} from "@/lib/nadiaMinisterialQuestions";

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(cleanup);

describe("NadiaMinisterialQuestions", () => {
  it("contains every Nadia Biology question across chapters 1–5", () => {
    expect(nadiaMinisterialChapters).toHaveLength(5);
    expect(NADIA_MINISTERIAL_QUESTION_COUNT).toBe(1038);
  });

  it("is password protected", () => {
    render(<NadiaMinisterialQuestions />);

    expect(screen.getByRole("heading", { name: "أسئلة نادية النعيمي الوزارية" })).toBeInTheDocument();
    expect(screen.getByLabelText("كلمة المرور")).toBeInTheDocument();
  });

  it("renders a normal question bank after access is granted", () => {
    sessionStorage.setItem(NADIA_MINISTERIAL_ACCESS_SESSION_KEY, "1");
    render(<NadiaMinisterialQuestions />);

    expect(screen.getByRole("heading", { name: "نادية النعيمي · الأحياء" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "الأسئلة الوزارية" })).toBeInTheDocument();
    expect(screen.queryByText(/بطاقة/)).not.toBeInTheDocument();
  });
});
