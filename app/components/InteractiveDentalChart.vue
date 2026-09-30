<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 sm:p-6 flex flex-col gap-5 sm:gap-6 shadow-sm w-full max-w-full min-w-0 overflow-hidden">
    <!-- Başlık, Hızlı İşlem Modu Butonu ve Kaydet Butonu -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-xl shrink-0">🦷</span>
        <div class="min-w-0">
          <h3 class="font-bold text-slate-800 dark:text-white text-sm sm:text-base tracking-wide uppercase truncate">Diş Haritası (FDI Notasyonu)</h3>
          <p class="text-xs text-slate-400 font-medium">Dişe tıklayarak uygulanan işlemleri görüntüleyebilir veya hızlı işlem modunu açarak tedavi ekleyebilirsiniz.</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <!-- Hızlı İşlem Modu Butonu -->
        <button
          @click="isQuickActionMode = !isQuickActionMode"
          :class="[
            isQuickActionMode
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700',
            'flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap'
          ]"
          :title="isQuickActionMode ? 'Hızlı İşlem Modunu Kapat' : 'Hızlı İşlem Modunu Aç'"
        >
          <Icon name="heroicons:bolt" class="w-4 h-4 shrink-0" />
          <span>{{ isQuickActionMode ? 'Hızlı İşlem: AÇIK' : 'Hızlı İşlem: KAPALI' }}</span>
        </button>

        <!-- Planlanan Tümünü Finansa Aktar Butonu -->
        <button
          v-if="unbilledTeeth.length > 0 && !readonly"
          @click="openBatchTransferModal"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-95 transition-all duration-150 whitespace-nowrap"
          title="Planlanan ve henüz cariye aktarılmamış tüm tedavileri tek tıkla cariye aktar"
        >
          <Icon name="heroicons:arrow-up-right" class="w-4 h-4 shrink-0" />
          <span>Finansa Aktar ({{ unbilledTeeth.length }})</span>
        </button>

        <!-- Diş Haritasını Kaydet Butonu -->
        <button
          @click="saveChart"
          :disabled="isSaving"
          class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-teal-600/10 hover:shadow-teal-600/20 active:scale-95 transition-all duration-150 whitespace-nowrap"
        >
          <Icon v-if="isSaving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin shrink-0" />
          <Icon v-else name="heroicons:document-check" class="w-4 h-4 shrink-0" />
          <span>Kaydet</span>
        </button>
      </div>
    </div>

    <!-- Mobil Görünüm Modu Seçici (Sadece Mobil Ekranlarda Görünür) -->
    <div class="sm:hidden flex flex-col gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 w-full">
      <div class="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
        <span class="flex items-center gap-1.5">
          <Icon name="heroicons:device-phone-mobile" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Görünüm Seçimi</span>
        </span>
        <span class="text-[10px] font-mono bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold border border-teal-200/50 dark:border-teal-800/50">
          {{ mobileViewMode === 'fit' ? '32 Diş Ekranda' : mobileViewMode === 'quadrant' ? 'Büyük Kadran' : 'Kaydırmalı' }}
        </span>
      </div>

      <div class="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs font-bold">
        <button
          type="button"
          @click="mobileViewMode = 'fit'"
          :class="mobileViewMode === 'fit' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'"
          class="py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1"
        >
          <Icon name="heroicons:squares-2x2" class="w-3.5 h-3.5" />
          <span>Sığdır</span>
        </button>
        <button
          type="button"
          @click="mobileViewMode = 'quadrant'"
          :class="mobileViewMode === 'quadrant' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'"
          class="py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1"
        >
          <Icon name="heroicons:viewfinder-circle" class="w-3.5 h-3.5" />
          <span>Kadranlar</span>
        </button>
        <button
          type="button"
          @click="mobileViewMode = 'scroll'"
          :class="mobileViewMode === 'scroll' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'"
          class="py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1"
        >
          <Icon name="heroicons:arrows-right-left" class="w-3.5 h-3.5" />
          <span>Geniş</span>
        </button>
      </div>

      <!-- Kadran Seçim Butonları (Yalnızca Kadran Modu Aktifken) -->
      <div v-if="mobileViewMode === 'quadrant'" class="grid grid-cols-4 gap-1 text-[10px] font-bold pt-1">
        <button
          type="button"
          @click="selectedQuadrant = 'UR'"
          :class="selectedQuadrant === 'UR' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700'"
          class="py-1.5 px-1 rounded-lg text-center transition-colors"
        >
          Üst Sağ (18)
        </button>
        <button
          type="button"
          @click="selectedQuadrant = 'UL'"
          :class="selectedQuadrant === 'UL' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700'"
          class="py-1.5 px-1 rounded-lg text-center transition-colors"
        >
          Üst Sol (28)
        </button>
        <button
          type="button"
          @click="selectedQuadrant = 'LR'"
          :class="selectedQuadrant === 'LR' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700'"
          class="py-1.5 px-1 rounded-lg text-center transition-colors"
        >
          Alt Sağ (48)
        </button>
        <button
          type="button"
          @click="selectedQuadrant = 'LL'"
          :class="selectedQuadrant === 'LL' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700'"
          class="py-1.5 px-1 rounded-lg text-center transition-colors"
        >
          Alt Sol (38)
        </button>
      </div>

      <!-- Geniş Mod Navigasyon İpucu -->
      <div v-if="mobileViewMode === 'scroll'" class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
        <span>Parmağınızla sağa/sola kaydırın:</span>
        <div class="flex items-center gap-1 font-bold text-[10px]">
          <button type="button" @click="scrollToQuadrant('UR')" class="px-2 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">18 (Sağ)</button>
          <button type="button" @click="scrollToQuadrant('UL')" class="px-2 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">28 (Sol)</button>
        </div>
      </div>
    </div>

    <!-- 1. MOBİL: SIĞDIRILMIŞ TÜM AĞIZ GÖRÜNÜMÜ (32 Diş Ekrana Tam Sığar - Sıfır Taşma, Sıfır Kaydırma) -->
    <div v-if="mobileViewMode === 'fit'" class="sm:hidden w-full flex flex-col items-center justify-center gap-2 select-none py-2 relative">
      <!-- Pembe Dişeti Aurası (Gingival Aura) -->
      <div class="absolute inset-x-2 top-10 bottom-10 bg-gradient-to-r from-rose-500/10 via-rose-500/15 to-rose-500/10 rounded-full blur-xl pointer-events-none z-0"></div>

      <!-- Kadran Başlıkları (Cadran 1 | Cadran 2) -->
      <div class="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 relative z-10">
        <span class="text-teal-700 dark:text-teal-300">Cadran 1 (Üst Sağ)</span>
        <span class="text-teal-700 dark:text-teal-300">Cadran 2 (Üst Sol)</span>
      </div>

      <!-- Üst Çene (18..11 | 21..28) - Kökler Yukarıda, Kuronlar Isırma Çizgisine Doğru -->
      <div class="w-full flex flex-col items-center relative z-10">
        <!-- Kategori Renk Barları (Mobil Kompakt) -->
        <div class="flex items-center justify-center gap-1 w-full text-[8px] font-bold mb-1">
          <span class="text-pink-600 dark:text-pink-400 border-b-2 border-pink-500 px-1">Molar</span>
          <span class="text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 px-1">Premolar</span>
          <span class="text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 px-0.5">Kanin</span>
          <span class="text-sky-600 dark:text-sky-400 border-b-2 border-sky-500 px-1">İnsiziv</span>
          <span class="w-0.5 h-3 bg-slate-400"></span>
          <span class="text-sky-600 dark:text-sky-400 border-b-2 border-sky-500 px-1">İnsiziv</span>
          <span class="text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 px-0.5">Kanin</span>
          <span class="text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 px-1">Premolar</span>
          <span class="text-pink-600 dark:text-pink-400 border-b-2 border-pink-500 px-1">Molar</span>
        </div>

        <div class="flex items-end justify-center gap-1 w-full">
          <!-- Üst Sağ Kadran (18 -> 11) -->
          <div class="flex items-end gap-0.5">
            <div v-for="num in UPPER_RIGHT" :key="num">
              <button
                @click="handleToothClick(num)"
                @dblclick="openEditModal(num)"
                :disabled="readonly"
                :title="getToothTitle(num)"
                class="outline-none focus:outline-none"
              >
                <ToothSvg
                  :toothNumber="num"
                  :procedures="getToothProcedures(num)"
                  :isUpper="true"
                  :isSelected="activeToothNum === num"
                  :width="17"
                  :height="30"
                />
              </button>
            </div>
          </div>

          <!-- Dikey Orta Sagittal Çizgi -->
          <div class="w-0.5 h-12 bg-slate-400 dark:bg-slate-600 self-end"></div>

          <!-- Üst Sol Kadran (21 -> 28) -->
          <div class="flex items-end gap-0.5">
            <div v-for="num in UPPER_LEFT" :key="num">
              <button
                @click="handleToothClick(num)"
                @dblclick="openEditModal(num)"
                :disabled="readonly"
                :title="getToothTitle(num)"
                class="outline-none focus:outline-none"
              >
                <ToothSvg
                  :toothNumber="num"
                  :procedures="getToothProcedures(num)"
                  :isUpper="true"
                  :isSelected="activeToothNum === num"
                  :width="17"
                  :height="30"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Yatay Isırma Ekseni (Horizontal Occlusal Bite Line) -->
      <div class="w-full max-w-[310px] flex items-center justify-center my-0.5 relative z-10">
        <div class="w-full h-0.5 bg-slate-400 dark:bg-slate-600 rounded"></div>
      </div>

      <!-- Alt Çene (48..41 | 31..38) - Kuronlar Yukarıda, Kökler Aşağıda -->
      <div class="w-full flex flex-col items-center relative z-10">
        <div class="flex items-start justify-center gap-1 w-full">
          <!-- Alt Sağ Kadran (48 -> 41) -->
          <div class="flex items-start gap-0.5">
            <div v-for="num in LOWER_RIGHT" :key="num">
              <button
                @click="handleToothClick(num)"
                @dblclick="openEditModal(num)"
                :disabled="readonly"
                :title="getToothTitle(num)"
                class="outline-none focus:outline-none"
              >
                <ToothSvg
                  :toothNumber="num"
                  :procedures="getToothProcedures(num)"
                  :isUpper="false"
                  :isSelected="activeToothNum === num"
                  :width="17"
                  :height="30"
                />
              </button>
            </div>
          </div>

          <!-- Dikey Orta Sagittal Çizgi -->
          <div class="w-0.5 h-12 bg-slate-400 dark:bg-slate-600 self-start"></div>

          <!-- Alt Sol Kadran (31 -> 38) -->
          <div class="flex items-start gap-0.5">
            <div v-for="num in LOWER_LEFT" :key="num">
              <button
                @click="handleToothClick(num)"
                @dblclick="openEditModal(num)"
                :disabled="readonly"
                :title="getToothTitle(num)"
                class="outline-none focus:outline-none"
              >
                <ToothSvg
                  :toothNumber="num"
                  :procedures="getToothProcedures(num)"
                  :isUpper="false"
                  :isSelected="activeToothNum === num"
                  :width="17"
                  :height="30"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Alt Kategori Barları -->
        <div class="flex items-center justify-center gap-1 w-full text-[8px] font-bold mt-1">
          <span class="text-pink-600 dark:text-pink-400 border-t-2 border-pink-500 px-1">Molar</span>
          <span class="text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 px-1">Premolar</span>
          <span class="text-amber-600 dark:text-amber-400 border-t-2 border-amber-500 px-0.5">Kanin</span>
          <span class="text-sky-600 dark:text-sky-400 border-t-2 border-sky-500 px-1">İnsiziv</span>
          <span class="w-0.5 h-3 bg-slate-400"></span>
          <span class="text-sky-600 dark:text-sky-400 border-t-2 border-sky-500 px-1">İnsiziv</span>
          <span class="text-amber-600 dark:text-amber-400 border-t-2 border-amber-500 px-0.5">Kanin</span>
          <span class="text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 px-1">Premolar</span>
          <span class="text-pink-600 dark:text-pink-400 border-t-2 border-pink-500 px-1">Molar</span>
        </div>
      </div>

      <!-- Kadran Başlıkları (Cadran 4 | Cadran 3) -->
      <div class="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 mt-1 relative z-10">
        <span class="text-teal-700 dark:text-teal-300">Cadran 4 (Alt Sağ)</span>
        <span class="text-teal-700 dark:text-teal-300">Cadran 3 (Alt Sol)</span>
      </div>
    </div>

    <!-- 2. MOBİL: KADRAN ODAKLI BÜYÜK GÖRÜNÜM (8 Diş Büyük Boyut - Rahat Dokunma) -->
    <div v-else-if="mobileViewMode === 'quadrant'" class="sm:hidden w-full flex flex-col items-center justify-center gap-3 select-none py-3">
      <div class="text-center mb-1">
        <span class="text-xs font-bold text-teal-600 dark:text-teal-400">
          {{ selectedQuadrant === 'UR' ? 'Cadran 1: Üst Sağ (18 - 11)' : selectedQuadrant === 'UL' ? 'Cadran 2: Üst Sol (21 - 28)' : selectedQuadrant === 'LR' ? 'Cadran 4: Alt Sağ (48 - 41)' : 'Cadran 3: Alt Sol (31 - 38)' }}
        </span>
      </div>

      <!-- Seçili Kadranın 8 Dişi -->
      <div class="flex items-center justify-center gap-1.5 flex-wrap">
        <div v-for="num in (selectedQuadrant === 'UR' ? UPPER_RIGHT : selectedQuadrant === 'UL' ? UPPER_LEFT : selectedQuadrant === 'LR' ? LOWER_RIGHT : LOWER_LEFT)" :key="num">
          <button
            @click="handleToothClick(num)"
            @dblclick="openEditModal(num)"
            :disabled="readonly"
            :title="getToothTitle(num)"
            class="outline-none focus:outline-none"
          >
            <ToothSvg
              :toothNumber="num"
              :procedures="getToothProcedures(num)"
              :isUpper="selectedQuadrant === 'UR' || selectedQuadrant === 'UL'"
              :isSelected="activeToothNum === num"
              :width="36"
              :height="56"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- 3. MOBİL KAYDIRMALI VEYA MASAÜSTÜ ANATOMİK DİŞ HARİTASI (Referans Çizim Birebir Uyarlaması) -->
    <div
      ref="chartScrollRef"
      :class="[
        mobileViewMode === 'scroll' ? 'block' : 'hidden sm:block',
        'w-full max-w-full overflow-x-auto py-6 touch-pan-x scrollbar-thin relative'
      ]"
    >
      <!-- İç Konteyner (Referans Resimdeki Birebir Düzen) -->
      <div class="w-max min-w-[760px] max-w-4xl mx-auto px-6 flex flex-col text-center select-none relative">
        
        <!-- Pembe Dişeti Aurası (Arka Planda Yumuşak Dişeti Rengi) -->
        <div class="absolute inset-x-8 top-16 bottom-16 bg-gradient-to-r from-rose-500/10 via-rose-500/15 to-rose-500/10 rounded-full blur-2xl pointer-events-none z-0"></div>

        <!-- ÜST KADRAN BAŞLIKLARI (Cadran 1 | Cadran 2) -->
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 relative z-10 px-2">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-pink-500"></span>
            <strong>Cadran 1</strong> (Üst Sağ / 1. Kadran)
          </span>
          <!-- Dikey Sagittal Eksen Üst Ucu -->
          <div class="w-0.5 h-4 bg-slate-800 dark:bg-slate-300"></div>
          <span class="flex items-center gap-1.5">
            <strong>Cadran 2</strong> (Üst Sol / 2. Kadran)
            <span class="w-2 h-2 rounded-full bg-pink-500"></span>
          </span>
        </div>

        <!-- ÜST KATEGORİ ÇİZGİLERİ VE BAŞLIKLARI (Molaires, Prémolaires, Canine, Incisives) -->
        <div class="grid grid-cols-2 gap-4 text-xs font-bold mb-2 relative z-10">
          <!-- Sol Üst Kategori Barları (Cadran 1: 18..11) -->
          <div class="flex items-end justify-between px-1">
            <!-- Molaires (18, 17, 16) -->
            <div class="flex flex-col items-center w-[130px]">
              <span class="text-[11px] text-pink-600 dark:text-pink-400 font-bold">Molaires</span>
              <div class="w-full h-0.5 bg-pink-500 rounded mt-0.5"></div>
            </div>
            <!-- Prémolaires (15, 14) -->
            <div class="flex flex-col items-center w-[85px]">
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Prémolaires</span>
              <div class="w-full h-0.5 bg-emerald-500 rounded mt-0.5"></div>
            </div>
            <!-- Canine (13) -->
            <div class="flex flex-col items-center w-[42px]">
              <span class="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Canine</span>
              <div class="w-full h-0.5 bg-amber-500 rounded mt-0.5"></div>
            </div>
            <!-- Incisives (12, 11) -->
            <div class="flex flex-col items-center w-[85px]">
              <span class="text-[11px] text-sky-600 dark:text-sky-400 font-bold">Incisives</span>
              <div class="w-full h-0.5 bg-sky-500 rounded mt-0.5"></div>
            </div>
          </div>

          <!-- Sağ Üst Kategori Barları (Cadran 2: 21..28) -->
          <div class="flex items-end justify-between px-1">
            <!-- Incisives (21, 22) -->
            <div class="flex flex-col items-center w-[85px]">
              <span class="text-[11px] text-sky-600 dark:text-sky-400 font-bold">Incisives</span>
              <div class="w-full h-0.5 bg-sky-500 rounded mt-0.5"></div>
            </div>
            <!-- Canine (23) -->
            <div class="flex flex-col items-center w-[42px]">
              <span class="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Canine</span>
              <div class="w-full h-0.5 bg-amber-500 rounded mt-0.5"></div>
            </div>
            <!-- Prémolaires (24, 25) -->
            <div class="flex flex-col items-center w-[85px]">
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Prémolaires</span>
              <div class="w-full h-0.5 bg-emerald-500 rounded mt-0.5"></div>
            </div>
            <!-- Molaires (26, 27, 28) -->
            <div class="flex flex-col items-center w-[130px]">
              <span class="text-[11px] text-pink-600 dark:text-pink-400 font-bold">Molaires</span>
              <div class="w-full h-0.5 bg-pink-500 rounded mt-0.5"></div>
            </div>
          </div>
        </div>

        <!-- ÜST ÇENE DİŞLERİ (Kökler Yukarıda, Kuronlar Isırma Çizgisine Bakar) -->
        <div class="flex justify-center items-end gap-3 relative z-10">
          <!-- Üst Sağ Kadran (18 -> 11) -->
          <div class="flex items-end gap-1 sm:gap-1.5">
            <div v-for="num in UPPER_RIGHT" :key="num">
              <button
                @click="handleToothClick(num)"
                @dblclick="openEditModal(num)"
                :disabled="readonly"
                :title="getToothTitle(num)"
                class="outline-none focus:outline-none"
              >
                <ToothSvg
                  :toothNumber="num"
                  :procedures="getToothProcedures(num)"
                  :isUpper="true"
                  :isSelected="activeToothNum === num"
                  :width="42"
                  :height="66"
                />
              </button>
            </div>
          </div>

          <!-- Dikey Sagittal Çizgi (Üst Yarı) -->
          <div class="w-0.5 h-24 bg-slate-800 dark:bg-slate-300 self-end"></div>

          <!-- Üst Sol Kadran (21 -> 28) -->
          <div class="flex items-end gap-1 sm:gap-1.5">
            <div v-for="num in UPPER_LEFT" :key="num">
              <button
                @click="handleToothClick(num)"
                @dblclick="openEditModal(num)"
                :disabled="readonly"
                :title="getToothTitle(num)"
                class="outline-none focus:outline-none"
              >
                <ToothSvg
                  :toothNumber="num"
                  :procedures="getToothProcedures(num)"
                  :isUpper="true"
                  :isSelected="activeToothNum === num"
                  :width="42"
                  :height="66"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- MERKEZİ YATAY ISIRMA HATTI (CENTRAL OCCLUSAL BITE LINE) -->
        <div class="flex items-center justify-center my-2 relative z-10">
          <div class="w-full h-0.5 bg-slate-800 dark:bg-slate-300"></div>
        </div>

        <!-- ALT ÇENE DİŞLERİ (Kuronlar Isırma Çizgisine Bakar, Kökler Aşağıda) -->
        <div class="flex justify-center items-start gap-3 relative z-10">
          <!-- Alt Sağ Kadran (48 -> 41) -->
          <div class="flex items-start gap-1 sm:gap-1.5">
            <div v-for="num in LOWER_RIGHT" :key="num">
              <button
                @click="handleToothClick(num)"
                @dblclick="openEditModal(num)"
                :disabled="readonly"
                :title="getToothTitle(num)"
                class="outline-none focus:outline-none"
              >
                <ToothSvg
                  :toothNumber="num"
                  :procedures="getToothProcedures(num)"
                  :isUpper="false"
                  :isSelected="activeToothNum === num"
                  :width="42"
                  :height="66"
                />
              </button>
            </div>
          </div>

          <!-- Dikey Sagittal Çizgi (Alt Yarı) -->
          <div class="w-0.5 h-24 bg-slate-800 dark:bg-slate-300 self-start"></div>

          <!-- Alt Sol Kadran (31 -> 38) -->
          <div class="flex items-start gap-1 sm:gap-1.5">
            <div v-for="num in LOWER_LEFT" :key="num">
              <button
                @click="handleToothClick(num)"
                @dblclick="openEditModal(num)"
                :disabled="readonly"
                :title="getToothTitle(num)"
                class="outline-none focus:outline-none"
              >
                <ToothSvg
                  :toothNumber="num"
                  :procedures="getToothProcedures(num)"
                  :isUpper="false"
                  :isSelected="activeToothNum === num"
                  :width="42"
                  :height="66"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- ALT KATEGORİ ÇİZGİLERİ VE BAŞLIKLARI (Molaires, Prémolaires, Canine, Incisives) -->
        <div class="grid grid-cols-2 gap-4 text-xs font-bold mt-2 relative z-10">
          <!-- Sol Alt Kategori Barları (Cadran 4: 48..41) -->
          <div class="flex items-start justify-between px-1">
            <!-- Molaires (48, 47, 46) -->
            <div class="flex flex-col items-center w-[130px]">
              <div class="w-full h-0.5 bg-pink-500 rounded mb-0.5"></div>
              <span class="text-[11px] text-pink-600 dark:text-pink-400 font-bold">Molaires</span>
            </div>
            <!-- Prémolaires (45, 44) -->
            <div class="flex flex-col items-center w-[85px]">
              <div class="w-full h-0.5 bg-emerald-500 rounded mb-0.5"></div>
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Prémolaires</span>
            </div>
            <!-- Canine (43) -->
            <div class="flex flex-col items-center w-[42px]">
              <div class="w-full h-0.5 bg-amber-500 rounded mb-0.5"></div>
              <span class="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Canine</span>
            </div>
            <!-- Incisives (42, 41) -->
            <div class="flex flex-col items-center w-[85px]">
              <div class="w-full h-0.5 bg-sky-500 rounded mb-0.5"></div>
              <span class="text-[11px] text-sky-600 dark:text-sky-400 font-bold">Incisives</span>
            </div>
          </div>

          <!-- Sağ Alt Kategori Barları (Cadran 3: 31..38) -->
          <div class="flex items-start justify-between px-1">
            <!-- Incisives (31, 32) -->
            <div class="flex flex-col items-center w-[85px]">
              <div class="w-full h-0.5 bg-sky-500 rounded mb-0.5"></div>
              <span class="text-[11px] text-sky-600 dark:text-sky-400 font-bold">Incisives</span>
            </div>
            <!-- Canine (33) -->
            <div class="flex flex-col items-center w-[42px]">
              <div class="w-full h-0.5 bg-amber-500 rounded mb-0.5"></div>
              <span class="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Canine</span>
            </div>
            <!-- Prémolaires (34, 35) -->
            <div class="flex flex-col items-center w-[85px]">
              <div class="w-full h-0.5 bg-emerald-500 rounded mb-0.5"></div>
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Prémolaires</span>
            </div>
            <!-- Molaires (36, 37, 38) -->
            <div class="flex flex-col items-center w-[130px]">
              <div class="w-full h-0.5 bg-pink-500 rounded mb-0.5"></div>
              <span class="text-[11px] text-pink-600 dark:text-pink-400 font-bold">Molaires</span>
            </div>
          </div>
        </div>

        <!-- ALT KADRAN BAŞLIKLARI (Cadran 4 | Cadran 3) -->
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mt-3 relative z-10 px-2">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-pink-500"></span>
            <strong>Cadran 4</strong> (Alt Sağ / 4. Kadran)
          </span>
          <!-- Dikey Sagittal Eksen Alt Ucu -->
          <div class="w-0.5 h-4 bg-slate-800 dark:bg-slate-300"></div>
          <span class="flex items-center gap-1.5">
            <strong>Cadran 3</strong> (Alt Sol / 3. Kadran)
            <span class="w-2 h-2 rounded-full bg-pink-500"></span>
          </span>
        </div>

      </div>
    </div>

    <!-- Uygulanacak Tedavi Seçim Paneli (Hızlı İşlem Modu Açıkken Görünür) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform opacity-0 -translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-2"
    >
      <div v-if="isQuickActionMode" class="border-t border-amber-500/30 pt-5 flex flex-col gap-4 bg-amber-50/20 dark:bg-amber-950/10 p-4 rounded-2xl border border-amber-500/20">
        <div class="flex flex-col gap-0.5 border-b border-amber-500/20 pb-3">
          <span class="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="heroicons:bolt" class="w-4 h-4" />
            Hızlı İşlem Modu Aktif
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400">Aşağıdan bir işlem seçin ve haritada dişe tıklayarak hızlıca ekleyin/çıkarın.</span>
        </div>

        <div class="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm">
          <div class="flex flex-col">
            <!-- 1. Teşhis ve Genel Durumlar -->
            <div class="flex flex-col sm:flex-row border-b border-slate-100 dark:border-slate-800">
              <div class="sm:w-1/4 p-4 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 flex items-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 shrink-0">
                1. Teşhis ve Genel Durumlar
              </div>
              <div class="sm:w-3/4 p-3 flex flex-wrap gap-2.5 items-center">
                <button
                  v-for="key in ['healthy', 'decay', 'lesion_cyst', 'impacted', 'missing']"
                  :key="key"
                  type="button"
                  @click="selectedStatus = key"
                  :disabled="readonly"
                  :class="[
                    selectedStatus === key
                      ? 'border-amber-500 ring-2 ring-amber-500/25 bg-amber-50/30 dark:bg-amber-950/25 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400',
                    'flex items-center gap-2 px-3 py-2 border rounded-xl transition-all duration-150 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                  ]"
                >
                  <span
                    :class="[
                      TOOTH_STATUSES[key].bg, TOOTH_STATUSES[key].color,
                      'w-5 h-5 rounded border flex items-center justify-center text-xs font-bold shrink-0'
                    ]"
                  >
                    {{ TOOTH_STATUSES[key].icon }}
                  </span>
                  <span>{{ TOOTH_STATUSES[key].label }}</span>
                </button>
              </div>
            </div>

            <!-- 2. Konservatif ve Restoratif Tedaviler -->
            <div class="flex flex-col sm:flex-row border-b border-slate-100 dark:border-slate-800">
              <div class="sm:w-1/4 p-4 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 flex items-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 shrink-0">
                2. Konservatif ve Restoratif Tedaviler
              </div>
              <div class="sm:w-3/4 p-3 flex flex-wrap gap-2.5 items-center">
                <button
                  v-for="key in ['filled', 'inlay_onlay']"
                  :key="key"
                  type="button"
                  @click="selectedStatus = key"
                  :disabled="readonly"
                  :class="[
                    selectedStatus === key
                      ? 'border-amber-500 ring-2 ring-amber-500/25 bg-amber-50/30 dark:bg-amber-950/25 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400',
                    'flex items-center gap-2 px-3 py-2 border rounded-xl transition-all duration-150 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                  ]"
                >
                  <span
                    :class="[
                      TOOTH_STATUSES[key].bg, TOOTH_STATUSES[key].color,
                      'w-5 h-5 rounded border flex items-center justify-center text-xs font-bold shrink-0'
                    ]"
                  >
                    {{ TOOTH_STATUSES[key].icon }}
                  </span>
                  <span>{{ TOOTH_STATUSES[key].label }}</span>
                </button>
              </div>
            </div>

            <!-- 3. Endodontik Tedaviler -->
            <div class="flex flex-col sm:flex-row border-b border-slate-100 dark:border-slate-800">
              <div class="sm:w-1/4 p-4 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 flex items-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 shrink-0">
                3. Endodontik Tedaviler
              </div>
              <div class="sm:w-3/4 p-3 flex flex-wrap gap-2.5 items-center">
                <button
                  v-for="key in ['rootcanal']"
                  :key="key"
                  type="button"
                  @click="selectedStatus = key"
                  :disabled="readonly"
                  :class="[
                    selectedStatus === key
                      ? 'border-amber-500 ring-2 ring-amber-500/25 bg-amber-50/30 dark:bg-amber-950/25 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400',
                    'flex items-center gap-2 px-3 py-2 border rounded-xl transition-all duration-150 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                  ]"
                >
                  <span
                    :class="[
                      TOOTH_STATUSES[key].bg, TOOTH_STATUSES[key].color,
                      'w-5 h-5 rounded border flex items-center justify-center text-xs font-bold shrink-0'
                    ]"
                  >
                    {{ TOOTH_STATUSES[key].icon }}
                  </span>
                  <span>{{ TOOTH_STATUSES[key].label }}</span>
                </button>
              </div>
            </div>

            <!-- 4. Protez ve Estetik Tedaviler -->
            <div class="flex flex-col sm:flex-row border-b border-slate-100 dark:border-slate-800">
              <div class="sm:w-1/4 p-4 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 flex items-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 shrink-0">
                4. Protez ve Estetik Tedaviler
              </div>
              <div class="sm:w-3/4 p-3 flex flex-wrap gap-2.5 items-center">
                <button
                  v-for="key in ['crown', 'bridge', 'veneer']"
                  :key="key"
                  type="button"
                  @click="selectedStatus = key"
                  :disabled="readonly"
                  :class="[
                    selectedStatus === key
                      ? 'border-amber-500 ring-2 ring-amber-500/25 bg-amber-50/30 dark:bg-amber-950/25 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400',
                    'flex items-center gap-2 px-3 py-2 border rounded-xl transition-all duration-150 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                  ]"
                >
                  <span
                    :class="[
                      TOOTH_STATUSES[key].bg, TOOTH_STATUSES[key].color,
                      'w-5 h-5 rounded border flex items-center justify-center text-xs font-bold shrink-0'
                    ]"
                  >
                    {{ TOOTH_STATUSES[key].icon }}
                  </span>
                  <span>{{ TOOTH_STATUSES[key].label }}</span>
                </button>
              </div>
            </div>

            <!-- 5. Cerrahi ve İmplantoloji (İmplant ve Diş Çekimi) -->
            <div class="flex flex-col sm:flex-row border-b border-slate-100 dark:border-slate-800">
              <div class="sm:w-1/4 p-4 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 flex items-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 shrink-0">
                5. Cerrahi ve İmplantoloji
              </div>
              <div class="sm:w-3/4 p-3 flex flex-wrap gap-2.5 items-center">
                <button
                  v-for="key in ['implant', 'extraction']"
                  :key="key"
                  type="button"
                  @click="selectedStatus = key"
                  :disabled="readonly"
                  :class="[
                    selectedStatus === key
                      ? 'border-amber-500 ring-2 ring-amber-500/25 bg-amber-50/30 dark:bg-amber-950/25 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400',
                    'flex items-center gap-2 px-3 py-2 border rounded-xl transition-all duration-150 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                  ]"
                >
                  <span
                    :class="[
                      TOOTH_STATUSES[key].bg, TOOTH_STATUSES[key].color,
                      'w-5 h-5 rounded border flex items-center justify-center text-xs font-bold shrink-0'
                    ]"
                  >
                    {{ TOOTH_STATUSES[key].icon }}
                  </span>
                  <span>{{ TOOTH_STATUSES[key].label }}</span>
                </button>
              </div>
            </div>

            <!-- 6. Periodontoloji (Diş Eti) -->
            <div class="flex flex-col sm:flex-row border-b border-slate-100 dark:border-slate-800 last:border-b-0">
              <div class="sm:w-1/4 p-4 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 flex items-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 shrink-0">
                6. Periodontoloji (Diş Eti)
              </div>
              <div class="sm:w-3/4 p-3 flex flex-wrap gap-2.5 items-center">
                <button
                  v-for="key in ['scaling', 'curettage']"
                  :key="key"
                  type="button"
                  @click="selectedStatus = key"
                  :disabled="readonly"
                  :class="[
                    selectedStatus === key
                      ? 'border-amber-500 ring-2 ring-amber-500/25 bg-amber-50/30 dark:bg-amber-950/25 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400',
                    'flex items-center gap-2 px-3 py-2 border rounded-xl transition-all duration-150 text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                  ]"
                >
                  <span
                    :class="[
                      TOOTH_STATUSES[key].bg, TOOTH_STATUSES[key].color,
                      'w-5 h-5 rounded border flex items-center justify-center text-xs font-bold shrink-0'
                    ]"
                  >
                    {{ TOOTH_STATUSES[key].icon }}
                  </span>
                  <span>{{ TOOTH_STATUSES[key].label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Diş Notları & Özet Paneli -->
    <div class="bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
      <h4 class="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wider uppercase mb-3">Kayıtlı Anormallikler ve Çoklu İşlemler</h4>
      <div v-if="interestingTeeth.length === 0" class="text-sm text-slate-500 dark:text-slate-400 font-medium text-center py-2">
        ✓ Tüm dişler sağlıklı veya kayıt girilmemiş.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="item in interestingTeeth"
          :key="item.num"
          class="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5 text-sm shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-800 dark:text-white">Diş {{ item.num }}</span>
              <!-- Teklif / Planlanan Fiyat Rozeti -->
              <span
                v-if="item.plannedPrice"
                class="px-2 py-0.5 rounded-lg text-xs font-mono font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1"
                title="Planlanan / Teklif Edilen Ücret"
              >
                <Icon name="heroicons:tag" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {{ formatCurrency(item.plannedPrice) }}
              </span>
              <span
                v-else
                class="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic"
              >
                Fiyat girilmedi
              </span>
            </div>

            <button
              v-if="!readonly"
              @click="openEditModal(item.num)"
              class="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="İşlemleri, Fiyatı ve Notu Düzenle"
            >
              <Icon name="heroicons:pencil-square" class="w-4 h-4" />
            </button>
          </div>

          <!-- Uygulanan Çoklu İşlemler Rozetleri -->
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="proc in item.procedures"
              :key="proc"
              :class="[
                getToothStatusInfo(proc).bg,
                getToothStatusInfo(proc).color,
                'px-2 py-0.5 rounded-lg text-xs font-bold border border-current/10 flex items-center gap-1'
              ]"
            >
              <span>{{ getToothStatusInfo(proc).icon }}</span>
              <span>{{ getToothStatusInfo(proc).label }}</span>
            </span>
          </div>

          <!-- Klinik Not -->
          <div class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-1.5">
            {{ item.note || 'Özel bir not girilmemiş.' }}
          </div>

          <!-- Finansa Aktar Butonu veya Cariye Eklendi Rozeti -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div v-if="item.isBilled" class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/40">
                <Icon name="heroicons:check-circle" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Cariye Eklendi / Uygulandı
              </span>
            </div>
            <div v-else>
              <button
                v-if="!readonly"
                @click="openTransferModal(item)"
                class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                title="Bu tedaviyi hastanın cari hareketlerine borç olarak ekle"
              >
                <Icon name="heroicons:banknotes" class="w-3.5 h-3.5" />
                <span>Cariye / Finansa Ekle</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Diş Düzenleme / Detay Gösterme Modalı -->
    <AppModal
      :isOpen="isEditModalOpen"
      :title="`🦷 Diş ${activeToothNum} — İşlemler & Detaylar`"
      width="md"
      @close="isEditModalOpen = false"
    >
      <div class="flex flex-col gap-4">
        <!-- Durum Izgarası (Multi-Select) -->
        <div>
          <div class="flex items-center justify-between mb-2.5">
            <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Uygulanan İşlemler</label>
            <button
              type="button"
              @click="tempProcedures = ['healthy']"
              class="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 underline"
            >
              Tümünü Temizle (Sağlıklı)
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
            <button
              v-for="(val, key) in TOOTH_STATUSES"
              :key="key"
              type="button"
              @click="toggleTempProcedure(key)"
              :class="[
                tempProcedures.includes(key)
                  ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20 dark:bg-teal-950/20 text-slate-900 dark:text-white font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                'flex items-center gap-2.5 p-2.5 border rounded-xl transition-all duration-150 text-left text-xs font-medium'
              ]"
            >
              <div
                :class="[
                  tempProcedures.includes(key) ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-slate-600',
                  'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors'
                ]"
              >
                <Icon v-if="tempProcedures.includes(key)" name="heroicons:check" class="w-3 h-3 stroke-[3]" />
              </div>
              <span
                :class="[
                  val.bg, val.color,
                  'w-5 h-5 rounded border flex items-center justify-center text-xs font-bold shrink-0'
                ]"
              >
                {{ val.icon }}
              </span>
              <span class="truncate">{{ val.label }}</span>
            </button>
          </div>
        </div>

        <!-- Teklif / Planlanan Ücret (₺) -->
        <div>
          <label for="toothPrice" class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Teklif / Planlanan Ücret (₺)
          </label>
          <div class="relative">
            <input
              id="toothPrice"
              v-model.number="tempPlannedPrice"
              type="number"
              min="0"
              step="any"
              placeholder="Örn: 2500"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm font-mono font-bold transition-colors duration-150 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Hastaya muayenede verilen teklif veya planlanan tedavi bedeli.</p>
        </div>

        <!-- Cariye Aktarıldı Durumu (Gerekirse Sıfırlama) -->
        <div v-if="chartData[activeToothNum]?.isBilled" class="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 rounded-xl flex items-center justify-between text-xs">
          <span class="text-amber-800 dark:text-amber-300 font-medium">Bu işlem daha önce cariye aktarılmış olarak işaretli.</span>
          <button
            type="button"
            @click="tempIsBilled = false"
            class="text-amber-700 dark:text-amber-400 font-bold underline hover:text-amber-900 ml-2 shrink-0"
          >
            Yeniden Aktarılabilir Yap
          </button>
        </div>

        <!-- Açıklama Notu -->
        <div>
          <label for="toothNote" class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Tedavi / Durum Notu</label>
          <textarea
            id="toothNote"
            v-model="tempNote"
            rows="3"
            placeholder="Kanal dolgusu ve kuron kaplama yapıldı..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-colors duration-150 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button
          @click="isEditModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-150"
        >
          İptal
        </button>
        <button
          @click="applyToothChanges"
          class="px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-colors duration-150"
        >
          Değişiklikleri Uygula
        </button>
      </template>
    </AppModal>

    <!-- Tek Dişi Cariye / Finansa Aktarma Onay Modalı -->
    <AppModal
      :isOpen="isTransferModalOpen"
      :title="`💵 Diş ${transferItem?.num} Tedavisini Cariye Aktar`"
      width="md"
      @close="isTransferModalOpen = false"
    >
      <form @submit.prevent="confirmTransferToFinance" class="space-y-4">
        <!-- Bilgilendirme Kutusu -->
        <div class="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 rounded-xl text-xs text-teal-800 dark:text-teal-300">
          Bu işlem onaylandığında hastanın <strong>Tedaviler & Finans</strong> sekmesine yeni bir <strong>Tedavi Borcu</strong> kaydı düşülecek ve genel bakiye anlık olarak güncellenecektir.
        </div>

        <!-- Yapılan İşlem Adı -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Yapılan İşlem / Açıklama <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="transferForm.procedure"
            type="text"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>

        <!-- Diş No & Tutar -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Diş Numarası
            </label>
            <input
              v-model="transferForm.tooth"
              type="text"
              readonly
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Tedavi Ücreti (TL) <span class="text-rose-500">*</span>
            </label>
            <input
              v-model.number="transferForm.fee"
              type="number"
              min="0"
              step="any"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-sm font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <!-- Tarih -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            İşlem Tarihi <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="transferForm.date"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-sm font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>

        <!-- Açıklama Notu -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Klinik Not
          </label>
          <textarea
            v-model="transferForm.notes"
            rows="2"
            placeholder="Ek açıklama veya hekim notu..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          @click="isTransferModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="confirmTransferToFinance"
          :disabled="isTransferring"
          class="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Icon v-if="isTransferring" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>Cariye Aktar ve Borç Kaydı Oluştur</span>
        </button>
      </template>
    </AppModal>

    <!-- Planlanan Tümünü Finansa Aktar Modalı -->
    <AppModal
      :isOpen="isBatchTransferModalOpen"
      title="⚡ Planlanan Tümünü Finansa Aktar"
      width="md"
      @close="isBatchTransferModalOpen = false"
    >
      <div class="space-y-4">
        <div class="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
          Aşağıdaki <strong>{{ unbilledTeeth.length }} adet</strong> planlanan tedavi işlemi hastanın cari hareketler hesabına toplu olarak borç olarak aktarılacaktır.
        </div>

        <!-- Aktarılacak Dişler Listesi -->
        <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 dark:border-slate-800 dark:divide-slate-800">
          <div
            v-for="t in unbilledTeeth"
            :key="t.num"
            class="p-2.5 flex items-center justify-between text-xs bg-white dark:bg-slate-900"
          >
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-800 dark:text-white">Diş {{ t.num }}</span>
              <span class="text-slate-500 dark:text-slate-400">({{ getToothProceduresLabels(t.procedures) }})</span>
            </div>
            <span class="font-mono font-bold text-slate-700 dark:text-slate-200">
              {{ formatCurrency(t.plannedPrice || 0) }}
            </span>
          </div>
        </div>

        <!-- Toplam Tutar ve Tarih -->
        <div class="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam Aktarılacak Tutar</span>
          <span class="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">
            {{ formatCurrency(totalBatchAmount) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            İşlem Tarihi <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="batchDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <template #footer>
        <button
          @click="isBatchTransferModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="confirmBatchTransfer"
          :disabled="isTransferring"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Icon v-if="isTransferring" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>Tümünü Cariye Aktar ({{ formatCurrency(totalBatchAmount) }})</span>
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUtils } from '~/composables/useUtils';

const props = defineProps({
  patientId: {
    type: String,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['saved', 'transferred']);

const {
  TOOTH_STATUSES,
  getToothStatusInfo,
  formatCurrency,
  todayStr
} = useUtils();

// FDI Diş Numaraları
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

// Harita Verisi
const chartData = ref({});
const isLoading = ref(true);
const isSaving = ref(false);

// Hızlı İşlem Modu (Varsayılan KAPALI - Dişe tıklayınca sadece detay açılır)
const isQuickActionMode = ref(false);

// Mobil Görünüm Modları: 'fit' (32 Diş Ekrana Sığdır), 'quadrant' (Kadran Odaklı), 'scroll' (Geniş Kaydırmalı)
const mobileViewMode = ref('fit');
const selectedQuadrant = ref('UR'); // 'UR', 'UL', 'LR', 'LL'

// Mobil Kaydırma ve Kadran Navigasyonu
const chartScrollRef = ref(null);
const scrollToQuadrant = (quad) => {
  if (!chartScrollRef.value) return;
  const maxScroll = chartScrollRef.value.scrollWidth - chartScrollRef.value.clientWidth;
  if (quad === 'UR' || quad === 'LR') {
    chartScrollRef.value.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    chartScrollRef.value.scrollTo({ left: maxScroll, behavior: 'smooth' });
  }
};

// Düzenleme Durumları
const isEditModalOpen = ref(false);
const activeToothNum = ref(null);
const tempProcedures = ref([]);
const tempNote = ref('');
const tempPlannedPrice = ref(null);
const tempIsBilled = ref(false);
const selectedStatus = ref('decay');

// Tekli Finansa Aktarım Durumları
const isTransferModalOpen = ref(false);
const isTransferring = ref(false);
const transferItem = ref(null);
const transferForm = ref({
  procedure: '',
  tooth: '',
  fee: 0,
  date: todayStr(),
  notes: ''
});

// Toplu Finansa Aktarım Durumları
const isBatchTransferModalOpen = ref(false);
const batchDate = ref(todayStr());

// Hastanın Diş Haritasını API'den Çek
const loadChart = async () => {
  try {
    isLoading.value = true;
    const data = await $fetch(`/api/dental-charts/${props.patientId}`);
    if (data && data.chartData) {
      chartData.value = data.chartData;
    } else {
      chartData.value = {};
    }
  } catch (error) {
    console.error('Diş haritası yüklenemedi:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadChart();
});

// Dişin aktif işlemler listesini al
const getToothProcedures = (num) => {
  const item = chartData.value[num];
  if (!item) return ['healthy'];
  if (Array.isArray(item.procedures) && item.procedures.length > 0) {
    return item.procedures;
  }
  if (item.status && item.status !== 'healthy') {
    return [item.status];
  }
  return ['healthy'];
};

// İşlem etiketlerini birleştirici yardımcı
const getToothProceduresLabels = (procedures) => {
  if (!procedures || procedures.length === 0) return 'Tedavi';
  const labels = procedures
    .filter(p => p !== 'healthy')
    .map(p => getToothStatusInfo(p)?.label || p);
  return labels.length > 0 ? labels.join(', ') : 'Tedavi';
};

// Diş Açıklama Başlığı
const getToothTitle = (num) => {
  const procs = getToothProcedures(num);
  const labels = procs.map(p => getToothStatusInfo(p).label).join(', ');
  const note = chartData.value[num]?.note;
  const price = chartData.value[num]?.plannedPrice;
  const priceStr = price ? ` [${formatCurrency(price)}]` : '';
  const baseTitle = `Diş ${num}: ${labels}${priceStr}${note ? ' - ' + note : ''}`;
  return isQuickActionMode.value
    ? `${baseTitle} (Seçili işlemi eklemek/çıkarmak için tıklayın)`
    : `${baseTitle} (İşlemleri ve detayları görmek için tıklayın)`;
};

// Dişe Tıklama Yöneticisi
const handleToothClick = (num) => {
  if (props.readonly) return;

  if (isQuickActionMode.value) {
    // Hızlı işlem modu açıksa işlem ekle/çıkar
    selectTooth(num);
  } else {
    // Hızlı işlem modu kapalıysa SADECE detay ekranını aç (Yanlışlıkla işlem eklemeyi önle)
    openEditModal(num);
  }
};

// Dişe Hızlı İşlem Ekle veya Çıkar
const selectTooth = (num) => {
  if (!chartData.value) chartData.value = {};

  const currentProcs = [...getToothProcedures(num)];
  const target = selectedStatus.value;

  let updated = [];
  if (target === 'healthy') {
    updated = ['healthy'];
  } else {
    const cleanCurrent = currentProcs.filter(p => p !== 'healthy');
    if (cleanCurrent.includes(target)) {
      updated = cleanCurrent.filter(p => p !== target);
    } else {
      updated = [...cleanCurrent, target];
    }
    if (updated.length === 0) updated = ['healthy'];
  }

  chartData.value[num] = {
    procedures: updated,
    status: updated[0] || 'healthy',
    note: chartData.value[num]?.note || '',
    plannedPrice: chartData.value[num]?.plannedPrice ?? null,
    isBilled: chartData.value[num]?.isBilled ?? false,
  };
};

// Not, Çoklu İşlem ve Fiyat Düzenleme Modalı Aç
const openEditModal = (num) => {
  if (props.readonly) return;
  activeToothNum.value = num;
  tempProcedures.value = [...getToothProcedures(num)];
  tempNote.value = chartData.value[num]?.note || '';
  tempPlannedPrice.value = chartData.value[num]?.plannedPrice ?? null;
  tempIsBilled.value = chartData.value[num]?.isBilled ?? false;
  isEditModalOpen.value = true;
};

// Modaldaki İşlem Seçimlerini Değiştir (Multi-Select Toggle)
const toggleTempProcedure = (key) => {
  if (key === 'healthy') {
    tempProcedures.value = ['healthy'];
    return;
  }

  let list = tempProcedures.value.filter(p => p !== 'healthy');
  if (list.includes(key)) {
    list = list.filter(p => p !== key);
  } else {
    list.push(key);
  }

  if (list.length === 0) list = ['healthy'];
  tempProcedures.value = list;
};

// Modaldaki Değişiklikleri Uygula
const applyToothChanges = () => {
  if (!chartData.value) chartData.value = {};
  
  chartData.value[activeToothNum.value] = {
    procedures: tempProcedures.value,
    status: tempProcedures.value[0] || 'healthy',
    note: tempNote.value,
    plannedPrice: tempPlannedPrice.value !== null && tempPlannedPrice.value !== undefined && tempPlannedPrice.value !== ''
      ? Number(tempPlannedPrice.value)
      : null,
    isBilled: tempIsBilled.value,
  };
  
  isEditModalOpen.value = false;
};

// Sağlıklı olmayan ve işlem/fiyat tanımlanmış dişlerin listesi
const interestingTeeth = computed(() => {
  const list = [];
  for (const [key, val] of Object.entries(chartData.value)) {
    if (!val) continue;
    const procs = Array.isArray(val.procedures) && val.procedures.length > 0
      ? val.procedures.filter(p => p !== 'healthy')
      : (val.status && val.status !== 'healthy' ? [val.status] : []);

    if (procs.length > 0 || (val.note && val.note.trim() !== '') || val.plannedPrice) {
      list.push({
        num: parseInt(key),
        procedures: procs.length > 0 ? procs : ['healthy'],
        note: val.note || '',
        plannedPrice: val.plannedPrice ?? null,
        isBilled: !!val.isBilled,
      });
    }
  }
  return list.sort((a, b) => a.num - b.num);
});

// Henüz cariye aktarılmamış planlanan dişler
const unbilledTeeth = computed(() => {
  return interestingTeeth.value.filter(item => {
    const hasRealProcs = item.procedures.some(p => p !== 'healthy');
    return hasRealProcs && !item.isBilled;
  });
});

// Toplu aktarılacak tutar toplamı
const totalBatchAmount = computed(() => {
  return unbilledTeeth.value.reduce((sum, item) => sum + (Number(item.plannedPrice) || 0), 0);
});

// Doğrudan Harita Kaydetme Fonksiyonu
const saveChartDirect = async () => {
  await $fetch(`/api/dental-charts/${props.patientId}`, {
    method: 'POST',
    body: { chartData: chartData.value },
  });
};

// Tekli Finansa Aktar Modalı Aç
const openTransferModal = (item) => {
  transferItem.value = item;
  const procLabels = getToothProceduresLabels(item.procedures);
  transferForm.value = {
    procedure: `${procLabels} - Diş ${item.num}`,
    tooth: String(item.num),
    fee: item.plannedPrice || 0,
    date: todayStr(),
    notes: item.note || ''
  };
  isTransferModalOpen.value = true;
};

// Tekli Cariye Aktarımı Onayla
const confirmTransferToFinance = async () => {
  if (!transferForm.value.procedure || transferForm.value.fee === undefined || transferForm.value.fee === null) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen işlem adını ve ücretini kontrol edin.', type: 'error' }
    }));
    return;
  }

  try {
    isTransferring.value = true;

    // 1. Yeni Tedavi Borcu oluştur
    await $fetch('/api/treatments', {
      method: 'POST',
      body: {
        patientId: props.patientId,
        procedure: transferForm.value.procedure,
        tooth: transferForm.value.tooth,
        fee: Number(transferForm.value.fee),
        date: transferForm.value.date,
        notes: transferForm.value.notes
      }
    });

    // 2. Diş haritasındaki durumu cariye eklendi yap
    const toothNum = transferItem.value.num;
    if (!chartData.value[toothNum]) chartData.value[toothNum] = {};
    chartData.value[toothNum].isBilled = true;
    chartData.value[toothNum].plannedPrice = Number(transferForm.value.fee);
    if (transferForm.value.notes) {
      chartData.value[toothNum].note = transferForm.value.notes;
    }

    // 3. Haritayı kaydet
    await saveChartDirect();

    // 4. Bildirim gönder ve bakiye hesaplarını yenile
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: `Diş ${toothNum} tedavisi başarıyla cariye aktarıldı ve borç kaydı eklendi.`, type: 'success' }
    }));
    window.dispatchEvent(new CustomEvent('refresh-stats'));
    emit('saved');
    emit('transferred');

    isTransferModalOpen.value = false;
  } catch (error) {
    console.error('Cariye aktarılırken hata oluştu:', error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Cariye aktarılırken bir hata oluştu.', type: 'error' }
    }));
  } finally {
    isTransferring.value = false;
  }
};

// Toplu Aktarım Modalı Aç
const openBatchTransferModal = () => {
  batchDate.value = todayStr();
  isBatchTransferModalOpen.value = true;
};

// Toplu Aktarımı Onayla
const confirmBatchTransfer = async () => {
  if (unbilledTeeth.value.length === 0) return;

  try {
    isTransferring.value = true;

    // Her bir bekleyen dişi tedavi borcu olarak kaydet
    for (const item of unbilledTeeth.value) {
      const procLabels = getToothProceduresLabels(item.procedures);
      await $fetch('/api/treatments', {
        method: 'POST',
        body: {
          patientId: props.patientId,
          procedure: `${procLabels} - Diş ${item.num}`,
          tooth: String(item.num),
          fee: Number(item.plannedPrice) || 0,
          date: batchDate.value || todayStr(),
          notes: item.note || ''
        }
      });

      // Diş haritasında cariye eklendi olarak işaretle
      if (!chartData.value[item.num]) chartData.value[item.num] = {};
      chartData.value[item.num].isBilled = true;
    }

    // Haritayı kaydet
    await saveChartDirect();

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: `${unbilledTeeth.value.length} adet planlanan tedavi başarıyla cariye aktarıldı.`, type: 'success' }
    }));
    window.dispatchEvent(new CustomEvent('refresh-stats'));
    emit('saved');
    emit('transferred');

    isBatchTransferModalOpen.value = false;
  } catch (error) {
    console.error('Toplu aktarım hatası:', error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Toplu aktarım sırasında hata oluştu.', type: 'error' }
    }));
  } finally {
    isTransferring.value = false;
  }
};

// Veritabanına Kaydet
const saveChart = async () => {
  try {
    isSaving.value = true;
    await saveChartDirect();
    
    const event = new CustomEvent('toast-message', {
      detail: { message: 'Diş haritası ve işlemler başarıyla kaydedildi.', type: 'success' }
    });
    window.dispatchEvent(event);
    emit('saved');
  } catch (error) {
    console.error('Diş haritası kaydedilemedi:', error);
    const event = new CustomEvent('toast-message', {
      detail: { message: 'Diş haritası kaydedilirken bir hata oluştu.', type: 'error' }
    });
    window.dispatchEvent(event);
  } finally {
    isSaving.value = false;
  }
};
</script>
