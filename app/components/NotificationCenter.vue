<template>
  <div class="relative" ref="dropdownRef">
    <!-- Bildirim Zili Butonu & Kırmızı Sayaç -->
    <button
      @click="toggleDropdown"
      class="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none"
      title="Bildirimler, Hatırlatıcılar ve Geri Çağırma (Recall) Merkezi"
    >
      <Icon name="heroicons:bell" class="w-6 h-6" />
      
      <!-- Canlı Kırmızı Bildirim Rozeti (Toplam Vakti Gelenler) -->
      <span
        v-if="totalBadgeCount > 0"
        class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse"
      >
        {{ totalBadgeCount > 9 ? '9+' : totalBadgeCount }}
      </span>
    </button>

    <!-- Bildirim & Recall Paneli Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="fixed inset-x-3 top-18 sm:inset-auto sm:absolute sm:right-0 sm:top-full sm:mt-3 sm:w-[460px] max-w-[460px] mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[680px]"
      >
        <!-- Panel Başlığı -->
        <div class="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/40">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔔</span>
            <div>
              <h3 class="font-bold text-slate-800 dark:text-white text-sm leading-tight">Bildirim & Hatırlatma Merkezi</h3>
              <p class="text-[11px] text-slate-400">Tedavi/Ödeme takibi, recall ve randevular</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <!-- Hızlı Hatırlatıcı Ekle -->
            <button
              @click="openNewReminderModal"
              type="button"
              class="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95"
              title="Yeni Tedavi veya Ödeme Hatırlatıcısı Ekle"
            >
              <Icon name="heroicons:plus" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Hatırlatıcı Ekle</span>
            </button>

            <!-- Yenile Butonu -->
            <button
              @click="refreshAll"
              :disabled="isLoadingAny"
              class="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors"
              title="Yenile"
            >
              <Icon name="heroicons:arrow-path" :class="['w-4 h-4', isLoadingAny ? 'animate-spin' : '']" />
            </button>
            <button
              @click="isOpen = false"
              class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Sekmeler: Hatırlatıcılar | Geri Çağırma | Randevular | Gizlenenler -->
        <div class="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
          <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
            <!-- 1. Hatırlatıcılar Sekmesi -->
            <button
              type="button"
              @click="activeSubTab = 'reminders'"
              :class="[
                activeSubTab === 'reminders'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                'flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 whitespace-nowrap min-w-[90px]'
              ]"
            >
              <span>⏰ Hatırlatma</span>
              <span
                v-if="activeDueReminders.length > 0"
                class="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-extrabold"
              >
                {{ activeDueReminders.length }}
              </span>
            </button>

            <!-- 2. Geri Çağırma (Recall) Sekmesi -->
            <button
              type="button"
              @click="activeSubTab = 'recalls'"
              :class="[
                activeSubTab === 'recalls'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                'flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 whitespace-nowrap min-w-[90px]'
              ]"
            >
              <span>⚠️ Recall</span>
              <span
                v-if="activeRecalls.length > 0"
                class="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-extrabold"
              >
                {{ activeRecalls.length }}
              </span>
            </button>

            <!-- 3. Randevular Sekmesi -->
            <button
              type="button"
              @click="activeSubTab = 'appointments'"
              :class="[
                activeSubTab === 'appointments'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                'flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 whitespace-nowrap min-w-[90px]'
              ]"
            >
              <span>📅 Randevu</span>
              <span
                v-if="todayNotifications.length > 0"
                class="px-1.5 py-0.2 bg-teal-500 text-white rounded-full text-[10px] font-extrabold"
              >
                {{ todayNotifications.length }}
              </span>
            </button>

            <!-- 4. Gizlenenler Sekmesi -->
            <button
              type="button"
              @click="activeSubTab = 'hidden'"
              :class="[
                activeSubTab === 'hidden'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                'py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 whitespace-nowrap'
              ]"
              title="Tamamlanmadı/Gizle seçeneğiyle gizlenen bildirimler"
            >
              <span>👁️ Gizlenen</span>
              <span
                v-if="totalHiddenCount > 0"
                class="px-1.5 py-0.2 bg-slate-400 text-white rounded-full text-[10px] font-bold"
              >
                {{ totalHiddenCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Mobil Bildirim İzni Uyarısı -->
        <div v-if="permission !== 'granted'" class="px-3 pt-2">
          <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-base shrink-0">📱</span>
              <div class="min-w-0">
                <div class="font-bold text-amber-900 dark:text-amber-200 text-[11px] truncate">Tarayıcı Bildirimleri Kapalı</div>
                <div class="text-[10px] text-amber-700/80 dark:text-amber-300/70 truncate">Hatırlatıcıları ekrana almak için izin verin</div>
              </div>
            </div>
            <button
              type="button"
              @click="requestPermission"
              class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shrink-0 shadow-sm"
            >
              İzin Ver
            </button>
          </div>
        </div>

        <!-- İÇERİK ALANI -->
        <div class="overflow-y-auto flex-1 p-3 space-y-3">

          <!-- 1. TEDAVİ VE ÖDEME HATIRLATICILARI LİSTESİ -->
          <div v-if="activeSubTab === 'reminders'" class="space-y-2.5">
            <!-- Alt Sekmeler: Vakti Gelenler / Bugün | Gelecek / Tüm Hatırlatıcılar -->
            <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                @click="reminderFilter = 'due'"
                :class="[
                  reminderFilter === 'due'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-bold border border-slate-200/50 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium',
                  'flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5'
                ]"
              >
                <span>🔔 Vakti Gelenler / Bugün</span>
                <span
                  v-if="activeDueReminders.length > 0"
                  class="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-extrabold"
                >
                  {{ activeDueReminders.length }}
                </span>
              </button>

              <button
                type="button"
                @click="reminderFilter = 'all'"
                :class="[
                  reminderFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-bold border border-slate-200/50 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium',
                  'flex-1 py-1.5 px-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5'
                ]"
              >
                <span>📅 Gelecek / Tüm Hatırlatıcılar</span>
                <span
                  v-if="allActiveReminders.length > 0"
                  class="px-1.5 py-0.2 bg-teal-600 text-white rounded-full text-[10px] font-extrabold"
                >
                  {{ allActiveReminders.length }}
                </span>
              </button>
            </div>

            <!-- Liste Durum Başlığı -->
            <div class="flex items-center justify-between px-1 py-0.5 text-xs">
              <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {{ reminderFilter === 'due' ? 'Vakti Gelen Hatırlatıcılar' : 'Gelecek & Tüm Hatırlatıcılar' }}
              </span>
              <span class="text-[11px] text-slate-400">
                Toplam: {{ displayedReminders.length }}
              </span>
            </div>

            <div v-if="isLoadingReminders" class="py-10 text-center text-slate-400 text-xs">
              <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
              <span>Hatırlatıcılar yükleniyor...</span>
            </div>

            <!-- Boş Durum: Vakti Gelenler sekmesi boşken -->
            <div v-else-if="displayedReminders.length === 0 && reminderFilter === 'due'" class="py-8 text-center flex flex-col items-center gap-2">
              <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                ⏰
              </div>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Vakti gelmiş hatırlatıcı bulunmuyor</span>
              <span v-if="allActiveReminders.length > 0" class="text-[11px] text-slate-400 max-w-xs">
                İleri tarihlere kurulmuş <strong>{{ allActiveReminders.length }}</strong> adet hatırlatıcınız var.
              </span>
              <span v-else class="text-[11px] text-slate-400 max-w-xs">
                Tedavi ve ödemeler sayfalarından yeni bir hatırlatıcı ekleyebilirsiniz.
              </span>
              <div class="flex items-center gap-2 mt-1">
                <button
                  v-if="allActiveReminders.length > 0"
                  type="button"
                  @click="reminderFilter = 'all'"
                  class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm"
                >
                  📅 Gelecek Hatırlatıcıları Gör ({{ allActiveReminders.length }})
                </button>
                <button
                  type="button"
                  @click="openNewReminderModal"
                  class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  + Yeni Hatırlatıcı Ekle
                </button>
              </div>
            </div>

            <!-- Boş Durum: Gelecek / Tümü sekmesi boşken -->
            <div v-else-if="displayedReminders.length === 0 && reminderFilter === 'all'" class="py-8 text-center flex flex-col items-center gap-2">
              <div class="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl">
                📅
              </div>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Kayıtlı aktif hatırlatıcı bulunmuyor</span>
              <span class="text-[11px] text-slate-400 max-w-xs">
                İleri bir tarihe tedavi veya ödeme hatırlatıcısı oluşturabilirsiniz.
              </span>
              <button
                type="button"
                @click="openNewReminderModal"
                class="mt-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + Yeni Hatırlatıcı Ekle
              </button>
            </div>

            <!-- Hatırlatıcı Kartları -->
            <div
              v-else
              v-for="item in displayedReminders"
              :key="item._id"
              class="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-2.5"
            >
              <!-- Üst Kısım: Kategori Rozeti + Kalan Gün/Durum + Hasta Bilgisi + Hedef Tarih + Hızlı Çöp Kutusu -->
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span
                      v-if="item.category === 'payment'"
                      class="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/60"
                    >
                      💳 Ödeme Takibi
                    </span>
                    <span
                      v-else-if="item.category === 'treatment'"
                      class="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-[10px] font-bold border border-teal-200/60"
                    >
                      🦷 Tedavi Takibi
                    </span>
                    <span
                      v-else
                      class="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200/60"
                    >
                      📌 Genel Hatırlatma
                    </span>

                    <!-- Kalan Gün / Durum Rozeti -->
                    <span
                      v-if="getDaysRemainingInfo(item)"
                      :class="['px-1.5 py-0.5 rounded text-[9px] font-black', getDaysRemainingInfo(item).class]"
                    >
                      {{ getDaysRemainingInfo(item).text }}
                    </span>
                  </div>

                  <!-- Hasta İsmi / Linki -->
                  <div v-if="item.patientName" class="flex items-center gap-1">
                    <NuxtLink
                      v-if="item.patientId"
                      :to="`/patients/${getPatientIdString(item.patientId)}`"
                      @click="isOpen = false"
                      class="font-bold text-xs text-slate-800 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-1 truncate"
                    >
                      <span>{{ item.patientName }}</span>
                      <Icon name="heroicons:arrow-top-right-on-square" class="w-3 h-3 opacity-60 shrink-0" />
                    </NuxtLink>
                    <span v-else class="font-bold text-xs text-slate-800 dark:text-white truncate">
                      {{ item.patientName }}
                    </span>
                    <span v-if="item.patientPhone" class="text-[10px] text-slate-400 font-mono">
                      • {{ item.patientPhone }}
                    </span>
                  </div>
                </div>

                <!-- Sağ Üst: Hedef Tarih ve Hızlı Çöp Kutusu -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <div class="text-right">
                    <span class="text-[10px] text-slate-400 block font-semibold">Hedef Tarih</span>
                    <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                      {{ formatDate(item.targetDate) }}
                    </span>
                  </div>
                  <!-- Tek Tıkla Doğrudan Kalıcı Sil (Çöp Kutusu) -->
                  <button
                    type="button"
                    @click="handleDirectDeleteReminder(item._id)"
                    class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                    title="Doğrudan Sil: Tek tıkla veritabanından kalıcı olarak sil"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Serbest Not -->
              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                {{ item.note }}
              </div>

              <!-- Mini Erteleme Seçici Popover / Çekmecesi -->
              <div
                v-if="snoozingItemId === item._id"
                class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2 animate-fadeIn"
              >
                <div class="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                  <span>⏱️ Ne zamana kadar ertelensin?</span>
                  <button type="button" @click="snoozingItemId = null" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    @click="applySnoozeReminder(item._id, 3)"
                    class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-xs font-bold border border-amber-200 dark:border-slate-700 shadow-sm transition-colors"
                  >
                    +3 Gün
                  </button>
                  <button
                    type="button"
                    @click="applySnoozeReminder(item._id, 7)"
                    class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-xs font-bold border border-amber-200 dark:border-slate-700 shadow-sm transition-colors"
                  >
                    +1 Hafta
                  </button>
                  <button
                    type="button"
                    @click="applySnoozeReminder(item._id, 30)"
                    class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-xs font-bold border border-amber-200 dark:border-slate-700 shadow-sm transition-colors"
                  >
                    +1 Ay
                  </button>
                </div>
                <div class="flex items-center gap-1.5 pt-1">
                  <input
                    type="date"
                    v-model="customSnoozeDate"
                    class="py-1 px-2 text-xs border border-amber-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 flex-1 outline-none"
                  />
                  <button
                    type="button"
                    @click="applyCustomSnoozeReminder(item._id)"
                    class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Ertele
                  </button>
                </div>
              </div>

              <!-- 4 STANDART AKSİYON BUTONU: Sil | Tamamlandı | Ertelendi | Gizle -->
              <div class="pt-1 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
                <!-- 1. Doğrudan Silme Tuşu (Çöp Kutusu) -->
                <button
                  type="button"
                  @click="handleDirectDeleteReminder(item._id)"
                  class="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                  title="Doğrudan Sil: Beklemeden, tek tıkla kalıcı olarak veritabanından sil"
                >
                  <Icon name="heroicons:trash" class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Sil</span>
                </button>

                <!-- 2. Tamamlandı (Kalıcı Olarak Sil) -->
                <button
                  type="button"
                  @click="handleCompleteReminder(item._id)"
                  class="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                  title="Tamamlandı: İşlem bittiği için kalıcı olarak silinsin"
                >
                  <Icon name="heroicons:check" class="w-3.5 h-3.5" />
                  <span>Tamamlandı</span>
                </button>

                <!-- 3. Ertelendi (Tarih seçimi açar) -->
                <button
                  type="button"
                  @click="toggleSnooze(item._id)"
                  class="flex-1 py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                  title="Ertelendi: İleri bir tarihe ertelensin"
                >
                  <Icon name="heroicons:clock" class="w-3.5 h-3.5" />
                  <span>Ertelendi</span>
                </button>

                <!-- 4. Tamamlanmadı / Gizle (Gizlenenler alanına taşır) -->
                <button
                  type="button"
                  @click="handleHideReminder(item._id)"
                  class="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-1 active:scale-95"
                  title="Tamamlanmadı / Gizle: Ana listeden çıkarıp gizlenenler alanına taşır"
                >
                  <Icon name="heroicons:eye-slash" class="w-3.5 h-3.5" />
                  <span>Gizle</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. GERİ ÇAĞIRMA (RECALL) LİSTESİ -->
          <div v-else-if="activeSubTab === 'recalls'" class="space-y-2.5">
            <div class="flex items-center justify-between px-1 py-0.5 text-xs">
              <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Recall Kontrolleri
              </span>
              <span class="text-[11px] text-slate-400">Toplam: {{ activeRecalls.length }}</span>
            </div>

            <div v-if="isLoadingRecalls" class="py-10 text-center text-slate-400 text-xs">
              <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
              <span>Geri çağırma listesi kontrol ediliyor...</span>
            </div>

            <div v-else-if="activeRecalls.length === 0" class="py-10 text-center flex flex-col items-center gap-2">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                ✓
              </div>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Aktif recall bildirimi yok</span>
              <span class="text-[11px] text-slate-400 max-w-xs">
                Tüm kontroller güncel veya işlendi.
              </span>
            </div>

            <div
              v-else
              v-for="item in activeRecalls"
              :key="item.patientId"
              class="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2.5"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <NuxtLink
                    :to="`/patients/${item.patientId}`"
                    @click="isOpen = false"
                    class="font-bold text-sm text-slate-800 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-1 truncate"
                  >
                    <span>{{ item.fullName }}</span>
                    <Icon name="heroicons:arrow-top-right-on-square" class="w-3.5 h-3.5 opacity-60 shrink-0" />
                  </NuxtLink>
                  <p class="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{{ item.reason }}</span>
                  </p>
                </div>

                <span class="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-200/60 shrink-0">
                  {{ item.daysPassed }} gün önce
                </span>
              </div>

              <div class="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Son İşlem: <strong>{{ formatDate(item.lastTreatmentDate) }}</strong></span>
                <span v-if="item.phone" class="font-mono text-slate-500">• {{ item.phone }}</span>
              </div>

              <!-- Tek Tıkla WhatsApp Hatırlatma Butonu -->
              <button
                type="button"
                @click="handleSendRecallReminder(item)"
                class="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#16a34a] hover:bg-[#15803d] active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Icon name="heroicons:chat-bubble-left-right" class="w-3.5 h-3.5" />
                <span>💬 WhatsApp ile Kontrole Çağır</span>
              </button>

              <!-- Mini Erteleme Seçici Popover -->
              <div
                v-if="snoozingItemId === `recall-${item.patientId}`"
                class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2 animate-fadeIn"
              >
                <div class="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                  <span>⏱️ Recall ne zamana kadar ertelensin?</span>
                  <button type="button" @click="snoozingItemId = null" class="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    @click="applySnoozeRecall(item.patientId, 3)"
                    class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold border border-amber-200 dark:border-slate-700 shadow-sm"
                  >
                    +3 Gün
                  </button>
                  <button
                    type="button"
                    @click="applySnoozeRecall(item.patientId, 7)"
                    class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold border border-amber-200 dark:border-slate-700 shadow-sm"
                  >
                    +1 Hafta
                  </button>
                  <button
                    type="button"
                    @click="applySnoozeRecall(item.patientId, 30)"
                    class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold border border-amber-200 dark:border-slate-700 shadow-sm"
                  >
                    +1 Ay
                  </button>
                </div>
                <div class="flex items-center gap-1.5 pt-1">
                  <input
                    type="date"
                    v-model="customSnoozeDate"
                    class="py-1 px-2 text-xs border border-amber-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 flex-1 outline-none"
                  />
                  <button
                    type="button"
                    @click="applyCustomSnoozeRecall(item.patientId)"
                    class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                  >
                    Ertele
                  </button>
                </div>
              </div>

              <!-- 3 STANDART AKSİYON BUTONU: [✓ Tamamlandı] - [⏱ Ertelendi] - [🗑 Sil] -->
              <div class="pt-1 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  @click="handleCompleteRecall(item.patientId)"
                  class="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                  title="Tamamlandı: Kontrol yapıldı, bildirim kalıcı kapatılsın"
                >
                  <Icon name="heroicons:check" class="w-3.5 h-3.5" />
                  <span>Tamamlandı</span>
                </button>

                <button
                  type="button"
                  @click="toggleSnooze(`recall-${item.patientId}`)"
                  class="flex-1 py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                  title="Ertelendi: İleri bir tarihe ertele"
                >
                  <Icon name="heroicons:clock" class="w-3.5 h-3.5" />
                  <span>Ertelendi</span>
                </button>

                <button
                  type="button"
                  @click="handlePermanentDeleteRecall(item.patientId)"
                  class="flex-1 py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                  title="Sil: Bildirimi veritabanından kalıcı olarak sil"
                >
                  <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
                  <span>Sil</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 3. YAKLAŞAN RANDEVULAR LİSTESİ -->
          <div v-else-if="activeSubTab === 'appointments'" class="space-y-3">
            <div class="flex items-center justify-between px-1 py-0.5 text-xs">
              <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Randevu Takibi
              </span>
              <span class="text-[11px] text-slate-400">Toplam: {{ todayNotifications.length + tomorrowNotifications.length }}</span>
            </div>

            <div v-if="todayNotifications.length === 0 && tomorrowNotifications.length === 0" class="py-10 text-center flex flex-col items-center gap-2">
              <span class="text-3xl opacity-50">🗓️</span>
              <span class="text-xs font-medium text-slate-400">Yaklaşan aktif randevu bildirimi bulunmuyor.</span>
            </div>

            <div v-else class="space-y-3">
              <!-- Bugünkü Randevular -->
              <div v-if="todayNotifications.length > 0">
                <div class="px-2 py-1 text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center justify-between">
                  <span>🔥 Bugünkü Randevular</span>
                  <span class="bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded text-[10px]">
                    {{ todayNotifications.length }}
                  </span>
                </div>

                <div class="space-y-2 mt-1">
                  <div
                    v-for="item in todayNotifications"
                    :key="item.id"
                    class="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm space-y-2"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <NuxtLink
                        to="/appointments"
                        @click="isOpen = false"
                        class="flex items-start gap-2.5 flex-1 min-w-0"
                      >
                        <div class="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {{ item.time }}
                        </div>
                        <div class="flex flex-col min-w-0">
                          <div class="flex items-center gap-1.5 min-w-0">
                            <span class="font-bold text-xs text-slate-800 dark:text-white truncate">
                              {{ item.patientName }}
                            </span>
                            <span v-if="item.doctorName" class="px-1.5 py-0.2 text-[9px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-md shrink-0 border border-teal-200/50 dark:border-teal-800/50">
                              👨‍⚕️ {{ item.doctorName }}
                            </span>
                          </div>
                          <span class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {{ item.procedure }}
                          </span>
                        </div>
                      </NuxtLink>

                      <span
                        :class="[
                          item.isUrgent
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
                          'px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0'
                        ]"
                      >
                        {{ item.timeLabel }}
                      </span>
                    </div>

                    <!-- Mini Erteleme Seçici Popover -->
                    <div
                      v-if="snoozingItemId === `apt-${item.id}`"
                      class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2 animate-fadeIn"
                    >
                      <div class="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                        <span>⏱️ Randevu bildirimi ne zamana kadar ertelensin?</span>
                        <button type="button" @click="snoozingItemId = null" class="text-slate-400 hover:text-slate-600">✕</button>
                      </div>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          @click="applySnoozeAppointment(item.id, 1)"
                          class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold border border-amber-200 dark:border-slate-700 shadow-sm"
                        >
                          +1 Gün
                        </button>
                        <button
                          type="button"
                          @click="applySnoozeAppointment(item.id, 3)"
                          class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold border border-amber-200 dark:border-slate-700 shadow-sm"
                        >
                          +3 Gün
                        </button>
                        <button
                          type="button"
                          @click="applySnoozeAppointment(item.id, 7)"
                          class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-bold border border-amber-200 dark:border-slate-700 shadow-sm"
                        >
                          +1 Hafta
                        </button>
                      </div>
                      <div class="flex items-center gap-1.5 pt-1">
                        <input
                          type="date"
                          v-model="customSnoozeDate"
                          class="py-1 px-2 text-xs border border-amber-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 flex-1 outline-none"
                        />
                        <button
                          type="button"
                          @click="applyCustomSnoozeAppointment(item.id)"
                          class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                        >
                          Ertele
                        </button>
                      </div>
                    </div>

                    <!-- 3 STANDART AKSİYON BUTONU -->
                    <div class="pt-1 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        type="button"
                        @click="handleCompleteAppointment(item.id)"
                        class="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                        title="Tamamlandı: Randevu bildirimi kalıcı olarak silinir"
                      >
                        <Icon name="heroicons:check" class="w-3.5 h-3.5" />
                        <span>Tamamlandı</span>
                      </button>

                      <button
                        type="button"
                        @click="toggleSnooze(`apt-${item.id}`)"
                        class="flex-1 py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                        title="Ertelendi: Belirtilen tarihe kadar listeden çıkar"
                      >
                        <Icon name="heroicons:clock" class="w-3.5 h-3.5" />
                        <span>Ertelendi</span>
                      </button>

                      <button
                        type="button"
                        @click="handleHideAppointment(item.id)"
                        class="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-1 active:scale-95"
                        title="Tamamlanmadı / Gizle: Gizlenen Bildirimler alanına taşır"
                      >
                        <Icon name="heroicons:eye-slash" class="w-3.5 h-3.5" />
                        <span>Gizle</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Yarınki Randevular -->
              <div v-if="tomorrowNotifications.length > 0">
                <div class="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>📅 Yarınki Randevular</span>
                  <span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                    {{ tomorrowNotifications.length }}
                  </span>
                </div>

                <div class="space-y-2 mt-1">
                  <div
                    v-for="item in tomorrowNotifications"
                    :key="item.id"
                    class="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm space-y-2"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <NuxtLink
                        to="/appointments"
                        @click="isOpen = false"
                        class="flex items-start gap-2.5 flex-1 min-w-0"
                      >
                        <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {{ item.time }}
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span class="font-bold text-xs text-slate-800 dark:text-white truncate">{{ item.patientName }}</span>
                          <span class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ item.procedure }}</span>
                        </div>
                      </NuxtLink>
                      <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-bold">
                        Yarın
                      </span>
                    </div>

                    <div class="pt-1 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        type="button"
                        @click="handleCompleteAppointment(item.id)"
                        class="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Icon name="heroicons:check" class="w-3.5 h-3.5" />
                        <span>Tamamlandı</span>
                      </button>
                      <button
                        type="button"
                        @click="handleHideAppointment(item.id)"
                        class="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Icon name="heroicons:eye-slash" class="w-3.5 h-3.5" />
                        <span>Gizle</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. GİZLENEN BİLDİRİMLER ALANI (İhtiyaç olursa oradan bakılabilsin) -->
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between px-1 py-0.5 text-xs">
              <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Gizlenen Bildirimler
              </span>
              <span class="text-[11px] text-slate-400">Toplam: {{ totalHiddenCount }}</span>
            </div>

            <div v-if="totalHiddenCount === 0" class="py-10 text-center flex flex-col items-center gap-2">
              <span class="text-3xl opacity-50">👁️</span>
              <span class="text-xs font-medium text-slate-400">Gizlenmiş herhangi bir bildirim bulunmuyor.</span>
              <span class="text-[11px] text-slate-400">Bir bildirimi "Gizle" dediğinizde arayüzü kalabalık etmemesi için buraya taşınır.</span>
            </div>

            <div v-else class="space-y-2.5">
              <!-- Gizlenen Hatırlatıcılar -->
              <div v-for="item in hiddenReminders" :key="item._id" class="p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {{ item.category === 'payment' ? 'Gizlenen Ödeme' : 'Gizlenen Tedavi' }}
                    </span>
                    <h5 class="font-bold text-xs text-slate-800 dark:text-white mt-1">{{ item.patientName || 'İsimsiz' }}</h5>
                    <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{{ item.note }}</p>
                  </div>
                  <span class="text-[10px] text-slate-400 font-mono">{{ formatDate(item.targetDate) }}</span>
                </div>
                <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    @click="unhideReminder(item._id)"
                    class="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Icon name="heroicons:arrow-uturn-left" class="w-3.5 h-3.5" />
                    <span>Geri Getir</span>
                  </button>
                  <button
                    type="button"
                    @click="completeReminder(item._id)"
                    class="px-2.5 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-bold transition-all"
                  >
                    Kalıcı Sil
                  </button>
                </div>
              </div>

              <!-- Gizlenen Recall'lar -->
              <div v-for="item in hiddenRecallsList" :key="item.patientId" class="p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      Gizlenen Recall
                    </span>
                    <h5 class="font-bold text-xs text-slate-800 dark:text-white mt-1">{{ item.fullName }}</h5>
                    <p class="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{{ item.reason }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    @click="unhideRecall(item.patientId)"
                    class="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Icon name="heroicons:arrow-uturn-left" class="w-3.5 h-3.5" />
                    <span>Geri Getir</span>
                  </button>
                  <button
                    type="button"
                    @click="handleCompleteRecall(item.patientId)"
                    class="px-2.5 py-1 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Kalıcı Sil
                  </button>
                </div>
              </div>

              <!-- Gizlenen Randevular -->
              <div v-for="item in hiddenAppointmentsList" :key="item.id" class="p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      Gizlenen Randevu
                    </span>
                    <h5 class="font-bold text-xs text-slate-800 dark:text-white mt-1">{{ item.patientName }} ({{ item.time }})</h5>
                    <p class="text-xs text-slate-500 mt-0.5">{{ item.procedure }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    @click="unhideAppointment(item.id)"
                    class="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Icon name="heroicons:arrow-uturn-left" class="w-3.5 h-3.5" />
                    <span>Geri Getir</span>
                  </button>
                  <button
                    type="button"
                    @click="handleCompleteAppointment(item.id)"
                    class="px-2.5 py-1 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Kalıcı Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Altlığı -->
        <div class="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center flex items-center justify-between text-xs font-bold">
          <NuxtLink
            to="/appointments"
            @click="isOpen = false"
            class="text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Randevu Takvimi</span>
            <Icon name="heroicons:arrow-right" class="w-3.5 h-3.5" />
          </NuxtLink>

          <NuxtLink
            to="/payments"
            @click="isOpen = false"
            class="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Muhasebe & Ödemeler</span>
            <Icon name="heroicons:arrow-right" class="w-3.5 h-3.5" />
          </NuxtLink>

          <NuxtLink
            to="/patients"
            @click="isOpen = false"
            class="text-slate-500 hover:text-slate-800 dark:hover:text-white hover:underline"
          >
            Tüm Hastalar
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Hatırlatıcı Ekleme Modalı -->
    <NewReminderModal
      :isOpen="isNewReminderModalOpen"
      @close="isNewReminderModalOpen = false"
      @created="onReminderCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotifications, type NotificationItem } from '~/composables/useNotifications';
import { useReminders } from '~/composables/useReminders';
import { useUtils } from '~/composables/useUtils';
import NewReminderModal from '~/components/NewReminderModal.vue';

const {
  notifications,
  isLoading: isLoadingNotifs,
  permission,
  requestPermission,
  loadNotifications
} = useNotifications();

const {
  reminders,
  activeDueReminders,
  allActiveReminders,
  upcomingReminders,
  hiddenReminders,
  isLoading: isLoadingReminders,
  loadReminders,
  createReminder,
  deleteReminder,
  completeReminder,
  snoozeReminder,
  hideReminder,
  unhideReminder
} = useReminders();

const { formatDate } = useUtils();

const isOpen = ref(false);
const activeSubTab = ref<'reminders' | 'recalls' | 'appointments' | 'hidden'>('reminders');
const reminderFilter = ref<'due' | 'all'>('due');
const dropdownRef = ref<HTMLDivElement | null>(null);
const isNewReminderModalOpen = ref(false);

// Erteleme Durumu
const snoozingItemId = ref<string | null>(null);
const customSnoozeDate = ref<string>('');

// Recall State & Dismissal
const COMPLETED_RECALLS_KEY = 'tenaxline_completed_recalls';
const HIDDEN_RECALLS_KEY = 'tenaxline_hidden_recalls';
const SNOOZED_RECALLS_KEY = 'tenaxline_snoozed_recalls';

// Appointments Local Keys
const COMPLETED_NOTIFS_KEY = 'tenaxline_completed_notifs';
const HIDDEN_NOTIFS_KEY = 'tenaxline_hidden_notifs';
const SNOOZED_NOTIFS_KEY = 'tenaxline_snoozed_notifs';

const allRecallsRaw = ref<any[]>([]);
const isLoadingRecalls = ref(false);

const isLoadingAny = computed(() => {
  return isLoadingNotifs.value || isLoadingReminders.value || isLoadingRecalls.value;
});

// Helper for LocalStorage
const getStorageList = (key: string): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const setStorageList = (key: string, list: string[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(list));
};

const getStorageMap = (key: string): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
};

const setStorageMap = (key: string, map: Record<string, string>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(map));
};

const getTodayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const addDaysToStr = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const triggerToast = (message: string, type: string = 'info') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message, type }
    }));
  }
};

// Patient ID güvenli string çözümü
const getPatientIdString = (pid: any): string => {
  if (!pid) return '';
  if (typeof pid === 'object' && pid._id) return String(pid._id);
  return String(pid);
};

// --- RECALL YÖNETİMİ ---
const loadRecalls = async () => {
  try {
    isLoadingRecalls.value = true;
    const res: any = await $fetch('/api/recall');
    if (res && res.success && Array.isArray(res.data)) {
      allRecallsRaw.value = res.data;
    } else {
      allRecallsRaw.value = [];
    }
  } catch (error) {
    console.error('Recall verileri alınamadı:', error);
  } finally {
    isLoadingRecalls.value = false;
  }
};

// Aktif Recall Listesi (Tamamlananlar, Gizlenenler ve Süresi dolmamış ertelenenler hariç)
const activeRecalls = computed(() => {
  const completed = getStorageList(COMPLETED_RECALLS_KEY);
  const hidden = getStorageList(HIDDEN_RECALLS_KEY);
  const snoozed = getStorageMap(SNOOZED_RECALLS_KEY);
  const today = getTodayStr();

  return allRecallsRaw.value.filter((r: any) => {
    const pid = String(r.patientId);
    if (completed.includes(pid)) return false;
    if (hidden.includes(pid)) return false;
    if (snoozed[pid] && snoozed[pid] > today) return false;
    return true;
  });
});

// Gizlenen Recall'lar
const hiddenRecallsList = computed(() => {
  const hidden = getStorageList(HIDDEN_RECALLS_KEY);
  const completed = getStorageList(COMPLETED_RECALLS_KEY);
  return allRecallsRaw.value.filter((r: any) => {
    const pid = String(r.patientId);
    return hidden.includes(pid) && !completed.includes(pid);
  });
});

// Recall 1: Tamamlandı (Kalıcı Olarak Veritabanından Kapat)
const handleCompleteRecall = async (patientId: string) => {
  const pid = String(patientId);
  allRecallsRaw.value = allRecallsRaw.value.filter((r: any) => String(r.patientId) !== pid);
  snoozingItemId.value = null;
  triggerToast('✓ Recall bildirimi tamamlandı ve kapatıldı.', 'success');

  try {
    await $fetch('/api/recall/dismiss', {
      method: 'POST',
      body: { patientId: pid }
    });
  } catch (err) {
    console.warn('Recall dismiss sunucu hatası:', err);
  }
};

// Recall 2: Kalıcı Olarak Sil (Veritabanından kalıcı dismiss, bir daha asla çıkmaz)
const handlePermanentDeleteRecall = async (patientId: string) => {
  const pid = String(patientId);
  allRecallsRaw.value = allRecallsRaw.value.filter((r: any) => String(r.patientId) !== pid);
  snoozingItemId.value = null;
  triggerToast('🗑️ Recall bildirimi veritabanından kalıcı olarak silindi.', 'success');

  try {
    await $fetch('/api/recall/dismiss', {
      method: 'POST',
      body: { patientId: pid }
    });
  } catch (err) {
    console.warn('Recall dismiss sunucu hatası:', err);
  }
};

// Recall 3: Ertelendi (Veritabanında recallSnoozedUntil günceller)
const applySnoozeRecall = async (patientId: string, days: number) => {
  const targetDate = addDaysToStr(days);
  const pid = String(patientId);
  allRecallsRaw.value = allRecallsRaw.value.filter((r: any) => String(r.patientId) !== pid);
  snoozingItemId.value = null;
  triggerToast(`⏱️ Recall bildirimi ${targetDate} tarihine kadar ertelendi.`, 'info');

  try {
    await $fetch('/api/recall/snooze', {
      method: 'POST',
      body: { patientId: pid, snoozeUntil: targetDate }
    });
  } catch (err) {
    console.warn('Recall snooze sunucu hatası:', err);
  }
};

const applyCustomSnoozeRecall = async (patientId: string) => {
  if (!customSnoozeDate.value) return;
  const targetDate = customSnoozeDate.value;
  const pid = String(patientId);
  allRecallsRaw.value = allRecallsRaw.value.filter((r: any) => String(r.patientId) !== pid);
  snoozingItemId.value = null;
  customSnoozeDate.value = '';
  triggerToast(`⏱️ Recall bildirimi ${targetDate} tarihine kadar ertelendi.`, 'info');

  try {
    await $fetch('/api/recall/snooze', {
      method: 'POST',
      body: { patientId: pid, snoozeUntil: targetDate }
    });
  } catch (err) {
    console.warn('Recall snooze sunucu hatası:', err);
  }
};

// --- RANDEVU YÖNETİMİ ---
const todayNotifications = computed(() => {
  const completed = getStorageList(COMPLETED_NOTIFS_KEY);
  const hidden = getStorageList(HIDDEN_NOTIFS_KEY);
  const snoozed = getStorageMap(SNOOZED_NOTIFS_KEY);
  const today = getTodayStr();

  return notifications.value.filter(n => {
    if (n.type !== 'today') return false;
    const id = String(n.id);
    if (completed.includes(id)) return false;
    if (hidden.includes(id)) return false;
    if (snoozed[id] && snoozed[id] > today) return false;
    return true;
  });
});

const tomorrowNotifications = computed(() => {
  const completed = getStorageList(COMPLETED_NOTIFS_KEY);
  const hidden = getStorageList(HIDDEN_NOTIFS_KEY);
  const snoozed = getStorageMap(SNOOZED_NOTIFS_KEY);
  const today = getTodayStr();

  return notifications.value.filter(n => {
    if (n.type !== 'tomorrow') return false;
    const id = String(n.id);
    if (completed.includes(id)) return false;
    if (hidden.includes(id)) return false;
    if (snoozed[id] && snoozed[id] > today) return false;
    return true;
  });
});

const hiddenAppointmentsList = computed(() => {
  const hidden = getStorageList(HIDDEN_NOTIFS_KEY);
  const completed = getStorageList(COMPLETED_NOTIFS_KEY);
  return notifications.value.filter(n => {
    const id = String(n.id);
    return hidden.includes(id) && !completed.includes(id);
  });
});

// Randevu 1: Tamamlandı
const handleCompleteAppointment = (aptId: string) => {
  const id = String(aptId);
  const completed = getStorageList(COMPLETED_NOTIFS_KEY);
  if (!completed.includes(id)) {
    completed.push(id);
    setStorageList(COMPLETED_NOTIFS_KEY, completed);
  }
  const hidden = getStorageList(HIDDEN_NOTIFS_KEY).filter(i => i !== id);
  setStorageList(HIDDEN_NOTIFS_KEY, hidden);
  snoozingItemId.value = null;
  triggerToast('✓ Randevu bildirimi kalıcı olarak temizlendi.', 'success');
};

// Randevu 2: Ertelendi
const applySnoozeAppointment = (aptId: string, days: number) => {
  const targetDate = addDaysToStr(days);
  const id = String(aptId);
  const snoozed = getStorageMap(SNOOZED_NOTIFS_KEY);
  snoozed[id] = targetDate;
  setStorageMap(SNOOZED_NOTIFS_KEY, snoozed);
  snoozingItemId.value = null;
  triggerToast(`⏱️ Randevu bildirimi ${targetDate} tarihine kadar ertelendi.`, 'info');
};

const applyCustomSnoozeAppointment = (aptId: string) => {
  if (!customSnoozeDate.value) return;
  const id = String(aptId);
  const snoozed = getStorageMap(SNOOZED_NOTIFS_KEY);
  snoozed[id] = customSnoozeDate.value;
  setStorageMap(SNOOZED_NOTIFS_KEY, snoozed);
  snoozingItemId.value = null;
  customSnoozeDate.value = '';
  triggerToast('⏱️ Randevu bildirimi seçilen tarihe kadar ertelendi.', 'info');
};

// Randevu 3: Gizle
const handleHideAppointment = (aptId: string) => {
  const id = String(aptId);
  const hidden = getStorageList(HIDDEN_NOTIFS_KEY);
  if (!hidden.includes(id)) {
    hidden.push(id);
    setStorageList(HIDDEN_NOTIFS_KEY, hidden);
  }
  triggerToast('Randevu bildirimi gizlenenlere taşındı.', 'info');
};

const unhideAppointment = (aptId: string) => {
  const id = String(aptId);
  const hidden = getStorageList(HIDDEN_NOTIFS_KEY).filter(i => i !== id);
  setStorageList(HIDDEN_NOTIFS_KEY, hidden);
  const snoozed = getStorageMap(SNOOZED_NOTIFS_KEY);
  delete snoozed[id];
  setStorageMap(SNOOZED_NOTIFS_KEY, snoozed);
  triggerToast('Randevu bildirimi tekrar aktif listeye alındı.', 'success');
};

// --- HATIRLATICI FİLTRELEME & AKSİYONLARI ---
const displayedReminders = computed(() => {
  return reminderFilter.value === 'due' ? activeDueReminders.value : allActiveReminders.value;
});

const handleDirectDeleteReminder = (id: string) => {
  deleteReminder(id);
  snoozingItemId.value = null;
};

const handleCompleteReminder = (id: string) => {
  completeReminder(id);
  snoozingItemId.value = null;
};

const getDaysRemainingInfo = (item: any) => {
  if (item.isToday) {
    return { text: 'BUGÜN', class: 'bg-rose-500 text-white' };
  }
  if (item.isSnoozed) {
    return { text: `ERTELENDİ (${formatDate(item.snoozedUntil)})`, class: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' };
  }
  if (item.isDue) {
    return { text: 'VAKTİ GELDİ', class: 'bg-amber-500 text-white' };
  }
  if (!item.targetDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(item.targetDate);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return { text: 'BUGÜN', class: 'bg-rose-500 text-white' };
  if (diffDays === 1) return { text: 'YARIN', class: 'bg-sky-500 text-white' };
  if (diffDays < 0) return { text: `${Math.abs(diffDays)} GÜN GEÇTİ`, class: 'bg-rose-600 text-white' };
  return { text: `${diffDays} GÜN SONRA`, class: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800' };
};

const applySnoozeReminder = (id: string, days: number) => {
  const date = addDaysToStr(days);
  snoozeReminder(id, date);
  snoozingItemId.value = null;
};

const applyCustomSnoozeReminder = (id: string) => {
  if (!customSnoozeDate.value) return;
  snoozeReminder(id, customSnoozeDate.value);
  snoozingItemId.value = null;
  customSnoozeDate.value = '';
};

const handleHideReminder = (id: string) => {
  hideReminder(id);
};

// Erteleme paneli aç/kapat
const toggleSnooze = (itemId: string) => {
  if (snoozingItemId.value === itemId) {
    snoozingItemId.value = null;
  } else {
    snoozingItemId.value = itemId;
    customSnoozeDate.value = addDaysToStr(3);
  }
};

// Toplam Gizlenenler Sayısı
const totalHiddenCount = computed(() => {
  return hiddenReminders.value.length + hiddenRecallsList.value.length + hiddenAppointmentsList.value.length;
});

// Toplam Kırmızı Sayaç Rozeti (Vakti gelen Hatırlatıcılar + Aktif Recall + Bugünkü Randevular)
const totalBadgeCount = computed(() => {
  return activeDueReminders.value.length + activeRecalls.value.length + todayNotifications.value.length;
});

const openNewReminderModal = () => {
  isNewReminderModalOpen.value = true;
};

const onReminderCreated = () => {
  loadReminders();
  activeSubTab.value = 'reminders';
};

const refreshAll = () => {
  loadNotifications();
  loadRecalls();
  loadReminders();
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    refreshAll();
    // Varsayılan sekmeyi akıllıca seç
    if (activeDueReminders.value.length > 0) {
      activeSubTab.value = 'reminders';
    } else if (activeRecalls.value.length > 0) {
      activeSubTab.value = 'recalls';
    } else if (todayNotifications.value.length > 0) {
      activeSubTab.value = 'appointments';
    }
  }
};

// Recall WhatsApp Hatırlatma Gönder
const handleSendRecallReminder = (patient: any) => {
  let message = '';
  if (patient.recallType === 'ROUTINE_CHECKUP') {
    message = `Sayın ${patient.fullName}, kliniğimizdeki son kontrolünüzün üzerinden 6 ay geçmiştir. Ağız ve diş sağlığınızı korumak için 6 aylık rutin kontrol ve bakım randevunuzu oluşturmak ister misiniz? Sağlıklı günler dileriz.`;
  } else if (patient.recallType === 'IMPLANT_CROWN_READY') {
    message = `Sayın ${patient.fullName}, implant operasyonunuzun ardından kemik iyileşme süreciniz tamamlanmıştır. Üst porselen/zirkon kaplama aşamasına geçmek üzere prova randevunuz için bize yazabilirsiniz.`;
  } else {
    message = `Sayın ${patient.fullName}, kliniğimizde planlanan tedavinize devam etmek ve kontrol randevunuzu oluşturmak üzere bize yazabilirsiniz. Sağlıklı günler dileriz.`;
  }

  const phoneStr = patient.phone || '';
  let cleanPhone = phoneStr.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
  if (!cleanPhone.startsWith('90')) cleanPhone = '90' + cleanPhone;

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

const handleRemindersUpdated = () => {
  loadReminders();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('reminders-updated', handleRemindersUpdated);
  loadRecalls();
  loadReminders();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('reminders-updated', handleRemindersUpdated);
});
</script>
