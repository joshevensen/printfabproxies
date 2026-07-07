<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import { useBuilder } from "../composables/useBuilder";

const { state, parseDeck, confirmAndClose, closeModal, totalQty, notFoundRows } = useBuilder();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

function handleDecklistChange(e: Event) {
  state.decklistText = (e.target as HTMLTextAreaElement).value;
  state.hasChecked = false;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeModal();
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  textareaRef.value?.focus();
});
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="modal-backdrop fab-app-chrome" @click="closeModal">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Paste your FaB decklist" @click.stop>
      <div class="modal__header">
        <div class="modal__title">Paste Your FaB Decklist</div>
        <button type="button" class="modal__close" aria-label="Close" @click="closeModal">✕</button>
      </div>

      <div class="modal__body">
        <ul class="modal__rules">
          <li>One card per line, formatted as <code>"qty Name"</code> i.e. <code>1 Fyendal's Spring Tunic</code>.</li>
          <li>
            If a card has multiple pitch versions, add the color or pitch number in parentheses,
            e.g. <code>3 Sink Below (blue)</code>.
          </li>
          <li>
            Importing from
            <a href="https://fabrary.net/" target="_blank" rel="noopener">FaBrary</a>? Use "Copy card
            list to clipboard" and paste — we'll clean it up automatically.
          </li>
          <li>We'll flag anything we can't find so you can pick the right printing before continuing.</li>
        </ul>

        <textarea
          ref="textareaRef"
          class="modal__textarea"
          :value="state.decklistText"
          placeholder="1 Fyendal's Spring Tunic..."
          spellcheck="false"
          @input="handleDecklistChange"
        ></textarea>

        <template v-if="state.parsedRows.length && notFoundRows.length">
          <div class="modal__attention">
            <div class="modal__attention-title">Needs attention</div>
            <div class="modal__attention-count">{{ notFoundRows.length }} card(s) below will be skipped.</div>
          </div>
          <div class="modal__notfound-list">
            <div v-for="(row, ri) in notFoundRows" :key="row.name + ri" class="modal__row">
              <div class="modal__row-top">
                <div class="modal__row-name">{{ row.qty }}× {{ row.name }}</div>
                <div
                  class="modal__row-status"
                  :style="{ background: row.statusBg, color: row.statusColor }"
                >
                  {{ row.statusText }}
                </div>
              </div>
              <div v-if="row.showOptions" class="modal__options">
                <button
                  v-for="(opt, oi) in row.options"
                  :key="oi"
                  type="button"
                  class="modal__option"
                  :style="{ borderColor: opt.borderColor, color: opt.color }"
                  @click="opt.onSelect"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="modal__footer">
        <template v-if="!state.hasChecked">
          <button type="button" class="btn btn--primary" @click="parseDeck">Check Decklist</button>
        </template>
        <template v-else>
          <button type="button" class="btn btn--outline" @click="parseDeck">Recheck</button>
          <button
            type="button"
            class="btn btn--primary"
            :style="{
              background: state.parsedRows.length ? '#B5451E' : 'oklch(0.8 0.01 80)',
              visibility: state.parsedRows.length ? 'visible' : 'hidden',
            }"
            @click="confirmAndClose"
          >
            Add {{ totalQty }} cards
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(28, 27, 25, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal {
  background: var(--fab-bg);
  border-radius: 16px;
  width: 640px;
  max-width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--fab-border-light);
  flex-shrink: 0;
}

.modal__title {
  font-size: 18px;
  font-weight: 800;
}

.modal__close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  opacity: 0.5;
}

.modal__body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.modal__rules {
  margin: 0 0 16px;
  padding-left: 20px;
  font-size: 13.5px;
  line-height: 1.55;
  opacity: 0.7;
  flex-shrink: 0;
}

.modal__textarea {
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  min-height: 160px;
  border: 1px solid var(--fab-border);
  border-radius: 10px;
  padding: 14px;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  background: white;
}

.modal__attention {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 20px 0 10px;
}

.modal__attention-title {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.6;
}

.modal__attention-count {
  font-size: 12px;
  opacity: 0.6;
}

.modal__notfound-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal__row {
  background: white;
  border: 1px solid var(--fab-border-light);
  border-radius: 10px;
  padding: 12px 14px;
}

.modal__row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.modal__row-name {
  font-weight: 700;
  font-size: 13px;
}

.modal__row-status {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 100px;
}

.modal__options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 9px;
}

.modal__option {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  background: white;
}

.modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--fab-border-light);
  flex-shrink: 0;
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

.btn--outline {
  background: white;
  border: 1.5px solid var(--fab-accent);
  color: var(--fab-accent);
}
</style>
