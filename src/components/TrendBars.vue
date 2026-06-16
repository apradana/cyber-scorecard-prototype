<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TrendData, TrendPeriod } from '../data/mockData'
import { bandFor } from '../data/mockData'

const props = defineProps<{
  data: TrendData
}>()

const PERIODS: TrendPeriod[] = ['30d', '90d', '12m']
const PERIOD_DAYS: Record<TrendPeriod, number> = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 }

const period = ref<TrendPeriod>('30d')
const scores = computed(() => props.data[period.value])

// ─── SVG canvas ────────────────────────────────────────────────────
const W = 520
const H = 220
const PAD_L = 34
const PAD_R = 10
const PAD_T = 20
const PAD_B = 32   // room for date labels

const CW = W - PAD_L - PAD_R
const CH = H - PAD_T - PAD_B

// ─── Helpers ───────────────────────────────────────────────────────
function scoreToY(s: number): number {
  return PAD_T + CH - (s / 100) * CH
}

const REF_40_Y = computed(() => scoreToY(40))
const REF_70_Y = computed(() => scoreToY(70))

// ─── Bar geometry — gap = 1/3 of bar width (barW = 0.75 × slot) ────
const n = computed(() => scores.value.length)
const slotW = computed(() => CW / n.value)
const barW = computed(() => slotW.value * 0.75)

interface Bar {
  x: number; y: number; h: number
  score: number; isLatest: boolean
  color: string; opacity: number
}

const bars = computed<Bar[]>(() =>
  scores.value.map((score, i) => {
    const isLatest = i === scores.value.length - 1
    const b = bandFor(score)
    const color = b === 'safe' ? 'var(--rag-safe)' : b === 'warn' ? 'var(--rag-warn)' : 'var(--rag-crit)'
    const h = Math.max(2, (score / 100) * CH)
    return {
      x: PAD_L + i * slotW.value + (slotW.value - barW.value) / 2,
      y: PAD_T + CH - h,
      h, score, isLatest, color,
      opacity: isLatest ? 1 : 0.62,
    }
  })
)

// Top-rounded-only bar path
function barPath(bx: number, by: number, bw: number, bh: number): string {
  const r = Math.min(3, bh / 2)
  if (r < 0.5) return `M ${bx},${by} h ${bw} v ${bh} h ${-bw} Z`
  return [
    `M ${bx},${by + bh}`,
    `L ${bx},${by + r}`,
    `Q ${bx},${by} ${bx + r},${by}`,
    `L ${bx + bw - r},${by}`,
    `Q ${bx + bw},${by} ${bx + bw},${by + r}`,
    `L ${bx + bw},${by + bh}`,
    `Z`,
  ].join(' ')
}

const latest = computed(() => bars.value[bars.value.length - 1])

// ─── Date-based x-axis ticks every ~7 days ─────────────────────────
interface DateTick { x: number; label: string }

const dateTicks = computed<DateTick[]>(() => {
  const numBars = n.value
  const totalDays = PERIOD_DAYS[period.value]
  const daysPerBar = totalDays / numBars

  // Tick interval in bars: every 7 days, but at least every 2, at most every 4
  let barsPerTick: number
  if (period.value === '12m') {
    barsPerTick = Math.max(1, Math.round(numBars / 4))   // ~quarterly
  } else {
    barsPerTick = Math.max(2, Math.round(7 / daysPerBar)) // every 7 days
  }

  const today = new Date()
  const ticks: DateTick[] = []

  for (let i = 0; i < numBars; i += barsPerTick) {
    const daysBack = Math.round((numBars - 1 - i) * daysPerBar)
    const d = new Date(today)
    d.setDate(today.getDate() - daysBack)

    let label: string
    if (period.value === '12m') {
      label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    } else {
      label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    }
    // x center of bar i
    const x = PAD_L + i * slotW.value + slotW.value / 2
    ticks.push({ x, label })
  }

  return ticks
})

// ─── Y-axis labels ─────────────────────────────────────────────────
const yLabels = [
  { score: 0,   label: '0' },
  { score: 40,  label: '40' },
  { score: 70,  label: '70' },
  { score: 100, label: '100' },
]
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
      :aria-label="`Score trend over last ${period}`"
    >
      <!-- Band zone fills -->
      <rect :x="PAD_L" :y="PAD_T" :width="CW" :height="REF_70_Y - PAD_T"
            fill="var(--rag-crit)" opacity="0.04" />
      <rect :x="PAD_L" :y="REF_70_Y" :width="CW" :height="REF_40_Y - REF_70_Y"
            fill="var(--rag-warn)" opacity="0.04" />
      <rect :x="PAD_L" :y="REF_40_Y" :width="CW" :height="PAD_T + CH - REF_40_Y"
            fill="var(--rag-safe)" opacity="0.04" />

      <!-- Threshold lines at 40 and 70 -->
      <line :x1="PAD_L" :y1="REF_40_Y" :x2="W - PAD_R" :y2="REF_40_Y"
            stroke="var(--rag-safe)" stroke-width="1" stroke-dasharray="3 4" opacity="0.45" />
      <line :x1="PAD_L" :y1="REF_70_Y" :x2="W - PAD_R" :y2="REF_70_Y"
            stroke="var(--rag-crit)" stroke-width="1" stroke-dasharray="3 4" opacity="0.45" />

      <!-- Y-axis labels -->
      <text v-for="yl in yLabels" :key="yl.score"
            :x="PAD_L - 5" :y="scoreToY(yl.score) + 4"
            class="axis-label" text-anchor="end">{{ yl.label }}</text>

      <!-- Bars (top corners rounded only) -->
      <g v-for="(bar, i) in bars" :key="i">
        <path
          :d="barPath(bar.x, bar.y, barW, bar.h)"
          :fill="bar.color" :opacity="bar.opacity"
        />
        <path v-if="bar.isLatest"
          :d="barPath(bar.x, bar.y, barW, 2)"
          fill="white" opacity="0.75"
        />
      </g>

      <!-- Latest bar callout -->
      <g v-if="latest">
        <rect
          :x="latest.x + barW / 2 - 20"
          :y="latest.y - 24"
          width="40" height="18" rx="4"
          :fill="latest.color" opacity="0.92"
        />
        <text
          :x="latest.x + barW / 2"
          :y="latest.y - 11"
          class="callout-text" text-anchor="middle"
        >{{ latest.score }}</text>
      </g>

      <!-- Date ticks on x-axis -->
      <g v-for="(tick, i) in dateTicks" :key="i">
        <line :x1="tick.x" :y1="PAD_T + CH" :x2="tick.x" :y2="PAD_T + CH + 4"
              stroke="var(--content-disabled)" stroke-width="1" opacity="0.4" />
        <text :x="tick.x" :y="H - 4"
              class="axis-label" text-anchor="middle">{{ tick.label }}</text>
      </g>
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
  margin-bottom: 6px;
  flex-shrink: 0;
}

.bars-label {
  font-size: var(--text-sm);
  color: var(--content-subtle);
  font-weight: var(--fw-extra-bold);
  letter-spacing: 0.2px;
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
  padding: 4px 12px;
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
  min-height: 140px;
  display: block;
}

.axis-label {
  font-size: 9px;
  fill: var(--content-disabled);
  font-family: var(--font-mono);
}

.callout-text {
  font-size: 10.5px;
  font-weight: 800;
  fill: white;
  font-family: var(--font-sans);
}
</style>
