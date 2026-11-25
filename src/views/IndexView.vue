<template>
  <MainContainer>
    <!-- Portada -->
    <section class="hero">
      <div class="hero-logo"><ScannerSvg style="width: 100%" /></div>
      <n-h1 class="hero-title">
        <n-gradient-text type="success" :gradient="gradient">{{ t('home.heroTitle') }}</n-gradient-text>
      </n-h1>
      <n-p class="hero-sub">{{ t('home.heroSubtitle') }}</n-p>
      <n-space justify="center" :size="14">
        <router-link :to="{ name: 'scan' }" #="{ navigate, href }" custom>
          <n-button type="primary" size="large" round tag="a" :href="href" @click="navigate">
            <template #icon>
              <n-icon><AdfScannerOutlined /></n-icon>
            </template>
            {{ t('home.cta') }}
          </n-button>
        </router-link>
        <NavigateToGitHub />
      </n-space>
    </section>

    <!-- Características -->
    <section class="block">
      <TheFeatures />
    </section>

    <!-- Cómo funciona -->
    <section class="block">
      <n-h2 class="block-title">{{ t('home.stepsTitle') }}</n-h2>
      <n-grid :x-gap="20" :y-gap="20" cols="1 s:3" responsive="screen">
        <n-grid-item v-for="n in 3" :key="n">
          <n-card class="step" :bordered="true">
            <div class="step-num">{{ n }}</div>
            <n-h3 style="margin-top: 8px">{{ t(`home.step${n}Title`) }}</n-h3>
            <n-p>{{ t(`home.step${n}Text`) }}</n-p>
          </n-card>
        </n-grid-item>
      </n-grid>
    </section>

    <!-- Formatos -->
    <section class="block">
      <n-h2 class="block-title">{{ t('home.formatsTitle') }}</n-h2>
      <n-p>{{ t('home.formatsText') }}</n-p>
      <n-space :size="8">
        <n-tag v-for="f in formats" :key="f" round :bordered="false" type="success">{{ f }}</n-tag>
      </n-space>
    </section>

    <!-- Preguntas frecuentes -->
    <section class="block">
      <n-h2 class="block-title">{{ t('home.faqTitle') }}</n-h2>
      <n-collapse accordion>
        <n-collapse-item v-for="n in 6" :key="n" :title="t(`home.faq${n}q`)" :name="n">
          {{ t(`home.faq${n}a`) }}
        </n-collapse-item>
      </n-collapse>
    </section>
  </MainContainer>
</template>

<script setup lang="ts">
import {
  NH1,
  NH2,
  NH3,
  NP,
  NSpace,
  NGrid,
  NGridItem,
  NButton,
  NIcon,
  NCard,
  NTag,
  NCollapse,
  NCollapseItem,
  NGradientText
} from 'naive-ui'
import { AdfScannerOutlined } from '@vicons/material'

import TheFeatures from '@/components/Features/TheFeatures.vue'
import MainContainer from '@/components/MainContainer.vue'
import ScannerSvg from '@/components/Misc/ScannerSvg.vue'
import NavigateToGitHub from '@/components/buttons/NavigateToGitHub.vue'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

useHead({
  title: t('base.title'),
  meta: [{ name: 'description', content: t('base.description') }]
})

const gradient = 'linear-gradient(120deg, #63e2b7 0%, #5ac8fa 60%, #8b9dff 100%)'
const formats = [
  'PDF',
  'JPG',
  'PNG',
  'WEBP',
  'GIF',
  'BMP',
  'AVIF',
  t('home.formatOutPdf'),
  t('home.formatOutZip')
]
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 56px 0 24px;
}
.hero-logo {
  width: 9em;
  margin: 0 auto 8px;
}
.hero-title {
  font-size: clamp(1.9rem, 5vw, 3rem);
  line-height: 1.15;
  margin: 8px auto 12px;
  max-width: 18em;
}
.hero-sub {
  max-width: 40em;
  margin: 0 auto 24px;
  font-size: 1.05rem;
  opacity: 0.85;
}
.block {
  margin-top: 64px;
}
.block-title {
  margin-bottom: 18px;
}
.step {
  height: 100%;
}
.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  background: rgba(99, 226, 183, 0.18);
  color: #63e2b7;
}
</style>
