import type { Card, ParsedRow } from "./types";

/**
 * Raw card DB rows can arrive either already grouped by printing (has a
 * `printings` array) or as one flat row per printing that needs grouping
 * by name+pitch — the-fab-cube's card.json uses the grouped shape, but we
 * accept both so a flat export still works.
 */
export function normalizeDb(json: unknown): Card[] {
  if (!Array.isArray(json) || json.length === 0) return [];
  const rows = json as Record<string, any>[];
  if (rows[0].printings) {
    return rows.map((c) => ({
      name: c.name || "",
      color: c.color || "",
      pitch: c.pitch || "",
      cost: c.cost || "",
      power: c.power || "",
      defense: c.defense || "",
      health: c.health || "",
      intelligence: c.intelligence || "",
      types: c.types || [],
      type_text: c.type_text || (c.types || []).join(" - "),
      functional_text: c.functional_text || c.functional_text_plain || "",
      card_keywords: c.card_keywords || [],
      printings: (c.printings || []).map((p: any) => ({
        id: p.id || "",
        set_id: p.set_id || "",
        rarity: p.rarity || "",
      })),
    }));
  }
  const groups = new Map<string, Card>();
  rows.forEach((row) => {
    const key = (row.name || "").toLowerCase().trim() + "::" + (row.pitch || "");
    if (!groups.has(key)) {
      groups.set(key, {
        name: row.name || "",
        color: row.color || "",
        pitch: row.pitch || "",
        cost: row.cost || "",
        power: row.power || "",
        defense: row.defense || "",
        health: row.health || "",
        intelligence: row.intelligence || "",
        types: row.types || [],
        type_text: row.type_text || (row.types || []).join(" - "),
        functional_text: row.functional_text || row.functional_text_plain || "",
        card_keywords: row.card_keywords || [],
        printings: [],
      });
    }
    groups.get(key)!.printings.push({ id: row.id || "", set_id: row.set_id || "", rarity: row.rarity || "" });
  });
  return Array.from(groups.values());
}

export function buildIndex(cards: Card[]): Map<string, Card[]> {
  const index = new Map<string, Card[]>();
  cards.forEach((c) => {
    const key = c.name.toLowerCase().trim();
    if (!index.has(key)) index.set(key, []);
    index.get(key)!.push(c);
  });
  return index;
}

const COLOR_WORDS: Record<string, string> = { r: "red", red: "red", y: "yellow", yellow: "yellow", b: "blue", blue: "blue" };

export function parseLine(line: string, index: Map<string, Card[]> | null): ParsedRow {
  let qty = 1;
  let rest = line.trim();
  const qtyMatch = rest.match(/^(\d+)\s*x?\s+(.*)$/i);
  if (qtyMatch) {
    qty = parseInt(qtyMatch[1], 10) || 1;
    rest = qtyMatch[2].trim();
  }
  let modifier: string | null = null;
  const parenMatch = rest.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    rest = parenMatch[1].trim();
    modifier = parenMatch[2].trim().toLowerCase();
  }
  const normalizedName = rest.toLowerCase();
  const matches = (index && index.get(normalizedName)) || [];
  let chosenIndex: number | null = null;
  let status: ParsedRow["status"];
  if (matches.length === 0) {
    status = "notfound";
  } else if (matches.length === 1) {
    chosenIndex = 0;
    status = "ok";
  } else if (modifier) {
    let idx = -1;
    matches.forEach((m, i) => {
      const mColor = (m.color || "").toLowerCase();
      const mPitch = (m.pitch || "").toString();
      if (mPitch && mPitch === modifier) idx = i;
      else if (mColor && mColor === (COLOR_WORDS[modifier!] || modifier)) idx = i;
    });
    if (idx >= 0) {
      chosenIndex = idx;
      status = "ok";
    } else {
      status = "ambiguous";
    }
  } else {
    status = "ambiguous";
  }
  return { qty, name: rest, matches, chosenIndex, status };
}

export function parseDecklist(text: string, index: Map<string, Card[]> | null): ParsedRow[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((l) => parseLine(l, index));
}
