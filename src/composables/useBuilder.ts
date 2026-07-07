import { reactive, computed } from "vue";
import type { Card, ParsedRow, ResolvedCard, ProxyCardProps } from "../lib/types";
import { normalizeDb, buildIndex, parseDecklist } from "../lib/deckParser";
import { buildDisplayProps } from "../lib/cardDisplay";
import { classifyGroup, maxQtyFor } from "../lib/classify";

type Step = "deck" | "preview" | "print";
type PaperSize = "letter" | "a4" | "legal";

export interface PrintCard {
  id: string;
  props: ProxyCardProps;
  breakBefore: "auto" | "page";
}

const state = reactive({
  step: "deck" as Step,
  dbCards: null as Card[] | null,
  dbIndex: null as Map<string, Card[]> | null,
  decklistText: "",
  parsedRows: [] as ParsedRow[],
  hasChecked: false,
  resolvedCards: [] as ResolvedCard[],
  printCards: [] as PrintCard[],
  paperSize: "letter" as PaperSize,
  borderless: false,
  cutGuides: true,
});

let loadPromise: Promise<void> | null = null;
function ensureDbLoaded(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = fetch(`${import.meta.env.BASE_URL}cards.json`)
    .then((r) => r.json())
    .then((json) => {
      state.dbCards = normalizeDb(json);
      state.dbIndex = buildIndex(state.dbCards);
    })
    .catch(() => {});
  return loadPromise;
}

function parseDeck() {
  state.parsedRows = parseDecklist(state.decklistText, state.dbIndex);
  state.hasChecked = true;
}

function chooseMatch(rowIndex: number, matchIndex: number) {
  const row = state.parsedRows[rowIndex];
  state.parsedRows = state.parsedRows.map((r, i) =>
    i === rowIndex ? { ...row, chosenIndex: matchIndex, status: "ok" } : r
  );
}

function buildResolvedFromParsed() {
  state.resolvedCards = state.parsedRows
    .filter((r) => r.status === "ok" && r.chosenIndex !== null)
    .map((row, i) => {
      const card = row.matches[row.chosenIndex!];
      return {
        id: "r" + i + "-" + Date.now(),
        name: row.name,
        qty: row.qty,
        card,
        printing: card.printings[0] || null,
      };
    });
}

function goToDeck() {
  state.step = "deck";
}

function goToPreviewStep() {
  if (state.parsedRows.length) buildResolvedFromParsed();
  state.step = "preview";
}

function goToPrintStep() {
  state.step = state.printCards.length ? "print" : "preview";
}

function adjustQty(id: string, delta: number, maxQty?: number) {
  const cap = maxQty === undefined || maxQty === Infinity ? Infinity : maxQty;
  state.resolvedCards = state.resolvedCards.map((r) =>
    r.id === id ? { ...r, qty: Math.min(cap, Math.max(1, r.qty + delta)) } : r
  );
}

function removeResolved(id: string) {
  state.resolvedCards = state.resolvedCards.filter((r) => r.id !== id);
}

function goToPrint() {
  const printCards: PrintCard[] = [];
  let n = 0;
  state.resolvedCards.forEach((entry) => {
    const props = buildDisplayProps(entry.card, entry.printing);
    for (let i = 0; i < entry.qty; i++) {
      printCards.push({ id: entry.id + "-" + i, props, breakBefore: n > 0 && n % 9 === 0 ? "page" : "auto" });
      n++;
    }
  });
  state.printCards = printCards;
  state.step = "print";
}

function doPrint() {
  window.print();
}

function setPaperSize(size: PaperSize) {
  state.paperSize = size;
}

function toggleBorderless() {
  state.borderless = !state.borderless;
}

function toggleCutGuides() {
  state.cutGuides = !state.cutGuides;
}

export interface CardRowView {
  id: string;
  qty: number;
  cardProps: ProxyCardProps;
  stackGhosts: { id: number; offset: number; z: number }[];
  showQtyControls: boolean;
  incOpacity: number;
  incPointerEvents: "none" | "auto";
  inc: () => void;
  dec: () => void;
  remove: () => void;
}

function toRow(entry: ResolvedCard): CardRowView {
  const group = classifyGroup(entry.card);
  const maxQty = maxQtyFor(entry.card);
  const weapon = group === "arena" && maxQty === 2;
  const showQtyControls = group !== "arena" || weapon;
  const ghostCount = Math.min(entry.qty - 1, 3);
  const stackGhosts = Array.from({ length: ghostCount }, (_, i) => ({ id: i, offset: (i + 1) * 12, z: 5 - i }));
  return {
    id: entry.id,
    qty: entry.qty,
    cardProps: buildDisplayProps(entry.card, entry.printing),
    stackGhosts,
    showQtyControls,
    incOpacity: entry.qty >= maxQty ? 0.35 : 1,
    incPointerEvents: entry.qty >= maxQty ? "none" : "auto",
    inc: () => adjustQty(entry.id, 1, maxQty),
    dec: () => adjustQty(entry.id, -1),
    remove: () => removeResolved(entry.id),
  };
}

const totalQty = computed(() => state.parsedRows.reduce((s, r) => s + (r.status === "ok" ? r.qty : 0), 0));
const notFoundRows = computed(() => state.parsedRows.filter((r) => r.status !== "ok"));
const previewTotalQty = computed(() => state.resolvedCards.reduce((s, r) => s + r.qty, 0));
const arenaRows = computed(() =>
  state.resolvedCards.filter((e) => classifyGroup(e.card) === "arena").map(toRow)
);
const deckRows = computed(() =>
  state.resolvedCards.filter((e) => classifyGroup(e.card) === "deck").map(toRow)
);
const otherRows = computed(() =>
  state.resolvedCards.filter((e) => classifyGroup(e.card) === "other").map(toRow)
);
const pageCount = computed(() => Math.ceil(state.printCards.length / 9) || 0);
const pageSizeCss: Record<PaperSize, string> = { letter: "8.5in 11in", a4: "8.27in 11.69in", legal: "8.5in 14in" };
const printPageStyle = computed(
  () => `@page { size: ${pageSizeCss[state.paperSize]}; margin: ${state.borderless ? "0" : "0.35in"}; }`
);
const cutGuideOutline = computed(() => (state.cutGuides ? "1px dashed rgba(28,27,25,0.35)" : "none"));

export function useBuilder() {
  return {
    state,
    ensureDbLoaded,
    parseDeck,
    chooseMatch,
    goToDeck,
    goToPreviewStep,
    goToPrintStep,
    goToPrint,
    doPrint,
    setPaperSize,
    toggleBorderless,
    toggleCutGuides,
    adjustQty,
    removeResolved,
    totalQty,
    notFoundRows,
    previewTotalQty,
    arenaRows,
    deckRows,
    otherRows,
    pageCount,
    printPageStyle,
    cutGuideOutline,
  };
}
