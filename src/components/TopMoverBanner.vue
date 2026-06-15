<script setup lang="ts">
defineProps<{
  indexName: string
  indexCode: string
  direction: 'up' | 'down'
  amount: number
  driver: string
  sla: string
  owner: string
  scoreImpact: string
}>()
</script>

<template>
  <div class="banner" role="status" :class="direction === 'up' ? 'rising' : 'falling'">
    <div class="left">
      <div class="label">Today's top mover</div>
      <h4>
        <span class="dir-badge" :class="direction">{{ direction === 'up' ? '▲' : '▼' }} {{ direction === 'up' ? '+' : '−' }}{{ amount }} pts</span>
        {{ indexName }} — {{ driver }}
      </h4>
    </div>

    <div class="action-card">
      <div class="action-meta">
        <span class="sla">{{ sla }}</span>
        <span class="sep">·</span>
        <span class="owner">{{ owner }}</span>
      </div>
      <div class="impact">{{ scoreImpact }}</div>
    </div>

    <div class="actions">
      <a class="btn-primary" href="#" @click.prevent>Open in Jira</a>
    </div>
  </div>
</template>

<style scoped>
.banner {
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-bottom: var(--space-5);
  border: 1px solid var(--border-default);
  background: var(--surface-subtle);
}

.banner.rising {
  border-color: var(--rag-crit);
  background: var(--rag-crit-soft);
}

.banner.falling {
  border-color: var(--rag-safe);
  background: var(--rag-safe-soft);
}

.left { flex: 1; min-width: 0; }

.label {
  font-size: 10.5px;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: var(--fw-extra-bold);
  color: var(--content-disabled);
  margin-bottom: 4px;
}

h4 {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--content-default);
  font-weight: var(--fw-bold);
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.dir-badge {
  font-size: 12px;
  font-weight: var(--fw-extra-bold);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  flex-shrink: 0;
}
.dir-badge.up   { background: var(--rag-crit); color: var(--content-inverse); }
.dir-badge.down { background: var(--rag-safe); color: var(--content-inverse); }

/* Action card — SLA + owner + impact */
.action-card {
  flex-shrink: 0;
  background: rgba(0,0,0,0.18);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  text-align: right;
}

.action-meta {
  font-size: 11.5px;
  color: var(--content-subtle);
  font-weight: var(--fw-bold);
  margin-bottom: 3px;
}

.sep { opacity: 0.4; margin: 0 4px; }
.owner { color: var(--content-subtle); }

.impact {
  font-size: 12.5px;
  font-weight: var(--fw-extra-bold);
  color: var(--rag-safe);
}

.btn-primary {
  font-size: var(--text-xs);
  padding: 9px 18px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: var(--fw-bold);
  background: var(--interactive-brand);
  color: var(--interactive-brand-content);
  transition: background var(--t-fast) var(--ease-out);
  white-space: nowrap;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
}
.btn-primary:hover { background: var(--interactive-brand-hover); }

@media (max-width: 800px) {
  .banner { flex-direction: column; align-items: flex-start; gap: var(--space-3); }
  .action-card { text-align: left; }
  .actions { width: 100%; }
  .btn-primary { width: 100%; text-align: center; }
}
</style>
