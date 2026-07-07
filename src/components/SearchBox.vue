<script setup lang="ts">
import { useBuilder } from "../composables/useBuilder";

const {
  state,
  handleSearchChange,
  handleSearchFocus,
  handleSearchBlur,
  searchResults,
  showSearchDropdown,
  showSearchEmpty,
} = useBuilder();
</script>

<template>
  <div class="search">
    <input
      class="search__input"
      :value="state.searchQuery"
      placeholder="Search cards to add…"
      @input="handleSearchChange"
      @focus="handleSearchFocus"
      @blur="handleSearchBlur"
    />

    <div v-if="showSearchDropdown" class="search__dropdown">
      <div v-for="res in searchResults" :key="res.id" class="search__result" @click="res.onAdd">
        <div>
          <div class="search__result-name">{{ res.name }}</div>
          <div class="search__result-sub">{{ res.sub }}</div>
        </div>
        <div class="search__result-add">+ Add</div>
      </div>
    </div>
    <div v-else-if="showSearchEmpty" class="search__empty">No matches.</div>
  </div>
</template>

<style scoped>
.search {
  position: relative;
}

.search__input {
  width: 200px;
  box-sizing: border-box;
  border: 1.5px solid var(--fab-border);
  border-radius: 9px;
  padding: 8.5px 12px;
  font-family: inherit;
  font-size: 13px;
  background: white;
}

.search__dropdown {
  position: absolute;
  top: 40px;
  left: 0;
  width: 280px;
  max-height: 320px;
  overflow-y: auto;
  background: white;
  border: 1px solid oklch(0.86 0.01 80);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  padding: 6px;
  z-index: 60;
}

.search__result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.search__result:hover {
  background: var(--fab-tab-bg);
}

.search__result-name {
  font-weight: 700;
  font-size: 13px;
}

.search__result-sub {
  font-size: 11.5px;
  opacity: 0.6;
}

.search__result-add {
  font-size: 11px;
  font-weight: 800;
  color: var(--fab-accent);
  white-space: nowrap;
}

.search__empty {
  position: absolute;
  top: 40px;
  left: 0;
  width: 280px;
  background: white;
  border: 1px solid oklch(0.86 0.01 80);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  padding: 12px;
  z-index: 60;
  font-size: 12.5px;
  opacity: 0.6;
}
</style>
