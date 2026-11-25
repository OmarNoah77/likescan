import type { Ref } from 'vue'
import { get } from '@vueuse/core'
import { ref, computed, watch } from 'vue'
import { buildPDF, defaultMetadata, type PdfMetadata } from '@/utils/pdf-builder/pdf-lib'
import { zipImages } from '@/utils/zip-images'

interface PDFRenderer {
  renderPage(
    page: number,
    scale: number
  ): Promise<{
    blob: Blob
    height: number
    width: number
    ppi: number
  }>
  getNumPages(): Promise<number>
}

interface ScanRenderer {
  renderPage(image: Blob): Promise<{
    blob: Blob
  }>
}

export function useSaveScannedPDF(
  pdf: Ref<File | undefined>,
  pdfRenderer: Ref<PDFRenderer | undefined>,
  scanRenderer: Ref<ScanRenderer | undefined>,
  scale: Ref<number>,
  output: Ref<'pdf' | 'zip'> = ref('pdf'),
  metadata: Ref<PdfMetadata> = ref({ ...defaultMetadata })
) {
  const finishedPages = ref(0)
  const totalPages = ref(0)
  const progress = computed(() => {
    if (totalPages.value === 0) {
      return 0
    }
    return finishedPages.value / totalPages.value
  })

  const saving = ref(false)
  const scannedPDF = ref<File | undefined>(undefined)
  const outputFilename = computed(() => {
    const originalFilename = pdf.value?.name ?? 'doc.pdf'
    const base = originalFilename.replace(/\.[^/.]+$/, '')
    return output.value === 'zip' ? `${base}-scan.zip` : `${base}-scan.pdf`
  })

  const reset = () => {
    finishedPages.value = 0
    totalPages.value = 0
    scannedPDF.value = undefined
    saving.value = false
  }

  watch(pdfRenderer, reset)
  watch(scanRenderer, reset)
  watch(scale, reset)
  watch(output, reset)
  watch(metadata, reset, { deep: true })

  const save = async () => {
    try {
      finishedPages.value = 0
      totalPages.value = 0
      saving.value = true

      const pdf = get(pdfRenderer)
      const scan = get(scanRenderer)
      const scale_ = get(scale)

      if (!pdf || !scan) {
        throw new Error('No PDF or Scan Renderer')
      }

      const numPages = await pdf.getNumPages()

      totalPages.value = numPages

      // generate pdf pages 1...n
      const pages = Array.from({ length: numPages }, (_, i) => i + 1)
      const scanPages = await Promise.all(
        pages.map(async (page) => {
          const { blob: pdfPage, height, width } = await pdf.renderPage(page, scale_)
          const { blob: scanPage } = await scan.renderPage(pdfPage)
          finishedPages.value += 1
          return {
            blob: scanPage,
            width,
            height,
            ppi: scale_ * 72
          }
        })
      )

      if (get(output) === 'zip') {
        const base = outputFilename.value.replace(/-scan\.zip$/, '-scan')
        const ext = scanPages[0]?.blob.type === 'image/png' ? 'png' : 'jpg'
        const zipped = await zipImages(scanPages, base, ext)
        scannedPDF.value = new File([zipped as BlobPart], outputFilename.value, {
          type: 'application/zip'
        })
        return zipped
      }

      // generate pdf from scan pages
      const pdfDocument = await buildPDF(scanPages, get(metadata))

      scannedPDF.value = new File([pdfDocument], outputFilename.value, {
        type: 'application/pdf'
      })

      return pdfDocument
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      saving.value = false
    }
  }

  return { save, progress, saving, scannedPDF }
}
