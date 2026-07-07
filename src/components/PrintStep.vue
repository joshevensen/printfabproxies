<script setup lang="ts">
import { useBuilder } from "../composables/useBuilder";
import ProxyCard from "./ProxyCard.vue";

const { state, doPrint, setPaperSize, toggleBorderless, toggleCutGuides, pageCount, printPageStyle, cutGuideOutline } =
  useBuilder();
</script>

<template>
  <div>
    <component :is="'style'" v-html="printPageStyle"></component>

    <div class="fab-app-chrome print-step">
      <h1 class="print-step__title">Ready to Print</h1>
      <ul class="print-step__rules">
        <li>{{ state.printCards.length }} cards will fill {{ pageCount }} sheet(s), 9 cards per page.</li>
        <li>Pick a paper size that matches what's loaded in your printer.</li>
        <li>Cut guides add a dashed outline around each card so you can trim it accurately after printing.</li>
        <li>Borderless removes the page margin. Cards stay at their true size and are centered on the page.</li>
        <li>For best results, print at 100% scale (not "fit to page") so cards come out at true size.</li>
      </ul>

      <div class="print-step__panel">
        <div>
          <div class="print-step__label">Paper size</div>
          <div class="print-step__segmented">
            <div
              v-for="size in ['letter', 'a4', 'legal'] as const"
              :key="size"
              class="print-step__segment"
              :style="{
                background: state.paperSize === size ? '#B5451E' : 'transparent',
                color: state.paperSize === size ? '#f7f4ec' : 'inherit',
              }"
              @click="setPaperSize(size)"
            >
              {{ size === "letter" ? "Letter" : size === "a4" ? "A4" : "Legal" }}
            </div>
          </div>
        </div>

        <div class="print-step__toggle-row" @click="toggleBorderless">
          <div>
            <div class="print-step__toggle-label">Borderless</div>
            <div class="print-step__toggle-desc">No page margin; cards stay true size and centered</div>
          </div>
          <div class="print-step__switch" :style="{ background: state.borderless ? '#B5451E' : 'oklch(0.85 0.01 80)' }">
            <div class="print-step__switch-knob" :style="{ left: state.borderless ? '19px' : '3px' }"></div>
          </div>
        </div>

        <div class="print-step__toggle-row" @click="toggleCutGuides">
          <div>
            <div class="print-step__toggle-label">Cut guides</div>
            <div class="print-step__toggle-desc">Dashed outline around each card</div>
          </div>
          <div class="print-step__switch" :style="{ background: state.cutGuides ? '#B5451E' : 'oklch(0.85 0.01 80)' }">
            <div class="print-step__switch-knob" :style="{ left: state.cutGuides ? '19px' : '3px' }"></div>
          </div>
        </div>
      </div>

      <div class="print-step__print-row">
        <div class="btn btn--primary print-step__print-btn" @click="doPrint">Print</div>
      </div>
    </div>

    <div class="fab-print-sheet" style="display: none">
      <div class="print-step__sheet-grid">
        <div
          v-for="item in state.printCards"
          :key="item.id"
          class="print-step__sheet-cell"
          :style="{ outline: cutGuideOutline, outlineOffset: '-0.5px', breakBefore: item.breakBefore }"
        >
          <ProxyCard :card="item.props" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.print-step {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.print-step__title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 30px;
  letter-spacing: -0.01em;
  text-align: center;
  color: var(--fab-heading);
}

.print-step__rules {
  max-width: 760px;
  margin: 0 0 30px;
  padding-left: 20px;
  font-size: 18px;
  line-height: 1.55;
  opacity: 0.7;
  text-align: left;
}

.print-step__panel {
  background: white;
  border: 1px solid var(--fab-border-light);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 480px;
  margin: 20px auto 0;
}

.print-step__label {
  font-size: 12.5px;
  font-weight: 700;
  opacity: 0.65;
  margin-bottom: 8px;
}

.print-step__segmented {
  display: flex;
  gap: 6px;
  background: var(--fab-tab-bg);
  padding: 4px;
  border-radius: 9px;
}

.print-step__segment {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 7px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.print-step__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.print-step__toggle-label {
  font-size: 13.5px;
  font-weight: 700;
}

.print-step__toggle-desc {
  font-size: 12px;
  opacity: 0.6;
}

.print-step__switch {
  width: 38px;
  height: 22px;
  border-radius: 100px;
  position: relative;
  flex-shrink: 0;
}

.print-step__switch-knob {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 3px;
  transition: left 0.15s;
}

.print-step__print-row {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}

.btn {
  font-weight: 700;
  font-size: 13.5px;
  padding: 12px 18px;
  border-radius: 9px;
  cursor: pointer;
}

.btn--primary {
  background: var(--fab-accent);
  color: white;
}

.print-step__print-btn {
  min-width: 200px;
  text-align: center;
  width: 480px;
  max-width: 100%;
}

.print-step__sheet-grid {
  display: grid;
  grid-template-columns: repeat(3, 2.5in);
  grid-auto-rows: 3.5in;
}

.print-step__sheet-cell {
  width: 2.5in;
  height: 3.5in;
  box-sizing: border-box;
  padding: 2px;
}
</style>
