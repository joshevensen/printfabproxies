import type { Card } from "./types";

export type CardGroup = "arena" | "deck" | "other";

export function classifyGroup(card: Card): CardGroup {
  const t = card.types || [];
  const has = (n: string) => t.some((x) => x.toLowerCase() === n.toLowerCase());
  if (has("Token") || card.name === "Marked") return "other";
  if (has("Hero") || has("Equipment") || has("Weapon")) return "arena";
  return "deck";
}

export function isWeapon(card: Card): boolean {
  return (card.types || []).some((x) => x.toLowerCase() === "weapon");
}

export function maxQtyFor(card: Card): number {
  const group = classifyGroup(card);
  if (group === "deck") return 4;
  if (group === "arena" && isWeapon(card)) return 2;
  if (group === "arena") return 1;
  return Infinity;
}
