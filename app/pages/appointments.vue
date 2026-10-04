<template>
  <div class="flex flex-col gap-6">
    
    <!-- Üst Başlık ve Yeni Randevu Butonu -->
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
          <span>Randevu Takvimi</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-900/40">
            {{ appointments.length }} Randevu
          </span>
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Poliklinik randevularını haftalık saat matrisinde, aylık veya liste görünümünde yönetin.
        </p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/15 hover:shadow-teal-600/25 active:scale-95 transition-all duration-150"
      >
        <Icon name="heroicons:plus" class="w-4 h-4 stroke-[2.5]" />
        <span>Yeni Randevu Planla</span>
      </button>
    </div>

    <!-- Takvim Kontrol Çubuğu (Ok Butonları, Dinamik Başlık & Görünüm Seçiciler) -->
    <div class="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      <!-- Sol: Ok Navigasyonu (< Bugün >) ve Dinamik Tarih Başlığı -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Ok Navigasyon Grubu -->
        <div class="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
          <button
            @click="goPrevious"
            class="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all active:scale-95"
            :title="getNavTooltip('prev')"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4 stroke-[2.5]" />
          </button>
          
          <button
            @click="goToday"
            class="px-3 py-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
          >
            Bugün
          </button>
          
          <button
            @click="goNext"
            class="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all active:scale-95"
            :title="getNavTooltip('next')"
          >
            <Icon name="heroicons:chevron-right" class="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <!-- Dinamik Başlık & Aylık Hızlı Menü -->
        <div class="flex items-center gap-2">
          <!-- Aylık modda açılır ay & yıl seçicileri -->
          <template v-if="viewMode === 'month'">
            <div class="flex items-center gap-1.5">
              <select
                :value="currentDate.getMonth()"
                @change="onMonthSelect(Number($event.target.value))"
                class="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option v-for="(mName, mIdx) in MONTH_NAMES" :key="mIdx" :value="mIdx">
                  {{ mName }}
                </option>
              </select>

              <select
                :value="currentDate.getFullYear()"
                @change="onYearSelect(Number($event.target.value))"
                class="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option v-for="yr in yearRange" :key="yr" :value="yr">{{ yr }}</option>
              </select>
            </div>
          </template>

          <!-- Haftalık veya Günlük Başlık -->
          <template v-else>
            <h3 class="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Icon name="heroicons:calendar" class="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{{ calendarTitle }}</span>
            </h3>
          </template>
        </div>
      </div>

      <!-- Sağ: Hekim Filtresi & Görünüm Seçici Sekmeleri -->
      <div class="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
        <!-- Hekim Filtresi -->
        <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
          <Icon name="heroicons:user-circle" class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <select
            v-model="selectedDoctorFilter"
            @change="loadAppointments"
            class="bg-transparent border-0 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="all" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Tüm Hekimler (Ortak)</option>
            <option v-for="doc in doctorsList" :key="doc._id" :value="doc._id" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
              {{ doc.name }}
            </option>
          </select>
        </div>

        <div class="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 w-full sm:w-auto">
          <button
            @click="switchView('week')"
            :class="viewMode === 'week'
              ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 font-bold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'"
            class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Icon name="heroicons:view-columns" class="w-4 h-4" />
            <span>Haftalık</span>
          </button>
          
          <button
            @click="switchView('month')"
            :class="viewMode === 'month'
              ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 font-bold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'"
            class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Icon name="heroicons:squares-2x2" class="w-4 h-4" />
            <span>Aylık</span>
          </button>

          <button
            @click="switchView('day')"
            :class="viewMode === 'day'
              ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 font-bold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'"
            class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Icon name="heroicons:clock" class="w-4 h-4" />
            <span>Günlük</span>
          </button>

          <button
            @click="switchView('list')"
            :class="viewMode === 'list'
              ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 font-bold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'"
            class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Icon name="heroicons:list-bullet" class="w-4 h-4" />
            <span>Liste</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 1. GÖRÜNÜM: HAFTALIK ZAMAN MATRİSİ (WEEKLY TIME-GRID) -->
    <!-- ======================================================== -->
    <div v-if="viewMode === 'week'" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <!-- Bilgilendirme / İpucu Şeridi -->
      <div class="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:information-circle" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Boş bir saat dilimine tıklayarak doğrudan randevu oluşturabilir, mevcut randevuya tıklayarak düzenleyebilirsiniz.</span>
        </div>
        <span class="hidden sm:inline font-mono">Pzt - Paz (08:00 - 20:00)</span>
      </div>

      <!-- Kaydırılabilir Tablo Konteyneri (Mobil Dostu) -->
      <div class="overflow-x-auto">
        <div class="min-w-[800px] select-none">
          <!-- Gün Sütun Başlıkları -->
          <div class="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 sticky top-0 z-10">
            <!-- Saat Sütunu Başlığı -->
            <div class="p-3 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800 flex items-center justify-center">
              Saat
            </div>
            <!-- 7 Gün Sütunu -->
            <div
              v-for="day in currentWeekDays"
              :key="day.date"
              :class="[
                'p-3 text-center border-r last:border-r-0 border-slate-100 dark:border-slate-800 transition-colors',
                day.isToday ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
              ]"
            >
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {{ day.dayName }}
              </div>
              <div class="mt-1 flex items-center justify-center">
                <span
                  :class="[
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-all',
                    day.isToday
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-800 dark:text-slate-200'
                  ]"
                >
                  {{ day.dayNumber }}
                </span>
              </div>
            </div>
          </div>

          <!-- Yükleniyor Göstergesi -->
          <div v-if="isLoading" class="p-16 text-center text-slate-400">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-teal-600 inline-block mb-3" />
            <div class="text-sm font-medium">Haftalık randevular yükleniyor...</div>
          </div>

          <!-- Saat Satırları Matrisi -->
          <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
            <div
              v-for="hour in HOURS"
              :key="hour"
              class="grid grid-cols-8 min-h-[72px]"
            >
              <!-- Saat Etiketi -->
              <div class="p-2 text-center text-xs font-mono font-bold text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800 flex items-start justify-center pt-2.5">
                {{ hour }}
              </div>

              <!-- Gün Hücreleri -->
              <div
                v-for="day in currentWeekDays"
                :key="day.date + '-' + hour"
                @click="onCellClick(day.date, hour)"
                :class="[
                  'p-1.5 border-r last:border-r-0 border-slate-100 dark:border-slate-800 relative group cursor-pointer transition-colors',
                  day.isToday ? 'bg-teal-50/10 dark:bg-teal-950/5' : '',
                  'hover:bg-teal-50/30 dark:hover:bg-teal-950/20'
                ]"
              >
                <!-- Hücredeki Randevular -->
                <div class="space-y-1.5">
                  <div
                    v-for="appt in getAppointmentsForSlot(day.date, hour)"
                    :key="appt._id"
                    @click.stop="openEditModal(appt)"
                    :class="[
                      getAppointmentColorClass(appt.status),
                      'p-2 rounded-xl text-left border shadow-xs transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer block'
                    ]"
                  >
                    <div class="flex items-center justify-between gap-1 mb-1">
                      <span class="text-[11px] font-mono font-extrabold flex items-center gap-1">
                        <Icon name="heroicons:clock" class="w-3 h-3" />
                        {{ appt.time }}
                      </span>
                      <div class="flex items-center gap-1">
                        <NuxtLink
                          v-if="appt.patientId"
                          :to="`/patients/${appt.patientId._id || appt.patientId}`"
                          @click.stop
                          class="p-0.5 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded text-teal-700 dark:text-teal-300 transition-colors"
                          title="Hasta Profiline Git"
                        >
                          <Icon name="heroicons:arrow-top-right-on-square" class="w-3 h-3" />
                        </NuxtLink>
                        <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full border" :class="getStatusBadgeClass(appt.status)">
                          {{ getStatusInfo(appt.status).label }}
                        </span>
                      </div>
                    </div>

                    <!-- Hasta Adı -->
                    <div class="font-bold text-xs truncate text-slate-900 dark:text-white">
                      {{ getPatientDisplay(appt) }}
                    </div>

                    <!-- İşlem & Süre -->
                    <div class="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5 flex items-center gap-1">
                      <span>{{ appt.procedure }}</span>
                      <span class="opacity-40">•</span>
                      <span class="font-mono text-[10px]">{{ appt.duration }}dk</span>
                    </div>

                    <!-- İlgili Hekim -->
                    <div v-if="appt.doctorId?.name" class="mt-1 flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10 dark:bg-teal-950/40 px-1.5 py-0.5 rounded-md truncate border border-teal-500/20">
                      <span>👨‍⚕️ {{ appt.doctorId.name }}</span>
                    </div>
                  </div>
                </div>

                <!-- Boş Hücre Hover Ekle İkonu -->
                <div
                  v-if="getAppointmentsForSlot(day.date, hour).length === 0"
                  class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span class="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded-lg border border-teal-200 dark:border-teal-800 shadow-xs">
                    <Icon name="heroicons:plus" class="w-3 h-3 stroke-[3]" />
                    Ekle
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. GÖRÜNÜM: AYLIK TAKVİM IZGARASI (MONTHLY CALENDAR GRID) -->
    <!-- ======================================================== -->
    <div v-else-if="viewMode === 'month'" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <!-- 7 Gün Sütun Başlıkları -->
      <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-center">
        <div
          v-for="dName in DAY_NAMES_SHORT"
          :key="dName"
          class="py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
        >
          {{ dName }}
        </div>
      </div>

      <!-- Yükleniyor Göstergesi -->
      <div v-if="isLoading" class="p-16 text-center text-slate-400">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-teal-600 inline-block mb-3" />
        <div class="text-sm font-medium">Aylık randevular yükleniyor...</div>
      </div>

      <!-- Gün Kutuları Izgarası -->
      <div v-else class="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
        <div
          v-for="cell in currentMonthGrid"
          :key="cell.date"
          @click="onMonthCellClick(cell.date)"
          :class="[
            'min-h-[105px] sm:min-h-[125px] p-2 sm:p-2.5 transition-colors cursor-pointer group flex flex-col justify-between',
            !cell.isCurrentMonth ? 'bg-slate-50/40 dark:bg-slate-950/20 text-slate-300 dark:text-slate-600' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200',
            cell.isToday ? 'bg-teal-50/30 dark:bg-teal-950/20' : '',
            'hover:bg-teal-50/20 dark:hover:bg-teal-950/30'
          ]"
        >
          <!-- Gün Numarası & Ekle Butonu -->
          <div class="flex items-center justify-between mb-1.5">
            <span
              :class="[
                'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-all',
                cell.isToday
                  ? 'bg-teal-600 text-white shadow-sm'
                  : cell.isCurrentMonth
                    ? 'text-slate-800 dark:text-slate-200 group-hover:text-teal-600'
                    : 'text-slate-400 dark:text-slate-600'
              ]"
            >
              {{ cell.dayNumber }}
            </span>

            <button
              @click.stop="openAddModalWithDateTime(cell.date, '09:00')"
              class="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-opacity"
              title="Bu güne randevu ekle"
            >
              <Icon name="heroicons:plus" class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- O Günün Randevuları -->
          <div class="space-y-1 overflow-hidden flex-1">
            <div
              v-for="appt in getAppointmentsForDay(cell.date).slice(0, 3)"
              :key="appt._id"
              @click.stop="openEditModal(appt)"
              :class="[
                getAppointmentColorClass(appt.status),
                'px-1.5 py-1 rounded-md text-[11px] truncate flex items-center gap-1 border shadow-2xs hover:scale-[1.02] transition-transform cursor-pointer group/item'
              ]"
            >
              <span class="font-mono font-bold text-[10px]">{{ appt.time }}</span>
              <span class="truncate font-semibold">{{ getPatientDisplay(appt) }}</span>
              <NuxtLink
                v-if="appt.patientId"
                :to="`/patients/${appt.patientId._id || appt.patientId}`"
                @click.stop
                class="opacity-0 group-hover/item:opacity-100 hover:text-teal-700 dark:hover:text-teal-300 p-0.5"
                title="Hasta Profiline Git"
              >
                <Icon name="heroicons:arrow-top-right-on-square" class="w-3 h-3" />
              </NuxtLink>
              <span v-if="appt.doctorId?.name" class="text-[9px] text-teal-600 dark:text-teal-400 font-bold shrink-0 ml-auto">👨‍⚕️ {{ appt.doctorId.name }}</span>
            </div>

            <!-- 3'ten Fazla Randevu Varsa Gösterge -->
            <div
              v-if="getAppointmentsForDay(cell.date).length > 3"
              @click.stop="switchToDayView(cell.date)"
              class="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline pt-0.5 block"
            >
              +{{ getAppointmentsForDay(cell.date).length - 3 }} randevu daha
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 3. GÖRÜNÜM: GÜNLÜK & LİSTE GÖRÜNÜMÜ (TABLO / AJANDA)   -->
    <!-- ======================================================== -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <!-- Tablo Başlığı -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-slate-800 dark:text-white text-base uppercase tracking-wider">
            {{ calendarTitle }} Randevuları
          </h3>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-900/40">
            Toplam: {{ appointments.length }}
          </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-950/10 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
              <th class="px-6 py-3.5">Tarih / Saat</th>
              <th class="px-6 py-3.5">Hasta Adı / Telefon</th>
              <th class="px-6 py-3.5">Yapılacak İşlem</th>
              <th class="px-6 py-3.5">İlgili Hekim</th>
              <th class="px-6 py-3.5">Süre</th>
              <th class="px-6 py-3.5">Durum</th>
              <th class="px-6 py-3.5">Notlar</th>
              <th class="px-6 py-3.5 text-right">Eylemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="isLoading">
              <td colspan="8" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin text-teal-600 inline-block mb-2" />
                <div>Randevular yükleniyor...</div>
              </td>
            </tr>
            <tr v-else-if="sortedAppointments.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                Seçili zaman aralığında planlanmış bir randevu bulunmamaktadır.
              </td>
            </tr>
            <tr
              v-else
              v-for="appt in sortedAppointments"
              :key="appt._id"
              class="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-teal-600 dark:text-teal-400 font-sans mb-0.5">
                    {{ formatDateWithDay(appt.date) }}
                  </span>
                  <span class="font-mono font-black text-slate-700 dark:text-slate-300 text-sm">
                    {{ appt.time }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="appt.patientId" class="flex flex-col">
                  <NuxtLink :to="`/patients/${appt.patientId._id}`" class="font-bold text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:underline block text-sm">
                    {{ appt.patientId.firstName }} {{ appt.patientId.lastName }}
                  </NuxtLink>
                  <span class="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-mono">{{ formatPhone(appt.patientId.phone) }}</span>
                </div>
                <div v-else-if="appt.patientName" class="flex flex-col">
                  <span class="font-bold text-slate-800 dark:text-slate-200 block text-sm flex items-center gap-1.5">
                    {{ appt.patientName }}
                    <span class="text-[10px] px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 rounded font-bold">Manuel</span>
                  </span>
                  <span v-if="appt.patientPhone" class="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-mono">{{ formatPhone(appt.patientPhone) }}</span>
                  <span v-else class="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Kayıtsız Hasta</span>
                </div>
                <span v-else class="text-slate-400 dark:text-slate-500 italic text-sm">Kayıtsız Hasta</span>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">
                {{ appt.procedure }}
              </td>
              <td class="px-6 py-4 font-semibold text-teal-700 dark:text-teal-400 text-xs whitespace-nowrap">
                <span v-if="appt.doctorId?.name" class="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg border border-teal-200/60 dark:border-teal-800/60 font-bold">
                  👨‍⚕️ {{ appt.doctorId.name }}
                </span>
                <span v-else class="text-slate-400 italic text-xs">—</span>
              </td>
              <td class="px-6 py-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                {{ appt.duration }} dk
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    getStatusInfo(appt.status).class,
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border'
                  ]"
                >
                  {{ getStatusInfo(appt.status).label }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-400 dark:text-slate-500 italic max-w-xs truncate">
                {{ appt.notes || '—' }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <!-- Yalnızca Bekleyen (pending) Randevularda Hızlı Durum Butonları -->
                  <template v-if="appt.status === 'pending'">
                    <button
                      @click="updateStatus(appt._id, 'completed')"
                      class="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 transition-colors"
                      title="Tamamlandı"
                    >
                      <Icon name="heroicons:check" class="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      @click="updateStatus(appt._id, 'postponed')"
                      class="p-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50 transition-colors"
                      title="Ertele"
                    >
                      <Icon name="heroicons:clock" class="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      @click="updateStatus(appt._id, 'cancelled')"
                      class="p-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg border border-rose-200/50 dark:border-rose-800/50 transition-colors"
                      title="İptal Et"
                    >
                      <Icon name="heroicons:x-mark" class="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </template>
                  <button
                    @click="openEditModal(appt)"
                    class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    title="Randevuyu Düzenle"
                  >
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(appt._id)"
                    class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
    </div>

    <!-- Randevu Ekleme / Düzenleme Modalı -->
    <AppModal
      :isOpen="isModalOpen"
      :title="editingId ? '✏️ Randevuyu Düzenle' : '📅 Yeni Randevu Planla'"
      width="md"
      @close="closeModal"
    >
      <form @submit.prevent="saveAppointment" class="space-y-4">
        <!-- Hasta Adı (Doğrudan Yazılabilir veya Listeden Seçilebilir) -->
        <div class="relative" ref="patientComboboxRef">
          <div class="flex items-center justify-between mb-1">
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400">
              Hasta Adı <span class="text-rose-500">*</span>
            </label>
            <div class="flex items-center gap-2">
              <span v-if="form.patientId" class="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                <Icon name="heroicons:check-circle" class="w-3.5 h-3.5" />
                Kayıtlı Hasta
              </span>
            </div>
          </div>

          <div class="relative">
            <input
              v-model="patientInput"
              @focus="isDropdownOpen = true"
              @input="onPatientInput"
              type="text"
              placeholder="Hasta adı yazın veya listeden seçin..."
              required
              autocomplete="off"
              class="w-full px-3 py-2 pr-14 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
            <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
              <button
                v-if="patientInput"
                type="button"
                @click="clearPatientInput"
                class="p-0.5 hover:text-slate-600 dark:hover:text-slate-200"
                title="Temizle"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </button>
              <button
                type="button"
                @click="isDropdownOpen = !isDropdownOpen"
                class="p-0.5 hover:text-slate-600 dark:hover:text-slate-200"
                tabindex="-1"
                title="Kayıtlı Hastaları Göster"
              >
                <Icon name="heroicons:chevron-down" class="w-4 h-4 transition-transform duration-150" :class="{ 'rotate-180': isDropdownOpen }" />
              </button>
            </div>
          </div>

          <!-- Kayıtlı Hasta Öneri / Seçim Listesi -->
          <div
            v-if="isDropdownOpen && (filteredPatients.length > 0 || isSearchingPatients || patientInput.trim() || form.patientId)"
            class="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-700/60"
          >
            <!-- Arama Sürüyor İndikatörü -->
            <div v-if="isSearchingPatients" class="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
              <span>Veritabanında aranıyor...</span>
            </div>

            <!-- Eşleşen Hastalar -->
            <template v-if="filteredPatients.length > 0">
              <div
                v-for="p in filteredPatients"
                :key="p._id"
                @mousedown.prevent="selectPatient(p)"
                class="px-3.5 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                    {{ p.firstName }} {{ p.lastName }}
                  </span>
                  <span class="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {{ p.phone ? formatPhone(p.phone) : 'Telefon yok' }}
                  </span>
                </div>
                <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium">
                  Kayıtlı
                </span>
              </div>
            </template>

            <!-- Eşleşen Kayıt Bulunamadı (Yalnızca kayıtlı hasta seçili değilse ve arama boşsa) -->
            <div v-else-if="!form.patientId && !isSearchingPatients && patientInput.trim() && filteredPatients.length === 0" class="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">
              Kayıtlı hasta bulunamadı. Randevu serbest isimle ("{{ patientInput.trim() }}") oluşturulabilir.
            </div>

            <!-- Kayıtlı Hasta Bilgi Satırı -->
            <div v-else-if="form.patientId" class="px-4 py-3 text-xs text-teal-600 dark:text-teal-400 flex items-center justify-between bg-teal-50/50 dark:bg-teal-950/20">
              <span class="flex items-center gap-1.5 font-medium">
                <Icon name="heroicons:check-circle" class="w-4 h-4 text-teal-500 shrink-0" />
                <span>Kayıtlı hasta seçili: <strong>{{ patientInput }}</strong></span>
              </span>
              <NuxtLink
                :to="`/patients/${form.patientId}`"
                target="_blank"
                class="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                Profili Aç ↗
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- İsteğe Bağlı İletişim Telefonu -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            İletişim Telefonu <span class="text-xs font-normal text-slate-400">(İsteğe bağlı)</span>
          </label>
          <input
            v-model="form.patientPhone"
            type="tel"
            placeholder="05XX XXX XX XX"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>

        <!-- Yapılacak İşlem -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Yapılacak İşlem <span class="text-rose-500">*</span></label>
          <select
            v-model="form.procedure"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          >
            <option value="" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Yapılacak işlemi seçin...</option>
            <option v-for="proc in PROCEDURES" :key="proc" :value="proc" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">{{ proc }}</option>
          </select>
        </div>

        <!-- Tarih & Saat -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Tarih <span class="text-rose-500">*</span></label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Saat <span class="text-rose-500">*</span></label>
            <input
              v-model="form.time"
              type="time"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <!-- İlgili Hekim Seçimi -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            İlgili Hekim <span class="text-rose-500">*</span>
          </label>
          <select
            v-model="form.doctorId"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option v-for="doc in doctorsList" :key="doc._id" :value="doc._id">
              {{ doc.name }} ({{ doc.title || 'Diş Hekimi' }})
            </option>
          </select>
        </div>

        <!-- Randevu Süresi -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Süresi (Dakika)</label>
          <select
            v-model.number="form.duration"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          >
            <option :value="15" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">15 Dakika (Hızlı Muayene)</option>
            <option :value="30" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">30 Dakika (Normal Seans)</option>
            <option :value="45" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">45 Dakika</option>
            <option :value="60" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">60 Dakika (Dolgu, Kanal vb.)</option>
            <option :value="90" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">90 Dakika (Kapsamlı Cerrahi)</option>
          </select>
        </div>

        <!-- Randevu Durumu (Yalnızca Düzenleme Modunda) -->
        <div v-if="editingId">
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Randevu Durumu</label>
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          >
            <option value="pending">Bekliyor (pending)</option>
            <option value="completed">Tamamlandı (completed)</option>
            <option value="postponed">Ertelendi (postponed)</option>
            <option value="cancelled">İptal Edildi (cancelled)</option>
            <option value="noshow">Gelmedi (noshow)</option>
          </select>
        </div>

        <!-- Klinik Notlar -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Randevu Notları</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Hasta şikayetleri veya hekime ön uyarılar..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <NuxtLink
          v-if="form.patientId"
          :to="`/patients/${form.patientId}`"
          target="_blank"
          class="mr-auto px-3.5 py-2 text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          title="Hasta profilini yeni sekmede aç"
        >
          <Icon name="heroicons:user" class="w-4 h-4" />
          <span>Hasta Profiline Git</span>
          <Icon name="heroicons:arrow-top-right-on-square" class="w-3.5 h-3.5" />
        </NuxtLink>
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="saveAppointment"
          :disabled="isSaving"
          class="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Icon v-if="isSaving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>{{ isSaving ? 'Kaydediliyor...' : (editingId ? 'Değişiklikleri Kaydet' : 'Randevu Planla') }}</span>
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useUtils } from '~/composables/useUtils';
import { useAuth } from '~/composables/useAuth';

const {
  formatDate,
  formatDateLong,
  formatPhone,
  getStatusInfo,
  PROCEDURES,
  todayStr
} = useUtils();

const { currentDoctor } = useAuth();

const doctorsList = ref([]);
const selectedDoctorFilter = ref('all');

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const DAY_NAMES_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz'];

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

// Yıl seçim aralığı
const currentYearNum = new Date().getFullYear();
const yearRange = [currentYearNum - 1, currentYearNum, currentYearNum + 1, currentYearNum + 2];

// Görünüm Modu ve Tarih Odağı
const viewMode = ref('week'); // 'week' | 'month' | 'day' | 'list'
const currentDate = ref(new Date());

const appointments = ref([]);
const patients = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isModalOpen = ref(false);
const editingId = ref(null);

// Hasta Arama / Combobox
const patientComboboxRef = ref(null);
const isDropdownOpen = ref(false);
const patientInput = ref('');

const defaultForm = {
  patientId: '',
  patientName: '',
  patientPhone: '',
  procedure: '',
  date: todayStr(),
  time: '09:00',
  duration: 30,
  status: 'pending',
  notes: '',
  doctorId: ''
};
const form = ref({ ...defaultForm });

// Tarih Formatlama Yardımcıları
const pad = (n) => String(n).padStart(2, '0');
const formatYMD = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Yapay zeka asistanının ekrandaki aktif takvim gününü bilmesi için pencere değişkenini senkronize et
watch(currentDate, (val) => {
  if (typeof window !== 'undefined' && val) {
    window.__activeCalendarDate = formatYMD(val);
  }
}, { immediate: true });

// Haftanın Günleri (Pazartesi - Pazar)
const currentWeekDays = computed(() => {
  const d = new Date(currentDate.value);
  const day = d.getDay(); // 0: Pazar, 1: Pazartesi
  const diffToMonday = (day === 0 ? -6 : 1) - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const ymd = formatYMD(cur);
    days.push({
      date: ymd,
      dayName: DAY_NAMES_SHORT[i],
      dayFullName: DAY_NAMES[i],
      dayNumber: cur.getDate(),
      isToday: ymd === todayStr(),
      monthName: MONTH_NAMES[cur.getMonth()],
      fullDate: cur
    });
  }
  return days;
});

// Ay Izgarası (Pazartesi Başlangıçlı 35 veya 42 Gün Hücresi)
const currentMonthGrid = computed(() => {
  const d = currentDate.value;
  const year = d.getFullYear();
  const month = d.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 0 = Pzt, 6 = Paz
  const startDayIdx = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  // Önceki ayın taşan günleri
  for (let i = startDayIdx - 1; i >= 0; i--) {
    const cellDate = new Date(year, month - 1, prevMonthLastDay - i);
    const ymd = formatYMD(cellDate);
    cells.push({
      date: ymd,
      dayNumber: cellDate.getDate(),
      isCurrentMonth: false,
      isToday: ymd === todayStr()
    });
  }

  // Bu ayın günleri
  for (let i = 1; i <= daysInMonth; i++) {
    const cellDate = new Date(year, month, i);
    const ymd = formatYMD(cellDate);
    cells.push({
      date: ymd,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: ymd === todayStr()
    });
  }

  // Sonraki ayın günleri (Tam haftaya tamamlama)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const cellDate = new Date(year, month + 1, i);
    const ymd = formatYMD(cellDate);
    cells.push({
      date: ymd,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: ymd === todayStr()
    });
  }

  return cells;
});

// Dinamik Takvim Başlığı
const calendarTitle = computed(() => {
  const d = currentDate.value;
  if (viewMode.value === 'day') {
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  }
  if (viewMode.value === 'week' || viewMode.value === 'list') {
    const days = currentWeekDays.value;
    const start = days[0];
    const end = days[6];
    if (start.fullDate.getMonth() === end.fullDate.getMonth()) {
      return `${start.dayNumber} – ${end.dayNumber} ${start.monthName} ${start.fullDate.getFullYear()}`;
    } else {
      return `${start.dayNumber} ${start.monthName} – ${end.dayNumber} ${end.monthName} ${end.fullDate.getFullYear()}`;
    }
  }
  if (viewMode.value === 'month') {
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }
  return '';
});

// Tarihe ve saate göre sıralı randevular
const sortedAppointments = computed(() => {
  return [...appointments.value].sort((a, b) => {
    const dateComp = (a.date || '').localeCompare(b.date || '');
    if (dateComp !== 0) return dateComp;
    return (a.time || '').localeCompare(b.time || '');
  });
});

// Haftalık Görünüm İçin Saat Dilimindeki Randevuları Bulur
const getAppointmentsForSlot = (dateStr, hourStr) => {
  const targetH = parseInt(hourStr.split(':')[0], 10);
  return appointments.value.filter((appt) => {
    if (appt.date !== dateStr) return false;
    const apptH = parseInt((appt.time || '00:00').split(':')[0], 10);
    return apptH === targetH;
  });
};

// Aylık Görünüm İçin Belirli Günün Randevularını Bulur
const getAppointmentsForDay = (dateStr) => {
  return appointments.value.filter((appt) => appt.date === dateStr);
};

// Hasta Adı Görüntüleme
const getPatientDisplay = (appt) => {
  if (appt.patientId && typeof appt.patientId === 'object') {
    return `${appt.patientId.firstName || ''} ${appt.patientId.lastName || ''}`.trim();
  }
  return appt.patientName || 'Kayıtsız Hasta';
};

// Durum Renk Stilleri
const getAppointmentColorClass = (status) => {
  if (status === 'completed') {
    return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60';
  }
  if (status === 'cancelled') {
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800/60';
  }
  if (status === 'noshow') {
    return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/60';
  }
  if (status === 'postponed') {
    return 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800/60';
  }
  return 'bg-teal-50/90 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 border-teal-200 dark:border-teal-800/60';
};

const getStatusBadgeClass = (status) => {
  if (status === 'completed') return 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  if (status === 'cancelled') return 'bg-rose-100/80 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
  if (status === 'noshow') return 'bg-amber-100/80 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  if (status === 'postponed') return 'bg-purple-100/80 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800';
  return 'bg-teal-100/80 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800';
};

const formatDateWithDay = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });
  } catch {
    return dateStr;
  }
};

// Navigasyon Tooltip Metinleri
const getNavTooltip = (dir) => {
  const isPrev = dir === 'prev';
  if (viewMode.value === 'day') return isPrev ? 'Önceki Gün' : 'Sonraki Gün';
  if (viewMode.value === 'week' || viewMode.value === 'list') return isPrev ? 'Önceki Hafta' : 'Sonraki Hafta';
  return isPrev ? 'Önceki Ay' : 'Sonraki Ay';
};

// Navigasyon Eylemleri
const goPrevious = () => {
  const d = new Date(currentDate.value);
  if (viewMode.value === 'day') {
    d.setDate(d.getDate() - 1);
  } else if (viewMode.value === 'week' || viewMode.value === 'list') {
    d.setDate(d.getDate() - 7);
  } else if (viewMode.value === 'month') {
    d.setMonth(d.getMonth() - 1);
  }
  currentDate.value = d;
  loadAppointments();
};

const goNext = () => {
  const d = new Date(currentDate.value);
  if (viewMode.value === 'day') {
    d.setDate(d.getDate() + 1);
  } else if (viewMode.value === 'week' || viewMode.value === 'list') {
    d.setDate(d.getDate() + 7);
  } else if (viewMode.value === 'month') {
    d.setMonth(d.getMonth() + 1);
  }
  currentDate.value = d;
  loadAppointments();
};

const goToday = () => {
  currentDate.value = new Date();
  loadAppointments();
};

const onMonthSelect = (monthIdx) => {
  const d = new Date(currentDate.value);
  d.setMonth(monthIdx);
  currentDate.value = d;
  loadAppointments();
};

const onYearSelect = (yearNum) => {
  const d = new Date(currentDate.value);
  d.setFullYear(yearNum);
  currentDate.value = d;
  loadAppointments();
};

const switchView = (mode) => {
  viewMode.value = mode;
  loadAppointments();
};

const switchToDayView = (dateStr) => {
  currentDate.value = new Date(dateStr + 'T00:00:00');
  viewMode.value = 'day';
  loadAppointments();
};

// Hücre Tıklama Eylemleri
const onCellClick = (dateStr, hourStr) => {
  openAddModalWithDateTime(dateStr, hourStr);
};

const onMonthCellClick = (dateStr) => {
  // Kullanıcı hücreye tıkladığında günün randevularına hızlıca randevu ekler
  openAddModalWithDateTime(dateStr, '09:00');
};

// Varsayılan hekim olarak Muhammed Selman Yılmaz'ı seç (aksi belirtilmedikçe / değiştirilmedikçe)
const getPreferredDoctorId = () => {
  const selman = doctorsList.value.find(d => 
    d.name?.toLowerCase().includes('selman') || 
    d.name?.toLowerCase().includes('muhammed')
  );
  if (selman) return selman._id;
  if (currentDoctor.value?.id && !currentDoctor.value.username?.toLowerCase().includes('klinik')) {
    return currentDoctor.value.id;
  }
  return doctorsList.value[0]?._id || '';
};

// Hekimleri API'den Çek (Klinik hariç gerçek hekimler)
const loadDoctors = async () => {
  try {
    if (process.client) {
      const cached = localStorage.getItem('tenax_doctors_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        doctorsList.value = parsed.filter(d => !d.name?.toLowerCase().includes('klinik') && d.username !== 'klinik');
      }
    }
    const data = await $fetch('/api/doctors', { timeout: 4000 });
    if (data && Array.isArray(data)) {
      const filtered = data.filter(d => !d.name?.toLowerCase().includes('klinik') && d.username !== 'klinik');
      doctorsList.value = filtered;
      if (process.client) {
        localStorage.setItem('tenax_doctors_cache', JSON.stringify(filtered));
      }
    }
    // Yeni randevu planlarken Muhammed Selman Yılmaz'ı varsayılan olarak seç
    if (!editingId.value) {
      const prefId = getPreferredDoctorId();
      if (prefId && (!form.value.doctorId || form.value.doctorId === doctorsList.value[0]?._id)) {
        form.value.doctorId = prefId;
      }
    }
  } catch (err) {
    console.warn('Hekimler API gecikti, yerel hekim listesi devrede:', err);
  }
};

// Randevuları API'den çek
const loadAppointments = async () => {
  try {
    isLoading.value = true;
    const docFilter = selectedDoctorFilter.value;

    const params = {
      doctorId: docFilter
    };

    if (viewMode.value === 'day') {
      params.date = formatYMD(currentDate.value);
    } else if (viewMode.value === 'week' || viewMode.value === 'list') {
      const days = currentWeekDays.value;
      params.startDate = days[0].date;
      params.endDate = days[6].date;
    } else if (viewMode.value === 'month') {
      const grid = currentMonthGrid.value;
      params.startDate = grid[0].date;
      params.endDate = grid[grid.length - 1].date;
    }

    const data = await $fetch('/api/appointments', { params });
    appointments.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Randevular yüklenemedi:', error);
  } finally {
    isLoading.value = false;
  }
};

// Türkçe karakter duyarsız arama normalleştirici
const normalizeTr = (str = '') => {
  return String(str || '')
    .toLocaleLowerCase('tr-TR')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c');
};

const isSearchingPatients = ref(false);
let patientSearchTimer = null;
const searchedPatients = ref([]);

// Sunucuda canlı hasta araması yap
const searchPatientsOnline = async (queryText) => {
  const q = (queryText || '').trim();
  if (!q) {
    searchedPatients.value = [];
    return;
  }
  try {
    isSearchingPatients.value = true;
    const res = await $fetch('/api/patients', {
      params: { q, limit: 50, sortBy: 'name_asc' }
    });
    const onlineList = Array.isArray(res) ? res : (res?.patients || []);
    searchedPatients.value = onlineList;

    // Mevcut patients dizisini de yeni gelenlerle zenginleştir
    const map = new Map();
    onlineList.forEach(p => map.set(String(p._id), p));
    patients.value.forEach(p => {
      if (!map.has(String(p._id))) map.set(String(p._id), p);
    });
    patients.value = Array.from(map.values());
  } catch (err) {
    console.error('Hasta arama hatası:', err);
  } finally {
    isSearchingPatients.value = false;
  }
};

// Hasta Arama Filtresi (Türkçe harf duyarsız, çok kelimeli ve sunucu verisiyle birleşik)
const filteredPatients = computed(() => {
  const q = patientInput.value ? patientInput.value.trim() : '';
  if (!q) {
    return patients.value.slice(0, 50);
  }

  const combined = [...searchedPatients.value];
  const seenIds = new Set(combined.map(p => String(p._id)));
  patients.value.forEach(p => {
    if (!seenIds.has(String(p._id))) combined.push(p);
  });

  const cleanQ = normalizeTr(q);
  const words = cleanQ.split(/\s+/).filter(Boolean);
  const digitsQ = q.replace(/\D/g, '');

  return combined.filter((p) => {
    const fullName = `${p.firstName || ''} ${p.lastName || ''} ${p.fullName || ''}`;
    const cleanName = normalizeTr(fullName);
    const phoneDigits = (p.phone || '').replace(/\D/g, '');
    const tcNo = (p.tcNo || p.tcKimlik || '').toString();

    const nameMatches = words.length > 0 && words.every(w => cleanName.includes(w));
    const phoneMatches = Boolean(digitsQ && phoneDigits.includes(digitsQ));
    const tcMatches = Boolean(digitsQ && tcNo.includes(digitsQ));

    return nameMatches || phoneMatches || tcMatches;
  }).slice(0, 50);
});

// Listeden hasta seçilirse
const selectPatient = (p) => {
  form.value.patientId = p._id;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  form.value.patientName = fullName;
  patientInput.value = fullName;
  if (p.phone) {
    form.value.patientPhone = p.phone;
  }
  searchedPatients.value = [];
  isDropdownOpen.value = false;
};

// Kullanıcı doğrudan inputa yazdığında
const onPatientInput = () => {
  isDropdownOpen.value = true;
  form.value.patientName = patientInput.value;

  const cleanInput = normalizeTr(patientInput.value.trim());
  const exact = patients.value.find((p) => {
    const name1 = normalizeTr(`${p.firstName || ''} ${p.lastName || ''}`);
    const name2 = normalizeTr(p.fullName || '');
    return name1 === cleanInput || name2 === cleanInput;
  });
  if (exact) {
    form.value.patientId = exact._id;
    if (exact.phone && !form.value.patientPhone) form.value.patientPhone = exact.phone;
  } else {
    form.value.patientId = '';
  }

  // Canlı arama (Debounce: 150ms)
  if (patientSearchTimer) clearTimeout(patientSearchTimer);
  patientSearchTimer = setTimeout(() => {
    searchPatientsOnline(patientInput.value);
  }, 150);
};

const clearPatientInput = () => {
  patientInput.value = '';
  form.value.patientId = '';
  form.value.patientName = '';
  form.value.patientPhone = '';
  searchedPatients.value = [];
  isDropdownOpen.value = false;
};

const handleClickOutside = (e) => {
  if (patientComboboxRef.value && !patientComboboxRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

// Hastaları sunucudan çek
const loadPatients = async () => {
  try {
    const data = await $fetch('/api/patients?all=true&limit=10000&sortBy=name_asc');
    const fetched = Array.isArray(data) ? data : (data?.patients || []);
    if (fetched.length > 0) {
      patients.value = fetched;
    }
  } catch (error) {
    console.warn('Hastalar yüklenemedi:', error);
  }
};

// Modal Kapat
const closeModal = () => {
  isModalOpen.value = false;
  editingId.value = null;
  patientInput.value = '';
  searchedPatients.value = [];
  isDropdownOpen.value = false;
};

// Yeni Randevu Modalı Aç
const openAddModal = async () => {
  editingId.value = null;
  patientInput.value = '';
  isDropdownOpen.value = false;
  if (doctorsList.value.length === 0) {
    await Promise.all([loadPatients(), loadDoctors()]);
  } else {
    loadPatients();
  }
  form.value = {
    ...defaultForm,
    date: formatYMD(currentDate.value),
    doctorId: getPreferredDoctorId()
  };
  isModalOpen.value = true;
};

const openAddModalWithDateTime = async (date, time = '09:00') => {
  editingId.value = null;
  patientInput.value = '';
  isDropdownOpen.value = false;
  if (doctorsList.value.length === 0) {
    await Promise.all([loadPatients(), loadDoctors()]);
  } else {
    loadPatients();
  }
  form.value = {
    ...defaultForm,
    date,
    time,
    doctorId: getPreferredDoctorId()
  };
  isModalOpen.value = true;
};

// Randevu Düzenleme Modalı Aç
const openEditModal = async (appt) => {
  editingId.value = appt._id;
  isDropdownOpen.value = false;

  let pId = '';
  let pName = '';
  let pPhone = '';

  if (appt.patientId && typeof appt.patientId === 'object') {
    pId = appt.patientId._id || '';
    pName = `${appt.patientId.firstName || ''} ${appt.patientId.lastName || ''}`.trim();
    pPhone = appt.patientId.phone || '';
  } else if (appt.patientId) {
    pId = String(appt.patientId);
    pName = appt.patientName || '';
    pPhone = appt.patientPhone || '';
  } else {
    pId = '';
    pName = appt.patientName || '';
    pPhone = appt.patientPhone || '';
  }

  // İlgili hekim ID'si
  let dId = '';
  if (appt.doctorId && typeof appt.doctorId === 'object') {
    dId = appt.doctorId._id || '';
  } else if (appt.doctorId) {
    dId = String(appt.doctorId);
  } else {
    dId = currentDoctor.value?.id || '';
  }

  patientInput.value = pName;
  form.value = {
    patientId: pId,
    patientName: pName,
    patientPhone: pPhone,
    procedure: appt.procedure || '',
    date: appt.date || todayStr(),
    time: appt.time || '09:00',
    duration: appt.duration || 30,
    status: appt.status || 'pending',
    notes: appt.notes || '',
    doctorId: dId
  };

  isModalOpen.value = true;
  await Promise.all([loadPatients(), loadDoctors()]);
};

// Randevu Kaydet (Yeni Ekle veya Düzenle)
const saveAppointment = async () => {
  if (isSaving.value) return; // Mükerrer tıklama koruması (Double submit guard)
  const patientNameVal = patientInput.value.trim() || form.value.patientName.trim();
  if (!patientNameVal) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen hasta adını yazın veya listeden seçin.', type: 'error' }
    }));
    return;
  }

  if (!form.value.procedure || !form.value.date || !form.value.time) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen işlem, tarih ve saat alanlarını doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSaving.value = true;
    const payload = {
      ...form.value,
      patientId: form.value.patientId || null,
      patientName: patientNameVal,
      patientPhone: form.value.patientPhone?.trim() || ''
    };

    if (editingId.value) {
      const targetId = editingId.value;
      await $fetch(`/api/appointments/${targetId}`, {
        method: 'PUT',
        body: payload
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: {
          message: 'Randevu başarıyla güncellendi.',
          type: 'success'
        }
      }));
    } else {
      await $fetch('/api/appointments', {
        method: 'POST',
        body: payload
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: {
          message: 'Randevu başarıyla planlandı.',
          type: 'success'
        }
      }));
    }

    closeModal();
    await loadAppointments();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'İşlem sırasında bir hata oluştu.', type: 'error' }
    }));
  } finally {
    isSaving.value = false;
  }
};

// Randevu Durum Değiştir
const updateStatus = async (apptId, status) => {
  try {
    await $fetch(`/api/appointments/${apptId}`, {
      method: 'PUT',
      body: { status }
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Randevu durumu güncellendi.', type: 'success' }
    }));

    await loadAppointments();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Durum güncellenirken bir hata oluştu.', type: 'error' }
    }));
  }
};

// Randevu Silme Onay
const confirmDelete = (apptId) => {
  if (window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
    deleteAppointment(apptId);
  }
};

const deleteAppointment = async (apptId) => {
  try {
    await $fetch(`/api/appointments/${apptId}`, {
      method: 'DELETE'
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Randevu kaydı silindi.', type: 'success' }
    }));

    await loadAppointments();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Randevu silinirken hata oluştu.', type: 'error' }
    }));
  }
};

onMounted(() => {
  loadDoctors();
  loadPatients();
  loadAppointments();
  window.addEventListener('click', handleClickOutside);
  window.addEventListener('refresh-stats', loadAppointments);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
  window.removeEventListener('refresh-stats', loadAppointments);
});
</script>
