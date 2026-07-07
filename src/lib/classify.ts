import type { Card } from "./types";

export type CardGroup =
  | "hero"
  | "weapons"
  | "equipment"
  | "attacks"
  | "reactions"
  | "instants"
  | "actions"
  | "items"
  | "auras"
  | "blocks"
  | "other";

export interface GroupDef {
  key: CardGroup;
  label: string;
  maxQty: number;
  showQtyControls: boolean;
}

/**
 * Preview sections, in display order. Each carries the copy limit and whether
 * the ± quantity controls make sense: singleton groups (Hero, Equipment) show
 * a fixed ×1 instead of steppers, and Other (tokens) is uncapped.
 */
export const GROUP_DEFS: GroupDef[] = [
  { key: "hero", label: "Hero", maxQty: 1, showQtyControls: false },
  { key: "weapons", label: "Weapons", maxQty: 2, showQtyControls: true },
  { key: "equipment", label: "Equipment", maxQty: 1, showQtyControls: false },
  { key: "attacks", label: "Attacks", maxQty: 4, showQtyControls: true },
  { key: "reactions", label: "Reactions", maxQty: 4, showQtyControls: true },
  { key: "instants", label: "Instants", maxQty: 4, showQtyControls: true },
  { key: "actions", label: "Actions", maxQty: 4, showQtyControls: true },
  { key: "items", label: "Items", maxQty: 4, showQtyControls: true },
  { key: "auras", label: "Auras", maxQty: 4, showQtyControls: true },
  { key: "blocks", label: "Blocks", maxQty: 4, showQtyControls: true },
  { key: "other", label: "Other", maxQty: Infinity, showQtyControls: true },
];

export function classifyGroup(card: Card): CardGroup {
  const t = card.types || [];
  const has = (n: string) => t.some((x) => x.toLowerCase() === n.toLowerCase());
  // Tokens (including the named "Marked" aura token) are always Other so
  // auto-added tokens land uncapped instead of in a typed deck section.
  if (has("Token") || card.name === "Marked") return "other";
  if (has("Hero")) return "hero";
  if (has("Weapon")) return "weapons";
  if (has("Equipment")) return "equipment";
  if (has("Attack Reaction") || has("Defense Reaction")) return "reactions";
  if (has("Attack")) return "attacks";
  if (has("Instant")) return "instants";
  if (has("Item")) return "items";
  if (has("Aura")) return "auras";
  if (has("Block")) return "blocks";
  if (has("Action")) return "actions";
  return "other";
}

const GROUP_DEF_BY_KEY = new Map(GROUP_DEFS.map((g) => [g.key, g]));

export function groupDefFor(card: Card): GroupDef {
  return GROUP_DEF_BY_KEY.get(classifyGroup(card))!;
}

export function maxQtyFor(card: Card): number {
  return groupDefFor(card).maxQty;
}
