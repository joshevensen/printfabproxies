<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useBuilder } from "../composables/useBuilder";

const { state, preconGroups, handlePreconQueryChange, loadPrecon } = useBuilder();

const inputRef = ref<HTMLInputElement | null>(null);
onMounted(() => inputRef.value?.focus());
</script>

<template>
  <div class="precon-picker" @click.stop>
    <input
      ref="inputRef"
      class="precon-picker__search"
      type="text"
      placeholder="Search precons..."
      :value="state.preconQuery"
      @input="handlePreconQueryChange"
    />
    <div class="precon-picker__list">
      <template v-if="preconGroups.length">
        <div v-for="group in preconGroups" :key="group.category" class="precon-picker__group">
          <div class="precon-picker__category">{{ group.category }}</div>
          <button
            v-for="precon in group.precons"
            :key="precon.id"
            type="button"
            class="precon-picker__item"
            @click="loadPrecon(precon.id)"
          >
            {{ precon.label }}
          </button>
        </div>
      </template>
      <div v-else class="precon-picker__empty">No precons match "{{ state.preconQuery }}"</div>
    </div>
  </div>
</template>

<style scoped>
.precon-picker {
  position: absolute;
  top: 44px;
  left: 0;
  width: 300px;
  background: white;
  border: 1px solid oklch(0.86 0.01 80);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 50;
}

.precon-picker__search {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--fab-border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
}

.precon-picker__list {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.precon-picker__group + .precon-picker__group {
  margin-top: 6px;
}

.precon-picker__category {
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  padding: 6px 8px 2px;
}

.precon-picker__item {
  text-align: left;
  padding: 8px 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.precon-picker__item:hover {
  background: var(--fab-tab-bg);
}

.precon-picker__empty {
  padding: 10px 8px;
  font-size: 12.5px;
  opacity: 0.6;
}
</style>
