#!/usr/bin/env node
// Fetches the full FaB card database from the-fab-cube/flesh-and-blood-cards and
// strips it down to only the fields ProxyCard/deckParser actually use (dropping
// legality flags, alternate editions/foilings, artist/flavor text, image URLs,
// tcgplayer links, etc.) so public/cards.json stays small.
import { writeFile } from "node:fs/promises";

const SOURCE_URL =
  "https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/develop/json/english/card.json";
const OUTPUT_PATH = new URL("../public/cards.json", import.meta.url);

function transformPrinting(p) {
  return { id: p.id || "", set_id: p.set_id || "", rarity: p.rarity || "" };
}

function transformCard(c) {
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
    printings: (c.printings || []).map(transformPrinting),
  };
}

const res = await fetch(SOURCE_URL);
if (!res.ok) {
  throw new Error(`Failed to fetch card database: ${res.status} ${res.statusText}`);
}
const raw = await res.json();
if (!Array.isArray(raw)) {
  throw new Error("Unexpected card database shape: expected an array");
}

const cards = raw.map(transformCard);
await writeFile(OUTPUT_PATH, JSON.stringify(cards), "utf8");
console.log(`Wrote ${cards.length} cards to public/cards.json`);
