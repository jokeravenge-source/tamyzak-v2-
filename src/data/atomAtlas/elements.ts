import { RAW_ELEMENTS } from "./elements.data";
import type { Category, ElementRecord, Occurrence } from "./element-types";

export type { Category, ElementRecord } from "./element-types";

const ORDER = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p"];
const CAP: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 };
const L: Record<string, number> = { s: 0, p: 1, d: 2, f: 3 };
const NOBLE: [number, string][] = [[86, "Rn"], [54, "Xe"], [36, "Kr"], [18, "Ar"], [10, "Ne"], [2, "He"]];

/** Known ground-state exceptions to the Madelung (aufbau) filling order. */
const EXCEPTIONS: Record<number, string> = {
  24: "[Ar] 3d5 4s1", 29: "[Ar] 3d10 4s1", 41: "[Kr] 4d4 5s1", 42: "[Kr] 4d5 5s1",
  44: "[Kr] 4d7 5s1", 45: "[Kr] 4d8 5s1", 46: "[Kr] 4d10", 47: "[Kr] 4d10 5s1",
  57: "[Xe] 5d1 6s2", 58: "[Xe] 4f1 5d1 6s2", 64: "[Xe] 4f7 5d1 6s2",
  78: "[Xe] 4f14 5d9 6s1", 79: "[Xe] 4f14 5d10 6s1", 89: "[Rn] 6d1 7s2",
  90: "[Rn] 6d2 7s2", 91: "[Rn] 5f2 6d1 7s2", 92: "[Rn] 5f3 6d1 7s2",
  93: "[Rn] 5f4 6d1 7s2", 96: "[Rn] 5f7 6d1 7s2", 103: "[Rn] 5f14 7s2 7p1",
};

type Sub = Map<string, number>;

function madelung(z: number): Sub {
  const m: Sub = new Map();
  let left = z;
  for (const o of ORDER) {
    if (left <= 0) break;
    const n = Math.min(CAP[o[1]], left);
    m.set(o, n);
    left -= n;
  }
  return m;
}

function fullSubshells(z: number): Sub {
  const ex = EXCEPTIONS[z];
  if (!ex) return madelung(z);
  const core = ex.match(/\[(\w+)\]/)?.[1];
  const coreZ = NOBLE.find(([, s]) => s === core)?.[0] ?? 0;
  const m = madelung(coreZ);
  for (const part of ex.replace(/\[\w+\]/, "").trim().split(/\s+/)) {
    const [, sub, cnt] = part.match(/^(\d[spdf])(\d+)$/)!;
    m.set(sub, Number(cnt));
  }
  return m;
}

const sortKey = (s: string) => Number(s[0]) * 10 + L[s[1]];

function formatConfig(z: number, m: Sub): string {
  const core = NOBLE.find(([nz]) => nz < z);
  const coreSubs = core ? madelung(core[0]) : new Map<string, number>();
  const parts = [...m.entries()]
    .filter(([k, v]) => v > 0 && coreSubs.get(k) !== v)
    .sort((a, b) => sortKey(a[0]) - sortKey(b[0]))
    .map(([k, v]) => `${k}${v}`);
  return [core ? `[${core[1]}]` : "", ...parts].filter(Boolean).join(" ");
}

function position(z: number) {
  const ends = [2, 10, 18, 36, 54, 86, 118];
  const period = ends.findIndex((e) => z <= e) + 1;
  const start = period === 1 ? 0 : ends[period - 2];
  const i = z - start;
  let group: number | null = null;
  let row = period;
  let col = 0;
  let block: ElementRecord["block"] = "s";
  if (period === 1) {
    group = z === 1 ? 1 : 18;
    block = "s";
  } else if (period <= 3) {
    group = i <= 2 ? i : i + 10;
    block = i <= 2 ? "s" : "p";
  } else if (period <= 5) {
    group = i;
    block = i <= 2 ? "s" : i <= 12 ? "d" : "p";
  } else if (i <= 2) {
    group = i;
  } else if (i <= 16) {
    // La–Yb / Ac–No placed in the f-block rows; Lu and Lr in group 3 (IUPAC 2021 provisional report)
    group = null;
    block = "f";
    row = period === 6 ? 9 : 10;
    col = i; // 3..16 -> columns 3..16 in the f-row (offset applied in layout)
  } else {
    group = i - 14;
    block = group === 3 ? "d" : group <= 12 ? "d" : "p";
  }
  if (group !== null) col = group;
  if (z === 2) block = "s";
  return { period, group, row, col, block };
}

function occurrence(z: number): Occurrence {
  if (z === 90 || z === 92) return "primordial";
  if (z === 43 || z === 61 || (z >= 84 && z <= 94)) return "trace";
  if (z >= 95) return "synthetic";
  return "primordial";
}

export const ELEMENTS: ElementRecord[] = RAW_ELEMENTS.map((raw) => {
  const pos = position(raw.z);
  const subs = fullSubshells(raw.z);
  const shells: number[] = [];
  for (const [k, v] of subs) {
    const n = Number(k[0]);
    shells[n - 1] = (shells[n - 1] ?? 0) + v;
  }
  return {
    ...raw,
    ...pos,
    config: formatConfig(raw.z, subs),
    configPredicted: raw.z >= 104,
    shells: Array.from(shells, (x) => x ?? 0),
    occurrence: occurrence(raw.z),
  };
});

export const BY_SYMBOL = new Map(ELEMENTS.map((e) => [e.s.toLowerCase(), e]));
export const getElement = (symbolOrZ: string | number) =>
  typeof symbolOrZ === "number" ? ELEMENTS[symbolOrZ - 1] : BY_SYMBOL.get(symbolOrZ.toLowerCase());

export const CATEGORIES: Category[] = [
  "alkali", "alkaline-earth", "transition", "post-transition", "metalloid",
  "nonmetal", "halogen", "noble-gas", "lanthanide", "actinide", "unknown",
];

/** Normalise Arabic for search: strip diacritics, unify alef/hamza/taa marbuta forms. */
export function normalize(q: string) {
  return q
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

export function matchElement(e: ElementRecord, query: string) {
  const q = normalize(query);
  if (!q) return true;
  if (/^\d+$/.test(q)) return e.z === Number(q);
  return e.s.toLowerCase() === q || normalize(e.en).includes(q) || normalize(e.ar).includes(q) || (q.length <= 2 && e.s.toLowerCase().startsWith(q));
}

export const kToC = (k: number) => Math.round((k - 273.15) * 100) / 100;

