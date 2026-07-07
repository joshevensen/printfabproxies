import type { Card, ResolvedCard } from "./types";
import { maxQtyFor } from "./classify";

/**
 * Shareable-link encoding. A sheet is serialized into a single `cards` query
 * param as `_`-separated entries, each `ID[.index][-qty]`:
 *
 *   WTR215_ARC159-4_DTD164.1-2
 *
 * - `ID` is the card's chosen printing id — stable across weekly DB rebuilds.
 * - `-qty` is added only when the quantity is > 1.
 * - `.index` disambiguates the handful of ids shared by more than one card
 *   (double-faced / meld pairs) by indexing into a deterministically sorted
 *   group; it's omitted for the common single-card case (and for index 0).
 *
 * Delimiters (`_` `.` `-`) never appear in printing ids (which are strictly
 * alphanumeric) so entries parse unambiguously, and all survive
 * URLSearchParams serialization unescaped (unlike `,`) so the link stays clean.
 * Ids are normalized to uppercase in one place (printingId) so encode/decode
 * key the index identically.
 */

export type IdIndex = Map<string, Card[]>;

function printingId(card: Card): string {
  return (card.printings[0]?.id || "").toUpperCase();
}

function sameCard(a: Card, b: Card): boolean {
  return a.name === b.name && (a.pitch || "") === (b.pitch || "");
}

/**
 * Groups cards by their printing id. Ids are unique per card except for a few
 * double-faced/meld pairs; each group is sorted (pitch, name) so a card's index
 * within it is stable regardless of DB ordering.
 */
export function buildIdIndex(cards: Card[]): IdIndex {
  const map: IdIndex = new Map();
  for (const c of cards) {
    const id = printingId(c);
    if (!id) continue;
    const group = map.get(id);
    if (group) group.push(c);
    else map.set(id, [c]);
  }
  for (const group of map.values()) {
    group.sort((a, b) => (a.pitch || "").localeCompare(b.pitch || "") || a.name.localeCompare(b.name));
  }
  return map;
}

function tokenFor(card: Card, idIndex: IdIndex): string | null {
  const id = printingId(card);
  if (!id) return null;
  const group = idIndex.get(id);
  if (!group || group.length <= 1) return id;
  const idx = group.findIndex((c) => sameCard(c, card));
  return idx > 0 ? `${id}.${idx}` : id;
}

export function encodeCards(resolved: ResolvedCard[], idIndex: IdIndex): string {
  const parts: string[] = [];
  for (const r of resolved) {
    const token = tokenFor(r.card, idIndex);
    if (!token) continue;
    parts.push(r.qty > 1 ? `${token}-${r.qty}` : token);
  }
  return parts.join("_");
}

const ENTRY_RE = /^([A-Za-z0-9]+)(?:\.(\d+))?(?:-(\d+))?$/;

export function decodeCards(value: string, idIndex: IdIndex): ResolvedCard[] {
  const out: ResolvedCard[] = [];
  value
    .split("_")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((entry, i) => {
      const m = entry.match(ENTRY_RE);
      if (!m) return;
      const id = m[1].toUpperCase();
      const groupIndex = m[2] ? parseInt(m[2], 10) : 0;
      const qty = m[3] ? parseInt(m[3], 10) : 1;
      const group = idIndex.get(id);
      if (!group || !group.length) return;
      const card = group[groupIndex] || group[0];
      const cap = maxQtyFor(card);
      out.push({
        id: `url${i}-${card.name}-${card.pitch || ""}`,
        name: card.name,
        qty: Math.min(cap, Math.max(1, qty)),
        card,
        printing: card.printings[0] || null,
      });
    });
  return out;
}
