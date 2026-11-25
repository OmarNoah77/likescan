<template>
  <n-space vertical :size="14" style="width: 100%">
    <n-form-item :label="t('settings.colorspace.label')" :show-feedback="false">
      <n-radio-group v-model:value="config.colorspace" size="small">
        <n-radio-button value="sRGB">{{ t('settings.colorspace.colorful') }}</n-radio-button>
        <n-radio-button value="gray">{{ t('settings.colorspace.grayscale') }}</n-radio-button>
        <n-radio-button value="bw">{{ t('settings.colorspace.bw') }}</n-radio-button>
      </n-radio-group>
    </n-form-item>
    <n-form-item
      v-if="config.colorspace === 'bw'"
      :label="t('settings.bwThreshold')"
      :show-feedback="false"
    >
      <n-slider v-model:value="config.bw_threshold" :min="0.1" :max="0.9" :step="0.01" />
    </n-form-item>
  </n-space>
</template>

<script lang="ts" setup>
import { NSpace, NFormItem, NRadioGroup, NRadioButton, NSlider } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'
import type { ScanConfig } from '@/utils/scan-renderer/canvas-scan'

const { t } = useI18n()
const props = defineProps<{ config: ScanConfig }>()
const emit = defineEmits<{ (e: 'update:config', c: ScanConfig): void }>()
const config = useVModel(props, 'config', emit)
</script>
