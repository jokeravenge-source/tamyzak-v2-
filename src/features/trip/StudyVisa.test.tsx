import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DICTS } from "./i18n";
import { StudyVisa } from "./StudyVisa";
import type { Journey } from "./journeys";

const journey: Journey = {
  id: "journey-test-12345678",
  studentId: "student-1",
  originLat: 33.3152,
  originLng: 44.3661,
  destCountryCode: "FR",
  destCountryName: "France",
  destCity: "Paris",
  destLat: 48.8566,
  destLng: 2.3522,
  distanceKm: 3850,
  speedKmh: 850,
  durationSec: 16306,
  startedAt: Date.UTC(2026, 9, 20, 8),
  arrivalAt: Date.UTC(2026, 9, 20, 12, 31),
  status: "arrived",
  arrivalSeenAt: Date.UTC(2026, 9, 20, 12, 31),
};

describe("StudyVisa", () => {
  it("prints the student and completed flight information", () => {
    render(<StudyVisa journey={journey} studentName="Ibrahim Safaa" lang="en" t={DICTS.en} />);

    expect(screen.getByText("Ibrahim Safaa")).toBeTruthy();
    expect(screen.getByText("Paris, France")).toBeTruthy();
    expect(screen.getByText("BGW")).toBeTruthy();
    expect(screen.getAllByText("FRA")).toHaveLength(2);
    expect(screen.getByText("TYZ-12345678")).toBeTruthy();
  });
});
