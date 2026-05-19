<script setup lang="ts">
import { product } from '../data/mockData'

defineProps<{ team: string }>()

const tabs = [
  { id: 'overview', name: 'Overview', active: true },
  { id: 'hrei',  name: 'Human Risk' },
  { id: 'cvei',  name: 'Composite Vulnerability' },
  { id: 'screi', name: 'Supply Chain' },
]
</script>

<template>
  <div class="chrome">
    <div class="bar">
      <span class="dot" /><span class="dot" /><span class="dot" />
      <div class="url"><strong>{{ product.url }}</strong> / scorecard / overview</div>
      <span class="badge">team: {{ team }}</span>
    </div>
    <nav class="tabs" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="tab"
        :class="{ active: t.active }"
        role="tab"
        :aria-selected="!!t.active"
      >{{ t.name }}</button>
    </nav>
  </div>
</template>

<style scoped>
.chrome { position: relative; z-index: 2; }
.bar {
  background: rgba(0, 0, 0, 0.32);
  padding: 9px 16px;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.dot { width: 9px; height: 9px; border-radius: var(--radius-pill); background: var(--color-truffle-75); display: inline-block; }
.url {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--content-subtle);
  background: rgba(0,0,0,0.22);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  flex: 1;
}
.url strong { color: var(--content-default); font-weight: var(--fw-regular); }
.badge {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--content-subtle);
  background: rgba(0,0,0,0.22);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
}

.tabs {
  display: flex;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.18);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.tab {
  background: transparent;
  border: none;
  padding: 14px 20px;
  font-size: var(--text-xs);
  color: var(--content-subtle);
  border-bottom: 3px solid transparent;
  cursor: default;
  transition: color var(--t-fast) var(--ease-out);
  font-weight: var(--fw-bold);
  letter-spacing: 0.2px;
}
.tab.active {
  color: var(--content-default);
  border-bottom-color: var(--interactive-brand);
  font-weight: var(--fw-extra-bold);
}

@media (max-width: 700px) {
  .tabs { overflow-x: auto; }
  .tab { white-space: nowrap; padding: 12px 14px; font-size: 11.5px; }
}
</style>
