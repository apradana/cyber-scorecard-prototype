<script setup lang="ts">
import type { IndexCard } from '../data/mockData'
import { bandLabel } from '../data/mockData'

const props = defineProps<{
  card: IndexCard
  selected?: boolean
  progress?: number
}>()
defineEmits<{ (e: 'select', code: string): void }>()
</script>

<template>
  <button
    class="tile"
    :class="[card.band, { selected: props.selected }]"
    @click="$emit('select', card.code)"
    :aria-pressed="props.selected"
  >
    <span class="rag-strip" />
    <div class="pad">
      <div class="head">
        <div class="name">{{ card.name }}</div>
        <div class="code">{{ card.code }}</div>
      </div>
      <div class="row-body">
        <div class="score">{{ Math.round(card.score * (props.progress ?? 1)) }}</div>
        <div class="max">/ 100</div>
      </div>
      <div class="descriptor">{{ bandLabel(card.band) }}</div>
      <div class="delta-line">
        <div class="delta">
          <template v-if="card.delta.dir === 'up'">
            <span class="up">▲ +{{ card.delta.amount }}</span> since 24h
          </template>
          <template v-else-if="card.delta.dir === 'down'">
            <span class="down">▼ −{{ card.delta.amount }}</span> since 24h
          </template>
          <template v-else>
            <span class="flat">— flat</span> since 24h
          </template>
        </div>
        <div class="note">{{ card.note }}</div>
      </div>
      <div v-if="card.topAction" class="top-action">
        <span class="action-icon">→</span> {{ card.topAction }}
      </div>
    </div>
  </button>
</template>

<style scoped>
.tile {
  background: var(--surface-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color var(--t-fast) var(--ease-out),
    transform var(--t-fast) var(--ease-out),
    box-shadow var(--t-fast) var(--ease-out);
  text-align: left;
  font-family: inherit;
  color: inherit;
  padding: 0;
  width: 100%;
}

/* Default border: subtle RAG-tinted, by band */
.tile.safe { border-color: var(--rag-safe-soft); }
.tile.warn { border-color: var(--rag-warn-soft); }
.tile.crit { border-color: var(--rag-crit-soft); }

/* Hover: lift + strengthen the band-coloured border */
.tile:hover { transform: translateY(-2px); }
.tile.safe:hover { border-color: var(--rag-safe); }
.tile.warn:hover { border-color: var(--rag-warn); }
.tile.crit:hover { border-color: var(--rag-crit); }

/* Selected (drawer open): full RAG border + matching glow */
.tile.selected.safe {
  border-color: var(--rag-safe);
  box-shadow: 0 0 0 1px var(--rag-safe), 0 0 0 5px var(--rag-safe-soft);
}
.tile.selected.warn {
  border-color: var(--rag-warn);
  box-shadow: 0 0 0 1px var(--rag-warn), 0 0 0 5px var(--rag-warn-soft);
}
.tile.selected.crit {
  border-color: var(--rag-crit);
  box-shadow: 0 0 0 1px var(--rag-crit), 0 0 0 5px var(--rag-crit-soft);
}

.rag-strip { display: block; height: 4px; width: 100%; }
.tile.safe .rag-strip { background: var(--rag-safe); }
.tile.warn .rag-strip { background: var(--rag-warn); }
.tile.crit .rag-strip { background: var(--rag-crit); }

.pad { padding: 18px 20px 16px; }
.head { display: flex; justify-content: space-between; align-items: baseline; }
.name {
  font-size: 11px;
  color: var(--content-subtle);
  font-weight: var(--fw-extra-bold);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.code {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--content-disabled);
  letter-spacing: 0.5px;
}

.row-body { display: flex; align-items: flex-end; gap: var(--space-3); margin-top: var(--space-3); }
.score {
  font-size: 48px;
  font-weight: var(--fw-black);
  font-family: var(--font-sans);
  line-height: 1;
  letter-spacing: -1.5px;
  font-variant-numeric: tabular-nums;
}
.tile.safe .score { color: var(--rag-safe); }
.tile.warn .score { color: var(--rag-warn); }
.tile.crit .score { color: var(--rag-crit); }
.max { font-size: var(--text-sm); color: var(--content-disabled); padding-bottom: 7px; font-weight: var(--fw-bold); }

.descriptor {
  font-size: 10.5px; letter-spacing: 2px; text-transform: uppercase;
  font-weight: var(--fw-extra-bold);
  margin-top: var(--space-2);
}
.tile.safe .descriptor { color: var(--rag-safe); }
.tile.warn .descriptor { color: var(--rag-warn); }
.tile.crit .descriptor { color: var(--rag-crit); }

.delta-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-default);
  font-size: var(--text-xs);
  color: var(--content-disabled);
}
.delta .up   { color: var(--rag-crit); font-weight: var(--fw-extra-bold); }
.delta .down { color: var(--rag-safe); font-weight: var(--fw-extra-bold); }
.delta .flat { color: var(--content-disabled); font-weight: var(--fw-extra-bold); }

.top-action {
  margin-top: var(--space-2);
  font-size: 11px;
  color: var(--rag-safe);
  font-weight: var(--fw-bold);
  line-height: 1.4;
  padding: 6px 0 0;
  border-top: 1px dashed rgba(255,255,255,0.07);
}
.action-icon {
  opacity: 0.7;
  font-style: normal;
}
</style>
