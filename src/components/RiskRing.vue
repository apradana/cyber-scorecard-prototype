<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  arcEndpoints,
  arcPathBetween,
  radialTickEndpoints,
  type GaugeGeometry,
} from '../composables/useGaugeMath'
import { type Band, bandLabel } from '../data/mockData'

const props = withDefaults(defineProps<{
  score: number
  band: Band
  label?: string
  size?: number
}>(), {
  label: "Your team's score",
  size: 360,
})

// ─── Geometry ─────────────────────────────────────────────────────
const GEOM: GaugeGeometry = {
  cx: 160,
  cy: 160,
  radius: 130,
  strokeW: 22,
}

// Needle: flush with outer ring edge, 20 px past the inner edge.
const markerOuter = GEOM.radius + GEOM.strokeW / 2           // 141 — outer edge, flush
const markerInner = GEOM.radius - GEOM.strokeW / 2 - 12      // 107 — 12 px past inner edge (60% of 20)

// Glow stroke width sized so its inner edge aligns with the needle tip (r=107).
const glowStrokeW = 2 * (GEOM.radius - markerInner)          //  46

// Gap between colour segments (~2 px visual separation at the band boundaries).
const GAP = 0.16

const { start, end } = arcEndpoints(GEOM)
const trackPath = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${GEOM.radius} ${GEOM.radius} 0 1 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`

// RAG segments with a ~2 px gap at each band boundary.
const safeArcPath = arcPathBetween(GEOM, 0,         40 - GAP)
const warnArcPath = arcPathBetween(GEOM, 40 + GAP,  70 - GAP)
const critArcPath = arcPathBetween(GEOM, 70 + GAP,  100)

// ─── Reactive state for the animated values ───────────────────────
const displayScore = ref(0)
const safeArcRef = ref<SVGPathElement | null>(null)
const warnArcRef = ref<SVGPathElement | null>(null)
const critArcRef = ref<SVGPathElement | null>(null)
const safeLen = ref(0)
const warnLen = ref(0)
const critLen = ref(0)

const currentMarker = computed(() => {
  return radialTickEndpoints(GEOM, displayScore.value, markerInner, markerOuter)
})

// Per-segment dasharrays — each reveals its share of displayScore.
function segmentDash(scoreLo: number, scoreHi: number, len: number): string {
  if (!len) return '0 1000'
  const span = scoreHi - scoreLo
  const within = Math.max(0, Math.min(span, displayScore.value - scoreLo))
  const visible = (within / span) * len
  return `${visible.toFixed(2)} ${len.toFixed(2)}`
}
const safeDash = computed(() => segmentDash(0,        40 - GAP, safeLen.value))
const warnDash = computed(() => segmentDash(40 + GAP, 70 - GAP, warnLen.value))
const critDash = computed(() => segmentDash(70 + GAP, 100,      critLen.value))

const ragColor = computed(() => {
  return props.band === 'safe' ? 'var(--rag-safe)'
       : props.band === 'warn' ? 'var(--rag-warn)'
       : 'var(--rag-crit)'
})

const descriptorClass = computed(() => 'descriptor ' + props.band)
const descriptorText = computed(() => bandLabel(props.band))

// ─── Animation ─────────────────────────────────────────────────────
let rafId: number | null = null

function animateTo(target: number, duration = 1400) {
  if (rafId) cancelAnimationFrame(rafId)
  const t0 = performance.now()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayScore.value = target
    return
  }

  // Phase 1: 0 → target+10  (0 – 45 % of duration, ease-out)
  // Phase 2: target+10 → target−4  (45 – 70 %, ease-in-out)
  // Phase 3: target−4 → target  (70 – 100 %, ease-in-out)
  const over  = Math.min(100, target + 10)
  const under = Math.max(0,   target - 4)

  const easeOut   = (t: number) => 1 - (1 - t) ** 2
  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

  function tick(now: number) {
    const t = Math.min((now - t0) / duration, 1)
    let v: number
    if (t < 0.45) {
      v = over * easeOut(t / 0.45)
    } else if (t < 0.70) {
      v = over + (under - over) * easeInOut((t - 0.45) / 0.25)
    } else {
      v = under + (target - under) * easeInOut((t - 0.70) / 0.30)
    }
    displayScore.value = v
    if (t < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      displayScore.value = target
      rafId = null
    }
  }
  rafId = requestAnimationFrame(tick)
}

function replay() {
  animateTo(props.score)
}

defineExpose({ replay })

onMounted(() => {
  safeLen.value = safeArcRef.value?.getTotalLength() ?? 0
  warnLen.value = warnArcRef.value?.getTotalLength() ?? 0
  critLen.value = critArcRef.value?.getTotalLength() ?? 0
  animateTo(props.score)
})

// Re-animate when score changes externally (e.g. band selector flip)
watch(() => props.score, (next) => {
  animateTo(next)
})
</script>

<template>
  <div class="risk-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size">
      <defs>
        <!-- Blur kernel for the inner glow layer -->
        <filter id="inner-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <!-- Hard mask: white circle = reveal, black outside = cut. crispEdges forces pixel-sharp boundary. -->
        <mask id="ring-glow-mask" maskUnits="userSpaceOnUse">
          <circle :cx="GEOM.cx" :cy="GEOM.cy" :r="GEOM.radius + GEOM.strokeW / 2" fill="white" shape-rendering="crispEdges" />
        </mask>
        <!-- Subtle directional shadow on the needle (light from left, shadow to right) -->
        <filter id="needle-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="3" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.65" />
        </filter>
      </defs>

      <!-- Inactive track (full 270° arc, flat ends) -->
      <path
        :d="trackPath"
        stroke="var(--color-truffle-80)"
        :stroke-width="GEOM.strokeW"
        fill="none"
        stroke-linecap="butt"
        opacity="0.55"
      />

      <!-- Inner glow layer: inner edge aligns with needle tip, clipped to inner side -->
      <g mask="url(#ring-glow-mask)" opacity="0.32">
        <path :d="safeArcPath" stroke="var(--rag-safe)" :stroke-width="glowStrokeW" fill="none" stroke-linecap="butt" :stroke-dasharray="safeDash" filter="url(#inner-glow)" />
        <path :d="warnArcPath" stroke="var(--rag-warn)" :stroke-width="glowStrokeW" fill="none" stroke-linecap="butt" :stroke-dasharray="warnDash" filter="url(#inner-glow)" />
        <path :d="critArcPath" stroke="var(--rag-crit)" :stroke-width="glowStrokeW" fill="none" stroke-linecap="butt" :stroke-dasharray="critDash" filter="url(#inner-glow)" />
      </g>

      <!-- Active RAG segments (solid, drawn on top of glow) -->
      <path
        ref="safeArcRef"
        :d="safeArcPath"
        stroke="var(--rag-safe)"
        :stroke-width="GEOM.strokeW"
        fill="none"
        stroke-linecap="butt"
        :stroke-dasharray="safeDash"
      />
      <path
        ref="warnArcRef"
        :d="warnArcPath"
        stroke="var(--rag-warn)"
        :stroke-width="GEOM.strokeW"
        fill="none"
        stroke-linecap="butt"
        :stroke-dasharray="warnDash"
      />
      <path
        ref="critArcRef"
        :d="critArcPath"
        stroke="var(--rag-crit)"
        :stroke-width="GEOM.strokeW"
        fill="none"
        stroke-linecap="butt"
        :stroke-dasharray="critDash"
      />

      <!-- Score needle: flush with outer ring edge, 20 px past inner edge -->
      <line
        :x1="currentMarker.x1" :y1="currentMarker.y1"
        :x2="currentMarker.x2" :y2="currentMarker.y2"
        stroke="var(--color-white)"
        stroke-width="2.5"
        stroke-linecap="butt"
        filter="url(#needle-shadow)"
      />
    </svg>

    <div class="center">
      <div class="lbl">{{ label }}</div>
      <div :class="['score-num', band]">{{ Math.round(displayScore) }}</div>
      <div :class="descriptorClass">{{ descriptorText }}</div>
    </div>
  </div>
</template>

<style scoped>
.risk-ring {
  position: relative;
  display: inline-block;
}
.risk-ring svg {
  display: block;
  overflow: visible;
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  text-align: center;
  transform: translateY(8px);
}
.lbl {
  font-size: var(--text-xs);
  letter-spacing: 3px;
  color: var(--content-subtle);
  text-transform: uppercase;
  font-weight: var(--fw-bold);
  margin-bottom: var(--space-1);
}
.score-num {
  font-size: 120px;
  line-height: 0.9;
  letter-spacing: -4px;
  color: var(--content-default);
  font-weight: var(--fw-black);
  font-family: var(--font-sans);
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
  font-variant-numeric: tabular-nums;
  transition: color var(--t-fast) var(--ease-out);
}
.score-num.safe { color: var(--rag-safe); }
.score-num.warn { color: var(--rag-warn); }
.score-num.crit { color: var(--rag-crit); }
.descriptor {
  margin-top: var(--space-2);
  font-size: 13px;
  letter-spacing: 2.4px;
  font-weight: var(--fw-extra-bold);
  text-transform: uppercase;
}
.descriptor.safe { color: var(--rag-safe); }
.descriptor.warn { color: var(--rag-warn); }
.descriptor.crit { color: var(--rag-crit); }
</style>
