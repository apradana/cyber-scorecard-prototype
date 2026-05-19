<script setup lang="ts">
import { ref } from 'vue'

const dismissed = ref(false)

function dismiss() {
  dismissed.value = true
  // Persist for the session (and reloads) — per-user dismissible
  try {
    localStorage.setItem('cyberscorecard.dip-dismissed', '1')
  } catch {}
}
</script>

<template>
  <div v-if="!dismissed" class="banner" role="status">
    <div class="icon" aria-hidden="true">!</div>
    <div class="text">
      <div class="label">Launch month — expect rising scores</div>
      <h4>We're surfacing hidden debt this month — scores will rise before they settle.</h4>
      <p>
        Higher ≠ broken — we're seeing risk we previously couldn't.
        Targets recalibrate from Month 2.
        <a href="#" @click.prevent>Learn why →</a>
      </p>
    </div>
    <button class="dismiss" @click="dismiss" aria-label="Dismiss banner">×</button>
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
  border: 1px solid var(--rag-warn);
  background: var(--rag-warn-soft);
}
.icon {
  width: 32px; height: 32px;
  border-radius: var(--radius-pill);
  display: flex; align-items: center; justify-content: center;
  font-weight: var(--fw-extra-bold);
  font-size: var(--text-base);
  background: var(--rag-warn);
  color: var(--color-truffle-100);
  flex-shrink: 0;
}
.text { flex: 1; min-width: 0; }
.label {
  font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
  font-weight: var(--fw-extra-bold);
  color: var(--rag-warn);
}
h4 {
  margin: 3px 0 1px;
  font-size: var(--text-sm);
  color: var(--content-default);
  font-weight: var(--fw-bold);
  line-height: 1.4;
}
p {
  margin: 0;
  font-size: 12.5px;
  color: var(--content-subtle);
  line-height: 1.45;
}
a { color: var(--rag-warn); font-weight: var(--fw-bold); text-decoration: underline; }

.dismiss {
  background: transparent;
  border: none;
  color: var(--content-subtle);
  font-size: 22px;
  cursor: pointer;
  padding: 4px 10px;
  line-height: 1;
  transition: color var(--t-fast) var(--ease-out);
}
.dismiss:hover { color: var(--content-default); }
</style>
