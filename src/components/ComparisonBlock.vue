<script setup lang="ts">
import { computed, ref } from 'vue'
import { bandFor, type Band } from '../data/mockData'

const props = defineProps<{
  you: number
  orgAverage: number
  topQuartile: number
  internalPeerAverage: number
  internalPeerTop: number
}>()

type Scope = 'all' | 'internal'
const scope = ref<Scope>('all')

const yourBand = computed<Band>(() => bandFor(props.you))
const yourColor = computed(() => {
  const b = yourBand.value
  return b === 'safe' ? 'var(--rag-safe)' : b === 'warn' ? 'var(--rag-warn)' : 'var(--rag-crit)'
})

const peerAverage = computed(() => scope.value === 'all' ? props.orgAverage : props.internalPeerAverage)
const peerTop = computed(() => scope.value === 'all' ? props.topQuartile : props.internalPeerTop)
const peerLabel = computed(() => scope.value === 'all' ? 'P&T average' : 'Internal average')
const topLabel = computed(() => scope.value === 'all' ? 'Top quartile' : 'Internal top')
</script>

<template>
  <div class="block">
    <div class="block-head">
      <div class="lbl">How your team sits</div>
      <div class="scope-toggle" role="group" aria-label="Comparison scope">
        <button
          :class="['scope-btn', { active: scope === 'all' }]"
          @click="scope = 'all'"
        >All P&amp;T</button>
        <button
          :class="['scope-btn', { active: scope === 'internal' }]"
          @click="scope = 'internal'"
        >Internal teams</button>
      </div>
    </div>

    <div class="row">
      <div class="who"><strong>Your team</strong></div>
      <div class="bar"><div class="fill" :style="{ width: you + '%', background: yourColor }" /></div>
      <div class="num">{{ you }}</div>
    </div>
    <div class="row">
      <div class="who">{{ peerLabel }}</div>
      <div class="bar"><div class="fill avg" :style="{ width: peerAverage + '%' }" /></div>
      <div class="num">{{ peerAverage }}</div>
    </div>
    <div class="row">
      <div class="who">{{ topLabel }}</div>
      <div class="bar"><div class="fill safe" :style="{ width: peerTop + '%' }" /></div>
      <div class="num">{{ peerTop }}</div>
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

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  gap: var(--space-3);
  flex-wrap: wrap;
}

.lbl {
  font-size: 11px; color: var(--content-disabled);
  text-transform: uppercase; letter-spacing: 1px;
  font-weight: var(--fw-bold);
}

.scope-toggle {
  display: flex;
  gap: 2px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: var(--radius-sm);
  padding: 2px;
}

.scope-btn {
  font-size: 10.5px;
  font-weight: var(--fw-bold);
  color: var(--content-disabled);
  background: transparent;
  border: none;
  padding: 3px 9px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--t-fast) var(--ease-out), color var(--t-fast) var(--ease-out);
  white-space: nowrap;
}

.scope-btn:hover { color: var(--content-subtle); }

.scope-btn.active {
  background: var(--surface-raised);
  color: var(--content-default);
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
