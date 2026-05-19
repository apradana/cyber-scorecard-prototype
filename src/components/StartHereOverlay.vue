<script setup lang="ts">
import { onMounted, ref } from 'vue'

const visible = ref(false)
const STORAGE_KEY = 'cyberscorecard.starthere-seen'

onMounted(() => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Slight delay so the rev animation starts first
      setTimeout(() => { visible.value = true }, 1400)
    }
  } catch {
    visible.value = true
  }
})

function dismiss() {
  visible.value = false
  try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
}
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="overlay" @click="dismiss">
      <div class="card" @click.stop>
        <div class="eyebrow">Welcome to the prototype</div>
        <h2>A 30-second tour</h2>
        <ol>
          <li><strong>The ring</strong> is your team's overall risk score. Higher = more exposure. Watch the rev — it carries the change since yesterday.</li>
          <li><strong>The top-mover banner</strong> calls out the single change that drove the score, and the one fix to make.</li>
          <li><strong>Click any index tile</strong> to open a drawer with the metric breakdown and the agent's take.</li>
          <li><strong>Feedback?</strong> Hit the "Leave feedback" chip in the bottom-right — or just message me in Slack.</li>
        </ol>
        <div class="actions">
          <button class="btn-primary" @click="dismiss">Got it</button>
        </div>
        <div class="footnote">This message won't show again. Clear local storage to see it.</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: var(--surface-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}
.card {
  background: var(--surface-subtle);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  padding: var(--space-6) var(--space-8);
  max-width: 460px;
  width: 100%;
  box-shadow: var(--shadow-high);
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 1.4px;
  font-weight: var(--fw-extra-bold);
  color: var(--content-brand);
  text-transform: uppercase;
  margin-bottom: var(--space-2);
}
h2 { margin: 0 0 var(--space-3); font-size: var(--text-md); font-weight: var(--fw-extra-bold); }
ol { margin: 0; padding-left: 18px; font-size: 13.5px; line-height: 1.6; color: var(--content-subtle); }
ol li { margin-bottom: var(--space-2); }
ol strong { color: var(--content-default); font-weight: var(--fw-bold); }
.actions { display: flex; gap: var(--space-2); margin-top: var(--space-5); }
.btn-primary {
  font-size: var(--text-sm);
  padding: 10px 22px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: var(--fw-bold);
  background: var(--interactive-brand);
  color: var(--interactive-brand-content);
  cursor: pointer;
  transition: background var(--t-fast) var(--ease-out);
}
.btn-primary:hover { background: var(--interactive-brand-hover); }
.footnote { margin-top: var(--space-3); font-size: 11px; color: var(--content-disabled); }

.fade-enter-active, .fade-leave-active { transition: opacity var(--t-med) var(--ease-out); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
