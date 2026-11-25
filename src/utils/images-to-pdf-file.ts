/**
 * Convierte una o varias imágenes (JPG, PNG, WEBP, GIF, BMP, AVIF...) en un
 * único PDF para poder reutilizar todo el flujo de escaneo que ya trabaja con PDF.
 * Cada imagen es una página; el tamaño se limita para no generar renders enormes.
 */
const MAX_PAGE_SIDE_PT = 842 // lado mayor ≈ A4

export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif']
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/avif'
]

export function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  const name = file.name.toLowerCase()
  return IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

async function toEmbeddableBytes(
  file: File
): Promise<{ bytes: ArrayBuffer; kind: 'jpg' | 'png'; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  const isJpeg = file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)
  const isPng = file.type === 'image/png' || /\.png$/i.test(file.name)
  if (isJpeg || isPng) {
    bitmap.close()
    return { bytes: await file.arrayBuffer(), kind: isJpeg ? 'jpg' : 'png', width, height }
  }

  // otros formatos: se redibujan y se codifican como PNG
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas no disponible')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo convertir la imagen'))), 'image/png')
  )
  return { bytes: await blob.arrayBuffer(), kind: 'png', width, height }
}

export async function imagesToPdfFile(files: File[]): Promise<File> {
  const { PDFDocument } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()

  for (const file of files) {
    const { bytes, kind, width, height } = await toEmbeddableBytes(file)
    const image = kind === 'jpg' ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes)

    const factor = Math.min(1, MAX_PAGE_SIDE_PT / Math.max(width, height))
    const pageWidth = width * factor
    const pageHeight = height * factor
    const page = pdfDoc.addPage([pageWidth, pageHeight])
    page.drawImage(image, { x: 0, y: 0, width: pageWidth, height: pageHeight })
  }

  const out = await pdfDoc.save()
  const base = (files[0]?.name ?? 'imagen').replace(/\.[^/.]+$/, '')
  return new File([out], `${base}.pdf`, { type: 'application/pdf' })
}
