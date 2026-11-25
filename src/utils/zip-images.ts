import { zipSync } from 'fflate'

/** Empaqueta las páginas escaneadas (imágenes) en un ZIP: nombre-001.jpg, nombre-002.jpg... */
export async function zipImages(
  pages: { blob: Blob }[],
  baseName: string,
  extension: 'jpg' | 'png'
): Promise<Uint8Array> {
  const digits = Math.max(3, String(pages.length).length)
  const entries: Record<string, Uint8Array> = {}
  for (let i = 0; i < pages.length; i++) {
    const name = `${baseName}-${String(i + 1).padStart(digits, '0')}.${extension}`
    entries[name] = new Uint8Array(await pages[i].blob.arrayBuffer())
  }
  // imágenes ya comprimidas: nivel 0 (solo almacenar)
  return zipSync(entries, { level: 0 })
}
