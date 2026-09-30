<template>
  <div>
    <!-- Global Toast Notification -->
    <Transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toast"
        :class="[
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
          'bg-blue-50 border-blue-200 text-blue-800',
          'fixed top-5 right-5 z-[9999] px-4 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 max-w-[calc(100vw-2.5rem)] sm:max-w-sm'
        ]"
      >
        <span class="text-lg">
          <span v-if="toast.type === 'success'">✅</span>
          <span v-else-if="toast.type === 'error'">❌</span>
          <span v-else>ℹ️</span>
        </span>
        <div class="text-xs font-semibold tracking-wide pr-2">
          {{ toast.message }}
        </div>
        <button @click="toast = null" class="text-slate-400 hover:text-slate-600 transition-colors ml-auto">
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const toast = ref(null);
let toastTimer = null;

const showToast = (event) => {
  const { message, type = 'info', duration = 3000 } = event.detail || event;
  toast.value = { message, type };

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = null;
  }, duration);
};

onMounted(() => {
  window.addEventListener('toast-message', showToast);

  // Eski çevrimdışı Dexie veritabanı kalıntılarını temizle
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      window.indexedDB.deleteDatabase('TenaxClinicDB');
      window.indexedDB.deleteDatabase('tenaxline_offline_db');
    } catch {}
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('toast-message', showToast);
  clearTimeout(toastTimer);
});
</script>

<style>
/* Mobil Yatay Kayma (Horizontal Wobble/Overflow) Önleyici Global Kurallar */
html,
body,
#__nuxt {
  overflow-x: hidden !important;
  max-width: 100vw !important;
  width: 100% !important;
  margin: 0;
  padding: 0;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

/* Global Sayfa Geçiş Efektleri */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* Scrollbar Gizleme Yardımcıları (Yatay kaydırmalarda estetik ve temiz görünüm) */
.scrollbar-none::-webkit-scrollbar,
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.scrollbar-none,
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
