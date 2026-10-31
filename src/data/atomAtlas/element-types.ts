export type Category =
  | "alkali"
  | "alkaline-earth"
  | "transition"
  | "post-transition"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

export type PhysicalState = "solid" | "liquid" | "gas";

/** Raw record as generated from PubChem. `null` = not available in the source. */
export interface RawElement {
  z: number;
  s: string;
  en: string;
  ar: string;
  /** Standard atomic weight string (PubChem), null when the element has no standard atomic weight. */
  w: string | null;
  /** Mass number of a long-lived / longest-known isotope, shown in brackets. */
  mn: number | null;
  cat: Category;
  cfgPubchem: string;
  chi: number | null;
  r: number | null;
  ie: number | null;
  ox: string | null;
  state: PhysicalState | null;
  stateQ: "measured" | "predicted";
  mp: number | null;
  bp: number | null;
  d: number | null;
  /** Physical values for this element are estimates/extrapolations. */
  est: boolean;
  year: string | null;
  cpk: string | null;
}

export type Occurrence = "primordial" | "trace" | "synthetic";

export interface ElementRecord extends RawElement {
  group: number | null;
  period: number;
  block: "s" | "p" | "d" | "f";
  /** Grid position for layout: row 1–7 main table, 9 = lanthanides, 10 = actinides. */
  row: number;
  col: number;
  config: string;
  configPredicted: boolean;
  shells: number[];
  occurrence: Occurrence;
}

