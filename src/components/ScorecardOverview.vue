<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { bandFor, defaultTeam, teamStates, type Band, product } from '../data/mockData'
import RiskRing from './RiskRing.vue'
import PageChrome from './PageChrome.vue'
import IndexTile from './IndexTile.vue'
import DrillDrawer from './DrillDrawer.vue'
import TrendBars from './TrendBars.vue'

// ─── Demo controls ──────────────────────────────────────────────────
const selectedBand = ref<Band>('crit')
const selectedIndexCode = ref<string | null>(null)

const team = computed(() => ({
  ...defaultTeam,
  ...teamStates[selectedBand.value],
}))

const ringRef = useTemplateRef<InstanceType<typeof RiskRing>>('ringRef')

// ─── Tile score animation ────────────────────────────────────────────
const tileProgress = ref(0)
let tileRafId: number | null = null

function animateTiles(duration = 1200) {
  if (tileRafId) cancelAnimationFrame(tileRafId)
  tileProgress.value = 0
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tileProgress.value = 1
    return
  }
  const t0 = performance.now()
  function tick(now: number) {
    const p = Math.min((now - t0) / duration, 1)
    tileProgress.value = 1 - (1 - p) ** 3
    if (p < 1) tileRafId = requestAnimationFrame(tick)
    else { tileProgress.value = 1; tileRafId = null }
  }
  tileRafId = requestAnimationFrame(tick)
}

onMounted(() => animateTiles())
watch(selectedBand, () => animateTiles())

function selectIndex(code: string) {
  selectedIndexCode.value = selectedIndexCode.value === code ? null : code
}

function closeDrawer() {
  selectedIndexCode.value = null
}

function replayRev() {
  animateTiles()
  ringRef.value?.replay()
}
</script>

<template>
  <div class="page">

    <!-- Reviewer demo bar -->
    <aside class="demo-bar">
      <strong>Reviewer controls</strong>
      <span class="sep"></span>
      <label>
        Band:
        <select v-model="selectedBand">
          <option value="crit">Critical (78)</option>
          <option value="warn">Elevated (56)</option>
          <option value="safe">Low (24)</option>
        </select>
      </label>
      <button @click="replayRev" class="replay">↺ Replay</button>
      <span class="hint">v0.2 · prototype · mock data</span>
    </aside>

    <!-- Product surface -->
    <section class="mock" :aria-label="`${product.name} inside ${product.host}`">
      <PageChrome :team="team.name" />

      <div class="surface">
        <header class="head">
          <div class="left">
            <h2>{{ product.name }}</h2>
            <span class="meta">· {{ product.refreshCadence }} refresh · last updated {{ product.lastUpdated }}</span>
          </div>
          <span class="team-pill">Viewing <strong>{{ team.name }}</strong></span>
        </header>

        <!-- Hero: ring left, trend chart right -->
        <div class="hero">
          <!-- Left: score dial + delta stats -->
          <div class="ring-col">
            <RiskRing
              ref="ringRef"
              :score="team.overallScore!"
              :band="team.band!"
              :size="300"
            />

            <div class="delta-stats">
              <div class="stat">
                <div class="stat-lbl">Since yesterday</div>
                <div :class="['stat-val', team.deltaDay!.dir === 'up' ? 'crit' : team.deltaDay!.dir === 'down' ? 'safe' : '']">
                  <template v-if="team.deltaDay!.dir === 'up'">▲ +{{ team.deltaDay!.amount }} pts</template>
                  <template v-else-if="team.deltaDay!.dir === 'down'">▼ −{{ team.deltaDay!.amount }} pts</template>
                  <template v-else>— flat</template>
                </div>
                <div class="stat-sub">{{ team.deltaDay!.note }}</div>
              </div>

              <div class="stat">
                <div class="stat-lbl">Since baseline · {{ product.baselineDate }}</div>
                <div :class="['stat-val', team.deltaBaseline!.dir === 'up' ? 'warn' : team.deltaBaseline!.dir === 'down' ? 'safe' : '']">
                  <template v-if="team.deltaBaseline!.dir === 'up'">▲ +{{ team.deltaBaseline!.amount }} pts</template>
                  <template v-else-if="team.deltaBaseline!.dir === 'down'">▼ −{{ team.deltaBaseline!.amount }} pts</template>
                  <template v-else>— flat</template>
                </div>
                <div class="stat-sub">over {{ team.deltaBaseline!.daysSince }} days</div>
              </div>
            </div>
          </div>

          <!-- Right: bar chart -->
          <div class="chart-col">
            <TrendBars :data="team.trendData!" />
          </div>
        </div>

        <!-- Index tiles -->
        <div class="indices">
          <IndexTile
            v-for="card in team.indices"
            :key="card.code"
            :card="card"
            :selected="selectedIndexCode === card.code"
            :progress="tileProgress"
            @select="selectIndex"
          />
        </div>

        <!-- Drill drawer -->
        <DrillDrawer
          v-if="selectedIndexCode === 'CVEI'"
          :index-code="'CVEI'"
          :index-name="'Composite Vulnerability'"
          :index-score="78"
          :band="bandFor(78)"
          :metrics="team.cveiDetail!.metrics"
          :agent="team.cveiDetail!.agent"
          @close="closeDrawer"
        />
        <DrillDrawer
          v-else-if="selectedIndexCode === 'HREI'"
          :index-code="'HREI'"
          :index-name="'Human Risk'"
          :index-score="41"
          :band="bandFor(41)"
          :metrics="[
            { name: 'Awareness Training Latency', source: 'wiz', value: '89%', band: 'warn' },
            { name: 'Secure Coding Training Completion', source: 'jira', value: '35.5%', band: 'crit', scoreImpact: '−6 pts if 100%' },
            { name: 'Phishing Reporting Rate', source: 'jira', value: '18.2%', band: 'warn' },
            { name: 'Phishing Susceptibility', source: 'jira', value: '6.2%', band: 'safe' },
          ]"
          :agent="{
            title: 'HREI is stable',
            body: 'No significant movement in human-side signals in the last 24h. Phishing susceptibility down 0.4% week-on-week.',
            action: 'Complete secure coding training for the 35% still outstanding.',
            sla: 'Due 30 Jun · 15 days',
            owner: 'Engineering Leads',
            scoreImpact: 'HREI −6 if all complete',
          }"
          @close="closeDrawer"
        />
        <DrillDrawer
          v-else-if="selectedIndexCode === 'SCREI'"
          :index-code="'SCREI'"
          :index-name="'Supply Chain'"
          :index-score="97"
          :band="bandFor(97)"
          :metrics="[
            { name: 'Unmitigated Third Party Risks', source: 'jira', value: '26', band: 'crit', changed: true, delta: { dir: 'down', amount: '−2' }, scoreImpact: '−12 pts if <5' },
            { name: 'Open Third Party TRFs (Critical)', source: 'jira', value: '4', band: 'crit' },
            { name: 'High-severity TRFs', source: 'jira', value: '11', band: 'warn' },
          ]"
          :agent="{
            title: 'Two TRFs closed overnight',
            body: 'TRF-218 and TRF-741 moved to Remediation Complete. Score continues to be dominated by long-standing third-party risk.',
            action: 'Push for closure on the top 5 oldest TRFs in the next sprint.',
            sla: 'Next sprint · 8 days',
            owner: 'Supply Chain Security',
            scoreImpact: 'SCREI −12 if all 5 close',
          }"
          @close="closeDrawer"
        />
      </div>
    </section>

    <p class="footnote">
      <strong>Cyber Scorecard prototype · v0.2</strong> · all data is mock
    </p>
  </div>
</template>

<style scoped>
.page {
  max-width: 1180px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-6) var(--space-12);
}

/* ─── Reviewer demo bar ─── */
.demo-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  background: var(--surface-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 12.5px;
  color: var(--content-subtle);
  margin-bottom: var(--space-4);
}
.demo-bar strong { color: var(--content-default); font-weight: var(--fw-extra-bold); }
.demo-bar .sep { width: 1px; height: 18px; background: var(--border-default); }
.demo-bar label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: var(--fw-bold);
  cursor: pointer;
}
.demo-bar select {
  background: var(--surface-raised);
  color: var(--content-default);
  border: 1px solid var(--border-default);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: var(--fw-bold);
}
.demo-bar .replay {
  border: none;
  padding: 6px 14px;
  border-radius: var(--radius-md);
  font-weight: var(--fw-bold);
  font-size: var(--text-xs);
  cursor: pointer;
  background: var(--interactive-brand);
  color: var(--interactive-brand-content);
  transition: background var(--t-fast) var(--ease-out);
}
.demo-bar .replay:hover { background: var(--interactive-brand-hover); }
.demo-bar .hint { margin-left: auto; font-style: italic; opacity: 0.7; font-size: 11.5px; }

/* ─── Product mock surface ─── */
.mock {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--border-default);
  background: linear-gradient(180deg, var(--surface-subtle) 0%, var(--surface-default) 100%);
  box-shadow: var(--shadow-high);
}

.surface { padding: var(--space-8) var(--space-8) var(--space-10); }

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}
.head .left { display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }
.head h2 {
  margin: 0;
  font-size: var(--text-md);
  color: var(--content-default);
  font-weight: var(--fw-extra-bold);
  letter-spacing: 0.1px;
}
.head .meta { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--content-disabled); }
.team-pill {
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--border-default);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-size: 12.5px;
  color: var(--content-subtle);
  font-weight: var(--fw-bold);
}
.team-pill strong { color: var(--content-default); font-weight: var(--fw-extra-bold); }

/* ─── Hero ─── */
.hero {
  background: linear-gradient(170deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  margin-bottom: var(--space-5);
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--space-8);
  align-items: stretch;
}

/* ─── Left column: ring + delta stats ─── */
.ring-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.delta-stats {
  display: flex;
  gap: var(--space-6);
  width: 100%;
  padding: var(--space-4) var(--space-2);
  background: rgba(0,0,0,0.18);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
}

.stat { flex: 1; }

.stat-lbl {
  font-size: 10.5px;
  color: var(--content-disabled);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: var(--fw-bold);
  margin-bottom: var(--space-1);
}

.stat-val {
  font-size: var(--text-md);
  color: var(--content-default);
  font-weight: var(--fw-extra-bold);
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.stat-val.crit { color: var(--rag-crit); }
.stat-val.warn { color: var(--rag-warn); }
.stat-val.safe { color: var(--rag-safe); }
.stat-sub { font-size: 11px; color: var(--content-disabled); margin-top: 3px; }

/* ─── Right column: bar chart ─── */
.chart-col {
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

/* ─── Index tiles ─── */
.indices {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

/* ─── Footnote ─── */
.footnote {
  font-size: 11.5px;
  color: var(--content-disabled);
  text-align: center;
  margin-top: var(--space-6);
  line-height: 1.55;
}
.footnote strong { color: var(--content-subtle); font-weight: var(--fw-bold); }

/* ─── Responsive ─── */
@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    gap: var(--space-5);
    padding: var(--space-5);
  }
  .ring-col { flex-direction: row; flex-wrap: wrap; justify-content: center; }
  .delta-stats { flex: 1; min-width: 200px; }
  .indices { grid-template-columns: 1fr 1fr; }
  .surface { padding: var(--space-5); }
}

@media (max-width: 640px) {
  .page { padding: var(--space-3); }
  .head { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
  .delta-stats { flex-direction: column; gap: var(--space-3); }
  .indices { grid-template-columns: 1fr; }
  .ring-col { flex-direction: column; }
}
</style>
