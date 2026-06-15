<script setup lang="ts">
import type { Band, Metric, AgentInsight } from '../data/mockData'

defineProps<{
  indexCode: string
  indexName: string
  indexScore: number
  band: Band
  metrics: Metric[]
  agent: AgentInsight
}>()
defineEmits<{ (e: 'close'): void }>()

function deltaSymbol(d?: Metric['delta']) {
  if (!d) return ''
  return d.dir === 'up' ? '▲' : d.dir === 'down' ? '▼' : '—'
}
</script>

<template>
  <section :class="['drawer', band]" role="region" :aria-label="`Drill into ${indexName}`">
    <header class="head">
      <h4>
        {{ indexName }} Exposure
        <span :class="['tag', band]">{{ indexCode }} · {{ indexScore }}</span>
      </h4>
      <button class="close" @click="$emit('close')" aria-label="Close drawer">esc</button>
    </header>

    <div class="body">
      <!-- Left: metric rows -->
      <div class="col">
        <h5>What moved (last 24h)</h5>
        <div
          v-for="(m, i) in metrics" :key="i"
          class="metric"
          :class="{ changed: m.changed }"
        >
          <div class="metric-left">
            <div class="name">
              {{ m.name }}
              <span class="src">{{ m.source }}</span>
            </div>
            <div v-if="m.scoreImpact" class="score-impact">{{ m.scoreImpact }}</div>
          </div>
          <div class="metric-right">
            <div class="val" :class="m.band">
              {{ m.value }}
              <span v-if="m.delta" class="delta">{{ deltaSymbol(m.delta) }} {{ m.delta.amount }}</span>
            </div>
            <a
              v-if="m.sourceUrl"
              :href="m.sourceUrl"
              target="_blank"
              rel="noopener"
              class="source-link"
              :aria-label="`View in ${m.source}`"
            >↗ {{ m.source }}</a>
          </div>
        </div>
      </div>

      <!-- Right: action panel (no AI branding) -->
      <div class="col">
        <h5>Recommended action</h5>
        <div class="action-panel">
          <h6>{{ agent.title }}</h6>
          <p>{{ agent.body }}</p>
          <p v-if="agent.code">
            <code>{{ agent.code }}</code>
          </p>

          <!-- Action card -->
          <div class="action-card">
            <p class="action-text">{{ agent.action }}</p>
            <div class="action-meta">
              <div class="meta-row">
                <span class="meta-label">SLA</span>
                <span class="meta-value sla">{{ agent.sla }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Owner</span>
                <span class="meta-value">{{ agent.owner }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Impact</span>
                <span class="meta-value impact">{{ agent.scoreImpact }}</span>
              </div>
            </div>
          </div>

          <div class="actions">
            <a
              class="btn-primary"
              :href="agent.jiraUrl || '#'"
              target="_blank"
              rel="noopener"
              @click.prevent="agent.jiraUrl ? undefined : void 0"
            >Open in Jira</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.drawer {
  margin-top: var(--space-4);
  background: var(--surface-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.drawer.safe { border-color: var(--rag-safe); box-shadow: 0 0 0 4px var(--rag-safe-soft); }
.drawer.warn { border-color: var(--rag-warn); box-shadow: 0 0 0 4px var(--rag-warn-soft); }
.drawer.crit { border-color: var(--rag-crit); box-shadow: 0 0 0 4px var(--rag-crit-soft); }

.head {
  padding: 14px 18px;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border-default);
}
.drawer.safe .head { background: var(--rag-safe-soft); }
.drawer.warn .head { background: var(--rag-warn-soft); }
.drawer.crit .head { background: var(--rag-crit-soft); }

.head h4 { margin: 0; font-size: var(--text-sm); font-weight: var(--fw-bold); color: var(--content-default); }
.head .tag {
  color: var(--content-default);
  font-size: 10.5px; padding: 3px 10px; border-radius: var(--radius-pill);
  margin-left: var(--space-2); font-weight: var(--fw-bold); letter-spacing: 0.5px;
}
.head .tag.safe { background: var(--rag-safe); }
.head .tag.warn { background: var(--rag-warn); }
.head .tag.crit { background: var(--rag-crit); }
.close {
  background: transparent; border: none;
  font-family: var(--font-mono); font-size: 11px;
  color: var(--content-subtle);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.close:hover { color: var(--content-default); background: rgba(255,255,255,0.06); }

.body {
  padding: 18px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
}

.col h5 {
  margin: 0 0 var(--space-3);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--content-disabled);
  font-weight: var(--fw-extra-bold);
}

/* Metric rows */
.metric {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 10px 14px;
  background: var(--surface-inset);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
  gap: var(--space-3);
}
.metric.changed { box-shadow: inset 3px 0 0 var(--rag-crit); }

.metric-left { flex: 1; min-width: 0; }
.metric-right { flex-shrink: 0; text-align: right; }

.name { font-size: 13px; color: var(--content-subtle); }
.name .src {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--content-disabled);
  margin-left: 8px; text-transform: lowercase;
}

.score-impact {
  font-size: 11px;
  color: var(--rag-safe);
  font-weight: var(--fw-bold);
  margin-top: 3px;
}

.val {
  font-size: 14px; font-weight: var(--fw-extra-bold);
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
}
.val .delta { font-size: 11px; margin-left: 6px; font-weight: var(--fw-bold); }
.val.safe { color: var(--rag-safe); }
.val.warn { color: var(--rag-warn); }
.val.crit { color: var(--rag-crit); }

.source-link {
  display: block;
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--content-disabled);
  text-decoration: none;
  margin-top: 3px;
}
.source-link:hover { color: var(--content-subtle); text-decoration: underline; }

/* Action panel */
.action-panel {
  background: var(--surface-inset);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 16px;
}

h6 { margin: 0 0 var(--space-2); font-size: var(--text-sm); color: var(--content-default); font-weight: var(--fw-bold); }
.action-panel p { margin: 0 0 var(--space-2); font-size: 12.5px; color: var(--content-subtle); line-height: 1.55; }
.action-panel code { color: var(--color-aubergine-20); font-size: 11.5px; }
.action-panel strong { color: var(--content-default); font-weight: var(--fw-bold); }

/* Action card */
.action-card {
  background: rgba(0,0,0,0.18);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin: var(--space-3) 0;
}

.action-text {
  font-size: 13px !important;
  font-weight: var(--fw-bold) !important;
  color: var(--content-default) !important;
  margin-bottom: var(--space-3) !important;
}

.action-meta { display: flex; flex-direction: column; gap: 6px; }

.meta-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 12px;
}

.meta-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: var(--fw-extra-bold);
  color: var(--content-disabled);
  width: 44px;
  flex-shrink: 0;
}

.meta-value { color: var(--content-subtle); font-weight: var(--fw-bold); }
.meta-value.sla { color: var(--rag-warn); }
.meta-value.impact { color: var(--rag-safe); }

.actions { margin-top: var(--space-3); }

.btn-primary {
  font-size: 12px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: background var(--t-fast) var(--ease-out);
  background: var(--interactive-brand);
  color: var(--interactive-brand-content);
  text-decoration: none;
  display: inline-block;
}
.btn-primary:hover { background: var(--interactive-brand-hover); }

@media (max-width: 800px) {
  .body { grid-template-columns: 1fr; }
}
</style>
