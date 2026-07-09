#!/usr/bin/env node
// Scrapes precon decklists (Chapter Decks, Blitz Preconstructed, Armory Decks)
// listed in scripts/precon-sources.json from fabtcg.com's server-rendered
// decklist pages and writes src/data/precons.json.
//
// Usage:
//   node scripts/scrape-precons.mjs                     # scrape every source, write precons.json
//   node scripts/scrape-precons.mjs <slug> [<slug>...]  # scrape only these slugs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchDecklistPage, extractDecklistText } from "./lib/fabtcg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES_PATH = path.join(__dirname, "precon-sources.json");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "precons.json");

function scrapeOne(source) {
  const { status, body } = fetchDecklistPage(source.slug);
  if (status !== "200") {
    return { ok: false, reason: `HTTP ${status}` };
  }
  const decklistText = extractDecklistText(body);
  if (!decklistText) {
    return { ok: false, reason: "no decklist-list-view section found" };
  }
  return { ok: true, decklistText };
}

function main() {
  const sources = JSON.parse(readFileSync(SOURCES_PATH, "utf8"));
  const argSlugs = process.argv.slice(2);
  const targets = argSlugs.length ? sources.filter((s) => argSlugs.includes(s.slug)) : sources;

  let existing = [];
  try {
    existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
  } catch {
    // no existing file yet
  }
  const byId = new Map(existing.map((p) => [p.id, p]));

  const failures = [];
  for (const source of targets) {
    process.stderr.write(`Scraping ${source.slug}... `);
    const result = scrapeOne(source);
    if (result.ok) {
      byId.set(source.id, {
        id: source.id,
        category: source.category,
        label: source.label,
        decklistText: result.decklistText,
      });
      process.stderr.write("ok\n");
    } else {
      failures.push({ ...source, reason: result.reason });
      process.stderr.write(`FAILED (${result.reason})\n`);
    }
  }

  const output = sources.filter((s) => byId.has(s.id)).map((s) => byId.get(s.id));
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");
  process.stderr.write(`\nWrote ${output.length} precon(s) to ${path.relative(process.cwd(), OUTPUT_PATH)}\n`);
  if (failures.length) {
    process.stderr.write(`\n${failures.length} failure(s):\n`);
    failures.forEach((f) => process.stderr.write(`  ${f.id} (${f.slug}): ${f.reason}\n`));
    process.exitCode = 1;
  }
}

main();
