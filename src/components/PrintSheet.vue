<script setup lang="ts">
import { usePrintSheet } from "../composables/usePrintSheet";
import ProxyCard from "./ProxyCard.vue";

const { printState, printPages, printPageStyle, printGridStyle, printSheetHeight, cutGuideOutline } =
  usePrintSheet();
</script>

<template>
  <div class="fab-print-sheet" style="display: none">
    <component :is="'style'" v-html="printPageStyle"></component>
    <div
      v-for="(pageCards, pageIndex) in printPages"
      :key="pageIndex"
      class="print-sheet__page"
      :style="{
        height: printSheetHeight,
        breakAfter: pageIndex < printPages.length - 1 ? 'page' : 'auto',
      }"
    >
      <div class="print-sheet__grid" :style="printGridStyle">
        <div
          v-for="item in pageCards"
          :key="item.id"
          class="print-sheet__cell"
          :style="{ outline: cutGuideOutline, outlineOffset: '-0.5px' }"
        >
          <ProxyCard :card="item.props" :show-glossary="printState.showKeywordDefinitions" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.print-sheet__page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.print-sheet__grid {
  display: grid;
}

.print-sheet__cell {
  box-sizing: border-box;
  padding: 2px;
}
</style>
