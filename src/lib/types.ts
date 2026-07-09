export interface Printing {
  id: string;
  set_id: string;
  rarity: string;
}

export interface Card {
  name: string;
  color: string;
  pitch: string;
  cost: string;
  power: string;
  defense: string;
  health: string;
  intelligence: string;
  types: string[];
  type_text: string;
  functional_text: string;
  card_keywords: string[];
  printings: Printing[];
}

export type RowStatus = "ok" | "ambiguous" | "notfound";

export interface ParsedRow {
  qty: number;
  name: string;
  matches: Card[];
  chosenIndex: number | null;
  status: RowStatus;
}

export interface ResolvedCard {
  id: string;
  name: string;
  qty: number;
  card: Card;
  printing: Printing | null;
}

export interface Precon {
  id: string;
  category: string;
  label: string;
  decklistText: string;
}

export interface GlossaryEntry {
  term: string;
  desc: string;
}

export interface ProxyCardProps {
  name: string;
  pipColorHex: string;
  pipText: string;
  costText: string;
  classText: string;
  restTypeText: string;
  dividerBorder: string;
  watermarkIconUrl: string;
  hasWatermarkIcon: boolean;
  functionalHtml: string;
  hasGlossary: boolean;
  glossary: GlossaryEntry[];
  botLeftLabel: string;
  botLeftValue: string;
  botRightLabel: string;
  botRightValue: string;
  rarityName: string;
  setId: string;
  cardId: string;
}
