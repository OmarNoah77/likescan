<template>
  <n-card class="feature-card" :bordered="true">
    <n-h3 prefix="bar">
      <n-icon size="1em" :component="icon" style="margin-right: 0.5em" />{{ title }}
    </n-h3>
    <n-p>
      <slot></slot>
    </n-p>
  </n-card>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { NH3, NP, NIcon, NCard } from 'naive-ui'

defineProps<{ title: string; icon: Component }>()
</script>

<style scoped>
.feature-card {
  height: 100%;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}
</style>
