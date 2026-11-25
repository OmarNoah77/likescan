<template>
  <MainContainer>
    <div style="margin-bottom: 25px">
      <BackToIndex />
    </div>
    <n-grid x-gap="25" y-gap="25" :cols="12" item-responsive responsive="screen">
      <n-grid-item span="12 s:5 m:4 l:3">
        <n-space vertical>
          <PDFUpload @update:pdf="pdf = $event" />
          <PDFInfo :pdf="pdf" v-if="pdf" />

          <ScanSettingsCard v-model:config="config" />

          <SaveButtonCard
            @generate="generate"
            :progress="progress"
            :saving="saving"
            :pdf="scannedPDF"
          />

          <BatchCard :scanRenderer="scanRenderer" :scale="scale" :output="output" :metadata="metadata" />
        </n-space>
      </n-grid-item>
      <n-grid-item span="12 s:7 m:8 l:6">
        <PreviewCompare
          :pdfRenderer="pdfRenderer"
          :scanRenderer="scanRenderer"
          :scale="config.scale"
        />
      </n-grid-item>
      <n-grid-item span="12 l:3">
        <div class="overlay-column">
          <n-card size="small">
            <OverlaySettings v-model:config="config" />
          </n-card>
          <n-card size="small" style="margin-top: 16px">
            <n-collapse>
              <n-collapse-item :title="t('settings.metadata.title_section')" name="meta">
                <MetadataSettings v-model:metadata="metadata" />
              </n-collapse-item>
            </n-collapse>
          </n-card>
        </div>
      </n-grid-item>
    </n-grid>
  </MainContainer>
</template>

<script lang="ts" setup>
import { NGrid, NGridItem, NSpace, NCard, NCollapse, NCollapseItem } from 'naive-ui'
import MetadataSettings from '@/components/scan-settings/MetadataSettings.vue'
import { defaultMetadata, type PdfMetadata } from '@/utils/pdf-builder/pdf-lib'
import OverlaySettings from '@/components/scan-settings/OverlaySettings.vue'
import MainContainer from '@/components/MainContainer.vue'
import { type ScanConfig, defaultConfig, CanvasScanner } from '@/utils/scan-renderer/canvas-scan'
import ScanSettingsCard from '@/components/scan-settings/ScanSettingsCard.vue'
import PDFUpload from '@/components/pdf-upload/PDFUpload.vue'
import { ref, computed } from 'vue'
import { watchDebounced } from '@vueuse/core'
import PDFURL from '@/assets/examples/pdfs/test.pdf'
import BackToIndex from '@/components/buttons/BackToIndex.vue'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { PDF } from '@/utils/pdf-renderer/pdfjs'
import PreviewCompare from '@/components/page-preview/PreviewCompare.vue'
import SaveButtonCard from '@/components/save-button/SaveButtonCard.vue'
import BatchCard from '@/components/save-button/BatchCard.vue'
import { useSaveScannedPDF } from '@/composables/save-scanned-pdf'
import PDFInfo from '@/components/pdf-upload/PDFInfo.vue'
import { ScanCacher } from '@/utils/scan-renderer/scan-cacher'
import { useMessage } from 'naive-ui'

const { t } = useI18n()
const message = useMessage()

useHead({
  title: t('base.scanTitle') + ' - ' + t('base.title'),
  meta: [{ name: 'description', content: t('base.description') }]
})

const pdf = ref<File | undefined>(undefined)

const initExamplePDF = async () => {
  const response = await fetch(PDFURL)
  const blob = await response.blob()
  const file = new File([blob], 'example.pdf')
  if (!pdf.value) {
    pdf.value = file
  }
}

initExamplePDF()

const config = ref<ScanConfig>(defaultConfig)
const pdfRenderer = computed(() => {
  if (!pdf.value) return

  return new PDF(pdf.value)
})

const scanRenderer = ref(new ScanCacher(new CanvasScanner(config.value)))
// debounce: mover un slider dispara muchos cambios seguidos; se agrupan
watchDebounced(
  config,
  (newConfig) => {
    scanRenderer.value = new ScanCacher(new CanvasScanner(newConfig))
  },
  { deep: true, debounce: 150 }
)

const scale = computed(() => config.value.scale)
const output = computed(() => config.value.output)
const metadata = ref<PdfMetadata>({ ...defaultMetadata })

const { save, progress, saving, scannedPDF } = useSaveScannedPDF(
  pdf,
  pdfRenderer,
  scanRenderer,
  scale,
  output,
  metadata
)

const generate = async () => {
  try {
    await save()
    message.success(t('actions.generateSuccess'))
  } catch (e) {
    message.error(t('actions.generateError') + (e as Error).message)
  }
}
</script>

<style scoped>
.overlay-column {
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}
</style>
