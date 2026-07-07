<script setup lang="ts">
import type { ProxyCardProps } from "../lib/types";

defineProps<{ card: ProxyCardProps }>();
</script>

<template>
  <div class="proxy-card">
    <div class="proxy-card__header">
      <div class="proxy-card__pip" :style="{ background: card.pipColorHex }">{{ card.pipText }}</div>
      <div class="proxy-card__name">{{ card.name }}</div>
      <div class="proxy-card__cost">{{ card.costText }}</div>
    </div>

    <div class="proxy-card__body">
      <div v-if="card.hasWatermarkIcon" class="proxy-card__watermark">
        <img :src="card.watermarkIconUrl" alt="" />
      </div>
      <div class="proxy-card__text" v-html="card.functionalHtml"></div>
      <div class="proxy-card__spacer"></div>
      <div v-if="card.hasGlossary" class="proxy-card__glossary">
        <div v-for="g in card.glossary" :key="g.term" class="proxy-card__glossary-entry">
          <b>{{ g.term }}</b>: {{ g.desc }}
        </div>
      </div>
    </div>

    <div class="proxy-card__type-bar">{{ card.restTypeText }}</div>

    <div class="proxy-card__footer">
      <div class="proxy-card__stat proxy-card__stat--left">
        <div class="proxy-card__stat-label">{{ card.botLeftLabel }}</div>
        <div class="proxy-card__stat-value">{{ card.botLeftValue }}</div>
      </div>
      <div class="proxy-card__meta">
        <div class="proxy-card__class">{{ card.classText }}</div>
        <div class="proxy-card__rarity" :style="{ borderTop: card.dividerBorder }">
          {{ card.rarityName }}&nbsp; &nbsp;|&nbsp; &nbsp;{{ card.cardId }}
        </div>
      </div>
      <div class="proxy-card__stat proxy-card__stat--right">
        <div class="proxy-card__stat-label">{{ card.botRightLabel }}</div>
        <div class="proxy-card__stat-value">{{ card.botRightValue }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.proxy-card {
  width: 100%;
  height: 100%;
  max-width: 2.5in;
  max-height: 3.5in;
  aspect-ratio: 2.5 / 3.5;
  border: 1.5px solid #1c1b19;
  border-radius: 3px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: "Inter", system-ui, sans-serif;
  color: #1c1b19;
  overflow: hidden;
  position: relative;
  background-color: #ffffff;
}

.proxy-card__header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 15%;
  min-height: 34px;
  border-bottom: 1.5px solid #1c1b19;
}

.proxy-card__pip {
  width: 15%;
  min-width: 34px;
  color: #f7f4ec;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  border-right: 1.5px solid #1c1b19;
  flex-shrink: 0;
}

.proxy-card__name {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2px 4px;
  font-weight: 700;
  font-size: 11.5px;
  line-height: 1.12;
  letter-spacing: -0.01em;
}

.proxy-card__cost {
  width: 15%;
  min-width: 34px;
  color: #1c1b19;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 24px;
  border-left: 1.5px solid #1c1b19;
  flex-shrink: 0;
  background-color: #ffffff;
}

.proxy-card__body {
  flex: 1;
  padding: 5px 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.proxy-card__watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.14;
  pointer-events: none;
}

.proxy-card__watermark img {
  width: 80%;
  height: 80%;
  object-fit: contain;
  filter: invert(1);
  opacity: 0.5;
}

.proxy-card__text {
  font-size: 11px;
  line-height: 1.32;
}

.proxy-card__spacer {
  flex: 1;
  min-height: 2px;
}

.proxy-card__glossary {
  border-top: 1px solid rgba(28, 27, 25, 0.28);
  margin-top: 3px;
  padding-top: 3px;
  display: flex;
  flex-direction: column;
  gap: 1.5px;
}

.proxy-card__glossary-entry {
  font-size: 7.5px;
  line-height: 1.28;
  color: rgba(28, 27, 25, 0.82);
}

.proxy-card__type-bar {
  color: #fefefe;
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 2.5px 4px;
  font-weight: 600;
  flex-shrink: 0;
  border-top: 1.5px solid #1c1b19;
  background-color: #616161;
}

.proxy-card__footer {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 15%;
  min-height: 34px;
  border-top: 1.5px solid #1c1b19;
  flex-shrink: 0;
}

.proxy-card__stat {
  width: 15%;
  min-width: 34px;
  color: #1c1b19;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0 8px;
  flex-shrink: 0;
  background-color: #ffffff;
}

.proxy-card__stat--left {
  border-right: 1.5px solid #1c1b19;
}

.proxy-card__stat--right {
  border-left: 1.5px solid #1c1b19;
}

.proxy-card__stat-label {
  font-size: 7px;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.proxy-card__stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.proxy-card__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.proxy-card__class {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 0 2px;
}

.proxy-card__rarity {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 10px;
  color: rgba(28, 27, 25, 0.82);
  padding: 0 2px;
}
</style>
