<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Band } from '../data/mockData'

const props = defineProps<{
  scores: number[]   // 30 daily points, oldest → newest
  band: Band
}>()

type Period = '30d' | '90d' | '12m'
const selected = ref<Period>('30d')

// For demo, all periods use the same 30-point array.
// In production this would slice a longer history.
const visible = computed(() => props.scores)

const W = 420
const H = 64
const PAD = 6

const points = computed(() => {
  const data = visible.value
  if (data.length < 2) return ''
  const minV = Math.min(...data)
  const maxV = Math.max(...data)
  const range = maxV - minV || 1
  return data
    .map((v, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
      const y = H - PAD - ((v - minV) / range) * (H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

const areaPath = computed(() => {
  const data = visible.value
  if (data.length < 2) return ''
  const minV = Math.min(...data)
  const maxV = Math.max(...data)
  const range = maxV - minV || 1
  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((v - minV) / range) * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M ${pts[0]} L ${pts.join(' L ')} L ${(W - PAD).toFixed(1)},${H} L ${PAD},${H} Z`
})

const strokeColor = computed(() => {
  if (props.band === 'safe') return 'var(--rag-safe)'
  if (props.band === 'warn') return 'var(--rag-warn)'
  return 'var(--rag-crit)'
})

const fillId = computed(() => `sparkfill-${props.band}`)
const fillStop = computed(() => {
  if (props.band === 'safe') return '#22c55e'
  if (props.band === 'warn') return '#f59e0b'
  return '#ef4444'
})

// Last point for the end-dot
const lastPoint = computed(() => {
  const data = visible.value
  if (data.length < 2) return null
  const minV = Math.min(...data)
  const maxV = Math.max(...data)
  const range = maxV - minV || 1
  const v = data[data.length - 1]
  const x = W - PAD
  const y = H - PAD - ((v - minV) / range) * (H - PAD * 2)
  return { x: x.toFixed(1), y: y.toFixed(1) }
})

const periods: Period[] = ['30d', '90d', '12m']
</script>

<template>
  <div class="sparkline-wrap">
    <div class="spark-head">
      <span class="spark-label">30-day trend</span>
      <div class="period-toggle" role="group" aria-label="Trend period">
        <button
          v-for="p in periods"
          :key="p"
          :class="['period-btn', { active: selected === p }]"
          @click="selected = p"
        >{{ p }}</button>
      </div>
    </div>

    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="spark-svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient :id="fillId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="fillStop" stop-opacity="0.18" />
          <stop offset="100%" :stop-color="fillStop" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      <!-- Area fill -->
      <path
        :d="areaPath"
        :fill="`url(#${fillId})`"
      />

      <!-- Line -->
      <polyline
        :points="points"
        fill="none"
        :stroke="strokeColor"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- End dot -->
      <circle
        v-if="lastPoint"
        :cx="lastPoint.x"
        :cy="lastPoint.y"
        r="3.5"
        :fill="strokeColor"
      />
    </svg>
  </div>
</template>

<style scoped>
.sparkline-wrap {
  margin-top: var(--space-4);
}

.spark-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.spark-label {
  font-size: 11px;
  color: var(--content-disabled);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: var(--fw-bold);
}

.period-toggle {
  display: flex;
  gap: 2px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: var(--radius-sm);
  padding: 2px;
}

.period-btn {
  font-size: 11px;
  font-weight: var(--fw-bold);
  font-family: var(--font-mono);
  color: var(--content-disabled);
  background: transparent;
  border: none;
  padding: 3px 9px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--t-fast) var(--ease-out), color var(--t-fast) var(--ease-out);
}

.period-btn:hover {
  color: var(--content-subtle);
}

.period-btn.active {
  background: var(--surface-raised);
  color: var(--content-default);
}

.spark-svg {
  width: 100%;
  height: 52px;
  display: block;
  overflow: visible;
}
</style>
