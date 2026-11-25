import type { ScanConfig } from './types'

export async function scanCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  page: Blob,
  config: ScanConfig,
  noise: Blob,
  stampImage?: Blob,
  signal?: AbortSignal
): Promise<void> {
  if (signal?.aborted) {
    throw new Error('Aborted')
  }

  const imgPromise = createImageBitmap(page)
  const noiseImagePromise = createImageBitmap(noise)

  // Note: Hack to get around TS error
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
  if (!ctx) {
    throw new Error('Canvas not supported')
  }

  // load blob into image
  const img = await imgPromise
  if (signal?.aborted) {
    throw new Error('Aborted')
  }

  const width = img.width
  const height = img.height

  canvas.width = width
  canvas.height = height

  // fill white
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // add blur
  ctx.filter = `blur(${config.blur}px)`
  if (config.colorspace === 'gray' || config.colorspace === 'bw') {
    ctx.filter += ' grayscale(1)'
  }

  // add brightness
  ctx.filter += ` brightness(${config.brightness})`

  // modify yellowish
  ctx.filter += ` sepia(${config.yellowish})`

  // add contrast
  ctx.filter += ` contrast(${config.contrast})`

  // rotate
  ctx.translate(width / 2, height / 2)
  ctx.rotate(((config.rotate + config.rotate_var * Math.random()) * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)

  ctx.drawImage(img, 0, 0)

  // marca de agua y sello/firma: dentro del mismo giro y filtros,
  // para que parezcan parte de la hoja escaneada
  drawWatermark(ctx, width, height, config)
  if (stampImage && config.stamp.enabled) {
    const stampBitmap = await createImageBitmap(stampImage)
    drawStamp(ctx, stampBitmap, width, height, config)
  }

  const noiseImage = await noiseImagePromise
  ctx.drawImage(noiseImage, 0, 0, width, height)

  if (config.colorspace === 'bw') {
    // el umbral se aplica sobre los píxeles finales (tras filtros y ruido)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.filter = 'none'
    const data = ctx.getImageData(0, 0, width, height)
    const px = data.data
    const t = config.bw_threshold * 255
    for (let i = 0; i < px.length; i += 4) {
      const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]
      const v = lum > t ? 255 : 0
      px[i] = px[i + 1] = px[i + 2] = v
    }
    ctx.putImageData(data, 0, 0)
  }

  if (config.border) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.filter = 'none'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, width, height)
  }
}

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

function drawWatermark(ctx: Ctx, width: number, height: number, config: ScanConfig) {
  const wm = config.watermark
  if (!wm.enabled || !wm.text.trim()) return
  ctx.save()
  // en B/N el umbral borraría una marca clara: se oscurece para que sobreviva
  const bw = config.colorspace === 'bw'
  ctx.globalAlpha = bw ? Math.max(wm.opacity, 0.6) : wm.opacity
  ctx.fillStyle = bw ? '#000' : '#555'
  const fontSize = (wm.size / 100) * width
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.translate(width / 2, height / 2)
  ctx.rotate((wm.angle * Math.PI) / 180)
  if (wm.tiled) {
    const stepX = ctx.measureText(wm.text).width + fontSize * 2
    const stepY = fontSize * 3
    const reach = Math.hypot(width, height)
    for (let y = -reach; y <= reach; y += stepY) {
      const row = Math.round(y / stepY)
      for (let x = -reach; x <= reach; x += stepX) {
        ctx.fillText(wm.text, x + (row % 2 ? stepX / 2 : 0), y)
      }
    }
  } else {
    ctx.fillText(wm.text, 0, 0)
  }
  ctx.restore()
}

function drawStamp(ctx: Ctx, img: ImageBitmap, width: number, height: number, config: ScanConfig) {
  const st = config.stamp
  const w = st.size * width
  const h = (img.height / img.width) * w
  ctx.save()
  ctx.globalAlpha = st.opacity
  ctx.translate(st.x * width, st.y * height)
  ctx.rotate((st.rotation * Math.PI) / 180)
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  ctx.restore()
}
