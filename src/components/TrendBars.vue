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
const PAD_T = 5
const PAD_B = 30

const CW = W - PAD_L - PAD_R
const CH = H - PAD_T - PAD_B

function scoreToY(s: number): number {
  return PAD_T + CH - (s / 100) * CH
}

const REF_40_Y = computed(() => scoreToY(40))
const REF_70_Y = computed(() => scoreToY(70))

// ─── Bar geometry — gap = 1/4 of slot (barW = 75%) ─────────────────
const n = computed(() => scores.value.length)
const slotW = computed(() => CW / n.value)
const barW = computed(() => slotW.value * 0.45)

interface Bar {
  x: number; y: number; h: number
  score: number; isLatest: boolean
  color: string; opacity: number
}

// Bar path: fully rounded top; if bar is shorter than wide, full pill shape
function barPath(bx: number, by: number, bw: number, bh: number): string {
  const r = bw / 2
  if (bh <= bw) {
    // Full pill — rounded on all sides
    const rb = Math.min(r, bh / 2)
    return [
      `M ${bx},${by + bh - rb}`,
      `Q ${bx},${by + bh} ${bx + rb},${by + bh}`,
      `L ${bx + bw - rb},${by + bh}`,
      `Q ${bx + bw},${by + bh} ${bx + bw},${by + bh - rb}`,
      `L ${bx + bw},${by + rb}`,
      `Q ${bx + bw},${by} ${bx + bw - rb},${by}`,
      `L ${bx + rb},${by}`,
      `Q ${bx},${by} ${bx},${by + rb}`,
      `Z`,
    ].join(' ')
  }
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
      opacity: isLatest ? 1 : 0.4,
    }
  })
)

const latest = computed(() => bars.value[bars.value.length - 1])

// ─── Gridlines ─────────────────────────────────────────────────────
const gridLines = [0, 25, 50, 75, 100].map(s => ({ score: s, y: scoreToY(s) }))

// ─── Y-axis labels ─────────────────────────────────────────────────
const yLabels = [
  { score: 0,   label: '0' },
  { score: 40,  label: '40' },
  { score: 70,  label: '70' },
  { score: 100, label: '100' },
]

// ─── Date-based x-axis ticks ───────────────────────────────────────
interface DateTick { x: number; label: string }

const dateTicks = computed<DateTick[]>(() => {
  const numBars = n.value
  const totalDays = PERIOD_DAYS[period.value]
  const daysPerBar = totalDays / numBars

  let barsPerTick: number
  if (period.value === '12m') {
    barsPerTick = Math.max(1, Math.round(numBars / 4))
  } else {
    barsPerTick = Math.max(2, Math.round(7 / daysPerBar))
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
    const x = PAD_L + i * slotW.value + slotW.value / 2
    ticks.push({ x, label })
  }

  return ticks
})
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
      <!-- Subtle horizontal gridlines -->
      <line
        v-for="gl in gridLines"
        :key="gl.score"
        :x1="PAD_L" :y1="gl.y"
        :x2="W - PAD_R" :y2="gl.y"
        stroke="var(--border-default)"
        stroke-width="0.8"
        opacity="0.5"
      />

      <!-- Band threshold lines at 40 and 70 -->
      <line :x1="PAD_L" :y1="REF_40_Y" :x2="W - PAD_R" :y2="REF_40_Y"
            stroke="var(--rag-safe)" stroke-width="1" stroke-dasharray="3 4" opacity="0.4" />
      <line :x1="PAD_L" :y1="REF_70_Y" :x2="W - PAD_R" :y2="REF_70_Y"
            stroke="var(--rag-crit)" stroke-width="1" stroke-dasharray="3 4" opacity="0.4" />

      <!-- Y-axis labels -->
      <text
        v-for="yl in yLabels"
        :key="yl.score"
        :x="PAD_L - 5"
        :y="scoreToY(yl.score) + 4"
        class="axis-label"
        text-anchor="end"
      >{{ yl.label }}</text>

      <!-- Bars -->
      <g v-for="(bar, i) in bars" :key="i">
        <path
          :d="barPath(bar.x, bar.y, barW, bar.h)"
          :fill="bar.color"
          :opacity="bar.opacity"
        />
        <!-- Today's bar: bright white overlay to lift the colour -->
        <path
          v-if="bar.isLatest"
          :d="barPath(bar.x, bar.y, barW, bar.h)"
          fill="white"
          opacity="0.18"
        />
      </g>

      <!-- Date ticks on x-axis -->
      <g v-for="(tick, i) in dateTicks" :key="'dt' + i">
        <line
          :x1="tick.x" :y1="PAD_T + CH"
          :x2="tick.x" :y2="PAD_T + CH + 4"
          stroke="var(--content-disabled)"
          stroke-width="1"
          opacity="0.4"
        />
        <text
          :x="tick.x" :y="H - 5"
          class="axis-label"
          text-anchor="middle"
        >{{ tick.label }}</text>
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
  margin-bottom: 33px;
  margin-top: 16px;
  padding-left: calc(34 / 520 * 100%);
  flex-shrink: 0;
}

.bars-label {
  font-size: 20px;
  color: var(--content-subtle);
  font-weight: var(--fw-extra-bold);
  letter-spacing: 0.1px;
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
