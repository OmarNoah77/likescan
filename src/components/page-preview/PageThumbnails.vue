<template>
  <div class="thumbs" v-if="numPages >= 2">
    <button
      v-for="n in shown"
      :key="n"
      type="button"
      class="thumb"
      :class="{ active: n === page }"
      :aria-label="`Página ${n}`"
      @click="page = n"
    >
      <img v-if="urls[n]" :src="urls[n]" alt="" />
      <span v-else class="ph" />
      <span class="num">{{ n }}</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, reactive, watch } from 'vue'
import { useVModel } from '@vueuse/core'

const MAX_THUMBS = 120

interface Renderer {
  renderPage(page: number, scale: number): Promise<{ blob: Blob }>
}

const props = defineProps<{
  pdfRenderer?: Renderer
  numPages: number
  page: number
}>()
const emit = defineEmits<{ (e: 'update:page', p: number): void }>()
const page = useVModel(props, 'page', emit)

const shown = computed(() => Math.min(props.numPages, MAX_THUMBS))
const urls = reactive<Record<number, string>>({})

function clear() {
  for (const k of Object.keys(urls)) {
    URL.revokeObjectURL(urls[Number(k)])
    delete urls[Number(k)]
  }
}

let run = 0
watch(
  () => [props.pdfRenderer, props.numPages] as const,
  async ([renderer, num]) => {
    const mine = ++run
    clear()
    if (!renderer || num < 2) return
    for (let n = 1; n <= Math.min(num, MAX_THUMBS); n++) {
      if (mine !== run) return // llegó otro PDF
      try {
        const { blob } = await renderer.renderPage(n, 0.3)
        if (mine !== run) return
        urls[n] = URL.createObjectURL(blob)
      } catch {
        /* una miniatura fallida no debe romper nada */
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  run++
  clear()
})
</script>

<style scoped>
.thumbs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 6px 2px 10px;
}
.thumb {
  position: relative;
  flex: 0 0 auto;
  width: 64px;
  height: 88px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  overflow: hidden;
  opacity: 0.75;
  transition: opacity 0.15s, border-color 0.15s;
}
.thumb:hover {
  opacity: 1;
}
.thumb.active {
  border-color: #63e2b7;
  opacity: 1;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.ph {
  display: block;
  width: 100%;
  height: 100%;
  background: #8883;
}
.num {
  position: absolute;
  right: 2px;
  bottom: 2px;
  font-size: 10px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
}
</style>
