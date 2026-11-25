<template>
  <n-card
    :class="{ 'drop-active': dragging }"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <n-space vertical>
      <n-button text @click="onClick">
        <template #icon>
          <n-icon>
            <FolderOpen16Regular />
          </n-icon>
        </template>
        <n-text>
          {{ t('settings.pdfSelectLabel') }}
        </n-text>
      </n-button>
      <n-text depth="3" style="font-size: 12px">{{ t('settings.pdfDropHint') }}</n-text>
    </n-space>
  </n-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { NButton, NIcon, NText, NCard, NSpace, useMessage } from 'naive-ui'
import { FolderOpen16Regular } from '@vicons/fluent'
import { fileOpen } from 'browser-fs-access'
import { useI18n } from 'vue-i18n'
import {
  IMAGE_EXTENSIONS,
  IMAGE_MIME_TYPES,
  imagesToPdfFile,
  isImageFile,
  isPdfFile
} from '@/utils/images-to-pdf-file'

const { t } = useI18n()
const message = useMessage()
const dragging = ref(false)

const emit = defineEmits<{
  (e: 'update:pdf', info: File | undefined): void
}>()

/** Un PDF pasa tal cual; una o varias imágenes se convierten en un PDF de varias páginas. */
async function handleFiles(files: File[]) {
  if (!files.length) return
  try {
    const pdf = files.find(isPdfFile)
    if (pdf) {
      emit('update:pdf', pdf)
      return
    }
    const images = files.filter(isImageFile)
    if (!images.length) {
      message.error(t('settings.pdfUnsupported'))
      return
    }
    emit('update:pdf', await imagesToPdfFile(images))
  } catch (e) {
    console.error(e)
    message.error(t('settings.pdfUnsupported'))
  }
}

async function onClick() {
  try {
    const files = await fileOpen({
      description: 'PDF / imágenes',
      mimeTypes: ['application/pdf', ...IMAGE_MIME_TYPES],
      extensions: ['.pdf', ...IMAGE_EXTENSIONS],
      multiple: true
    })
    await handleFiles(files)
  } catch {
    /* selección cancelada */
  }
}

async function onDrop(e: DragEvent) {
  dragging.value = false
  await handleFiles(Array.from(e.dataTransfer?.files ?? []))
}
</script>

<style scoped>
.drop-active {
  outline: 2px dashed var(--n-border-color, #63e2b7);
  outline-offset: -4px;
}
</style>
