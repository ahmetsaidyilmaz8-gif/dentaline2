<template>
  <div class="flex flex-col gap-8">
    
    <!-- Üst Başlık ve Hızlı Eylem Butonları -->
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Klinik Finans, Tahsilat & Gider Yönetimi</h2>
        <p class="text-base text-slate-500 dark:text-slate-400 font-medium">Genel cari işlemler, hasta tahsilatları, klinik masraf takibi ve poliklinik net kâr hesabı.</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          @click="openExpenseModal()"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 hover:border-rose-300 transition-all shadow-sm active:scale-95"
        >
          <Icon name="heroicons:plus-circle" class="w-4 h-4 text-rose-500" />
          <span>Yeni Gider Ekle</span>
        </button>
        <button
          @click="openNewReminder"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-all shadow-sm active:scale-95"
          title="Yeni Tedavi veya Ödeme Hatırlatıcısı Ekle"
        >
          <Icon name="heroicons:bell-alert" class="w-4 h-4 text-amber-500" />
          <span>Hatırlatıcı Ekle</span>
        </button>
        <button
          @click="openPaymentModal"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Icon name="heroicons:currency-dollar" class="w-4 h-4" />
          <span>+ Yeni Tahsilat Kaydet</span>
        </button>
      </div>
    </div>

    <!-- 1. DÖNEM / AY SEÇİCİ (Requirement 1: Varsayılan "Bu Ay", Ay/Yıl Seçici & Tüm Zamanlar) -->
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-2.5 flex-wrap">
        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Finansal Dönem:</span>
        </span>

        <!-- Ay Değiştirme Butonları (◀ Ay ▶) -->
        <div class="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1 border border-slate-200 dark:border-slate-700">
          <button
            @click="prevMonth"
            :disabled="selectedMonth === 'all'"
            class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
            title="Önceki Ay"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
          </button>

          <select
            v-model="selectedMonth"
            @change="onMonthChange"
            class="bg-transparent font-bold text-xs sm:text-sm text-slate-800 dark:text-white px-2 py-0.5 focus:outline-none cursor-pointer"
          >
            <option :value="currentMonthStr">📅 {{ formatMonthLabel(currentMonthStr) }} (Bu Ay)</option>
            <option v-for="m in availableMonthsFiltered" :key="m" :value="m">
              {{ formatMonthLabel(m) }}
            </option>
            <option value="all">🌐 Tüm Zamanlar (Genel Kasa)</option>
          </select>

          <button
            @click="nextMonth"
            :disabled="selectedMonth === 'all'"
            class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
            title="Sonraki Ay"
          >
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </button>
        </div>

        <!-- Hızlı Buton: "Bu Ay" -->
        <button
          v-if="selectedMonth !== currentMonthStr"
          @click="setMonth(currentMonthStr)"
          class="px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-all"
        >
          Bu Aya Dön
        </button>

        <!-- Hızlı Buton: "Tüm Zamanlar" -->
        <button
          @click="setMonth(selectedMonth === 'all' ? currentMonthStr : 'all')"
          :class="[
            selectedMonth === 'all'
              ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200',
            'px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5'
          ]"
        >
          <Icon name="heroicons:globe-alt" class="w-3.5 h-3.5" />
          <span>{{ selectedMonth === 'all' ? 'Aylık Filtreye Dön' : 'Tüm Zamanlar' }}</span>
        </button>
      </div>

      <!-- Sağ: Genel Bilanço Mini Rozeti -->
      <div
        v-if="stats"
        class="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2 rounded-xl shrink-0 flex-wrap"
      >
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="text-slate-400 font-medium">Toplam Tahsilat:</span>
          <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(stats?.totalRevenue) }}</span>
        </div>
        <span class="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          <span class="text-slate-400 font-medium">Bekleyen Alacak:</span>
          <span class="font-mono font-bold text-rose-600 dark:text-rose-400">{{ formatCurrency(stats?.totalDebt) }}</span>
        </div>
      </div>
    </div>

    <!-- 2. ÜST 4 FİNANSAL KPI KARTI (Requirement 1: Varsayılan "Bu Ay" Durumu) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Toplam Tahsilat (Kliniğe giren brüt para) -->
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
            {{ selectedMonth === 'all' ? 'Toplam Tahsilat (Tüm Zamanlar)' : `${formatMonthLabel(selectedMonth)} Tahsilatı` }}
          </span>
          <span class="text-2xl lg:text-3xl font-black text-slate-800 dark:text-slate-100 font-mono block mt-1 leading-none">
            {{ formatCurrency(expenseSummary?.totalCollections || 0) }}
          </span>
          <span class="text-[11px] text-slate-400 font-medium block">Hastalardan toplanan brüt para</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:banknotes" class="w-6 h-6" />
        </div>
      </div>

      <!-- 2. Hekim Hakedişleri Toplamı (Hekimlere ayrılan pay) -->
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs text-amber-500 font-bold uppercase tracking-wider block">
            {{ selectedMonth === 'all' ? 'Hekim Hak Edişleri (Tüm Zamanlar)' : `${formatMonthLabel(selectedMonth)} Hekim Payı` }}
          </span>
          <span class="text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono block mt-1 leading-none">
            {{ formatCurrency(expenseSummary?.totalDoctorEarnings || 0) }}
          </span>
          <span class="text-[11px] text-slate-400 font-medium block">Hekimlere ayrılan hak ediş payı</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:scale" class="w-6 h-6" />
        </div>
      </div>

      <!-- 3. Toplam Klinik Giderleri (Masraflar toplamı) -->
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs text-rose-500 font-bold uppercase tracking-wider block">
            {{ selectedMonth === 'all' ? 'Klinik Giderleri (Tüm Zamanlar)' : `${formatMonthLabel(selectedMonth)} Giderleri` }}
          </span>
          <span class="text-2xl lg:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono block mt-1 leading-none">
            {{ formatCurrency(expenseSummary?.totalExpenses || 0) }}
          </span>
          <span class="text-[11px] text-slate-400 font-medium block">Kira, depo, laboratuvar & faturalar</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:arrow-trending-down" class="w-6 h-6" />
        </div>
      </div>

      <!-- 4. Poliklinik Net Kazancı [Toplam Tahsilat - Hekim Hakedişleri - Klinik Giderleri] -->
      <div
        :class="[
          (expenseSummary?.netClinicProfit || 0) >= 0
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900 border-emerald-300 dark:border-emerald-800'
            : 'bg-gradient-to-br from-rose-50 to-rose-100/40 dark:from-rose-950/30 dark:to-slate-900 border-rose-300 dark:border-rose-800',
          'p-5 rounded-2xl border shadow-sm flex items-center justify-between'
        ]"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs font-black uppercase tracking-wider block text-emerald-700 dark:text-emerald-400">
              {{ selectedMonth === 'all' ? 'Poliklinik Net Kârı' : `${formatMonthLabel(selectedMonth)} Net Kârı` }}
            </span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              Net Kasa
            </span>
          </div>
          <span
            :class="[
              (expenseSummary?.netClinicProfit || 0) >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400',
              'text-2xl lg:text-3xl font-black font-mono block mt-1 leading-none'
            ]"
          >
            {{ formatCurrency(expenseSummary?.netClinicProfit || 0) }}
          </span>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold block">
            [Tahsilat - Hekim - Gider]
          </span>
        </div>
        <div
          :class="[
            (expenseSummary?.netClinicProfit || 0) >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md'
          ]"
        >
          <Icon name="heroicons:building-library" class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- 3. TEMİZ 3 SEKME (Requirement 2: Tab Menü - Aylık Gelir & Tahsilat | Aylık Giderler | Genel Gider Cetveli) -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-1.5 shadow-sm flex items-center gap-2 overflow-x-auto">
      <!-- Sekme 1: Aylık Gelir & Tahsilat -->
      <button
        @click="switchMainTab('income')"
        :class="[
          activeMainTab === 'income' || activeMainTab === 'ledger'
            ? 'bg-teal-600 text-white shadow-sm font-bold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold',
          'flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap'
        ]"
      >
        <Icon name="heroicons:banknotes" class="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Aylık Gelir & Tahsilat</span>
        <span
          :class="[
            activeMainTab === 'income' || activeMainTab === 'ledger' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
            'px-2 py-0.5 rounded-full text-xs font-bold'
          ]"
        >
          {{ ledgerTotalCount }} Hareket
        </span>
      </button>

      <!-- Sekme 2: Aylık Giderler -->
      <button
        @click="switchMainTab('expenses')"
        :class="[
          activeMainTab === 'expenses'
            ? 'bg-rose-600 text-white shadow-sm font-bold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold',
          'flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap'
        ]"
      >
        <Icon name="heroicons:building-office-2" class="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Aylık Giderler</span>
        <span
          :class="[
            activeMainTab === 'expenses' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
            'px-2 py-0.5 rounded-full text-xs font-bold'
          ]"
        >
          {{ expensesList.length }} Gider
        </span>
      </button>

      <!-- Sekme 3: Genel Gider Cetveli (Yıllık) -->
      <button
        @click="switchMainTab('yearly')"
        :class="[
          activeMainTab === 'yearly'
            ? 'bg-indigo-600 text-white shadow-sm font-bold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold',
          'flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap'
        ]"
      >
        <Icon name="heroicons:calendar-days" class="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Genel Gider Cetveli (Yıllık)</span>
        <span
          :class="[
            activeMainTab === 'yearly' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
            'px-2 py-0.5 rounded-full text-xs font-bold font-mono'
          ]"
        >
          {{ selectedYear }}
        </span>
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- SEKME 2 İÇERİĞİ: AYLIK GİDERLER                                           -->
    <!-- ========================================================================= -->
    <div v-if="activeMainTab === 'expenses'" class="flex flex-col gap-6">

      <!-- Gider Filtreleme & Arama Çubuğu -->
      <div class="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Sol: Dönem Bilgisi ve Kategori Seçimi -->
        <div class="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <!-- Aktif Dönem Rozeti -->
          <div class="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-1.5 shadow-sm text-xs text-rose-700 dark:text-rose-300 font-bold">
            <Icon name="heroicons:calendar" class="w-4 h-4 text-rose-500 shrink-0" />
            <span>{{ formatMonthLabel(selectedMonth) }} Giderleri</span>
          </div>

          <!-- Kategori Filtresi -->
          <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <Icon name="heroicons:tag" class="w-4 h-4 text-slate-400 shrink-0" />
            <span class="font-bold text-slate-400 uppercase text-[10px]">Kategori:</span>
            <select
              v-model="selectedExpenseCategory"
              @change="loadExpenses"
              class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Tüm Kategoriler</option>
              <option v-for="c in EXPENSE_CATEGORIES" :key="c.value" :value="c.value">
                {{ c.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Sağ: Arama ve Yeni Gider Butonu -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="relative flex-1 md:w-64">
            <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="expenseSearchQuery"
              @input="debounceExpenseSearch"
              type="text"
              placeholder="Masraf açıklaması ara..."
              class="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-rose-500 text-slate-800 dark:text-white"
            />
          </div>

          <button
            @click="openExpenseModal()"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <Icon name="heroicons:plus" class="w-4 h-4" />
            <span>Gider Ekle</span>
          </button>
        </div>
      </div>

      <!-- Kategori Dağılımı Çipleri (Görsel Dağılım) -->
      <div v-if="expenseSummary?.categoryBreakdown && Object.keys(expenseSummary.categoryBreakdown).length > 0" class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span class="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0">Harcama Dağılımı:</span>
        <div
          v-for="(amount, catName) in expenseSummary.categoryBreakdown"
          :key="catName"
          @click="selectedExpenseCategory = selectedExpenseCategory === catName ? 'all' : catName; loadExpenses()"
          :class="[
            selectedExpenseCategory === catName ? 'ring-2 ring-rose-500 font-bold' : '',
            getCategoryConfig(catName).badgeClass,
            'px-2.5 py-1 rounded-lg border cursor-pointer select-none flex items-center gap-1.5 shrink-0 transition-all hover:opacity-90'
          ]"
        >
          <span>{{ catName }}:</span>
          <span class="font-mono font-bold">{{ formatCurrency(amount) }}</span>
        </div>
      </div>

      <!-- Gider Tablosu -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
                <th class="px-6 py-4">Tarih</th>
                <th class="px-6 py-4">Kategori</th>
                <th class="px-6 py-4">Açıklama</th>
                <th class="px-6 py-4">Ödeme Yöntemi</th>
                <th class="px-6 py-4 text-right">Tutar (TL)</th>
                <th class="px-6 py-4 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="isExpensesLoading">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                  <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
                  <span>Klinik giderleri yükleniyor...</span>
                </td>
              </tr>

              <tr v-else-if="expensesList.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  <Icon name="heroicons:receipt-refund" class="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p class="font-medium text-slate-600 dark:text-slate-300">Seçili dönemde kayıtlı klinik gideri bulunamadı.</p>
                  <p class="text-xs text-slate-400 mt-1">Yukarıdaki "+ Yeni Gider Ekle" butonundan ilk masraf kaydını yapabilirsiniz.</p>
                </td>
              </tr>

              <tr
                v-for="expense in expensesList"
                :key="expense._id"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <!-- Tarih -->
                <td class="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {{ formatDate(expense.date) }}
                </td>

                <!-- Kategori -->
                <td class="px-6 py-4">
                  <span
                    :class="[
                      getCategoryConfig(expense.category).badgeClass,
                      'px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 border'
                    ]"
                  >
                    <Icon :name="getCategoryConfig(expense.category).icon" class="w-3.5 h-3.5" />
                    <span>{{ expense.category }}</span>
                  </span>
                </td>

                <!-- Açıklama -->
                <td class="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span>{{ expense.description }}</span>
                    <!-- Tekrarlayan Sabit Gider Şablon Rozeti -->
                    <span
                      v-if="expense.isRecurring"
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1"
                      title="Her ay otomatik tekrarlanan sabit masraf şablonu"
                    >
                      <Icon name="heroicons:arrow-path" class="w-3 h-3 text-amber-600" />
                      <span>Her ayın {{ expense.recurringDay || 1 }}'i</span>
                    </span>
                    <!-- Otomatik Oluşturulan Instance Rozeti -->
                    <span
                      v-else-if="expense.isAutoGenerated"
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1"
                      title="Sabit gider döngüsünden otomatik oluşturuldu"
                    >
                      <Icon name="heroicons:sparkles" class="w-3 h-3 text-indigo-600" />
                      <span>Otomatik Döngü</span>
                    </span>
                  </div>
                  <div v-if="expense.labWorkId" class="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5 flex items-center gap-1">
                    <Icon name="heroicons:cube" class="w-3 h-3" />
                    <span>Laboratuvar Modülünden Otomatik Aktarıldı</span>
                  </div>
                </td>

                <!-- Ödeme Yöntemi -->
                <td class="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                  <span class="inline-flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {{ getPaymentMethodConfig(expense.paymentMethod).icon }}
                    {{ getPaymentMethodConfig(expense.paymentMethod).label }}
                  </span>
                </td>

                <!-- Tutar -->
                <td class="px-6 py-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap">
                  -{{ formatCurrency(expense.amount) }}
                </td>

                <!-- Eylemler -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="openExpenseModal(expense)"
                      class="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                      title="Gideri Düzenle"
                    >
                      <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteExpense(expense._id)"
                      class="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Gideri Sil"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 2. BÖLÜM: HASTA TAHSİLATLARI & CARİ HAREKETLER (Aylık Gelir & Tahsilat)     -->
    <!-- ========================================================================= -->
    <div v-else-if="activeMainTab === 'income' || activeMainTab === 'ledger'" class="flex flex-col gap-6">

      <!-- Genel Cari Hareket Tablosu / Borçlu Hastalar Listesi -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Görünüm Filtre Butonları (Tümü / Tahsilatlar / Alacaklar) -->
            <div class="inline-flex p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs font-bold gap-1 border border-slate-200 dark:border-slate-700">
              <button
                @click="setFilter('all')"
                :class="[
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
                  'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5'
                ]"
              >
                <Icon name="heroicons:list-bullet" class="w-3.5 h-3.5" />
                <span>Tüm Hareketler</span>
              </button>

              <button
                @click="setFilter('payment')"
                :class="[
                  activeFilter === 'payment'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400',
                  'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5'
                ]"
              >
                <Icon name="heroicons:banknotes" class="w-3.5 h-3.5" />
                <span>Sadece Tahsilatlar</span>
              </button>

              <button
                @click="setFilter('debt')"
                :class="[
                  activeFilter === 'debt'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400',
                  'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5'
                ]"
              >
                <Icon name="heroicons:credit-card" class="w-3.5 h-3.5" />
                <span>Bekleyen Alacaklar ({{ stats?.debtorsCount || debtorPatients.length }})</span>
              </button>
            </div>
          </div>

          <div class="flex items-center flex-wrap gap-2.5">
            <!-- Akıllı Sıralama Menüsü -->
            <div v-if="activeFilter === 'debt'" class="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-sm">
              <Icon name="heroicons:bars-arrow-down" class="w-4 h-4 text-rose-500 shrink-0" />
              <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">Sıralama:</span>
              <select
                v-model="debtorSortBy"
                @change="onDebtorSortChange"
                class="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🕒 Kayıt: En Yeni ➔ En Eski (Varsayılan)</option>
                <option value="oldest" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🕒 Kayıt: En Eski ➔ En Yeni</option>
                <option value="debt_desc" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">💰 Borç: En Çok ➔ En Az</option>
                <option value="name_asc" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🔤 İsme Göre: A ➔ Z</option>
              </select>
            </div>

            <div v-else class="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-sm">
              <Icon name="heroicons:bars-arrow-down" class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">Sıralama:</span>
              <select
                v-model="ledgerSortBy"
                @change="onLedgerSortChange"
                class="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🕒 Tarih: En Yeni ➔ En Eski</option>
                <option value="oldest" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🕒 Tarih: En Eski ➔ En Yeni</option>
                <option value="amount_desc" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">💰 Tutar: En Yüksek ➔ En Düşük</option>
                <option value="amount_asc" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">💰 Tutar: En Düşük ➔ En Yüksek</option>
              </select>
            </div>

            <!-- Arama Kutusu -->
            <div class="relative w-52 sm:w-64">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
              </span>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="activeFilter === 'debt' ? 'Borçlu hasta adı veya tel...' : 'İşlem veya hasta ara...'"
                class="w-full pl-9 pr-7 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-500 text-slate-800 dark:text-white transition-all shadow-sm"
                @input="onSearchInput"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Aramayı Temizle"
              >
                <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
              </button>
            </div>

            <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
              {{ activeFilter === 'debt' ? `Borçlu Hasta: ${filteredDebtorPatients.length}` : `İşlem: ${ledgerTotalCount}` }}
            </span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <!-- 1. MOD: BORÇLU HASTALAR LİSTESİ TABLOSU (activeFilter === 'debt') -->
          <table v-if="activeFilter === 'debt'" class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-950/10 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
                <th class="px-6 py-3.5 cursor-pointer select-none hover:text-rose-600 transition-colors" @click="debtorSortBy = debtorSortBy === 'name_asc' ? 'newest' : 'name_asc'" title="İsme göre A-Z sırala">
                  <div class="flex items-center gap-1">
                    <span>Borçlu Hasta</span>
                    <Icon v-if="debtorSortBy === 'name_asc'" name="heroicons:chevron-up" class="w-3.5 h-3.5 text-rose-600" />
                    <Icon v-else-if="debtorSortBy === 'newest'" name="heroicons:clock" class="w-3.5 h-3.5 text-rose-500" />
                  </div>
                </th>
                <th class="px-6 py-3.5">İletişim</th>
                <th class="px-6 py-3.5">Son İşlem Tarihi</th>
                <th class="px-6 py-3.5 text-right">Toplam Tedavi</th>
                <th class="px-6 py-3.5 text-right">Yapılan Tahsilat</th>
                <th class="px-6 py-3.5 text-right cursor-pointer select-none hover:text-rose-600 transition-colors" @click="debtorSortBy = debtorSortBy === 'debt_desc' ? 'newest' : 'debt_desc'" title="Borç miktarına göre sırala">
                  <div class="flex items-center justify-end gap-1">
                    <span>Kalan Borç Tutarı</span>
                    <Icon v-if="debtorSortBy === 'debt_desc'" name="heroicons:arrow-down" class="w-3.5 h-3.5 text-rose-600" />
                  </div>
                </th>
                <th class="px-6 py-3.5 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="isDebtorsLoading">
                <td colspan="7" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                  <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin text-rose-600 inline-block mb-2" />
                  <div>Borçlu hasta listesi yükleniyor...</div>
                </td>
              </tr>
              <tr v-else-if="filteredDebtorPatients.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                  Borçlu hasta kaydı bulunamadı.
                </td>
              </tr>
              <tr
                v-else
                v-for="d in paginatedDebtorPatients"
                :key="d._id"
                class="hover:bg-rose-50/20 dark:hover:bg-rose-950/10 transition-colors group"
              >
                <!-- Hasta Adı & Profil -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div :class="[getAvatarColorClass(d.firstName), 'w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0']">
                      {{ getInitials(d.firstName, d.lastName) }}
                    </div>
                    <div>
                      <NuxtLink :to="`/patients/${d._id}`" class="font-bold text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors block">
                        {{ d.firstName }} {{ d.lastName }}
                      </NuxtLink>
                      <span v-if="d.tcNo" class="text-[11px] text-slate-400 block font-mono">TC: {{ d.tcNo }}</span>
                    </div>
                  </div>
                </td>

                <!-- İletişim -->
                <td class="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                  <a v-if="d.phone" :href="`tel:${d.phone}`" class="hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5">
                    <Icon name="heroicons:phone" class="w-3.5 h-3.5 text-slate-400" />
                    <span>{{ formatPhone(d.phone) }}</span>
                  </a>
                  <span v-else class="text-slate-400">—</span>
                </td>

                <!-- Son İşlem Tarihi -->
                <td class="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {{ formatDate(d.lastActivityDate || d.updatedAt) }}
                </td>

                <!-- Toplam Tedavi Bedeli -->
                <td class="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-300">
                  {{ formatCurrency(d.totalTreatments || (d.debt + (d.totalPayments || 0))) }}
                </td>

                <!-- Yapılan Tahsilat -->
                <td class="px-6 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {{ formatCurrency(d.totalPayments || 0) }}
                </td>

                <!-- Kalan Borç Tutarı -->
                <td class="px-6 py-4 text-right">
                  <span class="inline-block px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-mono font-black text-sm border border-rose-200 dark:border-rose-900/60 shadow-xs">
                    {{ formatCurrency(d.debt) }}
                  </span>
                </td>

                <!-- Eylemler: Hızlı Tahsilat Al & Hatırlatıcı Kur -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="openReminderForDebtor(d)"
                      class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 rounded-xl transition-all active:scale-95 border border-amber-200/60 dark:border-amber-800/40"
                      title="Ödeme Hatırlatıcısı Oluştur"
                    >
                      <Icon name="heroicons:bell" class="w-3.5 h-3.5 text-amber-500" />
                      <span>Hatırlat</span>
                    </button>
                    <button
                      @click="openPaymentModalForPatient(d)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all"
                      title="Bu hasta için hemen tahsilat makbuzu kes"
                    >
                      <Icon name="heroicons:banknotes" class="w-3.5 h-3.5" />
                      <span>Tahsil Et</span>
                    </button>
                    <NuxtLink
                      :to="`/patients/${d._id}`"
                      class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Hasta Kartını Aç"
                    >
                      <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 2. MOD: TÜM CARİ HAREKETLER / ALINAN ÖDEMELER TABLOSU -->
          <table v-else class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
                <th class="px-6 py-4">Tarih</th>
                <th class="px-6 py-4">Hasta</th>
                <th class="px-6 py-4">İşlem / Açıklama</th>
                <th class="px-6 py-4">Tür</th>
                <th class="px-6 py-4">Hekim</th>
                <th class="px-6 py-4 text-right">Tutar</th>
                <th class="px-6 py-4 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="isLoading">
                <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                  <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                  <div>Finansal veriler yükleniyor...</div>
                </td>
              </tr>
              <tr v-else-if="ledgerItems.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  <span v-if="searchQuery">Aramanıza uygun kayıt bulunamadı.</span>
                  <span v-else>Henüz yapılmış bir finansal hareket bulunmamaktadır.</span>
                </td>
              </tr>
              <tr
                v-for="item in ledgerItems"
                :key="item.id"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <!-- Tarih -->
                <td class="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {{ formatDate(item.date) }}
                </td>

                <!-- Hasta -->
                <td class="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                  <NuxtLink
                    v-if="item.patientId"
                    :to="`/patients/${item.patientId._id || item.patientId}`"
                    class="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5"
                  >
                    <Icon name="heroicons:user" class="w-4 h-4 text-slate-400" />
                    <span>{{ item.patientId.firstName }} {{ item.patientId.lastName }}</span>
                  </NuxtLink>
                  <span v-else class="text-slate-400 italic">Bilinmeyen Hasta</span>
                </td>

                <!-- Açıklama -->
                <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                  <div class="font-medium text-slate-800 dark:text-slate-200">
                    {{ item.description }}
                  </div>
                  <div v-if="item.tooth" class="text-xs font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                    Diş: {{ item.tooth }}
                  </div>
                  <div v-if="item.notes" class="text-xs text-slate-400 mt-0.5 italic">
                    "{{ item.notes }}"
                  </div>
                </td>

                <!-- Tür -->
                <td class="px-6 py-4">
                  <span
                    :class="[
                      item.type === 'payment'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
                      'px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border'
                    ]"
                  >
                    <Icon
                      :name="item.type === 'payment' ? 'heroicons:banknotes' : 'heroicons:wrench-screwdriver'"
                      class="w-3.5 h-3.5"
                    />
                    <span>{{ item.type === 'payment' ? 'Tahsilat' : 'Tedavi Ücreti' }}</span>
                  </span>
                </td>

                <!-- Hekim -->
                <td class="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {{ item.doctorName || getDoctorName(item.doctorId) || (typeof item.doctorId === 'object' ? item.doctorId?.name : null) || 'Klinik Genel' }}
                </td>

                <!-- Tutar -->
                <td class="px-6 py-4 text-right font-mono font-bold">
                  <span
                    :class="[
                      item.type === 'payment'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-800 dark:text-slate-100'
                    ]"
                  >
                    {{ item.type === 'payment' ? '+' : '' }}{{ formatCurrency(item.amount) }}
                  </span>
                </td>

                <!-- Eylemler -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="openEditModal(item)"
                      class="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                      title="Düzenle"
                    >
                      <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDelete(item)"
                      class="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Sil"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sayfalama (Pagination) -->
        <div v-if="totalPagesCount > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400">
            Sayfa {{ currentPage }} / {{ totalPagesCount }}
          </span>
          <div class="flex items-center gap-1">
            <button
              :disabled="currentPage <= 1"
              @click="goToPage(currentPage - 1)"
              class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200"
            >
              Önceki
            </button>
            <button
              :disabled="currentPage >= totalPagesCount"
              @click="goToPage(currentPage + 1)"
              class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ========================================================================= -->
    <!-- SEKME 3 İÇERİĞİ: GENEL GİDER CETVELİ (YILLIK)                             -->
    <!-- ========================================================================= -->
    <div v-else-if="activeMainTab === 'yearly'" class="flex flex-col gap-6">
      <!-- Üst Kontrol & Yıl Seçici -->
      <div class="bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/25">
            <Icon name="heroicons:calendar-days" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-bold text-slate-800 dark:text-white text-base tracking-tight">Genel Gider Cetveli (Yıllık Rapor)</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ocak'tan Aralık'a kadar aylık klinik masrafları, kasa tahsilatları, hekim hakedişleri ve poliklinik net kâr tablosu.
            </p>
          </div>
        </div>

        <!-- Yıl Seçimi -->
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Yıl:</span>
          <select
            v-model.number="selectedYear"
            @change="loadExpenses"
            class="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:outline-none font-mono shadow-sm cursor-pointer"
          >
            <option :value="2026">2026</option>
            <option :value="2025">2025</option>
            <option :value="2024">2024</option>
            <option :value="2023">2023</option>
          </select>
        </div>
      </div>

      <!-- Yıllık Özet KPI Kartları (4 Adet) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Yıllık Toplam Gider -->
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs text-rose-500 font-bold uppercase tracking-wider block">{{ selectedYear }} Yıllık Toplam Gider</span>
            <div class="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
              {{ formatCurrency(yearlyReport?.yearSummary?.totalExpense || 0) }}
            </div>
            <span class="text-[11px] text-slate-400 font-medium block">12 aylık kümülatif masraf</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Icon name="heroicons:arrow-trending-down" class="w-6 h-6" />
          </div>
        </div>

        <!-- 2. Yıllık Toplam Tahsilat -->
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider block">{{ selectedYear }} Yıllık Tahsilat</span>
            <div class="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono mt-1">
              {{ formatCurrency(yearlyReport?.yearSummary?.totalCollection || 0) }}
            </div>
            <span class="text-[11px] text-slate-400 font-medium block">Kasalara giren brüt tahsilat</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Icon name="heroicons:banknotes" class="w-6 h-6" />
          </div>
        </div>

        <!-- 3. Yıllık Hekim Hak Edişleri -->
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs text-amber-500 font-bold uppercase tracking-wider block">{{ selectedYear }} Hekim Hakedişleri</span>
            <div class="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
              {{ formatCurrency(yearlyReport?.yearSummary?.totalDoctorEarning || 0) }}
            </div>
            <span class="text-[11px] text-slate-400 font-medium block">Hekimlere ayrılan pay</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Icon name="heroicons:scale" class="w-6 h-6" />
          </div>
        </div>

        <!-- 4. Yıllık Net Poliklinik Kârı -->
        <div
          :class="[
            (yearlyReport?.yearSummary?.netProfit || 0) >= 0
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900 border-emerald-300 dark:border-emerald-800'
              : 'bg-gradient-to-br from-rose-50 to-rose-100/40 dark:from-rose-950/30 dark:to-slate-900 border-rose-300 dark:border-rose-800',
            'p-5 rounded-2xl border shadow-sm flex items-center justify-between'
          ]"
        >
          <div class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-wider block text-emerald-700 dark:text-emerald-400">
              {{ selectedYear }} Yıllık Net Kazanç
            </span>
            <div
              :class="[
                (yearlyReport?.yearSummary?.netProfit || 0) >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400',
                'text-2xl font-black font-mono mt-1'
              ]"
            >
              {{ formatCurrency(yearlyReport?.yearSummary?.netProfit || 0) }}
            </div>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">[Tahsilat - Hekim - Gider]</span>
          </div>
          <div
            :class="[
              (yearlyReport?.yearSummary?.netProfit || 0) >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md'
            ]"
          >
            <Icon name="heroicons:building-library" class="w-6 h-6" />
          </div>
        </div>
      </div>

      <!-- 12 Aylık Karşılaştırmalı Takvim Cetveli Tablosu (Ocak - Aralık) -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="heroicons:table-cells" class="w-4 h-4 text-indigo-500" />
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              {{ selectedYear }} Yılı 12 Aylık Finansal Gelir-Gider Döküm Tablosu
            </h4>
          </div>
          <span class="text-xs text-slate-400 hidden sm:inline">
            İlgili ayın detaylarını incelemek için sağdaki "İncele" butonuna tıklayabilirsiniz
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th class="px-5 py-3.5">Dönem / Ay</th>
                <th class="px-5 py-3.5 text-center">Gider Sayısı</th>
                <th class="px-5 py-3.5 text-right text-rose-500">Klinik Gideri</th>
                <th class="px-5 py-3.5 text-right text-teal-600 dark:text-teal-400">Kasa Tahsilatı</th>
                <th class="px-5 py-3.5 text-right text-amber-500">Hekim Hak Edişi</th>
                <th class="px-5 py-3.5 text-right font-black">Net Kâr / Kasa</th>
                <th class="px-5 py-3.5">Harcama Dağılımı</th>
                <th class="px-5 py-3.5 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr
                v-for="m in yearlyReport?.months || []"
                :key="m.month"
                :class="[
                  selectedMonth === m.month ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
                  'transition-colors'
                ]"
              >
                <!-- Ay Adı -->
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <span
                      :class="[
                        selectedMonth === m.month ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold',
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs'
                      ]"
                    >
                      {{ m.monthNumber }}
                    </span>
                    <div>
                      <span class="font-bold text-slate-800 dark:text-slate-100 block">{{ m.monthName }} {{ selectedYear }}</span>
                      <span v-if="m.month === currentMonthStr" class="text-[10px] text-teal-600 dark:text-teal-400 font-bold block">İçinde Bulunduğumuz Ay</span>
                    </div>
                  </div>
                </td>

                <!-- Gider Adedi -->
                <td class="px-5 py-3.5 text-center font-mono text-slate-600 dark:text-slate-300">
                  <span v-if="m.expenseCount > 0" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-bold text-xs">
                    {{ m.expenseCount }} adet
                  </span>
                  <span v-else class="text-slate-300 dark:text-slate-600">-</span>
                </td>

                <!-- Klinik Gideri -->
                <td class="px-5 py-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  {{ m.totalExpense > 0 ? `-${formatCurrency(m.totalExpense)}` : '₺0' }}
                </td>

                <!-- Kasa Tahsilatı -->
                <td class="px-5 py-3.5 text-right font-mono font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                  {{ formatCurrency(m.totalCollection || 0) }}
                </td>

                <!-- Hekim Hak Edişi -->
                <td class="px-5 py-3.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                  {{ formatCurrency(m.totalDoctorEarning || 0) }}
                </td>

                <!-- Net Kâr / Kasa -->
                <td class="px-5 py-3.5 text-right font-mono font-black whitespace-nowrap">
                  <span :class="m.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                    {{ formatCurrency(m.netProfit) }}
                  </span>
                </td>

                <!-- Harcama Dağılımı (Mini Çipler) -->
                <td class="px-5 py-3.5">
                  <div v-if="Object.keys(m.categoryBreakdown || {}).length > 0" class="flex items-center gap-1.5 flex-wrap max-w-xs">
                    <span
                      v-for="(amount, catName) in m.categoryBreakdown"
                      :key="catName"
                      class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap"
                    >
                      {{ catName }}: {{ formatCurrency(amount) }}
                    </span>
                  </div>
                  <span v-else class="text-slate-300 dark:text-slate-600 text-xs">-</span>
                </td>

                <!-- Eylem -->
                <td class="px-5 py-3.5 text-center whitespace-nowrap">
                  <button
                    @click="goToMonthDetails(m.month)"
                    class="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition-all active:scale-95 inline-flex items-center gap-1"
                    title="Bu ayın giderlerini incele"
                  >
                    <span>İncele</span>
                    <Icon name="heroicons:arrow-right" class="w-3 h-3" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODALLAR                                                                  -->
    <!-- ========================================================================= -->

    <!-- 1. Yeni / Düzenle Klinik Gideri Modalı (Requirement 2) -->
    <AppModal
      :isOpen="isExpenseModalOpen"
      :title="editingExpenseId ? '✏️ Klinik Gider Kaydını Düzenle' : '➕ Yeni Klinik Gideri Ekle'"
      width="md"
      @close="isExpenseModalOpen = false"
    >
      <form @submit.prevent="saveExpense" class="space-y-4">
        <!-- Kategori -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Gider Kategorisi <span class="text-rose-500">*</span>
          </label>
          <select
            v-model="expenseForm.category"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-rose-500 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          >
            <option v-for="c in EXPENSE_CATEGORIES" :key="c.value" :value="c.value">
              {{ c.label }}
            </option>
          </select>
        </div>

        <!-- Tutar & Ödeme Yöntemi Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Tutar (TL) <span class="text-rose-500">*</span>
            </label>
            <input
              v-model.number="expenseForm.amount"
              type="number"
              min="0.01"
              step="any"
              required
              placeholder="0.00"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-rose-500 text-sm font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Ödeme Yöntemi <span class="text-rose-500">*</span>
            </label>
            <select
              v-model="expenseForm.paymentMethod"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-rose-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            >
              <option value="cash">💵 Nakit</option>
              <option value="transfer">🏦 Havale / EFT</option>
              <option value="card">💳 Kredi Kartı</option>
            </select>
          </div>
        </div>

        <!-- Tarih -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Gider Tarihi <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="expenseForm.date"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-rose-500 text-sm font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>

        <!-- Tekrarlayan Sabit Gider (Aylık Döngü - Requirement 3) -->
        <div class="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl space-y-2.5">
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="expenseForm.isRecurring"
              class="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <div class="flex-1">
              <span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Icon name="heroicons:arrow-path" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Tekrarlayan Sabit Gider (Aylık Döngü)</span>
              </span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Kira, aidat, sabit faturalar gibi her ay otomatik işlenmesini istediğiniz masraflar için işaretleyin.
              </p>
            </div>
          </label>

          <!-- Tekrar Günü (1-31) -->
          <div v-if="expenseForm.isRecurring" class="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 flex items-center gap-2">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Tekrar Günü:
            </span>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-slate-500">Her ayın</span>
              <select
                v-model.number="expenseForm.recurringDay"
                class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
              >
                <option v-for="d in 31" :key="d" :value="d">
                  {{ d }}. günü
                </option>
              </select>
              <span class="text-xs text-slate-500 font-medium">otomatik işlensin</span>
            </div>
          </div>
        </div>

        <!-- Açıklama -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Açıklama <span class="text-rose-500">*</span>
          </label>
          <textarea
            v-model="expenseForm.description"
            rows="3"
            required
            placeholder="Örn: Dental depo kompozit faturası, Eylül ayı kira bedeli, teknisyen ödemesi..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-rose-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="isExpenseModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          type="button"
          :disabled="isSaving"
          @click="saveExpense"
          class="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Icon v-if="isSaving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>{{ editingExpenseId ? 'Değişiklikleri Kaydet' : 'Gideri Ekle' }}</span>
        </button>
      </template>
    </AppModal>

    <!-- 2. Tahsilat Ekle / Düzenle Modalı -->
    <AppModal
      :isOpen="isPaymentModalOpen"
      :title="editingPaymentId ? '✏️ Tahsilat Kaydını Düzenle' : '💰 Yeni Tahsilat Kaydet'"
      width="md"
      @close="isPaymentModalOpen = false"
    >
      <form @submit.prevent="savePayment" class="space-y-4">
        <!-- Hasta Seçimi -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Hasta <span class="text-rose-500">*</span></label>
          <PatientSearchSelect
            v-model="form.patientId"
            :patients="patients"
            placeholder="Hasta seçin..."
            :required="true"
          />
        </div>

        <!-- Miktar ve Yöntem -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Miktar (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="form.amount"
              type="number"
              min="0.01"
              step="any"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Ödeme Yöntemi <span class="text-rose-500">*</span></label>
            <select
              v-model="form.method"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            >
              <option v-for="m in PAYMENT_METHODS" :key="m.value" :value="m.value" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                {{ m.icon }} {{ m.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tarih -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Ödeme Tarihi <span class="text-rose-500">*</span></label>
          <input
            v-model="form.date"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>

        <!-- Hekim Seçimi -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Tahsilat Hekimi / Hak Ediş Sahibi <span class="text-rose-500">*</span></label>
          <select
            v-model="form.doctorId"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option v-for="doc in doctors" :key="doc._id" :value="doc._id">
              {{ doc.name }} (%{{ doc.rate }} Hak Ediş)
            </option>
          </select>
          <span v-if="form.amount && form.doctorId" class="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
            Tahsilat kasaya girer, hekime %{{ getDocRate(form.doctorId) }} hak ediş ({{ formatCurrency(Math.round((form.amount * getDocRate(form.doctorId) / 100) * 100) / 100) }}) tahakkuk eder.
          </span>
        </div>

        <!-- Açıklama Notu -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Açıklama Notu</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Dekont no, elden nakit ödeme vb..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          @click="isPaymentModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="savePayment"
          :disabled="isSaving"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          {{ editingPaymentId ? 'Değişiklikleri Kaydet' : 'Ödemeyi Al' }}
        </button>
      </template>
    </AppModal>

    <!-- 3. Tedavi İşlemi Düzenleme Modalı -->
    <AppModal
      :isOpen="isTreatmentModalOpen"
      title="✏️ Tedavi İşlemini Düzenle"
      width="md"
      @close="isTreatmentModalOpen = false"
    >
      <form @submit.prevent="saveTreatment" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Hasta <span class="text-rose-500">*</span></label>
          <PatientSearchSelect
            v-model="treatmentForm.patientId"
            :patients="patients"
            placeholder="Hasta seçin..."
            :required="true"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Yapılan İşlem <span class="text-rose-500">*</span></label>
            <input
              v-model="treatmentForm.procedure"
              type="text"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Diş No</label>
            <input
              v-model="treatmentForm.tooth"
              type="text"
              placeholder="Örn: 16"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Tedavi Ücreti (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="treatmentForm.fee"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">İşlem Tarihi <span class="text-rose-500">*</span></label>
            <input
              v-model="treatmentForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">İşlemi Yapan Hekim <span class="text-rose-500">*</span></label>
          <select
            v-model="treatmentForm.doctorId"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option v-for="doc in doctors" :key="doc._id" :value="doc._id">
              {{ doc.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Açıklama Notu</label>
          <textarea
            v-model="treatmentForm.notes"
            rows="2"
            placeholder="İşlem detayları veya hekim açıklaması..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          @click="isTreatmentModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="saveTreatment"
          :disabled="isSaving"
          class="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          Değişiklikleri Kaydet
        </button>
      </template>
    </AppModal>

    <!-- 4. Hatırlatıcı Modalı -->
    <NewReminderModal
      :isOpen="isReminderModalOpen"
      :initialCategory="reminderInitialCategory"
      :initialPatientId="reminderInitialPatientId"
      :initialPatientName="reminderInitialPatientName"
      :initialPatientPhone="reminderInitialPatientPhone"
      :initialNote="reminderInitialNote"
      @close="isReminderModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUtils } from '~/composables/useUtils';

const route = useRoute();

const {
  formatDate,
  formatCurrency,
  formatPhone,
  getAvatarColorClass,
  getInitials,
  PAYMENT_METHODS,
  todayStr
} = useUtils();

// Ana Sekme: 'income' (Aylık Gelir & Tahsilat), 'expenses' (Aylık Giderler), 'yearly' (Genel Gider Cetveli)
const activeMainTab = ref(
  route.query.tab === 'expenses'
    ? 'expenses'
    : route.query.tab === 'yearly'
      ? 'yearly'
      : 'income'
);

// =========================================================================
// FİNANSAL DÖNEM (AY / YIL SEÇİCİ) & KLİNİK GİDERLERİ STATE
// =========================================================================
const EXPENSE_CATEGORIES = [
  { value: 'Sarf Malzeme/Depo', label: 'Sarf Malzeme / Depo', icon: 'heroicons:archive-box', badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
  { value: 'Laboratuvar Ödemesi', label: 'Laboratuvar Ödemesi', icon: 'heroicons:cube', badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { value: 'Kira/Aidat', label: 'Kira / Aidat', icon: 'heroicons:home', badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { value: 'Personel/Maaş', label: 'Personel / Maaş', icon: 'heroicons:user-group', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { value: 'Faturalar', label: 'Faturalar (Elektrik, Su, Net)', icon: 'heroicons:bolt', badgeClass: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  { value: 'Vergi/Muhasebe', label: 'Vergi / Muhasebe', icon: 'heroicons:document-text', badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  { value: 'Diğer', label: 'Diğer Masraflar', icon: 'heroicons:ellipsis-horizontal-circle', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' }
];

const now = new Date();
const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const selectedMonth = ref(currentMonthStr);
const selectedYear = ref(now.getFullYear());
const yearlyReport = ref(null);

const expensesList = ref([]);
const expenseSummary = ref({
  totalCollections: 0,
  totalDoctorEarnings: 0,
  totalExpenses: 0,
  netClinicProfit: 0,
  selectedMonth: currentMonthStr,
  categoryBreakdown: {},
  availableMonths: [],
  allTime: {
    totalCollections: 0,
    totalDoctorEarnings: 0,
    totalExpenses: 0,
    netClinicProfit: 0
  }
});

const selectedExpenseCategory = ref('all');
const expenseSearchQuery = ref('');
const isExpensesLoading = ref(false);
const isExpenseModalOpen = ref(false);
const editingExpenseId = ref(null);

const defaultExpenseForm = {
  category: 'Sarf Malzeme/Depo',
  amount: null,
  paymentMethod: 'cash',
  date: todayStr(),
  description: '',
  isRecurring: false,
  recurringDay: 1
};
const expenseForm = ref({ ...defaultExpenseForm });

const availableMonthsFiltered = computed(() => {
  const list = expenseSummary.value?.availableMonths || [];
  return list.filter((m) => m !== currentMonthStr);
});

const getCategoryConfig = (catName) => {
  return EXPENSE_CATEGORIES.find(c => c.value === catName) || {
    label: catName,
    icon: 'heroicons:tag',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200'
  };
};

const getPaymentMethodConfig = (method) => {
  const map = {
    cash: { label: 'Nakit', icon: '💵' },
    transfer: { label: 'Havale/EFT', icon: '🏦' },
    card: { label: 'Kredi Kartı', icon: '💳' }
  };
  return map[method] || { label: method, icon: '💰' };
};

const formatMonthLabel = (mStr) => {
  if (!mStr || mStr === 'all') return 'Genel Kasa (Tüm Zamanlar)';
  try {
    const [year, month] = mStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  } catch {
    return mStr;
  }
};

const onMonthChange = () => {
  currentPage.value = 1;
  loadExpenses();
  loadLedger(1);
};

const prevMonth = () => {
  if (selectedMonth.value === 'all') {
    selectedMonth.value = currentMonthStr;
    onMonthChange();
    return;
  }
  const [y, m] = selectedMonth.value.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  selectedMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  onMonthChange();
};

const nextMonth = () => {
  if (selectedMonth.value === 'all') {
    selectedMonth.value = currentMonthStr;
    onMonthChange();
    return;
  }
  const [y, m] = selectedMonth.value.split('-').map(Number);
  const d = new Date(y, m, 1);
  selectedMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  onMonthChange();
};

const setMonth = (mStr) => {
  selectedMonth.value = mStr;
  onMonthChange();
};

const goToMonthDetails = (mStr) => {
  selectedMonth.value = mStr;
  activeMainTab.value = 'expenses';
  onMonthChange();
};

const loadExpenses = async () => {
  try {
    isExpensesLoading.value = true;
    const res = await $fetch('/api/expenses', {
      params: {
        month: selectedMonth.value,
        year: selectedYear.value,
        category: selectedExpenseCategory.value,
        search: expenseSearchQuery.value.trim()
      }
    });

    if (res) {
      expensesList.value = res.expenses || [];
      expenseSummary.value = res.summary || {};
      yearlyReport.value = res.yearlyReport || null;
    }
  } catch (error) {
    console.error('Giderler yüklenirken hata:', error);
  } finally {
    isExpensesLoading.value = false;
  }
};

let expenseSearchTimeout = null;
const debounceExpenseSearch = () => {
  clearTimeout(expenseSearchTimeout);
  expenseSearchTimeout = setTimeout(() => {
    loadExpenses();
  }, 300);
};

const openExpenseModal = (item) => {
  if (item) {
    editingExpenseId.value = item._id;
    expenseForm.value = {
      category: item.category,
      amount: item.amount,
      paymentMethod: item.paymentMethod || 'cash',
      date: item.date || todayStr(),
      description: item.description || '',
      isRecurring: Boolean(item.isRecurring),
      recurringDay: item.recurringDay || 1
    };
  } else {
    editingExpenseId.value = null;
    expenseForm.value = {
      ...defaultExpenseForm,
      date: todayStr()
    };
  }
  isExpenseModalOpen.value = true;
};

const saveExpense = async () => {
  if (!expenseForm.value.category || !expenseForm.value.amount || !expenseForm.value.description) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen kategori, tutar ve açıklama alanlarını doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSaving.value = true;
    const payload = {
      category: expenseForm.value.category,
      amount: expenseForm.value.amount,
      paymentMethod: expenseForm.value.paymentMethod,
      date: expenseForm.value.date,
      description: expenseForm.value.description,
      isRecurring: Boolean(expenseForm.value.isRecurring),
      recurringDay: expenseForm.value.isRecurring
        ? (parseInt(expenseForm.value.recurringDay, 10) || 1)
        : 1
    };

    if (editingExpenseId.value) {
      await $fetch(`/api/expenses/${editingExpenseId.value}`, {
        method: 'PUT',
        body: payload
      });
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Klinik gideri başarıyla güncellendi.', type: 'success' }
      }));
    } else {
      await $fetch('/api/expenses', {
        method: 'POST',
        body: payload
      });
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Yeni klinik gideri başarıyla kaydedildi.', type: 'success' }
      }));
    }

    isExpenseModalOpen.value = false;
    await loadExpenses();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Gider kaydedilirken hata oluştu.', type: 'error' }
    }));
  } finally {
    isSaving.value = false;
  }
};

const deleteExpense = async (id) => {
  if (!confirm('Bu klinik gider kaydını silmek istediğinize emin misiniz?')) return;
  try {
    await $fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    });
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Gider kaydı silindi.', type: 'success' }
    }));
    await loadExpenses();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Gider silinemedi.', type: 'error' }
    }));
  }
};

const switchMainTab = (tab) => {
  activeMainTab.value = tab;
  if (tab === 'expenses' || tab === 'yearly') {
    loadExpenses();
  } else {
    loadAll();
  }
};

// =========================================================================
// CARİ HAREKETLER & TAHSİLATLAR STATE (MEVCUT YAPI KORUNDU)
// =========================================================================
const stats = ref(null);
const patients = ref([]);
const doctors = ref([]);
const debtorPatients = ref([]);
const isDebtorsLoading = ref(false);
const debtorSortBy = ref('newest');
const ledgerSortBy = ref('newest');
const searchQuery = ref('');
const isLoading = ref(false);
const isSaving = ref(false);
const isPaymentModalOpen = ref(false);
const isTreatmentModalOpen = ref(false);
const editingPaymentId = ref(null);
const editingTreatmentId = ref(null);
const currentPage = ref(1);
const pageSize = ref(30);

// Hatırlatıcı Modal Durumları
const isReminderModalOpen = ref(false);
const reminderInitialPatientId = ref('');
const reminderInitialPatientName = ref('');
const reminderInitialPatientPhone = ref('');
const reminderInitialNote = ref('');
const reminderInitialCategory = ref('payment');

const openNewReminder = () => {
  reminderInitialPatientId.value = '';
  reminderInitialPatientName.value = '';
  reminderInitialPatientPhone.value = '';
  reminderInitialNote.value = '';
  reminderInitialCategory.value = 'payment';
  isReminderModalOpen.value = true;
};

const openReminderForDebtor = (d) => {
  reminderInitialPatientId.value = d._id;
  reminderInitialPatientName.value = `${d.firstName || ''} ${d.lastName || ''}`.trim();
  reminderInitialPatientPhone.value = d.phone || '';
  const debtFormatted = formatCurrency(d.debt);
  reminderInitialNote.value = `${debtFormatted} ödeme takibi`;
  reminderInitialCategory.value = 'payment';
  isReminderModalOpen.value = true;
};

const ledgerItems = ref([]);
const ledgerTotalCount = ref(0);
const ledgerTotalPages = ref(1);

const loadDoctors = async () => {
  try {
    const data = await $fetch('/api/doctors');
    const filtered = (data || []).filter(d => !d.name?.toLowerCase().includes('klinik') && d.username !== 'klinik');
    filtered.sort((a, b) => {
      const aIsSelman = a.name?.toLowerCase().includes('selman') || a.username === 'dtselo' || a.name?.toLowerCase().includes('muhammed');
      const bIsSelman = b.name?.toLowerCase().includes('selman') || b.username === 'dtselo' || b.name?.toLowerCase().includes('muhammed');
      if (aIsSelman && !bIsSelman) return -1;
      if (!aIsSelman && bIsSelman) return 1;
      return 0;
    });
    doctors.value = filtered;
  } catch (err) {
    console.error(err);
  }
};

const getDocRate = (doctorId) => {
  const doc = doctors.value.find(d => d._id === doctorId);
  return doc?.rate !== undefined ? doc.rate : 30;
};

const getDoctorName = (doctorId) => {
  if (!doctorId) return '';
  const idStr = typeof doctorId === 'object' ? (doctorId._id || '') : String(doctorId);
  const doc = doctors.value.find(d => String(d._id) === idStr);
  return doc?.name || (typeof doctorId === 'object' ? doctorId.name : '');
};

const getDefaultDoctorId = () => {
  const selmanDoc = doctors.value.find(d => 
    d.name?.toLowerCase().includes('selman') || 
    d.username === 'dtselo' || 
    d.name?.toLowerCase().includes('muhammed')
  );
  if (selmanDoc && selmanDoc._id) return String(selmanDoc._id);
  return doctors.value[0]?._id ? String(doctors.value[0]._id) : '';
};

const defaultForm = {
  patientId: '',
  amount: 0,
  method: 'cash',
  date: todayStr(),
  notes: '',
  doctorId: ''
};
const form = ref({ ...defaultForm });

const defaultTreatmentForm = {
  patientId: '',
  procedure: '',
  tooth: '',
  fee: 0,
  date: todayStr(),
  notes: '',
  doctorId: ''
};
const treatmentForm = ref({ ...defaultTreatmentForm });

const loadStats = async () => {
  try {
    const data = await $fetch('/api/stats');
    if (data) stats.value = data;
  } catch (error) {
    console.error(error);
  }
};

const loadDebtors = async () => {
  try {
    isDebtorsLoading.value = true;
    const res = await $fetch('/api/payments/debtors', { params: { sortBy: debtorSortBy.value } });
    if (res) {
      debtorPatients.value = res.debtors || [];
      if (stats.value && res.totalDebt !== undefined) {
        stats.value.totalDebt = res.totalDebt;
        stats.value.debtorsCount = res.totalCount;
      }
    }
  } catch (error) {
    console.error('Borçlu hastalar yüklenemedi:', error);
  } finally {
    isDebtorsLoading.value = false;
  }
};

const onDebtorSortChange = () => {
  currentPage.value = 1;
  loadDebtors();
};

const onLedgerSortChange = () => {
  currentPage.value = 1;
  loadLedger(1);
};

const loadLedger = async (page = currentPage.value) => {
  const q = searchQuery.value.trim();

  try {
    isLoading.value = true;
    const res = await $fetch('/api/payments', {
      params: {
        page,
        limit: pageSize.value,
        type: activeFilter.value === 'all' ? 'all' : activeFilter.value,
        sortBy: ledgerSortBy.value,
        q,
        month: selectedMonth.value,
        stats: stats.value ? 'false' : 'true'
      }
    });

    if (res && res.items) {
      ledgerItems.value = res.items;
      ledgerTotalCount.value = res.total || 0;
      ledgerTotalPages.value = res.totalPages || 1;
      if (res.stats) {
        stats.value = res.stats;
      }
    } else if (Array.isArray(res)) {
      ledgerItems.value = res;
      ledgerTotalCount.value = res.length;
      ledgerTotalPages.value = Math.max(1, Math.ceil(res.length / pageSize.value));
    }
  } catch (error) {
    console.error('Cari hareketler yüklenemedi:', error);
  } finally {
    isLoading.value = false;
  }
};

const loadPatients = async () => {
  try {
    if (patients.value.length > 0) return;
    const res = await $fetch('/api/patients', { params: { limit: 50 } });
    patients.value = Array.isArray(res) ? res : (res?.patients || []);
  } catch (error) {
    console.error(error);
  }
};

const loadAll = async () => {
  isLoading.value = true;
  try {
    const tasks = [loadStats(), loadLedger(currentPage.value), loadDoctors(), loadExpenses()];
    if (activeFilter.value === 'debt') {
      tasks.push(loadDebtors());
    }
    await Promise.allSettled(tasks);
  } finally {
    isLoading.value = false;
  }
};

const activeFilter = ref('all');

const setFilter = (filterType) => {
  currentPage.value = 1;
  searchQuery.value = '';
  if (filterType === 'all') {
    activeFilter.value = 'all';
  } else {
    activeFilter.value = activeFilter.value === filterType ? 'all' : filterType;
  }
  if (activeFilter.value === 'debt') {
    if (debtorPatients.value.length === 0) {
      loadDebtors();
    }
  } else {
    loadLedger(1);
  }
};

const filteredDebtorPatients = computed(() => {
  let list = debtorPatients.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    const cleanQ = q.replace(/\D/g, '');
    list = list.filter(d => {
      const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
      const phone = (d.phone || '').replace(/\D/g, '');
      const tcNo = d.tcNo || '';
      return fullName.includes(q) || tcNo.includes(q) || (cleanQ && phone.includes(cleanQ));
    });
  }

  const sorted = [...list];
  if (debtorSortBy.value === 'oldest') {
    sorted.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  } else if (debtorSortBy.value === 'debt_desc') {
    sorted.sort((a, b) => b.debt - a.debt);
  } else if (debtorSortBy.value === 'name_asc') {
    sorted.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr'));
  } else {
    sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  return sorted;
});

const paginatedDebtorPatients = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredDebtorPatients.value.slice(start, start + pageSize.value);
});

const totalPagesCount = computed(() => {
  if (activeFilter.value === 'debt') {
    return Math.max(1, Math.ceil(filteredDebtorPatients.value.length / pageSize.value));
  }
  return ledgerTotalPages.value;
});

const goToPage = (page) => {
  if (page < 1 || page > totalPagesCount.value) return;
  currentPage.value = page;
  if (activeFilter.value !== 'debt') {
    loadLedger(page);
  }
};

let searchTimeout = null;
const onSearchInput = () => {
  currentPage.value = 1;
  clearTimeout(searchTimeout);
  if (activeFilter.value !== 'debt') {
    searchTimeout = setTimeout(() => {
      loadLedger(1);
    }, 300);
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
  if (activeFilter.value !== 'debt') {
    loadLedger(1);
  }
};

const openPaymentModalForPatient = async (debtor) => {
  editingPaymentId.value = null;
  await Promise.all([loadPatients(), loadDoctors()]);
  form.value = {
    ...defaultForm,
    patientId: debtor._id,
    amount: debtor.debt,
    doctorId: getDefaultDoctorId(),
    notes: `Kalan borç tahsilatı (Toplam Borç: ${debtor.debt} TL)`
  };
  isPaymentModalOpen.value = true;
};

const openPaymentModal = async () => {
  editingPaymentId.value = null;
  await Promise.all([loadPatients(), loadDoctors()]);
  form.value = {
    ...defaultForm,
    doctorId: getDefaultDoctorId()
  };
  isPaymentModalOpen.value = true;
};

const openEditModal = async (item) => {
  await Promise.all([loadPatients(), loadDoctors()]);
  const patientIdVal = item.patientId && typeof item.patientId === 'object'
    ? item.patientId._id
    : (item.patientId || '');

  const doctorIdVal = item.doctorId && typeof item.doctorId === 'object'
    ? String(item.doctorId._id || '')
    : (item.doctorId ? String(item.doctorId) : getDefaultDoctorId());

  if (item.type === 'payment') {
    editingPaymentId.value = item.id;
    form.value = {
      patientId: patientIdVal,
      amount: item.amount,
      method: item.method || 'cash',
      date: item.date || todayStr(),
      notes: item.notes || '',
      doctorId: doctorIdVal
    };
    isPaymentModalOpen.value = true;
  } else if (item.type === 'treatment') {
    editingTreatmentId.value = item.id;
    treatmentForm.value = {
      patientId: patientIdVal,
      procedure: item.description || '',
      tooth: item.tooth || '',
      fee: item.amount || 0,
      date: item.date || todayStr(),
      notes: item.notes || '',
      doctorId: doctorIdVal
    };
    isTreatmentModalOpen.value = true;
  }
};

const savePayment = async () => {
  if (!form.value.patientId || !form.value.amount || !form.value.method) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen zorunlu alanları doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSaving.value = true;
    if (editingPaymentId.value) {
      const targetId = editingPaymentId.value;
      await $fetch(`/api/payments/${targetId}`, {
        method: 'PUT',
        body: form.value
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Ödeme tahsilatı başarıyla güncellendi.', type: 'success' }
      }));
    } else {
      await $fetch('/api/payments', {
        method: 'POST',
        body: form.value
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Ödeme tahsilatı başarıyla kaydedildi.', type: 'success' }
      }));
    }

    isPaymentModalOpen.value = false;
    await Promise.all([loadAll(), loadExpenses()]);
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'İşlem sırasında hata oluştu.', type: 'error' }
    }));
  } finally {
    isSaving.value = false;
  }
};

const saveTreatment = async () => {
  if (!treatmentForm.value.patientId || !treatmentForm.value.procedure || treatmentForm.value.fee == null) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen zorunlu alanları doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSaving.value = true;
    const targetId = editingTreatmentId.value;

    await $fetch(`/api/treatments/${targetId}`, {
      method: 'PUT',
      body: treatmentForm.value
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Tedavi işlemi başarıyla güncellendi.', type: 'success' }
    }));

    isTreatmentModalOpen.value = false;
    await loadAll();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Tedavi güncellenirken hata oluştu.', type: 'error' }
    }));
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (item) => {
  const patientName = item.patientId ? `${item.patientId.firstName} ${item.patientId.lastName}` : 'Hasta';
  const confirmText = `${patientName} isimli hastaya ait "${item.description}" cari hareketini silmek istediğinize emin misiniz?`;
  if (window.confirm(confirmText)) {
    deleteLedgerItem(item);
  }
};

const deleteLedgerItem = async (item) => {
  try {
    const isTreatment = item.type === 'treatment';
    const endpoint = isTreatment ? `/api/treatments/${item.id}` : `/api/payments/${item.id}`;

    await $fetch(endpoint, {
      method: 'DELETE'
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Cari işlem silindi.', type: 'success' }
    }));

    await loadAll();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Silme işlemi sırasında hata oluştu.', type: 'error' }
    }));
  }
};

onMounted(() => {
  loadExpenses();
  loadAll();
});
</script>
