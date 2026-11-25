<template>
  <n-space vertical :size="12">
    <n-text depth="3" style="font-size: 12px">{{ t('settings.metadata.hint') }}</n-text>
    <n-form-item :label="t('settings.metadata.title')" :show-feedback="false">
      <n-input v-model:value="metadata.title" maxlength="200" />
    </n-form-item>
    <n-form-item :label="t('settings.metadata.author')" :show-feedback="false">
      <n-input v-model:value="metadata.author" maxlength="200" />
    </n-form-item>
    <n-form-item :label="t('settings.metadata.subject')" :show-feedback="false">
      <n-input v-model:value="metadata.subject" maxlength="200" />
    </n-form-item>
    <n-form-item :label="t('settings.metadata.keywords')" :show-feedback="false">
      <n-input v-model:value="metadata.keywords" maxlength="300" />
    </n-form-item>
    <n-form-item :label="t('settings.metadata.producer')" :show-feedback="false">
      <n-input v-model:value="metadata.producer" maxlength="200" />
    </n-form-item>
    <n-form-item :label="t('settings.metadata.creator')" :show-feedback="false">
      <n-input v-model:value="metadata.creator" maxlength="200" />
    </n-form-item>
    <n-form-item :label="t('settings.metadata.creationDate')" :show-feedback="false">
      <n-date-picker
        v-model:value="metadata.creationDate"
        type="datetime"
        clearable
        style="width: 100%"
      />
    </n-form-item>
    <n-form-item :label="t('settings.metadata.modDate')" :show-feedback="false">
      <n-date-picker
        v-model:value="metadata.modDate"
        type="datetime"
        clearable
        style="width: 100%"
      />
    </n-form-item>
  </n-space>
</template>

<script lang="ts" setup>
import { NSpace, NFormItem, NInput, NDatePicker, NText } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'
import type { PdfMetadata } from '@/utils/pdf-builder/pdf-lib/metadata'

const { t } = useI18n()
const props = defineProps<{ metadata: PdfMetadata }>()
const emit = defineEmits<{ (e: 'update:metadata', m: PdfMetadata): void }>()
const metadata = useVModel(props, 'metadata', emit)
</script>
