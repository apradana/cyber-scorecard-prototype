<script setup lang="ts">
import { computed } from 'vue'
import { bandFor, type Band } from '../data/mockData'

const props = defineProps<{
  you: number
  orgAverage: number
  topQuartile: number
}>()

const yourBand = computed<Band>(() => bandFor(props.you))
const yourColor = computed(() => {
  const b = yourBand.value
  return b === 'safe' ? 'var(--rag-safe)' : b === 'warn' ? 'var(--rag-warn)' : 'var(--rag-crit)'
})
</script>

<template>
  <div class="block">
    <div class="lbl">How your team sits in P&amp;T</div>

    <div class="row">
      <div class="who"><strong>Your team</strong></div>
      <div class="bar"><div class="fill" :style="{ width: you + '%', background: yourColor }" /></div>
      <div class="num">{{ you }}</div>
    </div>
    <div class="row">
      <div class="who">P&amp;T average</div>
      <div class="bar"><div class="fill avg" :style="{ width: orgAverage + '%' }" /></div>
      <div class="num">{{ orgAverage }}</div>
    </div>
    <div class="row">
      <div class="who">Top quartile</div>
      <div class="bar"><div class="fill safe" :style="{ width: topQuartile + '%' }" /></div>
      <div class="num">{{ topQuartile }}</div>
    </div>

    <div class="caption">
      <em>Aggregated — never named teams.</em>
    </div>
  </div>
</template>

<style scoped>
.block {
  padding: var(--space-4);
  background: rgba(0, 0, 0, 0.22);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
}
.lbl {
  font-size: 11px; color: var(--content-disabled);
  text-transform: uppercase; letter-spacing: 1px;
  font-weight: var(--fw-bold);
  margin-bottom: var(--space-3);
}
.row {
  display: flex; align-items: center; gap: var(--space-3);
  margin-bottom: var(--space-2);
  font-size: 12.5px;
  color: var(--content-subtle);
}
.row:last-of-type { margin-bottom: 0; }
.who { width: 110px; flex-shrink: 0; font-weight: var(--fw-bold); }
.who strong { color: var(--content-default); font-weight: var(--fw-extra-bold); }
.bar {
  flex: 1; height: 7px; border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  position: relative; overflow: hidden;
}
.fill {
  position: absolute; left: 0; top: 0; height: 100%; border-radius: 4px;
  transition: width var(--t-long) var(--ease-inout);
}
.fill.avg { background: rgba(255,255,255,0.30); }
.fill.safe { background: var(--rag-safe); }
.num {
  width: 32px; text-align: right;
  color: var(--content-default); font-weight: var(--fw-extra-bold);
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
}

.caption {
  margin-top: var(--space-3);
  font-size: 11px;
  color: var(--content-disabled);
  text-align: right;
}
</style>
