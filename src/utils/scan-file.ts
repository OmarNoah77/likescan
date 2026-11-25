import { PDF } from '@/utils/pdf-renderer/pdfjs'
import { buildPDF, type PdfMetadata } from '@/utils/pdf-builder/pdf-lib'
import { zipImages } from '@/utils/zip-images'
import { imagesToPdfFile, isImageFile, isPdfFile } from '@/utils/images-to-pdf-file'

export interface ScanEntry {
  name: string
  bytes: Uint8Array
}

interface Scanner {
  renderPage(image: Blob): Promise<{ blob: Blob }>
}

/**
 * Escanea un archivo completo (PDF o imagen) con la configuración actual.
 * Devuelve los archivos resultantes: un PDF, o las imágenes de cada página.
 */
export async function scanFile(
  file: File,
  scan: Scanner,
  scale: number,
  output: 'pdf' | 'zip',
  onPage?: (done: number, total: number) => void,
  metadata?: PdfMetadata
): Promise<ScanEntry[]> {
  let source = file
  if (!isPdfFile(file)) {
    if (!isImageFile(file)) throw new Error('Formato no compatible')
    source = await imagesToPdfFile([file])
  }

  const base = file.name.replace(/\.[^/.]+$/, '')
  const pdf = new PDF(source)
  const numPages = await pdf.getNumPages()

  const pages: { blob: Blob; width: number; height: number; ppi: number }[] = []
  for (let page = 1; page <= numPages; page++) {
    const { blob, width, height } = await pdf.renderPage(page, scale)
    const { blob: scanned } = await scan.renderPage(blob)
    pages.push({ blob: scanned, width, height, ppi: scale * 72 })
    onPage?.(page, numPages)
  }

  if (output === 'zip') {
    const ext = pages[0]?.blob.type === 'image/png' ? 'png' : 'jpg'
    const images = await zipImagesAsEntries(pages, base, ext)
    return images.map((e) => ({ ...e, name: `${base}-scan/${e.name}` }))
  }

  const pdfBlob = await buildPDF(pages, metadata)
  return [{ name: `${base}-scan.pdf`, bytes: new Uint8Array(await pdfBlob.arrayBuffer()) }]
}

async function zipImagesAsEntries(
  pages: { blob: Blob }[],
  base: string,
  ext: 'jpg' | 'png'
): Promise<ScanEntry[]> {
  const digits = Math.max(3, String(pages.length).length)
  const out: ScanEntry[] = []
  for (let i = 0; i < pages.length; i++) {
    out.push({
      name: `${base}-${String(i + 1).padStart(digits, '0')}.${ext}`,
      bytes: new Uint8Array(await pages[i].blob.arrayBuffer())
    })
  }
  return out
}

// re-export para quien solo necesite empaquetar
export { zipImages }
