import { createI18n } from 'vue-i18n'

import { en } from './en'
import { zhCN } from './zh-CN'
import { es } from './es'

const currentLocale = navigator?.language

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

const i18n = createI18n({
  locale: currentLocale,
  fallbackLocale: 'es',
  legacy: false,
  messages: {
    en,
    es,
    zh: zhCN
  } as { [key: string]: DeepPartial<typeof en> }
})

export default i18n
