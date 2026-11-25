export const colorspaces = ['gray', 'sRGB', 'bw'] as const

export interface WatermarkConfig {
  enabled: boolean
  text: string
  opacity: number
  size: number
  angle: number
  tiled: boolean
}

export interface StampConfig {
  enabled: boolean
  /** Imagen (firma o sello). No se serializa: viaja aparte al worker. */
  image?: Blob
  x: number
  y: number
  size: number
  opacity: number
  rotation: number
}

export interface PaperConfig {
  /** Sombra oscura en los bordes de la hoja (0-1) */
  edgeShadow: number
  /** Iluminación despareja del escáner (0-1) */
  unevenLight: number
  /** Dobleces marcados en la hoja */
  fold: 'none' | 'half' | 'tri'
}

export interface ScanConfig {
  rotate: number
  rotate_var: number
  colorspace: (typeof colorspaces)[number]
  blur: number
  noise: number
  border: boolean
  scale: number
  brightness: number
  yellowish: number
  contrast: number
  bw_threshold: number
  paper: PaperConfig
  output: 'pdf' | 'zip'
  watermark: WatermarkConfig
  stamp: StampConfig
  output_format: 'image/png' | 'image/jpeg'
}

export const defaultConfig: ScanConfig = {
  rotate: 1,
  rotate_var: 0.5,
  colorspace: 'gray',
  blur: 0.3,
  noise: 0.1,
  border: false,
  scale: 2,
  brightness: 1,
  yellowish: 0,
  contrast: 1,
  bw_threshold: 0.5,
  paper: { edgeShadow: 0, unevenLight: 0, fold: 'none' },
  output: 'pdf',
  watermark: {
    enabled: false,
    text: 'CONFIDENCIAL',
    opacity: 0.15,
    size: 6,
    angle: -30,
    tiled: true
  },
  stamp: {
    enabled: false,
    image: undefined,
    x: 0.6,
    y: 0.8,
    size: 0.25,
    opacity: 0.9,
    rotation: 0
  },
  output_format: 'image/jpeg'
}
