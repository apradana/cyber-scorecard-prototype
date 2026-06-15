<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TrendData, TrendPeriod } from '../data/mockData'
import { bandFor } from '../data/mockData'

const props = defineProps<{
  data: TrendData
}>()

const PERIODS: TrendPeriod[] = ['7d', '30d', '90d', '12m']
const PERIOD_LABELS: Record<TrendPeriod, string> = {
  '7d': '7 days', '30d': '30 days', '90d': '90 days', '12m': '12 months',
}

const period = ref<TrendPeriod>('30d')
const scores = computed(() => props.data[period.value])

// SVG canvas
const W = 520
const H = 200
const PAD_L = 32   // room for y-axis labels
const PAD_R = 8
const PAD_T = 16
const PAD_B = 20   // room for x-axis hint

const CW = W - PAD_L - PAD_R   // chart width
const CH = H - PAD_T - PAD_B   // chart height

// Band thresholds as Y coordinates (score 0 = bottom, 100 = top)
function scoreToY(score: number): number {
  return PAD_T + CH - (score / 100) * CH
}

const REF_40_Y = computed(() => scoreToY(40))
const REF_70_Y = computed(() => scoreToY(70))

// Bar geometry
const n = computed(() => scores.value.length)
const totalGap = computed(() => n.value > 20 ? n.value * 1.5 : n.value > 10 ? n.value * 2.5 : n.value * 4)
const barW = computed(() => Math.max(2, (CW - totalGap.value) / n.value))
const gap = computed(() => n.value > 1 ? (CW - barW.value * n.value) / (n.value - 1) : 0)

interface Bar {
  x: number
  y: number
  h: number
  score: number
  isLatest: boolean
  color: string
  opacity: number
}

const bars = computed<Bar[]>(() => {
  return scores.value.map((score, i) => {
    const isLatest = i === scores.value.length - 1
    const b = bandFor(score)
    const color = b === 'safe' ? 'var(--rag-safe)' : b === 'warn' ? 'var(--rag-warn)' : 'var(--rag-crit)'
    const h = (score / 100) * CH
    return {
      x: PAD_L + i * (barW.value + gap.value),
      y: PAD_T + CH - h,
      h,
      score,
      isLatest,
      color,
      opacity: isLatest ? 1 : 0.65,
    }
  })
})

// Latest bar for tooltip
const latest = computed(() => bars.value[bars.value.length - 1])

// Y-axis labels
const yLabels = [
  { score: 0,   label: '0' },
  { score: 40,  label: '40' },
  { score: 70,  label: '70' },
  { score: 100, label: '100' },
]

// X-axis: show first and last date labels as "Day 1" and "Today" for the prototype
const xStart = computed(() => period.value === '7d' ? '7d ago' : period.value === '30d' ? '30d ago' : period.value === '90d' ? '90d ago' : '12m ago')
</script>

<template>
  <div class="bars-wrap">
    <div class="bars-head">
      <span class="bars-label">Score over time</span>
      <div class="period-toggle" role="group" aria-label="Chart period">
        <button
          v-for="p in PERIODS"
          :key="p"
          :class="['period-btn', { active: period === p }]"
          @click="period = p"
        >{{ p }}</button>
      </div>
    </div>

    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="bars-svg"
      aria-label="`Score trend over ${PERIOD_LABELS[period]}`"
      preserveAspectRatio="none"
    >
      <!-- Band zone fills -->
      <rect
        :x="PAD_L" :y="PAD_T"
        :width="CW" :height="REF_70_Y - PAD_T"
        fill="var(--rag-crit)" opacity="0.04"
      />
      <rect
        :x="PAD_L" :y="REF_70_Y"
        :width="CW" :height="REF_40_Y - REF_70_Y"
        fill="var(--rag-warn)" opacity="0.04"
      />
      <rect
        :x="PAD_L" :y="REF_40_Y"
        :width="CW" :height="PAD_T + CH - REF_40_Y"
        fill="var(--rag-safe)" opacity="0.04"
      />

      <!-- Reference lines at 40 and 70 -->
      <line
        :x1="PAD_L" :y1="REF_40_Y"
        :x2="W - PAD_R" :y2="REF_40_Y"
        stroke="var(--rag-safe)" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"
      />
      <line
        :x1="PAD_L" :y1="REF_70_Y"
        :x2="W - PAD_R" :y2="REF_70_Y"
        stroke="var(--rag-crit)" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"
      />

      <!-- Y-axis labels -->
      <text
        v-for="label in yLabels"
        :key="label.score"
        :x="PAD_L - 5"
        :y="scoreToY(label.score) + 4"
        class="axis-label"
        text-anchor="end"
      >{{ label.label }}</text>

      <!-- Bars -->
      <g v-for="(bar, i) in bars" :key="i">
        <rect
          :x="bar.x"
          :y="bar.y"
          :width="barW"
          :height="bar.h"
          :fill="bar.color"
          :opacity="bar.opacity"
          rx="2"
        />
        <!-- Latest bar: white top edge highlight -->
        <rect
          v-if="bar.isLatest"
          :x="bar.x"
          :y="bar.y"
          :width="barW"
          height="2"
          fill="white"
          opacity="0.7"
          rx="1"
        />
      </g>

      <!-- Latest score callout -->
      <g v-if="latest">
        <rect
          :x="latest.x + barW / 2 - 22"
          :y="latest.y - 26"
          width="44"
          height="20"
          rx="4"
          :fill="latest.color"
          opacity="0.9"
        />
        <text
          :x="latest.x + barW / 2"
          :y="latest.y - 12"
          class="callout-text"
          text-anchor="middle"
        >{{ latest.score }}</text>
      </g>

      <!-- X-axis: start and end labels -->
      <text
        :x="PAD_L"
        :y="H - 4"
        class="axis-label"
        text-anchor="start"
        opacity="0.5"
      >{{ xStart }}</text>
      <text
        :x="W - PAD_R"
        :y="H - 4"
        class="axis-label"
        text-anchor="end"
        opacity="0.8"
      >today</text>
    </svg>
  </div>
</template>

<style scoped>
.bars-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.bars-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  flex-shrink: 0;
}

.bars-label {
  font-size: 11px;
  color: var(--content-disabled);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: var(--fw-bold);
}

.period-toggle {
  display: flex;
  gap: 2px;
  background: rgba(0, 0, 0, 0.28);
  border-radius: var(--radius-sm);
  padding: 2px;
}

.period-btn {
  font-size: 11.5px;
  font-weight: var(--fw-bold);
  font-family: var(--font-mono);
  color: var(--content-disabled);
  background: transparent;
  border: none;
  padding: 4px 11px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background var(--t-fast) var(--ease-out),
    color var(--t-fast) var(--ease-out);
}
.period-btn:hover { color: var(--content-subtle); }
.period-btn.active {
  background: var(--surface-raised);
  color: var(--content-default);
}

.bars-svg {
  flex: 1;
  width: 100%;
  min-height: 160px;
  display: block;
  overflow: visible;
}

.axis-label {
  font-size: 9.5px;
  fill: var(--content-disabled);
  font-family: var(--font-mono);
}

.callout-text {
  font-size: 11px;
  font-weight: 800;
  fill: white;
  font-family: var(--font-sans);
}
</style>
