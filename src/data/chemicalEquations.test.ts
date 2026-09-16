import { describe, expect, it } from "vitest";
import { chemicalEquations, chemicalEquationTopics } from "@/data/chemicalEquations";
import { filterChemicalEquations, normalizeEquationSearch } from "@/lib/chemicalEquationSearch";

describe("chemical equation content", () => {
  it("includes exactly the 19 numbered entries in the supplied order", () => {
    expect(chemicalEquations.map((equation) => equation.id)).toEqual(Array.from({ length: 19 }, (_, index) => index + 1));
    expect(new Set(chemicalEquations.map((equation) => equation.formula)).size).toBe(19);
    expect(chemicalEquations.filter((equation) => equation.formula === "H₂O(s) → H₂O(l)")).toHaveLength(1);
    expect(chemicalEquations.filter((equation) => equation.formula === "Zn(s) → Zn²⁺(aq) + 2e⁻")).toHaveLength(1);
  });
  it("groups the entries into the eight supplied topics", () => {
    expect(chemicalEquationTopics.map((topic) => filterChemicalEquations("", topic.id).length)).toEqual([6, 2, 1, 1, 1, 6, 1, 1]);
  });
  it("provides bilingual titles, subtopics, and a useful hint for every equation", () => {
    for (const equation of chemicalEquations) {
      for (const language of ["ar", "en"] as const) {
        expect(equation.title[language].length).toBeGreaterThan(5);
        expect(equation.subtopic[language].length).toBeGreaterThan(3);
        expect(equation.hint[language].length).toBeGreaterThan(30);
      }
    }
  });
  it("preserves the six enthalpy values and does not double oxidation potential", () => {
    expect(chemicalEquations.slice(0, 6).map((equation) => equation.value?.text)).toEqual([
      "ΔH = −286 kJ/mol", "ΔH = −242 kJ/mol", "ΔH = +44 kJ/mol", "ΔH = +6 kJ/mol", "ΔH = −44 kJ/mol", "ΔH = −6 kJ/mol",
    ]);
    expect(chemicalEquations[14].value?.text).toBe("E°ox = +0.76 V");
    expect(chemicalEquations[15].value?.text).toBe(chemicalEquations[14].value?.text);
    expect(chemicalEquations[15].formula).toBe("2Zn(s) → 2Zn²⁺(aq) + 4e⁻");
  });
  it("flags the phase clarification for the all-solid source example", () => {
    expect(chemicalEquations[6].formula).toBe("A(s) + B(s) ⇌ AB(s)");
    expect(chemicalEquations[6].note?.en).toContain("Matching (s) labels alone does not establish a single phase");
    expect(chemicalEquations[6].reference?.url).toContain("openstax.org");
  });
});

describe("chemical equation search", () => {
  it.each(["H₂O", "H2O", "H_2O"])("finds water formulae entered as %s", (query) => {
    expect(filterChemicalEquations(query).map((equation) => equation.id)).toEqual([1, 2, 3, 4, 5, 6, 10, 11, 18]);
  });
  it("finds topics, names, and hints in either language", () => {
    expect(filterChemicalEquations("thermochemistry")).toHaveLength(6);
    expect(filterChemicalEquations("حامض الخليك").map((equation) => equation.id)).toEqual([9]);
    expect(filterChemicalEquations("coefficients").map((equation) => equation.id)).toEqual([16]);
    expect(normalizeEquationSearch("الأَكْسَدَة")).toBe(normalizeEquationSearch("الاكسدة"));
  });
  it("combines search with topic filtering and preserves source order", () => {
    expect(filterChemicalEquations("zinc", "redox").map((equation) => equation.id)).toEqual([14, 15, 16, 17]);
    expect(filterChemicalEquations("zinc", "thermochemistry")).toHaveLength(0);
    expect(filterChemicalEquations("not a real reaction")).toHaveLength(0);
    expect(filterChemicalEquations("   ")).toHaveLength(19);
  });
});
