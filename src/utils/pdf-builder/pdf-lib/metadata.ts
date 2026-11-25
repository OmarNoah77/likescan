/** Metadatos del PDF generado. Los campos vacíos usan el valor por defecto de un escáner. */
export interface PdfMetadata {
  title: string
  author: string
  subject: string
  keywords: string
  producer: string
  creator: string
  /** Marcas de tiempo (ms). null = fecha y hora actuales */
  creationDate: number | null
  modDate: number | null
}

export const defaultMetadata: PdfMetadata = {
  title: '',
  author: '',
  subject: '',
  keywords: '',
  producer: 'SECnvtToPDF V1.0',
  creator: 'TOSHIBA e-STUDIO2010AC',
  creationDate: null,
  modDate: null
}
