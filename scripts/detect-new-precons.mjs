#!/usr/bin/env node
// Finds precon decklists on fabtcg.com that aren't in scripts/precon-sources.json
// yet, scrapes them, and appends them (regenerating src/data/precons.json).
// Run by .github/workflows/detect-precons.yml, which opens a PR if anything
// changed — nothing here pushes directly, since slug/category/label are
// guessed from page markup and deserve a human glance before merging.
//
// Discovery: fabtcg.com's own decklist search/filter endpoints are the
// ground truth for "is a decklist page actually live" — a set can appear in
// the-fab-cube's set.json well before its decklist page is published (e.g.
// releases still months out), so we also cross-check set.json for upcoming
// Chapter/Armory sets and log anything not yet resolved to a live decklist,
// purely as a heads-up in the Action's logs (it isn't required to find
// anything there — set.json coverage is incomplete for some precon lines,
// e.g. the Heavy Hitters / Part the Mistveil / Rosetta / Hunted blitz decks
// don't get their own exclusive set id at all).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchUrl, fetchDecklistPage, extractDecklistText, extractTitle, extractDecklistSlugs } from "./lib/fabtcg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES_PATH = path.join(__dirname, "precon-sources.json");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "precons.json");

const SET_JSON_URL = "https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/develop/json/english/set.json";

const DISCOVERY_URLS = [
  "https://fabtcg.com/decklists/?decklist_search=Chapter",
  "https://fabtcg.com/decklists/?decklist_format=Blitz+Preconstructed",
  "https://fabtcg.com/decklists/?decklist_search=Armory",
];

// Matches a known family prefix in a page's <h2> title to a picker category;
// anything else lands in a catch-all bucket for the reviewer to sort out.
const CATEGORY_RULES = [
  [/silver age chapter (\d+)/i, (m) => `Silver Age Chapter ${m[1]}`],
  [/heavy hitters/i, () => "Heavy Hitters (Blitz Preconstructed)"],
  [/part the mistveil/i, () => "Part the Mistveil (Blitz Preconstructed)"],
  [/rosetta blitz deck/i, () => "Rosetta Blitz Deck"],
  [/the hunted blitz deck/i, () => "The Hunted Blitz Deck"],
  [/1st strike|first strike/i, () => "1st Strike (Blitz Preconstructed)"],
  [/armory deck/i, () => "Armory Deck"],
];

function categoryFor(title) {
  for (const [re, label] of CATEGORY_RULES) {
    const m = title.match(re);
    if (m) return label(m);
  }
  return "New Precon";
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function discoverSlugs() {
  const slugs = new Set();
  for (const url of DISCOVERY_URLS) {
    const { status, body } = fetchUrl(url);
    if (status !== "200") {
      process.stderr.write(`WARNING: discovery fetch failed for ${url} (HTTP ${status})\n`);
      continue;
    }
    extractDecklistSlugs(body).forEach((s) => slugs.add(s));
  }
  return slugs;
}

function logUpcomingSetsFromSetJson(knownLabels) {
  const { status, body } = fetchUrl(SET_JSON_URL);
  if (status !== "200") {
    process.stderr.write(`WARNING: could not fetch set.json for the informational check (HTTP ${status})\n`);
    return;
  }
  let sets;
  try {
    sets = JSON.parse(body);
  } catch {
    process.stderr.write("WARNING: set.json did not parse as JSON\n");
    return;
  }
  const precon = sets.filter((s) => /^silver age chapter|^armory deck/i.test(s.name));
  const unresolved = precon.filter((s) => !knownLabels.some((l) => l.toLowerCase().includes(s.name.toLowerCase().split(" - ").pop().toLowerCase())));
  if (unresolved.length) {
    process.stderr.write(`\nset.json has ${unresolved.length} Chapter/Armory set(s) not yet matched to a scraped precon:\n`);
    unresolved.forEach((s) => {
      const date = s.printings[0]?.initial_release_date || "unknown release date";
      process.stderr.write(`  ${s.id} - ${s.name} (${date})\n`);
    });
  }
}

function main() {
  const sources = JSON.parse(readFileSync(SOURCES_PATH, "utf8"));
  const knownSlugs = new Set(sources.map((s) => s.slug));
  const knownIds = new Set(sources.map((s) => s.id));

  process.stderr.write("Discovering decklist slugs from fabtcg.com...\n");
  const discovered = discoverSlugs();
  const newSlugs = [...discovered].filter((slug) => !knownSlugs.has(slug));

  logUpcomingSetsFromSetJson(sources.map((s) => s.label));

  if (!newSlugs.length) {
    process.stderr.write("No new precon decklists found.\n");
    return;
  }

  process.stderr.write(`Found ${newSlugs.length} new decklist slug(s): ${newSlugs.join(", ")}\n`);

  const newSources = [];
  for (const slug of newSlugs) {
    process.stderr.write(`Scraping ${slug}... `);
    const { status, body } = fetchDecklistPage(slug);
    if (status !== "200") {
      process.stderr.write(`FAILED (HTTP ${status})\n`);
      continue;
    }
    const decklistText = extractDecklistText(body);
    if (!decklistText) {
      process.stderr.write("FAILED (no decklist-list-view section found)\n");
      continue;
    }
    const title = extractTitle(body) || slug;
    let id = slugify(title);
    // Guarantee uniqueness against existing + already-added-this-run ids.
    let suffix = 2;
    while (knownIds.has(id) || newSources.some((s) => s.id === id)) {
      id = `${slugify(title)}-${suffix++}`;
    }
    newSources.push({ id, category: categoryFor(title), label: title, slug, decklistText });
    process.stderr.write(`ok (${title})\n`);
  }

  if (!newSources.length) {
    process.stderr.write("No new precons could be scraped successfully.\n");
    return;
  }

  const updatedSources = [...sources, ...newSources.map(({ decklistText, ...s }) => s)];
  writeFileSync(SOURCES_PATH, JSON.stringify(updatedSources, null, 2) + "\n");
  process.stderr.write(`\nAppended ${newSources.length} source(s) to ${path.relative(process.cwd(), SOURCES_PATH)}\n`);

  const existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
  const output = [
    ...existing,
    ...newSources.map(({ id, category, label, decklistText }) => ({ id, category, label, decklistText })),
  ];
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");
  process.stderr.write(`Wrote ${output.length} precon(s) to ${path.relative(process.cwd(), OUTPUT_PATH)}\n`);
}

main();
