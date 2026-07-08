<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { computeSpinTarget, easeOutSpin } from '../utils/wheel'

const props = defineProps<{
  names: string[]
}>()

const emit = defineEmits<{
  (e: 'spin-start'): void
  (e: 'spin-complete', index: number): void
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const rotation = ref(0)
const spinning = ref(false)

const SEGMENT_FILL_A = '#333333'
const SEGMENT_FILL_B = '#2f2f2f'
const SEGMENT_BORDER = 'rgba(120, 200, 100, 0.35)'
const TEXT_COLOR = '#ffffff'
const HUB_COLOR = '#78c864'
const HUB_RING = '#2b2b2b'
const HUB_CENTER = '#1a1a1a'
const TICK_COLOR = '#78c864'

function draw() {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = el.getBoundingClientRect()
  if (rect.width === 0) return

  el.width = rect.width * dpr
  el.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const w = rect.width
  const h = rect.height
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) / 2 - 6

  ctx.clearRect(0, 0, w, h)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation.value)

  const n = Math.max(props.names.length, 1)
  const segmentAngle = (Math.PI * 2) / n

  if (props.names.length === 0) {
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fillStyle = SEGMENT_FILL_A
    ctx.fill()
    ctx.strokeStyle = SEGMENT_BORDER
    ctx.lineWidth = 1.5
    ctx.stroke()
  } else {
    for (let i = 0; i < n; i++) {
      const start = i * segmentAngle
      const end = start + segmentAngle
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, r, start, end)
      ctx.closePath()
      ctx.fillStyle = i % 2 === 0 ? SEGMENT_FILL_A : SEGMENT_FILL_B
      ctx.fill()
      ctx.strokeStyle = SEGMENT_BORDER
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.save()
      ctx.rotate(start + segmentAngle / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = TEXT_COLOR
      ctx.font = '600 13px Inter, sans-serif'
      let label = props.names[i]
      const maxLen = 18
      if (label.length > maxLen) label = `${label.slice(0, maxLen - 1)}\u2026`
      ctx.fillText(label, r - 14, 0)
      ctx.restore()
    }
  }

  // tick marks around the rim
  ctx.strokeStyle = TICK_COLOR
  for (let t = 0; t < 60; t++) {
    const a = ((Math.PI * 2) / 60) * t
    const long = t % 5 === 0
    const r1 = r + 3
    const r2 = r + (long ? 10 : 6)
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1)
    ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2)
    ctx.lineWidth = long ? 1.5 : 1
    ctx.globalAlpha = 0.6
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.restore()

  // hub
  ctx.beginPath()
  ctx.arc(cx, cy, 16, 0, Math.PI * 2)
  ctx.fillStyle = HUB_COLOR
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = HUB_RING
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.fillStyle = HUB_CENTER
  ctx.fill()
}

function handleResize() {
  draw()
}

onMounted(() => {
  draw()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

watch(() => props.names, () => draw(), { deep: true })

/**
 * Animate the wheel so that `winnerIndex` ends up under the pointer.
 * Resolves (via spin-complete emit) once the animation is done.
 */
function spin(winnerIndex: number) {
  if (spinning.value || props.names.length < 2) return
  spinning.value = true
  emit('spin-start')

  const target = computeSpinTarget({
    currentRotation: rotation.value,
    segmentCount: props.names.length,
    winnerIndex,
    bonusSpins: Math.floor(Math.random() * 2)
  })

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    rotation.value = target % (Math.PI * 2)
    draw()
    spinning.value = false
    emit('spin-complete', winnerIndex)
    return
  }

  const start = rotation.value
  const distance = target - start
  const duration = 4600
  const t0 = performance.now()

  function frame(now: number) {
    const elapsed = now - t0
    const t = Math.min(elapsed / duration, 1)
    rotation.value = start + distance * easeOutSpin(t)
    draw()
    if (t < 1) {
      requestAnimationFrame(frame)
    } else {
      rotation.value = target % (Math.PI * 2)
      spinning.value = false
      emit('spin-complete', winnerIndex)
    }
  }
  requestAnimationFrame(frame)
}

defineExpose({ spin, spinning })
</script>

<template>
  <div class="relative mx-auto aspect-square w-full max-w-[420px]">
    <div
      class="absolute left-1/2 -top-1 z-10 -translate-x-1/2"
      style="width: 0; height: 0; border-left: 13px solid transparent; border-right: 13px solid transparent; border-top: 22px solid #78c864; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));"
      aria-hidden="true"
    />
    <canvas
      ref="canvas"
      class="block h-full w-full rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-border"
      role="img"
      :aria-label="names.length ? `Rad met ${names.length} deelnemers` : 'Leeg rad'"
    />
  </div>
</template>
