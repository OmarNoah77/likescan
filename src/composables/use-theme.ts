import { computed, ref } from 'vue'
import { useOsTheme, darkTheme } from 'naive-ui'

export type ThemeMode = 'auto' | 'light' | 'dark'
const KEY = 'likescan-theme'

function load(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'auto') return v
  } catch {
    /* sin almacenamiento: se usa el tema del sistema */
  }
  return 'auto'
}

const mode = ref<ThemeMode>(load())

export function useTheme() {
  const os = useOsTheme()
  const isDark = computed(() => (mode.value === 'auto' ? os.value === 'dark' : mode.value === 'dark'))
  const theme = computed(() => (isDark.value ? darkTheme : null))

  function setMode(m: ThemeMode) {
    mode.value = m
    try {
      localStorage.setItem(KEY, m)
    } catch {
      /* ignorar */
    }
  }
  /** auto → claro → oscuro → auto */
  function cycle() {
    setMode(mode.value === 'auto' ? 'light' : mode.value === 'light' ? 'dark' : 'auto')
  }

  return { mode, isDark, theme, setMode, cycle }
}
