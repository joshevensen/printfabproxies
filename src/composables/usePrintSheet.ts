import { reactive, computed } from "vue";
import type { ResolvedCard, ProxyCardProps } from "../lib/types";
import { buildDisplayProps } from "../lib/cardDisplay";

export interface PrintCard {
  id: string;
  props: ProxyCardProps;
}

type PaperSize = "letter" | "a4" | "legal";

const PAGE_DIMENSIONS_IN: Record<PaperSize, { width: number; height: number }> = {
  letter: { width: 8.5, height: 11 },
  a4: { width: 8.27, height: 11.69 },
  legal: { width: 8.5, height: 14 },
};
const SHEET_COLS = 3;
const SHEET_ROWS = 3;
const CARDS_PER_PAGE = SHEET_COLS * SHEET_ROWS;
const CARD_WIDTH_IN = 2.5;
const CARD_HEIGHT_IN = 3.5;
const BORDERED_MARGIN_IN = 0.5;

const printState = reactive({
  printCards: [] as PrintCard[],
  paperSize: "letter" as PaperSize,
  borderless: false,
  cutGuides: true,
  showKeywordDefinitions: true,
});

function buildPrintCards(resolvedCards: ResolvedCard[]) {
  const printCards: PrintCard[] = [];
  resolvedCards.forEach((entry) => {
    const props = buildDisplayProps(entry.card, entry.printing);
    for (let i = 0; i < entry.qty; i++) {
      printCards.push({ id: entry.id + "-" + i, props });
    }
  });
  printState.printCards = printCards;
}

function doPrint() {
  window.print();
}

function setPaperSize(size: PaperSize) {
  printState.paperSize = size;
}

function toggleBorderless() {
  printState.borderless = !printState.borderless;
}

function toggleCutGuides() {
  printState.cutGuides = !printState.cutGuides;
}

function toggleKeywordDefinitions() {
  printState.showKeywordDefinitions = !printState.showKeywordDefinitions;
}

const pageCount = computed(() => Math.ceil(printState.printCards.length / CARDS_PER_PAGE) || 0);

// Grouped into one array per physical page so each page gets its own
// centered box — a shared flex container spanning every page can only
// center leftover space on the very first page.
const printPages = computed(() => {
  const pages: PrintCard[][] = [];
  for (let i = 0; i < printState.printCards.length; i += CARDS_PER_PAGE) {
    pages.push(printState.printCards.slice(i, i + CARDS_PER_PAGE));
  }
  return pages;
});

const inches = (value: number) => `${value}in`;

const printMarginIn = computed(() => (printState.borderless ? 0 : BORDERED_MARGIN_IN));

// Cards render at their true 2.5x3.5in size unless the page (minus margin)
// is too small to fit a 3x3 grid of them, in which case both dimensions
// shrink together so the card ratio never distorts.
const printCardSize = computed(() => {
  const page = PAGE_DIMENSIONS_IN[printState.paperSize];
  const margin = printMarginIn.value;
  const availWidth = page.width - margin * 2;
  const availHeight = page.height - margin * 2;
  const scale = Math.min(1, availWidth / (SHEET_COLS * CARD_WIDTH_IN), availHeight / (SHEET_ROWS * CARD_HEIGHT_IN));
  return { width: CARD_WIDTH_IN * scale, height: CARD_HEIGHT_IN * scale };
});

// Always reserves the full 3x3 area (grid-template-rows, not grid-auto-rows)
// so a partial last page takes up exactly the same space as a full one —
// the populated cells land in the same spot instead of a smaller cluster
// getting centered differently page to page.
const printGridStyle = computed(() => {
  const { width, height } = printCardSize.value;
  return {
    gridTemplateColumns: `repeat(${SHEET_COLS}, ${inches(width)})`,
    gridTemplateRows: `repeat(${SHEET_ROWS}, ${inches(height)})`,
  };
});

const printPageStyle = computed(() => {
  const page = PAGE_DIMENSIONS_IN[printState.paperSize];
  return `@page { size: ${inches(page.width)} ${inches(page.height)}; margin: ${inches(printMarginIn.value)}; }`;
});

// The browser's own @page margin already insets the printable area, so the
// sheet only needs to fill and center within whatever's left of the page.
const printSheetHeight = computed(() =>
  inches(PAGE_DIMENSIONS_IN[printState.paperSize].height - printMarginIn.value * 2)
);

const cutGuideOutline = computed(() => (printState.cutGuides ? "1px dashed rgba(43,108,196,0.55)" : "none"));

export function usePrintSheet() {
  return {
    printState,
    buildPrintCards,
    doPrint,
    setPaperSize,
    toggleBorderless,
    toggleCutGuides,
    toggleKeywordDefinitions,
    pageCount,
    printPages,
    printPageStyle,
    printGridStyle,
    printSheetHeight,
    cutGuideOutline,
  };
}
