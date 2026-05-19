<script setup lang="ts">
import { product } from '../data/mockData'
</script>

<template>
  <a class="chip" :href="product.feedbackUrl" target="_blank" rel="noopener">
    <span class="dot" aria-hidden="true">💬</span>
    Leave feedback in Slack
  </a>
</template>

<style scoped>
.chip {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  background: var(--interactive-brand);
  color: var(--interactive-brand-content);
  font-weight: var(--fw-bold);
  font-size: var(--text-sm);
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  text-decoration: none;
  box-shadow: var(--shadow-mid);
  z-index: 100;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: background var(--t-fast) var(--ease-out), transform var(--t-fast) var(--ease-out);
}
.chip:hover {
  background: var(--interactive-brand-hover);
  transform: translateY(-2px);
}
.dot { font-size: 14px; line-height: 1; }
</style>
