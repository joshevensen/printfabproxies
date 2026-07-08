import type { Card, ResolvedCard } from "./types";

/**
 * Rules text creates extra cards a deck needs to have on hand — tokens
 * ("create a Fealty token"), created attacks/items ("Create a Crouching Tiger
 * in your banished zone"), and the Marked aura applied by the "mark" keyword.
 * We scan for those and auto-add the implied cards so the sheet is complete.
 *
 * Detection is deliberately conservative: a created thing is only added when
 * the text names an *exact* card in the database, so loose phrasing can only
 * ever miss a card, never invent one.
 */

// Rules text bolds keywords with **markdown**; strip it before matching.
const stripBold = (t: string): string => (t || "").replace(/\*/g, "");

// "create[s/d] <clause>" up to the end of the sentence.
const CREATE_CLAUSE = /\bcreate[sd]?\s+([^.\n]+)/gi;

// The "mark" keyword applied to a hero (not the adjective "marked hero", nor
// noun uses like "Mark of the Huntsman" or the flavor "mark the box").
const MARK_APPLY = /\bmarks?\s+(?:them|it|that|those|target|each|every|any|the\s+\w+\s+hero)\b/i;
const MARKED_NAME = "marked";

const MAX_NAME_WORDS = 7;

function isToken(card: Card): boolean {
  return (card.types || []).some((t) => t.toLowerCase() === "token");
}

// Strip a leading count ("2 ") or article ("a"/"an") off a created-thing
// fragment, returning the quantity and the remaining name phrase.
function stripLead(fragment: string): { qty: number; rest: string } {
  const num = fragment.match(/^(\d+)\s+(.+)$/);
  if (num) return { qty: parseInt(num[1], 10) || 1, rest: num[2].trim() };
  const article = fragment.match(/^an?\s+(.+)$/i);
  if (article) return { qty: 1, rest: article[1].trim() };
  return { qty: 1, rest: fragment.trim() };
}

// Longest leading run of words that exactly matches a card name, so
// "crouching tiger in your banished zone" resolves to "crouching tiger" and
// "fealty token" resolves to "fealty".
function resolveName(rest: string, nameSet: Set<string>): string | null {
  const words = rest.toLowerCase().split(/\s+/);
  for (let len = Math.min(words.length, MAX_NAME_WORDS); len >= 1; len--) {
    const name = words.slice(0, len).join(" ");
    if (nameSet.has(name)) return name;
  }
  return null;
}

/**
 * Scans the resolved decklist for cards it implies (created tokens/cards and
 * the Marked aura) and returns them, skipping anything already listed. Each
 * lands in its natural group in the preview based on its card type.
 */
export function collectAutoTokens(
  resolvedCards: ResolvedCard[],
  dbIndex: Map<string, Card[]> | null
): ResolvedCard[] {
  if (!dbIndex) return [];
  const nameSet = new Set(dbIndex.keys());
  const existingNames = new Set(resolvedCards.map((r) => r.card.name.toLowerCase()));

  const qtyByName = new Map<string, number>();
  let needsMarked = false;

  resolvedCards.forEach((entry) => {
    const text = stripBold(entry.card.functional_text);

    let match: RegExpExecArray | null;
    CREATE_CLAUSE.lastIndex = 0;
    while ((match = CREATE_CLAUSE.exec(text))) {
      match[1]
        .split(/\s*,\s*|\s+and\s+|\s+or\s+/i)
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((fragment) => {
          const { qty, rest } = stripLead(fragment);
          const name = resolveName(rest, nameSet);
          if (name) qtyByName.set(name, Math.max(qtyByName.get(name) || 1, qty));
        });
    }

    if (MARK_APPLY.test(text)) needsMarked = true;
  });

  if (needsMarked && nameSet.has(MARKED_NAME)) {
    qtyByName.set(MARKED_NAME, Math.max(qtyByName.get(MARKED_NAME) || 1, 1));
  }

  const tokens: ResolvedCard[] = [];
  let i = 0;
  qtyByName.forEach((qty, key) => {
    if (existingNames.has(key)) return;
    const matches = dbIndex.get(key) || [];
    // Prefer a token printing when a name exists as both (e.g. "Hyper Driver").
    const card = matches.find(isToken) || matches[0];
    if (!card) return;
    tokens.push({
      id: "token" + i++ + "-" + Date.now(),
      name: card.name,
      qty,
      card,
      printing: card.printings[0] || null,
    });
  });
  return tokens;
}
