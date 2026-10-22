import { describe, expect, it } from "vitest";
import { ahmedNadawiChemCh1Cards, ahmedNadawiChemCh1Topics } from "./flashcardsChemCh1AhmedNadawi";
import {
  ahmedNadawiChemCh1CardsAr,
  ahmedNadawiChemCh1ExcludedSourceIds,
  ahmedNadawiChemCh1SourceAudit,
  ahmedNadawiChemCh1TopicsAr,
} from "./flashcardsChemCh1AhmedNadawiAr";

describe("Ahmed Al-Nadawi — Chemistry Chapter 1 Arabic source match", () => {
  it("publishes only the 420 unambiguous cards verified against the 151-page handout", () => {
    expect(ahmedNadawiChemCh1CardsAr).toHaveLength(420);
    expect(ahmedNadawiChemCh1SourceAudit).toMatchObject({
      sourceFile: "الفصل الاول.pdf",
      sourcePdfPages: 151,
      rawCardCount: 430,
      publishedArabicCardCount: 420,
      excludedAmbiguousCardCount: 10,
    });
    expect(ahmedNadawiChemCh1SourceAudit.sourcePdfSha256).toHaveLength(64);
  });

  it("retains stable source identities while excluding malformed source items", () => {
    const ids = ahmedNadawiChemCh1CardsAr.map(({ id }) => id);
    expect(new Set(ids).size).toBe(420);
    ahmedNadawiChemCh1ExcludedSourceIds.forEach((id) => expect(ids).not.toContain(id));
    expect(ids).toContain("CH1-0001");
    expect(ids).toContain("CH1-0425");
  });

  it("keeps all topic groups populated with direct student-facing wording", () => {
    const topicCounts = Object.fromEntries(
      ahmedNadawiChemCh1Topics.map(({ key }) => [
        key,
        ahmedNadawiChemCh1CardsAr.filter(({ topic }) => topic === key).length,
      ]),
    );

    expect(topicCounts).toEqual({
      "01": 34,
      "02": 27,
      "03": 33,
      "04": 22,
      "05": 33,
      "06": 31,
      "07": 44,
      "08": 26,
      "09": 29,
      "10": 20,
      "11": 22,
      "12": 11,
      "13": 30,
      "14": 22,
      "15": 20,
      "16": 16,
    });

    expect(Object.keys(ahmedNadawiChemCh1TopicsAr).sort()).toEqual(
      ahmedNadawiChemCh1Topics.map(({ key }) => key).sort(),
    );
    ahmedNadawiChemCh1CardsAr.forEach(({ q, a }) => {
      expect(q.trim()).not.toBe("");
      expect(a.trim()).not.toBe("");
      expect(q).not.toMatch(/^\[(?:بنك الأسئلة|مراجعة)/u);
      expect(/[\u0600-\u06ff]/u.test(q + a)).toBe(true);
    });
  });

  it("uses the verified direct wording for retained end-of-chapter calculations", () => {
    expect(ahmedNadawiChemCh1CardsAr.find(({ id }) => id === "CH1-0423")).toMatchObject({
      pages: "140",
      a: "10⁻⁸ mol/L.",
    });
    expect(ahmedNadawiChemCh1CardsAr.find(({ id }) => id === "CH1-0425")).toMatchObject({
      pages: "142",
      a: "نحو +28.48 kJ/mol.",
    });
  });

  it("keeps the key Chapter 1 definitions complete against the Arabic handout", () => {
    expect(ahmedNadawiChemCh1CardsAr.find(({ id }) => id === "CH1-0001")?.a).toContain(
      "أكبر قدر ممكن من الطاقة الحرارية الناتجة من احتراق الوقود",
    );
    expect(ahmedNadawiChemCh1CardsAr.find(({ id }) => id === "CH1-0018")?.a).toContain(
      "قد تكون حقيقية أو تخيلية",
    );
    expect(ahmedNadawiChemCh1CardsAr.find(({ id }) => id === "CH1-0037")).toMatchObject({
      q: "عرّف درجة الحرارة، واذكر رمزها.",
      a: "هي مقياس للطاقة الحرارية، ويرمز لها بالحرف T.",
    });
  });
});

describe("Ahmed Al-Nadawi — Chemistry Chapter 1 distinguished curriculum wording", () => {
  it("keeps the reviewed verbal answers complete instead of shortened summaries", () => {
    expect(ahmedNadawiChemCh1Cards[0].a).toBe(
      "is the branch of science which studies energy and its transformation. For example, it studies the transformation of heat energy from combustion of fuel into mechanical energy which runs the engines.",
    );
    expect(ahmedNadawiChemCh1Cards[34].a).toBe(
      "is one of the common energy types in our daily lives. We show heat with (q). Heat is the energy change between two objects with different degrees of temperature.",
    );
    expect(ahmedNadawiChemCh1Cards[43]).toMatchObject({
      q: "Define Specific Heat (ς).",
      a: "is the amount of heat necessary to raise temperature of 1 gram of any substance by 1° centigrade. Its unit is (J/g.c°)",
    });
    expect(ahmedNadawiChemCh1Cards[94].a).toBe(
      "is an instrument used to measure the reaction heat which is absorbed or released under constant pressure.",
    );
    expect(ahmedNadawiChemCh1Cards[163]).toMatchObject({
      q: "Define enthalpy of condensation and enthalpy of crystallization.",
      a: "Enthalpy of condensation: the releasing heat necessary to transform 1 mole of any substance from the gas state to liquid state of matter shown by ΔH (cond). Enthalpy of Crystallization: the releasing heat necessary to transform 1 mole of liquid substance to solid substance shown by ΔH (cryst).",
    });
  });
});
