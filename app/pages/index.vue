<template>
  <div class="relative min-h-[calc(100vh-6rem)] w-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 overflow-hidden select-none bg-slate-950">
    
    <!-- ARKA PLAN GÖRSELİ (City Tooth Art) -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      <!-- Arka Planı Dolduran Atmosferik Bulanıklık (Ambiance) -->
      <img
        src="/city_tooth.jpg"
        alt="Dental Art Atmosphere"
        class="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-35 scale-110"
      />
      
      <!-- Ana Sanatsal Diş Görseli (Net ve Kesintisiz) -->
      <img
        src="/city_tooth.jpg"
        alt="TenaxLine Dental Art"
        class="relative max-h-[76vh] sm:max-h-[82vh] max-w-[92vw] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-700"
      />

      <!-- Kenar Sinematik Karartma (Vignette) -->
      <div class="absolute inset-0 bg-radial from-transparent via-slate-950/30 to-slate-950/85"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50"></div>
    </div>

    <!-- ÜST KISIM: Minimal Tam Ekran / Screensaver Butonu -->
    <div class="relative z-10 w-full flex items-center justify-end">
      <button
        @click="toggleFullscreen"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 rounded-xl transition-all duration-200 border border-slate-700/50 backdrop-blur-md active:scale-95 shadow-lg"
        :title="isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Modu'"
      >
        <Icon :name="isFullscreen ? 'heroicons:arrows-pointing-in' : 'heroicons:arrows-pointing-out'" class="w-3.5 h-3.5" />
        <span class="text-[11px]">{{ isFullscreen ? 'Küçült' : 'Ekran Koruyucu' }}</span>
      </button>
    </div>

    <!-- MERKEZ/ALT: Sadece Temiz & Şık Dijital Saat ve Tarih -->
    <div class="relative z-10 my-auto sm:my-0 sm:mb-2 flex flex-col items-center justify-center text-center px-6 py-3.5 sm:px-8 sm:py-4 rounded-3xl bg-slate-950/55 backdrop-blur-xl border border-white/10 shadow-2xl">
      <!-- Canlı Dijital Saat -->
      <div class="font-mono text-5xl sm:text-6xl md:text-7xl font-bold tracking-widest text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
        {{ currentTime }}
      </div>
      
      <!-- Türkçe Tarih -->
      <div class="mt-1.5 text-xs sm:text-sm md:text-base font-medium tracking-wider text-slate-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        {{ currentDate }}
      </div>
    </div>

    <!-- Dengeleyici Boşluk -->
    <div class="relative z-10 hidden sm:block h-6 pointer-events-none"></div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Sayfa Başlığı
useHead({
  title: 'TenaxLine Dental Suite'
});

// Canlı Dijital Saat ve Tarih
const currentTime = ref('');
const currentDate = ref('');
let clockTimer = null;

const updateClock = () => {
  const now = new Date();
  
  // Dijital Saat (HH:mm:ss)
  currentTime.value = now.toLocaleTimeString('tr-TR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Uzun Türkçe Tarih (Örn: 1 Ekim 2026, Perşembe)
  currentDate.value = now.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });
};

// Screensaver / Tam Ekran Kontrolü
const isFullscreen = ref(false);

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true;
    }).catch((err) => {
      console.warn('Tam ekran moduna geçilemedi:', err);
    });
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false;
    }).catch((err) => {
      console.warn('Tam ekrandan çıkılamadı:', err);
    });
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
</script>

<style scoped>
/* Sade ve pürüzsüz geçişler */
</style>


