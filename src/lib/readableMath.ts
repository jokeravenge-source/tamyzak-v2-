const SUP: Record<string, string> = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","+":"⁺","-":"⁻","n":"ⁿ","x":"ˣ","(":"⁽",")":"⁾" };
const SUB: Record<string, string> = { "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉","+":"₊","-":"₋","n":"ₙ" };
const CMD: Record<string, string> = {
  times:"×", div:"÷", pm:"±", mp:"∓", cdot:"·", leq:"≤", le:"≤", geq:"≥", ge:"≥", neq:"≠", ne:"≠", approx:"≈",
  infty:"∞", pi:"π", theta:"θ", alpha:"α", beta:"β", gamma:"γ", delta:"δ", Delta:"Δ", lambda:"λ", mu:"μ", sigma:"σ",
  Sigma:"Σ", omega:"ω", Omega:"Ω", phi:"φ", sum:"Σ", int:"∫", rightarrow:"→", to:"→", Rightarrow:"⇒", leftarrow:"←",
  degree:"°", circ:"°", angle:"∠", perp:"⊥", parallel:"∥", in:"∈", cup:"∪", cap:"∩", sin:"sin", cos:"cos", tan:"tan",
  log:"log", ln:"ln", lim:"lim", left:"", right:"", quad:" ", qquad:" ", ",":" ", ";":" ", "!":"",
};
const conv = (t: string, map: Record<string, string>, mark: string) =>
  [...t].every((c) => map[c]) ? [...t].map((c) => map[c]).join("") : `${mark}(${t})`;

/** Turns LaTeX-style math left in AI notes into plain readable symbols. */
export function readableMath(input: string): string {
  if (!input || !/[\\$^_]/.test(input)) return input;
  let s = input.replace(/\$\$?|\\\(|\\\)|\\\[|\\\]/g, "");
  for (let i = 0; i < 4; i++) {
    s = s
      .replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_, a, b) => `(${a})/(${b})`)
      .replace(/\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}/g, (_, n, a) => (n === "3" ? `∛(${a})` : `${n}√(${a})`))
      .replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)")
      .replace(/\\(?:text|mathrm|mathbf|operatorname)\s*\{([^{}]*)\}/g, "$1");
  }
  s = s
    .replace(/\^\{([^{}]*)\}/g, (_, t) => conv(t, SUP, "^"))
    .replace(/_\{([^{}]*)\}/g, (_, t) => conv(t, SUB, "_"))
    .replace(/\^([0-9n+-])/g, (_, t) => SUP[t])
    .replace(/(?<=[A-Za-z0-9)])_([0-9n])/g, (_, t) => SUB[t])
    .replace(/\\([A-Za-z]+|[,;!])/g, (m, c) => (c in CMD ? CMD[c] : m))
    .replace(/\(([A-Za-z0-9.]+)\)\/\(([A-Za-z0-9.]+)\)/g, "$1/$2")
    .replace(/√\(([A-Za-z0-9.]+)\)/g, "√$1")
    .replace(/[{}]/g, "");
  return s;
}
