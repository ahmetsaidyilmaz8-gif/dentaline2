<template>
  <div class="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden select-none">
    
    <!-- Arka Plan Atmosferik Neon Parlamaları (Ambient Glows) -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <!-- Üst Merkez Neon Cyan Spot -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] sm:w-[42rem] sm:h-[42rem] bg-cyan-500/10 dark:bg-cyan-400/15 rounded-full blur-[120px] animate-pulse-slow"></div>
      <!-- Sol Alt Neon Teal Spot -->
      <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/10 dark:bg-teal-400/10 rounded-full blur-[100px]"></div>
      <!-- Sağ Üst Neon Mavi Spot -->
      <div class="absolute top-10 -right-20 w-80 h-80 bg-sky-500/10 dark:bg-sky-400/10 rounded-full blur-[100px]"></div>
      <!-- Arka Plan İnce Izgara Deseni (Subtle Grid) -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e90a_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e90a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </div>

    <!-- Üst İnce Durum Çubuğu / Kontrol Barı -->
    <div class="relative z-10 w-full max-w-4xl flex items-center justify-between py-2 px-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
      <div class="flex items-center gap-2.5">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
        </span>
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">TenaxLine Dental Suite</span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Tam Ekran / Screensaver Modu Butonu -->
        <button
          @click="toggleFullscreen"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 bg-slate-100/60 dark:bg-slate-800/60 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50 active:scale-95"
          :title="isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Screensaver'"
        >
          <Icon :name="isFullscreen ? 'heroicons:arrows-pointing-in' : 'heroicons:arrows-pointing-out'" class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">{{ isFullscreen ? 'Küçült' : 'Ekran Koruyucu' }}</span>
        </button>
      </div>
    </div>

    <!-- MERKEZ PANEL: Neon Diş Animasyonu + "Smile :)" + Dijital Saat -->
    <div class="relative z-10 my-auto flex flex-col items-center justify-center text-center px-4 py-8">
      
      <!-- 3D/Neon Sonsuz Döngü Diş Animasyonu Konteyneri -->
      <div class="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
        
        <!-- Dönen Dış Neon Enerji Halkası 1 -->
        <div class="absolute inset-2 sm:inset-4 rounded-full border border-cyan-500/20 dark:border-cyan-400/30 border-dashed animate-spin-ultra-slow pointer-events-none"></div>
        
        <!-- Ters Dönen İç Parıltı Halkası 2 -->
        <div class="absolute inset-8 sm:inset-12 rounded-full border-2 border-teal-500/10 dark:border-teal-400/20 animate-spin-reverse-slow pointer-events-none"></div>
        
        <!-- Yörüngede Dönen Işık Taneciği (Orbiting Photon) -->
        <div class="absolute inset-0 animate-spin-slow pointer-events-none">
          <div class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] absolute top-2 left-1/2 -translate-x-1/2"></div>
        </div>
        <div class="absolute inset-4 animate-spin-reverse-slow pointer-events-none">
          <div class="w-2.5 h-2.5 rounded-full bg-teal-300 shadow-[0_0_12px_#5eead4] absolute bottom-4 left-1/2 -translate-x-1/2"></div>
        </div>

        <!-- Merkez Neon SVG Diş (Nefes Alan / Yüzen Döngü) -->
        <div class="tooth-anim-container relative z-10 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
          <svg
            viewBox="0 0 200 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full filter drop-shadow-[0_0_25px_rgba(6,182,212,0.65)] dark:drop-shadow-[0_0_35px_rgba(34,211,238,0.75)]"
          >
            <defs>
              <!-- Neon Gövde Gradyanı -->
              <linearGradient id="neonToothGrad" x1="20" y1="10" x2="180" y2="210" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="35%" stop-color="#06b6d4" />
                <stop offset="70%" stop-color="#14b8a6" />
                <stop offset="100%" stop-color="#0284c7" />
              </linearGradient>
              
              <!-- Neon Çizgi Gradyanı -->
              <linearGradient id="neonStrokeGrad" x1="0" y1="0" x2="200" y2="220" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#e0f2fe" />
                <stop offset="25%" stop-color="#67e8f9" />
                <stop offset="60%" stop-color="#2dd4bf" />
                <stop offset="100%" stop-color="#38bdf8" />
              </linearGradient>

              <!-- İç Işık Yansıması Gradyanı -->
              <linearGradient id="highlightGrad" x1="60" y1="20" x2="140" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0" />
              </linearGradient>

              <!-- Derinlik Dolgu Gradyanı -->
              <radialGradient id="coreGlow" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35" />
                <stop offset="60%" stop-color="#0f172a" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0" />
              </radialGradient>
            </defs>

            <!-- Arka Plan İç Işıma Gövdesi -->
            <path
              d="M100 20 C135 20, 168 32, 172 65 C176 95, 160 125, 148 155 C138 180, 130 205, 116 205 C108 205, 104 185, 100 160 C96 185, 92 205, 84 205 C70 205, 62 180, 52 155 C40 125, 24 95, 28 65 C32 32, 65 20, 100 20 Z"
              fill="url(#coreGlow)"
            />

            <!-- Ana Diş Konturu ve Yarı Saydam Gövde -->
            <path
              d="M100 22 C134 22, 165 34, 169 66 C173 94, 158 123, 146 153 C136 177, 128 202, 115 202 C108 202, 104 182, 100 158 C96 182, 92 202, 85 202 C72 202, 64 177, 54 153 C42 123, 27 94, 31 66 C35 34, 66 22, 100 22 Z"
              fill="url(#neonToothGrad)"
              fill-opacity="0.12"
              stroke="url(#neonStrokeGrad)"
              stroke-width="3.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Üst Kuron Çöküntü / Oklüzal Vadi Detayı (Anatomik Kıvrım) -->
            <path
              d="M72 32 C85 44, 100 45, 100 45 C100 45, 115 44, 128 32"
              stroke="url(#neonStrokeGrad)"
              stroke-width="2.5"
              stroke-linecap="round"
              fill="none"
              opacity="0.8"
            />

            <!-- Sol Kök Kanal / Yansıma Çizgisi -->
            <path
              d="M68 85 C62 110, 58 135, 65 160 C68 172, 73 182, 78 190"
              stroke="url(#neonStrokeGrad)"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-dasharray="3 4"
              opacity="0.6"
            />

            <!-- Sağ Kök Kanal / Yansıma Çizgisi -->
            <path
              d="M132 85 C138 110, 142 135, 135 160 C132 172, 127 182, 122 190"
              stroke="url(#neonStrokeGrad)"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-dasharray="3 4"
              opacity="0.6"
            />

            <!-- Ön Yüz Mine Parlama Kıvrımı (Enamel Specular Highlight) -->
            <path
              d="M48 60 C46 45, 62 34, 82 30 C70 36, 52 48, 50 68 C49 76, 52 86, 54 94"
              fill="url(#highlightGrad)"
              opacity="0.75"
            />

            <!-- Kuron Merkezindeki Mikro Parıltı Yıldızları -->
            <circle cx="100" cy="80" r="2" fill="#e0f2fe" class="animate-ping" style="animation-duration: 3s;" />
            <circle cx="130" cy="55" r="1.5" fill="#a5f3fc" class="animate-pulse" />
            <circle cx="70" cy="58" r="1.5" fill="#67e8f9" class="animate-pulse" />
          </svg>
        </div>

      </div>

      <!-- Sade ve Estetik Karşılama Metni ("Smile :)") -->
      <div class="mt-4 sm:mt-6 space-y-1">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black tracking-wider bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
          Smile :)
        </h1>
        <p class="text-xs sm:text-sm font-semibold tracking-widest text-slate-500 dark:text-cyan-200/60 uppercase pt-1">
          Kusursuz Gülüşler İçin Tasarlandı
        </p>
      </div>

      <!-- Canlı Dijital Saat ve Türkçe Tarih Paneli -->
      <div class="mt-6 sm:mt-8 flex flex-col items-center">
        <!-- Büyük Dijital Saat (HH:mm:ss) -->
        <div class="font-mono text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-slate-800 dark:text-cyan-50 drop-shadow-[0_0_20px_rgba(34,211,238,0.25)]">
          {{ currentTime }}
        </div>
        
        <!-- Türkçe Formatlı Tarih -->
        <div class="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-sm text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
          <Icon name="heroicons:calendar-days" class="w-4 h-4 text-cyan-500" />
          <span>{{ currentDate }}</span>
        </div>
      </div>

    </div>

    <!-- ALT KISIM: Minimal Hızlı Erişim Rıhtımı (Dock Pills) -->
    <div class="relative z-10 w-full max-w-xl flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 py-3">
      <NuxtLink
        to="/patients"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/70 dark:bg-slate-900/70 hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800/80 backdrop-blur-md shadow-sm hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Icon name="heroicons:users" class="w-4 h-4" />
        <span>Hastalar</span>
      </NuxtLink>

      <NuxtLink
        to="/appointments"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/70 dark:bg-slate-900/70 hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800/80 backdrop-blur-md shadow-sm hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Icon name="heroicons:calendar-days" class="w-4 h-4" />
        <span>Randevular</span>
      </NuxtLink>

      <NuxtLink
        to="/payments"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/70 dark:bg-slate-900/70 hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800/80 backdrop-blur-md shadow-sm hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Icon name="heroicons:banknotes" class="w-4 h-4" />
        <span>Ödemeler & Finans</span>
      </NuxtLink>

      <NuxtLink
        to="/orthodontics"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/70 dark:bg-slate-900/70 hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800/80 backdrop-blur-md shadow-sm hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Icon name="heroicons:sparkles" class="w-4 h-4" />
        <span>Ortodonti</span>
      </NuxtLink>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Sayfa Başlığı
useHead({
  title: 'TenaxLine Clinic Suite — Smile :)'
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

  // Uzun Türkçe Tarih (Örn: 13 Eylül 2026, Pazar)
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
/* 3D Yüzen ve Nefes Alan Neon Diş Keyframe Animasyonu */
.tooth-anim-container {
  animation: neonToothFloat 6s ease-in-out infinite;
  transform-style: preserve-3d;
  perspective: 1000px;
}

@keyframes neonToothFloat {
  0% {
    transform: translateY(0px) scale(1) rotateY(0deg);
  }
  25% {
    transform: translateY(-10px) scale(1.04) rotateY(4deg);
  }
  50% {
    transform: translateY(-16px) scale(1.08) rotateY(0deg);
  }
  75% {
    transform: translateY(-8px) scale(1.04) rotateY(-4deg);
  }
  100% {
    transform: translateY(0px) scale(1) rotateY(0deg);
  }
}

/* Yavaş Dönen Dış Neon Halkası */
.animate-spin-ultra-slow {
  animation: spinUltraSlow 30s linear infinite;
}

@keyframes spinUltraSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Ters Yavaş Dönen İç Parıltı Halkası */
.animate-spin-reverse-slow {
  animation: spinReverseSlow 22s linear infinite;
}

@keyframes spinReverseSlow {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

/* Orta Hızda Yörünge Dönüşü */
.animate-spin-slow {
  animation: spinSlow 14s linear infinite;
}

@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Yavaş Nabız Glow Efekti */
.animate-pulse-slow {
  animation: pulseSlow 5s ease-in-out infinite;
}

@keyframes pulseSlow {
  0%, 100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(0.95);
  }
  50% {
    opacity: 0.75;
    transform: translate(-50%, -50%) scale(1.08);
  }
}
</style>
