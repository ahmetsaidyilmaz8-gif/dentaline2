<template>
  <div class="space-y-6">
    <!-- Üst Başlık & Aksiyonlar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/25">
            <Icon name="heroicons:sparkles" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ortodonti & Uzun Dönem Tedavi Modülü</h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tedavi anlaşmaları, otomatik taksitlendirme, seans takibi ve kronolojik klinik not arşivi
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <NuxtLink
          to="/doctor-finances"
          class="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs sm:text-sm font-bold transition-all border border-amber-500/30 flex items-center gap-2"
        >
          <Icon name="heroicons:scale" class="w-4 h-4" />
          <span>Hekim Hak Ediş Havuzu →</span>
        </NuxtLink>

        <button
          @click="openNewPlanModal"
          class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
        >
          <Icon name="heroicons:plus-circle" class="w-4 h-4" />
          <span>+ Yeni Anlaşma Başlat</span>
        </button>
      </div>
    </div>

    <!-- 4 Adet KPI Özeti Kartı -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <!-- 1. Aktif Tedaviler -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Aktif Tedaviler</span>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
            {{ stats.activePatientsCount || 0 }} Hasta
          </div>
          <span class="text-xs text-indigo-500 font-semibold mt-0.5 block">
            Toplam {{ stats.totalPlansCount || plans.length }} anlaşma
          </span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Icon name="heroicons:user-group" class="w-6 h-6" />
        </div>
      </div>

      <!-- 2. Toplam Anlaşma Hacmi -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Toplam Anlaşma</span>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1">
            {{ formatCurrency(stats.totalAgreed || 0) }}
          </div>
          <span class="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5 block">
            Planlanan toplam ciro
          </span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
          <Icon name="heroicons:clipboard-document-list" class="w-6 h-6" />
        </div>
      </div>

      <!-- 3. Kasaya Giren Tahsilat vs Kalan -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Klinik Kasası (Tahsilat)</span>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {{ formatCurrency(stats.totalCollected || 0) }}
          </div>
          <span class="text-xs text-rose-500 font-semibold mt-0.5 block">
            Kalan: {{ formatCurrency(stats.totalRemaining || 0) }}
          </span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Icon name="heroicons:banknotes" class="w-6 h-6" />
        </div>
      </div>

      <!-- 4. Seans Takip Metriği & Hekim Hak Ediş Havuz Linki -->
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Klinik Seansları</span>
          <div class="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
            {{ stats.totalSessionsCount || sessions.length }} Seans
          </div>
          <NuxtLink to="/doctor-finances" class="text-xs text-amber-500 hover:text-amber-600 font-bold mt-0.5 inline-flex items-center gap-1">
            <span>Hekim Hak Ediş Havuzu →</span>
          </NuxtLink>
        </div>
        <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Icon name="heroicons:clock" class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Sekmeli Alt Modül Alanı (Hastalar, Seanslar, Taksitler) -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <!-- Sekme Başlıkları -->
      <div class="px-4 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-wrap items-center gap-1.5">
        <button
          v-for="t in [
            { id: 'patients', label: 'Ortodonti Hastaları', icon: 'heroicons:users', badge: plans.length },
            { id: 'sessions', label: 'Seanslar & Takvim', icon: 'heroicons:calendar-days', badge: sessions.length },
            { id: 'installments', label: 'Finans & Taksit Paneli', icon: 'heroicons:calculator', badge: pendingInstallmentsCount }
          ]"
          :key="t.id"
          @click="activeSubTab = t.id"
          :class="[
            activeSubTab === t.id
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 shadow-sm font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold',
            'inline-flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs sm:text-sm transition-all'
          ]"
        >
          <Icon :name="t.icon" class="w-4 h-4" />
          <span>{{ t.label }}</span>
          <span v-if="t.badge !== null && t.badge !== undefined" class="px-2 py-0.5 text-[10px] rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {{ t.badge }}
          </span>
        </button>
      </div>

      <!-- SEKME 1: ORTODONTİ HASTALARI LİSTESİ -->
      <div v-if="activeSubTab === 'patients'" class="p-5 flex flex-col gap-4">
        <!-- Arama ve Filtre -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="relative flex-1 max-w-md">
            <Icon name="heroicons:magnifying-glass" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchPatientQuery"
              type="text"
              placeholder="Hasta adı veya telefon ile ara..."
              class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
            />
          </div>
          <div class="flex items-center gap-2">
            <select
              v-model="statusFilter"
              class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif Tedaviler</option>
              <option value="paused">Duraklatılanlar</option>
              <option value="completed">Tamamlananlar</option>
              <option value="cancelled">İptal Edilenler</option>
            </select>
          </div>
        </div>

        <!-- Hasta Kartları Izgarası -->
        <div v-if="filteredPlans.length === 0" class="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Icon name="heroicons:user-group" class="w-8 h-8 mx-auto mb-2 opacity-60" />
          <div class="font-semibold text-slate-600 dark:text-slate-300">Ortodonti hastası bulunamadı.</div>
          <p class="text-xs text-slate-400 mt-1">Yukarıdaki "+ Yeni Anlaşma Başlat" butonuna tıklayarak ilk ortodonti protokolünü oluşturabilirsiniz.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="plan in filteredPlans"
            :key="plan._id"
            class="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <!-- Üst: Hasta Adı ve Durum -->
              <div class="flex items-start justify-between gap-2">
                <div>
                  <NuxtLink :to="`/patients/${plan.patientId?._id}`" class="font-bold text-base text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1.5">
                    <span>{{ plan.patientId?.firstName }} {{ plan.patientId?.lastName }}</span>
                    <Icon name="heroicons:arrow-top-right-on-square" class="w-3.5 h-3.5 opacity-60" />
                  </NuxtLink>
                  <div class="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                    <Icon name="heroicons:phone" class="w-3 h-3" />
                    <span>{{ plan.patientId?.phone || 'Telefon yok' }}</span>
                  </div>
                </div>

                <span
                  :class="[
                    plan.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : (plan.status === 'paused'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200'
                        : (plan.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300')),
                    'px-2 py-0.5 rounded-full text-[11px] font-bold border'
                  ]"
                >
                  {{ plan.status === 'active' ? 'Aktif Tedavi' : (plan.status === 'paused' ? 'Duraklatıldı' : (plan.status === 'cancelled' ? 'İptal Edildi' : 'Tamamlandı')) }}
                </span>
              </div>

              <!-- Braket & Hekim Bilgisi -->
              <div class="mt-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span class="text-slate-400 block text-[10px] font-semibold uppercase">Aygıt Türü</span>
                  <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ plan.bracketType }}</span>
                </div>
                <div class="text-right">
                  <span class="text-slate-400 block text-[10px] font-semibold uppercase">Hekim</span>
                  <span class="font-bold text-slate-700 dark:text-slate-200">{{ plan.doctorId?.name || 'Klinik Hekimi' }}</span>
                </div>
              </div>

              <!-- İlerleme Çubuğu & Finansal Durum -->
              <div class="mt-3 space-y-1.5">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <span class="text-slate-500 dark:text-slate-400">
                    {{ plan.summary?.isPerSession ? 'Ödeme Modeli:' : 'Taksit İlerlemesi:' }}
                  </span>
                  <span v-if="!plan.summary?.isPerSession" class="font-bold font-mono text-slate-700 dark:text-slate-200">
                    {{ plan.summary?.paidInstallmentsCount || 0 }} / {{ plan.summary?.totalInstallmentsCount || 0 }} Taksit
                  </span>
                  <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Seans Başı (Taksitsiz)
                  </span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="plan.summary?.isPerSession ? 'bg-emerald-500' : 'bg-indigo-600'"
                    :style="{
                      width: `${plan.totalAmount ? Math.min(100, Math.round(((plan.summary?.totalPaidOverall || 0) / plan.totalAmount) * 100)) : 0}%`
                    }"
                  ></div>
                </div>
                <div class="flex items-center justify-between text-xs pt-1">
                  <span class="text-slate-400">Kalan: <b class="font-mono text-rose-500 font-bold">{{ formatCurrency(plan.summary?.remainingBalance ?? plan.totalAmount) }}</b></span>
                  <span class="text-slate-400">Toplam: <b class="font-mono text-slate-700 dark:text-slate-200">{{ formatCurrency(plan.totalAmount) }}</b></span>
                </div>
              </div>
            </div>

            <!-- Kart Eylem Butonları: İptal/Sil, Detay -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
              <button
                @click="openCancelOrDeletePlanModal(plan)"
                class="py-2 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Tedaviyi İptal Et veya Sil"
              >
                <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
                <span>Tedaviyi Sil / İptal</span>
              </button>

              <NuxtLink
                :to="`/patients/${plan.patientId?._id}`"
                class="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Hasta Detayına Git"
              >
                <span>Hasta Profiline Git</span>
                <Icon name="heroicons:arrow-right" class="w-3.5 h-3.5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- SEKME 2: SEANSLAR & KRONOLOJİK ARŞİV -->
      <div v-if="activeSubTab === 'sessions'" class="p-5 flex flex-col gap-4">
        <!-- Üst Başlık & Kontroller -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 class="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
              <Icon name="heroicons:calendar-days" class="w-5 h-5 text-indigo-500" />
              <span>Ortodonti Seans Takip Kayıtları</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Her hasta için ayrı ayrı seans geçmişi, koltuk başı işlem notları ve uygulanan teller.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Hasta Arama Metin Kutusu -->
            <div class="relative flex items-center">
              <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                v-model="sessionSearchQuery"
                type="text"
                placeholder="Hasta adı veya tel ara..."
                class="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>

            <!-- Hasta Seçici Dropdown -->
            <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
              <Icon name="heroicons:user" class="w-4 h-4 text-indigo-500 shrink-0" />
              <select
                v-model="sessionPatientFilter"
                class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
              >
                <option value="all">👥 Tüm Hastalar ({{ orthoPatientsList.length }})</option>
                <option v-for="p in orthoPatientsList" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>

            <button
              @click="openSessionModal()"
              class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 stroke-[2.5]" />
              <span>Yeni Seans Kaydet</span>
            </button>
          </div>
        </div>

        <div v-if="patientSessionsGrouped.length === 0" class="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Icon name="heroicons:document-text" class="w-8 h-8 mx-auto mb-2 opacity-60" />
          <div class="font-semibold text-slate-600 dark:text-slate-300">Henüz kayıtlı seans veya hasta bulunamadı.</div>
          <p class="text-xs text-slate-400 mt-1">Yukarıdaki "+ Yeni Seans Kaydet" butonuna tıklayarak ilk seansı girebilirsiniz.</p>
        </div>

        <!-- HASTALARA GÖRE AYRI AYRI BLOKLAR -->
        <div v-else class="space-y-4">
          <div
            v-for="group in patientSessionsGrouped"
            :key="group.patient?._id || group.plan?._id"
            class="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-indigo-200 dark:hover:border-slate-600"
          >
            <!-- Hasta Başlık Şeridi -->
            <div class="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0 border border-indigo-200/40 dark:border-indigo-800/40">
                  {{ (group.patient?.firstName?.[0] || '') + (group.patient?.lastName?.[0] || '') }}
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <NuxtLink :to="`/patients/${group.patient?._id}`" class="font-bold text-sm sm:text-base text-slate-800 dark:text-white hover:text-indigo-600 hover:underline">
                      {{ group.patient?.firstName }} {{ group.patient?.lastName }}
                    </NuxtLink>
                    <span v-if="group.plan?.bracketType" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {{ group.plan.bracketType }}
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      :class="group.sessions.length > 0
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'"
                    >
                      {{ group.sessions.length }} Seans Kayıtlı
                    </span>
                  </div>
                  <div class="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5 font-mono">
                    <span v-if="group.patient?.phone">{{ group.patient.phone }}</span>
                    <span v-if="group.plan?.doctorId?.name" class="font-sans font-medium text-slate-600 dark:text-slate-300">
                      | Sorumlu Hekim: <b>{{ group.plan.doctorId.name }}</b>
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  @click="openSessionModal(group.plan)"
                  class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Icon name="heroicons:plus" class="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Seans Notu Ekle</span>
                </button>
              </div>
            </div>

            <!-- Hasta Seans Listesi -->
            <div class="p-4">
              <div v-if="group.sessions.length === 0" class="py-6 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Bu hastaya ait henüz seans notu girilmemiş. Yukarıdaki <b>"+ Seans Notu Ekle"</b> butonu ile ilk seansı kaydedebilirsiniz.
              </div>
              <div v-else class="space-y-2.5">
                <div
                  v-for="s in group.sessions"
                  :key="s._id"
                  class="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-start justify-between gap-3 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div class="flex items-start gap-3 flex-1 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span class="text-[8px] uppercase font-semibold leading-none">Seans</span>
                      <span class="text-base leading-tight">{{ s.sessionNumber }}</span>
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs font-bold text-slate-800 dark:text-white font-mono">{{ formatDate(s.date) }} {{ s.time }}</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Hekim: {{ s.doctorId?.name || 'Diş Hekimi' }}
                        </span>
                        <span v-if="s.paymentAmount" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                          <Icon name="heroicons:banknotes" class="w-3 h-3 text-emerald-500" />
                          <span>{{ formatCurrency(s.paymentAmount) }} Tahsil Edildi</span>
                        </span>
                      </div>

                      <p class="mt-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line leading-relaxed">
                        {{ s.sessionNotes }}
                      </p>

                      <div v-if="s.archwireUpper || s.archwireLower || s.elastics" class="mt-2 flex flex-wrap items-center gap-2">
                        <span v-if="s.archwireUpper" class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          Üst Tel: {{ s.archwireUpper }}
                        </span>
                        <span v-if="s.archwireLower" class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                          Alt Tel: {{ s.archwireLower }}
                        </span>
                        <span v-if="s.elastics" class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Lastik: {{ s.elastics }}
                        </span>
                      </div>

                      <div v-if="s.nextAppointmentDate" class="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                        <Icon name="heroicons:calendar" class="w-3.5 h-3.5" />
                        <span>Sonraki Seans: {{ formatDate(s.nextAppointmentDate) }} {{ s.nextAppointmentNotes ? `- ${s.nextAppointmentNotes}` : '' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-1 shrink-0 self-end md:self-start">
                    <button
                      @click="openEditSessionModal(s)"
                      class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Seans Notunu Düzenle"
                    >
                      <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteSession(s._id)"
                      class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Seansı Sil"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SEKME 3: FİNANS & TAKSİT TAKİP PANELİ -->
      <div v-if="activeSubTab === 'installments'" class="p-5 flex flex-col gap-4">
        <!-- Üst Başlık & Kontroller -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 class="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
              <Icon name="heroicons:banknotes" class="w-5 h-5 text-emerald-500" />
              <span>Ortodonti Finans & Taksit Takibi</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Hastaların tedavi anlaşmaları, vadesi gelen taksitleri ve seans başı ödeme durumları.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Hasta Arama Metin Kutusu -->
            <div class="relative flex items-center">
              <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                v-model="installmentSearchQuery"
                type="text"
                placeholder="Hasta adı veya tel ara..."
                class="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>

            <!-- Hasta Filtresi Dropdown -->
            <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
              <Icon name="heroicons:user" class="w-4 h-4 text-emerald-500 shrink-0" />
              <select
                v-model="installmentPatientFilter"
                class="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
              >
                <option value="all">👥 Tüm Hastalar ({{ orthoPatientsList.length }})</option>
                <option v-for="p in orthoPatientsList" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>

            <!-- Durum Filtresi Dropdown -->
            <select
              v-model="installmentFilter"
              class="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="pending">⏳ Borcu / Bekleyen Taksiti Olanlar</option>
              <option value="paid">✓ Tahsil Edilenler</option>
              <option value="all">📋 Tüm Anlaşmalar & Taksitler</option>
            </select>
          </div>
        </div>

        <div v-if="installmentsByPatient.length === 0" class="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Icon name="heroicons:banknotes" class="w-8 h-8 mx-auto mb-2 opacity-60" />
          <div class="font-semibold text-slate-600 dark:text-slate-300">Seçilen filtreye uygun hasta finans kaydı bulunamadı.</div>
          <p class="text-xs text-slate-400 mt-1">Filtreyi "Tüm Anlaşmalar" olarak değiştirebilirsiniz.</p>
        </div>

        <!-- HASTALARA GÖRE AYRI AYRI FİNANS & TAKSİT PANELLERİ -->
        <div v-else class="space-y-5">
          <div
            v-for="item in installmentsByPatient"
            :key="item.plan._id"
            class="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-indigo-200 dark:hover:border-slate-600"
          >
            <!-- Hasta Finans Başlık Kartı -->
            <div class="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-200/40 dark:border-emerald-800/40">
                  {{ (item.patient?.firstName?.[0] || '') + (item.patient?.lastName?.[0] || '') }}
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <NuxtLink :to="`/patients/${item.patient?._id}`" class="font-bold text-sm sm:text-base text-slate-800 dark:text-white hover:text-indigo-600 hover:underline">
                      {{ item.patient?.firstName }} {{ item.patient?.lastName }}
                    </NuxtLink>
                    <span
                      v-if="item.plan.summary?.isPerSession"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    >
                      Seans Başı (Taksitsiz)
                    </span>
                    <span
                      v-else
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                    >
                      Aylık Taksitli ({{ item.allInstallments.length }} Ay)
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                      :class="item.plan.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 border-slate-200'"
                    >
                      {{ item.plan.status === 'active' ? 'Aktif Tedavi' : (item.plan.status === 'paused' ? 'Duraklatıldı' : 'Tamamlandı') }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5 font-mono">
                    <span v-if="item.patient?.phone">{{ item.patient.phone }}</span>
                    <span class="font-sans font-medium text-slate-600 dark:text-slate-300">
                      | Sorumlu Hekim: <b>{{ item.plan.doctorId?.name || 'Klinik Hekimi' }}</b>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Finansal Hızlı Butonlar -->
              <div class="flex items-center gap-2 shrink-0">
                <button
                  v-if="(item.plan.summary?.remainingBalance ?? item.plan.totalAmount) > 0"
                  type="button"
                  @click="openDirectPaymentModal(item.plan)"
                  class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Hastadan Doğrudan Tahsilat Al"
                >
                  <Icon name="heroicons:banknotes" class="w-4 h-4" />
                  <span>+ Tahsilat Al</span>
                </button>
                <button
                  type="button"
                  @click="openEditPlanModal(item.plan)"
                  class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Fiyatı & Tedavi Anlaşmasını Düzenle"
                >
                  <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" />
                  <span>Ücreti / Anlaşmayı Düzenle</span>
                </button>
              </div>
            </div>

            <!-- Finansal Özet Göstergeleri (4 Kutu) -->
            <div class="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-800">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <span class="text-slate-400 block text-[10px] uppercase font-semibold">Toplam Anlaşma</span>
                  <span class="font-mono font-bold text-slate-800 dark:text-white text-sm">
                    {{ formatCurrency(item.plan.totalAmount) }}
                  </span>
                </div>
                <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <span class="text-slate-400 block text-[10px] uppercase font-semibold">Peşinat</span>
                  <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {{ formatCurrency(item.plan.downPayment || 0) }}
                  </span>
                </div>
                <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <span class="text-slate-400 block text-[10px] uppercase font-semibold">Toplam Tahsil Edilen</span>
                  <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {{ formatCurrency(item.plan.summary?.totalPaidOverall || 0) }}
                  </span>
                </div>
                <div class="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/40">
                  <span class="text-rose-500 block text-[10px] uppercase font-semibold">Kalan Güncel Borç</span>
                  <span class="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {{ formatCurrency(item.plan.summary?.remainingBalance ?? item.plan.totalAmount) }}
                  </span>
                </div>
              </div>

              <!-- İlerleme Çubuğu -->
              <div class="mt-3 flex items-center gap-3">
                <div class="flex-1 bg-slate-100 dark:bg-slate-700/60 rounded-full h-2 overflow-hidden">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="item.plan.summary?.isPerSession ? 'bg-emerald-500' : 'bg-indigo-600'"
                    :style="{
                      width: `${item.plan.totalAmount ? Math.min(100, Math.round(((item.plan.summary?.totalPaidOverall || 0) / item.plan.totalAmount) * 100)) : 0}%`
                    }"
                  ></div>
                </div>
                <span class="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                  %{{ item.plan.totalAmount ? Math.min(100, Math.round(((item.plan.summary?.totalPaidOverall || 0) / item.plan.totalAmount) * 100)) : 0 }} Ödendi
                </span>
              </div>
            </div>

            <!-- Taksit Tablosu (Sadece Taksitli Modeller İçin) -->
            <div v-if="!item.plan.summary?.isPerSession && item.allInstallments?.length" class="p-4">
              <div class="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px]">
                      <th class="px-3 py-2.5">Taksit No</th>
                      <th class="px-3 py-2.5">Vade Tarihi</th>
                      <th class="px-3 py-2.5 text-right">Tutar</th>
                      <th class="px-3 py-2.5 text-center">Durum</th>
                      <th class="px-3 py-2.5 text-right">Tahsilat / İşlem</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr
                      v-for="ins in item.installments"
                      :key="ins.installmentNo"
                      class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                    >
                      <td class="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300">
                        {{ ins.installmentNo }}. Taksit
                      </td>
                      <td class="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-400">
                        {{ formatDate(ins.dueDate) }}
                      </td>
                      <td class="px-3 py-2.5 text-right font-mono font-bold text-slate-800 dark:text-white">
                        {{ formatCurrency(ins.amount) }}
                      </td>
                      <td class="px-3 py-2.5 text-center">
                        <span
                          v-if="ins.status === 'paid'"
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        >
                          ✓ Ödendi
                        </span>
                        <span
                          v-else-if="ins.status === 'cancelled'"
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        >
                          İptal Edildi
                        </span>
                        <span
                          v-else
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        >
                          Bekliyor
                        </span>
                      </td>
                      <td class="px-3 py-2.5 text-right">
                        <button
                          v-if="ins.status !== 'paid' && ins.status !== 'cancelled'"
                          type="button"
                          @click="openPayInstallmentModal({ planId: item.plan._id, installmentNo: ins.installmentNo, amount: ins.amount, patientName: `${item.patient?.firstName || ''} ${item.patient?.lastName || ''}`, doctorName: item.plan.doctorId?.name, doctorId: item.plan.doctorId?._id || item.plan.doctorId })"
                          class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                          Tahsil Et
                        </button>
                        <span v-else-if="ins.status === 'paid'" class="text-[10px] font-mono text-slate-400">
                          {{ formatDate(ins.paymentDate) }}
                        </span>
                        <span v-else class="text-slate-400">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: YENİ ORTODONTİ TEDAVİ ANLAŞMASI -->
    <AppModal
      :isOpen="isNewPlanModalOpen"
      title="🦷 Yeni Ortodonti Tedavi Anlaşması & Taksitlendirme"
      width="lg"
      @close="isNewPlanModalOpen = false"
    >
      <form @submit.prevent="saveNewPlan" class="space-y-4">
        <!-- Hasta Seçimi -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Ortodonti Hastası <span class="text-rose-500">*</span></label>
          <PatientSearchSelect
            v-model="planForm.patientId"
            :patients="allPatients"
            placeholder="Hasta seçin..."
            :required="true"
          />
        </div>

        <!-- Hekim Seçimi & Aygıt Türü -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tedaviyi Yürütecek Hekim <span class="text-rose-500">*</span></label>
            <select
              v-model="planForm.doctorId"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option v-for="doc in doctorsList" :key="doc._id" :value="doc._id">
                {{ doc.name }} (%{{ doc.rate }} Hak Ediş)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Aygıt / Braket Türü <span class="text-rose-500">*</span></label>
            <select
              v-model="planForm.bracketType"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option value="Metal Braket">Metal Braket</option>
              <option value="Safir / Porselen Braket">Safir / Porselen Braket</option>
              <option value="Şeffaf Plak (Aligner)">Şeffaf Plak (Aligner)</option>
              <option value="Lingual Braket">Lingual Braket</option>
              <option value="Hareketli Aparey">Hareketli Aparey</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
        </div>

        <!-- Ödeme Modeli / Plan Türü -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Ödeme Planı Türü <span class="text-rose-500">*</span></label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="planForm.planType = 'installments'"
              class="p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              :class="planForm.planType === 'installments'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'"
            >
              <Icon name="heroicons:calendar" class="w-4 h-4" />
              <span>Aylık Sabit Taksitli</span>
            </button>

            <button
              type="button"
              @click="planForm.planType = 'per_session'"
              class="p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              :class="planForm.planType === 'per_session'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'"
            >
              <Icon name="heroicons:banknotes" class="w-4 h-4" />
              <span>Taksitsiz (Seans Başı)</span>
            </button>
          </div>
        </div>

        <!-- Toplam Tutar, Peşinat & Süre -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Toplam Tutar (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="planForm.totalAmount"
              type="number"
              min="1"
              required
              placeholder="Örn: 30000"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Peşinat (TL)</label>
            <input
              v-model.number="planForm.downPayment"
              type="number"
              min="0"
              placeholder="Örn: 5000"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              {{ planForm.planType === 'per_session' ? 'Tahmini Süre (Ay)' : 'Tedavi Süresi (Ay / Taksit Sayısı)' }} <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model.number="planForm.durationMonths"
                type="number"
                min="1"
                max="120"
                step="1"
                required
                placeholder="Örn: 10"
                class="w-full px-3 py-2 pr-16 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">
                {{ planForm.planType === 'per_session' ? 'Ay' : 'Taksit' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Başlangıç Tarihi -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tedavi Başlangıç Tarihi <span class="text-rose-500">*</span></label>
          <input
            v-model="planForm.startDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-white font-mono"
          />
        </div>

        <!-- Otomatik Taksitlendirme veya Taksitsiz Bilgi Kutusu -->
        <div v-if="planForm.planType === 'installments'" class="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60">
          <div class="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Icon name="heroicons:calculator" class="w-4 h-4 text-indigo-600" />
            <span>Otomatik Taksit Hesaplama Simülasyonu</span>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div class="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs">
              <span class="text-[10px] text-slate-400 block font-semibold">Peşinat</span>
              <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ formatCurrency(planForm.downPayment || 0) }}</span>
            </div>
            <div class="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs">
              <span class="text-[10px] text-slate-400 block font-semibold">Kalan Taksit Tutarı</span>
              <span class="font-mono font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(Math.max(0, (planForm.totalAmount || 0) - (planForm.downPayment || 0))) }}</span>
            </div>
            <div class="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs">
              <span class="text-[10px] text-slate-400 block font-semibold">Aylık Taksit</span>
              <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(Math.round((Math.max(0, (planForm.totalAmount || 0) - (planForm.downPayment || 0)) / (planForm.durationMonths || 1)) * 100) / 100) }} / Ay
              </span>
            </div>
          </div>
        </div>

        <div v-else class="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
          <div class="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <Icon name="heroicons:check-badge" class="w-4 h-4 text-emerald-600" />
              <span>Taksitsiz Tedavi Modeli (Seans Başı Tahsilat)</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
              Sabit Takvimsiz
            </span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-center text-xs">
            <div class="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs">
              <span class="text-[10px] text-slate-400 block font-semibold">Peşinat</span>
              <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(planForm.downPayment || 0) }}</span>
            </div>
            <div class="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs">
              <span class="text-[10px] text-slate-400 block font-semibold">Kalan Tedavi Borcu</span>
              <span class="font-mono font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(Math.max(0, (planForm.totalAmount || 0) - (planForm.downPayment || 0))) }}</span>
            </div>
          </div>
          <p class="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
            💡 Sabit aylık taksit tablosu oluşturulmaz. Hasta her seansa geldiğinde "Seans Notu Ekle" ekranından girilen tahsilat miktarı doğrudan bu tedavi borcundan düşülür.
          </p>
        </div>

        <!-- Tanı & Notlar -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Ortodontik Teşhis / Maloklüzyon</label>
          <input
            v-model="planForm.diagnosis"
            type="text"
            placeholder="Örn: Sınıf II Div 1 maloklüzyon, derin kapanış, çapraşıklık"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-white"
          />
        </div>
      </form>

      <template #footer>
        <button
          @click="isNewPlanModalOpen = false"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          İptal
        </button>
        <button
          @click="saveNewPlan"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          {{ isSubmitting ? 'Oluşturuluyor...' : (planForm.planType === 'per_session' ? 'Anlaşmayı Başlat (Seans Başı Ödeme)' : 'Anlaşmayı Başlat & Taksitlendir') }}
        </button>
      </template>
    </AppModal>

    <!-- MODAL 2: SEANS NOTU EKLE / DÜZENLE -->
    <AppModal
      :isOpen="isSessionModalOpen"
      :title="editingSessionId ? '✏️ Seans Notunu Düzenle' : '🦷 Koltuk Başı Ortodonti Seans Notu Ekle'"
      width="md"
      @close="isSessionModalOpen = false"
    >
      <form @submit.prevent="saveSession" class="space-y-4">
        <!-- Hasta Seçimi (Yeni eklendiğinde) -->
        <div v-if="!sessionForm.patientId || isSelectingPatientForSession">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Hasta Seçimi <span class="text-rose-500">*</span></label>
          <PatientSearchSelect
            v-model="sessionForm.patientId"
            :patients="allPatients"
            placeholder="Hasta seçin..."
            :required="true"
          />
        </div>
        <div v-else class="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span class="text-slate-400 block text-[10px]">Hasta</span>
            <span class="font-bold text-slate-800 dark:text-white">{{ getPatientName(sessionForm.patientId) }}</span>
          </div>
          <button type="button" @click="isSelectingPatientForSession = true" class="text-xs text-indigo-500 font-bold hover:underline">
            Değiştir
          </button>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Seans No <span class="text-rose-500">*</span></label>
            <input
              v-model.number="sessionForm.sessionNumber"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-bold text-xs sm:text-sm text-slate-800 dark:text-white"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tarih & Saat</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="sessionForm.date"
                type="date"
                required
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-white"
              />
              <input
                v-model="sessionForm.time"
                type="time"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- Hekim Seçimi -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">İşlemi Yapan Hekim <span class="text-rose-500">*</span></label>
          <select
            v-model="sessionForm.doctorId"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
          >
            <option v-for="doc in doctorsList" :key="doc._id" :value="doc._id">
              {{ doc.name }} (%{{ doc.rate }} Hak Ediş)
            </option>
          </select>
        </div>

        <!-- Yapılan İşlem / Seans Notu -->
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Bugün Yapılan İşlem (Seans Notu) <span class="text-rose-500">*</span></label>
          <textarea
            v-model="sessionForm.sessionNotes"
            rows="3"
            required
            placeholder="Örn: 0.16x0.22 SS tele geçildi, sağ üst 5 no braket yapıştırıldı, sınıf II intermaksiller elastik verildi..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-white leading-relaxed"
          ></textarea>
        </div>

        <!-- Tel ve Lastik Künyesi -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Üst Ark Teli</label>
            <input
              v-model="sessionForm.archwireUpper"
              type="text"
              placeholder="Örn: 0.16 NiTi"
              class="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Alt Ark Teli</label>
            <input
              v-model="sessionForm.archwireLower"
              type="text"
              placeholder="Örn: 0.14 NiTi"
              class="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Kullanılan Elastik</label>
            <input
              v-model="sessionForm.elastics"
              type="text"
              placeholder="Örn: 3/16 4.5 oz"
              class="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs"
            />
          </div>
        </div>

        <!-- Bu Seansta Alınan Tahsilat & Ödeme -->
        <div class="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl space-y-2.5">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Icon name="heroicons:banknotes" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Bu Seansta Alınan Tahsilat (İsteğe Bağlı)</span>
            </label>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Ana fiyattan düşer & hekime hak ediş yazar
            </span>
          </div>

          <!-- Kalan Tedavi Borcu Göstergesi -->
          <div v-if="selectedPatientPlan" class="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between text-xs">
            <span class="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Icon name="heroicons:information-circle" class="w-4 h-4 text-emerald-600" />
              <span>Güncel Tedavi Borcu:</span>
            </span>
            <span class="font-mono font-bold text-slate-800 dark:text-white">
              Kalan: <b class="text-rose-500 font-bold">{{ formatCurrency(selectedPatientPlan.summary?.remainingBalance ?? selectedPatientPlan.totalAmount) }}</b> / Toplam: {{ formatCurrency(selectedPatientPlan.totalAmount) }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Tahsilat Tutarı (TL)</label>
              <div class="relative">
                <input
                  v-model.number="sessionForm.paymentAmount"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-800 dark:text-white"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">TL</span>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Ödeme Yöntemi</label>
              <select
                v-model="sessionForm.paymentMethod"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
              >
                <option value="cash">Nakit</option>
                <option value="card">Kredi Kartı / POS</option>
                <option value="transfer">Havale / EFT</option>
              </select>
            </div>
          </div>

          <div v-if="sessionForm.paymentAmount > 0" class="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/50 flex items-start gap-1.5">
            <Icon name="heroicons:check-circle" class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <b>{{ formatCurrency(sessionForm.paymentAmount) }}</b> tahsilat genel kasaya girer, seçilen hekime <b>%{{ getDoctorRate(sessionForm.doctorId) }} ({{ formatCurrency(Math.round(sessionForm.paymentAmount * getDoctorRate(sessionForm.doctorId) / 100)) }})</b> hak ediş tahakkuk eder ve hastanın tedavi borcundan düşülür<span v-if="selectedPatientPlan"> (Tahsilat sonrası kalan borç: <b>{{ formatCurrency(Math.max(0, (selectedPatientPlan.summary?.remainingBalance ?? selectedPatientPlan.totalAmount) - sessionForm.paymentAmount)) }}</b>)</span>.
            </span>
          </div>
        </div>

        <!-- Sonraki Seans Randevu Planı (Genel Randevular Takvimine Aktarılır) -->
        <div class="pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <label class="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1.5 flex items-center gap-1.5">
            <Icon name="heroicons:calendar" class="w-4 h-4 text-indigo-500" />
            <span>Bir Sonraki Seans Randevusu (Genel Randevu Takvimine Otomatik Eklenir)</span>
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 mb-0.5">Randevu Tarihi</label>
              <input
                v-model="sessionForm.nextAppointmentDate"
                type="date"
                class="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 mb-0.5">Randevu Saati</label>
              <input
                v-model="sessionForm.nextAppointmentTime"
                type="time"
                class="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 mb-0.5">İşlem / Randevu Notu</label>
              <input
                v-model="sessionForm.nextAppointmentNotes"
                type="text"
                placeholder="Örn: Braket kontrolü, tel değişimi"
                class="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
              />
            </div>
          </div>
          <span class="text-[10px] text-slate-400 mt-1 block">Tarih seçildiğinde Randevular sayfasına otomatik olarak hekim ve hasta ile birlikte eklenir.</span>
        </div>
      </form>

      <template #footer>
        <button
          @click="isSessionModalOpen = false"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          İptal
        </button>
        <button
          @click="saveSession"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          {{ isSubmitting ? 'Kaydediliyor...' : 'Seans Notunu Kaydet' }}
        </button>
      </template>
    </AppModal>

    <!-- MODAL 3: ANLAŞMAYI & FİYATI DÜZENLE -->
    <AppModal
      :isOpen="isEditPlanModalOpen"
      title="✏️ Ortodonti Tedavi Anlaşmasını Düzenle"
      width="lg"
      @close="isEditPlanModalOpen = false"
    >
      <form @submit.prevent="saveEditPlan" class="space-y-4">
        <div class="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Hasta</span>
            <span class="font-bold text-slate-800 dark:text-white text-sm">{{ editPlanForm.patientName }}</span>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
            Tedavi Protokolü Düzenleme
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Anlaşılan Toplam Fiyat (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="editPlanForm.totalAmount"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-800 dark:text-white"
            />
            <span class="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-medium">
              💡 Fiyat değiştiğinde ödenmiş taksitler korunur; kalan ödenmemiş taksitler ve hastanın genel tedavi borcu otomatik eşit bölünür.
            </span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tedavi Durumu <span class="text-rose-500">*</span></label>
            <select
              v-model="editPlanForm.status"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option value="active">🟢 Aktif Tedavi</option>
              <option value="paused">🟡 Duraklatıldı / Askıda</option>
              <option value="completed">🔵 Tamamlandı</option>
              <option value="cancelled">🔴 İptal Edildi</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Sorumlu Hekim <span class="text-rose-500">*</span></label>
            <select
              v-model="editPlanForm.doctorId"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option v-for="doc in doctorsList" :key="doc._id" :value="doc._id">
                {{ doc.name }} (%{{ doc.rate }} Hak Ediş)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Aygıt Türü <span class="text-rose-500">*</span></label>
            <select
              v-model="editPlanForm.bracketType"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option value="Metal Braket">Metal Braket</option>
              <option value="Safir / Porselen Braket">Safir / Porselen Braket</option>
              <option value="Şeffaf Plak (Aligner)">Şeffaf Plak (Aligner)</option>
              <option value="Lingual Braket">Lingual Braket</option>
              <option value="Hareketli Aparey">Hareketli Aparey</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tahmini Süre (Ay)</label>
            <input
              v-model.number="editPlanForm.durationMonths"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs sm:text-sm text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Ortodontik Teşhis / Maloklüzyon</label>
            <input
              v-model="editPlanForm.diagnosis"
              type="text"
              placeholder="Örn: Angle Sınıf II Bölüm 1"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tedavi Notları</label>
          <textarea
            v-model="editPlanForm.notes"
            rows="2"
            placeholder="Anlaşma özel şartları veya hasta notları..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          @click="isEditPlanModalOpen = false"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          İptal
        </button>
        <button
          @click="saveEditPlan"
          :disabled="isSubmitting"
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          {{ isSubmitting ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet' }}
        </button>
      </template>
    </AppModal>

    <!-- MODAL 4: TEDAVİYİ İPTAL ET VEYA SİL -->
    <AppModal
      :isOpen="isCancelOrDeletePlanModalOpen"
      title="⚠️ Tedavi Anlaşmasını İptal Et veya Sil"
      width="md"
      @close="isCancelOrDeletePlanModalOpen = false"
    >
      <div class="space-y-4">
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <b class="font-bold text-slate-800 dark:text-white">{{ selectedPlanForAction?.patientId?.firstName }} {{ selectedPlanForAction?.patientId?.lastName }}</b> hastasına ait ortodonti tedavi anlaşması için bir işlem seçiniz:
        </p>

        <div class="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1">
          <div class="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Icon name="heroicons:pause" class="w-4 h-4" />
            <span>1. Seçenek: Tedaviyi İptal Et (Önerilen)</span>
          </div>
          <p class="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
            Anlaşma arşivlenir ve durumu "İptal Edildi" yapılır. Kalan vadesi gelmemiş taksitler durdurulur; geçmişe dönük ödeme ve seans verileri arşivde korunur.
          </p>
          <button
            @click="cancelPlan"
            :disabled="isSubmitting"
            class="mt-2 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Icon name="heroicons:pause" class="w-4 h-4" />
            <span>Tedaviyi İptal Et / Durdur</span>
          </button>
        </div>

        <div class="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1">
          <div class="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
            <Icon name="heroicons:trash" class="w-4 h-4" />
            <span>2. Seçenek: Kaydı Tamamen Sil</span>
          </div>
          <p class="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
            Yanlışlıkla açılmış bir kayıtsa, anlaşma ve ilişkili tedavi borç kaydı sistemden kalıcı olarak temizlenir.
          </p>
          <button
            @click="deletePlan"
            :disabled="isSubmitting"
            class="mt-2 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
            <span>Anlaşmayı Tamamen Sil</span>
          </button>
        </div>
      </div>

      <template #footer>
        <button
          @click="isCancelOrDeletePlanModalOpen = false"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          Kapat
        </button>
      </template>
    </AppModal>

    <!-- MODAL 5: TAKSİT / TEDAVİ TAHSİLAT FORMU -->
    <AppModal
      :isOpen="isPayInstallmentModalOpen"
      :title="currentPayingInstallment?.isDirect ? '💵 Ortodonti Tedavi Tahsilatı Al' : '💵 Ortodonti Taksit Tahsilatı Al'"
      width="md"
      @close="isPayInstallmentModalOpen = false"
    >
      <form @submit.prevent="savePayInstallment" class="space-y-4">
        <div v-if="currentPayingInstallment" class="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl text-xs flex justify-between items-center">
          <div>
            <span class="text-slate-400 block text-[10px]">Hasta & Tahsilat Türü</span>
            <span class="font-bold text-slate-800 dark:text-white">
              {{ currentPayingInstallment.patientName }}
              <span class="ml-1 text-indigo-600 dark:text-indigo-400">
                ({{ currentPayingInstallment.installmentNo ? `${currentPayingInstallment.installmentNo}. Taksit` : 'Tedavi Borç Tahsilatı' }})
              </span>
            </span>
          </div>
          <div v-if="currentPayingInstallment.dueDate" class="text-right">
            <span class="text-slate-400 block text-[10px]">Vade</span>
            <span class="font-mono font-semibold">{{ formatDate(currentPayingInstallment.dueDate) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Tahsil Edilen Tutar (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="payInstallmentForm.amount"
              type="number"
              step="any"
              min="0.01"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Ödeme Yöntemi <span class="text-rose-500">*</span></label>
            <select
              v-model="payInstallmentForm.method"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option value="cash">💵 Nakit</option>
              <option value="card">💳 Kredi / Banka Kartı</option>
              <option value="transfer">🏦 Havale / EFT</option>
              <option value="other">Diğer</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Hak Ediş Sahibi Hekim <span class="text-rose-500">*</span></label>
          <select
            v-model="payInstallmentForm.doctorId"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
          >
            <option v-for="doc in doctorsList" :key="doc._id" :value="doc._id">
              {{ doc.name }} (%{{ doc.rate }} Hak Ediş)
            </option>
          </select>
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
            Tahsilat genel kasaya girer, hekime %{{ getDoctorRate(payInstallmentForm.doctorId) }} hak ediş ({{ formatCurrency(Math.round((payInstallmentForm.amount * getDoctorRate(payInstallmentForm.doctorId) / 100) * 100) / 100) }}) tahakkuk eder.
          </span>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Ödeme Tarihi <span class="text-rose-500">*</span></label>
          <input
            v-model="payInstallmentForm.date"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs sm:text-sm text-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Not</label>
          <input
            v-model="payInstallmentForm.notes"
            type="text"
            placeholder="Dekont no, elden nakit alındı vb."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-white"
          />
        </div>
      </form>

      <template #footer>
        <button
          @click="isPayInstallmentModalOpen = false"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          İptal
        </button>
        <button
          @click="savePayInstallment"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          {{ isSubmitting ? 'Kaydediliyor...' : 'Tahsilatı Onayla' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const activeSubTab = ref('patients');
const isLoading = ref(false);
const isSubmitting = ref(false);

const plans = ref([]);
const sessions = ref([]);
const stats = ref({});
const allPatients = ref([]);
const doctorsList = ref([]);

const searchPatientQuery = ref('');
const statusFilter = ref('all');
const installmentFilter = ref('pending');

// Seanslar ve Taksitler için Hasta Gruplama & Filtreleme Durumları
const sessionPatientFilter = ref('all');
const sessionSearchQuery = ref('');
const sessionViewMode = ref('by_patient');
const installmentPatientFilter = ref('all');
const installmentSearchQuery = ref('');
const installmentViewMode = ref('by_patient');

// Modal durumları
const isNewPlanModalOpen = ref(false);
const isSessionModalOpen = ref(false);
const isEditPlanModalOpen = ref(false);
const isCancelOrDeletePlanModalOpen = ref(false);
const isPayInstallmentModalOpen = ref(false);

const editingSessionId = ref(null);
const isSelectingPatientForSession = ref(false);
const currentPayingInstallment = ref(null);
const selectedPlanForAction = ref(null);

// Form başlangıç durumları
const todayStr = () => new Date().toISOString().split('T')[0];

const defaultPlanForm = () => ({
  patientId: '',
  doctorId: '',
  planType: 'installments',
  bracketType: 'Metal Braket',
  totalAmount: 30000,
  downPayment: 5000,
  downPaymentMethod: 'cash',
  durationMonths: 10,
  startDate: todayStr(),
  diagnosis: '',
  notes: ''
});

const defaultSessionForm = () => ({
  patientId: '',
  planId: '',
  doctorId: doctorsList.value[0]?._id ? String(doctorsList.value[0]._id) : '',
  sessionNumber: 1,
  date: todayStr(),
  time: '11:00',
  sessionNotes: '',
  archwireUpper: '',
  archwireLower: '',
  elastics: '',
  paymentAmount: 0,
  paymentMethod: 'cash',
  paymentNotes: '',
  nextAppointmentDate: '',
  nextAppointmentTime: '11:00',
  nextAppointmentNotes: ''
});

const planForm = ref(defaultPlanForm());
const sessionForm = ref(defaultSessionForm());

const selectedPatientPlan = computed(() => {
  if (!sessionForm.value.patientId) return null;
  return plans.value.find(p => (p.patientId?._id || p.patientId) === sessionForm.value.patientId && p.status !== 'cancelled') || null;
});

const editPlanForm = ref({
  id: '',
  patientName: '',
  doctorId: '',
  bracketType: 'Metal Braket',
  totalAmount: 0,
  durationMonths: 12,
  status: 'active',
  diagnosis: '',
  notes: ''
});

const payInstallmentForm = ref({
  planId: '',
  installmentNo: 1,
  amount: 0,
  method: 'cash',
  date: todayStr(),
  doctorId: '',
  notes: ''
});

// Veri Yükleme
const loadAllData = async () => {
  try {
    isLoading.value = true;
    const [plansRes, sessionsRes, statsRes, patientsRes, doctorsRes] = await Promise.all([
      $fetch('/api/orthodontics/plans'),
      $fetch('/api/orthodontics/sessions'),
      $fetch('/api/orthodontics/stats'),
      $fetch('/api/patients?all=true&limit=2000'),
      $fetch('/api/doctors')
    ]);

    plans.value = plansRes || [];
    sessions.value = sessionsRes || [];
    stats.value = statsRes || {};
    allPatients.value = Array.isArray(patientsRes) ? patientsRes : (patientsRes?.patients || []);
    const docs = (doctorsRes || []).filter(d => !d.name?.toLowerCase().includes('klinik') && d.username !== 'klinik');
    docs.sort((a, b) => {
      const aIsSelman = a.name?.toLowerCase().includes('selman') || a.username === 'dtselo' || a.name?.toLowerCase().includes('muhammed');
      const bIsSelman = b.name?.toLowerCase().includes('selman') || b.username === 'dtselo' || b.name?.toLowerCase().includes('muhammed');
      if (aIsSelman && !bIsSelman) return -1;
      if (!aIsSelman && bIsSelman) return 1;
      return 0;
    });
    doctorsList.value = docs;

    const defDocId = docs[0]?._id ? String(docs[0]._id) : '';
    if (defDocId) {
      if (!planForm.value.doctorId) planForm.value.doctorId = defDocId;
      if (!sessionForm.value.doctorId) sessionForm.value.doctorId = defDocId;
    }
  } catch (error) {
    console.error('Ortodonti verileri yüklenemedi:', error);
  } finally {
    isLoading.value = false;
  }
};

const ensurePatientsLoaded = async () => {
  if (allPatients.value.length > 0) return;
  try {
    const res = await $fetch('/api/patients?all=true&limit=2000');
    allPatients.value = Array.isArray(res) ? res : (res?.patients || []);
  } catch (err) {
    console.warn('Hastalar yüklenemedi:', err);
  }
};

// Yardımcı Formatlar
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '₺0';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(val);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    return new Date(dateStr).toLocaleDateString('tr-TR');
  } catch {
    return dateStr;
  }
};

const getPatientName = (patientId) => {
  const p = allPatients.value.find(item => item._id === patientId);
  return p ? `${p.firstName} ${p.lastName}` : 'Seçilen Hasta';
};

const getDoctorRate = (doctorId) => {
  const d = doctorsList.value.find(item => item._id === doctorId);
  return d?.rate !== undefined ? d.rate : 30;
};

// Filtreler & Sıralamalar
const filteredPlans = computed(() => {
  return plans.value.filter(p => {
    // Durum Filtresi
    if (statusFilter.value !== 'all' && p.status !== statusFilter.value) return false;

    // Arama
    if (!searchPatientQuery.value.trim()) return true;
    const q = searchPatientQuery.value.toLowerCase();
    const fullName = `${p.patientId?.firstName || ''} ${p.patientId?.lastName || ''}`.toLowerCase();
    const phone = (p.patientId?.phone || '').toLowerCase();
    return fullName.includes(q) || phone.includes(q);
  });
});

const sortedSessions = computed(() => {
  return [...sessions.value].sort((a, b) => {
    const dateComp = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComp !== 0) return dateComp;
    return (b.sessionNumber || 0) - (a.sessionNumber || 0);
  });
});

// Filtrelenmiş Genel Seans Akışı
const filteredSortedSessions = computed(() => {
  return sortedSessions.value.filter(s => {
    if (sessionPatientFilter.value !== 'all') {
      const pId = String(s.patientId?._id || s.patientId || '');
      if (pId !== sessionPatientFilter.value) return false;
    }
    return true;
  });
});

// Ortodonti Hastaları Listesi (Dropdown Seçimi İçin)
const orthoPatientsList = computed(() => {
  const patientMap = new Map();
  plans.value.forEach(p => {
    const pObj = p.patientId;
    if (pObj && pObj._id) {
      patientMap.set(String(pObj._id), {
        id: String(pObj._id),
        name: `${pObj.firstName || ''} ${pObj.lastName || ''}`.trim(),
        phone: pObj.phone || ''
      });
    }
  });
  sessions.value.forEach(s => {
    const pObj = s.patientId;
    if (pObj && pObj._id && !patientMap.has(String(pObj._id))) {
      patientMap.set(String(pObj._id), {
        id: String(pObj._id),
        name: `${pObj.firstName || ''} ${pObj.lastName || ''}`.trim(),
        phone: pObj.phone || ''
      });
    }
  });
  return Array.from(patientMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
});

// Hastaya Göre Ayrı Ayrı Seans Grupları
const patientSessionsGrouped = computed(() => {
  const groups = {};

  plans.value.forEach(plan => {
    const pId = String(plan.patientId?._id || plan.patientId || '');
    if (!pId) return;
    if (sessionPatientFilter.value !== 'all' && pId !== sessionPatientFilter.value) return;
    groups[pId] = {
      patient: plan.patientId,
      plan,
      sessions: []
    };
  });

  sessions.value.forEach(s => {
    const pId = String(s.patientId?._id || s.patientId || '');
    if (!pId) return;
    if (sessionPatientFilter.value !== 'all' && pId !== sessionPatientFilter.value) return;

    if (!groups[pId]) {
      groups[pId] = {
        patient: s.patientId,
        plan: plans.value.find(p => String(p.patientId?._id || p.patientId) === pId) || null,
        sessions: []
      };
    }
    groups[pId].sessions.push(s);
  });

  let list = Object.values(groups);
  if (sessionSearchQuery.value.trim()) {
    const q = sessionSearchQuery.value.trim().toLowerCase();
    list = list.filter(g => {
      const name = `${g.patient?.firstName || ''} ${g.patient?.lastName || ''}`.toLowerCase();
      const phone = (g.patient?.phone || '').toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }

  list.forEach(g => {
    g.sessions.sort((a, b) => {
      const d1 = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (d1 !== 0) return d1;
      return (b.sessionNumber || 0) - (a.sessionNumber || 0);
    });
  });

  return list.sort((a, b) => {
    if (b.sessions.length !== a.sessions.length) {
      return b.sessions.length - a.sessions.length;
    }
    const nameA = `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.toLowerCase();
    const nameB = `${b.patient?.firstName || ''} ${b.patient?.lastName || ''}`.toLowerCase();
    return nameA.localeCompare(nameB, 'tr');
  });
});

// Hastaya Göre Ayrı Ayrı Finans & Taksit Grupları
const installmentsByPatient = computed(() => {
  return plans.value
    .filter(plan => {
      const pId = String(plan.patientId?._id || plan.patientId || '');
      if (installmentPatientFilter.value !== 'all' && pId !== installmentPatientFilter.value) {
        return false;
      }
      if (installmentSearchQuery.value.trim()) {
        const q = installmentSearchQuery.value.trim().toLowerCase();
        const name = `${plan.patientId?.firstName || ''} ${plan.patientId?.lastName || ''}`.toLowerCase();
        const phone = (plan.patientId?.phone || '').toLowerCase();
        if (!name.includes(q) && !phone.includes(q)) return false;
      }
      if (installmentFilter.value === 'pending') {
        const hasPendingInst = (plan.installments || []).some(i => i.status === 'pending');
        const hasRemaining = (plan.summary?.remainingBalance ?? plan.totalAmount) > 0;
        return hasPendingInst || (plan.summary?.isPerSession && hasRemaining);
      }
      if (installmentFilter.value === 'paid') {
        const hasPaidInst = (plan.installments || []).some(i => i.status === 'paid');
        const hasPaidAny = (plan.summary?.totalPaidOverall || 0) > 0;
        return hasPaidInst || hasPaidAny;
      }
      return true;
    })
    .map(plan => {
      let planInstallments = plan.installments || [];
      if (installmentFilter.value === 'pending') {
        planInstallments = planInstallments.filter(i => i.status === 'pending');
      } else if (installmentFilter.value === 'paid') {
        planInstallments = planInstallments.filter(i => i.status === 'paid');
      }

      return {
        plan,
        patient: plan.patientId,
        installments: planInstallments,
        allInstallments: plan.installments || []
      };
    });
});

// Tüm Taksitlerin Düzleştirilmiş Listesi
const allInstallmentsList = computed(() => {
  const result = [];
  plans.value.forEach(plan => {
    (plan.installments || []).forEach(ins => {
      result.push({
        planId: plan._id,
        patientId: plan.patientId?._id,
        patientName: `${plan.patientId?.firstName || ''} ${plan.patientId?.lastName || ''}`,
        doctorName: plan.doctorId?.name || 'Diş Hekimi',
        doctorId: plan.doctorId?._id || plan.doctorId,
        installmentNo: ins.installmentNo,
        dueDate: ins.dueDate,
        amount: ins.amount,
        status: ins.status,
        paymentDate: ins.paymentDate
      });
    });
  });
  return result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
});

const pendingInstallmentsCount = computed(() => {
  return allInstallmentsList.value.filter(i => i.status === 'pending').length;
});

const filteredInstallments = computed(() => {
  return allInstallmentsList.value.filter(i => {
    if (installmentPatientFilter.value !== 'all') {
      if (String(i.patientId) !== installmentPatientFilter.value) return false;
    }
    if (installmentFilter.value === 'pending') return i.status === 'pending';
    if (installmentFilter.value === 'paid') return i.status === 'paid';
    return true;
  });
});

// Modal Açma Fonksiyonları
const openNewPlanModal = async () => {
  await ensurePatientsLoaded();
  planForm.value = defaultPlanForm();
  if (doctorsList.value.length > 0) planForm.value.doctorId = doctorsList.value[0]._id;
  isNewPlanModalOpen.value = true;
};

const openEditPlanModal = (plan) => {
  editPlanForm.value = {
    id: plan._id,
    patientName: `${plan.patientId?.firstName || ''} ${plan.patientId?.lastName || ''}`,
    doctorId: plan.doctorId?._id || plan.doctorId || (doctorsList.value[0]?._id || ''),
    bracketType: plan.bracketType || 'Metal Braket',
    totalAmount: plan.totalAmount || 0,
    durationMonths: plan.durationMonths || 12,
    status: plan.status || 'active',
    diagnosis: plan.diagnosis || '',
    notes: plan.notes || ''
  };
  isEditPlanModalOpen.value = true;
};

const openCancelOrDeletePlanModal = (plan) => {
  selectedPlanForAction.value = plan;
  isCancelOrDeletePlanModalOpen.value = true;
};

const openSessionModal = async (plan = null) => {
  await ensurePatientsLoaded();
  editingSessionId.value = null;
  sessionForm.value = defaultSessionForm();
  isSelectingPatientForSession.value = !plan;

  if (plan) {
    sessionForm.value.patientId = plan.patientId?._id;
    sessionForm.value.planId = plan._id;
    sessionForm.value.doctorId = plan.doctorId?._id || plan.doctorId || (doctorsList.value[0]?._id ? String(doctorsList.value[0]._id) : '');

    // Bu hastanın kaçıncı seansı olduğunu bul
    const patientSessions = sessions.value.filter(s => (s.patientId?._id || s.patientId) === (plan.patientId?._id || plan.patientId));
    sessionForm.value.sessionNumber = patientSessions.length + 1;
  } else if (doctorsList.value.length > 0) {
    sessionForm.value.doctorId = String(doctorsList.value[0]._id);
  }

  isSessionModalOpen.value = true;
};

const openEditSessionModal = (s) => {
  editingSessionId.value = s._id;
  sessionForm.value = {
    patientId: s.patientId?._id || s.patientId,
    planId: s.planId,
    doctorId: s.doctorId?._id || s.doctorId || (doctorsList.value[0]?._id ? String(doctorsList.value[0]._id) : ''),
    sessionNumber: s.sessionNumber,
    date: s.date,
    time: s.time || '11:00',
    sessionNotes: s.sessionNotes,
    archwireUpper: s.archwireUpper || '',
    archwireLower: s.archwireLower || '',
    elastics: s.elastics || '',
    paymentAmount: s.paymentAmount || 0,
    paymentMethod: s.paymentMethod || 'cash',
    paymentNotes: s.paymentNotes || '',
    nextAppointmentDate: s.nextAppointmentDate || '',
    nextAppointmentTime: s.nextAppointmentTime || '11:00',
    nextAppointmentNotes: s.nextAppointmentNotes || ''
  };
  isSelectingPatientForSession.value = false;
  isSessionModalOpen.value = true;
};

const openPayInstallmentModal = (item) => {
  currentPayingInstallment.value = item;
  payInstallmentForm.value = {
    planId: item.planId,
    installmentNo: item.installmentNo,
    amount: item.amount,
    method: 'cash',
    date: todayStr(),
    doctorId: item.doctorId || (doctorsList.value[0]?._id || ''),
    notes: `Ortodonti ${item.installmentNo}. Taksit Tahsilatı`
  };
  isPayInstallmentModalOpen.value = true;
};

const openDirectPaymentModal = (plan) => {
  const patientObj = plan.patientId || {};
  currentPayingInstallment.value = {
    planId: plan._id,
    patientId: patientObj._id || plan.patientId,
    patientName: `${patientObj.firstName || ''} ${patientObj.lastName || ''}`.trim() || 'Ortodonti Hastası',
    installmentNo: null,
    isDirect: true
  };
  payInstallmentForm.value = {
    planId: plan._id,
    installmentNo: null,
    amount: plan.summary?.remainingBalance ?? plan.totalAmount,
    method: 'cash',
    date: todayStr(),
    doctorId: plan.doctorId?._id || plan.doctorId || (doctorsList.value[0]?._id ? String(doctorsList.value[0]._id) : ''),
    notes: 'Ortodonti Tedavi Tahsilatı'
  };
  isPayInstallmentModalOpen.value = true;
};

// Kayıt & Güncelleme & Silme İşlemleri
const saveNewPlan = async () => {
  if (!planForm.value.patientId || !planForm.value.totalAmount) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen hasta ve toplam tutar alanlarını doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSubmitting.value = true;
    await $fetch('/api/orthodontics/plans', {
      method: 'POST',
      body: planForm.value
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Ortodonti tedavi anlaşması ve taksit planı başarıyla oluşturuldu.', type: 'success' }
    }));

    isNewPlanModalOpen.value = false;
    await loadAllData();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Anlaşma oluşturulamadı.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const saveEditPlan = async () => {
  if (!editPlanForm.value.id || !editPlanForm.value.totalAmount) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen zorunlu alanları doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSubmitting.value = true;
    await $fetch(`/api/orthodontics/plans/${editPlanForm.value.id}`, {
      method: 'PUT',
      body: {
        doctorId: editPlanForm.value.doctorId,
        bracketType: editPlanForm.value.bracketType,
        totalAmount: Number(editPlanForm.value.totalAmount),
        durationMonths: Number(editPlanForm.value.durationMonths),
        status: editPlanForm.value.status,
        diagnosis: editPlanForm.value.diagnosis,
        notes: editPlanForm.value.notes
      }
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Ortodonti anlaşması ve taksit planı başarıyla güncellendi.', type: 'success' }
    }));

    isEditPlanModalOpen.value = false;
    await loadAllData();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Hata oluştu.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const cancelPlan = async () => {
  if (!selectedPlanForAction.value) return;
  try {
    isSubmitting.value = true;
    await $fetch(`/api/orthodontics/plans/${selectedPlanForAction.value._id}`, {
      method: 'PUT',
      body: { status: 'cancelled' }
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Tedavi iptal edildi olarak işaretlendi ve taksitler durduruldu.', type: 'success' }
    }));

    isCancelOrDeletePlanModalOpen.value = false;
    selectedPlanForAction.value = null;
    await loadAllData();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'İptal işlemi başarısız oldu.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const deletePlan = async () => {
  if (!selectedPlanForAction.value) return;
  if (!confirm('Ortodonti tedavi anlaşmasını ve bağlı taksit/tedavi kayıtlarını tamamen silmek istediğinize emin misiniz?')) return;

  try {
    isSubmitting.value = true;
    await $fetch(`/api/orthodontics/plans/${selectedPlanForAction.value._id}`, {
      method: 'DELETE'
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Ortodonti anlaşması tamamen silindi.', type: 'success' }
    }));

    isCancelOrDeletePlanModalOpen.value = false;
    selectedPlanForAction.value = null;
    await loadAllData();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Silme işlemi başarısız oldu.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const saveSession = async () => {
  if (!sessionForm.value.patientId || !sessionForm.value.sessionNotes) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen hasta ve seans notu alanını doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSubmitting.value = true;
    if (editingSessionId.value) {
      await $fetch(`/api/orthodontics/sessions/${editingSessionId.value}`, {
        method: 'PUT',
        body: sessionForm.value
      });
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Seans notu güncellendi.', type: 'success' }
      }));
    } else {
      await $fetch('/api/orthodontics/sessions', {
        method: 'POST',
        body: sessionForm.value
      });
      const paymentMsg = sessionForm.value.paymentAmount > 0 
        ? ` ve ${formatCurrency(sessionForm.value.paymentAmount)} tahsilat kasaya/hekime işlendi.` 
        : '';
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: `Seans notu başarıyla arşive kaydedildi${paymentMsg}`, type: 'success' }
      }));
      if (sessionForm.value.paymentAmount > 0) {
        window.dispatchEvent(new CustomEvent('refresh-stats'));
      }
    }

    isSessionModalOpen.value = false;
    await loadAllData();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Hata oluştu.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const deleteSession = async (id) => {
  if (!confirm('Bu seans kaydını silmek istediğinize emin misiniz?')) return;
  try {
    await $fetch(`/api/orthodontics/sessions/${id}`, { method: 'DELETE' });
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Seans kaydı silindi.', type: 'success' }
    }));
    await loadAllData();
  } catch (error) {
    console.error(error);
  }
};

const savePayInstallment = async () => {
  try {
    isSubmitting.value = true;
    if (payInstallmentForm.value.installmentNo) {
      await $fetch(`/api/orthodontics/plans/${payInstallmentForm.value.planId}/pay-installment`, {
        method: 'POST',
        body: payInstallmentForm.value
      });
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Taksit tahsilatı kasaya ve hekim hak edişine işlendi.', type: 'success' }
      }));
    } else {
      await $fetch('/api/payments', {
        method: 'POST',
        body: {
          patientId: currentPayingInstallment.value?.patientId,
          orthodonticPlanId: payInstallmentForm.value.planId,
          isOrthodontic: true,
          amount: Number(payInstallmentForm.value.amount),
          method: payInstallmentForm.value.method,
          date: payInstallmentForm.value.date,
          doctorId: payInstallmentForm.value.doctorId,
          notes: payInstallmentForm.value.notes
        }
      });
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Tedavi tahsilatı kasaya ve hekim hak edişine işlendi.', type: 'success' }
      }));
    }

    isPayInstallmentModalOpen.value = false;
    await loadAllData();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Hata oluştu.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadAllData();
});
</script>
