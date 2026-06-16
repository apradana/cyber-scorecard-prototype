<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TrendData, TrendPeriod } from '../data/mockData'
import { bandFor } from '../data/mockData'

const props = defineProps<{
  data: TrendData
  peerAverage?: number
}>()

const PEER_AVG = computed(() => props.peerAverage ?? 64)

const PERIODS: TrendPeriod[] = ['30d', '90d', '12m']
const PERIOD_DAYS: Record<TrendPeriod, number> = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 }

const period = ref<TrendPeriod>('30d')
const scores = computed(() => props.data[period.value])

// Peer average: flat baseline with minor sinusoidal noise
const peerScores = computed(() =>
  scores.value.map((_, i) => {
    const noise = Math.round(Math.sin(i * 0.9 + 0.5) * 2 + Math.cos(i * 0.4) * 1)
    return Math.max(10, Math.min(90, PEER_AVG.value + noise))
  })
)

// ─── SVG canvas ────────────────────────────────────────────────────
const W = 520
const H = 220
const PAD_L = 34
const PAD_R = 10
const PAD_T = 20
const PAD_B = 32

const CW = W - PAD_L - PAD_R
const CH = H - PAD_T - PAD_B

function scoreToY(s: number): number {
  return PAD_T + CH - (s / 100) * CH
}

const REF_40_Y = computed(() => scoreToY(40))
const REF_70_Y = computed(() => scoreToY(70))

// ─── Grouped bar geometry ──────────────────────────────────────────
const n = computed(() => scores.value.length)
const slotW = computed(() => CW / n.value)

// Each slot: 10% outer pad each side, 6% inner gap between the pair
const outerPad  = computed(() => slotW.value * 0.10)
const innerGap  = computed(() => slotW.value * 0.06)
const barW      = computed(() => (slotW.value - 2 * outerPad.value - innerGap.value) / 2)

interface Bar {
  x: number; y: number; h: number
  score: number; isLatest: boolean
  color: string; opacity: number
}

// Top-rounded-only bar path
function barPath(bx: number, by: number, bw: number, bh: number): string {
  const r = Math.min(2, bh / 2, bw / 3)
  if (r < 0.5) return `M ${bx},${by + bh} L ${bx},${by} L ${bx + bw},${by} L ${bx + bw},${by + bh} Z`
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

const teamBars = computed<Bar[]>(() =>
  scores.value.map((score, i) => {
    const isLatest = i === scores.value.length - 1
    const b = bandFor(score)
    const color = b === 'safe' ? 'var(--rag-safe)' : b === 'warn' ? 'var(--rag-warn)' : 'var(--rag-crit)'
    const h = Math.max(2, (score / 100) * CH)
    const x = PAD_L + i * slotW.value + outerPad.value
    return { x, y: PAD_T + CH - h, h, score, isLatest, color, opacity: isLatest ? 1 : 0.72 }
  })
)

const peerBars = computed<Bar[]>(() =>
  peerScores.value.map((score, i) => {
    const h = Math.max(2, (score / 100) * CH)
    const x = PAD_L + i * slotW.value + outerPad.value + barW.value + innerGap.value
    return { x, y: PAD_T + CH - h, h, score, isLatest: i === peerScores.value.length - 1, color: 'rgba(255,255,255,0.18)', opacity: 1 }
  })
)

const latestTeam = computed(() => teamBars.value[teamBars.value.length - 1])

// Gridlines at 0, 25, 50, 75, 100
const gridLines = [0, 25, 50, 75, 100].map(s => ({ score: s, y: scoreToY(s) }))

// Y-axis labels at band boundaries + extremes
const yLabels = [
  { score: 0,   label: '0' },
  { score: 40,  label: '40' },
  { score: 70,  label: '70' },
  { score: 100, label: '100' },
]

// ─── Date-based x-axis ticks ─────────────────────────────────────────
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
      <div class="bars-legend">
        <span class="legend-item"><span class="legend-dot team" />Your team</span>
        <span class="legend-item"><span class="legend-dot peer" />P&amp;T average</span>
      </div>
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
            stroke="var(--rag-safe)" stroke-width="1" stroke-dasharray="3 4" opacity="0.35" />
      <line :x1="PAD_L" :y1="REF_70_Y" :x2="W - PAD_R" :y2="REF_70_Y"
            stroke="var(--rag-crit)" stroke-width="1" stroke-dasharray="3 4" opacity="0.35" />

      <!-- Y-axis labels -->
      <text
        v-for="yl in yLabels"
        :key="yl.score"
        :x="PAD_L - 5"
        :y="scoreToY(yl.score) + 4"
        class="axis-label"
        text-anchor="end"
      >{{ yl.label }}</text>

      <!-- Peer bars (drawn first, behind team bars) -->
      <path
        v-for="(bar, i) in peerBars"
        :key="'p' + i"
        :d="barPath(bar.x, bar.y, barW, bar.h)"
        :fill="bar.color"
        :opacity="bar.opacity"
      />

      <!-- Team bars -->
      <g v-for="(bar, i) in teamBars" :key="'t' + i">
        <path
          :d="barPath(bar.x, bar.y, barW, bar.h)"
          :fill="bar.color"
          :opacity="bar.opacity"
        />
        <!-- Latest bar: thin white highlight stripe at top -->
        <path
          v-if="bar.isLatest"
          :d="barPath(bar.x, bar.y, barW, Math.min(2, bar.h))"
          fill="white"
          opacity="0.75"
        />
      </g>

      <!-- Latest team score callout bubble -->
      <g v-if="latestTeam">
        <rect
          :x="latestTeam.x + barW / 2 - 18"
          :y="latestTeam.y - 24"
          width="36" height="18" rx="4"
          :fill="latestTeam.color" opacity="0.9"
        />
        <text
          :x="latestTeam.x + barW / 2"
          :y="latestTeam.y - 11"
          class="callout-text"
          text-anchor="middle"
        >{{ latestTeam.score }}</text>
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
          :x="tick.x" :y="H - 4"
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
  gap: var(--space-3);
  margin-bottom: 4px;
  margin-top: 10px;
  padding-left: calc(34 / 520 * 100%);
  flex-shrink: 0;
}

.bars-label {
  font-size: 13.5px;
  color: var(--content-subtle);
  font-weight: var(--fw-extra-bold);
  letter-spacing: 0.1px;
}

.bars-legend {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin-right: auto;
  margin-left: var(--space-3);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  color: var(--content-disabled);
  font-weight: var(--fw-bold);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  display: inline-block;
  flex-shrink: 0;
}
.legend-dot.team { background: var(--rag-safe); }  /* updated per active band via team bar color */
.legend-dot.peer { background: rgba(255,255,255,0.3); }

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
