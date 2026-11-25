<template>
  <n-card size="small">
    <n-space vertical :size="10">
      <n-button text :disabled="running" @click="pickFiles">
        <template #icon>
          <n-icon><DocumentMultiple16Regular /></n-icon>
        </template>
        {{ t('settings.batch.start') }}
      </n-button>
      <n-text depth="3" style="font-size: 12px">{{ t('settings.batch.hint') }}</n-text>

      <template v-if="total > 0">
        <n-progress
          type="line"
          :percentage="Math.round((done / total) * 100)"
          :show-indicator="false"
          :height="6"
        />
        <n-text style="font-size: 12px">
          {{ t('settings.batch.progress', { done, total }) }}
          <template v-if="running && current"> — {{ current }}</template>
        </n-text>
      </template>

      <n-text v-for="(err, i) in errors" :key="i" type="error" style="font-size: 12px">
        {{ err }}
      </n-text>

      <n-button v-if="result && !running" type="primary" size="small" @click="download">
        {{ t('settings.batch.download') }}
      </n-button>
    </n-space>
  </n-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { NCard, NSpace, NButton, NIcon, NText, NProgress } from 'naive-ui'
import { DocumentMultiple16Regular } from '@vicons/fluent'
import { fileOpen, fileSave } from 'browser-fs-access'
import { zipSync } from 'fflate'
import { useI18n } from 'vue-i18n'
import { scanFile } from '@/utils/scan-file'
import type { PdfMetadata } from '@/utils/pdf-builder/pdf-lib'
import { IMAGE_EXTENSIONS, IMAGE_MIME_TYPES } from '@/utils/images-to-pdf-file'

const { t } = useI18n()

const props = defineProps<{
  scanRenderer?: { renderPage(image: Blob): Promise<{ blob: Blob }> }
  scale: number
  output: 'pdf' | 'zip'
  metadata?: PdfMetadata
}>()

const running = ref(false)
const done = ref(0)
const total = ref(0)
const current = ref('')
const errors = ref<string[]>([])
const result = ref<File>()

async function pickFiles() {
  let files: File[]
  try {
    files = await fileOpen({
      description: 'PDF / imágenes',
      mimeTypes: ['application/pdf', ...IMAGE_MIME_TYPES],
      extensions: ['.pdf', ...IMAGE_EXTENSIONS],
      multiple: true
    })
  } catch {
    return // cancelado
  }
  if (!files.length || !props.scanRenderer) return
  await run(files)
}

async function run(files: File[]) {
  const scan = props.scanRenderer
  if (!scan) return

  running.value = true
  done.value = 0
  total.value = files.length
  errors.value = []
  result.value = undefined

  const zipEntries: Record<string, Uint8Array> = {}
  const used = new Set<string>()

  for (const file of files) {
    current.value = file.name
    try {
      const entries = await scanFile(file, scan, props.scale, props.output, undefined, props.metadata)
      for (const entry of entries) {
        zipEntries[uniqueName(entry.name, used)] = entry.bytes
      }
    } catch (e) {
      console.error(e)
      errors.value.push(`${file.name}: ${(e as Error).message}`)
    }
    done.value += 1
  }

  if (Object.keys(zipEntries).length) {
    const bytes = zipSync(zipEntries, { level: 0 })
    result.value = new File([bytes as BlobPart], 'lote-escaneado.zip', { type: 'application/zip' })
  }
  current.value = ''
  running.value = false
}

function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name)
    return name
  }
  const dot = name.lastIndexOf('.')
  const stem = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  let n = 2
  while (used.has(`${stem}-${n}${ext}`)) n++
  const unique = `${stem}-${n}${ext}`
  used.add(unique)
  return unique
}

defineExpose({ run, done, total, errors, result })

async function download() {
  if (!result.value) return
  await fileSave(result.value, {
    fileName: result.value.name,
    extensions: ['.zip'],
    mimeTypes: ['application/zip'],
    startIn: 'downloads',
    description: 'ZIP File',
    id: 'lookscanned-batch'
  })
}
</script>
