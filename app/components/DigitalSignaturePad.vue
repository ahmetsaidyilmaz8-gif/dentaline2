<template>
  <div class="flex flex-col gap-2">
    <div
      ref="containerRef"
      :class="[
        heightClass,
        'relative w-full bg-white border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden touch-none select-none cursor-crosshair group hover:border-teal-500 transition-colors shadow-xs'
      ]"
    >
      <canvas
        ref="canvasRef"
        class="w-full h-full block bg-white"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="stopDrawing"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="stopDrawing"
      ></canvas>

      <!-- İmza / Çizim Rehber Çizgisi -->
      <div class="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center gap-2 text-[11px] text-slate-400 font-medium select-none">
        <span class="w-3 border-b border-dashed border-slate-300"></span>
        <span class="truncate">{{ placeholder }}</span>
        <span class="flex-1 border-b border-dashed border-slate-300"></span>
        <span class="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">{{ lineLabel }}</span>
      </div>

      <!-- Çizim Yapıldı Rozeti -->
      <div v-if="hasDrawn" class="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[11px] font-bold rounded-full border border-emerald-500/20 flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{{ badgeText }}</span>
      </div>
    </div>

    <div class="flex items-center justify-between text-xs">
      <span class="text-slate-400 dark:text-slate-500">
        {{ hasDrawn ? drawnPrompt : emptyPrompt }}
      </span>
      <button
        type="button"
        @click="clear"
        class="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600 dark:text-rose-400 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
      >
        <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
        <span>{{ clearBtnLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  heightClass: { type: String, default: 'h-40' },
  placeholder: { type: String, default: 'İmzanızı bu alana parmağınız veya dijital kalemle atınız' },
  lineLabel: { type: String, default: '✕ İmza Alanı' },
  emptyPrompt: { type: String, default: 'Lütfen kutu içine imzanızı atın' },
  drawnPrompt: { type: String, default: '✓ İmza algılandı' },
  badgeText: { type: String, default: 'İmzalandı' },
  clearBtnLabel: { type: String, default: 'İmzayı Temizle' }
});

const containerRef = ref(null);
const canvasRef = ref(null);
const isDrawing = ref(false);
const hasDrawn = ref(false);
let ctx = null;
let lastX = 0;
let lastY = 0;

const emit = defineEmits(['change']);

// Canvas boyutlarını yüksek çözünürlüklü (High-DPI / Retina) ekrana göre ayarla
const resizeCanvas = () => {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;

  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Çizim yedeğini al
  let tempImage = null;
  if (hasDrawn.value) {
    tempImage = canvas.toDataURL();
  }

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.strokeStyle = '#0f172a'; // Koyu şık imza rengi
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (tempImage) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = tempImage;
  }
};

const getCoordinates = (e) => {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

const startDrawing = (e) => {
  if (!ctx) return;
  isDrawing.value = true;
  const { x, y } = getCoordinates(e);
  lastX = x;
  lastY = y;
  
  // Tek tıkla nokta koyabilme
  ctx.beginPath();
  ctx.arc(x, y, 1, 0, Math.PI * 2);
  ctx.fill();
};

const draw = (e) => {
  if (!isDrawing.value || !ctx) return;
  const { x, y } = getCoordinates(e);

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX = x;
  lastY = y;
  if (!hasDrawn.value) {
    hasDrawn.value = true;
    emit('change', true);
  }
};

const stopDrawing = () => {
  if (isDrawing.value) {
    isDrawing.value = false;
  }
};

// Pointer Events (Kalem / Dokunmatik)
const handlePointerDown = (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  startDrawing(e);
};

const handlePointerMove = (e) => {
  if (!isDrawing.value) return;
  draw(e);
};

// Touch Events
const handleTouchStart = (e) => {
  if (e.touches.length === 1) {
    startDrawing(e.touches[0]);
  }
};

const handleTouchMove = (e) => {
  if (e.touches.length === 1) {
    draw(e.touches[0]);
  }
};

// Dışarı aktarılan metodlar
const clear = () => {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  hasDrawn.value = false;
  emit('change', false);
};

const isEmpty = () => {
  return !hasDrawn.value;
};

const toDataURL = (format = 'image/png') => {
  const canvas = canvasRef.value;
  if (!canvas || !hasDrawn.value) return '';

  // İmzanın siyah temalarda veya PDF'te kaybolmaması için temiz beyaz zemin üzerine render et
  const offCanvas = document.createElement('canvas');
  offCanvas.width = canvas.width;
  offCanvas.height = canvas.height;
  const offCtx = offCanvas.getContext('2d');
  offCtx.fillStyle = '#ffffff';
  offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
  offCtx.drawImage(canvas, 0, 0);

  return offCanvas.toDataURL(format);
};

const writeText = (text = 'Okudum, anladım, kabul ediyorum.') => {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container || !ctx) return;

  clear();
  const rect = container.getBoundingClientRect();

  ctx.save();
  ctx.fillStyle = '#0f172a';
  const fontSize = Math.min(22, Math.max(15, Math.floor(rect.width / 24)));
  ctx.font = `italic 600 ${fontSize}px "Segoe Script", "Brush Script MT", "Caveat", "Comic Sans MS", cursive, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.translate(rect.width / 2, rect.height / 2);
  ctx.rotate(-0.02);
  ctx.fillText(text, 0, 0);
  ctx.restore();

  hasDrawn.value = true;
  emit('change', true);
};

onMounted(async () => {
  await nextTick();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas);
});

defineExpose({
  clear,
  isEmpty,
  toDataURL,
  writeText
});
</script>
