import { reactive, computed, watch } from "vue";
import type { Card, ParsedRow, ResolvedCard, ProxyCardProps } from "../lib/types";
import { normalizeDb, buildIndex, parseDecklist, cleanDecklistText } from "../lib/deckParser";
import { buildDisplayProps, colorHex } from "../lib/cardDisplay";
import { GROUP_DEFS, classifyGroup, groupDefFor } from "../lib/classify";
import type { CardGroup } from "../lib/classify";
import { collectAutoTokens } from "../lib/tokens";
import { buildIdIndex, encodeCards, decodeCards, type IdIndex } from "../lib/shareLink";
import { usePrintSheet } from "./usePrintSheet";

const { buildPrintCards, pageCount } = usePrintSheet();

// Reverse lookup (printing id -> card) for share links, built once the DB loads.
let idIndex: IdIndex | null = null;
const SHARE_PARAM = "cards";

const state = reactive({
  dbCards: null as Card[] | null,
  dbIndex: null as Map<string, Card[]> | null,
  decklistText: "",
  parsedRows: [] as ParsedRow[],
  hasChecked: false,
  resolvedCards: [] as ResolvedCard[],
  modalOpen: false,
  settingsOpen: false,
  searchQuery: "",
  searchFocused: false,
});

// Keep the (hidden) print sheet and the shareable URL in sync with the live
// preview so Print always reflects the current cards and the address bar is
// always a link that reproduces this exact sheet.
watch(
  () => state.resolvedCards,
  (cards) => {
    buildPrintCards(cards);
    syncUrl(cards);
  },
  { immediate: true, deep: false }
);

// Mirror the preview into the `cards` query param. Guarded on idIndex so the
// initial (empty) tick before the DB loads can't wipe a shared param we haven't
// decoded yet.
function syncUrl(cards: ResolvedCard[]) {
  if (!idIndex || typeof window === "undefined") return;
  const value = encodeCards(cards, idIndex);
  const url = new URL(window.location.href);
  // Only touch the share param so any unrelated query params are preserved.
  if (value) url.searchParams.set(SHARE_PARAM, value);
  else url.searchParams.delete(SHARE_PARAM);
  window.history.replaceState(null, "", url.toString());
}

function loadFromUrl() {
  if (!idIndex || typeof window === "undefined") return;
  const value = new URL(window.location.href).searchParams.get(SHARE_PARAM);
  if (!value) return;
  const decoded = decodeCards(value, idIndex);
  if (decoded.length) state.resolvedCards = decoded;
}

let loadPromise: Promise<void> | null = null;
function ensureDbLoaded(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = fetch(`${import.meta.env.BASE_URL}cards.json`)
    .then((r) => r.json())
    .then((json) => {
      state.dbCards = normalizeDb(json);
      state.dbIndex = buildIndex(state.dbCards);
      idIndex = buildIdIndex(state.dbCards);
      loadFromUrl();
    })
    .catch(() => {});
  return loadPromise;
}

// ---- Decklist modal ----------------------------------------------------

function openModal() {
  state.modalOpen = true;
}
function closeModal() {
  state.modalOpen = false;
}

function parseDeck() {
  state.decklistText = cleanDecklistText(state.decklistText);
  const rows = parseDecklist(state.decklistText, state.dbIndex);
  state.parsedRows = rows;
  // If everything matched cleanly there's nothing to resolve, so skip the
  // extra confirm click and add straight to the preview.
  if (rows.length > 0 && rows.every((r) => r.status === "ok")) {
    confirmAndClose();
    return;
  }
  state.hasChecked = true;
}

function chooseMatch(rowIndex: number, matchIndex: number) {
  const row = state.parsedRows[rowIndex];
  state.parsedRows = state.parsedRows.map((r, i) =>
    i === rowIndex ? { ...row, chosenIndex: matchIndex, status: "ok" } : r
  );
}

function buildResolvedFromParsed() {
  const manual = state.parsedRows
    .filter((r) => r.status === "ok" && r.chosenIndex !== null)
    .map((row, i) => {
      const card = row.matches[row.chosenIndex!];
      return {
        id: "r" + i + "-" + Date.now(),
        name: row.name,
        // Clamp imported counts to the group cap: singleton groups (Hero,
        // Equipment) hide the steppers, so an over-limit import would
        // otherwise be stuck uneditable.
        qty: Math.min(groupDefFor(card).maxQty, Math.max(1, row.qty)),
        card,
        printing: card.printings[0] || null,
      };
    });
  state.resolvedCards = [...manual, ...collectAutoTokens(manual, state.dbIndex)];
}

function confirmAndClose() {
  buildResolvedFromParsed();
  // Reset the modal for next time now that these cards are in the preview.
  state.decklistText = "";
  state.parsedRows = [];
  state.hasChecked = false;
  state.modalOpen = false;
}

// ---- Preview quantity editing -----------------------------------------

function adjustQty(id: string, delta: number, maxQty?: number) {
  const cap = maxQty === undefined || maxQty === Infinity ? Infinity : maxQty;
  state.resolvedCards = state.resolvedCards.map((r) =>
    r.id === id ? { ...r, qty: Math.min(cap, Math.max(1, r.qty + delta)) } : r
  );
}

function removeResolved(id: string) {
  state.resolvedCards = state.resolvedCards.filter((r) => r.id !== id);
}

// ---- Card search (add one at a time) ----------------------------------

function handleSearchChange(e: Event) {
  state.searchQuery = (e.target as HTMLInputElement).value;
}

function addCardFromSearch(card: Card) {
  const cap = groupDefFor(card).maxQty;
  const existing = state.resolvedCards.find(
    (r) => r.card.name === card.name && (r.card.pitch || "") === (card.pitch || "")
  );
  if (existing) {
    state.resolvedCards = state.resolvedCards.map((r) =>
      r.id === existing.id ? { ...r, qty: Math.min(cap, r.qty + 1) } : r
    );
  } else {
    state.resolvedCards = [
      ...state.resolvedCards,
      {
        id: "search-" + card.name + "-" + (card.pitch || "") + "-" + Date.now(),
        name: card.name,
        qty: 1,
        card,
        printing: card.printings[0] || null,
      },
    ];
  }
  state.searchQuery = "";
  state.searchFocused = false;
}

// ---- View models -------------------------------------------------------

export interface CardRowView {
  id: string;
  qty: number;
  cardProps: ProxyCardProps;
  stackGhosts: { id: number; offset: number; z: number }[];
  stackExtra: number;
  showQtyControls: boolean;
  incDisabled: boolean;
  decDisabled: boolean;
  inc: () => void;
  dec: () => void;
  remove: () => void;
}

export interface CardGroupView {
  key: CardGroup;
  label: string;
  count: number;
  rows: CardRowView[];
}

export interface NotFoundOptionView {
  label: string;
  borderColor: string;
  color: string;
  onSelect: () => void;
}

export interface NotFoundRowView {
  qty: number;
  name: string;
  statusText: string;
  statusBg: string;
  statusColor: string;
  showOptions: boolean;
  options: NotFoundOptionView[];
}

export interface SearchResultView {
  id: string;
  name: string;
  sub: string;
  onAdd: () => void;
}

const GHOST_STEP = 9;
const CONTROLS_GUTTER = 40;

function toRow(entry: ResolvedCard): CardRowView {
  const def = groupDefFor(entry.card);
  const maxQty = def.maxQty;
  const ghostCount = Math.min(entry.qty - 1, 3);
  const stackGhosts = Array.from({ length: ghostCount }, (_, i) => ({
    id: i,
    offset: (i + 1) * GHOST_STEP,
    z: 5 - i,
  }));
  return {
    id: entry.id,
    qty: entry.qty,
    cardProps: buildDisplayProps(entry.card, entry.printing),
    stackGhosts,
    stackExtra: 3 * GHOST_STEP + CONTROLS_GUTTER,
    showQtyControls: def.showQtyControls,
    incDisabled: entry.qty >= maxQty,
    decDisabled: entry.qty <= 1,
    inc: () => adjustQty(entry.id, 1, maxQty),
    dec: () => adjustQty(entry.id, -1),
    remove: () => removeResolved(entry.id),
  };
}

// Mirrors the per-group clamping in buildResolvedFromParsed so the modal's
// "Add N cards" count matches what actually lands in the preview.
const totalQty = computed(() =>
  state.parsedRows.reduce((s, r) => {
    if (r.status !== "ok" || r.chosenIndex === null) return s;
    const card = r.matches[r.chosenIndex];
    return s + Math.min(groupDefFor(card).maxQty, Math.max(1, r.qty));
  }, 0)
);

const notFoundRows = computed<NotFoundRowView[]>(() =>
  state.parsedRows
    .map((row, ri) => {
      let statusText: string, statusBg: string, statusColor: string;
      if (row.status === "ok") {
        statusText = "Matched";
        statusBg = "oklch(0.93 0.03 155)";
        statusColor = "oklch(0.35 0.08 155)";
      } else if (row.status === "ambiguous") {
        statusText = "Pick pitch";
        statusBg = "oklch(0.93 0.05 85)";
        statusColor = "oklch(0.4 0.1 70)";
      } else {
        statusText = "Not found";
        statusBg = "oklch(0.93 0.05 25)";
        statusColor = "oklch(0.4 0.12 25)";
      }
      const options: NotFoundOptionView[] =
        row.status === "ambiguous"
          ? row.matches.map((m, mi) => ({
              label: (m.color || "Pitch") + (m.pitch ? " " + m.pitch : ""),
              borderColor: colorHex(m.color),
              color: colorHex(m.color),
              onSelect: () => chooseMatch(ri, mi),
            }))
          : [];
      return {
        qty: row.qty,
        name: row.name,
        statusText,
        statusBg,
        statusColor,
        showOptions: row.status === "ambiguous",
        options,
      };
    })
    .filter((r) => r.statusText !== "Matched")
);

const previewTotalQty = computed(() => state.resolvedCards.reduce((s, r) => s + r.qty, 0));
const hasResolvedCards = computed(() => state.resolvedCards.length > 0);

const cardGroups = computed<CardGroupView[]>(() =>
  GROUP_DEFS.map((def) => {
    const rows = state.resolvedCards
      .filter((e) => classifyGroup(e.card) === def.key)
      .map(toRow);
    return {
      key: def.key,
      label: def.label,
      rows,
      count: rows.reduce((s, r) => s + r.qty, 0),
    };
  }).filter((g) => g.rows.length > 0)
);

const searchResults = computed<SearchResultView[]>(() => {
  const query = state.searchQuery.trim().toLowerCase();
  if (query.length < 1 || !state.dbCards) return [];
  return state.dbCards
    .filter((c) => c.name.toLowerCase().includes(query))
    .slice(0, 8)
    .map((c, i) => ({
      id: c.name + "-" + (c.pitch || "") + "-" + i,
      name: c.name,
      sub: [c.color, c.pitch].filter(Boolean).join(" · ") || c.type_text,
      onAdd: () => addCardFromSearch(c),
    }));
});

const showSearchDropdown = computed(
  () => state.searchFocused && state.searchQuery.trim().length >= 1 && searchResults.value.length > 0
);
const showSearchEmpty = computed(
  () => state.searchFocused && state.searchQuery.trim().length >= 1 && searchResults.value.length === 0
);

export function useBuilder() {
  return {
    state,
    ensureDbLoaded,
    openModal,
    closeModal,
    confirmAndClose,
    parseDeck,
    chooseMatch,
    adjustQty,
    removeResolved,
    handleSearchChange,
    totalQty,
    notFoundRows,
    previewTotalQty,
    hasResolvedCards,
    cardGroups,
    searchResults,
    showSearchDropdown,
    showSearchEmpty,
    pageCount,
  };
}
