<script setup lang="ts">
import { useBuilder } from "../composables/useBuilder";
import { usePrintSheet } from "../composables/usePrintSheet";
import ProxyCard from "./ProxyCard.vue";

const { cardGroups, hasResolvedCards, openModal } = useBuilder();
const { printState } = usePrintSheet();
</script>

<template>
  <div class="preview">
    <div v-if="!hasResolvedCards" class="preview__empty">
      <div class="preview__empty-title">No cards yet</div>
      <div class="preview__empty-text">
        Open Decklist above, paste your list, and check it to see your proxies here — or use
        the search box to add cards one at a time.
      </div>
      <button type="button" class="btn btn--primary preview__empty-btn" @click="openModal">
        Add Decklist
      </button>
    </div>

    <template v-for="grp in cardGroups" :key="grp.key">
      <div class="preview__section-head">
        <div class="preview__section-title">{{ grp.label }}</div>
        <div class="preview__section-count">{{ grp.count }}</div>
      </div>
      <div class="preview__grid">
        <div v-for="row in grp.rows" :key="row.id" class="preview__card-col">
          <div class="preview__card-stack" :style="{ marginBottom: row.stackExtra + 'px' }">
            <div
              v-for="ghost in row.stackGhosts"
              :key="ghost.id"
              class="preview__ghost"
              :style="{ transform: `translate(0,${ghost.offset}px)`, zIndex: ghost.z }"
            ></div>
            <div class="preview__card-slot">
              <ProxyCard :card="row.cardProps" :show-glossary="printState.showKeywordDefinitions" />
            </div>
            <div class="preview__controls-wrap">
              <div class="preview__controls">
                <template v-if="row.showQtyControls">
                  <button
                    type="button"
                    class="preview__qty-btn"
                    :disabled="row.decDisabled"
                    aria-label="Decrease quantity"
                    @click="row.dec"
                  >
                    −
                  </button>
                  <div class="preview__qty">{{ row.qty }}</div>
                  <button
                    type="button"
                    class="preview__qty-btn"
                    :disabled="row.incDisabled"
                    aria-label="Increase quantity"
                    @click="row.inc"
                  >
                    +
                  </button>
                </template>
                <div v-else class="preview__qty preview__qty--fixed">×{{ row.qty }}</div>
                <button type="button" class="preview__remove" @click="row.remove">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.preview {
  grid-area: content;
  overflow-y: auto;
  padding: 28px 28px 60px 36px;
}

.preview__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 24px;
  text-align: center;
  color: oklch(0.4 0.01 80);
}

.preview__empty-title {
  font-size: 16px;
  font-weight: 700;
}

.preview__empty-text {
  font-size: 13.5px;
  opacity: 0.7;
  max-width: 340px;
  line-height: 1.5;
}

.preview__empty-btn {
  margin-top: 6px;
}

.preview__section-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 14px;
}

.preview__section-title {
  font-size: 20px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.6;
}

.preview__section-count {
  font-size: 20px;
  font-weight: 700;
  opacity: 0.4;
}

.preview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  column-gap: 18px;
  row-gap: 56px;
  margin-bottom: 46px;
}

.preview__card-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview__card-stack {
  aspect-ratio: 2.5 / 3.5;
  width: 100%;
  position: relative;
}

.preview__ghost {
  position: absolute;
  inset: 0;
  background: #f7f4ec;
  border: 1.5px solid #1c1b19;
  border-radius: 3px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.18);
}

.preview__card-slot {
  position: absolute;
  inset: 0;
  z-index: 6;
}

.preview__controls-wrap {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 8;
}

.preview__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 9px;
  background: var(--fab-bg);
}

.preview__qty-btn {
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

.preview__qty-btn:disabled {
  opacity: 0.35;
}

.preview__qty {
  min-width: 18px;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
}

.preview__qty--fixed {
  opacity: 0.6;
}

.preview__remove {
  font-size: 11px;
  font-weight: 700;
  padding: 5px 9px;
  border-radius: 7px;
  cursor: pointer;
  color: oklch(0.4 0.12 25);
  background: oklch(0.95 0.03 25);
}

.btn {
  font-weight: 700;
  font-size: 13.5px;
  padding: 10px 18px;
  border-radius: 9px;
  cursor: pointer;
}

.btn--primary {
  background: var(--fab-accent);
  color: white;
}
</style>
