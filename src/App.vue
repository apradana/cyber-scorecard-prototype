<script setup lang="ts">
import { onMounted } from 'vue'
import ScorecardOverview from './components/ScorecardOverview.vue'
import StartHereOverlay from './components/StartHereOverlay.vue'
import FeedbackChip from './components/FeedbackChip.vue'

onMounted(() => {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.add('light')
  }
})
</script>

<template>
  <ScorecardOverview />
  <FeedbackChip />
  <StartHereOverlay />
</template>
