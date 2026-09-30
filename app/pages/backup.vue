<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
    <!-- Üst Başlık & Hızlı İndir Butonu -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Icon name="heroicons:circle-stack" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Veri Yedekleme & Geri Yükleme
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tüm klinik kayıtlarınızı tek tıkla bilgisayarınıza indirin veya eski yedekleri sisteme geri taşıyın.
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="handleExport"
          :disabled="isExporting"
          class="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <Icon v-if="isExporting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <Icon v-else name="heroicons:arrow-down-tray" class="w-4 h-4" />
          <span>{{ isExporting ? 'Paketleniyor...' : 'Hemen Yedek İndir (.JSON)' }}</span>
        </button>
      </div>
    </div>

    <!-- Bildirim Mesajları -->
    <div v-if="successMsg" class="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
      <Icon name="heroicons:check-circle" class="w-5 h-5 flex-shrink-0" />
      <span>{{ successMsg }}</span>
    </div>
    <div v-if="errorMsg" class="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
      <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 flex-shrink-0" />
      <span>{{ errorMsg }}</span>
    </div>

    <!-- HERO PANEL: CANLI YEDEKLEME DURUM KARTI -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 1. Son Yedekleme Zamanı -->
      <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Son Yedekleme Tarihi</span>
            <span
              :class="[
                isBackupRecent
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                'px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="isBackupRecent ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'"></span>
              {{ isBackupRecent ? 'Yedek Güncel' : (lastBackupDate ? 'Yedek Önerilir' : 'Yedek Alınmadı') }}
            </span>
          </div>

          <div class="mt-3">
            <div class="text-xl sm:text-2xl font-black font-mono tracking-tight text-teal-400">
              {{ formattedLastBackupDate }}
            </div>
            <div class="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <Icon name="heroicons:clock" class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ relativeBackupTime }}</span>
              <span v-if="lastBackupBy" class="text-slate-500">({{ lastBackupBy }})</span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Yedekleme Güvencesi</span>
          <span class="text-slate-300 font-mono font-semibold">JSON Formatı (Evrensel)</span>
        </div>
      </div>

      <!-- 2. Veritabanındaki Toplam Canlı Kayıt -->
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aktif Klinik Veritabanı</span>
          <div class="mt-2 text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            {{ formatNumber(stats.counts?.total || 0) }}
            <span class="text-xs font-bold text-slate-400">Kayıt</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hastalar, tedaviler, ödemeler, randevular ve ortodonti verileri dahil.
          </p>
        </div>

        <div class="mt-4 flex items-center gap-2">
          <div class="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-center">
            <span class="text-[10px] text-slate-400 block font-semibold">Hasta</span>
            <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{{ stats.counts?.patients || 0 }}</span>
          </div>
          <div class="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-center">
            <span class="text-[10px] text-slate-400 block font-semibold">Tedavi</span>
            <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{{ stats.counts?.treatments || 0 }}</span>
          </div>
          <div class="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-center">
            <span class="text-[10px] text-slate-400 block font-semibold">Tahsilat</span>
            <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{{ stats.counts?.payments || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 3. Hızlı Eylem & Veri Koruma Tavsiyesi -->
      <div class="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 text-teal-700 dark:text-teal-400">
            <Icon name="heroicons:shield-check" class="w-5 h-5 flex-shrink-0" />
            <span class="font-bold text-xs uppercase tracking-wider">Otomatik Veri Koruması</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Haftada en az bir defa veya ay sonu hekim hak ediş hesaplamalarından önce yedek indirmeniz önerilir. İndirdiğiniz dosyayı güvenli bir harici diskte veya bulutta saklayabilirsiniz.
          </p>
        </div>

        <div class="mt-4">
          <button
            @click="handleExport"
            :disabled="isExporting"
            class="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
            <span>Şimdi Bilgisayara İndir</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2 ANA SEÇENEK: YEDEK İNDİR (EXPORT) & ESKİ BİLGİLERİ GERİ TAŞI (IMPORT) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 1. SOL KART: YEDEKLEME & DIŞA AKTARMA (EXPORT) -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Icon name="heroicons:arrow-down-tray" class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                1. Bilgileri İndir (Yedekle / Export)
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Sistemdeki tüm hasta ve klinik verilerini eksiksiz bir paket halinde kaydedin.
              </p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div class="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Icon name="heroicons:check-badge" class="w-4 h-4 text-emerald-500" />
              <span>Yedek Dosyasına Neler Dahil Edilir?</span>
            </div>
            <ul class="space-y-1.5 pl-5 list-disc text-slate-500 dark:text-slate-400">
              <li>Tüm Hasta Kartları, Telefon Numaraları ve Anamnez Formları</li>
              <li>Yapılan Tüm Tedaviler, Ücretler ve Notlar</li>
              <li>Kasa Tahsilatları (Nakit, Kredi Kartı, Havale dökümleri)</li>
              <li>Randevu Takvimi ve Durumları</li>
              <li>Ortodonti Tedavi Planları, Seans Notları ve Taksit Çizelgeleri</li>
              <li>Hekim Hak Edişleri ve Kasadan Hekime Yapılan Ödemeler</li>
              <li>Laboratuvar & Protez Sipariş Kayıtları</li>
              <li>32 Diş İnteraktif Diş Haritası Durumları</li>
            </ul>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button
            @click="handleExport"
            :disabled="isExporting"
            class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <Icon v-if="isExporting" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
            <Icon v-else name="heroicons:cloud-arrow-down" class="w-5 h-5" />
            <span>{{ isExporting ? 'Yedek Paketleniyor...' : 'Tüm Bilgileri İndir (JSON Dosyası)' }}</span>
          </button>
          <p class="text-[11px] text-center text-slate-400">
            Dosya bilgisayarınızın "İndirilenler" klasörüne otomatik olarak kaydedilecektir.
          </p>
        </div>
      </div>

      <!-- 2. SAĞ KART: ESKİ BİLGİLERİ GERİ TAŞI & YÜKLE (IMPORT) -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Icon name="heroicons:arrow-up-tray" class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                2. Eski Bilgileri Geri Taşı (Yükle / Import)
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Daha önce indirdiğiniz JSON yedek dosyasını yükleyerek verileri geri yükleyin.
              </p>
            </div>
          </div>

          <!-- Dosya Yükleme Sürükle-Bırak Alanı -->
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            :class="[
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/70',
              'border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative'
            ]"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleFileSelected"
            />
            <Icon name="heroicons:document-arrow-up" class="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <div class="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
              Yedek Dosyasını (.json) Buraya Sürükleyin
            </div>
            <div class="text-[11px] text-slate-400 mt-1">
              veya bilgisayarınızdan dosya seçmek için tıklayın
            </div>
          </div>

          <!-- Seçilen Dosya Önizlemesi (Parsed JSON) -->
          <div v-if="selectedBackupFile" class="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="heroicons:document-text" class="w-5 h-5 text-indigo-600" />
                <span class="text-xs font-bold text-indigo-950 dark:text-indigo-200 truncate max-w-xs">
                  {{ selectedBackupFile.name }}
                </span>
              </div>
              <button @click="clearSelectedFile" class="text-slate-400 hover:text-rose-500 p-1">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </button>
            </div>

            <!-- Dosya Detay Rozetleri -->
            <div v-if="parsedBackupData" class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div class="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xs">
                <span class="text-[10px] text-slate-400 block">Hasta</span>
                <span class="font-mono font-bold text-slate-800 dark:text-white">{{ parsedBackupData.counts?.patients || 0 }}</span>
              </div>
              <div class="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xs">
                <span class="text-[10px] text-slate-400 block">Tedavi</span>
                <span class="font-mono font-bold text-slate-800 dark:text-white">{{ parsedBackupData.counts?.treatments || 0 }}</span>
              </div>
              <div class="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xs">
                <span class="text-[10px] text-slate-400 block">Tahsilat</span>
                <span class="font-mono font-bold text-slate-800 dark:text-white">{{ parsedBackupData.counts?.payments || 0 }}</span>
              </div>
              <div class="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xs">
                <span class="text-[10px] text-slate-400 block">Randevu</span>
                <span class="font-mono font-bold text-slate-800 dark:text-white">{{ parsedBackupData.counts?.appointments || 0 }}</span>
              </div>
            </div>

            <!-- Geri Yükleme Modu Seçimi -->
            <div class="pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50 space-y-2">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Geri Yükleme Seçeneği:
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  :class="[
                    restoreMode === 'merge'
                      ? 'border-indigo-600 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400',
                    'p-2.5 rounded-xl border-2 cursor-pointer flex items-start gap-2'
                  ]"
                >
                  <input type="radio" v-model="restoreMode" value="merge" class="mt-0.5 text-indigo-600" />
                  <div>
                    <span class="font-bold block">Akıllı Birleştir (Tavsiye)</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">Mevcut verileri korur, eksik kayıtları ekler.</span>
                  </div>
                </label>

                <label
                  :class="[
                    restoreMode === 'overwrite'
                      ? 'border-rose-500 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400',
                    'p-2.5 rounded-xl border-2 cursor-pointer flex items-start gap-2'
                  ]"
                >
                  <input type="radio" v-model="restoreMode" value="overwrite" class="mt-0.5 text-rose-600" />
                  <div>
                    <span class="font-bold block">Tam Temiz Yükleme</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">Mevcut tabloları temizleyip bu yedeği kurar.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button
            @click="handleImport"
            :disabled="!selectedBackupFile || isImporting"
            class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="isImporting" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
            <Icon v-else name="heroicons:arrow-up-tray" class="w-5 h-5" />
            <span>{{ isImporting ? 'Bilgiler Geri Yükleniyor...' : 'Seçilen Yedeği Sisteme Geri Yükle' }}</span>
          </button>
          <p class="text-[11px] text-center text-slate-400">
            İşlem tamamlandığında tüm hasta ve finans listeleri anında güncellenir.
          </p>
        </div>
      </div>
    </div>

    <!-- BÖLÜM 3: VERİTABANI DETAYLI SAYIM CETVELİ -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon name="heroicons:chart-bar-square" class="w-5 h-5 text-slate-400" />
          <span>Sistemdeki Kayıt Dağılımı</span>
        </h3>
        <button
          @click="loadStatus"
          class="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
        >
          <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoadingStatus }" />
          <span>Yenile</span>
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
          <span class="text-xs text-slate-400 block font-semibold">👥 Hastalar</span>
          <span class="text-lg font-black font-mono text-slate-800 dark:text-white mt-1 block">
            {{ formatNumber(stats.counts?.patients || 0) }}
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
          <span class="text-xs text-slate-400 block font-semibold">🦷 Tedaviler</span>
          <span class="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {{ formatNumber(stats.counts?.treatments || 0) }}
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
          <span class="text-xs text-slate-400 block font-semibold">💳 Tahsilatlar</span>
          <span class="text-lg font-black font-mono text-blue-600 dark:text-blue-400 mt-1 block">
            {{ formatNumber(stats.counts?.payments || 0) }}
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
          <span class="text-xs text-slate-400 block font-semibold">📅 Randevular</span>
          <span class="text-lg font-black font-mono text-amber-600 dark:text-amber-400 mt-1 block">
            {{ formatNumber(stats.counts?.appointments || 0) }}
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
          <span class="text-xs text-slate-400 block font-semibold">✨ Ortodonti</span>
          <span class="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
            {{ formatNumber(stats.counts?.orthodonticPlans || 0) }}
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
          <span class="text-xs text-slate-400 block font-semibold">⚖️ Hekim Ödemeleri</span>
          <span class="text-lg font-black font-mono text-purple-600 dark:text-purple-400 mt-1 block">
            {{ formatNumber(stats.counts?.doctorPayouts || 0) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { triggerFileDownload } from '~/utils/downloadHelper';

const stats = ref<any>({
  lastBackup: null,
  counts: {}
});

const isLoadingStatus = ref(false);
const isExporting = ref(false);
const isImporting = ref(false);
const isDragging = ref(false);

const successMsg = ref('');
const errorMsg = ref('');

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedBackupFile = ref<File | null>(null);
const parsedBackupData = ref<any>(null);
const restoreMode = ref<'merge' | 'overwrite'>('merge');

function showNotification(type: 'success' | 'error', msg: string) {
  if (type === 'success') {
    successMsg.value = msg;
    errorMsg.value = '';
    setTimeout(() => { successMsg.value = ''; }, 5000);
  } else {
    errorMsg.value = msg;
    successMsg.value = '';
    setTimeout(() => { errorMsg.value = ''; }, 6000);
  }
}

function formatNumber(num: number) {
  return new Intl.NumberFormat('tr-TR').format(num || 0);
}

// Son Yedekleme Tarihi ve Göreli Zaman Hesaplayıcıları
const lastBackupDate = computed(() => {
  return stats.value?.lastBackup?.date || null;
});

const lastBackupBy = computed(() => {
  return stats.value?.lastBackup?.by || '';
});

const formattedLastBackupDate = computed(() => {
  if (!lastBackupDate.value) return 'Henüz Alınmadı';
  const d = new Date(lastBackupDate.value);
  if (isNaN(d.getTime())) return 'Henüz Alınmadı';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
});

const relativeBackupTime = computed(() => {
  if (!lastBackupDate.value) return 'İlk yedeğinizi hemen alın';
  const diff = Date.now() - new Date(lastBackupDate.value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce alındı';
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
});

const isBackupRecent = computed(() => {
  if (!lastBackupDate.value) return false;
  const diff = Date.now() - new Date(lastBackupDate.value).getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days <= 7;
});

// Durum Verilerini Çek
async function loadStatus() {
  isLoadingStatus.value = true;
  try {
    const res: any = await $fetch('/api/backup/status');
    stats.value = res;
  } catch (err: any) {
    console.error('Yedekleme durumu alınamadı:', err);
  } finally {
    isLoadingStatus.value = false;
  }
}

// Tüm Verileri Yedekle & İndir (Export)
async function handleExport() {
  isExporting.value = true;
  try {
    const backupData: any = await $fetch('/api/backup/export');

    // JSON dosyasını tarayıcıda indir (Mobil, tablet ve masaüstünde doğrudan İndirilenler klasörüne)
    const jsonString = JSON.stringify(backupData, null, 2);
    const dateSlug = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `tenaxline-yedek-${dateSlug}.json`;
    triggerFileDownload(jsonString, filename);

    showNotification('success', 'Klinik verileri başarıyla paketlendi ve cihazınızın İndirilenler klasörüne kaydedildi.');
    await loadStatus();
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Yedekleme indirilirken bir hata oluştu.');
  } finally {
    isExporting.value = false;
  }
}

// Dosya Seçiciyi Aç
function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    parseBackupFile(target.files[0]);
  }
}

function handleFileDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    parseBackupFile(event.dataTransfer.files[0]);
  }
}

function parseBackupFile(file: File) {
  if (!file.name.endsWith('.json')) {
    showNotification('error', 'Lütfen geçerli bir .json uzantılı yedek dosyası seçiniz.');
    return;
  }

  selectedBackupFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target?.result as string);
      const data = content.data || content;
      parsedBackupData.value = {
        meta: content.meta || null,
        counts: {
          patients: data.patients?.length || 0,
          treatments: data.treatments?.length || 0,
          payments: data.payments?.length || 0,
          appointments: data.appointments?.length || 0,
          orthodonticPlans: data.orthodonticPlans?.length || 0,
          doctorPayouts: data.doctorPayouts?.length || 0
        },
        payload: content
      };
    } catch {
      showNotification('error', 'Dosya içeriği geçerli bir JSON yedek paketi olarak okunamadı.');
      clearSelectedFile();
    }
  };
  reader.readAsText(file);
}

function clearSelectedFile() {
  selectedBackupFile.value = null;
  parsedBackupData.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

// Yedeği Sisteme Geri Yükle (Import)
async function handleImport() {
  if (!parsedBackupData.value?.payload) {
    showNotification('error', 'Lütfen önce geçerli bir yedek dosyası seçiniz.');
    return;
  }

  if (restoreMode.value === 'overwrite') {
    const confirmed = confirm(
      'DİKKAT: "Tam Temiz Yükleme" seçildi. Mevcut klinik tablolarınız temizlenerek bu yedekteki veriler sıfırdan yüklenecektir. Bu işlemi onaylıyor musunuz?'
    );
    if (!confirmed) return;
  }

  isImporting.value = true;
  try {
    const res: any = await $fetch('/api/backup/import', {
      method: 'POST',
      body: {
        mode: restoreMode.value,
        data: parsedBackupData.value.payload.data || parsedBackupData.value.payload
      }
    });

    showNotification('success', res.message || 'Yedek verileri başarıyla sisteme geri yüklendi!');
    clearSelectedFile();
    await loadStatus();
  } catch (err: any) {
    showNotification('error', err.data?.message || 'Yedek geri yüklenirken hata oluştu.');
  } finally {
    isImporting.value = false;
  }
}

onMounted(() => {
  loadStatus();
});
</script>
