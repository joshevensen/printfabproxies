<script setup lang="ts">
import { onMounted } from "vue";
import Wordmark from "./components/Wordmark.vue";
import DecklistStep from "./components/DecklistStep.vue";
import PreviewStep from "./components/PreviewStep.vue";
import PrintStep from "./components/PrintStep.vue";
import { useBuilder } from "./composables/useBuilder";

const { state, ensureDbLoaded, goToDeck, goToPreviewStep, goToPrintStep } = useBuilder();

onMounted(() => {
  ensureDbLoaded();
});

function tabStyle(active: boolean) {
  return {
    background: active ? "#B5451E" : "transparent",
    color: active ? "#f7f4ec" : "inherit",
  };
}
</script>

<template>
  <div class="app">
    <div class="fab-app-chrome app__header">
      <Wordmark />
      <div class="app__tabs">
        <div class="app__tab" :style="tabStyle(state.step === 'deck')" @click="goToDeck">1 · Decklist</div>
        <div class="app__tab" :style="tabStyle(state.step === 'preview')" @click="goToPreviewStep">2 · Preview</div>
        <div class="app__tab" :style="tabStyle(state.step === 'print')" @click="goToPrintStep">3 · Print</div>
      </div>
    </div>

    <DecklistStep v-if="state.step === 'deck'" />
    <PreviewStep v-else-if="state.step === 'preview'" />
    <PrintStep v-else-if="state.step === 'print'" />

    <div class="fab-app-chrome app__disclosures">
      <div class="app__disclosures-title">DISCLOSURES</div>
      <div class="app__disclosures-text">
        Print Simple Proxies is in no way affiliated with Legend Story Studios. Legend Story
        Studios&reg;, Flesh and Blood&trade;, and set names are trademarks of Legend Story Studios.
        Flesh and Blood characters, cards, logos, and art are property of Legend Story Studios.
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--fab-bg);
  padding-bottom: 20px;
}

.app__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px 40px;
  flex-wrap: wrap;
  width: 760px;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.app__tabs {
  display: flex;
  gap: 4px;
  background: var(--fab-tab-bg);
  padding: 4px;
  border-radius: 10px;
}

.app__tab {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.app__disclosures {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 24px 48px;
  text-align: center;
}

.app__disclosures-title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.08em;
  opacity: 0.5;
  margin-bottom: 8px;
}

.app__disclosures-text {
  font-size: 13px;
  line-height: 1.55;
  opacity: 0.7;
}
</style>
