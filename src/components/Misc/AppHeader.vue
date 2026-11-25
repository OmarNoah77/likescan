<template>
  <header class="app-header" :style="{ background: isDark ? 'rgba(16,16,20,0.78)' : 'rgba(255,255,255,0.78)' }">
    <div class="inner">
      <router-link :to="{ name: 'index' }" class="brand">
        <img src="/favicon.svg" alt="" class="logo" />
        <span>{{ t('base.title') }}</span>
      </router-link>

      <nav class="links">
        <router-link :to="{ name: 'index' }" class="link" exact-active-class="active">
          {{ t('nav.home') }}
        </router-link>
        <router-link :to="{ name: 'scan' }" class="link" active-class="active">
          {{ t('nav.scan') }}
        </router-link>
      </nav>

      <div class="actions">
        <n-button quaternary circle :title="themeLabel" :aria-label="themeLabel" @click="cycle">
          <template #icon>
            <n-icon>
              <Screen v-if="mode === 'auto'" />
              <Light v-else-if="mode === 'light'" />
              <Asleep v-else />
            </n-icon>
          </template>
        </n-button>
        <n-button
          quaternary
          circle
          tag="a"
          :href="REPO"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
        >
          <template #icon>
            <n-icon><LogoGithub /></n-icon>
          </template>
        </n-button>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { Light, Asleep, Screen, LogoGithub } from '@vicons/carbon'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/use-theme'

const REPO = 'https://github.com/OmarNoah77/likescan'
const { t } = useI18n()
const { mode, cycle, isDark } = useTheme()

const themeLabel = computed(
  () => `${t('nav.theme')}: ${t('nav.theme_' + mode.value)}`
)
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: saturate(1.4) blur(10px);
  -webkit-backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid rgba(128, 128, 128, 0.18);
}
.inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.05rem;
  color: inherit;
  text-decoration: none;
}
.logo {
  width: 26px;
  height: 26px;
}
.links {
  display: flex;
  gap: 4px;
  flex: 1;
}
.link {
  color: inherit;
  opacity: 0.7;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  transition: opacity 0.15s, background 0.15s;
}
.link:hover {
  opacity: 1;
  background: rgba(128, 128, 128, 0.12);
}
.link.active {
  opacity: 1;
  background: rgba(99, 226, 183, 0.16);
}
.actions {
  display: flex;
  gap: 2px;
}
@media (max-width: 480px) {
  .inner {
    gap: 8px;
  }
  .brand span {
    display: none;
  }
}
</style>
