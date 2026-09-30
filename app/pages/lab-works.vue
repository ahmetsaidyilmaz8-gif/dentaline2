<template>
  <div class="flex flex-col gap-8">
    
    <!-- Üst Başlık ve Yeni İş Ekle Butonu -->
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Laboratuvar & Protez Takip Paneli</h2>
        <p class="text-base text-slate-500 dark:text-slate-400 font-medium">
          Dış laboratuvarlara ve teknisyenlere gönderilen zirkonyum, porselen ve protez işlerinin güncel durumu ve maliyetleri.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="openNewLabWorkModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/15 active:scale-95 transition-all shadow-sm"
        >
          <Icon name="heroicons:plus-circle" class="w-4 h-4" />
          <span>Yeni Laboratuvar İşi Ekle</span>
        </button>
      </div>
    </div>

    <!-- Bildirim Bildirisi (Başarı / Bilgi) -->
    <div
      v-if="toastMessage"
      class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in"
    >
      <div class="flex items-center gap-2">
        <Icon name="heroicons:check-circle" class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
      <button @click="toastMessage = ''" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <Icon name="heroicons:x-mark" class="w-4 h-4" />
      </button>
    </div>

    <!-- Özet İstatistik Kartları -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <!-- Toplam İş -->
      <div
        @click="statusFilter = 'all'"
        :class="[
          'p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 border',
          statusFilter === 'all'
            ? 'ring-2 ring-slate-400 dark:ring-slate-500 bg-slate-50/80 dark:bg-slate-800/60 border-slate-300 dark:border-slate-600'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        ]"
      >
        <div class="space-y-1">
          <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Toplam İş</span>
          <span class="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono block mt-1 leading-none">
            {{ labWorks.length }}
          </span>
          <span class="text-[11px] text-slate-400 font-semibold block">Tüm kayıtlı teknisyen işleri</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:cube" class="w-6 h-6" />
        </div>
      </div>

      <!-- Teknisyende -->
      <div
        @click="statusFilter = 'sent'"
        :class="[
          'p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 border',
          statusFilter === 'sent'
            ? 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        ]"
      >
        <div class="space-y-1">
          <span class="text-xs text-amber-500 font-bold uppercase tracking-wider block">Teknisyende (Bekliyor)</span>
          <span class="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono block mt-1 leading-none">
            {{ countByStatus('sent') }}
          </span>
          <span class="text-[11px] text-slate-400 font-semibold block">Üretim aşamasındaki işler</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:clock" class="w-6 h-6" />
        </div>
      </div>

      <!-- Kliniğe Ulaştı -->
      <div
        @click="statusFilter = 'received'"
        :class="[
          'p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 border',
          statusFilter === 'received'
            ? 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        ]"
      >
        <div class="space-y-1">
          <span class="text-xs text-emerald-500 font-bold uppercase tracking-wider block">Kliniğe Ulaştı (Hazır)</span>
          <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono block mt-1 leading-none">
            {{ countByStatus('received') }}
          </span>
          <span class="text-[11px] text-slate-400 font-semibold block">Prova / yapıştırma bekleyen</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:check-badge" class="w-6 h-6" />
        </div>
      </div>

      <!-- Hastaya Takıldı -->
      <div
        @click="statusFilter = 'fitted'"
        :class="[
          'p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 border',
          statusFilter === 'fitted'
            ? 'ring-2 ring-sky-500 bg-sky-50/50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-700'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        ]"
      >
        <div class="space-y-1">
          <span class="text-xs text-sky-500 font-bold uppercase tracking-wider block">Hastaya Takıldı</span>
          <span class="text-3xl font-black text-sky-600 dark:text-sky-400 font-mono block mt-1 leading-none">
            {{ countByStatus('fitted') }}
          </span>
          <span class="text-[11px] text-slate-400 font-semibold block">Tamamlanan protez işleri</span>
        </div>
        <div class="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
          <Icon name="heroicons:check" class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Filtre & Arama Çubuğu -->
    <div class="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:w-80">
        <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Hasta, laboratuvar veya işlem ara..."
          class="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-teal-500 text-slate-800 dark:text-white"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          @click="statusFilter = f.value"
          :class="[
            statusFilter === f.value
              ? 'bg-teal-600 text-white font-bold'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100',
            'px-3.5 py-2 rounded-xl transition-all whitespace-nowrap'
          ]"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Tablo Alanı -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
              <th class="px-6 py-4">Hasta</th>
              <th class="px-6 py-4">İş Türü & Diş</th>
              <th class="px-6 py-4">Laboratuvar</th>
              <th class="px-6 py-4">Renk</th>
              <th class="px-6 py-4">Tarihler</th>
              <th class="px-6 py-4">Lab Ücreti (Maliyet)</th>
              <th class="px-6 py-4">Durum</th>
              <th class="px-6 py-4 text-right">Eylemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="isLoading">
              <td colspan="8" class="px-6 py-12 text-center text-slate-400">
                <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                <span>Laboratuvar işleri yükleniyor...</span>
              </td>
            </tr>

            <tr v-else-if="filteredLabWorks.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                Eşleşen laboratuvar kaydı bulunamadı.
              </td>
            </tr>

            <tr
              v-for="item in filteredLabWorks"
              :key="item._id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <!-- Hasta Adı -->
              <td class="px-6 py-4">
                <NuxtLink
                  :to="`/patients/${item.patientId}`"
                  class="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5"
                >
                  <Icon name="heroicons:user" class="w-4 h-4 text-slate-400" />
                  <span>{{ item.patientName }}</span>
                </NuxtLink>
              </td>

              <!-- İş Türü & Diş -->
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-800 dark:text-slate-100">
                  {{ item.workType }}
                </div>
                <div v-if="item.toothNumbers && item.toothNumbers.length > 0" class="text-xs font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                  Diş: {{ item.toothNumbers.join(', ') }}
                </div>
              </td>

              <!-- Laboratuvar Adı -->
              <td class="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                {{ item.labName }}
              </td>

              <!-- Renk -->
              <td class="px-6 py-4">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                  {{ item.shadeColor || 'A2' }}
                </span>
              </td>

              <!-- Tarihler -->
              <td class="px-6 py-4 text-xs space-y-0.5">
                <div class="text-slate-400">
                  Gön: {{ formatDate(item.sentDate) }}
                </div>
                <div :class="[isOverdue(item.expectedDate, item.status) ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-200 font-semibold']">
                  Bek: {{ formatDate(item.expectedDate) }}
                  <span v-if="isOverdue(item.expectedDate, item.status)" class="text-[10px] text-rose-500">(Gecikti)</span>
                </div>
              </td>

              <!-- Lab Ücreti / Maliyet -->
              <td class="px-6 py-4">
                <div v-if="item.price && item.price > 0" class="flex flex-col gap-1">
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {{ formatCurrency(item.price) }}
                  </span>
                  <span
                    v-if="item.isExpenseRecorded"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
                    title="Bu ücret Klinik Giderleri modülüne aktarıldı"
                  >
                    <Icon name="heroicons:check-circle" class="w-3.5 h-3.5" />
                    <span>Gidere Aktarıldı</span>
                  </span>
                </div>
                <div v-else class="text-xs text-slate-400 italic flex items-center gap-1.5">
                  <span>—</span>
                  <button
                    @click="openEditLabWorkModal(item)"
                    class="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                    title="Fiyat girmek için düzenle"
                  >
                    + Fiyat Gir
                  </button>
                </div>
              </td>

              <!-- Durum Rozeti -->
              <td class="px-6 py-4">
                <span
                  :class="[
                    statusConfig[item.status]?.badgeClass || 'bg-slate-100 text-slate-600',
                    'px-2.5 py-1 rounded-full text-xs font-bold inline-block border'
                  ]"
                >
                  {{ statusConfig[item.status]?.label || item.status }}
                </span>
              </td>

              <!-- Hızlı Eylemler -->
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1.5 flex-wrap">
                  <!-- Kliniğe Geldi Butonu -->
                  <button
                    v-if="item.status === 'sent' || item.status === 'revision'"
                    @click="handleMarkReceived(item)"
                    class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                    title="Kliniğe Ulaştı Olarak İşaretle"
                  >
                    ✓ Geldi
                  </button>

                  <!-- WhatsApp Bildirimi (Hasta telefonunu bulup tetikle) -->
                  <button
                    v-if="item.status === 'received'"
                    @click="sendWhatsAppToPatient(item)"
                    class="p-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                    title="Hastaya WhatsApp İle Hazır Bildirimi Gönder"
                  >
                    <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
                  </button>

                  <!-- Takıldı Butonu -->
                  <button
                    v-if="item.status === 'received'"
                    @click="updateStatus(item._id, 'fitted')"
                    class="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                    title="Hastaya Takıldı"
                  >
                    Takıldı
                  </button>

                  <!-- Tek Tıkla Gidere Aktar Butonu (Fiyat var ve henüz aktarılmamışsa) -->
                  <button
                    v-if="item.price > 0 && !item.isExpenseRecorded"
                    @click="openTransferExpenseModal(item)"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 rounded-lg text-xs font-bold transition-all active:scale-95"
                    title="Laboratuvar ücretini Klinik Masraflarına (Gider) aktar"
                  >
                    <Icon name="heroicons:banknotes" class="w-3.5 h-3.5" />
                    <span>Gidere Aktar</span>
                  </button>

                  <!-- Düzenle Butonu (Kalem İkonu) -->
                  <button
                    @click="openEditLabWorkModal(item)"
                    class="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                    title="İş Bilgilerini & Fiyatını Düzenle"
                  >
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>

                  <!-- Sil -->
                  <button
                    @click="deleteLabWork(item._id)"
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
    </div>

    <!-- Yeni Laboratuvar İşi Modalı (Hasta Seçimli) -->
    <AppModal
      :isOpen="isModalOpen"
      title="🔬 Yeni Laboratuvar & Protez İşi Kaydı"
      width="md"
      @close="isModalOpen = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Hasta <span class="text-rose-500">*</span>
          </label>
          <PatientSearchSelect
            v-model="form.patientId"
            :patients="patientsList"
            placeholder="Hasta adı veya telefon numarası yazın..."
            :required="true"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Teknisyen / Laboratuvar Adı <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.labName"
            type="text"
            list="global-lab-suggestions"
            required
            placeholder="Örn: Kumluca Dental Lab"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
          <datalist id="global-lab-suggestions">
            <option value="Kumluca Dental Lab" />
            <option value="Özlem Diş Protez Lab" />
            <option value="Merkez Dental Laboratuvarı" />
            <option value="Antalya Zirkon & Cad-Cam Lab" />
          </datalist>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              İş Türü <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.workType"
              type="text"
              list="global-worktype-suggestions"
              required
              placeholder="Örn: Zirkonyum Kuron"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
            <datalist id="global-worktype-suggestions">
              <option value="Zirkonyum Kuron" />
              <option value="E-Max Kuron / Lamina" />
              <option value="Metal Destekli Porselen" />
              <option value="Total Protez" />
              <option value="Bölümlü (İskelet) Protez" />
              <option value="Gece Plağı / Bruksizm" />
              <option value="İmplant Üstü Zirkonyum" />
              <option value="Geçici Kuron" />
            </datalist>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Diş No (Virgülle)
            </label>
            <input
              v-model="form.toothNumbers"
              type="text"
              placeholder="Örn: 11, 21, 22"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Renk Kodu
            </label>
            <input
              v-model="form.shadeColor"
              type="text"
              placeholder="A2, BL2..."
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Gönderim Tarihi
            </label>
            <input
              v-model="form.sentDate"
              type="date"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Beklenen Teslim <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.expectedDate"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Lab Maliyeti (₺)
          </label>
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            step="50"
            placeholder="0"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Teknisyene Notlar
          </label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Basamak türü, oklüzyon, özel istekler..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="isModalOpen = false"
            class="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold"
          >
            Vazgeç
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            @click="saveLabWork"
            class="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm"
          >
            Kaydet
          </button>
        </div>
      </div>
    </AppModal>

    <!-- Laboratuvar İşi Düzenleme Modalı (Requirement 1) -->
    <AppModal
      :isOpen="isEditModalOpen"
      title="✏️ Laboratuvar & Protez İşini Düzenle"
      width="md"
      @close="isEditModalOpen = false"
    >
      <div class="space-y-4">
        <!-- Hasta Adı Bilgisi -->
        <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="heroicons:user" class="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <span class="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Hasta</span>
              <span class="text-sm font-bold text-slate-800 dark:text-white">{{ editForm.patientName }}</span>
            </div>
          </div>
          <span
            :class="[
              statusConfig[editForm.status]?.badgeClass || 'bg-slate-100 text-slate-600',
              'px-2.5 py-1 rounded-full text-xs font-bold border'
            ]"
          >
            {{ statusConfig[editForm.status]?.label || editForm.status }}
          </span>
        </div>

        <!-- Teknisyen / Laboratuvar Adı -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Teknisyen / Laboratuvar Adı <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="editForm.labName"
            type="text"
            list="edit-lab-suggestions"
            required
            placeholder="Örn: Kumluca Dental Lab"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
          <datalist id="edit-lab-suggestions">
            <option value="Kumluca Dental Lab" />
            <option value="Özlem Diş Protez Lab" />
            <option value="Merkez Dental Laboratuvarı" />
            <option value="Antalya Zirkon & Cad-Cam Lab" />
          </datalist>
        </div>

        <!-- İş Türü & Diş No -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              İş Türü <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="editForm.workType"
              type="text"
              list="edit-worktype-suggestions"
              required
              placeholder="Örn: Zirkonyum Kuron"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
            <datalist id="edit-worktype-suggestions">
              <option value="Zirkonyum Kuron" />
              <option value="E-Max Kuron / Lamina" />
              <option value="Metal Destekli Porselen" />
              <option value="Total Protez" />
              <option value="Bölümlü (İskelet) Protez" />
              <option value="Gece Plağı / Bruksizm" />
              <option value="İmplant Üstü Zirkonyum" />
              <option value="Geçici Kuron" />
            </datalist>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Diş No (Virgülle)
            </label>
            <input
              v-model="editForm.toothNumbers"
              type="text"
              placeholder="Örn: 11, 21, 22"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
            />
          </div>
        </div>

        <!-- Renk & Tarihler -->
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Renk Kodu
            </label>
            <input
              v-model="editForm.shadeColor"
              type="text"
              placeholder="A2, BL2..."
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Gönderim Tarihi
            </label>
            <input
              v-model="editForm.sentDate"
              type="date"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Beklenen Teslim <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="editForm.expectedDate"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
            />
          </div>
        </div>

        <!-- Durum ve Lab Ücreti -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              İş Durumu
            </label>
            <select
              v-model="editForm.status"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
            >
              <option value="sent">Teknisyende (Bekliyor)</option>
              <option value="received">Kliniğe Ulaştı (Hazır)</option>
              <option value="fitted">Hastaya Takıldı</option>
              <option value="revision">Revizyonda</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Laboratuvar Ücreti / Maliyet (₺)
            </label>
            <input
              v-model.number="editForm.price"
              type="number"
              min="0"
              step="50"
              placeholder="0"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold"
            />
          </div>
        </div>

        <!-- Notlar -->
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Teknisyene Notlar
          </label>
          <textarea
            v-model="editForm.notes"
            rows="2"
            placeholder="Basamak türü, oklüzyon, özel istekler..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="isEditModalOpen = false"
          class="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold"
        >
          Vazgeç
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          @click="saveEditedLabWork"
          class="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-1.5"
        >
          <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>Değişiklikleri Kaydet</span>
        </button>
      </template>
    </AppModal>

    <!-- Laboratuvar Ücretini Gidere Aktarma Modalı (Opsiyonel Kolaylık) -->
    <AppModal
      :isOpen="isTransferModalOpen"
      title="💸 Laboratuvar Masrafını Klinik Giderine Aktar"
      width="md"
      @close="isTransferModalOpen = false"
    >
      <div v-if="transferTarget" class="space-y-4">
        <div class="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
          Bu işlem, bu protez işinin maliyetini <strong>Klinik Finans & Gider Yönetimi</strong> modülüne <strong>Laboratuvar Ödemesi</strong> gideri olarak otomatik işler ve net kâr hesabına yansıtır.
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">İlgili İş & Hasta</label>
          <div class="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-sm font-bold text-slate-800 dark:text-white">
            {{ transferTarget.patientName }} — {{ transferTarget.workType }} ({{ transferTarget.labName }})
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Gider Tutarı (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="transferForm.amount"
              type="number"
              min="0.01"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono font-bold"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Ödeme Yöntemi</label>
            <select
              v-model="transferForm.paymentMethod"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            >
              <option value="cash">💵 Nakit</option>
              <option value="transfer">🏦 Havale / EFT</option>
              <option value="card">💳 Kredi Kartı</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Ödeme Tarihi</label>
          <input
            v-model="transferForm.date"
            type="date"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Açıklama</label>
          <input
            v-model="transferForm.description"
            type="text"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="isTransferModalOpen = false"
          class="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold"
        >
          İptal
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          @click="confirmTransferExpense"
          class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-1.5"
        >
          <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>Klinik Gideri Olarak Kaydet</span>
        </button>
      </template>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUtils } from '~/composables/useUtils';

const { formatDate, formatCurrency, todayStr } = useUtils();

const labWorks = ref([]);
const patientsList = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const isModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isTransferModalOpen = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const toastMessage = ref('');

const form = ref({
  patientId: '',
  labName: 'Kumluca Dental Lab',
  workType: 'Zirkonyum Kuron',
  toothNumbers: '',
  shadeColor: 'A2',
  sentDate: todayStr(),
  expectedDate: '',
  price: 0,
  notes: ''
});

const editForm = ref({
  id: '',
  patientId: '',
  patientName: '',
  labName: '',
  workType: '',
  toothNumbers: '',
  shadeColor: 'A2',
  sentDate: '',
  expectedDate: '',
  price: 0,
  status: 'sent',
  notes: ''
});

const transferTarget = ref(null);
const transferForm = ref({
  amount: 0,
  paymentMethod: 'cash',
  date: todayStr(),
  description: ''
});

const filterOptions = [
  { value: 'all', label: 'Tüm İşler' },
  { value: 'sent', label: 'Teknisyende' },
  { value: 'received', label: 'Kliniğe Ulaştı' },
  { value: 'fitted', label: 'Hastaya Takıldı' },
  { value: 'revision', label: 'Revizyonda' }
];

const statusConfig = {
  sent: {
    label: 'Teknisyende',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  },
  received: {
    label: 'Kliniğe Ulaştı',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  fitted: {
    label: 'Hastaya Takıldı',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
  },
  revision: {
    label: 'Revizyonda',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  }
};

const showToast = (msg) => {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = '';
  }, 4000);
};

const countByStatus = (status) => {
  return labWorks.value.filter(w => w.status === status).length;
};

const isOverdue = (expectedDate, status) => {
  if (!expectedDate || status === 'fitted' || status === 'received') return false;
  return new Date(expectedDate) < new Date(new Date().setHours(0, 0, 0, 0));
};

const filteredLabWorks = computed(() => {
  return labWorks.value.filter(item => {
    const matchesStatus = statusFilter.value === 'all' || item.status === statusFilter.value;
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesSearch =
      (item.patientName || '').toLowerCase().includes(query) ||
      (item.labName || '').toLowerCase().includes(query) ||
      (item.workType || '').toLowerCase().includes(query) ||
      (item.toothNumbers || []).join(',').includes(query);

    return matchesStatus && matchesSearch;
  });
});

const loadData = async () => {
  try {
    isLoading.value = true;
    const [worksData, patientsData] = await Promise.all([
      $fetch('/api/lab-works'),
      $fetch('/api/patients')
    ]);
    labWorks.value = worksData || [];
    patientsList.value = Array.isArray(patientsData) ? patientsData : (patientsData?.patients || []);
  } catch (error) {
    console.error('Veriler yüklenirken hata:', error);
  } finally {
    isLoading.value = false;
  }
};

const openNewLabWorkModal = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  const fiveDaysLater = d.toISOString().split('T')[0];

  form.value = {
    patientId: patientsList.value.length > 0 ? patientsList.value[0]._id : '',
    labName: 'Kumluca Dental Lab',
    workType: 'Zirkonyum Kuron',
    toothNumbers: '',
    shadeColor: 'A2',
    sentDate: todayStr(),
    expectedDate: fiveDaysLater,
    price: 0,
    notes: ''
  };
  isModalOpen.value = true;
};

const saveLabWork = async () => {
  if (!form.value.patientId || !form.value.labName || !form.value.workType || !form.value.expectedDate) {
    alert('Lütfen tüm zorunlu alanları doldurun.');
    return;
  }

  try {
    isSubmitting.value = true;
    const selectedPatient = patientsList.value.find(p => p._id === form.value.patientId);
    const teeth = form.value.toothNumbers
      ? form.value.toothNumbers.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    await $fetch('/api/lab-works', {
      method: 'POST',
      body: {
        patientId: form.value.patientId,
        patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Hasta',
        labName: form.value.labName,
        workType: form.value.workType,
        toothNumbers: teeth,
        shadeColor: form.value.shadeColor,
        sentDate: form.value.sentDate,
        expectedDate: form.value.expectedDate,
        price: Number(form.value.price) || 0,
        notes: form.value.notes
      }
    });

    isModalOpen.value = false;
    showToast('Yeni laboratuvar işi başarıyla kaydedildi.');
    await loadData();
  } catch (error) {
    console.error(error);
    alert('Laboratuvar işi kaydedilemedi.');
  } finally {
    isSubmitting.value = false;
  }
};

// Düzenleme Modalını Aç (Requirement 1)
const openEditLabWorkModal = (item) => {
  const sentFormatted = item.sentDate ? new Date(item.sentDate).toISOString().split('T')[0] : todayStr();
  const expectedFormatted = item.expectedDate ? new Date(item.expectedDate).toISOString().split('T')[0] : '';

  editForm.value = {
    id: item._id,
    patientId: item.patientId,
    patientName: item.patientName || 'Hasta',
    labName: item.labName || '',
    workType: item.workType || '',
    toothNumbers: Array.isArray(item.toothNumbers) ? item.toothNumbers.join(', ') : (item.toothNumbers || ''),
    shadeColor: item.shadeColor || 'A2',
    sentDate: sentFormatted,
    expectedDate: expectedFormatted,
    price: item.price !== undefined ? item.price : 0,
    status: item.status || 'sent',
    notes: item.notes || ''
  };
  isEditModalOpen.value = true;
};

// Düzenleme Değişikliklerini Kaydet
const saveEditedLabWork = async () => {
  if (!editForm.value.labName || !editForm.value.workType || !editForm.value.expectedDate) {
    alert('Lütfen Laboratuvar Adı, İş Türü ve Beklenen Teslim Tarihi alanlarını doldurunuz.');
    return;
  }

  try {
    isSubmitting.value = true;
    const teeth = editForm.value.toothNumbers
      ? editForm.value.toothNumbers.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    await $fetch(`/api/lab-works/${editForm.value.id}`, {
      method: 'PUT',
      body: {
        labName: editForm.value.labName,
        workType: editForm.value.workType,
        toothNumbers: teeth,
        shadeColor: editForm.value.shadeColor,
        sentDate: editForm.value.sentDate,
        expectedDate: editForm.value.expectedDate,
        price: Number(editForm.value.price) || 0,
        status: editForm.value.status,
        notes: editForm.value.notes
      }
    });

    isEditModalOpen.value = false;
    showToast('Laboratuvar işi bilgileri başarıyla güncellendi.');
    await loadData();
  } catch (error) {
    console.error(error);
    alert('Laboratuvar işi güncellenirken hata oluştu.');
  } finally {
    isSubmitting.value = false;
  }
};

// Durum Güncelle
const updateStatus = async (id, status) => {
  try {
    await $fetch(`/api/lab-works/${id}`, {
      method: 'PUT',
      body: { status }
    });
    await loadData();
  } catch (error) {
    console.error(error);
    alert('Durum güncellenirken hata oluştu.');
  }
};

// Kliniğe Geldi İşareti ve Opsiyonel Gidere Aktarma Teklifi
const handleMarkReceived = async (item) => {
  await updateStatus(item._id, 'received');
  showToast(`${item.patientName} ait iş kliniğe ulaştı olarak işaretlendi.`);

  // Eğer ücreti varsa ve henüz giderlere aktarılmamışsa aktarmak isteyip istemediğini sor
  if (item.price > 0 && !item.isExpenseRecorded) {
    setTimeout(() => {
      openTransferExpenseModal(item);
    }, 400);
  }
};

// Gidere Aktarma Modalını Aç (Opsiyonel Kolaylık)
const openTransferExpenseModal = (item) => {
  transferTarget.value = item;
  transferForm.value = {
    amount: item.price || 0,
    paymentMethod: 'cash',
    date: todayStr(),
    description: `${item.patientName} - ${item.workType} (${item.labName}) laboratuvar protez ücreti`
  };
  isTransferModalOpen.value = true;
};

// Gidere Aktarma Onayı
const confirmTransferExpense = async () => {
  if (!transferTarget.value || !transferForm.value.amount || transferForm.value.amount <= 0) {
    alert('Lütfen geçerli bir tutar giriniz.');
    return;
  }

  try {
    isSubmitting.value = true;
    await $fetch('/api/expenses', {
      method: 'POST',
      body: {
        category: 'Laboratuvar Ödemesi',
        amount: Number(transferForm.value.amount),
        paymentMethod: transferForm.value.paymentMethod,
        date: transferForm.value.date,
        description: transferForm.value.description,
        labWorkId: transferTarget.value._id
      }
    });

    isTransferModalOpen.value = false;
    showToast('Laboratuvar ücreti klinik giderlerine başarıyla aktarıldı.');
    await loadData();
  } catch (error) {
    console.error(error);
    alert('Gider aktarımı sırasında hata oluştu.');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteLabWork = async (id) => {
  if (!confirm('Bu laboratuvar kaydını silmek istediğinize emin misiniz?')) return;
  try {
    await $fetch(`/api/lab-works/${id}`, {
      method: 'DELETE'
    });
    showToast('Kayıt silindi.');
    await loadData();
  } catch (error) {
    console.error(error);
    alert('Kayıt silinemedi.');
  }
};

const sendWhatsAppToPatient = (item) => {
  const patient = patientsList.value.find(p => p._id === item.patientId);
  const phone = patient?.phone;
  if (!phone) {
    alert("Hastaya ait telefon numarası bulunamadı.");
    return;
  }

  const teethStr = item.toothNumbers && item.toothNumbers.length > 0 
    ? ` (${item.toothNumbers.join(', ')} no'lu diş)` 
    : '';

  const message = `Sayın ${item.patientName}, laboratuvara gönderilen ${item.workType}${teethStr} işiniz kliniğimize ulaşmıştır. Prova ve yapıştırma seansınız için randevu oluşturmak üzere bize yazabilirsiniz.`;
  
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
  if (!cleanPhone.startsWith('90')) cleanPhone = '90' + cleanPhone;

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

onMounted(() => {
  loadData();
});
</script>
