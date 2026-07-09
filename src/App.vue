<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import Wordmark from "./components/Wordmark.vue";
import SearchBox from "./components/SearchBox.vue";
import CardPreview from "./components/CardPreview.vue";
import DecklistModal from "./components/DecklistModal.vue";
import PreconPicker from "./components/PreconPicker.vue";
import PrintSheet from "./components/PrintSheet.vue";
import { useBuilder } from "./composables/useBuilder";
import { usePrintSheet } from "./composables/usePrintSheet";

const {
  state,
  ensureDbLoaded,
  openModal,
  clearAll,
  previewTotalQty,
  pageCount,
  hasResolvedCards,
  togglePreconMenu,
  closePreconMenu,
} = useBuilder();
const { printState, doPrint, setPaperSize, toggleBorderless, toggleCutGuides } = usePrintSheet();

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") state.settingsOpen = false;
}

onMounted(() => {
  ensureDbLoaded();
  window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

function toggleSettings() {
  state.settingsOpen = !state.settingsOpen;
}
function closeSettings() {
  state.settingsOpen = false;
}
</script>

<template>
  <div class="app fab-app-chrome" :inert="state.modalOpen">
    <!-- LEFT COLUMN -->
    <aside class="app__sidebar">
      <div class="app__wordmark">
        <Wordmark />
      </div>

      <div>
        <div class="app__side-title">How it works</div>
        <ul class="app__side-list">
          <li>Tokens created by your cards are added automatically — no need to list them.</li>
          <li>
            Copy limits per section: 4 for deck cards (Attacks, Reactions, Instants, Actions, Items,
            Auras, Blocks), 2 for Weapons, 1 for Hero and Equipment, and no limit on Other.
          </li>
        </ul>
      </div>

      <div>
        <div class="app__side-title">Printing</div>
        <ul class="app__side-list">
          <li>Pick a paper size in the print settings that matches what's loaded in your printer.</li>
          <li>Cut guides add a dashed outline around each card so you can trim it accurately.</li>
          <li>Borderless removes the page margin — cards stay true size and centered.</li>
          <li>For best results, print at 100% scale (not "fit to page") so cards come out at true size.</li>
        </ul>
      </div>

      <div class="app__disclosures">
        <div class="app__disclosures-title">DISCLOSURES</div>
        <div class="app__disclosures-text">
          Print Fab Proxies is in no way affiliated with Legend Story Studios. Legend Story
          Studios&reg;, Flesh and Blood&trade;, and set names are trademarks of Legend Story Studios.
          Flesh and Blood characters, cards, logos, and art are property of Legend Story Studios.
        </div>
      </div>
    </aside>

    <!-- HEADER -->
    <header class="app__header">
      <div class="app__header-heading">
        <div class="app__header-title">Card Preview</div>
        <div class="app__header-sub">{{ previewTotalQty }} cards · {{ pageCount }} page(s)</div>
      </div>

      <div class="app__header-actions">
        <SearchBox />

        <button type="button" class="btn btn--outline" @click="openModal">Add Decklist</button>

        <div class="app__precon">
          <button
            type="button"
            class="btn btn--outline"
            :aria-expanded="state.preconMenuOpen"
            @click="togglePreconMenu"
          >
            Load Precon
          </button>
          <PreconPicker v-if="state.preconMenuOpen" />
        </div>

        <button
          type="button"
          class="btn btn--outline"
          :disabled="!hasResolvedCards"
          title="Remove all cards from the preview"
          @click="clearAll"
        >
          Clear
        </button>

        <div class="app__print">
          <div class="app__print-split">
            <button type="button" class="app__print-btn" @click="doPrint">Print</button>
            <button
              type="button"
              class="app__print-gear"
              aria-label="Print settings"
              :aria-expanded="state.settingsOpen"
              @click="toggleSettings"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
                  stroke="white"
                  stroke-width="1.8"
                ></path>
                <path
                  d="M19.4 13.5c.04-.33.06-.66.06-1s-.02-.67-.06-1l2.02-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.5 7.5 0 0 0-1.73-1l-.36-2.54a.5.5 0 0 0-.5-.43h-3.84a.5.5 0 0 0-.5.43l-.36 2.54c-.63.24-1.21.58-1.73 1l-2.39-.96a.5.5 0 0 0-.6.22L2.66 9.28a.5.5 0 0 0 .12.64L4.8 11.5c-.04.33-.06.66-.06 1s.02.67.06 1L2.78 15.08a.5.5 0 0 0-.12.64l1.92 3.32c.13.23.4.32.6.22l2.39-.96c.52.42 1.1.76 1.73 1l.36 2.54c.05.25.26.43.5.43h3.84c.24 0 .45-.18.5-.43l.36-2.54c.63-.24 1.21-.58 1.73-1l2.39.96c.2.1.47.01.6-.22l1.92-3.32a.5.5 0 0 0-.12-.64L19.4 13.5Z"
                  stroke="white"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>
          </div>

          <div v-if="state.settingsOpen" class="app__settings" @click.stop>
            <div>
              <div class="app__settings-label" id="paper-size-label">Paper size</div>
              <div class="app__segmented" role="group" aria-labelledby="paper-size-label">
                <button
                  v-for="size in ['letter', 'a4', 'legal'] as const"
                  :key="size"
                  type="button"
                  class="app__segment"
                  :aria-pressed="printState.paperSize === size"
                  :style="{
                    background: printState.paperSize === size ? '#B5451E' : 'transparent',
                    color: printState.paperSize === size ? '#f7f4ec' : 'inherit',
                  }"
                  @click="setPaperSize(size)"
                >
                  {{ size === "letter" ? "Letter" : size === "a4" ? "A4" : "Legal" }}
                </button>
              </div>
            </div>

            <button
              type="button"
              class="app__toggle"
              role="switch"
              :aria-checked="printState.borderless"
              @click="toggleBorderless"
            >
              <div>
                <div class="app__toggle-label">Borderless</div>
                <div class="app__toggle-desc">No page margin</div>
              </div>
              <div
                class="app__switch"
                :style="{ background: printState.borderless ? '#B5451E' : 'oklch(0.85 0.01 80)' }"
              >
                <div class="app__switch-knob" :style="{ left: printState.borderless ? '18px' : '3px' }"></div>
              </div>
            </button>

            <button
              type="button"
              class="app__toggle"
              role="switch"
              :aria-checked="printState.cutGuides"
              @click="toggleCutGuides"
            >
              <div>
                <div class="app__toggle-label">Cut guides</div>
                <div class="app__toggle-desc">Dashed outline per card</div>
              </div>
              <div
                class="app__switch"
                :style="{ background: printState.cutGuides ? '#B5451E' : 'oklch(0.85 0.01 80)' }"
              >
                <div class="app__switch-knob" :style="{ left: printState.cutGuides ? '18px' : '3px' }"></div>
              </div>
            </button>
          </div>
        </div>

        <a
          class="app__icon-link"
          href="https://github.com/joshevensen/printfabproxies"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          title="View source on GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.41-5.28 5.69.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.2.67.8.56A10.52 10.52 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z"
            ></path>
          </svg>
        </a>
      </div>
    </header>

    <!-- CONTENT -->
    <CardPreview />

    <!-- SETTINGS BACKDROP -->
    <div v-if="state.settingsOpen" class="app__settings-backdrop" @click="closeSettings"></div>
    <div v-if="state.preconMenuOpen" class="app__settings-backdrop" @click="closePreconMenu"></div>
  </div>

  <DecklistModal v-if="state.modalOpen" />

  <PrintSheet />
</template>

<style scoped>
.app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 68px 1fr;
  grid-template-areas:
    "left header"
    "left content";
  background: var(--fab-bg);
}

.app__sidebar {
  grid-area: left;
  overflow-y: auto;
  border-right: 1px solid var(--fab-border-light);
  padding: 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.app__wordmark {
  display: inline-flex;
  align-self: flex-start;
  transform: scale(0.883);
  transform-origin: left top;
  margin-bottom: -8px;
}

.app__side-title {
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.5;
  margin-bottom: 10px;
}

.app__side-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.55;
  opacity: 0.75;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app__disclosures {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--fab-border-light);
}

.app__disclosures-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.07em;
  opacity: 0.45;
  margin-bottom: 6px;
}

.app__disclosures-text {
  font-size: 11px;
  line-height: 1.5;
  opacity: 0.6;
}

.app__header {
  grid-area: header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 24px;
  border-bottom: 1px solid var(--fab-border-light);
  background: var(--fab-bg);
}

.app__header-heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app__header-title {
  font-size: 15px;
  font-weight: 800;
}

.app__header-sub {
  font-size: 12px;
  opacity: 0.55;
  font-weight: 600;
}

.app__header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  font-weight: 700;
  font-size: 13px;
  border-radius: 9px;
  cursor: pointer;
  white-space: nowrap;
}

.btn--outline {
  background: white;
  border: 1.5px solid var(--fab-border);
  color: oklch(0.3 0.01 80);
  padding: 9px 16px;
}

.btn--outline:disabled {
  opacity: 0.5;
}

.app__precon {
  position: relative;
  display: flex;
}

.app__print {
  position: relative;
  display: flex;
}

.app__print-split {
  display: flex;
  border-radius: 9px;
  overflow: hidden;
}

.app__print-btn {
  background: var(--fab-accent);
  color: white;
  font-weight: 700;
  font-size: 13px;
  padding: 9px 16px;
  cursor: pointer;
  white-space: nowrap;
}

.app__print-gear {
  background: #963a19;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 10px;
  cursor: pointer;
  border-left: 1px solid rgba(255, 255, 255, 0.25);
}

.app__settings {
  position: absolute;
  top: 44px;
  right: 0;
  width: 240px;
  background: white;
  border: 1px solid oklch(0.86 0.01 80);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 50;
}

.app__settings-label {
  font-size: 11.5px;
  font-weight: 700;
  opacity: 0.6;
  margin-bottom: 8px;
}

.app__segmented {
  display: flex;
  gap: 6px;
  background: var(--fab-tab-bg);
  padding: 4px;
  border-radius: 9px;
}

.app__segment {
  flex: 1;
  text-align: center;
  padding: 7px;
  border-radius: 7px;
  font-weight: 600;
  font-size: 12.5px;
  cursor: pointer;
}

.app__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.app__toggle-label {
  font-size: 12.5px;
  font-weight: 700;
}

.app__toggle-desc {
  font-size: 11px;
  opacity: 0.6;
}

.app__switch {
  width: 36px;
  height: 21px;
  border-radius: 100px;
  position: relative;
  flex-shrink: 0;
}

.app__switch-knob {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 3px;
  transition: left 0.15s;
}

.app__icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  color: oklch(0.3 0.01 80);
  flex-shrink: 0;
}

.app__icon-link:hover {
  background: var(--fab-tab-bg);
}

.app__icon-link:focus-visible {
  outline: 2px solid var(--fab-accent);
  outline-offset: 2px;
}

.app__settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
}

@media (max-width: 720px) {
  .app {
    height: auto;
    min-height: 100vh;
    overflow: visible;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
    grid-template-areas:
      "header"
      "left"
      "content";
  }

  .app__sidebar {
    border-right: none;
    border-bottom: 1px solid var(--fab-border-light);
  }

  .app__header {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 16px;
    height: auto;
  }
}
</style>
