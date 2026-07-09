// Shared helpers for talking to fabtcg.com's decklist pages. fabtcg.com's WAF
// blocks requests without a browser User-Agent (returns a bare 403, distinct
// from a real 404/deck-not-yet-published), so every request goes through curl
// with one set explicitly — Node's built-in fetch doesn't pick up this repo's
// outbound HTTPS proxy either, which is a second, independent reason `curl`
// is used instead of `fetch` here.
import { execFileSync } from "node:child_process";

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

const COLOR_ALIASES = { red: "red", blu: "blue", blue: "blue", yel: "yellow", yellow: "yellow" };

export function decodeEntities(s) {
  return s
    .replace(/&#0?39;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8211;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    // Split/fusion cards (e.g. "Arcane Seeds // Life") render with "||" in
    // fabtcg's decklist markup; our card DB uses " // " as the separator.
    .replace(/\|\|/g, " // ");
}

export function fetchUrl(url) {
  const raw = execFileSync("curl", ["-sS", "-A", USER_AGENT, "-w", "\n__STATUS__%{http_code}", url], {
    maxBuffer: 1024 * 1024 * 20,
    encoding: "utf8",
  });
  const statusMatch = raw.match(/__STATUS__(\d+)\s*$/);
  return {
    status: statusMatch ? statusMatch[1] : "?",
    body: raw.replace(/\n?__STATUS__\d+\s*$/, ""),
  };
}

export function fetchDecklistPage(slug) {
  return fetchUrl(`https://fabtcg.com/decklists/${slug}/`);
}

/** Pulls "qty Name (color)" lines out of a decklist page's list-view card grid. */
export function extractDecklistText(html) {
  const start = html.indexOf('class="decklist-list-view');
  if (start === -1) return null;
  const end = html.indexOf("decklist-grid-view", start);
  if (end === -1) return null;
  const section = html.slice(start, end);
  const items = [...section.matchAll(/<span>(\d+)x<\/span>\s*([^<]+)<\/div>/g)];
  if (!items.length) return null;
  const lines = items.map(([, qty, rawName]) => {
    let name = decodeEntities(rawName.trim());
    const m = name.match(/^(.*?)\s*\(([a-z]+)\)\s*$/i);
    if (m) {
      const alias = COLOR_ALIASES[m[2].toLowerCase()];
      name = alias ? `${m[1].trim()} (${alias})` : m[1].trim();
    }
    return `${qty} ${name}`;
  });
  return lines.join("\n");
}

/** The <h2> deck title shown at the top of a decklist page, if present. */
export function extractTitle(html) {
  const m = html.match(/<h2>([^<]*)<\/h2>/);
  return m ? decodeEntities(m[1].trim()) : null;
}

/** Every /decklists/<slug>/ link found on a listing/search page. */
export function extractDecklistSlugs(html) {
  const slugs = new Set();
  for (const m of html.matchAll(/decklists\/([a-z0-9-]+)\/"/g)) {
    if (m[1] !== "feed") slugs.add(m[1]);
  }
  return [...slugs];
}
