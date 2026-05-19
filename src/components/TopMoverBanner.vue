<script setup lang="ts">
defineProps<{
  indexName: string
  indexCode: string
  direction: 'up' | 'down'
  amount: number
  driver: string
  recommendation: string
  projectedImpact: string
}>()
</script>

<template>
  <div class="banner" role="status">
    <div class="icon" aria-hidden="true">{{ direction === 'up' ? '▲' : '▼' }}</div>
    <div class="text">
      <div class="label">Today's top mover</div>
      <h4>
        {{ indexName }}
        <span class="dir">{{ direction === 'up' ? '↑' : '↓' }} {{ amount > 0 ? '+' : '' }}{{ direction === 'up' ? '+' : '−' }}{{ amount }} pts</span>
        in 24h — driven by {{ driver }}
      </h4>
      <p>
        Agent's recommended fix: <strong>{{ recommendation }}</strong>
        · projected impact: {{ projectedImpact }}
      </p>
    </div>
    <div class="actions">
      <button class="btn-primary">Open in Jira</button>
    </div>
  </div>
</template>

<style scoped>
.banner {
  padding: var(--space-4) 18px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
  border: 1px solid var(--rag-crit);
  background: var(--rag-crit-soft);
}
.icon {
  width: 32px; height: 32px;
  border-radius: var(--radius-pill);
  display: flex; align-items: center; justify-content: center;
  font-weight: var(--fw-extra-bold);
  background: var(--rag-crit);
  color: var(--content-inverse);
  flex-shrink: 0;
}
.text { flex: 1; min-width: 0; }
.label {
  font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
  font-weight: var(--fw-extra-bold);
  color: var(--rag-crit);
}
h4 {
  margin: 3px 0 1px;
  font-size: var(--text-sm);
  color: var(--content-default);
  font-weight: var(--fw-bold);
  line-height: 1.4;
}
.dir { font-weight: var(--fw-extra-bold); color: var(--rag-crit); }
p {
  margin: 0;
  font-size: 12.5px;
  color: var(--content-subtle);
  line-height: 1.45;
}
strong { color: var(--content-default); font-weight: var(--fw-bold); }

.btn-primary {
  font-size: var(--text-xs);
  padding: 9px 18px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: var(--fw-bold);
  background: var(--interactive-brand);
  color: var(--interactive-brand-content);
  transition: background var(--t-fast) var(--ease-out);
}
.btn-primary:hover { background: var(--interactive-brand-hover); }

@media (max-width: 700px) {
  .banner { flex-direction: column; align-items: flex-start; }
  .actions { width: 100%; }
  .btn-primary { width: 100%; }
}
</style>
