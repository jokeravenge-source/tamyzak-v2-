import fish from "@/assets/pet-fish.png";
import mouse from "@/assets/pet-mouse.png";
import bird from "@/assets/pet-bird.png";
import cat from "@/assets/pet-cat.png";
import panda from "@/assets/pet-panda.png";
import fox from "@/assets/pet-fox.png";
import snake from "@/assets/pet-snake.png";
import tiger from "@/assets/pet-tiger.png";
import lion from "@/assets/pet-lion.png";
import whale from "@/assets/pet-whale.png";
import dragon from "@/assets/pet-dragon.png";
import { RANKS, type Rank } from "@/lib/points";

export type PetKind = "fish" | "mouse" | "bird" | "cat" | "panda" | "fox" | "snake" | "tiger" | "lion" | "whale" | "dragon";
export type RankKey = Rank["key"];

export type PetDefinition = {
  key: PetKind;
  name: { en: string; ar: string };
  rank: RankKey;
  image: string;
};

export const PET_DEFINITIONS: PetDefinition[] = [
  { key: "fish", name: { en: "Fish", ar: "سمكة" }, rank: "coal", image: fish },
  { key: "mouse", name: { en: "Mouse", ar: "فأر" }, rank: "coal", image: mouse },
  { key: "bird", name: { en: "Bird", ar: "طائر" }, rank: "copper", image: bird },
  { key: "cat", name: { en: "Cat", ar: "قطة" }, rank: "copper", image: cat },
  { key: "panda", name: { en: "Panda", ar: "باندا" }, rank: "silver", image: panda },
  { key: "fox", name: { en: "Fox", ar: "ثعلب" }, rank: "silver", image: fox },
  { key: "snake", name: { en: "Snake", ar: "أفعى" }, rank: "gold", image: snake },
  { key: "tiger", name: { en: "Tiger", ar: "نمر" }, rank: "gold", image: tiger },
  { key: "lion", name: { en: "Lion", ar: "أسد" }, rank: "diamond", image: lion },
  { key: "whale", name: { en: "Whale", ar: "حوت" }, rank: "diamond", image: whale },
  { key: "dragon", name: { en: "Dragon", ar: "تنين" }, rank: "royal", image: dragon },
];

const rankIndex = (rank: RankKey) => RANKS.findIndex((item) => item.key === rank);

export function isPetUnlocked(pet: PetDefinition, currentRank: RankKey) {
  return rankIndex(currentRank) >= rankIndex(pet.rank);
}

export function getSelectedPets(traits?: { pets?: PetKind[]; pet?: PetKind | null } | null): PetKind[] {
  const selected = traits?.pets?.length ? traits.pets : traits?.pet ? [traits.pet] : [];
  return Array.from(new Set(selected)).filter((pet): pet is PetKind => PET_DEFINITIONS.some((item) => item.key === pet)).slice(0, 3);
}

export function getPetDefinition(key: PetKind) {
  return PET_DEFINITIONS.find((pet) => pet.key === key);
}
