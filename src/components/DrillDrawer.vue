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
      <div class="col">
        <h5>What moved (last 24h)</h5>
        <div
          v-for="(m, i) in metrics" :key="i"
          class="metric"
          :class="{ changed: m.changed }"
        >
          <div class="name">
            {{ m.name }}
            <span class="src">{{ m.source }}</span>
          </div>
          <div class="val" :class="m.band">
            {{ m.value }}
            <span v-if="m.delta" class="delta">{{ deltaSymbol(m.delta) }} {{ m.delta.amount }}</span>
          </div>
        </div>
      </div>

      <div class="col">
        <h5>Agent's take</h5>
        <div class="agent">
          <div class="agent-head">
            <div class="bot" aria-hidden="true">🤖</div>
            <div class="head-label">Daily insight · agent-verified</div>
          </div>
          <h6>{{ agent.title }}</h6>
          <p>{{ agent.body }}</p>
          <p v-if="agent.code">
            <code>{{ agent.code }}</code>
          </p>
          <p>
            <strong>Recommended:</strong> {{ agent.recommendation }}
            Projected impact: <strong class="positive">{{ agent.projectedImpact }}</strong>.
          </p>
          <div class="actions">
            <button class="btn-primary">Open in Jira</button>
            <button class="btn-secondary">Snooze</button>
            <span class="feedback" aria-label="Rate this insight">👍 👎</span>
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

.metric {
  display: flex; justify-content: space-between; align-items: center;
  padding: 11px 14px;
  background: var(--surface-inset);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
}
.metric.changed { box-shadow: inset 3px 0 0 var(--rag-crit); }
.metric .name { font-size: 13px; color: var(--content-subtle); }
.metric .name .src {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--content-disabled);
  margin-left: 8px; text-transform: lowercase;
}
.metric .val {
  font-size: 14px; font-weight: var(--fw-extra-bold);
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
}
.metric .val .delta { font-size: 11px; margin-left: 6px; font-weight: var(--fw-bold); font-style: normal; }
.val.safe { color: var(--rag-safe); }
.val.warn { color: var(--rag-warn); }
.val.crit { color: var(--rag-crit); }

.agent {
  background: var(--agent-bg);
  border: 1px solid var(--agent-border);
  border-radius: var(--radius-md);
  padding: 16px;
}
.agent-head { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); }
.bot {
  width: 26px; height: 26px; border-radius: var(--radius-pill);
  background: var(--agent-icon-bg);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
}
.head-label {
  font-size: 11px; color: var(--agent-label-color);
  text-transform: uppercase; letter-spacing: 1px;
  font-weight: var(--fw-extra-bold);
}
h6 { margin: 0 0 var(--space-2); font-size: var(--text-sm); color: var(--content-default); font-weight: var(--fw-bold); }
.agent p { margin: 0 0 var(--space-2); font-size: 12.5px; color: var(--content-subtle); line-height: 1.55; }
.agent code { color: var(--color-aubergine-20); font-size: 11.5px; }
.agent strong { color: var(--content-default); font-weight: var(--fw-bold); }
.agent strong.positive { color: var(--rag-safe); }

.actions { display: flex; gap: var(--space-2); align-items: center; margin-top: var(--space-3); }
.btn-primary, .btn-secondary {
  font-size: 12px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: background var(--t-fast) var(--ease-out);
}
.btn-primary { background: var(--interactive-brand); color: var(--interactive-brand-content); }
.btn-primary:hover { background: var(--interactive-brand-hover); }
.btn-secondary {
  background: transparent; color: var(--content-subtle);
  border: 1px solid var(--border-default);
}
.btn-secondary:hover { border-color: var(--border-strong); color: var(--content-default); }

.feedback {
  margin-left: auto;
  font-size: 14px;
  color: var(--content-disabled);
  cursor: pointer;
}

@media (max-width: 800px) {
  .body { grid-template-columns: 1fr; }
}
</style>
