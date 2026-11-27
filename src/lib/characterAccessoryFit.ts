import type { CharacterTraits, Gender } from "@/components/CharacterAvatar";

export type AvatarAccessory = "straw" | "red-cap" | "kitty-ears" | "crown" | "glasses" | "gold-chain";
export type AccessoryAdjustment = { x: number; y: number; scale: number; rotation: number };
export type AccessoryFitEdits = Partial<Record<AvatarAccessory, AccessoryAdjustment | null>>;
export type CharacterAccessoryFits = Record<string, Partial<Record<AvatarAccessory, AccessoryAdjustment>>>;

export const ACCESSORY_ADJUSTMENTS = {
  x: { min: -20, max: 20 },
  y: { min: -20, max: 20 },
  scale: { min: 60, max: 150 },
  rotation: { min: -30, max: 30 },
} as const;

export const DEFAULT_ACCESSORY_ADJUSTMENT: AccessoryAdjustment = { x: 0, y: 0, scale: 100, rotation: 0 };

type Anchor = readonly [x: number, y: number, width: number];
type Landmarks = readonly [head: Anchor, eyes: Anchor, collar: Anchor];

// Percentages of the contained, square artwork. Rows follow the avatar catalog.
// Head marks the brim line, eyes the lens centers, and collar the chain ends.
const landmarks = {
  male: [
    [[50, 23, 52], [50, 42, 37], [50, 51, 23]],
    [[50, 23, 52], [50, 41, 39], [50, 52, 22]],
    [[50, 22, 50], [50, 41, 39], [50, 51, 22]],
    [[50, 22, 49], [50, 40, 40], [50, 50, 22]],
    [[50, 23, 52], [50, 40, 38], [50, 51, 22]],
    [[50, 22, 50], [50, 39, 39], [50, 51, 22]],
    [[50, 22, 50], [50, 40, 39], [50, 51, 22]],
    [[50, 14, 27], [50, 23, 23], [50, 33, 18]],
    [[49, 14, 30], [49, 25, 22], [49, 36, 18]],
    [[49, 13, 27], [49, 22, 20], [49, 31, 18]],
    [[50, 23, 34], [50, 34, 26], [50, 48, 19]],
  ],
  female: [
    [[50, 26, 44], [50, 45, 35], [50, 55, 20]],
    [[50, 22, 48], [50, 39, 37], [50, 52, 21]],
    [[50, 22, 53], [50, 39, 38], [50, 51, 22]],
    [[50, 22, 52], [50, 40, 37], [50, 52, 21]],
    [[50, 23, 51], [50, 39, 37], [50, 52, 22]],
    [[50, 23, 56], [50, 40, 35], [50, 54, 20]],
    [[50, 22, 51], [50, 40, 37], [50, 52, 21]],
    [[49, 19, 41], [50, 33, 26], [50, 45, 18]],
    [[50, 17, 37], [50, 28, 28], [49, 41, 18]],
    [[50, 16, 33], [50, 25, 22], [50, 36, 17]],
    [[50, 16, 30], [50, 25, 20], [50, 33, 17]],
    [[50, 22, 22], [50, 26, 16], [50, 34, 13]],
    [[52, 19, 39], [52, 31, 25], [51, 41, 18]],
    [[50, 28, 41], [50, 42, 27], [50, 52, 18]],
    [[50, 16, 36], [50, 20, 24], [50, 31, 19]],
    [[49, 27, 47], [50, 42, 30], [50, 56, 20]], // Koki
  ],
} as const satisfies Record<Gender, readonly Landmarks[]>;

const fit = {
  straw: { landmark: 0, yOffset: 0, widthFactor: 1.08, pivotY: 75 },
  "red-cap": { landmark: 0, yOffset: 1, widthFactor: 1.12, pivotY: 64 },
  "kitty-ears": { landmark: 0, yOffset: -4, widthFactor: 1.04, pivotY: 42 },
  crown: { landmark: 0, yOffset: -4, widthFactor: .54, pivotY: 94 },
  glasses: { landmark: 1, yOffset: 0, widthFactor: 1, pivotY: 60 },
  "gold-chain": { landmark: 2, yOffset: 0, widthFactor: 1, pivotY: 6 },
} as const;

export function getCharacterVariant(gender: Gender, requested: CharacterTraits["variant"]): number {
  const variant = Math.trunc(Number(requested ?? 1));
  if (!Number.isFinite(variant)) return 1;
  if (gender === "female" && variant === 16) return variant;
  const regularVariants = gender === "female" ? landmarks.female.length - 1 : landmarks.male.length;
  return Math.max(1, Math.min(regularVariants, variant));
}

export function getCharacterFitKey(gender: Gender, variant: CharacterTraits["variant"]): string {
  return `${gender}:${getCharacterVariant(gender, variant)}`;
}

export function getWornAccessories(traits: Partial<CharacterTraits>): AvatarAccessory[] {
  const worn: AvatarAccessory[] = [];
  if (traits.hat === "straw" || traits.hat === "red-cap" || traits.hat === "kitty-ears") worn.push(traits.hat);
  else if (traits.accessory === "crown") worn.push("crown");
  if (traits.accessory === "glasses") worn.push("glasses");
  if (traits.chain === "gold") worn.push("gold-chain");
  return worn;
}

export function getAccessoryAdjustment(adjustment?: AccessoryAdjustment | null): AccessoryAdjustment {
  function value(key: keyof AccessoryAdjustment) {
    const { min, max } = ACCESSORY_ADJUSTMENTS[key];
    const saved = adjustment?.[key];
    return typeof saved === "number" && Number.isFinite(saved) ? Math.round(Math.max(min, Math.min(max, saved))) : DEFAULT_ACCESSORY_ADJUSTMENT[key];
  }
  return { x: value("x"), y: value("y"), scale: value("scale"), rotation: value("rotation") };
}

export function getAccessoryPlacement(gender: Gender, traits: Partial<CharacterTraits>, accessory: AvatarAccessory) {
  const variant = getCharacterVariant(gender, traits.variant);
  const item = fit[accessory];
  const [x, y, width] = landmarks[gender][variant - 1][item.landmark];
  const adjustment = getAccessoryAdjustment(traits.accessoryFits?.[`${gender}:${variant}`]?.[accessory]);
  return {
    left: `${x + adjustment.x}%`,
    top: `${y + item.yOffset + adjustment.y}%`,
    width: width * item.widthFactor * adjustment.scale / 100,
    transform: `translate(-50%, -${item.pivotY}%) rotate(${adjustment.rotation}deg)`,
    transformOrigin: `50% ${item.pivotY}%`,
  };
}

export function getCharacterPenGrip(gender: Gender, requested: CharacterTraits["variant"]) {
  const variant = getCharacterVariant(gender, requested);
  const [, , [x, y, width]] = landmarks[gender][variant - 1];
  // Keep the raised hand closer to the body on taller, narrower sprites.
  const reach = gender === "female" && variant === 16 ? .5 : .65;
  return { left: `${x + width * reach}%`, top: `${47 + y / 2}%` };
}

export function mergeAccessoryFitEdits(saved: CharacterAccessoryFits | undefined, character: string, edits: AccessoryFitEdits): CharacterAccessoryFits {
  const fits = { ...saved };
  const characterFits = { ...fits[character] };
  for (const accessory of Object.keys(edits) as AvatarAccessory[]) {
    const adjustment = edits[accessory];
    if (adjustment) characterFits[accessory] = getAccessoryAdjustment(adjustment);
    else delete characterFits[accessory];
  }

  if (Object.keys(characterFits).length) fits[character] = characterFits;
  else delete fits[character];
  return fits;
}
