import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FrenchConjugator from "./FrenchConjugator";

const conjugationResponse = {
  verb: "être",
  infinitive: "être",
  group: "3e groupe",
  auxiliary: "avoir",
  pronominal: false,
  moods: {
    indicatif: {
      présent: ["je suis", "tu es", "il est", "nous sommes", "vous êtes", "ils sont"],
      imparfait: ["j'étais", "tu étais"],
    },
    subjonctif: {
      présent: ["que je sois", "que tu sois"],
    },
  },
  meta: {
    canonical_url: "https://conjugaison.my-french.com/verbe/etre",
  },
};

const mockJsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
}) as Response;

describe("FrenchConjugator", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async () => mockJsonResponse(conjugationResponse)));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("credits الأستاذ محمد علي الكناني as the creator", async () => {
    render(<FrenchConjugator language="ar" onBack={vi.fn()} />);

    expect(screen.getByText("أداة من إعداد الأستاذ محمد علي الكناني")).toBeInTheDocument();
    await screen.findByText("je suis");
  });

  it("renders every returned mood, tense, and form", async () => {
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);

    expect((await screen.findAllByText("Indicatif")).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Présent").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Imparfait")).toBeInTheDocument();
    expect(screen.getAllByText("Subjonctif").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("j'étais")).toBeInTheDocument();
    expect(screen.getByText("que je sois")).toBeInTheDocument();
  });

  it("requests the verb entered by the student", async () => {
    const fetchMock = vi.mocked(fetch);
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    await screen.findByText("je suis");

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "finir" } });
    fireEvent.click(screen.getByRole("button", { name: "Conjugate verb" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("?v=finir"),
        expect.objectContaining({ headers: { Accept: "application/json" } }),
      );
    });
  });

  it("rejects non-French input before making another request", async () => {
    const fetchMock = vi.mocked(fetch);
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    await screen.findByText("je suis");
    const initialRequestCount = fetchMock.mock.calls.length;

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "Conjugate verb" }));

    expect(await screen.findByText("Enter a valid French verb")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(initialRequestCount);
  });
});
