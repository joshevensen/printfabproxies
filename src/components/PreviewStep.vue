<script setup lang="ts">
import { useBuilder } from "../composables/useBuilder";
import ProxyCard from "./ProxyCard.vue";

const { state, goToPrint, previewTotalQty, arenaRows, deckRows, otherRows } = useBuilder();
</script>

<template>
  <div class="fab-app-chrome fab-preview-wrap preview-step">
    <h1 class="preview-step__title">Preview &amp; Adjust</h1>
    <ul class="preview-step__rules">
      <li>Cards are sorted into Arena, Deck, and Other, matching how they're played.</li>
      <li>Use the − and + controls on each card to change how many copies you need.</li>
      <li>Use Remove to drop a card you don't want printed.</li>
      <li>Once the counts look right, use Build print sheet below to move on to paper size and print options.</li>
      <li>Quantity limits: 4 copies max for Deck cards, 2 for Weapons, 1 for Heroes and Equipment, and no limit for Other (tokens, etc).</li>
    </ul>

    <div class="preview-step__build-row">
      <div class="btn btn--primary" @click="goToPrint">Build print sheet ({{ previewTotalQty }} cards)</div>
    </div>

    <div v-if="!state.resolvedCards.length" class="preview-step__empty">No cards yet — go back to Decklist.</div>

    <template v-for="section in [
      { key: 'arena', label: 'Arena', rows: arenaRows },
      { key: 'deck', label: 'Deck', rows: deckRows },
      { key: 'other', label: 'Other', rows: otherRows },
    ]" :key="section.key">
      <div v-if="section.rows.length">
        <div class="preview-step__section-title">{{ section.label }}</div>
        <div class="preview-step__grid">
          <div v-for="row in section.rows" :key="row.id" class="preview-step__card-col">
            <div class="preview-step__card-stack" :style="{ marginTop: 3 * 12 + 'px' }">
              <div
                v-for="ghost in row.stackGhosts"
                :key="ghost.id"
                class="preview-step__ghost"
                :style="{ transform: `translate(-${ghost.offset}px,-${ghost.offset}px)`, zIndex: ghost.z }"
              ></div>
              <div class="preview-step__card-slot">
                <ProxyCard :card="row.cardProps" />
              </div>
            </div>
            <div class="preview-step__controls">
              <template v-if="row.showQtyControls">
                <div class="preview-step__qty-btn" @click="row.dec">−</div>
                <div class="preview-step__qty">{{ row.qty }}</div>
                <div
                  class="preview-step__qty-btn"
                  :style="{ opacity: row.incOpacity, pointerEvents: row.incPointerEvents }"
                  @click="row.inc"
                >
                  +
                </div>
              </template>
              <div v-else class="preview-step__qty preview-step__qty--fixed">×{{ row.qty }}</div>
              <div class="preview-step__remove" @click="row.remove">Remove</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="preview-step__build-row preview-step__build-row--bottom">
      <div class="btn btn--primary" @click="goToPrint">Build print sheet ({{ previewTotalQty }} cards)</div>
    </div>
  </div>
</template>

<style scoped>
.preview-step {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.preview-step__title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 30px;
  letter-spacing: -0.01em;
  text-align: center;
  color: var(--fab-heading);
}

.preview-step__rules {
  max-width: 760px;
  margin: 0 auto 16px;
  padding-left: 20px;
  font-size: 18px;
  line-height: 1.55;
  opacity: 0.7;
  text-align: left;
}

.preview-step__build-row {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
}

.preview-step__build-row--bottom {
  margin-top: 40px;
  margin-bottom: 0;
}

.btn {
  font-weight: 700;
  font-size: 13.5px;
  padding: 10px 18px;
  border-radius: 9px;
  cursor: pointer;
  white-space: nowrap;
}

.btn--primary {
  background: var(--fab-accent);
  color: white;
}

.preview-step__empty {
  font-size: 13.5px;
  opacity: 0.6;
  padding: 24px;
  text-align: center;
  border: 1px dashed var(--fab-border);
  border-radius: 10px;
}

.preview-step__section-title {
  font-size: 24px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.6;
  margin: 22px 0 10px;
}

.preview-step__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  column-gap: 18px;
  row-gap: 56px;
}

.preview-step__card-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-step__card-stack {
  aspect-ratio: 2.5 / 3.5;
  width: 100%;
  position: relative;
}

.preview-step__ghost {
  position: absolute;
  inset: 0;
  background: var(--fab-card-alt);
  border: 1.5px solid #1c1b19;
  border-radius: 3px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.18);
}

.preview-step__card-slot {
  position: absolute;
  inset: 0;
  z-index: 6;
}

.preview-step__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.preview-step__qty-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--fab-tab-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  cursor: pointer;
  font-size: 13px;
}

.preview-step__qty {
  min-width: 18px;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
}

.preview-step__qty--fixed {
  opacity: 0.6;
}

.preview-step__remove {
  font-size: 11px;
  font-weight: 700;
  padding: 5px 9px;
  border-radius: 7px;
  cursor: pointer;
  color: oklch(0.4 0.12 25);
  background: oklch(0.95 0.03 25);
}
</style>
