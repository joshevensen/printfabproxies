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

function buildGlossary(card: Card, matchedTerms: string[]) {
  const seen = new Set<string>();
  const out: { term: string; desc: string }[] = [];
  const candidates = matchedTerms.concat(card.card_keywords || []);
  candidates.forEach((term) => {
    const lookup = term.replace(/\s+\d+$/, "").trim().toLowerCase();
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

const ICON_BASE = "https://cdn.jsdelivr.net/gh/game-icons/icons@master/";
const TYPE_ICON_MAP: Record<string, string> = {
  hero: "cathelineau/swordman.svg",
  legs: "lorc/boots.svg",
  arms: "delapouite/gauntlet.svg",
  head: "lorc/barbute.svg",
  chest: "lorc/breastplate.svg",
  weapon: "lorc/battle-axe.svg",
  attackReaction: "andymeneely/riposte.svg",
  attack: "lorc/crossed-swords.svg",
  defenseReaction: "felbrigg/dodge.svg",
  block: "sbed/shield.svg",
  instant: "delapouite/sparkles.svg",
  token: "lorc/metal-disc.svg",
  item: "lorc/round-bottom-flask.svg",
  aura: "lorc/aura.svg",
  action: "lorc/punch.svg",
};

export function classifyIconKey(types: string[] | undefined): string | null {
  const t = types || [];
  const has = (name: string) => t.some((x) => x.toLowerCase() === name.toLowerCase());
  if (has("Hero")) return "hero";
  if (has("Legs")) return "legs";
  if (has("Arms")) return "arms";
  if (has("Head")) return "head";
  if (has("Chest")) return "chest";
  if (has("Weapon")) return "weapon";
  if (has("Attack Reaction")) return "attackReaction";
  if (has("Attack")) return "attack";
  if (has("Defense Reaction")) return "defenseReaction";
  if (has("Block")) return "block";
  if (has("Instant")) return "instant";
  if (has("Token")) return "token";
  if (has("Item")) return "item";
  if (has("Aura")) return "aura";
  if (has("Action")) return "action";
  return null;
}

export function watermarkIconUrl(types: string[] | undefined): string {
  const key = classifyIconKey(types);
  return key ? ICON_BASE + TYPE_ICON_MAP[key] : "";
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
    watermarkIconUrl: watermarkIconUrl(card.types),
    hasWatermarkIcon: !!classifyIconKey(card.types),
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
