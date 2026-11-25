<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider>
      <AppHeader />
      <main class="view"><RouterView :key="route.fullPath" /></main>
      <AppFooter />
      <ServieWorkerReloadPrompt />
    </n-message-provider>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { NConfigProvider, NGlobalStyle, NMessageProvider } from 'naive-ui'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/Misc/AppHeader.vue'
import AppFooter from '@/components/Misc/AppFooter.vue'
import { useTheme } from '@/composables/use-theme'
import { useRoute } from 'vue-router'
import ServieWorkerReloadPrompt from '@/components/Misc/ServiceWorkerReloadPrompt.vue'

const route = useRoute()

const { theme } = useTheme()
</script>
