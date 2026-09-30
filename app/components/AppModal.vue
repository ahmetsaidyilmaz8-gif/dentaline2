<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <!-- Karartılmış Arka Plan (Backdrop Blur) -->
        <div
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          @click="closeOnOverlayClick ? $emit('close') : null"
        ></div>

        <!-- Modal İçerik Kutusu -->
        <div
          :class="[
            widthClass,
            'relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col w-full max-h-[90vh] overflow-hidden transform transition-all duration-300'
          ]"
        >
          <!-- Modal Başlığı -->
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              @click="$emit('close')"
              class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Gövdesi (Scroll Edilebilir) -->
          <div class="px-6 py-5 overflow-y-auto flex-1 text-base text-slate-600 dark:text-slate-300">
            <slot />
          </div>

          <!-- Modal Altlığı (Butonlar) -->
          <div
            v-if="$slots.footer"
            class="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Pencere',
  },
  width: {
    type: String,
    default: 'md', // sm, md, lg, xl, 2xl, 3xl
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true,
  }
});

defineEmits(['close']);

// Genişlik Sınıfları Eşleştirmesi
const widthClass = computed(() => {
  const mapping = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };
  return mapping[props.width] || 'max-w-md';
});

// Escape tuşuna basıldığında modalı kapatma desteği
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
