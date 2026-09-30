<template>
  <div class="relative min-h-[calc(100vh-6rem)] w-full flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-hidden select-none bg-[#070b0e]">
    
    <!-- ARKA PLAN GÖRSELİ (16:9 Genişletilmiş Sinematik Diş Şehri) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      <!-- 16:9 Geniş Ekran Arka Plan Sanat Eseri -->
      <img
        src="/wide_city_tooth.jpg"
        alt="Dental Architecture Art"
        class="w-full h-full object-cover object-center scale-[1.01]"
      />

      <!-- Kenar Yumuşatma & Kusursuz Renk Bütünleştirme (Vignette Fade) -->
      <div class="absolute inset-0 bg-radial from-transparent via-[#070b0e]/5 to-[#070b0e]/70"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#070b0e] via-transparent to-[#070b0e]/40"></div>
    </div>

    <!-- ÜST KISIM: Minimal Şeffaf Tam Ekran Butonu -->
    <div class="relative z-10 w-full flex items-center justify-end">
      <button
        @click="toggleFullscreen"
        class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-black/30 hover:bg-black/60 rounded-xl transition-all duration-200 border border-white/5 backdrop-blur-md active:scale-95 shadow-md"
        :title="isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Ekran Koruyucu'"
      >
        <Icon :name="isFullscreen ? 'heroicons:arrows-pointing-in' : 'heroicons:arrows-pointing-out'" class="w-3.5 h-3.5" />
        <span class="text-[11px] tracking-wide">{{ isFullscreen ? 'Küçült' : 'Ekran Koruyucu' }}</span>
      </button>
    </div>

    <!-- ALT KISIM: Sanat Eserini Asla Kapatmayan, Aşağıya Konumlandırılmış Estetik Saat & Tarih -->
    <div class="relative z-10 w-full flex flex-col items-center justify-center pb-2 sm:pb-4 md:pb-6">
      <div class="flex flex-col items-center justify-center text-center px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl bg-[#070b0e]/65 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <!-- Canlı Dijital Saat -->
        <div class="font-mono text-4xl sm:text-5xl md:text-6xl font-extralight tracking-[0.18em] text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
          {{ currentTime }}
        </div>
        
        <!-- Türkçe Tarih -->
        <div class="mt-1 flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.25em] text-slate-400 uppercase drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]">
          <span>{{ currentDate }}</span>
        </div>
      </div>
    </div>

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
/* Ultra temiz ve modern stil */
</style>



