import { KEYWORDS, RARITY_NAMES } from "../data/keywords";
import type { Card, Printing, ProxyCardProps } from "./types";

function escapeHtml(s: string): string {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const ICON_MAP: Record<string, string> = {
  "{r}": "[R]", "{p}": "[PWR]", "{d}": "[DEF]", "{h}": "[LIFE]", "{I}": "[INT]", "{t}": "[TAP]", "{u}": "[UNTAP]",
};

function formatFunctional(card: Card): { html: string; terms: string[] } {
  const raw = card.functional_text || "";
  let html = escapeHtml(raw);
  const terms: string[] = [];
  html = html.replace(/\*\*(.+?)\*\*/g, (_m, inner) => {
    terms.push(inner);
    return "<b>" + inner + "</b>";
  });
  html = html.replace(/\{[a-zA-Z]\}/g, (m) => ICON_MAP[m] || m);
  html = html.replace(/\n+/g, "<br/>");
  return { html, terms };
}

// Card keywords appear in compound forms that all share one glossary entry:
// "Rhinar Specialization", "Ice Fusion", "Earth Bond", "Channel Lightning",
// "Essence of Earth", and value-suffixed ones like "Spellvoid X" / "Amp 2".
// Normalize each to its base keyword name.
function canonicalKeyword(term: string): string {
  const t = term
    .replace(/\s+(?:x|\d+)$/i, "")
    .trim()
    .toLowerCase();
  if (/\sspecialization$/.test(t)) return "specialization";
  if (/\sfusion$/.test(t)) return "fusion";
  if (/\sbond$/.test(t)) return "bond";
  if (/^essence\b/.test(t)) return "essence";
  if (/^channel\b/.test(t)) return "channel";
  return t;
}

function buildGlossary(card: Card, matchedTerms: string[]) {
  const seen = new Set<string>();
  const out: { term: string; desc: string }[] = [];
  const candidates = matchedTerms.concat(card.card_keywords || []);
  candidates.forEach((term) => {
    const lookup = canonicalKeyword(term);
    if (seen.has(lookup)) return;
    const found = KEYWORDS.find((k) => k.name.toLowerCase() === lookup);
    if (found) {
      seen.add(lookup);
      out.push({ term: found.name, desc: found.description });
    }
  });
  return out;
}

export function colorHex(color: string): string {
  const c = (color || "").toLowerCase();
  if (c === "red") return "#b3392c";
  if (c === "yellow") return "#c99a2e";
  if (c === "blue") return "#2f5ea8";
  return "#FFFFFF";
}

const ICON_BASE = `${import.meta.env.BASE_URL}icons/`;
const TYPE_ICON_MAP: Record<string, string> = {
  hero: "hero.svg",
  legs: "legs.svg",
  arms: "arms.svg",
  head: "head.svg",
  chest: "chest.svg",
  offHand: "off-hand.svg",
  weapon: "weapon.svg",
  attackReaction: "attack-reaction.svg",
  attack: "attack.svg",
  defenseReaction: "defense-reaction.svg",
  block: "block.svg",
  instant: "instant.svg",
  token: "token.svg",
  item: "item.svg",
  aura: "aura.svg",
  action: "action.svg",
  event: "event.svg",
  ally: "ally.svg",
  resource: "resource.svg",
  equipment: "equipment.svg",
  marked: "marked.svg",
  fallback: "fallback.svg",
};

// Every card resolves to an icon: a specific card-type match, or "fallback".
export function classifyIconKey(types: string[] | undefined): string {
  const t = types || [];
  const has = (name: string) => t.some((x) => x.toLowerCase() === name.toLowerCase());
  // Hero-like cards share the hero icon.
  if (has("Hero") || has("Demi-Hero") || has("Mentor")) return "hero";
  if (has("Legs")) return "legs";
  if (has("Arms")) return "arms";
  if (has("Head")) return "head";
  if (has("Chest")) return "chest";
  if (has("Off-Hand")) return "offHand";
  if (has("Weapon")) return "weapon";
  // Equipment with no specific slot above (Quiver, Base, …) gets the generic icon.
  if (has("Equipment")) return "equipment";
  if (has("Attack Reaction")) return "attackReaction";
  if (has("Attack")) return "attack";
  if (has("Defense Reaction")) return "defenseReaction";
  if (has("Block")) return "block";
  if (has("Instant")) return "instant";
  if (has("Token")) return "token";
  if (has("Item")) return "item";
  if (has("Aura")) return "aura";
  if (has("Action")) return "action";
  if (has("Ally")) return "ally";
  if (has("Event")) return "event";
  if (has("Resource")) return "resource";
  return "fallback";
}

// The Marked token has no types in the source data, so key it by name.
function iconKeyForCard(card: Card): string {
  if (card.name === "Marked") return "marked";
  return classifyIconKey(card.types);
}

export function buildDisplayProps(card: Card, printing: Printing | null): ProxyCardProps {
  const isHero = (card.types || []).some((t) => /hero/i.test(t));
  const { html, terms } = formatFunctional(card);
  const glossary = buildGlossary(card, terms);
  const rarityName = (printing && RARITY_NAMES[printing.rarity]) || printing?.rarity || "";
  const fullTypeText = card.type_text || (card.types || []).join(" - ");
  const spaceIdx = fullTypeText.indexOf(" ");
  const classText = spaceIdx > -1 ? fullTypeText.slice(0, spaceIdx) : fullTypeText;
  const restTypeText = spaceIdx > -1 ? fullTypeText.slice(spaceIdx + 1) : "";
  return {
    name: card.name,
    pipColorHex: colorHex(card.color),
    pipText: card.pitch || "",
    costText: card.cost || "",
    classText,
    restTypeText,
    dividerBorder: "1px solid #1c1b19",
    watermarkIconUrl: ICON_BASE + TYPE_ICON_MAP[iconKeyForCard(card)],
    hasWatermarkIcon: true,
    functionalHtml: html || "—",
    hasGlossary: glossary.length > 0,
    glossary,
    botLeftLabel: isHero ? "INT" : "DEF",
    botLeftValue: (isHero ? card.intelligence : card.defense) || "",
    botRightLabel: isHero ? "LIFE" : "PWR",
    botRightValue: (isHero ? card.health : card.power) || "",
    rarityName,
    setId: printing?.set_id || "",
    cardId: printing?.id || "",
  };
}
