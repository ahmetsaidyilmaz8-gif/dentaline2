<template>
  <div class="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 overflow-hidden select-none">
    
    <!-- Atmosferik Derinlik & Neon Işıma Arka Planı -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <!-- Üst Merkez Neon Cyan / Teal Hologram Spotu -->
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] sm:w-[48rem] sm:h-[48rem] bg-gradient-to-b from-cyan-500/15 via-teal-500/10 to-transparent rounded-full blur-[140px] animate-pulse-slow"></div>
      
      <!-- Sol Alt & Sağ Üst Atmosferik Işıklar -->
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 dark:bg-teal-400/10 rounded-full blur-[120px]"></div>
      <div class="absolute -top-20 -right-20 w-96 h-96 bg-sky-500/10 dark:bg-cyan-400/10 rounded-full blur-[120px]"></div>
      
      <!-- Tıbbi Yüksek Hassasiyetli CAD/CAM Izgara Deseni (Precision Grid) -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e908_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e908_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,#000_65%,transparent_100%)]"></div>

      <!-- Yüzen Işık Parçacıkları (Floating Star Dust) -->
      <div class="particle-1 absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
      <div class="particle-2 absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_10px_#5eead4]"></div>
      <div class="particle-3 absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]"></div>
      <div class="particle-4 absolute top-2/3 right-1/3 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]"></div>
    </div>

    <!-- Üst Kontrol & Durum Barı -->
    <div class="relative z-10 w-full max-w-5xl flex items-center justify-between py-2 px-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
      <div class="flex items-center gap-3">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase">TenaxLine Dental Suite</span>
          <span class="hidden sm:inline-block text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            CAD/CAM 3D Studio
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Sistem Durum Rozeti -->
        <div class="hidden md:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <Icon name="heroicons:cpu-chip" class="w-3.5 h-3.5 text-teal-500" />
          <span>Optik Tarama Aktif</span>
        </div>

        <!-- Tam Ekran Screensaver Butonu -->
        <button
          @click="toggleFullscreen"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-all duration-200 border border-slate-200/60 dark:border-slate-700/50 active:scale-95 shadow-xs"
          :title="isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Klinik Bekleme Modu'"
        >
          <Icon :name="isFullscreen ? 'heroicons:arrows-pointing-in' : 'heroicons:arrows-pointing-out'" class="w-3.5 h-3.5" />
          <span>{{ isFullscreen ? 'Küçült' : 'Ekran Koruyucu' }}</span>
        </button>
      </div>
    </div>

    <!-- MERKEZ PANEL: 3D Holografik Diş & Lazer Tarama Sistemi + Prestijli İsim + Canlı Saat -->
    <div class="relative z-10 my-auto flex flex-col items-center justify-center text-center px-4 py-4 sm:py-6 max-w-4xl w-full">
      
      <!-- 3D HOLOGRAFİK TARAMA ALANI (HUD SCANNER CONTAINER) -->
      <div class="relative flex items-center justify-center w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96">
        
        <!-- HUD Köşe Odak Çizgileri (Target Crosshairs) -->
        <div class="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-sm pointer-events-none"></div>
        <div class="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-sm pointer-events-none"></div>
        <div class="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-sm pointer-events-none"></div>
        <div class="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400/60 rounded-br-sm pointer-events-none"></div>

        <!-- Dönen Dış Yörünge HUD Halkası 1 (Saat Yönü) -->
        <div class="absolute inset-1 sm:inset-3 rounded-full border border-cyan-500/25 dark:border-cyan-400/35 border-dashed animate-spin-ultra-slow pointer-events-none"></div>
        
        <!-- Ters Dönen İç Hassas Skala Halkası 2 (Saat Ters Yönü) -->
        <div class="absolute inset-8 sm:inset-10 rounded-full border-2 border-teal-500/15 dark:border-teal-400/25 animate-spin-reverse-slow pointer-events-none"></div>
        
        <!-- Yörüngede Dönen Optik Sensör Tanecikleri (Orbiting Sensor Nodes) -->
        <div class="absolute inset-0 animate-spin-slow pointer-events-none">
          <div class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_16px_#22d3ee] absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div class="w-1 h-1 rounded-full bg-white"></div>
          </div>
        </div>
        <div class="absolute inset-5 animate-spin-reverse-slow pointer-events-none">
          <div class="w-2.5 h-2.5 rounded-full bg-teal-300 shadow-[0_0_12px_#5eead4] absolute bottom-2 left-1/2 -translate-x-1/2"></div>
        </div>

        <!-- 3D Nefes Alan Diş Hologramı ve Lazer Işını Konteyneri -->
        <div class="tooth-3d-box relative z-10 w-48 h-48 sm:w-60 sm:h-60 md:w-68 md:h-68 flex items-center justify-center">
          
          <!-- HOLOGRAFİK LAZER TARAMA ÇİZGİSİ (Ağız İçi 3D Tarayıcı Lazer Simülasyonu) -->
          <div class="laser-scanner-line pointer-events-none z-20">
            <!-- Ana Parlayan Lazer Çizgisi -->
            <div class="laser-beam"></div>
            <!-- Lazer Tarama Huzmesi (Işık Perdesi) -->
            <div class="laser-cone"></div>
            <!-- Lazer Uç Noktaları -->
            <div class="laser-dot left-dot"></div>
            <div class="laser-dot right-dot"></div>
          </div>

          <!-- Yüksek Detaylı Anatomik Vektör Diş SVG -->
          <svg
            viewBox="0 0 200 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full filter drop-shadow-[0_0_30px_rgba(6,182,212,0.7)] dark:drop-shadow-[0_0_40px_rgba(34,211,238,0.85)]"
          >
            <defs>
              <!-- Hologram Mine Gradyanı -->
              <linearGradient id="holoToothGrad" x1="20" y1="10" x2="180" y2="210" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="30%" stop-color="#06b6d4" />
                <stop offset="65%" stop-color="#14b8a6" />
                <stop offset="100%" stop-color="#0284c7" />
              </linearGradient>
              
              <!-- Neon Çizgi Gradyanı -->
              <linearGradient id="holoStrokeGrad" x1="0" y1="0" x2="200" y2="220" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#f0fdfa" />
                <stop offset="20%" stop-color="#67e8f9" />
                <stop offset="60%" stop-color="#2dd4bf" />
                <stop offset="100%" stop-color="#38bdf8" />
              </linearGradient>

              <!-- Mine Yüzeyi Kristal Parlama Gradyanı -->
              <linearGradient id="enamelSpecular" x1="50" y1="20" x2="150" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
                <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
              </linearGradient>

              <!-- Pulpa Odası İç Derinlik Gradyanı -->
              <radialGradient id="pulpCoreGlow" cx="50%" cy="42%" r="48%">
                <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.4" />
                <stop offset="50%" stop-color="#0f766e" stop-opacity="0.15" />
                <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
              </radialGradient>
            </defs>

            <!-- Arka Plan İç Derinlik Gövdesi -->
            <path
              d="M100 20 C135 20, 168 32, 172 65 C176 95, 160 125, 148 155 C138 180, 130 205, 116 205 C108 205, 104 185, 100 160 C96 185, 92 205, 84 205 C70 205, 62 180, 52 155 C40 125, 24 95, 28 65 C32 32, 65 20, 100 20 Z"
              fill="url(#pulpCoreGlow)"
            />

            <!-- Ana Diş Konturu ve Yarı Saydam Hologram Yüzeyi -->
            <path
              d="M100 22 C134 22, 165 34, 169 66 C173 94, 158 123, 146 153 C136 177, 128 202, 115 202 C108 202, 104 182, 100 158 C96 182, 92 202, 85 202 C72 202, 64 177, 54 153 C42 123, 27 94, 31 66 C35 34, 66 22, 100 22 Z"
              fill="url(#holoToothGrad)"
              fill-opacity="0.14"
              stroke="url(#holoStrokeGrad)"
              stroke-width="3.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Üst Çiğneme Yüzeyi Oklüzal Vadi Detayı -->
            <path
              d="M72 32 C85 44, 100 45, 100 45 C100 45, 115 44, 128 32"
              stroke="url(#holoStrokeGrad)"
              stroke-width="2.5"
              stroke-linecap="round"
              fill="none"
              opacity="0.85"
            />

            <!-- Sol Kök Kanalı Tarama Hattı -->
            <path
              d="M68 85 C62 110, 58 135, 65 160 C68 172, 73 182, 78 190"
              stroke="url(#holoStrokeGrad)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-dasharray="3 4"
              opacity="0.75"
            />

            <!-- Sağ Kök Kanalı Tarama Hattı -->
            <path
              d="M132 85 C138 110, 142 135, 135 160 C132 172, 127 182, 122 190"
              stroke="url(#holoStrokeGrad)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-dasharray="3 4"
              opacity="0.75"
            />

            <!-- Mine Yüzeyi Kristal Parlama Yansıması -->
            <path
              d="M48 60 C46 45, 62 34, 82 30 C70 36, 52 48, 50 68 C49 76, 52 86, 54 94"
              fill="url(#enamelSpecular)"
              opacity="0.8"
            />

            <!-- 3D Tarama Koordinat Noktaları (CAD Nodes) -->
            <circle cx="100" cy="80" r="2.5" fill="#f0fdfa" class="animate-ping" style="animation-duration: 2.5s;" />
            <circle cx="130" cy="55" r="2" fill="#a5f3fc" class="animate-pulse" />
            <circle cx="70" cy="58" r="2" fill="#67e8f9" class="animate-pulse" />
            <circle cx="85" cy="120" r="1.5" fill="#2dd4bf" opacity="0.8" />
            <circle cx="115" cy="120" r="1.5" fill="#2dd4bf" opacity="0.8" />
          </svg>
        </div>

        <!-- Alt Tarama Durum Hapı (CAD/CAM Status) -->
        <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono tracking-wider text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span>LASER SCAN ACTIVE • 0.02mm</span>
        </div>

      </div>

      <!-- PRESTİJLİ KLİNİK VE DOKTOR BAŞLIĞI -->
      <div class="mt-6 sm:mt-8 space-y-2">
        <!-- Doktor İsmi -->
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.45)]">
          Dt. Muhammed Selman Yılmaz
        </h1>

        <!-- Klinik Ünvanı ve Ayracı -->
        <div class="flex items-center justify-center gap-3 pt-1">
          <div class="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent"></div>
          <p class="text-xs sm:text-sm md:text-base font-bold tracking-[0.25em] text-cyan-400 dark:text-cyan-300 uppercase">
            Ağız ve Diş Sağlığı Kliniği
          </p>
          <div class="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent"></div>
        </div>

        <!-- Alt Kalite & Estetik Mottosu -->
        <p class="text-[11px] sm:text-xs font-medium tracking-widest text-slate-500 dark:text-slate-400 uppercase pt-0.5">
          Estetik Diş Hekimliği • İmplantoloji • Dijital Gülüş Tasarımı
        </p>
      </div>

      <!-- CANLI DİJİTAL SAAT & TARİH GÖSTERGESİ -->
      <div class="mt-6 sm:mt-8 flex flex-col items-center gap-2">
        <!-- Büyük Dijital HUD Saat -->
        <div class="font-mono text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-slate-900 dark:text-cyan-50 drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">
          {{ currentTime }}
        </div>
        
        <!-- Tarih & Gün Rozeti -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
          <Icon name="heroicons:calendar-days" class="w-4 h-4 text-cyan-500" />
          <span>{{ currentDate }}</span>
          <span class="text-slate-400 dark:text-slate-600">•</span>
          <span class="text-emerald-500 font-bold">Klinik Açık</span>
        </div>
      </div>

    </div>

    <!-- ALT BÖLÜM: Minimal, Saydam Hızlı Erişim Dock'u (Zarif & Rahatsız Etmeyen) -->
    <div class="relative z-10 w-full max-w-xl flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
      <NuxtLink
        to="/patients"
        class="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/50 dark:bg-slate-900/50 hover:bg-cyan-500 hover:text-slate-950 dark:hover:bg-cyan-400 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
      >
        <Icon name="heroicons:users" class="w-3.5 h-3.5 text-cyan-500 group-hover:text-slate-950 transition-colors" />
        <span>Hastalar</span>
      </NuxtLink>

      <NuxtLink
        to="/appointments"
        class="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/50 dark:bg-slate-900/50 hover:bg-cyan-500 hover:text-slate-950 dark:hover:bg-cyan-400 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
      >
        <Icon name="heroicons:calendar-days" class="w-3.5 h-3.5 text-cyan-500 group-hover:text-slate-950 transition-colors" />
        <span>Randevular</span>
      </NuxtLink>

      <NuxtLink
        to="/payments"
        class="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/50 dark:bg-slate-900/50 hover:bg-cyan-500 hover:text-slate-950 dark:hover:bg-cyan-400 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
      >
        <Icon name="heroicons:banknotes" class="w-3.5 h-3.5 text-cyan-500 group-hover:text-slate-950 transition-colors" />
        <span>Ödemeler & Finans</span>
      </NuxtLink>

      <NuxtLink
        to="/orthodontics"
        class="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/50 dark:bg-slate-900/50 hover:bg-cyan-500 hover:text-slate-950 dark:hover:bg-cyan-400 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs"
      >
        <Icon name="heroicons:sparkles" class="w-3.5 h-3.5 text-cyan-500 group-hover:text-slate-950 transition-colors" />
        <span>Ortodonti</span>
      </NuxtLink>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Sayfa Başlığı
useHead({
  title: 'Dt. Muhammed Selman Yılmaz — TenaxLine Dental Suite'
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
/* 3D Nefes Alan Diş Hologramı Animasyonu */
.tooth-3d-box {
  animation: holoToothFloat 6s ease-in-out infinite;
  transform-style: preserve-3d;
  perspective: 1200px;
}

@keyframes holoToothFloat {
  0% {
    transform: translateY(0px) scale(1) rotateY(0deg) rotateX(0deg);
  }
  25% {
    transform: translateY(-8px) scale(1.03) rotateY(5deg) rotateX(2deg);
  }
  50% {
    transform: translateY(-14px) scale(1.06) rotateY(0deg) rotateX(-2deg);
  }
  75% {
    transform: translateY(-7px) scale(1.03) rotateY(-5deg) rotateX(1deg);
  }
  100% {
    transform: translateY(0px) scale(1) rotateY(0deg) rotateX(0deg);
  }
}

/* HOLOGRAFİK LAZER TARAMA SİSTEMİ (3D Intraoral Scanner Effect) */
.laser-scanner-line {
  position: absolute;
  left: -15%;
  right: -15%;
  height: 3px;
  animation: laserScanCycle 4s ease-in-out infinite;
  z-index: 30;
}

/* Lazer Işını Çizgisi */
.laser-beam {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, #22d3ee 20%, #34d399 50%, #22d3ee 80%, transparent 100%);
  box-shadow: 
    0 0 10px #22d3ee,
    0 0 20px #06b6d4,
    0 0 35px #10b981;
  border-radius: 9999px;
}

/* Lazer Tarama Işık Perdesi (Trailing Holographic Cone) */
.laser-cone {
  position: absolute;
  left: 5%;
  right: 5%;
  top: 100%;
  height: 38px;
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.28) 0%, rgba(16, 185, 129, 0.08) 60%, transparent 100%);
  clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
  filter: blur(1px);
}

/* Lazer Uç Noktaları */
.laser-dot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 12px #22d3ee;
}
.left-dot {
  left: 10%;
}
.right-dot {
  right: 10%;
}

/* Lazer Yukarı Aşağı Tarama Döngüsü */
@keyframes laserScanCycle {
  0% {
    top: 6%;
    opacity: 0.2;
  }
  12% {
    opacity: 1;
  }
  50% {
    top: 92%;
    opacity: 1;
  }
  88% {
    opacity: 1;
  }
  100% {
    top: 6%;
    opacity: 0.2;
  }
}

/* Yavaş Dönen Dış Neon Halkası */
.animate-spin-ultra-slow {
  animation: spinUltraSlow 32s linear infinite;
}

@keyframes spinUltraSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Ters Yavaş Dönen Hassas Skala Halkası */
.animate-spin-reverse-slow {
  animation: spinReverseSlow 24s linear infinite;
}

@keyframes spinReverseSlow {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

/* Yörünge Dönüşü */
.animate-spin-slow {
  animation: spinSlow 15s linear infinite;
}

@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Nabız Glow Efekti */
.animate-pulse-slow {
  animation: pulseSlow 6s ease-in-out infinite;
}

@keyframes pulseSlow {
  0%, 100% {
    opacity: 0.45;
    transform: translate(-50%, -50%) scale(0.95);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.08);
  }
}

/* Süzülen Parçacık Animasyonları */
.particle-1 {
  animation: floatParticle1 12s ease-in-out infinite alternate;
}
.particle-2 {
  animation: floatParticle2 16s ease-in-out infinite alternate;
}
.particle-3 {
  animation: floatParticle3 14s ease-in-out infinite alternate;
}
.particle-4 {
  animation: floatParticle4 18s ease-in-out infinite alternate;
}

@keyframes floatParticle1 {
  0% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
  50% { transform: translateY(-30px) translateX(20px); opacity: 0.9; }
  100% { transform: translateY(-60px) translateX(-15px); opacity: 0.4; }
}
@keyframes floatParticle2 {
  0% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
  50% { transform: translateY(40px) translateX(-25px); opacity: 0.85; }
  100% { transform: translateY(15px) translateX(30px); opacity: 0.3; }
}
@keyframes floatParticle3 {
  0% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
  50% { transform: translateY(-25px) translateX(-35px); opacity: 0.9; }
  100% { transform: translateY(-50px) translateX(15px); opacity: 0.2; }
}
@keyframes floatParticle4 {
  0% { transform: translateY(0px) translateX(0px); opacity: 0.25; }
  50% { transform: translateY(35px) translateX(25px); opacity: 0.8; }
  100% { transform: translateY(-20px) translateX(-20px); opacity: 0.3; }
}
</style>

