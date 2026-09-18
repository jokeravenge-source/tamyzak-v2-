const SYMBOL_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\\alpha\b/g, "α"], [/\\beta\b/g, "β"], [/\\gamma\b/g, "γ"],
  [/\\delta\b/g, "δ"], [/\\Delta\b/g, "Δ"], [/\\theta\b/g, "θ"],
  [/\\lambda\b/g, "λ"], [/\\mu\b/g, "μ"], [/\\pi\b/g, "π"],
  [/\\rho\b/g, "ρ"], [/\\sigma\b/g, "σ"], [/\\Sigma\b/g, "Σ"],
  [/\\omega\b/g, "ω"], [/\\Omega\b/g, "Ω"], [/\\phi\b/g, "φ"],
  [/\\infty\b/g, "∞"], [/\\sum\b/g, "∑"], [/\\prod\b/g, "∏"],
  [/\\int\b/g, "∫"], [/\\partial\b/g, "∂"], [/\\nabla\b/g, "∇"],
  [/\\times\b/g, "×"], [/\\cdot\b/g, "·"], [/\\pm\b/g, "±"],
  [/\\approx\b/g, "≈"], [/\\neq\b/g, "≠"], [/\\leq?\b/g, "≤"],
  [/\\geq?\b/g, "≥"], [/\\rightarrow\b/g, "→"], [/\\leftarrow\b/g, "←"],
  [/\\leftrightarrow\b/g, "↔"], [/\\degree\b/g, "°"],
];

const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵",
  "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻",
  "=": "⁼", "(": "⁽", ")": "⁾", "n": "ⁿ", "i": "ⁱ",
};

const SUBSCRIPT: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅",
  "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "-": "₋",
  "=": "₌", "(": "₍", ")": "₎", "a": "ₐ", "e": "ₑ", "h": "ₕ",
  "i": "ᵢ", "j": "ⱼ", "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ",
  "o": "ₒ", "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ",
  "v": "ᵥ", "x": "ₓ",
};

const scriptValue = (value: string, map: Record<string, string>) =>
  value.split("").map((character) => map[character] ?? character).join("");

/** Converts common pasted ASCII/LaTeX notation into readable Unicode without executing HTML. */
export const normalizeScientificText = (value: string) => {
  let output = value
    .replace(/\$+/g, "")
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)⁄($2)")
    .replace(/\\sqrt\{([^{}]+)\}/g, "√($1)")
    .replace(/\\vec\{([^{}]+)\}/g, "$1⃗");

  for (const [pattern, replacement] of SYMBOL_REPLACEMENTS) {
    output = output.replace(pattern, replacement);
  }

  return output
    .replace(/\^\{([^{}]+)\}/g, (_, exponent: string) => scriptValue(exponent, SUPERSCRIPT))
    .replace(/_\{([^{}]+)\}/g, (_, subscript: string) => scriptValue(subscript, SUBSCRIPT))
    .replace(/\^([0-9ni+\-=()]+)/g, (_, exponent: string) => scriptValue(exponent, SUPERSCRIPT))
    .replace(/_([0-9aehijklmnoprstuvx+\-=()]+)/g, (_, subscript: string) => scriptValue(subscript, SUBSCRIPT))
    .replace(/<->/g, "↔")
    .replace(/->/g, "→")
    .replace(/<-/g, "←")
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/!=/g, "≠")
    .replace(/\+\/-/g, "±")
    .replace(/\bsqrt\s*\(([^)]+)\)/gi, "√($1)");
};

export const SCIENTIFIC_SYMBOL_GROUPS = [
  { label: "Math", symbols: ["±", "×", "÷", "·", "√", "∞", "≈", "≠", "≤", "≥", "∑", "∫", "∂", "∇"] },
  { label: "Greek", symbols: ["α", "β", "γ", "δ", "Δ", "θ", "λ", "μ", "π", "ρ", "σ", "Σ", "φ", "ω", "Ω"] },
  { label: "Physics", symbols: ["°", "℃", "K", "Hz", "N", "J", "W", "Pa", "V", "A", "Ω", "→", "↔", "⃗"] },
] as const;
