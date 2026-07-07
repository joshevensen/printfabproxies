<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import { useBuilder } from "../composables/useBuilder";
import { colorHex } from "../lib/cardDisplay";

const { state, parseDeck, chooseMatch, goToPreviewStep, totalQty, notFoundRows } = useBuilder();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

function resizeTextarea() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

function handleDecklistChange(e: Event) {
  state.decklistText = (e.target as HTMLTextAreaElement).value;
  nextTick(resizeTextarea);
}

onMounted(() => {
  requestAnimationFrame(resizeTextarea);
});
</script>

<template>
  <div class="fab-app-chrome deck-step">
    <h1 class="deck-step__title">Paste Your FaB Decklist</h1>
    <ul class="deck-step__rules">
      <li>This proxy service only supports Flesh &amp; Blood cards.</li>
      <li>
        One card per line, formatted as
        <code>"qty Name" i.e. 1&nbsp;Fyendal's Spring Tunic</code>.
      </li>
      <li>
        If a card has multiple pitch versions, add the color or pitch number in
        parentheses, e.g. <code>3 Sink Below (blue)</code>.
      </li>
      <li>
        We'll match each line to a card in the database and flag anything we can't
        find so you can pick the right printing before continuing.
      </li>
    </ul>

    <textarea
      ref="textareaRef"
      :value="state.decklistText"
      spellcheck="false"
      class="deck-step__textarea"
      @input="handleDecklistChange"
    ></textarea>

    <div v-if="!state.hasChecked" class="deck-step__actions">
      <div class="btn btn--primary" @click="parseDeck">Check Decklist</div>
    </div>
    <div v-else class="deck-step__actions">
      <div class="btn btn--outline" @click="parseDeck">Recheck</div>
      <div
        class="btn btn--primary"
        :style="{
          background: state.parsedRows.length ? '#B5451E' : 'oklch(0.8 0.01 80)',
          visibility: state.parsedRows.length ? 'visible' : 'hidden',
        }"
        @click="goToPreviewStep"
      >
        Continue ({{ totalQty }} cards)
      </div>
    </div>

    <template v-if="state.parsedRows.length">
      <div v-if="notFoundRows.length" class="deck-step__not-found">
        <div class="deck-step__not-found-header">
          <div class="deck-step__not-found-title">Not found</div>
          <div class="deck-step__not-found-count">
            {{ notFoundRows.length }} card(s) below will be skipped.
          </div>
        </div>
        <div class="deck-step__not-found-list">
          <div v-for="(row, ri) in notFoundRows" :key="row.name + ri" class="deck-step__row">
            <div class="deck-step__row-top">
              <div class="deck-step__row-name">{{ row.qty }}× {{ row.name }}</div>
              <div
                class="deck-step__row-status"
                :style="
                  row.status === 'ambiguous'
                    ? { background: 'oklch(0.93 0.05 85)', color: 'oklch(0.4 0.1 70)' }
                    : { background: 'oklch(0.93 0.05 25)', color: 'oklch(0.4 0.12 25)' }
                "
              >
                {{ row.status === "ambiguous" ? "Pick pitch" : "Not found" }}
              </div>
            </div>
            <div v-if="row.status === 'ambiguous'" class="deck-step__row-options">
              <div
                v-for="(m, mi) in row.matches"
                :key="mi"
                class="deck-step__option"
                :style="{ borderColor: colorHex(m.color), color: colorHex(m.color) }"
                @click="chooseMatch(state.parsedRows.indexOf(row), mi)"
              >
                {{ m.color || "Pitch" }}{{ m.pitch ? " " + m.pitch : "" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.deck-step {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.deck-step__title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 30px;
  letter-spacing: -0.01em;
  text-align: center;
  color: var(--fab-heading);
}

.deck-step__rules {
  max-width: 760px;
  margin: 0 0 16px;
  padding-left: 20px;
  font-size: 18px;
  line-height: 1.55;
  opacity: 0.7;
  text-align: left;
}

.deck-step__textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 180px;
  border: 1px solid var(--fab-border);
  border-radius: 10px;
  padding: 14px;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  background: white;
  overflow: hidden;
  margin-top: 30px;
}

.deck-step__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
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

.deck-step__not-found {
  margin-top: 28px;
}

.deck-step__not-found-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 28px 0 10px;
}

.deck-step__not-found-title {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.6;
}

.deck-step__not-found-count {
  font-size: 12.5px;
  opacity: 0.6;
}

.deck-step__not-found-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.deck-step__row {
  background: white;
  border: 1px solid var(--fab-border-light);
  border-radius: 10px;
  padding: 12px 14px;
}

.deck-step__row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.deck-step__row-name {
  font-weight: 700;
  font-size: 13.5px;
}

.deck-step__row-status {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 100px;
}

.deck-step__row-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 9px;
}

.deck-step__option {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  background: white;
}
</style>
