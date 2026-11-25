<template>
  <footer class="app-footer">
    <n-text depth="3">
      {{ t('home.footer') }}
      <a href="https://github.com/rwv/lookscanned.io" target="_blank" rel="noopener">rwv/lookscanned.io</a>
      · MIT
    </n-text>
  </footer>
</template>

<script lang="ts" setup>
import { NText } from 'naive-ui'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.app-footer {
  text-align: center;
  padding: 24px 15px 40px;
  font-size: 13px;
  border-top: 1px solid rgba(128, 128, 128, 0.18);
  margin-top: 40px;
}
a {
  color: inherit;
  text-decoration: underline;
}
</style>
