import type { ScanConfig } from './types'
import { scanCanvas } from './scan-canvas'

export interface WorkerMessage {
  page: Blob
  config: ScanConfig
  noise: Blob
  stamp?: Blob
}

onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { page, config, noise, stamp } = e.data
  // disable eslint ban ts-ignore
  const canvas = new OffscreenCanvas(1000, 1000)
  await scanCanvas(canvas, page, config, noise, stamp)
  const blob = await canvas.convertToBlob({ type: config.output_format })
  postMessage(blob)
}
