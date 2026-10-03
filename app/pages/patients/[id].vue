<template>
  <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[400px]">
    <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-teal-600 mb-2" />
    <span class="text-base text-slate-500 font-medium">Hasta profili yükleniyor...</span>
  </div>

  <div v-else-if="!patientData" class="text-center py-12">
    <span class="text-4xl">⚠️</span>
    <h3 class="text-slate-800 font-bold mt-2 text-lg">Hasta Bulunamadı</h3>
    <p class="text-slate-500 text-sm mt-1">Görüntülemek istediğiniz hasta kaydı silinmiş veya mevcut değil.</p>
    <NuxtLink to="/patients" class="mt-4 inline-flex px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold">
      Hastalar Listesine Dön
    </NuxtLink>
  </div>

  <div v-else class="flex flex-col gap-6 w-full max-w-full min-w-0 overflow-x-hidden">
    <!-- Geri Butonu & Üst Başlık (Panel içinde) -->
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex items-center justify-between gap-3 sm:gap-4 w-full max-w-full min-w-0">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <NuxtLink
          to="/patients"
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0"
        >
          <Icon name="heroicons:arrow-left" class="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </NuxtLink>
        <div class="min-w-0">
          <span class="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider">Hasta Detay Profili</span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight truncate">
            {{ patientData.patient.firstName }} {{ patientData.patient.lastName }}
          </h2>
        </div>
      </div>

      <!-- Sağ Taraf: Düzenleme Seçeneği -->
      <button
        type="button"
        @click="openPatientEditModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-600/15 hover:shadow-teal-600/25 transition-all shrink-0 cursor-pointer"
        title="Hasta Bilgilerini Düzenle"
      >
        <Icon name="heroicons:pencil-square" class="w-4 h-4" />
        <span class="hidden sm:inline">Hasta Bilgilerini Düzenle</span>
        <span class="sm:hidden">Düzenle</span>
      </button>
    </div>

    <!-- Hızlı Uyarı Panelleri (Alerji & Kronik Rahatsızlıklar) -->
    <div v-if="patientData.patient.allergies || patientData.patient.chronicDiseases" class="flex flex-col md:flex-row gap-3 w-full max-w-full min-w-0">
      <div v-if="patientData.patient.allergies" class="flex-1 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-4 flex gap-3 min-w-0">
        <span class="text-2xl shrink-0">🚨</span>
        <div class="min-w-0">
          <h4 class="font-bold text-rose-800 dark:text-rose-400 text-sm uppercase tracking-wider">Tıbbi Alerji Uyarısı</h4>
          <p class="text-sm text-rose-700 dark:text-rose-300 font-semibold mt-1 leading-relaxed break-words">{{ patientData.patient.allergies }}</p>
        </div>
      </div>
      <div v-if="patientData.patient.chronicDiseases" class="flex-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/85 dark:border-amber-900/40 rounded-2xl p-4 flex gap-3 min-w-0">
        <span class="text-2xl shrink-0">⚠️</span>
        <div class="min-w-0">
          <h4 class="font-bold text-amber-800 dark:text-amber-400 text-sm uppercase tracking-wider">Kronik Rahatsızlıklar</h4>
          <p class="text-sm text-amber-700 dark:text-amber-300 font-semibold mt-1 leading-relaxed break-words">{{ patientData.patient.chronicDiseases }}</p>
        </div>
      </div>
    </div>

    <!-- İki Sütunlu Sayfa Düzeni -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full max-w-full min-w-0">
      
      <!-- SOL SÜTUN: Kart / Kişisel Bilgiler -->
      <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-6 w-full max-w-full min-w-0">
        <!-- Avatar ve Başlık -->
        <div class="flex flex-col items-center text-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div
            :class="[
              getAvatarColorClass(patientData.patient.firstName + ' ' + patientData.patient.lastName),
              'w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl tracking-widest shadow-md'
            ]"
          >
            {{ getInitials(patientData.patient.firstName, patientData.patient.lastName) }}
          </div>
          <div>
            <h3 class="font-bold text-slate-800 dark:text-white text-base">{{ patientData.patient.firstName }} {{ patientData.patient.lastName }}</h3>
            <span class="text-sm text-slate-400 dark:text-slate-500 font-medium font-mono block mt-0.5">TC: {{ patientData.patient.tcNo || 'Belirtilmemiş' }}</span>
          </div>

          <!-- Sol Sütun: Bilgileri Düzenle Butonu -->
          <button
            type="button"
            @click="openPatientEditModal"
            class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 active:scale-95 shadow-sm"
          >
            <Icon name="heroicons:pencil-square" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Hasta Bilgilerini Düzenle</span>
          </button>
        </div>

        <!-- Demografik Detay Listesi -->
        <div class="space-y-4 text-sm">
          <!-- İletişim -->
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">İletişim Bilgileri</span>
            </div>
            <div class="mt-2 space-y-2 text-slate-600 dark:text-slate-300">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon name="heroicons:phone" class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span class="font-bold font-mono">{{ formatPhone(patientData.patient.phone) }}</span>
                </div>
              </div>

              <!-- Hızlı Arama ve WhatsApp Eylem Butonları -->
              <div v-if="patientData.patient.phone" class="pt-1 pb-1 flex items-center gap-2">
                <!-- 1. Doğrudan Arama (tel:) -->
                <a
                  :href="getTelHref(patientData.patient.phone)"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shadow-sky-600/20"
                  title="Hastanın numarasını doğrudan ara"
                >
                  <Icon name="heroicons:phone" class="w-3.5 h-3.5" />
                  <span>📞 Ara</span>
                </a>

                <!-- 2. WhatsApp Menü Butonu (Açılır Menü) -->
                <div class="relative flex-1" ref="whatsappDropdownRef">
                  <button
                    type="button"
                    @click="isWhatsAppMenuOpen = !isWhatsAppMenuOpen"
                    class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shadow-emerald-600/20"
                    title="WhatsApp Hızlı Şablon Mesajları"
                  >
                    <Icon name="heroicons:chat-bubble-left-right" class="w-3.5 h-3.5" />
                    <span>WhatsApp Mesajı</span>
                    <Icon name="heroicons:chevron-down" class="w-3 h-3 opacity-80" />
                  </button>

                  <!-- WhatsApp Açılır Şablon Menüsü (Kategorili) -->
                  <div
                    v-if="isWhatsAppMenuOpen"
                    class="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 max-h-[460px] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-2 text-xs"
                  >
                    <div
                      v-for="(group, gIdx) in whatsAppTemplateGroups"
                      :key="group.category"
                      :class="[gIdx > 0 ? 'pt-2 border-t border-slate-100 dark:border-slate-800' : '', 'space-y-1']"
                    >
                      <div class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Icon :name="group.icon" class="w-3.5 h-3.5 text-slate-400" />
                        <span>{{ group.category }}</span>
                      </div>

                      <div class="space-y-0.5">
                        <button
                          v-for="item in group.items"
                          :key="item.id"
                          type="button"
                          @click="sendWhatsAppText(item.text)"
                          class="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col transition-colors group"
                        >
                          <div class="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {{ item.label }}
                          </div>
                          <div class="text-[11px] text-slate-400 leading-tight mt-0.5">
                            {{ item.desc }}
                          </div>
                        </button>
                      </div>
                    </div>

                    <!-- Özel / Düzenleme Butonu -->
                    <div class="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-0.5">
                      <button
                        type="button"
                        @click="openCustomWhatsAppModal('appt_reminder')"
                        class="w-full text-left p-2 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between transition-colors border border-emerald-200/50 dark:border-emerald-800/50"
                      >
                        <span class="flex items-center gap-1.5">
                          <Icon name="heroicons:pencil-square" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Mesajı Önizle / Özel Yaz</span>
                        </span>
                        <Icon name="heroicons:chevron-right" class="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="heroicons:envelope" class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <span class="truncate font-medium">{{ patientData.patient.email || 'E-posta tanımlanmamış' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="heroicons:map-pin" class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <span class="font-medium">{{ patientData.patient.address || 'Adres tanımlanmamış' }}</span>
              </div>
            </div>
          </div>

          <!-- Kimlik/Medikal -->
          <div class="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kişisel Bilgiler</span>
            </div>
            <div class="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-slate-600 dark:text-slate-300 font-medium">
              <div>
                <div class="text-xs text-slate-400 dark:text-slate-500">Yaş</div>
                <div class="mt-0.5">{{ calculateAge(patientData.patient.birthDate) ? `${calculateAge(patientData.patient.birthDate)} Yaş` : '—' }}</div>
              </div>
              <div>
                <div class="text-xs text-slate-400 dark:text-slate-500">Cinsiyet</div>
                <div class="mt-0.5">{{ patientData.patient.gender === 'male' ? 'Erkek' : patientData.patient.gender === 'female' ? 'Kadın' : 'Diğer' }}</div>
              </div>
              <div>
                <div class="text-xs text-slate-400 dark:text-slate-500">Kan Grubu</div>
                <div class="mt-0.5 text-teal-600 dark:text-teal-400 font-bold">{{ patientData.patient.bloodType || 'Bilinmiyor' }}</div>
              </div>
              <div>
                <div class="text-xs text-slate-400 dark:text-slate-500">Düzenli İlaçlar</div>
                <div class="mt-0.5">{{ patientData.patient.medications || 'Yok' }}</div>
              </div>
            </div>
          </div>

          <!-- Acil Durum Yakını -->
          <div class="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Acil Durum İrtibatı</span>
            </div>
            <div class="mt-2 text-slate-600 dark:text-slate-300 space-y-1.5 font-medium">
              <div class="text-slate-800 dark:text-slate-200 font-bold">{{ patientData.patient.emergencyContact || '—' }}</div>
              <div class="flex items-center gap-1.5 font-mono">
                <Icon name="heroicons:phone" class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{{ formatPhone(patientData.patient.emergencyPhone) }}</span>
              </div>
            </div>
          </div>

          <!-- Hekim Notu -->
          <div class="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="heroicons:document-text" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Hekim Notu</span>
              </span>
              <button
                v-if="!isEditingNotes"
                type="button"
                @click="startEditingNotes"
                class="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors border border-transparent hover:border-teal-200 dark:hover:border-teal-800/60"
                title="Hekim notunu düzenle"
              >
                <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" />
                <span>{{ patientData.patient.notes ? 'Düzenle' : '+ Not Ekle' }}</span>
              </button>
            </div>

            <!-- Görüntüleme Modu -->
            <div v-if="!isEditingNotes">
              <p
                v-if="patientData.patient.notes"
                class="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-xs sm:text-sm font-medium"
              >
                {{ patientData.patient.notes }}
              </p>
              <div
                v-else
                @click="startEditingNotes"
                class="p-3 bg-slate-50/60 dark:bg-slate-950/40 border border-dashed border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-400 dark:text-slate-500 text-xs italic cursor-pointer hover:border-teal-500/50 hover:bg-teal-50/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Icon name="heroicons:pencil-square" class="w-4 h-4 opacity-70" />
                <span>Henüz hekim notu girilmemiş. Not eklemek için tıklayın.</span>
              </div>
            </div>

            <!-- Düzenleme Modu -->
            <div v-else class="space-y-2">
              <textarea
                v-model="editableNotes"
                rows="4"
                placeholder="Hasta ile ilgili klinik uyarılar, özel notlar veya hekim gözlemlerinizi yazın..."
                class="w-full p-3 bg-white dark:bg-slate-950 border border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-none resize-y transition-all leading-relaxed shadow-inner"
              ></textarea>
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  @click="cancelEditingNotes"
                  :disabled="isSavingNotes"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="button"
                  @click="saveDoctorNotes"
                  :disabled="isSavingNotes"
                  class="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Icon v-if="isSavingNotes" name="heroicons:arrow-path" class="w-3.5 h-3.5 animate-spin" />
                  <Icon v-else name="heroicons:check" class="w-3.5 h-3.5" />
                  <span>{{ isSavingNotes ? 'Kaydediliyor...' : 'Kaydet' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SAĞ SÜTUN: Sekmeli İçerik Alanı -->
      <div class="lg:col-span-2 flex flex-col gap-6 w-full max-w-full min-w-0">
        
        <!-- Sekme Düğmeleri (Mobil 2 Satırlı Grid: Sıfır Taşma & Masaüstü Esnek Tek Satır) -->
        <div class="bg-white dark:bg-slate-900 p-1.5 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm w-full max-w-full min-w-0">
          <!-- Mobil Görünüm: 2 Satır Şık Segmented Grid (Taşma Yok, Kaydırma Yok, Hepsi Görünür) -->
          <div class="sm:hidden flex flex-col gap-1.5 w-full">
            <div class="grid grid-cols-3 gap-1.5 w-full">
              <button
                v-for="tab in tabs.slice(0, 3)"
                :key="tab.value"
                @click="activeTab = tab.value"
                :class="[
                  activeTab === tab.value
                    ? 'bg-teal-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold bg-slate-50/70 dark:bg-slate-800/40',
                  'flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] transition-all duration-150 text-center min-w-0'
                ]"
              >
                <Icon :name="tab.icon" class="w-4 h-4 mb-0.5 shrink-0" />
                <span class="truncate w-full">{{ tab.shortLabel || tab.label }}</span>
              </button>
            </div>
            <div class="grid grid-cols-3 gap-1.5 w-full">
              <button
                v-for="tab in tabs.slice(3, 6)"
                :key="tab.value"
                @click="activeTab = tab.value"
                :class="[
                  activeTab === tab.value
                    ? 'bg-teal-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold bg-slate-50/70 dark:bg-slate-800/40',
                  'flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] transition-all duration-150 text-center min-w-0'
                ]"
              >
                <Icon :name="tab.icon" class="w-4 h-4 mb-0.5 shrink-0" />
                <span class="truncate w-full">{{ tab.shortLabel || tab.label }}</span>
              </button>
            </div>
          </div>

          <!-- Masaüstü & Tablet Görünüm: Sağa-Sola Kaydırılabilir Esnek Sekme Çubuğu -->
          <div class="hidden sm:flex items-center gap-1.5 w-full overflow-x-auto no-scrollbar scrollbar-none flex-nowrap py-0.5">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="activeTab = tab.value"
              :class="[
                activeTab === tab.value
                  ? 'bg-teal-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold',
                'flex-shrink-0 xl:flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-all duration-200'
              ]"
            >
              <Icon :name="tab.icon" class="w-4 h-4 shrink-0" />
              <span>{{ tab.label }}</span>
            </button>
          </div>
        </div>

        <!-- SEKME İÇERİKLERİ -->
        
        <!-- 1. TEDAVİLER & FİNANS SEKMESİ -->
        <div v-if="activeTab === 'treatments'" class="flex flex-col gap-6 w-full max-w-full min-w-0">
          
          <!-- ============================================== -->
          <!-- AİLE HESABI & ORTAK BAKİYE (FAMILY LEDGER)     -->
          <!-- ============================================== -->
          <div class="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/10 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/80 dark:border-indigo-900/40 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Icon name="heroicons:user-group" class="w-5 h-5" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      👨‍👩‍👧‍👦 Aile Hesabı & Ortak Bakiye
                    </h4>
                    <span
                      v-if="familyData.hasFamily"
                      class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    >
                      {{ familyData.familyMembers.length + 1 }} Kişilik Aile
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Aile bireyleri arasında tek tıkla ortak borç/alacak takibi ve toplu tahsilat dağıtımı
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  @click="openAddFamilyModal"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  <Icon name="heroicons:user-plus" class="w-3.5 h-3.5" />
                  <span>+ Aile Bireyi Ekle</span>
                </button>
              </div>
            </div>

            <!-- Aile Bireyleri Listesi & Bakiye Durumları -->
            <div v-if="familyData.hasFamily" class="space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <!-- 1. Bu Hasta (Aktif Kart) -->
                <div class="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xs flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {{ patientData.patient.firstName }} {{ patientData.patient.lastName }}
                      </span>
                      <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60">
                        Bu Profil
                      </span>
                    </div>
                    <span class="text-[11px] text-slate-400 font-mono block mt-0.5">
                      Borç: {{ formatCurrency(patientData.financials?.balance || 0) }}
                    </span>
                  </div>
                  <span
                    :class="[
                      (patientData.financials?.balance || 0) > 0 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-emerald-600 dark:text-emerald-400 font-bold',
                      'text-xs font-mono shrink-0'
                    ]"
                  >
                    {{ (patientData.financials?.balance || 0) > 0 ? formatCurrency(patientData.financials.balance) : '0 TL (Temiz)' }}
                  </span>
                </div>

                <!-- 2. Bağlı Aile Bireyleri -->
                <div
                  v-for="member in familyData.familyMembers"
                  :key="member.patientId"
                  class="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center justify-between gap-2 group/mem"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <NuxtLink
                        :to="`/patients/${member.patientId}`"
                        class="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline truncate"
                        title="Profiline git"
                      >
                        {{ member.fullName }}
                      </NuxtLink>
                      <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {{ member.relation }}
                      </span>
                    </div>
                    <span class="text-[11px] text-slate-400 font-mono block mt-0.5">
                      Kalan Borç: {{ formatCurrency(member.remainingDebt) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <span
                      :class="[
                        member.remainingDebt > 0 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-emerald-600 dark:text-emerald-400 font-bold',
                        'text-xs font-mono'
                      ]"
                    >
                      {{ member.remainingDebt > 0 ? formatCurrency(member.remainingDebt) : '0 TL (Temiz)' }}
                    </span>
                    <button
                      type="button"
                      @click="removeFamilyMember(member.patientId, member.fullName)"
                      class="opacity-0 group-hover/mem:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded transition-opacity"
                      title="Bağlantıyı Kaldır"
                    >
                      <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Toplam Aile Borcu Gösterge Şeridi -->
              <div class="p-3 rounded-xl bg-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div class="flex items-center gap-2">
                  <Icon name="heroicons:credit-card" class="w-5 h-5 text-indigo-200 shrink-0" />
                  <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-indigo-100 block">Tüm Ailenin Toplam Kalan Borcu</span>
                    <span class="text-[11px] text-indigo-200">
                      Toplu tahsilat alırken "Ödeme Al" ekranından tutarı tek tıkla aile borçlarına dağıtabilirsiniz.
                    </span>
                  </div>
                </div>
                <div class="text-left sm:text-right shrink-0">
                  <div class="text-xl font-black font-mono">
                    {{ formatCurrency(familyData.totalFamilyDebt) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Aile Tanımlanmamışsa Bilgi Kutusu -->
            <div v-else class="p-3.5 bg-white/80 dark:bg-slate-800/40 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">👨‍👩‍👧</span>
                <span class="text-xs text-slate-600 dark:text-slate-400">
                  Bu hastaya henüz aile bireyi bağlanmamış. Eş ve çocukları ekleyerek toplam aile borcunu görebilir ve ortak tahsilat yapabilirsiniz.
                </span>
              </div>
              <button
                type="button"
                @click="openAddFamilyModal"
                class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
              >
                + Aile Bireyi Bağla
              </button>
            </div>
          </div>
          
          <!-- Hızlı Finansal Bakiye Özeti -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full min-w-0">
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm min-w-0">
              <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Toplam Borç</span>
              <span class="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 font-mono block mt-1 truncate">
                {{ formatCurrency(patientData.financials?.totalFee || 0) }}
              </span>
            </div>
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm min-w-0">
              <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Toplam Ödenen</span>
              <span class="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block mt-1 truncate">
                {{ formatCurrency(patientData.financials?.totalPaid || 0) }}
              </span>
            </div>
            <div
              :class="[
                (patientData.financials?.balance || 0) > 0 ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100/50 dark:border-rose-900/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800',
                'p-4 border rounded-2xl shadow-sm min-w-0'
              ]"
            >
              <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Kalan Net Borç</span>
              <span
                :class="[
                  (patientData.financials?.balance || 0) > 0 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100',
                  'text-lg sm:text-xl font-black font-mono block mt-1 truncate'
                ]"
              >
                {{ formatCurrency(patientData.financials?.balance || 0) }}
              </span>
            </div>
          </div>

          <!-- İşlem Butonları -->
          <div class="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full max-w-full">
            <button
              @click="openNewTreatmentModal"
              class="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
            >
              <Icon name="heroicons:plus-circle" class="w-4 h-4 shrink-0" />
              <span>Yeni Tedavi Gir</span>
            </button>
            <button
              @click="openNewPaymentModal"
              class="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
            >
              <Icon name="heroicons:currency-dollar" class="w-4 h-4 shrink-0" />
              <span>Ödeme Tahsil Et</span>
            </button>
            <button
              @click="openPatientReminderModal('treatment')"
              class="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shadow-amber-500/15"
            >
              <Icon name="heroicons:bell-alert" class="w-4 h-4 shrink-0" />
              <span>Hatırlatıcı Ekle</span>
            </button>
          </div>

          <!-- Cari Hesap Defteri (Ledger) -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden w-full max-w-full">
            <div class="px-6 py-4 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
              <h4 class="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Cari Hareket Kayıtları (Ledger)</h4>
            </div>

            <div class="overflow-x-auto w-full max-w-full">
              <table class="w-full text-left border-collapse text-sm">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-950/10 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <th class="px-6 py-3.5">Tarih</th>
                    <th class="px-6 py-3.5">Tür</th>
                    <th class="px-6 py-3.5">İşlem Detayı / Açıklama</th>
                    <th class="px-6 py-3.5 text-right">Tutar</th>
                    <th class="px-6 py-3.5 text-right">Eylem</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr v-if="ledgerItems.length === 0">
                    <td colspan="5" class="px-6 py-10 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                      Bu hastaya ait cari hareket kaydı bulunamadı.
                    </td>
                  </tr>
                  <tr
                    v-for="item in ledgerItems"
                    :key="item.key"
                    class="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <!-- Tarih -->
                    <td class="px-6 py-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                      {{ formatDate(item.date) }}
                    </td>
                    <!-- Tür -->
                    <td class="px-6 py-4">
                      <span
                        v-if="item.type === 'treatment'"
                        class="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                      >
                        Tedavi Borcu
                      </span>
                      <span
                        v-else
                        class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                      >
                        Ödeme Girişi
                      </span>
                    </td>
                    <!-- Detay -->
                    <td class="px-6 py-4">
                      <div class="flex flex-col gap-0.5">
                        <span class="font-bold text-slate-700 dark:text-slate-200">{{ item.description }}</span>
                        <div v-if="item.doctorName" class="flex items-center gap-1 mt-0.5">
                          <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            👨‍⚕️ {{ item.doctorName }}
                          </span>
                        </div>
                        <span v-if="item.tooth" class="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">Diş: {{ item.tooth }}</span>
                        <span v-if="item.notes" class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ item.notes }}</span>
                      </div>
                    </td>
                    <!-- Tutar -->
                    <td
                      :class="[
                        item.type === 'treatment' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
                        'px-6 py-4 text-right font-black font-mono text-base'
                      ]"
                    >
                      {{ item.type === 'treatment' ? '-' : '+' }}{{ formatCurrency(item.amount) }}
                    </td>
                    <!-- Eylemler (Düzenleme & Silme) -->
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          @click="openReminderFromLedger(item)"
                          class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          title="Bu işlem için hatırlatıcı ekle"
                        >
                          <Icon name="heroicons:bell-alert" class="w-4 h-4" />
                        </button>
                        <button
                          @click="openEditModal(item)"
                          class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="İşlemi Düzenle"
                        >
                          <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                        </button>
                        <button
                          @click="deleteLedgerItem(item)"
                          class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="İşlemi Sil"
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

        <!-- 2. RANDEVULAR SEKMESİ -->
        <div v-if="activeTab === 'appointments'" class="flex flex-col gap-4 w-full max-w-full min-w-0">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wider uppercase">Randevu Geçmişi ve Takvimi</h3>
            <button
              @click="openNewAppointmentModal"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold active:scale-95 transition-all shadow-sm"
            >
              <Icon name="heroicons:plus" class="w-3.5 h-3.5" />
              <span>Randevu Ekle</span>
            </button>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden w-full max-w-full">
            <div class="overflow-x-auto w-full max-w-full">
              <table class="w-full text-left border-collapse text-sm">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-950/10 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <th class="px-6 py-3.5">Tarih / Saat</th>
                    <th class="px-6 py-3.5">Yapılacak İşlem</th>
                    <th class="px-6 py-3.5">Süre (Dk)</th>
                    <th class="px-6 py-3.5">Durum</th>
                    <th class="px-6 py-3.5">Notlar</th>
                    <th class="px-6 py-3.5 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr v-if="patientData.appointments.length === 0">
                    <td colspan="6" class="px-6 py-10 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                      Kayıtlı randevu bulunamadı.
                    </td>
                  </tr>
                  <tr
                    v-for="appt in patientData.appointments"
                    :key="appt._id"
                    class="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td class="px-6 py-4">
                      <div class="flex flex-col">
                        <span class="font-bold text-slate-700 dark:text-slate-200">{{ formatDate(appt.date) }}</span>
                        <span class="text-xs text-slate-400 dark:text-slate-500 font-bold font-mono mt-0.5">{{ appt.time }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">
                      {{ appt.procedure }}
                    </td>
                    <td class="px-6 py-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                      {{ appt.duration }} dk
                    </td>
                    <td class="px-6 py-4">
                      <span
                        :class="[
                          getStatusInfo(appt.status).class,
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border'
                        ]"
                      >
                        {{ getStatusInfo(appt.status).label }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-slate-400 dark:text-slate-500 italic">
                      {{ appt.notes || '—' }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <!-- Randevu Düzenle Butonu -->
                        <button
                          @click="openEditAppointmentModal(appt)"
                          class="p-1 bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/40 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded border border-slate-200 dark:border-slate-700 hover:border-teal-300 transition-colors"
                          title="Randevuyu Düzenle"
                        >
                          <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                        </button>
                        <button
                          v-if="appt.status === 'pending' || appt.status === 'postponed'"
                          @click="updateAppointmentStatus(appt._id, 'completed')"
                          class="p-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded border border-emerald-200/50 dark:border-emerald-800/50 transition-colors"
                          title="Tamamla"
                        >
                          <Icon name="heroicons:check" class="w-4 h-4" />
                        </button>
                        <button
                          v-if="appt.status === 'pending'"
                          @click="updateAppointmentStatus(appt._id, 'postponed')"
                          class="p-1 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded border border-purple-200/50 dark:border-purple-800/50 transition-colors"
                          title="Ertele"
                        >
                          <Icon name="heroicons:clock" class="w-4 h-4" />
                        </button>
                        <button
                          v-if="appt.status === 'pending' || appt.status === 'postponed'"
                          @click="updateAppointmentStatus(appt._id, 'cancelled')"
                          class="p-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded border border-rose-200/50 dark:border-rose-800/50 transition-colors"
                          title="İptal Et"
                        >
                          <Icon name="heroicons:x-mark" class="w-4 h-4" />
                        </button>
                        <button
                          @click="deleteAppointment(appt._id)"
                          class="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Randevuyu Sil"
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

        <!-- 3. DİŞ HARİTASI SEKMESİ -->
        <div v-if="activeTab === 'dentalchart'" class="w-full max-w-full min-w-0">
          <InteractiveDentalChart
            :patientId="patientId"
            @saved="loadPatientDetails"
            @transferred="loadPatientDetails"
          />
        </div>

        <!-- 4. LABORATUVAR & PROTEZ SEKMESİ -->
        <div v-if="activeTab === 'labworks'" class="flex flex-col gap-6 w-full max-w-full min-w-0">
          <!-- İstatistik ve Eylem Çubuğu -->
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                @click="labWorkFilter = 'all'"
                :class="[labWorkFilter === 'all' ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800', 'px-3 py-1.5 rounded-xl transition-all shadow-sm']"
              >
                Tümü ({{ labStats.total }})
              </button>
              <button
                type="button"
                @click="labWorkFilter = 'sent'"
                :class="[labWorkFilter === 'sent' ? 'bg-amber-600 text-white font-bold' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800', 'px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5']"
              >
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Teknisyende ({{ labStats.sent }})</span>
              </button>
              <button
                type="button"
                @click="labWorkFilter = 'received'"
                :class="[labWorkFilter === 'received' ? 'bg-emerald-600 text-white font-bold' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800', 'px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5']"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Kliniğe Ulaştı ({{ labStats.received }})</span>
              </button>
              <button
                type="button"
                @click="labWorkFilter = 'fitted'"
                :class="[labWorkFilter === 'fitted' ? 'bg-slate-600 text-white font-bold' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800', 'px-3 py-1.5 rounded-xl transition-all shadow-sm']"
              >
                Takıldı ({{ labStats.fitted }})
              </button>
            </div>

            <button
              type="button"
              @click="openNewLabWorkModal"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-teal-600/20 transition-all active:scale-95"
            >
              <Icon name="heroicons:plus-circle" class="w-4 h-4" />
              <span>Yeni Laboratuvar İşi Ekle</span>
            </button>
          </div>

          <!-- Laboratuvar Kartları Listesi -->
          <div v-if="filteredLabWorks.length === 0" class="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800">
            <div class="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center mb-3">
              <Icon name="heroicons:cube" class="w-6 h-6" />
            </div>
            <h4 class="font-bold text-slate-700 dark:text-slate-200 text-sm">Laboratuvar Kaydı Bulunamadı</h4>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Bu hastaya ait teknisyene gönderilmiş veya tamamlanmış herhangi bir protez/laboratuvar işi henüz eklenmemiş.
            </p>
            <button
              type="button"
              @click="openNewLabWorkModal"
              class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Icon name="heroicons:plus" class="w-3.5 h-3.5" />
              <span>İlk Laboratuvar İşini Ekle</span>
            </button>
          </div>

          <div v-else class="grid grid-cols-1 gap-4">
            <LabWorkCard
              v-for="item in filteredLabWorks"
              :key="item._id"
              :labItem="item"
              :patientPhone="patientData?.patient?.phone"
              @status-change="handleLabWorkStatusChange"
              @delete="deleteLabWork"
            />
          </div>
        </div>

        <!-- 5. ONAM FORMLARI SEKMESİ -->
        <div v-if="activeTab === 'consents'" class="flex flex-col gap-6 w-full max-w-full min-w-0">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 class="font-bold text-slate-800 dark:text-white text-base">Dijital Aydınlatılmış Onam Formları</h4>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Hastanın tablet veya telefondan parmak/kalemle imzaladığı yasal onam belgeleri arşivi
              </p>
            </div>

            <button
              type="button"
              @click="openConsentModal"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Icon name="heroicons:pencil-square" class="w-4 h-4" />
              <span>Yeni Onam Formu İmzalat</span>
            </button>
          </div>

          <!-- Onam Formları Listesi -->
          <div v-if="(!patientData?.consentForms || patientData.consentForms.length === 0)" class="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-100 dark:border-slate-800">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <Icon name="heroicons:document-check" class="w-6 h-6" />
            </div>
            <h4 class="font-bold text-slate-700 dark:text-slate-200 text-sm">İmzalanmış Onam Formu Yok</h4>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Hasta için henüz dijital ortamda imzalatılmış aydınlatılmış onam kaydı bulunmamaktadır.
            </p>
            <button
              type="button"
              @click="openConsentModal"
              class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" />
              <span>Hemen Onam İmzalat</span>
            </button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="form in patientData.consentForms"
              :key="form._id"
              class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                        Aydınlatılmış Onam
                      </span>
                      <span
                        v-if="form.toothNumber"
                        class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800"
                      >
                        🦷 Diş No: {{ form.toothNumber }}
                      </span>
                    </div>
                    <h5 class="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                      {{ form.formTitle }}
                    </h5>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <!-- Önizleme / Yazdırma Butonu -->
                    <button
                      type="button"
                      @click="openConsentPreview(form)"
                      class="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Belgeyi Önizle ve Yazdır"
                    >
                      <Icon name="heroicons:eye" class="w-4 h-4" />
                    </button>

                    <!-- PDF İndir Butonu (Silme Butonunun Hemen Yanında) -->
                    <button
                      type="button"
                      @click="handleDownloadConsentPdf(form)"
                      :disabled="downloadingConsentPdfId === form._id"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                      title="Onam Formunu PDF Olarak İndir"
                    >
                      <Icon v-if="downloadingConsentPdfId === form._id" name="heroicons:arrow-path" class="w-3.5 h-3.5 animate-spin" />
                      <Icon v-else name="heroicons:arrow-down-tray" class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>PDF İndir</span>
                    </button>

                    <!-- Silme Butonu -->
                    <button
                      type="button"
                      @click="deleteConsentForm(form._id)"
                      class="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Onam Formunu Sil"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  v-if="form.acceptanceSignatureBase64 || form.acceptanceText"
                  class="mt-2.5 px-3 py-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-center justify-between gap-2 flex-wrap"
                >
                  <div class="flex items-center gap-1.5">
                    <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span><strong>Hasta El Yazısı Beyanı:</strong></span>
                    <span v-if="!form.acceptanceSignatureBase64">"{{ form.acceptanceText }}"</span>
                  </div>
                  <div
                    v-if="form.acceptanceSignatureBase64"
                    class="border border-amber-300/80 dark:border-amber-800 rounded-lg bg-white p-1 max-h-10 flex items-center justify-center shadow-2xs"
                  >
                    <img
                      :src="form.acceptanceSignatureBase64"
                      alt="Hasta El Yazısı"
                      class="max-h-8 w-auto object-contain"
                    />
                  </div>
                </div>

                <div class="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto select-text whitespace-pre-line font-sans">
                  {{ form.contentSummary }}
                </div>
              </div>

              <!-- İmza Alanı ve Otomatik Zaman Damgası Önizleme -->
              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-3 flex-wrap">
                <!-- Hekim Bilgisi & İmzası -->
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Hekim Onayı</span>
                    <span class="text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.2 rounded border border-teal-200/60">✓ Dt</span>
                  </div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    {{ form.doctorName || 'Dt. M. Selman' }}
                  </span>
                  <div
                    v-if="form.doctorSignatureBase64"
                    class="border border-slate-200 dark:border-slate-700 rounded-lg bg-white p-1 shadow-2xs max-w-[120px] max-h-12 flex items-center justify-center"
                  >
                    <img
                      :src="form.doctorSignatureBase64"
                      alt="Hekim İmzası"
                      class="max-h-9 w-auto object-contain"
                    />
                  </div>
                  <span v-else class="text-[10px] text-slate-400 block italic">Hekim Kaşe / İmza</span>
                </div>

                <!-- Hasta / Vasi Bilgisi & İmzası -->
                <div class="flex flex-col items-end gap-1">
                  <div class="text-right">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Hasta / Vasi İmzası</span>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-100 block mt-0.5">
                      {{ form.signerName || form.patientName }}
                    </span>
                  </div>
                  <div class="border border-slate-200 dark:border-slate-700 rounded-xl bg-white p-1.5 shadow-sm min-w-[130px] max-w-[150px] max-h-14 flex items-center justify-center">
                    <img
                      :src="form.signatureBase64"
                      alt="Hasta İmzası"
                      class="max-h-10 w-auto object-contain"
                    />
                  </div>
                  <span class="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                    {{ form.signedAtFormatted || formatDateTime(form.signedAt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. ORTODONTİ & SEANSLAR SEKMESİ -->
        <div v-if="activeTab === 'orthodontics'" class="flex flex-col gap-6 w-full max-w-full min-w-0">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 class="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                <span>Ortodontik Tedavi Protokolü & Seans Arşivi</span>
                <span v-if="patientData?.orthodonticPlan" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {{ patientData.orthodonticPlan.bracketType }}
                </span>
              </h4>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Hastanın ortodonti seans notları, ark teli/lastik künyesi ve aylık taksit ödeme planı
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openPatientSessionModal"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
              >
                <Icon name="heroicons:plus" class="w-4 h-4 stroke-[2.5]" />
                <span>+ Seans Notu Ekle</span>
              </button>

              <button
                v-if="!patientData?.orthodonticPlan"
                type="button"
                @click="openPatientPlanModal"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-all"
              >
                <Icon name="heroicons:sparkles" class="w-4 h-4 text-indigo-500" />
                <span>Anlaşma Başlat</span>
              </button>
            </div>
          </div>

          <!-- A. Aktif Tedavi Anlaşması & Taksit Çizelgesi -->
          <div v-if="patientData?.orthodonticPlan" class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Ortodonti Anlaşma Künyesi</span>
                <div class="text-sm font-bold text-slate-800 dark:text-white mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{{ patientData.orthodonticPlan.bracketType }} | Başlangıç: {{ formatDate(patientData.orthodonticPlan.startDate) }}</span>
                  <span
                    v-if="patientData.orthodonticPlan.planType === 'per_session' || (!patientData.orthodonticPlan.installments?.length)"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  >
                    Taksitsiz (Seans Başı)
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                  >
                    Aylık Taksitli
                  </span>
                </div>
                <div v-if="patientData.orthodonticPlan.diagnosis" class="text-xs text-slate-500 italic mt-0.5">
                  Tanı: {{ patientData.orthodonticPlan.diagnosis }}
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-left sm:text-right">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sorumlu Hekim</span>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {{ patientData.orthodonticPlan.doctorId?.name || 'Klinik Hekimi' }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="openEditPatientPlanModal(patientData.orthodonticPlan)"
                    class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Anlaşmayı & Fiyatı Düzenle"
                  >
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    @click="openCancelOrDeletePatientPlanModal(patientData.orthodonticPlan)"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Tedaviyi İptal Et veya Sil"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Finansal İlerleme Çubuğu -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span class="text-slate-400 block text-[10px] uppercase font-semibold">Toplam Anlaşma</span>
                <span class="font-mono font-bold text-slate-800 dark:text-white text-sm">
                  {{ formatCurrency(patientData.orthodonticPlan.totalAmount) }}
                </span>
              </div>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span class="text-slate-400 block text-[10px] uppercase font-semibold">Peşinat</span>
                <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {{ formatCurrency(patientData.orthodonticPlan.downPayment || 0) }}
                </span>
              </div>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span class="text-slate-400 block text-[10px] uppercase font-semibold">
                  {{ patientData.orthodonticPlan.planType === 'per_session' ? 'Toplam Tahsil Edilen' : 'Toplam Ödenen' }}
                </span>
                <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {{ formatCurrency(calcPatientPlanPaid(patientData.orthodonticPlan)) }}
                </span>
              </div>
              <div class="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/40">
                <span class="text-rose-500 block text-[10px] uppercase font-semibold">Kalan Bakiye</span>
                <span class="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {{ formatCurrency(calcPatientPlanRemaining(patientData.orthodonticPlan)) }}
                </span>
              </div>
            </div>

            <!-- Taksit Çizelgesi Tablosu -->
            <div v-if="patientData.orthodonticPlan.installments?.length" class="mt-4">
              <div class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Aylık Taksit Tablosu ({{ patientData.orthodonticPlan.installments.length }} Ay)
              </div>
              <div class="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-50 dark:bg-slate-950/30 text-slate-400 font-bold uppercase text-[10px]">
                      <th class="px-3 py-2">Taksit No</th>
                      <th class="px-3 py-2">Vade Tarihi</th>
                      <th class="px-3 py-2 text-right">Tutar</th>
                      <th class="px-3 py-2 text-center">Durum</th>
                      <th class="px-3 py-2 text-right">Tahsilat</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr v-for="inst in patientData.orthodonticPlan.installments" :key="inst.installmentNo" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td class="px-3 py-2 font-bold text-slate-700 dark:text-slate-300">
                        {{ inst.installmentNo }}. Taksit
                      </td>
                      <td class="px-3 py-2 font-mono text-slate-600 dark:text-slate-400">
                        {{ formatDate(inst.dueDate) }}
                      </td>
                      <td class="px-3 py-2 text-right font-mono font-bold text-slate-800 dark:text-white">
                        {{ formatCurrency(inst.amount) }}
                      </td>
                      <td class="px-3 py-2 text-center">
                        <span
                          v-if="inst.status === 'paid'"
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        >
                          ✓ Ödendi
                        </span>
                        <span
                          v-else
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        >
                          Bekliyor
                        </span>
                      </td>
                      <td class="px-3 py-2 text-right">
                        <button
                          v-if="inst.status !== 'paid'"
                          type="button"
                          @click="quickPayInstallment(inst)"
                          class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all"
                        >
                          Ödeme Al
                        </button>
                        <span v-else class="text-[10px] font-mono text-slate-400">{{ formatDate(inst.paymentDate) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Taksitsiz (Seans Başı) Bilgilendirme Kartı -->
            <div v-else class="mt-4 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="heroicons:banknotes" class="w-5 h-5" />
              </div>
              <div class="space-y-1">
                <div class="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Taksitsiz Tedavi (Seans Başı Tahsilat Modeli)
                </div>
                <p class="text-xs text-emerald-700/90 dark:text-emerald-400 leading-relaxed">
                  Bu tedavi için aylık sabit taksit takvimi tanımlanmamıştır. Hasta koltuğa oturup seans aldıkça <b>"+ Seans Notu Ekle"</b> penceresinden girilen tahsilatlar otomatik olarak hekim primine işlenir ve hastanın tedavi borcundan düşülür.
                </p>
              </div>
            </div>
          </div>

          <!-- B. Kronolojik Seans Arşivi (Künye Listesi) -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <span>Kronolojik Seans Arşivi</span>
                <span class="px-2 py-0.5 text-[10px] rounded-full font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  {{ patientData?.orthodonticSessions?.length || 0 }} Seans
                </span>
              </h4>
            </div>

            <div v-if="(!patientData?.orthodonticSessions || patientData.orthodonticSessions.length === 0)" class="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-100 dark:border-slate-800">
              <Icon name="heroicons:document-text" class="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
              <div class="font-bold text-slate-700 dark:text-slate-200 text-sm">Kayıtlı Seans Bulunmuyor</div>
              <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Hasta koltuğa oturduğunda tel değişimi veya braket işlemlerini "+ Seans Notu Ekle" butonuyla kaydedebilirsiniz.
              </p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="s in patientData.orthodonticSessions"
                :key="s._id"
                class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <!-- Seans Rozeti -->
                  <div class="w-11 h-11 rounded-xl bg-indigo-600 text-white font-black flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span class="text-[9px] uppercase font-semibold leading-none">Seans</span>
                    <span class="text-base leading-tight">{{ s.sessionNumber }}</span>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-xs font-bold text-slate-800 dark:text-white font-mono">{{ formatDate(s.date) }} {{ s.time }}</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {{ s.doctorId?.name || 'Diş Hekimi' }}
                      </span>
                      <span v-if="s.paymentAmount > 0" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Icon name="heroicons:banknotes" class="w-3 h-3" />
                        {{ formatCurrency(s.paymentAmount) }} Tahsil Edildi
                      </span>
                    </div>

                    <!-- Seans Notu -->
                    <p class="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line leading-relaxed">
                      {{ s.sessionNotes }}
                    </p>

                    <!-- Tel & Lastik Künyesi -->
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

                    <!-- Sonraki Randevu Notu -->
                    <div v-if="s.nextAppointmentDate" class="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <Icon name="heroicons:calendar" class="w-3.5 h-3.5" />
                      <span>Sonraki Seans: {{ formatDate(s.nextAppointmentDate) }} {{ s.nextAppointmentNotes ? `(${s.nextAppointmentNotes})` : '' }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    @click="openEditPatientSessionModal(s)"
                    class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Seans Notunu Düzenle"
                  >
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    @click="deletePatientSession(s._id)"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Seans Kaydını Sil"
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

    <!-- MODALLAR -->

    <!-- Hatırlatıcı Modalı -->
    <NewReminderModal
      v-if="patientData?.patient"
      :isOpen="isPatientReminderModalOpen"
      :initialCategory="reminderCategory"
      :initialPatientId="patientData.patient._id"
      :initialPatientName="`${patientData.patient.firstName || ''} ${patientData.patient.lastName || ''}`.trim()"
      :initialPatientPhone="patientData.patient.phone || ''"
      :initialNote="reminderInitialNote"
      @close="isPatientReminderModalOpen = false"
    />

    <!-- A. Tedavi Modalı (Yeni / Düzenle) -->
    <AppModal
      :isOpen="isTreatmentModalOpen"
      :title="editingTreatmentId ? '✏️ Tedavi İşlemini Düzenle' : '🦷 Tedavi / İşlem Giriş Formu'"
      width="md"
      @close="isTreatmentModalOpen = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Yapılan İşlem <span class="text-rose-500">*</span></label>
          <input
            v-model="treatmentForm.procedure"
            type="text"
            list="procedure-suggestions"
            required
            placeholder="İşlem adı yazın veya listeden seçin..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
          <datalist id="procedure-suggestions">
            <option v-for="proc in PROCEDURES" :key="proc" :value="proc" />
          </datalist>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Diş Numarası</label>
            <input
              v-model="treatmentForm.tooth"
              type="text"
              placeholder="Örn: 36, 18"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Tedavi Ücreti (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="treatmentForm.fee"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Tarih <span class="text-rose-500">*</span></label>
          <input
            v-model="treatmentForm.date"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">İşlemi Yapan Hekim <span class="text-rose-500">*</span></label>
          <select
            v-model="treatmentForm.doctorId"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option v-for="doc in clinicDoctors" :key="doc._id" :value="doc._id">
              {{ doc.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">İşlem Detay Notu</label>
          <textarea
            v-model="treatmentForm.notes"
            rows="2"
            placeholder="İşleme dair ek klinik detaylar..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button
          @click="isTreatmentModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="saveTreatment"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>{{ isSubmitting ? 'Kaydediliyor...' : (editingTreatmentId ? 'Değişiklikleri Kaydet' : 'Tedaviyi Ekle') }}</span>
        </button>
      </template>
    </AppModal>

    <!-- B. Ödeme Tahsilatı Modalı (Yeni / Düzenle) -->
    <AppModal
      :isOpen="isPaymentModalOpen"
      :title="editingPaymentId ? '✏️ Ödeme Tahsilatını Düzenle' : '💵 Ödeme Tahsilat Formu'"
      width="md"
      @close="isPaymentModalOpen = false"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Miktar (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="paymentForm.amount"
              type="number"
              min="0.01"
              step="any"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Ödeme Yöntemi <span class="text-rose-500">*</span></label>
            <select
              v-model="paymentForm.method"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            >
              <option v-for="m in PAYMENT_METHODS" :key="m.value" :value="m.value" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                {{ m.icon }} {{ m.label }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Hak Ediş Sahibi Hekim <span class="text-rose-500">*</span></label>
          <select
            v-model="paymentForm.doctorId"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option v-for="doc in clinicDoctors" :key="doc._id" :value="doc._id">
              {{ doc.name }} (%{{ doc.rate }} Hak Ediş)
            </option>
          </select>
          <span v-if="paymentForm.amount && paymentForm.doctorId" class="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
            Tahsilat kasaya girer, hekime %{{ getDocRate(paymentForm.doctorId) }} hak ediş ({{ formatCurrency(Math.round((paymentForm.amount * getDocRate(paymentForm.doctorId) / 100) * 100) / 100) }}) birikir.
          </span>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Tarih <span class="text-rose-500">*</span></label>
          <input
            v-model="paymentForm.date"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Açıklama Notu</label>
          <textarea
            v-model="paymentForm.notes"
            rows="2"
            placeholder="Dekont no veya elden tahsil edildi vb..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>

        <!-- Aile Bakiyesine Dağıtma Seçeneği -->
        <div v-if="familyData.hasFamily && !editingPaymentId" class="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-2.5">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="isFamilyDistributionEnabled"
              class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <span class="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              👨‍👩‍👧‍👦 Aile Bakiyesine Say / Dağıt (Toplam Borç: {{ formatCurrency(familyData.totalFamilyDebt) }})
            </span>
          </label>

          <div v-if="isFamilyDistributionEnabled" class="space-y-2 pt-1 border-t border-indigo-200/60 dark:border-indigo-900/50">
            <div class="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
              <span>Birey & Kalan Borç</span>
              <button
                type="button"
                @click="fillTotalFamilyDebt"
                class="hover:underline font-bold text-indigo-800 dark:text-indigo-200"
              >
                Tüm Borcu Otomatik Doldur
              </button>
            </div>

            <div class="space-y-1.5 max-h-48 overflow-y-auto">
              <div
                v-for="d in familyDistributions"
                :key="d.patientId"
                class="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900/40 text-xs"
              >
                <div class="min-w-0">
                  <span class="font-bold text-slate-800 dark:text-white block truncate">{{ d.patientName }}</span>
                  <span class="text-[10px] text-slate-400">({{ d.relation }}) • Kalan Borç: {{ formatCurrency(d.remainingDebt) }}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <span class="text-[10px] text-slate-400 font-bold">₺</span>
                  <input
                    type="number"
                    v-model.number="d.amount"
                    min="0"
                    step="any"
                    class="w-24 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
              <span>Toplam Dağıtılan Tutar:</span>
              <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {{ formatCurrency(familyDistributions.reduce((s, d) => s + (Number(d.amount) || 0), 0)) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          @click="isPaymentModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="savePayment"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>{{ isSubmitting ? 'Kaydediliyor...' : (editingPaymentId ? 'Değişiklikleri Kaydet' : 'Ödemeyi Al') }}</span>
        </button>
      </template>
    </AppModal>

    <!-- C. Randevu Modalı (Ekleme / Düzenleme) -->
    <AppModal
      :isOpen="isAppointmentModalOpen"
      :title="editingAppointmentId ? '✏️ Randevuyu Düzenle' : '📅 Randevu Oluşturma Formu'"
      width="md"
      @close="isAppointmentModalOpen = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Planlanan İşlem <span class="text-rose-500">*</span></label>
          <select
            v-model="appointmentForm.procedure"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          >
            <option value="" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Seçin</option>
            <option v-for="proc in PROCEDURES" :key="proc" :value="proc" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">{{ proc }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Tarih <span class="text-rose-500">*</span></label>
            <input
              v-model="appointmentForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Saat <span class="text-rose-500">*</span></label>
            <input
              v-model="appointmentForm.time"
              type="time"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Süre (Dakika)</label>
          <select
            v-model.number="appointmentForm.duration"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          >
            <option :value="15" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">15 dakika (Hızlı kontrol)</option>
            <option :value="30" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">30 dakika (Normal seans)</option>
            <option :value="45" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">45 dakika</option>
            <option :value="60" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">60 dakika (Kanal, Protez vb.)</option>
            <option :value="90" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">90 dakika (İmplant cerrahisi)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">İlgili Hekim</label>
          <select
            v-model="appointmentForm.doctorId"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option v-for="doc in clinicDoctors" :key="doc._id" :value="doc._id">
              {{ doc.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Randevu Notları</label>
          <textarea
            v-model="appointmentForm.notes"
            rows="2"
            placeholder="Şikayetler veya ön hazırlık bilgileri..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>

        <!-- Düzenleme Modunda Durum Değiştirme -->
        <div v-if="editingAppointmentId">
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Randevu Durumu</label>
          <select
            v-model="appointmentForm.status"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option value="pending">Planlandı / Bekliyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="postponed">Ertelendi</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>
      </div>

      <template #footer>
        <button
          @click="isAppointmentModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="addAppointment"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          {{ editingAppointmentId ? 'Değişiklikleri Kaydet' : 'Randevuyu Kaydet' }}
        </button>
      </template>
    </AppModal>

    <!-- D. WhatsApp Önizleme ve Özel Mesaj Modalı -->
    <AppModal
      :isOpen="isCustomWhatsAppModalOpen"
      title="💬 WhatsApp Mesajı Hazırla & Gönder"
      width="md"
      @close="isCustomWhatsAppModalOpen = false"
    >
      <div class="space-y-4 text-sm">
        <!-- Alıcı Bilgisi -->
        <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700/60">
          <div>
            <div class="text-xs text-slate-400 uppercase font-bold tracking-wider">Alıcı Hasta</div>
            <div class="font-bold text-slate-800 dark:text-white mt-0.5">
              {{ patientData.patient.firstName }} {{ patientData.patient.lastName }}
            </div>
          </div>
          <div class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
            {{ formatPhone(patientData.patient.phone) }}
          </div>
        </div>

        <!-- Hızlı Şablon Seçimi (Kategorili) -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hazır Şablonlar</label>
          <div class="space-y-2">
            <div v-for="group in whatsAppTemplateGroups" :key="group.category">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Icon :name="group.icon" class="w-3 h-3" />
                <span>{{ group.category }}</span>
              </div>
              <div class="flex gap-1.5 flex-wrap">
                <button
                  v-for="item in group.items"
                  :key="item.id"
                  type="button"
                  @click="applyTemplateItem(item)"
                  :class="[
                    selectedTemplateId === item.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                    'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors'
                  ]"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mesaj Metni Alanı -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            WhatsApp Mesaj Metni <span class="text-rose-500">*</span>
          </label>
          <textarea
            v-model="customWhatsAppText"
            rows="5"
            placeholder="Mesajınızı yazın..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm leading-relaxed bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
          <p class="text-[11px] text-slate-400 mt-1">
            "WhatsApp'ta Aç" butonuna basıldığında bu metin hastanın sohbet ekranına otomatik olarak yazılacaktır.
          </p>
        </div>
      </div>

      <template #footer>
        <button
          @click="isCustomWhatsAppModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="sendCustomWhatsApp"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all inline-flex items-center gap-1.5 shadow-emerald-600/20"
        >
          <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
          <span>WhatsApp'ta Aç ve Gönder</span>
        </button>
      </template>
    </AppModal>

    <!-- G. Laboratuvar & Protez İşi Modalı -->
    <AppModal
      :isOpen="isLabWorkModalOpen"
      title="🔬 Yeni Laboratuvar & Protez İşi Kaydı"
      width="md"
      @close="isLabWorkModalOpen = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
            Teknisyen / Laboratuvar Adı <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="labWorkForm.labName"
            type="text"
            list="lab-suggestions"
            required
            placeholder="Örn: Kumluca Dental Lab"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
          <datalist id="lab-suggestions">
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
              v-model="labWorkForm.workType"
              type="text"
              list="worktype-suggestions"
              required
              placeholder="Örn: Zirkonyum Kuron"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
            <datalist id="worktype-suggestions">
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
              v-model="labWorkForm.toothNumbers"
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
              v-model="labWorkForm.shadeColor"
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
              v-model="labWorkForm.sentDate"
              type="date"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
              Beklenen Teslim <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="labWorkForm.expectedDate"
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
            v-model.number="labWorkForm.price"
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
            v-model="labWorkForm.notes"
            rows="2"
            placeholder="Basamak türü, oklüzyon, özel istekler..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="isLabWorkModalOpen = false"
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

    <!-- H. Dijital Onam Formu ve İmza Modalı -->
    <ConsentSignatureModal
      :isOpen="isConsentModalOpen"
      :patientId="patientId"
      :patientName="patientData ? `${patientData.patient.firstName} ${patientData.patient.lastName}` : ''"
      @close="isConsentModalOpen = false"
      @saved="onConsentSaved"
    />

    <!-- J. Ortodonti Seans Notu Ekle / Düzenle Modalı (Hasta Özel) -->
    <AppModal
      :isOpen="isPatientSessionModalOpen"
      :title="editingPatientSessionId ? '✏️ Seans Notunu Düzenle' : '🦷 Ortodonti Seans Notu Ekle'"
      width="md"
      @close="isPatientSessionModalOpen = false"
    >
      <form @submit.prevent="savePatientSession" class="space-y-4">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Seans No <span class="text-rose-500">*</span></label>
            <input
              v-model.number="patientSessionForm.sessionNumber"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-bold text-slate-500 mb-1">Tarih & Saat</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="patientSessionForm.date"
                type="date"
                required
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-white"
              />
              <input
                v-model="patientSessionForm.time"
                type="time"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">İşlemi Yapan Hekim <span class="text-rose-500">*</span></label>
          <select
            v-model="patientSessionForm.doctorId"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
          >
            <option v-for="doc in clinicDoctors" :key="doc._id" :value="doc._id">
              {{ doc.name }} (%{{ doc.rate }} Hak Ediş)
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Seans Notu (Yapılan İşlem) <span class="text-rose-500">*</span></label>
          <textarea
            v-model="patientSessionForm.sessionNotes"
            rows="3"
            required
            placeholder="Örn: 0.16x0.22 SS tele geçildi, sağ üst 5 no braket yapıştırıldı, intermaksiller lastik verildi..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-white leading-relaxed"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Üst Ark Teli</label>
            <input
              v-model="patientSessionForm.archwireUpper"
              type="text"
              placeholder="0.16 NiTi"
              class="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Alt Ark Teli</label>
            <input
              v-model="patientSessionForm.archwireLower"
              type="text"
              placeholder="0.14 NiTi"
              class="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Lastik</label>
            <input
              v-model="patientSessionForm.elastics"
              type="text"
              placeholder="3/16 4.5 oz"
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
          <div v-if="patientData?.orthodonticPlan" class="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between text-xs">
            <span class="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Icon name="heroicons:information-circle" class="w-4 h-4 text-emerald-600" />
              <span>Güncel Tedavi Borcu:</span>
            </span>
            <span class="font-mono font-bold text-slate-800 dark:text-white">
              Kalan: <b class="text-rose-500 font-bold">{{ formatCurrency(calcPatientPlanRemaining(patientData.orthodonticPlan)) }}</b> / Toplam: {{ formatCurrency(patientData.orthodonticPlan.totalAmount) }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Tahsilat Tutarı (TL)</label>
              <div class="relative">
                <input
                  v-model.number="patientSessionForm.paymentAmount"
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
                v-model="patientSessionForm.paymentMethod"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
              >
                <option value="cash">Nakit</option>
                <option value="card">Kredi Kartı / POS</option>
                <option value="transfer">Havale / EFT</option>
              </select>
            </div>
          </div>

          <div v-if="patientSessionForm.paymentAmount > 0" class="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/50 flex items-start gap-1.5">
            <Icon name="heroicons:check-circle" class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <b>{{ formatCurrency(patientSessionForm.paymentAmount) }}</b> tahsilat genel kasaya girer, seçilen hekime <b>%{{ getDoctorRate(patientSessionForm.doctorId) }} ({{ formatCurrency(Math.round(patientSessionForm.paymentAmount * getDoctorRate(patientSessionForm.doctorId) / 100)) }})</b> hak ediş tahakkuk eder ve hastanın tedavi borcundan düşülür<span v-if="patientData?.orthodonticPlan"> (Tahsilat sonrası kalan borç: <b>{{ formatCurrency(Math.max(0, calcPatientPlanRemaining(patientData.orthodonticPlan) - patientSessionForm.paymentAmount)) }}</b>)</span>.
            </span>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label class="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Sonraki Randevu Planı</label>
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="patientSessionForm.nextAppointmentDate"
              type="date"
              class="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-white"
            />
            <input
              v-model="patientSessionForm.nextAppointmentNotes"
              type="text"
              placeholder="Örn: Tel değişimi"
              class="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
            />
          </div>
        </div>
      </form>

      <template #footer>
        <button
          @click="isPatientSessionModalOpen = false"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          İptal
        </button>
        <button
          @click="savePatientSession"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm"
        >
          {{ isSubmitting ? 'Kaydediliyor...' : (editingPatientSessionId ? 'Değişiklikleri Kaydet' : 'Seans Notunu Kaydet') }}
        </button>
      </template>
    </AppModal>

    <!-- K. Ortodonti Tedavi Anlaşması Başlat Modalı -->
    <AppModal
      :isOpen="isPatientPlanModalOpen"
      title="🦷 Ortodonti Tedavi Anlaşması & Taksitlendirme"
      width="md"
      @close="isPatientPlanModalOpen = false"
    >
      <form @submit.prevent="savePatientPlan" class="space-y-4">
        <!-- Ödeme Planı Türü -->
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Ödeme Planı Türü <span class="text-rose-500">*</span></label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="patientPlanForm.planType = 'installments'"
              class="p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              :class="patientPlanForm.planType === 'installments'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'"
            >
              <Icon name="heroicons:calendar" class="w-3.5 h-3.5" />
              <span>Aylık Taksitli</span>
            </button>

            <button
              type="button"
              @click="patientPlanForm.planType = 'per_session'"
              class="p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              :class="patientPlanForm.planType === 'per_session'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'"
            >
              <Icon name="heroicons:banknotes" class="w-3.5 h-3.5" />
              <span>Taksitsiz (Seans Başı)</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Hekim <span class="text-rose-500">*</span></label>
            <select
              v-model="patientPlanForm.doctorId"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option v-for="doc in clinicDoctors" :key="doc._id" :value="doc._id">
                {{ doc.name }} (%{{ doc.rate }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Aygıt / Braket Türü</label>
            <select
              v-model="patientPlanForm.bracketType"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option value="Metal Braket">Metal Braket</option>
              <option value="Safir / Porselen Braket">Safir / Porselen</option>
              <option value="Şeffaf Plak (Aligner)">Şeffaf Plak</option>
              <option value="Lingual Braket">Lingual Braket</option>
              <option value="Hareketli Aparey">Hareketli Aparey</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Toplam Tutar <span class="text-rose-500">*</span></label>
            <input
              v-model.number="patientPlanForm.totalAmount"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-xs"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Peşinat</label>
            <input
              v-model.number="patientPlanForm.downPayment"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-xs"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1">
              {{ patientPlanForm.planType === 'per_session' ? 'Tahmini Süre (Ay)' : 'Süre (Ay)' }} <span class="text-rose-500">*</span>
            </label>
            <select
              v-model.number="patientPlanForm.durationMonths"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-bold text-xs"
            >
              <option :value="6">6 Ay</option>
              <option :value="8">8 Ay</option>
              <option :value="10">10 Ay</option>
              <option :value="12">12 Ay</option>
              <option :value="18">18 Ay</option>
              <option :value="24">24 Ay</option>
            </select>
          </div>
        </div>

        <div v-if="patientPlanForm.planType === 'installments'" class="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl text-center text-xs">
          <span class="text-slate-500 dark:text-slate-400">Tahmini Aylık Taksit: </span>
          <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {{ formatCurrency(Math.round((Math.max(0, (patientPlanForm.totalAmount || 0) - (patientPlanForm.downPayment || 0)) / (patientPlanForm.durationMonths || 1)) * 100) / 100) }} / Ay
          </span>
        </div>

        <div v-else class="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl text-xs space-y-1.5">
          <div class="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
            <span>Taksitsiz (Seans Başı Tahsilat)</span>
            <span class="font-mono">Kalan Borç: {{ formatCurrency(Math.max(0, (patientPlanForm.totalAmount || 0) - (patientPlanForm.downPayment || 0))) }}</span>
          </div>
          <p class="text-[10px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
            💡 Sabit taksit oluşturulmaz. Hasta her seansa geldiğinde seans notuna girilen tahsilatlar doğrudan bu tutardan düşülür.
          </p>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Başlangıç Tarihi <span class="text-rose-500">*</span></label>
          <input
            v-model="patientPlanForm.startDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Teşhis / Not</label>
          <input
            v-model="patientPlanForm.diagnosis"
            type="text"
            placeholder="Örn: Sınıf I çapraşıklık"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs"
          />
        </div>
      </form>

      <template #footer>
        <button
          @click="isPatientPlanModalOpen = false"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          İptal
        </button>
        <button
          @click="savePatientPlan"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm"
        >
          {{ isSubmitting ? 'Oluşturuluyor...' : (patientPlanForm.planType === 'per_session' ? 'Anlaşmayı Başlat (Seans Başı Ödeme)' : 'Anlaşmayı Başlat & Taksitlendir') }}
        </button>
      </template>
    </AppModal>

    <!-- K2. Ortodonti Tedavi Anlaşmasını Düzenle Modalı -->
    <AppModal
      :isOpen="isEditPatientPlanModalOpen"
      title="✏️ Ortodonti Tedavi Anlaşmasını Düzenle"
      width="md"
      @close="isEditPatientPlanModalOpen = false"
    >
      <form @submit.prevent="saveEditPatientPlan" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Toplam Anlaşma (TL) <span class="text-rose-500">*</span></label>
            <input
              v-model.number="editPatientPlanForm.totalAmount"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Tedavi Durumu <span class="text-rose-500">*</span></label>
            <select
              v-model="editPatientPlanForm.status"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option value="active">🟢 Aktif Tedavi</option>
              <option value="paused">🟡 Duraklatıldı</option>
              <option value="completed">🔵 Tamamlandı</option>
              <option value="cancelled">🔴 İptal Edildi</option>
            </select>
          </div>
        </div>
        <span class="text-[10px] text-amber-600 dark:text-amber-400 block -mt-2">
          Fiyat değiştiğinde kalan taksitler ve hastanın genel borcu otomatik eşit güncellenir.
        </span>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Hekim <span class="text-rose-500">*</span></label>
            <select
              v-model="editPatientPlanForm.doctorId"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option v-for="doc in clinicDoctors" :key="doc._id" :value="doc._id">
                {{ doc.name }} (%{{ doc.rate }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Aygıt Türü</label>
            <select
              v-model="editPatientPlanForm.bracketType"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-white"
            >
              <option value="Metal Braket">Metal Braket</option>
              <option value="Safir / Porselen Braket">Safir / Porselen</option>
              <option value="Şeffaf Plak (Aligner)">Şeffaf Plak</option>
              <option value="Lingual Braket">Lingual Braket</option>
              <option value="Hareketli Aparey">Hareketli Aparey</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Süre (Ay)</label>
            <input
              v-model.number="editPatientPlanForm.durationMonths"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Teşhis / Tanı</label>
            <input
              v-model="editPatientPlanForm.diagnosis"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Tedavi Notu</label>
          <textarea
            v-model="editPatientPlanForm.notes"
            rows="2"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          @click="isEditPatientPlanModalOpen = false"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          İptal
        </button>
        <button
          @click="saveEditPatientPlan"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm"
        >
          {{ isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
        </button>
      </template>
    </AppModal>

    <!-- K3. Tedaviyi İptal Et veya Sil Modalı -->
    <AppModal
      :isOpen="isCancelOrDeletePatientPlanModalOpen"
      title="⚠️ Tedavi Anlaşmasını İptal Et veya Sil"
      width="md"
      @close="isCancelOrDeletePatientPlanModalOpen = false"
    >
      <div class="space-y-4">
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Bu hastaya ait ortodonti tedavi anlaşması için gerçekleştirmek istediğiniz işlemi seçiniz:
        </p>

        <div class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1">
          <div class="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Icon name="heroicons:pause" class="w-4 h-4" />
            <span>1. Seçenek: Tedaviyi İptal Et (Önerilen)</span>
          </div>
          <p class="text-[11px] text-amber-700 dark:text-amber-400">
            Anlaşma arşivlenir ve durumu "İptal Edildi" yapılır. Kalan taksitler durdurulur, ancak geçmişe dönük seans ve ödemeler korunur.
          </p>
          <button
            type="button"
            @click="cancelPatientPlan"
            :disabled="isSubmitting"
            class="mt-2 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Tedaviyi İptal Et / Durdur</span>
          </button>
        </div>

        <div class="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1">
          <div class="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
            <Icon name="heroicons:trash" class="w-4 h-4" />
            <span>2. Seçenek: Anlaşmayı Tamamen Sil</span>
          </div>
          <p class="text-[11px] text-rose-700 dark:text-rose-400">
            Yanlışlıkla açılmışsa, bu anlaşma ve bağlı tedavi borç kaydı kalıcı olarak silinir.
          </p>
          <button
            type="button"
            @click="deletePatientPlan"
            :disabled="isSubmitting"
            class="mt-2 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Anlaşmayı Tamamen Sil</span>
          </button>
        </div>
      </div>

      <template #footer>
        <button
          @click="isCancelOrDeletePatientPlanModalOpen = false"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          Kapat
        </button>
      </template>
    </AppModal>

    <!-- M. Aile Bireyi Ekle Modalı -->
    <AppModal
      :isOpen="isFamilyModalOpen"
      title="👨‍👩‍👧‍👦 Aile Bireyi Bağla"
      width="md"
      @close="isFamilyModalOpen = false"
    >
      <div class="space-y-4 text-sm">
        <p class="text-xs text-slate-500">
          Bu hastaya ({{ patientData?.patient?.firstName }} {{ patientData?.patient?.lastName }}) eş, çocuk veya ebeveyn bağlayarak ortak bakiye takibi yapabilirsiniz.
        </p>

        <!-- Hasta Arama Inputu -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Bağlanacak Hasta <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="familySearchInput"
              @input="onFamilySearchInput"
              type="text"
              placeholder="Hasta adı veya telefon numarası yazın..."
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
            <div
              v-if="familySearchResults.length > 0"
              class="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-700/60"
            >
              <div
                v-for="p in familySearchResults"
                :key="p._id"
                @click="selectFamilyTarget(p)"
                class="p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span class="font-bold text-slate-800 dark:text-white block">{{ p.firstName }} {{ p.lastName }}</span>
                  <span class="text-xs text-slate-400 font-mono">{{ formatPhone(p.phone) }}</span>
                </div>
                <span class="text-xs font-bold text-indigo-600">Seç</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Yakınlık Derecesi -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Yakınlık Derecesi <span class="text-rose-500">*</span>
          </label>
          <select
            v-model="familyForm.relation"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option value="Eş">💍 Eş (Karı / Koca)</option>
            <option value="Çocuk">👶 Çocuk (Oğul / Kız)</option>
            <option value="Ebeveyn">👵 Ebeveyn (Anne / Baba)</option>
            <option value="Kardeş">🤝 Kardeş</option>
            <option value="Diğer">👥 Diğer Yakın</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Ek Not / Açıklama
          </label>
          <input
            v-model="familyForm.notes"
            type="text"
            placeholder="Örn: Ödemeler aile reisi tarafından yapılacak"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      <template #footer>
        <button
          @click="isFamilyModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          @click="submitAddFamilyMember"
          :disabled="isSubmitting || !familyForm.targetPatientId"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          Bağlantıyı Kaydet
        </button>
      </template>
    </AppModal>

    <!-- L. Hızlı Taksit Ödeme Modalı -->
    <AppModal
      :isOpen="isQuickPayModalOpen"
      title="💵 Taksit Tahsilatı"
      width="sm"
      @close="isQuickPayModalOpen = false"
    >
      <form @submit.prevent="submitQuickPay" class="space-y-4">
        <div class="text-xs text-slate-500">
          <strong>{{ quickPayData?.installmentNo }}. Taksit</strong> ödemesi alınıyor.
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Tutar (TL) <span class="text-rose-500">*</span></label>
          <input
            v-model.number="quickPayData.amount"
            type="number"
            step="any"
            min="0.01"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Ödeme Yöntemi</label>
          <select
            v-model="quickPayData.method"
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="cash">💵 Nakit</option>
            <option value="card">💳 Kart</option>
            <option value="transfer">🏦 Havale</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Tarih</label>
          <input
            v-model="quickPayData.date"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs"
          />
        </div>
      </form>

      <template #footer>
        <button
          @click="isQuickPayModalOpen = false"
          class="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          İptal
        </button>
        <button
          @click="submitQuickPay"
          :disabled="isSubmitting"
          class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          {{ isSubmitting ? 'Kaydediliyor...' : 'Ödemeyi Al' }}
        </button>
      </template>
    </AppModal>

    <!-- 5. Aydınlatılmış Onam Belgesi Detayı & PDF Önizleme Modalı -->
    <ConsentPreviewModal
      :isOpen="isPreviewModalOpen"
      :form="selectedConsentForm"
      :patient="patientData?.patient"
      @close="isPreviewModalOpen = false"
    />

    <!-- 6. Hasta Profil Bilgilerini Düzenleme Modalı -->
    <AppModal
      :isOpen="isPatientEditModalOpen"
      title="✏️ Hasta Profil Bilgilerini Düzenle"
      width="2xl"
      @close="isPatientEditModalOpen = false"
    >
      <form @submit.prevent="savePatientEdit" class="space-y-4">
        <!-- 1. Kişisel Bilgiler -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
          <Icon name="heroicons:user" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Kişisel Bilgiler</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              Ad <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="patientEditForm.firstName"
              type="text"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              Soyad <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="patientEditForm.lastName"
              type="text"
              required
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">TC Kimlik No</label>
            <input
              v-model="patientEditForm.tcNo"
              type="text"
              maxlength="11"
              placeholder="11 haneli T.C. No"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Doğum Tarihi</label>
              <input
                v-model="patientEditForm.birthDate"
                type="date"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Cinsiyet</label>
              <select
                v-model="patientEditForm.gender"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              >
                <option value="">Seçin</option>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. İletişim Bilgileri -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 pt-2 flex items-center gap-1.5">
          <Icon name="heroicons:phone" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>İletişim Bilgileri</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Telefon</label>
            <input
              v-model="patientEditForm.phone"
              type="text"
              placeholder="05xxxxxxxxx"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">E-posta</label>
            <input
              v-model="patientEditForm.email"
              type="email"
              placeholder="ornek@mail.com"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Adres</label>
            <input
              v-model="patientEditForm.address"
              type="text"
              placeholder="Mahalle, cadde, sokak, no, ilçe/il..."
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <!-- 3. Medikal & Sağlık Bilgileri -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 pt-2 flex items-center gap-1.5">
          <Icon name="heroicons:heart" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Medikal & Sağlık Bilgileri</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Kan Grubu</label>
            <select
              v-model="patientEditForm.bloodType"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold"
            >
              <option value="">Bilinmiyor / Belirtilmemiş</option>
              <option value="A+">A Rh(+)</option>
              <option value="A-">A Rh(-)</option>
              <option value="B+">B Rh(+)</option>
              <option value="B-">B Rh(-)</option>
              <option value="AB+">AB Rh(+)</option>
              <option value="AB-">AB Rh(-)</option>
              <option value="0+">0 Rh(+)</option>
              <option value="0-">0 Rh(-)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Düzenli İlaçlar</label>
            <input
              v-model="patientEditForm.medications"
              type="text"
              placeholder="Örn: Tansiyon ilacı, Aspirin..."
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">Tıbbi Alerjiler (Penisilin vb.)</label>
            <input
              v-model="patientEditForm.allergies"
              type="text"
              placeholder="Örn: Penisilin alerjisi, Lateks..."
              class="w-full px-3 py-2 border border-rose-200 dark:border-rose-900/60 rounded-xl focus:outline-none focus:border-rose-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Kronik Rahatsızlıklar</label>
            <input
              v-model="patientEditForm.chronicDiseases"
              type="text"
              placeholder="Örn: Diyabet, Kalp pili, Astım..."
              class="w-full px-3 py-2 border border-amber-200 dark:border-amber-900/60 rounded-xl focus:outline-none focus:border-amber-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <!-- 4. Acil Durum İrtibatı -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 pt-2 flex items-center gap-1.5">
          <Icon name="heroicons:shield-exclamation" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Acil Durum İrtibatı</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Acil Durum Yakını</label>
            <input
              v-model="patientEditForm.emergencyContact"
              type="text"
              placeholder="Örn: Eşi Tahir Karagöl"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Acil Durum Telefonu</label>
            <input
              v-model="patientEditForm.emergencyPhone"
              type="text"
              placeholder="05xxxxxxxxx"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <!-- 5. Hekim Notu -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 pt-2 flex items-center gap-1.5">
          <Icon name="heroicons:document-text" class="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Klinik Hekim Notları</span>
        </h4>
        <div>
          <textarea
            v-model="patientEditForm.notes"
            rows="3"
            placeholder="Hasta hakkında hekim notları, özel açıklamalar..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="isPatientEditModalOpen = false"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          İptal
        </button>
        <button
          type="button"
          @click="savePatientEdit"
          :disabled="isSavingPatient"
          class="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          {{ isSavingPatient ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
        </button>
      </template>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUtils } from '~/composables/useUtils';
import { downloadConsentPdf } from '~/utils/consentPdf';

const route = useRoute();
const patientId = route.params.id;

// WhatsApp ve Hızlı Arama Durumları
const whatsappDropdownRef = ref(null);
const isWhatsAppMenuOpen = ref(false);
const isCustomWhatsAppModalOpen = ref(false);
const selectedTemplateId = ref('appt_reminder');
const customWhatsAppText = ref('');

// Aile Hesabı & Ortak Bakiye State
const familyData = ref({
  currentPatient: null,
  familyMembers: [],
  totalFamilyDebt: 0,
  hasFamily: false
});
const isLoadingFamily = ref(false);
const isFamilyModalOpen = ref(false);
const familyForm = ref({
  targetPatientId: '',
  relation: 'Eş',
  notes: ''
});
const familySearchInput = ref('');
const familySearchResults = ref([]);
const isSearchingFamilyPatients = ref(false);
let familySearchTimer = null;

// Tahsilat Modalında Aile Dağıtımı State
const isFamilyDistributionEnabled = ref(false);
const familyDistributions = ref([]);

const {
  formatDate,
  formatDateTime,
  calculateAge,
  formatCurrency,
  formatPhone,
  getAvatarColorClass,
  getInitials,
  PROCEDURES,
  PAYMENT_METHODS,
  getStatusInfo,
  todayStr
} = useUtils();

// Durumlar
const patientData = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);

// Hekim Notu Düzenleme Durumu
const isEditingNotes = ref(false);
const editableNotes = ref('');
const isSavingNotes = ref(false);

const startEditingNotes = () => {
  editableNotes.value = patientData.value?.patient?.notes || '';
  isEditingNotes.value = true;
};

const cancelEditingNotes = () => {
  isEditingNotes.value = false;
  editableNotes.value = '';
};

const saveDoctorNotes = async () => {
  if (!patientData.value?.patient?._id) return;
  try {
    isSavingNotes.value = true;
    const patId = String(patientData.value.patient._id);

    await $fetch(`/api/patients/${patId}`, {
      method: 'PUT',
      body: {
        notes: editableNotes.value
      }
    });

    patientData.value.patient.notes = editableNotes.value;
    isEditingNotes.value = false;

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: {
        message: 'Hekim notu başarıyla güncellendi.',
        type: 'success'
      }
    }));
  } catch (error) {
    console.error('Hekim notu kaydedilemedi:', error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error.data?.message || 'Not kaydedilirken bir hata oluştu.', type: 'error' }
    }));
  } finally {
    isSavingNotes.value = false;
  }
};

// Hasta Bilgilerini Düzenleme Durumu & Formu
const isPatientEditModalOpen = ref(false);
const isSavingPatient = ref(false);
const patientEditForm = ref({
  firstName: '',
  lastName: '',
  tcNo: '',
  birthDate: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  bloodType: '',
  allergies: '',
  chronicDiseases: '',
  medications: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: ''
});

const openPatientEditModal = () => {
  const p = patientData.value?.patient || {};
  patientEditForm.value = {
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    tcNo: p.tcNo || '',
    birthDate: p.birthDate ? String(p.birthDate).slice(0, 10) : '',
    gender: p.gender || '',
    phone: p.phone || '',
    email: p.email || '',
    address: p.address || '',
    bloodType: p.bloodType || '',
    allergies: p.allergies || '',
    chronicDiseases: p.chronicDiseases || '',
    medications: p.medications || '',
    emergencyContact: p.emergencyContact || '',
    emergencyPhone: p.emergencyPhone || '',
    notes: p.notes || ''
  };
  isPatientEditModalOpen.value = true;
};

const savePatientEdit = async () => {
  if (!patientData.value?.patient?._id) return;
  try {
    isSavingPatient.value = true;
    const patId = String(patientData.value.patient._id);
    const updated = await $fetch(`/api/patients/${patId}`, {
      method: 'PUT',
      body: patientEditForm.value
    });

    if (updated) {
      patientData.value.patient = {
        ...patientData.value.patient,
        ...updated
      };
    }

    isPatientEditModalOpen.value = false;
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: {
        message: 'Hasta profil bilgileri başarıyla güncellendi.',
        type: 'success'
      }
    }));
    await loadPatientDetails();
  } catch (error) {
    console.error('Hasta güncellenirken hata:', error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: {
        message: error?.data?.message || 'Hasta bilgileri güncellenirken bir hata oluştu.',
        type: 'error'
      }
    }));
  } finally {
    isSavingPatient.value = false;
  }
};

const tabs = [
  { value: 'treatments', label: 'Tedaviler & Finans', shortLabel: 'Tedaviler', icon: 'heroicons:banknotes' },
  { value: 'appointments', label: 'Randevular', shortLabel: 'Randevular', icon: 'heroicons:calendar' },
  { value: 'dentalchart', label: 'Diş Haritası', shortLabel: 'Diş Haritası', icon: 'heroicons:squares-plus' },
  { value: 'orthodontics', label: 'Ortodonti & Seanslar', shortLabel: 'Ortodonti', icon: 'heroicons:sparkles' },
  { value: 'labworks', label: 'Laboratuvar & Protez', shortLabel: 'Lab & Protez', icon: 'heroicons:cube' },
  { value: 'consents', label: 'Onam Formları', shortLabel: 'Onam Formu', icon: 'heroicons:document-check' }
];
const activeTab = ref('treatments');

// Laboratuvar & Protez Durumları
const isLabWorkModalOpen = ref(false);
const labWorkFilter = ref('all');
const labWorkForm = ref({
  labName: 'Kumluca Dental Lab',
  workType: 'Zirkonyum Kuron',
  toothNumbers: '',
  shadeColor: 'A2',
  sentDate: todayStr(),
  expectedDate: '',
  price: 0,
  notes: ''
});

const filteredLabWorks = computed(() => {
  const works = patientData.value?.labWorks || [];
  if (labWorkFilter.value === 'all') return works;
  return works.filter(w => w.status === labWorkFilter.value);
});

const labStats = computed(() => {
  const works = patientData.value?.labWorks || [];
  return {
    total: works.length,
    sent: works.filter(w => w.status === 'sent').length,
    received: works.filter(w => w.status === 'received').length,
    fitted: works.filter(w => w.status === 'fitted').length,
    revision: works.filter(w => w.status === 'revision').length,
  };
});

// Dijital Onam Formu Durumları
const isConsentModalOpen = ref(false);
const isPreviewModalOpen = ref(false);
const selectedConsentForm = ref(null);
const downloadingConsentPdfId = ref(null);

// Modal durumları
const isTreatmentModalOpen = ref(false);
const isPaymentModalOpen = ref(false);
const isAppointmentModalOpen = ref(false);
const editingTreatmentId = ref(null);
const editingPaymentId = ref(null);
const editingAppointmentId = ref(null);

// Hatırlatıcı Modal Durumları
const isPatientReminderModalOpen = ref(false);
const reminderCategory = ref('treatment');
const reminderInitialNote = ref('');

const openPatientReminderModal = (cat = 'treatment', note = '') => {
  reminderCategory.value = cat;
  reminderInitialNote.value = note;
  isPatientReminderModalOpen.value = true;
};

const openReminderFromLedger = (item) => {
  if (item.type === 'treatment') {
    const desc = item.description || item.procedure || 'Tedavi';
    const toothInfo = item.tooth ? ` (Diş: ${item.tooth})` : '';
    openPatientReminderModal('treatment', `${desc}${toothInfo} kontrolü, daimi dolgu`);
  } else {
    const amtStr = formatCurrency(item.amount);
    openPatientReminderModal('payment', `${amtStr} ödeme takibi`);
  }
};

// Hekim Listesi (Tahsilat ve Tedavi seçimleri için - Klinik filtrelenmiş)
const clinicDoctors = ref([]);

const sortDoctorsSelmanFirst = (list) => {
  return [...list].sort((a, b) => {
    const aIsSelman = a.name?.toLowerCase().includes('selman') || a.username === 'dtselo' || a.name?.toLowerCase().includes('muhammed');
    const bIsSelman = b.name?.toLowerCase().includes('selman') || b.username === 'dtselo' || b.name?.toLowerCase().includes('muhammed');
    if (aIsSelman && !bIsSelman) return -1;
    if (!aIsSelman && bIsSelman) return 1;
    return 0;
  });
};

const getDefaultDoctorId = () => {
  const selman = clinicDoctors.value.find(d => 
    d.name?.toLowerCase().includes('selman') || 
    d.username === 'dtselo' || 
    d.name?.toLowerCase().includes('muhammed')
  );
  if (selman && selman._id) return String(selman._id);
  return clinicDoctors.value[0]?._id ? String(clinicDoctors.value[0]._id) : '';
};

const loadDoctors = async () => {
  try {
    if (process.client) {
      const cached = localStorage.getItem('tenax_doctors_cache');
      if (cached) {
        clinicDoctors.value = sortDoctorsSelmanFirst(JSON.parse(cached));
      }
    }
    if (navigator.onLine) {
      const data = await $fetch('/api/doctors', { timeout: 4000 });
      const filtered = (data || []).filter(d => !d.name?.toLowerCase().includes('klinik') && d.username !== 'klinik');
      clinicDoctors.value = sortDoctorsSelmanFirst(filtered);
      if (process.client) {
        localStorage.setItem('tenax_doctors_cache', JSON.stringify(clinicDoctors.value));
      }
    }
    const defId = getDefaultDoctorId();
    if (defId) {
      if (!treatmentForm.value.doctorId) treatmentForm.value.doctorId = defId;
      if (!paymentForm.value.doctorId) paymentForm.value.doctorId = defId;
      if (!appointmentForm.value.doctorId) appointmentForm.value.doctorId = defId;
      if (!patientPlanForm.value.doctorId) patientPlanForm.value.doctorId = defId;
      if (!patientSessionForm.value.doctorId) patientSessionForm.value.doctorId = defId;
    }
  } catch (err) {
    console.warn('Hekimler yüklenirken hata:', err);
  }
};

const getDocRate = (doctorId) => {
  const doc = clinicDoctors.value.find(d => d._id === doctorId);
  return doc?.rate !== undefined ? doc.rate : 30;
};

// Ortodonti Özel Modal ve Form Durumları
const isPatientSessionModalOpen = ref(false);
const isPatientPlanModalOpen = ref(false);
const isQuickPayModalOpen = ref(false);
const editingPatientSessionId = ref(null);
const isEditPatientPlanModalOpen = ref(false);
const isCancelOrDeletePatientPlanModalOpen = ref(false);
const selectedPatientPlanForAction = ref(null);

const editPatientPlanForm = ref({
  id: '',
  doctorId: '',
  bracketType: 'Metal Braket',
  totalAmount: 30000,
  durationMonths: 10,
  status: 'active',
  diagnosis: '',
  notes: ''
});

const quickPayData = ref({
  planId: '',
  installmentNo: 1,
  amount: 0,
  method: 'cash',
  date: todayStr()
});

const patientSessionForm = ref({
  sessionNumber: 1,
  date: todayStr(),
  time: '11:00',
  doctorId: '',
  sessionNotes: '',
  archwireUpper: '',
  archwireLower: '',
  elastics: '',
  paymentAmount: 0,
  paymentMethod: 'cash',
  paymentNotes: '',
  nextAppointmentDate: '',
  nextAppointmentNotes: ''
});

const patientPlanForm = ref({
  doctorId: '',
  bracketType: 'Metal Braket',
  totalAmount: 30000,
  downPayment: 5000,
  durationMonths: 10,
  startDate: todayStr(),
  diagnosis: '',
  planType: 'installments'
});

const calcPatientPlanPaid = (plan) => {
  if (!plan) return 0;
  // Hastaya ait doğrudan ortodonti etiketli / plan id'li tüm tahsilatları topla
  const directOrthoPayments = (patientData.value?.payments || [])
    .filter(p => (p.orthodonticPlanId && String(p.orthodonticPlanId) === String(plan._id)) || (p.isOrthodontic && (!p.orthodonticPlanId || String(p.orthodonticPlanId) === String(plan._id))))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const instPaid = (plan.installments || [])
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + (i.paidAmount || i.amount || 0), 0);
  return Math.max(directOrthoPayments, (plan.downPayment || 0) + instPaid);
};

const calcPatientPlanRemaining = (plan) => {
  if (!plan) return 0;
  return Math.max(0, (plan.totalAmount || 0) - calcPatientPlanPaid(plan));
};

// Form Nesneleri
const treatmentForm = ref({
  procedure: '',
  tooth: '',
  fee: 0,
  date: todayStr(),
  notes: '',
  doctorId: ''
});

const paymentForm = ref({
  amount: 0,
  method: 'cash',
  date: todayStr(),
  notes: '',
  doctorId: ''
});

const appointmentForm = ref({
  procedure: '',
  date: todayStr(),
  time: '09:00',
  duration: 30,
  status: 'pending',
  notes: ''
});

// Hastaya ait verileri API'den yükle
const loadPatientDetails = async () => {
  try {
    isLoading.value = !patientData.value;
    const data = await $fetch(`/api/patients/${patientId}`);
    if (data && data.patient) {
      if (!data.financials) {
        const trs = data.treatments || [];
        const pays = data.payments || [];
        const totalFee = trs.reduce((sum, t) => sum + (Number(t.fee) || 0), 0);
        const totalPaid = pays.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const balance = (data.patient?.balance !== undefined && data.patient?.balance !== null && typeof data.patient?.balance === 'number')
          ? data.patient.balance
          : (totalFee - totalPaid);
        data.financials = { totalFee, totalPaid, balance };
      }
      patientData.value = data;
      await loadFamilyData();
    }
  } catch (error) {
    console.error('Hasta detayı yüklenemedi:', error);
  } finally {
    isLoading.value = false;
  }
};

// Tedaviler ve ödemeleri birleştirerek kronolojik "Cari Defter" girdileri oluşturur
const ledgerItems = computed(() => {
  if (!patientData.value) return [];
  
  const items = [];
  
  // Tedavileri borç olarak ekle
  patientData.value.treatments?.forEach((t) => {
    const docId = t.doctorId && typeof t.doctorId === 'object'
      ? (t.doctorId._id ? String(t.doctorId._id) : '')
      : (t.doctorId ? String(t.doctorId) : '');
    const docName = t.doctorId && typeof t.doctorId === 'object' ? (t.doctorId.name || '') : '';

    items.push({
      key: `t-${t._id}`,
      id: t._id,
      type: 'treatment',
      date: t.date,
      description: t.procedure,
      procedure: t.procedure,
      tooth: t.tooth,
      notes: t.notes,
      amount: t.fee,
      doctorId: docId,
      doctorName: docName,
      rawCreatedAt: t.createdAt
    });
  });

  // Ödemeleri alacak olarak ekle
  patientData.value.payments?.forEach((p) => {
    const methodLabel = PAYMENT_METHODS.find(m => m.value === p.method)?.label || p.method;
    const docId = p.doctorId && typeof p.doctorId === 'object'
      ? (p.doctorId._id ? String(p.doctorId._id) : '')
      : (p.doctorId ? String(p.doctorId) : '');
    const docName = p.doctorId && typeof p.doctorId === 'object' ? (p.doctorId.name || '') : '';

    items.push({
      key: `p-${p._id}`,
      id: p._id,
      type: 'payment',
      date: p.date,
      description: `Ödeme Tahsilatı (${methodLabel})`,
      method: p.method,
      notes: p.notes,
      amount: p.amount,
      doctorId: docId,
      doctorName: docName,
      rawCreatedAt: p.createdAt
    });
  });

  // Önce tarihe göre en yeni üstte, aynı tarihtekileri ise sisteme girilme sırasına göre sırala
  return items.sort((a, b) => {
    const dComp = (b.date || '').localeCompare(a.date || '');
    if (dComp !== 0) return dComp;
    const timeA = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : 0;
    const timeB = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : 0;
    return timeB - timeA;
  });
});

// Yeni Tedavi Modalı Aç
const openNewTreatmentModal = async () => {
  if (!clinicDoctors.value || clinicDoctors.value.length === 0) {
    await loadDoctors();
  }
  editingTreatmentId.value = null;
  treatmentForm.value = {
    procedure: '',
    tooth: '',
    fee: 0,
    date: todayStr(),
    notes: '',
    doctorId: getDefaultDoctorId()
  };
  isTreatmentModalOpen.value = true;
};

// Yeni Ödeme Modalı Aç
const openNewPaymentModal = async () => {
  if (!clinicDoctors.value || clinicDoctors.value.length === 0) {
    await loadDoctors();
  }
  editingPaymentId.value = null;
  paymentForm.value = {
    amount: null,
    method: 'cash',
    date: todayStr(),
    notes: '',
    doctorId: getDefaultDoctorId()
  };
  isFamilyDistributionEnabled.value = false;
  prepareFamilyDistributions();
  isPaymentModalOpen.value = true;
};

// Cari Hareketi Düzenleme Modalı Aç
const openEditModal = async (item) => {
  if (!clinicDoctors.value || clinicDoctors.value.length === 0) {
    await loadDoctors();
  }

  if (item.type === 'treatment') {
    editingTreatmentId.value = item.id;
    // Orijinal tedaviden doctorId'yi doğrula (varsa)
    const orig = patientData.value?.treatments?.find(t => String(t._id) === String(item.id));
    const origDocId = orig?.doctorId && typeof orig.doctorId === 'object'
      ? String(orig.doctorId._id || '')
      : (orig?.doctorId ? String(orig.doctorId) : '');
    const finalDocId = item.doctorId || origDocId || (clinicDoctors.value[0]?._id ? String(clinicDoctors.value[0]._id) : '');

    treatmentForm.value = {
      procedure: item.procedure || item.description || '',
      tooth: item.tooth || '',
      fee: item.amount || 0,
      date: item.date || todayStr(),
      notes: item.notes || '',
      doctorId: finalDocId
    };
    isTreatmentModalOpen.value = true;
  } else if (item.type === 'payment') {
    editingPaymentId.value = item.id;
    // Orijinal ödemeden doctorId'yi doğrula (varsa)
    const orig = patientData.value?.payments?.find(p => String(p._id) === String(item.id));
    const origDocId = orig?.doctorId && typeof orig.doctorId === 'object'
      ? String(orig.doctorId._id || '')
      : (orig?.doctorId ? String(orig.doctorId) : '');
    const finalDocId = item.doctorId || origDocId || (clinicDoctors.value[0]?._id ? String(clinicDoctors.value[0]._id) : '');

    paymentForm.value = {
      amount: item.amount || 0,
      method: item.method || 'cash',
      date: item.date || todayStr(),
      notes: item.notes || '',
      doctorId: finalDocId
    };
    isPaymentModalOpen.value = true;
  }
};

// Tedavi Kaydet (Yerel 0ms + Arka Plan Kuyruk)
const saveTreatment = async () => {
  if (isSubmitting.value) return; // Mükerrer tıklama koruması
  if (!treatmentForm.value.procedure || treatmentForm.value.fee === undefined || treatmentForm.value.fee === null) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen işlem adını ve ücretini girin.', type: 'error' }
    }));
    return;
  }
  try {
    isSubmitting.value = true;
    const strPid = String(patientId);

    if (editingTreatmentId.value) {
      const targetId = editingTreatmentId.value;
      await $fetch(`/api/treatments/${targetId}`, {
        method: 'PUT',
        body: {
          patientId: strPid,
          ...treatmentForm.value
        }
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Tedavi işlemi başarıyla güncellendi.', type: 'success' }
      }));
    } else {
      await $fetch('/api/treatments', {
        method: 'POST',
        body: {
          patientId: strPid,
          ...treatmentForm.value
        }
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Tedavi kaydı başarıyla eklendi.', type: 'success' }
      }));
    }

    isTreatmentModalOpen.value = false;
    treatmentForm.value = {
      procedure: '',
      tooth: '',
      fee: 0,
      date: todayStr(),
      notes: '',
      doctorId: getDefaultDoctorId()
    };
    editingTreatmentId.value = null;

    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Tedavi kaydedilirken bir hata oluştu.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

// Ödeme Kaydet (Yerel 0ms + Arka Plan Kuyruk veya Aile Dağıtımı)
const savePayment = async () => {
  // 1. Aile Ortak Bakiye Dağıtımı Aktifse
  if (isFamilyDistributionEnabled.value && !editingPaymentId.value) {
    const activeDists = familyDistributions.value.filter((d) => Number(d.amount) > 0);
    if (activeDists.length === 0) {
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Lütfen aile bireylerine en az bir ödeme tutarı dağıtın.', type: 'error' }
      }));
      return;
    }

    try {
      isSubmitting.value = true;
      const res = await $fetch(`/api/patients/${patientId}/family-payment`, {
        method: 'POST',
        body: {
          distributions: activeDists,
          method: paymentForm.value.method,
          doctorId: paymentForm.value.doctorId,
          date: paymentForm.value.date,
          notes: paymentForm.value.notes
        }
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: res.message || 'Aile ödemesi başarıyla dağıtıldı.', type: 'success' }
      }));

      isPaymentModalOpen.value = false;
      await Promise.all([loadPatientDetails(), loadFamilyData()]);
      window.dispatchEvent(new CustomEvent('refresh-stats'));
    } catch (error) {
      console.error(error);
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: error?.data?.message || 'Aile ödemesi dağıtılırken hata oluştu.', type: 'error' }
      }));
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  // 2. Normal Tekil Hasta Ödemesi
  if (isSubmitting.value) return; // Mükerrer tıklama koruması
  if (!paymentForm.value.amount || !paymentForm.value.method) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen geçerli bir ödeme tutarı girin.', type: 'error' }
    }));
    return;
  }
  try {
    isSubmitting.value = true;
    const strPid = String(patientId);

    if (editingPaymentId.value) {
      const targetId = editingPaymentId.value;
      await $fetch(`/api/payments/${targetId}`, {
        method: 'PUT',
        body: {
          patientId: strPid,
          ...paymentForm.value
        }
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Ödeme tahsilatı başarıyla güncellendi.', type: 'success' }
      }));
    } else {
      await $fetch('/api/payments', {
        method: 'POST',
        body: {
          patientId: strPid,
          ...paymentForm.value
        }
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Ödeme başarıyla tahsil edildi.', type: 'success' }
      }));
    }

    isPaymentModalOpen.value = false;
    paymentForm.value = {
      amount: 0,
      method: 'cash',
      date: todayStr(),
      notes: '',
      doctorId: getDefaultDoctorId()
    };
    editingPaymentId.value = null;

    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Ödeme kaydedilirken hata oluştu.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

// Ledger (Cari) girdisini sil (Yerel 0ms + Arka Plan Kuyruk)
const deleteLedgerItem = async (item) => {
  const confirmText = `${item.description} işlemini cari hesaptan silmek istediğinize emin misiniz?`;
  if (!window.confirm(confirmText)) return;

  try {
    const isTreatment = item.type === 'treatment';
    const endpoint = isTreatment ? `/api/treatments/${item.id}` : `/api/payments/${item.id}`;

    await $fetch(endpoint, { method: 'DELETE' });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Cari işlem başarıyla silindi.', type: 'success' }
    }));
    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'İşlem silinirken bir hata oluştu.', type: 'error' }
    }));
  }
};

// Yeni Randevu Ekleme Modalını Temiz Aç
const openNewAppointmentModal = async () => {
  if (!clinicDoctors.value || clinicDoctors.value.length === 0) {
    await loadDoctors();
  }
  editingAppointmentId.value = null;
  appointmentForm.value = {
    procedure: '',
    date: todayStr(),
    time: '09:00',
    duration: 30,
    status: 'pending',
    notes: '',
    doctorId: getDefaultDoctorId()
  };
  isAppointmentModalOpen.value = true;
};

// Randevu Düzenleme Modalını Aç
const openEditAppointmentModal = async (appt) => {
  if (!clinicDoctors.value || clinicDoctors.value.length === 0) {
    await loadDoctors();
  }
  editingAppointmentId.value = appt._id;
  let dStr = todayStr();
  if (appt.date) {
    if (typeof appt.date === 'string' && appt.date.includes('T')) {
      dStr = appt.date.split('T')[0];
    } else {
      dStr = String(appt.date).substring(0, 10);
    }
  }
  const docId = appt.doctorId && typeof appt.doctorId === 'object'
    ? String(appt.doctorId._id || '')
    : (appt.doctorId ? String(appt.doctorId) : getDefaultDoctorId());

  appointmentForm.value = {
    procedure: appt.procedure || '',
    date: dStr,
    time: appt.time || '09:00',
    duration: appt.duration || 30,
    status: appt.status || 'pending',
    notes: appt.notes || '',
    doctorId: docId
  };
  isAppointmentModalOpen.value = true;
};

// Yeni Randevu Ekle veya Mevcut Randevuyu Düzenle
const addAppointment = async () => {
  if (!appointmentForm.value.procedure || !appointmentForm.value.date || !appointmentForm.value.time) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen randevu tarihi, saati ve işlem adını doldurun.', type: 'error' }
    }));
    return;
  }
  try {
    isSubmitting.value = true;
    const strPid = String(patientId);

    const payload = {
      patientId: strPid,
      ...appointmentForm.value
    };
    if (!payload.doctorId) {
      payload.doctorId = getDefaultDoctorId();
    }

    if (editingAppointmentId.value) {
      await $fetch(`/api/appointments/${editingAppointmentId.value}`, {
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

    isAppointmentModalOpen.value = false;
    editingAppointmentId.value = null;
    appointmentForm.value = {
      procedure: '',
      date: todayStr(),
      time: '09:00',
      duration: 30,
      status: 'pending',
      notes: '',
      doctorId: getDefaultDoctorId()
    };
    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: {
        message: editingAppointmentId.value ? 'Randevu güncellenirken hata oluştu.' : 'Randevu eklenirken hata oluştu.',
        type: 'error'
      }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

// Randevu Durum Güncelle
const updateAppointmentStatus = async (apptId, status) => {
  try {
    await $fetch(`/api/appointments/${apptId}`, {
      method: 'PUT',
      body: { status }
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Randevu durumu güncellendi.', type: 'success' }
    }));

    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Randevu güncellenirken hata oluştu.', type: 'error' }
    }));
  }
};

// Randevu Sil
const deleteAppointment = async (apptId) => {
  if (!window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return;
  try {
    await $fetch(`/api/appointments/${apptId}`, {
      method: 'DELETE'
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Randevu kaydı silindi.', type: 'success' }
    }));

    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Randevu silinirken hata oluştu.', type: 'error' }
    }));
  }
};

// Laboratuvar & Protez İşi Metodları
const openNewLabWorkModal = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  const fiveDaysLater = d.toISOString().split('T')[0];

  labWorkForm.value = {
    labName: 'Kumluca Dental Lab',
    workType: 'Zirkonyum Kuron',
    toothNumbers: '',
    shadeColor: 'A2',
    sentDate: todayStr(),
    expectedDate: fiveDaysLater,
    price: 0,
    notes: ''
  };
  isLabWorkModalOpen.value = true;
};

const saveLabWork = async () => {
  if (!labWorkForm.value.labName || !labWorkForm.value.workType || !labWorkForm.value.expectedDate) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen zorunlu alanları (Laboratuvar, İş Türü, Beklenen Tarih) doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSubmitting.value = true;
    const teeth = labWorkForm.value.toothNumbers
      ? labWorkForm.value.toothNumbers.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    await $fetch('/api/lab-works', {
      method: 'POST',
      body: {
        patientId,
        patientName: `${patientData.value.patient.firstName} ${patientData.value.patient.lastName}`,
        labName: labWorkForm.value.labName,
        workType: labWorkForm.value.workType,
        toothNumbers: teeth,
        shadeColor: labWorkForm.value.shadeColor,
        sentDate: labWorkForm.value.sentDate,
        expectedDate: labWorkForm.value.expectedDate,
        price: Number(labWorkForm.value.price) || 0,
        notes: labWorkForm.value.notes
      }
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Laboratuvar işi başarıyla kaydedildi.', type: 'success' }
    }));

    isLabWorkModalOpen.value = false;
    await loadPatientDetails();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error?.data?.message || 'Laboratuvar işi kaydedilemedi.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const handleLabWorkStatusChange = async ({ id, status }) => {
  try {
    await $fetch(`/api/lab-works/${id}`, {
      method: 'PUT',
      body: { status }
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Laboratuvar işi durumu güncellendi.', type: 'success' }
    }));

    await loadPatientDetails();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Durum güncellenirken hata oluştu.', type: 'error' }
    }));
  }
};

const deleteLabWork = async (id) => {
  if (!confirm('Bu laboratuvar kaydını silmek istediğinizden emin misiniz?')) return;

  try {
    await $fetch(`/api/lab-works/${id}`, {
      method: 'DELETE'
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Laboratuvar kaydı silindi.', type: 'success' }
    }));

    await loadPatientDetails();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Silme işlemi başarısız oldu.', type: 'error' }
    }));
  }
};

// Dijital Onam Formu Metodları
const openConsentModal = () => {
  isConsentModalOpen.value = true;
};

const openConsentPreview = (form) => {
  selectedConsentForm.value = form;
  isPreviewModalOpen.value = true;
};

const handleDownloadConsentPdf = async (form) => {
  downloadingConsentPdfId.value = form._id;
  try {
    await downloadConsentPdf(form, patientData.value?.patient || {});
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Aydınlatılmış Onam Formu PDF olarak başarıyla indirildi.', type: 'success' }
    }));
  } catch (error) {
    console.error('PDF indirme hatası:', error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'PDF oluşturulurken bir hata oluştu.', type: 'error' }
    }));
  } finally {
    downloadingConsentPdfId.value = null;
  }
};

const onConsentSaved = async () => {
  window.dispatchEvent(new CustomEvent('toast-message', {
    detail: { message: 'Aydınlatılmış onam formu ve dijital imza başarıyla arşivlendi.', type: 'success' }
  }));
  await loadPatientDetails();
};

const deleteConsentForm = async (id) => {
  if (!confirm('Bu imzalı onam formunu silmek istediğinizden emin misiniz?')) return;

  try {
    await $fetch(`/api/consent-forms/${id}`, {
      method: 'DELETE'
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Onam formu kaydı silindi.', type: 'success' }
    }));

    await loadPatientDetails();
  } catch (error) {
    console.error(error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Onam formu silinemedi.', type: 'error' }
    }));
  }
};

// Telefon temizleme ve bağlantı yardımcıları
const cleanPhoneForWhatsApp = (phoneStr) => {
  if (!phoneStr) return '';
  let cleaned = phoneStr.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith('90')) cleaned = '90' + cleaned;
  return cleaned;
};

const getTelHref = (phone) => {
  const digits = cleanPhoneForWhatsApp(phone);
  return digits ? `tel:${digits}` : '#';
};

const getWhatsAppUrl = (phone, message) => {
  const digits = cleanPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(message || '');
  return `https://wa.me/${digits}?text=${encodedText}`;
};

// Dinamik WhatsApp Şablon Grupları
const clinicName = "Özel Kumluca Ağız ve Diş Sağlığı Polikliniği";
const clinicMapsUrl = "https://maps.app.goo.gl/Lo2V4zMTLkCBWe8o8?g_st=aw";

const whatsAppTemplateGroups = computed(() => {
  const patient = patientData.value?.patient;
  const fullName = patient ? `${patient.firstName} ${patient.lastName}` : 'Sayın Hastamız';
  const balance = patientData.value?.financials?.balance || 0;
  const nextAppt = patientData.value?.appointments?.find(a => a.status === 'pending');
  const apptDateStr = nextAppt ? formatDate(nextAppt.date) : 'yarın';
  const apptTimeStr = nextAppt?.time ? `saat ${nextAppt.time}` : '';
  const apptProcStr = nextAppt?.procedure ? `${nextAppt.procedure} ` : '';

  return [
    {
      category: 'Randevu & Karşılama',
      icon: 'heroicons:calendar',
      items: [
        {
          id: 'appt_reminder',
          label: 'Randevu Hatırlatma',
          desc: 'Tarih ve saat bilgili randevu hatırlatması',
          text: `Sayın ${fullName}, ${clinicName}'ndeki ${apptProcStr}randevunuz ${apptDateStr} ${apptTimeStr} için planlanmıştır. Bir değişiklik olması durumunda lütfen bize bilgi veriniz. Sağlıklı günler dileriz.`
        },
        {
          id: 'clinic_location',
          label: 'Klinik Konumu Paylaş',
          desc: 'Google Haritalar yol tarifi linki',
          text: `Merhaba ${fullName}, ${clinicName} adresimize rahatça ulaşabilmeniz için harita konumumuz:\n📍 ${clinicMapsUrl}\nSağlıklı günler dileriz!`
        },
        {
          id: 'lab_arrived',
          label: 'Laboratuvar / Protez Geldi',
          desc: 'Kuron/protez hazır seans bildirimi',
          text: `Sayın ${fullName}, laboratuvara gönderilen protez/kaplama işiniz kliniğimize ulaşmıştır. Prova ve yapıştırma seansınız için randevu oluşturmak üzere bize yazabilirsiniz.`
        }
      ]
    },
    {
      category: 'Tedavi Sonrası Bakım (Post-Op)',
      icon: 'heroicons:heart',
      items: [
        {
          id: 'postop_surgery',
          label: 'Çekim / İmplant Sonrası Bakım',
          desc: 'Tampon, tükürme ve buz kompresi uyarısı',
          text: `Geçmiş olsun ${fullName}.\n\nCerrahi işlem sonrası dikkat edilmesi gerekenler:\n• Tamponu 30 dakika boyunca sıkıca ısırınız ve atınız.\n• İlk 24 saat kesinlikle tükürmeyiniz, ağzınızı çalkalamayınız ve pipet kullanmayınız.\n• Bölgeye dışarıdan aralıklarla soğuk buz kompresi uygulayınız.\n• İlk gün sıcak, taneli ve asitli gıdalardan kaçınınız.\n• İlaçlarınızı saatinde kullanınız. Beklenmedik bir durumda bize ulaşabilirsiniz.`
        },
        {
          id: 'postop_rootcanal',
          label: 'Kanal Tedavisi Sonrası',
          desc: 'Uyuşukluk ve çiğneme hassasiyeti uyarısı',
          text: `Geçmiş olsun ${fullName}.\n\nKanal tedavisi uygulanan dişinizde uyuşukluk geçtikten sonra birkaç gün hafif baskı ve çiğneme hassasiyeti olması normaldir. İlk 2 saat yemek yemeyiniz. Şiddetli zonklama veya şişlik hissederseniz lütfen bize bildiriniz.`
        },
        {
          id: 'postop_bleaching',
          label: 'Beyazlatma (Bleaching) Diyeti',
          desc: '48 saat renklendirici gıda yasağı',
          text: `Yeni gülüşünüz hayırlı olsun ${fullName}!\n\nBeyazlatma işleminin kalıcılığı için ilk 48 saat "beyaz diyet" uygulayınız: Çay, kahve, salça, kola, sigara vb. renklendirici ürünlerden uzak durunuz.`
        },
        {
          id: 'postop_checkin',
          label: 'Ertesi Gün Durum Takibi',
          desc: 'Tedavi sonrası durum ve şikayet kontrolü',
          text: `Merhaba ${fullName}, dün gerçekleştirdiğimiz tedavi sonrasında genel durumunuzu öğrenmek istedik. Herhangi bir ağrı veya beklenmedik bir şikayetiniz var mı? Size yardımcı olabileceğimiz bir durum varsa lütfen yazınız.`
        }
      ]
    },
    {
      category: 'Finans & Cari',
      icon: 'heroicons:credit-card',
      items: [
        {
          id: 'balance_info',
          label: 'Kalan Bakiye Bilgisi',
          desc: 'Güncel borç durumu bilgilendirmesi',
          text: `Sayın ${fullName}, kliniğimizdeki mevcut tedavi sürecinize ait kalan bakiyeniz ${formatCurrency(balance)} olarak görünmektedir. Detaylı bilgi için kliniğimizle iletişime geçebilirsiniz.`
        }
      ]
    },
    {
      category: 'Kontrol & Değerlendirme',
      icon: 'heroicons:star',
      items: [
        {
          id: 'routine_6_month_recall',
          label: '6 Aylık Rutin Kontrol / Temizlik',
          desc: 'Rutin kontrol ve diş taşı temizliği randevusu daveti',
          text: `Sayın ${fullName}, son klinik kontrolünüzün üzerinden 6 ay geçti. Ağız ve diş sağlığınızı korumak, olası diş eti problemlerini ve yeni çürükleri erkenden önlemek adına rutin kontrol randevunuzu oluşturmak için bize yazabilirsiniz. Sağlıklı günler dileriz.`
        },
        {
          id: 'google_review_request',
          label: 'Google Yorum / Değerlendirme İsteği',
          desc: 'Tedavi sonrası Google Haritalar yorumu ve puanlama isteği',
          text: `Merhaba ${fullName}, kliniğimizdeki tedavi sürecinizi tamamladık. Hizmetimizden memnun kaldıysanız, Google Haritalar profilimize kısa bir yorum ve değerlendirme bırakmanız bizi çok mutlu eder:\n⭐ Yorum yapmak için tıklayınız: https://maps.app.goo.gl/Lo2V4zMTLkCBWe8o8?g_st=aw\nGörüşleriniz bizim için çok kıymetli. Sağlıklı ve güzel gülüşler dileriz!`
        }
      ]
    }
  ];
});

// Ortodonti Seans ve Plan Eylemleri
const openPatientSessionModal = () => {
  editingPatientSessionId.value = null;
  const pastSessions = patientData.value?.orthodonticSessions || [];
  patientSessionForm.value = {
    sessionNumber: pastSessions.length + 1,
    date: todayStr(),
    time: '11:00',
    doctorId: patientData.value?.orthodonticPlan?.doctorId?._id || patientData.value?.orthodonticPlan?.doctorId || getDefaultDoctorId(),
    sessionNotes: '',
    archwireUpper: '',
    archwireLower: '',
    elastics: '',
    paymentAmount: 0,
    paymentMethod: 'cash',
    paymentNotes: '',
    nextAppointmentDate: '',
    nextAppointmentNotes: ''
  };
  isPatientSessionModalOpen.value = true;
};

const openEditPatientSessionModal = (s) => {
  editingPatientSessionId.value = s._id;
  patientSessionForm.value = {
    sessionNumber: s.sessionNumber,
    date: s.date,
    time: s.time || '11:00',
    doctorId: s.doctorId?._id || s.doctorId || getDefaultDoctorId(),
    sessionNotes: s.sessionNotes || '',
    archwireUpper: s.archwireUpper || '',
    archwireLower: s.archwireLower || '',
    elastics: s.elastics || '',
    paymentAmount: s.paymentAmount || 0,
    paymentMethod: s.paymentMethod || 'cash',
    paymentNotes: s.paymentNotes || '',
    nextAppointmentDate: s.nextAppointmentDate || '',
    nextAppointmentNotes: s.nextAppointmentNotes || ''
  };
  isPatientSessionModalOpen.value = true;
};

const savePatientSession = async () => {
  if (!patientSessionForm.value.sessionNotes) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen seans notunu doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSubmitting.value = true;
    if (editingPatientSessionId.value) {
      await $fetch(`/api/orthodontics/sessions/${editingPatientSessionId.value}`, {
        method: 'PUT',
        body: patientSessionForm.value
      });
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: 'Seans notu güncellendi.', type: 'success' }
      }));
    } else {
      await $fetch('/api/orthodontics/sessions', {
        method: 'POST',
        body: {
          patientId,
          planId: patientData.value?.orthodonticPlan?._id || null,
          ...patientSessionForm.value
        }
      });
      const paymentMsg = patientSessionForm.value.paymentAmount > 0 
        ? ` ve ${formatCurrency(patientSessionForm.value.paymentAmount)} tahsilat kasaya/hekime işlendi.` 
        : '';
      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: { message: `Seans notu başarıyla arşive eklendi${paymentMsg}`, type: 'success' }
      }));
      if (patientSessionForm.value.paymentAmount > 0) {
        window.dispatchEvent(new CustomEvent('refresh-stats'));
      }
    }

    isPatientSessionModalOpen.value = false;
    await loadPatientDetails();
  } catch (err) {
    console.error(err);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: err?.data?.message || 'Seans kaydedilemedi.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const deletePatientSession = async (sessionId) => {
  if (!window.confirm('Bu seans notunu silmek istediğinize emin misiniz?')) return;
  try {
    await $fetch(`/api/orthodontics/sessions/${sessionId}`, { method: 'DELETE' });
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Seans kaydı silindi.', type: 'success' }
    }));
    await loadPatientDetails();
  } catch (err) {
    console.error(err);
  }
};

const openEditPatientPlanModal = (plan) => {
  editPatientPlanForm.value = {
    id: plan._id,
    doctorId: plan.doctorId?._id || plan.doctorId || getDefaultDoctorId(),
    bracketType: plan.bracketType || 'Metal Braket',
    totalAmount: plan.totalAmount || 0,
    durationMonths: plan.durationMonths || 10,
    status: plan.status || 'active',
    diagnosis: plan.diagnosis || '',
    notes: plan.notes || ''
  };
  isEditPatientPlanModalOpen.value = true;
};

const saveEditPatientPlan = async () => {
  if (!editPatientPlanForm.value.id || !editPatientPlanForm.value.totalAmount) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen zorunlu alanları doldurun.', type: 'error' }
    }));
    return;
  }

  try {
    isSubmitting.value = true;
    await $fetch(`/api/orthodontics/plans/${editPatientPlanForm.value.id}`, {
      method: 'PUT',
      body: {
        doctorId: editPatientPlanForm.value.doctorId,
        bracketType: editPatientPlanForm.value.bracketType,
        totalAmount: Number(editPatientPlanForm.value.totalAmount),
        durationMonths: Number(editPatientPlanForm.value.durationMonths),
        status: editPatientPlanForm.value.status,
        diagnosis: editPatientPlanForm.value.diagnosis,
        notes: editPatientPlanForm.value.notes
      }
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Ortodonti anlaşması ve taksitler güncellendi.', type: 'success' }
    }));

    isEditPatientPlanModalOpen.value = false;
    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (err) {
    console.error(err);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: err?.data?.message || 'Güncelleme başarısız.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const openCancelOrDeletePatientPlanModal = (plan) => {
  selectedPatientPlanForAction.value = plan;
  isCancelOrDeletePatientPlanModalOpen.value = true;
};

const cancelPatientPlan = async () => {
  if (!selectedPatientPlanForAction.value) return;
  try {
    isSubmitting.value = true;
    await $fetch(`/api/orthodontics/plans/${selectedPatientPlanForAction.value._id}`, {
      method: 'PUT',
      body: { status: 'cancelled' }
    });
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Ortodonti tedavisi iptal edildi olarak işaretlendi ve taksitler durduruldu.', type: 'success' }
    }));
    isCancelOrDeletePatientPlanModalOpen.value = false;
    selectedPatientPlanForAction.value = null;
    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (err) {
    console.error(err);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: err?.data?.message || 'İptal edilemedi.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const deletePatientPlan = async () => {
  if (!selectedPatientPlanForAction.value) return;
  if (!window.confirm('Bu ortodonti tedavi anlaşmasını ve bağlı taksit/borç kayıtlarını kalıcı olarak silmek istediğinize emin misiniz?')) return;

  try {
    isSubmitting.value = true;
    await $fetch(`/api/orthodontics/plans/${selectedPatientPlanForAction.value._id}`, {
      method: 'DELETE'
    });
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Ortodonti tedavi anlaşması tamamen silindi.', type: 'success' }
    }));
    isCancelOrDeletePatientPlanModalOpen.value = false;
    selectedPatientPlanForAction.value = null;
    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (err) {
    console.error(err);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: err?.data?.message || 'Silme işlemi başarısız.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const openPatientPlanModal = () => {
  patientPlanForm.value = {
    doctorId: getDefaultDoctorId(),
    bracketType: 'Metal Braket',
    totalAmount: 30000,
    downPayment: 5000,
    durationMonths: 10,
    startDate: todayStr(),
    diagnosis: '',
    planType: 'installments'
  };
  isPatientPlanModalOpen.value = true;
};

const savePatientPlan = async () => {
  if (!patientPlanForm.value.totalAmount) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Toplam anlaşma tutarı zorunludur.', type: 'error' }
    }));
    return;
  }

  try {
    isSubmitting.value = true;
    await $fetch('/api/orthodontics/plans', {
      method: 'POST',
      body: {
        patientId,
        ...patientPlanForm.value,
        planType: patientPlanForm.value.planType || 'installments'
      }
    });

    const isPerSession = patientPlanForm.value.planType === 'per_session';
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { 
        message: isPerSession 
          ? 'Ortodonti tedavi protokolü (Taksitsiz - Seans Başı Tahsilat) başlatıldı.' 
          : 'Ortodonti tedavi protokolü ve taksitler başlatıldı.', 
        type: 'success' 
      }
    }));

    isPatientPlanModalOpen.value = false;
    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (err) {
    console.error(err);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: err?.data?.message || 'Anlaşma oluşturulamadı.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const quickPayInstallment = (inst) => {
  quickPayData.value = {
    planId: patientData.value?.orthodonticPlan?._id,
    installmentNo: inst.installmentNo,
    amount: inst.amount,
    method: 'cash',
    date: todayStr()
  };
  isQuickPayModalOpen.value = true;
};

const submitQuickPay = async () => {
  try {
    isSubmitting.value = true;
    await $fetch(`/api/orthodontics/plans/${quickPayData.value.planId}/pay-installment`, {
      method: 'POST',
      body: quickPayData.value
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: `${quickPayData.value.installmentNo}. Taksit başarıyla tahsil edildi.`, type: 'success' }
    }));

    isQuickPayModalOpen.value = false;
    await loadPatientDetails();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (err) {
    console.error(err);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: err?.data?.message || 'Taksit tahsil edilemedi.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

// Doğrudan Metin ile WhatsApp Aç
const sendWhatsAppText = (messageText) => {
  isWhatsAppMenuOpen.value = false;
  const phone = patientData.value?.patient?.phone;
  if (!phone) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Hastaya ait telefon numarası bulunamadı.', type: 'error' }
    }));
    return;
  }
  const url = getWhatsAppUrl(phone, messageText);
  window.open(url, '_blank');
};

// Önizleme ve Özel Mesaj Modalı Aç
const openCustomWhatsAppModal = (templateId = 'appt_reminder') => {
  isWhatsAppMenuOpen.value = false;
  selectedTemplateId.value = templateId;
  
  // Şablonu bul
  for (const group of whatsAppTemplateGroups.value) {
    const found = group.items.find(i => i.id === templateId);
    if (found) {
      customWhatsAppText.value = found.text;
      break;
    }
  }
  isCustomWhatsAppModalOpen.value = true;
};

// Modal İçinde Şablon Değiştir
const applyTemplateItem = (item) => {
  selectedTemplateId.value = item.id;
  customWhatsAppText.value = item.text;
};

// Özel Mesajı WhatsApp'ta Aç
const sendCustomWhatsApp = () => {
  const phone = patientData.value?.patient?.phone;
  if (!phone || !customWhatsAppText.value) return;
  const url = getWhatsAppUrl(phone, customWhatsAppText.value);
  window.open(url, '_blank');
  isCustomWhatsAppModalOpen.value = false;
};

// Dışarı tıklandığında menüyü kapat
const handleClickOutside = (e) => {
  if (whatsappDropdownRef.value && !whatsappDropdownRef.value.contains(e.target)) {
    isWhatsAppMenuOpen.value = false;
  }
};

// Türkçe karakter duyarsız arama
const normalizeTr = (str = '') => {
  return String(str || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c');
};

// Aile Verilerini Sunucudan Yükle
const loadFamilyData = async () => {
  if (!navigator.onLine) return;
  try {
    isLoadingFamily.value = true;
    const res = await $fetch(`/api/patients/${patientId}/family`, { timeout: 4000 });
    familyData.value = res || { currentPatient: null, familyMembers: [], totalFamilyDebt: 0, hasFamily: false };
  } catch (err) {
    console.warn('Aile verileri yüklenemedi:', err);
  } finally {
    isLoadingFamily.value = false;
  }
};

const searchFamilyPatients = async () => {
  const q = familySearchInput.value?.trim();
  if (!q) {
    familySearchResults.value = [];
    return;
  }
  try {
    isSearchingFamilyPatients.value = true;
    const res = await $fetch('/api/patients', { params: { q, limit: 20 } });
    const onlineList = Array.isArray(res) ? res : (res?.patients || []);
    familySearchResults.value = onlineList.filter(p => String(p._id) !== String(patientId));
  } catch (err) {
    console.error('Aile hastası arama hatası:', err);
  } finally {
    isSearchingFamilyPatients.value = false;
  }
};

const onFamilySearchInput = () => {
  if (familySearchTimer) clearTimeout(familySearchTimer);
  familySearchTimer = setTimeout(() => {
    searchFamilyPatients();
  }, 200);
};

const selectFamilyTarget = (p) => {
  familyForm.value.targetPatientId = p._id;
  familySearchInput.value = `${p.firstName} ${p.lastName}`.trim();
  familySearchResults.value = [];
};

const openAddFamilyModal = () => {
  familyForm.value = { targetPatientId: '', relation: 'Eş', notes: '' };
  familySearchInput.value = '';
  familySearchResults.value = [];
  isFamilyModalOpen.value = true;
};

const submitAddFamilyMember = async () => {
  if (!familyForm.value.targetPatientId) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Lütfen bağlanacak aile bireyini listeden seçin.', type: 'error' }
    }));
    return;
  }
  try {
    isSubmitting.value = true;
    const res = await $fetch(`/api/patients/${patientId}/family`, {
      method: 'POST',
      body: familyForm.value
    });
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: res.message || 'Aile bireyi başarıyla bağlandı.', type: 'success' }
    }));
    isFamilyModalOpen.value = false;
    await loadFamilyData();
  } catch (err) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: err?.data?.message || 'Aile bireyi eklenirken hata oluştu.', type: 'error' }
    }));
  } finally {
    isSubmitting.value = false;
  }
};

const removeFamilyMember = async (memberId, memberName) => {
  if (!confirm(`${memberName} ile olan aile bağlantısını kaldırmak istediğinize emin misiniz?`)) return;
  try {
    const res = await $fetch(`/api/patients/${patientId}/family`, {
      method: 'DELETE',
      body: { targetPatientId: memberId }
    });
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: res.message || 'Aile bağı kaldırıldı.', type: 'success' }
    }));
    await loadFamilyData();
  } catch (err) {
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: err?.data?.message || 'Bağlantı kaldırılırken hata oluştu.', type: 'error' }
    }));
  }
};

const prepareFamilyDistributions = () => {
  const list = [];
  if (patientData.value?.patient) {
    const curDebt = (patientData.value.financials?.balance || 0) > 0 ? patientData.value.financials.balance : 0;
    list.push({
      patientId: String(patientData.value.patient._id),
      patientName: `${patientData.value.patient.firstName} ${patientData.value.patient.lastName}`.trim(),
      relation: 'Kendisi',
      remainingDebt: curDebt,
      amount: curDebt
    });
  }
  (familyData.value?.familyMembers || []).forEach(m => {
    list.push({
      patientId: m.patientId,
      patientName: m.fullName,
      relation: m.relation,
      remainingDebt: m.remainingDebt,
      amount: m.remainingDebt
    });
  });
  familyDistributions.value = list;
};

const fillTotalFamilyDebt = () => {
  let sum = 0;
  familyDistributions.value.forEach(d => {
    d.amount = d.remainingDebt;
    sum += d.remainingDebt;
  });
  paymentForm.value.amount = sum;
};

onMounted(() => {
  loadPatientDetails();
  loadDoctors();
  loadFamilyData();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
