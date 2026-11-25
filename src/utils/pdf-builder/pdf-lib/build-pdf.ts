import { type PdfMetadata, defaultMetadata } from './metadata'

interface ImageInfo {
  blob: Blob
  width: number
  height: number
  ppi: number
}

export async function buildPDF(
  images: ImageInfo[],
  metadata: PdfMetadata = defaultMetadata
): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()

  for (const image of images) {
    const { blob, width, height, ppi } = image
    const physicalWidthDots = (width / ppi) * 72
    const physicalHeightDots = (height / ppi) * 72
    const page = pdfDoc.addPage([physicalWidthDots, physicalHeightDots])

    const imageBytes = await blob.arrayBuffer()
    let pdfImage
    if (blob.type === 'image/png') {
      pdfImage = await pdfDoc.embedPng(imageBytes)
    } else if (blob.type === 'image/jpeg') {
      pdfImage = await pdfDoc.embedJpg(imageBytes)
    } else {
      throw new Error('Unsupported image format')
    }

    page.drawImage(pdfImage, {
      x: 0,
      y: 0,
      width: physicalWidthDots,
      height: physicalHeightDots
    })
  }

  // las cadenas vacías se guardan vacías: así no queda rastro de la librería
  pdfDoc.setTitle(metadata.title)
  pdfDoc.setAuthor(metadata.author)
  pdfDoc.setSubject(metadata.subject)
  pdfDoc.setKeywords(
    metadata.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
  )
  pdfDoc.setProducer(metadata.producer)
  pdfDoc.setCreator(metadata.creator)
  const created = new Date(metadata.creationDate ?? Date.now())
  pdfDoc.setCreationDate(created)
  pdfDoc.setModificationDate(new Date(metadata.modDate ?? created.getTime()))

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

