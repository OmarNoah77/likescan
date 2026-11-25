<template>
  <n-collapse>
    <n-collapse-item :title="t('settings.watermark.title')" name="wm">
      <n-space vertical :size="12">
        <n-switch v-model:value="config.watermark.enabled" />
        <template v-if="config.watermark.enabled">
          <n-form-item :label="t('settings.watermark.text')" :show-feedback="false">
            <n-input v-model:value="config.watermark.text" maxlength="60" />
          </n-form-item>
          <n-form-item :label="t('settings.watermark.opacity')" :show-feedback="false">
            <n-slider v-model:value="config.watermark.opacity" :min="0.03" :max="0.6" :step="0.01" />
          </n-form-item>
          <n-form-item :label="t('settings.watermark.size')" :show-feedback="false">
            <n-slider v-model:value="config.watermark.size" :min="2" :max="15" :step="0.5" />
          </n-form-item>
          <n-form-item :label="t('settings.watermark.angle')" :show-feedback="false">
            <n-slider v-model:value="config.watermark.angle" :min="-90" :max="90" :step="1" />
          </n-form-item>
          <n-checkbox v-model:checked="config.watermark.tiled">
            {{ t('settings.watermark.tiled') }}
          </n-checkbox>
        </template>
      </n-space>
    </n-collapse-item>

    <n-collapse-item :title="t('settings.stamp.title')" name="stamp">
      <n-space vertical :size="12">
        <n-space align="center">
          <n-button size="small" @click="pickImage">{{ t('settings.stamp.upload') }}</n-button>
          <n-button v-if="config.stamp.image" size="small" quaternary @click="removeImage">
            {{ t('settings.stamp.remove') }}
          </n-button>
        </n-space>
        <img v-if="previewUrl" :src="previewUrl" class="stamp-preview" alt="" />
        <template v-if="config.stamp.image">
          <n-form-item :label="t('settings.stamp.x')" :show-feedback="false">
            <n-slider v-model:value="config.stamp.x" :min="0" :max="1" :step="0.01" />
          </n-form-item>
          <n-form-item :label="t('settings.stamp.y')" :show-feedback="false">
            <n-slider v-model:value="config.stamp.y" :min="0" :max="1" :step="0.01" />
          </n-form-item>
          <n-form-item :label="t('settings.stamp.size')" :show-feedback="false">
            <n-slider v-model:value="config.stamp.size" :min="0.05" :max="0.8" :step="0.01" />
          </n-form-item>
          <n-form-item :label="t('settings.stamp.rotation')" :show-feedback="false">
            <n-slider v-model:value="config.stamp.rotation" :min="-45" :max="45" :step="1" />
          </n-form-item>
          <n-form-item :label="t('settings.stamp.opacity')" :show-feedback="false">
            <n-slider v-model:value="config.stamp.opacity" :min="0.1" :max="1" :step="0.01" />
          </n-form-item>
        </template>
      </n-space>
    </n-collapse-item>
  </n-collapse>
</template>

<script lang="ts" setup>
import { markRaw, onBeforeUnmount, watch, ref } from 'vue'
import {
  NCollapse,
  NCollapseItem,
  NSpace,
  NSwitch,
  NFormItem,
  NInput,
  NSlider,
  NCheckbox,
  NButton
} from 'naive-ui'
import { fileOpen } from 'browser-fs-access'
import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'
import type { ScanConfig } from '@/utils/scan-renderer/canvas-scan'

const { t } = useI18n()
const props = defineProps<{ config: ScanConfig }>()
const emit = defineEmits<{ (e: 'update:config', c: ScanConfig): void }>()
const config = useVModel(props, 'config', emit)

const previewUrl = ref<string>()
watch(
  () => config.value.stamp.image,
  (img) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = img ? URL.createObjectURL(img) : undefined
  },
  { immediate: true }
)
onBeforeUnmount(() => previewUrl.value && URL.revokeObjectURL(previewUrl.value))

async function pickImage() {
  try {
    const file = await fileOpen({
      description: 'Imagen',
      mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      extensions: ['.png', '.jpg', '.jpeg', '.webp']
    })
    config.value.stamp.image = markRaw(file)
    config.value.stamp.enabled = true
  } catch {
    /* cancelado por el usuario */
  }
}
function removeImage() {
  config.value.stamp.image = undefined
  config.value.stamp.enabled = false
}
</script>

<style scoped>
.stamp-preview {
  max-width: 100%;
  max-height: 90px;
  background: repeating-conic-gradient(#8883 0% 25%, transparent 0% 50%) 50% / 12px 12px;
  border-radius: 4px;
}
</style>
