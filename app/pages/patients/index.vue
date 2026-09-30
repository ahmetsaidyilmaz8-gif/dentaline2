<template>
  <div class="flex flex-col gap-8">
    
    <!-- Üst Başlık ve Ekleme Butonu -->
    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Hasta Yönetimi</h2>
        <p class="text-base text-slate-500 dark:text-slate-400 font-medium">Kayıtlı hasta listesi, bakiye takipleri ve yeni hasta kayıtları.</p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-teal-600/20 active:scale-95 transition-all duration-150 shadow-sm"
      >
        <Icon name="heroicons:user-plus" class="w-4 h-4" />
        <span>Yeni Hasta Kaydı</span>
      </button>
    </div>

    <!-- Arama ve Filtreleme Çubuğu -->
    <div class="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <!-- Arama Kutusu -->
      <div class="relative flex-1 max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Hasta adı, TC kimlik veya telefon numarası ile ara..."
          class="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-slate-800 dark:text-white transition-all duration-150 shadow-inner"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Aramayı Temizle"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>

      <!-- Akıllı Sıralama Menüsü ve Sayaç -->
      <div class="flex items-center flex-wrap gap-3">
        <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm">
          <Icon name="heroicons:bars-arrow-down" class="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">Sıralama:</span>
          <select
            v-model="sortBy"
            @change="onSortChange"
            class="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="newest" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🕒 Kayıt: En Yeni ➔ En Eski (Varsayılan)</option>
            <option value="oldest" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🕒 Kayıt: En Eski ➔ En Yeni</option>
            <option value="name_asc" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🔤 İsme Göre: A ➔ Z</option>
            <option value="name_desc" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🔤 İsme Göre: Z ➔ A</option>
          </select>
        </div>

        <div class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap shadow-sm">
          Toplam Bulunan: <span class="text-teal-600 dark:text-teal-400 font-mono">{{ totalCount.toLocaleString('tr-TR') }} Hasta</span>
        </div>
      </div>
    </div>

    <!-- Hasta Listesi Tablosu -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-950/10 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">
              <th class="px-6 py-3.5 cursor-pointer select-none hover:text-teal-600 transition-colors" @click="toggleSort('name')" title="İsme göre A-Z / Z-A sırala">
                <div class="flex items-center gap-1.5">
                  <span>Hasta</span>
                  <Icon v-if="sortBy === 'name_asc'" name="heroicons:chevron-up" class="w-3.5 h-3.5 text-teal-600" />
                  <Icon v-else-if="sortBy === 'name_desc'" name="heroicons:chevron-down" class="w-3.5 h-3.5 text-teal-600" />
                  <Icon v-else name="heroicons:chevron-up-down" class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                </div>
              </th>
              <th class="px-6 py-3.5">TC Kimlik No</th>
              <th class="px-6 py-3.5">Yaş / Cinsiyet</th>
              <th class="px-6 py-3.5">İletişim</th>
              <th class="px-6 py-3.5">Bakiye Durumu</th>
              <th class="px-6 py-3.5 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="isLoading">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin text-teal-600 inline-block mb-2" />
                <div>Hastalar yükleniyor...</div>
              </td>
            </tr>
            <tr v-else-if="loadError">
              <td colspan="6" class="px-6 py-12 text-center text-rose-500 dark:text-rose-400 font-medium text-sm">
                <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-rose-500 inline-block mb-2" />
                <div class="font-semibold">{{ loadError }}</div>
                <button
                  @click="loadPatients()"
                  class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Icon name="heroicons:arrow-path" class="w-4 h-4" />
                  Tekrar Dene
                </button>
              </td>
            </tr>
            <tr v-else-if="patients.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                Kayıtlı hasta bulunamadı.
              </td>
            </tr>
            <tr
              v-else
              v-for="p in patients"
              :key="p._id"
              class="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors duration-150 group"
            >
              <!-- Hasta İsmi & Profil -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      getAvatarColorClass(p.firstName + ' ' + p.lastName),
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm tracking-wide shadow-inner shrink-0'
                    ]"
                  >
                    {{ getInitials(p.firstName, p.lastName) }}
                  </div>
                  <div>
                    <NuxtLink :to="`/patients/${p._id}`" class="font-bold text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:underline block text-sm">
                      {{ p.firstName }} {{ p.lastName }}
                    </NuxtLink>
                    <span class="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">Kayıt: {{ formatDate(p.createdAt) }}</span>
                  </div>
                </div>
              </td>
              <!-- TC No -->
              <td class="px-6 py-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                {{ p.tcNo || '—' }}
              </td>
              <!-- Yaş / Cinsiyet -->
              <td class="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                <div class="flex flex-col gap-0.5">
                  <span>{{ calculateAge(p.birthDate) ? `${calculateAge(p.birthDate)} Yaş` : 'Doğum Tarihi Yok' }}</span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">{{ p.gender === 'male' ? 'Erkek' : p.gender === 'female' ? 'Kadın' : 'Diğer' }}</span>
                </div>
              </td>
              <!-- İletişim -->
              <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                <div class="flex flex-col gap-0.5">
                  <span class="font-bold font-mono">{{ formatPhone(p.phone) }}</span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">{{ p.email || 'E-posta yok' }}</span>
                </div>
              </td>
              <!-- Bakiye Durumu -->
              <td class="px-6 py-4">
                <div v-if="p.balance > 0" class="flex flex-col">
                  <span class="inline-flex items-center gap-1 w-max px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                    Borçlu: {{ formatCurrency(p.balance) }}
                  </span>
                  <span class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Toplam Ödeme: {{ formatCurrency(p.totalPaid) }}</span>
                </div>
                <div v-else-if="p.balance < 0" class="flex flex-col">
                  <span class="inline-flex items-center gap-1 w-max px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                    Alacaklı: {{ formatCurrency(Math.abs(p.balance)) }}
                  </span>
                </div>
                <div v-else class="flex flex-col">
                  <span class="inline-flex items-center gap-1 w-max px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                    Ödemeler Dengede
                  </span>
                  <span v-if="p.totalFee > 0" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Toplam Hacim: {{ formatCurrency(p.totalFee) }}</span>
                </div>
              </td>
              <!-- İşlemler -->
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    :to="`/patients/${p._id}`"
                    class="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg border border-slate-200/50 dark:border-slate-700 transition-colors"
                    title="Profili İncele"
                  >
                    <Icon name="heroicons:eye" class="w-4 h-4" />
                  </NuxtLink>
                  <button
                    @click="openEditModal(p)"
                    class="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:text-teal-600 dark:hover:text-teal-400 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200/50 dark:border-slate-700 transition-colors"
                    title="Düzenle"
                  >
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(p)"
                    class="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200/50 dark:border-slate-700 transition-colors"
                    title="Hasta Sil"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sayfalama (Pagination) Kontrolleri -->
      <div v-if="totalCount > 0" class="px-6 py-3.5 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div class="flex items-center gap-2">
          <span>Sayfa Başı:</span>
          <select
            v-model="pageSize"
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:border-teal-500"
            @change="onPageSizeChange"
          >
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span class="ml-2">
            Toplam <span class="font-bold text-slate-700 dark:text-slate-300">{{ totalCount }}</span> kayıt içinden
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ (currentPage - 1) * pageSize + 1 }}</span> -
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ Math.min(currentPage * pageSize, totalCount) }}</span> arası gösteriliyor
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="İlk Sayfa"
          >
            «
          </button>
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Önceki Sayfa"
          >
            ‹ Önceki
          </button>

          <span class="px-3 py-1 font-bold text-slate-700 dark:text-slate-300">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Sonraki Sayfa"
          >
            Sonraki ›
          </button>
          <button
            @click="goToPage(totalPages)"
            :disabled="currentPage >= totalPages"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Son Sayfa"
          >
            »
          </button>
        </div>
      </div>
    </div>

    <!-- Hasta Kayıt / Düzenleme Modalı -->
    <AppModal
      :isOpen="isModalOpen"
      :title="isEditMode ? '⚙️ Hasta Kaydı Düzenle' : '👤 Yeni Hasta Kayıt Formu'"
      width="2xl"
      @close="isModalOpen = false"
    >
      <form @submit.prevent="savePatient" class="space-y-4">
        <!-- 1. Kişisel Bilgiler -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">Kişisel Bilgiler</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Ad</label>
            <input
              v-model="form.firstName"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Soyad</label>
            <input
              v-model="form.lastName"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">TC Kimlik Numarası</label>
            <input
              v-model="form.tcNo"
              type="text"
              maxlength="11"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Doğum Tarihi</label>
              <input
                v-model="form.birthDate"
                type="date"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Cinsiyet</label>
              <select
                v-model="form.gender"
                class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              >
                <option value="" disabled hidden class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Seçin</option>
                <option value="male" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Erkek</option>
                <option value="female" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Kadın</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. İletişim Bilgileri -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 pt-2">İletişim Bilgileri</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Telefon</label>
            <input
              v-model="form.phone"
              type="text"
              placeholder="05xxxxxxxxx"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">E-posta Adresi</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="ornek@email.com"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Adres</label>
            <input
              v-model="form.address"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <!-- 3. Tıbbi Bilgiler -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 pt-2">Tıbbi Bilgiler & Alerjiler</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Kan Grubu</label>
            <select
              v-model="form.bloodType"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            >
              <option value="" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Bilinmiyor</option>
              <option v-for="b in BLOOD_TYPES" :key="b" :value="b" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">{{ b }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Alerjiler (Örn: Penisilin vb.)</label>
            <input
              v-model="form.allergies"
              type="text"
              placeholder="Yoksa boş bırakın"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 border-rose-200 dark:border-rose-800 rounded-xl focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15 dark:focus:ring-rose-500/20 text-sm transition-all bg-rose-50/10 dark:bg-rose-950/10 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Kronik Hastalıklar (Örn: Tansiyon, Şeker)</label>
            <input
              v-model="form.chronicDiseases"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Düzenli Kullanılan İlaçlar</label>
            <input
              v-model="form.medications"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <!-- 4. Acil Durum Yakını -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 pt-2">Acil Durum İletişimi</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Acil Durum Yakını Ad/Soyad</label>
            <input
              v-model="form.emergencyContact"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Acil Durum Telefonu</label>
            <input
              v-model="form.emergencyPhone"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <!-- 5. Klinik Notlar -->
        <h4 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5 pt-2">Klinik Genel Notlar</h4>
        <div>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Hasta hakkında hekime özel ek notlar..."
            class="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:focus:ring-teal-500/20 text-sm transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          @click="isModalOpen = false"
          :disabled="isSaving"
          class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all"
        >
          Kapat
        </button>
        <button
          @click="savePatient"
          :disabled="isSaving"
          class="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Icon v-if="isSaving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>{{ isSaving ? (isEditMode ? 'Kaydediliyor...' : 'Oluşturuluyor...') : (isEditMode ? 'Kaydet' : 'Oluştur') }}</span>
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUtils } from '~/composables/useUtils';

const {
  formatDate,
  calculateAge,
  formatCurrency,
  formatPhone,
  getAvatarColorClass,
  getInitials,
  BLOOD_TYPES
} = useUtils();

const patients = ref([]);
const totalCount = ref(0);
const totalPages = ref(1);
const isLoading = ref(false);
const loadError = ref(null);
const isSaving = ref(false);
const searchQuery = ref('');
const sortBy = ref('newest'); // 'newest' | 'oldest' | 'name_asc' | 'name_desc'

// Sayfalama (Pagination) Durumları
const currentPage = ref(1);
const pageSize = ref(25);

const goToPage = (page) => {
  const target = Math.max(1, Math.min(page, totalPages.value));
  if (target !== currentPage.value) {
    currentPage.value = target;
    loadPatients();
  }
};

const onPageSizeChange = () => {
  currentPage.value = 1;
  loadPatients();
};

const onSortChange = () => {
  currentPage.value = 1;
  loadPatients();
};

const toggleSort = (type) => {
  if (type === 'name') {
    sortBy.value = sortBy.value === 'name_asc' ? 'name_desc' : 'name_asc';
  } else {
    sortBy.value = sortBy.value === 'newest' ? 'oldest' : 'newest';
  }
  currentPage.value = 1;
  loadPatients();
};

const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
  loadPatients('');
};

// Arama debounce için timer
let searchTimeout = null;

// API'den hastaları çek
const loadPatients = async (query = searchQuery.value) => {
  const q = (query || '').trim();

  try {
    isLoading.value = patients.value.length === 0;
    loadError.value = null;
    const res = await $fetch('/api/patients', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        q,
        sortBy: sortBy.value
      }
    });

    if (res && Array.isArray(res.patients)) {
      patients.value = res.patients;
      totalCount.value = res.total ?? 0;
      totalPages.value = res.totalPages || Math.max(1, Math.ceil((res.total || 0) / pageSize.value));
    } else if (Array.isArray(res)) {
      patients.value = res;
      totalCount.value = res.length;
      totalPages.value = Math.max(1, Math.ceil(res.length / pageSize.value));
    }
  } catch (error) {
    console.error('Hastalar yüklenemedi:', error);
    if (patients.value.length === 0) {
      loadError.value = error.data?.message || error.message || 'Hastalar yüklenirken bir hata oluştu.';
    }
  } finally {
    isLoading.value = false;
  }
};

const onSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadPatients();
  }, 300);
};

// Modallar ve Form durumları
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentPatientId = ref(null);

const defaultForm = {
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
};
const form = ref({ ...defaultForm });

// Yeni Hasta Ekle Modalı Aç
const openAddModal = () => {
  isEditMode.value = false;
  currentPatientId.value = null;
  form.value = { ...defaultForm };
  isModalOpen.value = true;
};

// Hasta Düzenleme Modalı Aç
const openEditModal = (patient) => {
  isEditMode.value = true;
  currentPatientId.value = patient._id;
  // Mongoose'dan gelen verileri forma eşle
  form.value = {
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    tcNo: patient.tcNo || '',
    birthDate: patient.birthDate || '',
    gender: patient.gender || '',
    phone: patient.phone || '',
    email: patient.email || '',
    address: patient.address || '',
    bloodType: patient.bloodType || '',
    allergies: patient.allergies || '',
    chronicDiseases: patient.chronicDiseases || '',
    medications: patient.medications || '',
    emergencyContact: patient.emergencyContact || '',
    emergencyPhone: patient.emergencyPhone || '',
    notes: patient.notes || ''
  };
  isModalOpen.value = true;
};

// Kaydet / Güncelle işlemi
const savePatient = async () => {
  if (isSaving.value) return; // Mükerrer tıklama koruması (Double submit guard)
  try {
    isSaving.value = true;
    if (isEditMode.value) {
      const targetId = currentPatientId.value;
      await $fetch(`/api/patients/${targetId}`, {
        method: 'PUT',
        body: form.value
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: {
          message: 'Hasta profili başarıyla güncellendi.',
          type: 'success'
        }
      }));
    } else {
      await $fetch('/api/patients', {
        method: 'POST',
        body: form.value
      });

      window.dispatchEvent(new CustomEvent('toast-message', {
        detail: {
          message: 'Yeni hasta kaydı başarıyla oluşturuldu.',
          type: 'success'
        }
      }));
    }

    isModalOpen.value = false;
    await loadPatients();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error('Hasta kaydedilemedi:', error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: error.data?.message || 'Hasta kaydedilirken hata oluştu.', type: 'error' }
    }));
  } finally {
    isSaving.value = false;
  }
};

// Silme onayı ve tetikleme
const confirmDelete = (patient) => {
  const confirmText = `${patient.firstName} ${patient.lastName} isimli hastayı silmek istediğinize emin misiniz?\nHastayla ilişkili tüm randevular, tedaviler, ödemeler ve diş haritası kalıcı olarak SİLİNECEKTİR.`;
  if (window.confirm(confirmText)) {
    deletePatient(patient._id);
  }
};

const deletePatient = async (id) => {
  try {
    await $fetch(`/api/patients/${id}`, {
      method: 'DELETE'
    });

    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Hasta kaydı silindi.', type: 'success' }
    }));
    await loadPatients();
    window.dispatchEvent(new CustomEvent('refresh-stats'));
  } catch (error) {
    console.error('Hasta silinemedi:', error);
    window.dispatchEvent(new CustomEvent('toast-message', {
      detail: { message: 'Silme işlemi sırasında hata oluştu.', type: 'error' }
    }));
  }
};

onMounted(() => {
  loadPatients();
});
</script>
