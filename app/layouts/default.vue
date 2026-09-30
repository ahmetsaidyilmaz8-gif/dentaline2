<template>
  <div class="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 font-sans flex text-slate-800 dark:text-slate-100 antialiased transition-colors duration-200 relative">
    <!-- Mobil Sidebar Menü Butonu -->
    <button
      @click="isMobileMenuOpen = !isMobileMenuOpen"
      class="lg:hidden fixed bottom-5 right-5 z-50 bg-teal-600 hover:bg-teal-700 text-white p-3.5 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform active:scale-95"
    >
      <Icon :name="isMobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="w-6 h-6 text-white" />
    </button>

    <!-- Sidebar (Sol Menü) -->
    <aside
      :class="[
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out'
      ]"
    >
      <!-- Logo & Klinik Bilgisi -->
      <div>
        <div class="px-6 py-6 border-b border-slate-800/60 flex items-center justify-between gap-3">
          <NuxtLink
            to="/"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-2.5 group cursor-pointer select-none transition-all duration-200"
          >
            <div class="relative flex items-center justify-center w-9 h-9 transition-transform duration-200 group-hover:scale-105">
              <img src="/option2_pure_tooth.png" alt="TenaxLine Logo" class="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
            </div>
            <div>
              <h1 class="font-bold text-white text-lg tracking-wide leading-none group-hover:text-teal-400 transition-colors">TenaxLine</h1>
              <span class="text-xs text-slate-500 font-medium">Dental Suite</span>
            </div>
          </NuxtLink>
          <button
            @click="toggleTheme"
            class="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700/50 transition-all duration-200 active:scale-95 flex items-center justify-center"
            title="Tema Değiştir"
          >
            <Icon :name="isDark ? 'heroicons:sun' : 'heroicons:moon'" class="w-5 h-5" />
          </button>
        </div>

        <!-- Menü Linkleri -->
        <nav class="px-4 py-6 space-y-6">
          <div>
            <div class="px-3 text-sm font-semibold tracking-wider text-slate-500 uppercase">Ana Menü</div>
            <div class="mt-2 space-y-1">
              <NuxtLink
                to="/"
                class="flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 group"
                active-class="bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 pl-2"
                :class="[isRouteActive('/') ? '' : 'hover:bg-slate-800/40 hover:text-white']"
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:squares-2x2" class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Dashboard</span>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/patients"
                class="flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 group"
                active-class="bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 pl-2"
                :class="[isRouteActive('/patients') ? '' : 'hover:bg-slate-800/40 hover:text-white']"
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:users" class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Hastalar</span>
                </div>
                <span v-if="stats?.totalPatients" class="px-2 py-0.5 text-xs font-semibold bg-slate-800 text-slate-400 rounded-full border border-slate-700/50">
                  {{ stats.totalPatients }}
                </span>
              </NuxtLink>
            </div>
          </div>

          <div>
            <div class="px-3 text-sm font-semibold tracking-wider text-slate-500 uppercase">Klinik</div>
            <div class="mt-2 space-y-1">
              <NuxtLink
                to="/appointments"
                class="flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 group"
                active-class="bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 pl-2"
                :class="[isRouteActive('/appointments') ? '' : 'hover:bg-slate-800/40 hover:text-white']"
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:calendar-days" class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Randevular</span>
                </div>
                <span v-if="stats?.todayAppts" class="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                  Bugün: {{ stats.todayAppts }}
                </span>
              </NuxtLink>

              <NuxtLink
                to="/payments"
                class="flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 group"
                active-class="bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 pl-2"
                :class="[isRouteActive('/payments') ? '' : 'hover:bg-slate-800/40 hover:text-white']"
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:banknotes" class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Ödemeler & Finans</span>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/doctor-finances"
                class="flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 group"
                active-class="bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 pl-2"
                :class="[isRouteActive('/doctor-finances') ? '' : 'hover:bg-slate-800/40 hover:text-white']"
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:scale" class="w-5 h-5 text-amber-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Hekim Hak Edişleri</span>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/orthodontics"
                class="flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 group"
                active-class="bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 pl-2"
                :class="[isRouteActive('/orthodontics') ? '' : 'hover:bg-slate-800/40 hover:text-white']"
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:sparkles" class="w-5 h-5 text-indigo-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Ortodonti</span>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/lab-works"
                class="flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 group"
                active-class="bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 pl-2"
                :class="[isRouteActive('/lab-works') ? '' : 'hover:bg-slate-800/40 hover:text-white']"
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:cube" class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Laboratuvar & Protez</span>
                </div>
              </NuxtLink>

              <NuxtLink
                to="/backup"
                class="flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 group"
                active-class="bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 pl-2"
                :class="[isRouteActive('/backup') ? '' : 'hover:bg-slate-800/40 hover:text-white']"
                @click="isMobileMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:circle-stack" class="w-5 h-5 text-teal-400 transition-transform duration-200 group-hover:scale-110" />
                  <span>Veri Yedekleme</span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </nav>
      </div>

      <!-- Saat ve Alt Alan -->
      <div class="p-4 border-t border-slate-800/60 bg-slate-950/40 space-y-4">
        <!-- Aktif Kullanıcı Kartı & Çıkış Butonu -->
        <div class="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0 tracking-wider">
              {{ doctorInitials }}
            </div>
            <div class="min-w-0">
              <div class="text-xs font-semibold text-white truncate">{{ currentDoctor.name }}</div>
              <div class="text-[10px] flex items-center gap-1 font-medium text-emerald-400">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Çevrimiçi</span>
              </div>
            </div>
          </div>
          <button
            @click="logout"
            class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
            title="Çıkış Yap"
          >
            <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
          </button>
        </div>

        <div class="text-center py-2 bg-slate-900/60 rounded-xl border border-slate-800/50">
          <div class="text-white text-2xl font-bold tracking-widest leading-none font-mono">
            {{ currentTime }}
          </div>
          <div class="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mt-1 font-mono">
            {{ currentDate }}
          </div>
        </div>
        <div class="text-center text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
          TenaxLine Clinic Suite v2.0
        </div>
      </div>
    </aside>

    <!-- Ana İçerik Alanı -->
    <div class="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden relative">
      <!-- Arka plan süslemeleri (vibrant colors) -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0" style="contain: paint; isolation: isolate;">
        <div class="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-b from-teal-500/5 to-transparent blur-3xl rounded-full"></div>
        <div class="absolute bottom-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-t from-blue-500/5 to-transparent blur-3xl rounded-full"></div>
      </div>

      <!-- Masaüstü Modu Uyarısı (Yalnızca telefonunda Masaüstü Sitesi açık kalmış kullanıcılarda görünür) -->
      <div
        v-if="isForcedDesktopOnMobile"
        class="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-40 relative"
      >
        <div class="flex items-center gap-2">
          <span class="text-base">📱</span>
          <span>Tarayıcınızda <strong>Masaüstü Sitesi</strong> açık olduğu için uygulama masaüstü modunda görünüyor. Mobil görünüme dönmek için Chrome'da 3 noktadan <strong>"Masaüstü sitesi"</strong> onay kutusunu kaldırabilirsiniz.</span>
        </div>
        <button
          @click="isForcedDesktopOnMobile = false"
          class="p-1 hover:bg-amber-600 rounded-lg transition-colors ml-2 shrink-0"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>

      <!-- Üst Navigasyon & Bildirim Header'ı -->
      <header class="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-30 sticky top-0">
        <div class="flex items-center gap-3">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            title="Menüyü Aç"
          >
            <Icon name="heroicons:bars-3" class="w-6 h-6" />
          </button>
          <div class="hidden sm:flex items-center gap-2">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Klinik Yönetim Sistemi</span>
          </div>
        </div>

        <!-- Sağ: Bildirim Zili & Hızlı Aksiyonlar -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Aktif Hekim Rozeti -->
          <div v-if="currentDoctor.name" class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{{ currentDoctor.name }}</span>
          </div>

          <!-- AI Klinik Asistanı Header Kısayolu -->
          <button
            @click="openAiAssistant"
            class="px-2.5 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border border-teal-500/25 shadow-xs active:scale-95"
            title="Yapay Zeka Klinik Asistanı"
          >
            <Icon name="heroicons:sparkles" class="w-4 h-4 text-teal-500" />
            <span class="hidden sm:inline">AI Asistan</span>
          </button>

          <NotificationCenter />
          <button
            @click="toggleTheme"
            class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Tema Değiştir"
          >
            <Icon :name="isDark ? 'heroicons:sun' : 'heroicons:moon'" class="w-5.5 h-5.5" />
          </button>
        </div>
      </header>

      <!-- Main container -->
      <main class="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 pt-4 pb-24 sm:pb-8 max-w-7xl mx-auto w-full max-w-full min-w-0 overflow-x-hidden relative z-10">
        <slot />
      </main>

      <!-- Yapay Zeka Asistanı -->
      <AiAssistantDrawer />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { logout, currentDoctor } = useAuth();

const doctorInitials = computed(() => {
  const name = currentDoctor.value?.name || '';
  const clean = name.replace(/^dt\.?\s*/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toLocaleUpperCase('tr-TR');
  }
  return clean ? clean.slice(0, 2).toLocaleUpperCase('tr-TR') : 'DR';
});
const isMobileMenuOpen = ref(false);
const isDark = ref(false);
const isForcedDesktopOnMobile = ref(false);

const openAiAssistant = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toggle-ai-assistant'));
  }
};

const checkDesktopMode = () => {
  if (typeof window === 'undefined') return;
  const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  const isPhoneScreen = window.screen && (window.screen.width < 768 || window.screen.height < 600);
  const isWideViewport = window.innerWidth >= 800;
  isForcedDesktopOnMobile.value = isTouch && isPhoneScreen && isWideViewport;
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

// Saat ve Tarih
const currentTime = ref('00:00:00');
const currentDate = ref('-- -- ----');

// Dashboard İstatistikleri
const stats = ref(null);
const fetchStats = async () => {
  try {
    const data = await $fetch('/api/stats');
    stats.value = data;
  } catch (error) {
    console.error('İstatistikler yüklenemedi:', error);
  }
};

let timer = null;
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('tr-TR', { hour12: false });
  currentDate.value = now.toLocaleDateString('tr-TR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const isRouteActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

// Global event bus benzeri yenileme dinleyici
onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark');
  checkDesktopMode();
  window.addEventListener('resize', checkDesktopMode);
  updateTime();
  timer = setInterval(updateTime, 1000);
  fetchStats();
  
  // Periyodik olarak istatistikleri güncelle (örn: 30 sn)
  const statsInterval = setInterval(fetchStats, 30000);
  
  // Global olay dinleyicisi ekleyerek API güncellemelerinde istatistikleri tetikleyelim
  window.addEventListener('refresh-stats', fetchStats);

  onBeforeUnmount(() => {
    clearInterval(timer);
    clearInterval(statsInterval);
    window.removeEventListener('refresh-stats', fetchStats);
    window.removeEventListener('resize', checkDesktopMode);
  });
});
</script>

<style>
/* Nuxt sayfa geçişleri için animasyonlar */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
