#!/usr/bin/env node
// Fetches the full FaB card database from the-fab-cube/flesh-and-blood-cards and
// strips it down to only the fields ProxyCard/deckParser actually use (dropping
// legality flags, alternate editions/foilings, artist/flavor text, image URLs,
// tcgplayer links, etc.) so public/cards.json stays small.
//
// Cards are printed across many products, and the same card id covers every
// treatment (foil vs non-foil share an id). We only need one printing to proxy
// from, and we prefer a "real" expansion set over a preconstructed deck, promo,
// etc. So we also pull set.json, drop sets whose name looks like a deck/promo
// product, and flatten each card to a single printing from the earliest
// remaining set (falling back to the earliest printing overall if a card only
// ever appeared in excluded products).
import { writeFile } from "node:fs/promises";

const BASE_URL = "https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/develop/json/english/";
const CARD_URL = `${BASE_URL}card.json`;
const SET_URL = `${BASE_URL}set.json`;
const OUTPUT_PATH = new URL("../public/cards.json", import.meta.url);

// Sets whose name contains any of these words are preconstructed decks, promos,
// or other non-expansion products we'd rather not proxy the printing details of.
const EXCLUDED_SET_KEYWORDS = ["deck", "chapter", "strike", "promo"];

// Sentinel for sets with no known release date — a valid far-future ISO date so
// it sorts last and is safe if ever parsed as a real date.
const FAR_FUTURE = "9999-12-31";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (!Array.isArray(json)) {
    throw new Error(`Unexpected shape from ${url}: expected an array`);
  }
  return json;
}

// Build lookups from set.json: which set ids are excluded, and each set's
// earliest release date (so "earliest set" ordering is meaningful).
function indexSets(sets) {
  const excluded = new Set();
  const releaseDate = new Map();
  for (const s of sets) {
    if (!s.id) continue;
    const name = (s.name || "").toLowerCase();
    if (EXCLUDED_SET_KEYWORDS.some((kw) => name.includes(kw))) excluded.add(s.id);
    const dates = (s.printings || [])
      .map((p) => p.initial_release_date)
      .filter(Boolean)
      .sort();
    releaseDate.set(s.id, dates[0] || FAR_FUTURE);
  }
  return { excluded, releaseDate };
}

// Pick one printing for a card: the earliest allowed (non-excluded) set, or the
// earliest printing overall if the card only exists in excluded products.
function chooseBestPrinting(printings, sets) {
  const withSet = (printings || []).filter((p) => p.set_id);
  if (withSet.length === 0) return (printings && printings[0]) || null;
  const allowed = withSet.filter((p) => !sets.excluded.has(p.set_id));
  const pool = allowed.length ? allowed : withSet;
  const dateOf = (p) => sets.releaseDate.get(p.set_id) || FAR_FUTURE;
  // Sort by set release date, then set id, then printing id so the choice is
  // fully deterministic even if the source reorders printings within a set.
  pool.sort(
    (a, b) =>
      dateOf(a).localeCompare(dateOf(b)) ||
      a.set_id.localeCompare(b.set_id) ||
      (a.id || "").localeCompare(b.id || "")
  );
  return pool[0];
}

function transformPrinting(p) {
  return { id: p.id || "", set_id: p.set_id || "", rarity: p.rarity || "" };
}

function transformCard(c, sets) {
  const best = chooseBestPrinting(c.printings, sets);
  return {
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
    // Kept as a one-element array so the app's existing printings[0] access and
    // the flat/grouped normalizer keep working unchanged.
    printings: best ? [transformPrinting(best)] : [],
  };
}

const [rawCards, rawSets] = await Promise.all([fetchJson(CARD_URL), fetchJson(SET_URL)]);
const sets = indexSets(rawSets);

let fallbackCount = 0;
const cards = rawCards.map((c) => {
  const anyAllowed = (c.printings || []).some((p) => p.set_id && !sets.excluded.has(p.set_id));
  if (!anyAllowed && (c.printings || []).length) fallbackCount++;
  return transformCard(c, sets);
});

await writeFile(OUTPUT_PATH, JSON.stringify(cards), "utf8");
console.log(
  `Wrote ${cards.length} cards to public/cards.json ` +
    `(${sets.excluded.size} sets excluded, ${fallbackCount} cards fell back to an excluded-only printing)`
);
